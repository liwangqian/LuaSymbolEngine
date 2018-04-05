'use strict';

const assert = require('assert')
const { LuaTypes } = require('./lua-types');

class LuaScope {
    constructor(range) {
        this.range = range
    }

    inScope(range) {
        return this.range[0] <= range[0] && range[1] <= this.range[1];
    }
}

class LuaSymbol {
    constructor(type, name, local, location, uri) {
        this.type = type;
        this.name = name;
        this.location = location;
        this.uri = uri;
        this.local = local;
    }

    isLocal() {
        return this.local;
    }
};

class LuaTable extends LuaSymbol {
    constructor(type, name, local, location, uri) {
        super(type, name, local, location, uri);
    }

    addField(name, type) {
        this.type.fields[name] = type;  //TODO: 考虑重复赋值不同类型的处理
    }
}

class LuaFunction extends LuaSymbol {
    constructor(type, name, local, location, range, uri) {
        super(type, name, local, location, uri);
        this.scope = new LuaScope(range);
        this.scopeSymbols = [];
    }

    returnTypes() {
        return this.type.returnTypes;
    }
};

class LuaModule extends LuaSymbol {
    constructor(type, name, range, uri) {
        super(type, name, false, null, uri);
        this.scope = new LuaScope(range);
        this.scopeSymbols = null;
        this.depends = new Map();
        this.moduleMode = false;
        if (!name) {
            name = uri.match(/(\w+)(\.lua)?$/);
            this.name = name[1];
        }
    }

    addDepend(name, type) {
        this.depends.set(name, type);
    }
};

module.exports = {
    LuaScope,
    LuaSymbol,
    LuaTable,
    LuaFunction,
    LuaModule
};
