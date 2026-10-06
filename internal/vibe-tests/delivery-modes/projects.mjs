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
  } else if (spec.name === 'static-html') {
    await prepareStaticHtml(spec, projectDir);
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
    path.join(projectDir, 'src', 'vite-env.d.ts'),
    '/// <reference types="vite/client" />\n',
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
    `${JSON.stringify(
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
    )}\n`,
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

async function prepareStaticHtml(spec, projectDir) {
  const config = spec.staticConfig;
  validateStaticConfig(config);
  await fsp.writeFile(
    path.join(projectDir, 'index.html'),
    staticHtmlStarter(config),
  );
  if (config.cliTarballUrl) {
    await writeJson(path.join(projectDir, 'package.json'), {
      name: 'astryx-delivery-static-html',
      version: '1.0.0',
      private: true,
      type: 'module',
      devDependencies: {'@astryxdesign/cli': config.cliTarballUrl},
    });
    await installDependencies(projectDir);
    await initializeAgentDocs(projectDir);
  } else {
    await fsp.writeFile(
      path.join(projectDir, 'AGENTS.md'),
      staticAgentDocs(config),
    );
  }
  if (config.agentDocsUrl) {
    const response = await globalThis.fetch(config.agentDocsUrl);
    if (!response.ok) {
      throw new Error(
        `Could not load configured agent documentation (${response.status}).`,
      );
    }
    await fsp.appendFile(
      path.join(projectDir, 'AGENTS.md'),
      `\n\n${await response.text()}\n`,
    );
  }
}

export function validateStaticConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('static-html requires a JSON configuration object.');
  }
  for (const key of ['stylesheets', 'scripts']) {
    if (
      config[key] != null &&
      (!Array.isArray(config[key]) ||
        !config[key].every(value => typeof value === 'string'))
    ) {
      throw new Error(`static-html ${key} must be an array of URLs.`);
    }
  }
  if (config.htmlAttributes != null) {
    if (
      typeof config.htmlAttributes !== 'object' ||
      Array.isArray(config.htmlAttributes) ||
      !Object.values(config.htmlAttributes).every(
        value => typeof value === 'string',
      )
    ) {
      throw new Error('static-html htmlAttributes must map names to strings.');
    }
  }
  for (const key of ['cliTarballUrl', 'agentDocsUrl', 'starterBody']) {
    if (config[key] != null && typeof config[key] !== 'string') {
      throw new Error(`static-html ${key} must be a string.`);
    }
  }
}

export function staticHtmlStarter(config) {
  validateStaticConfig(config);
  const attributes = Object.entries(config.htmlAttributes ?? {})
    .map(([key, value]) => ` ${escapeHtml(key)}="${escapeHtml(String(value))}"`)
    .join('');
  const stylesheets = (config.stylesheets ?? [])
    .map(url => `  <link rel="stylesheet" href="${escapeHtml(url)}" />`)
    .join('\n');
  const scripts = (config.scripts ?? [])
    .map(url => `  <script src="${escapeHtml(url)}" defer></script>`)
    .join('\n');
  const body =
    config.starterBody ??
    '  <main><h1>Static HTML starter</h1><p>Replace this starter with the requested UI.</p></main>';
  return `<!doctype html>
<html lang="en"${attributes}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Static HTML delivery test</title>
${stylesheets}
${scripts}
</head>
<body>
${body}
</body>
</html>
`;
}

function staticAgentDocs(config) {
  const assets = [...(config.stylesheets ?? []), ...(config.scripts ?? [])];
  return `# Static HTML delivery

This project uses a build-less static HTML delivery. Work only in this project and preserve the configured delivery mechanism.

Configured public assets:
${assets.length > 0 ? assets.map(url => `- ${url}`).join('\n') : '- None'}

Implement the requested interface in \`index.html\` using the APIs exposed by those assets.
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
                onChange=\${setValue}
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

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

async function writeJson(filePath, value) {
  await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
