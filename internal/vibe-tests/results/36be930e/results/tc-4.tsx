import {useState} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {defineTheme} from '@astryxdesign/core/theme';

const defaultTheme = defineTheme({
  name: 'default',
  color: {accent: '#2563eb'},
});

const midnightTheme = defineTheme({
  name: 'midnight',
  color: {accent: '#7c3aed'},
});

const sunriseTheme = defineTheme({
  name: 'sunrise',
  color: {accent: '#ea580c'},
});

const themes = [
  {name: 'Default', theme: defaultTheme, description: 'Clean blue accent with neutral tones'},
  {name: 'Midnight', theme: midnightTheme, description: 'Dark purple accent for a nighttime feel'},
  {name: 'Sunrise', theme: sunriseTheme, description: 'Warm orange accent for an energetic look'},
];

export default function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState(themes[0]);

  return (
    <Theme theme={activeTheme.theme} mode="light">
      <VStack gap={4} padding={4}>
        <Heading level={2}>Theme Switcher</Heading>
        <Text color="secondary">Pick a theme to preview how components look with different color systems.</Text>
        <HStack gap={2} wrap="wrap">
          {themes.map(t => (
            <Card key={t.name} padding={3}>
              <VStack gap={2}>
                <Text type="label">{t.name}</Text>
                <Text type="supporting" color="secondary">{t.description}</Text>
                <Button
                  label={activeTheme.name === t.name ? 'Active' : 'Apply'}
                  variant={activeTheme.name === t.name ? 'primary' : 'secondary'}
                  onClick={() => setActiveTheme(t)}
                  isDisabled={activeTheme.name === t.name}
                />
              </VStack>
            </Card>
          ))}
        </HStack>
        <Card padding={4}>
          <VStack gap={3}>
            <Heading level={3}>Preview</Heading>
            <Text>This card demonstrates the current theme. Buttons and accents reflect the selected palette.</Text>
            <HStack gap={2}>
              <Button label="Primary Action" variant="primary" />
              <Button label="Secondary" variant="secondary" />
              <Button label="Ghost" variant="ghost" />
            </HStack>
          </VStack>
        </Card>
      </VStack>
    </Theme>
  );
}
