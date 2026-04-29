/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'cli-reference',
  title: 'CLI Reference',
  description:
    'Complete command reference for the XDS CLI — every command, flag, and argument.',

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'The XDS CLI (`npx xds` or `npx @xds/cli`) provides tools for scaffolding, theming, component discovery, documentation, upgrades, and gap reporting. All commands support `--help` for inline usage.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Quick start',
          code: `npx xds --help`,
        },
      ],
    },
    {
      title: 'Global Options',
      content: [
        {
          type: 'prose',
          text: 'These flags apply to any command that outputs documentation or reference content.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`--zh` — Output docs in Chinese Simplified',
            '`--dense` — Output docs in compressed dense format (token-efficient)',
            '`--lang <locale>` — Output docs in specified language/format (en, zh, dense)',
            '`--detail <level>` — Output detail level: full, compact, or brief (default: full)',
            '`--json` — Output as typed JSON envelope: `{ type, data }`',
          ],
        },
      ],
    },
    {
      title: 'init',
      content: [
        {
          type: 'prose',
          text: 'Initialize XDS in your project. Installs packages, sets up theming, and optionally adds AI agent docs for Claude, Cursor, or Codex.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Usage',
          code: `npx xds init`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`--features <list>` — Comma-separated features to install (agents, theme, template)',
            '`--all` — Install all features, no prompts',
            '`--agent <tool>` — Target AI tool for agent docs: claude, cursor, codex, all',
            '`--agent-docs-path <path...>` — Explicit file path(s) for agent docs',
            '`--remove-agents` — Remove AI agent docs from all agent doc files',
          ],
        },
      ],
    },
    {
      title: 'component',
      content: [
        {
          type: 'prose',
          text: 'List components or print detailed component documentation including props, usage examples, and source code.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Usage',
          code: `npx xds component [name]
npx xds component --list
npx xds component Button --props`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`[name]` — Component name to look up',
            '`--list` — List all components grouped by category',
            '`--category <category>` — List components in a specific category',
            '`--props` — Print only the props table',
            '`--source` — Print component source code',
            '`--showcase` — Print showcase source code',
          ],
        },
      ],
    },
    {
      title: 'docs',
      content: [
        {
          type: 'prose',
          text: 'Print XDS reference documentation. Topics include tokens, theme, color, typography, spacing, shape, elevation, motion, styling, and principles.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Usage',
          code: `npx xds docs [topic] [section]
npx xds docs tokens
npx xds docs theme "Defining a Theme"`,
        },
      ],
    },
    {
      title: 'template',
      content: [
        {
          type: 'prose',
          text: 'Inject a page or block template into your project. Templates provide pre-built layouts and patterns.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Usage',
          code: `npx xds template [name] [path]
npx xds template --list
npx xds template dashboard ./src/app/dashboard`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`[name]` — Template name',
            '`[path]` — Output path',
            '`--list` — List available templates',
            '`--type <type>` — Filter by template type: page or block',
            '`--skeleton` — Show layout skeleton with spatial annotations (padding, gap, nesting)',
          ],
        },
        {
          type: 'prose',
          text: 'Subcommand: `template get --id <id>` — Fetch a template by ID via the xds.config.mjs hook.',
        },
      ],
    },
    {
      title: 'swizzle',
      content: [
        {
          type: 'prose',
          text: 'Copy component source into your project for deep customization. Optionally file a gap report explaining why the default component did not meet your needs.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Usage',
          code: `npx xds swizzle [component]
npx xds swizzle Button --output ./components/xds`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`[component]` — Component to swizzle',
            '`--output <dir>` — Output directory (default: `./components/xds`)',
            '`--list` — List available components',
            '`--gap <reason>` — File a gap report explaining why you swizzled',
            '`--gap-category <category>` — Gap category (for --gap mode)',
            '`--no-report` — Suppress the interactive gap report prompt',
          ],
        },
      ],
    },
    {
      title: 'upgrade',
      content: [
        {
          type: 'prose',
          text: 'Run codemods to migrate between XDS versions. By default runs in dry-run mode — pass `--apply` to write changes to disk.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Usage',
          code: `npx xds upgrade --to 0.0.12
npx xds upgrade --apply --to 0.0.12
npx xds upgrade --list`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`--apply` — Write changes to disk (default: dry-run)',
            '`--from <version>` — Previous version (overrides package.json detection)',
            '`--to <version>` — Target version',
            '`--force` — Run codemods even if versions appear up to date',
            '`--codemod <name>` — Run a specific transform only',
            '`--codemod-only` — Skip version bump and install, run codemods only',
            '`--skip-install` — Skip package manager install after bumping deps',
            '`--force-install` — Pass --force to package manager install',
            '`--path <dir>` — Source directory to scan (default: `./src`)',
            '`--install-deps` — Auto-install jscodeshift without prompting',
            '`--list` — List available codemods',
          ],
        },
      ],
    },
    {
      title: 'theme build',
      content: [
        {
          type: 'prose',
          text: 'Compile a defineTheme file to CSS and JS output. Takes a theme definition and produces production-ready theme assets.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Usage',
          code: `npx xds theme build <file> --out theme.css`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`<file>` — Path to the defineTheme file (required)',
            '`-o, --out <path>` — Output CSS file path',
            '`--no-prose` — Skip prose mappings (h1, p, code, hr, etc.)',
          ],
        },
      ],
    },
    {
      title: 'discover',
      content: [
        {
          type: 'prose',
          text: 'Discover external XDS packages and components from the ecosystem.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Usage',
          code: `npx xds discover [query]
npx xds discover --components`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`[query]` — Search query',
            '`--components` — List components only',
          ],
        },
      ],
    },
    {
      title: 'gap-report',
      content: [
        {
          type: 'prose',
          text: 'Report a gap in the XDS design system — when a component does not meet your needs and you need to customize or work around it.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Usage',
          code: `npx xds gap-report --component Button --category "missing-variant" --reason "Need a destructive variant"
npx xds gap-report --list-categories`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`--component <name>` — Component name',
            '`--category <category>` — Gap category',
            '`--reason <reason>` — What capability was missing',
            '`--list-categories` — List valid gap categories',
          ],
        },
        {
          type: 'prose',
          text: 'Subcommand: `gap-report setup` — Configure where gap reports are sent.',
        },
      ],
    },
    {
      title: 'Configuration',
      content: [
        {
          type: 'prose',
          text: 'The CLI reads from an optional `xds.config.mjs` file in your project root. This file can customize template discovery, gap report destinations, and other CLI behaviors.',
        },
        {
          type: 'code',
          lang: 'js',
          label: 'xds.config.mjs',
          code: `export default {
  // Custom template provider
  templates: {
    get: async (id) => fetchTemplateFromAPI(id),
  },
  // Gap report webhook
  gapReport: {
    url: 'https://your-api.com/gaps',
  },
};`,
        },
      ],
    },
    {
      title: 'Programmatic API',
      content: [
        {
          type: 'prose',
          text: 'The CLI is also available as a programmatic API via `@xds/cli/api`. This lets you embed CLI capabilities into build scripts, AI agents, or custom tooling.',
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'Programmatic usage',
          code: `import { getComponent, listComponents, getDocs } from '@xds/cli/api';

const button = await getComponent('Button');
const allComponents = await listComponents();
const tokens = await getDocs('tokens');`,
        },
      ],
    },
  ],
};
