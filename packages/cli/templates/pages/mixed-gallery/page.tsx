'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';

// ─── Gallery Data ───────────────────────────────────────────────────────────

const IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
];

const radius = 'var(--radius-element, 8px)';
const gap = 16;

const imgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: radius,
  display: 'block',
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MixedGalleryTemplate() {
  return (
    <XDSAppShell height="auto" contentPadding={0} variant="surface">
      <XDSCenter axis="horizontal">
        <div style={{maxWidth: 1400, width: '100%', padding: '48px 24px 64px'}}>
          <XDSVStack gap={8}>
            {/* Header */}
            <XDSVStack
              gap={2}
              style={{alignItems: 'center', textAlign: 'center'}}>
              <XDSText
                type="large"
                weight="bold"
                as="p"
                style={{fontSize: 'var(--font-size-2xl)'}}>
                Make every day a little more delightful, one small detail at a
                time.
              </XDSText>
              <XDSText type="body">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua ut
                enim ad minim excepteur sint occaecat cupidatat non proident.
              </XDSText>
            </XDSVStack>

            {/* Gallery grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: 'auto auto',
                gap,
              }}>
              {/* ── Top row ── */}
              <div style={{display: 'grid', gridTemplateRows: '1fr', aspectRatio: '1 / 1'}}>
                <img src={IMAGES[0]} alt="" style={imgStyle} />
              </div>

              <div style={{display: 'grid', gridTemplateRows: '1fr 1fr', gap}}>
                {/* Top rectangle */}
                <div>
                  <img src={IMAGES[1]} alt="" style={imgStyle} />
                </div>
                {/* Two bottom squares */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap}}>
                  <img src={IMAGES[2]} alt="" style={imgStyle} />
                  <img src={IMAGES[3]} alt="" style={imgStyle} />
                </div>
              </div>

              {/* ── Bottom row: two equal rectangles ── */}
              <img src={IMAGES[4]} alt="" style={{...imgStyle, aspectRatio: '3 / 2'}} />
              <img src={IMAGES[5]} alt="" style={{...imgStyle, aspectRatio: '3 / 2'}} />
            </div>
          </XDSVStack>
        </div>
      </XDSCenter>
    </XDSAppShell>
  );
}
