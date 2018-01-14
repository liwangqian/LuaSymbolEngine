'use strict';

const traits_1 = require('../traits');
const symbol_1 = require('../symbol');
const utils_1 = require('../utils');

exports.parse = (walker, prevSymbol, node, scope) => {
    let tbl = new symbol_1.Symbol(utils_1.safeName(node), traits_1.SymbolKind.class, walker.uri);
    tbl.isLocal = utils_1.isLocal(node);
    tbl.location = utils_1.getLocation(node);
    tbl.scope = { start: symbol.location.start, end: scope.end };

    walker.push(tbl);

    if (!tbl.name) {
        prevSymbol.setValue(tbl);
    } else {
        walker.parentSymbol().addSymbol(tbl);
    }

    walker.enterScope(tbl);
    walker.walkNodes(tbl, node.fields, node.loc);
    walker.exitScope();
}