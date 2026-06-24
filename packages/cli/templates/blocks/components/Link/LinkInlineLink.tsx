// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Link} from '@astryxdesign/core/Link';
import {Text} from '@astryxdesign/core/Text';

export default function LinkInlineLink() {
  return (
    <Text type="body">Read the{' '}
      <Link href="#">
        documentation
      </Link>{' '}for more information about using Astryx components.
          </Text>
  );
}
