// 获取指定的导入表
function getimport(so_name, fun) {
    var imports = Module.enumerateImportsSync(so_name);
    for (var i = 0; i < imports.length; i++) {
        if (imports[i].name.indexOf(fun) != -1) {
            send(imports[i].name + ": " + imports[i].address);
            break;
        }
    }
}
// 获取指定的导出表
function getexport(so_name, fun) {
    var exports = Module.enumerateExportsSync(so_name);
    for (var i = 0; i < exports.length; i++) {
        if (exports[i].name.indexOf(fun) != -1) {
            send(exports[i].name + ": " + exports[i].address);
            break;
        }
    }
}

function getfuninfo(funname, so_name) {
    var i = 0;
    var found = 0;
    var functionName = "";

    if (so_name.length == 0) {
        send("方法1模块名为空(速度慢): 所有模块中查找 [" + funname + "] 函数!");
        Process.enumerateModules({
            onMatch: function (exp) {

                var artExports = Module.enumerateExportsSync(exp.name);
                for (i = 0; i < artExports.length; i++) {
                    if (artExports[i].name.indexOf(funname) !== -1) {
                        found = 1;
                        functionName = artExports[i].name;
                        send("找到!!! 模块: [" + exp.name + "] 基址: [" + exp.base + "] 下标: [" + i + "] 函数名: " + functionName + " 地址: [" + artExports[i].address + "]");
                        break;
                    }
                }
                /*
                if(exp.name == 'libhello.so'){
                    send(exp.name + "|" + exp.base + "|" + exp.size + "|" + exp.path);
                    send(exp);
                    return 'stop';
                }
                else{
                    send("name: " + exp.name);
                }
                */
            },
            onComplete: function () {
                if (found == 0) {
                    send('方法1未找到函数: [' + funname + "]");
                }
                else {
                    //send('找到函数: [' + funname + "]");
                }
            }
        });
    }
    else {
        send("方法2带模块名(速度快): 指定模块 [" + so_name + "] 中查找 [" + funname + "] 函数!");
        var artExports = Module.enumerateExportsSync(so_name);
        for (i = 0; i < artExports.length; i++) {
            if (artExports[i].name.indexOf(funname) !== -1) {
                found = 1;
                functionName = artExports[i].name;
                send("[" + so_name + "] 模块中找到函数下标为: [" + i + "] 函数名: " + functionName + " 地址: [" + artExports[i].address + "]");

                break;
            }
        }

        if (found == 0) {
            send("方法2 指定模块 [" + so_name + "] 未找到函数: [" + funname + "]");
        }
        else {
            //send('找到函数: [' + funname + "]");
        }
    }

    return functionName;
}


setImmediate(function () {
    setTimeout(find, 2000);
});

function find() {
    // 要查找的函数名 和模块名 模块名如果为空则搜索所有模块中的函数(速度较慢) (这里例子中是只找导出函数, 导入函数需要修改)
    getfuninfo("xxtea_decryp", "");
    //getFunctionName("luaL_loadbuffer", "");
    //getFunctionName("xxtea_decryp", "libcocos2djs.so");
}