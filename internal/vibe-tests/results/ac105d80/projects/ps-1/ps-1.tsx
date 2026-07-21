import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

const SECTIONS = [{id: 'profile', label: 'Profile'}, {id: 'notifications', label: 'Notifications'}, {id: 'security', label: 'Security'}, {id: 'appearance', label: 'Appearance'}];

export default function SettingsDashboard() {
  const [selected, setSelected] = useState('profile');
  const [name, setName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex@example.com');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  return (
    <div className="flex h-screen">
      <header className="w-full border-b p-4 absolute top-0"><h1 className="font-semibold text-lg">Settings App</h1></header>
      <aside className="w-56 border-r pt-16 p-4"><nav className="flex flex-col gap-1">{SECTIONS.map(s => <button key={s.id} onClick={() => setSelected(s.id)} className={`text-left px-3 py-2 rounded text-sm ${selected === s.id ? 'bg-accent font-medium' : 'hover:bg-muted'}`}>{s.label}</button>)}</nav></aside>
      <main className="flex-1 p-6 pt-20 max-w-lg">
        {selected === 'profile' && <Card><CardHeader><CardTitle>Profile</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div><div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div><Button>Save changes</Button></CardContent></Card>}
        {selected === 'notifications' && <Card><CardHeader><CardTitle>Notifications</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between"><Label>Email notifications</Label><Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} /></div><div className="flex items-center justify-between"><Label>Push notifications</Label><Switch checked={pushNotifs} onCheckedChange={setPushNotifs} /></div></CardContent></Card>}
        {selected === 'security' && <Card><CardHeader><CardTitle>Security</CardTitle></CardHeader><CardContent className="space-y-3"><Button variant="outline">Change password</Button><Button variant="outline">Enable 2FA</Button></CardContent></Card>}
        {selected === 'appearance' && <Card><CardHeader><CardTitle>Appearance</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Theme settings here.</p></CardContent></Card>}
      </main>
    </div>
  );
}
