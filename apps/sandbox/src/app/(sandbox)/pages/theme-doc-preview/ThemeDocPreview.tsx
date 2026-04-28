'use client';

/**
 * ThemeDocPreview — Auto-generated theme documentation from a definedTheme object.
 *
 * Takes an XDSDefinedTheme and renders a full documentation page by introspecting
 * the theme's tokens, components, variants, typography, motion, and icons.
 *
 * No hand-written .doc.mjs files needed — everything comes from the theme itself.
 */

import {useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import type {XDSTextType, XDSHeadingLevel} from '@xds/core/Text';
import {XDSCard} from '@xds/core/Card';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSDivider} from '@xds/core/Divider';
import {XDSBadge} from '@xds/core/Badge';
import {XDSTable, pixel, proportional} from '@xds/core/Table';
import {XDSTheme, useXDSTheme} from '@xds/core/theme';
import type {XDSDefinedTheme, XDSComponentStyleMap} from '@xds/core/theme';

// =============================================================================
// Types
// =============================================================================

export interface ThemeDocPreviewProps {
  /** The theme to document */
  theme: XDSDefinedTheme;
  /** Brief description — typically from package.json `description` */
  description?: string;
  /** Package name — e.g. '@xds/theme-neutral' */
  packageName?: string;
  /** Package version */
  version?: string;
}

// =============================================================================
// Token categorization
// =============================================================================

interface TokenCategory {
  label: string;
  prefixes: string[];
  preview: 'swatch' | 'radius' | 'shadow' | 'spacing' | 'none';
}

const TOKEN_CATEGORIES: TokenCategory[] = [
  {label: 'Colors', prefixes: ['--color-'], preview: 'swatch'},
  {label: 'Radius', prefixes: ['--radius-'], preview: 'radius'},
  {label: 'Shadows', prefixes: ['--shadow-'], preview: 'shadow'},
  {label: 'Spacing', prefixes: ['--spacing-'], preview: 'spacing'},
  {label: 'Sizes', prefixes: ['--size-'], preview: 'spacing'},
  {label: 'Typography', prefixes: ['--font-', '--text-'], preview: 'none'},
  {
    label: 'Motion',
    prefixes: ['--duration-', '--ease-', '--transition-'],
    preview: 'none',
  },
];

interface TokenEntry {
  name: string;
  value: string;
  lightValue: string;
  darkValue: string;
  isOverride: boolean;
}

