"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = styleXCreateSet;
var _defaultOptions = require("./utils/default-options");
var _flattenRawStyleObj = require("./preprocess-rules/flatten-raw-style-obj");
var _basicValidation = require("./preprocess-rules/basic-validation");
function styleXCreateSet(namespaces) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultOptions.defaultOptions;
  const resolvedNamespaces = {};
  const injectedStyles = {};
  const namespaceToClassPaths = {};
  for (const namespaceName of Object.keys(namespaces)) {
    const namespace = namespaces[namespaceName];
    const classPathsInNamespace = {};
    (0, _basicValidation.validateNamespace)(namespace);
    const seenProperties = new Set();
    const flattenedNamespace = (0, _flattenRawStyleObj.flattenRawStyleObject)(namespace, options).reduceRight((arr, curr) => {
      if (seenProperties.has(curr[0])) {
        return arr;
      }
      seenProperties.add(curr[0]);
      arr.unshift(curr);
      return arr;
    }, []);
    const compiledNamespaceTuples = flattenedNamespace.map(_ref => {
      let [key, value] = _ref;
      return [key, value.compiled(options)];
    });
    const namespaceObj = {};
    for (const [key, value] of compiledNamespaceTuples) {
      const classNameTuples = value.map(v => Array.isArray(v) ? v : null).filter(Boolean);
      classNameTuples.forEach(_ref2 => {
        let [_className, _, classesToOriginalPath] = _ref2;
        Object.assign(classPathsInNamespace, classesToOriginalPath);
      });
      const className = classNameTuples.map(_ref3 => {
        let [className] = _ref3;
        return className;
      }).join(' ') || null;
      namespaceObj[key] = className;
      for (const [className, injectable] of classNameTuples) {
        if (injectedStyles[className] == null) {
          injectedStyles[className] = injectable;
        }
      }
    }
    resolvedNamespaces[namespaceName] = {
      ...namespaceObj,
      $$css: true
    };
    namespaceToClassPaths[namespaceName] = classPathsInNamespace;
  }
  return [resolvedNamespaces, injectedStyles, namespaceToClassPaths];
}