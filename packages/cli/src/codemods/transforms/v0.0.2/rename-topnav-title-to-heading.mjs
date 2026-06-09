// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename XDSTopNavTitle → XDSTopNavHeading, title → heading
 * @see https://github.com/facebookexperimental/xds/pull/527
 *
 * - Renames `title` prop to `heading` on XDSTopNav, XDSTopNavTitle, and XDSTopNavHeading
 * - Renames <XDSTopNavTitle> to <XDSTopNavHeading> (JSX element name)
 * - Renames XDSTopNavTitle to XDSTopNavHeading in import specifiers
 * - Renames XDSTopNavTitleProps to XDSTopNavHeadingProps in type imports
 */

export const meta = {
  title: 'Rename TopNav title → heading, XDSTopNavTitle → XDSTopNavHeading',
  description:
    'Renames the `title` prop to `heading` on XDSTopNav and XDSTopNavTitle/XDSTopNavHeading, renames the XDSTopNavTitle component to XDSTopNavHeading, and updates import specifiers.',
  pr: '#527',
};

const TITLE_PROP_COMPONENTS = new Set([
  'XDSTopNav',
  'XDSTopNavTitle',
  'XDSTopNavHeading',
]);

const IMPORT_RENAMES = {
  XDSTopNavTitle: 'XDSTopNavHeading',
  XDSTopNavTitleProps: 'XDSTopNavHeadingProps',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // 1. Rename `title` prop to `heading` on target components
  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    if (name.type !== 'JSXIdentifier' || !TITLE_PROP_COMPONENTS.has(name.name)) {
      return;
    }

    path.node.attributes.forEach((attr) => {
      if (attr.type === 'JSXAttribute' && attr.name.name === 'title') {
        attr.name.name = 'heading';
        hasChanges = true;
      }
    });
  });

  // 2. Rename <XDSTopNavTitle> to <XDSTopNavHeading> (opening and closing tags)
  root.find(j.JSXIdentifier, {name: 'XDSTopNavTitle'}).forEach((path) => {
    path.node.name = 'XDSTopNavHeading';
    hasChanges = true;
  });

  // 3. Rename import specifiers: XDSTopNavTitle → XDSTopNavHeading, XDSTopNavTitleProps → XDSTopNavHeadingProps
  root.find(j.ImportSpecifier).forEach((path) => {
    const imported = path.node.imported;
    if (imported.type === 'Identifier' && imported.name in IMPORT_RENAMES) {
      const oldName = imported.name;
      const newName = IMPORT_RENAMES[oldName];
      imported.name = newName;
      // If the local name matches the old imported name, update it too
      if (path.node.local && path.node.local.name === oldName) {
        path.node.local.name = newName;
      }
      hasChanges = true;
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
