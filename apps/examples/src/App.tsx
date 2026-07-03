import { useEffect, useState } from 'react';
import { Box, Flex, Stack, Surface } from '@jedi/foundation';
import { Badge, Button, Card, Heading, Input, Text } from '@jedi/react';
import { defaultTheme, toggleTheme } from '@jedi/themes';
import { motionStyleSheet } from '@jedi/motion';

export function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'jedi-theme';
    style.textContent = defaultTheme.toStyleTag(mode);
    document.head.appendChild(style);
    const motion = document.createElement('style');
    motion.textContent = motionStyleSheet();
    document.head.appendChild(motion);
    return () => {
      style.remove();
      motion.remove();
    };
  }, [mode]);

  return (
    <Box padding={6} style={{ minHeight: '100vh', fontFamily: 'var(--jedi-font-family-sans)' }}>
      <Stack spacing={6}>
        <Flex justify="space-between" align="center">
          <Heading level={1}>JEDI Examples</Heading>
          <Button onClick={() => setMode(toggleTheme())}>
            Toggle {mode === 'light' ? 'Dark' : 'Light'}
          </Button>
        </Flex>

        <Text variant="secondary">
          Architectural fitness app — v0.2 foundation through v0.3 components.
        </Text>

        <Flex gap={4} wrap>
          <Card title="Tokens" padding={4}>
            <Stack spacing={2}>
              <Badge>v0.2</Badge>
              <Text>Surface uses semantic tokens</Text>
              <Surface border padding={3}>
                <Text>Themed surface</Text>
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
