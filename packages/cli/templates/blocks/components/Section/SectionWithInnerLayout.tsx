'use client';

import {XDSSection} from '@xds/core/Section';
import {XDSHStack} from '@xds/core/Layout';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';

export default function SectionWithInnerLayout() {
  return (
    <XDSSection variant="wash" width={350} height={250}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <h3 style={{margin: 0}}>Section with Layout</h3>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <p style={{margin: 0, fontSize: 14, color: 'var(--color-text-secondary)'}}>
              When using XDSLayout, the layout manages its own padding
              independently from the container padding.
            </p>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap={2} hAlign="end">
              <XDSButton label="Action" variant="primary">
                Action
              </XDSButton>
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSSection>
  );
}
