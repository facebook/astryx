// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as path from 'node:path';
import {runCommand} from './process.mjs';
import {DEFAULT_REACT_RUNTIME_VERSION} from './constants.mjs';

const fsp = fs.promises;

export async function prepareProject(spec, projectDir) {
  await fsp.rm(projectDir, {recursive: true, force: true});
  await fsp.mkdir(projectDir, {recursive: true});

  if (spec.name === 'react-build') {
    await prepareReactBuild(spec, projectDir);
  } else if (spec.name === 'react-nobuild') {
    await prepareReactNoBuild(spec, projectDir);
  } else if (spec.name === 'vanilla') {
    await prepareVanilla(spec, projectDir);
  } else {
    throw new Error(`Unsupported delivery config: ${spec.name}`);
  }
}

async function prepareReactBuild(spec, projectDir) {
  await writeJson(path.join(projectDir, 'package.json'), {
    name: 'astryx-delivery-react-build',
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      typecheck: 'tsc --noEmit',
      preview: 'vite preview',
    },
    dependencies: {
      '@astryxdesign/core': spec.reactVersion,
      '@astryxdesign/theme-neutral': spec.reactVersion,
      '@stylexjs/stylex': '0.19.0',
      react: DEFAULT_REACT_RUNTIME_VERSION,
      'react-dom': DEFAULT_REACT_RUNTIME_VERSION,
    },
    devDependencies: {
      '@astryxdesign/cli': spec.reactVersion,
      '@types/react': '^19.2.0',
      '@types/react-dom': '^19.2.0',
      '@vitejs/plugin-react': '^5.2.0',
      typescript: '^6.0.0',
      vite: '^8.0.0',
    },
  });
  await fsp.mkdir(path.join(projectDir, 'src'), {recursive: true});
  await fsp.writeFile(
    path.join(projectDir, 'index.html'),
    '<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Astryx delivery test</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
  );
  await fsp.writeFile(
    path.join(projectDir, 'src', 'main.tsx'),
    `import React from 'react';
import {createRoot} from 'react-dom/client';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import {App} from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Theme theme={neutralTheme}>
      <App />
    </Theme>
  </React.StrictMode>,
);
`,
  );
  await fsp.writeFile(
    path.join(projectDir, 'src', 'App.tsx'),
    `import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';

export function App() {
  return (
    <VStack gap={4} padding={6}>
      <Card padding={5}>
        <Heading level={1}>Astryx starter</Heading>
        <Text type="supporting">Replace this starter with the requested UI.</Text>
      </Card>
    </VStack>
  );
}
`,
  );
  await fsp.writeFile(
    path.join(projectDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          useDefineForClassFields: true,
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          allowJs: false,
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          module: 'ESNext',
          moduleResolution: 'Bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
        },
        include: ['src'],
      },
      null,
      2,
    ) + '\n',
  );
  await fsp.writeFile(
    path.join(projectDir, 'vite.config.ts'),
    `import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({plugins: [react()]});
`,
  );
  await installDependencies(projectDir);
  await initializeAgentDocs(projectDir);
}

async function prepareReactNoBuild(spec, projectDir) {
  await writeJson(path.join(projectDir, 'package.json'), {
    name: 'astryx-delivery-react-nobuild',
    version: '1.0.0',
    private: true,
    type: 'module',
    devDependencies: {'@astryxdesign/cli': spec.reactVersion},
  });
  await fsp.writeFile(
    path.join(projectDir, 'index.html'),
    reactNoBuildStarter(spec.reactVersion),
  );
  await installDependencies(projectDir);
  await initializeAgentDocs(projectDir);
}

async function prepareVanilla(spec, projectDir) {
  await writeJson(path.join(projectDir, 'package.json'), {
    name: 'astryx-delivery-vanilla',
    version: '1.0.0',
    private: true,
    type: 'module',
    devDependencies: {'@astryxdesign/cli': spec.vanillaTarballUrl},
  });
  await fsp.writeFile(
    path.join(projectDir, 'index.html'),
    vanillaStarter(spec),
  );
  await installDependencies(projectDir);

  const tarballRef = spec.vanillaTarballUrl.match(
    /facebook\/astryx@([^/]+)\/packages\/vanilla/,
  )?.[1];
  const docsRef = tarballRef ?? spec.vanillaCdnRef;
  const docsUrl = `https://raw.githubusercontent.com/facebook/astryx/${docsRef}/packages/vanilla/llms.txt`;
  const docsResponse = await globalThis.fetch(docsUrl);
  if (!docsResponse.ok) {
    throw new Error(
      `Could not load pinned Vanilla Astryx onboarding (${docsResponse.status}): ${docsUrl}`,
    );
  }
  const agentDocs = buildVanillaAgentDocs(await docsResponse.text(), spec);
  await fsp.writeFile(path.join(projectDir, 'AGENTS.md'), agentDocs);
  await fsp.mkdir(path.join(projectDir, '.claude'), {recursive: true});
  await fsp.writeFile(
    path.join(projectDir, '.claude', 'CLAUDE.md'),
    agentDocs.replace('# AGENTS', '# CLAUDE'),
  );
}

