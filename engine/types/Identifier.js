'use strict';

const utils_1 = require('../utils');
const traits_1 = require('../traits');
const symbol_1 = require('../symbol');

exports.parse = (walker, prevSymbol, node, scope, isdef) => {
    // prevSymbol.kind = traits_1.SymbolKind.any;
    //find definition and assign to prevSymbol
    let name = utils_1.safeName(node);
    if (isdef) {
        let symbol = new symbol_1.Symbol(name, traits_1.SymbolKind.any, walker.uri);
        symbol.isLocal = utils_1.isLocal(node);
        symbol.location = utils_1.getLocation(node);
        symbol.scope = utils_1.getScope(symbol.location, scope);

        let parent = walker.parentSymbol();
        parent.addSymbol(symbol);
        prevSymbol.setValue(symbol);

        walker.push(symbol);
    } else {
        let def = walker.findSymbol(name);
        if (def) {
            prevSymbol.setValue(def);
        }
    }

}