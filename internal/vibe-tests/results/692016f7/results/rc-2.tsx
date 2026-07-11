// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Projects', href: '#projects' },
  { label: 'Team', href: '#team' },
  { label: 'Settings', href: '#settings' },
];

export default function ResponsiveSidebar() {
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <nav className="flex flex-col gap-2 p-4">
      {navItems.map((item) => (
        <a key={item.label} href={item.href} className="px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
          {item.label}
        </a>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:block w-64 border-r">
        <NavContent />
      </aside>
      <div className="flex-1">
        <header className="flex items-center p-4 border-b md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">Menu</Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh]">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>
        <main className="p-6">
          <h1 className="text-2xl font-bold">Content Area</h1>
          <p className="text-muted-foreground mt-2">
            The sidebar collapses to a bottom sheet on mobile viewports.
          </p>
        </main>
      </div>
    </div>
  );
}