function categorizeTokens(theme: XDSDefinedTheme): Map<string, TokenEntry[]> {
  const result = new Map<string, TokenEntry[]>();
  const allTokens = theme.tokens;
  const inputTokens = theme.__inputTokens;

  const overrideKeys = new Set(inputTokens ? Object.keys(inputTokens) : []);

  for (const category of TOKEN_CATEGORIES) {
    const entries: TokenEntry[] = [];

    for (const [name, value] of Object.entries(allTokens)) {
      if (!category.prefixes.some(p => name.startsWith(p))) continue;

      let lightValue = value;
      let darkValue = value;
      const ldMatch = value.match(/^light-dark\(\s*(.+?)\s*,\s*(.+?)\s*\)$/);
      if (ldMatch) {
        lightValue = ldMatch[1];
        darkValue = ldMatch[2];
      }

      if (inputTokens?.[name] && Array.isArray(inputTokens[name])) {
        const tuple = inputTokens[name] as [string, string];
        lightValue = tuple[0];
        darkValue = tuple[1];
      }

      entries.push({
        name,
        value,
        lightValue,
        darkValue,
        isOverride: overrideKeys.has(name),
      });
    }

    entries.sort((a, b) => {
      if (a.isOverride !== b.isOverride) return a.isOverride ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    if (entries.length > 0) {
      result.set(category.label, entries);
    }
  }

  return result;
}

// =============================================================================
// Component override analysis
// =============================================================================

interface VariantOverride {
  key: string;
  label: string;
  properties: Array<{property: string; value: string}>;
}

interface ComponentOverride {
  component: string;
  variants: VariantOverride[];
}

function analyzeComponents(
  components?: XDSComponentStyleMap,
): ComponentOverride[] {
  if (!components) return [];

  const result: ComponentOverride[] = [];

  for (const [component, rules] of Object.entries(components)) {
    const variants: VariantOverride[] = [];

    for (const [key, overrides] of Object.entries(rules)) {
      const properties: Array<{property: string; value: string}> = [];

      for (const [prop, val] of Object.entries(overrides)) {
        if (typeof val === 'string') {
          properties.push({property: prop, value: val});
        } else if (typeof val === 'object') {
          for (const [pseudoProp, pseudoVal] of Object.entries(val)) {
            properties.push({
              property: `${prop} \u2192 ${pseudoProp}`,
              value: pseudoVal,
            });
          }
        }
      }

      if (properties.length > 0) {
        const label =
          key === 'base'
            ? 'Base'
            : key
                .split('+')
                .map(part => {
                  const [p, v] = part.split(':');
                  return `${p}: ${v}`;
                })
                .join(', ');

        variants.push({key, label, properties});
      }
    }

    if (variants.length > 0) {
      result.push({component, variants});
    }
  }

  return result.sort((a, b) => a.component.localeCompare(b.component));
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    maxWidth: 960,
    margin: '0 auto',
    padding: 32,
  },
  header: {
    paddingBottom: 8,
  },
  overrideIndicator: {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    marginInlineStart: 6,
    verticalAlign: 'middle',
  },
  tokenName: {
    fontFamily: 'var(--font-family-code)',
    fontSize: 12,
    fontWeight: 500,
  },
  tokenValue: {
    fontFamily: 'var(--font-family-code)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    maxWidth: 280,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  swatchPair: {
    display: 'flex',
    gap: 4,
  },
  swatchLight: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(0, 0, 0, 0.08)',
  },
  swatchDark: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1C1C1E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  swatchInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  singleSwatch: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: '1px solid var(--color-border)',
  },
  radiusBox: {
    width: 28,
    height: 28,
    border: '2px solid var(--color-accent)',
  },
  shadowBox: {
    width: 32,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'var(--color-background-surface)',
  },
  spacingBar: {
    minWidth: 2,
    maxWidth: 64,
    height: 12,
    borderRadius: 2,
    backgroundColor: 'var(--color-accent)',
    opacity: 0.6,
  },
  propName: {
    fontFamily: 'var(--font-family-code)',
    fontSize: 12,
  },
  propValue: {
    fontFamily: 'var(--font-family-code)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 8,
  },
  iconItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: 'var(--font-family-code)',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-background-surface)',
    border: '1px solid var(--color-border)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    lineHeight: 1,
  },
});

// =============================================================================
// Preview renderers
// =============================================================================

function ColorPreview({entry}: {entry: TokenEntry}) {
  if (entry.lightValue !== entry.darkValue) {
    return (
      <div {...stylex.props(styles.swatchPair)}>
        <div {...stylex.props(styles.swatchLight)}>
          <div
            {...stylex.props(styles.swatchInner)}
            style={{backgroundColor: entry.lightValue}}
          />
        </div>
        <div {...stylex.props(styles.swatchDark)}>
          <div
            {...stylex.props(styles.swatchInner)}
            style={{backgroundColor: entry.darkValue}}
          />
        </div>
      </div>
    );
  }
  return (
    <div
      {...stylex.props(styles.singleSwatch)}
      style={{backgroundColor: entry.value}}
    />
  );
}

function RadiusPreview({value}: {value: string}) {
  return (
    <div {...stylex.props(styles.radiusBox)} style={{borderRadius: value}} />
  );
}

function ShadowPreview({value}: {value: string}) {
  return <div {...stylex.props(styles.shadowBox)} style={{boxShadow: value}} />;
}

function SpacingPreview({value}: {value: string}) {
  return <div {...stylex.props(styles.spacingBar)} style={{width: value}} />;
}

// =============================================================================
// Type scale preview — rendered live within the theme
// =============================================================================

const HEADING_LEVELS: XDSHeadingLevel[] = [1, 2, 3, 4, 5, 6];
const TEXT_TYPES: XDSTextType[] = [
  'display-1',
  'display-2',
  'display-3',
  'large',
  'body',
  'label',
  'code',
  'supporting',
];

type TypeRow = Record<string, unknown> & {
  variant: string;
  size: string;
  weight: string;
  leading: string;
  sample: React.ReactNode;
};

