// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSTheme} from '@astryxdesign/core';
import {neutralTheme} from '@astryxdesign/theme/neutral';
import {XDSAppShell} from '@astryxdesign/core/AppShell';
import {XDSTopNav, XDSTopNavHeading} from '@astryxdesign/core/TopNav';
import {
  XDSSideNav,
  XDSSideNavCollapseButton,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@astryxdesign/core/SideNav';
import {XDSLayout, XDSLayoutContent, XDSLayoutPanel} from '@astryxdesign/core/Layout';
import {XDSHeading} from '@astryxdesign/core/Text';
import {XDSText} from '@astryxdesign/core/Text';
import {XDSCard} from '@astryxdesign/core/Card';
import {XDSVStack, XDSHStack, XDSStackItem} from '@astryxdesign/core/Stack';
import {XDSBadge} from '@astryxdesign/core/Badge';
import {XDSButton} from '@astryxdesign/core/Button';
import {XDSDivider} from '@astryxdesign/core/Divider';
import {XDSMetadataList, XDSMetadataListItem} from '@astryxdesign/core/MetadataList';
import {XDSAvatar} from '@astryxdesign/core/Avatar';
import {XDSGrid} from '@astryxdesign/core/Grid';
import {XDSIcon} from '@astryxdesign/core/Icon';
import {XDSSection} from '@astryxdesign/core/Section';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

export default function AdminPanel() {
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(false);

  return (
    <XDSTheme theme={neutralTheme}>
      <XDSAppShell
        topNav={
          <XDSTopNav
            label="Admin navigation"
            heading={<XDSTopNavHeading heading="Admin Panel" />}
            endContent={
              <XDSHStack gap={2} vAlign="center">
                <XDSButton
                  label="Notifications"
                  variant="ghost"
                  icon={<XDSIcon icon={BellIcon} color="inherit" />}
                />
                <XDSAvatar name="Admin User" size="medium" />
              </XDSHStack>
            }
          />
        }
        sideNav={
          <XDSSideNav collapsible footerIcons={<XDSSideNavCollapseButton />}>
            <XDSSideNavSection title="Navigation" isHeaderHidden>
              <XDSSideNavItem
                label="Dashboard"
                icon={HomeIcon}
                isSelected
                href="/admin"
              />
              <XDSSideNavItem
                label="Users"
                icon={UsersIcon}
                href="/admin/users"
                endContent={<XDSBadge label="128" variant="neutral" />}
              />
              <XDSSideNavItem
                label="Content"
                icon={DocumentTextIcon}
                href="/admin/content"
              />
            </XDSSideNavSection>
            <XDSSideNavSection title="Management">
              <XDSSideNavItem
                label="Roles & Permissions"
                icon={ShieldCheckIcon}
                href="/admin/roles"
              />
              <XDSSideNavItem
                label="Audit Log"
                icon={ClipboardDocumentListIcon}
                href="/admin/audit"
              />
            </XDSSideNavSection>
            <XDSSideNavSection title="System">
              <XDSSideNavItem label="Settings" icon={Cog6ToothIcon} collapsible>
                <XDSSideNavItem
                  label="General"
                  href="/admin/settings/general"
                />
                <XDSSideNavItem
                  label="Security"
                  href="/admin/settings/security"
                />
                <XDSSideNavItem
                  label="Integrations"
                  href="/admin/settings/integrations"
                />
              </XDSSideNavItem>
            </XDSSideNavSection>
          </XDSSideNav>
        }
        isSideNavCollapsed={isSideNavCollapsed}
        onSideNavCollapsedChange={setIsSideNavCollapsed}>
        <XDSLayout
          content={
            <XDSLayoutContent label="Admin dashboard">
              <XDSSection padding={4}>
                <XDSVStack gap={6}>
                  <XDSVStack gap={2}>
                    <XDSHeading level={1}>Dashboard</XDSHeading>
                    <XDSText type="body" color="secondary">
                      Overview of your admin panel activity.
                    </XDSText>
                  </XDSVStack>

                  <XDSGrid columns={3} gap={4}>
                    <XDSCard padding={4}>
                      <XDSVStack gap={2}>
                        <XDSText type="label" color="secondary">
                          Total Users
                        </XDSText>
                        <XDSHeading level={2}>1,284</XDSHeading>
                        <XDSBadge label="+12% this month" variant="success" />
                      </XDSVStack>
                    </XDSCard>
                    <XDSCard padding={4}>
                      <XDSVStack gap={2}>
                        <XDSText type="label" color="secondary">
                          Active Sessions
                        </XDSText>
                        <XDSHeading level={2}>342</XDSHeading>
                        <XDSBadge label="Live" variant="info" />
                      </XDSVStack>
                    </XDSCard>
                    <XDSCard padding={4}>
                      <XDSVStack gap={2}>
                        <XDSText type="label" color="secondary">
                          Pending Reviews
                        </XDSText>
                        <XDSHeading level={2}>23</XDSHeading>
                        <XDSBadge label="Needs attention" variant="warning" />
                      </XDSVStack>
                    </XDSCard>
                  </XDSGrid>

                  <XDSCard padding={4}>
                    <XDSVStack gap={4}>
                      <XDSHStack gap={2} vAlign="center">
                        <XDSStackItem size="fill">
                          <XDSHeading level={3}>Recent Activity</XDSHeading>
                        </XDSStackItem>
                        <XDSButton label="View all" variant="ghost" />
                      </XDSHStack>
                      <XDSDivider />
                      <XDSText type="body" color="secondary">
                        Activity feed content would appear here.
                      </XDSText>
                    </XDSVStack>
                  </XDSCard>
                </XDSVStack>
              </XDSSection>
            </XDSLayoutContent>
          }
          end={
            <XDSLayoutPanel hasDivider width={320} label="Detail panel">
              <XDSSection padding={4}>
                <XDSVStack gap={4}>
                  <XDSHeading level={3}>Details</XDSHeading>
                  <XDSDivider />

                  <XDSHStack gap={3} vAlign="center">
                    <XDSAvatar name="Jane Smith" size="medium" />
                    <XDSVStack gap={1}>
                      <XDSText type="body" weight="semibold">
                        Jane Smith
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        Administrator
                      </XDSText>
                    </XDSVStack>
                  </XDSHStack>

                  <XDSMetadataList columns="single">
                    <XDSMetadataListItem label="Email">
                      jane.smith@example.com
                    </XDSMetadataListItem>
                    <XDSMetadataListItem label="Role">
                      <XDSBadge label="Admin" variant="blue" />
                    </XDSMetadataListItem>
                    <XDSMetadataListItem label="Status">
                      <XDSBadge label="Active" variant="success" />
                    </XDSMetadataListItem>
                    <XDSMetadataListItem label="Last Login">
                      2 hours ago
                    </XDSMetadataListItem>
                    <XDSMetadataListItem label="Created">
                      Jan 15, 2024
                    </XDSMetadataListItem>
                  </XDSMetadataList>

                  <XDSDivider />

                  <XDSHStack gap={2}>
                    <XDSButton label="Edit User" variant="secondary" />
                    <XDSButton label="Suspend" variant="destructive" />
                  </XDSHStack>
                </XDSVStack>
              </XDSSection>
            </XDSLayoutPanel>
          }
        />
      </XDSAppShell>
    </XDSTheme>
  );
}
