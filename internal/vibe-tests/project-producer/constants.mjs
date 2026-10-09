// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createHash} from 'node:crypto';

export const DEFAULT_REACT_VERSION = '0.6.6';
export const DEFAULT_REACT_RUNTIME_VERSION = '19.2.7';
export const DEFAULT_CONFIG_NAMES = ['react-build', 'react-nobuild'];
export const CONFIG_NAMES = [...DEFAULT_CONFIG_NAMES, 'static-html'];

export function getDeliverySpecs(options = {}) {
  const reactVersion = options.reactVersion ?? DEFAULT_REACT_VERSION;
  const specs = {
    'react-build': {
      name: 'react-build',
      outputFile: 'src/App.tsx',
      description: `a Vite + React 19 project with @astryxdesign/core, a theme, and @astryxdesign/cli ${reactVersion} installed from npm; the project includes Astryx-generated agent documentation`,
      reactVersion,
    },
    'react-nobuild': {
      name: 'react-nobuild',
      outputFile: 'index.html',
      description: `a single-page, no-build React 19 + htm project that loads @astryxdesign/core and its theme at ${reactVersion} from public CDNs; the published Astryx CLI provides agent documentation`,
      reactVersion,
    },
  };
  if (options.staticConfig) {
    specs['static-html'] = {
      name: 'static-html',
      outputFile: 'index.html',
      description:
        options.staticConfig.description ??
        'a build-less static HTML project using the configured public assets',
      staticConfig: options.staticConfig,
    };
  }
  return specs;
}

export function buildTaskPrompt(
  prompt,
  spec,
  projectDir = '<project-dir>',
  {
    timeoutMinutes = 15,
    browserCommand = 'screenshot <file-or-url> [output.png]',
  } = {},
) {
  return `You are implementing a UI in an isolated consumer project.

Delivery environment:
${spec.description}

Project directory:
${projectDir}

Time and browser:
You have up to ${timeoutMinutes} minutes. A headless browser helper is available as \`${browserCommand}\`.

First inspect the project and use only the documentation and tools installed there. Do not read files outside this project.

Task:
${prompt.prompt}

Output:
Implement the complete runnable solution in ${spec.outputFile}. Preserve the project's delivery mechanism. Work directly in the project files; do not merely describe the solution. Ensure the result can be opened or built using the scripts and dependencies already provided.`;
}

export function selectPrompts(testSet, {sample, promptIds, seed} = {}) {
  const prompts = testSet.prompts ?? [];
  if (promptIds?.length) {
    const byId = new Map(prompts.map(prompt => [prompt.id, prompt]));
    return promptIds.map(id => {
      const prompt = byId.get(id);
      if (!prompt) {
        throw new Error(`Unknown prompt id: ${id}`);
      }
      return prompt;
    });
  }
  const orderedPrompts =
    seed == null
      ? prompts
      : [...prompts].sort((left, right) =>
          stableId(String(seed), left.category, left.id).localeCompare(
            stableId(String(seed), right.category, right.id),
          ),
        );
  if (!sample || sample >= orderedPrompts.length) {
    return orderedPrompts;
  }

  const selected = [];
  const seenCategories = new Set();
  for (const prompt of orderedPrompts) {
    if (!seenCategories.has(prompt.category)) {
      selected.push(prompt);
      seenCategories.add(prompt.category);
      if (selected.length === sample) {
        return selected;
      }
    }
  }
  for (const prompt of orderedPrompts) {
    if (!selected.includes(prompt)) {
      selected.push(prompt);
      if (selected.length === sample) {
        break;
      }
    }
  }
  return selected;
}

export function stableId(...parts) {
  return createHash('sha256')
    .update(parts.join('\0'))
    .digest('hex')
    .slice(0, 12);
}
