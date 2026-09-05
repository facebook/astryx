// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Theme-drift diagnostics for `astryx doctor`.
 *
 * These checks answer one question: will this app actually respond when the
 * theme changes? Anything that would not move under a different theme is, by
 * definition, not themed — and the cases here are the ones where that is both
 * unambiguous and cheap to detect from text alone.
 *
 * Everything in this file is read-only. No module is imported or evaluated,
 * nothing is written, and the scan is bounded, so it stays safe to run in CI
 * and cheap enough to sit in the default `doctor` run.
 *
 * @input  A project directory.
 * @output {DoctorCheck} records appended to the doctor report.
 * @position api/doctor leaf — consumed by doctor.mjs via CHECKS.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import {collectThemingTargets} from '../../foundation/discovery/theming-targets.mjs';
import {loadComponentDoc} from '../../foundation/discovery/component-loader.mjs';
import {findCoreDir} from '../../foundation/fs/paths.mjs';
import {getCliInvocation} from '../../foundation/env/package-manager.mjs';
import {styleXCompilerFor} from '../../foundation/discovery/stylex-compiler.mjs';

/**
 * Directories that never contain hand-authored consumer source.
 *
 * This list governs the CSS-escape and swizzle scans, which look for what a
 * PERSON wrote — build output is correctly excluded there. The built-theme
 * scan is the opposite question ("where did the tool write?") and uses its own,
 * narrower list, because `theme build --out ./dist/ocean.css` is documented.
 */
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', 'coverage', '.turbo', '.cache',
]);

/** Bound the walk so a huge monorepo cannot turn `doctor` into a long job. */
const MAX_FILES = 400;

/**
 * A bare class chained onto a stable component class is only the deprecated
 * selector surface if it is a real prop value or state — `.astryx-card.promo`
 * is just the consumer's own class. Both facts, and the `data-*` attribute
 * that replaces it, come from the component docs via
 * {@link collectThemingTargets}, so nothing here is a second registry that can
 * drift from the components.
 *
 * Resolved lazily: the enumeration costs ~300ms, which is far too much for the
 * clean path, so it is only paid once a selector actually needs naming.
 *
 * Keyed by core directory, so two projects in one process cannot read each
 * other's component set.
 *
 * @type {Map<string, Promise<Map<string, import('../../foundation/discovery/theming-targets.mjs').ThemingTarget>>>}
 */
const targetsByCore = new Map();

/** @param {string} coreSrc */
function themingTargets(coreSrc) {
  let pending = targetsByCore.get(coreSrc);
  if (!pending) {
    pending = collectThemingTargets(coreSrc).then(
      list => new Map(list.map(t => [t.key, t])),
      () => new Map(),
    );
    targetsByCore.set(coreSrc, pending);
  }
  return pending;
}

