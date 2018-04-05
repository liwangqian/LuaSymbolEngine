'use strict';

const { LuaTypes } = require('./lua-types');
const { searchField } = require('./utils_v2');

function deduce(t, v, name) {
    if (v instanceof LazyTypeOf) {
        let vv = v.deduce(name);
        if (name && LuaTypes.isTable(t)) {
            t.addField(vv, name);
        }
        return vv;
    } else {
        return v;
    }
}

function newType(typeList, node) {
    return new LazyTypeOf(typeList, node);
}

module.exports = {
    deduce,
    newType
};

/**
 * Private names
*/

class LazyTypeOf {
    constructor(typeList, node) {
        this.typeList = typeList;
        this.node = node;
        this.cachedTypes = {};
    }

    deduce(name) {
        let ctype = this.cachedTypes[name];
        if (ctype) {
            return ctype;
        }
        ctype = typeOf(this.typeList, this.node, name || this.node.name);
        this.cachedTypes[name] = ctype;
        return ctype;
    }
};

const unkown_t = new LuaTypes.unknown();
const number_t = new LuaTypes.number();
const string_t = new LuaTypes.string();
const boolean_t = new LuaTypes.boolean();
const nil_t = new LuaTypes.nil();

function typeOf(typeList, node, name, returnTypes = []) {
    if (!typeList || !node) {
        return;
    }

    let r = null;
    switch (node.type) {
        case 'Identifier':
            r = searchField(typeList, node.name);
            return deduce(r.t, r.v, node.name) || unkown_t;
        case 'NumericLiteral': return number_t;
        case 'StringLiteral': return string_t;
        case 'BooleanLiteral': return boolean_t;
        case 'TableConstructorExpression':
            r = searchField(typeList, name);
            if (r.v && !(r.v instanceof LazyTypeOf)) {
                return r.v;
            }

            let tbl = new LuaTypes.table();
            node.fields.forEach((field, index) => {
                if (field.type == 'TableKeyString') {
                    tbl.fields[field.key.name] = typeOf(typeList, field.value, field.key.name);
                }
            });
            return tbl;
        case 'FunctionDeclaration':
            let f = new LuaTypes.function();
            let args = node.parameters || [node.parameter];
            args.forEach((arg, index) => {
                f.argTypes.push(typeOf(typeList, arg, arg.name));
            });

            node.body.forEach((item) => {
                typeOf(typeList, item, null, f.returnTypes);
            });

            return f;
        case 'ReturnStatement':
            if (!node.arguments) {
                return;
            }
            node.arguments.forEach((arg, index) => {
                returnTypes[index] = typeOf(typeList, arg);
            });
        case 'GetDependModule':
            r = searchField(typeList, node.name);
            if (!r.v) { //module is not loaded, so we load it

            }

            return r.v;
            break;
        case 'CallExpression':  //Get return value
        case 'StringCallExpression':
            getReturnTypes();
        default:
            r = searchField(typeList, name);
            return r.v || unkown_t
    }
}
