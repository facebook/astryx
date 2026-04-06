/**
 * @file template command — Inject page templates
 *
 * Copies template files from packages/cli/templates/{name}/ to a target path.
 * Template metadata comes from template.doc.mjs files (TemplateDoc type).
 * Templates without a doc file fall back to directory name only.
 *
 * --list:     Show all templates with component compositions
 * --skeleton: Show layout skeleton with spatial annotations (padding, gap)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../utils/paths.mjs';
import {jsonOut, jsonError} from '../lib/json.mjs';

// ── Template discovery ───────────────────────────────────────────────

async function loadTemplateDoc(templateDir) {
  const docPath = path.join(templateDir, 'template.doc.mjs');
  if (!fs.existsSync(docPath)) return null;
  const docModule = await import(`file://${docPath}`);
  return docModule.doc;
}

export async function discoverTemplates() {
  const templatesDir = path.join(CLI_ROOT, 'templates');
  if (!fs.existsSync(templatesDir)) return [];

  const dirs = fs
    .readdirSync(templatesDir, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const templates = [];
  for (const dir of dirs) {
    const doc = await loadTemplateDoc(path.join(templatesDir, dir.name));
    templates.push({
      dirName: dir.name,
      name: doc?.name || dir.name,
      description: doc?.description || '',
      isReady: doc?.isReady ?? true,
    });
  }
  return templates;
}

export function listTemplates() {
  const templatesDir = path.join(CLI_ROOT, 'templates');
  if (!fs.existsSync(templatesDir)) return [];
  return fs
    .readdirSync(templatesDir, {withFileTypes: true})
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();
}

// ── Component extraction ─────────────────────────────────────────────

/**
 * Extract distinguishing XDS component names from a template's page.tsx.
 * Filters out ubiquitous components (Text, Button, HStack, etc.) to show
 * only the structural components that define the template's composition.
 */
function extractComponents(pagePath) {
  const src = fs.readFileSync(pagePath, 'utf-8');
  const UBIQUITOUS = new Set([
    'Text', 'Heading', 'Button', 'HStack', 'VStack', 'Link',
    'StackItem', 'Icon',
  ]);
  return [...new Set(
    (src.match(/XDS[A-Z]\w+/g) || [])
      .map(n => n.replace(/^XDS/, ''))
      .filter(n => !['Theme', 'ThemeProvider'].includes(n))
      .filter(n => !UBIQUITOUS.has(n))
      .map(n => n.replace(/(Item|Section|Header|Content|Footer|Panel|Heading|CollapseButton|Column|Sortable|Selection|Group|Source)$/, ''))
      .filter(Boolean),
  )].sort();
}

// ── Skeleton extraction ──────────────────────────────────────────────

/**
 * Extract a layout skeleton from template source code.
 * Shows the XDS component nesting tree with spatial props
 * (padding, gap, contentPadding, hasDivider, maxWidth, etc.).
 *
 * Structural components (Layout, AppShell, Card, Grid, Section, List, Table,
 * TabList, Toolbar) are always shown with full nesting. Leaf content
 * components (Text, Heading, Button, Badge, etc.) are collapsed to single
 * lines to keep the skeleton focused on spatial structure.
 */
