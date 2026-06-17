// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Stack';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {
  PaletteOutline16Icon,
  FourRectangleGridOutline16Icon,
  FrameDashedOutline16Icon,
  BigALittleAOutline16Icon,
  AspectRatioOutline16Icon,
  SquareOutline16Icon,
  StopwatchOutline16Icon,
  BoltOutline16Icon,
} from './icons';
import {
  colorDefaults,
  spacingDefaults,
  radiusDefaults,
  typographyDefaults,
  textSizeDefaults,
  fontWeightDefaults,
  sizeDefaults,
  shadowDefaults,
  durationDefaults,
  easeDefaults,
} from '@xds/core/theme';
import {ColorSwatch} from './ColorSwatch';
import {TokenRow} from './TokenRow';
import {COLOR_CATEGORIES, TYPOGRAPHY_CATEGORIES} from './constants';

const s = stylex.create({
  scrollX: {
    overflowX: 'auto',
  },
  categoryHeading: {
    display: 'block',
    paddingTop: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-1)',
  },
  spacingPreview: {
    height: 24,
    backgroundColor: 'var(--color-accent)',
    borderRadius: 4,
    flexShrink: 0,
  },
  radiusPreview: {
    width: 32,
    height: 32,
    backgroundColor: 'var(--color-accent)',
    flexShrink: 0,
  },
  typePreview: {
    width: 48,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-primary)',
    flexShrink: 0,
  },
  inputSm: {
    width: 80,
  },
  inputLg: {
    width: 200,
  },
});

const dynamic = stylex.create({
  spacingWidth: (width: number) => ({width}),
  radius: (radius: string) => ({borderRadius: radius}),
  font: (
    fontSize: string,
    fontWeight: string | number,
    fontFamily: string,
  ) => ({fontSize, fontWeight, fontFamily}),
});

const TOKEN_GROUPS = {
  colors: {label: 'Colors', tokens: colorDefaults},
  spacing: {label: 'Spacing', tokens: spacingDefaults},
  radius: {label: 'Radius', tokens: radiusDefaults},
  typography: {
    label: 'Typography',
    tokens: {...typographyDefaults, ...textSizeDefaults, ...fontWeightDefaults},
  },
  size: {label: 'Size', tokens: sizeDefaults},
  shadow: {label: 'Elevation', tokens: shadowDefaults},
  duration: {label: 'Duration', tokens: durationDefaults},
  easing: {label: 'Easing', tokens: easeDefaults},
} as const;

type TokenGroupKey = keyof typeof TOKEN_GROUPS;

const TOKEN_ICONS: Record<TokenGroupKey, ReactNode> = {
  colors: <PaletteOutline16Icon />,
  spacing: <FourRectangleGridOutline16Icon />,
  radius: <FrameDashedOutline16Icon />,
  typography: <BigALittleAOutline16Icon />,
  size: <AspectRatioOutline16Icon />,
  shadow: <SquareOutline16Icon />,
  duration: <StopwatchOutline16Icon />,
  easing: <BoltOutline16Icon />,
};

interface EditorProps {
  tokenName: string;
  value: string;
  onChange: (name: string, value: string) => void;
}

function SpacingEditor({tokenName, value, onChange}: EditorProps) {
  const numValue = parseInt(value, 10);
  return (
    <TokenRow
      tokenName={tokenName}
      preview={
        <div
          {...stylex.props(
            s.spacingPreview,
            dynamic.spacingWidth(Math.min(numValue, 48)),
          )}
        />
      }
      input={
        <XDSTextInput
          label="Value"
          isLabelHidden
          value={value}
          onChange={val => onChange(tokenName, val)}
          size="sm"
          xstyle={s.inputSm}
        />
      }
    />
  );
}

function RadiusEditor({tokenName, value, onChange}: EditorProps) {
  return (
    <TokenRow
      tokenName={tokenName}
      preview={
        <div {...stylex.props(s.radiusPreview, dynamic.radius(value))} />
      }
      input={
        <XDSTextInput
          label="Value"
          isLabelHidden
          value={value}
          onChange={val => onChange(tokenName, val)}
          size="sm"
          xstyle={s.inputSm}
        />
      }
    />
  );
}

function TypographyEditor({tokenName, value, onChange}: EditorProps) {
  const isFont = tokenName.includes('font-') && !tokenName.includes('weight');
  const isSize = tokenName.includes('text-') && tokenName.includes('size');
  const isWeight = tokenName.includes('weight');

  return (
    <TokenRow
      tokenName={tokenName}
      preview={
        <div
          {...stylex.props(
            s.typePreview,
            dynamic.font(
              isSize ? value : '14px',
              isWeight ? value : 400,
              isFont ? value : 'inherit',
            ),
          )}>
          Aa
        </div>
      }
      input={
        <XDSTextInput
          label="Value"
          isLabelHidden
          value={value}
          onChange={val => onChange(tokenName, val)}
          size="sm"
          xstyle={s.inputLg}
        />
      }
    />
  );
}

