// Copyright (c) Meta Platforms, Inc. and affiliates.

import {ThemeProvider} from '../components/ui/theme-provider';

export default function NestedThemes() {
  return (
    <div className="flex h-screen">
      <div className="dark bg-background text-foreground w-64 border-r">
        <nav className="p-4 space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Navigation</h3>
          <a href="#" className="block px-3 py-2 rounded-md bg-accent text-accent-foreground text-sm">Dashboard</a>
          <a href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-accent/50">Projects</a>
          <a href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-accent/50">Team</a>
          <a href="#" className="block px-3 py-2 rounded-md text-sm hover:bg-accent/50">Settings</a>
        </nav>
      </div>

      <div className="flex-1 p-6 space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          This content area uses a light theme while the sidebar uses a dark theme.
        </p>
        <div className="border rounded-lg p-4 space-y-2">
          <h3 className="text-lg font-semibold">Nested Theme Demo</h3>
          <p className="text-sm text-muted-foreground">
            Apply the dark class to any section to switch its theme independently.
          </p>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm">
            Action
          </button>
        </div>
      </div>
    </div>
  );
}
