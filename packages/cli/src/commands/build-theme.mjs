/**
 * @file theme build command — Compile a defineTheme file to CSS
 *
 * Takes a theme file that uses defineTheme() and outputs:
 * - A CSS file with token overrides and component styles
 * - An updated JS module that references the built className
 *
 * Usage:
 *   npx xds theme build ./src/themes/ocean.ts
 *   npx xds theme build ./src/themes/ocean.ts --out ./dist/ocean.css
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {createRequire} from 'node:module';

// Import shared theme processing from core — ensures build and runtime
// use the same logic for typeScale expansion, prose, and component rules.
const _require = createRequire(import.meta.url);
let _defineTheme = null;
let _generateThemeRules = null;
try {
  const coreTheme = _require('@xds/core/theme');
  _defineTheme = coreTheme.defineTheme;
  _generateThemeRules = coreTheme.generateThemeRules;
} catch {
  // Core not available — fall back to legacy generation
}

/**
 * Convert camelCase CSS property to kebab-case
 */
function toKebabCase(str) {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * Convert a theme name to a valid JS identifier.
 * e.g. 'default-minimal' → 'defaultMinimal', 'ocean' → 'ocean'
 */
function toIdentifier(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Resolve a token value — [light, dark] tuple becomes light-dark()
 */
function resolveTokenValue(value) {
  if (Array.isArray(value)) {
    return `light-dark(${value[0]}, ${value[1]})`;
  }
  return value;
}

/**
 * Parse a component style key into a CSS selector suffix.
 * - `base` → ''
 * - `variant:secondary` → '.secondary'
 * - `level:1` → '.level-1' (digits get prefixed)
 * - `variant:destructive+size:sm` → '.destructive.sm'
 *
 * <!-- SYNC: packages/core/src/utils/parseStyleKey.ts -->
 * <!-- SYNC: packages/core/src/utils/xdsClassName.ts -->
 * The digit-prefix and value-to-class logic must match across all three files.
 */
function parseStyleKey(key) {
  if (key === 'base') return '';
  return key
    .split('+')
    .map(part => {
      const [prop, value] = part.split(':');
      if (/^\d/.test(value)) {
        return `.${prop}-${value}`;
      }
      return `.${value}`;
    })
    .join('');
}

/**
 * Maps component style keys to HTML elements for prose co-selection.
 *
 * When a theme overrides a prose-related component, the HTML element
 * counterpart should get the same styles. This map defines which
 * HTML elements correspond to which component + style key.
 *
 * 'base' overrides apply to all HTML counterparts.
 * Variant-specific overrides only apply to matching elements.
 */
const PROSE_COMPONENT_MAP = {
  heading: {
    base: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  },
  text: {
    base: ['p', 'small'],
    'type:code': ['code', 'pre'],
    'type:supporting': ['small'],
  },
  kbd: {
    base: ['kbd'],
  },
  link: {
    base: ['a'],
  },
  divider: {
    base: ['hr'],
  },
};

/**
 * Generate CSS from a theme definition object.
 *
 * When prose is enabled, component overrides for prose-related components
 * (heading, text, kbd, link, divider) co-select their HTML element
 * counterparts so raw markup inherits the theme's component styling.
 */
function generateCSS(themeDef, {prose = true} = {}) {
  const parts = [];
  const scopeSelector = `[data-xds-theme="${themeDef.name}"]`;

  // Token overrides — applied to the scope root
  if (themeDef.tokens && Object.keys(themeDef.tokens).length > 0) {
    const declarations = Object.entries(themeDef.tokens)
      .map(([prop, value]) => `    ${prop}: ${resolveTokenValue(value)};`)
      .join('\n');
    parts.push(`  :scope {\n${declarations}\n  }`);
  }

  // Component overrides
  if (themeDef.components) {
    for (const [component, rules] of Object.entries(themeDef.components)) {
      for (const [key, styles] of Object.entries(rules)) {
        const entries = Object.entries(styles);
        if (entries.length > 0) {
          const suffix = parseStyleKey(key);
          const declarations = entries
            .map(([prop, value]) => `    ${toKebabCase(prop)}: ${value};`)
            .join('\n');

          // Build selector — co-select HTML elements for prose-related components
          const xdsSelector = `.xds-${component}${suffix}`;
          let selector = `  ${xdsSelector}`;

          if (prose) {
            const htmlElements = PROSE_COMPONENT_MAP[component]?.[key];
            if (htmlElements) {
              const htmlSelector = htmlElements.map(el => `  ${el}`).join(',\n');
              selector = `  ${xdsSelector},\n${htmlSelector}`;
            }
          }

          parts.push(`${selector} {\n${declarations}\n  }`);
        }
      }
    }
  }

  if (parts.length === 0) return '';

  const inner = parts.join('\n\n');
  return `@scope (${scopeSelector}) to ([data-xds-theme]) {\n${inner}\n}`;
}

// =============================================================================
// Prose CSS generation
// =============================================================================

/**
 * Prose HTML element → XDS component class mappings.
 *
 * Prose maps raw HTML elements to their XDS component counterparts so that
 * plain markup (e.g. rendered markdown) inherits the component styles from
 * xds.base. The theme doesn't redefine the styles — it just aliases the
 * selectors, scoped under the theme boundary.
 */
const PROSE_MAPPINGS = [
  // Headings
  {html: 'h1', xds: '.xds-heading.level-1'},
  {html: 'h2', xds: '.xds-heading.level-2'},
  {html: 'h3', xds: '.xds-heading.level-3'},
  {html: 'h4', xds: '.xds-heading.level-4'},
  {html: 'h5', xds: '.xds-heading.level-5'},
  {html: 'h6', xds: '.xds-heading.level-6'},
  // Text
  {html: 'p', xds: '.xds-text.body'},
  {html: 'small', xds: '.xds-text.supporting'},
  {html: 'code', xds: '.xds-text.code'},
  {html: 'pre', xds: '.xds-text.code'},
  // Standalone components
  {html: 'kbd', xds: '.xds-kbd'},
  {html: 'a', xds: '.xds-link'},
  {html: 'hr', xds: '.xds-divider'},
];

/**
 * Generate prose CSS — aliases raw HTML elements to XDS component classes.
 *
 * The actual styles live in xds.base (component CSS). Prose just says
 * "inside this theme, an <h1> should look like .xds-heading.level-1".
 * This is done via CSS @extend-like pattern: each HTML element inherits
 * the same class as its XDS counterpart.
 */
function generateProseCSS(themeDef) {
  const scopeSelector = `[data-xds-theme="${themeDef.name}"]`;

  // Each mapping becomes: h1 { /* same styles as .xds-heading.level-1 */ }
  // Since we can't @extend in plain CSS, we use the component's CSS custom
  // properties which are already set by xds.base. The prose elements just
  // need the same structural styles (font-family, margin reset, etc.)
  // that the base heading/text components apply.
  //
  // For now, we co-select: the component overrides in generateCSS already
  // target .xds-button, .xds-card, etc. Prose adds the HTML element as
  // an additional selector for component overrides that have an HTML equivalent.
  const rules = PROSE_MAPPINGS.map(
    ({html, xds}) => `  ${html} { @extend ${xds}; }`,
  );

  // CSS @extend isn't widely supported yet. Instead, generate rules that
  // reference the same token-based custom properties the components use.
  // This is a thin layer — just structural resets + token references.
  const parts = [];

  // Heading resets — all heading elements get the base heading treatment
  parts.push(`  :is(h1, h2, h3, h4, h5, h6) {\n    font-family: var(--font-heading);\n    font-weight: var(--font-weight-semibold);\n    color: var(--color-text-primary);\n    margin: 0;\n  }`);

  // Per-level heading sizes
  const headingSizes = {
    h1: {fontSize: 'var(--text-2xl)', lineHeight: '1.2'},
    h2: {fontSize: 'var(--text-xl)', lineHeight: '1.333'},
    h3: {fontSize: 'var(--text-lg)', lineHeight: '1.25'},
    h4: {fontSize: 'var(--text-base)', lineHeight: 'var(--leading-base)'},
    h5: {fontSize: 'var(--text-base)', lineHeight: 'var(--leading-base)'},
    h6: {fontSize: 'var(--text-xsm)', lineHeight: '1.333'},
  };

  for (const [el, styles] of Object.entries(headingSizes)) {
    const declarations = Object.entries(styles)
      .map(([prop, value]) => `    ${toKebabCase(prop)}: ${value};`)
      .join('\n');
    parts.push(`  ${el} {\n${declarations}\n  }`);
  }

  // Text element resets
  parts.push(`  p {\n    font-family: var(--font-heading);\n    color: var(--color-text-primary);\n    margin: 0;\n    font-size: var(--text-base);\n    line-height: var(--leading-base);\n  }`);

  parts.push(`  small {\n    font-size: var(--text-xsm);\n    line-height: 1.333;\n    color: var(--color-text-secondary);\n  }`);

  parts.push(`  code, pre {\n    font-family: var(--font-code);\n    font-size: var(--text-base);\n    line-height: var(--leading-base);\n  }`);

  parts.push(`  hr {\n    border: none;\n    border-top: 1px solid var(--color-divider);\n    margin: 0;\n  }`);

  const inner = parts.join('\n\n');
  return `@scope (${scopeSelector}) to ([data-xds-theme]) {\n${inner}\n}`;
}

// =============================================================================
// Tailwind preset generation
// =============================================================================

/**
 * Generate a Tailwind CSS preset that maps XDS tokens to CSS variable references.
 */
function generateTailwindPreset(themeDef) {
  // Categorize tokens by prefix
  const colors = {};
  const spacing = {};
  const borderRadius = {};
  const fontSize = {};
  const fontFamily = {};
  const fontWeight = {};
  const boxShadow = {};
  const transitionDuration = {};

  // Collect all tokens (overrides + defaults we know about)
  const allTokenNames = [
    // Colors
    'accent', 'accent-deemphasized', 'accent-text',
    'surface', 'wash', 'card', 'popover', 'navbar',
    'text-primary', 'text-secondary', 'text-disabled', 'text-link', 'text-placeholder',
    'icon-primary', 'icon-secondary', 'icon-tertiary', 'icon-disabled',
    'divider', 'divider-high-contrast', 'divider-emphasized',
    'positive', 'positive-deemphasized', 'negative', 'negative-deemphasized',
    'warning', 'warning-deemphasized', 'educational', 'educational-deemphasized',
    'hover-overlay', 'pressed-overlay', 'focus-outline', 'deemphasized',
    'disabled-overlay', 'overlay',
  ];

  for (const name of allTokenNames) {
    colors[name] = `var(--color-${name})`;
  }

  // Spacing
  for (const n of [0, '0-5', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    spacing[n] = `var(--spacing-${n})`;
  }

  // Radius
  borderRadius['element'] = 'var(--radius-element)';
  borderRadius['container'] = 'var(--radius-container)';
  borderRadius['content'] = 'var(--radius-content)';
  borderRadius['inner'] = 'var(--radius-inner)';
  borderRadius['rounded'] = 'var(--radius-rounded)';

  // Font size
  for (const size of ['4xl', '3xl', '2xl', 'xl', 'lg', 'base', 'sm', 'xsm']) {
    fontSize[size] = `var(--text-${size})`;
  }

  // Font family
  fontFamily['heading'] = 'var(--font-heading)';
  fontFamily['body'] = 'var(--font-body)';
  fontFamily['code'] = 'var(--font-code)';

  // Font weight
  fontWeight['normal'] = 'var(--font-weight-normal)';
  fontWeight['medium'] = 'var(--font-weight-medium)';
  fontWeight['semibold'] = 'var(--font-weight-semibold)';
  fontWeight['bold'] = 'var(--font-weight-bold)';

  // Elevation
  boxShadow['sm'] = 'var(--shadow-sm)';
  boxShadow['md'] = 'var(--shadow-md)';
  boxShadow['lg'] = 'var(--shadow-lg)';

  // Transitions
  transitionDuration['fast'] = 'var(--transition-fast)';
  transitionDuration['normal'] = 'var(--transition-normal)';
  transitionDuration['slow'] = 'var(--transition-slow)';

  // Size tokens (component heights)
  spacing['size-sm'] = 'var(--size-sm)';
  spacing['size-md'] = 'var(--size-md)';
  spacing['size-lg'] = 'var(--size-lg)';

  return `/**
 * XDS Tailwind Preset — ${themeDef.name} theme
 * Generated by \`npx xds theme build --tailwind\`
 *
 * Usage in tailwind.config.js:
 *   import { xdsPreset } from './${themeDef.name}.tailwind';
 *   export default { presets: [xdsPreset] };
 *
 * Then use XDS tokens in Tailwind classes:
 *   <div className="bg-surface text-text-primary p-4 rounded-container">
 */
export const xdsPreset = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colors, null, 6).replace(/\n/g, '\n      ')},
      spacing: ${JSON.stringify(spacing, null, 6).replace(/\n/g, '\n      ')},
      borderRadius: ${JSON.stringify(borderRadius, null, 6).replace(/\n/g, '\n      ')},
      fontSize: ${JSON.stringify(fontSize, null, 6).replace(/\n/g, '\n      ')},
      fontFamily: ${JSON.stringify(fontFamily, null, 6).replace(/\n/g, '\n      ')},
      fontWeight: ${JSON.stringify(fontWeight, null, 6).replace(/\n/g, '\n      ')},
      boxShadow: ${JSON.stringify(boxShadow, null, 6).replace(/\n/g, '\n      ')},
      transitionDuration: ${JSON.stringify(transitionDuration, null, 6).replace(/\n/g, '\n      ')},
    },
  },
};
`;
}

/**
 * Extract the theme definition from a JS/TS file by evaluating it.
 * We look for the defineTheme() call and extract its argument.
 */
async function extractThemeDefinition(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Strategy: parse the defineTheme({...}) argument as a JS object.
  // We do a simple extraction — find defineTheme( and grab the object literal.
  const defineMatch = content.match(/defineTheme\s*\(\s*({[\s\S]*?})\s*\)/);
  if (!defineMatch) {
    // Try: export default { name: ... } pattern (plain object export)
    const defaultMatch = content.match(/export\s+default\s+({[\s\S]*?});/);
    if (!defaultMatch) {
      throw new Error(
        `Could not find defineTheme() call or default export in ${filePath}.\n` +
        `Expected: defineTheme({ name: '...', tokens: {...} })`,
      );
    }
    // eslint-disable-next-line no-eval
    return eval(`(${defaultMatch[1]})`);
  }

  // Clean up TypeScript-isms that eval can't handle
  let objStr = defineMatch[1];
  // Remove 'as const', type annotations
  objStr = objStr.replace(/\s+as\s+const/g, '');
  // Remove import references (icons: oceanIcons -> icons: undefined)
  // We only need tokens and components for CSS generation
  objStr = objStr.replace(/icons:\s*[a-zA-Z_][a-zA-Z0-9_]*/g, 'icons: undefined');

  try {
    // eslint-disable-next-line no-eval
    return eval(`(${objStr})`);
  } catch (e) {
    throw new Error(
      `Failed to parse theme definition in ${filePath}: ${e.message}\n` +
      `Make sure the defineTheme() argument is a plain object literal.`,
    );
  }
}

/**
 * Extract icon import info from a theme source file.
 * Returns { importPath, exportName } or null if no icons.
 *
 * Looks for patterns like:
 *   import { defaultIconRegistry } from './icons';
 *   icons: defaultIconRegistry,
 */
function extractIconInfo(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Find the icons field in defineTheme
  const iconsMatch = content.match(/icons:\s*([a-zA-Z_][a-zA-Z0-9_]*)/);
  if (!iconsMatch) return null;

  const varName = iconsMatch[1];

  // Find the import for that variable
  const importRegex = new RegExp(
    `import\\s*{[^}]*\\b${varName}\\b[^}]*}\\s*from\\s*['"]([^'"]+)['"]`,
  );
  const importMatch = content.match(importRegex);
  if (!importMatch) return null;

  return {
    exportName: varName,
    importPath: importMatch[1],
  };
}

/**
 * Generate a minimal JS module for a built theme.
 * Includes the theme name, marker, and re-exports the icon registry.
 * All styling is in the CSS file.
 */
function generateBuiltModule(themeDef, iconImportPath) {
  const iconImport = iconImportPath
    ? `import { icons } from '${iconImportPath}';\n`
    : '';
  const iconsField = iconImportPath ? '  icons,' : '';

  // Resolve token values — tuples become light-dark() strings
  const resolvedTokens = {};
  if (themeDef.tokens) {
    for (const [key, value] of Object.entries(themeDef.tokens)) {
      resolvedTokens[key] = resolveTokenValue(value);
    }
  }

  const tokensStr = JSON.stringify(resolvedTokens, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : '  ' + line))
    .join('\n');

  return `${iconImport}/**
 * ${themeDef.name} theme — built by \`npx xds theme build\`
 * Import the CSS file alongside this module:
 *
 *   import { ${toIdentifier(themeDef.name)}Theme } from './${themeDef.name}';
 *   import './${themeDef.name}.css';
 */
export const ${toIdentifier(themeDef.name)}Theme = {
  name: '${themeDef.name}',
  __built: true,
  tokens: ${tokensStr},
${iconsField}
};
`;
}

/**
 * Generate TypeScript declarations for a built theme module.
 */
function generateBuiltTypes(themeDef) {
  return `import type { XDSDefinedTheme } from '@xds/core/theme';
export declare const ${toIdentifier(themeDef.name)}Theme: XDSDefinedTheme;
`;
}

// =============================================================================
// Component validation
// =============================================================================

/**
 * Known XDS component names and their visual props.
 * Used to warn on typos in defineTheme component overrides.
 */
const KNOWN_COMPONENTS = {
  appshell: ['position'],
  aspectratio: [],
  avatar: ['size'],
  badge: ['variant', 'color'],
  banner: ['variant'],
  breadcrumbs: ['variant'],
  button: ['variant', 'size'],
  calendar: [],
  card: [],
  center: [],
  checkboxinput: [],
  collapsible: [],
  dateinput: [],
  dialog: ['variant', 'position'],
  divider: ['variant', 'orientation'],
  dropdownmenu: [],
  emptystate: [],
  field: [],
  formlayout: [],
  grid: ['align'],
  heading: ['level'],
  icon: ['size', 'color'],
  kbd: [],
  layer: [],
  layout: [],
  link: ['color'],
  list: ['type', 'density'],
  mobilenav: [],
  moremenu: [],
  navicon: [],
  numberinput: [],
  pagination: ['variant'],
  progressbar: ['variant', 'size'],
  radiolist: ['orientation'],
  section: ['variant'],
  selector: ['type', 'size', 'color'],
  sidenav: [],
  skeleton: [],
  slider: ['orientation'],
  spinner: ['size'],
  stack: [],
  statusdot: ['variant', 'size'],
  switch: [],
  table: [],
  tablist: ['type'],
  text: ['type', 'color'],
  textarea: [],
  textinput: [],
  timeinput: [],
  token: ['color'],
  tokenizer: [],
  topnav: [],
  typeahead: ['type', 'size', 'color'],
};

/**
 * Validate component overrides in a theme definition.
 * Warns on unknown component names and unknown prop names.
 * Returns array of warning strings.
 */
function validateComponentOverrides(themeDef) {
  const warnings = [];
  if (!themeDef.components) return warnings;

  for (const [component, rules] of Object.entries(themeDef.components)) {
    // Check component name
    if (!(component in KNOWN_COMPONENTS)) {
      const similar = Object.keys(KNOWN_COMPONENTS)
        .filter((k) => {
          if (k.includes(component) || component.includes(k)) return true;
          // Levenshtein distance 1-2 for short names
          if (Math.abs(k.length - component.length) <= 2) {
            let diff = 0;
            const longer = k.length >= component.length ? k : component;
            const shorter = k.length < component.length ? k : component;
            let j = 0;
            for (let i = 0; i < longer.length && diff <= 2; i++) {
              if (longer[i] !== shorter[j]) diff++;
              else j++;
            }
            diff += shorter.length - j;
            return diff <= 2;
          }
          return false;
        })
        .slice(0, 3);
      const hint = similar.length > 0 ? ` Did you mean: ${similar.join(', ')}?` : '';
      warnings.push(`Unknown component "${component}".${hint}`);
      continue;
    }

    // Check prop names in prop:value keys
    const knownProps = KNOWN_COMPONENTS[component];
    for (const key of Object.keys(rules)) {
      if (key === 'base') continue;

      // Parse prop:value pairs (e.g. 'variant:secondary' or 'variant:destructive+size:sm')
      const pairs = key.split('+');
      for (const pair of pairs) {
        const [prop] = pair.split(':');
        if (prop && !knownProps.includes(prop)) {
          const hint =
            knownProps.length > 0
              ? ` Known props: ${knownProps.join(', ')}`
              : ' This component has no variant props.';
          warnings.push(
            `Unknown prop "${prop}" on component "${component}".${hint}`,
          );
        }
      }
    }
  }

  return warnings;
}

export function registerTheme(program) {
  const theme = program
    .command('theme')
    .description('Theme tools — build, export, and manage XDS themes');

  theme
    .command('build <file>')
    .description('Compile a defineTheme file to CSS + JS')
    .option('-o, --out <path>', 'Output CSS file path')
    .option('--no-prose', 'Skip prose mappings (h1, p, code, hr, etc.)')
    .option('--tailwind', 'Generate a Tailwind CSS preset file')
    .action(async (file, options) => {
      const filePath = path.resolve(process.cwd(), file);

      if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
      }

      console.log(`\nBuilding theme from ${path.relative(process.cwd(), filePath)}...`);

      // Extract theme definition
      let themeDef;
      try {
        themeDef = await extractThemeDefinition(filePath);
      } catch (e) {
        console.error(`Error: ${e.message}`);
        process.exit(1);
      }

      if (!themeDef.name) {
        console.error('Error: Theme must have a name property.');
        process.exit(1);
      }

      // Validate component overrides
      const warnings = validateComponentOverrides(themeDef);
      for (const w of warnings) {
        console.warn(`  ⚠ ${w}`);
      }

      // Generate CSS using the shared generateThemeRules from core.
      // This ensures build and runtime produce identical rule sets.
      let css;
      if (_defineTheme && _generateThemeRules) {
        // Shared path: run through defineTheme (expands typeScale, merges
        // components) then generateThemeRules with computedValues for
        // self-contained CSS output.
        const resolvedTheme = _defineTheme({
          name: themeDef.name,
          typeScale: themeDef.typeScale,
          tokens: themeDef.tokens,
          components: themeDef.components,
        });
        const rules = _generateThemeRules(resolvedTheme);
        if (rules.length === 0) {
          console.log('No overrides found — nothing to build.');
          return;
        }
        const scopeSelector = `[data-xds-theme="${themeDef.name}"]`;
        const inner = rules.join('\n\n');
        const scopeBlock = `@scope (${scopeSelector}) to ([data-xds-theme]) {\n${inner}\n}`;
        const colorSchemeDecl = scopeBlock.includes('light-dark(')
          ? '  :root { color-scheme: light dark; }\n\n'
          : '';
        css = `@layer xds.theme {\n${colorSchemeDecl}${scopeBlock}\n}\n`;
      } else {
        // Legacy fallback when core isn't built yet
        const scopeBlocks = [];
        const proseCss = generateProseCSS(themeDef);
        if (proseCss) scopeBlocks.push(proseCss);
        const mainCss = generateCSS(themeDef);
        if (mainCss) scopeBlocks.push(mainCss);
        if (scopeBlocks.length === 0) {
          console.log('No overrides found — nothing to build.');
          return;
        }
        const joined = scopeBlocks.join('\n\n');
        const colorSchemeDecl = joined.includes('light-dark(')
          ? '  :root { color-scheme: light dark; }\n\n'
          : '';
        css = `@layer xds.theme {\n${colorSchemeDecl}${joined}\n}\n`;
      }

      // Determine output path
      const outPath = options.out
        ? path.resolve(process.cwd(), options.out)
        : filePath.replace(/\.(ts|tsx|js|jsx|mjs)$/, '.css');

      // Write CSS
      fs.mkdirSync(path.dirname(outPath), {recursive: true});
      fs.writeFileSync(outPath, css);

      const tokenCount = themeDef.tokens ? Object.keys(themeDef.tokens).length : 0;
      const componentCount = themeDef.components ? Object.keys(themeDef.components).length : 0;
      const size = (Buffer.byteLength(css) / 1024).toFixed(1);

      console.log(`\n✓ ${path.relative(process.cwd(), outPath)}`);
      console.log(`  ${tokenCount} token overrides, ${componentCount} component overrides`);
      console.log(`  ${size} KB`);

      // Always generate JS module + types alongside CSS
      const outDir = path.dirname(outPath);
      const baseName = themeDef.name;

      const jsPath = path.join(outDir, `${baseName}.js`);
      const dtsPath = path.join(outDir, `${baseName}.d.ts`);

      const iconInfo = extractIconInfo(filePath);
      const iconImportPath = iconInfo ? iconInfo.importPath : null;

      fs.writeFileSync(jsPath, generateBuiltModule(themeDef, iconImportPath));
      fs.writeFileSync(dtsPath, generateBuiltTypes(themeDef));

      console.log(`✓ ${path.relative(process.cwd(), jsPath)}`);
      console.log(`✓ ${path.relative(process.cwd(), dtsPath)}`);

      // Generate Tailwind preset if requested
      if (options.tailwind) {
        const twPath = path.join(outDir, `${baseName}.tailwind.js`);
        fs.writeFileSync(twPath, generateTailwindPreset(themeDef));
        console.log(`✓ ${path.relative(process.cwd(), twPath)}`);
      }

      // Print install instructions
      const relDir = path.relative(process.cwd(), outDir);
      const exportName = `${toIdentifier(baseName)}Theme`;
      console.log(`
Install in your app:

  import { ${exportName} } from './${relDir}/${baseName}';
  import './${relDir}/${baseName}.css';

  <XDSTheme theme={${exportName}}>
    <App />
  </XDSTheme>

Or with a <link> tag:

  import { ${exportName} } from './${relDir}/${baseName}';

  <link rel="stylesheet" href="./${relDir}/${baseName}.css" />
  <XDSTheme theme={${exportName}}>
    <App />
  </XDSTheme>
`);
    });
}
