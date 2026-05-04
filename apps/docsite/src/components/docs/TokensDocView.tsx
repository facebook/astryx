'use client';

import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {useXDSTheme} from '@xds/core/theme';
import {
  ColorTokenTable,
  SpacingTokenTable,
  SizeTokenTable,
  RadiusTokenTable,
  BorderTokenTable,
  ElevationTokenTable,
  DurationTokenTable,
  EasingTokenTable,
  TypographyTokenTable,
  FontFamilyTokenTable,
  FontWeightTokenTable,
  FontSizeTokenTable,
} from '../tokens';
import {ReferenceDocView} from './ReferenceDocView';
import {ContentBlockRenderer} from './ContentBlockRenderer';
import type {DocSection} from '../../generated/docsRegistry';
import type {TokenTableProps} from '../tokens';
import type {ComponentType} from 'react';

// ---------------------------------------------------------------------------
// Map section titles to token table components per topic
// ---------------------------------------------------------------------------

type TableComponent = ComponentType<TokenTableProps>;

const TOPIC_SECTION_OVERRIDES: Record<
  string,
  Record<string, TableComponent>
> = {
  tokens: {
    'Color Tokens': ColorTokenTable,
    'Spacing Tokens': SpacingTokenTable,
    'Size Tokens': SizeTokenTable,
    'Border Tokens': BorderTokenTable,
    'Radius Tokens': RadiusTokenTable,
    'Shadow Tokens': ElevationTokenTable,
    'Duration Tokens': DurationTokenTable,
    'Easing Tokens': EasingTokenTable,
    'Font Family Tokens': FontFamilyTokenTable,
    'Font Size Tokens': FontSizeTokenTable,
    'Font Weight Tokens': FontWeightTokenTable,
    'Type Scale Tokens': TypographyTokenTable,
  },
  color: {
    'Surface Colors': ColorTokenTable,
  },
  elevation: {
    'Elevation Scale': ElevationTokenTable,
  },
  motion: {
    Duration: DurationTokenTable,
    Easing: EasingTokenTable,
  },
  shape: {
    'Radius Scale': RadiusTokenTable,
  },
  spacing: {
    Scale: SpacingTokenTable,
  },
  typography: {
    'Font Families': FontFamilyTokenTable,
    'Font Sizes': FontSizeTokenTable,
    'Font Weights': FontWeightTokenTable,
    'Type Scale': TypographyTokenTable,
  },
};

// ---------------------------------------------------------------------------
// TokenSection — renders prose blocks from the section + the table component
// ---------------------------------------------------------------------------

function TokenSection({
  section,
  Table,
  theme,
}: {
  section: DocSection;
  Table: TableComponent;
  theme: TokenTableProps['theme'];
}) {
  const prose = section.content.filter(block => block.type !== 'table');
  return (
    <XDSVStack gap={4}>
      <XDSText type="display-3">{section.title}</XDSText>
      {prose.map((block, i) => (
        <ContentBlockRenderer key={i} block={block} />
      ))}
      <Table theme={theme} />
    </XDSVStack>
  );
}

// ---------------------------------------------------------------------------
// TokensDocView
// ---------------------------------------------------------------------------

export function TokensDocView({
  title,
  description,
  sections,
  topic,
}: {
  title: string;
  description: string;
  sections: DocSection[];
  topic: string;
}) {
  const theme = useXDSTheme();
  const overrideMap = TOPIC_SECTION_OVERRIDES[topic] ?? {};

  const sectionOverrides: Record<
    string,
    (section: DocSection) => React.ReactNode
  > = {};
  for (const [sectionTitle, Table] of Object.entries(overrideMap)) {
    sectionOverrides[sectionTitle] = (section: DocSection) => (
      <TokenSection section={section} Table={Table} theme={theme} />
    );
  }

  return (
    <ReferenceDocView
      title={title}
      description={description}
      sections={sections}
      sectionOverrides={sectionOverrides}
    />
  );
}
