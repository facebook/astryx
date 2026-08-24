// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Fragment} from 'react';
import {Heading} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Layout';
import {Section} from '@astryxdesign/core/Section';
import {Table, pixel} from '@astryxdesign/core/Table';
import {Card} from '@astryxdesign/core/Card';
import type {AnatomyElement} from '../../generated/componentRegistry';
import {MarkdownText} from '../MarkdownText';
import {anatomyDescription, anatomyNameSegments} from './anatomyHelpers';

interface AnatomyProps {
  elements: AnatomyElement[];
}

export function Anatomy({elements}: AnatomyProps) {
  if (elements.length === 0) {
    return null;
  }

  const data = elements.map(el => ({
    name: el.name as unknown,
    description: anatomyDescription(el) as unknown,
  })) as Record<string, unknown>[];

  return (
    <Section>
      <VStack gap={4}>
        <Heading level={2} type="display-3">
          Anatomy
        </Heading>
        {/* Carded like the other tables on this page (BestPracticesBlock, the
            /docs TableBlock) rather than sitting bare on the page background. */}
        <Card variant="default">
          <Table
            data={data}
            columns={[
              {
                key: 'name',
                header: 'Element',
                width: pixel(140),
                renderCell: (item: Record<string, unknown>) =>
                  anatomyNameSegments(item.name as string).map(
                    (segment, index) => (
                      <Fragment key={index}>
                        {index > 0 ? <wbr /> : null}
                        {segment}
                      </Fragment>
                    ),
                  ),
              },
              {
                key: 'description',
                header: 'Description',
                renderCell: (item: Record<string, unknown>) => (
                  <MarkdownText type="body">
                    {item.description as string}
                  </MarkdownText>
                ),
              },
            ]}
            density="spacious"
            dividers="rows"
          />
        </Card>
      </VStack>
    </Section>
  );
}
