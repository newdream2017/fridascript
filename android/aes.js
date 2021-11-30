console.log("Script loaded successfully 55");

Java.perform(function x() {
	console.log("Inside Java.perform");
	var Session = Java.use("com.vitalsource.learnkit.Session");
	console.log("After Session");
	Session.isDeviceRooted.implementation = function(){
		console.log("\nInside Session.isDeviceRooted function");
		return false;
	};
	var LearnkitLib = Java.use("com.vitalsource.learnkit.jni.LearnKitLib");
	console.log("After LearnkitLib");
	LearnkitLib.isDeviceRooted.implementation = function(){
		console.log("\nInside Session.isDeviceRooted function");
		return false;
	};
	var secret_key_spec = Java.use("javax.crypto.spec.SecretKeySpec");
	//SecretKeySpec is inistantiated with the bytes of the key, so we hook the constructor and get the bytes of the key from it
	//We will get the key but we won't know what data is decrypted/encrypted with it
	secret_key_spec.$init.overload("[B", "java.lang.String").implementation = function (x, y) {
		send('{"my_type" : "KEY"}', new Uint8Array(x));
		//console.log(xx.join(" "))
		return this.$init(x, y);
	}
	//hooking IvParameterSpec's constructor to get the IV as we got the key above.
	var iv_parameter_spec = Java.use("javax.crypto.spec.IvParameterSpec");
	iv_parameter_spec.$init.overload("[B").implementation = function (x) {
		send('{"my_type" : "IV"}', new Uint8Array(x));
		return this.$init(x);
	}
	//now we will hook init function in class Cipher, we will be able to tie keys,IVs with Cipher objects
	var cipher = Java.use("javax.crypto.Cipher");
	cipher.init.overload("int", "java.security.Key", "java.security.spec.AlgorithmParameterSpec").implementation = function (x, y, z) {
		//console.log(z.getClass()); 
		if (x == 1) // 1 means Cipher.MODE_ENCRYPT
			send('{"my_type" : "hashcode_enc", "hashcode" :"' + this.hashCode().toString() + '" }');
		else // In this android app it is either 1 (Cipher.MODE_ENCRYPT) or 2 (Cipher.MODE_DECRYPT)
			send('{"my_type" : "hashcode_dec", "hashcode" :"' + this.hashCode().toString() + '" }');
		//We will have two lists in the python code, which keep track of the Cipher objects and their modes.


		//Also we can obtain the key,iv from the args passed to init call
		send('{"my_type" : "Key from call to cipher init"}', new Uint8Array(y.getEncoded()));
		//arg z is of type AlgorithmParameterSpec, we need to cast it to IvParameterSpec first to be able to call getIV function
		send('{"my_type" : "IV from call to cipher init"}', new Uint8Array(Java.cast(z, iv_parameter_spec).getIV()));
		//init must be called this way to work properly
		return cipher.init.overload("int", "java.security.Key", "java.security.spec.AlgorithmParameterSpec").call(this, x, y, z);

	}
	//now hooking the doFinal method to intercept the enc/dec process
	//the mode specified in the previous init call specifies whether this Cipher object will decrypt or encrypt, there is no functions like cipher.getopmode() that we can use to get the operation mode of the object (enc or dec)
	//so we will send the data before and after the call to the python code, where we will decide which one of them is cleartext data
	//if the object will encrypt, so the cleartext data is availabe in the argument before the call, else if the object will decrypt, we need to send the data returned from the doFinal call and discard the data sent before the call
	cipher.doFinal.overload("[B").implementation = function (x) {
		send('{"my_type" : "before_doFinal" , "hashcode" :"' + this.hashCode().toString() + '" }', new Uint8Array(x));
		var ret = cipher.doFinal.overload("[B").call(this, x);
		send('{"my_type" : "after_doFinal" , "hashcode" :"' + this.hashCode().toString() + '" }', new Uint8Array(ret));

		return ret;
	}
});
