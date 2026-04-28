'use client';

import {useMemo, useRef, useEffect, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSDivider} from '@xds/core/Divider';
import {useXDSTheme} from '@xds/core/theme';
import type {
  ReferenceDoc,
  ReferenceSection,
  ContentBlock,
  TokenPreviewType,
} from '@xds/core';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    maxWidth: 960,
    margin: '0 auto',
    padding: 32,
  },
  sectionTitle: {
    scrollMarginTop: 80,
  },
  tokenTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'start',
    fontWeight: 600,
    fontSize: 12,
    paddingBlock: 8,
    paddingInline: 12,
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  td: {
    paddingBlock: 8,
    paddingInline: 12,
    borderBottom: '1px solid var(--color-border)',
    verticalAlign: 'middle',
    fontFamily: 'var(--font-family-code)',
    fontSize: 12,
  },
  tokenName: {
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap' as const,
  },
  tokenValue: {
    color: 'var(--color-text-secondary)',
    maxWidth: 320,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  previewCell: {
    width: 48,
  },
  listItem: {
    paddingBlock: 2,
    color: 'var(--color-text-primary)',
    fontSize: 14,
    lineHeight: 1.5,
  },
  doIcon: {
    color: 'var(--color-success)',
    flexShrink: 0,
    fontWeight: 700,
  },
  dontIcon: {
    color: 'var(--color-error)',
    flexShrink: 0,
    fontWeight: 700,
  },
  prose: {
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--color-text-primary)',
  },
});

// =============================================================================
// Token Preview Renderers
// =============================================================================

function SwatchPreview({value}: {value: string}) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: value,
        border: '1px solid var(--color-border)',
        flexShrink: 0,
      }}
    />
  );
}

function ShadowBoxPreview({value}: {value: string}) {
  return (
    <div
      style={{
        width: 32,
        height: 24,
        borderRadius: 6,
        backgroundColor: 'var(--color-background-surface)',
        boxShadow: value,
        flexShrink: 0,
      }}
    />
  );
}

function RadiusBoxPreview({value}: {value: string}) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: value,
        border: '2px solid var(--color-accent)',
        flexShrink: 0,
      }}
    />
  );
}

function SpacingBarPreview({value}: {value: string}) {
  return (
    <div
      style={{
        width: value,
        minWidth: 2,
        maxWidth: 64,
        height: 12,
        borderRadius: 2,
        backgroundColor: 'var(--color-accent)',
        opacity: 0.6,
        flexShrink: 0,
      }}
    />
  );
}

function SizeBarPreview({value}: {value: string}) {
  return (
    <div
      style={{
        height: value,
        width: 40,
        maxHeight: 48,
        borderRadius: 4,
        backgroundColor: 'var(--color-accent-muted)',
        border: '1px solid var(--color-accent)',
        flexShrink: 0,
      }}
    />
  );
}

function BorderLinePreview({value}: {value: string}) {
  return (
    <div
      style={{
        width: 32,
        height: 0,
        borderBottom: `${value} solid var(--color-border-emphasized)`,
        flexShrink: 0,
      }}
    />
  );
}

function DurationBarPreview({value}: {value: string}) {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setAnimate(a => !a), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: 40,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'var(--color-neutral)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
      <div
        ref={ref}
        style={{
          width: animate ? '100%' : '0%',
          height: '100%',
          borderRadius: 4,
          backgroundColor: 'var(--color-accent)',
          transition: `width ${value} ease`,
        }}
      />
    </div>
  );
}

function EasingCurvePreview({value}: {value: string}) {
  // Parse cubic-bezier values and draw a mini SVG curve
  const match = value.match(
    /cubic-bezier\(\s*([\d.]+)\s*,\s*([-\d.]+)\s*,\s*([\d.]+)\s*,\s*([-\d.]+)\s*\)/,
  );
  if (!match) return null;
  const [, x1, y1, x2, y2] = match.map(Number);
  return (
    <svg width={32} height={24} viewBox="0 0 1 1" style={{flexShrink: 0}}>
      <path
        d={`M 0 1 C ${x1} ${1 - y1}, ${x2} ${1 - y2}, 1 0`}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={0.06}
      />
    </svg>
  );
}

