// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListItem.doc.test.mjs
 * @input Uses vitest and the ListItem doc sidecar
 * @output Verifies the documented `label` type matches ListItemProps
 * @position Regression test for ListItem.doc.mjs
 *
 * `ListItemProps.label` is a ReactNode: a string is truncated to one line, any
 * other node renders as given. The sidecar once documented it as `string`,
 * which told readers a rich label had to be restructured away.
 */

import {describe, expect, it} from 'vitest';
import {docs, docsZh} from './ListItem.doc.mjs';

describe('ListItem docs', () => {
  it.each([
    ['docs', docs],
    ['docsZh', docsZh],
  ])('%s documents label as a ReactNode', (_, doc) => {
    const label = doc.props.find(prop => prop.name === 'label');
    expect(label?.type).toBe('ReactNode');
    expect(label?.required).toBe(true);
  });
});
