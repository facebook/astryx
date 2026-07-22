import {Heading, Text, VStack, Card, TextInput, Switch, Selector, SelectorItem} from '@astryxdesign/core';
import {useState} from 'react';

export default function SettingsPage() {
  const [name, setName] = useState('John Doe');
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  return (
    <VStack gap={5}>
      <Heading level={1}>Settings</Heading>

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={2}>Profile</Heading>
          <Text color="secondary">Manage your personal information.</Text>
          <TextInput label="Display Name" value={name} onChange={setName} />
          <TextInput label="Email" value="john@example.com" onChange={() => {}} isDisabled />
        </VStack>
      </Card>

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={2}>Appearance</Heading>
          <Text color="secondary">Customize how the app looks.</Text>
          <Switch label="Dark Mode" isSelected={darkMode} onChange={setDarkMode} />
        </VStack>
      </Card>

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={2}>Language & Region</Heading>
          <Text color="secondary">Set your preferred language and locale.</Text>
          <Selector label="Language" value={language} onChange={setLanguage}>
            <SelectorItem value="en" label="English" />
            <SelectorItem value="es" label="Spanish" />
            <SelectorItem value="fr" label="French" />
          </Selector>
        </VStack>
      </Card>
    </VStack>
  );
}
