// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/components/describe-the-component/check-the-props`:
 * compare each component doc's props table with the component's TypeScript
 * props, read each finding, and fix the doc or the code.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'check-the-props',
  placement: {
    parent: 'namespace:describe-the-component',
    slot: 'guides',
    order: 50,
  },
  title: 'Check the props table',
  category: 'guide',
  keywords: [
    'props table',
    'documented props',
    'prop drift',
    'props not compared',
  ],
  description:
    "Compare each props table with the component's TypeScript props, then fix the doc or the code.",
  sections: [
    {
      id: 'run-the-props-check',
      title: 'Run the props check',
      content: [
        {
          type: 'prose',
          text: "`doctor integration components` compares every props table in your component docs with the props the component's TypeScript declares. Run it in your package after you change a component or its doc.",
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx doctor integration components',
        },
        {
          type: 'code',
          lang: 'text',
          code: `severity:  [warn]
component: AcmeCarousel
prop:      loop
kind:      not_in_code
message:   "loop" is documented, but AcmeCarousel's props have no "loop".
doc:       components/AcmeCarousel.doc.mjs
source:    components/AcmeCarousel.tsx
docType:   boolean

3 documented prop(s) differ from the code in 1 of 1 component(s) compared (TypeScript 6.0.3). These are warnings: update the doc, or the code if the doc is right.`,
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "A doc's own `props` describe the export its `name` names. In a family doc, each entry describes its own export. A hook entry documents parameters and returns, so it is not compared.",
            "It reads props with the `typescript` your package installs, and reads your package's `tsconfig.json` the way `tsc -p` does. Without TypeScript it prints `[skip] Props not compared` and the reason.",
            'Every finding is a warning, so the exit code stays 0. Read them before you publish. With `--json`, they are in `data.propDrift.findings`.',
          ],
        },
      ],
    },
    {
      id: 'fix-each-finding',
      title: 'Fix each finding',
      content: [
        {
          type: 'prose',
          text: "Each finding's `kind` says what differs. Fix the doc, or the code if the doc is right.",
        },
        {
          type: 'table',
          headers: ['Kind', 'Means', 'Fix'],
          rows: [
            [
              '`not_in_code`',
              "The doc lists a prop the component's props do not have",
              'Remove it from the doc, or add it to the code. A name an index signature takes, such as `data-*`, counts as present',
            ],
            [
              '`not_in_doc`',
              'Your package declares a prop the doc does not list',
              'Document it. Props from React, the DOM, or another package are never asked for, and neither are `className`, `style`, `xstyle`, `data-testid`, `ref`, `key`, or a prop whose JSDoc has `@deprecated` or `@internal`',
            ],
            [
              '`required_mismatch`',
              '`required` disagrees with the code',
              'Set `required: true` exactly when every caller must pass the prop. A prop required in only some members of a union, or one that `defaultProps` fills, is not compared',
            ],
          ],
        },
      ],
    },
    {
      id: 'when-a-component-is-not-compared',
      title: 'When a component is not compared',
      content: [
        {
          type: 'prose',
          text: "When the check cannot read a component's props exactly, it lists the component under `[info] Props not compared`, with the reason, instead of reporting findings that might be wrong.",
        },
        {
          type: 'code',
          lang: 'text',
          code: `[info] Props not compared for 1 documented component(s):

component: AcmeCarousel
doc:       components/AcmeCarousel.doc.mjs
reason:    AcmeCarousel depends on \`@acme/motion\` (imported in AcmeCarousel.tsx), which the compiler could not resolve, usually a dependency that is not installed. Install the package's dependencies and run this check again`,
        },
        {
          type: 'table',
          headers: ['Reason', 'Fix'],
          rows: [
            [
              'It depends on a package or file the compiler could not resolve',
              "Install the package's dependencies, then run the check again",
            ],
            [
              "It depends on a type the compiler can't work out",
              'Make the types compile with `npx tsc --noEmit`, then run the check again',
            ],
            [
              "The package's TypeScript config has an error",
              'Fix `tsconfig.json` until `npx tsc -p .` reads it',
            ],
            ['Its props are typed `any`', 'Give the component a props type'],
            [
              'Some prop names come from a type parameter',
              'Nothing to fix: a component that renders an element the caller picks takes props known only where it is used',
            ],
            [
              "The file has no export named by the doc's `name`",
              'Change `name` or the export so they agree',
            ],
          ],
        },
      ],
    },
  ],
};
