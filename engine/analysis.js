'use strict';

const luaparse_1 = require('luaparse');
const walker_1 = require('./walker');
const types_1 = require('./types');

const defaultOptions = {
    locations: true,
    scope: true,
    comments: false,
    luaversion: 5.1,
    allowDefined: true
}

function mergeOption(option) {
    let mergedOption = {};
    for (const key in defaultOptions) {
        mergedOption[key] = option[key] || defaultOptions[key];
    }

    return mergedOption;
}

function analysisFile(uri, content, options, logger) {
    let node = luaparse_1.parse(content.toString(), mergeOption(options));
    let walker = new walker_1.Walker(types_1.get({}), { allowDefined: true }, logger);
    walker.processDocument(node, uri);
    return walker.root;
}

exports.analysisFile = analysisFile;