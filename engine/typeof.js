'use strict';

const { LuaSymbol, LuaTable, LuaFunction, LuaModule, LuaScope, BasicTypes } = require('./typedef');
const { identName, baseName, safeName } = require('./utils_v2');

class LazyType {
    constructor(scope, node, name) {
        this.scope = scope;
        this.node = node;
        this.name = name;
    }

    parseLiteral(name, type, range) {
        let symbol = new LuaSymbol(type, name, true, range);
        this.scope.setField(name, symbol);
        return symbol;
    }

    typeOf() {
        let { table, value } = this.scope.searchField(this.name);
        if (value) {
            return value;
        }

        switch (this.node.type) {
            case 'StringLiteral':
                return this.parseLiteral(this.name, BasicTypes.string_t, this.node.range);
            case 'NumericLiteral':
                return this.parseLiteral(this.name, BasicTypes.number_t, this.node.range);
            case 'BooleanLiteral':
                return this.parseLiteral(this.name, BasicTypes.bool_t, this.node.range);
            case 'NilLiteral':
                return this.parseLiteral(this.name, BasicTypes.nil_t, this.node.range);
            default:
                return this.parseLiteral(this.name, BasicTypes.unkown_t, this.node.range);
        }
    }
};

function typeOf(scope, node, name) {
    return new LazyType(scope, node, name);
}

module.exports = {
    typeOf,
    LazyType
}