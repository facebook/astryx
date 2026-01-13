"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = stylexFirstThatWorks;
const isVar = arg => typeof arg === 'string' && arg.match(/^var\(--[a-zA-Z0-9-_]+\)$/);
function stylexFirstThatWorks() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  const firstVar = args.findIndex(isVar);
  if (firstVar === -1) {
    return [...args].reverse();
  }
  const priorities = args.slice(0, firstVar).reverse();
  const rest = args.slice(firstVar);
  const firstNonVar = rest.findIndex(arg => !isVar(arg));
  const varParts = rest.slice(0, firstNonVar === -1 ? rest.length : firstNonVar + 1).reverse();
  const vars = varParts.map(arg => isVar(arg) ? arg.slice(4, -1) : arg);
  const returnValue = [vars.reduce((soFar, varName) => soFar ? `var(${varName}, ${String(soFar)})` : varName.startsWith('--') ? `var(${varName})` : varName, ''), ...priorities];
  if (returnValue.length === 1) {
    return returnValue[0];
  }
  return returnValue;
}