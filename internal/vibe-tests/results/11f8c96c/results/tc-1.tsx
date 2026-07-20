import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Stack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import '@astryxdesign/theme-neutral/theme.css';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  return (
    <AppShell colorScheme={isDark ? 'dark' : 'light'}>
      <Stack gap={3} padding={4}>
        <Text type="label">Current theme: {isDark ? 'Dark' : 'Light'}</Text>
        <Button
          variant="secondary"
          clickAction={() => setIsDark(!isDark)}
        >
          Switch to {isDark ? 'Light' : 'Dark'} Mode
        </Button>
      </Stack>
    </AppShell>
  );
}
