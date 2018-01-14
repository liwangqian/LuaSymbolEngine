'use strict';

class Stack {
    constructor() {
        this.reset();
    }

    reset() {
        this.symbols = [];
        this.parents = [];
        this.scopeIndex = [];
        this.maxNestDepth = 0;
        this.nestDepth = 0;
        this.cachedSymbol = undefined;
    }

    enterScope(symbol) {
        this.parents.push(symbol);
        this.scopeIndex.push(this.symbols.length);
        this.nestDepth++;
    }

    exitScope() {
        let scopeIndex = this.scopeIndex.pop();
        this.symbols.splice(scopeIndex, this.symbols.length - scopeIndex);
        this.maxNestDepth = Math.max(this.maxNestDepth, this.nestDepth);
        this.nestDepth--;

        this.parents.pop();
    }

    push(symbol) {
        this.symbols.push(symbol);
    }

    parentSymbol() {
        return this.parents[this.parents.length - 1];
    }

    findSymbol(name) {
        if (this.cachedSymbol && this.cachedSymbol.name === name) {
            return this.cachedSymbol;
        }

        //iterate from back
        for (let i = this.symbols.length - 1; i >= 0; i--) {
            const symbol = this.symbols[i];
            if (symbol.name === name) {
                this.cachedSymbol = symbol;
                return symbol;
            }
        }

        return undefined;
    }
};

exports.Stack = Stack;
