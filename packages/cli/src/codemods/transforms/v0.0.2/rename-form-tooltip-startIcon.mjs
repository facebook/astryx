// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename form field tooltip → labelTooltip, startIcon → labelIcon
 * @see https://github.com/facebookexperimental/xds/pull/375
 *
 * Applies to: XDSField, XDSFieldLabel, XDSNumberInput, XDSCheckboxInput,
 * XDSSwitch, XDSDateInput, XDSTimeInput
 */

export const meta = {
  title: 'Rename form tooltip → labelTooltip, startIcon → labelIcon',
  description:
    'Renames `tooltip` to `labelTooltip` and `startIcon` to `labelIcon` on form field components.',
  pr: '#375',
};

const FORM_COMPONENTS = new Set([
  'XDSField',
  'XDSFieldLabel',
  'XDSNumberInput',
  'XDSCheckboxInput',
  'XDSSwitch',
  'XDSDateInput',
  'XDSTimeInput',
]);

const PROP_RENAMES = {
  tooltip: 'labelTooltip',
  startIcon: 'labelIcon',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    if (name.type !== 'JSXIdentifier' || !FORM_COMPONENTS.has(name.name)) {
      return;
    }

    path.node.attributes.forEach((attr) => {
      if (attr.type === 'JSXAttribute' && attr.name.name in PROP_RENAMES) {
        attr.name.name = PROP_RENAMES[attr.name.name];
        hasChanges = true;
      }
    });
  });

  return hasChanges ? root.toSource() : undefined;
}
