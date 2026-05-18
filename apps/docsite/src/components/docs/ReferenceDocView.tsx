// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {ContentBlockRenderer} from './ContentBlockRenderer';
import {BestPracticesBlock} from './BestPracticesBlock';
import type {DocSection} from '../../generated/docsRegistry';
import type {ReactNode} from 'react';

const styles = stylex.create({
  container: {maxWidth: 1200, marginInline: 'auto'},
  prose: {maxWidth: 800},
});

export type SectionOverrides = Record<
  string,
  (section: DocSection) => ReactNode
>;

function isBestPracticesSection(section: DocSection): boolean {
  return section.content.every(
    b => b.type === 'list' && (b.style === 'do' || b.style === 'dont'),
  );
}

function BestPracticesSection({section}: {section: DocSection}) {
  const items: {guidance: boolean; description: string}[] = [];
  for (const block of section.content) {
    if (
      block.type === 'list' &&
      (block.style === 'do' || block.style === 'dont')
    ) {
      const isDo = block.style === 'do';
      for (const item of block.items ?? []) {
        items.push({guidance: isDo, description: item});
      }
    }
  }
  return (
    <XDSVStack gap={4}>
      <XDSText type="display-3">{section.title}</XDSText>
      <BestPracticesBlock items={items} />
    </XDSVStack>
  );
}

export function ReferenceDocView({
  title,
  description,
  sections,
  sectionOverrides,
}: {
  title: string;
  description: string;
  sections: DocSection[];
  sectionOverrides?: SectionOverrides;
}) {
  return (
    <XDSVStack gap={8} xstyle={styles.container}>
      <XDSVStack gap={2}>
        <XDSText type="display-2">{title}</XDSText>
        <XDSText type="body" color="secondary" xstyle={styles.prose}>
          {description}
        </XDSText>
      </XDSVStack>
      {sections.map(section => {
        const override = sectionOverrides?.[section.title];
        return (
          <XDSSection key={section.title}>
            {override ? (
              override(section)
            ) : isBestPracticesSection(section) ? (
              <BestPracticesSection section={section} />
            ) : (
              <XDSVStack gap={4}>
                <XDSText type="display-3">{section.title}</XDSText>
                {section.content.map((block, i) => (
                  <ContentBlockRenderer key={i} block={block} />
                ))}
              </XDSVStack>
            )}
          </XDSSection>
        );
      })}
    </XDSVStack>
  );
}
