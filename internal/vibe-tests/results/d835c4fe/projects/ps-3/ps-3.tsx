// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {SideNav} from '@astryxdesign/core/SideNav';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Stack} from '@astryxdesign/core/Stack';

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
        <div className="flex items-center gap-3 px-4 py-2 border-b">
          <Button
            label={sidebarOpen ? 'Collapse' : 'Expand'}
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <Heading level={3}>Admin Panel</Heading>
        </div>
      </AppShell.Header>
      <AppShell.Sidebar>
        {sidebarOpen && (
          <div className="w-56 border-r h-full p-4">
            <SideNav
              items={navItems}
              activeItem={activeItem}
              onItemClick={setActiveItem}
            />
          </div>
        )}
      </AppShell.Sidebar>
      <Stack gap={4}>
        <Heading level={1}>
          {navItems.find(item => item.id === activeItem)?.label ?? 'Dashboard'}
        </Heading>
        <Text color="secondary">
          Welcome to the admin panel. Select a section from the sidebar.
        </Text>
      </Stack>
    </AppShell>
  );
}

export default AdminPanel;
