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

function uniqueSlug(
  value: string,
  seen: Map<string, number>,
  fallback: string,
): string {
  const base = slugify(value) || fallback;
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function normalizeHeadingLevel(level: number | undefined): 3 | 4 | 5 | 6 {
  return level === 4 || level === 5 || level === 6 ? level : 3;
}

/**
 * Build unique anchor ids for sections and nested heading blocks, deduping
 * collisions so every outline link resolves to exactly one element.
 */
function buildOutline(sections: DocSection[]): {
  sectionIds: string[];
  blockIds: Map<string, string>;
  outline: OutlineItem[];
} {
  const seen = new Map<string, number>();
  const sectionIds: string[] = [];
  const blockIds = new Map<string, string>();
  const outline: OutlineItem[] = [];

  sections.forEach((section, sectionIndex) => {
    const sectionId = uniqueSlug(section.title, seen, 'section');
    sectionIds.push(sectionId);
    outline.push({
      id: sectionId,
      label: section.title,
      level: 2,
    });

    section.content.forEach((block, blockIndex) => {
      if (block.type !== 'heading' || !block.text) {
        return;
      }
      const blockId = uniqueSlug(
        `${section.title} ${block.text}`,
        seen,
        `${sectionId}-heading`,
      );
      blockIds.set(`${sectionIndex}:${blockIndex}`, blockId);
      outline.push({
        id: blockId,
        label: block.text,
        level: normalizeHeadingLevel(block.level),
      });
    });
  });

  return {sectionIds, blockIds, outline};
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
  const {sectionIds, blockIds, outline} = buildOutline(sections);

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
                {section.content.map((block, blockIndex) => {
                  if (block.type === 'heading') {
                    const blockId = blockIds.get(`${i}:${blockIndex}`);
                    if (blockId != null) {
                      return (
                        <AnchorHeading
                          key={blockIndex}
                          id={blockId}
                          level={normalizeHeadingLevel(block.level)}>
                          {block.text ?? ''}
                        </AnchorHeading>
                      );
                    }
                  }
                  return (
                    <ContentBlockRenderer key={blockIndex} block={block} />
                  );
                })}
              </>
            )}
          </VStack>
        );
      })}
    </DocPageLayout>
  );
}
