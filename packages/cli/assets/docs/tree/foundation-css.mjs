// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Canonical foundation CSS shared by the setup and Tailwind guides.
 * @input Published Core, Neutral theme and optional Tailwind v4 stylesheets.
 * @output One layer order and the two consumer import recipes.
 * @position Shipped doc payload; browser integration tests build these recipes.
 */

export const foundationLayers =
  '@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;';

export const foundationCoreCSS = `@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";`;

export const foundationCSS = `${foundationCoreCSS}
@import "@astryxdesign/theme-neutral/theme.css";
@import "@astryxdesign/theme-neutral/fonts.css";`;

export const foundationTailwindCSS = `@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
${foundationCSS}
@import "@astryxdesign/core/tailwind-theme.css";
@import "tailwindcss/utilities.css" layer(utilities);`;
