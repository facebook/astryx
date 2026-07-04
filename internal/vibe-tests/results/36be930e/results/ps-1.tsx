import {useState} from 'react';
import {Layout} from '@astryxdesign/core/Layout';
import {LayoutHeader} from '@astryxdesign/core/Layout';
import {LayoutContent} from '@astryxdesign/core/Layout';
import {LayoutPanel} from '@astryxdesign/core/Layout';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Card} from '@astryxdesign/core/Card';
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
          <VStack gap={4}>
            <Heading level={3}>General Settings</Heading>
            <TextInput label="Username" value={username} onChange={setUsername} />
            <TextInput label="Email" value={email} onChange={setEmail} type="email" />
            <Button label="Save Changes" variant="primary" />
          </VStack>
        );
      case 'Notifications':
        return (
          <VStack gap={4}>
            <Heading level={3}>Notification Preferences</Heading>
            <CheckboxInput
              label="Email notifications"
              value={emailNotifs}
              onChange={checked => setEmailNotifs(checked)}
            />
            <CheckboxInput
              label="Push notifications"
              value={pushNotifs}
              onChange={checked => setPushNotifs(checked)}
            />
            <Button label="Save Preferences" variant="primary" />
          </VStack>
        );
      default:
        return (
          <VStack gap={4}>
            <Heading level={3}>{activeSection}</Heading>
            <Text color="secondary">Settings for {activeSection} will appear here.</Text>
          </VStack>
        );
    }
  };

  return (
    <Layout
      header={
        <LayoutHeader hasDivider>
          <HStack padding={3} vAlign="center">
            <Heading level={1}>Settings</Heading>
          </HStack>
        </LayoutHeader>
      }
      start={
        <LayoutPanel hasDivider label="Settings navigation">
          <VStack gap={1} padding={2}>
            {navItems.map(item => (
              <Button
                key={item}
                label={item}
                variant={activeSection === item ? 'secondary' : 'ghost'}
                onClick={() => setActiveSection(item)}
              />
            ))}
          </VStack>
        </LayoutPanel>
      }
      content={
        <LayoutContent padding={4}>
          {renderContent()}
        </LayoutContent>
      }
    />
  );
}
