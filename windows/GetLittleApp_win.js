var baseAddr = Module.findBaseAddress('WeChatAppHost.dll');
console.log('WeChatAppHost.dll baseAddr: ' + baseAddr);
if (baseAddr) {
        var EncryptBufToFile = Module.findExportByName('WeChatAppHost.dll','EncryptBufToFile');
    console.log('EncryptBufToFile ������ַ: ' + EncryptBufToFile);
    Interceptor.attach(EncryptBufToFile, {
        onEnter: function (args) {
            this.appId = ptr(args[0]).readPointer().readAnsiString();
            this.apkgFilePath = ptr(args[1]).readPointer().readAnsiString();
            this.originalData = Memory.readByteArray(args[2], args[3].toInt32());
        },
        onLeave: function (retval) {
            console.log('�ļ����ܳɹ�', this.apkgFilePath);
            var f = new File(this.apkgFilePath, 'wb');
            f.write(this.originalData);
            f.flush();
            f.close();
            delete this.appId;
            delete this.apkgFilePath;
            delete this.originalData;
        }
    });
} else {
    console.log('WeChatAppHost.dll ģ��δ����, ���ȴ򿪽����е�С�������');
}