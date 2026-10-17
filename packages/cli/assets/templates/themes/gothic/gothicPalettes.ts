// Copyright (c) Meta Platforms, Inc. and affiliates.

import {palette} from './gothicPalettes.generated';

const metadata = {
  neutral: {hue: 210, chroma: 4},
  blue: {hue: 255, chroma: 20},
  cyan: {hue: 200, chroma: 25},
  green: {hue: 140, chroma: 18},
  orange: {hue: 40, chroma: 35},
  pink: {hue: 345, chroma: 22},
  purple: {hue: 290, chroma: 30},
  red: {hue: 15, chroma: 12},
  teal: {hue: 170, chroma: 20},
  yellow: {hue: 80, chroma: 40},
} as const;

function family<
  Name extends keyof typeof metadata,
  Ramp extends Readonly<Record<number, string>>,
>(name: Name, ramp: Ramp) {
  return {...metadata[name], ...ramp};
}

/** Gothic's reviewed dark-only palette, generated from ../palette.config.json. */
export const gothicPalettes = {
  neutral: family('neutral', palette.neutral.dark),
  blue: family('blue', palette.blue.dark),
  cyan: family('cyan', palette.cyan.dark),
  green: family('green', palette.green.dark),
  orange: family('orange', palette.orange.dark),
  pink: family('pink', palette.pink.dark),
  purple: family('purple', palette.purple.dark),
  red: family('red', palette.red.dark),
  teal: family('teal', palette.teal.dark),
  yellow: family('yellow', palette.yellow.dark),
} as const;

export default gothicPalettes;
