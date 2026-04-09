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
import {template as templateApi} from '../api/template.mjs';

// ── Component extraction ─────────────────────────────────────────────

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

    const openMatch = t.match(/^<(XDS\w+)/);
    if (openMatch && !t.startsWith('</')) {
      const comp = openMatch[1].replace(/^XDS/, '');
      const isStructural = STRUCTURAL.has(comp);

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

    const slotMatch = t.match(/^(header|content|footer|start|end|sideNav|topNav)\s*=\s*\{/);
    if (slotMatch) {
      out.push('  '.repeat(depth) + `/* ${slotMatch[1]}: */`);
      continue;
    }

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

export {discoverTemplates, listTemplates} from '../api/template.mjs';

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
      const json = program.opts().json || false;

      // --skeleton is text-only, not part of the API
      if (options.skeleton) {
        if (!name) {
          const {template: templateApiFn} = await import('../api/template.mjs');
          const list = await templateApiFn(undefined, {list: true});
          const names = list.data.map(t => t.name);
          console.error('Error: Specify a template name. Usage: xds template <name> --skeleton');
          console.error(`Available: ${names.join(', ')}`);
          process.exit(1);
        }

        const templatesDir = path.join(CLI_ROOT, 'templates');
        const pagePath = path.join(templatesDir, name, 'page.tsx');
        if (!fs.existsSync(pagePath)) {
          console.error(`Error: No page.tsx found for template "${name}".`);
          process.exit(1);
        }

        const src = fs.readFileSync(pagePath, 'utf-8');
        const skeleton = extractSkeleton(src);
        const comps = extractComponents(pagePath);

        const docPath = path.join(templatesDir, name, 'template.doc.mjs');
        let desc = '';
        if (fs.existsSync(docPath)) {
          const mod = await import(`file://${docPath}`);
          desc = mod.doc?.description || '';
        }

        console.log(`\n# ${name}${desc ? ' — ' + desc : ''}`);
        console.log(`# Components: ${comps.join(', ')}\n`);
        console.log(skeleton);
        console.log('');
        return;
      }

      let result;
      try {
        result = await templateApi(name, {
          list: options.list,
          targetPath,
          cwd: process.cwd(),
        });
      } catch (e) {
        if (json) return jsonError(e.message, e.suggestions);
        console.error(`Error: ${e.message}`);
        if (e.suggestions?.length) {
          console.error(`Available: ${e.suggestions.map(s => s.name).join(', ')}`);
        }
        process.exit(1);
      }

      if (json) return jsonOut(result.type, result.data);

      switch (result.type) {
        case 'template.list': {
          const templatesDir = path.join(CLI_ROOT, 'templates');
          console.log('\nAvailable templates:\n');
          for (const t of result.data) {
            const status = t.isReady ? '' : ' (WIP)';
            const pagePath = path.join(templatesDir, t.name, 'page.tsx');
            const comps = fs.existsSync(pagePath) ? extractComponents(pagePath) : [];
            const compStr = comps.length > 0 ? `  [${comps.join(', ')}]` : '';
            console.log(`  ${t.name}${status}`);
            if (t.description) console.log(`    ${t.description}`);
            if (compStr) console.log(`   ${compStr}`);
          }
          console.log('\nUsage:');
          console.log('  xds template <name> [target-path]   Scaffold page');
          console.log('  xds template <name> --skeleton      Layout reference\n');
          break;
        }

        case 'template.copy': {
          console.log(`\n✓ Copied ${result.data.filesCopied} template files to ${result.data.outputDir}/\n`);
          break;
        }
      }
    });
}
