'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genCSSRule = genCSSRule;
const THUMB_VARIANTS = ['::-webkit-slider-thumb', '::-moz-range-thumb', '::-ms-thumb'];
function genCSSRule(className, decls, pseudos, atRules) {
  const pseudo = pseudos.filter(p => p !== '::thumb').join('');
  let selectorForAtRules = `.${className}` + atRules.map(() => `.${className}`).join('') + pseudo;
  if (pseudos.includes('::thumb')) {
    selectorForAtRules = THUMB_VARIANTS.map(suffix => selectorForAtRules + suffix).join(', ');
  }
  return atRules.reduce((acc, atRule) => `${atRule}{${acc}}`, `${selectorForAtRules}{${decls}}`);
}