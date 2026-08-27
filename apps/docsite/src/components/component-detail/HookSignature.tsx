// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Heading, Text} from '@astryxdesign/core/Text';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Section} from '@astryxdesign/core/Section';
import {Table, pixel} from '@astryxdesign/core/Table';
import {Badge} from '@astryxdesign/core/Badge';
import {Divider} from '@astryxdesign/core';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import type {
  HookParamDoc,
  HookReturnDoc,
  TypeDefinition,
} from '../../generated/componentRegistry';
import {MarkdownText} from '../MarkdownText';
import {resolveTypeRefs, TypeRefText} from './TypeRefText';

interface HookSignatureProps {
  params: HookParamDoc[];
  returns: HookReturnDoc[];
  typeDefs: TypeDefinition[];
}

function formatParamType(type: string, defaultValue?: string): string {
  if (defaultValue != null) {
    return `${type} (default: ${defaultValue})`;
  }
  return type;
}

/**
 * Type text for a hook parameter or return field. When the documented type
 * references named types exported from the hook's package (e.g.
 * `ToastOptions`), each referenced name becomes an inline definition trigger
 * that opens the declaration — the same treatment the component props table
 * gives prop types (#2682). Rows with no resolved references stay plain text.
 */
function HookTypeText({
  type,
  typeRefs,
  defaultValue,
  typeDefs,
}: {
  type: string;
  typeRefs?: string[];
  defaultValue?: string;
  typeDefs: TypeDefinition[];
}) {
  const defs = resolveTypeRefs(typeRefs, typeDefs);
  if (defs.length === 0) {
    return <>{formatParamType(type, defaultValue)}</>;
  }
  return (
    <>
      <TypeRefText type={type} defs={defs} />
      {defaultValue != null && ` (default: ${defaultValue})`}
    </>
  );
}

function ParamRowMobile({
  param,
  typeDefs,
}: {
  param: HookParamDoc;
  typeDefs: TypeDefinition[];
}) {
  return (
    <VStack gap={1} style={{paddingBlock: 8}}>
      <HStack gap={1} vAlign="center">
        <Text type="code" weight="bold">
          {param.name}
        </Text>
        {param.required && <Badge label="required" variant="info" />}
      </HStack>
      <Text type="code" color="secondary">
        <HookTypeText
          type={param.type}
          typeRefs={param.typeRefs}
          defaultValue={param.default}
          typeDefs={typeDefs}
        />
      </Text>
      {param.description && (
        <MarkdownText type="body" color="secondary">
          {param.description}
        </MarkdownText>
      )}
    </VStack>
  );
}

function ReturnRowMobile({
  ret,
  typeDefs,
}: {
  ret: HookReturnDoc;
  typeDefs: TypeDefinition[];
}) {
  return (
    <VStack gap={1} style={{paddingBlock: 8}}>
      <Text type="code" weight="bold">
        {ret.name}
      </Text>
      <Text type="code" color="secondary">
        <HookTypeText
          type={ret.type}
          typeRefs={ret.typeRefs}
          typeDefs={typeDefs}
        />
      </Text>
      {ret.description && (
        <MarkdownText type="body" color="secondary">
          {ret.description}
        </MarkdownText>
      )}
    </VStack>
  );
}

export function HookSignature({params, returns, typeDefs}: HookSignatureProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const paramData = params.map(p => ({
    name: p.name as unknown,
    required: p.required as unknown,
    type: p.type as unknown,
    typeRefs: p.typeRefs as unknown,
    default: p.default as unknown,
    description: (p.description ?? '') as unknown,
  })) as Record<string, unknown>[];

  const returnData = returns.map(r => ({
    name: r.name as unknown,
    type: r.type as unknown,
    typeRefs: r.typeRefs as unknown,
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
                  <ParamRowMobile param={p} typeDefs={typeDefs} />
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
                        <HookTypeText
                          type={item.type as string}
                          typeRefs={item.typeRefs as string[] | undefined}
                          defaultValue={item.default as string | undefined}
                          typeDefs={typeDefs}
                        />
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
                  <ReturnRowMobile ret={r} typeDefs={typeDefs} />
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
                        <HookTypeText
                          type={item.type as string}
                          typeRefs={item.typeRefs as string[] | undefined}
                          typeDefs={typeDefs}
                        />
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