/** `listStyle` -> `list-style`, matching toDataAttributeName in core. */
const kebab = (/** @type {string} */ s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Work out which `data-*` attribute replaces a bare prop/state class.
 *
 * Components reflect the prop *key*, not a fixed name: `.active` on a
 * pagination dot is `[data-active="active"]`, because Pagination renders
 * `themeProps('pagination-dot', {active: 'active'})`. Always naming
 * `data-variant` produced advice that silently matches nothing.
 *
 * Returns null when the token is not a known prop value or state — that is a
 * consumer's own class and must not be flagged at all.
 *
 * @param {import('../../foundation/discovery/theming-targets.mjs').ThemingTarget} target
 * @param {string} token
 * @param {(name: string) => Promise<string[]>} propValues
 * @returns {Promise<{attr: string, value: string}|null>}
 */
async function reflectionFor(target, token, propValues) {
  // States reflect their own name as both key and value.
  if (target.states.includes(token)) return {attr: `data-${kebab(token)}`, value: token};

  // Prop-prefixed tokens: `level: 1` renders `.level-1` / [data-level="1"].
  for (const prop of target.props) {
    const prefix = `${kebab(prop)}-`;
    if (token.startsWith(prefix)) {
      return {attr: `data-${kebab(prop)}`, value: token.slice(prefix.length)};
    }
  }

  // Otherwise the token must be an enumerated value of one of this target's
  // visual props, e.g. `.primary` for variant.
  for (const prop of target.props) {
    const values = await propValues(prop);
    if (values.includes(token)) return {attr: `data-${kebab(prop)}`, value: token};
  }
  return null;
}

/**
 * Enumerated literal values of a component prop, read from its documented
 * type union (`"'primary' | 'secondary'"`).
 *
 * @param {string} coreSrc
 * @param {string} component
 * @returns {(prop: string) => Promise<string[]>}
 */
function propValueReader(coreSrc, component) {
  /** @type {Map<string, string[]>|null} */
  let cache = null;
  return async prop => {
    if (!cache) {
      cache = new Map();
      try {
        const doc = /** @type {{props?: Array<{name?: string, type?: unknown}>,
         *   components?: Array<{props?: Array<{name?: string, type?: unknown}>}>}} */ (
          await loadComponentDoc(path.join(coreSrc, component, `${component}.doc.mjs`))
        );
        const all = [
          ...(doc?.props ?? []),
          ...(doc?.components ?? []).flatMap(c => c.props ?? []),
        ];
        for (const p of all) {
          if (!p?.name || typeof p.type !== 'string') continue;
          const literals = [...p.type.matchAll(/'([^']+)'/g)].map(m => m[1]);
          if (literals.length > 0) cache.set(p.name, literals);
        }
      } catch {
        /* unreadable doc: no values, so nothing is claimed */
      }
    }
    return cache.get(prop) ?? [];
  };
}

/** System token families a theme owns. Redefining these globally escapes it. */
const SYSTEM_TOKEN_RE =
  /(--(?:color|spacing|radius|shadow|inset-shadow|font-size|font-weight|font-family|text|leading|duration|ease|border)-[\w-]*)\s*:/g;

/**
 * Blank out comments while preserving every newline.
 *
 * Stripping them outright collapses lines, so every reported line number
 * shifts — fatal for a diagnostic an agent edits from.
 *
 * @param {string} src
 * @returns {string}
 */
function blankComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
}

/**
 * Collect files under `root` matching `test`, skipping build output and
 * dependencies.
 *
 * Returns `truncated` when the bound was hit. That flag is load-bearing: a
 * capped scan that reports only what it happened to reach turns "I stopped
 * looking" into "there is nothing wrong". A violation in stylesheet 401 was
 * reproducibly reported as a clean PASS.
 *
 * @param {string} root
 * @param {(name: string) => boolean} test
 * @returns {{files: string[], truncated: boolean}}
 */
function collect(root, test) {
  /** @type {string[]} */
  const out = [];
  const stack = [root];
  let truncated = false;
  while (stack.length > 0) {
    if (out.length >= MAX_FILES) {
      truncated = true;
      break;
    }
    const dir = stack.pop();
    if (!dir) continue;
    let entries;
    try {
      entries = fs.readdirSync(dir, {withFileTypes: true});
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) stack.push(fp);
      } else if (test(entry.name)) {
        out.push(fp);
      }
    }
  }
  return {files: out.sort(), truncated};
}

/**
 * @typedef {object} CssFinding
 * @property {'root-token-override'|'private-var-write'|'deprecated-bare-class'} kind
 * @property {string} file
 * @property {number} line
 * @property {string} detail
 * @property {string} [targetKey] - bare-class only: the `defineTheme` component key
 * @property {string} [token] - bare-class only: the chained class name
 */

/**
 * Scan a project's own CSS for three unambiguous theming escapes.
 *
 * @param {string} root
 * @returns {{scanned: number, findings: CssFinding[], truncated: boolean}}
 *   `truncated` when the scan hit its file bound and did NOT see the whole
 *   project — the caller must not report a clean result from a partial look.
 */
