/*
 * frida -H 192.168.50.42:8888 -f com.example.antifrida -l agent/anti_frida.js
 */

// 1. 对native函数的hook，和普通java函数一致
function remove_antiFrida() {
    // 避免logcat日志过多无法看出来hook native函数是否生效，先清理一下logcat日志
    // 清除logcat日志: adb logcat -c

    var MainActivity = Java.use('com.example.antifrida.MainActivity')
    MainActivity.antiFrida.implementation = function() {
        console.log('enter remove_antiFrida')
        return
    }
}


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


function enumerate_modules_and_exports(module_name) {
    // 枚举符号和导出符号
    // symbols > exports
    // 但enumerateSymbols可能搜索结果为空，并且as打包生成的so会出现有导出符号没有符号的情况，不知道是做了什么配置，日常请使用sync版本
    // var symbols = Process.findModuleByName(libnative_lib_so_name).enumerateSymbols()
    // var symbols = Module.enumerateSymbolsSync(libnative_lib_so_name)

    // var symbols = Process.findModuleByName(module_name).enumerateSymbols()
    var symbols = Module.enumerateSymbolsSync(module_name)
    var exports = Process.findModuleByName(module_name).enumerateExports()
}


// 2. 找到偏移
function get_symbol_offset() {
    // root@Nick:~# objection -N -h 192.168.50.42 -p 8888 -g com.example.antifrida explore
    // com.example.antifrida on (google: 8.1.0) [net] # memory list modules
    
    // 找到:
    // libnative-lib.so                                 0x72b6e6c000  12288 (12.0 KiB)      /data/app/com.example.antifrida-cUCV8773Ge8uJPawmLlRPw==/lib/arm64/libnativ...

    var libnative_lib_so_name = "libnative-lib.so"
    var existed = if_module_existed('libnative')
    if (existed) {
        console.log(libnative_lib_so_name, 'is existed!')
    } else {
        console.log(libnative_lib_so_name, 'is not existed!')
    }

    // 找到基址, app重启后基址和导出函数地址是会变化的, 但偏移量是固定的
    var libnative_lib_so_address  = Module.findBaseAddress(libnative_lib_so_name)
    console.log("libnative_lib_so_address =", libnative_lib_so_address)

    // 先找到module然后找到想要hook的符号
    if (libnative_lib_so_address) {
        // 由于namemagling导致符号被混淆, detect_frida_loop 的导出符号是 _Z17detect_frida_loopPv
        // extern "C" JNIEXPORT void JNICALL Java_com_example_antifrida_MainActivity_antiFrida
        var symbol_name = null
        var symbol_address = null

        var symbol_name = 'Java_com_example_antifrida_MainActivity_antiFrida'
        symbol_address = Module.findExportByName(libnative_lib_so_name, symbol_name)
        console.log(symbol_name + ' address = ' + symbol_address)
        // 偏移量是固定的, 和Frida的IDA-View按空格显示的偏移一致
        console.log(symbol_name + ' offset =', '0x' + (symbol_address - libnative_lib_so_address).toString(16))

        symbol_name = '_Z17detect_frida_loopPv'
        symbol_address = Module.findExportByName(libnative_lib_so_name, symbol_name)
        console.log(symbol_name + ' address = ' + symbol_address)
        console.log(symbol_name + ' offset =', '0x' + (symbol_address - libnative_lib_so_address).toString(16))
    }
}


function hook_libc_so() {
    var libc_so_name = "libc.so"
    var existed = if_module_existed(libc_so_name)
    if (existed) {
        console.log(libc_so_name, 'is existed!')
    } else {
        console.log(libc_so_name, 'is not existed!')
    }

    var libc_so_address  = Module.findBaseAddress(libc_so_name)
    console.log("libc_so_address =", libc_so_address)

    var libc_function_name = 'pthread_create'
    var libc_function_address = null

    var symbols = null

    symbols = Module.enumerateSymbolsSync(libc_so_name)

    // C函数名字该是什么就是什么
    // objection: memory list exports libc.so --json libc_so.json
    for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i]
        var name = symbol.name
        var address = symbol.address
        // 使用android native中的方法名
        if ((name.indexOf(libc_function_name) >= 0) && (name.indexOf(".cpp") == -1)) {
            console.log('name:', name)
            console.log('address:', address)

            libc_function_address = address
        }
    }

    Interceptor.attach(libc_function_address, {
        onEnter: function(args) {
            console.log(libc_function_name, 'arg[0] =', args[0])
            console.log(libc_function_name, 'arg[1] =', args[1])
            console.log(libc_function_name, 'arg[2] =', args[2])
            console.log(libc_function_name, 'arg[3] =', args[3])
        },
        onLeave: function(ret) {
            console.log('ret =', ret)
        }
    })
}


function main() {
    // Java.perform(remove_antiFrida)

    // get_symbol_offset()

    hook_libc_so()
}


setImmediate(main)
