"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortPseudos = exports.sortAtRules = void 0;
var _objectUtils = require("./object-utils");
const sortPseudos = pseudos => {
  if (pseudos.length < 2) {
    return pseudos;
  }
  return pseudos.reduce((acc, pseudo) => {
    if (pseudo.startsWith('::')) {
      return [...acc, pseudo];
    }
    const lastElement = acc[acc.length - 1];
    const allButLast = acc.slice(0, acc.length - 1);
    if (Array.isArray(lastElement)) {
      return [...allButLast, [...lastElement, pseudo]];
    } else {
      return [...allButLast, lastElement, [pseudo]].filter(Boolean);
    }
  }, []).flatMap(pseudo => {
    if (Array.isArray(pseudo)) {
      return (0, _objectUtils.arraySort)(pseudo, stringComparator);
    }
    return [pseudo];
  });
};
exports.sortPseudos = sortPseudos;
const sortAtRules = atRules => (0, _objectUtils.arraySort)(atRules);
exports.sortAtRules = sortAtRules;
const stringComparator = (a, b) => {
  if (a === 'default') {
    return -1;
  }
  if (b === 'default') {
    return 1;
  }
  return a.localeCompare(b);
};