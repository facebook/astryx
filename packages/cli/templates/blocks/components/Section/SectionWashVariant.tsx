'use client';

import {XDSSection} from '@xds/core/Section';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';

export default function SectionWashVariant() {
  return (
    <XDSSection variant="wash" width={300} height={250}>
      <XDSLayout
        content={<XDSLayoutContent>Content in wash section</XDSLayoutContent>}
      />
    </XDSSection>
  );
}
