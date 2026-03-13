/**
 * @file component command — XDS component documentation
 *
 * Subcommands: list, search, metadata, props, examples, example, source
 * Global options: --detail brief|normal, --lang en|zh|dense
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {findCoreDir} from '../../utils/paths.mjs';
import {
  discoverComponents,
  findComponentReadme,
  findComponentSource,
  resolveImportPath,
} from '../../lib/component-discovery.mjs';
import {loadDocs} from '../../lib/component-loader.mjs';
import {
  formatFull,
  formatCompact,
  formatBrief,
  formatProps,
  formatBriefAll,
} from '../../lib/component-format.mjs';
import {
  cleanReadme,
  extractCompact,
  extractBrief,
  extractProps,
} from '../../lib/component-legacy.mjs';
import {findClosestComponents} from '../../lib/string-utils.mjs';

/**
 * Resolve a component name to its doc path, with fuzzy matching.
 * Exits with an error if not found.
 */
function resolveComponent(coreDir, name) {
  const dirName = name.replace(/^XDS/, '');
  let readmePath = findComponentReadme(coreDir, dirName);
  let resolvedName = dirName;

  if (!readmePath) {
    const components = discoverComponents(coreDir);
    const closest = findClosestComponents(dirName, components);

    if (closest.length === 1) {
      resolvedName = closest[0].name;
      readmePath = findComponentReadme(coreDir, resolvedName);
      if (readmePath) {
        console.error(`Did you mean ${resolvedName}?\n`);
      }
    } else if (closest.length > 1) {
      console.error(`Component "${name}" not found. Did you mean one of these?\n`);
      for (const match of closest) {
        console.error(`  ${match.name}`);
      }
      console.error('');
      process.exit(1);
    }

    if (!readmePath) {
      console.error(`Error: Component "${name}" not found.`);
      console.error('Run \`npx xds component list\` to see available components.');
      process.exit(1);
    }
  }

  return {readmePath, resolvedName};
}

/**
 * Get coreDir or exit with error.
 */
function requireCoreDir() {
  const coreDir = findCoreDir(process.cwd());
  if (!coreDir) {
    console.error(
      'Error: Could not find @xds/core package.\n' +
        'Make sure you are inside the XDS monorepo or have @xds/core installed.',
    );
    process.exit(1);
  }
  return coreDir;
}

/**
 * Get lang options from the root program.
 */
function getLangOpts(program) {
  const opts = program.opts();
  return {
    zh: opts.zh || false,
    dense: opts.dense || false,
    lang: opts.lang || null,
  };
}