export function scanConsumerCss(root) {
  const {files, truncated} = collect(root, n => /\.(css|scss|sass|less)$/.test(n));
  /** @type {CssFinding[]} */
  const findings = [];

  for (const file of files) {
    let raw;
    try {
      raw = fs.readFileSync(file, 'utf-8');
    } catch {
      continue;
    }
    // Generated theme CSS legitimately contains private vars and bare prop
    // classes — the pipeline emits them. Judging the tool's own output as
    // consumer error was by far the largest false-positive source here.
    if (/@generated\b/.test(raw.slice(0, 400))) continue;

    const src = blankComments(raw);
    const lineAt = (/** @type {number} */ idx) => src.slice(0, idx).split('\n').length;

    // (1) System tokens redefined in a global scope. A theme applies inside
    //     `@scope ([data-astryx-theme=...])`; a :root definition sits outside
    //     that and wins for every theme at once.
    for (const rule of src.matchAll(/(:root|html|:host|\*)\b[^{]*\{([\s\S]*?)\}/g)) {
      const body = rule[2];
      const bodyStart = rule.index + rule[0].indexOf(body);
      for (const decl of body.matchAll(SYSTEM_TOKEN_RE)) {
        findings.push({
          kind: 'root-token-override',
          file,
          line: lineAt(bodyStart + decl.index),
          detail: decl[1],
        });
      }
    }

    // (2) Private implementation vars. `astryx theme build` already rejects
    //     these in a theme; they are equally wrong in raw CSS.
    for (const decl of src.matchAll(/(--_[\w-]+)\s*:/g)) {
      findings.push({
        kind: 'private-var-write',
        file,
        line: lineAt(decl.index),
        detail: decl[1],
      });
    }

    // (3) Bare classes chained onto a stable class. Whether each one is
    //     actually a deprecated prop/state class — as opposed to the
    //     consumer's own — is decided later against the component docs, so
    //     the clean path never pays to load them.
    for (const sel of src.matchAll(/\.(astryx-[\w-]+)((?:\.[\w-]+)+)/g)) {
      for (const cls of sel[2].split('.').filter(Boolean)) {
        if (cls.startsWith('astryx-')) continue;
        findings.push({
          kind: 'deprecated-bare-class',
          file,
          line: lineAt(sel.index),
          detail: `.${sel[1]}.${cls}`,
          targetKey: sel[1].replace(/^astryx-/, ''),
          token: cls,
        });
      }
    }
  }

  return {scanned: files.length, findings, truncated};
}


/**
 * Find swizzled components and whether their StyleX source can actually
 * compile — resolved per OWNING PACKAGE, not once for the whole tree.
 *
 * Swizzled StyleX is inert without a compiler plugin, and in a monorepo the
 * plugin belongs to the app that bundles the code, not to the root. Reading
 * only `<root>/package.json` reported an app with its own compiler as broken,
 * and would equally have cleared an app that has none because a sibling did.
 * Dependencies do hoist, so a declaration anywhere from the owning package up
 * to the scan root counts — but it has to be looked for from the right place.
 *
 * @param {string} root
 * @returns {{dirs: string[], usesStyleX: boolean, hasCompiler: boolean|null,
 *   packages: Array<{dir: string, dirs: string[], stylexDirs: string[], usesStyleX: boolean, hasCompiler: boolean|null}>}}
 *   The top-level fields summarise the tree: `usesStyleX` is true when any
 *   package does, and `hasCompiler` is false when any StyleX-using package
 *   lacks one — so a single broken app cannot be averaged away.
 */
export function findSwizzled(root) {
  /** @type {string[]} */
  const dirs = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) continue;
    let entries;
    try {
      entries = fs.readdirSync(dir, {withFileTypes: true});
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.isSymbolicLink() || SKIP_DIRS.has(entry.name)) continue;
      const fp = path.join(dir, entry.name);
      // `astryx swizzle` writes to ./components/astryx/<Name>/ by default.
      if (entry.name === 'astryx' && path.basename(dir) === 'components') {
        try {
          for (const sub of fs.readdirSync(fp, {withFileTypes: true})) {
            if (sub.isDirectory()) dirs.push(path.join(fp, sub.name));
          }
        } catch {
          /* unreadable: report nothing rather than guessing */
        }
        continue;
      }
      stack.push(fp);
    }
  }

  /** @type {Map<string, string[]>} */
  const byPackage = new Map();
  for (const dir of dirs) {
    const owner = owningPackage(dir, root);
    const list = byPackage.get(owner);
    if (list) list.push(dir);
    else byPackage.set(owner, [dir]);
  }

  const packages = [...byPackage.entries()]
    .map(([dir, ownDirs]) => {
      // Track WHICH components use StyleX, not just whether any do: the
      // failure message counts them, and counting every swizzled directory in
      // the package reported "50 components contain StyleX source" for a
      // package where exactly one did.
      const stylexDirs = ownDirs.filter(usesStyleX).sort();
      return {
        dir,
        dirs: ownDirs.sort(),
        stylexDirs,
        usesStyleX: stylexDirs.length > 0,
        hasCompiler: compilerFor(dir, root),
      };
    })
    .sort((a, b) => a.dir.localeCompare(b.dir));

  const stylexPackages = packages.filter(p => p.usesStyleX);
  return {
    dirs,
    usesStyleX: stylexPackages.length > 0,
    hasCompiler:
      stylexPackages.length === 0
        ? null
        : stylexPackages.some(p => p.hasCompiler === false)
          ? false
          : stylexPackages.every(p => p.hasCompiler === true)
            ? true
            : null,
    packages,
  };
}

