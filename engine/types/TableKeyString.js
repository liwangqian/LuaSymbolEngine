'use strict';

const utils_1 = require('../utils');
const traits_1 = require('../traits');
const symbol_1 = require('../symbol');

exports.parse = (walker, prevSymbol, node, scope, isdef) => {
    let parent = walker.parentSymbol();
    let symbol = new symbol_1.Symbol(utils_1.safeName(node.key), traits_1.SymbolKind.any, walker.uri);
    symbol.isLocal = false;
    symbol.location = utils_1.getLocation(node.key);
    symbol.scope = utils_1.getScope(symbol.location, scope);
    parent.setValue(symbol);

    walker.walkNode(symbol, node.value, scope, isdef);

}