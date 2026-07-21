import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet';

const NAV = [{label: 'Home', id: 'home'}, {label: 'Documents', id: 'docs'}, {label: 'Analytics', id: 'analytics'}, {label: 'Settings', id: 'settings'}];

export default function ResponsiveSidebar() {
  const [selected, setSelected] = useState('home');

  const navContent = (
    <nav className="flex flex-col gap-1 p-4">
      {NAV.map(n => <button key={n.id} onClick={() => setSelected(n.id)} className={`text-left px-3 py-2 rounded-md text-sm ${selected === n.id ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted'}`}>{n.label}</button>)}
    </nav>
  );

  return (
    <div className="flex h-screen">
      <aside className="hidden md:block w-64 border-r">{navContent}</aside>
      <div className="flex-1 flex flex-col">
        <header className="flex items-center gap-2 p-4 border-b md:hidden">
          <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open menu"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg></Button></SheetTrigger><SheetContent side="bottom" className="h-[60vh]">{navContent}</SheetContent></Sheet>
          <span className="font-semibold">My App</span>
        </header>
        <main className="p-6">
          <h1 className="text-2xl font-bold">{selected.charAt(0).toUpperCase() + selected.slice(1)}</h1>
          <p className="text-muted-foreground mt-2">The sidebar collapses on smaller viewports and becomes a bottom sheet on mobile.</p>
        </main>
      </div>
    </div>
  );
}