/**
 * Nearest ancestor directory holding a package.json, bounded by `root`.
 * @param {string} from
 * @param {string} root
 * @returns {string}
 */
function owningPackage(from, root) {
  let dir = from;
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    if (dir === root) break;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return root;
}

/** Does any swizzled file in this directory actually use StyleX? @param {string} dir */
/**
 * Does this component directory contain LIVE StyleX source?
 *
 * Comments are blanked first. A swizzled file whose StyleX import is commented
 * out compiles to plain React and renders fine — reporting it as broken sends
 * people to install a compiler they do not need. (Measured: a component whose
 * only mention was `// import * as stylex …` was reported as unstyled.)
 *
 * @param {string} dir
 * @returns {boolean}
 */
function usesStyleX(dir) {
  for (const file of collect(dir, n => /\.(tsx?|jsx?|mjs)$/.test(n)).files) {
    try {
      const code = fs
        .readFileSync(file, 'utf-8')
        .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
        .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, ' '));
      if (code.includes('@stylexjs/stylex')) return true;
    } catch {
      /* skip unreadable file */
    }
  }
  return false;
}

/**
 * Is a StyleX compiler wired for this package? Delegates to the shared
 * detector so this diagnosis and the agent docs' guidance cannot disagree.
 *
 * @param {string} pkgDir
 * @param {string} root
 * @returns {boolean|null} true = wired into a build config; false = not
 *   declared; null = declared but unreferenced, so unverifiable.
 */
function compilerFor(pkgDir, root) {
  return styleXCompilerFor(pkgDir, root);
}

/**
 * Keep only the bare-class candidates that really are deprecated prop/state
 * classes, and attach the `data-*` attribute that replaces each one.
 *
 * Anything that does not resolve is the consumer's own class chained onto an
 * Astryx class — a legitimate pattern — and is dropped.
 *
 * @param {CssFinding[]} findings
 * @param {string|null} coreSrc - absolute path to `<core>/src`, or null if unresolvable
 * @returns {Promise<Array<CssFinding & {replacement?: string}>>}
 */
