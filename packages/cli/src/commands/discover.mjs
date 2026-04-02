/**
 * @file discover command — find external XDS packages and components
 *
 * Usage:
 *   xds discover                           List all packages
 *   xds discover @scope/name               List components in a package
 *   xds discover @scope/name/Component     Show docs for a component
 *   xds discover searchterm                Search across all packages
 */

import {loadConfig} from '../lib/config.mjs';
import {scanAllPackages, findComponentInPackages} from '../lib/package-scanner.mjs';
import {loadDocs} from '../lib/component-loader.mjs';
import {formatFull, formatBrief, formatCompact} from '../lib/component-format.mjs';
import {levenshteinDistance} from '../lib/string-utils.mjs';

export function registerDiscover(program) {
  program
    .command('discover [query]')
    .description('Discover external XDS packages and components')
    .option('--components', 'List components only')
    .action(async (query, options) => {
      const config = await loadConfig();
      const detail = program.opts().detail || 'full';

      if (config.packages.length === 0) {
        console.log('');
        console.log('No package directories configured.');
        console.log('');
        console.log('Add a packages field to xds.config.mjs:');
        console.log('');
        console.log('  export default {');
        console.log("    packages: ['/path/to/your/libs'],");
        console.log('  };');
        console.log('');
        return;
      }

      const packages = scanAllPackages(config.packages);

      if (packages.length === 0) {
        console.log('');
        console.log('No external XDS packages found.');
        console.log('');
        console.log('Packages opt in by adding an "xds" field to package.json:');
        console.log('');
        console.log('  {');
        console.log('    "xds": {');
        console.log('      "docs": "./src",');
        console.log('      "category": "Common"');
        console.log('    }');
        console.log('  }');
        console.log('');
        return;
      }

      // No query: list all packages
      if (!query) {
        printPackageList(packages, options.components);
        return;
      }

      // Starts with @: package navigation
      if (query.startsWith('@')) {
        const slashIdx = query.indexOf('/', query.indexOf('/') + 1);
        if (slashIdx > 0) {
          // @scope/name/Component
          const pkgName = query.slice(0, slashIdx);
          const compName = query.slice(slashIdx + 1);
          await showComponentDocs(packages, compName, pkgName, program, detail);
        } else {
          // @scope/name — list that package
          const pkg = packages.find(p => p.name === query);
          if (!pkg) {
            console.error('Package "' + query + '" not found.');
            console.error('');
            console.error('Available packages:');
            for (const p of packages) {
              console.error('  ' + p.name);
            }
            process.exit(1);
          }
          printSinglePackage(pkg);
        }
        return;
      }

      // No @: search across all packages
      await searchComponents(packages, query, program, detail);
    });
}

function printPackageList(packages, showComponents) {
  console.log('');
  for (const pkg of packages) {
    const count = pkg.components.length;
    const label = count === 1 ? 'component' : 'components';
    console.log(pkg.name + ' (' + count + ' ' + label + ')');

    if (showComponents) {
      for (const comp of pkg.components) {
        console.log('  ' + comp);
      }
    } else {
      const maxShow = 10;
      const shown = pkg.components.slice(0, maxShow);
      const remaining = count - maxShow;
      const list = shown.join(', ');
      if (remaining > 0) {
        console.log('  ' + list + ', +' + remaining + ' more');
      } else {
        console.log('  ' + list);
      }
    }
    console.log('');
  }
  console.log('Usage:');
  console.log('  xds discover <package>            Browse a package');
  console.log('  xds discover <package>/Component  View component docs');
  console.log('  xds discover <search>             Search all packages');
  console.log('');
}

function printSinglePackage(pkg) {
  console.log('');
  console.log(pkg.name + ' (' + pkg.components.length + ' components)');
  console.log('');
  for (const comp of pkg.components) {
    console.log('  ' + comp);
  }
  console.log('');
  console.log('Usage: xds discover ' + pkg.name + '/<ComponentName>');
  console.log('');
}

