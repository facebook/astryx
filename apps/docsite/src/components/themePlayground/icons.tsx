// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Icon shim for the theme playground. The tool was authored against internal
 * `@nest/*` icon packages; the OSS docsite uses Lucide. Each export keeps the
 * original icon name (aliased to the closest Lucide icon) and renders at the
 * 16px size the editor expects, so the ported component code stays unchanged.
 */

import * as React from 'react';
import {
  ArrowLeft,
  Sun,
  Moon,
  Palette,
  LayoutGrid,
  Copy,
  Languages,
  Maximize2,
  Layers,
  Clock,
  Zap,
  type LucideProps,
} from 'lucide-react';

const sized =
  (Icon: React.ComponentType<LucideProps>) =>
  (props: LucideProps): React.ReactElement => <Icon size={16} {...props} />;

// ThemeEditorView
export const ArrowLeftFilled16Icon = sized(ArrowLeft);
export const LargeHalfCircle8RaysLargeOutline16Icon = sized(Sun);
export const CrescentOutline16Icon = sized(Moon);

// RawTokensPanel token-category icons
export const PaletteOutline16Icon = sized(Palette);
export const FourRectangleGridOutline16Icon = sized(LayoutGrid);
export const FrameDashedOutline16Icon = sized(Copy);
export const BigALittleAOutline16Icon = sized(Languages);
export const AspectRatioOutline16Icon = sized(Maximize2);
export const SquareOutline16Icon = sized(Layers);
export const StopwatchOutline16Icon = sized(Clock);
export const BoltOutline16Icon = sized(Zap);
