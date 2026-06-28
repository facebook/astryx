// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet';
import {Menu} from 'lucide-react';

const navItems = [
  {label: 'Home', href: '/'},
  {label: 'Products', href: '/products'},
  {label: 'About', href: '/about'},
  {label: 'Contact', href: '/contact'},
];

export default function ResponsiveNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <span className="font-bold text-lg">Logo</span>
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <a key={item.href} href={item.href} className="text-sm font-medium hover:text-primary transition-colors">
              {item.label}
            </a>
          ))}
        </div>
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map(item => (
                  <a key={item.href} href={item.href} className="text-lg font-medium" onClick={() => setOpen(false)}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
