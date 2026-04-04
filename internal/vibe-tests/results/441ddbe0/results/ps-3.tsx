import React, {useState} from 'react';
import {XDSTheme} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme/default';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutPanel,
} from '@xds/core/Layout';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
  XDSSideNavCollapseButton,
} from '@xds/core/SideNav';

export default function AdminPanel() {
  const [selectedItem, setSelectedItem] = useState<string | null>('users');

  return (
    <XDSTheme theme={defaultTheme}>
      <XDSAppShell
        topNav={
          <XDSTopNav
            label="Admin navigation"
            heading={<XDSTopNavHeading heading="Admin Panel" href="/" />}
            startContent={
              <>
                <XDSTopNavItem label="Dashboard" href="/dashboard" isSelected />
                <XDSTopNavItem label="Analytics" href="/analytics" />
                <XDSTopNavItem label="Reports" href="/reports" />
              </>
            }
          />
        }
        sideNav={
          <XDSSideNav
            collapsible
            footerIcons={<XDSSideNavCollapseButton />}
          >
            <XDSSideNavSection title="Management" isHeaderHidden>
              <XDSSideNavItem
                label="Users"
                isSelected={selectedItem === 'users'}
                onClick={() => setSelectedItem('users')}
              />
              <XDSSideNavItem
                label="Roles"
                isSelected={selectedItem === 'roles'}
                onClick={() => setSelectedItem('roles')}
              />
              <XDSSideNavItem
                label="Permissions"
                isSelected={selectedItem === 'permissions'}
                onClick={() => setSelectedItem('permissions')}
              />
            </XDSSideNavSection>
            <XDSSideNavSection title="System">
              <XDSSideNavItem
                label="Settings"
                isSelected={selectedItem === 'settings'}
                onClick={() => setSelectedItem('settings')}
              />
              <XDSSideNavItem
                label="Logs"
                isSelected={selectedItem === 'logs'}
                onClick={() => setSelectedItem('logs')}
              />
            </XDSSideNavSection>
          </XDSSideNav>
        }
      >
        {/* Inner layout adds the right-side details panel */}
        <XDSLayout
          content={
            <XDSLayoutContent role="main" label="Main content">
              <h2>Content Area</h2>
              <p>
                Main content for the <strong>{selectedItem}</strong> section goes
                here. This area scrolls independently.
              </p>
            </XDSLayoutContent>
          }
          end={
            <XDSLayoutPanel hasDivider label="Details panel">
              <h3>Details</h3>
              <p>
                Contextual information and actions for the selected item appear
                in this right panel.
              </p>
            </XDSLayoutPanel>
          }
        />
      </XDSAppShell>
    </XDSTheme>
  );
}