function TypeScalePreview() {
  const {token} = useXDSTheme();

  const headingRows: TypeRow[] = HEADING_LEVELS.map(level => ({
    variant: `Heading ${level}`,
    size: token(`--text-heading-${level}-size`) ?? '\u2013',
    weight: token(`--text-heading-${level}-weight`) ?? '\u2013',
    leading: token(`--text-heading-${level}-leading`) ?? '\u2013',
    sample: <XDSHeading level={level}>The quick brown fox</XDSHeading>,
  }));

  const textRows: TypeRow[] = TEXT_TYPES.map(type => ({
    variant: type,
    size: token(`--text-${type}-size`) ?? '\u2013',
    weight: token(`--text-${type}-weight`) ?? '\u2013',
    leading: token(`--text-${type}-leading`) ?? '\u2013',
    sample: (
      <XDSText type={type}>The quick brown fox jumps over the lazy dog</XDSText>
    ),
  }));

  const typeColumns = [
    {
      key: 'variant',
      header: 'Variant',
      width: pixel(100),
      renderCell: (item: Record<string, unknown>) => (
        <XDSText type="code">{String(item.variant)}</XDSText>
      ),
    },
    {
      key: 'sample',
      header: 'Sample',
      width: proportional(1),
      renderCell: (item: Record<string, unknown>) =>
        (item as unknown as TypeRow).sample,
    },
    {
      key: 'size',
      header: 'Size',
      width: pixel(80),
      renderCell: (item: Record<string, unknown>) => (
        <XDSText type="code" color="secondary">
          {String(item.size)}
        </XDSText>
      ),
    },
    {
      key: 'weight',
      header: 'Weight',
      width: pixel(80),
      renderCell: (item: Record<string, unknown>) => (
        <XDSText type="code" color="secondary">
          {String(item.weight)}
        </XDSText>
      ),
    },
  ];

  return (
    <XDSVStack gap={4}>
      <XDSText type="label" color="secondary">
        Headings
      </XDSText>
      <XDSTable
        data={headingRows as Record<string, unknown>[]}
        columns={typeColumns}
      />
      <XDSText type="label" color="secondary">
        Text
      </XDSText>
      <XDSTable
        data={textRows as Record<string, unknown>[]}
        columns={typeColumns}
      />
    </XDSVStack>
  );
}

// =============================================================================
// Token section
// =============================================================================

function TokenSection({
  category,
  entries,
  preview,
}: {
  category: string;
  entries: TokenEntry[];
  preview: TokenCategory['preview'];
}) {
  const {token} = useXDSTheme();
  const hasPreview = preview !== 'none';
  const hasDualMode = entries.some(e => e.lightValue !== e.darkValue);
  const overrideCount = entries.filter(e => e.isOverride).length;

  const data = entries as unknown as Record<string, unknown>[];

  const previewColumn = hasPreview
    ? [
        {
          key: '_preview',
          header: '',
          width: pixel(hasDualMode && category === 'Colors' ? 72 : 40),
          renderCell: (item: Record<string, unknown>) => {
            const entry = item as unknown as TokenEntry;
            const liveValue = token(entry.name) ?? entry.value;
            switch (preview) {
              case 'swatch':
                return <ColorPreview entry={entry} />;
              case 'radius':
                return <RadiusPreview value={liveValue} />;
              case 'shadow':
                return <ShadowPreview value={liveValue} />;
              case 'spacing':
                return <SpacingPreview value={liveValue} />;
              default:
                return null;
            }
          },
        },
      ]
    : [];

  const nameColumn = {
    key: 'name',
    header: 'Token',
    width: proportional(1),
    renderCell: (item: Record<string, unknown>) => {
      const entry = item as unknown as TokenEntry;
      return (
        <XDSHStack gap={1} align="center">
          <span {...stylex.props(styles.tokenName)}>{entry.name}</span>
          {entry.isOverride && (
            <span {...stylex.props(styles.overrideIndicator)} />
          )}
        </XDSHStack>
      );
    },
  };

  const valueColumns =
    hasDualMode && category === 'Colors'
      ? [
          {
            key: 'lightValue',
            header: 'Light',
            width: pixel(200),
            renderCell: (item: Record<string, unknown>) => (
              <span {...stylex.props(styles.tokenValue)}>
                {String(item.lightValue ?? item.value)}
              </span>
            ),
          },
          {
            key: 'darkValue',
            header: 'Dark',
            width: pixel(200),
            renderCell: (item: Record<string, unknown>) => (
              <span {...stylex.props(styles.tokenValue)}>
                {String(item.darkValue ?? item.value)}
              </span>
            ),
          },
        ]
      : [
          {
            key: 'value',
            header: 'Value',
            width: pixel(280),
            renderCell: (item: Record<string, unknown>) => (
              <span {...stylex.props(styles.tokenValue)}>
                {String(item.value)}
              </span>
            ),
          },
        ];

  return (
    <XDSVStack gap={3}>
      <XDSHStack gap={2} align="center">
        <XDSHeading level={3}>{category}</XDSHeading>
        <XDSBadge label={`${entries.length}`} />
        {overrideCount > 0 && overrideCount < entries.length && (
          <XDSText type="supporting" color="secondary">
            {overrideCount} custom
          </XDSText>
        )}
      </XDSHStack>
      <XDSTable
        data={data}
        columns={[...previewColumn, nameColumn, ...valueColumns]}
        density="compact"
      />
    </XDSVStack>
  );
}

