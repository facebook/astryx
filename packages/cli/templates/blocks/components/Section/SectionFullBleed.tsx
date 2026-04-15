'use client';

import {XDSSection} from '@xds/core/Section';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';

export default function SectionFullBleed() {
  return (
    <XDSSection variant="wash" padding={0}>
      <XDSLayout
        content={
          <XDSLayoutContent>Edge-to-edge content</XDSLayoutContent>
        }
      />
    </XDSSection>
  );
}
