// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as React from 'react';
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

const TOKEN_ICONS: Record<TokenGroupKey, React.ReactNode> = {
  colors: <PaletteOutline16Icon />,
  spacing: <FourRectangleGridOutline16Icon />,
  radius: <FrameDashedOutline16Icon />,
  typography: <BigALittleAOutline16Icon />,
  size: <AspectRatioOutline16Icon />,
  shadow: <SquareOutline16Icon />,
  duration: <StopwatchOutline16Icon />,
  easing: <BoltOutline16Icon />,
};

function SpacingEditor({
  tokenName,
  value,
  onChange,
}: {
  tokenName: string;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  const numValue = parseInt(value, 10);
  return (
    <TokenRow
      tokenName={tokenName}
      preview={
        <div
          style={{
            width: Math.min(numValue, 48),
            height: 24,
            backgroundColor: 'var(--color-accent)',
            borderRadius: 4,
            flexShrink: 0,
          }}
        />
      }
      input={
        <div style={{width: 80}}>
          <XDSTextInput
            label="Value"
            isLabelHidden
            value={value}
            onChange={val => onChange(tokenName, val)}
            size="sm"
          />
        </div>
      }
    />
  );
}

function RadiusEditor({
  tokenName,
  value,
  onChange,
}: {
  tokenName: string;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <TokenRow
      tokenName={tokenName}
      preview={
        <div
          style={{
            width: 32,
            height: 32,
            backgroundColor: 'var(--color-accent)',
            borderRadius: value,
            flexShrink: 0,
          }}
        />
      }
      input={
        <div style={{width: 80}}>
          <XDSTextInput
            label="Value"
            isLabelHidden
            value={value}
            onChange={val => onChange(tokenName, val)}
            size="sm"
          />
        </div>
      }
    />
  );
}

function TypographyEditor({
  tokenName,
  value,
  onChange,
}: {
  tokenName: string;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  const isFont = tokenName.includes('font-') && !tokenName.includes('weight');
  const isSize = tokenName.includes('text-') && tokenName.includes('size');
  const isWeight = tokenName.includes('weight');

  return (
    <TokenRow
      tokenName={tokenName}
      preview={
        <div
          style={{
            width: 48,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isSize ? value : '14px',
            fontWeight: isWeight ? value : 400,
            fontFamily: isFont ? value : 'inherit',
            color: 'var(--color-text-primary)',
            flexShrink: 0,
          }}>
          Aa
        </div>
      }
      input={
        <div style={{width: 200}}>
          <XDSTextInput
            label="Value"
            isLabelHidden
            value={value}
            onChange={val => onChange(tokenName, val)}
            size="sm"
          />
        </div>
      }
    />
  );
}

function GenericEditor({
  tokenName,
  value,
  onChange,
}: {
  tokenName: string;
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <TokenRow
      tokenName={tokenName}
      input={
        <div style={{width: 200}}>
          <XDSTextInput
            label="Value"
            isLabelHidden
            value={value}
            onChange={val => onChange(tokenName, val)}
            size="sm"
          />
        </div>
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
  const [activeGroup, setActiveGroup] = React.useState<TokenGroupKey>('colors');

  return (
    <XDSVStack gap={3}>
      <div style={{overflowX: 'auto'}}>
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
                  style={{
                    padding: '8px 0 4px',
                    display: 'block',
                  }}>
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
                  style={{padding: '8px 0 4px', display: 'block'}}>
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
