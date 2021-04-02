setImmediate(function() {
//延迟1秒调用Hook方法
setTimeout(test, 1000);
});

var g_one = 0;
function test(){
	Java.perform(function(){
		var szKey = undefined;
		var exports = Module.enumerateExportsSync("libcocos2dlua.so");
		var i;
		for(i=0;i<exports.length;i++){
			if(exports[i].name=="_Z13xxtea_decryptPhjS_jPj"){
				szKey = exports[i].address;
				send("xxTea_decrypt Function Address: " + szKey);
				break;
			}
		}
		Interceptor.attach(szKey,{
			onEnter: function(args){
			
			
			// 获取cocos2D xxTea密码 只获取一次
			if(g_one == 0){
				send("密码:" + Memory.readUtf8String(args[2]));
				send("长度:" + args[3]);
				g_one++;
			}
			
			//send("key is: " + Memory.readUtf8String(Memory.readPointer(szKey.sub(0x11a8).add(0x628c))));
		}
		});
	});
}
