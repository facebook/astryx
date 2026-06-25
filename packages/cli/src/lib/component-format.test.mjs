// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {formatFull} from './component-format.mjs';

describe('formatFull sub-component rendering', () => {
  // Regression guard: sub-components are sometimes declared as a bare
  // reference, e.g. {name: 'XDSRadioListItem'}, with props/description in
  // their own .doc.mjs. Previously `comp.description` was undefined and got
  // printed as the literal string "undefined", and the props area was blank.
  it('does not print "undefined" for a bare {name} sub-component', () => {
    const docs = {
      name: 'RadioList',
      description: 'Radio group container.',
      components: [{name: 'XDSRadioListItem'}],
    };
    const out = formatFull(docs);

    expect(out).toContain('### XDSRadioListItem');
    expect(out).not.toContain('undefined');
    // Points the reader at the sub-component's own docs instead of a blank.
    expect(out).toContain('astryx component XDSRadioListItem');
  });

  it('renders a full props table for a sub-component that has inline props', () => {
    const docs = {
      name: 'ButtonGroup',
      description: 'Groups buttons.',
      components: [
        {
          name: 'XDSButtonGroup',
          description: 'Connected button styling.',
          props: [
            {
              name: 'label',
              type: 'string',
              description: 'Accessible label.',
              required: true,
            },
          ],
        },
      ],
    };
    const out = formatFull(docs);

    expect(out).toContain('### XDSButtonGroup');
    expect(out).toContain('Connected button styling.');
    expect(out).toContain('| `label` |');
    expect(out).not.toContain('undefined');
    // With real props, it should NOT emit the "see docs" pointer.
    expect(out).not.toContain('astryx component XDSButtonGroup');
  });
});