function extractSkeleton(source) {
  const lines = source.split('\n');
  const out = [];
  let depth = 0;
  let capturing = false;
  let inDefaultExport = false;
  const MAX_LINES = 35;

  const STRUCTURAL = new Set([
    'AppShell', 'Layout', 'LayoutHeader', 'LayoutContent', 'LayoutPanel',
    'LayoutFooter', 'Card', 'Section', 'Grid', 'GridSpan', 'List',
    'Table', 'TabList', 'Toolbar', 'SideNav', 'TopNav', 'Dialog',
    'FormLayout', 'Center',
  ]);

  const depthStack = [];

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();

    if (t.match(/^export\s+default\s+function/)) {
      inDefaultExport = true;
      continue;
    }
    if (inDefaultExport && t.match(/^return\s*\(/)) {
      capturing = true;
      continue;
    }
    if (!capturing) continue;
    if (out.length >= MAX_LINES) {
      if (!out[out.length - 1]?.includes('...')) out.push('  '.repeat(depth) + '...');
      continue;
    }

    // XDS opening tag
    const openMatch = t.match(/^<(XDS\w+)/);
    if (openMatch && !t.startsWith('</')) {
      const comp = openMatch[1].replace(/^XDS/, '');
      const isStructural = STRUCTURAL.has(comp);

      // Gather spatial props
      let tagText = '';
      for (let j = i; j < Math.min(i + 12, lines.length); j++) {
        tagText += ' ' + lines[j];
        if (lines[j].includes('>')) break;
      }

      const props = [];
      const propRegex = /\b(padding|contentPadding|gap|rowGap|columnGap|columns|minChildWidth|hasDivider|defaultHasDividers|variant|density|role|height|width|maxWidth)\s*[=]\s*\{?\s*['"]?([^}'"\s,/>]+)/g;
      let m;
      while ((m = propRegex.exec(tagText)) !== null) {
        const val = m[2];
        if (val === 'true') props.push(m[1]);
        else if (/^\d+$/.test(val)) props.push(`${m[1]}={${val}}`);
        else props.push(`${m[1]}="${val}"`);
      }

      const hasSpatialProps = props.length > 0;
      const propStr = hasSpatialProps ? ' ' + props.join(' ') : '';
      const isVStack = comp === 'VStack' || comp === 'HStack';
      const isSelfClosing = tagText.match(new RegExp('<' + openMatch[1] + '[^>]*/>', 's'));

      // VStack/HStack: only show if they have gap props
      if (isVStack && !hasSpatialProps) continue;

      if (isSelfClosing) {
        out.push('  '.repeat(depth) + `<${comp}${propStr} />`);
      } else if (isStructural || (isVStack && hasSpatialProps)) {
        out.push('  '.repeat(depth) + `<${comp}${propStr}>`);
        depthStack.push(comp);
        depth++;
      } else {
        out.push('  '.repeat(depth) + `<${comp}${propStr} />`);
      }
      continue;
    }

    // Closing tag
    const closeMatch = t.match(/^<\/(XDS\w+)>/);
    if (closeMatch) {
      const comp = closeMatch[1].replace(/^XDS/, '');
      if (depthStack.length > 0 && depthStack[depthStack.length - 1] === comp) {
        depthStack.pop();
        depth = Math.max(0, depth - 1);
        out.push('  '.repeat(depth) + `</${comp}>`);
      }
      continue;
    }

    // Slot props
    const slotMatch = t.match(/^(header|content|footer|start|end|sideNav|topNav)\s*=\s*\{/);
    if (slotMatch) {
      out.push('  '.repeat(depth) + `/* ${slotMatch[1]}: */`);
      continue;
    }

    // Wrapper divs with spatial styles
    if (t.startsWith('<div') && (t.includes('padding') || t.includes('maxWidth') || t.includes('gap:'))) {
      const styleProps = [];
      const divText = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');
      const pp = divText.match(/padding[^:]*:\s*['"]?([^'"},)]+)/);
      const mw = divText.match(/maxWidth:\s*(\d+)/);
      const gp = divText.match(/gap:\s*(\d+)/);
      const mg = divText.match(/margin:\s*['"]([^'"]+)['"]/);
      const mi = divText.match(/marginInline:\s*['"]([^'"]+)['"]/);
      if (pp) styleProps.push(`padding: ${pp[1].trim()}`);
      if (mw) styleProps.push(`maxWidth: ${mw[1]}`);
      if (gp) styleProps.push(`gap: ${gp[1]}`);
      if (mg) styleProps.push(`margin: ${mg[1]}`);
      if (mi) styleProps.push(`marginInline: ${mi[1]}`);
      if (styleProps.length > 0) {
        out.push('  '.repeat(depth) + `/* div: ${styleProps.join(', ')} */`);
      }
    }
  }

  return out.filter(l => l.trim()).join('\n');
}

// ── Command ──────────────────────────────────────────────────────────

export function registerTemplate(program) {
  program
    .command('template [name] [path]')
    .description('Inject a page template')
    .option('--list', 'List available templates with component compositions')
    .option(
      '--skeleton',
      'Show layout skeleton with spatial annotations (padding, gap, nesting)',
    )
    .action(async (name, targetPath, options) => {
      const templatesDir = path.join(CLI_ROOT, 'templates');
      const templates = await discoverTemplates();
      const templateNames = templates.map(t => t.dirName);
      const json = program.opts().json || false;

      if (options.list || (!name && !options.skeleton)) {
        if (json) {
          return jsonOut('template.list', templates.map(t => ({
            name: t.dirName,
            description: t.description,
            isReady: t.isReady,
          })));
        }
        console.log('\nAvailable templates:\n');
        for (const t of templates) {
          const status = t.isReady ? '' : ' (WIP)';
          const pagePath = path.join(templatesDir, t.dirName, 'page.tsx');
          const comps = fs.existsSync(pagePath)
            ? extractComponents(pagePath)
            : [];
          const compStr =
            comps.length > 0 ? `  [${comps.join(', ')}]` : '';

          console.log(`  ${t.dirName}${status}`);
          if (t.description) console.log(`    ${t.description}`);
          if (compStr) console.log(`   ${compStr}`);
        }
        console.log('\nUsage:');
        console.log('  xds template <name> [target-path]   Scaffold page');
        console.log(
          '  xds template <name> --skeleton      Layout reference\n',
        );
        return;
      }

      if (name && !templateNames.includes(name)) {
        if (json) return jsonError(`Unknown template "${name}"`, templateNames.map(n => ({name: n, reason: 'available template'})));
        console.error(`Error: Unknown template "${name}".`);
        console.error(`Available: ${templateNames.join(', ')}`);
        process.exit(1);
      }

      // --skeleton: show layout skeleton for a specific template
      if (options.skeleton) {
        if (!name) {
          console.error(
            'Error: Specify a template name. Usage: xds template <name> --skeleton',
          );
          console.error(`Available: ${templateNames.join(', ')}`);
          process.exit(1);
        }

        const pagePath = path.join(templatesDir, name, 'page.tsx');
        if (!fs.existsSync(pagePath)) {
          console.error(`Error: No page.tsx found for template "${name}".`);
          process.exit(1);
        }

        const src = fs.readFileSync(pagePath, 'utf-8');
        const skeleton = extractSkeleton(src);
        const comps = extractComponents(pagePath);

        const doc = await loadTemplateDoc(path.join(templatesDir, name));
        const desc = doc?.description || '';

        console.log(`\n# ${name}${desc ? ' — ' + desc : ''}`);
        console.log(`# Components: ${comps.join(', ')}\n`);
        console.log(skeleton);
        console.log('');
        return;
      }

      // Default: scaffold the template
      const outputDir = path.resolve(
        process.cwd(),
        targetPath || `./src/pages/${name}`,
      );
      const templateDir = path.join(templatesDir, name);

      fs.mkdirSync(outputDir, {recursive: true});

      const files = fs.readdirSync(templateDir);
      let copied = 0;

      for (const file of files) {
        if (file === 'template.doc.mjs') continue;
        const srcPath = path.join(templateDir, file);
        const stat = fs.statSync(srcPath);
        if (!stat.isFile()) continue;
        fs.copyFileSync(srcPath, path.join(outputDir, file));
        copied++;
      }

      const relOutput = path.relative(process.cwd(), outputDir);
      if (json) return jsonOut('template.copy', {template: name, outputDir: relOutput, filesCopied: copied});
      console.log(`\n✓ Copied ${copied} template files to ${relOutput}/\n`);
    });
}
