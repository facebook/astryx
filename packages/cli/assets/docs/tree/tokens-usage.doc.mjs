// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Run: node scripts/generate-token-docs.mjs

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  "type": "generic",
  "name": "tokens-usage",
  "title": "Usage in StyleX",
  "placement": {
    "parent": "namespace:tokens",
    "slot": "guides",
    "order": 160
  },
  "category": "foundations",
  "description": "How to import and use token variables in StyleX styles.",
  "keywords": [
    "StyleX",
    "import",
    "colorVars",
    "spacingVars",
    "sizeVars"
  ],
  "sections": [
    {
      "title": "Usage in StyleX",
      "content": [
        {
          "type": "code",
          "lang": "tsx",
          "label": "Using token imports",
          "code": "import * as stylex from '@stylexjs/stylex';\nimport {colorVars, spacingVars, sizeVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';\nimport {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';\n\nconst styles = stylex.create({\n  card: {\n    padding: spacingVars['--spacing-4'],\n    backgroundColor: colorVars['--color-background-surface'],\n    borderRadius: radiusVars['--radius-container'],\n  },\n  series: {\n    color: dataVars['--color-data-categorical-blue'],\n  },\n  button: {\n    height: sizeVars['--size-element-md'],\n  },\n});"
        },
        {
          "type": "prose",
          "text": "See {@link namespace:styling} for how to apply tokens via xstyle, className, and compound component patterns. See {@link generic:author-a-theme} for overriding tokens with defineTheme."
        }
      ]
    }
  ]
};
