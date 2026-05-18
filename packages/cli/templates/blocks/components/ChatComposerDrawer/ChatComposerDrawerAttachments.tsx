// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSChatComposer, XDSChatComposerDrawer} from '@xds/core/Chat';
import {XDSToken} from '@xds/core/Token';
import {XDSThumbnail} from '@xds/core/Thumbnail';
import {XDSCarousel} from '@xds/core/Carousel';
import {XDSStack} from '@xds/core/Layout';

const IMAGE_ATTACHMENTS = [
  {
    id: '1',
    src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-1.jpg',
    alt: 'River through a valley',
    label: 'valley.jpg',
  },
  {
    id: '2',
    src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-2.jpg',
    alt: 'Foggy mountain peak',
    label: 'mountain.jpg',
  },
  {
    id: '3',
    src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-3.jpg',
    alt: 'Golden retriever puppy',
    label: 'puppy.jpg',
  },
  {
    id: '4',
    src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-4.jpg',
    alt: 'Bridge at sunset',
    label: 'bridge.jpg',
  },
  {
    id: '5',
    src: 'https://lookaside.facebook.com/assets/xds_oss/illustrative-vertical-5.jpg',
    alt: 'Lakeside at dusk',
    label: 'lakeside.jpg',
  },
];

export default function ChatComposerDrawerAttachments() {
  return (
    <XDSStack direction="vertical" gap={4} width={480}>
      <XDSChatComposer
        onSubmit={() => {}}
        drawer={
          <XDSChatComposerDrawer>
            <XDSStack direction="vertical" gap={2} width="100%">
              <XDSCarousel gap={1}>
                {IMAGE_ATTACHMENTS.map(img => (
                  <XDSThumbnail
                    key={img.id}
                    src={img.src}
                    alt={img.alt}
                    label={img.label}
                    onRemove={() => {}}
                  />
                ))}
              </XDSCarousel>
              <XDSStack direction="horizontal" gap={1} wrap="wrap">
                <XDSToken label="quarterly-report.pdf" onRemove={() => {}} />
                <XDSToken label="budget-forecast.xlsx" onRemove={() => {}} />
              </XDSStack>
            </XDSStack>
          </XDSChatComposerDrawer>
        }
      />
    </XDSStack>
  );
}
