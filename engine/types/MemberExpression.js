'use strict';

const utils_1 = require('../utils');
const traits_1 = require('../traits');
const symbol_1 = require('../symbol');

exports.parse = (walker, prevSymbol, node, scope, isdef) => {
    let name = utils_1.safeName(node.identifier);
    let baseName = utils_1.safeName(node.base);
}