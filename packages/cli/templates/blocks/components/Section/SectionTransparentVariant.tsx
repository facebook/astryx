'use client';

import {XDSSection} from '@xds/core/Section';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';

export default function SectionTransparentVariant() {
  return (
    <XDSSection variant="transparent">
      <XDSLayout
        content={
          <XDSLayoutContent>Transparent background</XDSLayoutContent>
        }
      />
    </XDSSection>
  );
}