export function registerComponent(program) {
  const component = program
    .command('component')
    .description('XDS component documentation')
    ;

  // --- list ---
  component
    .command('list')
    .description('List all components grouped by category')
    .option('--category <category>', 'Filter to a specific category')
    .option('--detail <level>', 'Output detail: brief (names only) or normal (by category)', 'normal')
    .action((options) => {
      const coreDir = requireCoreDir();
      const components = discoverComponents(coreDir);

      if (options.category) {
        const cat = options.category;
        const match = Object.entries(components).find(
          ([key]) => key.toLowerCase() === cat.toLowerCase(),
        );
        if (!match) {
          console.error(`Error: Unknown category "${cat}".`);
          console.error(
            `Available categories: ${Object.keys(components).join(', ')}`,
          );
          process.exit(1);
        }
        console.log(`\n${match[0]}:`);
        for (const comp of match[1]) {
          console.log(`  ${comp}`);
        }
        console.log('');
        return;
      }

      if (options.detail === 'brief') {
        const all = Object.values(components).flat();
        for (const comp of all) {
          console.log(comp);
        }
        return;
      }

      console.log('');
      for (const [category, comps] of Object.entries(components)) {
        console.log(`${category}:`);
        for (const comp of comps) {
          console.log(`  ${comp}`);
        }
        console.log('');
      }
    });

  // --- catalog ---
  component
    .command('catalog')
    .description('Brief summaries of all components (name, description, key props, one example)')
    .action(async () => {
      const coreDir = requireCoreDir();
      const langOpts = getLangOpts(program);
      console.log(await formatBriefAll(coreDir, langOpts));
    });

  // --- search ---
  component
    .command('search <query>')
    .description('Search components by name or description')
    .action(async (query, options) => {
      const coreDir = requireCoreDir();
      const langOpts = getLangOpts(program);
      const components = discoverComponents(coreDir);
      const allComps = Object.values(components).flat();
      const q = query.toLowerCase();

      const matches = [];

      for (const comp of allComps) {
        const nameMatch = comp.toLowerCase().includes(q);
        let descMatch = false;
        let description = '';

        if (!nameMatch || options.detail === 'normal') {
          const readmePath = findComponentReadme(coreDir, comp);
          if (readmePath && readmePath.endsWith('.doc.mjs')) {
            try {
              const docs = await loadDocs(readmePath, langOpts);
              description = docs.description || '';
              descMatch = description.toLowerCase().includes(q);
            } catch (e) {}
          }
        }

        if (nameMatch || descMatch) {
          matches.push({name: comp, description});
        }
      }

      if (matches.length === 0) {
        console.error(`No components matching "${query}".`);
        process.exit(1);
      }

      for (const m of matches) {
        if (options.detail === 'brief') {
          console.log(m.name);
        } else {
          console.log(`${m.name}${m.description ? ' — ' + m.description : ''}`);
        }
      }
    });

  // --- metadata ---
  component
    .command('metadata <name>')
    .description('Get component description, features, notes, accessibility, keyboard')
    .action(async (name, options) => {
      const coreDir = requireCoreDir();
      const langOpts = getLangOpts(program);
      const {readmePath, resolvedName} = resolveComponent(coreDir, name);

      if (readmePath.endsWith('.doc.mjs')) {
        const docs = await loadDocs(readmePath, langOpts);

        if (options.detail === 'brief') {
          console.log(`${resolvedName}: ${docs.description || ''}`);
          return;
        }

        // Normal: full metadata (description, features, notes, a11y, keyboard, theming)
        // but NOT props or examples
        const lines = [];
        lines.push(`# ${resolvedName}\n`);
        lines.push(docs.description || '');
        lines.push('');

        if (docs.features && docs.features.length > 0) {
          lines.push('## Features\n');
          for (const f of docs.features) {
            lines.push(`- ${f}`);
          }
          lines.push('');
        }

        if (docs.accessibility && docs.accessibility.length > 0) {
          lines.push('## Accessibility\n');
          for (const a of docs.accessibility) {
            lines.push(`- ${a}`);
          }
          lines.push('');
        }

        if (docs.keyboard) {
          lines.push('## Keyboard\n');
          lines.push(docs.keyboard);
          lines.push('');
        }

        if (docs.notes && docs.notes.length > 0) {
          lines.push('## Notes\n');
          for (const n of docs.notes) {
            lines.push(`- ${n}`);
          }
          lines.push('');
        }

        if (docs.theming && docs.theming.targets) {
          lines.push('## Theming\n');
          for (const t of docs.theming.targets) {
            const vp = t.visualProps ? ` (${t.visualProps.join(', ')})` : '';
            lines.push(`- \`.${t.className}\`${vp}`);
          }
          lines.push('');
        }

        console.log(lines.join('\n'));
      } else {
        // Legacy: just dump the cleaned readme
        const content = fs.readFileSync(readmePath, 'utf-8');
        console.log(cleanReadme(content, resolvedName));
      }
    });

  // --- props ---
  component
    .command('props <name>')
    .description('List props for a component')
    .action(async (name, options) => {
      const coreDir = requireCoreDir();
      const langOpts = getLangOpts(program);
      const {readmePath, resolvedName} = resolveComponent(coreDir, name);

      if (readmePath.endsWith('.doc.mjs')) {
        const docs = await loadDocs(readmePath, langOpts);

        if (options.detail === 'brief') {
          // Just prop names and types, one per line
          const props = docs.props || (docs.components ? docs.components.flatMap(c => c.props || []) : []);
          for (const p of props) {
            const req = p.required ? ' (required)' : '';
            const def = p.default ? ` = ${p.default}` : '';
            console.log(`${p.name}: ${p.type}${def}${req}`);
          }
          return;
        }

        console.log(formatProps(docs, resolvedName));
      } else {
        const content = fs.readFileSync(readmePath, 'utf-8');
        console.log(extractProps(content, resolvedName));
      }
    });

  // --- examples ---
  component
    .command('examples <name>')
    .description('List example titles for a component')
    .action(async (name) => {
      const coreDir = requireCoreDir();
      const {readmePath, resolvedName} = resolveComponent(coreDir, name);

      if (!readmePath.endsWith('.doc.mjs')) {
        console.error('Examples listing only available for .doc.mjs components.');
        process.exit(1);
      }

      const docs = await loadDocs(readmePath, {});
      const examples = docs.examples || [];

      // Also gather sub-component examples
      const subExamples = [];
      if (docs.components) {
        for (const comp of docs.components) {
          if (comp.examples) {
            for (const ex of comp.examples) {
              subExamples.push({...ex, component: comp.name});
            }
          }
        }
      }

      let num = 1;
      if (examples.length > 0) {
        for (const ex of examples) {
          console.log(`${num}. ${ex.label || '(untitled)'}`);
          num++;
        }
      }
      if (subExamples.length > 0) {
        for (const ex of subExamples) {
          console.log(`${num}. [${ex.component}] ${ex.label || '(untitled)'}`);
          num++;
        }
      }

      if (num === 1) {
        console.log('No examples found.');
      }
    });

  // --- example ---
  component
    .command('example <name> [num]')
    .description('Show code for a specific example (use examples command to see numbers)')
    .action(async (name, num) => {
      const coreDir = requireCoreDir();
      const {readmePath, resolvedName} = resolveComponent(coreDir, name);

      if (!readmePath.endsWith('.doc.mjs')) {
        console.error('Example lookup only available for .doc.mjs components.');
        process.exit(1);
      }

      const docs = await loadDocs(readmePath, {});

      // Build flat list of all examples
      const allExamples = [...(docs.examples || [])];
      if (docs.components) {
        for (const comp of docs.components) {
          if (comp.examples) {
            for (const ex of comp.examples) {
              allExamples.push({...ex, component: comp.name});
            }
          }
        }
      }

      const idx = num ? parseInt(num, 10) - 1 : 0;
      if (idx < 0 || idx >= allExamples.length) {
        console.error(`Example ${num || 1} not found. ${resolvedName} has ${allExamples.length} examples.`);
        console.error(`Run \`npx xds component examples ${resolvedName}\` to see them.`);
        process.exit(1);
      }

      const ex = allExamples[idx];
      if (ex.label) {
        console.log(`// ${ex.component ? ex.component + ': ' : ''}${ex.label}`);
      }
      console.log(ex.code);
    });

  // --- source ---
  component
    .command('source <name>')
    .description('Print component source code')
    .action((name) => {
      const coreDir = requireCoreDir();
      const dirName = name.replace(/^XDS/, '');
      const sourcePath = findComponentSource(coreDir, dirName);
      if (!sourcePath) {
        console.error(`Error: Source for "${name}" not found.`);
        process.exit(1);
      }
      console.log(fs.readFileSync(sourcePath, 'utf-8'));
    });
}

// Re-export lib functions for backward compatibility
export {discoverComponents, findComponentReadme, findComponentSource, resolveImportPath} from '../../lib/component-discovery.mjs';
export {loadDocs} from '../../lib/component-loader.mjs';
export {formatFull, formatCompact, formatBrief, formatProps, formatBriefAll} from '../../lib/component-format.mjs';
export {cleanReadme, extractCompact, extractBrief, extractProps} from '../../lib/component-legacy.mjs';
export {levenshteinDistance, findClosestComponents} from '../../lib/string-utils.mjs';
