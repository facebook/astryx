// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';

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
    <div className="h-screen flex flex-col">
      <header className="border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? 'Collapse' : 'Expand'}
        </Button>
        <h1 className="text-lg font-semibold">Admin Panel</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <aside className="w-56 border-r">
            <ScrollArea className="h-full p-4">
              <nav className="flex flex-col gap-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    className={`text-left px-3 py-2 rounded-md text-sm ${
                      activeItem === item.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveItem(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </ScrollArea>
          </aside>
        )}
        <main className="flex-1 p-6 overflow-auto">
          <h2 className="text-2xl font-bold mb-2">
            {navItems.find(item => item.id === activeItem)?.label ?? 'Dashboard'}
          </h2>
          <p className="text-muted-foreground">
            Welcome to the admin panel. Select a section from the sidebar.
          </p>
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;
