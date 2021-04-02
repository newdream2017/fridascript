function hook_key_store_load() {
    var StringClass = Java.use("java.lang.String")
    var KeyStore = Java.use("java.security.KeyStore")
    KeyStore.load.overload('java.security.KeyStore$LoadStoreParameter').implementation = function (arg0) {
        console.log("KeyStore.load1:", arg0)
        // console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Throwable").$new()))
        this.load(arg0)
    }
    KeyStore.load.overload('java.io.InputStream', '[C').implementation = function (arg0, arg1) {
        console.log("KeyStore.load2:", arg0, arg1 ? StringClass.$new(arg1) : null)
        // console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Throwable").$new()))
        this.load(arg0, arg1)
    }

    console.log("hook_key_store_load...")
}

function hook_ssl() {
        var ClassName = "com.android.org.conscrypt.Platform"
        var Platform = Java.use(ClassName)
        var targetMethod = "checkServerTrusted"
        var len = Platform[targetMethod].overloads.length
        console.log(len)
        for(var i = 0; i < len; ++i) {
            Platform[targetMethod].overloads[i].implementation = function () {
                console.log("class:", ClassName, "target:", targetMethod, " i:", i, arguments)
                // console.log(Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Throwable").$new()))
            }
        }
}

function main() {
    // Java.perform(hook_key_store_load)
    Java.perform(hook_ssl)
}

setImmediate(main)
