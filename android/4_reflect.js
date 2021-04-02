/*
 * frida -H 192.168.50.42:8888 com.example.reflect -l agent/reflect.js
 */


// 检查 以module_name_pattern开头 的 module(即so) 是否存在在当前apk
function if_module_existed(module_name_pattern) {
    var modules = Process.enumerateModules()
    var module = null
    var existed = false

    for (var i = 0; i < modules.length; i++) {
        module = modules[i]

        if (module.name.indexOf(module_name_pattern) != -1) {
            if (!existed) {
                console.log('search module_name_pattern[' + module_name_pattern + '] found:')
                console.log()
                existed = !existed
            }
            console.log('module.name = ' + module.name)
            console.log('module.base = ' + module.base)
            console.log()
        }
    }
    return existed
}


function get_symbol_offset() {
    var libnative_lib_so_name = "libnative-lib.so"
    var existed = if_module_existed(libnative_lib_so_name)
    if (existed) {
        console.log(libnative_lib_so_name, 'is existed!')
    } else {
        console.log(libnative_lib_so_name, 'is not existed!')
    }

    var libnative_lib_so_address  = Module.findBaseAddress(libnative_lib_so_name)
    console.log("libnative_lib_so_address =", libnative_lib_so_address)

    // 先找到module然后找到想要hook的符号
    if (libnative_lib_so_address) {
        var symbol_name = null
        var symbol_address = null

        var symbol_name = 'Java_com_example_reflect_MainActivity_changeString2HelloFromJNI'
        symbol_address = Module.findExportByName(libnative_lib_so_name, symbol_name)
        console.log(symbol_name + ' address = ' + symbol_address)
        console.log(symbol_name + ' offset =', '0x' + (symbol_address - libnative_lib_so_address).toString(16))
    }
}


// 需要定义async函数且frida使用v8 --runtime=v8
// async function sleep() {
//     await new Promise(r => setTimeout(r, 5000))
// }


// 符号hook
function symbol_hook() {
    // spawn 需要延迟执行否则libnative-lib.so还没有加载, 使用 setTimeout 或者 代码里加sleep
    // TODO 问: 对于只执行一次的native函数,spawn的时候so还没有加载怎么hook?
    var libnative_lib_so_name = "libnative-lib.so"
    var existed = if_module_existed(libnative_lib_so_name)
    if (existed) {
        console.log(libnative_lib_so_name, 'is existed!')
    } else {
        console.log(libnative_lib_so_name, 'is not existed!')
    }

    var libnative_lib_so_address  = Module.findBaseAddress(libnative_lib_so_name)
    console.log("libnative_lib_so_address =", libnative_lib_so_address)

    // 先找到module然后找到想要hook的符号
    if (libnative_lib_so_address) {
        var symbol_name = null
        var symbol_address = null

        var symbol_name = 'Java_com_example_reflect_MainActivity_changeString2HelloFromJNI'
        symbol_address = Module.findExportByName(libnative_lib_so_name, symbol_name)
        console.log(symbol_name + ' address = ' + symbol_address)
        console.log(symbol_name + ' offset =', '0x' + (symbol_address - libnative_lib_so_address).toString(16))
    }

    Interceptor.attach(symbol_address, {
        onEnter: function(args) {
            // args 是 jstring

            // Java_com_example_reflect_MainActivity_changeString2HelloFromJNI 三个参数
            console.log(symbol_address, "raw args[0], args[1], args[2]:", args[0], args[1], args[2])

            // 打印方式1
            // 星球jbytearray
            // 可能需要使用32位机器,sailfish这边是Error: access violation accessing 0x7133cabb8
            // var args2_address = args[2].readPointer()
            // console.log(hexdump(args2_address))

            // 打印方式2
            // 通过JNI接口打印jstring, 注意需要对应到frida的api, 不要直接使用java的
            // https://github.com/frida/frida-java-bridge/blob/062999b618451e5ac414d08d4f52bec05bd6adf6/lib/env.js
            console.log('args[2]:', Java.vm.getEnv().getStringUtfChars(args[2], null).readCString())
        },
        onLeave: function(ret) {
            // ret 是 jstring
            console.log("raw ret:", ret)
            console.log('ret:', Java.vm.getEnv().getStringUtfChars(ret, null).readCString())
            var new_ret = Java.vm.getEnv().newStringUtf("new_ret from " + symbol_name)

            // 替换返回值
            ret.replace(ptr(new_ret))
        }
    })
}


// https://github.com/chame1eon/jnitrace
function hook_libart_so() {
    var libart_so_name = "libart.so"
    var existed = if_module_existed(libart_so_name)
    if (existed) {
        console.log(libart_so_name, 'is existed!')
    } else {
        console.log(libart_so_name, 'is not existed!')
    }

    var libart_so_address  = Module.findBaseAddress(libart_so_name)
    console.log("libart_so_address =", libart_so_address)

    // 由于 name mangling 导致符号被混淆(name mangling也不是完全混淆,真实函数名还是包含在结果中的), 所以需要枚举所有符号
    // 不要用 Process.findModuleByName(module_name).enumerateSymbols() 符号可能枚举结果为空
    var symbols = Module.enumerateSymbolsSync(libart_so_name)
    var jni_function_name = 'GetStringUTFChars'
    var jni_function_address = null

    for (var i = 0; i < symbols.length; i++){
        var symbol = symbols[i]
        if((symbol.name.indexOf("CheckJNI") == -1) && (symbol.name.indexOf("JNI") >= 0)) {
            if (symbol.name.indexOf(jni_function_name) >= 0) {
                console.log('symbol.name =', symbol.name)
                console.log('symbol.address =', symbol.address)
                jni_function_address = symbol.address
            }
        }
    }
    console.log(jni_function_name + ' address =', jni_function_address)

    // JNI 的 GetStringUTFChars 竟然可以打印android的Log.i, 陈总建议是可以看native的log实现, 然而现在并看不懂
    Interceptor.attach(jni_function_address, {
        onEnter: function(args) {
            console.log(jni_function_name + " args[0] =", args[0])
            console.log(jni_function_name + " args[1] =", args[1])

            // args[0] 是 JNIEnv
            // JNIEnv 可以用 hexdump(args[0].readPointer()), jxxx参数不能用, 要调用JNI的方法打印
            console.log('hexdump args[0] =', hexdump(args[0].readPointer()))
            // args[1] 是 jstring, 不能用hexdump
            // console.log('hexdump args[1] =', hexdump(args[1].readPointer()))
            // 两个接口 getEnv / tryGetEnv
            console.log('args[1] =', Java.vm.getEnv().getStringUtfChars(args[1]).readCString())
            // console.log('args[1] =', Java.vm.tryGetEnv().getStringUtfChars(args[1]).readCString())

            // 打印调用栈: https://frida.re/docs/javascript-api/
            var trace_back_log = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n')
            console.log(jni_function_name + ' traceback:\n' + trace_back_log + '\n')
        },
        onLeave: function(ret) {
            // char * 可以直接打印 ptr(ret).readCString()
            console.log(jni_function_name + " ret =", ptr(ret).readCString())
        }
    })
}


function main() {
    // get_symbol_offset()

    // symbol_hook()

    hook_libart_so()
}


setImmediate(main)