function GenericEditor({tokenName, value, onChange}: EditorProps) {
  return (
    <TokenRow
      tokenName={tokenName}
      input={
        <XDSTextInput
          label="Value"
          isLabelHidden
          value={value}
          onChange={val => onChange(tokenName, val)}
          size="sm"
          xstyle={s.inputLg}
        />
      }
    />
  );
}

interface RawTokensPanelProps {
  tokens: Record<string, string>;
  mode: 'light' | 'dark';
  onTokenChange: (name: string, value: string) => void;
}

export function RawTokensPanel({
  tokens,
  mode,
  onTokenChange,
}: RawTokensPanelProps) {
  const [activeGroup, setActiveGroup] = useState<TokenGroupKey>('colors');

  return (
    <XDSVStack gap={3}>
      <div {...stylex.props(s.scrollX)}>
        <XDSToggleButtonGroup
          label="Token category"
          type="single"
          size="sm"
          value={activeGroup}
          onChange={(v: string | null) => {
            if (v != null) {
              setActiveGroup(v as TokenGroupKey);
            }
          }}>
          {(Object.keys(TOKEN_GROUPS) as TokenGroupKey[]).map(groupKey => (
            <XDSToggleButton
              key={groupKey}
              label={TOKEN_GROUPS[groupKey].label}
              tooltip={TOKEN_GROUPS[groupKey].label}
              value={groupKey}
              icon={TOKEN_ICONS[groupKey]}
              isIconOnly={activeGroup !== groupKey}
            />
          ))}
        </XDSToggleButtonGroup>
      </div>

      <XDSVStack gap={1}>
        {activeGroup === 'colors' &&
          Object.entries(COLOR_CATEGORIES).map(([category, tokenNames]) => {
            const seen = new Set<string>();
            return (
              <XDSVStack key={category} gap={0}>
                <XDSText
                  type="label"
                  color="primary"
                  weight="semibold"
                  xstyle={s.categoryHeading}>
                  {category}
                </XDSText>
                {tokenNames
                  .filter(t => {
                    if (seen.has(t)) {
                      return false;
                    }
                    seen.add(t);
                    return true;
                  })
                  .map(tokenName => (
                    <ColorSwatch
                      key={tokenName}
                      tokenName={tokenName}
                      value={tokens[tokenName] || ''}
                      onChange={onTokenChange}
                      mode={mode}
                    />
                  ))}
              </XDSVStack>
            );
          })}

        {(activeGroup === 'spacing' || activeGroup === 'size') &&
          Object.keys(TOKEN_GROUPS[activeGroup].tokens).map(tokenName => (
            <SpacingEditor
              key={tokenName}
              tokenName={tokenName}
              value={tokens[tokenName] || ''}
              onChange={onTokenChange}
            />
          ))}

        {activeGroup === 'radius' &&
          Object.keys(TOKEN_GROUPS.radius.tokens).map(tokenName => (
            <RadiusEditor
              key={tokenName}
              tokenName={tokenName}
              value={tokens[tokenName] || ''}
              onChange={onTokenChange}
            />
          ))}

        {activeGroup === 'typography' &&
          Object.entries(TYPOGRAPHY_CATEGORIES).map(([category, config]) => {
            const tokenNames = Array.isArray(config) ? config : config.tokens;
            return (
              <XDSVStack key={category} gap={2}>
                <XDSText
                  type="label"
                  color="primary"
                  weight="semibold"
                  xstyle={s.categoryHeading}>
                  {category}
                </XDSText>
                {tokenNames.map(tokenName => (
                  <TypographyEditor
                    key={tokenName}
                    tokenName={tokenName}
                    value={tokens[tokenName] || ''}
                    onChange={onTokenChange}
                  />
                ))}
              </XDSVStack>
            );
          })}

        {(activeGroup === 'shadow' ||
          activeGroup === 'duration' ||
          activeGroup === 'easing') &&
          Object.keys(TOKEN_GROUPS[activeGroup].tokens).map(tokenName => (
            <GenericEditor
              key={tokenName}
              tokenName={tokenName}
              value={tokens[tokenName] || ''}
              onChange={onTokenChange}
            />
          ))}
      </XDSVStack>
    </XDSVStack>
  );
}
