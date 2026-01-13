"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generateLTR;
const logicalToPhysical = {
  start: 'left',
  end: 'right'
};
const propertyToLTR = {
  'margin-start': _ref => {
    let [_key, val] = _ref;
    return ['margin-left', val];
  },
  'margin-end': _ref2 => {
    let [_key, val] = _ref2;
    return ['margin-right', val];
  },
  'padding-start': _ref3 => {
    let [_key, val] = _ref3;
    return ['padding-left', val];
  },
  'padding-end': _ref4 => {
    let [_key, val] = _ref4;
    return ['padding-right', val];
  },
  'border-start': _ref5 => {
    let [_key, val] = _ref5;
    return ['border-left', val];
  },
  'border-end': _ref6 => {
    let [_key, val] = _ref6;
    return ['border-right', val];
  },
  'border-start-width': _ref7 => {
    let [_key, val] = _ref7;
    return ['border-left-width', val];
  },
  'border-end-width': _ref8 => {
    let [_key, val] = _ref8;
    return ['border-right-width', val];
  },
  'border-start-color': _ref9 => {
    let [_key, val] = _ref9;
    return ['border-left-color', val];
  },
  'border-end-color': _ref10 => {
    let [_key, val] = _ref10;
    return ['border-right-color', val];
  },
  'border-start-style': _ref11 => {
    let [_key, val] = _ref11;
    return ['border-left-style', val];
  },
  'border-end-style': _ref12 => {
    let [_key, val] = _ref12;
    return ['border-right-style', val];
  },
  'border-top-start-radius': _ref13 => {
    let [_key, val] = _ref13;
    return ['border-top-left-radius', val];
  },
  'border-bottom-start-radius': _ref14 => {
    let [_key, val] = _ref14;
    return ['border-bottom-left-radius', val];
  },
  'border-top-end-radius': _ref15 => {
    let [_key, val] = _ref15;
    return ['border-top-right-radius', val];
  },
  'border-bottom-end-radius': _ref16 => {
    let [_key, val] = _ref16;
    return ['border-bottom-right-radius', val];
  },
  float: _ref17 => {
    let [key, val] = _ref17;
    return [key, logicalToPhysical[val] ?? val];
  },
  clear: _ref18 => {
    let [key, val] = _ref18;
    return [key, logicalToPhysical[val] ?? val];
  },
  start: _ref19 => {
    let [_key, val] = _ref19;
    return ['left', val];
  },
  end: _ref20 => {
    let [_key, val] = _ref20;
    return ['right', val];
  },
  'background-position': _ref21 => {
    let [key, val] = _ref21;
    return [key, val.split(' ').map(word => word === 'start' ? 'left' : word === 'end' ? 'right' : word).join(' ')];
  }
};
function generateLTR(pair) {
  const [key] = pair;
  if (propertyToLTR[key]) {
    return propertyToLTR[key](pair);
  }
  return pair;
}