import { useEffect, useState } from 'react';
import { Box, Flex, Stack, Surface } from '@jedi/foundation';
import { Badge, Button, Card, Heading, Input, Text } from '@jedi/react';
import { defaultTheme, highContrastTheme, toggleTheme, type JediTheme } from '@jedi/themes';
import { motionStyleSheet } from '@jedi/motion';

const THEMES: Record<string, JediTheme> = {
  default: defaultTheme,
  'high-contrast': highContrastTheme,
};

export function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [themeName, setThemeName] = useState<keyof typeof THEMES>('default');
  const activeTheme = THEMES[themeName];

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'jedi-theme';
    style.textContent = activeTheme.toStyleTag(mode);
    document.head.appendChild(style);
    const motion = document.createElement('style');
    motion.textContent = motionStyleSheet();
    document.head.appendChild(motion);
    return () => {
      style.remove();
      motion.remove();
    };
  }, [mode, themeName, activeTheme]);

  return (
    <Box padding={6} style={{ minHeight: '100vh', fontFamily: 'var(--jedi-font-family-sans)' }}>
      <Stack spacing={6}>
        <Flex justify="space-between" align="center" wrap gap={3}>
          <Heading level={1}>JEDI Examples</Heading>
          <Flex gap={2}>
            <Button
              variant={themeName === 'default' ? 'primary' : 'secondary'}
              onClick={() => setThemeName('default')}
            >
              Default Theme
            </Button>
            <Button
              variant={themeName === 'high-contrast' ? 'primary' : 'secondary'}
              onClick={() => setThemeName('high-contrast')}
            >
              High Contrast
            </Button>
            <Button onClick={() => setMode(toggleTheme())}>
              Toggle {mode === 'light' ? 'Dark' : 'Light'}
            </Button>
          </Flex>
        </Flex>

        <Text variant="secondary">
          Gate 1 validation — third theme via @jedi/themes only; components unchanged.
        </Text>

        <Flex gap={4} wrap>
          <Card title="Tokens" padding={4}>
            <Stack spacing={2}>
              <Badge>v0.2</Badge>
              <Text>Surface uses semantic tokens</Text>
              <Surface border padding={3}>
                <Text>Themed surface ({activeTheme.name})</Text>
              </Surface>
            </Stack>
          </Card>

          <Card title="Components" padding={4}>
            <Stack spacing={3}>
              <Input label="Email" placeholder="you@example.com" />
              <Flex gap={2}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
              </Flex>
            </Stack>
          </Card>
        </Flex>
      </Stack>
    </Box>
  );
}
