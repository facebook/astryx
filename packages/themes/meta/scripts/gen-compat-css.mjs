/**
 * Generate theme-compat.css from theme.css
 *
 * Strips @scope and @layer, uses doubled [data-xds-theme] selector
 * for higher specificity (0,2,0) to beat StyleX's :root (0,1,0).
 */
import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const css = readFileSync(join(distDir, 'theme.css'), 'utf8');

// Doubled selector = specificity (0,2,0), beats :root (0,1,0)
const varsSel = '[data-xds-theme="meta"][data-xds-theme="meta"]';
const ruleSel = '[data-xds-theme="meta"]';

// Extract :scope vars
const scopeMatch = css.match(/:scope\s*\{([^}]+)\}/);
const vars = scopeMatch?.[1]?.trim() ?? '';

// Extract .xds-* component rules
const xdsRules = css.match(/\.xds-[^{]+\{[^}]+\}/g) ?? [];

// Extract prose element rules
const proseRules =
  css.match(
    /(:is\(h[^}]+\}|h[1-6]\s*\{[^}]+\}|p\s*\{[^}]+\}|small\s*\{[^}]+\}|code[^}]*\{[^}]+\}|hr\s*\{[^}]+\})/g,
  ) ?? [];

let out = `/* Meta Theme — compat CSS (doubled selector for specificity) */\n\n`;
out += `${varsSel} {\n  ${vars}\n}\n\n`;
for (const rule of xdsRules) out += `${ruleSel} ${rule}\n\n`;
for (const rule of proseRules) out += `${ruleSel} ${rule}\n\n`;

writeFileSync(join(distDir, 'theme-compat.css'), out);
console.log(`✓ dist/theme-compat.css (${out.length} bytes)`);
