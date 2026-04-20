'use client';

import {XDSLink} from '@xds/core/Link';

export default function LinkExternalLinks() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
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
    </div>
  );
}
