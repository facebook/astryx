// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {
  oklchClampedHex,
  toneToOklabL,
} from '@/app/(sandbox)/pages/color-studio/colorUtils';
import {ThemePalettePreview} from '@/components/ThemePalettePreview';
import type {TonalColor} from '@/components/ThemePalettePreview';
import {NeutralContrastComponents} from './NeutralContrastComponents';

const TONE_STEPS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
  100,
] as const;

function mix(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

/**
 * Preserve vivid middle tones while tapering chroma through the pastel end of
 * each ramp. Per-hue chroma values balance perceived intensity while keeping
 * one stable hue from the saturated stops through the lightest pastels.
 */
function chromaMultiplier(tone: number): number {
  if (tone <= 65) {
    return 2.7;
  }
  if (tone <= 70) {
    return mix(2.7, 2.2, (tone - 65) / 5);
  }
  if (tone <= 75) {
    return mix(2.2, 1.8, (tone - 70) / 5);
  }
  if (tone <= 80) {
    return mix(1.8, 1.4, (tone - 75) / 5);
  }
  if (tone <= 85) {
    return mix(1.4, 1, (tone - 80) / 5);
  }
  if (tone <= 90) {
    return mix(1, 0.65, (tone - 85) / 5);
  }
  if (tone <= 95) {
    return mix(0.65, 0.3, (tone - 90) / 5);
  }
  return 0;
}

function darkTone(tone: number): number {
  if (tone >= 95) {
    return tone;
  }
  if (tone <= 80) {
    return tone + 5;
  }
  return tone + 5 * ((95 - tone) / 15);
}

function buildBalancedTones(
  hue: number,
  pastelChroma: number,
  dark = false,
): Record<string | number, string | number> {
  const chroma = dark ? pastelChroma * 0.85 : pastelChroma;
  const tones: Record<string | number, string | number> = {hue, chroma};
  for (const tone of TONE_STEPS) {
    const resolvedTone = dark ? darkTone(tone) : tone;
    tones[tone] = oklchClampedHex(
      toneToOklabL(resolvedTone),
      chroma * chromaMultiplier(resolvedTone),
      hue,
    );
  }
  return tones;
}

function balancedColor(
  name: string,
  hue: number,
  pastelChroma: number,
  semantic?: string,
): TonalColor {
  const tones = buildBalancedTones(hue, pastelChroma);
  const darkTones = buildBalancedTones(hue, pastelChroma, true);
  return {
    name,
    sourceHex: String(tones[50]),
    semantic,
    note: `OKLCH H${hue} · pastel C${pastelChroma}`,
    tones,
    dark: {sourceHex: String(darkTones[50]), tones: darkTones},
  };
}

const TONAL_COLORS: TonalColor[] = [
  {name: 'Neutral', sourceHex: '#e5e5e5', note: 'C=0'},
  balancedColor('Red', 25, 0.065, 'Error'),
  balancedColor('Orange', 65, 0.07),
  balancedColor('Yellow', 90, 0.13, 'Warning'),
  balancedColor('Green', 145, 0.06, 'Success'),
  balancedColor('Teal', 180, 0.065),
  balancedColor('Cyan', 215, 0.065),
  balancedColor('Blue', 255, 0.085, 'Info'),
  balancedColor('Purple', 320, 0.06),
  balancedColor('Pink', 355, 0.06),
];

const CORE = [
  {hex: '#fafafa', name: 'Neutral 50'},
  {hex: '#f1f1f1', name: 'Body (T95)'},
  {hex: '#e2e2e2', name: 'Neutral T90'},
  {hex: '#777777', name: 'Neutral T50'},
  {hex: '#262626', name: 'Accent (T15)'},
];

export default function NeutralPalettePage() {
  return (
    <ThemePalettePreview
      theme={neutralTheme}
      title="Neutral Theme Palette"
      subtitle="Approved balanced OKLCH palette applied to the neutral theme. The component sections below use the real theme tokens in light and dark mode; the audit drawer reports token usage and contrast."
      tonalColors={TONAL_COLORS}
      coreSwatches={CORE}
      extraSections={<NeutralContrastComponents />}
    />
  );
}
