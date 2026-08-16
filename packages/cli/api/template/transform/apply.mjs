// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The template-transform engine.
 *
 * Integrations may declare a `templateTransform` module (see
 * `@astryxdesign/cli/authoring`). This engine applies those transforms to the
 * SOURCE STRING the template command emits — a pure output-layer that never
 * touches the templates on disk. The single declarative operation (`wrap`)
 * compiles to a jscodeshift transform (see `./jsx.mjs`) run through the shared
 * codemod safety net (`validateOutput` / `fixDirectiveCorruption` from the
 * codemod runner), so a transform can never emit unparseable source — on any
 * failure it degrades to the untransformed input and reports a warning.
 *
 * Isolation is per integration: a broken integration is skipped (warned) and the
 * remaining integrations still apply, in config order.
 *
 * @position api/template/transform — consumed by the show/copy leaves via
 *   template.mjs; wraps the codemod runner primitives.
 */

import {
  fixDirectiveCorruption,
  validateOutput,
} from '../../../assets/codemods/runner.mjs';
import {
  ensureImport,
  importBindingConflict,
  isValidWrapSpec,
  wrapDefaultExportReturn,
} from './jsx.mjs';

/**
 * @typedef {import('../../../authoring/template-transform/type').AstryxTemplateTransform} AstryxTemplateTransform
 * @typedef {import('../../../authoring/template-transform/type').AstryxTemplateContext} AstryxTemplateContext
 * @typedef {import('../../../authoring/codemod/type').JscodeshiftFactory} JscodeshiftFactory
 * @typedef {import('../../../authoring/codemod/type').CodemodTransform} CodemodTransform
 */

/**
 * A loaded, package-tagged template transform (as produced by
 * `Project.templateTransforms()`).
 * @typedef {object} LoadedTemplateTransform
 * @property {string} package owning integration package name
 * @property {AstryxTemplateTransform} transform the validated transform
 * @property {boolean} [skipOwnPackage] skip templates owned by `package`
 *   (default true; the default app shell sets it false)
 */

/**
 * A record of one integration's alteration to the emitted template, surfaced so
 * the CLI can tell the user (loudly) what happened and why.
 * @typedef {object} TemplateAlteration
 * @property {string} package the integration that applied the transform
 * @property {string[]} wrappers wrapper component names it added (outermost first)
 * @property {string} [description] the author's explanation of what/why, if provided
 */

/**
 * The resolved transform context the template dispatcher threads into the
 * show/copy leaves. `transforms` is already narrowed to those applicable to the
 * template being emitted, and `jscodeshift` is loaded (or the context is empty).
 * @typedef {object} TemplateTransformContext
 * @property {LoadedTemplateTransform[]} transforms
 * @property {JscodeshiftFactory | null} jscodeshift
 * @property {AstryxTemplateContext} template
 * @property {(message: string) => void} [onWarn]
 * @property {(alterations: TemplateAlteration[]) => void} [onAlter] called once,
 *   with the applied alterations, when at least one transform changed the source
 * @property {() => void} [onNoop] called instead of `onAlter` when transforms
 *   were applicable but none changed the source
 */

/**
 * Apply a resolved {@link TemplateTransformContext} to a source string. A thin
 * wrapper over {@link applyTemplateTransforms} that no-ops (returns the input
 * with an empty `transformedBy`) when the context has nothing to apply, so the
 * show/copy leaves don't each repeat the guard. The emitted source is NOT
 * annotated — alterations are surfaced out-of-band via `ctx.onAlter` (the CLI
 * turns that into a prominent notice), leaving the source itself clean.
 *
 * @param {string} source
 * @param {string} filePath absolute path of the template source (for the parser)
 * @param {TemplateTransformContext} [ctx]
 * @returns {{source: string, transformedBy: string[]}}
 */
export function applyTransformContext(source, filePath, ctx) {
  if (!ctx || !ctx.transforms || ctx.transforms.length === 0 || !ctx.jscodeshift) {
    return {source, transformedBy: []};
  }
  const result = applyTemplateTransforms(source, {
    filePath,
    template: ctx.template,
    transforms: ctx.transforms,
    jscodeshift: ctx.jscodeshift,
    onWarn: ctx.onWarn,
  });
  // A transform was applicable but changed nothing — for the app shell that
  // means the template already renders one, which the caller reports instead of
  // claiming a wrap that did not happen.
  if (result.alterations.length > 0) ctx.onAlter?.(result.alterations);
  else ctx.onNoop?.();
  return {source: result.source, transformedBy: result.transformedBy};
}

/**
 * Decide whether a transform applies to a given template. A transform never
 * rewrites its OWNER's own templates (the author can bake those in directly) and
 * only applies to the configured `appliesTo.types` (default page-only).
 *
 * @param {LoadedTemplateTransform} entry
 * @param {AstryxTemplateContext} template
 * @returns {boolean}
 */
export function isTransformApplicable(entry, template) {
  if (!entry || !entry.transform || !template) return false;
  const wrap = entry.transform.wrap;
  const hasWrap = Array.isArray(wrap) ? wrap.length > 0 : Boolean(wrap);
  if (!hasWrap) return false;
  // A transform never rewrites its OWNER's own templates — an integration's
  // templates already account for its shell. The default app shell opts out
  // (`skipOwnPackage: false`): core's shell wrapping core's templates is
  // precisely the point.
  if (
    entry.skipOwnPackage !== false &&
    entry.package &&
    entry.package === template.package
  ) {
    return false;
  }

  const scope = entry.transform.appliesTo ?? {};
  const types = scope.types ?? ['page'];
  if (!types.includes(template.type)) return false;
  if (
    Array.isArray(scope.packages) &&
    !scope.packages.includes(template.package)
  ) {
    return false;
  }
  if (
    Array.isArray(scope.exclude) &&
    scope.exclude.some(glob => globMatch(glob, template.id))
  ) {
    return false;
  }
  if (
    Array.isArray(scope.include) &&
    !scope.include.some(glob => globMatch(glob, template.id))
  ) {
    return false;
  }
  return true;
}

