// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {VStack} from '@astryxdesign/core/Layout';
import type {OutlineItem} from '@astryxdesign/core/Outline';
import {AnchorHeading} from './AnchorHeading';
import {ContentBlockRenderer} from './ContentBlockRenderer';
import {BestPracticesBlock} from './BestPracticesBlock';
import {DocPageLayout} from './DocPageLayout';
import type {DocSection} from '../../generated/docsRegistry';
import type {ReactNode} from 'react';

export type SectionOverrides = Record<
  string,
  (section: DocSection, id: string) => ReactNode
>;

/** Slugify a section title into a stable, URL-safe anchor id. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build unique anchor ids for each section, deduping collisions by suffixing
 * an index so every outline link resolves to exactly one element.
 */
function buildSectionIds(sections: DocSection[]): string[] {
  const seen = new Map<string, number>();
  return sections.map(section => {
    const base = slugify(section.title) || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  });
}

function isBestPracticesSection(section: DocSection): boolean {
  return section.content.every(
    b => b.type === 'list' && (b.style === 'do' || b.style === 'dont'),
  );
}

function BestPracticesSection({
  section,
  id,
}: {
  section: DocSection;
  id: string;
}) {
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
    <VStack gap={4}>
      <AnchorHeading id={id} level={2} type="display-3">
        {section.title}
      </AnchorHeading>
      <BestPracticesBlock items={items} />
    </VStack>
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
  const sectionIds = buildSectionIds(sections);
  const outline: OutlineItem[] = sections.map((section, i) => ({
    id: sectionIds[i],
    label: section.title,
    level: 2,
  }));

  return (
    <DocPageLayout title={title} description={description} outline={outline}>
      {sections.map((section, i) => {
        const id = sectionIds[i];
        const override = sectionOverrides?.[section.title];
        return (
          <VStack gap={4} key={section.title}>
            {override ? (
              override(section, id)
            ) : isBestPracticesSection(section) ? (
              <BestPracticesSection section={section} id={id} />
            ) : (
              <>
                <AnchorHeading id={id} level={2} type="display-3">
                  {section.title}
                </AnchorHeading>
                {section.content.map((block, blockIndex) => (
                  <ContentBlockRenderer key={blockIndex} block={block} />
                ))}
              </>
            )}
          </VStack>
        );
      })}
    </DocPageLayout>
  );
}
