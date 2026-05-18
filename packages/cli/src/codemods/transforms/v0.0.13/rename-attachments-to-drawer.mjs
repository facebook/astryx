// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename XDSChatComposerAttachments → XDSChatComposerDrawer
 *
 * Transforms:
 * - Import: XDSChatComposerAttachments → XDSChatComposerDrawer
 * - Import: XDSChatComposerAttachmentsProps → XDSChatComposerDrawerProps
 * - JSX: <XDSChatComposerAttachments → <XDSChatComposerDrawer
 * - JSX: </XDSChatComposerAttachments> → </XDSChatComposerDrawer>
 * - Prop: attachments={...} → drawer={...} on XDSChatComposer
 * - Type refs: XDSChatComposerAttachmentsProps → XDSChatComposerDrawerProps
 * - CSS class: xds-chat-composer-attachments → xds-chat-composer-drawer (in strings)
 */

export const meta = {
  title: 'Rename XDSChatComposerAttachments to XDSChatComposerDrawer',
  description:
    'Renames `XDSChatComposerAttachments` component and type to `XDSChatComposerDrawer`, ' +
    'renames the `attachments` prop to `drawer` on `XDSChatComposer`, and updates ' +
    'CSS class references from `xds-chat-composer-attachments` to `xds-chat-composer-drawer`.',
  pr: '#1714',
};

const IMPORT_RENAMES = {
  XDSChatComposerAttachments: 'XDSChatComposerDrawer',
  XDSChatComposerAttachmentsProps: 'XDSChatComposerDrawerProps',
};

const CSS_CLASS_RENAMES = {
  'xds-chat-composer-attachments': 'xds-chat-composer-drawer',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // Track local names (handles aliased imports)
  const localToComponent = new Map();

  // --- 1. Rename imports ---
  root.find(j.ImportSpecifier).forEach((path) => {
    const importedName = path.node.imported.name;
    const newName = IMPORT_RENAMES[importedName];
    if (!newName) return;

    const localName = path.node.local.name;

    if (localName === importedName) {
      // import { XDSChatComposerAttachments } → import { XDSChatComposerDrawer }
      path.node.imported = j.identifier(newName);
      path.node.local = j.identifier(newName);
      localToComponent.set(newName, newName);
    } else {
      // import { XDSChatComposerAttachments as Foo } → import { XDSChatComposerDrawer as Foo }
      path.node.imported = j.identifier(newName);
      localToComponent.set(localName, newName);
    }
    hasChanges = true;
  });

  // --- 2. Rename JSX elements (opening + closing tags) ---
  for (const [oldName, newName] of Object.entries(IMPORT_RENAMES)) {
    if (oldName.endsWith('Props')) continue; // Skip type-only renames for JSX

    root
      .find(j.JSXIdentifier, {name: oldName})
      .forEach((path) => {
        const parent = path.parent.node;
        if (
          parent.type === 'JSXOpeningElement' ||
          parent.type === 'JSXClosingElement'
        ) {
          path.node.name = newName;
          hasChanges = true;
        }
      });
  }

  // --- 3. Rename `attachments` prop → `drawer` on XDSChatComposer ---
  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    const componentName = name.type === 'JSXIdentifier' ? name.name : null;
    if (componentName !== 'XDSChatComposer') return;

    const attrs = path.node.attributes;
    for (const attr of attrs) {
      if (
        attr.type === 'JSXAttribute' &&
        attr.name?.name === 'attachments'
      ) {
        attr.name = j.jsxIdentifier('drawer');
        hasChanges = true;
      }
    }
  });

  // --- 4. Rename type references ---
  root.find(j.TSTypeReference).forEach((path) => {
    const typeName = path.node.typeName;
    if (typeName.type === 'Identifier') {
      const newName = IMPORT_RENAMES[typeName.name];
      if (newName) {
        typeName.name = newName;
        hasChanges = true;
      }
    }
  });

  // Also handle plain Identifier references (e.g. typeof, React.ComponentProps<typeof X>)
  root.find(j.Identifier, {name: 'XDSChatComposerAttachments'}).forEach((path) => {
    const parent = path.parent.node;
    if (
      parent.type === 'ImportSpecifier' ||
      parent.type === 'JSXOpeningElement' ||
      parent.type === 'JSXClosingElement'
    ) {
      return;
    }
    path.node.name = 'XDSChatComposerDrawer';
    hasChanges = true;
  });

  root.find(j.Identifier, {name: 'XDSChatComposerAttachmentsProps'}).forEach((path) => {
    const parent = path.parent.node;
    if (parent.type === 'ImportSpecifier') return;
    path.node.name = 'XDSChatComposerDrawerProps';
    hasChanges = true;
  });

  // --- 5. Rename CSS class strings ---
  root.find(j.StringLiteral).forEach((path) => {
    for (const [oldClass, newClass] of Object.entries(CSS_CLASS_RENAMES)) {
      if (path.node.value.includes(oldClass)) {
        path.node.value = path.node.value.replace(
          new RegExp(oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          newClass,
        );
        hasChanges = true;
      }
    }
  });

  // Also check template literals
  root.find(j.TemplateLiteral).forEach((path) => {
    for (const quasi of path.node.quasis) {
      for (const [oldClass, newClass] of Object.entries(CSS_CLASS_RENAMES)) {
        if (quasi.value.raw.includes(oldClass)) {
          quasi.value.raw = quasi.value.raw.replace(
            new RegExp(oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            newClass,
          );
          quasi.value.cooked = quasi.value.cooked.replace(
            new RegExp(oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            newClass,
          );
          hasChanges = true;
        }
      }
    }
  });

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
