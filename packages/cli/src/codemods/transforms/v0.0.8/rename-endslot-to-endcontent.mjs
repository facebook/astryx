/**
 * @file Codemod: Rename XDSButton endSlot to endContent
 * @see https://github.com/facebookexperimental/xds/pull/895
 *
 * XDSButton's `endSlot` prop was renamed to `endContent` to align with
 * the naming convention used by all other XDS components (ListItem,
 * Banner, Dialog, SideNav, Token, TopNav). The type was also widened
 * from `ReactElement<XDSIconProps | XDSBadgeProps>` to `ReactNode`.
 *
 * This codemod handles:
 * 1. JSX prop rename: <XDSButton endSlot={...} /> → <XDSButton endContent={...} />
 * 2. Object property rename in spread patterns: { endSlot: ... } → { endContent: ... }
 *    (covers DropdownMenu button prop objects like `button={{ endSlot: <Badge /> }}`)
 * 3. Destructuring rename: const { endSlot } = props → const { endContent } = props
 */

export const meta = {
  title: 'Rename Button endSlot → endContent',
  description:
    'Renames the `endSlot` prop on XDSButton to `endContent`. Also renames `endSlot` in object literals passed to components that forward props to XDSButton (e.g., XDSDropdownMenu button prop).',
  pr: '#895',
};

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // 1. Rename JSX prop: <XDSButton endSlot={...} /> → <XDSButton endContent={...} />
  root.find(j.JSXAttribute, {name: {name: 'endSlot'}}).forEach((path) => {
    path.node.name.name = 'endContent';
    hasChanges = true;
  });

  // 2. Rename in all Identifier nodes named 'endSlot' that are object keys
  //    This covers both Property and ObjectProperty (parser-dependent),
  //    object literals, destructuring patterns, etc.
  root.find(j.Identifier, {name: 'endSlot'}).forEach((path) => {
    const parent = path.parent.node;

    // Object property key: { endSlot: value } or { endSlot } (shorthand)
    const isPropertyKey =
      (parent.type === 'Property' || parent.type === 'ObjectProperty') &&
      parent.key === path.node;

    if (isPropertyKey) {
      path.node.name = 'endContent';
      // If shorthand, also rename the value identifier
      if (parent.shorthand && parent.value?.type === 'Identifier' && parent.value.name === 'endSlot') {
        parent.value.name = 'endContent';
      }
      hasChanges = true;
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
