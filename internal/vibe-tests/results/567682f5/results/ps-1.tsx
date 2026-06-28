// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Switch} from '@/components/ui/switch';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {Settings, Bell, Shield, CreditCard} from 'lucide-react';

const sidebarItems = [
  {label: 'General', icon: Settings, href: '/settings/general'},
  {label: 'Notifications', icon: Bell, href: '/settings/notifications'},
  {label: 'Security', icon: Shield, href: '/settings/security'},
  {label: 'Billing', icon: CreditCard, href: '/settings/billing'},
];

export default function SettingsDashboard() {
  return (
    <div className="min-h-screen">
      <header className="border-b px-6 py-3">
        <span className="font-bold text-lg">MyApp</span>
      </header>
      <div className="flex">
        <aside className="w-60 border-r min-h-[calc(100vh-53px)] p-4">
          <nav className="space-y-1">
            {sidebarItems.map(({label, icon: Icon, href}) => (
              <a key={href} href={href} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted">
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-8 max-w-2xl space-y-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Card>
            <CardHeader><CardTitle>General</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Dark mode</p>
                  <p className="text-xs text-muted-foreground">Use dark theme across the app</p>
                </div>
                <Switch id="dark-mode" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Compact view</p>
                  <p className="text-xs text-muted-foreground">Reduce spacing between elements</p>
                </div>
                <Switch id="compact-view" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch id="email-notifs" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Push notifications</p>
                  <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
                </div>
                <Switch id="push-notifs" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
