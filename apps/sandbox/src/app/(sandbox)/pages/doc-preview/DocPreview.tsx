'use client';

import {useMemo, useRef, useEffect, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSDivider} from '@xds/core/Divider';
import {XDSSection} from '@xds/core/Section';
import {XDSTable, pixel, proportional} from '@xds/core/Table';
import {XDSTooltip} from '@xds/core/Tooltip';
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
    paddingBlock: 12,
    paddingInline: 16,
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  td: {
    paddingBlock: 12,
    paddingInline: 16,
    borderBottom: '1px solid var(--color-border)',
    verticalAlign: 'middle',
    fontFamily: 'var(--font-family-code)',
    fontSize: 12,
  },
  tokenRow: {
    borderRadius: 8,
    transition: 'background-color 0.15s ease',
    ':hover': {
      backgroundColor: 'var(--color-background-wash)',
    },
  },
  tokenName: {
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap' as const,
  },
  tokenLink: {
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    textDecoration: {
      default: 'none',
      ':hover': 'underline',
    },
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'var(--font-family-code)',
    fontSize: 12,
    fontWeight: 500,
  },
  tokenValue: {
    color: 'var(--color-text-secondary)',
    maxWidth: 320,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  valueWithPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  typeScalePreview: {
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
    display: 'block',
    fontFamily: 'inherit',
  },
  tokenDetail: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  tokenDetailName: {
    fontFamily: 'var(--font-family-code)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap' as const,
  },
  tokenDetailValue: {
    fontFamily: 'var(--font-family-code)',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap' as const,
  },
  listItem: {
    paddingBlock: 2,
    color: 'var(--color-text-primary)',
    fontSize: 14,
    lineHeight: 1.5,
  },
  fullWidth: {
    width: '100%',
  },
  codeBlockEmbed: {
    width: '100%',
  },
  prose: {
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--color-text-primary)',
  },
  version: {
    fontFamily: 'var(--font-family-code)',
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
// Typescale Table
// =============================================================================

const FONT_FAMILY_MAP: Record<string, string> = {
  'heading-1': '--font-family-heading',
  'heading-2': '--font-family-heading',
  'heading-3': '--font-family-heading',
  'heading-4': '--font-family-heading',
  'heading-5': '--font-family-heading',
  'heading-6': '--font-family-heading',
  'body': '--font-family-body',
  'large': '--font-family-body',
  'label': '--font-family-body',
  'supporting': '--font-family-body',
  'code': '--font-family-code',
  'display-1': '--font-family-heading',
  'display-2': '--font-family-heading',
  'display-3': '--font-family-heading',
};

const STYLE_LABEL: Record<string, string> = {
  'display-1': 'Display 1',
  'display-2': 'Display 2',
  'display-3': 'Display 3',
  'heading-1': 'H1',
  'heading-2': 'H2',
  'heading-3': 'H3',
  'heading-4': 'H4',
  'heading-5': 'H5',
  'heading-6': 'H6',
  'body': 'Body',
  'large': 'Large',
  'label': 'Label',
  'code': 'Code',
  'supporting': 'Supporting',
};

const DUMMY_TEXT: Record<string, string> = {
  'display-1': '$12,450',
  'display-2': '98.7%',
  'display-3': 'Welcome',
  'heading-1': 'Page Title',
  'heading-2': 'Section Title',
  'heading-3': 'Card Heading',
  'heading-4': 'Subsection',
  'heading-5': 'Group Label',
  'heading-6': 'Overline',
  'body': 'Body text for reading',
  'large': 'Intro paragraph',
  'label': 'Form Label',
  'code': 'const x = 42;',
  'supporting': 'Helper text',
};

interface TypeScaleStyle {
  name: string;
  sizeToken: string;
  sizeValue: string;
  weightToken: string;
  weightValue: string;
  leadingToken: string;
  leadingValue: string;
  fontFamilyToken: string;
}

function isTypeScaleTable(rows: string[][], previewType?: string): boolean {
  if (previewType !== 'font-sample') return false;
  if (rows.length < 3) return false;
  return (
    rows[0]?.[0]?.endsWith('-size') &&
    rows[1]?.[0]?.endsWith('-weight') &&
    rows[2]?.[0]?.endsWith('-leading')
  );
}

function groupTypeScaleRows(rows: string[][]): TypeScaleStyle[] {
  const grouped: TypeScaleStyle[] = [];
  for (let i = 0; i + 2 < rows.length; i += 3) {
    const sizeToken = rows[i][0];
    const name = sizeToken.replace('--text-', '').replace('-size', '');
    grouped.push({
      name,
      sizeToken,
      sizeValue: rows[i][1],
      weightToken: rows[i + 1][0],
      weightValue: rows[i + 1][1],
      leadingToken: rows[i + 2][0],
      leadingValue: rows[i + 2][1],
      fontFamilyToken: FONT_FAMILY_MAP[name] ?? '--font-family-body',
    });
  }
  return grouped;
}

const TYPE_SCALE_ORDER = [
  'display-1', 'display-2', 'display-3',
  'heading-1', 'heading-2', 'heading-3', 'heading-4', 'heading-5', 'heading-6',
  'large', 'body', 'label', 'code', 'supporting',
];

function TypeScaleTable({rows}: {rows: string[][]}) {
  const {token} = useXDSTheme();
  const grouped = useMemo(() => {
    const items = groupTypeScaleRows(rows);
    const orderMap = new Map(TYPE_SCALE_ORDER.map((k, i) => [k, i]));
    return items.sort((a, b) => (orderMap.get(a.name) ?? 99) - (orderMap.get(b.name) ?? 99));
  }, [rows]);

  const data = grouped.map(s => {
    const leading = token(s.leadingToken) ?? s.leadingValue;
    const size = token(s.sizeToken);
    const px = size ? Math.round(parseFloat(leading) * parseFloat(size)) : null;
    return {
      name: s.name,
      preview: STYLE_LABEL[s.name] ?? s.name,
      fontFamily: token(s.fontFamilyToken),
      fontSize: token(s.sizeToken) ?? s.sizeValue,
      fontWeight: token(s.weightToken) ?? s.weightValue,
      leading: px ? `${leading} (${px}px)` : leading,
      fontFamilyToken: s.fontFamilyToken,
      sizeToken: s.sizeToken,
      weightToken: s.weightToken,
      leadingToken: s.leadingToken,
    };
  });

  return (
    <XDSTable
      data={data as Record<string, unknown>[]}
      columns={[
        {
          key: 'preview',
          header: 'Style',
          width: proportional(2),
          renderCell: (item: Record<string, unknown>) => (
            <span
              {...stylex.props(styles.typeScalePreview)}
              style={{
                fontFamily: item.fontFamily as string,
                fontSize: item.fontSize as string,
                fontWeight: item.fontWeight as string,
                lineHeight: (item.leading as string)?.split(' ')[0],
              }}>
              {item.preview as string}
            </span>
          ),
        },
        {
          key: 'fontFamily',
          header: 'Font',
          renderCell: (item: Record<string, unknown>) => (
            <>{(item.fontFamily as string)?.split(',')[0]?.trim()}</>
          ),
        },
        {
          key: 'fontSize',
          header: 'Size',
        },
        {
          key: 'fontWeight',
          header: 'Weight',
        },
        {
          key: 'leading',
          header: 'Leading',
        },
      ]}
      density="spacious"
      dividers="rows"
      hasHover
    />
  );
}

function CopyableTokenName({name}: {name: string}) {
  const [copied, setCopied] = useState(false);
  return (
    <XDSTooltip content={copied ? 'Copied!' : 'Click to copy'}>
      <button
        {...stylex.props(styles.tokenLink)}
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(name);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}>
        {name}
      </button>
    </XDSTooltip>
  );
}

