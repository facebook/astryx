'use client';

import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSCard} from '@xds/core/Card';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';

export interface BlockDocMeta {
  aspectRatio: number;
  scale: number;
}

export function ShowcasePreview({children}: {children: React.ReactNode}) {
  return (
    <XDSCenter width="100%" height="100vh">
      <XDSCard variant="muted" style={{width: '100%', maxWidth: 968, height: 360}}>
        <XDSCenter width="100%" height="100%">
          {children}
        </XDSCenter>
      </XDSCard>
    </XDSCenter>
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
    <XDSCenter style={{flex: 1, overflow: 'auto', padding: 24, backgroundColor: 'var(--color-background-wash)'}}>
      <XDSVStack gap={2} style={{width: '100%', maxWidth: 600}}>
        <XDSCard padding={5} style={{overflow: 'hidden'}}>
          <XDSAspectRatio ratio={ar}>
            <XDSCenter
              width="100%"
              height="100%"
              style={{
                transform: scale !== 1 ? `scale(${scale})` : undefined,
                transformOrigin: 'center center',
              }}>
              {children}
            </XDSCenter>
          </XDSAspectRatio>
        </XDSCard>
        <XDSVStack gap={0} style={{textAlign: 'center'}}>
          <XDSText type="supporting" color="secondary">
            aspect-ratio:{' '}
            {ar === 1
              ? '1'
              : ar === 4 / 3
                ? '4/3'
                : ar === 16 / 9
                  ? '16/9'
                  : String(Math.round(ar * 1000) / 1000)}
            {' · '}scale: {scale}
          </XDSText>
          <XDSText type="supporting" color="secondary" size="xsm">
            Tweak aspectRatio and scale in the .doc.mjs file so the component
            fits nicely in this box.
          </XDSText>
        </XDSVStack>
      </XDSVStack>
    </XDSCenter>
  );
}
