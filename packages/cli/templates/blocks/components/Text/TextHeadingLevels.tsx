// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Heading} from '@xds/core/Text';
import {Stack} from '@xds/core/Stack';

const LEVELS = [1, 2, 3, 4, 5, 6] as const;

export default function TextHeadingLevels() {
  return (
    <Stack direction="vertical" gap={3}>
      {LEVELS.map((level) => (
        <Heading key={level} level={level}>
          Heading {level}
        </Heading>
      ))}
    </Stack>
  );
}
