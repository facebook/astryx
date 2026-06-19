// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Link} from '@xds/core/Link';
import {Text} from '@xds/core/Text';

export default function LinkInlineLink() {
  return (
    <Text type="body">Read the{' '}
      <Link href="#">
        documentation
      </Link>{' '}for more information about using XDS components.
          </Text>
  );
}
