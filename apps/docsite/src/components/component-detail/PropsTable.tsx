// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSTable, pixel} from '@xds/core/Table';
import {XDSBadge} from '@xds/core/Badge';
import type {PropDoc} from '../../generated/componentRegistry';
import {MarkdownText} from '../MarkdownText';

function formatType(type: string, defaultValue?: string): string {
  if (defaultValue != null) {
    return `${type} (default: ${defaultValue})`;
  }
  return type;
}

interface PropsTableProps {
  props: PropDoc[];
  heading?: string;
}

export function PropsTable({props, heading}: PropsTableProps) {
  if (props.length === 0) {
    return null;
  }

  const required = props.filter(p => p.required);
  const optional = props.filter(p => !p.required);
  const sorted = [...required, ...optional];

  const data = sorted.map(prop => ({
    name: prop.name as unknown,
    required: prop.required as unknown,
    type: formatType(prop.type, prop.default) as unknown,
    description: (prop.description ?? '') as unknown,
  })) as Record<string, unknown>[];

  return (
    <XDSSection>
      <XDSVStack gap={2}>
        {heading && <XDSHeading level={4}>{heading}</XDSHeading>}
        <XDSTable
          data={data}
          columns={[
            {
              key: 'name',
              header: 'Prop',
              width: pixel(180),
              renderCell: (item: Record<string, unknown>) => (
                <XDSHStack gap={1} vAlign="center">
                  <XDSText type="code" weight="bold">
                    {item.name as string}
                  </XDSText>
                  {item.required === true && (
                    <XDSBadge label="required" variant="info" />
                  )}
                </XDSHStack>
              ),
            },
            {
              key: 'type',
              header: 'Type',
              width: pixel(240),
              renderCell: (item: Record<string, unknown>) => (
                <XDSText type="code" color="secondary">
                  {item.type as string}
                </XDSText>
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
      </XDSVStack>
    </XDSSection>
  );
}
