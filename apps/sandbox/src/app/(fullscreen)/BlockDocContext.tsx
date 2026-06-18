// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {AspectRatio} from '@xds/core/AspectRatio';
import {Card} from '@xds/core/Card';
import {Center} from '@xds/core/Center';
import {Text} from '@xds/core/Text';
import {VStack} from '@xds/core/Layout';

export interface BlockDocMeta {
  aspectRatio: number;
  scale: number;
}

export function ShowcasePreview({children}: {children: React.ReactNode}) {
  return (
    <Center width="100%" height="100vh">
      <Card
        variant="muted"
        style={{width: '100%', maxWidth: 968, height: 360}}>
        <Center width="100%" height="100%">
          {children}
        </Center>
      </Card>
    </Center>
  );
}

export function BlockPreview({
  meta,
  children,
}: {
  meta: BlockDocMeta;
  children: React.ReactNode;
}) {
  const ar = meta.aspectRatio;
  const scale = meta.scale;

  return (
    <Center style={{flex: 1, overflow: 'auto', padding: 24}}>
      <VStack gap={2} style={{width: '100%', maxWidth: 600}}>
        <div
          style={{
            border: '1px solid var(--color-border-emphasized)',
            borderRadius: 'var(--radius-container)',
            overflow: 'clip',
            padding: 0,
          }}>
          <AspectRatio ratio={ar}>
            <Center
              width="100%"
              height="100%"
              style={{
                transform: scale !== 1 ? `scale(${scale})` : undefined,
                transformOrigin: 'center center',
              }}>
              {children}
            </Center>
          </AspectRatio>
        </div>
        <VStack gap={0} style={{textAlign: 'center'}}>
          <Text type="supporting" color="secondary">
            aspect-ratio:{' '}
            {ar === 1
              ? '1'
              : ar === 4 / 3
                ? '4/3'
                : ar === 16 / 9
                  ? '16/9'
                  : String(Math.round(ar * 1000) / 1000)}
            {' · '}scale: {scale}
          </Text>
          <Text type="supporting" color="secondary" size="xsm">
            Tweak aspectRatio and scale in the .doc.mjs file so the component
            fits nicely in this box.
          </Text>
        </VStack>
      </VStack>
    </Center>
  );
}
