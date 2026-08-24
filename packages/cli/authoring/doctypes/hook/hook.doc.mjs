// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for the `HookDoc` doc-type — how to author a standalone
 * React hook's `.doc.mjs`. Colocated with the type it describes (`type.ts`).
 * @position packages/cli/authoring/doctypes/hook — doc-type documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'hook-doc',
  displayName: 'HookDoc',
  namespace: 'authoring',
  description:
    'The doc-type for a standalone React hook (e.g. useMediaQuery, useFocusTrap, ' +
    'useOverflow) that gets its own `.doc.mjs`. Hooks that are part of a component API ' +
    "(e.g. useImperativeDialog) belong in that component's MultiComponentDoc `components` " +
    "array instead. `HookDoc` is the hook-flavored view of the shared `type: 'function'` kind.",
  appliesTo: '{useX}.doc.mjs',
  fields: [
    {
      name: 'type',
      type: "'function'",
      description:
        'Doc-kind discriminant (shared with FunctionDoc). Legacy `export const docs = {...}` docs omit it.',
    },
    {
      name: 'name',
      type: 'string',
      description:
        "Hook name exactly as exported, e.g. 'useMediaQuery', 'useFocusTrap'.",
      required: true,
    },
    {
      name: 'displayName',
      type: 'string',
      description:
        "Human-readable display name. Hooks read better as the raw identifier ('useMediaQuery') than spaced, so keep the identifier verbatim.",
      required: true,
    },
    {
      name: 'group',
      type: 'string',
      description:
        'Optional group for sidebar/docs organization; same as ComponentDoc.group.',
    },
    {
      name: 'keywords',
      type: 'string[]',
      description: 'Search keywords for CLI discovery.',
    },
    {
      name: 'params',
      type: 'HookParamDoc[]',
      description: 'Hook parameters or options-object fields.',
      required: true,
      fields: [
        {
          name: 'params[].name',
          type: 'string',
          description: 'Parameter or option field name.',
          required: true,
        },
        {
          name: 'params[].type',
          type: 'string',
          description: 'TypeScript type signature as a string.',
          required: true,
        },
        {
          name: 'params[].description',
          type: 'string',
          description: 'What this parameter does. 1-2 sentences.',
          required: true,
        },
        {
          name: 'params[].default',
          type: 'string',
          description: 'Default value as a string, if optional with a default.',
        },
        {
          name: 'params[].required',
          type: 'boolean',
          description: 'True if required. Omit if optional.',
        },
      ],
    },
    {
      name: 'returns',
      type: 'HookReturnDoc[]',
      description:
        'Return value documentation. For object returns, list each field; for primitive returns, use a single entry.',
      required: true,
      fields: [
        {
          name: 'returns[].name',
          type: 'string',
          description:
            "Field name on the returned object, or 'value' for primitive returns.",
          required: true,
        },
        {
          name: 'returns[].type',
          type: 'string',
          description: 'TypeScript type.',
          required: true,
        },
        {
          name: 'returns[].description',
          type: 'string',
          description: 'What this return value provides.',
          required: true,
        },
      ],
    },
    {
      name: 'usage',
      type: 'UsageDoc',
      description: 'Usage documentation: description and best practices.',
      required: true,
      fields: [
        {
          name: 'usage.description',
          type: 'string',
          description:
            'What the hook is and when to use it, in 2-3 short sentences.',
          required: true,
        },
        {
          name: 'usage.bestPractices',
          type: 'ComponentBestPractice[]',
          description:
            "3-4 do/don't design-guidance items ({guidance: boolean, description: string}).",
        },
        {
          name: 'usage.anatomy',
          type: 'ComponentAnatomyElement[]',
          description:
            'Structural/visual anatomy elements (rarely used for hooks).',
        },
      ],
    },
    {
      name: 'relatedComponents',
      type: 'string[]',
      description:
        'Component names this hook is commonly used with. Enables cross-referencing (e.g. `astryx hook useToast` links back to Toast).',
    },
    {
      name: 'relatedHooks',
      type: 'string[]',
      description: 'Other hook names this hook is commonly used with.',
    },
    {
      name: 'importPath',
      type: 'string',
      description:
        "Import path, e.g. '@astryxdesign/core/hooks' or '@astryxdesign/core/Toast'.",
    },
    {
      name: 'category',
      type: 'string',
      description: 'Category for grouping in listings.',
    },
  ],
  examples: [
    {
      label: 'A standalone hook doc',
      code: `/** @type {import('@astryxdesign/cli/authoring').HookDoc} */
export const docs = {
  type: 'function',
  name: 'useMediaQuery',
  displayName: 'useMediaQuery',
  importPath: '@astryxdesign/core/hooks',
  params: [
    {name: 'query', type: 'string', description: 'A CSS media query, e.g. "(min-width: 768px)".', required: true},
  ],
  returns: [
    {name: 'matches', type: 'boolean', description: 'Whether the query currently matches.'},
  ],
  usage: {
    description:
      'Subscribes to a CSS media query and re-renders when it changes. Use for responsive behavior that CSS alone cannot express, such as swapping components by breakpoint.',
  },
  relatedHooks: ['useIsMobile'],
};`,
    },
  ],
  notes: [
    {
      type: 'prose',
      text: "A hook's discriminant is `type: 'function'`: HookDoc and FunctionDoc share the generalized function kind. HookDoc is the hook-flavored view: named `returns` fields and a required `usage` block.",
    },
    {
      type: 'prose',
      text: "Only standalone hooks get their own file. A hook that is part of a component API is documented as an entry in that component's MultiComponentDoc `components` array (with `params`/`returns`), so it renders under the component.",
    },
  ],
};
