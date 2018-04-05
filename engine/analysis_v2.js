'use strict';

const path = require('path')
const fs = require('fs')
const luaparse = require('luaparse');
const { LuaTypes } = require('./lua-types');
const { LuaScope, LuaSymbol, LuaFunction, LuaModule } = require('./lua-symbol');
const { deduce, newType } = require('./type-deduce');
const { getMetatable, setMetatable, searchField, safeName, baseName } = require('./utils_v2');

// _G
let global = new LuaTypes.table();

/**
 * Analysis adapt to luaparse
*/
function analysis(code, uri, name) {
    let moduleType = new LuaTypes.module();
    let typeList = global;
    let luaModule = new LuaModule(moduleType, name, [0, code.length + 1], uri);
    let scopeStack = [];
    let lastScope = null;
    let currentScope = [];

    const isPlaceHolder = (name) => {
        return name === '_';
    }

    const isInitWithNil = (init) => {
        return !init || init.name === 'nil';
    }

    const parseDependence = (node, param) => {
        if (param.type !== 'StringLiteral') {
            return;
        }

        let mname = param.value.match(/\w+$/)[0];
        // let mnode = {
        //     type: 'CallExpression',
        //     name: mname,
        //     shortPath: param.value.replace(/\./g, path.sep)
        // }

        let type = newType(global, node);
        let symbol = new LuaSymbol(type, mname, true, node.range, uri);
        currentScope.push(symbol);
        global.addField(type, mname);
    }

    const onCreateNode = (node) => {
        switch (node.type) {
            case 'AssignmentStatement':
                node.variables.forEach((variable, index) => {
                    let name = variable.name;
                    if (isPlaceHolder(name)) {
                        return;
                    }

                    let init = node.init[index];
                    if (isInitWithNil(init)) {
                        return;
                    }

                    let { t, v } = searchField(typeList, name);
                    t = t || typeList;
                    let type = v || newType(typeList, init);
                    let symbol = new LuaSymbol(type, name, false, node.range, uri);

                    currentScope.push(symbol);
                    t.addField(type, name);
                });

                break;
            case 'LocalStatement':
                node.variables.forEach((variable, index) => {
                    let name = variable.name;
                    if (isPlaceHolder(name)) {
                        return;
                    }

                    let init = node.init[index];
                    if (isInitWithNil(init)) {
                        return;
                    }

                    let type = newType(typeList, init);
                    let symbol = new LuaSymbol(type, name, true, node.range, uri);

                    currentScope.push(symbol);
                    typeList.addField(type, name);
                });
                break;
            case 'FunctionDeclaration':
                const type = newType(typeList, node);
                const name = safeName(node.identifier);
                const func = new LuaFunction(type, name, node.isLocal, node.range, node.range, uri);
                func.scopeSymbols = lastScope;

                const bName = baseName(node.identifier);
                if (bName) {
                    let { t, v } = searchField(typeList, bName);
                    if (v) {
                        v = deduce(t, v, bName);
                        if (LuaTypes.isTable(v)) {
                            v.addField(type, name);
                        }
                    } else {
                        //TODO: add definition as global?
                    }
                } else {
                    currentScope.push(func);
                    typeList.fields[name] = type;
                }

                break;
            case 'Chunk':
                luaModule.scopeSymbols = lastScope;
                global.addField(luaModule, luaModule.name);
            case 'CallExpression':  //in module mode(Lua_5.1)
            case 'StringCallExpression':
                let fname = safeName(node.base);
                if (fname === 'module') {
                    let mname = (node.argument || node.arguments[0]).value;
                    luaModule.name = mname;
                    luaModule.moduleMode = true;
                } else if (fname === 'require') {
                    let param = (node.argument || node.arguments[0]);
                    parseDependence(fname, param);
                } else if (fname === 'pcall' && node.arguments[0].value === 'require') {
                    parseDependence(fname, node.arguments[1]);
                }
            default:
                break;
        }
    };

    const onCreateScope = () => {
        scopeStack.push(currentScope);
        lastScope = currentScope;
        currentScope = [];

        typeList = setMetatable(new LuaTypes.table(), { __index: typeList });
    };

    const onDestroyScope = () => {
        lastScope = currentScope;
        currentScope = scopeStack.pop();

        let mt = getMetatable(typeList);
        typeList = mt && mt.__index;
    };

    luaparse.parse(code.toString('utf8'), {
        comments: false,
        scope: true,
        locations: true,
        ranges: true,
        onCreateNode: onCreateNode,
        onCreateScope: onCreateScope,
        onDestroyScope: onDestroyScope,
    });

    return luaModule;
}

//tester
fs.readFile('./test/textures/test01.lua', (err, data) => {
    // let global = new LuaTypes.table();
    let mod = analysis(data, './test/textures/test01.lua');
    console.log(global);
    console.log(global.fields['drv_base']);
    // console.log(deduce(global, mod.type.exports.fields));
    // console.log(deduce(mod.type.exports, mod.type.exports.fields['x'], 'x'));
    // console.log(deduce(mod.type.exports, mod.type.exports.fields['y'], 'y'));
    // console.log(deduce(mod.type.exports.fields['x'], mod.type.exports.fields['x'].fields['abc']));
    // console.log(mod.type);
    // console.log(deduce(null, mod.scopeSymbols[0].type, mod.scopeSymbols[0].name));
});


