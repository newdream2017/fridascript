Java.perform(function() {
    var str = Java.use('java.lang.String');
    /*
    .overload('java.lang.StringBuilder')
    .overload('[B')
    .overload('java.lang.StringBuffer')
    .overload('[C')
    .overload('java.lang.String')
        .overload('[B', 'java.nio.charset.Charset')
    .overload('[B', 'java.lang.String')
    .overload('[B', 'int')
    .overload('[C', 'int', 'int')
    .overload('[I', 'int', 'int')
    .overload('int', 'int', '[C')
    .overload('[B', 'int', 'int')
    .overload('[B', 'int', 'int', 'java.nio.charset.Charset')
    .overload('[B', 'int', 'int', 'java.lang.String')
    .overload('[B', 'int', 'int', 'int')
    */
    str.$init.overload('java.lang.StringBuilder').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('java.lang.StringBuilder').call(this, arguments);
    }
    str.$init.overload('[B').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('[B').call(this, arguments);
    }
    str.$init.overload('java.lang.StringBuffer').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('java.lang.StringBuffer').call(this, arguments);
    }
    str.$init.overload('[C').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('[C').call(this, arguments);
    }
    str.$init.overload('java.lang.String').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('java.lang.String').call(this, arguments);
    }
    str.$init.overload('[B', 'java.nio.charset.Charset').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init    .overload('[B', 'java.nio.charset.Charset').call(this, arguments);
    }
    str.$init.overload('[B', 'java.lang.String').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('[B', 'java.lang.String').call(this, arguments);
    }
    str.$init.overload('[B', 'int').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('[B', 'int').call(this, arguments);
    }
    str.$init.overload('[C', 'int', 'int').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('[C', 'int', 'int').call(this, arguments);
    }
    str.$init.overload('[I', 'int', 'int').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('[I', 'int', 'int').call(this, arguments);
    }
    str.$init.overload('int', 'int', '[C').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('int', 'int', '[C').call(this, arguments);
    }
    str.$init.overload('[B', 'int', 'int').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('[B', 'int', 'int').call(this, arguments);
    }
    str.$init.overload('[B', 'int', 'int', 'java.nio.charset.Charset').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('[B', 'int', 'int', 'java.nio.charset.Charset').call(this, arguments);
    }
    str.$init.overload('[B', 'int', 'int', 'java.lang.String').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('[B', 'int', 'int', 'java.lang.String').call(this, arguments);
    }
    str.$init.overload('[B', 'int', 'int', 'int').implementation = function(){
        console.log('str', arguments[0]);
        return str.$init.overload('[B', 'int', 'int', 'int').call(this, arguments);
    }

});