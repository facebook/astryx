import {useState} from 'react';
import {Layout} from '@astryxdesign/core/Layout';
import {LayoutHeader} from '@astryxdesign/core/Layout';
import {LayoutContent} from '@astryxdesign/core/Layout';
import {LayoutPanel} from '@astryxdesign/core/Layout';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';

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
            <Heading level={3}>General Settings</Heading>
            <TextInput label="Username" value={username} onChange={setUsername} />
            <TextInput label="Email" value={email} onChange={setEmail} type="email" />
            <Button label="Save Changes" variant="primary" />
          </div>
        );
      case 'Notifications':
        return (
          <div className="space-y-4">
            <Heading level={3}>Notification Preferences</Heading>
            <CheckboxInput label="Email notifications" value={emailNotifs} onChange={checked => setEmailNotifs(checked)} />
            <CheckboxInput label="Push notifications" value={pushNotifs} onChange={checked => setPushNotifs(checked)} />
            <Button label="Save Preferences" variant="primary" />
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <Heading level={3}>{activeSection}</Heading>
            <Text color="secondary">Settings for {activeSection} will appear here.</Text>
          </div>
        );
    }
  };

  return (
    <Layout
      header={<LayoutHeader hasDivider><div className="p-3"><Heading level={1}>Settings</Heading></div></LayoutHeader>}
      start={<LayoutPanel hasDivider label="Settings navigation"><div className="p-2 space-y-1">{navItems.map(item => (<Button key={item} label={item} variant={activeSection === item ? 'secondary' : 'ghost'} onClick={() => setActiveSection(item)} />))}</div></LayoutPanel>}
      content={<LayoutContent padding={4}>{renderContent()}</LayoutContent>}
    />
  );
}
