'use client';

import {XDSLink} from '@xds/core/Link';
import {XDSText} from '@xds/core/Text';

export default function LinkInlineLink() {
  return (
    <XDSText type="body">
      Read the{' '}
      <XDSLink label="documentation" href="/docs">
        documentation
      </XDSLink>{' '}
      for more information about using XDS components.
    </XDSText>
  );
}
