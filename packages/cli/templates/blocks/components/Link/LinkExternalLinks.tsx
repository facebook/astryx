'use client';

import {XDSLink} from '@xds/core/Link';
import {XDSVStack} from '@xds/core/Layout';

export default function LinkExternalLinks() {
  return (
    <XDSVStack gap={2}>
      <XDSLink
        label="GitHub"
        href="https://github.com"
        isExternalLink
        isStandalone>
        GitHub
      </XDSLink>
      <XDSLink
        label="MDN Web Docs"
        href="https://developer.mozilla.org"
        isExternalLink
        isStandalone>
        MDN Web Docs
      </XDSLink>
      <XDSLink
        label="React Documentation"
        href="https://react.dev"
        isExternalLink
        hasUnderline
        isStandalone>
        React Documentation
      </XDSLink>
    </XDSVStack>
  );
}
