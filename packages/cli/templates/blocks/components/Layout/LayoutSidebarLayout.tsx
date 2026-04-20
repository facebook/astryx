'use client';

import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSLayoutPanel,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';

const navItems = [
  {label: 'General', active: true},
  {label: 'Account', active: false},
  {label: 'Privacy', active: false},
  {label: 'Notifications', active: false},
  {label: 'Security', active: false},
];

export default function LayoutSidebarLayout() {
  return (
    <XDSCard width={700} height={400}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <div style={{fontWeight: 600, fontSize: 18}}>Settings</div>
          </XDSLayoutHeader>
        }
        start={
          <XDSLayoutPanel hasDivider role="navigation">
            {navItems.map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  ...(item.active ? {fontWeight: 500} : {}),
                }}>
                {item.label}
              </div>
            ))}
          </XDSLayoutPanel>
        }
        content={
          <XDSLayoutContent>
            <div style={{fontWeight: 500, fontSize: 14, marginBottom: 12}}>
              General Settings
            </div>
            <p style={{fontSize: 14, lineHeight: 1.5, margin: 0}}>
              Configure your general preferences here. The sidebar navigation
              allows you to switch between different settings sections.
            </p>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack gap={2} hAlign="end">
              <XDSButton label="Reset" variant="secondary">
                Reset
              </XDSButton>
              <XDSButton label="Save Changes" variant="primary">
                Save Changes
              </XDSButton>
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSCard>
  );
}
