'use strict';

const { LuaTypes } = require('./../engine/lua-types');

function setMetatable(tbl, metatbl) {
    if (LuaTypes.isTable(tbl) && LuaTypes.isTable(metatbl.__index)) {
        tbl.metatable = metatbl;
    }

    return tbl;
}

function getMetatable(tbl) {
    return tbl && tbl.metatable;
}

function searchField(tbl, name) {
    const search = (t, n) => {
        if (!t) {
            return {};
        }

        const v = t.fields[n];
        if (v) {
            return { t, v };
        }

        const mt = getMetatable(t);
        if (!mt) {
            return {};
        }

        return search(mt.__index, n);
    }
    return search(tbl, name);
}

const anonymous = '<anonymous>'
function safeName(ident) {
    if (ident) {
        return ident.name || safeName(ident.identifier);
    } else {
        return anonymous;
    }
}

function baseName(ident) {
    if (ident && ident.base) {
        return ident.base.name;
    } else {
        return null;
    }
}

module.exports = {
    setMetatable,
    getMetatable,
    searchField,
    safeName,
    baseName
};
