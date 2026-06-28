// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Stack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

// Inline data URI so the example is self-contained and same-origin — see
// ThumbnailRemovable for why image-backed Thumbnails avoid cross-origin URLs.
const SCENE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAACDElEQVR42u2Yy07CQBSGjxUfAiEsvOsrmBiNFwSDAqIrfQKfygAF8QJeqOAlGI1GHwBaLKIu1LUblx0XJEi4lLac0gzOZDY0Tb//7+GfOdO+H2EHaB42RSF0GyCEdgP0VwBYBVgGWAZYBVgG/vVODOwv1KMhti/5a39+XaSoqcCgO9DKz2c2icviiAK4s6n6Wm+4OI6gDocn0PadOTwBRCJHFII1nd6gxro7vUEsqGWrEBYXLQMuX0gX2OULoXCt3AdQ0Fa2Eiho+itAFMu6ABQ02j4gJ+K6wHIijsLthWUUbSMrxniN1GKMx4JyhADilPj2HiSeRyRiVqAyxUhURb0YieLiTMlAIRwBgKntrcaLNB1o8rths1cC/iRvo/RMHz/NU/xdaC9dwGwlEoK46Z3sjvSEIGJmYD8jVZ+7sTxhtvoqDue70EFWanx6yG2KjTpWpxU4vCyqkNYXx3HVq+CMZODo6lkLL7gw1rn0tix9BpLXsi52YH60E/UacVrPA6mcbEyBf063DV2s9hU4vil18iJTOXltdkT7/XpxaiE+uX1BSWFF0+rMsPptxnBcqz4PS32tPpW20jCuSQbS92WTdqKzuzIArEwPIeLqz8Tmqa9VjIj7y8D541vXujHh4RXvPEAIAGSe3oHO0W/nBkof30Dt4IDywQwwA8wAM8AMMAPMADPADDAD1o1fMFhlmPil7jgAAAAASUVORK5CYII=';

export default function ThumbnailStates() {
  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Lifecycle: empty → uploading → processing → loaded
        </Text>
        <Stack direction="horizontal" gap={3} vAlign="end">
          <Stack direction="vertical" gap={1} hAlign="center">
            <Thumbnail label="report.pdf" />
            <Text type="supporting" color="secondary">
              Placeholder
            </Text>
          </Stack>
          <Stack direction="vertical" gap={1} hAlign="center">
            <Thumbnail isLoading label="uploading.jpg" />
            <Text type="supporting" color="secondary">
              Skeleton
            </Text>
          </Stack>
          <Stack direction="vertical" gap={1} hAlign="center">
            <Thumbnail
              src={SCENE}
              alt="Mountain landscape"
              isLoading
              label="landscape.jpg"
            />
            <Text type="supporting" color="secondary">
              Uploading
            </Text>
          </Stack>
          <Stack direction="vertical" gap={1} hAlign="center">
            <Thumbnail
              src={SCENE}
              alt="Mountain landscape"
              label="landscape.jpg"
            />
            <Text type="supporting" color="secondary">
              Loaded
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
