// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSTable, pixel} from '@xds/core/Table';
import {XDSBadge} from '@xds/core/Badge';
import {XDSDivider} from '@xds/core';
import {useMediaQuery} from '@xds/core/hooks';
import type {
  HookParamDoc,
  HookReturnDoc,
} from '../../generated/componentRegistry';
import {MarkdownText} from '../MarkdownText';

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

function ParamRowMobile({param}: {param: HookParamDoc}) {
  return (
    <XDSVStack gap={1} style={{paddingBlock: 8}}>
      <XDSHStack gap={1} vAlign="center">
        <XDSText type="code" weight="bold">
          {param.name}
        </XDSText>
        {param.required && <XDSBadge label="required" variant="info" />}
      </XDSHStack>
      <XDSText type="code" color="secondary">
        {formatParamType(param.type, param.default)}
      </XDSText>
      {param.description && (
        <MarkdownText type="body" color="secondary">
          {param.description}
        </MarkdownText>
      )}
    </XDSVStack>
  );
}

function ReturnRowMobile({ret}: {ret: HookReturnDoc}) {
  return (
    <XDSVStack gap={1} style={{paddingBlock: 8}}>
      <XDSText type="code" weight="bold">
        {ret.name}
      </XDSText>
      <XDSText type="code" color="secondary">
        {ret.type}
      </XDSText>
      {ret.description && (
        <MarkdownText type="body" color="secondary">
          {ret.description}
        </MarkdownText>
      )}
    </XDSVStack>
  );
}

export function HookSignature({params, returns}: HookSignatureProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

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
            {isMobile ? (
              params.map(p => (
                <div key={p.name}>
                  <XDSDivider />
                  <ParamRowMobile param={p} />
                </div>
              ))
            ) : (
              <XDSTable
                data={paramData}
                columns={[
                  {
                    key: 'name',
                    header: 'Param',
                    width: pixel(240),
                    renderCell: (item: Record<string, unknown>) => (
                      <XDSHStack
                        gap={1}
                        vAlign="center"
                        style={{whiteSpace: 'nowrap'}}>
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
            )}
          </XDSVStack>
        </XDSSection>
      )}
      {returns.length > 0 && (
        <XDSSection>
          <XDSVStack gap={2}>
            <XDSHeading level={3}>Returns</XDSHeading>
            {isMobile ? (
              returns.map(r => (
                <div key={r.name}>
                  <XDSDivider />
                  <ReturnRowMobile ret={r} />
                </div>
              ))
            ) : (
              <XDSTable
                data={returnData}
                columns={[
                  {
                    key: 'name',
                    header: 'Field',
                    width: pixel(220),
                    renderCell: (item: Record<string, unknown>) => (
                      <XDSText
                        type="code"
                        weight="bold"
                        style={{whiteSpace: 'nowrap'}}>
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
            )}
          </XDSVStack>
        </XDSSection>
      )}
    </XDSVStack>
  );
}
