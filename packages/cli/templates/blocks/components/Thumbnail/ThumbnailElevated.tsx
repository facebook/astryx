// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

// Demo imagery is inlined as same-origin data URIs so the example is
// self-contained. Thumbnail's remove-button overlay uses useImageMode, which
// FETCHES the image to sample pixels (APCA) for contrast — a cross-origin CDN
// URL without CORS headers cannot be sampled, so contrast detection fails
// silently in hosted previews.
const NIGHT_FOREST =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAwFBMVEX18+H08uDy8d/y8N/v7t/m5NXl49Tk4tPc3NDX1cnW1cnW1cjW1MjV1MjV1MfR0cXIyLzEw7m8vLC3t68wM0QvM0MvM0IvMkIuMkEtMEErLz8iJjkhJTggJTcgJDcfJDYfIzYeIjUcITMbHzIWHiwYGzIXGjEWGjAWGTAVGS8VGC8UGC4UGC0UFy4TFy0TFywTFi0SFiwRFSsQFSkNFR4QFCoPFCkPFCgPEykOEygOEigNEicNEScMESYIDw8ECgr+gzZIAAABqElEQVR42uWQ61aCQBRGD5GylNBMKS9FZgNdNE0cyUvB+79VM8MoF9Fgplau2j/8nO8c9hqAD0ngDwjeJYH1lrfBWoCtYDboNu/Zv7qQYNap1bpCN1gxFh1dNe5WAsCScWqoWttbChAKvHZZ0W6XQoIFpW8ooFmLCG2Rl1BgaZAU5Ac8yg0RlC9nngCRQDFuhQRzinWmkCuYk3lxQoFrlskVqlcTMcEFvYIKoFbNfmEFuIypWaGGkt66tqZuEbjAHZl6SQVF1WqNvpDAHVktXTvR9JbgDZii1+tZI7cYMJXkCASvksB4L5VxHmAsibzgRRIYbjgfCgFDSeBZkh8W1HMIniSBR0mOQPCQA3RgBk4M5DhNZwdEcbKgLXy5iDiZg5gApRYbqTql2FZgMxAKeEWSNUFYx3s2SfU28HPWItrpySSwE2cEdqrYtxgmxgHGScFmHrAGk8SxczIxZnNC1McFOGshShyb4yxB9sI3CXDGnH0MLsD7F5LvvptEgH12Zg1Pn2WuHsjvrwt8308t+nwxT38sgiAE8/RTeagH+vx/F8SeF0Ja8Ak14ia/LgmpZQAAAABJRU5ErkJggg==';
const GOLDEN_SUNSET =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAkFBMVEX/+uv/7sj6tFr3sVn1r1nzrVjxq1jvqVftp1frpVbpo1bnoVXln1XjnVThm1TfmVPdl1PblVLZk1LXkVLVj1HTjVHRi1DPiVDNh0/LhU/Jg07HgU7Ff03DfU3Be0y/eUy9d0u7dUu5c0u2cEq0bkqybEmwakmuaEisZkiqZEeoYkemYEakXkaiXEVgLjQ8HCjaJlMkAAABI0lEQVR42u3Mx3qDMBSE0Z/03nsvdhxjcnn/twsYjISR5MUkO5+V9N2ZYUPEpogtEdsidkTsitgTsS/iQMShiCMRxyJORJyKOBNxLuJCxKWIKxHXIm5E3Iq4E3Ev4kHEo4gnEc8iXkS8inhLymrJBO8J2UIiw0dc5sRDfEbVRWr1o/pbMMWox9yz6zcLIzMbBTD2VaHu7fr1gjXGA3w5baj5+H0w6x09TDpdaP7rDZhn0sd3y89Y9fcHbPnoYdroZ2w6dQNmg6OHfG4QyrsBC8gdZpVQxtqF4M1mjepFURThTLNgMYsePxaX2WqY6D8GSm2grK2slbGBciHZ9hOE2smNpTuxenhieCdeH06E7qTqvYnImWTbbUSPlKL1wHrgTwZ+AWq+3H5MpRkwAAAAAElFTkSuQmCC';

export default function ThumbnailElevated() {
  return (
    <Stack direction="vertical" gap={3}>
      <Text type="supporting" color="secondary">
        Raised tiles — `elevation` lifts an image off the page at rest
      </Text>
      <Stack direction="horizontal" gap={3} vAlign="center">
        <Thumbnail src={NIGHT_FOREST} alt="Forest at night" elevation="low" />
        <Thumbnail src={GOLDEN_SUNSET} alt="Golden sunset" elevation="high" />
      </Stack>
    </Stack>
  );
}
