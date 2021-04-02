function hook_socket() {
    var libc_so_name = 'libc.so'
    var function_recvfrom_name = 'recvfrom'
    var function_sendto_name = 'sendto'
    var function_recvfrom_address = Module.findExportByName(libc_so_name, function_recvfrom_name)
    var function_sendto_address = Module.findExportByName(libc_so_name, function_sendto_name)

    console.log('function_recvfrom_address =', function_recvfrom_address)
    console.log('function_sendto_address =', function_sendto_address)

    Interceptor.attach(function_recvfrom_address, {
        onEnter: function(args) {
            console.log('recvfrom arg1 =', hexdump(ptr(args[1])))
        },
        onLeave: function(ret) {}
    })

    Interceptor.attach(function_sendto_address, {
        onEnter: function(args) {
            console.log('sendto arg1 =', hexdump(ptr(args[1])))
        },
        onLeave: function(ret) {}
    })
}

function main() {
    hook_socket()
}

setImmediate(main)
