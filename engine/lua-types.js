'use strict';


class TypeBase {
    constructor(type) {
        this.type = type;
    }
}

class Unknown extends TypeBase {
    constructor() {
        super("unknown");
    }
};

class Number extends TypeBase {
    constructor() {
        super("number");
    }
};

class String extends TypeBase {
    constructor() {
        super("string");
    }
};

class Boolean extends TypeBase {
    constructor() {
        super("bool");
    }
};

class Nil extends TypeBase {
    constructor() {
        super("nil");
    }
};

class Function extends TypeBase {
    constructor() {
        super("function");
        this.argTypes = [];
        this.returnTypes = [];
        this.localTypes = [];
    }
}

class Table extends TypeBase {
    constructor() {
        super("table");
        this.fields = {};
    }

    addField(type, name) {
        this.fields[name] = this.fields[name] || type;
    }
}

//for module('xxx')
class Module extends TypeBase {
    constructor() {
        super("module");
        this.exports = null;
        // this.localTypes = [];
    }
}

function isLuaTypes(t) {
    return t instanceof TypeBase;
}

function isUnknown(t) {
    return t instanceof Unknown;
}

function isNumber(t) {
    return t instanceof Number;
}

function isString(t) {
    return t instanceof String;
}

function isBoolean(t) {
    return t instanceof Boolean;
}

function isNil(t) {
    return t instanceof Nil;
}

function isFunction(t) {
    return t instanceof Function;
}

function isTable(t) {
    return t instanceof Table;
}

function isModule(t) {
    return t instanceof Module;
}

exports.LuaTypes = {
    unknown: Unknown,
    number: Number,
    string: String,
    boolean: Boolean,
    nil: Nil,
    function: Function,
    table: Table,
    module: Module,
    isLuaTypes,
    isUnknown,
    isBoolean,
    isFunction,
    isNil,
    isNumber,
    isString,
    isTable,
    isModule,
    __run_test
};

function __run_test() {
    const t = new Table("abc");
    console.log(t.type);
    console.log(isTable(t));
}

