// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'component-selection',
  title: 'Component Selection',
  category: 'guide',
  description:
    'How to choose the right component \u2014 and when and how to build a custom one.',

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'When building a UI, the hardest decision is rarely how to wire a component up \u2014 it is which component to reach for in the first place. Reaching too low (raw markup, hand-rolled CSS) discards the system\u2019s consistency, accessibility, and theming; reaching too high (forcing an ill-fitting semantic component) bends a component past what it was designed to express. This guide gives a single, ordered ladder so the choice is mechanical, not a judgment call every time.',
        },
        {
          type: 'prose',
          text: 'The rule of thumb: always pick the highest match on the ladder below. Only drop to the next rung when nothing above it fits. Custom work is legitimate \u2014 but it has a designated home and a designated way to be built, so it stays consistent with the rest of the system.',
        },
      ],
    },
    {
      title: 'Selection Order',
      content: [
        {
          type: 'prose',
          text: 'Evaluate these in order. Stop at the first rung that satisfies the need:',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Your app\u2019s own components \u2014 reuse what the project has already built. If a component for this purpose exists in ./components, use it before anything else. This keeps one source of truth per pattern.',
            'Astryx semantic components and patterns \u2014 intent-named, higher-level building blocks that already encode a complete interaction (e.g. chat, dialog). When one matches the meaning of what you are building, prefer it over assembling the same thing from primitives.',
            'Astryx primitive and compositional components \u2014 the lower-level toolkit (e.g. Button, Card, Stack). Compose these directly when no single semantic component covers the case.',
            'A custom composition in ./components, built from Astryx compositional primitives \u2014 when no existing Astryx component fits, assemble one from primitives rather than inlining the assembly into a page. Give it a name and a home so it can be reused.',
            'A custom component in ./components, built from token primitives \u2014 the last resort, only when nothing above can express it. Compose from the lowest-level building blocks and style exclusively with design tokens, never raw values. Before writing it, read a similar Astryx component to borrow its hooks and patterns.',
          ],
        },
      ],
    },
    {
      title: 'Where Custom Components Live',
      content: [
        {
          type: 'prose',
          text: 'Every custom component \u2014 whether a composition of Astryx primitives or a token-built original \u2014 belongs in a dedicated ./components directory in your project. Never inline a one-off component into a page or block.',
        },
        {
          type: 'prose',
          text: 'A predictable location is what makes rung 1 of the ladder work: the next time you (or an AI assistant) build something similar, the existing component is easy to discover and reuse, instead of being reinvented inline. A one-off buried in a page is invisible to the next person and silently duplicates effort.',
        },
        {
          type: 'list',
          style: 'do',
          items: [
            'Put each custom component in its own file under ./components.',
            'Name it for what it represents, so it reads like a first-class part of your UI vocabulary.',
            'Reuse it from rung 1 next time rather than rebuilding it.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Inline a custom component directly inside a page or route.',
            'Scatter the same pattern across multiple files instead of extracting it once.',
          ],
        },
      ],
    },
    {
      title: 'Building a Custom Component',
      content: [
        {
          type: 'prose',
          text: 'When you do reach the bottom of the ladder, build down \u2014 not from scratch. Compose from the highest-level Astryx building blocks the case allows, and only style with design tokens.',
        },
        {
          type: 'list',
          items: [
            'Compose from Astryx primitives wherever possible \u2014 prefer assembling existing components over writing new markup.',
            'Style with design tokens only \u2014 use token variables for color, spacing, and radius. Never hardcode raw hex or pixel values.',
            'Borrow patterns from similar Astryx components \u2014 if a component with comparable behavior already exists, read its source to find the hooks, state handling, and accessibility patterns worth reusing.',
          ],
        },
        {
          type: 'prose',
          text: 'Use the CLI to find and study those references before writing anything:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `# Find a component with behavior close to what you need
npx astryx search "<what it does>"

# Read its props, examples, and the hooks it uses
npx astryx component <Name>

# See the full source to borrow patterns directly
npx astryx swizzle <Name>

# Look up the token to use instead of a raw value
npx astryx docs tokens`,
        },
      ],
    },
  ],
};