export function buildVanillaAgentDocs(publicDocs, spec) {
  const start = publicDocs.indexOf('## Path A — Build-less HTML');
  const end = publicDocs.indexOf('## Path B — React with a dev server');
  if (start < 0 || end <= start) {
    throw new Error(
      'Pinned llms.txt does not contain the expected HTML section',
    );
  }
  let htmlDocs = publicDocs.slice(start, end).trim();
  htmlDocs = htmlDocs
    .replace('## Path A — Build-less HTML', '## Build-less HTML')
    .replace('### A4. Rules for Path A', '### A4. Rules')
    .replace(
      /\n\*\*Fallback — clone the pinned source commit:\*\*[\s\S]*?(?=\n\*\*Option 2)/,
      '',
    )
    .replace(
      '**Option 1 — install the preview CLI (Node 22.13+):**',
      '**Option 1 — use the installed preview CLI (Node 22.13+):**',
    )
    .replace(
      /npm install -g https:\/\/cdn\.jsdelivr\.net\/gh\/facebook\/astryx@[0-9a-f]{40}\/packages\/vanilla\/dist\/cli\/astryx-cli-vanilla\.tgz\n\n/,
      '# The preview CLI is installed locally in this project. Run it with `npx astryx`.\n\n',
    )
    .replaceAll(/^astryx /gm, 'npx astryx ')
    .replaceAll(
      /https:\/\/cdn\.jsdelivr\.net\/gh\/facebook\/astryx@[0-9a-f]{40}\/packages\/vanilla\/dist/g,
      `https://cdn.jsdelivr.net/gh/facebook/astryx@${spec.vanillaCdnRef}/packages/vanilla/dist`,
    );

  return `# AGENTS

# Vanilla Astryx

This project uses the build-less HTML delivery. The local preview CLI and the pinned public assets below are the complete consumer surface; do not clone the Astryx source repository.

${htmlDocs}

## More

- Component docs and CLI reference: https://github.com/facebook/astryx
- Use the installed CLI for authoritative, version-matched answers.
`;
}

async function installDependencies(projectDir) {
  const install = await runCommand(
    'npm',
    ['install', '--no-audit', '--no-fund', '--prefer-offline'],
    {cwd: projectDir, timeoutMs: 5 * 60 * 1000},
  );
  if (install.code !== 0) {
    throw new Error(`npm install failed:\n${install.stderr}`);
  }
}

async function initializeAgentDocs(projectDir) {
  const init = await runCommand(
    'npx',
    ['astryx', 'init', '--features', 'agents', '--agent', 'all'],
    {cwd: projectDir, timeoutMs: 2 * 60 * 1000},
  );
  if (init.code !== 0) {
    throw new Error(`astryx init failed:\n${init.stderr}`);
  }
}

export function reactNoBuildStarter(version) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Astryx React CDN starter</title>
  <link rel="stylesheet" href="https://unpkg.com/@astryxdesign/core@${version}/src/reset.css" />
  <link rel="stylesheet" href="https://unpkg.com/@astryxdesign/core@${version}/dist/astryx.css" />
  <link rel="stylesheet" href="https://unpkg.com/@astryxdesign/theme-neutral@${version}/dist/theme.css" />
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@${DEFAULT_REACT_RUNTIME_VERSION}",
      "react/jsx-runtime": "https://esm.sh/react@${DEFAULT_REACT_RUNTIME_VERSION}/jsx-runtime",
      "react-dom": "https://esm.sh/react-dom@${DEFAULT_REACT_RUNTIME_VERSION}",
      "react-dom/client": "https://esm.sh/react-dom@${DEFAULT_REACT_RUNTIME_VERSION}/client",
      "htm": "https://esm.sh/htm@3.1.1"
    }
  }
  </script>
</head>
<body>
  <div id="root">Loading Astryx…</div>
  <script type="module">
    const React = (await import('react')).default;
    const {createRoot} = await import('react-dom/client');
    const htm = (await import('htm')).default;
    const h = htm.bind(React.createElement);
    const A = await import('https://esm.sh/@astryxdesign/core@${version}?external=react,react-dom');
    const {neutralTheme} = await import('https://esm.sh/@astryxdesign/theme-neutral@${version}/built?external=react,react-dom');

    function App() {
      const [value, setValue] = React.useState('');
      return h\`<\${A.Theme} theme=\${neutralTheme}>
        <main>
          <\${A.VStack} gap=\${4} padding=\${6}>
            <\${A.Banner}
              status="info"
              title="Single React runtime verified"
              description="This icon-bearing starter exercises the theme and component hooks."
            />
            <\${A.Card} padding=\${5}>
              <\${A.Heading} level=\${1}>Astryx CDN starter<//>
              <\${A.Text} type="supporting">React 19, htm, and Astryx ${version} loaded without a build step.<//>
              <\${A.TextInput}
                label="Starter field"
                value=\${value}
                onChange=\${event => setValue(event.target.value)}
              />
            <//>
          <//>
        </main>
      <//>\`;
    }

    createRoot(document.getElementById('root')).render(h\`<\${App} />\`);
  </script>
</body>
</html>
`;
}

export function vanillaStarter(spec) {
  return `<!doctype html>
<html lang="en" data-astryx-theme="neutral" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vanilla Astryx starter</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@astryxdesign/core@0.6.5/src/reset.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/facebook/astryx@${spec.vanillaCdnRef}/packages/vanilla/dist/astryx-vanilla.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@astryxdesign/theme-neutral@0.6.5/dist/theme.css" />
  <script src="https://cdn.jsdelivr.net/gh/facebook/astryx@${spec.vanillaCdnRef}/packages/vanilla/dist/astryx-vanilla.js" defer></script>
</head>
<body>
  <main class="ax-stack ax-stack--gap-4">
    <article class="ax-card">
      <header class="ax-card__header">
        <h1 class="ax-heading ax-heading--1">Vanilla Astryx starter</h1>
      </header>
      <div class="ax-card__body">
        <p class="ax-text ax-text--supporting ax-text--secondary">Replace this starter with the requested UI.</p>
      </div>
    </article>
  </main>
</body>
</html>
`;
}

async function writeJson(filePath, value) {
  await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
