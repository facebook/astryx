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
import {findClosestComponents, searchComponents} from '../../lib/string-utils.mjs';
import {resolveTheme} from '../../lib/resolve-theme.mjs';
import {getRunPrefix} from '../../utils/package-manager.mjs';
import {jsonOut, jsonError} from '../../lib/json.mjs';

export function registerComponent(program) {
  program
    .command('component [name]')
    .description('List components or print component docs')
    .option('--list', 'List all components grouped by category')
    .option('--category <category>', 'List components in a specific category')
    .option('--props', 'Print only the props table')
    .option('--source', 'Print component source code')
    .action(async (name, options) => {
      const run = getRunPrefix();
      const coreDir = findCoreDir(process.cwd());
      const zh = program.opts().zh || false;
      const dense = program.opts().dense || false;
      const lang = program.opts().lang || null;
      const detail = program.opts().detail || 'full';
      const json = program.opts().json || false;

      const validDetails = ['full', 'compact', 'brief'];
      if (!validDetails.includes(detail)) {
        if (json) return jsonError(`Invalid --detail value "${detail}". Valid levels: ${validDetails.join(', ')}`);
        console.error(`Error: Invalid --detail value "${detail}".`);
        console.error(`Valid levels: ${validDetails.join(', ')}`);
        process.exit(1);
      }

      if (!coreDir) {
        if (json) return jsonError('Could not find @xds/core package');
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
            if (json) return jsonError(`Unknown category "${cat}"`, Object.keys(components).map(k => ({name: k, reason: 'valid category'})));
            console.error(`Error: Unknown category "${cat}".`);
            console.error(
              `Available categories: ${Object.keys(components).join(', ')}`,
            );
            process.exit(1);
          }

          if (json && detail === 'brief') {
            const entries = [];
            for (const comp of match[1]) {
              const readme = findComponentReadme(coreDir, comp);
              if (readme && readme.endsWith('.doc.mjs')) {
                try {
                  const docs = await loadDocs(readme, {zh, lang});
                  entries.push({name: comp, description: docs.description, import: resolveImportPath(coreDir, comp)});
                } catch {
                  entries.push({name: comp, description: '', import: resolveImportPath(coreDir, comp)});
                }
              } else {
                entries.push({name: comp, description: '', import: resolveImportPath(coreDir, comp)});
              }
            }
            return jsonOut('component.brief', {[match[0]]: entries});
          }
          if (json) return jsonOut('component.list', {[match[0]]: match[1]});

          if (detail === 'brief') {
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
        if (json && detail === 'brief') {
          /** @type {Record<string, Array<import('../../types/component').ComponentBriefEntry>>} */
          const result = {};
          for (const [category, comps] of Object.entries(components)) {
            result[category] = [];
            for (const comp of comps) {
              const readme = findComponentReadme(coreDir, comp);
              if (readme && readme.endsWith('.doc.mjs')) {
                try {
                  const docs = await loadDocs(readme, {zh, lang});
                  result[category].push({name: comp, description: docs.description, import: resolveImportPath(coreDir, comp)});
                } catch {
                  result[category].push({name: comp, description: '', import: resolveImportPath(coreDir, comp)});
                }
              } else {
                result[category].push({name: comp, description: '', import: resolveImportPath(coreDir, comp)});
              }
            }
          }
          return jsonOut('component.brief', result);
        }
        if (json) {
          const externals = discoverExternalPackages(process.cwd());
          for (const ext of externals) {
            const extComps = discoverExternalComponents(ext.docsDir);
            if (extComps.length > 0) {
              components[`${ext.category} (${ext.name})`] = extComps;
            }
          }
          return jsonOut('component.list', components);
        }

        if (detail === 'brief') {
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

          console.log(`Usage: ${run} xds component <name>`);
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
        const components = discoverComponents(coreDir);
        const results = await searchComponents(dirName, coreDir, components);

        if (results.length > 0) {
          const topScore = results[0].score;
          const topTied = results.filter(r => r.score === topScore);
          const secondScore = results.length > topTied.length
            ? results[topTied.length].score : 0;
          const gap = topScore - secondScore;

          if (topScore >= 90 && topTied.length === 1 && gap >= 20) {
            // Crystal clear single winner: show docs directly
            resolvedName = topTied[0].name;
            readmePath = findComponentReadme(coreDir, resolvedName);
            if (readmePath && topScore < 100) {
              console.log(`Showing results for ${resolvedName} (matched ${topTied[0].reason})\n`);
            }
          } else {
            // Multiple strong matches or ambiguous: show options
            // Include everything within 20 points of the top, min 2, max 5
            const threshold = Math.max(topScore - 20, 1);
            const candidates = results.filter(r => r.score >= threshold).slice(0, 5);
            if (candidates.length < 2) candidates.push(...results.slice(candidates.length, 2));

            console.error(`No component named "${name}". Did you mean:\n`);
            for (const match of candidates) {
              console.error(`  ${match.name}  (${match.reason})`);
            }
            console.error(`\nRun \`${run} xds component <name>\` to view docs.`);
            process.exit(1);
          }
        } else {
          console.error(`No component named "${name}".`);
          console.error(`Run \`${run} xds component --list\` to see available components.`);
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
export {levenshteinDistance, findClosestComponents, searchComponents} from '../../lib/string-utils.mjs';
