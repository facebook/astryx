'use client';

import {XDSLink} from '@xds/core/Link';
import {XDSText} from '@xds/core/Text';

export default function LinkInlineWithText() {
  return (
    <XDSText type="body">
      Read the{' '}
      <XDSLink label="docs" href="/docs">
        documentation
      </XDSLink>{' '}
      for more info.
    </XDSText>
  );
}
