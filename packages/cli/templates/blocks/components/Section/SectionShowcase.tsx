'use client';

import {XDSSection} from '@xds/core/Section';

export default function SectionShowcase() {
  return (
    <XDSSection variant="section" width={300}>
      <p style={{margin: 0}}>
        A section with default padding. Sections define distinct areas within a
        page.
      </p>
    </XDSSection>
  );
}
