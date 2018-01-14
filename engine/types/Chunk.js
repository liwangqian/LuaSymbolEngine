'use strict';

var utils = require('../utils');

exports.parse = (walker, prevSymbol, node, scope, isdef) => {
    walker.enterScope(walker.root);
    walker.walkNodes(node, node.body, node.loc, isdef);
    walker.exitScope();
}