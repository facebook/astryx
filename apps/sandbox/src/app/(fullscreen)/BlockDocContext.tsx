'use client';

import {XDSText} from '@xds/core/Text';

export interface BlockDocMeta {
  aspectRatio: number;
  scale: number;
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
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: 'var(--color-background-wash)',
      }}>
      <div style={{width: '100%', maxWidth: 600}}>
        <div
          style={{
            width: '100%',
            aspectRatio: String(ar),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            backgroundColor: 'var(--color-background-card)',
            padding: 24,
            overflow: 'hidden',
          }}>
          <div
            style={{
              transform: scale !== 1 ? `scale(${scale})` : undefined,
              transformOrigin: 'center center',
            }}>
            {children}
          </div>
        </div>
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            textAlign: 'center',
          }}>
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
        </div>
      </div>
    </div>
  );
}
