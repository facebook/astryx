// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/install-once`: install the CLI once for the
 * computer and run it in any folder; which release answers each folder, and
 * what the CLI keeps in the per-user cache, and the agent text for the whole
 * computer (spec AST-081).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'install-once',
  placement: {parent: 'namespace:cli', slot: 'guides', order: 3},
  title: 'Install once, run anywhere',
  category: 'guide',
  keywords: [
    'global',
    'npm i -g',
    'install globally',
    'which version',
    'release',
    'answeredBy',
    'ERR_VERSIONS_UNAVAILABLE',
    'cache',
    'offline',
    'update',
    'init --user',
    'SKILL.md',
    'skills',
  ],
  description:
    'Install the CLI once for your computer and run it in any folder: each project is answered by the release that matches its Core, and folders outside a project by the newest release.',
  sections: [
    {
      id: 'install',
      title: 'Install it once',
      content: [
        {
          type: 'prose',
          text: 'Install the CLI package for your computer with your package manager. That one `astryx` command then works in every folder, inside projects and outside them.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npm i -g @astryxdesign/cli\n# or: pnpm add -g @astryxdesign/cli · yarn global add @astryxdesign/cli · bun add -g @astryxdesign/cli',
        },
        {
          type: 'prose',
          text: "A project can still install the CLI as a dev dependency, and a package runner (`npx @astryxdesign/cli`) still works. Inside a project, every copy follows the rules below, so the project's release answers whichever one you start. Outside a project, the copy you installed for your computer answers with the newest release it keeps, while a package runner's copy, or a version you type such as `npx @astryxdesign/cli@0.7.0`, answers as exactly that release.",
        },
      ],
    },
    {
      id: 'in-a-project',
      title: "In a project, the project's Core decides",
      content: [
        {
          type: 'prose',
          text: "Templates, docs, and agent text come from a CLI release, and components from a Core release. When the two differ, an agent gets code the project's Core may reject, with no error to say so. So in a project, the release equal to the project's Core answers every command:",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'The project installs the CLI at the same version as its Core: that CLI answers. Any other copy hands the run to it.',
            "The project's CLI is another version, or the project installs only Core: the CLI release equal to the Core answers. The CLI installs it once into your per-user cache and reuses it.",
            'Nothing is installed yet, as in a fresh clone: the release comes from the Core version the lockfile records, else the newest release the declared Core range allows.',
            '`astryx upgrade` follows the same rule, so it runs the codemods of the release equal to the Core you installed.',
          ],
        },
        {
          type: 'prose',
          text: "A copy hands a run over before it reads anything of the project, with the same arguments, folder, input, and output, and ends with that release's exit status. A version you type, such as `npx @astryxdesign/cli@0.7.0`, does not change the release that answers inside a project.",
        },
        {
          type: 'prose',
          text: "A project is found from the folder you run in: the Core or the CLI installed there or a few folders above it, else the nearest `package.json` that declares either one, up to the repository root. A folder inside another project, such as a nested app or a cloned repository, answers with that project's release.",
        },
      ],
    },
    {
      id: 'outside-a-project',
      title: 'Outside a project, the newest release answers',
      content: [
        {
          type: 'prose',
          text: 'In a folder that belongs to no project, the CLI answers as a new project on its release would, so an agent with no project files can still read every component and doc. Commands that read Core use the Core of the answering release, installed into the per-user cache the first time one needs it. `doctor`, `swizzle`, and `upgrade` judge or change a project and never use it.',
        },
        {
          type: 'prose',
          text: "The CLI you installed for your computer stays on the newest release. At most once an hour, never in the first hour after you install it, a run starts a background check of the registry's `latest` release, installs a newer one into the cache, and verifies that it starts. The next run outside a project uses it and says so once. A failed check changes nothing, and the release it switched from stays in the cache. Projects are never updated: `astryx doctor` reports a newer release instead.",
        },
        {
          type: 'code',
          lang: 'text',
          code: 'astryx: now using 0.7.3 (was 0.7.2). What changed: https://github.com/facebook/astryx/releases/tag/v0.7.3',
        },
      ],
    },
    {
      id: 'agent-text',
      title: 'Agent text for the whole computer',
      content: [
        {
          type: 'prose',
          text: "A project's agent docs reach only agents working in that project. To tell agents anywhere on your computer how to use Astryx, write the computer-level agent text:",
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx init --user',
        },
        {
          type: 'prose',
          text: "It writes one skill file to the two folders coding agents read skills from, `~/.agents/skills/astryx/SKILL.md` and `~/.claude/skills/astryx/SKILL.md`, and nothing else. It works in any folder: inside a project it is never handed to the project's own CLI, because it writes to your computer, not the project. The text is the same guide `init` writes into a project, without a version, and it tells agents to follow a project's own agent docs inside that project, because those match the project's release. Its commands start with `astryx`, so install the CLI for your computer first; when no `astryx` command runs the Astryx CLI, `init --user` still writes the text and warns.",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Run it again after a new release to refresh the text. Outside a project, `astryx doctor` says whether the text is there and matches the release that answered.',
            'A file at either path that Astryx did not write, or a symlink, is left as it is.',
            '`astryx init --user --remove-agents` removes both files.',
            'Nothing else writes these files: not installing the CLI, not `init` in a project, not `upgrade`.',
          ],
        },
      ],
    },
    {
      id: 'who-answered',
      title: 'See which release answered',
      content: [
        {
          type: 'prose',
          text: "In text mode, a run prints one line on standard error when a copy hands it to the project's own CLI, when the release matching the project's Core answers, or outside a project. A run you start in the project's own CLI, which answers it directly, prints none, except `astryx init --user`, which always answers for your computer and says so:",
        },
        {
          type: 'code',
          lang: 'text',
          code: "astryx: answered by this project's CLI 0.6.8, handed over from CLI 0.7.2\nastryx: answered by CLI 0.6.8 with Core 0.6.8, the release that matches this project's Core\nastryx: answered by CLI 0.7.2 with Core 0.7.2, outside a project\nastryx: answered by CLI 0.7.2 with Core 0.7.2, for this computer",
        },
        {
          type: 'prose',
          text: 'With `--json` nothing extra is printed. Every successful result carries `meta.answeredBy`: `cli` (the version that answered), `core` (the Core it paired with, or `null`), and `copy` (`project`, `matched`, or `carried`).',
        },
        {
          type: 'code',
          lang: 'json',
          code: '{"meta": {"answeredBy": {"cli": "0.6.8", "core": "0.6.8", "copy": "matched"}}}',
        },
        {
          type: 'prose',
          text: "Commands the CLI prints for you to run start with a name that reaches the same release: the project's runner (`npx astryx`) when its own CLI answered, `astryx` outside a project when the CLI installed for your computer answered, and otherwise the CLI package pinned to the release, such as `npx @astryxdesign/cli@0.6.8`.",
        },
      ],
    },
    {
      id: 'cache-and-offline',
      title: 'The cache, and working offline',
      content: [
        {
          type: 'prose',
          text: "Releases live in your platform's per-user cache directory, under `astryx/releases/<version>`: `~/.cache/astryx` on Linux (or `$XDG_CACHE_HOME/astryx`), `~/Library/Caches/astryx` on macOS, and `%LOCALAPPDATA%\\astryx\\Cache` on Windows. The CLI installs them with npm, so your npm registry, proxy, and offline settings apply. Deleting the folder is safe; releases come back when a run needs them.",
        },
        {
          type: 'prose',
          text: "When the release a run needs is not in the cache and cannot be installed, the run fails before writing anything, with `ERR_VERSIONS_UNAVAILABLE` and the release it needs. Installing the project's dependencies, or running again when the registry can be reached, fixes it. No other release answers in its place.",
        },
        {
          type: 'prose',
          text: 'The first run that needs a release prints one line while it installs (`astryx: installing CLI release 0.6.8 into the per-user cache (once)...`), and a run that finds another run installing it waits and says so. A slow download is waited for, up to 15 minutes. A run stopped mid-install leaves nothing behind that blocks the next one, and a cached release whose files were damaged is installed again the next time a run needs it.',
        },
        {
          type: 'prose',
          text: "In a Yarn Plug'n'Play project, the CLI cannot see the project's own CLI without running the project's loader, so the release equal to the project's Core answers from the cache. That is the same release whenever the project's CLI matches its Core.",
        },
        {
          type: 'code',
          lang: 'text',
          code: "Error: This project needs CLI release 0.6.8, which is not available: the registry could not be reached. Install the project's dependencies, or run again when the package registry can be reached.",
        },
      ],
    },
  ],
};
