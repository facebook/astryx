/**
 * @file component command — List components and print component docs
 *
 * Global options: --detail full|compact|brief, --lang en|zh|dense
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {findCoreDir, discoverExternalPackages} from '../../utils/paths.mjs';
import {
  discoverComponents,
  discoverExternalComponents,
  findComponentReadme,
  findComponentSource,
  findExternalComponentDoc,
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
  ensureImportStatement,
  extractProps,
} from '../../lib/component-legacy.mjs';
import {findClosestComponents} from '../../lib/string-utils.mjs';
import {resolveTheme} from '../../lib/resolve-theme.mjs';

export function registerComponent(program) {
  program
    .command('component [name]')
    .description('List components or print component docs')
    .option('--list', 'List all components grouped by category')
    .option('--category <category>', 'List components in a specific category')
    .option('--props', 'Print only the props table')
    .option('--source', 'Print component source code')
    .action(async (name, options) => {
      const coreDir = findCoreDir(process.cwd());
      const zh = program.opts().zh || false;
      const dense = program.opts().dense || false;
      const lang = program.opts().lang || null;
      const detail = program.opts().detail || 'full';

      const validDetails = ['full', 'compact', 'brief'];
      if (!validDetails.includes(detail)) {
        console.error(`Error: Invalid --detail value "${detail}".`);
        console.error(`Valid levels: ${validDetails.join(', ')}`);
        process.exit(1);
      }

      if (!coreDir) {
        console.error(
          'Error: Could not find @xds/core package.\n' +
            'Make sure you are inside the XDS monorepo or have @xds/core installed.',
        );
        process.exit(1);
      }

      // Resolve active theme for variant merging
      const themeData = resolveTheme(process.cwd());

      if (options.category || options.list || !name) {
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

          if (detail === 'brief') {
            // Brief list: name + one-line description for each component
            for (const comp of match[1]) {
              const readme = findComponentReadme(coreDir, comp);
              if (readme && readme.endsWith('.doc.mjs')) {
                try {
                  const docs = await loadDocs(readme, {zh, lang});
                  const importHint = resolveImportPath(coreDir, comp);
                  console.log(formatBrief(docs, comp, importHint, { themeData }));
                } catch {
                  console.log(`  ${comp}`);
                }
              } else {
                console.log(`  ${comp}`);
              }
            }
          } else {
            console.log(`\n${match[0]}:`);
            for (const comp of match[1]) {
              console.log(`  ${comp}`);
            }
            console.log('');
          }
          return;
        }

        // --list or no name: show all components
        if (detail === 'brief') {
          // Brief list: brief summaries of ALL components
          console.log(await formatBriefAll(coreDir, {zh, lang, themeData}));
        } else {
          console.log('');
          for (const [category, comps] of Object.entries(components)) {
            console.log(`${category}:`);
            for (const comp of comps) {
              console.log(`  ${comp}`);
            }
            console.log('');
          }
          // Show external packages
          const externals = discoverExternalPackages(process.cwd());
          for (const ext of externals) {
            const extComponents = discoverExternalComponents(ext.docsDir);
            if (extComponents.length > 0) {
              console.log(`${ext.category} (${ext.name}):`);
              for (const comp of extComponents) {
                console.log(`  ${comp}`);
              }
              console.log('');
            }
          }

          console.log('Usage: npx xds component <name>');
          console.log('');
        }
        return;
      }

      // Normalize: strip XDS prefix for directory lookup
      const dirName = name.replace(/^XDS/, '');

      if (options.source) {
        const sourcePath = findComponentSource(coreDir, dirName);
        if (!sourcePath) {
          console.error(`Error: Source for "${name}" not found.`);
          process.exit(1);
        }
        const source = fs.readFileSync(sourcePath, 'utf-8');
        console.log(source);
        return;
      }

      let readmePath = findComponentReadme(coreDir, dirName);
      let resolvedName = dirName;
      let fromExternal = null;

      // If not found in core, check external packages
      if (!readmePath) {
        const externals = discoverExternalPackages(process.cwd());
        for (const ext of externals) {
          const extDocPath = findExternalComponentDoc(ext.docsDir, dirName);
          if (extDocPath) {
            readmePath = extDocPath;
            fromExternal = ext;
            break;
          }
        }
      }

      if (!readmePath) {
        // Try fuzzy matching
        const components = discoverComponents(coreDir);
        const closest = findClosestComponents(dirName, components);

        if (closest.length === 1) {
          resolvedName = closest[0].name;
          readmePath = findComponentReadme(coreDir, resolvedName);
          if (readmePath) {
            console.log(`Did you mean ${resolvedName}?\n`);
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
          console.error('Run `npx xds component --list` to see available components.');
          process.exit(1);
        }
      }

      if (readmePath.endsWith('.doc.mjs')) {
        const docs = await loadDocs(readmePath, {zh, dense, lang});
        const importHint = fromExternal ? fromExternal.name : resolveImportPath(coreDir, resolvedName);
        if (options.props) {
          console.log(formatProps(docs, resolvedName));
        } else if (detail === 'brief') {
          console.log(formatBrief(docs, resolvedName, importHint, { themeData }));
        } else if (detail === 'compact') {
          console.log(formatCompact(docs, resolvedName, importHint));
        } else {
          console.log(formatFull(docs, { themeData }));
        }
      } else {
        // Legacy path for README.md files
        const content = fs.readFileSync(readmePath, 'utf-8');
        if (options.props) {
          console.log(extractProps(content, resolvedName));
        } else if (detail === 'brief') {
          console.log(extractBrief(content, resolvedName));
        } else if (detail === 'compact') {
          const compact = extractCompact(content, resolvedName);
          console.log(ensureImportStatement(compact, resolvedName, coreDir));
        } else {
          console.log(cleanReadme(content, resolvedName));
        }
      }
    });
}


// Re-export lib functions for backward compatibility
// (agent-docs.mjs, tests, and generate-skill-doc.sh import from here)
export {discoverComponents, discoverExternalComponents, findComponentReadme, findComponentSource, findExternalComponentDoc, resolveImportPath} from '../../lib/component-discovery.mjs';
export {discoverExternalPackages} from '../../utils/paths.mjs';
export {loadDocs} from '../../lib/component-loader.mjs';
export {formatFull, formatCompact, formatBrief, formatProps, formatBriefAll} from '../../lib/component-format.mjs';
export {cleanReadme, extractCompact, extractBrief, ensureImportStatement, extractProps} from '../../lib/component-legacy.mjs';
export {levenshteinDistance, findClosestComponents} from '../../lib/string-utils.mjs';
