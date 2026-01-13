"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Rule = exports.RawRuleRTLTuple = exports.RawRuleList = exports.RawRule = exports.CompiledRuleTuple2 = exports.CompiledRule = void 0;
class Rule {}
exports.Rule = Rule;
class RawRule extends Rule {
  constructor(key, value, psuedos, atRules) {
    super();
    this.key = key;
    this.value = value;
    this.psuedos = psuedos;
    this.atRules = atRules;
  }
}
exports.RawRule = RawRule;
class RawRuleList extends Rule {
  constructor(rules) {
    super();
    this.rules = rules;
  }
}
exports.RawRuleList = RawRuleList;
class RawRuleRTLTuple extends Rule {
  constructor(rule1, rule2) {
    super();
    this.rules = [rule1, rule2];
  }
}
exports.RawRuleRTLTuple = RawRuleRTLTuple;
class CompiledRule extends Rule {
  constructor(key, value, psuedos, atRules, className) {
    super();
    this.key = key;
    this.value = value;
    this.psuedos = psuedos;
    this.atRules = atRules;
    this.className = className;
  }
}
exports.CompiledRule = CompiledRule;
class CompiledRuleTuple2 extends Rule {
  constructor(rule1, rule2) {
    super();
    this.rules = [rule1, rule2];
  }
}
exports.CompiledRuleTuple2 = CompiledRuleTuple2;