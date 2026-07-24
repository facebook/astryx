// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename Table render-prop `styles` field to `xstyle`
 *
 * As of v0.1.7, the Table plugin render-prop interfaces
 * (`TableRenderProps`, `HeaderRowRenderProps`, `HeaderCellRenderProps`,
 * `BodyRowRenderProps`, `BodyCellRenderProps`, `ScrollWrapperRenderProps`)
 * and the `scrollWrapper` component contract renamed their StyleX array
 * field `styles` -> `xstyle`, matching the prop name sub-components
 * receive it under.
 *
 * Custom plugin authors read `props.styles` and write `styles: [...]`
 * inside their transform functions (`transformTable`, `transformHeaderRow`,
 * `transformHeaderCell`, `transformBodyRow`, `transformBodyCell`,
 * `transformScrollWrapper`). This codemod renames those reads and writes.
 *
 * A blind global `styles` rename is unsafe — `styles` is also the
 * conventional local name for a `stylex.create({...})` bag, which is
 * unrelated. So this transform only rewrites `styles` when it is
 * *scoped to a render-prop object*: a function parameter (or a variable)
 * whose TypeScript type annotation is one of the render-prop interfaces.
 * Within such a scope it rewrites:
 *
 *   - `<param>.styles`            -> `<param>.xstyle`   (member reads/writes)
 *   - `{ ..., styles: [...] }`    -> `{ ..., xstyle: [...] }`
 *     for object literals that carry the render-prop shape (a sibling
 *     `htmlProps` key), and object literals assigned/spread from the
 *     tracked render-prop binding.
 *
 * Ambiguous cases that can't be resolved from types alone (e.g. a
 * render-prop object passed through an untyped variable, or a `styles`
 * bag from `stylex.create`) are left untouched, so the transform never
 * renames an unrelated `styles`. This mirrors the conservative,
 * scope-limited approach of the sibling
 * `migrate-table-tableprops-to-direct-props` codemod.
 */

export const meta = {
  title: 'Rename Table render-prop `styles` field to `xstyle`',
  description:
    'Renames the `styles` StyleX-array field to `xstyle` on Table plugin ' +
    'render-prop objects (TableRenderProps, HeaderRowRenderProps, ' +
    'HeaderCellRenderProps, BodyRowRenderProps, BodyCellRenderProps, ' +
    'ScrollWrapperRenderProps) inside plugin transform functions. Reads ' +
    '(`props.styles`) and writes (`styles: [...]`) are renamed; unrelated ' +
    '`styles` bindings (e.g. from stylex.create) are left untouched.',
};

/** The render-prop interface type names whose `styles` field became `xstyle`. */
const RENDER_PROP_TYPES = new Set([
  'TableRenderProps',
  'HeaderRowRenderProps',
  'HeaderCellRenderProps',
  'BodyRowRenderProps',
  'BodyCellRenderProps',
  'ScrollWrapperRenderProps',
]);

