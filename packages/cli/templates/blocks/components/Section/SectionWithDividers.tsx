'use client';

import {XDSSection} from '@xds/core/Section';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';

export default function SectionWithDividers() {
  return (
    <XDSSection variant="section" dividers={['top', 'bottom']}>
      <XDSLayout
        content={
          <XDSLayoutContent>
            Section with top and bottom borders
          </XDSLayoutContent>
        }
      />
    </XDSSection>
  );
}
