/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'working-with-ai',
  title: 'Working with AI',
  category: 'guide',
  description:
    'How to use AI coding tools effectively with XDS — prompting strategies, the CLI as context source, and patterns that help models generate correct component code.',

  sections: [
    {
      title: 'Why This Matters',
      content: [
        {
          type: 'prose',
          text: 'XDS is designed to be AI-friendly. Components follow consistent naming conventions, props use predictable patterns (is/has prefixes for booleans, on-prefixed callbacks), and the CLI can feed structured documentation directly into an AI context window. But models still need the right context to generate correct XDS code — without it, they fall back to generic React patterns or guess at prop names.',
        },
        {
          type: 'prose',
          text: 'This guide covers how to get the best results from AI tools (Claude, Cursor, Copilot, ChatGPT, etc.) when building with XDS.',
        },
      ],
    },
    {
      title: 'The CLI Is Your Context Source',
      content: [
        {
          type: 'prose',
          text: 'The XDS CLI is the single source of truth for component APIs. Before writing any component code — or asking an AI to write it — query the CLI to get the real props, types, and defaults.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Look up a component before coding',
          code: `# Full component docs (props, theming, usage)
npx xds component Button

# Props table only
npx xds component Button --props

# Compressed format (fewer tokens for AI context)
npx xds component Button --dense

# JSON output (for programmatic use)
npx xds component Button --json`,
        },
        {
          type: 'prose',
          text: 'The --dense flag outputs a token-efficient format that fits more information into a smaller context window. Use it when feeding component docs into an AI prompt.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Reference docs for AI context',
          code: `# Styling guide
npx xds docs styling --dense

# Design tokens reference
npx xds docs tokens --dense

# All available topics
npx xds docs`,
        },
      ],
    },
    {
      title: 'Prompting Strategies',
      content: [
        {
          type: 'prose',
          text: 'The most common AI failure mode with XDS is inventing props that don\u2019t exist. The fix is simple: give the model real documentation before asking it to write code.',
        },
        {
          type: 'list',
          style: 'do',
          items: [
            'Paste the output of `npx xds component <Name> --props` into your prompt before asking for code.',
            'Include the styling guide (`npx xds docs styling --dense`) when asking for layout or theming work.',
            'Ask the model to use XDS components by name — specificity reduces hallucination.',
            'Provide a working example from your codebase as a reference pattern.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Ask for "a button component" without specifying XDS — the model will reach for native HTML or another library.',
            'Assume the model knows XDS prop names. Even if it gets close, `disabled` vs `isDisabled` matters.',
            'Let the model invent wrapper components when XDS already has the right primitive.',
          ],
        },
      ],
    },
    {
      title: 'Setting Up Your AI',
      content: [
        {
          type: 'prose',
          text: 'Most AI tools let you provide persistent project context — a system prompt, rules file, or context document that gets included in every conversation. Setting this up once is the highest-leverage thing you can do for XDS code quality.',
        },
        {
          type: 'prose',
          text: 'Generate a context document tuned for your project:',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Generate AI context',
          code: `# Print the XDS principles + styling guide in dense format
npx xds docs principles --dense
npx xds docs styling --dense

# List all available components (so the model knows what exists)
npx xds component --dense`,
        },
        {
          type: 'prose',
          text: 'Paste that output into your tool\'s context file. Where it goes depends on your tool:',
        },
        {
          type: 'table',
          headers: ['Tool', 'Where to put it'],
          rows: [
            ['Cursor', '.cursorrules or .cursor/rules in your project root'],
            ['Claude Code', 'CLAUDE.md in your project root'],
            ['GitHub Copilot', '.github/copilot-instructions.md'],
            ['ChatGPT / Claude web', 'Custom instructions or project knowledge'],
            ['Windsurf', '.windsurfrules in your project root'],
          ],
        },
        {
          type: 'prose',
          text: 'The key insight: the --dense flag on any CLI command outputs a compressed format designed for AI context windows. It strips verbose descriptions and examples, keeping only what a model needs to generate correct code. Use it for anything going into a rules file.',
        },
      ],
    },
    {
      title: 'Component Discovery',
      content: [
        {
          type: 'prose',
          text: 'When you\u2019re not sure which XDS component to use, the CLI helps with discovery. This is useful both for you and for AI tools that can execute commands.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Find the right component',
          code: `# List all components
npx xds component

# Search by keyword (finds related components)
npx xds component modal
npx xds component dropdown
npx xds component table

# Discover hooks
npx xds hook

# Search for hooks
npx xds hook focus`,
        },
        {
          type: 'prose',
          text: 'Component search matches against names, keywords, and descriptions. If you search for "modal", it finds Dialog. If you search for "dropdown", it finds Selector and Popover.',
        },
      ],
    },
    {
      title: 'Block Templates as Examples',
      content: [
        {
          type: 'prose',
          text: 'XDS ships real-world code examples as block templates. These are complete, working UI patterns that demonstrate correct component composition. They\u2019re the best reference material for AI — concrete code beats abstract documentation.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Browse and use templates',
          code: `# List all templates
npx xds template

# Inject a template into your project
npx xds template dashboard ./src/pages/
npx xds template settings-sidebar ./src/pages/

# View template source (great for AI context)
npx xds template login-card --print`,
        },
        {
          type: 'prose',
          text: 'When asking an AI to build a complex page, paste a relevant template as a reference pattern. The model will pick up the composition style, import paths, and prop usage from the example.',
        },
      ],
    },
    {
      title: 'Import Paths',
      content: [
        {
          type: 'prose',
          text: 'AI models frequently get import paths wrong. XDS uses per-category subpath imports for tree-shaking. Here\u2019s the pattern:',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Correct import paths',
          code: `// Components — from their directory name
import {XDSButton} from '@xds/core/Button';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSCard} from '@xds/core/Card';
import {XDSStack, XDSGrid} from '@xds/core/Layout';

// Hooks — from their component or from /hooks
import {useXDSToast} from '@xds/core/Toast';
import {useMediaQuery} from '@xds/core/hooks';

// Theme
import {XDSTheme} from '@xds/core';
import {defineTheme} from '@xds/core/theme';

// Token imports for typed StyleX usage
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';`,
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            "Import from '@xds/core' for individual components — use the subpath.",
            "Import from '@xds/core/components/Button' — there's no components/ prefix.",
            "Use named imports that don't start with XDS — all components are XDS-prefixed.",
          ],
        },
      ],
    },
    {
      title: 'Common AI Mistakes',
      content: [
        {
          type: 'prose',
          text: 'These are the patterns AI models most frequently get wrong with XDS, and how to correct them.',
        },
        {
          type: 'table',
          headers: ['AI generates', 'Correct XDS', 'Why'],
          rows: [
            ['disabled={true}', 'isDisabled', 'XDS uses is/has prefixed booleans'],
            ['variant="outlined"', 'variant="secondary"', 'XDS variants: primary, secondary, ghost, destructive'],
            ['<Button>Click</Button>', '<XDSButton label="Click" />', 'label prop, not children (unless you need custom content)'],
            ['onChange={(e) => ...}', 'onChange={(value) => ...}', 'XDS inputs pass the value directly, not the event'],
            ['<input type="text" />', '<XDSTextInput />', 'Always use the XDS component when one exists'],
            ['#0064E0', 'var(--color-accent)', 'Use semantic tokens, never hardcoded colors'],
            ['gap: 16', "gap: 'var(--spacing-4)'", 'Use spacing tokens via CSS custom properties'],
          ],
        },
      ],
    },
    {
      title: 'AI Agent Integration',
      content: [
        {
          type: 'prose',
          text: 'If you\u2019re building an AI agent or coding assistant that generates XDS code, the CLI provides machine-readable output for integration.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Machine-readable output',
          code: `# JSON output for all commands
npx xds component Button --json
npx xds docs tokens --json
npx xds template --json

# Dense format minimizes token usage
npx xds component --dense
npx xds docs styling --dense`,
        },
        {
          type: 'prose',
          text: 'The JSON output returns typed envelopes with structured data — prop definitions, token values, template metadata. The dense format strips examples and verbose descriptions, keeping only what a model needs to generate correct code.',
        },
        {
          type: 'prose',
          text: 'For agents with tool-calling capabilities, the CLI commands can be called directly as tools. An agent that runs `npx xds component <Name> --props --dense` before generating code will produce significantly better results than one working from memory alone.',
        },
      ],
    },
    {
      title: 'Cursor / IDE Integration',
      content: [
        {
          type: 'prose',
          text: 'For IDE-integrated AI tools like Cursor, Copilot, or Cody, add XDS context to your project rules or context files.',
        },
        {
          type: 'code',
          lang: 'text',
          label: '.cursorrules or project context file',
          code: `This project uses the XDS design system (@xds/core).

Key rules:
- Import components from '@xds/core/<ComponentName>' (e.g. '@xds/core/Button')
- All components are prefixed with XDS (XDSButton, XDSCard, XDSTextInput)
- Boolean props use is/has prefix (isDisabled, isLoading, hasHover)
- Form inputs are controlled (value + onChange, where onChange passes the value directly)
- Use semantic tokens for colors (var(--color-accent)) and spacing (var(--spacing-4))
- Use xstyle prop with stylex.create() for component style overrides
- Use Tailwind utilities on className for layout and wrapper styling

Run \`npx xds component <Name> --props\` to look up any component API.
Run \`npx xds docs styling\` for the complete styling guide.`,
        },
      ],
    },
  ],
};
