'use strict';

const fs_1 = require("fs");
const analysis_1 = require('../engine/analysis');

// var fileName = "./test/textures/test01.lua";
// fs_1.readFile(fileName, (err, data) => {
//     console.log(err);

//     let result = analysis_1.analysisFile(fileName, data, {}, console.log);

//     fs_1.writeFile("./test/textures/test01.json", JSON.stringify(result, null, 2), (e) => { });
// });

// console.log(Array.prototype.concat([], ...[[1, 2, 3], [4, 5, 6]]));


function crawlAndRevive(typeDef, namedTypes, setter) {
    if (!typeDef) { return }
    switch (typeDef.type) {
        case 'ref':
            setter(namedTypes[typeDef.name])
            break
        case 'table':
            crawlAndRevive(typeDef.metatable, namedTypes, v => { typeDef.metatable = v })
            for (let key in typeDef.fields) {
                crawlAndRevive(typeDef.fields[key], namedTypes, v => { typeDef.fields[key] = v })
            }
            break
        case 'function':
            if (typeDef.argTypes) {
                typeDef.argTypes.forEach((argType, index) => {
                    crawlAndRevive(argType, namedTypes, v => { typeDef.argTypes[index] = v })
                })
            }
            if (typeDef.returnTypes) {
                typeDef.returnTypes.forEach((retType, index) => {
                    crawlAndRevive(retType, namedTypes, v => { typeDef.returnTypes[index] = v })
                })
            }
            break
    }
}

function reviveOptions(options) {
    if (!options || !options.namedTypes) { return options }
    let namedTypes = options.namedTypes
    crawlAndRevive(options.global, namedTypes, v => { options.global = v })
    for (let key in namedTypes) {
        crawlAndRevive(namedTypes[key], namedTypes, v => { namedTypes[key] = v })
    }
    delete options.namedTypes
    return options
}

// const lua_5_1 = require("./5_1.json")
// console.log(reviveOptions(lua_5_1))

const { LuaTypes } = require('./../engine/lua-types');
// const t = new LuaTypes.table();
// console.log(t);
// const f = new LuaTypes.function();
//console.log(f);
// console.log(LuaTypes);
// LuaTypes.__run_test();

const { LuaScope, LuaSymbol, LuaFunction, LuaModule, LuaTable } = require('./../engine/lua-symbol');
// const sym = new LuaSymbol('table', 'CPubApi', {}, '//file:sss');
// console.log(sym);

const luaparser = require('luaparse');

const moduleSym = new LuaModule('test01', {}, './test/textures/test01');
const stack = [];
let namedTypes = {};
let scopeSymbols = [];
let lastScope = null;
let currentScope = [];

const unkown_t = new LuaTypes.unknown();
const number_t = new LuaTypes.number();
const string_t = new LuaTypes.string();
const boolean_t = new LuaTypes.boolean();

const deduce = (type, name, returnTypes = []) => {
    if (type instanceof LazyTypeOf) {
        return type.deduce(name, returnTypes);
    } else {
        return type;
    }
}

const typeOf = (typeList, node, name, returnTypes = []) => {
    if (!node) {
        return;
    }
    switch (node.type) {
        case 'Identifier': return typeList[node.name] || unkown_t;
        case 'NumericLiteral': return number_t;
        case 'StringLiteral': return string_t;
        case 'BooleanLiteral': return boolean_t;
        case 'TableConstructorExpression':
            let type = typeList[name];
            if (type) {
                return type;
            }

            let t = new LuaTypes.table();
            node.fields.forEach((field, index) => {
                if (field.type == 'TableKeyString') {
                    t.fields[field.key.name] = typeOf(typeList, field.value, field.key.name);
                }
            });
            return t;
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
        default: return typeList[name] || unkown_t;
    }
}

class LazyTypeOf {
    constructor(typeList, node) {
        this.typeList = typeList;
        this.node = node;
    }

    deduce(name, returnTypes = []) {
        return typeOf(this.typeList, this.node, name, returnTypes);
    }
};

const onCreateNode = (node) => {
    console.log('>>>>>>>onCreateNode<<<<<<<')
    console.log(node);
    if (node.type == 'LocalStatement') {
        node.variables.forEach((variable, index) => {
            const type = new LazyTypeOf(namedTypes, node.init[index]);
            const sym = new LuaSymbol(type, variable.name, {}, '');
            currentScope.push(sym);
            namedTypes[variable.name] = type;
        });
    } else if (node.type == 'FunctionDeclaration') {
        const name = node.identifier ? node.identifier.name : null;
        const type = new LazyTypeOf(namedTypes, node, name);
        const sym = new LuaSymbol(type, name, {}, '');
        currentScope.push(sym);
        namedTypes[name] = type;
        sym.scopeSymbols = lastScope;
    } else if (node.type == 'Chunk') {
        moduleSym.scopeSymbols = lastScope;
    }
};

const onCreateScope = () => {
    console.log('<<<<<<<<<new scope>>>>>>>>');
    stack.push(currentScope);
    lastScope = currentScope;
    currentScope = [];
    // lastScope.push(currentScope);
};

const onDestroyScope = () => {
    console.log('=========exit scope========');
    lastScope = currentScope;
    currentScope = stack.pop();
};


fs_1.readFile('./test/textures/test01.lua', (err, data) => {
    console.log(err);
    const ast = luaparser.parse(data.toString('utf8'), {
        scope: true,
        onCreateNode: onCreateNode,
        onCreateScope: onCreateScope,
        onDestroyScope: onDestroyScope,
    });

    // console.log(ast);
    let abc = moduleSym.scopeSymbols[0];
    let type = deduce(abc.type, abc.name);
    console.log(deduce(type.returnTypes[0]));
    // console.log(JSON.stringify(moduleSym.scopeSymbols[0], null, 2));
    // console.log(moduleSym.scopeSymbols);
    // console.log(moduleSym.scopeSymbols[4]);
});

