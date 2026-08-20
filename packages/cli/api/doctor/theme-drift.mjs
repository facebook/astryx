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

/** Directories that never contain hand-authored consumer source. */
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', 'coverage', '.turbo', '.cache',
]);

/** Bound the walk so a huge monorepo cannot turn `doctor` into a long job. */
const MAX_FILES = 400;

/**
 * Prop and state values Astryx still emits as legacy *bare* classes
 * (`.astryx-button.primary`). Chaining one of these onto a stable component
 * class is the deprecated selector surface.
 *
 * A curated list rather than a scrape of the 200+ component docs: loading
 * those costs ~700ms, which is far too much for a command that has to stay
 * fast, and the false-positive this guards against — a consumer's own class
 * chained onto an Astryx class, e.g. `.astryx-card.my-highlight` — only needs
 * the enumerated values to be excluded, not an exhaustive list.
 */
const LEGACY_BARE_CLASSES = new Set([
  // variants
  'primary', 'secondary', 'tertiary', 'ghost', 'destructive', 'muted', 'subtle',
  'outline', 'solid', 'plain', 'inverse',
  // status
  'info', 'success', 'warning', 'error', 'danger', 'neutral',
  // sizes
  'xs', 'sm', 'md', 'lg', 'xl', 'compact', 'comfortable', 'spacious',
  // states
  'checked', 'selected', 'active', 'disabled', 'open', 'expanded', 'collapsed',
  'pressed', 'loading', 'readonly', 'invalid', 'required', 'current',
  // orientation / layout props
  'horizontal', 'vertical', 'start', 'center', 'end', 'stretch',
]);

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
 * dependencies, and stopping at {@link MAX_FILES}.
 *
 * @param {string} root
 * @param {(name: string) => boolean} test
 * @returns {string[]}
 */
function collect(root, test) {
  /** @type {string[]} */
  const out = [];
  const stack = [root];
  while (stack.length > 0 && out.length < MAX_FILES) {
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
  return out.sort();
}

/**
 * @typedef {object} CssFinding
 * @property {'root-token-override'|'private-var-write'|'deprecated-bare-class'} kind
 * @property {string} file
 * @property {number} line
 * @property {string} detail
 */

/**
 * Scan a project's own CSS for three unambiguous theming escapes.
 *
 * @param {string} root
 * @returns {{scanned: number, findings: CssFinding[]}}
 */
export function scanConsumerCss(root) {
  const files = collect(root, n => /\.(css|scss|sass|less)$/.test(n));
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

    // (3) Deprecated bare prop/state classes chained onto a stable class.
    for (const sel of src.matchAll(/\.(astryx-[\w-]+)((?:\.[\w-]+)+)/g)) {
      for (const cls of sel[2].split('.').filter(Boolean)) {
        if (cls.startsWith('astryx-')) continue;
        if (!LEGACY_BARE_CLASSES.has(cls)) continue;
        findings.push({
          kind: 'deprecated-bare-class',
          file,
          line: lineAt(sel.index),
          detail: `.${sel[1]}.${cls}`,
        });
      }
    }
  }

  return {scanned: files.length, findings};
}

/** StyleX compiler plugins. Swizzled StyleX source is inert without one. */
const STYLEX_COMPILERS = [
  '@stylexjs/babel-plugin',
  'vite-plugin-stylex',
  'unplugin-stylex',
  '@stylexswc/unplugin',
  '@stylexswc/nextjs-plugin',
  'stylex-webpack',
];

/**
 * Find swizzled components and whether their StyleX source can actually compile.
 *
 * @param {string} root
 * @returns {{dirs: string[], usesStyleX: boolean, hasCompiler: boolean|null}}
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

  let usesStyleX = false;
  for (const dir of dirs) {
    for (const file of collect(dir, n => /\.(tsx?|jsx?|mjs)$/.test(n))) {
      try {
        if (fs.readFileSync(file, 'utf-8').includes('@stylexjs/stylex')) {
          usesStyleX = true;
          break;
        }
      } catch {
        /* skip unreadable file */
      }
    }
    if (usesStyleX) break;
  }

  /** @type {boolean|null} */
  let hasCompiler = null;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
    const deps = {...pkg.dependencies, ...pkg.devDependencies};
    hasCompiler = STYLEX_COMPILERS.some(c => c in deps);
  } catch {
    /* no readable package.json: leave unknown rather than claiming false */
  }

  return {dirs, usesStyleX, hasCompiler};
}

/** @param {CssFinding[]} findings @param {string} kind */
const byKind = (findings, kind) => findings.filter(f => f.kind === kind);

/** @param {CssFinding} f @param {string} cwd */
const at = (f, cwd) => `${path.relative(cwd, f.file) || path.basename(f.file)}:${f.line}`;

/**
 * Check — the app's own CSS steps outside the theme.
 *
 * @param {{cwd: string}} ctx
 * @returns {import('./doctor.type.mjs').DoctorCheck}
 */
export function checkCssEscapes(ctx) {
  const {scanned, findings} = scanConsumerCss(ctx.cwd);
  if (scanned === 0) {
    return {
      id: 'css-escapes',
      label: 'CSS theming escapes',
      status: 'info',
      message: 'Skipped — no stylesheets found in this project.',
    };
  }
  if (findings.length === 0) {
    return {
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

  const first = bareClasses[0];
  const [base, value] = first.detail.slice(1).split('.');
  return {
    id: 'css-escapes',
    label: 'CSS theming escapes',
    status: 'warn',
    message:
      `${bareClasses.length} selector(s) use deprecated bare prop classes, e.g. ${first.detail} at ` +
      `${at(first, ctx.cwd)}.`,
    fix: `Target the reflected data attribute instead: .${base}[data-variant="${value}"].`,
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
  const {dirs, usesStyleX, hasCompiler} = findSwizzled(ctx.cwd);
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

  if (usesStyleX && hasCompiler === false) {
    return {
      id: 'swizzled',
      label: 'Swizzled components',
      status: 'fail',
      message:
        `${dirs.length} swizzled component(s) (${listed}) contain StyleX source, but no StyleX ` +
        'compiler is configured. They render completely unstyled — no build error, no warning.',
      fix:
        'Add a StyleX compiler plugin (e.g. @stylexjs/babel-plugin or vite-plugin-stylex), or ' +
        'delete the swizzled copies and theme via defineTheme instead.',
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
