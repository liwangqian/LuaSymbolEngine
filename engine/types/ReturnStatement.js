'use strict';

const traits_1 = require('../traits');
const symbol_1 = require('../symbol');
const utils_1 = require('../utils');

exports.parse = (walker, prevSymbol, node, scope) => {
    let parent = walker.parentSymbol();
    let group = new symbol_1.Symbol();
    group.value = [];
    walker.walkNodes(group, node.arguments, scope);
    parent.setValue(group.value);
}