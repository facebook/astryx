"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PSEUDO_ELEMENT_PRIORITY = exports.PSEUDO_CLASS_PRIORITIES = exports.AT_RULE_PRIORITIES = void 0;
exports.default = getPriority;
const longHandPhysical = new Set();
const longHandLogical = new Set();
const shorthandsOfLonghands = new Set();
const shorthandsOfShorthands = new Set();
longHandLogical.add('background-blend-mode');
longHandLogical.add('isolation');
longHandLogical.add('mix-blend-mode');
shorthandsOfShorthands.add('animation');
longHandLogical.add('animation-composition');
longHandLogical.add('animation-delay');
longHandLogical.add('animation-direction');
longHandLogical.add('animation-duration');
longHandLogical.add('animation-fill-mode');
longHandLogical.add('animation-iteration-count');
longHandLogical.add('animation-name');
longHandLogical.add('animation-play-state');
shorthandsOfLonghands.add('animation-range');
longHandLogical.add('animation-range-end');
longHandLogical.add('animation-range-start');
longHandLogical.add('animation-timing-function');
longHandLogical.add('animation-timeline');
shorthandsOfLonghands.add('scroll-timeline');
longHandLogical.add('scroll-timeline-axis');
longHandLogical.add('scroll-timeline-name');
longHandLogical.add('timeline-scope');
shorthandsOfLonghands.add('view-timeline');
longHandLogical.add('view-timeline-axis');
longHandLogical.add('view-timeline-inset');
longHandLogical.add('view-timeline-name');
shorthandsOfShorthands.add('background');
longHandLogical.add('background-attachment');
longHandLogical.add('background-clip');
longHandLogical.add('background-color');
longHandLogical.add('background-image');
longHandLogical.add('background-origin');
longHandLogical.add('background-repeat');
longHandLogical.add('background-size');
shorthandsOfLonghands.add('background-position');
longHandLogical.add('background-position-x');
longHandLogical.add('background-position-y');
shorthandsOfShorthands.add('border');
shorthandsOfLonghands.add('border-color');
shorthandsOfLonghands.add('border-style');
shorthandsOfLonghands.add('border-width');
shorthandsOfShorthands.add('border-block');
longHandLogical.add('border-block-color');
longHandLogical.add('border-block-stylex');
longHandLogical.add('border-block-width');
shorthandsOfLonghands.add('border-block-start');
shorthandsOfLonghands.add('border-top');
longHandLogical.add('border-block-start-color');
longHandPhysical.add('border-top-color');
longHandLogical.add('border-block-start-style');
longHandPhysical.add('border-top-style');
longHandLogical.add('border-block-start-width');
longHandPhysical.add('border-top-width');
shorthandsOfLonghands.add('border-block-end');
shorthandsOfLonghands.add('border-bottom');
longHandLogical.add('border-block-end-color');
longHandPhysical.add('border-bottom-color');
longHandLogical.add('border-block-end-style');
longHandPhysical.add('border-bottom-style');
longHandLogical.add('border-block-end-width');
longHandPhysical.add('border-bottom-width');
shorthandsOfShorthands.add('border-inline');
shorthandsOfLonghands.add('border-inline-color');
shorthandsOfLonghands.add('border-inline-style');
shorthandsOfLonghands.add('border-inline-width');
shorthandsOfLonghands.add('border-inline-start');
shorthandsOfLonghands.add('border-left');
longHandLogical.add('border-inline-start-color');
longHandPhysical.add('border-left-color');
longHandLogical.add('border-inline-start-style');
longHandPhysical.add('border-left-style');
longHandLogical.add('border-inline-start-width');
longHandPhysical.add('border-left-width');
shorthandsOfLonghands.add('border-inline-end');
shorthandsOfLonghands.add('border-right');
longHandLogical.add('border-inline-end-color');
longHandPhysical.add('border-right-color');
longHandLogical.add('border-inline-end-style');
longHandPhysical.add('border-right-style');
longHandLogical.add('border-inline-end-width');
longHandPhysical.add('border-right-width');
shorthandsOfLonghands.add('border-image');
longHandLogical.add('border-image-outset');
longHandLogical.add('border-image-repeat');
longHandLogical.add('border-image-slice');
longHandLogical.add('border-image-source');
longHandLogical.add('border-image-width');
shorthandsOfLonghands.add('border-radius');
longHandLogical.add('border-start-end-radius');
longHandLogical.add('border-start-start-radius');
longHandLogical.add('border-end-end-radius');
longHandLogical.add('border-end-start-radius');
longHandPhysical.add('border-top-left-radius');
longHandPhysical.add('border-top-right-radius');
longHandPhysical.add('border-bottom-left-radius');
longHandPhysical.add('border-bottom-right-radius');
longHandLogical.add('box-shadow');
longHandLogical.add('accent-color');
longHandLogical.add('appearance');
longHandLogical.add('aspect-ratio');
shorthandsOfLonghands.add('caret');
longHandLogical.add('caret-color');
longHandLogical.add('caret-shape');
longHandLogical.add('cursor');
longHandLogical.add('ime-mode');
longHandLogical.add('input-security');
shorthandsOfLonghands.add('outline');
longHandLogical.add('outline-color');
longHandLogical.add('outline-offset');
longHandLogical.add('outline-style');
longHandLogical.add('outline-width');
longHandLogical.add('pointer-events');
longHandLogical.add('resize');
longHandLogical.add('text-overflow');
longHandLogical.add('user-select');
shorthandsOfLonghands.add('grid-gap');
shorthandsOfLonghands.add('gap');
longHandLogical.add('grid-row-gap');
longHandLogical.add('row-gap');
longHandLogical.add('grid-column-gap');
longHandLogical.add('column-gap');
shorthandsOfLonghands.add('place-content');
longHandLogical.add('align-content');
longHandLogical.add('justify-content');
shorthandsOfLonghands.add('place-items');
longHandLogical.add('align-items');
longHandLogical.add('justify-items');
shorthandsOfLonghands.add('place-self');
longHandLogical.add('align-self');
longHandLogical.add('justify-self');
longHandLogical.add('box-sizing');
longHandLogical.add('block-size');
longHandPhysical.add('height');
longHandLogical.add('inline-size');
longHandPhysical.add('width');
longHandLogical.add('max-block-size');
longHandPhysical.add('max-height');
longHandLogical.add('max-inline-size');
longHandPhysical.add('max-width');
longHandLogical.add('min-block-size');
longHandPhysical.add('min-height');
longHandLogical.add('min-inline-size');
longHandPhysical.add('min-width');
shorthandsOfShorthands.add('margin');
shorthandsOfLonghands.add('margin-block');
longHandLogical.add('margin-block-start');
longHandPhysical.add('margin-top');
longHandLogical.add('margin-block-end');
longHandPhysical.add('margin-bottom');
shorthandsOfLonghands.add('margin-inline');
longHandLogical.add('margin-inline-start');
longHandPhysical.add('margin-left');
longHandLogical.add('margin-inline-end');
longHandPhysical.add('margin-right');
longHandLogical.add('margin-trim');
shorthandsOfLonghands.add('overscroll-behavior');
longHandLogical.add('overscroll-behavior-block');
longHandPhysical.add('overscroll-behavior-y');
longHandLogical.add('overscroll-behavior-inline');
longHandPhysical.add('overscroll-behavior-x');
shorthandsOfShorthands.add('padding');
shorthandsOfLonghands.add('padding-block');
longHandLogical.add('padding-block-start');
longHandPhysical.add('padding-top');
longHandLogical.add('padding-block-end');
longHandPhysical.add('padding-bottom');
shorthandsOfLonghands.add('padding-inline');
longHandLogical.add('padding-inline-start');
longHandPhysical.add('padding-left');
longHandLogical.add('padding-inline-end');
longHandPhysical.add('padding-right');
longHandLogical.add('visibility');
longHandLogical.add('color');
longHandLogical.add('color-scheme');
longHandLogical.add('forced-color-adjust');
longHandLogical.add('opacity');
longHandLogical.add('print-color-adjust');
shorthandsOfLonghands.add('columns');
longHandLogical.add('column-count');
longHandLogical.add('column-width');
longHandLogical.add('column-fill');
longHandLogical.add('column-span');
shorthandsOfLonghands.add('column-rule');
longHandLogical.add('column-rule-color');
longHandLogical.add('column-rule-style');
longHandLogical.add('column-rule-width');
longHandLogical.add('contain');
shorthandsOfLonghands.add('contain-intrinsic-size');
longHandLogical.add('contain-intrinsic-block-size');
longHandLogical.add('contain-intrinsic-width');
longHandLogical.add('contain-intrinsic-height');
longHandLogical.add('contain-intrinsic-inline-size');
shorthandsOfLonghands.add('container');
longHandLogical.add('container-name');
longHandLogical.add('container-type');
longHandLogical.add('content-visibility');
longHandLogical.add('counter-increment');
longHandLogical.add('counter-reset');
longHandLogical.add('counter-set');
longHandLogical.add('display');
shorthandsOfLonghands.add('flex');
longHandLogical.add('flex-basis');
longHandLogical.add('flex-grow');
longHandLogical.add('flex-shrink');
shorthandsOfLonghands.add('flex-flow');
longHandLogical.add('flex-direction');
longHandLogical.add('flex-wrap');
longHandLogical.add('order');
shorthandsOfShorthands.add('font');
longHandLogical.add('font-family');
longHandLogical.add('font-size');
longHandLogical.add('font-stretch');
longHandLogical.add('font-style');
longHandLogical.add('font-weight');
longHandLogical.add('line-height');
shorthandsOfLonghands.add('font-variant');
longHandLogical.add('font-variant-alternates');
longHandLogical.add('font-variant-caps');
longHandLogical.add('font-variant-east-asian');
longHandLogical.add('font-variant-emoji');
longHandLogical.add('font-variant-ligatures');
longHandLogical.add('font-variant-numeric');
longHandLogical.add('font-variant-position');
longHandLogical.add('font-feature-settings');
longHandLogical.add('font-kerning');
longHandLogical.add('font-language-override');
longHandLogical.add('font-optical-sizing');
longHandLogical.add('font-palette');
longHandLogical.add('font-variation-settings');
longHandLogical.add('font-size-adjust');
longHandLogical.add('font-smooth');
longHandLogical.add('font-synthesis-position');
longHandLogical.add('font-synthesis-small-caps');
longHandLogical.add('font-synthesis-style');
longHandLogical.add('font-synthesis-weight');
longHandLogical.add('line-height-step');
longHandLogical.add('box-decoration-break');
longHandLogical.add('break-after');
longHandLogical.add('break-before');
longHandLogical.add('break-inside');
longHandLogical.add('orphans');
longHandLogical.add('widows');
longHandLogical.add('content');
longHandLogical.add('quotes');
shorthandsOfShorthands.add('grid');
longHandLogical.add('grid-auto-flow');
longHandLogical.add('grid-auto-rows');
longHandLogical.add('grid-auto-columns');
shorthandsOfShorthands.add('grid-template');
shorthandsOfLonghands.add('grid-template-areas');
longHandLogical.add('grid-template-columns');
longHandLogical.add('grid-template-rows');
shorthandsOfShorthands.add('grid-area');
shorthandsOfLonghands.add('grid-row');
longHandLogical.add('grid-row-start');
longHandLogical.add('grid-row-end');
shorthandsOfLonghands.add('grid-column');
longHandLogical.add('grid-column-start');
longHandLogical.add('grid-column-end');
longHandLogical.add('align-tracks');
longHandLogical.add('justify-tracks');
longHandLogical.add('masonry-auto-flow');
longHandLogical.add('image-orientation');
longHandLogical.add('image-rendering');
longHandLogical.add('image-resolution');
longHandLogical.add('object-fit');
longHandLogical.add('object-position');
longHandLogical.add('initial-letter');
longHandLogical.add('initial-letter-align');
shorthandsOfLonghands.add('list-style');
longHandLogical.add('list-style-image');
longHandLogical.add('list-style-position');
longHandLogical.add('list-style-type');
longHandLogical.add('clip');
longHandLogical.add('clip-path');
shorthandsOfLonghands.add('mask');
longHandLogical.add('mask-clip');
longHandLogical.add('mask-composite');
longHandLogical.add('mask-image');
longHandLogical.add('mask-mode');
longHandLogical.add('mask-origin');
longHandLogical.add('mask-position');
longHandLogical.add('mask-repeat');
longHandLogical.add('mask-size');
longHandLogical.add('mask-type');
shorthandsOfLonghands.add('mask-border');
longHandLogical.add('mask-border-mode');
longHandLogical.add('mask-border-outset');
longHandLogical.add('mask-border-repeat');
longHandLogical.add('mask-border-slice');
longHandLogical.add('mask-border-source');
longHandLogical.add('mask-border-width');
shorthandsOfShorthands.add('all');
longHandLogical.add('text-rendering');
shorthandsOfLonghands.add('offset');
longHandLogical.add('offset-anchor');
longHandLogical.add('offset-distance');
longHandLogical.add('offset-path');
longHandLogical.add('offset-position');
longHandLogical.add('offset-rotate');
longHandLogical.add('-webkit-box-orient');
longHandLogical.add('-webkit-line-clamp');
shorthandsOfLonghands.add('overflow');
longHandLogical.add('overflow-block');
longHandPhysical.add('overflow-y');
longHandLogical.add('overflow-inline');
longHandPhysical.add('overflow-x');
longHandLogical.add('overflow-clip-margin');
longHandLogical.add('scroll-gutter');
longHandLogical.add('scroll-behavior');
longHandLogical.add('page');
longHandLogical.add('page-break-after');
longHandLogical.add('page-break-before');
longHandLogical.add('page-break-inside');
shorthandsOfShorthands.add('inset');
shorthandsOfLonghands.add('inset-block');
longHandLogical.add('inset-block-start');
longHandPhysical.add('top');
longHandLogical.add('inset-block-end');
longHandPhysical.add('bottom');
shorthandsOfLonghands.add('inset-inline');
longHandLogical.add('inset-inline-start');
longHandPhysical.add('left');
longHandLogical.add('inset-inline-end');
longHandPhysical.add('right');
longHandLogical.add('clear');
longHandLogical.add('float');
longHandLogical.add('position');
longHandLogical.add('z-index');
longHandLogical.add('ruby-align');
longHandLogical.add('ruby-merge');
longHandLogical.add('ruby-position');
longHandLogical.add('overflow-anchor');
shorthandsOfShorthands.add('scroll-margin');
shorthandsOfLonghands.add('scroll-margin-block');
longHandLogical.add('scroll-margin-block-start');
longHandPhysical.add('scroll-margin-top');
longHandLogical.add('scroll-margin-block-end');
longHandPhysical.add('scroll-margin-bottom');
shorthandsOfLonghands.add('scroll-margin-inline');
longHandLogical.add('scroll-margin-inline-start');
longHandPhysical.add('scroll-margin-left');
longHandLogical.add('scroll-margin-inline-end');
longHandPhysical.add('scroll-margin-right');
shorthandsOfShorthands.add('scroll-padding');
shorthandsOfLonghands.add('scroll-padding-block');
longHandLogical.add('scroll-padding-block-start');
longHandPhysical.add('scroll-padding-top');
longHandLogical.add('scroll-padding-block-end');
longHandPhysical.add('scroll-padding-bottom');
shorthandsOfLonghands.add('scroll-padding-inline');
longHandLogical.add('scroll-padding-inline-start');
longHandPhysical.add('scroll-padding-left');
longHandLogical.add('scroll-padding-inline-end');
longHandPhysical.add('scroll-padding-right');
longHandLogical.add('scroll-snap-align');
longHandLogical.add('scroll-snap-stop');
shorthandsOfLonghands.add('scroll-snap-type');
longHandLogical.add('scrollbar-color');
longHandLogical.add('scrollbar-width');
longHandLogical.add('shape-image-threshold');
longHandLogical.add('shape-margin');
longHandLogical.add('shape-outside');
longHandLogical.add('azimuth');
longHandLogical.add('border-collapse');
longHandLogical.add('border-spacing');
longHandLogical.add('caption-side');
longHandLogical.add('empty-cells');
longHandLogical.add('table-layout');
longHandLogical.add('vertical-align');
shorthandsOfLonghands.add('text-decoration');
longHandLogical.add('text-decoration-color');
longHandLogical.add('text-decoration-line');
longHandLogical.add('text-decoration-skip');
longHandLogical.add('text-decoration-skip-ink');
longHandLogical.add('text-decoration-style');
longHandLogical.add('text-decoration-thickness');
shorthandsOfLonghands.add('text-emphasis');
longHandLogical.add('text-emphasis-color');
longHandLogical.add('text-emphasis-position');
longHandLogical.add('text-emphasis-style');
longHandLogical.add('text-shadow');
longHandLogical.add('text-underline-offset');
longHandLogical.add('text-underline-position');
longHandLogical.add('hanging-punctuation');
longHandLogical.add('hyphenate-character');
longHandLogical.add('hyphenate-limit-chars');
longHandLogical.add('hyphens');
longHandLogical.add('letter-spacing');
longHandLogical.add('line-break');
longHandLogical.add('overflow-wrap');
longHandLogical.add('paint-order');
longHandLogical.add('tab-size');
longHandLogical.add('text-align');
longHandLogical.add('text-align-last');
longHandLogical.add('text-indent');
longHandLogical.add('text-justify');
longHandLogical.add('text-size-adjust');
longHandLogical.add('text-transform');
longHandLogical.add('text-wrap');
longHandLogical.add('white-space');
longHandLogical.add('white-space-collapse');
longHandLogical.add('word-break');
longHandLogical.add('word-spacing');
longHandLogical.add('word-wrap');
longHandLogical.add('backface-visibility');
longHandLogical.add('perspective');
longHandLogical.add('perspective-origin');
longHandLogical.add('rotate');
longHandLogical.add('scale');
longHandLogical.add('transform');
longHandLogical.add('transform-box');
longHandLogical.add('transform-origin');
longHandLogical.add('transform-style');
longHandLogical.add('translate');
shorthandsOfLonghands.add('transition');
longHandLogical.add('transition-delay');
longHandLogical.add('transition-duration');
longHandLogical.add('transition-property');
longHandLogical.add('transition-timing-function');
longHandLogical.add('view-transition-name');
longHandLogical.add('will-change');
longHandLogical.add('direction');
longHandLogical.add('text-combine-upright');
longHandLogical.add('text-orientation');
longHandLogical.add('unicode-bidi');
longHandLogical.add('writing-mode');
longHandLogical.add('backdrop-filter');
longHandLogical.add('filter');
longHandLogical.add('math-depth');
longHandLogical.add('math-shift');
longHandLogical.add('math-style');
longHandLogical.add('touch-action');
const PSEUDO_CLASS_PRIORITIES = exports.PSEUDO_CLASS_PRIORITIES = {
  ':is': 40,
  ':where': 40,
  ':not': 40,
  ':has': 45,
  ':dir': 50,
  ':lang': 51,
  ':first-child': 52,
  ':first-of-type': 53,
  ':last-child': 54,
  ':last-of-type': 55,
  ':only-child': 56,
  ':only-of-type': 57,
  ':nth-child': 60,
  ':nth-last-child': 61,
  ':nth-of-type': 62,
  ':nth-last-of-type': 63,
  ':empty': 70,
  ':link': 80,
  ':any-link': 81,
  ':local-link': 82,
  ':target-within': 83,
  ':target': 84,
  ':visited': 85,
  ':enabled': 91,
  ':disabled': 92,
  ':required': 93,
  ':optional': 94,
  ':read-only': 95,
  ':read-write': 96,
  ':placeholder-shown': 97,
  ':in-range': 98,
  ':out-of-range': 99,
  ':default': 100,
  ':checked': 101,
  ':indeterminate': 101,
  ':blank': 102,
  ':valid': 103,
  ':invalid': 104,
  ':user-invalid': 105,
  ':autofill': 110,
  ':picture-in-picture': 120,
  ':modal': 121,
  ':fullscreen': 122,
  ':paused': 123,
  ':playing': 124,
  ':current': 125,
  ':past': 126,
  ':future': 127,
  ':hover': 130,
  ':focusWithin': 140,
  ':focus': 150,
  ':focusVisible': 160,
  ':active': 170
};
const AT_RULE_PRIORITIES = exports.AT_RULE_PRIORITIES = {
  '@supports': 30,
  '@media': 200,
  '@container': 300
};
const PSEUDO_ELEMENT_PRIORITY = exports.PSEUDO_ELEMENT_PRIORITY = 5000;
function getPriority(key) {
  if (key.startsWith('--')) {
    return 1;
  }
  if (key.startsWith('@supports')) {
    return AT_RULE_PRIORITIES['@supports'];
  }
  if (key.startsWith('@media')) {
    return AT_RULE_PRIORITIES['@media'];
  }
  if (key.startsWith('@container')) {
    return AT_RULE_PRIORITIES['@container'];
  }
  if (key.startsWith('::')) {
    return PSEUDO_ELEMENT_PRIORITY;
  }
  if (key.startsWith(':')) {
    const prop = key.startsWith(':') && key.includes('(') ? key.slice(0, key.indexOf('(')) : key;
    return PSEUDO_CLASS_PRIORITIES[prop] ?? 40;
  }
  if (longHandPhysical.has(key)) {
    return 4000;
  }
  if (longHandLogical.has(key)) {
    return 3000;
  }
  if (shorthandsOfLonghands.has(key)) {
    return 2000;
  }
  if (shorthandsOfShorthands.has(key)) {
    return 1000;
  }
  return 3000;
}