function FontSamplePreview({
  tokenName,
  value,
}: {
  tokenName: string;
  value: string;
}) {
  const style: React.CSSProperties = {
    flexShrink: 0,
    whiteSpace: 'nowrap',
    maxWidth: 120,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  if (tokenName.includes('font-family')) {
    return <span style={{...style, fontFamily: value, fontSize: 13}}>Aa</span>;
  }
  if (tokenName.includes('font-size')) {
    return <span style={{...style, fontSize: value}}>Aa</span>;
  }
  if (tokenName.includes('font-weight')) {
    return <span style={{...style, fontWeight: value, fontSize: 13}}>Aa</span>;
  }
  if (tokenName.includes('text-') && tokenName.includes('-size')) {
    return <span style={{...style, fontSize: value}}>Aa</span>;
  }
  if (tokenName.includes('text-') && tokenName.includes('-weight')) {
    return <span style={{...style, fontWeight: value, fontSize: 13}}>Aa</span>;
  }
  return <span style={{...style, fontSize: 13}}>Aa</span>;
}

function TokenPreview({
  type,
  tokenName,
  value,
}: {
  type: TokenPreviewType;
  tokenName: string;
  value: string;
}) {
  switch (type) {
    case 'swatch':
      return <SwatchPreview value={value} />;
    case 'shadow-box':
      return <ShadowBoxPreview value={value} />;
    case 'radius-box':
      return <RadiusBoxPreview value={value} />;
    case 'spacing-bar':
      return <SpacingBarPreview value={value} />;
    case 'size-bar':
      return <SizeBarPreview value={value} />;
    case 'border-line':
      return <BorderLinePreview value={value} />;
    case 'duration-bar':
      return <DurationBarPreview value={value} />;
    case 'easing-curve':
      return <EasingCurvePreview value={value} />;
    case 'font-sample':
      return <FontSamplePreview tokenName={tokenName} value={value} />;
    default:
      return null;
  }
}

// =============================================================================
// Block Renderers
// =============================================================================

function TokenTable({
  rows,
  previewType,
}: {
  headers: string[];
  rows: string[][];
  previewType?: TokenPreviewType;
}) {
  const {token} = useXDSTheme();

  return (
    <div style={{overflowX: 'auto'}}>
      <table {...stylex.props(styles.tokenTable)}>
        <thead>
          <tr>
            {previewType && (
              <th {...stylex.props(styles.th, styles.previewCell)} />
            )}
            <th {...stylex.props(styles.th)}>Token</th>
            <th {...stylex.props(styles.th)}>Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const tokenName = row[0];
            // Resolve the live value from the current theme
            const liveValue = token(tokenName) ?? row[1];
            return (
              <tr key={i}>
                {previewType && (
                  <td {...stylex.props(styles.td, styles.previewCell)}>
                    <TokenPreview
                      type={previewType}
                      tokenName={tokenName}
                      value={liveValue}
                    />
                  </td>
                )}
                <td {...stylex.props(styles.td, styles.tokenName)}>
                  {tokenName}
                </td>
                <td {...stylex.props(styles.td, styles.tokenValue)}>
                  {liveValue}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProseBlock({text}: {text: string}) {
  return (
    <div {...stylex.props(styles.prose)}>
      <XDSText>{text}</XDSText>
    </div>
  );
}

function CodeBlockRenderer({
  lang,
  code,
  label,
}: {
  lang: string;
  code: string;
  label?: string;
}) {
  return (
    <XDSVStack gap={1}>
      {label && (
        <XDSText type="supporting" color="secondary">
          {label}
        </XDSText>
      )}
      <XDSCodeBlock code={code} language={lang} hasCopyButton />
    </XDSVStack>
  );
}

function ListBlock({
  items,
  listStyle,
}: {
  items: string[];
  listStyle: 'ordered' | 'unordered' | 'do' | 'dont';
}) {
  return (
    <XDSVStack gap={1}>
      {items.map((item, i) => (
        <XDSHStack key={i} gap={2} align="start">
          {listStyle === 'do' && (
            <span {...stylex.props(styles.doIcon)}>✓</span>
          )}
          {listStyle === 'dont' && (
            <span {...stylex.props(styles.dontIcon)}>✗</span>
          )}
          {listStyle === 'ordered' && (
            <XDSText type="body" color="secondary">
              {i + 1}.
            </XDSText>
          )}
          {listStyle === 'unordered' && (
            <XDSText type="body" color="secondary">
              •
            </XDSText>
          )}
          <div {...stylex.props(styles.listItem)}>{item}</div>
        </XDSHStack>
      ))}
    </XDSVStack>
  );
}

function ContentBlockRenderer({
  block,
  previewType,
}: {
  block: ContentBlock;
  previewType?: TokenPreviewType;
}) {
  switch (block.type) {
    case 'prose':
      return <ProseBlock text={block.text} />;
    case 'code':
      return (
        <CodeBlockRenderer
          lang={block.lang}
          code={block.code}
          label={block.label}
        />
      );
    case 'table':
      return (
        <TokenTable
          headers={block.headers}
          rows={block.rows}
          previewType={previewType}
        />
      );
    case 'list':
      return <ListBlock items={block.items} listStyle={block.style} />;
    case 'token-ref':
      // Should already be resolved by the CLI — render nothing if unresolved
      return null;
    default:
      return null;
  }
}

// =============================================================================
// Section Renderer
// =============================================================================

function SectionRenderer({section}: {section: ReferenceSection}) {
  return (
    <XDSVStack gap={4}>
      <XDSHeading
        level={2}
        id={section.title.toLowerCase().replace(/\s+/g, '-')}
        xstyle={styles.sectionTitle}>
        {section.title}
      </XDSHeading>
      {section.content.map((block, i) => (
        <ContentBlockRenderer
          key={i}
          block={block}
          previewType={section.previewType}
        />
      ))}
    </XDSVStack>
  );
}

// =============================================================================
// DocPreview
// =============================================================================

export function DocPreview({doc}: {doc: ReferenceDoc}) {
  // Group sections into: token tables, usage/code, best practices, and other
  const {tokenSections, usageSections, practiceSections, otherSections} =
    useMemo(() => {
      const token: ReferenceSection[] = [];
      const usage: ReferenceSection[] = [];
      const practice: ReferenceSection[] = [];
      const other: ReferenceSection[] = [];

      for (const section of doc.sections) {
        const titleLower = section.title.toLowerCase();
        if (
          section.previewType ||
          section.content.some(b => b.type === 'table')
        ) {
          token.push(section);
        } else if (titleLower.includes('usage')) {
          usage.push(section);
        } else if (
          titleLower.includes('best practice') ||
          titleLower.includes('guidance')
        ) {
          practice.push(section);
        } else {
          other.push(section);
        }
      }

      return {
        tokenSections: token,
        usageSections: usage,
        practiceSections: practice,
        otherSections: other,
      };
    }, [doc.sections]);

  return (
    <div {...stylex.props(styles.root)}>
      <XDSVStack gap={8}>
        {/* Title + Description */}
        <XDSVStack gap={2}>
          <XDSHeading level={1}>{doc.title}</XDSHeading>
          <XDSText type="large" color="secondary">
            {doc.description}
          </XDSText>
        </XDSVStack>

        {/* Overview / other sections first */}
        {otherSections.map((section, i) => (
          <SectionRenderer key={`other-${i}`} section={section} />
        ))}

        {/* Token tables */}
        {tokenSections.length > 0 && (
          <>
            <XDSDivider />
            {tokenSections.map((section, i) => (
              <SectionRenderer key={`token-${i}`} section={section} />
            ))}
          </>
        )}

        {/* Usage */}
        {usageSections.length > 0 && (
          <>
            <XDSDivider />
            {usageSections.map((section, i) => (
              <SectionRenderer key={`usage-${i}`} section={section} />
            ))}
          </>
        )}

        {/* Best Practices */}
        {practiceSections.length > 0 && (
          <>
            <XDSDivider />
            {practiceSections.map((section, i) => (
              <SectionRenderer key={`practice-${i}`} section={section} />
            ))}
          </>
        )}
      </XDSVStack>
    </div>
  );
}
