// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx doctor --built <path>`: did a finished build actually use
 * Astryx, and how well? Two checks a coding agent runs before it delivers a
 * page.
 *
 * @input A path: a project folder, a build output folder, or one file (a
 *   built `.html` page or a source file), and the package names whose
 *   components count as Astryx: every `@astryxdesign/*` package and each
 *   integration the project loads (its component catalog's providers).
 * @output `built-astryx-usage`: fails when the path holds no import from those
 *   packages, no use of a component imported from them, and no Astryx
 *   stylesheet in built CSS or HTML. `built-astryx-purity`: warns with the
 *   findings of the source check in `astryx docs is-my-code-good` (raw
 *   elements Astryx has a component for, raw SVG and icon-library icons,
 *   inline styles, classes, StyleX declarations and imported stylesheets),
 *   each with its file and line; info, "not inspected", when the path holds
 *   no source with JSX (a bundle is build output, not source).
 * @position Pure: the doctor adapter reads the files (readBuiltPath) and the
 *   integration package names (builtIntegrationPackages); nothing here runs
 *   project code, its configuration, or a browser. Plain `astryx doctor` does not run
 *   it.
 */

import {
  BUILT_FILE_LIMIT,
  BUILT_FILE_MAX_MB,
  readBuiltPath,
  resolveBuiltPath,
} from './_adapter.mjs';
import {formatCliCommand} from '../../foundation/env/package-manager.mjs';
import {parse as parseModule} from '@babel/parser';

/** Source files, read for imports and JSX. */
const SOURCE_EXT = new Set(['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs']);

/**
 * The lowercased extension of a relative path, with its dot.
 * @param {string} rel
 */
function extensionOf(rel) {
  const name = rel.slice(rel.lastIndexOf('/') + 1);
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot).toLowerCase() : '';
}

/** Files that hold JSX by their extension. */
const JSX_EXT = new Set(['.tsx', '.jsx']);

/** A cheap test before parsing: a tag or fragment opens somewhere. */
const HAS_JSX = /<(?:[A-Za-z]|>)/;

/**
 * Whether a `.js` or `.mjs` source file holds JSX, read from its parse.
 * @param {string} text
 */
function hasJsx(text) {
  if (!HAS_JSX.test(text)) return false;
  /** @type {any} */
  let ast;
  try {
    ast = parseModule(text, {
      sourceType: 'unambiguous',
      plugins: ['jsx'],
      errorRecovery: true,
    });
  } catch {
    return false;
  }
  /** @type {any[]} */
  const stack = [ast.program];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || typeof node.type !== 'string') continue;
    if (node.type === 'JSXElement' || node.type === 'JSXFragment') return true;
    for (const key of Object.keys(node)) {
      if (key === 'loc' || key.endsWith('Comments')) continue;
      const value = node[key];
      if (Array.isArray(value)) stack.push(...value);
      else if (value && typeof value === 'object') stack.push(value);
    }
  }
  return false;
}

/** Built files, read for an Astryx stylesheet. */
const BUILT_EXT = new Set(['.css', '.html', '.htm', '.js', '.mjs']);

/** How many findings a check message names before it counts the rest. */
const SHOWN = 5;

/**
 * Marks of Astryx's stylesheets that survive a production build: the cascade
 * layers Core's and the themes' CSS declare, and Astryx's own custom
 * properties.
 */
