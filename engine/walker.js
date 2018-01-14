'use strict';

const traits_1 = require('./traits');
const symbol_1 = require('./symbol');
const stack_1 = require('./stack');

class Walker extends stack_1.Stack {
    constructor(types, config, logger) {
        super();

        this.types = types;
        this.config = config;
        this.logger = logger || (() => { });
    }

    processDocument(node, uri) {
        let matches = uri.match(/(\w+)(\.lua)?$/);
        if (!matches) {
            this.logger('[ERROR] The file is not a lua file!');
            return;
        }

        this.uri = uri;
        let fileName = matches[1];
        let scope = node.loc;

        this.root = new symbol_1.Symbol(fileName, traits_1.SymbolKind.file, uri);
        this.root.symbols = [];
        this.root.references = [];
        this.root.value = [];
        this.root.isLocal = false;
        this.root.scope = scope;

        this.parents.push(this.root);

        this.reset();

        this.walkNode(node, node, scope, true);
    }

    walkNode(prevSymbol, node, scope, isdef) {
        let parser = this.types[node.type];
        if (parser) {
            parser(this, prevSymbol, node, scope, isdef);
        } else {
            this.logger('[INFO] No parser for type <' + node.type + '>');
        }
    }

    walkNodes(prevSymbol, nodes, scope, isdef) {
        nodes.forEach(node => {
            this.walkNode(prevSymbol, node, scope, isdef);
        });
    }
};

exports.Walker = Walker;
