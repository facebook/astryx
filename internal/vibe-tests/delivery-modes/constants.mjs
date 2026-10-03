// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createHash} from 'node:crypto';

export const DEFAULT_REACT_VERSION = '0.6.5';
export const DEFAULT_REACT_RUNTIME_VERSION = '19.2.7';
export const DEFAULT_VANILLA_CDN_REF =
  'c11b28d74ce387f44ab224e516058cd31231285d';
export const DEFAULT_VANILLA_TARBALL_URL =
  'https://cdn.jsdelivr.net/gh/facebook/astryx@894a494af1323add3d837c7a7c9e308943231d5a/packages/vanilla/dist/cli/astryx-cli-vanilla.tgz';

export const CONFIG_NAMES = ['react-build', 'react-nobuild', 'vanilla'];
export const AGENT_NAMES = ['claude', 'muse'];

export function getDeliverySpecs(options = {}) {
  const reactVersion = options.reactVersion ?? DEFAULT_REACT_VERSION;
  const vanillaCdnRef = options.vanillaCdnRef ?? DEFAULT_VANILLA_CDN_REF;
  const vanillaTarballUrl =
    options.vanillaTarballUrl ?? DEFAULT_VANILLA_TARBALL_URL;

  return {
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
    vanilla: {
      name: 'vanilla',
      outputFile: 'index.html',
      description:
        'a build-less static HTML project with the Vanilla Astryx preview CLI and its agent documentation installed from a pinned public tarball',
      vanillaCdnRef,
      vanillaTarballUrl,
    },
  };
}

export function buildTaskPrompt(prompt, spec, projectDir = '<project-dir>') {
  return `You are implementing a UI in an isolated consumer project.

Delivery environment:
${spec.description}

Project directory:
${projectDir}

First inspect the project and use only the documentation and tools installed there. Do not read files outside this project.

Task:
${prompt.prompt}

Output:
Implement the complete runnable solution in ${spec.outputFile}. Preserve the project's delivery mechanism. Work directly in the project files; do not merely describe the solution. Ensure the result can be opened or built using the scripts and dependencies already provided.`;
}

export function selectPrompts(testSet, {sample, promptIds} = {}) {
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
  if (!sample || sample >= prompts.length) {
    return prompts;
  }

  const selected = [];
  const seenCategories = new Set();
  for (const prompt of prompts) {
    if (!seenCategories.has(prompt.category)) {
      selected.push(prompt);
      seenCategories.add(prompt.category);
      if (selected.length === sample) {
        return selected;
      }
    }
  }
  for (const prompt of prompts) {
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
