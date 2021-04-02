/*
 * frida -H 192.168.50.42:8888 -f com.android.settings -l agent/invoke_so.js --no-pause
 */
function invoke_so() {
    /**
     * https://github.com/lasting-yang/frida_hook_libart
     * root@Nick:~# adb push Downloads/libnative-lib.so /data/local/tmp
     * root@Nick:~# adb shell su -c "cp /data/local/tmp/libnative-lib.so /data/app/libnative-lib.so"
     * root@Nick:~# adb shell su -c "chown 1000.1000 /data/app/libnative-lib.so"
     * root@Nick:~# adb shell su -c "chmod 777 /data/app/libnative-lib.so"
     * root@Nick:~# adb shell su -c "ls -al /data/app/libnative-lib.so"
     */

    var module_libnative_lib_so = Module.load("/data/app/libnative-lib.so")
    var export_function_name = "_Z17detect_frida_loopPv"
    var export_function_address = module_libnative_lib_so.findExportByName(export_function_name)
    console.log('export_function_address =', export_function_address)

    var detect_frida_loop = new NativeFunction(export_function_address, 'pointer', ['pointer'])
    var void_star = Memory.allocUtf8String("hello")
    detect_frida_loop(void_star)
    // adb logcat 可以看到开始Frida端口检测
}


function main() {
    invoke_so()
}


setImmediate(main)
