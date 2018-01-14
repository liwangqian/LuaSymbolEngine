'use strict';

const traits_1 = require('./traits');

class Symbol {
    constructor(name, kind, uri) {
        this.name = name;
        this.kind = kind;
        this.uri = uri;
        this.value = undefined;
        this.isLocal = true;
        this.location = undefined;
        this.scope = undefined;
        this.symbols = undefined;
        this.references = undefined;
        this.params = undefined; //for function
    }

    addSymbol(symbol) {
        // a class(table) has only properties as it's value
        // if (this.kind === traits_1.SymbolKind.class) {
        //     this.value.push(symbol);
        //     return;
        // }

        // // a global symbol in module is exported.
        // if (this.kind === traits_1.SymbolKind.module && !symbol.isLocal) {
        //     this.value.push(symbol);
        // }

        // only module or function will reach here
        this.symbols.push(symbol);
    }

    setValue(symbol) {
        if (!this.value) {
            this.value = symbol;
        } else if (Array.isArray(this.value)) {
            this.value.push(symbol);
        }
    }

    addReference(reference) {
        // for simplity, all references are stored in module
        if (this.kind === traits_1.SymbolKind.module) {
            this.references.push(reference);
        }
    }
};

exports.Symbol = Symbol;
