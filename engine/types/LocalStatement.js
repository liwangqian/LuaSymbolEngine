'use strict';

const symbol_1 = require('../symbol');
const traits_1 = require('../traits');
const utils_1 = require('../utils');

exports.parse = (walker, prevSymbol, node, scope) => {
    return parseNode(walker, prevSymbol, node, scope);
}

function parseNode(walker, prevSymbol, node, scope) {
    let parent = walker.parentSymbol();
    for (let i = 0; i < node.variables.length; i++) {
        let variable = node.variables[i];
        let symbol = new symbol_1.Symbol(utils_1.safeName(variable));
        symbol.isLocal = true;
        symbol.uri = walker.uri;
        symbol.location = utils_1.getLocation(variable);
        symbol.scope = { start: symbol.location.start, end: scope.end };

        walker.push(symbol); // push in stack

        let init = node.init && node.init[i];
        if (init) {
            if (init.type === 'TableConstructorExpression') {
                symbol.kind = traits_1.SymbolKind.class;
                symbol.value = [];
                walker.enterScope(symbol);
                walker.walkNodes(symbol, init.fields, scope);
                walker.exitScope();
            } else if (init.type === 'FunctionDeclaration') {
                symbol.kind = traits_1.SymbolKind.function;
                walker.walkNode(symbol, init, scope);
            } else if (init.type === 'NumericLiteral') {
                symbol.kind = traits_1.SymbolKind.number;
            } else if (init.type === 'StringLiteral') {
                symbol.kind = traits_1.SymbolKind.string;
            } else if (init.type === 'BooleanLiteral') {
                symbol.kind = traits_1.SymbolKind.bool;
            } else {
                symbol.kind = traits_1.SymbolKind.any;
                symbol.value = walker.walkNode(symbol, init, scope);
            }
        } else {
            symbol.kind = traits_1.SymbolKind.any;
        }

        parent.addSymbol(symbol);
    }
}

