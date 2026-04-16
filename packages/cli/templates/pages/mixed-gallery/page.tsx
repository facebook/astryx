'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';
import {XDSText} from '@xds/core/Text';
import {XDSGrid} from '@xds/core/Grid';
import {XDSAspectRatio} from '@xds/core/AspectRatio';
import {XDSSection} from '@xds/core/Section';

const IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
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
      <XDSCenter axis="horizontal">
        <XDSSection
          variant="transparent"
          maxWidth={1400}
          width="100%"
          padding={6}>
          <XDSVStack gap={8}>
            {/* Header — capped width, centered */}
            <XDSCenter axis="horizontal">
              <XDSCenter width={680}>
                <XDSVStack gap={2} style={{textAlign: 'center'}}>
                  <XDSText
                    type="large"
                    weight="bold"
                    as="p"
                    style={{fontSize: 'var(--font-size-2xl)'}}>
                    Make every day a little more delightful, one small detail at
                    a time.
                  </XDSText>
                  <XDSText type="body">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua ut enim ad minim excepteur sint occaecat cupidatat
                    non proident.
                  </XDSText>
                </XDSVStack>
              </XDSCenter>
            </XDSCenter>

            {/* Gallery grid */}
            <XDSVStack gap={4}>
              {/* Top row: big square left + stacked right */}
              <XDSGrid columns={2} gap={4}>
                <XDSAspectRatio ratio={1}>
                  <img src={IMAGES[0]} alt="" style={imgStyle} />
                </XDSAspectRatio>
                <XDSVStack gap={4}>
                  <div style={{flex: 1}}>
                    <img
                      src={IMAGES[1]}
                      alt=""
                      style={{...imgStyle, height: '100%'}}
                    />
                  </div>
                  <XDSGrid columns={2} gap={4}>
                    <XDSAspectRatio ratio={1}>
                      <img src={IMAGES[2]} alt="" style={imgStyle} />
                    </XDSAspectRatio>
                    <XDSAspectRatio ratio={1}>
                      <img src={IMAGES[3]} alt="" style={imgStyle} />
                    </XDSAspectRatio>
                  </XDSGrid>
                </XDSVStack>
              </XDSGrid>

              {/* Bottom row: two equal rectangles */}
              <XDSGrid columns={2} gap={4}>
                <XDSAspectRatio ratio={3 / 2}>
                  <img src={IMAGES[4]} alt="" style={imgStyle} />
                </XDSAspectRatio>
                <XDSAspectRatio ratio={3 / 2}>
                  <img src={IMAGES[5]} alt="" style={imgStyle} />
                </XDSAspectRatio>
              </XDSGrid>
            </XDSVStack>
          </XDSVStack>
        </XDSSection>
      </XDSCenter>
    </XDSAppShell>
  );
}
