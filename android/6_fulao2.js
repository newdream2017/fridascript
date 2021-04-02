function hook_BitmapFactory() {
    console.log('start hook_BitmapFactory')

    var class_BitmapFactory_name = 'android.graphics.BitmapFactory'
    var class_BitmapFactory = Java.use(class_BitmapFactory_name)

    var class_File_name = 'java.io.File'
    var class_File = Java.use(class_File_name)

    var class_FileOutputStream_name = 'java.io.FileOutputStream'
    var class_FileOutputStream = Java.use(class_FileOutputStream_name)

    var class_CompressFormat_name = 'android.graphics.Bitmap$CompressFormat'
    var class_CompressFormat = Java.use(class_CompressFormat_name)

    var class_Thread_name = 'java.lang.Thread'
    var class_Thread = Java.use(class_Thread_name)

    class_BitmapFactory.decodeByteArray.overload('[B', 'int', 'int', 'android.graphics.BitmapFactory$Options').implementation = function(data, offset, length, opts) {
        var t = class_Thread.currentThread()
        console.log('currentThread =', t.getName())

        var ret = this.decodeByteArray(data, offset, length, opts)
        console.log('data =', data)
        console.log('offset =', offset)
        console.log('length =', length)
        console.log('opts =', opts)
        console.log('ret =', ret)

        var image_name = '/sdcard/Download/' + String(ret) + '.jpeg'
        // console.log('image_name =', image_name)
        var file = class_File.$new(image_name)
        var file_os = class_FileOutputStream.$new(file)
        // console.log('file_os.getFD() =', file_os.getFD())
        ret.compress(class_CompressFormat.JPEG.value, 100, file_os)
        file_os.flush()
        file_os.close()

        return ret
    }
}


function hook_BitmapFactory_Runnable() {
    console.log('start hook_BitmapFactory_Runnable')

    var class_BitmapFactory_name = 'android.graphics.BitmapFactory'
    var class_BitmapFactory = Java.use(class_BitmapFactory_name)

    var class_File_name = 'java.io.File'
    var class_File = Java.use(class_File_name)

    var class_FileOutputStream_name = 'java.io.FileOutputStream'
    var class_FileOutputStream = Java.use(class_FileOutputStream_name)

    var class_CompressFormat_name = 'android.graphics.Bitmap$CompressFormat'
    var class_CompressFormat = Java.use(class_CompressFormat_name)

    var class_Runnable_name = 'java.lang.Runnable'
    var class_Runnable = Java.use(class_Runnable_name)

    var class_Log_name = 'android.util.Log'
    var class_Log = Java.use(class_Log_name)

    var class_Throwable_name = 'java.lang.Throwable'
    var class_Throwable = Java.use(class_Throwable_name)

    var class_String_name = 'java.lang.String'
    var class_String = Java.use(class_String_name)

    var class_Charset_name = 'java.nio.charset.Charset'
    var class_Charset = Java.use(class_Charset_name)

    var class_Thread_name = 'java.lang.Thread'
    var class_Thread = Java.use(class_Thread_name)

    var class_DumpImage = Java.registerClass({
        name: 'com.nickmyb.Fulao2DumpImage',
        implements: [class_Runnable],
        fields: {
            bm: "android.graphics.Bitmap"
        },
        methods: {
            $init: [
                {
                    // returnType: 'void',
                    argumentTypes: ["android.graphics.Bitmap",],
                    implementation: function(bm) {
                        this.bm.value = bm
                        console.log('com.nickmyb.Fulao2DumpImage.$init(' + bm + ')')
                    }
                }
            ],
            run: [
                {
                    returnType: 'void',
                    implementation: function () {
                        try {
                            console.log('com.nickmyb.Fulao2DumpImage.run() start')
                            var t = class_Thread.currentThread()
                            console.log('currentThread =', t.getName())
                            var image_name = '/sdcard/Download/' + String(this.bm.value) + '.jpeg'
                            var image_file = class_File.$new(image_name)
                            var image_file_os = class_FileOutputStream.$new(image_file)
                            this.bm.value.compress(class_CompressFormat.JPEG.value, 100, image_file_os)
                            image_file_os.flush()
                            image_file_os.close()

                            var log_name = '/sdcard/Download/' + String(this.bm.value) + '.log'
                            var log_file = class_File.$new(log_name)
                            var log_file_os = class_FileOutputStream.$new(log_file)
                            var traceback = class_Log.getStackTraceString(class_Throwable.$new())
                            var str_traceback = class_String.$new(traceback)
                            var l = str_traceback.getBytes(class_Charset.forName("UTF-8"))
                            log_file_os.write(l)
                            log_file_os.flush()
                            log_file_os.close()
                            console.log('com.nickmyb.Fulao2DumpImage.run() end')
                        } catch (e) {
                            console.log("com.nickmyb.Fulao2DumpImage.run() raise Exception =", e)
                        }
                    }
                }
            ]
        },
    })

    class_BitmapFactory.decodeByteArray.overload('[B', 'int', 'int', 'android.graphics.BitmapFactory$Options').implementation = function(data, offset, length, opts) {
        var ret = this.decodeByteArray(data, offset, length, opts)
        console.log('data =', data)
        console.log('offset =', offset)
        console.log('length =', length)
        console.log('opts =', opts)
        console.log('ret =', ret)

        var dump_image = class_DumpImage.$new(ret)
        // dump_image.run()

        var t = class_Thread.$new(dump_image)
        t.start()
        t.join()

        return ret
    }
}


function main() {
    // Java.perform(hook_BitmapFactory)
    Java.perform(hook_BitmapFactory_Runnable)
}


setImmediate(main)
