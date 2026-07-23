// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';

const NAV_ITEMS = ['Dashboard', 'Users', 'Products', 'Orders', 'Settings'];

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Dashboard');

  return (
    <div className="h-screen flex flex-col">
      <header className="h-14 border-b flex items-center px-4 gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '←' : '→'}
        </Button>
        <h1 className="text-lg font-semibold">Admin Panel</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <aside className="w-60 border-r p-3 space-y-1 shrink-0 overflow-y-auto">
            {NAV_ITEMS.map(item => (
              <button
                key={item}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left px-3 py-2 rounded text-sm ${activeItem === item ? 'bg-accent font-medium' : 'hover:bg-accent/50'}`}
              >
                {item}
              </button>
            ))}
          </aside>
        )}
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold mb-2">{activeItem}</h2>
          <p className="text-muted-foreground">Content for the {activeItem.toLowerCase()} section.</p>
        </main>
      </div>
    </div>
  );
}
