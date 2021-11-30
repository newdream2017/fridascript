let testA;
let timer = setInterval(() => {
    hookCEF();	// 只能想到这种方式了，及时 hook 到 CEF 的初始化调用
}, 20);

function hookCEF() {
    testA = Module.findExportByName("libcef.dll", "cef_initialize");
    if (!testA) {
        return;
    }
    clearInterval(timer);
    console.log("got testA", testA);
    Interceptor.attach(testA, {
        onEnter: function (args, state) {
            console.log("[+] testA onEnter");
            console.log("¦- context: ", JSON.stringify(this.context));
            // console.log("¦- _cef_main_args_t*: ", args[1]);
            // console.log("¦- _cef_settings_t*: ", args[2]);
            console.log("¦- testRead args[1]");
            console.log(Memory.readByteArray(args[1], 256));

            console.log("¦- modfiy debug port");
            let tryPortAddr = args[1].add(ptr("0x28"));
            Memory.writeInt(tryPortAddr, 9222);

            console.log("¦- testRead args[1]");
            console.log(Memory.readByteArray(args[1], 256));
        },

        onLeave: function () {
            console.log("[+] testA onLeave");
        },
    });
}