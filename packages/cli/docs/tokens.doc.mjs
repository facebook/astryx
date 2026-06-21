// Copyright (c) Meta Platforms, Inc. and affiliates.

// AUTO-GENERATED — do not edit manually.
// Source: packages/core/src/theme/tokens.stylex.ts
// Run: node scripts/generate-token-docs.mjs
// Total: 184 tokens across 12 categories.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  "name": "tokens",
  "title": "All Tokens",
  "category": "foundations",
  "description": "Complete reference for spacing, color, radius, typography, shadow, motion, and size tokens.",
  "sections": [
    {
      "title": "Color Tokens",
      "content": [
        {
          "type": "prose",
          "text": "Semantic colors for consistent theming. All colors use light-dark() for automatic mode switching."
        },
        {
          "type": "table",
          "headers": [
            "Token",
            "Light",
            "Dark"
          ],
          "rows": [
            [
              "--color-accent",
              "#0064E0",
              "#2694FE"
            ],
            [
              "--color-accent-muted",
              "#0082FB33",
              "#0082FB3F"
            ],
            [
              "--color-on-accent",
              "#FFFFFF",
              "#FFFFFF"
            ],
            [
              "--color-neutral",
              "light-dark(rgba(5, 54, 89, 0.1), rgba(223, 226, 229, 0.2))",
              "light-dark(rgba(5, 54, 89, 0.1), rgba(223, 226, 229, 0.2))"
            ],
            [
              "--color-background-surface",
              "#FFFFFF",
              "#1F1F22"
            ],
            [
              "--color-background-body",
              "#F1F4F7",
              "#111112"
            ],
            [
              "--color-overlay",
              "#01122866",
              "#11111299"
            ],
            [
              "--color-overlay-hover",
              "#0536590C",
              "#FFFFFF0C"
            ],
            [
              "--color-overlay-pressed",
              "#05365919",
              "#FFFFFF19"
            ],
            [
              "--color-background-muted",
              "#0536590C",
              "#1111127F"
            ],
            [
              "--color-text-primary",
              "#0A1317",
              "#DFE2E5"
            ],
            [
              "--color-text-secondary",
              "#4E606F",
              "#AAAFB5"
            ],
            [
              "--color-text-disabled",
              "#A4B0BC",
              "#6F747C"
            ],
            [
              "--color-text-accent",
              "#0064E0",
              "#3E9EFB"
            ],
            [
              "--color-on-dark",
              "#FFFFFF",
              "#FFFFFF"
            ],
            [
              "--color-on-light",
              "#000000",
              "#000000"
            ],
            [
              "--color-icon-accent",
              "#0064E0",
              "#2694FE"
            ],
            [
              "--color-icon-primary",
              "#0A1317",
              "#DFE2E5"
            ],
            [
              "--color-icon-secondary",
              "#4E606F",
              "#AAAFB5"
            ],
            [
              "--color-icon-disabled",
              "#A4B0BC",
              "#6F747C"
            ],
            [
              "--color-background-card",
              "#FFFFFF",
              "#1F1F22"
            ],
            [
              "--color-background-popover",
              "#FFFFFF",
              "#28292C"
            ],
            [
              "--color-background-inverted",
              "#0A1317",
              "#FFFFFF"
            ],
            [
              "--color-background-error-inverted",
              "#AA071E",
              "#E3193B"
            ],
            [
              "--color-success",
              "#0D8626",
              "#0D8626"
            ],
            [
              "--color-success-muted",
              "#0B991F33",
              "#0B991F3F"
            ],
            [
              "--color-on-success",
              "#FFFFFF",
              "#FFFFFF"
            ],
            [
              "--color-error",
              "#E3193B",
              "#F5394F"
            ],
            [
              "--color-error-muted",
              "#E3193B33",
              "#F5394F3F"
            ],
            [
              "--color-on-error",
              "#FFFFFF",
              "#FFFFFF"
            ],
            [
              "--color-warning",
              "#E9AF08",
              "#F2C00B"
            ],
            [
              "--color-warning-muted",
              "#E2A40033",
              "#E2A4003F"
            ],
            [
              "--color-on-warning",
              "#0A1317",
              "#0A1317"
            ],
            [
              "--color-border",
              "#05365919",
              "#F2F4F619"
            ],
            [
              "--color-border-emphasized",
              "#CCD3DB",
              "#494D53"
            ],
            [
              "--color-skeleton",
              "#CCD3DB",
              "#5A5E66"
            ],
            [
              "--color-track",
              "#CCD3DB",
              "#5A5E66"
            ],
            [
              "--color-shadow",
              "light-dark(rgba(5, 54, 89, 0.1), rgba(0, 0, 0, 0.3))",
              "light-dark(rgba(5, 54, 89, 0.1), rgba(0, 0, 0, 0.3))"
            ],
            [
              "--color-tint-hover",
              "black",
              "white"
            ],
            [
              "--color-background-blue",
              "#0171E333",
              "#0171E333"
            ],
            [
              "--color-border-blue",
              "#0064E0",
              "#2694FE"
            ],
            [
              "--color-icon-blue",
              "#0064E0",
              "#2694FE"
            ],
            [
              "--color-text-blue",
              "#042F97",
              "#AFD7FF"
            ],
            [
              "--color-background-cyan",
              "#03A7D733",
              "#03A7D733"
            ],
            [
              "--color-border-cyan",
              "#089DD0",
              "#0171A4"
            ],
            [
              "--color-icon-cyan",
              "#00ACC1",
              "#26C6DA"
            ],
            [
              "--color-text-cyan",
              "#014975",
              "#A1EEF9"
            ],
            [
              "--color-background-gray",
              "#0A131733",
              "#666A724C"
            ],
            [
              "--color-border-gray",
              "#647685",
              "#748695"
            ],
            [
              "--color-icon-gray",
              "#4E606F",
              "#AAAFB5"
            ],
            [
              "--color-text-gray",
              "#0A1317",
              "#E7EAED"
            ],
            [
              "--color-background-green",
              "#24BB5E33",
              "#24BB5E33"
            ],
            [
              "--color-border-green",
              "#0D8626",
              "#0B991F"
            ],
            [
              "--color-icon-green",
              "#0D8626",
              "#26A756"
            ],
            [
              "--color-text-green",
              "#09441F",
              "#A5F690"
            ],
            [
              "--color-background-orange",
              "#F2790233",
              "#F2790233"
            ],
            [
              "--color-border-orange",
              "#EB6E00",
              "#B34A01"
            ],
            [
              "--color-icon-orange",
              "#E9690B",
              "#FB8C00"
            ],
            [
              "--color-text-orange",
              "#6B2203",
              "#FDB876"
            ],
            [
              "--color-background-pink",
              "#E638B333",
              "#E638B333"
            ],
            [
              "--color-border-pink",
              "#F351C0",
              "#C02294"
            ],
            [
              "--color-icon-pink",
              "#C2185B",
              "#EC407A"
            ],
            [
              "--color-text-pink",
              "#650053",
              "#FEADE3"
            ],
            [
              "--color-background-purple",
              "#7952FF33",
              "#7952FF33"
            ],
            [
              "--color-border-purple",
              "#9081FF",
              "#7340FE"
            ],
            [
              "--color-icon-purple",
              "#5B08D8",
              "#7952FF"
            ],
            [
              "--color-text-purple",
              "#3E0697",
              "#B3B0FE"
            ],
            [
              "--color-background-red",
              "#E3193B33",
              "#E3193B33"
            ],
            [
              "--color-border-red",
              "#E3193B",
              "#F5394F"
            ],
            [
              "--color-icon-red",
              "#D31130",
              "#E3193B"
            ],
            [
              "--color-text-red",
              "#7B0210",
              "#FFB2B8"
            ],
            [
              "--color-background-teal",
              "#0DB7AF33",
              "#0DB7AF33"
            ],
            [
              "--color-border-teal",
              "#08A3A3",
              "#08767D"
            ],
            [
              "--color-icon-teal",
              "#009688",
              "#26A69A"
            ],
            [
              "--color-text-teal",
              "#083943",
              "#40DCCD"
            ],
            [
              "--color-background-yellow",
              "#E2A40033",
              "#E2A40033"
            ],
            [
              "--color-border-yellow",
              "#C58600",
              "#B47700"
            ],
            [
              "--color-icon-yellow",
              "#FBC02D",
              "#FFEE58"
            ],
            [
              "--color-text-yellow",
              "#753F07",
              "#FBCE03"
            ]
          ]
        }
      ],
      "previewType": "swatch"
    },
    {
      "title": "Spacing Tokens",
      "content": [
        {
          "type": "prose",
          "text": "Spacing scale used for padding, gap, and margin. Component gap props map spacing steps to these tokens."
        },
        {
          "type": "table",
          "headers": [
            "Token",
            "Value"
          ],
          "rows": [
            [
              "--spacing-0",
              "0px"
            ],
            [
              "--spacing-0-5",
              "2px"
            ],
            [
              "--spacing-1",
              "4px"
            ],
            [
              "--spacing-1-5",
              "6px"
            ],
            [
              "--spacing-2",
              "8px"
            ],
            [
              "--spacing-3",
              "12px"
            ],
            [
              "--spacing-4",
              "16px"
            ],
            [
              "--spacing-5",
              "20px"
            ],
            [
              "--spacing-6",
              "24px"
            ],
            [
              "--spacing-7",
              "28px"
            ],
            [
              "--spacing-8",
              "32px"
            ],
            [
              "--spacing-9",
              "36px"
            ],
            [
              "--spacing-10",
              "40px"
            ],
            [
              "--spacing-11",
              "44px"
            ],
            [
              "--spacing-12",
              "48px"
            ]
          ]
        }
      ],
      "previewType": "spacing-bar"
    },
    {
      "title": "Size Tokens",
      "content": [
        {
          "type": "prose",
          "text": "Control heights for consistent sizing across buttons, inputs, and selectors."
        },
        {
          "type": "table",
          "headers": [
            "Token",
            "Value"
          ],
          "rows": [
            [
              "--size-element-sm",
              "28px"
            ],
            [
              "--size-element-md",
              "32px"
            ],
            [
              "--size-element-lg",
              "36px"
            ]
          ]
        }
      ],
      "previewType": "size-bar"
    },
    {
      "title": "Border Tokens",
      "content": [
        {
          "type": "prose",
          "text": "Border width for card and input borders."
        },
        {
          "type": "table",
          "headers": [
            "Token",
            "Value"
          ],
          "rows": [
            [
              "--border-width",
              "1px"
            ]
          ]
        }
      ],
      "previewType": "border-line"
    },
    {
      "title": "Radius Tokens",
      "content": [
        {
          "type": "prose",
          "text": "Numeric scale based on a 4dp base unit. Tokens scale with the theme's radius multiplier; --radius-none and --radius-full are fixed."
        },
        {
          "type": "table",
          "headers": [
            "Token",
            "Value"
          ],
          "rows": [
            [
              "--radius-none",
              "0px"
            ],
            [
              "--radius-inner",
              "4px"
            ],
            [
              "--radius-element",
              "8px"
            ],
            [
              "--radius-container",
              "12px"
            ],
            [
              "--radius-page",
              "28px"
            ],
            [
              "--radius-chat",
              "28px"
            ],
            [
              "--radius-full",
              "9999px"
            ]
          ]
        }
      ],
      "previewType": "radius-box"
    },
    {
      "title": "Shadow Tokens",
      "content": [
        {
          "type": "prose",
          "text": "Elevation shadows (low to med to high) and inset shadows for input state rings."
        },
        {
          "type": "table",
          "headers": [
            "Token",
            "Value"
          ],
          "rows": [
            [
              "--shadow-low",
              "0px 1px 1px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 2px 8px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))"
            ],
            [
              "--shadow-med",
              "0px 1px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 2px 12px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))"
            ],
            [
              "--shadow-high",
              "0px 2px 2px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), 0px 8px 24px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3))"
            ],
            [
              "--shadow-inset-hover",
              "inset 0px 0px 0px 2px light-dark(rgba(5, 54, 89, 0.15), rgba(223, 226, 229, 0.2))"
            ],
            [
              "--shadow-inset-selected",
              "inset 0px 0px 0px 2px rgba(1, 113, 227, 0.5)"
            ],
            [
              "--shadow-inset-success",
              "inset 0px 0px 0px 2px rgba(38, 167, 86, 0.3)"
            ],
            [
              "--shadow-inset-warning",
              "inset 0px 0px 0px 2px rgba(226, 164, 0, 0.3)"
            ],
            [
              "--shadow-inset-error",
              "inset 0px 0px 0px 2px rgba(227, 25, 59, 0.3)"
            ]
          ]
        }
      ],
      "previewType": "shadow-box"
    },
    {
      "title": "Duration Tokens",
      "content": [
        {
          "type": "prose",
          "text": "Motion duration primitives. Three bands: fast (micro-interactions), medium (entrance/exit), slow (continuous). Min/max variants derive from base × ratio."
        },
        {
          "type": "table",
          "headers": [
            "Token",
            "Value"
          ],
          "rows": [
            [
              "--duration-fast-min",
              "130ms"
            ],
            [
              "--duration-fast",
              "175ms"
            ],
            [
              "--duration-fast-max",
              "230ms"
            ],
            [
              "--duration-medium-min",
              "310ms"
            ],
            [
              "--duration-medium",
              "410ms"
            ],
            [
              "--duration-medium-max",
              "550ms"
            ],
            [
              "--duration-slow-min",
              "730ms"
            ],
            [
              "--duration-slow",
              "975ms"
            ],
            [
              "--duration-slow-max",
              "1300ms"
            ]
          ]
        }
      ],
      "previewType": "duration-bar"
    },
    {
      "title": "Easing Tokens",
      "content": [
        {
          "type": "prose",
          "text": "Easing curves for animations and transitions."
        },
        {
          "type": "table",
          "headers": [
            "Token",
            "Value"
          ],
          "rows": [
            [
              "--ease-standard",
              "cubic-bezier(0.24, 1, 0.4, 1)"
            ]
          ]
        }
      ],
      "previewType": "easing-curve"
    },
    {
      "title": "Font Family Tokens",
      "content": [
        {
          "type": "prose",
          "text": "Font family stacks for body, code, and heading text."
        },
        {
          "type": "table",
          "headers": [
            "Token",
            "Value"
          ],
          "rows": [
            [
              "--font-family-body",
              "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif"
            ],
            [
              "--font-family-code",
              "\"SF Mono\", Monaco, Consolas, monospace"
            ],
            [
              "--font-family-heading",
              "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif"
            ]
          ]
        }
      ],
      "previewType": "font-sample"
    },
    {
      "title": "Font Size Tokens",
      "content": [
        {
          "type": "prose",
          "text": "Geometric type scale: round(14 × 1.2^step). Base is 14px (--font-size-base)."
        },
        {
          "type": "table",
          "headers": [
            "Token",
            "Value"
          ],
          "rows": [
            [
              "--font-size-4xs",
              "0.375rem"
            ],
            [
              "--font-size-3xs",
              "0.4375rem"
            ],
            [
              "--font-size-2xs",
              "0.5rem"
            ],
            [
              "--font-size-xs",
              "0.625rem"
            ],
            [
              "--font-size-sm",
              "0.75rem"
            ],
            [
              "--font-size-base",
              "0.875rem"
            ],
            [
              "--font-size-lg",
              "1.0625rem"
            ],
            [
              "--font-size-xl",
              "1.25rem"
            ],
            [
              "--font-size-2xl",
              "1.5rem"
            ],
            [
              "--font-size-3xl",
              "1.8125rem"
            ],
            [
              "--font-size-4xl",
              "2.1875rem"
            ],
            [
              "--font-size-5xl",
              "2.625rem"
            ]
          ]
        }
      ],
      "previewType": "font-sample"
    },
    {
      "title": "Font Weight Tokens",
      "content": [
        {
          "type": "prose",
          "text": "Font weight values for body, emphasis, and headings."
        },
        {
          "type": "table",
          "headers": [
            "Token",
            "Value"
          ],
          "rows": [
            [
              "--font-weight-normal",
              "400"
            ],
            [
              "--font-weight-medium",
              "500"
            ],
            [
              "--font-weight-semibold",
              "600"
            ],
            [
              "--font-weight-bold",
              "700"
            ]
          ]
        }
      ],
      "previewType": "font-sample"
    },
    {
      "title": "Type Scale Tokens",
      "content": [
        {
          "type": "prose",
          "text": "Semantic tokens for headings, body, labels, code, supporting text, and display text. References font size and weight tokens. Override via typography.scale in defineTheme."
        },
        {
          "type": "table",
          "headers": [
            "Token",
            "Value"
          ],
          "rows": [
            [
              "--text-heading-1-size",
              "var(--font-size-2xl)"
            ],
            [
              "--text-heading-1-weight",
              "var(--font-weight-semibold)"
            ],
            [
              "--text-heading-1-leading",
              "1.3333"
            ],
            [
              "--text-heading-2-size",
              "var(--font-size-xl)"
            ],
            [
              "--text-heading-2-weight",
              "var(--font-weight-semibold)"
            ],
            [
              "--text-heading-2-leading",
              "1.4"
            ],
            [
              "--text-heading-3-size",
              "var(--font-size-lg)"
            ],
            [
              "--text-heading-3-weight",
              "var(--font-weight-semibold)"
            ],
            [
              "--text-heading-3-leading",
              "1.4118"
            ],
            [
              "--text-heading-4-size",
              "var(--font-size-base)"
            ],
            [
              "--text-heading-4-weight",
              "var(--font-weight-semibold)"
            ],
            [
              "--text-heading-4-leading",
              "1.4286"
            ],
            [
              "--text-heading-5-size",
              "var(--font-size-sm)"
            ],
            [
              "--text-heading-5-weight",
              "var(--font-weight-semibold)"
            ],
            [
              "--text-heading-5-leading",
              "1.6667"
            ],
            [
              "--text-heading-6-size",
              "var(--font-size-xs)"
            ],
            [
              "--text-heading-6-weight",
              "var(--font-weight-semibold)"
            ],
            [
              "--text-heading-6-leading",
              "1.6"
            ],
            [
              "--text-body-size",
              "var(--font-size-base)"
            ],
            [
              "--text-body-weight",
              "var(--font-weight-normal)"
            ],
            [
              "--text-body-leading",
              "1.4286"
            ],
            [
              "--text-large-size",
              "var(--font-size-lg)"
            ],
            [
              "--text-large-weight",
              "var(--font-weight-semibold)"
            ],
            [
              "--text-large-leading",
              "1.4118"
            ],
            [
              "--text-label-size",
              "var(--font-size-base)"
            ],
            [
              "--text-label-weight",
              "var(--font-weight-medium)"
            ],
            [
              "--text-label-leading",
              "1.4286"
            ],
            [
              "--text-code-size",
              "var(--font-size-base)"
            ],
            [
              "--text-code-weight",
              "var(--font-weight-normal)"
            ],
            [
              "--text-code-leading",
              "1.4286"
            ],
            [
              "--text-supporting-size",
              "var(--font-size-sm)"
            ],
            [
              "--text-supporting-weight",
              "var(--font-weight-normal)"
            ],
            [
              "--text-supporting-leading",
              "1.6667"
            ],
            [
              "--text-display-1-size",
              "var(--font-size-5xl)"
            ],
            [
              "--text-display-1-weight",
              "var(--font-weight-normal)"
            ],
            [
              "--text-display-1-leading",
              "1.2381"
            ],
            [
              "--text-display-2-size",
              "var(--font-size-4xl)"
            ],
            [
              "--text-display-2-weight",
              "var(--font-weight-normal)"
            ],
            [
              "--text-display-2-leading",
              "1.2571"
            ],
            [
              "--text-display-3-size",
              "var(--font-size-3xl)"
            ],
            [
              "--text-display-3-weight",
              "var(--font-weight-normal)"
            ],
            [
              "--text-display-3-leading",
              "1.2414"
            ]
          ]
        }
      ],
      "previewType": "font-sample"
    },
    {
      "title": "Usage in StyleX",
      "content": [
        {
          "type": "code",
          "lang": "tsx",
          "label": "Using token imports",
          "code": "import * as stylex from '@stylexjs/stylex';\nimport {colorVars, spacingVars, sizeVars, radiusVars} from '@xds/core';\n\nconst styles = stylex.create({\n  card: {\n    padding: spacingVars['--spacing-4'],\n    backgroundColor: colorVars['--color-background-surface'],\n    borderRadius: radiusVars['--radius-container'],\n  },\n  button: {\n    height: sizeVars['--size-element-md'],\n  },\n});"
        },
        {
          "type": "prose",
          "text": "See `npx astryx docs styling` for how to apply tokens via xstyle, className, and compound component patterns. See `npx astryx docs theme` for overriding tokens with defineTheme."
        }
      ]
    }
  ]
};
