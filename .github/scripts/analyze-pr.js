#!/usr/bin/env node

/**
 * @description Analyzes PR changes to detect new/modified components and gather stats
 * @input --base <branch> --head <ref> --output <file>
 * @output JSON file with component analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};

const baseBranch = getArg('base') || 'main';
const headRef = getArg('head') || 'HEAD';
const outputFile = getArg('output') || 'analysis.json';

const CORE_SRC = 'packages/core/src';
const CORE_DIST = 'packages/core/dist';
const STORYBOOK_STORIES = 'apps/storybook/stories';

// Get list of component directories (excluding utils, hooks, theme)
function getComponentDirs() {
  const srcPath = path.join(process.cwd(), CORE_SRC);
  const entries = fs.readdirSync(srcPath, { withFileTypes: true });
  const excluded = ['hooks', 'theme', 'utils'];

  return entries
    .filter(e => e.isDirectory() && !excluded.includes(e.name))
    .map(e => e.name);
}

// Get changed files between base and head
function getChangedFiles() {
  try {
    const output = execSync(
      `git diff --name-only ${baseBranch}...${headRef}`,
      { encoding: 'utf8' }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch (e) {
    console.error('Error getting changed files:', e.message);
    return [];
  }
}

// Check if component exists in base branch
function componentExistsInBase(componentName) {
  try {
    execSync(
      `git show ${baseBranch}:${CORE_SRC}/${componentName}/index.ts`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    return true;
  } catch {
    return false;
  }
}

// Get file size in human readable format
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  } catch {
    return null;
  }
}

function getFileSizeBytes(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return null;
  }
}

// Get gzipped size
function getGzipSize(filePath) {
  try {
    const output = execSync(`gzip -c "${filePath}" | wc -c`, { encoding: 'utf8' });
    const bytes = parseInt(output.trim(), 10);
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  } catch {
    return null;
  }
}

// Get exports from a component
function getExports(componentName) {
  const indexPath = path.join(process.cwd(), CORE_SRC, componentName, 'index.ts');
  try {
    const content = fs.readFileSync(indexPath, 'utf8');
    const exportMatches = content.match(/export\s+{\s*([^}]+)\s*}/g) || [];
    const exports = [];

    for (const match of exportMatches) {
      const inner = match.replace(/export\s*{\s*/, '').replace(/\s*}/, '');
      exports.push(...inner.split(',').map(e => e.trim().split(' ')[0]));
    }

    // Also check for default exports
    if (content.includes('export default')) {
      exports.push('default');
    }

    return exports.filter(Boolean);
  } catch {
    return [];
  }
}

// Count props for main component
function getPropsCount(componentName) {
  const componentDir = path.join(process.cwd(), CORE_SRC, componentName);
  try {
    const files = fs.readdirSync(componentDir);
    const mainFile = files.find(f => f.startsWith('XDS') && f.endsWith('.tsx'));

    if (!mainFile) return null;

    const content = fs.readFileSync(path.join(componentDir, mainFile), 'utf8');

    // Look for Props type/interface
    const propsMatch = content.match(/(?:type|interface)\s+\w*Props\w*\s*=?\s*{([^}]+)}/);
    if (propsMatch) {
      const propsContent = propsMatch[1];
      const props = propsContent.split('\n').filter(line =>
        line.trim() &&
        !line.trim().startsWith('//') &&
        !line.trim().startsWith('*') &&
        line.includes(':')
      );
      return props.length;
    }

    return null;
  } catch {
    return null;
  }
}

// Check if component has tests
function hasTests(componentName) {
  const testPath = path.join(process.cwd(), CORE_SRC, componentName);
  try {
    const files = fs.readdirSync(testPath);
    return files.some(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
  } catch {
    return false;
  }
}

// Check if component has stories (checks both directory name and exported component names)
function hasStories(componentName) {
  const storiesDir = path.join(process.cwd(), STORYBOOK_STORIES);
  try {
    const files = fs.readdirSync(storiesDir);
    // Check directory name match
    if (files.some(f =>
      f.toLowerCase().includes(componentName.toLowerCase()) &&
      f.endsWith('.stories.tsx')
    )) return true;

    // Also check exported component names (e.g., Layer dir exports XDSPopover)
    const exports = getExports(componentName);
    const xdsComponents = exports.filter(e => e.startsWith('XDS'));
    return xdsComponents.some(comp => {
      const name = comp.replace(/^XDS/, '');
      return files.some(f =>
        f.toLowerCase().includes(name.toLowerCase()) &&
        f.endsWith('.stories.tsx')
      );
    });
  } catch {
    return false;
  }
}

// Get the Storybook story titles for a component (e.g., "Core/XDSButton")
// Returns array since a directory like Layer may have multiple story files
function getStoryTitle(componentName) {
  const storiesDir = path.join(process.cwd(), STORYBOOK_STORIES);
  try {
    const files = fs.readdirSync(storiesDir);

    // Find story files matching directory name or exported component names
    const exports = getExports(componentName);
    const searchNames = [componentName, ...exports.filter(e => e.startsWith('XDS')).map(e => e.replace(/^XDS/, ''))];

    const storyFiles = files.filter(f =>
      f.endsWith('.stories.tsx') &&
      searchNames.some(name => f.toLowerCase().includes(name.toLowerCase()))
    );

    if (storyFiles.length === 0) return null;

    const titles = storyFiles.map(storyFile => {
      const content = fs.readFileSync(path.join(storiesDir, storyFile), 'utf8');
      const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/);
      return titleMatch ? titleMatch[1] : null;
    }).filter(Boolean);

    return titles.length === 1 ? titles[0] : titles.length > 0 ? titles : null;
  } catch {
    return null;
  }
}

