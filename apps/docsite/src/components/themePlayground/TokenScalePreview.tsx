// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Text, Heading} from '@xds/core/Text';
import {parseLightDark} from './helpers';

const SECTION_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-disabled)',
};

const SCALE_ROW: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 200px 200px',
  alignItems: 'center',
  gap: 8,
};

const CODE_LABEL: React.CSSProperties = {
  fontSize: 12,
  fontFamily: 'monospace',
  color: 'var(--color-text-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

export function TokenScalePreview({tokens}: {tokens: Record<string, string>}) {
  const resolveSize = (raw: string) => {
    if (!raw) {return raw;}
    return raw.startsWith('var(') ? tokens[raw.slice(4, -1)] || raw : raw;
  };
  const toPx = (raw: string) => {
    const resolved = resolveSize(raw);
    if (resolved?.endsWith('rem'))
      {return `${Math.round(parseFloat(resolved) * 16)}px`;}
    return resolved;
  };

  const colorsSection = (
    <div style={SECTION_STYLE}>
      <span style={SECTION_TITLE}>Colors</span>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        {[
          {token: '--color-accent', label: 'accent'},
          {token: '--color-accent-muted', label: 'accent-muted'},
          {token: '--color-neutral', label: 'neutral'},
          {token: '--color-background-card', label: 'card'},
          {token: '--color-background-surface', label: 'surface'},
          {token: '--color-text-primary', label: 'text'},
          {token: '--color-text-secondary', label: 'text-secondary'},
          {token: '--color-border', label: 'border'},
        ].map(({token, label}) => {
          const raw = tokens[token] || '';
          const parsed = parseLightDark(raw);
          const displayVal = parsed ? parsed.light : raw;
          return (
            <div key={token} style={SCALE_ROW}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  backgroundColor: `var(${token})`,
                  border: '1px solid var(--color-border)',
                  flexShrink: 0,
                }}
              />
              <span style={CODE_LABEL}>{label}</span>
              <span style={CODE_LABEL}>{displayVal}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const typographySection = (
    <div style={SECTION_STYLE}>
      <span style={SECTION_TITLE}>Typography</span>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {(['display-1', 'display-2', 'display-3'] as const).map(type => (
          <div key={type} style={SCALE_ROW}>
            <div style={{overflow: 'hidden'}}>
              <Text type={type} maxLines={1}>
                Display
              </Text>
            </div>
            <span style={CODE_LABEL}>{type}</span>
            <span style={CODE_LABEL}>
              {toPx(tokens[`--text-${type}-size`] || '')}
            </span>
          </div>
        ))}
        {([1, 2, 3, 4] as const).map(level => (
          <div key={level} style={SCALE_ROW}>
            <div style={{overflow: 'hidden'}}>
              <Heading level={level} maxLines={1}>
                Heading {level}
              </Heading>
            </div>
            <span style={CODE_LABEL}>h{level}</span>
            <span style={CODE_LABEL}>
              {toPx(tokens[`--text-heading-${level}-size`] || '')}
            </span>
          </div>
        ))}
        {(['large', 'body', 'label', 'supporting', 'code'] as const).map(
          type => (
            <div key={type} style={SCALE_ROW}>
              <div style={{overflow: 'hidden'}}>
                <Text type={type} maxLines={1}>
                  {type === 'code'
                    ? 'const theme = defineTheme()'
                    : 'The quick brown fox'}
                </Text>
              </div>
              <span style={CODE_LABEL}>{type}</span>
              <span style={CODE_LABEL}>
                {toPx(tokens[`--text-${type}-size`] || '')}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );

  const spacingSection = (
    <div style={SECTION_STYLE}>
      <span style={SECTION_TITLE}>Spacing</span>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        {[0.5, 1, 2, 3, 4, 6, 8, 12].map(step => {
          const key = String(step).replace('.', '-');
          const val = tokens[`--spacing-${key}`] || '0px';
          return (
            <div key={step} style={SCALE_ROW}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <div
                  style={{
                    width: val,
                    height: val,
                    backgroundColor: 'var(--color-accent-muted)',
                    border: '1px dashed var(--color-accent)',
                    transition: 'width 200ms ease, height 200ms ease',
                  }}
                />
              </div>
              <span style={CODE_LABEL}>{step}</span>
              <span style={CODE_LABEL}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const radiusSection = (
    <div style={SECTION_STYLE}>
      <span style={SECTION_TITLE}>Corner Radius</span>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {(['none', 'inner', 'element', 'container', 'page'] as const).map(
          name => {
            const val = tokens[`--radius-${name}`] || '0px';
            return (
              <div key={name} style={SCALE_ROW}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'var(--color-accent-muted)',
                    border: '1px dashed var(--color-accent)',
                    borderRadius: val,
                    flexShrink: 0,
                    transition: 'border-radius 200ms ease',
                  }}
                />
                <span style={CODE_LABEL}>{name}</span>
                <span style={CODE_LABEL}>{val}</span>
              </div>
            );
          },
        )}
      </div>
    </div>
  );

  const sizeSection = (
    <div style={SECTION_STYLE}>
      <span style={SECTION_TITLE}>Element Size</span>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {(['sm', 'md', 'lg'] as const).map(size => {
          const val = tokens[`--size-element-${size}`] || '32px';
          return (
            <div key={size} style={SCALE_ROW}>
              <div
                style={{
                  width: `calc(${val} * 2.4)`,
                  height: val,
                  backgroundColor: 'var(--color-accent-muted)',
                  border: '1px dashed var(--color-accent)',
                  borderRadius: 8,
                  flexShrink: 0,
                  transition: 'width 200ms ease, height 200ms ease',
                }}
              />
              <span style={CODE_LABEL}>{size}</span>
              <span style={CODE_LABEL}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{containerType: 'inline-size'}}>
      <style>
        {'@container (min-width: 720px) { .token-scale-grid { grid-template-columns: 1fr auto 1fr !important; } }' +
          '@container (max-width: 719px) { .token-scale-divider { display: none !important; } }'}
      </style>
      <div
        className="token-scale-grid"
        style={{display: 'grid', gridTemplateColumns: '1fr', gap: 32}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 32}}>
          {colorsSection}
          {spacingSection}
          {sizeSection}
        </div>
        <div
          className="token-scale-divider"
          style={{width: 1, backgroundColor: 'var(--color-border)'}}
        />
        <div style={{display: 'flex', flexDirection: 'column', gap: 32}}>
          {typographySection}
          {radiusSection}
        </div>
      </div>
    </div>
  );
}
