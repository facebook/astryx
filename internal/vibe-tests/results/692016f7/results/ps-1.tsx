// Copyright (c) Meta Platforms, Inc. and affiliates.

import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Switch } from './components/ui/switch';
import { Separator } from './components/ui/separator';

export default function SettingsDashboard() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4">
        <h2 className="font-bold mb-4">Settings</h2>
        <nav className="space-y-1">
          <a href="#general" className="block px-3 py-2 rounded-md bg-accent text-sm font-medium">General</a>
          <a href="#notifications" className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent">Notifications</a>
          <a href="#security" className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent">Security</a>
          <a href="#billing" className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent">Billing</a>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">General Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Display Name</Label><Input defaultValue="John Doe" /></div>
            <div><Label>Email</Label><Input defaultValue="john@example.com" type="email" /></div>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-medium">Preferences</h3>
              <div className="flex items-center justify-between">
                <Label>Enable notifications</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Dark mode</Label>
                <Switch />
              </div>
            </div>
            <Separator />
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
