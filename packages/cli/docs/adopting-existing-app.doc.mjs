// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'adopting-existing-app',
  title: 'Adopting Astryx in an existing Next.js + Tailwind app',
  category: 'guide',
  description:
    'Integration guide for adding Astryx to an existing Next.js + Tailwind project: the cascade-layer trap, moduleResolution, StyleX build, and custom variants.',

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'Adding Astryx to a fresh app is smooth. Adding it to an *existing* Next.js + Tailwind project hits a few integration-boundary traps that fail silently — no errors, just styles that appear ignored. This guide collects them so you do not have to rediscover them. Each is individually small; together they are most of the first-time friction.',
        },
        {
          type: 'prose',
          text: 'The theming model itself (defineTheme + `astryx theme build`, or the `<Theme>` runtime) needs no special build setup. The friction is almost entirely at the integration boundary: CSS cascade layers, TypeScript module resolution, and — only if you swizzle — the StyleX build.',
        },
      ],
    },
    {
      title: 'Trap 1: Tailwind preflight silently defeats theme overrides',
      content: [
        {
          type: 'prose',
          text: 'This is the highest-impact trap and it produces ZERO errors — the theme just appears ignored (buttons transparent, `h1` rendering at ~16px, etc.). Astryx emits component theme overrides in the `astryx-theme` cascade layer. Tailwind\u2019s preflight (`@tailwind base`) is emitted UNLAYERED. Per the CSS cascade, unlayered rules beat any `@layer` rule regardless of specificity — so every Astryx theme override loses to preflight, silently.',
        },
        {
          type: 'prose',
          text: 'The fix is to put Tailwind\u2019s layers into named cascade layers and declare the full layer order up front, so Astryx\u2019s layers resolve in the right place. Unlayered consumer CSS still wins over everything, so your existing app is unaffected.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css — Tailwind v4',
          code: `/* Declare the full layer order up front (lowest -> highest priority). */
@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";
@import "@astryxdesign/core/tailwind-theme.css";
@import "tailwindcss/utilities.css" layer(utilities);`,
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css — Tailwind v3 (the key line: layer the preflight)',
          code: `/* Tailwind v3 emits @tailwind base UNLAYERED by default, which beats every
 * @layer rule. Wrap it in a named layer so astryx-theme can win. */
@layer tw-preflight {
  @tailwind base;
}
@tailwind components;
@tailwind utilities;

@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";`,
        },
        {
          type: 'prose',
          text: 'See the working reference app `apps/example-nextjs-tailwind` in the repo for a complete Tailwind v4 layer setup.',
        },
      ],
    },
    {
      title: 'Trap 2: moduleResolution must be "bundler" (or node16+)',
      content: [
        {
          type: 'prose',
          text: 'Astryx ships subpath exports (`@astryxdesign/core/Button`, `/theme`, `/Link`, ...). With the very common `"moduleResolution": "node"` in tsconfig, these subpaths do not resolve and imports fail to type-check. Switch to `"bundler"` (or `"node16"`/`"nodenext"`).',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'tsconfig.json',
          code: `{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}`,
        },
        {
          type: 'prose',
          text: 'Heads up: this is a project-wide change. Switching resolution can surface latent issues in unrelated dependencies (e.g. a package whose `exports` map does not append extensions may now need explicit `.js` in its imports). Expect to fix a few unrelated imports when you flip it, rather than being surprised later.',
        },
      ],
    },
    {
      title: 'Trap 3: swizzled components need a StyleX compiler',
      content: [
        {
          type: 'prose',
          text: 'Consuming the published Astryx package needs no StyleX setup — components ship pre-compiled. But `astryx swizzle <Component>` copies raw StyleX source into your app, which requires a build-time StyleX compiler or it renders unstyled with no error. On Next.js App Router specifically, the StyleX Babel plugin disables SWC and breaks `next/font`, so an SWC-based transform is required.',
        },
        {
          type: 'prose',
          text: 'Full setup (per-bundler, plus the Next.js/SWC path) is in `npx astryx docs styling` under "StyleX Build Setup". The working reference is `apps/example-nextjs-stylex` in the repo.',
        },
      ],
    },
    {
      title: 'Trap 4: custom variants are type-safe (via defineTheme + theme build)',
      content: [
        {
          type: 'prose',
          text: 'You can add a custom component variant in your theme (e.g. `components.button["variant:accentOutline"]`) without swizzling. `astryx theme build` emits both the CSS and a `<name>.variants.d.ts` type augmentation so `variant="accentOutline"` type-checks. The generated theme `.d.ts` references the augmentation file, so importing your built theme loads it automatically.',
        },
        {
          type: 'code',
          lang: 'ts',
          label: 'theme.ts',
          code: `import { defineTheme } from "@astryxdesign/core/theme";

export const myTheme = defineTheme({
  name: "mytheme",
  components: {
    button: {
      "variant:accentOutline": {
        backgroundColor: "transparent",
        color: "var(--color-accent)",
        borderColor: "var(--color-accent)",
      },
    },
  },
});`,
        },
        {
          type: 'prose',
          text: 'Note: only props backed by an extensible interface (like Button `variant`) are augmentable. Closed sizes/types (Button `size`, Heading `type`) are not theme-extensible — use a swizzle for those. See `npx astryx docs theme`.',
        },
      ],
    },
    {
      title: 'Discoverability: start with the CLI',
      content: [
        {
          type: 'prose',
          text: 'Most "how do I theme X?" time is spent not knowing the answer already exists in the CLI. Before assuming a limitation, check:',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`astryx component <Name>` — themeable slots, override keys, and CSS vars for a component.',
            '`astryx docs tokens` — the full design-token namespace.',
            '`astryx docs styling` — every styling approach + the StyleX build setup.',
            '`astryx docs theme` — how to override tokens and add custom variants via defineTheme.',
          ],
        },
      ],
    },
    {
      title: 'Net',
      content: [
        {
          type: 'prose',
          text: 'The theming model is a pleasure once it works — the friction is at the integration boundary. Layer your Tailwind preflight (Trap 1), set `moduleResolution` (Trap 2), and only worry about StyleX if you swizzle (Trap 3). After that, drive the whole surface from a theme.',
        },
      ],
    },
  ],
};
