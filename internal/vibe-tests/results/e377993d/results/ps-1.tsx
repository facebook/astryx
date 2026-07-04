import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';

const navItems = ['General', 'Notifications', 'Security', 'Appearance', 'Integrations'];

export default function SettingsDashboard() {
  const [activeSection, setActiveSection] = useState('General');
  const [username, setUsername] = useState('johndoe');
  const [email, setEmail] = useState('john@example.com');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'General':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">General Settings</h3>
            <div><Label>Username</Label><Input value={username} onChange={e => setUsername(e.target.value)} /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <Button>Save Changes</Button>
          </div>
        );
      case 'Notifications':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Notifications</h3>
            <div className="flex items-center gap-2"><Checkbox id="email" checked={emailNotifs} onCheckedChange={v => setEmailNotifs(!!v)} /><Label htmlFor="email">Email notifications</Label></div>
            <div className="flex items-center gap-2"><Checkbox id="push" checked={pushNotifs} onCheckedChange={v => setPushNotifs(!!v)} /><Label htmlFor="push">Push notifications</Label></div>
            <Button>Save Preferences</Button>
          </div>
        );
      default:
        return <div><h3 className="text-xl font-semibold">{activeSection}</h3><p className="text-gray-600 mt-2">Settings for {activeSection}.</p></div>;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b px-6 py-4"><h1 className="text-2xl font-bold">Settings</h1></header>
      <div className="flex flex-1">
        <aside className="w-56 border-r p-4 space-y-1">
          {navItems.map(item => (
            <Button key={item} variant={activeSection === item ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveSection(item)}>{item}</Button>
          ))}
        </aside>
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
