// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSHeading} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Stack';

const LEVELS = [1, 2, 3, 4, 5, 6] as const;

export default function TextHeadingLevels() {
  return (
    <XDSStack direction="vertical" gap={3}>
      {LEVELS.map((level) => (
        <XDSHeading key={level} level={level}>
          Heading {level}
        </XDSHeading>
      ))}
    </XDSStack>
  );
}
