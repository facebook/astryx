// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Heading, Text} from '@xds/core/Text';
import {VStack, HStack} from '@xds/core/Layout';
import {Section} from '@xds/core/Section';
import {Table, pixel} from '@xds/core/Table';
import {Badge} from '@xds/core/Badge';
import {Divider} from '@xds/core';
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
    <VStack gap={1} style={{paddingBlock: 8}}>
      <HStack gap={1} vAlign="center">
        <Text type="code" weight="bold">
          {param.name}
        </Text>
        {param.required && <Badge label="required" variant="info" />}
      </HStack>
      <Text type="code" color="secondary">
        {formatParamType(param.type, param.default)}
      </Text>
      {param.description && (
        <MarkdownText type="body" color="secondary">
          {param.description}
        </MarkdownText>
      )}
    </VStack>
  );
}

function ReturnRowMobile({ret}: {ret: HookReturnDoc}) {
  return (
    <VStack gap={1} style={{paddingBlock: 8}}>
      <Text type="code" weight="bold">
        {ret.name}
      </Text>
      <Text type="code" color="secondary">
        {ret.type}
      </Text>
      {ret.description && (
        <MarkdownText type="body" color="secondary">
          {ret.description}
        </MarkdownText>
      )}
    </VStack>
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
    <VStack gap={6}>
      {params.length > 0 && (
        <Section>
          <VStack gap={2}>
            <Heading level={3}>Parameters</Heading>
            {isMobile ? (
              params.map(p => (
                <div key={p.name}>
                  <Divider />
                  <ParamRowMobile param={p} />
                </div>
              ))
            ) : (
              <Table
                data={paramData}
                columns={[
                  {
                    key: 'name',
                    header: 'Param',
                    width: pixel(240),
                    renderCell: (item: Record<string, unknown>) => (
                      <HStack
                        gap={1}
                        vAlign="center"
                        style={{whiteSpace: 'nowrap'}}>
                        <Text type="code" weight="bold">
                          {item.name as string}
                        </Text>
                        {item.required === true && (
                          <Badge label="required" variant="info" />
                        )}
                      </HStack>
                    ),
                  },
                  {
                    key: 'type',
                    header: 'Type',
                    width: pixel(240),
                    renderCell: (item: Record<string, unknown>) => (
                      <Text type="code" color="secondary">
                        {item.type as string}
                      </Text>
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
          </VStack>
        </Section>
      )}
      {returns.length > 0 && (
        <Section>
          <VStack gap={2}>
            <Heading level={3}>Returns</Heading>
            {isMobile ? (
              returns.map(r => (
                <div key={r.name}>
                  <Divider />
                  <ReturnRowMobile ret={r} />
                </div>
              ))
            ) : (
              <Table
                data={returnData}
                columns={[
                  {
                    key: 'name',
                    header: 'Field',
                    width: pixel(220),
                    renderCell: (item: Record<string, unknown>) => (
                      <Text
                        type="code"
                        weight="bold"
                        style={{whiteSpace: 'nowrap'}}>
                        {item.name as string}
                      </Text>
                    ),
                  },
                  {
                    key: 'type',
                    header: 'Type',
                    width: pixel(240),
                    renderCell: (item: Record<string, unknown>) => (
                      <Text type="code" color="secondary">
                        {item.type as string}
                      </Text>
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
          </VStack>
        </Section>
      )}
    </VStack>
  );
}