// =============================================================================
// Block Renderers
// =============================================================================

function TokenTableInner({
  rows,
  previewType,
  isDualColor,
}: {
  rows: string[][];
  previewType?: TokenPreviewType;
  isDualColor: boolean;
}) {
  const {token} = useXDSTheme();
  const data = rows.map((row, i) => ({
    _idx: i,
    tokenName: row[0],
    light: row[1],
    dark: row[2],
    value: token(row[0]) ?? row[1],
  }));

  const columns = isDualColor
    ? [
        {
          key: 'tokenName' as const,
          header: 'Token',
          renderCell: (item: Record<string, unknown>) => (
            <CopyableTokenName name={item.tokenName as string} />
          ),
        },
        {
          key: 'light' as const,
          header: 'Light',
          renderCell: (item: Record<string, unknown>) => (
            <div {...stylex.props(styles.valueWithPreview)}>
              <SwatchPreview value={item.light as string} />
              {item.light as string}
            </div>
          ),
        },
        {
          key: 'dark' as const,
          header: 'Dark',
          renderCell: (item: Record<string, unknown>) => (
            <div {...stylex.props(styles.valueWithPreview)}>
              <SwatchPreview value={item.dark as string} />
              {item.dark as string}
            </div>
          ),
        },
      ]
    : [
        {
          key: 'tokenName' as const,
          header: 'Token',
          renderCell: (item: Record<string, unknown>) => (
            <CopyableTokenName name={item.tokenName as string} />
          ),
        },
        {
          key: 'value' as const,
          header: 'Value',
          renderCell: (item: Record<string, unknown>) => {
            const name = item.tokenName as string;
            const val = item.value as string;
            return previewType ? (
              <div {...stylex.props(styles.valueWithPreview)}>
                <TokenPreview type={previewType} tokenName={name} value={val} />
                {val}
              </div>
            ) : (
              <>{val}</>
            );
          },
        },
      ];

  return (
    <XDSTable
      data={data as Record<string, unknown>[]}
      columns={columns}
      density="spacious"
      dividers="rows"
      hasHover
    />
  );
}

