Process.enumerateModules({
	onMatch: function(module){

		if(module.name == "libssl.so"){
			Module.enumerateExports(module.name, { 
				onMatch: function(e) { 
					if(e.name == "SSL_write"){

                        console.log("SSL_write: " + e.address)

                        Interceptor.attach(ptr(e.address), {
                            onEnter: function(args){
                                var buf = args[1]
                                var len = args[2].toInt32()
                                var data = Memory.readByteArray(buf, len)
                                console.log("[SSL_write]")
                                console.log(data)
                            }
                        })

                    }
						
					if(e.name == "SSL_read"){
                        
                        console.log("SSL_read: " + e.address)
                        
                        Interceptor.attach(ptr(e.address), {
                            onEnter: function(args){
                                this.buf = args[1]
                                this.len = args[2].toInt32()
                            },
                            onLeave: function(retval){
                                var data = Memory.readByteArray(this.buf, this.len)
                                console.log("[SSL_read]")
                                console.log(data)
                            }
                        })
                    }
						
					// if(e.name == "SSL_CTX_set_cert_verify_callback"){

                    //     console.log("SSL_CTX_set_cert_verify_callback: " + e.address)

                    //     Interceptor.attach(ptr(e.address), {
                    //         onEnter: function(args){ args[1] = ptr("0x0") /* 0x0 == NULLptr */ },
                    //         onLeave: function(retval){}
                    //     });

                    // }
						
					// if(e.name.indexOf("verify_cert_chain") > -1)
					// 	console.log("ssl_verify_cert_chain: " + e.address)
			    },
			    onComplete: function(){}
			})
		}
		
	},
	onComplete: function(module){}
})