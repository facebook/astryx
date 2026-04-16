'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack, XDSStackItem} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSSection} from '@xds/core/Section';
import {XDSGrid} from '@xds/core/Grid';

const IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
];

const imgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'var(--radius-element, 8px)',
  display: 'block',
  minHeight: 0,
};

export default function MixedGalleryTemplate() {
  return (
    <XDSAppShell height="fill" contentPadding={6} variant="surface">
      <XDSCenter axis="horizontal" height="100%">
        <XDSVStack
          gap={6}
          style={{maxWidth: 1400, width: '100%', height: '100%'}}>
          {/* Header */}
          <XDSCenter axis="horizontal">
            <XDSCenter width={680}>
              <XDSVStack gap={2} style={{textAlign: 'center'}}>
                <XDSText
                  type="large"
                  weight="bold"
                  as="p"
                  style={{fontSize: 'var(--font-size-2xl)'}}>
                  Make every day a little more delightful, one small detail at a
                  time.
                </XDSText>
                <XDSText type="body">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua
                  ut enim ad minim excepteur sint occaecat cupidatat non
                  proident.
                </XDSText>
              </XDSVStack>
            </XDSCenter>
          </XDSCenter>

          {/* Grid fills remaining space */}
          <XDSStackItem size="fill">
            <XDSGrid columns={3} gap={4} height="100%">
              {/* Left column */}
              <XDSVStack gap={4} style={{minHeight: 0}}>
                <XDSStackItem size="fill">
                  <img src={IMAGES[0]} alt="" style={imgStyle} />
                </XDSStackItem>
                <XDSStackItem size="fill">
                  <img src={IMAGES[1]} alt="" style={{...imgStyle, flex: 2}} />
                </XDSStackItem>
              </XDSVStack>

              {/* Center column — single tall image */}
              <img src={IMAGES[2]} alt="" style={imgStyle} />

              {/* Right column */}
              <XDSVStack gap={4} style={{minHeight: 0}}>
                <XDSStackItem size="fill">
                  <img src={IMAGES[3]} alt="" style={imgStyle} />
                </XDSStackItem>
                <XDSStackItem size="fill">
                  <img src={IMAGES[4]} alt="" style={imgStyle} />
                </XDSStackItem>
              </XDSVStack>
            </XDSGrid>
          </XDSStackItem>
        </XDSVStack>
      </XDSCenter>
    </XDSAppShell>
  );
}
