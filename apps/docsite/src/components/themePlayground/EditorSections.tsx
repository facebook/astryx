// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Stack';
import {XDSSelector} from '@xds/core/Selector';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSTooltip} from '@xds/core/Tooltip';
import {XDSIcon} from '@xds/core/Icon';
import {expandRadiusScale, expandTypeScale} from '@xds/core/theme';
import {ColorSwatch} from './ColorSwatch';
import {XDSSelectableCard} from '@xds/core/SelectableCard';
import {FONT_OPTIONS, RATIO_OPTIONS, UNIFIED_PRESETS} from './constants';

const styles = stylex.create({
  fullWidthField: {width: '100%'},
});

interface EditorSectionsProps {
  tokens: Record<string, string>;
  mode: 'light' | 'dark';
  typeScaleBase: number;
  typeScaleRatio: number;
  radiusBase: number;
  spacingBase: number;
  sizeBase: number;
  durationStep: number;
  activePreset: string | null;
  autoPickColors: boolean;
  onTokenChange: (name: string, value: string) => void;
  onApplyTypeScale: (base: number, ratio: number) => void;
  onApplyRadiusScale: (base: number) => void;
  onApplySpacingScale: (base: number) => void;
  onApplySizeScale: (base: number) => void;
  onApplyDurationScale: (multiplier: number) => void;
  onApplyUnifiedPreset: (key: string) => void;
  onSetAutoPickColors: (val: boolean) => void;
  onExpandColorScale: (accent: string) => void;
  onSetTokens: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function EditorSections({
  tokens,
  mode,
  typeScaleBase,
  typeScaleRatio,
  radiusBase,
  spacingBase,
  sizeBase,
  durationStep,
  activePreset,
  autoPickColors,
  onTokenChange,
  onApplyTypeScale,
  onApplyRadiusScale,
  onApplySpacingScale,
  onApplySizeScale,
  onApplyDurationScale,
  onApplyUnifiedPreset,
  onSetAutoPickColors,
  onExpandColorScale,
}: EditorSectionsProps) {
  // Reflect the active token values in the typography controls. Fonts map
  // directly to a token; the type scale ratio is derived from the raw
  // --font-size-* tokens (present only when a theme customizes its scale).
  const fontValue = (token: string): string | undefined =>
    FONT_OPTIONS.some(o => o.value === tokens[token])
      ? tokens[token]
      : undefined;

  const baseRem = parseFloat(tokens['--font-size-base'] ?? '');
  const lgRem = parseFloat(tokens['--font-size-lg'] ?? '');
  const tokenTypeRatio =
    Number.isFinite(baseRem) && Number.isFinite(lgRem) && baseRem > 0
      ? lgRem / baseRem
      : null;
  const tokenTypeBase =
    Number.isFinite(baseRem) && baseRem > 0
      ? Math.round(baseRem * 16)
      : typeScaleBase;
  const matchedRatio =
    tokenTypeRatio != null
      ? RATIO_OPTIONS.find(o => Math.abs(o.value - tokenTypeRatio) < 0.02)
      : undefined;

  // The scale controls below should only show a value when the seeded theme's
  // tokens actually follow the generator algorithm. A theme can ship hand-
  // tuned tokens that don't fit any base — in that case the matching base is
  // null and the control renders "unset" (no preset highlighted, empty input)
  // so it never implies a base the theme isn't really using.

  // Type size — matches when the raw font-size ramp follows the geometric
  // scale for the derived base + nearest standard ratio.
  const typeSizeMatch = (() => {
    if (tokenTypeRatio == null || !matchedRatio) {
      return null;
    }
    const expected = expandTypeScale({
      base: tokenTypeBase,
      ratio: matchedRatio.value,
    });
    const keys = [
      '--font-size-xs',
      '--font-size-sm',
      '--font-size-base',
      '--font-size-lg',
      '--font-size-xl',
      '--font-size-2xl',
    ];
    return keys.every(k => tokens[k] === expected[k]) ? tokenTypeBase : null;
  })();

  // Corner radius — linear scale anchored on --radius-inner (= base).
  const radiusMatch = (() => {
    const inner = parseInt(tokens['--radius-inner'] ?? '', 10);
    if (!Number.isFinite(inner)) {
      return null;
    }
    const expected = expandRadiusScale({base: inner, multiplier: 1});
    const keys = [
      '--radius-inner',
      '--radius-element',
      '--radius-container',
      '--radius-page',
    ];
    return keys.every(k => tokens[k] === expected[k]) ? inner : null;
  })();

  // Spacing — linear scale where step N = base × N (base = --spacing-1).
  const spacingMatch = (() => {
    const base = parseInt(tokens['--spacing-1'] ?? '', 10);
    if (!Number.isFinite(base)) {
      return null;
    }
    const steps: Record<string, number> = {
      '--spacing-0': 0,
      '--spacing-0-5': 0.5,
      '--spacing-1': 1,
      '--spacing-1-5': 1.5,
      '--spacing-2': 2,
      '--spacing-3': 3,
      '--spacing-4': 4,
      '--spacing-5': 5,
      '--spacing-6': 6,
      '--spacing-7': 7,
      '--spacing-8': 8,
      '--spacing-9': 9,
      '--spacing-10': 10,
      '--spacing-11': 11,
      '--spacing-12': 12,
    };
    const ok = Object.entries(steps).every(
      ([k, step]) => tokens[k] === `${Math.round(base * step)}px`,
    );
    return ok ? base : null;
  })();

  // Element size — md = base, sm = base − 4, lg = base + 4.
  const sizeMatch = (() => {
    const md = parseInt(tokens['--size-element-md'] ?? '', 10);
    const sm = parseInt(tokens['--size-element-sm'] ?? '', 10);
    const lg = parseInt(tokens['--size-element-lg'] ?? '', 10);
    if (!Number.isFinite(md)) {
      return null;
    }
    return sm === md - 4 && lg === md + 4 ? md : null;
  })();

  return (
    <XDSVStack gap={5}>
      {/* Color Section */}
      <XDSVStack gap={3}>
        <XDSHStack
          vAlign="center"
          style={{marginBottom: 4, justifyContent: 'space-between'}}>
          <XDSText type="label" color="secondary">
            Create from accent
          </XDSText>
          <XDSSwitch
            label="Create from accent"
            isLabelHidden
            value={autoPickColors}
            onChange={val => {
              onSetAutoPickColors(val);
              if (val) {
                const accentRaw = tokens['--color-accent'] || '';
                const parsed = accentRaw.match(
                  /^light-dark\(([^,]+),\s*([^)]+)\)$/,
                );
                const accentHex = parsed ? parsed[1].trim() : accentRaw;
                if (accentHex && accentHex.startsWith('#')) {
                  onExpandColorScale(accentHex);
                }
              }
            }}
          />
        </XDSHStack>
        <XDSVStack gap={0}>
          <ColorSwatch
            tokenName="--color-accent"
            value={tokens['--color-accent'] || ''}
            onChange={(name, value) => {
              onTokenChange(name, value);
              if (autoPickColors) {
                const parsed = value.match(
                  /^light-dark\(([^,]+),\s*([^)]+)\)$/,
                );
                const hex = parsed ? parsed[1].trim() : value;
                if (hex && hex.startsWith('#') && hex.length >= 7) {
                  onExpandColorScale(hex);
                }
              }
            }}
            mode={mode}
          />
          {!autoPickColors && (
            <>
              {[
                '--color-neutral',
                '--color-background-card',
                '--color-background-surface',
                '--color-text-primary',
              ].map(tokenName => (
                <ColorSwatch
                  key={tokenName}
                  tokenName={tokenName}
                  value={tokens[tokenName] || ''}
                  onChange={onTokenChange}
                  mode={mode}
                />
              ))}
            </>
          )}
        </XDSVStack>
      </XDSVStack>

