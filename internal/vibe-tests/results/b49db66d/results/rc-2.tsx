import React, {useState} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {SideNav} from '@astryxdesign/core/SideNav';
import {SideNavItem} from '@astryxdesign/core/SideNav';
import {SideNavSection} from '@astryxdesign/core/SideNav';
import {TopNav} from '@astryxdesign/core/TopNav';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

function HomeIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l10 9h-3v10h-5v-6H10v6H5V11H2l10-9z"/></svg>; }
function DocIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/></svg>; }
function ChartIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12h2v7H5v-7zm6-4h2v11h-2V8zm6-3h2v14h-2V5z"/></svg>; }
function GearIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/></svg>; }

export default function ResponsiveSidebar() {
  const [selected, setSelected] = useState('home');

  const sidebar = (
    <SideNav collapsible>
      <SideNavSection label="Main">
        <SideNavItem label="Home" icon={<HomeIcon />} isSelected={selected === 'home'} onClick={() => setSelected('home')} />
        <SideNavItem label="Documents" icon={<DocIcon />} isSelected={selected === 'docs'} onClick={() => setSelected('docs')} />
        <SideNavItem label="Analytics" icon={<ChartIcon />} isSelected={selected === 'analytics'} onClick={() => setSelected('analytics')} />
      </SideNavSection>
      <SideNavSection label="Account">
        <SideNavItem label="Settings" icon={<GearIcon />} isSelected={selected === 'settings'} onClick={() => setSelected('settings')} />
      </SideNavSection>
    </SideNav>
  );

  return (
    <AppShell sideNav={sidebar} topNav={<TopNav heading={<Heading level={4}>My App</Heading>} />} mobileNav={{trigger: true}} contentPadding={4}>
      <Heading level={2}>{selected.charAt(0).toUpperCase() + selected.slice(1)}</Heading>
      <Text>The sidebar collapses on smaller viewports and becomes a bottom sheet on mobile via AppShell mobile nav.</Text>
    </AppShell>
  );
}
