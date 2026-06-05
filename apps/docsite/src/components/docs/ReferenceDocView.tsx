// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSHeading} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {ContentBlockRenderer} from './ContentBlockRenderer';
import {BestPracticesBlock} from './BestPracticesBlock';
import {DocPageLayout} from './DocPageLayout';
import type {DocSection} from '../../generated/docsRegistry';
import type {ReactNode} from 'react';

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
      <XDSHeading level={2} type="display-3">
        {section.title}
      </XDSHeading>
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
    <DocPageLayout title={title} description={description}>
      {sections.map(section => {
        const override = sectionOverrides?.[section.title];
        return (
          <XDSVStack gap={4} key={section.title}>
            {override ? (
              override(section)
            ) : isBestPracticesSection(section) ? (
              <BestPracticesSection section={section} />
            ) : (
              <>
                <XDSHeading level={2} type="display-3">
                  {section.title}
                </XDSHeading>
                {section.content.map((block, i) => (
                  <ContentBlockRenderer key={i} block={block} />
                ))}
              </>
            )}
          </XDSVStack>
        );
      })}
    </DocPageLayout>
  );
}
