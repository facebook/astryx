'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSSection} from '@xds/core/Section';

const IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
];

const imgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'var(--radius-element, 8px)',
  display: 'block',
};

export default function MixedGalleryTemplate() {
  return (
    <XDSAppShell height="auto" contentPadding={0} variant="surface">
      {/* Outer wrapper: exactly one viewport tall, no scroll */}
      <div style={{height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        <XDSCenter axis="horizontal" style={{flex: '0 0 auto'}}>
          <XDSSection variant="transparent" maxWidth={1400} width="100%" padding={6}>
            {/* Header */}
            <XDSCenter axis="horizontal">
              <XDSCenter width={680}>
                <XDSVStack gap={2} style={{textAlign: 'center'}}>
                  <XDSText type="large" weight="bold" as="p" style={{fontSize: 'var(--font-size-2xl)'}}>
                    Make every day a little more delightful, one small detail at a time.
                  </XDSText>
                  <XDSText type="body">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim excepteur sint occaecat cupidatat non proident.
                  </XDSText>
                </XDSVStack>
              </XDSCenter>
            </XDSCenter>
          </XDSSection>
        </XDSCenter>

        {/* Grid: fills remaining space exactly */}
        <XDSCenter axis="horizontal" style={{flex: '1 1 0', minHeight: 0}}>
          <XDSSection variant="transparent" maxWidth={1400} width="100%" padding={6} style={{height: '100%'}}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr 1fr',
                gridTemplateRows: '2fr 3fr',
                gap: 'var(--spacing-4, 16px)',
                height: '100%',
              }}>
              {/* Left column: short top, tall bottom */}
              <img src={IMAGES[0]} alt="" style={{...imgStyle, gridRow: '1 / 2'}} />
              <img src={IMAGES[1]} alt="" style={{...imgStyle, gridRow: '2 / 3'}} />

              {/* Center column: one tall image spanning both rows */}
              <img src={IMAGES[2]} alt="" style={{...imgStyle, gridRow: '1 / 3'}} />

              {/* Right column: stacked — short, medium, short */}
              <div
                style={{
                  gridRow: '1 / 3',
                  display: 'grid',
                  gridTemplateRows: '1fr 1.5fr 1fr',
                  gap: 'var(--spacing-4, 16px)',
                }}>
                <img src={IMAGES[3]} alt="" style={imgStyle} />
                <img src={IMAGES[4]} alt="" style={imgStyle} />
                <img src={IMAGES[5]} alt="" style={imgStyle} />
              </div>
            </div>
          </XDSSection>
        </XDSCenter>
      </div>
    </XDSAppShell>
  );
}
