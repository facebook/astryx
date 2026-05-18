// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSDivider} from '@xds/core/Divider';
import type {XDSDefinedTheme} from '@xds/core/theme';
import type {ReferenceDoc, ReferenceSection} from '@xds/core';
import {SectionRenderer} from './SectionRenderer';
import {
  ColorTokenTable,
  SpacingTokenTable,
  TypographyTokenTable,
  ElevationTokenTable,
  ShapeTokenTable,
  MotionTokenTable,
} from './token-tables';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    maxWidth: 960,
    margin: '0 auto',
    padding: 32,
  },
  version: {
    fontFamily: 'var(--font-family-code)',
  },
});

// =============================================================================
// Token table routing
// =============================================================================

const TOKEN_TABLE_BY_CATEGORY: Record<
  string,
  React.ComponentType<{theme: XDSDefinedTheme}>
> = {
  color: ColorTokenTable,
  spacing: SpacingTokenTable,
  typography: TypographyTokenTable,
  shadow: ElevationTokenTable,
  radius: ShapeTokenTable,
  duration: MotionTokenTable,
  easing: MotionTokenTable,
  motion: MotionTokenTable,
};

function ThemeTokenSection({
  category,
  theme,
}: {
  category: string;
  theme: XDSDefinedTheme;
}) {
  const Component = TOKEN_TABLE_BY_CATEGORY[category];
  if (!Component) return null;
  return <Component theme={theme} />;
}

// =============================================================================
// DocPreview
// =============================================================================

export function DocPreview({
  doc,
  version,
  theme,
}: {
  doc: ReferenceDoc;
  version?: string;
  theme: XDSDefinedTheme;
}) {
  const {usageSections, practiceSections, overviewSections} = useMemo(() => {
    const usage: ReferenceSection[] = [];
    const practice: ReferenceSection[] = [];
    const other: ReferenceSection[] = [];

    for (const section of doc.sections) {
      const titleLower = section.title.toLowerCase();
      if (
        section.previewType ||
        section.content.some(b => b.type === 'table')
      ) {
        // Token sections — handled by ThemeTokenSection, skip
        continue;
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

    return {
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
          <XDSText type="display-1" as="h1">
            {doc.title}
          </XDSText>
          {version && (
            <XDSText
              type="supporting"
              color="secondary"
              xstyle={styles.version}>
              v{version}
            </XDSText>
          )}
        </XDSVStack>

        {/* Overview */}
        {overviewSections.map((section, i) => (
          <SectionRenderer key={`overview-${i}`} section={section} />
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
        {doc.tokenCategory && (
          <>
            <XDSDivider />
            <ThemeTokenSection
              category={doc.tokenCategory}
              theme={theme}
            />
          </>
        )}
      </XDSVStack>
    </div>
  );
}