function TokenTable({
  headers,
  rows,
  previewType,
}: {
  headers: string[];
  rows: string[][];
  previewType?: TokenPreviewType;
}) {
  if (isTypeScaleTable(rows, previewType)) {
    return <TypeScaleTable rows={rows} />;
  }

  const isDualColor = headers.length === 3 && previewType === 'swatch';

  return (
    <TokenTableInner
      rows={rows}
      previewType={previewType}
      isDualColor={isDualColor}
    />
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
    <div {...stylex.props(styles.fullWidth)}>
      <XDSVStack gap={1}>
        {label && (
          <XDSText type="body" color="primary">
            {label}
          </XDSText>
        )}
        <XDSCard variant="muted" padding={0}>
          <XDSCodeBlock
            code={code}
            language={lang}
            hasCopyButton
            size="sm"
            xstyle={styles.codeBlockEmbed}
            style={{'--color-syntax-background': 'transparent'} as React.CSSProperties}
          />
        </XDSCard>
      </XDSVStack>
    </div>
  );
}

function ListBlock({
  items,
  listStyle,
}: {
  items: string[];
  listStyle: 'ordered' | 'unordered' | 'do' | 'dont';
}) {
  if (listStyle === 'do' || listStyle === 'dont' || listStyle === ('do-dont-merged' as string)) {
    const data = listStyle === ('do-dont-merged' as string)
      ? items.map(item => {
          const isdo = item.startsWith('do:');
          return {type: isdo ? 'do' : 'dont', text: item.slice(item.indexOf(':') + 1)};
        })
      : items.map(text => ({type: listStyle as string, text}));
    return (
      <XDSTable
        data={data as Record<string, unknown>[]}
        columns={[
          {
            key: 'type',
            header: 'Guidance',
            width: pixel(100),
            renderCell: (item: Record<string, unknown>) => (
              <XDSBadge
                label={item.type === 'do' ? 'Do' : "Don't"}
                variant={item.type === 'do' ? 'success' : 'error'}
              />
            ),
          },
          {
            key: 'text',
            header: 'Practices',
            renderCell: (item: Record<string, unknown>) => (
              <XDSText type="body">{item.text as string}</XDSText>
            ),
          },
        ]}
        density="spacious"
        dividers="rows"
      />
    );
  }

  return (
    <XDSVStack gap={1}>
      {items.map((item, i) => (
        <XDSHStack key={i} gap={2} vAlign="center">
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

function mergeDosDonts(blocks: ContentBlock[]): ContentBlock[] {
  const merged: ContentBlock[] = [];
  let pendingDo: string[] = [];
  let pendingDont: string[] = [];

  const flush = () => {
    if (pendingDo.length > 0 || pendingDont.length > 0) {
      merged.push({
        type: 'list' as const,
        style: 'do-dont-merged' as 'do',
        items: [
          ...pendingDo.map(text => `do:${text}`),
          ...pendingDont.map(text => `dont:${text}`),
        ],
      });
      pendingDo = [];
      pendingDont = [];
    }
  };

  for (const block of blocks) {
    if (block.type === 'list' && block.style === 'do') {
      pendingDo.push(...block.items);
    } else if (block.type === 'list' && block.style === 'dont') {
      pendingDont.push(...block.items);
    } else {
      flush();
      merged.push(block);
    }
  }
  flush();
  return merged;
}

function SectionRenderer({section}: {section: ReferenceSection}) {
  const mergedContent = useMemo(() => mergeDosDonts(section.content), [section.content]);

  return (
    <XDSVStack gap={4}>
      <XDSHeading
        level={2}
        id={section.title.toLowerCase().replace(/\s+/g, '-')}
        xstyle={styles.sectionTitle}>
        {section.title}
      </XDSHeading>
      {mergedContent.map((block, i) => (
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

export function DocPreview({doc, version}: {doc: ReferenceDoc; version?: string}) {
  // Group sections into: token tables, usage/code, best practices, and other
  const {tokenSections, usageSections, practiceSections, overviewSections} =
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

      // Prepend the doc description into the first overview section
      const overview = [...other];
      if (overview.length > 0) {
        overview[0] = {
          ...overview[0],
          content: [
            {type: 'prose' as const, text: doc.description},
            ...overview[0].content,
          ],
        };
      } else {
        overview.push({
          title: 'Overview',
          content: [{type: 'prose' as const, text: doc.description}],
        });
      }

      const sortedTokens = [...token].sort((a, b) => {
        const aIsScale = a.title.toLowerCase().includes('type scale') ? 0 : 1;
        const bIsScale = b.title.toLowerCase().includes('type scale') ? 0 : 1;
        return aIsScale - bIsScale;
      });

      return {
        tokenSections: sortedTokens,
        usageSections: usage,
        practiceSections: practice,
        overviewSections: overview,
      };
    }, [doc.sections, doc.description]);

  return (
    <div {...stylex.props(styles.root)}>
      <XDSVStack gap={8}>
        {/* Title + Version */}
        <XDSVStack gap={1}>
          <XDSText type="display-1" as="h1">{doc.title}</XDSText>
          {version && (
            <XDSText type="supporting" color="secondary" xstyle={styles.version}>
              v{version}
            </XDSText>
          )}
        </XDSVStack>

        {/* Overview */}
        {overviewSections.map((section, i) => (
          <SectionRenderer key={`other-${i}`} section={section} />
        ))}

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

        {/* Token tables */}
        {tokenSections.length > 0 && (
          <>
            <XDSDivider />
            {tokenSections.map((section, i) => (
              <SectionRenderer key={`token-${i}`} section={section} />
            ))}
          </>
        )}
      </XDSVStack>
    </div>
  );
}
