var FunName = Module.findExportByName(null, "pthread_create");
var modMap = new ModuleMap;
var callSites;

function parseCallSites(callSites) {
    if (callSites == undefined || callSites.length == 0) {
        return;
    } else {
        for (var i = 0; i < callSites.length; i++) {
            var oModuleFrom = modMap.find(ptr(callSites[i][1].toString()));
            var oModuleTo = modMap.find(ptr(callSites[i][2].toString()));
            if (oModuleFrom != null) {
                if ((oModuleFrom.name).toLowerCase().indexOf("frida") == -1) {
                    var pSymbolFrom = ptr(callSites[i][1].toString());
                    var sSymbolFrom = DebugSymbol.fromAddress(ptr(callSites[i][1].toString())).name;
                    var pSymbolTo = ptr(callSites[i][2].toString());
                    var sSymbolTo = DebugSymbol.fromAddress(ptr(callSites[i][1].toString())).name;
                    console.warn("        + FROM : " + pSymbolFrom + " @ " + oModuleFrom.name + "!" + sSymbolFrom);
                    console.log("        |_ TO  : " + pSymbolTo + " @ " + oModuleTo.name + "!" + sSymbolTo);
                }
            }
        }
    }
}

Interceptor.attach(FunName, {
    onEnter: function (args) {
             
        {
        console.log("\n[+] Calling Function and Stalking");
        var cTid = Process.getCurrentThreadId();
        Stalker.follow(cTid, {
            events: {
                call: true
                , ret: true
                , exec: true
                , block: true
                , compile: true
            }
            , onReceive: function (events) {
                callSites = Stalker.parse(events);
                //console.warn(callSites);
            }
        , });
        }
    }
    , onLeave: function (retval) {
        Stalker.flush();
        Stalker.unfollow();
        Stalker.garbageCollect();
        if (callSites == undefined) {
            return;
        } else {
            parseCallSites(callSites);
        }
    }
});
