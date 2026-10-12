// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Migrate a raw `InternationalizationContext` value to the provider.
 *
 * Rendering a value straight into `InternationalizationContext` no longer
 * configures Astryx: `useLocale`, `useDirection`, `useCollator` and every
 * core component read a runtime context that only `InternationalizationProvider`
 * writes. The provider takes the same configuration under its own prop names,
 * so the rewrite is mechanical:
 *
 *   <InternationalizationContext value={v}>        → <InternationalizationProvider
 *   <InternationalizationContext.Provider value={v}>   locale={v.locale}
 *                                                      dir={v.direction}
 *                                                      messages={v.messages}
 *                                                      overrides={v.overrides}>
 *
 * An inline object literal maps key by key and keeps only the keys it has. A
 * `translate` key has no provider input — the provider resolves from
 * `messages` and `overrides` — so it is left behind a TODO rather than
 * dropped. Only elements bound to an Astryx import are rewritten (named,
 * aliased, or namespace); the import gains `InternationalizationProvider`
 * when the file does not already have it, and loses the context import when
 * nothing else reads it.
 */

const PACKAGE_PATTERN = /^@(astryxdesign|xds)\/core(\/i18n)?$/u;
const CONTEXT = 'InternationalizationContext';
const PROVIDER = 'InternationalizationProvider';

/** Context value key → provider prop. */
const PROP_FOR_KEY = new Map([
  ['locale', 'locale'],
  ['direction', 'dir'],
  ['messages', 'messages'],
  ['overrides', 'overrides'],
]);

const TODO =
  ' TODO(astryx upgrade): InternationalizationProvider has no `translate` input; ' +
  'express these strings as `messages` (per locale) or `overrides`. ';

export const meta = {
  title:
    'Migrate a raw InternationalizationContext value to InternationalizationProvider',
  description:
    'Rewrites `<InternationalizationContext value={…}>` (or its `.Provider`) to `<InternationalizationProvider locale dir messages overrides>`, the only way to configure Astryx.',
  fileExtensions: ['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs'],
};

/**
 * @param {import('../../../../authoring/codemod/type').AstryxCodemodFile} file
 * @param {import('../../../../authoring/codemod/type').CodemodTransformApi} api
 * @returns {string | undefined}
 */
