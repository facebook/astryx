'use client';

import {XDSSection} from '@xds/core/Section';
import {XDSVStack} from '@xds/core/Layout';

export default function SectionSimpleContent() {
  return (
    <XDSSection variant="wash" width={320}>
      <XDSVStack gap={2}>
        <h3 style={{margin: 0}}>Section Title</h3>
        <p style={{margin: 0, fontSize: 14, color: 'var(--color-text-secondary)'}}>
          This section contains simple content without an inner layout. The
          container padding is applied automatically.
        </p>
      </XDSVStack>
    </XDSSection>
  );
}
