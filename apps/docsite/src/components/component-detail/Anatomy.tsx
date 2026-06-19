// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Heading} from '@xds/core/Text';
import {VStack} from '@xds/core/Layout';
import {Section} from '@xds/core/Section';
import {Table, pixel} from '@xds/core/Table';
import {Badge} from '@xds/core/Badge';
import type {AnatomyElement} from '../../generated/componentRegistry';
import {MarkdownText} from '../MarkdownText';

interface AnatomyProps {
  elements: AnatomyElement[];
}

export function Anatomy({elements}: AnatomyProps) {
  if (elements.length === 0) {
    return null;
  }

  const data = elements.map(el => ({
    name: el.name as unknown,
    required: el.required as unknown,
    description: el.description as unknown,
  })) as Record<string, unknown>[];

  return (
    <Section>
      <VStack gap={2}>
        <Heading level={3}>Anatomy</Heading>
        <Table
          data={data}
          columns={[
            {
              key: 'name',
              header: 'Element',
              width: pixel(140),
            },
            {
              key: 'required',
              header: '',
              width: pixel(80),
              renderCell: (item: Record<string, unknown>) =>
                item.required === true ? (
                  <Badge label="required" variant="info" />
                ) : null,
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
      </VStack>
    </Section>
  );
}
