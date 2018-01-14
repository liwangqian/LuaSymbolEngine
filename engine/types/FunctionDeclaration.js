'use strict';

const traits_1 = require('../traits');
const symbol_1 = require('../symbol');
const utils_1 = require('../utils');

exports.parse = (walker, prevSymbol, node, scope) => {
    let name = utils_1.safeName(node);
    let func = new symbol_1.Symbol(name, traits_1.SymbolKind.function, walker.uri);
    func.isLocal = utils_1.isLocal(node);
    func.value = [];
    func.symbols = [];

    //function xxx(xx,yy) end
    if (name) {
        func.location = utils_1.getLocation(node);
        let parent = walker.parentSymbol();
        let baseName = utils_1.safeName(node.identifier.base);
        if (baseName) {
            parent = walker.findSymbol(baseName);
            parent && parent.setValue(func);
        } else {
            parent.addSymbol(func);
        }
    } else {
        func.location = prevSymbol.location;
        prevSymbol.setValue(func);
    }
    func.scope = utils_1.getScope(func.location, scope);

    walker.push(func);
    walker.enterScope(func);

    let params = new symbol_1.Symbol();
    params.value = [];
    walker.walkNodes(params, node.parameters, node.loc, true);
    func.params = params.value;

    walker.walkNodes(func, node.body, node.loc);
    walker.exitScope();
}