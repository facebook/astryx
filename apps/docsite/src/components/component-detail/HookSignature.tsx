'use client';

import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSTable, pixel} from '@xds/core/Table';
import {XDSBadge} from '@xds/core/Badge';
import type {
  HookParamDoc,
  HookReturnDoc,
} from '../../generated/componentRegistry';

interface HookSignatureProps {
  params: HookParamDoc[];
  returns: HookReturnDoc[];
}

function formatParamType(type: string, defaultValue?: string): string {
  if (defaultValue != null) {
    return `${type} (default: ${defaultValue})`;
  }
  return type;
}

export function HookSignature({params, returns}: HookSignatureProps) {
  const paramData = params.map(p => ({
    name: p.name as unknown,
    required: p.required as unknown,
    type: formatParamType(p.type, p.default) as unknown,
    description: (p.description ?? '') as unknown,
  })) as Record<string, unknown>[];

  const returnData = returns.map(r => ({
    name: r.name as unknown,
    type: r.type as unknown,
    description: (r.description ?? '') as unknown,
  })) as Record<string, unknown>[];

  return (
    <XDSVStack gap={6}>
      {params.length > 0 && (
        <XDSSection>
          <XDSVStack gap={2}>
            <XDSHeading level={3}>Parameters</XDSHeading>
            <XDSTable
              data={paramData}
              columns={[
                {
                  key: 'name',
                  header: 'Param',
                  width: pixel(160),
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
                {key: 'description', header: 'Description'},
              ]}
              density="spacious"
              dividers="rows"
            />
          </XDSVStack>
        </XDSSection>
      )}
      {returns.length > 0 && (
        <XDSSection>
          <XDSVStack gap={2}>
            <XDSHeading level={3}>Returns</XDSHeading>
            <XDSTable
              data={returnData}
              columns={[
                {
                  key: 'name',
                  header: 'Field',
                  width: pixel(160),
                  renderCell: (item: Record<string, unknown>) => (
                    <XDSText type="code" weight="bold">
                      {item.name as string}
                    </XDSText>
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
                {key: 'description', header: 'Description'},
              ]}
              density="spacious"
              dividers="rows"
            />
          </XDSVStack>
        </XDSSection>
      )}
    </XDSVStack>
  );
}