// Count lines of code in a file (excluding blank lines and comments)
function countLOC(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let loc = 0;
    let inBlockComment = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Track block comments
      if (trimmed.startsWith('/*')) inBlockComment = true;
      if (trimmed.endsWith('*/')) {
        inBlockComment = false;
        continue;
      }

      if (inBlockComment) continue;
      if (!trimmed) continue;
      if (trimmed.startsWith('//')) continue;
      if (trimmed.startsWith('*')) continue;

      loc++;
    }

    return loc;
  } catch {
    return 0;
  }
}

// Get total LOC for a component
function getComponentLOC(componentName) {
  const componentDir = path.join(process.cwd(), CORE_SRC, componentName);
  try {
    const files = fs.readdirSync(componentDir);
    let totalLOC = 0;
    let fileCount = 0;

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        // Skip test files
        if (file.includes('.test.')) continue;
        totalLOC += countLOC(path.join(componentDir, file));
        fileCount++;
      }
    }

    return { totalLOC, fileCount };
  } catch {
    return { totalLOC: 0, fileCount: 0 };
  }
}

// Calculate cyclomatic complexity (simplified - counts decision points)
function getComplexity(componentName) {
  const componentDir = path.join(process.cwd(), CORE_SRC, componentName);
  try {
    const files = fs.readdirSync(componentDir);
    let complexity = 1; // Base complexity

    for (const file of files) {
      if (!file.endsWith('.tsx')) continue;
      if (file.includes('.test.')) continue;

      const content = fs.readFileSync(path.join(componentDir, file), 'utf8');

      // Count decision points (simplified cyclomatic complexity)
      const patterns = [
        /\bif\s*\(/g,
        /\belse\s+if\s*\(/g,
        /\bswitch\s*\(/g,
        /\bcase\s+/g,
        /\?\s*[^:]/g,  // Ternary operators
        /\|\|/g,       // Logical OR (short-circuit)
        /&&/g,         // Logical AND (short-circuit)
        /\.map\s*\(/g, // Array iterations
        /\.filter\s*\(/g,
        /\.reduce\s*\(/g,
        /\.forEach\s*\(/g,
      ];

      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          complexity += matches.length;
        }
      }
    }

    // Categorize complexity
    let rating;
    if (complexity <= 5) rating = 'Low';
    else if (complexity <= 15) rating = 'Medium';
    else if (complexity <= 30) rating = 'High';
    else rating = 'Very High';

    return { score: complexity, rating };
  } catch {
    return { score: 0, rating: 'Unknown' };
  }
}

// Get component stats
function getComponentStats(componentName) {
  const distPath = path.join(process.cwd(), CORE_DIST, componentName);
  const loc = getComponentLOC(componentName);
  const complexity = getComplexity(componentName);

  return {
    esmSize: getFileSize(path.join(distPath, 'index.mjs')),
    esmBytes: getFileSizeBytes(path.join(distPath, 'index.mjs')),
    cjsSize: getFileSize(path.join(distPath, 'index.js')),
    cjsBytes: getFileSizeBytes(path.join(distPath, 'index.js')),
    exports: getExports(componentName),
    propsCount: getPropsCount(componentName),
    hasTests: hasTests(componentName),
    hasStories: hasStories(componentName),
    storyTitle: getStoryTitle(componentName),
    linesOfCode: loc.totalLOC,
    fileCount: loc.fileCount,
    complexity: complexity.score,
    complexityRating: complexity.rating,
  };
}

// Get total bundle stats
function getTotalBundleStats() {
  const distPath = path.join(process.cwd(), CORE_DIST);
  const esmPath = path.join(distPath, 'index.mjs');
  const cjsPath = path.join(distPath, 'index.js');

  return {
    esmSize: getFileSize(esmPath),
    esmBytes: getFileSizeBytes(esmPath),
    cjsSize: getFileSize(cjsPath),
    cjsBytes: getFileSizeBytes(cjsPath),
    gzipSize: getGzipSize(esmPath),
  };
}

// Main analysis
function analyze() {
  console.log(`Analyzing changes from ${baseBranch} to ${headRef}...`);

  const allComponents = getComponentDirs();
  const changedFiles = getChangedFiles();

  console.log(`Found ${allComponents.length} components`);
  console.log(`Found ${changedFiles.length} changed files`);

  // Detect which components are new or modified
  const newComponents = [];
  const modifiedComponents = [];

  for (const file of changedFiles) {
    if (!file.startsWith(CORE_SRC + '/')) continue;

    const relativePath = file.replace(CORE_SRC + '/', '');
    const componentName = relativePath.split('/')[0];

    if (!allComponents.includes(componentName)) continue;
    if (newComponents.includes(componentName) || modifiedComponents.includes(componentName)) continue;

    if (componentExistsInBase(componentName)) {
      modifiedComponents.push(componentName);
    } else {
      newComponents.push(componentName);
    }
  }

  console.log(`New components: ${newComponents.join(', ') || 'none'}`);
  console.log(`Modified components: ${modifiedComponents.join(', ') || 'none'}`);

  // Gather stats for affected components
  const componentStats = {};
  for (const comp of [...newComponents, ...modifiedComponents]) {
    componentStats[comp] = getComponentStats(comp);
  }

  // Build visual regression grep pattern from actual exported component names
  // (not directory names — e.g., Layer/ exports XDSPopover, XDSTooltip, etc.)
  const vrtComponents = [...new Set(
    Object.values(componentStats)
      .flatMap(stats => stats.exports.filter(e => e.startsWith('XDS')))
  )];

  const result = {
    newComponents,
    modifiedComponents,
    vrtComponents,
    componentStats,
    totalBundle: getTotalBundleStats(),
    analyzedAt: new Date().toISOString(),
  };

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log(`Analysis written to ${outputFile}`);

  return result;
}

analyze();