// =============================================================================
// Component overrides section
// =============================================================================

function ComponentOverridesSection({
  overrides,
}: {
  overrides: ComponentOverride[];
}) {
  if (overrides.length === 0) return null;

  return (
    <XDSVStack gap={4}>
      <XDSHStack gap={2} align="center">
        <XDSHeading level={2}>Component Overrides</XDSHeading>
        <XDSBadge label={`${overrides.length}`} />
      </XDSHStack>
      <XDSText color="secondary">
        Components with custom styling applied by this theme.
      </XDSText>

      {overrides.map(comp => (
        <XDSCard key={comp.component}>
          <XDSVStack gap={3}>
            <XDSHeading level={4}>{comp.component}</XDSHeading>
            {comp.variants.map(variant => (
              <XDSVStack key={variant.key} gap={2}>
                <XDSBadge label={variant.label} variant="neutral" />
                <XDSTable
                  data={
                    variant.properties as unknown as Record<string, unknown>[]
                  }
                  columns={[
                    {
                      key: 'property',
                      header: 'Property',
                      width: pixel(200),
                      renderCell: (item: Record<string, unknown>) => (
                        <span {...stylex.props(styles.propName)}>
                          {String(item.property)}
                        </span>
                      ),
                    },
                    {
                      key: 'value',
                      header: 'Value',
                      width: proportional(1),
                      renderCell: (item: Record<string, unknown>) => (
                        <span {...stylex.props(styles.propValue)}>
                          {String(item.value)}
                        </span>
                      ),
                    },
                  ]}
                />
              </XDSVStack>
            ))}
          </XDSVStack>
        </XDSCard>
      ))}
    </XDSVStack>
  );
}

// =============================================================================
// Icons section
// =============================================================================

function IconRegistrySection({
  icons,
}: {
  icons?: Partial<Record<string, unknown>>;
}) {
  if (!icons) return null;
  const iconNames = Object.keys(icons).sort();
  if (iconNames.length === 0) return null;

  return (
    <XDSVStack gap={3}>
      <XDSHStack gap={2} align="center">
        <XDSHeading level={2}>Icon Registry</XDSHeading>
        <XDSBadge label={`${iconNames.length}`} />
      </XDSHStack>
      <XDSText color="secondary">
        Icons registered by this theme, available via{' '}
        <XDSText type="code">{'<XDSIcon name="..." />'}</XDSText>.
      </XDSText>
      <div {...stylex.props(styles.iconGrid)}>
        {iconNames.map(name => (
          <div key={name} {...stylex.props(styles.iconItem)}>
            {name}
          </div>
        ))}
      </div>
    </XDSVStack>
  );
}

// =============================================================================
// Summary stats
// =============================================================================

function ThemeStats({
  tokensByCategory,
  overrides,
  iconCount,
  fontCount,
}: {
  tokensByCategory: Map<string, TokenEntry[]>;
  overrides: ComponentOverride[];
  iconCount: number;
  fontCount: number;
}) {
  let totalTokens = 0;
  let customTokens = 0;
  for (const entries of tokensByCategory.values()) {
    totalTokens += entries.length;
    customTokens += entries.filter(e => e.isOverride).length;
  }

  const stats = [
    {label: 'Tokens', value: totalTokens},
    {label: 'Custom', value: customTokens},
    {label: 'Components', value: overrides.length},
    {label: 'Icons', value: iconCount},
    ...(fontCount > 0 ? [{label: 'Fonts', value: fontCount}] : []),
  ];

  return (
    <div {...stylex.props(styles.statsGrid)}>
      {stats.map(stat => (
        <XDSCard key={stat.label}>
          <XDSVStack gap={1}>
            <div {...stylex.props(styles.statNumber)}>{stat.value}</div>
            <XDSText type="supporting" color="secondary">
              {stat.label}
            </XDSText>
          </XDSVStack>
        </XDSCard>
      ))}
    </div>
  );
}

