function hook_MyApp() {
    var MyApp = Java.use('com.gdufs.xman.MyApp')
    MyApp.m.value = 1

    var Toast = Java.use('android.widget.Toast')
    Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int').implementation = function(arg0, arg1, arg2) {
        console.log('arg2:', arg1)
        var ret = this.makeText(arg0, arg1, arg2)
        return ret
    }
}


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

    var libc_function_name = 'strcmp'
    var libc_function_address = null

    var symbols = null

    symbols = Module.enumerateSymbolsSync(libc_so_name)

    for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i]
        var name = symbol.name
        var address = symbol.address
        if ((name.indexOf(libc_function_name) >= 0) && (name.indexOf(".cpp") == -1)) {
            console.log('name:', name)
            console.log('address:', address)

            libc_function_address = address
        }
    }

    var libc_function = new NativeFunction(libc_function_address, 'int', ['pointer', 'pointer'])


    Interceptor.replace(libc_function_address, new NativeCallback(function(s1, s2) {
        var char_star_s1 = ptr(s1).readCString()
        var char_star_s2 = ptr(s2).readCString()

        if (char_star_s2 == 'EoPAoY62@ElRD') {
            console.log('char_star_s1 =', char_star_s1)
            console.log('char_star_s2 =', char_star_s2)
            return 0
        }

        var ret = libc_function(s1, s2)
        return ret
    }, 'int', ['pointer', 'pointer']))
}


function frida_write_reg(){
    var file = new File("/sdcard/reg.dat","w+")
    file.write("EoPAoY62@ElRD")
    file.flush()
    file.close()

    console.log('frida_write_reg')
}


// 主动调用so函数
function hook_libc_so_write_reg(){
    var fopen_address = Module.findExportByName("libc.so", "fopen")
    var fputs_address = Module.findExportByName("libc.so", "fputs")
    var fclose_address = Module.findExportByName("libc.so", "fclose")
    console.log('fopen_address =', fopen_address)
    console.log('fputs_address =', fputs_address)
    console.log('fclose_address =', fclose_address)

    var fopen = new NativeFunction(fopen_address, "pointer", ["pointer", "pointer"])
    var fputs = new NativeFunction(fputs_address, "int", ["pointer", "pointer"])
    var fclose = new NativeFunction(fclose_address, "int", ["pointer"])

    // 创建C的字符串,不能直接传入js的字符串
    var filename = Memory.allocUtf8String("/sdcard/reg.dat")
    var mode = Memory.allocUtf8String("w+")
    var file = fopen(filename, mode)
    var contents = Memory.allocUtf8String("EoPAoY62@ElRD")
    var fputs_ret = fputs(contents, file)
    fclose(file)

    console.log('fputs_ret =', fputs_ret)
    console.log('hook_libc_so_write_reg')
}


function main() {
    // Java.perform(hook_MyApp)

    // hook_libc_so()

    // frida_write_reg()

    hook_libc_so_write_reg()
}


setImmediate(main)
