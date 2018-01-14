'use strict';

const traits_1 = require('../traits');

exports.parse = (walker, prevSymbol, node, scope, isdef) => {
    prevSymbol.kind = traits_1.SymbolKind.bool;
}