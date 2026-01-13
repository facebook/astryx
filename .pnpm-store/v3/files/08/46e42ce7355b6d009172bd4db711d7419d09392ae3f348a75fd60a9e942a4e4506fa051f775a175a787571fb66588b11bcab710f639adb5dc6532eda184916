"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const shorthands = {
  all: _ => {
    throw new Error('all is not supported');
  },
  animation: _value => {
    throw new Error('animation is not supported');
  },
  background: _value => {
    throw new Error('background is not supported. Use background-color, border-image etc. instead.');
  },
  border: _rawValue => {
    throw new Error('border is not supported. Use border-width, border-style and border-color instead.');
  },
  borderInline: _rawValue => {
    throw new Error('borderInline is not supported. Use borderInlineWidth, borderInlineStyle and borderInlineColor instead.');
  },
  borderBlock: _rawValue => {
    throw new Error('borderBlock is not supported. Use borderBlockWidth, borderBlockStyle and borderBlockColor instead.');
  },
  borderTop: _rawValue => {
    throw new Error('borderTop is not supported. Use borderTopWidth, borderTopStyle and borderTopColor instead.');
  },
  borderInlineEnd: _rawValue => {
    throw new Error('borderInlineEnd is not supported. Use borderInlineEndWidth, borderInlineEndStyle and borderInlineEndColor instead.');
  },
  borderRight: _rawValue => {
    throw new Error('borderRight is not supported. Use borderRightWidth, borderRightStyle and borderRightColor instead.');
  },
  borderBottom: _rawValue => {
    throw new Error('borderBottom is not supported. Use borderBottomWidth, borderBottomStyle and borderBottomColor instead.');
  },
  borderInlineStart: _rawValue => {
    throw new Error('borderInlineStart is not supported. Use borderInlineStartWidth, borderInlineStartStyle and borderInlineStartColor instead.');
  },
  borderLeft: _rawValue => {
    throw new Error(['`borderLeft` is not supported.', 'You could use `borderLeftWidth`, `borderLeftStyle` and `borderLeftColor`,', 'but it is preferable to use `borderInlineStartWidth`, `borderInlineStartStyle` and `borderInlineStartColor`.'].join(' '));
  }
};
const aliases = {
  borderHorizontal: shorthands.borderInline,
  borderVertical: shorthands.borderBlock,
  borderBlockStart: shorthands.borderTop,
  borderEnd: shorthands.borderInlineEnd,
  borderBlockEnd: shorthands.borderBottom,
  borderStart: shorthands.borderInlineStart,
  blockSize: val => [['height', val]],
  inlineSize: val => [['width', val]],
  minBlockSize: val => [['minHeight', val]],
  minInlineSize: val => [['minWidth', val]],
  maxBlockSize: val => [['maxHeight', val]],
  maxInlineSize: val => [['maxWidth', val]],
  borderHorizontalWidth: val => [['borderInlineWidth', val]],
  borderHorizontalStyle: val => [['borderInlineStyle', val]],
  borderHorizontalColor: val => [['borderInlineColor', val]],
  borderVerticalWidth: val => [['borderBlockWidth', val]],
  borderVerticalStyle: val => [['borderBlockStyle', val]],
  borderVerticalColor: val => [['borderBlockColor', val]],
  borderBlockStartColor: value => [['borderTopColor', value]],
  borderBlockEndColor: value => [['borderBottomColor', value]],
  borderBlockStartStyle: value => [['borderTopStyle', value]],
  borderBlockEndStyle: value => [['borderBottomStyle', value]],
  borderBlockStartWidth: value => [['borderTopWidth', value]],
  borderBlockEndWidth: value => [['borderBottomWidth', value]],
  borderStartColor: val => [['borderInlineStartColor', val]],
  borderEndColor: val => [['borderInlineEndColor', val]],
  borderStartStyle: val => [['borderInlineStartStyle', val]],
  borderEndStyle: val => [['borderInlineEndStyle', val]],
  borderStartWidth: val => [['borderInlineStartWidth', val]],
  borderEndWidth: val => [['borderInlineEndWidth', val]],
  borderTopStartRadius: value => [['borderStartStartRadius', value]],
  borderTopEndRadius: value => [['borderStartEndRadius', value]],
  borderBottomStartRadius: value => [['borderEndStartRadius', value]],
  borderBottomEndRadius: value => [['borderEndEndRadius', value]],
  containIntrinsicBlockSize: value => [['containIntrinsicHeight', value]],
  containIntrinsicInlineSize: value => [['containIntrinsicWidth', value]],
  marginBlockStart: value => [['marginTop', value]],
  marginBlockEnd: value => [['marginBottom', value]],
  marginStart: val => [['marginInlineStart', val]],
  marginEnd: val => [['marginInlineEnd', val]],
  marginHorizontal: val => [['marginInline', val]],
  marginVertical: val => [['marginBlock', val]],
  overflowBlock: value => [['overflowY', value]],
  overflowInline: value => [['overflowX', value]],
  paddingBlockStart: rawValue => [['paddingTop', rawValue]],
  paddingBlockEnd: rawValue => [['paddingBottom', rawValue]],
  paddingStart: val => [['paddingInlineStart', val]],
  paddingEnd: val => [['paddingInlineEnd', val]],
  paddingHorizontal: val => [['paddingInline', val]],
  paddingVertical: val => [['paddingBlock', val]],
  scrollMarginBlockStart: value => [['scrollMarginTop', value]],
  scrollMarginBlockEnd: value => [['scrollMarginBottom', value]],
  insetBlockStart: value => [['top', value]],
  insetBlockEnd: value => [['bottom', value]],
  start: val => [['insetInlineStart', val]],
  end: val => [['insetInlineEnd', val]]
};
const expansions = {
  ...shorthands,
  ...aliases
};
var _default = exports.default = expansions;