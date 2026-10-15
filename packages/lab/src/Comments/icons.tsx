// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file icons.tsx
 * @input Uses React, Icon, getExtendedIcon, and useThemeName
 * @output Exports CommentComposer's owned icon keys and renderer
 * @position Internal glyphs for the Lab CommentComposer
 */

import type {SVGProps} from 'react';
import {getExtendedIcon, Icon, type IconColor} from '@astryxdesign/core/Icon';
import {useThemeName} from '@astryxdesign/core/theme';

/** Theme registry keys owned by CommentComposer. */
export const COMMENT_ICON_KEYS = {
  attach: 'comment:attach',
  emoji: 'comment:emoji',
} as const;

type CommentIconName = keyof typeof COMMENT_ICON_KEYS;
type Glyph = (props: SVGProps<SVGSVGElement>) => React.JSX.Element;

function glyph(paths: readonly string[]): Glyph {
  function CommentComposerGlyph(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}>
        {paths.map(d => (
          <path key={d} d={d} />
        ))}
      </svg>
    );
  }
  return CommentComposerGlyph;
}

const FALLBACK_GLYPHS: Record<CommentIconName, Glyph> = {
  attach: glyph([
    'M19.5 11.5l-7.6 7.6a4.5 4.5 0 0 1-6.36-6.36l7.95-7.95a3 3 0 0 1 4.24 4.24l-7.6 7.6a1.5 1.5 0 0 1-2.12-2.12l7.07-7.07',
  ]),
  emoji: glyph([
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    'M8.5 14.5a4 4 0 0 0 7 0',
    'M9 10h.01M15 10h.01',
  ]),
};

/** A composer glyph resolved through the active theme, with a bundled fallback. */
export function CommentIcon({
  name,
  color = 'secondary',
  size = 'sm',
}: {
  name: CommentIconName;
  color?: IconColor;
  size?: 'xsm' | 'sm' | 'md' | 'lg';
}) {
  const themeName = useThemeName();
  const key = COMMENT_ICON_KEYS[name];
  const hasOverride = getExtendedIcon(key, undefined, themeName) != null;
  return (
    <Icon
      icon={hasOverride ? key : FALLBACK_GLYPHS[name]}
      color={color}
      size={size}
    />
  );
}
