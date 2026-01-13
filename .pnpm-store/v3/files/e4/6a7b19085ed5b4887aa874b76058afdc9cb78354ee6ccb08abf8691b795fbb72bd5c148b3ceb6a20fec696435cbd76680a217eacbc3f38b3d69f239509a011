"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arraySort = exports.arrayEquals = exports.Pipe = void 0;
exports.flattenObject = flattenObject;
exports.isPlainObject = isPlainObject;
exports.objEntries = objEntries;
exports.objFromEntries = objFromEntries;
exports.objMap = objMap;
exports.objMapEntry = objMapEntry;
exports.objMapKeys = objMapKeys;
exports.objValues = objValues;
function isPlainObject(obj) {
  return typeof obj === 'object' && obj != null && !Array.isArray(obj) && obj?.constructor === Object;
}
function flattenObject(obj) {
  const result = {};
  for (const [key, value] of objEntries(obj)) {
    if (typeof value === 'string' || value == null) {
      result[key] = value;
    } else {
      for (const [subKey, subValue] of objEntries(value)) {
        result[`${key}_${subKey}`] = subValue;
      }
    }
  }
  return result;
}
function objEntries(obj) {
  const retVal = [];
  for (const key of Object.keys(obj)) {
    retVal.push([key, obj[key]]);
  }
  return retVal;
}
function objValues(obj) {
  const retVal = [];
  for (const key of Object.keys(obj)) {
    retVal.push(obj[key]);
  }
  return retVal;
}
function objFromEntries(entries) {
  const retVal = {};
  for (const [key, value] of entries) {
    retVal[key] = value;
  }
  return retVal;
}
function objMapKeys(obj, mapper) {
  return objFromEntries(objEntries(obj).map(_ref => {
    let [key, value] = _ref;
    return [mapper(key), value];
  }));
}
function objMapEntry(obj, mapper) {
  return objFromEntries(objEntries(obj).map(_ref2 => {
    let [key, value] = _ref2;
    return mapper([key, value]);
  }));
}
function objMap(obj, mapper) {
  return objFromEntries(objEntries(obj).map(_ref3 => {
    let [key, value] = _ref3;
    return [key, mapper(value, key)];
  }));
}
class Pipe {
  constructor(val) {
    this.value = val;
  }
  pipe(mapper) {
    return new Pipe(mapper(this.value));
  }
  done() {
    return this.value;
  }
  static create(val) {
    return new Pipe(val);
  }
}
exports.Pipe = Pipe;
const arraySort = (arr, fn) => [...arr].sort(fn);
exports.arraySort = arraySort;
const arrayEquals = function (arr1, arr2) {
  let equals = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (a, b) => a === b;
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (!equals(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
};
exports.arrayEquals = arrayEquals;