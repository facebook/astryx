'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSAppShell} from '@xds/core/AppShell';
import {XDSTopNav, XDSTopNavItem} from '@xds/core/TopNav';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutHeader,
  XDSLayoutFooter,
  XDSLayoutPanel,
} from '@xds/core/Layout';
import {XDSResizeHandle, useXDSResizable} from '@xds/core/Resizable';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {
  HomeIcon,
  FolderIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CubeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {HomeIcon as HomeIconSolid} from '@heroicons/react/24/solid';

const styles = stylex.create({
  panelContent: {
    padding: 16,
    height: '100%',
  },
  sizeLabel: {
    opacity: 0.5,
    fontSize: 11,
    fontFamily: 'monospace',
  },
});

function PanelPlaceholder({
  title,
  size,
  description,
}: {
  title: string;
  size?: number;
  description?: string;
}) {
  return (
    <div {...stylex.props(styles.panelContent)}>
      <XDSVStack gap="space2">
        <XDSHStack gap="space2" vAlign="center">
          <XDSHeading level={4}>{title}</XDSHeading>
          {size != null && (
            <XDSText>
              <span {...stylex.props(styles.sizeLabel)}>{size}px</span>
            </XDSText>
          )}
        </XDSHStack>
        {description && (
          <XDSText color="secondary">{description}</XDSText>
        )}
      </XDSVStack>
    </div>
  );
}

export default function ResizableWorkspacePage() {
  const [activeNav, setActiveNav] = useState('dashboard');

  const startPanel = useXDSResizable({
    defaultSize: 240,
    minSizePx: 160,
    maxSizePx: 400,
    collapsible: true,
    collapsedSize: 50,
  });

  const endPanel = useXDSResizable({
    defaultSize: 280,
    minSizePx: 180,
    maxSizePx: 500,
    collapsible: true,
    collapsedSize: 50,
  });

  const headerPanel = useXDSResizable({
    defaultSize: 160,
    minSizePx: 80,
    maxSizePx: 300,
  });

  const footerPanel = useXDSResizable({
    defaultSize: 120,
    minSizePx: 60,
    maxSizePx: 250,
  });

  return (
    <XDSAppShell
      variant="elevated"
      height="fill"
      topNav={
        <XDSTopNav
          heading={
            <XDSHStack gap="space2" vAlign="center">
              <XDSNavIcon
                icon={<CubeIcon style={{width: 16, height: 16}} />}
              />
              <XDSText type="label">Workspace</XDSText>
            </XDSHStack>
          }
          startContent={
            <>
              <XDSTopNavItem label="Dashboard" isSelected href="#" />
              <XDSTopNavItem label="Projects" href="#" />
              <XDSTopNavItem label="Reports" href="#" />
            </>
          }
          endContent={
            <XDSButton
              label="New"
              icon={<XDSIcon icon={PlusIcon} size="sm" />}
              size="sm"
            />
          }
        />
      }
      sideNav={
        <XDSSideNav
          collapsible
          header={
            <XDSSideNavHeading heading="Explorer" />
          }>
          <XDSSideNavSection title="Navigation">
            <XDSSideNavItem
              label="Dashboard"
              icon={HomeIcon}
              selectedIcon={HomeIconSolid}
              isSelected={activeNav === 'dashboard'}
              onClick={() => setActiveNav('dashboard')}
            />
            <XDSSideNavItem
              label="Projects"
              icon={FolderIcon}
              onClick={() => setActiveNav('projects')}
              isSelected={activeNav === 'projects'}
            />
            <XDSSideNavItem
              label="Analytics"
              icon={ChartBarIcon}
              onClick={() => setActiveNav('analytics')}
              isSelected={activeNav === 'analytics'}
            />
            <XDSSideNavItem
              label="Documents"
              icon={DocumentTextIcon}
              onClick={() => setActiveNav('documents')}
              isSelected={activeNav === 'documents'}
            />
          </XDSSideNavSection>
          <XDSSideNavSection title="System">
            <XDSSideNavItem
              label="Settings"
              icon={Cog6ToothIcon}
              onClick={() => setActiveNav('settings')}
              isSelected={activeNav === 'settings'}
            />
          </XDSSideNavSection>
        </XDSSideNav>
      }>
      <XDSLayout
        height="fill"
        header={
          <>
            <div style={{height: headerPanel.size, overflow: 'hidden'}}>
              <XDSLayoutHeader hasDivider={false}>
                <PanelPlaceholder
                  title="Header"
                  size={headerPanel.size}
                  description="Toolbar, breadcrumbs, or page title."
                />
              </XDSLayoutHeader>
            </div>
            <XDSResizeHandle
              direction="vertical"
              hasDivider
              resizable={headerPanel.props}
              label="Resize header"
            />
          </>
        }
        start={
          <>
            {!startPanel.isCollapsed && (
              <XDSLayoutPanel width={startPanel.size} hasDivider={false}>
                <PanelPlaceholder
                  title="Start Panel"
                  size={startPanel.size}
                  description="Tree view, filters, or secondary nav. Double-click handle to collapse."
                />
              </XDSLayoutPanel>
            )}
            <XDSResizeHandle
              direction="horizontal"
              hasDivider
              resizable={startPanel.props}
              label="Resize start panel"
            />
          </>
        }
        content={
          <XDSLayoutContent>
            <XDSVStack gap="space4">
              <XDSHeading level={3}>Content Area</XDSHeading>
              <XDSText color="secondary">
                All four surrounding panels are resizable. Drag any handle to
                adjust. The start and end panels support collapse — double-click
                or press Enter on their handles.
              </XDSText>
              <XDSToolbar
                label="Actions"
                size="sm"
                startContent={
                  <XDSHStack gap="space2">
                    <XDSButton label="Action" size="sm" />
                    <XDSButton
                      label="Secondary"
                      variant="secondary"
                      size="sm"
                    />
                  </XDSHStack>
                }
              />
              <XDSHStack gap="space3" wrap>
                <StatusCard
                  label="Start"
                  size={startPanel.size}
                  collapsed={startPanel.isCollapsed}
                />
                <StatusCard
                  label="End"
                  size={endPanel.size}
                  collapsed={endPanel.isCollapsed}
                />
                <StatusCard label="Header" size={headerPanel.size} />
                <StatusCard label="Footer" size={footerPanel.size} />
              </XDSHStack>
            </XDSVStack>
          </XDSLayoutContent>
        }
        end={
          <>
            <XDSResizeHandle
              direction="horizontal"
              hasDivider
              isReversed
              resizable={endPanel.props}
              label="Resize end panel"
            />
            {!endPanel.isCollapsed && (
              <XDSLayoutPanel width={endPanel.size} hasDivider={false}>
                <PanelPlaceholder
                  title="End Panel"
                  size={endPanel.size}
                  description="Inspector, detail view, or properties panel."
                />
              </XDSLayoutPanel>
            )}
          </>
        }
        footer={
          <>
            <XDSResizeHandle
              direction="vertical"
              hasDivider
              isReversed
              resizable={footerPanel.props}
              label="Resize footer"
            />
            <div style={{height: footerPanel.size, overflow: 'hidden'}}>
              <XDSLayoutFooter hasDivider={false}>
                <PanelPlaceholder
                  title="Footer"
                  size={footerPanel.size}
                  description="Terminal, output console, or status bar."
                />
              </XDSLayoutFooter>
            </div>
          </>
        }
      />
    </XDSAppShell>
  );
}

function StatusCard({
  label,
  size,
  collapsed,
}: {
  label: string;
  size: number;
  collapsed?: boolean;
}) {
  return (
    <XDSVStack gap="space1">
      <XDSText type="supporting" color="secondary">
        {label}
      </XDSText>
      <XDSText type="label">
        {collapsed ? 'Collapsed' : `${size}px`}
      </XDSText>
    </XDSVStack>
  );
}