const STYLESHEET_MARK =
  /@layer\s+[^{;]*\bastryx-(?:base|theme)\b|--astryx-[\w-]+/;

/**
 * Raw elements the rubric names a component for (`astryx docs
 * is-my-code-good`, "Common component replacements"), with that owner.
 * @type {Readonly<Record<string, string>>}
 */
const RAW_ELEMENTS = Object.freeze({
  div: '`VStack`, `HStack`, `Grid`, `Card`, `Section` or `Center`',
  span: '`Text`',
  p: '`Text`',
  h1: '`Heading`',
  h2: '`Heading`',
  h3: '`Heading`',
  h4: '`Heading`',
  h5: '`Heading`',
  h6: '`Heading`',
  button: '`Button` or `IconButton`',
  a: '`Link`',
  nav: '`LayoutPanel`',
  aside: '`LayoutPanel`',
  header: '`LayoutHeader`',
  main: '`LayoutContent`',
  ul: '`List`',
  ol: '`List`',
  li: '`ListItem`',
  input: 'the matching form control',
  textarea: 'the matching form control',
  select: 'the matching form control',
  table: '`Table`',
  tr: '`Table`',
  td: '`Table`',
  th: '`Table`',
  hr: '`Divider`',
  dialog: '`Dialog`',
  details: '`Collapsible`',
  summary: '`Collapsible`',
});

/** Raw SVG elements the rubric counts as hand-drawn icons. */
const SVG_ELEMENTS = new Set([
  'svg',
  'path',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
  'ellipse',
  'g',
]);

/** Icon libraries whose components the rubric counts when used directly. */
const ICON_PACKAGES = [
  'lucide-react',
  'react-icons',
  '@heroicons/react',
  '@tabler/icons-react',
  '@phosphor-icons/react',
  'react-feather',
  '@mui/icons-material',
  '@fortawesome/react-fontawesome',
  '@radix-ui/react-icons',
];

/**
 * @typedef {object} BuiltFinding
 * @property {string} category the rubric category: `Astryx components`,
 *   `Icons` or `Styling`
 * @property {string} file relative to the checked path
 * @property {number} line 1-based
 * @property {string} message
 */

/**
 * @typedef {object} BuiltScan
 * @property {number} sourceFiles
 * @property {number} jsxFiles source files whose JSX was inspected
 * @property {number} builtFiles
 * @property {number} imports imports from Astryx packages
 * @property {number} importFiles files with one
 * @property {number} componentUses JSX uses of names imported from them
 * @property {string[]} packages the Astryx packages imported, sorted
 * @property {string[]} stylesheets built files with an Astryx stylesheet
 * @property {BuiltFinding[]} findings
 * @property {boolean} truncated whether the file limit cut the read short
 * @property {number} unread source files over the size limit, or unreadable
 * @property {number} missingLinks local files a built page links that are not
 *   there
 */

/**
 * Whether a package specifier names one of the Astryx packages.
 * @param {string} spec
 * @param {readonly string[]} packages
 */
function isAstryxSpecifier(spec, packages) {
  if (spec.startsWith('@astryxdesign/')) return true;
  return packages.some(name => spec === name || spec.startsWith(`${name}/`));
}

/** @param {string} spec */
function isIconSpecifier(spec) {
  return ICON_PACKAGES.some(
    name => spec === name || spec.startsWith(`${name}/`),
  );
}

/**
 * The 1-based line of an offset.
 * @param {string} text
 * @param {number} at
 */
function lineAt(text, at) {
  if (text !== lineCache.text) {
    /** @type {number[]} */
    const starts = [0];
    for (let i = text.indexOf('\n'); i >= 0; i = text.indexOf('\n', i + 1)) {
      starts.push(i + 1);
    }
    lineCache = {text, starts};
  }
  const {starts} = lineCache;
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (starts[mid] <= at) low = mid;
    else high = mid - 1;
  }
  return low + 1;
}

/** The line starts of the last file lineAt read, found once per file. */
/** @type {{text: string | null, starts: number[]}} */
let lineCache = {text: null, starts: [0]};

/**
 * Text with comments blanked out, keeping every offset, so a commented-out
 * tag or import is not read.
 * @param {string} text
 */
function withoutComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, ' '))
    .replace(
      /(^|[^:"'`\\])\/\/[^\n]*/g,
      (match, lead) => lead + ' '.repeat(match.length - lead.length),
    );
}

/**
 * The imports of a source file: each specifier with the local names it binds.
 * @param {string} text
 * @returns {{spec: string, names: string[], at: number}[]}
 */
function importsOf(text) {
  /** @type {{spec: string, names: string[], at: number}[]} */
  const found = [];
  const fromImport =
    /\bimport\s+(?:type\s+)?([^'";]*?)\s+from\s+['"]([^'"]+)['"]|\bimport\s+['"]([^'"]+)['"]/g;
  for (const match of text.matchAll(fromImport)) {
    const at = /** @type {number} */ (match.index);
    if (match[3]) {
      found.push({spec: match[3], names: [], at});
      continue;
    }
    const clause = match[1];
    /** @type {string[]} */
    const names = [];
    const braces = /\{([\s\S]*)\}/.exec(clause);
    if (braces) {
      for (const part of braces[1].split(',')) {
        const local = part
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)
          .pop()
          ?.trim();
        if (local) names.push(local);
      }
    }
    const outside = clause.replace(/\{[\s\S]*\}/, '');
    for (const part of outside.split(',')) {
      const name = part.trim().replace(/^\*\s+as\s+/, '');
      if (/^[A-Za-z_$][\w$]*$/.test(name)) names.push(name);
    }
    found.push({spec: match[2], names, at});
  }
  for (const match of text.matchAll(
    /\brequire\(\s*['"]([^'"]+)['"]\s*\)|\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
  )) {
    found.push({
      spec: match[1] ?? match[2],
      names: [],
      at: /** @type {number} */ (match.index),
    });
  }
  return found;
}

