'use strict';

var SymbolKind = {};
SymbolKind[SymbolKind['file'] = 0] = 'file';
SymbolKind[SymbolKind['module'] = 1] = 'module';
SymbolKind[SymbolKind['class'] = 2] = 'class';
SymbolKind[SymbolKind['function'] = 3] = 'function';
SymbolKind[SymbolKind['string'] = 4] = 'string';
SymbolKind[SymbolKind['number'] = 5] = 'number';
SymbolKind[SymbolKind['bool'] = 6] = 'bool';
SymbolKind[SymbolKind['any'] = 7] = 'any';

exports.SymbolKind = SymbolKind;