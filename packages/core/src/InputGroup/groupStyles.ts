// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file groupStyles.ts
 * @input Uses StyleX, theme tokens, and layer-aware group end-cap selectors
 * @output Exports shared group-aware styles for InputGroup children
 * @position Shared styles consumed by InputGroup-compatible controls and addons
 */

import * as stylex from '@stylexjs/stylex';
import {radiusVars, borderVars} from '../theme/tokens.stylex';

/**
 * The internal marker every InputGroup member sets on the element that carries
 * its group styles: compatible inputs, Button addons and InputGroupText. The
 * group's edge rules name members by it instead of a universal selector. Not
 * public API.
 */
export const inputGroupItemProps = {
  'data-astryx-input-group-item': '',
} as const;
const MEMBER = '[data-astryx-input-group-item]';

// The trailing edge is the last member; context-layer infrastructure that may
// follow a control (popovers, inert markers, native dialog surfaces) is never
// a member, so it never takes the trailing edge.
const IS_LAST_ITEM = `:not(:has(~ ${MEMBER}))`;

// Button consumes InputGroup context anywhere below the group, including buttons
// inside an input's own implementation. Keep the visual adaptation on direct
// children so internal clear, calendar, and disclosure actions stay unchanged.
const DIRECT_INPUT_GROUP_ADDON = `:where(.astryx-input-group > ${MEMBER})`;
const DIRECT_INPUT_GROUP_ADDON_FOCUS_VISIBLE = `${DIRECT_INPUT_GROUP_ADDON}:focus-visible`;
const DIRECT_INPUT_GROUP_ADDON_NOT_FIRST = `${DIRECT_INPUT_GROUP_ADDON}:not(:first-child)`;
const DIRECT_INPUT_GROUP_ADDON_WITH_MEMBER_AFTER = `${DIRECT_INPUT_GROUP_ADDON}:has(~ ${MEMBER})`;

export const groupStyles = stylex.create({
  buttonAddon: {
    borderStartStartRadius: {
      default: null,
      [DIRECT_INPUT_GROUP_ADDON_NOT_FIRST]: 0,
    },
    borderEndStartRadius: {
      default: null,
      [DIRECT_INPUT_GROUP_ADDON_NOT_FIRST]: 0,
    },
    borderStartEndRadius: {
      default: null,
      [DIRECT_INPUT_GROUP_ADDON_WITH_MEMBER_AFTER]: 0,
    },
    borderEndEndRadius: {
      default: null,
      [DIRECT_INPUT_GROUP_ADDON_WITH_MEMBER_AFTER]: 0,
    },
    height: {
      default: null,
      [DIRECT_INPUT_GROUP_ADDON]: '100%',
    },
    // Keep the keyboard ring above the adjacent group member at the shared edge.
    zIndex: {
      default: null,
      [DIRECT_INPUT_GROUP_ADDON_FOCUS_VISIBLE]: 2,
    },
  },
  inGroup: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    marginInlineStart: {
      default: `calc(-1 * ${borderVars['--border-width']})`,
      ':first-child': 0,
    },
    borderStartStartRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderEndStartRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderStartEndRadius: {
      default: 0,
      [IS_LAST_ITEM]: radiusVars['--radius-element'],
    },
    borderEndEndRadius: {
      default: 0,
      [IS_LAST_ITEM]: radiusVars['--radius-element'],
    },
    ':focus-within': {
      zIndex: 1,
    },
  },
});