/** Escape a string for literal use inside a RegExp. */
function escapeRegExp(/** @type {string} */ s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Match a template id against a simple glob where `*` is a wildcard
 * (e.g. `marketing/*`, `login-*`). Anchored full-string match.
 * @param {string} glob
 * @param {string} value
 * @returns {boolean}
 */
function globMatch(glob, value) {
  const pattern = glob.split('*').map(escapeRegExp).join('.*');
  return new RegExp(`^${pattern}$`).test(value);
}

/**
 * Compile a transform's declarative operation(s) into a single jscodeshift
 * transform following the `(file, api) => string | null` contract. Returns null
 * when the transform declares nothing to do.
 *
 * @param {AstryxTemplateTransform} transform
 * @returns {CodemodTransform | null}
 */
export function buildDeclarativeTransform(transform) {
  const {wrap, skipIfRootIs = []} = transform;
  const wraps = Array.isArray(wrap) ? wrap : wrap ? [wrap] : [];
  if (wraps.length === 0) return null;
  // Defense in depth for direct callers (the authoring parser already rejects
  // these): a spec with no module would emit a wrapper nothing imports, and a
  // component name that isn't a plain identifier could splice syntax into the
  // opening tag. Neither is recoverable, so the transform declares nothing.
  if (!wraps.every(isValidWrapSpec)) return null;

  return function declarativeTransform(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);

    const wrapped = wrapDefaultExportReturn(j, root, wraps, skipIfRootIs);
    if (!wrapped) return null;

    // Every wrapper must be bindable. Throwing here discards the in-progress
    // rewrite (the runner keeps the original source) and surfaces a precise
    // reason, which beats emitting a double declaration and relying on the
    // parser to notice.
    for (const w of wraps) {
      if (importBindingConflict(j, root, {from: w.from, name: w.component})) {
        throw new Error(
          `cannot import "${w.component}" from "${w.from}" — "${w.component}" is already bound in this template`,
        );
      }
    }

    // Each wrapper's import travels with the wrap — component + from is one unit.
    for (const w of wraps) {
      const importSpec =
        w.importKind === 'default'
          ? {from: w.from, default: w.component}
          : {from: w.from, named: [w.component]};
      ensureImport(j, root, importSpec);
    }

    return root.toSource({quote: 'single', objectCurlySpacing: false});
  };
}

/**
 * Run one transform against a source string, with the shared codemod safety
 * net. Never throws: a thrown transform or invalid output is reported via
 * `error` and the original source is returned unchanged.
 *
 * @param {string} source
 * @param {object} ctx
 * @param {string} ctx.filePath
 * @param {CodemodTransform} ctx.transform
 * @param {JscodeshiftFactory} ctx.jscodeshift
 * @returns {{source: string, changed: boolean, error?: string}}
 */
export function runTransformOnSource(source, {filePath, transform, jscodeshift}) {
  try {
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    let result = transform({source, path: filePath}, api);

    if (result == null || result === source) return {source, changed: false};

    result = fixDirectiveCorruption(result);
    const validation = validateOutput(result, source, j, {parse: true});
    if (!validation.valid) {
      return {source, changed: false, error: validation.reason};
    }
    return {source: result, changed: true};
  } catch (err) {
    return {
      source,
      changed: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Apply the applicable integration transforms to a template's source, in config
 * order. A broken integration is skipped (warned) and never blocks the others.
 *
 * @param {string} source the (already asset-stripped, for copy) template source
 * @param {object} ctx
 * @param {string} ctx.filePath absolute path of the template source (for the parser)
 * @param {AstryxTemplateContext} ctx.template the template being emitted
 * @param {LoadedTemplateTransform[]} ctx.transforms candidate transforms (config order)
 * @param {JscodeshiftFactory} ctx.jscodeshift jscodeshift factory
 * @param {(message: string) => void} [ctx.onWarn] sink for non-fatal warnings
 * @returns {{source: string, transformedBy: string[], alterations: TemplateAlteration[]}}
 */
export function applyTemplateTransforms(
  source,
  {filePath, template, transforms = [], jscodeshift, onWarn},
) {
  let current = source;
  /** @type {string[]} */
  const transformedBy = [];
  /** @type {TemplateAlteration[]} */
  const alterations = [];

  for (const entry of transforms) {
    if (!isTransformApplicable(entry, template)) continue;

    const transform = buildDeclarativeTransform(entry.transform);
    if (!transform) continue;

    const res = runTransformOnSource(current, {
      filePath,
      transform,
      jscodeshift,
    });
    if (res.error) {
      onWarn?.(
        `Template transform from "${entry.package}" failed on "${template.id}": ${res.error}. Emitting untransformed source.`,
      );
      continue;
    }
    if (res.changed) {
      current = res.source;
      transformedBy.push(entry.package);
      const wrap = entry.transform.wrap;
      const wraps = Array.isArray(wrap) ? wrap : wrap ? [wrap] : [];
      alterations.push({
        package: entry.package,
        wrappers: wraps.map(w => w.component),
        description: entry.transform.description,
      });
    }
  }

  return {source: current, transformedBy, alterations};
}
