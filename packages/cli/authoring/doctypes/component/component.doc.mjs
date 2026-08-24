// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for the `ComponentDoc` doc-type — how to author a component
 * directory's `{Name}.doc.mjs`. A discriminated union (Single/Multi/Sub) that
 * shares ComponentBaseDoc. Colocated with the type it describes (`type.ts`).
 * @position packages/cli/authoring/doctypes/component — doc-type documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'component-doc',
  displayName: 'ComponentDoc',
  namespace: 'authoring',
  description:
    "The doc-type for a component directory's {Name}.doc.mjs. A discriminated union of " +
    'SingleComponentDoc (props on the doc), MultiComponentDoc (a `components` array), and ' +
    'SubComponentDoc (a `subComponentOf` pointer). All three share the ComponentBaseDoc ' +
    'fields below; the variant is chosen by which of props / components / subComponentOf you set.',
  appliesTo: '{Name}.doc.mjs',
  fields: [
    {
      name: 'type',
      type: "'component'",
      description:
        'Doc-kind discriminant for the stamped default-export format. Optional: legacy `export const docs = {...}` docs omit it and the parser falls back to shape-sniffing.',
    },
    {
      name: 'name',
      type: 'string',
      description:
        "Directory name without the Astryx prefix, PascalCase. e.g. 'Button', 'TextInput', 'AppShell'.",
      required: true,
    },
    {
      name: 'displayName',
      type: 'string',
      description:
        "Human-readable display name with spaces between words ('AppShell' → 'App Shell'). Drives the docsite gallery and sidebar label.",
      required: true,
    },
    {
      name: 'keywords',
      type: 'string[]',
      description:
        'Search keywords for CLI discovery: synonyms and related UI concepts from other design systems (MUI, Chakra, Radix, shadcn). Lowercase. Used by `astryx component <term>` fuzzy matching.',
    },
    {
      name: 'hiddenComponents',
      type: 'string[]',
      description:
        'Sub-component names to hide from human-facing UI (CLI listings, docs catalogs). They stay public and importable; agents and tooling can still discover them via source.',
    },
    {
      name: 'hidden',
      type: 'boolean',
      description:
        'Hide this entire component from human-facing UI. It stays public and importable. Use for shared primitives (NavIcon, NavMenu) that only make sense inside their parent.',
    },
    {
      name: 'group',
      type: 'string',
      description:
        'Optional sidebar/docs group. Clusters related components; ungrouped components appear flat in alphabetical order.',
    },
    {
      name: 'category',
      type: "'Action' | 'Chat' | 'Container' | 'Content' | 'Data Input' | 'Data Visualization' | 'Feedback & Status' | 'Layout' | 'Navigation' | 'Overlay' | 'Table & List' | 'Utility'",
      description:
        "Overview-gallery category representing the component's functional role. Independent of `group` (which is for the sidebar).",
    },
    {
      name: 'isHiddenFromOverview',
      type: 'boolean',
      description:
        'Exclude from the categorized overview page while keeping the component in the sidebar and CLI. Use for sub-components or internal primitives.',
    },
    {
      name: 'theming',
      type: '{ container?: boolean; targets: ComponentThemingTarget[]; vars?: ComponentThemingVar[]; derived?: ComponentThemingDerivedVar[] }',
      description:
        'Theming configuration: the stable selector surface (xds-* classes + data-attribute reflections) that themes target via @scope selectors in defineTheme.',
      fields: [
        {
          name: 'theming.container',
          type: 'boolean',
          description:
            'When true, container `padding` props are mapped to container tokens by the theme pipeline instead of emitting raw CSS.',
        },
        {
          name: 'theming.targets',
          type: 'ComponentThemingTarget[]',
          description:
            'Selector targets rendered by this component. Each entry corresponds to a themeProps() call in the source.',
          required: true,
        },
        {
          name: 'theming.vars',
          type: 'ComponentThemingVar[]',
          description: 'CSS custom properties exposed for theming.',
        },
        {
          name: 'theming.derived',
          type: 'ComponentThemingDerivedVar[]',
          description:
            'Maps standard CSS properties to internal vars for theme-pipeline expansion. Ordered by priority: earlier entries emit first.',
        },
      ],
    },
    {
      name: 'usage',
      type: 'UsageDoc',
      description:
        'Component usage documentation: concise summary, best practices, and optional visual anatomy. (Optional on SubComponentDoc, where the sub-component description is used instead.)',
      required: true,
      fields: [
        {
          name: 'usage.description',
          type: 'string',
          description:
            'What the component is and when to use it, in 2-3 short sentences.',
          required: true,
        },
        {
          name: 'usage.bestPractices',
          type: 'ComponentBestPractice[]',
          description:
            "3-4 do/don't design-guidance items ({guidance: boolean, description: string}). Never start the description with 'Do' or 'Don't'.",
        },
        {
          name: 'usage.anatomy',
          type: 'ComponentAnatomyElement[]',
          description:
            'Structural/visual parts in reading order ({name, required, description}).',
        },
      ],
    },
    {
      name: 'examples',
      type: 'ComponentExampleDoc[]',
      description:
        'Short code examples ({label?, code}) rendered by the CLI after the props table.',
    },
    {
      name: 'playground',
      type: 'ComponentPlaygroundConfig',
      description:
        'Interactive-preview config: initial prop `defaults`, `overlay` for modal-only components, `appShellMobile` for components gated on AppShell mobile context, and a `wrapper` for context-dependent sub-components.',
    },
    {
      name: 'props',
      type: 'ComponentPropDoc[]',
      description:
        'SingleComponentDoc variant (required there): all public props for the one primary component. Each prop is {name, type, description, default?, required?, slotElements?}. Skip styling props like xstyle/className/style. Also present on SubComponentDoc.',
    },
    {
      name: 'components',
      type: '(ComponentEntry | ComponentRef)[]',
      description:
        'MultiComponentDoc variant (required there): one entry per public component/hook exported from the directory. Each entry is a full ComponentEntry (inline: name, displayName, description, props | params+returns) or a name-only ComponentRef pointing at a sibling {Name}.doc.mjs.',
    },
    {
      name: 'subComponentOf',
      type: 'string',
      description:
        "SubComponentDoc variant (required there): the parent component's `name` (e.g. 'Chat'). Marks this file as a sub-component doc that inherits family fields (group, category, keywords, theming, playground) from the parent.",
    },
    {
      name: 'description',
      type: 'string',
      description:
        "SubComponentDoc variant (required there): one-sentence description of the sub-component's role within the parent composition. Single/Multi docs have no top-level description; they derive their summary from `usage`.",
    },
  ],
  examples: [
    {
      label: 'SingleComponentDoc (props on the doc)',
      code: `/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'Switch',
  displayName: 'Switch',
  category: 'Data Input',
  keywords: ['toggle', 'switch', 'on off'],
  usage: {
    description:
      'A Switch toggles a single setting on or off. Use it for instant, binary preferences that apply immediately without a submit step.',
    bestPractices: [
      {guidance: true, description: 'Apply the change immediately when toggled.'},
      {guidance: false, description: 'Use a Switch for actions that need confirmation; prefer a Checkbox in a form.'},
    ],
  },
  props: [
    {name: 'isSelected', type: 'boolean', description: 'Whether the switch is on.', required: true},
    {name: 'onChange', type: '(isSelected: boolean) => void', description: 'Called when the user toggles the switch.'},
    {name: 'isDisabled', type: 'boolean', description: 'Prevents interaction and dims the control.', default: 'false'},
  ],
};`,
    },
    {
      label: 'MultiComponentDoc (a components array)',
      code: `/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'Table',
  displayName: 'Table',
  category: 'Table & List',
  usage: {description: 'Displays rows and columns of data. Compose the sub-components to build headers, rows, and cells.'},
  components: [
    {name: 'Table', displayName: 'Table', description: 'The table container.', props: []},
    {name: 'TableRow', displayName: 'Table Row', description: 'A row within the table body.', props: [
      {name: 'isSelected', type: 'boolean', description: 'Highlights the row as selected.'},
    ]},
    {name: 'useTableSelection', displayName: 'useTableSelection', description: 'Manages row selection state.',
      params: [{name: 'rows', type: 'T[]', description: 'The rows to track.', required: true}],
      returns: [{name: 'selectedIds', type: 'Set<string>', description: 'Currently selected row ids.'}]},
  ],
};`,
    },
  ],
  notes: [
    {
      type: 'prose',
      text: 'ComponentDoc is a discriminated union of three shapes that all extend ComponentBaseDoc. Pick the variant by which key you set: `props` (single), `components` (multi), or `subComponentOf` (sub).',
    },
    {
      type: 'list',
      style: 'unordered',
      items: [
        'SingleComponentDoc: one primary component; put props directly on the doc via `props`. Use for Switch, Badge, Spinner, TextInput.',
        'MultiComponentDoc: a directory exporting several components/hooks; list them in `components` (inline ComponentEntry or name-only ComponentRef). Use for Table, Dialog, TabList.',
        'SubComponentDoc: a single sub-component in its own {Name}.doc.mjs inside the parent directory; set `subComponentOf` to the parent name. It inherits family fields and may omit `usage`.',
      ],
    },
    {
      type: 'code',
      lang: 'js',
      label: 'SubComponentDoc',
      code: `/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'ChatComposer',
  displayName: 'Chat Composer',
  subComponentOf: 'Chat',
  description: 'The message input row within a Chat, with an editor and send affordance.',
  props: [
    {name: 'onSend', type: '(text: string) => void', description: 'Called when the user submits a message.', required: true},
  ],
};`,
    },
    {
      type: 'prose',
      text: "The stamped format is `export default { type: 'component', ... }`; legacy docs use `export const docs = {...}` and omit `type` (the parser shape-sniffs). A hook that is part of a component API is documented as a ComponentEntry in a MultiComponentDoc `components` array (with `params`/`returns`), not as a standalone HookDoc.",
    },
  ],
};
