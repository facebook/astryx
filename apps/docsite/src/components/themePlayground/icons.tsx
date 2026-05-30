// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Icon shim for the theme playground. The tool was authored against internal
 * `@nest/*` icon packages; the OSS docsite uses Heroicons. Each export keeps
 * the original icon name (aliased to the closest Heroicon) and renders at the
 * 16px size the editor expects, so the ported component code stays unchanged.
 */

import * as React from 'react';
import {
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  SwatchIcon,
  Squares2X2Icon,
  Square2StackIcon,
  LanguageIcon,
  ArrowsPointingOutIcon,
  Square3Stack3DIcon,
  ClockIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

type IconProps = React.SVGProps<SVGSVGElement>;

const sized =
  (Icon: React.ComponentType<IconProps>) =>
  (props: IconProps): React.ReactElement => (
    <Icon width={16} height={16} {...props} />
  );

// ThemeEditorView
export const ArrowLeftFilled16Icon = sized(ArrowLeftIcon);
export const LargeHalfCircle8RaysLargeOutline16Icon = sized(SunIcon);
export const CrescentOutline16Icon = sized(MoonIcon);

// RawTokensPanel token-category icons
export const PaletteOutline16Icon = sized(SwatchIcon);
export const FourRectangleGridOutline16Icon = sized(Squares2X2Icon);
export const FrameDashedOutline16Icon = sized(Square2StackIcon);
export const BigALittleAOutline16Icon = sized(LanguageIcon);
export const AspectRatioOutline16Icon = sized(ArrowsPointingOutIcon);
export const SquareOutline16Icon = sized(Square3Stack3DIcon);
export const StopwatchOutline16Icon = sized(ClockIcon);
export const BoltOutline16Icon = sized(BoltIcon);