async function showComponentDocs(packages, compName, pkgName, program, detail) {
  const pkg = packages.find(p => p.name === pkgName);
  if (!pkg) {
    console.error('Package "' + pkgName + '" not found.');
    process.exit(1);
  }

  const result = findComponentInPackages([pkg], compName);
  if (!result) {
    // Substring match first, then fuzzy
    const substringHits = pkg.components.filter(
      c => c.toLowerCase().includes(compName.toLowerCase()),
    );
    const suggestions = substringHits.length > 0
      ? substringHits
      : fuzzyMatch(compName, pkg.components);
    if (suggestions.length > 0) {
      console.error('Component "' + compName + '" not found in ' + pkgName + '.');
      console.error('');
      console.error('Did you mean?');
      for (const s of suggestions) {
        console.error('  xds discover ' + pkgName + '/' + s);
      }
    } else {
      console.error('Component "' + compName + '" not found in ' + pkgName + '.');
      console.error('');
      console.error('Available: ' + pkg.components.join(', '));
    }
    process.exit(1);
  }

  await renderDocs(result, program, detail);
}

async function searchComponents(packages, query, program, detail) {
  const lower = query.toLowerCase();

  // Exact match first
  const exact = findComponentInPackages(packages, query);
  if (exact) {
    console.log('Found: ' + exact.pkg.name + '/' + exact.componentName);
    console.log('');
    await renderDocs(exact, program, detail);
    return;
  }

  // Substring match
  const substringMatches = [];
  for (const pkg of packages) {
    for (const comp of pkg.components) {
      if (comp.toLowerCase().includes(lower)) {
        substringMatches.push({pkg, comp});
      }
    }
  }

  if (substringMatches.length === 1) {
    const match = substringMatches[0];
    const result = findComponentInPackages([match.pkg], match.comp);
    if (result) {
      console.log('Found: ' + match.pkg.name + '/' + match.comp);
      console.log('');
      await renderDocs(result, program, detail);
      return;
    }
  }

  if (substringMatches.length > 1) {
    console.log('');
    console.log('Found ' + substringMatches.length + ' matches for "' + query + '":');
    console.log('');
    for (const m of substringMatches) {
      console.log('  xds discover ' + m.pkg.name + '/' + m.comp);
    }
    console.log('');
    return;
  }

  // Fuzzy match across all packages
  const allComponents = [];
  for (const pkg of packages) {
    for (const comp of pkg.components) {
      allComponents.push({pkg, comp});
    }
  }
  const fuzzyMatches = allComponents
    .map(item => ({
      ...item,
      distance: levenshteinDistance(lower, item.comp.toLowerCase()),
    }))
    .filter(m => m.distance <= 3)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  if (fuzzyMatches.length > 0) {
    console.error('"' + query + '" not found. Did you mean?');
    console.error('');
    for (const m of fuzzyMatches) {
      console.error('  xds discover ' + m.pkg.name + '/' + m.comp);
    }
  } else {
    console.error('"' + query + '" not found in any package.');
    console.error('');
    console.error('Run xds discover to see available packages.');
  }
  process.exit(1);
}

function fuzzyMatch(name, components, maxDistance = 3) {
  const lower = name.toLowerCase();
  return components
    .map(c => ({name: c, distance: levenshteinDistance(lower, c.toLowerCase())}))
    .filter(m => m.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
    .map(m => m.name);
}

async function renderDocs(result, program, detail) {
  try {
    const zh = program.opts().zh || false;
    const lang = program.opts().lang || null;
    const docs = await loadDocs(result.docPath, {zh, lang});

    if (detail === 'brief') {
      console.log(formatBrief(docs, result.componentName, result.pkg.name + '/' + result.componentName));
    } else if (detail === 'compact') {
      console.log(formatCompact(docs, result.componentName, result.pkg.name + '/' + result.componentName));
    } else {
      console.log(formatFull(docs));
    }
  } catch (e) {
    console.error('Failed to load docs: ' + e.message);
    process.exit(1);
  }

  console.log('');
  console.log('Package: ' + result.pkg.name);
  console.log('');
}