export async function resolveBareClasses(findings, coreSrc) {
  const candidates = findings.filter(f => f.kind === 'deprecated-bare-class');
  if (candidates.length === 0) return findings;

  if (!coreSrc || !fs.existsSync(coreSrc)) {
    // No component docs to check against. Naming an attribute would be a
    // guess, and flagging without one would be noise, so drop them.
    return findings.filter(f => f.kind !== 'deprecated-bare-class');
  }

  const targets = await themingTargets(coreSrc);
  /** @type {Map<string, ReturnType<typeof propValueReader>>} */
  const readers = new Map();
  /** @type {Array<CssFinding & {replacement?: string}>} */
  const resolved = [];

  for (const f of findings) {
    if (f.kind !== 'deprecated-bare-class') {
      resolved.push(f);
      continue;
    }
    const target = f.targetKey ? targets.get(f.targetKey) : undefined;
    if (!target || !f.token) continue;
    let reader = readers.get(target.component);
    if (!reader) {
      reader = propValueReader(coreSrc, target.component);
      readers.set(target.component, reader);
    }
    const hit = await reflectionFor(target, f.token, reader);
    if (!hit) continue;
    resolved.push({...f, replacement: `.${target.className}[${hit.attr}="${hit.value}"]`});
  }
  return resolved;
}

/** @param {CssFinding[]} findings @param {string} kind */
const byKind = (findings, kind) => findings.filter(f => f.kind === kind);

/** @param {CssFinding} f @param {string} cwd */
const at = (f, cwd) => `${path.relative(cwd, f.file) || path.basename(f.file)}:${f.line}`;

/**
 * Check — the app's own CSS steps outside the theme.
 *
 * @param {{cwd: string}} ctx
 * @returns {Promise<import('./doctor.type.mjs').DoctorCheck>}
 */
export async function checkCssEscapes(ctx) {
  const {scanned, findings: raw, truncated} = scanConsumerCss(ctx.cwd);
  const coreDir = findCoreDir(ctx.cwd);
  const findings = await resolveBareClasses(raw, coreDir ? path.join(coreDir, 'src') : null);
  if (scanned === 0) {
    return {
      id: 'css-escapes',
      label: 'CSS theming escapes',
      status: 'info',
      message: 'Skipped — no stylesheets found in this project.',
    };
  }
  if (findings.length === 0) {
    // A capped scan that found nothing has NOT established that there is
    // nothing: a private-var write in stylesheet 401 was reported as a clean
    // pass. Say what was actually looked at.
    return truncated
      ? {
          id: 'css-escapes',
          label: 'CSS theming escapes',
          status: 'warn',
          message:
            `No theming escapes in the first ${scanned} stylesheet(s) — but this project has ` +
            'more than that, and the rest were not scanned.',
          fix: `Run \`${getCliInvocation(ctx.cwd)} doctor\` from a narrower directory, or split the check per package, so the whole set is covered.`,
        }
      : {
          id: 'css-escapes',
          label: 'CSS theming escapes',
          status: 'pass',
          message: `No theming escapes in ${scanned} stylesheet(s).`,
        };
  }

  const privateVars = byKind(findings, 'private-var-write');
  const rootTokens = byKind(findings, 'root-token-override');
  const bareClasses = byKind(findings, 'deprecated-bare-class');

  // Private vars are a hard error in `theme build`; keep the severities aligned.
  if (privateVars.length > 0) {
    const first = privateVars[0];
    return {
      id: 'css-escapes',
      label: 'CSS theming escapes',
      status: 'fail',
      message:
        `${privateVars.length} write(s) to private vars, e.g. ${first.detail} at ` +
        `${at(first, ctx.cwd)}. These are set by the derived-var pipeline and are not a public API.`,
      fix: 'Write the standard CSS property (borderRadius, padding) in defineTheme instead; the pipeline expands it.',
    };
  }

  if (rootTokens.length > 0) {
    const first = rootTokens[0];
    return {
      id: 'css-escapes',
      label: 'CSS theming escapes',
      status: 'warn',
      message:
        `${rootTokens.length} system token(s) redefined in a global scope, e.g. ${first.detail} at ` +
        `${at(first, ctx.cwd)}. A theme applies inside its own scope, so a global definition ` +
        'overrides every theme at once.',
      fix: 'Move these into defineTheme({tokens}) so they travel with the theme.',
    };
  }

  const first = /** @type {CssFinding & {replacement: string}} */ (bareClasses[0]);
  return {
    id: 'css-escapes',
    label: 'CSS theming escapes',
    status: 'warn',
    message:
      `${bareClasses.length} selector(s) use deprecated bare prop classes, e.g. ${first.detail} at ` +
      `${at(first, ctx.cwd)}.`,
    fix: `Target the reflected data attribute instead: ${first.replacement}.`,
  };
}

