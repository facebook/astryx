// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CheckboxRowPressContext.ts
 * @input Uses the private layer-scoped context factory
 * @output Exports CheckboxRowPressContext: whether the row around a checkbox
 *   is the checkbox's press surface
 * @position Internal context; provided by CheckboxListItem around the row's
 *   own checkbox, read by CheckboxInput
 *
 * A row that answers a press anywhere on it (a CheckboxListItem whose surface
 * clicks are delegated to its checkbox) owns the touch press: it carries the
 * press marker and `checkboxRowPressScope`, so the checkbox registers no press
 * marker of its own. A finger on the label, on the description, or on the box
 * itself then presses the same surface, and the box's overlay paints from that
 * row's press.
 *
 * Layer-scoped, so content a layer portals out of the row (a popover opened
 * from the row's end content) starts from the default, and provided only
 * around the row's own checkbox, so another checkbox placed in the row's
 * content keeps its own press.
 *
 * SYNC: When modified, update CheckboxInput.tsx and
 * ../CheckboxList/CheckboxListItem.tsx.
 */

import {createLayerScopedContext} from '../Layer/layerScopedContext';

export const CheckboxRowPressContext = createLayerScopedContext(false);
CheckboxRowPressContext.displayName = 'CheckboxRowPressContext';
