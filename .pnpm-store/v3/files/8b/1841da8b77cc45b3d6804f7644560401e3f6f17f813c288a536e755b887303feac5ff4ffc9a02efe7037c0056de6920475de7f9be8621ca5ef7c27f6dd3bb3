"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PreRuleSet = exports.PreRule = exports.NullPreRule = void 0;
var _convertToClassName = require("../convert-to-className");
var _objectUtils = require("../utils/object-utils");
var _ruleUtils = require("../utils/rule-utils");
class NullPreRule {
  compiled(_options) {
    return [null];
  }
  equals(other) {
    return other instanceof NullPreRule;
  }
}
exports.NullPreRule = NullPreRule;
class PreRule {
  constructor(property, value, keyPath) {
    this.property = property;
    this.keyPath = keyPath ?? [];
    this.value = value;
  }
  get pseudos() {
    const unsortedPseudos = this.keyPath.filter(key => key.startsWith(':'));
    return (0, _ruleUtils.sortPseudos)(unsortedPseudos);
  }
  get atRules() {
    const unsortedAtRules = this.keyPath.filter(key => key.startsWith('@'));
    return (0, _ruleUtils.sortAtRules)(unsortedAtRules);
  }
  compiled(options) {
    const [_key, className, rule] = (0, _convertToClassName.convertStyleToClassName)([this.property, this.value], this.pseudos ?? [], this.atRules ?? [], options);
    return [[className, rule, {
      [className]: this.keyPath
    }]];
  }
  equals(other) {
    if (!(other instanceof PreRule)) {
      return false;
    }
    const valuesEqual = Array.isArray(this.value) && Array.isArray(other.value) ? (0, _objectUtils.arrayEquals)(this.value, other.value) : this.value === other.value;
    return this.property === other.property && valuesEqual && (0, _objectUtils.arrayEquals)(this.pseudos, other.pseudos) && (0, _objectUtils.arrayEquals)(this.atRules, other.atRules);
  }
}
exports.PreRule = PreRule;
class PreRuleSet {
  constructor(rules) {
    this.rules = rules;
  }
  static create(rules) {
    const flatRules = rules.flatMap(rule => rule instanceof PreRuleSet ? rule.rules : [rule]);
    if (flatRules.length === 0) {
      return new NullPreRule();
    }
    if (flatRules.length === 1) {
      return flatRules[0];
    }
    return new PreRuleSet(flatRules);
  }
  compiled(options) {
    const styleTuple = this.rules.flatMap(rule => rule.compiled(options)).filter(Boolean);
    return styleTuple.length > 0 ? styleTuple : [null];
  }
  equals(other) {
    if (!(other instanceof PreRuleSet)) {
      return false;
    }
    if (this.rules.length !== other.rules.length) {
      return false;
    }
    return (0, _objectUtils.arrayEquals)(this.rules, other.rules, (a, b) => a.equals(b));
  }
}
exports.PreRuleSet = PreRuleSet;