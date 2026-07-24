// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {SideNav} from '@astryxdesign/core/SideNav';
import {Stack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Collapsible} from '@astryxdesign/core/Collapsible';

export function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');

  const navItems = [
    {id: 'dashboard', label: 'Dashboard'},
    {id: 'users', label: 'Users'},
    {id: 'settings', label: 'Settings'},
    {id: 'reports', label: 'Reports'},
  ];

  return (
    <AppShell contentPadding={4}>
      <AppShell.Header>
        <Stack direction="row" align="center" gap={2} padding={2}>
          <Button
            label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            variant="ghost"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <Heading level={3}>Admin Panel</Heading>
        </Stack>
      </AppShell.Header>
      <AppShell.Sidebar>
        <Collapsible trigger={<Text weight="semibold">Navigation</Text>} isOpen={sidebarOpen}>
          <SideNav
            items={navItems}
            activeItem={activeItem}
            onItemClick={setActiveItem}
          />
        </Collapsible>
      </AppShell.Sidebar>
      <Stack gap={4}>
        <Heading level={1}>
          {navItems.find(item => item.id === activeItem)?.label ?? 'Dashboard'}
        </Heading>
        <Text color="secondary">
          Welcome to the admin panel. Select a section from the sidebar to get started.
        </Text>
      </Stack>
    </AppShell>
  );
}

export default AdminPanel;
