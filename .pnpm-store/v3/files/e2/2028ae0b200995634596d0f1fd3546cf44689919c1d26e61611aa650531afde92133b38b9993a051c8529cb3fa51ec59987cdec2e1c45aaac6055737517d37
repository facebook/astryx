"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _splitCssValue = _interopRequireDefault(require("../utils/split-css-value"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const shorthands = {
  border: rawValue => {
    return [['borderTop', rawValue], ['borderEnd', rawValue], ['borderBottom', rawValue], ['borderStart', rawValue]];
  },
  borderColor: rawValue => {
    const [top, right = top, bottom = top, left = right] = (0, _splitCssValue.default)(rawValue);
    return [['borderTopColor', top], ['borderEndColor', right], ['borderBottomColor', bottom], ['borderStartColor', left]];
  },
  borderHorizontal: rawValue => {
    return [['borderStart', rawValue], ['borderEnd', rawValue]];
  },
  borderStyle: rawValue => {
    const [top, right = top, bottom = top, left = right] = (0, _splitCssValue.default)(rawValue);
    return [['borderTopStyle', top], ['borderEndStyle', right], ['borderBottomStyle', bottom], ['borderStartStyle', left]];
  },
  borderVertical: rawValue => {
    return [['borderTop', rawValue], ['borderBottom', rawValue]];
  },
  borderWidth: rawValue => {
    const [top, right = top, bottom = top, left = right] = (0, _splitCssValue.default)(rawValue);
    return [['borderTopWidth', top], ['borderEndWidth', right], ['borderBottomWidth', bottom], ['borderStartWidth', left]];
  },
  borderHorizontalColor: rawValue => [['borderStartColor', rawValue], ['borderEndColor', rawValue]],
  borderHorizontalStyle: rawValue => [['borderStartStyle', rawValue], ['borderEndStyle', rawValue]],
  borderHorizontalWidth: rawValue => [['borderStartWidth', rawValue], ['borderEndWidth', rawValue]],
  borderVerticalColor: rawValue => [['borderTopColor', rawValue], ['borderBottomColor', rawValue]],
  borderVerticalStyle: rawValue => [['borderTopStyle', rawValue], ['borderBottomStyle', rawValue]],
  borderVerticalWidth: rawValue => [['borderTopWidth', rawValue], ['borderBottomWidth', rawValue]],
  borderRadius: rawValue => {
    const [top, right = top, bottom = top, left = right] = (0, _splitCssValue.default)(rawValue);
    return [['borderTopStartRadius', top], ['borderTopEndRadius', right], ['borderBottomEndRadius', bottom], ['borderBottomStartRadius', left]];
  },
  containIntrinsicSize: rawValue => {
    const parts = (0, _splitCssValue.default)(rawValue);
    const [width, height = width] = parts.reduce((coll, part) => {
      const lastElement = coll[coll.length - 1];
      if (lastElement === 'auto' && part != null) {
        return [...coll.slice(0, -1), `auto ${part}`];
      }
      return [...coll, part];
    }, []);
    return [['containIntrinsicWidth', width], ['containIntrinsicHeight', height]];
  },
  inset: rawValue => [['top', rawValue], ['end', rawValue], ['bottom', rawValue], ['start', rawValue]],
  insetInline: rawValue => [...shorthands.start(rawValue), ...shorthands.end(rawValue)],
  insetBlock: rawValue => [['top', rawValue], ['bottom', rawValue]],
  start: rawValue => [['start', rawValue], ['left', null], ['right', null]],
  end: rawValue => [['end', rawValue], ['left', null], ['right', null]],
  left: rawValue => [['left', rawValue], ['start', null], ['end', null]],
  right: rawValue => [['right', rawValue], ['start', null], ['end', null]],
  gap: rawValue => {
    const [row, column = row] = (0, _splitCssValue.default)(rawValue);
    return [['rowGap', row], ['columnGap', column]];
  },
  margin: rawValue => {
    const [top, right = top, bottom = top, left = right] = (0, _splitCssValue.default)(rawValue);
    return [['marginTop', top], ['marginEnd', right], ['marginBottom', bottom], ['marginStart', left]];
  },
  marginHorizontal: rawValue => [...shorthands.marginStart(rawValue), ...shorthands.marginEnd(rawValue)],
  marginStart: rawValue => [['marginStart', rawValue], ['marginLeft', null], ['marginRight', null]],
  marginEnd: rawValue => [['marginEnd', rawValue], ['marginLeft', null], ['marginRight', null]],
  marginLeft: rawValue => [['marginLeft', rawValue], ['marginStart', null], ['marginEnd', null]],
  marginRight: rawValue => [['marginRight', rawValue], ['marginStart', null], ['marginEnd', null]],
  marginVertical: rawValue => {
    return [['marginTop', rawValue], ['marginBottom', rawValue]];
  },
  overflow: rawValue => {
    const [x, y = x] = (0, _splitCssValue.default)(rawValue);
    return [['overflowX', x], ['overflowY', y]];
  },
  padding: rawValue => {
    const [top, right = top, bottom = top, left = right] = (0, _splitCssValue.default)(rawValue);
    return [['paddingTop', top], ['paddingEnd', right], ['paddingBottom', bottom], ['paddingStart', left]];
  },
  paddingHorizontal: val => [...shorthands.paddingStart(val), ...shorthands.paddingEnd(val)],
  paddingStart: val => [['paddingStart', val], ['paddingLeft', null], ['paddingRight', null]],
  paddingEnd: val => [['paddingEnd', val], ['paddingLeft', null], ['paddingRight', null]],
  paddingLeft: val => [['paddingLeft', val], ['paddingStart', null], ['paddingEnd', null]],
  paddingRight: val => [['paddingRight', val], ['paddingStart', null], ['paddingEnd', null]],
  paddingVertical: val => [['paddingTop', val], ['paddingBottom', val]]
};
const aliases = {
  insetBlockStart: val => [['top', val]],
  insetBlockEnd: val => [['bottom', val]],
  insetInlineStart: shorthands.start,
  insetInlineEnd: shorthands.end,
  blockSize: val => [['height', val]],
  inlineSize: val => [['width', val]],
  minBlockSize: val => [['minHeight', val]],
  minInlineSize: val => [['minWidth', val]],
  maxBlockSize: val => [['maxHeight', val]],
  maxInlineSize: val => [['maxWidth', val]],
  borderBlockWidth: shorthands.borderVerticalWidth,
  borderBlockStyle: shorthands.borderVerticalStyle,
  borderBlockColor: shorthands.borderVerticalColor,
  borderBlockStartWidth: val => [['borderTopWidth', val]],
  borderBlockStartStyle: val => [['borderTopStyle', val]],
  borderBlockStartColor: val => [['borderTopColor', val]],
  borderBlockEndWidth: val => [['borderBottomWidth', val]],
  borderBlockEndStyle: val => [['borderBottomStyle', val]],
  borderBlockEndColor: val => [['borderBottomColor', val]],
  borderInlineWidth: shorthands.borderHorizontalWidth,
  borderInlineStyle: shorthands.borderHorizontalStyle,
  borderInlineColor: shorthands.borderHorizontalColor,
  borderInlineStartWidth: val => [['borderStartWidth', val]],
  borderInlineStartStyle: val => [['borderStartStyle', val]],
  borderInlineStartColor: val => [['borderStartColor', val]],
  borderInlineEndWidth: val => [['borderEndWidth', val]],
  borderInlineEndStyle: val => [['borderEndStyle', val]],
  borderInlineEndColor: val => [['borderEndColor', val]],
  borderStartStartRadius: val => [['borderTopStartRadius', val]],
  borderStartEndRadius: val => [['borderTopEndRadius', val]],
  borderEndStartRadius: val => [['borderBottomStartRadius', val]],
  borderEndEndRadius: val => [['borderBottomEndRadius', val]],
  gridGap: shorthands.gap,
  gridRowGap: value => [['rowGap', value]],
  gridColumnGap: value => [['columnGap', value]],
  marginBlock: shorthands.marginVertical,
  marginBlockStart: val => [['marginTop', val]],
  marginBlockEnd: val => [['marginBottom', val]],
  marginInline: shorthands.marginHorizontal,
  marginInlineStart: val => [['marginStart', val]],
  marginInlineEnd: val => [['marginEnd', val]],
  overflowBlock: value => [['overflowY', value]],
  overflowInline: value => [['overflowX', value]],
  paddingBlock: shorthands.paddingVertical,
  paddingBlockStart: val => [['paddingTop', val]],
  paddingBlockEnd: val => [['paddingBottom', val]],
  paddingInline: shorthands.paddingHorizontal,
  paddingInlineStart: val => [['paddingStart', val]],
  paddingInlineEnd: val => [['paddingEnd', val]],
  scrollMarginBlockStart: value => [['scrollMarginTop', value]],
  scrollMarginBlockEnd: value => [['scrollMarginBottom', value]]
};
const expansions = {
  ...shorthands,
  ...aliases
};
var _default = exports.default = expansions;