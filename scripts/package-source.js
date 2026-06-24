#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file package-source.js
 * @description Packages XDS raw source files into a distributable tarball
 *
 * Usage: node scripts/package-source.js
 * Output: dist/xds-core-{version}.tgz
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CORE_DIR = path.join(ROOT, 'packages', 'core');
const SRC_DIR = path.join(CORE_DIR, 'src');
const DIST_DIR = path.join(ROOT, 'dist-source');
const AGENT_TOOLS_DIR = path.join(ROOT, 'packages', 'cli');
const PKG = require(path.join(CORE_DIR, 'package.json'));

// Files/patterns to exclude from distribution
const EXCLUDE_PATTERNS = [
  /\.test\.tsx?$/,      // Test files
  /\.spec\.tsx?$/,      // Spec files
  /__tests__/,          // Test directories
  /__mocks__/,          // Mock directories
];

function shouldInclude(filePath) {
  return !EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const relativePath = path.relative(SRC_DIR, srcPath);

    if (!shouldInclude(relativePath)) {
      console.log(`  Excluding: ${relativePath}`);
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  Copied: ${relativePath}`);
    }
  }
}

/**
 * Derive source exports from the "source" condition in package.json exports.
 *
 * The canonical exports map is maintained by scripts/sync-exports.js, which
 * adds a "source" condition pointing to the TypeScript source for each entry.
 * This function reads those "source" paths and strips the "src/" prefix
 * (since the source distribution root IS the src/ directory).
 *
 * Falls back to auto-discovery if "source" conditions are missing.
 */
function deriveSourceExports() {
  const sourceExports = {};

  for (const [key, value] of Object.entries(PKG.exports)) {
    // Handle string exports (e.g., "./reset.css": "./src/reset.css")
    if (typeof value === 'string') {
      if (value.startsWith('./src/')) {
        sourceExports[key] = value.replace('./src/', './');
      } else if (!value.includes('/dist/')) {
        sourceExports[key] = value;
      }
      continue;
    }

    // Handle object exports — prefer the "source" condition
    if (typeof value === 'object' && value !== null) {
      if (value.source) {
        // Strip ./src/ prefix since the tarball root is src/
        sourceExports[key] = value.source.replace('./src/', './');
      } else {
        // Fallback: derive from import/require path
        const importPath = value.import || value.require || value.types;
        if (!importPath) continue;
        const sourcePath = importPath
          .replace('./dist/', './')
          .replace(/\.mjs$/, '.ts')
          .replace(/\.js$/, '.ts');
        sourceExports[key] = sourcePath;
      }
    }
  }

  // Auto-discover component directories with index.ts that aren't in exports
  const srcEntries = fs.readdirSync(SRC_DIR, { withFileTypes: true });
  for (const entry of srcEntries) {
    if (!entry.isDirectory()) continue;
    const exportKey = './' + entry.name;
    if (sourceExports[exportKey]) continue;

    const indexPath = path.join(SRC_DIR, entry.name, 'index.ts');
    if (fs.existsSync(indexPath)) {
      sourceExports[exportKey] = './' + entry.name + '/index.ts';
    }
  }

  return sourceExports;
}

function createPackageJson() {
  // Create a package.json for source consumption
  const sourcePackage = {
    name: '@astryxdesign/core',
    version: PKG.version,
    description: 'XDS Design System - Raw Source Distribution',

    // Point directly to source
    main: './index.ts',
    module: './index.ts',
    types: './index.ts',

    sideEffects: [
      '**/*.stylex.ts',
      '**/*.css',
    ],

    // Derive exports from core package.json
    exports: deriveSourceExports(),

    peerDependencies: PKG.peerDependencies,
    dependencies: PKG.dependencies,

    // Consumer build requirements
    engines: {
      node: '>=18.0.0',
    },

    // Metadata
    repository: PKG.repository,
    license: PKG.license || 'MIT',

    // Instructions for consumers
    xds: {
      distribution: 'source',
      requirements: [
        'TypeScript >= 5.0',
        '@stylexjs/babel-plugin',
        'Babel or compatible build tool',
      ],
    },
  };

  return sourcePackage;
}

function createReadme() {
  return `# XDS Core - Raw Source Distribution

This package contains the raw TypeScript source files for XDS components.

## Quick Start

1. Extract to your project:
   \`\`\`bash
   mkdir -p src/xds
   tar -xzf xds-core-${PKG.version}.tgz -C src/xds
   \`\`\`

2. Run setup (optional - configures AI coding assistant docs):
   \`\`\`bash
   node src/xds/setup.mjs
   \`\`\`

3. Import components:
   \`\`\`tsx
   import { XDSButton } from './xds/Button';
   import { XDSTheme, defaultTheme } from './xds/theme';
   \`\`\`

## Requirements

- **TypeScript** >= 5.0
- **StyleX Babel Plugin** - \`@stylexjs/babel-plugin\`
- **React** >= 19.0.0

## StyleX Configuration

### Next.js (Babel + PostCSS)

\`\`\`js
// babel.config.js
module.exports = {
  presets: ['next/babel'],
  plugins: [
    ['@stylexjs/babel-plugin', {
      dev: process.env.NODE_ENV !== 'production',
      stylexSheetName: '<>',
      genConditionalClasses: true,
    }],
  ],
};
\`\`\`

\`\`\`js
// postcss.config.mjs
import stylexPlugin from '@stylexjs/postcss-plugin';

export default {
  plugins: [
    stylexPlugin({
      include: [
        'src/**/*.{js,ts,tsx}',
        'src/xds/**/*.{ts,tsx}',  // Include XDS source
      ],
    }),
  ],
};
\`\`\`

### Vite (unplugin)

\`\`\`js
// vite.config.ts
import { stylexPlugin } from '@stylexjs/unplugin/vite';

export default {
  plugins: [
    stylexPlugin({
      stylexImports: ['@stylexjs/stylex'],
      include: [
        /\\.tsx?$/,
        /xds\\/.*\\.tsx?$/,  // Include XDS source
      ],
    }),
  ],
};
\`\`\`

## Theming

Wrap your app with the theme provider:

\`\`\`tsx
import { XDSTheme, defaultTheme } from './xds/theme';

function App() {
  return (
    <XDSTheme theme={defaultTheme}>
      {/* Your app */}
    </XDSTheme>
  );
}
\`\`\`

## AI Coding Assistant Support

XDS includes documentation optimized for AI coding assistants (Claude, Cursor, etc.).

Run the setup script to install:
\`\`\`bash
node src/xds/setup.mjs
\`\`\`

This will:
- Ask if you want to add XDS guidance to your AGENTS.md
- Create a \`.astryx-docs/\` folder with component documentation

## Version

${PKG.version}
`;
}

function createSetupScript() {
  return `#!/usr/bin/env node
/**
 * XDS Setup Script
 * Configures AI coding assistant documentation
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function main() {
  console.log('\\n🎨 XDS Setup\\n');

  const answer = await ask('Add XDS documentation to AGENTS.md for AI coding assistants? (y/N) ');

  if (answer === 'y' || answer === 'yes') {
    // Find project root (look for package.json)
    let projectRoot = process.cwd();
    for (let i = 0; i < 10; i++) {
      if (fs.existsSync(path.join(projectRoot, 'package.json'))) {
        break;
      }
      const parent = path.dirname(projectRoot);
      if (parent === projectRoot) break;
      projectRoot = parent;
    }

    // Run agents-md script
    const agentsMdPath = path.join(__dirname, 'cli', 'bin', 'astryx.mjs');
    if (fs.existsSync(agentsMdPath)) {
      const { execSync } = await import('node:child_process');
      try {
        execSync(\`node "\${agentsMdPath}" agent-docs\`, {
          cwd: projectRoot,
          stdio: 'inherit'
        });
      } catch (e) {
        console.error('Failed to install AGENTS.md:', e.message);
      }
    } else {
      console.log('⚠️  CLI not found at:', agentsMdPath);
    }
  } else {
    console.log('\\nSkipped AGENTS.md setup.');
    console.log('You can run this later with: node src/xds/setup.mjs');
  }

  console.log('\\n✅ XDS setup complete!\\n');
  rl.close();
}

main();
`;
}

function copyAgentTools(dest) {
  const agentToolsDest = path.join(dest, 'cli');

  if (!fs.existsSync(AGENT_TOOLS_DIR)) {
    console.log('  Warning: cli package not found, skipping');
    return;
  }

  fs.mkdirSync(agentToolsDest, { recursive: true });

  // Copy bin directory
  const binSrc = path.join(AGENT_TOOLS_DIR, 'bin');
  const binDest = path.join(agentToolsDest, 'bin');
  if (fs.existsSync(binSrc)) {
    fs.mkdirSync(binDest, { recursive: true });
    for (const file of fs.readdirSync(binSrc)) {
      fs.copyFileSync(path.join(binSrc, file), path.join(binDest, file));
      console.log(`  Copied: cli/bin/${file}`);
    }
  }

  // Copy docs directory
  const docsSrc = path.join(AGENT_TOOLS_DIR, 'docs');
  const docsDest = path.join(agentToolsDest, 'docs');
  if (fs.existsSync(docsSrc)) {
    fs.mkdirSync(docsDest, { recursive: true });
    for (const file of fs.readdirSync(docsSrc)) {
      fs.copyFileSync(path.join(docsSrc, file), path.join(docsDest, file));
      console.log(`  Copied: cli/docs/${file}`);
    }
  }
}

function main() {
  console.log(`\nPackaging XDS Core v${PKG.version} (source distribution)\n`);

  // Clean dist directory
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Copy source files
  console.log('Copying source files...');
  copyDir(SRC_DIR, DIST_DIR);

  // Create package.json
  console.log('\nCreating package.json...');
  const packageJson = createPackageJson();
  fs.writeFileSync(
    path.join(DIST_DIR, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create README
  console.log('Creating README.md...');
  fs.writeFileSync(
    path.join(DIST_DIR, 'README.md'),
    createReadme()
  );

  // Create setup script
  console.log('Creating setup.mjs...');
  fs.writeFileSync(
    path.join(DIST_DIR, 'setup.mjs'),
    createSetupScript()
  );

  // Copy CLI tools
  console.log('\nCopying CLI tools...');
  copyAgentTools(DIST_DIR);

  // Create tarball
  console.log('\nCreating tarball...');
  const tarballName = `xds-core-${PKG.version}.tgz`;
  execSync(`tar -czf ${tarballName} -C dist-source .`, { cwd: ROOT });

  // Move to dist directory (create if needed)
  const distPath = path.join(ROOT, 'dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
  }
  fs.renameSync(
    path.join(ROOT, tarballName),
    path.join(distPath, tarballName)
  );

  // Clean up intermediate directory
  fs.rmSync(DIST_DIR, { recursive: true });

  console.log(`\nDone! Package created at: dist/${tarballName}`);
  console.log(`\nTo install in a project:`);
  console.log(`  tar -xzf ${tarballName} -C ./src/xds`);
}

main();
