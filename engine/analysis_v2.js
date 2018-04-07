'use strict';

const path = require('path')
const fs = require('fs')
const luaparse = require('luaparse');
const { LuaSymbol, LuaTable, LuaFunction, LuaModule, LuaScope, BasicTypes } = require('./typedef');
const { typeOf } = require('./typeof');
const { identName, baseName, safeName } = require('./utils_v2');

// _G
let _G = new LuaSymbol(new LuaTable(null), '_G', false, null);

/**
 * Analysis adapt to luaparse
*/
function analysis(code, uri, name) {
    let moduleType = new LuaModule([0, code.length + 1], _G.type, uri);
    let theModule = new LuaSymbol(moduleType, null, false, null);
    let lastScope = null;
    let currentScope = null;

    function isPlaceHolder(name) {
        return name === '_';
    }

    function isInitWithNil(init) {
        return !init || init.name === 'nil';
    }

    function parseDependence(node, param) {
        if (param.type !== 'StringLiteral') {
            return;
        }

        let mname = param.value.match(/\w+$/)[0];
        let type = typeOf(currentScope, node);
        let symbol = new LuaSymbol(type, mname, true, node.range, uri);
        currentScope.setField(mname, symbol);
        moduleType.addDepend(mname, symbol);
    }

    function parseLocalStatement(node) {
        node.variables.forEach((variable, index) => {
            let name = variable.name;
            if (isPlaceHolder(name)) {
                return;
            }

            let init = node.init[index];
            if (isInitWithNil(init)) {
                return;
            }

            let type = typeOf(currentScope, init, safeName(init));
            let symbol = new LuaSymbol(type, name, true, variable.range);

            currentScope.setField(name, symbol);

            walkNode(init);
        });
    }

    function parseAssignmentStatement(node) {
        node.variables.forEach((variable, index) => {
            let name = variable.name;
            if (isPlaceHolder(name)) {
                return;
            }

            let init = node.init[index];
            if (isInitWithNil(init)) {
                return;
            }

            let { table, value } = currentScope.searchField(name);
            if (value) {
                return;
            }

            let type = typeOf(currentScope, init, safeName(init));
            let symbol = new LuaSymbol(type, name, true, variable.range);

            currentScope.setField(name, symbol); //TODO: should define in _G ?

            walkNode(init);
        });
    }

    function parseTableConstructorExpression(node) {
        let name = safeName(node);
        let type = new LuaTable();
        let symbol = new LuaSymbol(type, name, true, node.range);
        currentScope.setField(name, symbol);
        // walkNodes(node.fields);
        node.fields.forEach((field, index) => {
            if (field.type !== 'TableKeyString') {
                return;
            }
            let n = field.key.name;
            let t = typeOf(currentScope, field.value, safeName(field.value));
            let s = new LuaSymbol(t, n, true, field.key.range);
            type.setField(n, s);

            walkNode(field.value);
        });
    }

    function parseFunctionDeclaration(node) {
        let name = identName(node.identifier);
        let range = node.range;
        if (name) {
            range = node.identifier.range;
        } else {
            name = '@(' + range + ')';
        }
        let type = new LuaFunction(range, currentScope);
        let func = new LuaSymbol(type, name, node.isLocal, range);
        let bName = baseName(node.identifier);
        if (bName) {
            let { table, value } = currentScope.searchField(bName);
            if (value && value instanceof LuaTable) {
                value.setField(name, type);
            } else {
                //TODO: add definition as global?
            }
        } else {
            currentScope.setField(name, type);
        }

        currentScope = type.scope;

        node.parameters.forEach((param, index) => {
            let name = param.name || param.value;
            let symbol = new LuaSymbol(BasicTypes.unkown_t, name, true, param.range);
            currentScope.setField(name, symbol);
            type.args[index] = name;
        });

        walkNodes(node.body);
        currentScope = currentScope.parentScope();
    }

    function parseCallExpression(node) {
        let fname = identName(node.base);
        if (fname === 'module') {
            let mname = (node.argument || node.arguments[0]).value;
            theModule.name = mname;
            moduleType.moduleMode = true;
        } else if (fname === 'require') {
            let param = (node.argument || node.arguments[0]);
            parseDependence(node, param);
        } else if (fname === 'pcall' && node.arguments[0].value === 'require') {
            parseDependence(node, node.arguments[1]);
        }
    }

    function parseDoStatement() {
        let scope = new LuaScope(node.body.range, currentScope);
        currentScope = scope;
        walkNodes(node.body);
        currentScope = currentScope.parentScope;
    }

    function walkNodes(nodes) {
        nodes.forEach(walkNode);
    }

    function walkNode(node) {
        switch (node.type) {
            case 'AssignmentStatement':
                parseAssignmentStatement(node);
                break;
            case 'LocalStatement':
                parseLocalStatement(node);
                break;
            case 'TableConstructorExpression':
                parseTableConstructorExpression(node);
                break;
            case 'FunctionDeclaration':
                parseFunctionDeclaration(node);
                break;
            case 'CallStatement':
                walkNode(node.expression);
            case 'CallExpression':  //in module mode(Lua_5.1)
            case 'StringCallExpression':
                parseCallExpression(node);
                break;
            case 'DoStatement':
                parseDoStatement(node);
            case 'Chunk':
                currentScope = moduleType.scope;
                walkNodes(node.body);
                break;

            default:
                break;
        }
    };

    const node = luaparse.parse(code.toString('utf8'), {
        comments: false,
        scope: true,
        ranges: true
    });

    walkNode(node);

    if (theModule.name == null) {
        theModule.name = theModule.type.fileName;
    }
    _G.type.setField(theModule.name, theModule);

    return moduleType;
}

//tester
fs.readFile('./test/textures/test01.lua', (err, data) => {
    let mod = analysis(data, './test/textures/test01.lua');
    console.log(_G);
    console.log(_G.type.fields.get('drv_base'));
    console.log(_G.type.fields.get('drv_base').type.scope.fields.get('x').type.typeOf());
});


