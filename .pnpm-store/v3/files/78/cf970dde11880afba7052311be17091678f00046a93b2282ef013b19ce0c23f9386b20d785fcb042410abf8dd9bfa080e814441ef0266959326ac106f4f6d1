"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = genFileBasedIdentifier;
function genFileBasedIdentifier(_ref) {
  let {
    fileName,
    exportName,
    key
  } = _ref;
  return `${fileName}//${exportName}${key != null ? `.${key}` : ''}`;
}