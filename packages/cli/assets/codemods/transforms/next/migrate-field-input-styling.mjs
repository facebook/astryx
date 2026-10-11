// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Migrate root styling on Field-composed inputs to their named parts.
 *
 * Field-composed inputs no longer accept root `xstyle`, `className`, or
 * `style` (family:input-fields FR10). Each rename keeps the element the
 * styling reached before: components whose root styling painted the visual
 * control box move to `controlXstyle`/`controlClassName`/`controlStyle`;
 * components whose root styling reached the Field box move to
 * `containerXstyle`/`containerClassName`/`containerStyle`.
 *
 * Only JSX attributes written directly on an element bound to an Astryx import
 * are renamed (named, aliased, or namespace imports). Spread attributes,
 * wrappers that forward their own props, and unrelated components of the same
 * name are left alone; those callsites fail type-checking and are migrated by
 * hand. When the target attribute is already present, the root attribute gets a
 * TODO instead of a rename so no value is silently dropped.
 */

export const meta = {
  title: 'Migrate input root styling to container/control parts',
  description:
    'Renames root `xstyle`/`className`/`style` on Field-composed inputs to the `control*` or `container*` part they styled before.',
  fileExtensions: ['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs'],
};

/** Components whose root styling painted the visual control box. */
const CONTROL_COMPONENTS = [
  'TextInput',
  'TextArea',
  'NumberInput',
  'FileInput',
  'DateInput',
  'DateRangeInput',
  'DateTimeInput',
  'TimeInput',
  'Selector',
  'MultiSelector',
  'ComplexSelector',
];

/** Components whose root styling reached the Field box. */
const CONTAINER_COMPONENTS = [
  'Typeahead',
  'Tokenizer',
  'CheckboxList',
  'RadioList',
  'Slider',
];

/** @type {ReadonlyMap<string, 'control' | 'container'>} */
const PART_BY_COMPONENT = new Map([
  ...CONTROL_COMPONENTS.map(name => /** @type {const} */ ([name, 'control'])),
  ...CONTAINER_COMPONENTS.map(
    name => /** @type {const} */ ([name, 'container']),
  ),
]);

const ROOT_STYLE_PROPS = /** @type {const} */ ({
  xstyle: 'Xstyle',
  className: 'ClassName',
  style: 'Style',
});

const PACKAGE_PATTERN = /^@(astryxdesign|xds)\/core(\/[A-Za-z]+)?$/u;

const TODO =
  ' TODO(astryx upgrade): root styling is no longer accepted here; merge it into ';

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | undefined}
 */
export default function migrateFieldInputStyling(file, api) {
  if (!/xstyle|className|style/u.test(file.source)) return undefined;
  if (![...PART_BY_COMPONENT.keys()].some(name => file.source.includes(name))) {
    return undefined;
  }

  const j = api.jscodeshift;
  const root = j(file.source);
  /** @type {Map<string, 'control' | 'container'>} */
  const localParts = new Map();
  /** @type {Set<string>} */
  const namespaces = new Set();

  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    const source = path.node.source.value;
    if (typeof source !== 'string' || !PACKAGE_PATTERN.test(source)) return;
    if (path.node.importKind === 'type') return;
    for (const specifier of path.node.specifiers ?? []) {
      if (specifier.type === 'ImportSpecifier') {
        if (specifier.importKind === 'type') continue;
        const part = PART_BY_COMPONENT.get(specifier.imported.name);
        if (part) {
          localParts.set(
            specifier.local?.name ?? specifier.imported.name,
            part,
          );
        }
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
        namespaces.add(specifier.local.name);
      }
    }
  });
  if (localParts.size === 0 && namespaces.size === 0) return undefined;

  /** @param {any} name */
  const partFor = name => {
    if (name.type === 'JSXIdentifier') return localParts.get(name.name);
    if (
      name.type === 'JSXMemberExpression' &&
      name.object.type === 'JSXIdentifier' &&
      namespaces.has(name.object.name) &&
      name.property.type === 'JSXIdentifier'
    ) {
      return PART_BY_COMPONENT.get(name.property.name);
    }
    return undefined;
  };

  let changed = false;
  root.find(j.JSXOpeningElement).forEach((/** @type {any} */ path) => {
    const part = partFor(path.node.name);
    if (!part) return;
    const attributes = path.node.attributes ?? [];
    const present = new Set(
      attributes
        .filter((/** @type {any} */ a) => a.type === 'JSXAttribute')
        .map((/** @type {any} */ a) => a.name.name),
    );
    for (const attribute of attributes) {
      if (attribute.type !== 'JSXAttribute') continue;
      const name = attribute.name?.name;
      if (!Object.hasOwn(ROOT_STYLE_PROPS, name)) continue;
      const next =
        part +
        ROOT_STYLE_PROPS[/** @type {keyof typeof ROOT_STYLE_PROPS} */ (name)];
      if (present.has(next)) {
        const comment = `${TODO}\`${next}\`. `;
        attribute.comments ??= [];
        if (
          !attribute.comments.some(
            (/** @type {any} */ c) => c.value === comment,
          )
        ) {
          attribute.comments.push(j.commentBlock(comment, true, false));
          changed = true;
        }
        continue;
      }
      attribute.name = j.jsxIdentifier(next);
      present.add(next);
      changed = true;
    }
  });

  return changed ? root.toSource({quote: 'single'}) : undefined;
}
