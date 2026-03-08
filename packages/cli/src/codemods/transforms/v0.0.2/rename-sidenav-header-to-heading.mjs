/**
 * @file Codemod: Rename XDSSideNavHeader → XDSSideNavHeading, rename props
 * @see https://github.com/facebookexperimental/xds/pull/527
 *
 * - Renames props on XDSSideNavHeader and XDSSideNavHeading:
 *   title → heading, titleHref → headingHref,
 *   supertitle → superheading, supertitleHref → superheadingHref,
 *   subtitle → subheading, subtitleHref → subheadingHref
 * - Renames <XDSSideNavHeader> to <XDSSideNavHeading> (JSX element name)
 * - Renames XDSSideNavHeader to XDSSideNavHeading in import specifiers
 * - Renames XDSSideNavHeaderProps to XDSSideNavHeadingProps in type imports
 */

export const meta = {
  title:
    'Rename SideNav header → heading, XDSSideNavHeader → XDSSideNavHeading',
  description:
    'Renames props (title → heading, titleHref → headingHref, supertitle → superheading, etc.) on XDSSideNavHeader/XDSSideNavHeading, renames the component, and updates import specifiers.',
  pr: '#527',
};

const TARGET_COMPONENTS = new Set([
  'XDSSideNavHeader',
  'XDSSideNavHeading',
]);

const PROP_RENAMES = {
  title: 'heading',
  titleHref: 'headingHref',
  supertitle: 'superheading',
  supertitleHref: 'superheadingHref',
  subtitle: 'subheading',
  subtitleHref: 'subheadingHref',
};

const IMPORT_RENAMES = {
  XDSSideNavHeader: 'XDSSideNavHeading',
  XDSSideNavHeaderProps: 'XDSSideNavHeadingProps',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // 1. Rename props on target components
  root.find(j.JSXOpeningElement).forEach((path) => {
    const name = path.node.name;
    if (name.type !== 'JSXIdentifier' || !TARGET_COMPONENTS.has(name.name)) {
      return;
    }

    path.node.attributes.forEach((attr) => {
      if (attr.type === 'JSXAttribute' && attr.name.name in PROP_RENAMES) {
        attr.name.name = PROP_RENAMES[attr.name.name];
        hasChanges = true;
      }
    });
  });

  // 2. Rename <XDSSideNavHeader> to <XDSSideNavHeading> (opening and closing tags)
  root.find(j.JSXIdentifier, {name: 'XDSSideNavHeader'}).forEach((path) => {
    path.node.name = 'XDSSideNavHeading';
    hasChanges = true;
  });

  // 3. Rename import specifiers
  root.find(j.ImportSpecifier).forEach((path) => {
    const imported = path.node.imported;
    if (imported.type === 'Identifier' && imported.name in IMPORT_RENAMES) {
      const oldName = imported.name;
      const newName = IMPORT_RENAMES[oldName];
      imported.name = newName;
      if (path.node.local && path.node.local.name === oldName) {
        path.node.local.name = newName;
      }
      hasChanges = true;
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
