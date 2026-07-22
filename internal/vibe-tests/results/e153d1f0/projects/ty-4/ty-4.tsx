import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card><CardHeader><CardTitle>Profile</CardTitle><CardDescription>Manage your personal information.</CardDescription></CardHeader><CardContent className="space-y-3">
        <div><Label>Display Name</Label><Input defaultValue="John Doe" /></div>
        <div><Label>Email</Label><Input defaultValue="john@example.com" disabled /></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize how the app looks.</CardDescription></CardHeader><CardContent>
        <div className="flex items-center justify-between"><Label htmlFor="dark">Dark Mode</Label><Switch id="dark" /></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Language & Region</CardTitle><CardDescription>Set your preferred language.</CardDescription></CardHeader><CardContent>
        <Select defaultValue="en"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="es">Spanish</SelectItem><SelectItem value="fr">French</SelectItem></SelectContent></Select>
      </CardContent></Card>
    </div>
  );
}
