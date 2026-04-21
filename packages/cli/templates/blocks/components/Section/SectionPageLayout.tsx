'use client';

import {XDSSection} from '@xds/core/Section';
import {XDSVStack} from '@xds/core/Layout';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutPanel,
} from '@xds/core/Layout';

export default function SectionPageLayout() {
  return (
    <XDSSection variant="section" width={600} height={300}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSVStack gap={2}>
              <h2 style={{margin: 0}}>Page Header</h2>
              <p style={{margin: 0, fontSize: 14, color: 'var(--color-text-secondary)'}}>
                Welcome to the application
              </p>
            </XDSVStack>
          </XDSLayoutHeader>
        }
        start={
          <XDSLayoutPanel hasDivider width={150}>
            <h3 style={{margin: 0}}>Sidebar</h3>
          </XDSLayoutPanel>
        }
        content={
          <XDSLayoutContent>
            <XDSVStack gap={2}>
              <h3 style={{margin: 0}}>Main Content</h3>
              <p style={{margin: 0, fontSize: 14, color: 'var(--color-text-secondary)'}}>
                This demonstrates how XDSLayout can be used to create page
                layouts with header, sidebar, and content areas.
              </p>
            </XDSVStack>
          </XDSLayoutContent>
        }
      />
    </XDSSection>
  );
}
