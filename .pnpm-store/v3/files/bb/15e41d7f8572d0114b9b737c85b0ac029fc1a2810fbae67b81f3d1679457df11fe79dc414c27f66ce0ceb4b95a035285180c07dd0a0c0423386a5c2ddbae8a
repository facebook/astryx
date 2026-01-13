"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transformValue;
exports.getNumberSuffix = getNumberSuffix;
exports.timeUnits = exports.lengthUnits = void 0;
var _normalizeValue = _interopRequireDefault(require("./utils/normalize-value"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function transformValue(key, rawValue, options) {
  const value = typeof rawValue === 'number' ? String(Math.round(rawValue * 10000) / 10000) + getNumberSuffix(key) : rawValue;
  if ((key === 'content' || key === 'hyphenateCharacter' || key === 'hyphenate-character') && typeof value === 'string') {
    const val = value.trim();
    const cssContentFunctions = ['attr(', 'counter(', 'counters(', 'url(', 'linear-gradient(', 'image-set('];
    const cssContentKeywords = new Set(['normal', 'none', 'open-quote', 'close-quote', 'no-open-quote', 'no-close-quote', 'inherit', 'initial', 'revert', 'revert-layer', 'unset']);
    const isCssFunction = cssContentFunctions.some(func => val.includes(func));
    const isKeyword = cssContentKeywords.has(val);
    const hasMatchingQuotes = (val.match(/"/g)?.length ?? 0) >= 2 || (val.match(/'/g)?.length ?? 0) >= 2;
    if (isCssFunction || isKeyword || hasMatchingQuotes) {
      return val;
    }
    return `"${val}"`;
  }
  return (0, _normalizeValue.default)(value, key, options);
}
function getNumberSuffix(key) {
  if (unitlessNumberProperties.has(key) || key.startsWith('--')) {
    return '';
  }
  if (!(key in numberPropertySuffixes)) {
    return 'px';
  }
  const suffix = numberPropertySuffixes[key];
  if (suffix == null) {
    return 'px';
  } else {
    return suffix;
  }
}
const unitlessNumberProperties = new Set(['WebkitLineClamp', 'animationIterationCount', 'aspectRatio', 'borderImageOutset', 'borderImageSlice', 'borderImageWidth', 'counterSet', 'counterReset', 'columnCount', 'flex', 'flexGrow', 'flexShrink', 'flexOrder', 'gridRow', 'gridRowStart', 'gridRowEnd', 'gridColumn', 'gridColumnStart', 'gridColumnEnd', 'gridArea', 'fontWeight', 'hyphenateLimitChars', 'lineClamp', 'lineHeight', 'maskBorderOutset', 'maskBorderSlice', 'maskBorderWidth', 'opacity', 'order', 'orphans', 'tabSize', 'widows', 'zIndex', 'fillOpacity', 'floodOpacity', 'rotate', 'scale', 'shapeImageThreshold', 'stopOpacity', 'strokeDasharray', 'strokeDashoffset', 'strokeMiterlimit', 'strokeOpacity', 'strokeWidth', 'scale', 'mathDepth']);
const numberPropertySuffixes = {
  animationDelay: 'ms',
  animationDuration: 'ms',
  transitionDelay: 'ms',
  transitionDuration: 'ms',
  voiceDuration: 'ms'
};
const timeUnits = exports.timeUnits = new Set(Object.keys(numberPropertySuffixes));
const lengthUnits = exports.lengthUnits = new Set(['backgroundPositionX', 'backgroundPositionY', 'blockSize', 'borderBlockEndWidth', 'borderBlockStartWidth', 'borderBlockWidth', 'borderVerticalWidth', 'borderVerticalWidth', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderBottomWidth', 'borderEndEndRadius', 'borderEndStartRadius', 'borderInlineEndWidth', 'borderEndWidth', 'borderInlineStartWidth', 'borderStartWidth', 'borderInlineWidth', 'borderHorizontalWidth', 'borderLeftWidth', 'borderRightWidth', 'borderSpacing', 'borderStartEndRadius', 'borderStartStartRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderTopWidth', 'bottom', 'columnGap', 'columnRuleWidth', 'columnWidth', 'containIntrinsicBlockSize', 'containIntrinsicHeight', 'containIntrinsicInlineSize', 'containIntrinsicWidth', 'flexBasis', 'fontSize', 'fontSmooth', 'height', 'inlineSize', 'insetBlockEnd', 'insetBlockStart', 'insetInlineEnd', 'insetInlineStart', 'left', 'letterSpacing', 'marginBlockEnd', 'marginBlockStart', 'marginBottom', 'marginInlineEnd', 'marginEnd', 'marginInlineStart', 'marginStart', 'marginLeft', 'marginRight', 'marginTop', 'maxBlockSize', 'maxHeight', 'maxInlineSize', 'maxWidth', 'minBlockSize', 'minHeight', 'minInlineSize', 'minWidth', 'offsetDistance', 'outlineOffset', 'outlineWidth', 'overflowClipMargin', 'paddingBlockEnd', 'paddingBlockStart', 'paddingBottom', 'paddingInlineEnd', 'paddingEnd', 'paddingInlineStart', 'paddingStart', 'paddingLeft', 'paddingRight', 'paddingTop', 'perspective', 'right', 'rowGap', 'scrollMarginBlockEnd', 'scrollMarginBlockStart', 'scrollMarginBottom', 'scrollMarginInlineEnd', 'scrollMarginInlineStart', 'scrollMarginLeft', 'scrollMarginRight', 'scrollMarginTop', 'scrollPaddingBlockEnd', 'scrollPaddingBlockStart', 'scrollPaddingBottom', 'scrollPaddingInlineEnd', 'scrollPaddingInlineStart', 'scrollPaddingLeft', 'scrollPaddingRight', 'scrollPaddingTop', 'scrollSnapMarginBottom', 'scrollSnapMarginLeft', 'scrollSnapMarginRight', 'scrollSnapMarginTop', 'shapeMargin', 'tabSize', 'textDecorationThickness', 'textIndent', 'textUnderlineOffset', 'top', 'transformOrigin', 'translate', 'verticalAlign', 'width', 'wordSpacing', 'border', 'borderBlock', 'borderBlockEnd', 'borderBlockStart', 'borderBottom', 'borderLeft', 'borderRadius', 'borderRight', 'borderTop', 'borderWidth', 'columnRule', 'containIntrinsicSize', 'gap', 'inset', 'insetBlock', 'insetInline', 'margin', 'marginBlock', 'marginVertical', 'marginInline', 'marginHorizontal', 'offset', 'outline', 'padding', 'paddingBlock', 'paddingVertical', 'paddingInline', 'paddingHorizontal', 'scrollMargin', 'scrollMarginBlock', 'scrollMarginInline', 'scrollPadding', 'scrollPaddingBlock', 'scrollPaddingInline', 'scrollSnapMargin']);