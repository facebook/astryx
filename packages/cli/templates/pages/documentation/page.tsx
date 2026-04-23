'use client';

import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSHStack, XDSVStack, XDSStackItem} from '@xds/core/Stack';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DocumentationOverviewPage() {
  return (
    <XDSAppShell
      variant="section"
      height="fill"
      sideNav={
        <XDSSideNav
          header={
            <XDSSideNavHeading heading="Product Name" />
          }>
          <XDSSideNavSection title="Navigation" isHeaderHidden>
            <XDSSideNavItem label="Home" isSelected />
            <XDSSideNavItem label="Getting started" />
            <XDSSideNavItem label="Components" />
          </XDSSideNavSection>
        </XDSSideNav>
      }>
      <XDSLayout contentWidth={1200} content={
        <XDSLayoutContent padding={8}>
          <XDSVStack gap={10}>
            <XDSCard variant="cyan" padding={10}>
              <XDSHStack gap={8} vAlign="center">
                <XDSStackItem size="fill">
                  <XDSVStack gap={4}>
                    <XDSText type="display-1">Web overview</XDSText>
                    <XDSText type="large" weight="normal" color="secondary">
                      An open-source UI library to help developers quickly build
                      beautiful, accessible products.
                    </XDSText>
                    <XDSHStack>
                      <XDSButton
                        label="Get started"
                        variant="primary"
                        size="lg"
                      />
                    </XDSHStack>
                  </XDSVStack>
                </XDSStackItem>
                <XDSStackItem size="fill" />
              </XDSHStack>
            </XDSCard>
          </XDSVStack>
        </XDSLayoutContent>
      } />
    </XDSAppShell>
  );
}
