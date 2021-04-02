// 没有支持arm64，可以在安装app的时候 adb install --abi armeabi-v7a 强制让app运行在32位模式
function LogPrint(log) {
    var theDate = new Date();
    var hour = theDate.getHours();
    var minute = theDate.getMinutes();
    var second = theDate.getSeconds();
    var mSecond = theDate.getMilliseconds()

    hour < 10 ? hour = "0" + hour : hour;
    minute < 10 ? minute = "0" + minute : minute;
    second < 10 ? second = "0" + second : second;
    mSecond < 10 ? mSecond = "00" + mSecond : mSecond < 100 ? mSecond = "0" + mSecond : mSecond;

    var time = hour + ":" + minute + ":" + second + ":" + mSecond;
    var threadid = Process.getCurrentThreadId();
    console.log("[" + time + "]" + "->threadid:" + threadid + "--" + log);

}


function hooklinker() {
    var linkername = "linker";
    var call_function_addr = null;
    var arch = Process.arch;
    LogPrint("Process run in:" + arch);
    if (arch.endsWith("arm")) {
        linkername = "linker";
    } else {
        linkername = "linker64";
        LogPrint("arm64 is not supported yet!");
    }

    var symbols = Module.enumerateSymbolsSync(linkername);
    for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];
        //LogPrint(linkername + "->" + symbol.name + "---" + symbol.address);
        if (symbol.name.indexOf("__dl__ZL13call_functionPKcPFviPPcS2_ES0_") != -1) {
            call_function_addr = symbol.address;
            LogPrint("linker->" + symbol.name + "---" + symbol.address)

        }
    }

    if (call_function_addr != null) {
        var func_call_function = new NativeFunction(call_function_addr, 'void', ['pointer', 'pointer', 'pointer']);
        Interceptor.replace(new NativeFunction(call_function_addr,
            'void', ['pointer', 'pointer', 'pointer']), new NativeCallback(function (arg0, arg1, arg2) {
            var functiontype = null;
            var functionaddr = null;
            var sopath = null;
            if (arg0 != null) {
                functiontype = Memory.readCString(arg0);
            }
            if (arg1 != null) {
                functionaddr = arg1;

            }
            if (arg2 != null) {
                sopath = Memory.readCString(arg2);
            }
            var modulebaseaddr = Module.findBaseAddress(sopath);
            LogPrint("after load:" + sopath + "--start call_function,type:" + functiontype + "--addr:" + functionaddr + "---baseaddr:" + modulebaseaddr);
            if (sopath.indexOf('libnative-lib.so') >= 0 && functiontype == "DT_INIT") {
                LogPrint("after load:" + sopath + "--ignore call_function,type:" + functiontype + "--addr:" + functionaddr + "---baseaddr:" + modulebaseaddr);

            } else {
                func_call_function(arg0, arg1, arg2);
                LogPrint("after load:" + sopath + "--end call_function,type:" + functiontype + "--addr:" + functionaddr + "---baseaddr:" + modulebaseaddr);

            }

        }, 'void', ['pointer', 'pointer', 'pointer']));
    }


}


setImmediate(hooklinker)
