// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Decides which props the playground's property editor will show.
 * @input A PropDoc (its `type` string and `slotElements`), plus the parsed control.
 * @output Whether the editor renders a control for the prop at all.
 * @position Pure gate for PropertyEditor — kept out of the component so tests can
 *           reach it without booting StyleX.
 */

import {
  parsePropType,
  type PropControlDescriptor,
} from '../../../components/component-detail/parsePropType';
import type {PropDoc} from '../../../generated/componentRegistry';
import type {AttrInfo} from './componentInstances';

export function isEditable(
  control: PropControlDescriptor,
  attr?: AttrInfo,
): boolean {
  if (attr?.valueKind === 'expression') {
    return false;
  }
  return (
    control.kind === 'boolean' ||
    control.kind === 'enum' ||
    control.kind === 'string' ||
    control.kind === 'number'
  );
}

// Prop types that have no inline control in the popover and so are
// hidden entirely (ReactNode parses to a string control but isn't meaningfully
// editable here; StyleXStyles/AriaRole have no control at all).
//
// Matched as an EXACT type string. A doc that widens one of these into a union
// — say `false | MobileNavConfig | ReactNode` — no longer matches and falls
// through to the parse below, so keep the bare name in the doc if the intent is
// to hide the prop. See AppShell.doc.mjs's `mobileNav`.
const UNSUPPORTED_PROP_TYPES = new Set([
  'ReactNode',
  'StyleXStyles',
  'AriaRole',
]);

/** Whether a prop can be edited through the editor (and should be shown). */
export function isSupportedProp(prop: PropDoc): boolean {
  if (UNSUPPORTED_PROP_TYPES.has(prop.type.trim())) {
    return false;
  }
  return isEditable(parsePropType(prop.type, prop.name, prop.slotElements));
}
