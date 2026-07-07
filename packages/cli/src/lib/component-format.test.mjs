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

describe('formatFull theming override keys', () => {
  // Regression guard: the `defineTheme` component-override key is the stable
  // class name with the `astryx-` prefix stripped — `generateThemeRules`
  // re-adds the prefix to build the `.astryx-*` selector. targetKey() used to
  // strip a dead `xds-` prefix (from before the astryx rename), so the printed
  // example advertised `astryx-*` keys. Those double-prefix to
  // `.astryx-astryx-*` at runtime and silently match nothing. See issue #3458.
  it('prints override keys without the astryx- prefix (single-word component)', () => {
    const docs = {
      name: 'Button',
      description: 'A button.',
      theming: {targets: [{className: 'astryx-button', visualProps: ['variant']}]},
    };
    const out = formatFull(docs);

    expect(out).toContain("'button': {");
    // The full DOM class must not appear as an override key.
    expect(out).not.toContain("'astryx-button': {");
  });

  it('prints override keys without the astryx- prefix (compound Table classes)', () => {
    const docs = {
      name: 'Table',
      description: 'A table.',
      theming: {
        targets: [
          {className: 'astryx-base-table'},
          {className: 'astryx-table-cell'},
        ],
      },
    };
    const out = formatFull(docs);

    // Correct keys: class name minus the astryx- prefix.
    expect(out).toContain("'base-table': {");
    expect(out).toContain("'table-cell': {");
    // The verbatim DOM class names must not be advertised as override keys.
    expect(out).not.toContain("'astryx-base-table': {");
    expect(out).not.toContain("'astryx-table-cell': {");
  });
});
