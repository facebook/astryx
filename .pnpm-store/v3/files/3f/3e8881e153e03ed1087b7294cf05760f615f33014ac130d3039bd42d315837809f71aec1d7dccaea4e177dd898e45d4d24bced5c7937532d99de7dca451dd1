"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generateRTL;
var _postcssValueParser = _interopRequireDefault(require("postcss-value-parser"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const cursorFlip = {
  'e-resize': 'w-resize',
  'w-resize': 'e-resize',
  'ne-resize': 'nw-resize',
  'nesw-resize': 'nwse-resize',
  'nw-resize': 'ne-resize',
  'nwse-resize': 'nesw-resize',
  'se-resize': 'sw-resize',
  'sw-resize': 'se-resize'
};
function splitByDivisor(value) {
  const ast = (0, _postcssValueParser.default)(value);
  const groups = [];
  let currGroup = [];
  function push() {
    if (currGroup.length === 0) {
      return;
    }
    groups.push(_postcssValueParser.default.stringify(currGroup));
    currGroup = [];
  }
  for (const node of ast.nodes) {
    if (node.type === 'div') {
      push();
    } else {
      currGroup.push(node);
    }
  }
  push();
  return groups;
}
function flipSign(value) {
  if (value === '0') {
    return value;
  } else {
    return value[0] === '-' ? value.slice(1) : '-' + value;
  }
}
function flipShadow(value) {
  const defs = splitByDivisor(value);
  const builtDefs = [];
  for (const def of defs) {
    const parts = def.split(' ');
    const index = _postcssValueParser.default.unit(parts[0]) === false ? 1 : 0;
    if (index < parts.length) {
      parts[index] = flipSign(parts[index]);
    }
    builtDefs.push(parts.join(' '));
  }
  const rtl = builtDefs.join(', ');
  if (rtl !== value) {
    return rtl;
  }
}
const logicalToPhysical = {
  start: 'right',
  end: 'left'
};
const propertyToRTL = {
  'margin-start': _ref => {
    let [_key, val] = _ref;
    return ['margin-right', val];
  },
  'margin-end': _ref2 => {
    let [_key, val] = _ref2;
    return ['margin-left', val];
  },
  'padding-start': _ref3 => {
    let [_key, val] = _ref3;
    return ['padding-right', val];
  },
  'padding-end': _ref4 => {
    let [_key, val] = _ref4;
    return ['padding-left', val];
  },
  'border-start': _ref5 => {
    let [_key, val] = _ref5;
    return ['border-right', val];
  },
  'border-end': _ref6 => {
    let [_key, val] = _ref6;
    return ['border-left', val];
  },
  'border-start-width': _ref7 => {
    let [_key, val] = _ref7;
    return ['border-right-width', val];
  },
  'border-end-width': _ref8 => {
    let [_key, val] = _ref8;
    return ['border-left-width', val];
  },
  'border-start-color': _ref9 => {
    let [_key, val] = _ref9;
    return ['border-right-color', val];
  },
  'border-end-color': _ref10 => {
    let [_key, val] = _ref10;
    return ['border-left-color', val];
  },
  'border-start-style': _ref11 => {
    let [_key, val] = _ref11;
    return ['border-right-style', val];
  },
  'border-end-style': _ref12 => {
    let [_key, val] = _ref12;
    return ['border-left-style', val];
  },
  'border-top-start-radius': _ref13 => {
    let [_key, val] = _ref13;
    return ['border-top-right-radius', val];
  },
  'border-bottom-start-radius': _ref14 => {
    let [_key, val] = _ref14;
    return ['border-bottom-right-radius', val];
  },
  'border-top-end-radius': _ref15 => {
    let [_key, val] = _ref15;
    return ['border-top-left-radius', val];
  },
  'border-bottom-end-radius': _ref16 => {
    let [_key, val] = _ref16;
    return ['border-bottom-left-radius', val];
  },
  float: _ref17 => {
    let [key, val] = _ref17;
    return logicalToPhysical[val] != null ? [key, logicalToPhysical[val]] : null;
  },
  clear: _ref18 => {
    let [key, val] = _ref18;
    return logicalToPhysical[val] != null ? [key, logicalToPhysical[val]] : null;
  },
  start: _ref19 => {
    let [_key, val] = _ref19;
    return ['right', val];
  },
  end: _ref20 => {
    let [_key, val] = _ref20;
    return ['left', val];
  },
  'background-position': _ref21 => {
    let [key, val] = _ref21;
    const words = val.split(' ');
    if (!words.includes('start') && !words.includes('end')) {
      return null;
    }
    return [key, words.map(word => word === 'start' ? 'right' : word === 'end' ? 'left' : word).join(' ')];
  },
  cursor: _ref22 => {
    let [key, val] = _ref22;
    return cursorFlip[val] != null ? [key, cursorFlip[val]] : null;
  },
  'box-shadow': _ref23 => {
    let [key, val] = _ref23;
    const rtlVal = flipShadow(val);
    return rtlVal ? [key, rtlVal] : null;
  },
  'text-shadow': _ref24 => {
    let [key, val] = _ref24;
    const rtlVal = flipShadow(val);
    return rtlVal ? [key, rtlVal] : null;
  }
};
function generateRTL(_ref25) {
  let [key, value] = _ref25;
  if (propertyToRTL[key]) {
    return propertyToRTL[key]([key, value]);
  }
  return null;
}