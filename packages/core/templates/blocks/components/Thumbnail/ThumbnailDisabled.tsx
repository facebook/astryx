// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

// Inline same-origin data URI so the example is self-contained — see
// ThumbnailRemovable for why image-backed Thumbnails avoid cross-origin URLs.
const GOLDEN_SUNSET =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAkFBMVEX/+uv/7sj6tFr3sVn1r1nzrVjxq1jvqVftp1frpVbpo1bnoVXln1XjnVThm1TfmVPdl1PblVLZk1LXkVLVj1HTjVHRi1DPiVDNh0/LhU/Jg07HgU7Ff03DfU3Be0y/eUy9d0u7dUu5c0u2cEq0bkqybEmwakmuaEisZkiqZEeoYkemYEakXkaiXEVgLjQ8HCjaJlMkAAABI0lEQVR42u3Mx3qDMBSE0Z/03nsvdhxjcnn/twsYjISR5MUkO5+V9N2ZYUPEpogtEdsidkTsitgTsS/iQMShiCMRxyJORJyKOBNxLuJCxKWIKxHXIm5E3Iq4E3Ev4kHEo4gnEc8iXkS8inhLymrJBO8J2UIiw0dc5sRDfEbVRWr1o/pbMMWox9yz6zcLIzMbBTD2VaHu7fr1gjXGA3w5baj5+H0w6x09TDpdaP7rDZhn0sd3y89Y9fcHbPnoYdroZ2w6dQNmg6OHfG4QyrsBC8gdZpVQxtqF4M1mjepFURThTLNgMYsePxaX2WqY6D8GSm2grK2slbGBciHZ9hOE2smNpTuxenhieCdeH06E7qTqvYnImWTbbUSPlKL1wHrgTwZ+AWq+3H5MpRkwAAAAAElFTkSuQmCC';

export default function ThumbnailDisabled() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Enabled
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="center">
          <Thumbnail
            src={GOLDEN_SUNSET}
            alt="Golden sunset over mountains"
            label="golden-sunset.jpg"
            onRemove={() => {}}
          />
          <Thumbnail label="document.pdf" onRemove={() => {}} />
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Disabled
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="center">
          <Thumbnail
            src={GOLDEN_SUNSET}
            alt="Golden sunset over mountains"
            label="golden-sunset.jpg"
            onRemove={() => {}}
            isDisabled
          />
          <Thumbnail label="document.pdf" onRemove={() => {}} isDisabled />
        </Stack>
      </Stack>
    </Stack>
  );
}
