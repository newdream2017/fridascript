/**
 * 1.
 * frida -H 192.168.50.42:8888 com.android.settings -l agent/cmodule.js --runtime=v8
 * 
 * 2.
 * root@Nick:~/Downloads# ./frida-server-12.8.0-linux-x86_64
 * root@Nick:~# mousepad cmodule.md
 */
function open_1() {
    // 无法保存文件内容了!
    const m = new CModule(`
    #include <gum/guminterceptor.h>
    
    #define EPERM 1
    
    int
    open (const char * path,
          int oflag,
          ...)
    {
      GumInvocationContext * ic;
    
      ic = gum_interceptor_get_current_invocation ();
      ic->system_error = EPERM;
    
      return -1;
    }
    `)
    
    const openImpl = Module.getExportByName(null, 'open')
    console.log('openImpl = ', openImpl)
    
    Interceptor.replace(openImpl, m.open)
    
}


function open_2() {
    const openImpl = Module.getExportByName(null, 'open')

    Interceptor.attach(openImpl, new CModule(`
      #include <gum/guminterceptor.h>
      #include <stdio.h>
    
      void
      onEnter (GumInvocationContext * ic)
      {
        const char * path;
    
        path = gum_invocation_context_get_nth_argument (ic, 0);
    
        printf ("open() path=\\"%s\\"\\n", path);
      }
    
      void
      onLeave (GumInvocationContext * ic)
      {
        int fd;
    
        fd = (int) gum_invocation_context_get_return_value (ic);
    
        printf ("=> fd=%d\\n", fd);
      }
    `))
}


function open_3() {
    const openImpl = Module.getExportByName(null, 'open')

    Interceptor.attach(openImpl, new CModule(`
            #include <gum/guminterceptor.h>

            extern void onMessage (const gchar * message);

            static void log (const gchar * format, ...);

            void
            onEnter (GumInvocationContext * ic)
            {
                const char * path;

                path = gum_invocation_context_get_nth_argument (ic, 0);

                log ("open() path=\\"%s\\"", path);
            }

            void
            onLeave (GumInvocationContext * ic)
            {
                int fd;

                fd = (int) gum_invocation_context_get_return_value (ic);

                log ("=> fd=%d", fd);
            }

            static void
            log (const gchar * format,
                ...)
            {
                gchar * message;
                va_list args;

                va_start (args, format);
                message = g_strdup_vprintf (format, args);
                va_end (args);

                onMessage (message);

                g_free (message);
            }
            `,
            {
                onMessage: new NativeCallback(messagePtr => {
                    const message = messagePtr.readUtf8String()
                    console.log('onMessage:', message)
                }, 'void', ['pointer'])
            }
        )
    )
}


function open_4() {
    const calls = Memory.alloc(4)

    const openImpl = Module.getExportByName(null, 'open')

    Interceptor.attach(
        openImpl,
        new CModule(`
                #include <gum/guminterceptor.h>

                extern volatile gint calls;

                void
                onEnter (GumInvocationContext * ic)
                {
                    g_atomic_int_add (&calls, 1);
                }
            `,
            { calls }
        )
    )

    setInterval(() => {
        console.log('Calls so far:', calls.readInt())
    }, 1000)
}


function main() {
    // open_1()

    // open_2()

    // open_3()

    open_4()
}

setImmediate(main)