/**
 * Check — swizzled components, and whether their StyleX source can compile.
 *
 * The compiler case is the severe one: StyleX source without a compiler is not
 * a build error. The component renders completely unstyled, silently.
 *
 * @param {{cwd: string}} ctx
 * @returns {import('./doctor.type.mjs').DoctorCheck}
 */
export function checkSwizzled(ctx) {
  const {dirs, packages} = findSwizzled(ctx.cwd);
  if (dirs.length === 0) {
    return {
      id: 'swizzled',
      label: 'Swizzled components',
      status: 'pass',
      message: 'No swizzled components — every component still tracks the design system.',
    };
  }

  const names = dirs.map(d => path.basename(d));
  const listed = names.slice(0, 5).join(', ') + (names.length > 5 ? `, +${names.length - 5} more` : '');

  // Report the packages that are actually broken, by name. One app missing a
  // compiler is a real failure even when every sibling has one, and the fix
  // belongs in that app — so a tree-wide verdict would be both wrong and
  // unactionable.
  const broken = packages.filter(p => p.usesStyleX && p.hasCompiler === false);
  if (broken.length > 0) {
    const affected = broken.reduce((n, p) => n + p.stylexDirs.length, 0);
    const where = broken
      .map(p => path.relative(ctx.cwd, p.dir) || path.basename(p.dir) || '.')
      .join(', ');
    return {
      id: 'swizzled',
      label: 'Swizzled components',
      status: 'fail',
      message:
        `${affected} swizzled component(s) in ${where} (${broken.flatMap(p => p.stylexDirs).map(d => path.basename(d)).slice(0, 5).join(', ')}) contain StyleX source, but no StyleX ` +
        'compiler is configured for those packages. They render completely unstyled — no build ' +
        'error, no warning.',
      fix:
        `Add a StyleX compiler plugin (e.g. @stylexjs/babel-plugin or vite-plugin-stylex) to ` +
        `${where}, or delete the swizzled copies and theme via defineTheme instead.`,
    };
  }

  // Declared but not referenced by any build config. An installed plugin that
  // nothing invokes compiles nothing, and the component renders unstyled just
  // the same — so this cannot be reported as fine.
  const unverified = packages.filter(p => p.usesStyleX && p.hasCompiler === null);
  if (unverified.length > 0) {
    const where = unverified
      .map(p => path.relative(ctx.cwd, p.dir) || path.basename(p.dir) || '.')
      .join(', ');
    return {
      id: 'swizzled',
      label: 'Swizzled components',
      status: 'warn',
      message:
        `${unverified.reduce((n, p) => n + p.stylexDirs.length, 0)} swizzled component(s) ` +
        `(${unverified.flatMap(p => p.stylexDirs).map(d => path.basename(d)).slice(0, 5).join(', ')}) contain StyleX source. A StyleX ` +
        `compiler is installed for ${where}, but no build config in those packages references ` +
        'it, so it may never run — in which case they render completely unstyled, silently.',
      fix:
        'Confirm the plugin is wired into your bundler config (vite/next/webpack/rollup/babel), ' +
        'or delete the swizzled copies and theme via defineTheme instead.',
    };
  }

  return {
    id: 'swizzled',
    label: 'Swizzled components',
    status: 'info',
    message:
      `${dirs.length} swizzled component(s) (${listed}). Swizzled copies stop receiving upstream ` +
      'fixes and no longer respond to theme component overrides.',
    fix: 'If you only needed different styling, defineTheme({components}) keeps the component upgradeable.',
  };
}