// =============================================================================
// Usage code block
// =============================================================================

function UsageSection({
  theme,
  packageName,
}: {
  theme: XDSDefinedTheme;
  packageName?: string;
}) {
  const pkg = packageName ?? `@xds/theme-${theme.name}`;
  const exportName = `${theme.name}Theme`;

  const code = `import {XDSTheme} from '@xds/core';
import {${exportName}} from '${pkg}';

function App() {
  return (
    <XDSTheme theme={${exportName}}>
      <YourApp />
    </XDSTheme>
  );
}`;

  return (
    <XDSVStack gap={2}>
      <XDSHeading level={2}>Usage</XDSHeading>
      <XDSCodeBlock code={code} language="tsx" hasCopyButton />
    </XDSVStack>
  );
}

// =============================================================================
// Fonts section
// =============================================================================

function FontsSection({theme}: {theme: XDSDefinedTheme}) {
  if (!theme.fonts || theme.fonts.length === 0) return null;

  return (
    <XDSVStack gap={3}>
      <XDSHeading level={2}>Fonts</XDSHeading>
      <XDSTable
        data={theme.fonts as unknown as Record<string, unknown>[]}
        columns={[
          {
            key: 'family',
            header: 'Family',
            width: pixel(200),
            renderCell: (item: Record<string, unknown>) => (
              <XDSText type="code">{String(item.family)}</XDSText>
            ),
          },
          {
            key: 'url',
            header: 'URL',
            width: proportional(1),
            renderCell: (item: Record<string, unknown>) => (
              <span {...stylex.props(styles.tokenValue)}>
                {String(item.url)}
              </span>
            ),
          },
        ]}
      />
    </XDSVStack>
  );
}

// =============================================================================
// Main component
// =============================================================================

export function ThemeDocPreview({
  theme,
  description,
  packageName,
  version,
}: ThemeDocPreviewProps) {
  const tokensByCategory = useMemo(() => categorizeTokens(theme), [theme]);
  const overrides = useMemo(() => analyzeComponents(theme.components), [theme]);
  const iconCount = theme.icons ? Object.keys(theme.icons).length : 0;
  const fontCount = theme.fonts?.length ?? 0;

  const pkg = packageName ?? `@xds/theme-${theme.name}`;

  return (
    <XDSTheme theme={theme}>
      <div {...stylex.props(styles.root)}>
        <XDSVStack gap={8}>
          {/* Header */}
          <XDSVStack gap={2} xstyle={styles.header}>
            <XDSHStack gap={2} align="center">
              <XDSHeading level={1}>{theme.name} theme</XDSHeading>
              {version && <XDSBadge label={`v${version}`} variant="neutral" />}
            </XDSHStack>
            {description && (
              <XDSText type="large" color="secondary">
                {description}
              </XDSText>
            )}
            <XDSText type="code" color="secondary">
              {pkg}
            </XDSText>
          </XDSVStack>

          {/* Stats */}
          <ThemeStats
            tokensByCategory={tokensByCategory}
            overrides={overrides}
            iconCount={iconCount}
            fontCount={fontCount}
          />

          {/* Usage */}
          <UsageSection theme={theme} packageName={packageName} />

          <XDSDivider />

          {/* Typography rendered live */}
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Type Scale</XDSHeading>
            <XDSText color="secondary">
              Live type scale rendered within this theme.
            </XDSText>
            <TypeScalePreview />
          </XDSVStack>

          <XDSDivider />

          {/* Token sections */}
          {TOKEN_CATEGORIES.map(cat => {
            const entries = tokensByCategory.get(cat.label);
            if (!entries) return null;
            return (
              <TokenSection
                key={cat.label}
                category={cat.label}
                entries={entries}
                preview={cat.preview}
              />
            );
          })}

          <XDSDivider />

          {/* Component overrides */}
          <ComponentOverridesSection overrides={overrides} />

          {/* Fonts */}
          <FontsSection theme={theme} />

          {/* Icons */}
          <IconRegistrySection icons={theme.icons} />
        </XDSVStack>
      </div>
    </XDSTheme>
  );
}
