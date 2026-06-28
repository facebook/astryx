// Copyright (c) Meta Platforms, Inc. and affiliates.

import {ThemeProvider} from '@astryxdesign/core/ThemeProvider';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';
import {HStack} from '@astryxdesign/core/HStack';
import {Badge} from '@astryxdesign/core/Badge';

const oceanTheme = {
  colors: {
    primary: '#0077B6',
    primaryHover: '#005A8C',
    primaryActive: '#003F63',
    surface: '#F0F8FF',
    surfaceRaised: '#FFFFFF',
    text: '#1B3A4B',
    textSecondary: '#4A7C8E',
    border: '#B8D4E3',
    success: '#2E8B57',
    error: '#CD3700',
  },
};

const sunsetTheme = {
  colors: {
    primary: '#E85D04',
    primaryHover: '#C44D03',
    primaryActive: '#9D3E02',
    surface: '#FFF8F0',
    surfaceRaised: '#FFFFFF',
    text: '#3D1F00',
    textSecondary: '#8B5E3C',
    border: '#F0C8A0',
    success: '#4CAF50',
    error: '#D32F2F',
  },
};

function ThemeDemo({themeName}: {themeName: string}) {
  return (
    <Card>
      <VStack gap="md" style={{padding: 'var(--xds-spacing-lg)'}}>
        <HStack gap="sm" align="center">
          <Heading level={3}>{themeName} Theme</Heading>
          <Badge variant="info">Preview</Badge>
        </HStack>
        <Text color="secondary">
          This card demonstrates the {themeName.toLowerCase()} color palette
          with shared spacing and typography tokens.
        </Text>
        <HStack gap="sm">
          <Button label="Primary Action" variant="primary" />
          <Button label="Secondary" variant="secondary" />
          <Button label="Ghost" variant="ghost" />
        </HStack>
      </VStack>
    </Card>
  );
}

export default function CustomThemesDemo() {
  return (
    <VStack gap="xl" style={{padding: 'var(--xds-spacing-xl)'}}>
      <Heading level={1}>Custom Themes</Heading>
      <Text color="secondary">
        Two themes sharing the same spacing and typography tokens but with
        distinct color palettes.
      </Text>

      <ThemeProvider theme={oceanTheme}>
        <ThemeDemo themeName="Ocean" />
      </ThemeProvider>

      <ThemeProvider theme={sunsetTheme}>
        <ThemeDemo themeName="Sunset" />
      </ThemeProvider>
    </VStack>
  );
}
