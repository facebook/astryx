// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';

const navItems = ['Dashboard', 'Analytics', 'Settings', 'Help'];

export default function ResponsiveSidebar() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-[260px] border-r flex-col gap-2 p-4">
        <h3 className="font-semibold">Navigation</h3>
        <Separator />
        {navItems.map((item) => (
          <span key={item} className="text-sm py-1">{item}</span>
        ))}
      </aside>
      <main className="flex-1 p-6 space-y-4">
        <h2 className="text-2xl font-bold">Main Content</h2>
        <Card>
          <CardContent className="p-4">
            <p>This layout has a sidebar that becomes hidden on mobile. On smaller viewports, a bottom sheet or overlay navigation would replace the sidebar.</p>
          </CardContent>
        </Card>
      </main>
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background p-4">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <span key={item} className="text-xs">{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