/** Resolve the base type name from a TS type annotation node. */
function typeNameOf(typeAnnotation) {
  // `x: TableRenderProps`
  const t = typeAnnotation?.typeAnnotation ?? typeAnnotation;
  if (!t) return null;
  if (t.type === 'TSTypeReference' && t.typeName?.type === 'Identifier') {
    return t.typeName.name;
  }
  return null;
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // --- 1. Collect binding names typed as a render-prop interface. ---
  // Function/arrow params: (props: TableRenderProps) => ...
  const renderPropBindings = new Set();

  function collectParam(param) {
    if (
      param.type === 'Identifier' &&
      RENDER_PROP_TYPES.has(typeNameOf(param.typeAnnotation))
    ) {
      renderPropBindings.add(param.name);
    }
  }

  root
    .find(j.Function)
    .forEach((p) => (p.node.params ?? []).forEach(collectParam));
  root
    .find(j.FunctionDeclaration)
    .forEach((p) => (p.node.params ?? []).forEach(collectParam));
  root
    .find(j.FunctionExpression)
    .forEach((p) => (p.node.params ?? []).forEach(collectParam));
  root
    .find(j.ArrowFunctionExpression)
    .forEach((p) => (p.node.params ?? []).forEach(collectParam));

  // Variable declarations: `const rp: BodyCellRenderProps = ...`
  root.find(j.VariableDeclarator).forEach((p) => {
    const id = p.node.id;
    if (
      id?.type === 'Identifier' &&
      RENDER_PROP_TYPES.has(typeNameOf(id.typeAnnotation))
    ) {
      renderPropBindings.add(id.name);
    }
  });

  const hasTypedBinding = renderPropBindings.size > 0;

  // Also detect object literals that are structurally a render-prop object.
  // Two shapes qualify:
  //  1. An `htmlProps` sibling key alongside a `styles`/`xstyle` key — the
  //     literal shape a transform function returns from scratch.
  //  2. A spread of a tracked render-prop binding (`{...props, styles: [...]}`)
  //     — the common "carry the render-prop object forward, override styles"
  //     shape. (Only counts when `renderPropBindings` is non-empty.)
  function isRenderPropShapedObject(objExpr) {
    if (objExpr.type !== 'ObjectExpression') return false;
    const keyNames = objExpr.properties
      .map((pr) =>
        pr.type === 'ObjectProperty' || pr.type === 'Property'
          ? pr.key?.name ?? pr.key?.value
          : null,
      )
      .filter(Boolean);
    if (keyNames.includes('htmlProps') && keyNames.includes('styles')) {
      return true;
    }
    // Spread of a tracked render-prop binding.
    const spreadsRenderProp = objExpr.properties.some(
      (pr) =>
        (pr.type === 'SpreadElement' || pr.type === 'ExperimentalSpreadProperty') &&
        pr.argument?.type === 'Identifier' &&
        renderPropBindings.has(pr.argument.name),
    );
    return spreadsRenderProp && keyNames.includes('styles');
  }

  if (!hasTypedBinding) {
    // Nothing is typed as a render-prop interface. Only rewrite clearly
    // render-prop-shaped object literals (htmlProps + styles siblings);
    // never touch bare `styles` in this file (too ambiguous).
    let touched = false;
    root.find(j.ObjectExpression).forEach((p) => {
      if (!isRenderPropShapedObject(p.node)) return;
      for (const prop of p.node.properties) {
        if (
          (prop.type === 'ObjectProperty' || prop.type === 'Property') &&
          !prop.computed &&
          prop.key?.type === 'Identifier' &&
          prop.key.name === 'styles'
        ) {
          prop.key.name = 'xstyle';
          touched = true;
        }
      }
    });
    if (!touched) return undefined;
    return root.toSource({quote: 'single'});
  }

  // --- 2. Rewrite `<binding>.styles` member access -> `.xstyle`. ---
  root.find(j.MemberExpression).forEach((p) => {
    const {object, property, computed} = p.node;
    if (computed) return;
    if (property?.type !== 'Identifier' || property.name !== 'styles') return;
    if (object?.type !== 'Identifier' || !renderPropBindings.has(object.name)) {
      return;
    }
    property.name = 'xstyle';
    hasChanges = true;
  });

  // --- 3. Rewrite `styles:` keys on render-prop-shaped object literals. ---
  root.find(j.ObjectExpression).forEach((p) => {
    if (!isRenderPropShapedObject(p.node)) return;
    for (const prop of p.node.properties) {
      if (
        (prop.type === 'ObjectProperty' || prop.type === 'Property') &&
        !prop.computed &&
        prop.key?.type === 'Identifier' &&
        prop.key.name === 'styles'
      ) {
        prop.key.name = 'xstyle';
        hasChanges = true;
      }
    }
  });

  if (!hasChanges) return undefined;
  return root.toSource({quote: 'single'});
}