      {/* Presets Section */}
      <XDSVStack gap={3}>
        <XDSText type="label" color="secondary">
          Preset
        </XDSText>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
          }}>
          {Object.entries(UNIFIED_PRESETS).map(([key]) => {
            const isSelected = activePreset === key;
            const gap =
              key === 'compact'
                ? 1
                : key === 'default'
                  ? 2
                  : key === 'comfortable'
                    ? 3
                    : 4;
            const cornerR =
              key === 'compact'
                ? 1
                : key === 'default'
                  ? 2
                  : key === 'comfortable'
                    ? 3
                    : 5;
            const fillColor = isSelected
              ? 'var(--color-accent)'
              : 'var(--color-text-disabled)';
            return (
              <XDSSelectableCard
                key={key}
                label={`${key.charAt(0).toUpperCase() + key.slice(1)} preset`}
                isSelected={isSelected}
                onChange={() => onApplyUnifiedPreset(key)}
                padding={2}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column' as const,
                    alignItems: 'center',
                    gap: 6,
                  }}>
                  <svg width={32} height={32} viewBox="0 0 32 32">
                    <rect
                      x={0}
                      y={0}
                      width={32}
                      height={8}
                      rx={cornerR}
                      fill={fillColor}
                      opacity={0.5}
                    />
                    <rect
                      x={0}
                      y={8 + gap}
                      width={15 - gap / 2}
                      height={32 - 8 - gap}
                      rx={cornerR}
                      fill={fillColor}
                    />
                    <rect
                      x={15 + gap / 2}
                      y={8 + gap}
                      width={32 - 15 - gap / 2}
                      height={(32 - 8 - gap * 2) / 2}
                      rx={cornerR}
                      fill={fillColor}
                      opacity={0.7}
                    />
                    <rect
                      x={15 + gap / 2}
                      y={8 + gap + (32 - 8 - gap * 2) / 2 + gap}
                      width={32 - 15 - gap / 2}
                      height={(32 - 8 - gap * 2) / 2}
                      rx={cornerR}
                      fill={fillColor}
                      opacity={0.7}
                    />
                  </svg>
                  <XDSText
                    type="supporting"
                    color={isSelected ? 'primary' : 'secondary'}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </XDSText>
                </div>
              </XDSSelectableCard>
            );
          })}
        </div>
      </XDSVStack>

      {/* Typography Section */}
      <XDSVStack gap={3}>
        <XDSVStack gap={4}>
          <XDSVStack gap={3}>
            {[
              {token: '--font-family-heading', label: 'Heading Font'},
              {token: '--font-family-body', label: 'Body Font'},
            ].map(({token, label}) => (
              <div key={token}>
                <XDSText
                  type="label"
                  color="secondary"
                  style={{marginBottom: 4, display: 'block'}}>
                  {label}
                </XDSText>
                <XDSSelector
                  label={label}
                  isLabelHidden
                  size="sm"
                  placeholder="Custom"
                  xstyle={styles.fullWidthField}
                  options={FONT_OPTIONS}
                  value={fontValue(token)}
                  onChange={(val: string) => onTokenChange(token, val)}
                />
              </div>
            ))}
            <div>
              <XDSText
                type="label"
                color="secondary"
                style={{marginBottom: 4, display: 'block'}}>
                Type Scale
              </XDSText>
              <XDSSelector
                label="Type Scale"
                isLabelHidden
                size="sm"
                placeholder="Default"
                xstyle={styles.fullWidthField}
                options={[
                  ...RATIO_OPTIONS.map(opt => ({
                    value: String(opt.value),
                    label: opt.label,
                  })),
                  ...(tokenTypeRatio != null && !matchedRatio
                    ? [
                        {
                          value: 'custom',
                          label: `Custom — ${tokenTypeRatio.toFixed(3)}`,
                        },
                      ]
                    : []),
                ]}
                value={
                  tokenTypeRatio == null
                    ? undefined
                    : matchedRatio
                      ? String(matchedRatio.value)
                      : 'custom'
                }
                onChange={(v: string) => {
                  if (v !== 'custom') {
                    onApplyTypeScale(tokenTypeBase, Number(v));
                  }
                }}
              />
            </div>
          </XDSVStack>
          <div>
            <XDSHStack gap={1} vAlign="center" style={{marginBottom: 4}}>
              <XDSText type="label" color="secondary">
                Type Size
              </XDSText>
              <XDSTooltip
                content={`Geometric scale: size = round(base × ratio^step). Base = ${typeSizeMatch ?? typeScaleBase}px, ratio = ${typeScaleRatio.toFixed(3)}.`}>
                <XDSIcon icon="info" size="sm" color="secondary" />
              </XDSTooltip>
            </XDSHStack>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <XDSToggleButtonGroup
                label="Type size preset"
                type="single"
                size="sm"
                value={typeSizeMatch != null ? String(typeSizeMatch) : null}
                onChange={(v: string | null) => {
                  if (v != null) {onApplyTypeScale(Number(v), typeScaleRatio);}
                }}>
                <XDSToggleButton label="S" value="12" />
                <XDSToggleButton label="M" value="14" />
                <XDSToggleButton label="L" value="16" />
                <XDSToggleButton label="XL" value="18" />
              </XDSToggleButtonGroup>
              <div style={{flex: 1}} />
              <XDSNumberInput
                label="Type size"
                isLabelHidden
                value={typeSizeMatch ?? null}
                placeholder="—"
                onChange={(v: number) => onApplyTypeScale(v, typeScaleRatio)}
                min={10}
                max={24}
                step={1}
                units="px"
                size="sm"
              />
            </div>
          </div>
        </XDSVStack>
      </XDSVStack>

      {/* Shape & Layout Section */}
      <XDSVStack gap={3}>
        <XDSVStack gap={4}>
          <div>
            <XDSHStack gap={1} vAlign="center" style={{marginBottom: 4}}>
              <XDSText type="label" color="secondary">
                Corner Radius
              </XDSText>
              <XDSTooltip
                content={`Linear scale: inner = ${radiusMatch ?? radiusBase}px, element = ${(radiusMatch ?? radiusBase) * 2}px, container = ${(radiusMatch ?? radiusBase) * 3}px, page = ${Math.round((radiusMatch ?? radiusBase) * 7)}px.`}>
                <XDSIcon icon="info" size="sm" color="secondary" />
              </XDSTooltip>
            </XDSHStack>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <XDSToggleButtonGroup
                label="Radius preset"
                type="single"
                size="sm"
                value={radiusMatch != null ? String(radiusMatch) : null}
                onChange={(v: string | null) => {
                  if (v != null) {onApplyRadiusScale(Number(v));}
                }}>
                <XDSToggleButton label="S" value="2" />
                <XDSToggleButton label="M" value="4" />
                <XDSToggleButton label="L" value="6" />
                <XDSToggleButton label="XL" value="12" />
              </XDSToggleButtonGroup>
              <div style={{flex: 1}} />
              <XDSNumberInput
                label="Radius"
                isLabelHidden
                value={radiusMatch ?? null}
                placeholder="—"
                onChange={(v: number) => onApplyRadiusScale(v)}
                min={0}
                max={18}
                step={2}
                units="px"
                size="sm"
              />
            </div>
          </div>
          <div>
            <XDSHStack gap={1} vAlign="center" style={{marginBottom: 4}}>
              <XDSText type="label" color="secondary">
                Spacing
              </XDSText>
              <XDSTooltip
                content={`Linear scale: step N = ${spacingMatch ?? spacingBase}px × N.`}>
                <XDSIcon icon="info" size="sm" color="secondary" />
              </XDSTooltip>
            </XDSHStack>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <XDSToggleButtonGroup
                label="Spacing preset"
                type="single"
                size="sm"
                value={spacingMatch != null ? String(spacingMatch) : null}
                onChange={(v: string | null) => {
                  if (v != null) {onApplySpacingScale(Number(v));}
                }}>
                <XDSToggleButton label="S" value="2" />
                <XDSToggleButton label="M" value="4" />
                <XDSToggleButton label="L" value="6" />
                <XDSToggleButton label="XL" value="8" />
              </XDSToggleButtonGroup>
              <div style={{flex: 1}} />
              <XDSNumberInput
                label="Spacing"
                isLabelHidden
                value={spacingMatch ?? null}
                placeholder="—"
                onChange={(v: number) => onApplySpacingScale(v)}
                min={0}
                max={16}
                step={2}
                units="px"
                size="sm"
              />
            </div>
          </div>
          <div>
            <XDSHStack gap={1} vAlign="center" style={{marginBottom: 4}}>
              <XDSText type="label" color="secondary">
                Element Size
              </XDSText>
              <XDSTooltip
                content={`sm = ${(sizeMatch ?? sizeBase) - 4}px, md = ${sizeMatch ?? sizeBase}px, lg = ${(sizeMatch ?? sizeBase) + 4}px.`}>
                <XDSIcon icon="info" size="sm" color="secondary" />
              </XDSTooltip>
            </XDSHStack>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <XDSToggleButtonGroup
                label="Element size preset"
                type="single"
                size="sm"
                value={sizeMatch != null ? String(sizeMatch) : null}
                onChange={(v: string | null) => {
                  if (v != null) {onApplySizeScale(Number(v));}
                }}>
                <XDSToggleButton label="S" value="28" />
                <XDSToggleButton label="M" value="32" />
                <XDSToggleButton label="L" value="40" />
                <XDSToggleButton label="XL" value="48" />
              </XDSToggleButtonGroup>
              <div style={{flex: 1}} />
              <XDSNumberInput
                label="Element size"
                isLabelHidden
                value={sizeMatch ?? null}
                placeholder="—"
                onChange={(v: number) => onApplySizeScale(v)}
                min={24}
                max={56}
                step={2}
                units="px"
                size="sm"
              />
            </div>
          </div>
        </XDSVStack>
      </XDSVStack>

      {/* Motion Section */}
      <XDSVStack gap={3}>
        <XDSHStack gap={1} vAlign="center" style={{marginBottom: 4}}>
          <XDSText type="label" color="secondary">
            Duration
          </XDSText>
          <XDSTooltip
            content={`Speed multiplier for all motion. Current: ${durationStep}× (e.g. medium = ${Math.round(410 / durationStep)}ms).`}>
            <XDSIcon icon="info" size="sm" color="secondary" />
          </XDSTooltip>
        </XDSHStack>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <XDSToggleButtonGroup
            label="Duration preset"
            type="single"
            size="sm"
            value={String(durationStep)}
            onChange={(v: string | null) => {
              if (v != null) {onApplyDurationScale(Number(v));}
            }}>
            <XDSToggleButton label="0.5×" value="0.5" />
            <XDSToggleButton label="1×" value="1" />
            <XDSToggleButton label="1.5×" value="1.5" />
            <XDSToggleButton label="2×" value="2" />
          </XDSToggleButtonGroup>
          <div style={{flex: 1}} />
          <XDSNumberInput
            label="Duration"
            isLabelHidden
            value={durationStep}
            onChange={(v: number) =>
              onApplyDurationScale(Math.round(v * 10) / 10)
            }
            min={0.5}
            max={2}
            step={0.1}
            units="×"
            size="sm"
          />
        </div>
      </XDSVStack>
    </XDSVStack>
  );
}