export default function migrateInternationalizationContext(file, api) {
  if (!file.source.includes(CONTEXT)) return undefined;

  const j = api.jscodeshift;
  const root = j(file.source);

  // Local names bound to the Astryx context (named/aliased) and namespaces.
  /** @type {Set<string>} */
  const contextNames = new Set();
  /** @type {Set<string>} */
  const namespaceNames = new Set();
  /** @type {any[]} */
  const astryxImports = [];
  root.find(j.ImportDeclaration).forEach((/** @type {any} */ path) => {
    const source = path.node.source.value;
    if (path.node.importKind === 'type') return;
    if (typeof source !== 'string' || !PACKAGE_PATTERN.test(source)) return;
    astryxImports.push(path);
    for (const specifier of path.node.specifiers ?? []) {
      if (specifier.importKind === 'type') continue;
      if (
        specifier.type === 'ImportSpecifier' &&
        specifier.imported?.name === CONTEXT
      ) {
        contextNames.add(specifier.local?.name ?? CONTEXT);
      } else if (specifier.type === 'ImportNamespaceSpecifier') {
        namespaceNames.add(specifier.local.name);
      }
    }
  });
  if (contextNames.size === 0 && namespaceNames.size === 0) return undefined;

  /**
   * The namespace a JSX name renders the context through, or `''` for a
   * named binding, or null when the element is not the Astryx context.
   * Accepts `Ctx`, `Ctx.Provider`, `ns.Ctx` and `ns.Ctx.Provider`.
   * @param {any} name a JSXOpeningElement name
   * @returns {string | null}
   */
  const contextNamespaceOf = name => {
    // Peel a trailing `.Provider`.
    if (
      name.type === 'JSXMemberExpression' &&
      name.property?.type === 'JSXIdentifier' &&
      name.property.name === 'Provider'
    ) {
      name = name.object;
    }
    if (name.type === 'JSXIdentifier') {
      return contextNames.has(name.name) ? '' : null;
    }
    if (
      name.type === 'JSXMemberExpression' &&
      name.object?.type === 'JSXIdentifier' &&
      name.property?.type === 'JSXIdentifier' &&
      name.property.name === CONTEXT &&
      namespaceNames.has(name.object.name)
    ) {
      return name.object.name;
    }
    return null;
  };

  let changed = false;
  let needsNamedProvider = false;
  root.find(j.JSXElement).forEach((/** @type {any} */ path) => {
    const opening = path.node.openingElement;
    const namespace = contextNamespaceOf(opening.name);
    if (namespace === null) return;
    const valueAttribute = (opening.attributes ?? []).find(
      (/** @type {any} */ a) =>
        a.type === 'JSXAttribute' && a.name?.name === 'value',
    );
    if (
      !valueAttribute ||
      valueAttribute.value?.type !== 'JSXExpressionContainer'
    ) {
      return;
    }
    const value = valueAttribute.value.expression;

    /** @type {any[]} */
    const props = [];
    /** @type {any[]} */
    const leftovers = [];
    if (value.type === 'ObjectExpression') {
      for (const property of value.properties) {
        const key =
          property.type === 'Property' || property.type === 'ObjectProperty'
            ? (property.key.name ?? property.key.value)
            : null;
        const prop = key == null ? null : PROP_FOR_KEY.get(key);
        if (prop == null) {
          leftovers.push(property);
          continue;
        }
        const expression =
          property.shorthand && property.value.type === 'Identifier'
            ? property.value
            : property.value;
        props.push(
          j.jsxAttribute(
            j.jsxIdentifier(prop),
            j.jsxExpressionContainer(expression),
          ),
        );
      }
    } else {
      for (const [key, prop] of PROP_FOR_KEY) {
        props.push(
          j.jsxAttribute(
            j.jsxIdentifier(prop),
            j.jsxExpressionContainer(
              j.memberExpression(value, j.identifier(key)),
            ),
          ),
        );
      }
    }

    const providerName =
      namespace === ''
        ? j.jsxIdentifier(PROVIDER)
        : j.jsxMemberExpression(
            j.jsxIdentifier(namespace),
            j.jsxIdentifier(PROVIDER),
          );
    if (namespace === '') needsNamedProvider = true;

    const otherAttributes = (opening.attributes ?? []).filter(
      (/** @type {any} */ a) => a !== valueAttribute,
    );
    opening.name = providerName;
    opening.attributes = [...otherAttributes, ...props];
    if (path.node.closingElement) {
      path.node.closingElement.name = providerName;
    }
    if (leftovers.length > 0) {
      // Keep what has no provider input in sight, behind a TODO.
      const kept = j.jsxExpressionContainer(j.objectExpression(leftovers));
      const attribute = j.jsxAttribute(
        j.jsxIdentifier('data-astryx-upgrade-leftover'),
        kept,
      );
      attribute.comments = [j.commentBlock(TODO, true, false)];
      opening.attributes.push(attribute);
    }
    changed = true;
  });

  if (!changed) return undefined;

  // Imports: add the provider beside the context; drop the context when the
  // file no longer names it.
  const stillReadsContext = (/** @type {string} */ localName) =>
    root
      .find(j.Identifier, {name: localName})
      .filter((/** @type {any} */ p) => {
        const parent = p.parent?.node;
        return !(
          parent &&
          (parent.type === 'ImportSpecifier' || parent.type === 'JSXIdentifier')
        );
      })
      .size() > 0 || root.find(j.JSXIdentifier, {name: localName}).size() > 0;

  if (needsNamedProvider) {
    const hasProvider = astryxImports.some((/** @type {any} */ path) =>
      (path.node.specifiers ?? []).some(
        (/** @type {any} */ s) =>
          s.type === 'ImportSpecifier' && s.imported?.name === PROVIDER,
      ),
    );
    for (const path of astryxImports) {
      const specifiers = path.node.specifiers ?? [];
      const contextSpecifier = specifiers.find(
        (/** @type {any} */ s) =>
          s.type === 'ImportSpecifier' && s.imported?.name === CONTEXT,
      );
      if (!contextSpecifier) continue;
      if (!hasProvider) {
        specifiers.push(
          j.importSpecifier(j.identifier(PROVIDER), j.identifier(PROVIDER)),
        );
      }
      const localName = contextSpecifier.local?.name ?? CONTEXT;
      if (!stillReadsContext(localName)) {
        path.node.specifiers = specifiers.filter(
          (/** @type {any} */ s) => s !== contextSpecifier,
        );
      }
      break;
    }
  }

  return root.toSource({quote: 'single'});
}
