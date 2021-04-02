console.log('Hello from Javascript')

var counter = Memory.alloc(4)
var bump = null
cs.counter = counter

rpc.exports.init = function () {
    bump = new NativeFunction(cm.bump, 'void', ['int'])
}
