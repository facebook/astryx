// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Link} from '@astryxdesign/core/Link';
import {CodeExampleBlock} from './CodeExampleBlock';

// Theme packages export `<slug>Theme` — y2kTheme, neutralTheme, etc.
function importNameForSlug(slug: string): string {
  return `${slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}Theme`;
}

interface ThemeInstallBlockProps {
  /** Full npm package name, e.g. `@astryxdesign/theme-y2k`. */
  packageName: string;
  /** Friendly wordmark, e.g. `Y2K`. */
  themeLabel: string;
}

/**
 * "Use this theme" snippet shown below the themed preview on /themes —
 * `npm install` + the matching import so visitors can copy both without
 * leaving the page.
 */
export function ThemeInstallBlock({
  packageName,
  themeLabel,
}: ThemeInstallBlockProps) {
  const slug = packageName.replace(/^@astryxdesign\/theme-/, '');
  const importName = importNameForSlug(slug);
  const installCode = `npm install ${packageName}`;
  const importCode = `import {Theme} from '@astryxdesign/core';
import {${importName}} from '${packageName}';

<Theme theme={${importName}}>{/* your app */}</Theme>`;

  return (
    <VStack gap={3}>
      <VStack gap={1}>
        <Heading level={2}>Use the {themeLabel} theme</Heading>
        <Text type="body" color="secondary">
          Install the package, then wrap your app in {'<Theme>'}. See the{' '}
          <Link
            type="body"
            color="secondary"
            href="/docs/theme"
            hasUnderline>
            Theme System guide
          </Link>{' '}
          for SSR, light/dark mode, and customization.
        </Text>
      </VStack>
      <CodeExampleBlock code={installCode} language="bash" hasCopyButton />
      <CodeExampleBlock code={importCode} language="tsx" hasCopyButton />
    </VStack>
  );
}
