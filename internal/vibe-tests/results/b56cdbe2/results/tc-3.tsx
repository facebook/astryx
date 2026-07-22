import {ThemeProvider, defineTheme, VStack, Heading, Text, Card} from '@astryxdesign/core';

const myTheme = defineTheme({
  accent: '#0066cc',
});

export default function ThemedPage() {
  return (
    <ThemeProvider theme={myTheme} colorScheme="light">
      <div style={{backgroundColor: 'var(--color-background-wash)', minHeight: '100vh', padding: 32}}>
        <VStack gap={3}>
          <Heading level={1}>Themed Page</Heading>
          <Text color="secondary">The page background now uses the wash color from the theme.</Text>
          <Card padding={4}>
            <Text>Card content sits on the default card background, while the page uses the wash token.</Text>
          </Card>
        </VStack>
      </div>
    </ThemeProvider>
  );
}
