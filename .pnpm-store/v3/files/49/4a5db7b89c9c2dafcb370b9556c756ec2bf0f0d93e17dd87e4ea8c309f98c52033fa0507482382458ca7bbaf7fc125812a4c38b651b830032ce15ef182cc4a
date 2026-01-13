'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styleSheet = exports.StyleXSheet = void 0;
var _invariant = _interopRequireDefault(require("invariant"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const LIGHT_MODE_CLASS_NAME = '__fb-light-mode';
const DARK_MODE_CLASS_NAME = '__fb-dark-mode';
function buildTheme(selector, theme) {
  const lines = [];
  lines.push(`${selector} {`);
  for (const key in theme) {
    const value = theme[key];
    lines.push(`  --${key}: ${value};`);
  }
  lines.push('}');
  return lines.join('\n');
}
function makeStyleTag() {
  const tag = document.createElement('style');
  tag.setAttribute('type', 'text/css');
  tag.setAttribute('data-stylex', 'true');
  const head = document.head || document.getElementsByTagName('head')[0];
  (0, _invariant.default)(head, 'expected head');
  head.appendChild(tag);
  return tag;
}
function doesSupportCSSVariables() {
  return globalThis.CSS != null && globalThis.CSS.supports != null && globalThis.CSS.supports('--fake-var:0');
}
const VARIABLE_MATCH = /var\(--(.*?)\)/g;
class StyleXSheet {
  static LIGHT_MODE_CLASS_NAME = (() => LIGHT_MODE_CLASS_NAME)();
  static DARK_MODE_CLASS_NAME = (() => DARK_MODE_CLASS_NAME)();
  constructor(opts) {
    this.tag = null;
    this.injected = false;
    this.ruleForPriority = new Map();
    this.rules = [];
    this.rootTheme = opts.rootTheme;
    this.rootDarkTheme = opts.rootDarkTheme;
    this.supportsVariables = opts.supportsVariables ?? doesSupportCSSVariables();
  }
  getVariableMatch() {
    return VARIABLE_MATCH;
  }
  isHeadless() {
    return this.tag == null || globalThis?.document?.body == null;
  }
  getTag() {
    const {
      tag
    } = this;
    (0, _invariant.default)(tag != null, 'expected tag');
    return tag;
  }
  getCSS() {
    return this.rules.join('\n');
  }
  getRulePosition(rule) {
    return this.rules.indexOf(rule);
  }
  getRuleCount() {
    return this.rules.length;
  }
  inject() {
    if (this.injected) {
      return;
    }
    this.injected = true;
    if (globalThis.document?.body == null) {
      this.injectTheme();
      return;
    }
    this.tag = makeStyleTag();
    this.injectTheme();
  }
  injectTheme() {
    if (this.rootTheme != null) {
      this.insert(buildTheme(`:root, .${LIGHT_MODE_CLASS_NAME}`, this.rootTheme), 0);
    }
    if (this.rootDarkTheme != null) {
      this.insert(buildTheme(`.${DARK_MODE_CLASS_NAME}:root, .${DARK_MODE_CLASS_NAME}`, this.rootDarkTheme), 0);
    }
  }
  __injectCustomThemeForTesting(selector, theme) {
    if (theme != null) {
      this.insert(buildTheme(selector, theme), 0);
    }
  }
  delete(rule) {
    const index = this.rules.indexOf(rule);
    (0, _invariant.default)(index >= 0, "Couldn't find the index for rule %s", rule);
    this.rules.splice(index, 1);
    if (this.isHeadless()) {
      return;
    }
    const tag = this.getTag();
    const sheet = tag.sheet;
    (0, _invariant.default)(sheet, 'expected sheet');
    sheet.deleteRule(index);
  }
  normalizeRule(rule) {
    const {
      rootTheme
    } = this;
    if (this.supportsVariables || rootTheme == null) {
      return rule;
    }
    return rule.replace(VARIABLE_MATCH, (_match, name) => {
      return rootTheme[name];
    });
  }
  getInsertPositionForPriority(priority) {
    const priorityRule = this.ruleForPriority.get(priority);
    if (priorityRule != null) {
      return this.rules.indexOf(priorityRule) + 1;
    }
    const priorities = Array.from(this.ruleForPriority.keys()).sort((a, b) => b - a).filter(num => num > priority ? 1 : 0);
    if (priorities.length === 0) {
      return this.getRuleCount();
    }
    const lastPriority = priorities.pop();
    if (lastPriority == null) {
      return this.getRuleCount();
    }
    return this.rules.indexOf(this.ruleForPriority.get(lastPriority));
  }
  insert(rawLTRRule, priority, rawRTLRule) {
    if (this.injected === false) {
      this.inject();
    }
    if (rawRTLRule != null) {
      this.insert(addAncestorSelector(rawLTRRule, "html:not([dir='rtl'])"), priority);
      this.insert(addAncestorSelector(rawRTLRule, "html[dir='rtl']"), priority);
      return;
    }
    const rawRule = rawLTRRule;
    if (this.rules.includes(rawRule)) {
      return;
    }
    const rule = this.normalizeRule(addSpecificityLevel(rawRule, Math.floor(priority / 1000)));
    const insertPos = this.getInsertPositionForPriority(priority);
    this.rules.splice(insertPos, 0, rule);
    this.ruleForPriority.set(priority, rule);
    if (this.isHeadless()) {
      return;
    }
    const tag = this.getTag();
    const sheet = tag.sheet;
    if (sheet != null) {
      try {
        sheet.insertRule(rule, Math.min(insertPos, sheet.cssRules.length));
      } catch (err) {
        console.error('insertRule error', err, rule, insertPos);
      }
    }
  }
}
exports.StyleXSheet = StyleXSheet;
function addAncestorSelector(selector, ancestorSelector) {
  if (!selector.startsWith('@')) {
    return `${ancestorSelector} ${selector}`;
  }
  const firstBracketIndex = selector.indexOf('{');
  const mediaQueryPart = selector.slice(0, firstBracketIndex + 1);
  const rest = selector.slice(firstBracketIndex + 1);
  return `${mediaQueryPart}${ancestorSelector} ${rest}`;
}
function addSpecificityLevel(selector, index) {
  if (selector.startsWith('@keyframes')) {
    return selector;
  }
  const pseudo = Array.from({
    length: index
  }).map(() => ':not(#\\#)').join('');
  const lastOpenCurly = selector.includes('::') ? selector.indexOf('::') : selector.lastIndexOf('{');
  const beforeCurly = selector.slice(0, lastOpenCurly);
  const afterCurly = selector.slice(lastOpenCurly);
  return `${beforeCurly}${pseudo}${afterCurly}`;
}
const styleSheet = exports.styleSheet = new StyleXSheet({
  supportsVariables: true,
  rootTheme: {},
  rootDarkTheme: {}
});