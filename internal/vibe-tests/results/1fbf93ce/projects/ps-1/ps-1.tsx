// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';

const navSections = ['General', 'Notifications', 'Security', 'Billing'];

export default function SettingsDashboard() {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b px-6 py-4">
        <h1 className="text-3xl font-bold">Settings</h1>
      </header>
      <div className="flex flex-1">
        <aside className="w-[220px] border-r p-4 space-y-2">
          {navSections.map((section) => (
            <p key={section} className="font-medium">{section}</p>
          ))}
        </aside>
        <main className="flex-1 p-6 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent>
              <Separator className="mb-3" />
              <p>Manage your account settings and preferences.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Separator className="mb-3" />
              <p>Configure how and when you receive notifications.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