/**
 * The source findings of one JSX file.
 * @param {string} text comments blanked
 * @param {string} rel
 * @param {Set<string>} iconNames local names imported from icon libraries
 * @returns {BuiltFinding[]}
 */
function jsxFindings(text, rel, iconNames) {
  /** @type {BuiltFinding[]} */
  const findings = [];
  for (const match of text.matchAll(/<([a-z][a-z0-9]*)(?=[\s/>])([^>]*)/g)) {
    const tag = match[1];
    const at = /** @type {number} */ (match.index);
    const line = lineAt(text, at);
    if (SVG_ELEMENTS.has(tag)) {
      // A helper's SVG counts once: by its root element.
      if (tag === 'svg') {
        findings.push({
          category: 'Icons',
          file: rel,
          line,
          message:
            'raw `<svg>`: render icons through `Icon`, `IconButton` or an icon prop',
        });
      }
      continue;
    }
    const owner = RAW_ELEMENTS[tag];
    if (!owner) continue;
    // Native semantics the rubric keeps: hidden form state.
    if (tag === 'input' && /\btype\s*=\s*["']hidden["']/.test(match[2])) {
      continue;
    }
    findings.push({
      category: 'Astryx components',
      file: rel,
      line,
      message: `raw \`<${tag}>\`: use ${owner}`,
    });
  }
  for (const name of iconNames) {
    for (const match of text.matchAll(
      new RegExp(`<${name.replace(/[$]/g, '\\$')}(?=[\\s/>])`, 'g'),
    )) {
      findings.push({
        category: 'Icons',
        file: rel,
        line: lineAt(text, /** @type {number} */ (match.index)),
        message: `\`<${name}>\` from an icon library: render it through \`Icon\` or an icon prop`,
      });
    }
  }
  for (const [pattern, what] of /** @type {const} */ ([
    [/\bstyle\s*=\s*\{/g, 'an inline `style`'],
    [/\bclassName\s*=/g, 'a `className`'],
  ])) {
    for (const match of text.matchAll(pattern)) {
      findings.push({
        category: 'Styling',
        file: rel,
        line: lineAt(text, /** @type {number} */ (match.index)),
        message: `${what}: use a component prop or token first`,
      });
    }
  }
  return findings;
}

/**
 * Read a path and gather the evidence both checks judge.
 * @param {string} target an existing file or folder
 * @param {readonly string[]} packages package names whose components count as
 *   Astryx, beside every `@astryxdesign/*` package
 * @returns {BuiltScan}
 */
export function scanBuilt(target, packages) {
  const {files, truncated, missing = 0} = readBuiltPath(target);
  /** @type {BuiltScan} */
  const scan = {
    sourceFiles: 0,
    jsxFiles: 0,
    builtFiles: 0,
    imports: 0,
    importFiles: 0,
    componentUses: 0,
    packages: [],
    stylesheets: [],
    findings: [],
    truncated,
    unread: 0,
    missingLinks: missing,
  };
  const imported = new Set();
  for (const {rel, built, read} of files) {
    const ext = extensionOf(rel);
    // A bundler emits no .tsx or .jsx, so one inside a folder named like
    // build output is still source.
    const isSource =
      SOURCE_EXT.has(ext) &&
      !rel.endsWith('.d.ts') &&
      (!built || JSX_EXT.has(ext));
    const isBuilt = BUILT_EXT.has(ext) && (built || !isSource);
    if (!isSource && !isBuilt) continue;
    const raw = read();
    if (raw == null) {
      if (isSource) scan.unread++;
      continue;
    }
    if (isBuilt) {
      scan.builtFiles++;
      if (STYLESHEET_MARK.test(raw)) scan.stylesheets.push(rel);
    }
    if (!isSource) continue;
    scan.sourceFiles++;
    const text = withoutComments(raw);
    const astryxNames = new Set();
    const iconNames = new Set();
    let fileImports = 0;
    for (const {spec, names, at} of importsOf(text)) {
      if (isAstryxSpecifier(spec, packages)) {
        fileImports++;
        imported.add(
          spec.startsWith('@')
            ? spec.split('/').slice(0, 2).join('/')
            : spec.split('/')[0],
        );
        for (const name of names) astryxNames.add(name);
      } else if (isIconSpecifier(spec)) {
        for (const name of names) iconNames.add(name);
      } else if (/\.(?:css|scss|sass|less)$/.test(spec)) {
        scan.findings.push({
          category: 'Styling',
          file: rel,
          line: lineAt(text, at),
          message: `imports the stylesheet \`${spec}\`: use component props and tokens`,
        });
      }
    }
    for (const match of text.matchAll(/\bstylex\.create\s*\(/g)) {
      scan.findings.push({
        category: 'Styling',
        file: rel,
        line: lineAt(text, /** @type {number} */ (match.index)),
        message:
          'a `stylex.create` declaration: use a component prop or token first',
      });
    }
    scan.imports += fileImports;
    if (fileImports > 0) scan.importFiles++;
    for (const name of astryxNames) {
      if (!/^[A-Z]/.test(name)) continue;
      const uses = text.match(new RegExp(`<${name}(?=[\\s/>.])`, 'g'));
      scan.componentUses += uses?.length ?? 0;
    }
    if (JSX_EXT.has(ext) || (/\.[cm]?js$/u.test(ext) && hasJsx(text))) {
      scan.jsxFiles++;
      for (const finding of jsxFindings(text, rel, iconNames)) {
        scan.findings.push(finding);
      }
    }
  }
  scan.packages = [...imported].sort();
  scan.findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  return scan;
}

/**
 * @param {number} count
 * @param {string} word
 */
function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/**
 * The two checks for a path.
 * @param {string} target as the caller gave it
 * @param {{cwd: string, packages: readonly string[]}} options `packages`: the
 *   integration packages whose components count as Astryx
 * @returns {import('./doctor.type.mjs').DoctorCheck[]}
 */
export function checkBuilt(target, {cwd, packages}) {
  const resolved = resolveBuiltPath(cwd, target);
  if (resolved == null) {
    return [
      {
        id: 'built-astryx-usage',
        label: 'Built output uses Astryx',
        status: 'fail',
        message: `${target} does not exist, so nothing was checked.`,
        fix: 'Pass the project folder, the build output folder, or the built HTML file.',
      },
    ];
  }
  const scan = scanBuilt(resolved, packages);
  const used =
    scan.imports > 0 || scan.componentUses > 0 || scan.stylesheets.length > 0;
  const read = `${plural(scan.sourceFiles, 'source file')} and ${plural(scan.builtFiles, 'built file')}${scan.truncated ? ` (the first ${BUILT_FILE_LIMIT} files)` : ''}`;
  const evidence = [
    scan.imports > 0
      ? `${plural(scan.imports, 'import')} from ${scan.packages.join(', ')} in ${plural(scan.importFiles, 'file')}`
      : null,
    scan.componentUses > 0
      ? `${plural(scan.componentUses, 'component use')}`
      : null,
    scan.stylesheets.length > 0
      ? `Astryx styles in ${scan.stylesheets.slice(0, 3).join(', ')}${scan.stylesheets.length > 3 ? ` and ${scan.stylesheets.length - 3} more` : ''}`
      : null,
  ].filter(Boolean);
  /** @type {import('./doctor.type.mjs').DoctorCheck} */
  const usage = used
    ? {
        id: 'built-astryx-usage',
        label: 'Built output uses Astryx',
        status: 'pass',
        message: `Read ${read}: ${evidence.join('; ')}.`,
      }
    : scan.sourceFiles === 0 &&
        scan.builtFiles === 0 &&
        scan.unread === 0 &&
        !scan.truncated
      ? {
          id: 'built-astryx-usage',
          label: 'Built output uses Astryx',
          status: 'fail',
          message: `${target} holds no source or built files, so nothing was checked.`,
          fix: 'Pass the project folder, the build output folder, or the built HTML file.',
        }
      : scan.truncated || scan.unread > 0 || scan.missingLinks > 0
        ? {
            id: 'built-astryx-usage',
            label: 'Built output uses Astryx',
            status: 'warn',
            message: `Read ${read} and found no Astryx in them, but ${[scan.truncated ? `the rest past the first ${BUILT_FILE_LIMIT} files` : null, scan.unread > 0 ? `${plural(scan.unread, 'source file')} over ${BUILT_FILE_MAX_MB} MB or unreadable` : null, scan.missingLinks > 0 ? `${plural(scan.missingLinks, 'file')} the page links but that are not there` : null].filter(Boolean).join(' and ')} went unread, so this does not show whether the output uses Astryx.`,
            fix: `Run \`${formatCliCommand('doctor --built <folder>', cwd)}\` on the folder that holds the page itself, or on its build output.`,
          }
        : {
            id: 'built-astryx-usage',
            label: 'Built output uses Astryx',
            status: 'fail',
            message: `Read ${read}: no import from an Astryx package, no Astryx component, and no Astryx styles, so this output does not use Astryx.`,
            fix: `Rebuild the page from an Astryx template: run \`${formatCliCommand('build "<what the page is>"', cwd)}\`, scaffold the template it names, and fill it with Astryx components. Do not deliver this output.`,
          };
  /** @type {import('./doctor.type.mjs').DoctorCheck} */
  let purity;
  if (scan.jsxFiles === 0) {
    purity = {
      id: 'built-astryx-purity',
      label: 'Source uses Astryx well',
      status: 'info',
      message: `Not inspected: ${plural(scan.sourceFiles, 'source file')} under ${target} and no JSX among them, so components, icons and styles were not checked. A bundle or other build output is not source.`,
      fix: `Run \`${formatCliCommand('doctor --built <project folder>', cwd)}\` on the folder that holds the page's source.`,
    };
  } else if (
    scan.findings.length === 0 &&
    (scan.truncated || scan.unread > 0)
  ) {
    purity = {
      id: 'built-astryx-purity',
      label: 'Source uses Astryx well',
      status: 'info',
      message: `Not fully inspected: ${plural(scan.jsxFiles, 'source file')} with JSX had no finding, but ${[scan.truncated ? `only the first ${BUILT_FILE_LIMIT} files were read` : null, scan.unread > 0 ? `${plural(scan.unread, 'source file')} over ${BUILT_FILE_MAX_MB} MB or unreadable went unread` : null].filter(Boolean).join(' and ')}.`,
      fix: `Run \`${formatCliCommand('doctor --built <folder>', cwd)}\` on the folder that holds the page's own source.`,
    };
  } else if (scan.findings.length === 0) {
    purity = {
      id: 'built-astryx-purity',
      label: 'Source uses Astryx well',
      status: 'pass',
      message: `${plural(scan.jsxFiles, 'source file')} with JSX: no raw element Astryx has a component for, no hand-drawn or library icon, and no custom styling.`,
    };
  } else {
    /** @type {Record<string, number>} */
    const byCategory = {};
    for (const finding of scan.findings) {
      byCategory[finding.category] = (byCategory[finding.category] ?? 0) + 1;
    }
    const counts = Object.entries(byCategory)
      .map(([category, count]) => `${category} ${count}`)
      .join(', ');
    const shown = scan.findings
      .slice(0, SHOWN)
      .map(finding => `${finding.file}:${finding.line} ${finding.message}`)
      .join('; ');
    const more =
      scan.findings.length > SHOWN
        ? `; and ${scan.findings.length - SHOWN} more`
        : '';
    purity = {
      id: 'built-astryx-purity',
      label: 'Source uses Astryx well',
      status: 'warn',
      message: `${plural(scan.findings.length, 'finding')} (${counts}): ${shown}${more}.`,
      fix: `Replace each with the Astryx component, icon surface, prop or token it names; \`${formatCliCommand('docs is-my-code-good', cwd)}\` has the full rubric. Keep a raw element only where its native meaning is needed.`,
    };
  }
  return [usage, purity];
}
