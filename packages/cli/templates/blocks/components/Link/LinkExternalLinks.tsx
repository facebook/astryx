'use client';

import {XDSLink} from '@xds/core/Link';
import {XDSVStack} from '@xds/core/Layout';

export default function LinkExternalLinks() {
  return (
    <XDSVStack gap={2}>
      <XDSLink
        href="https://github.com"
        isExternalLink
        isStandalone>
        GitHub
      </XDSLink>
      <XDSLink
        href="https://developer.mozilla.org"
        isExternalLink
        isStandalone>
        MDN Web Docs
      </XDSLink>
      <XDSLink
        href="https://react.dev"
        isExternalLink
        hasUnderline
        isStandalone>
        React Documentation
      </XDSLink>
    </XDSVStack>
  );
}
