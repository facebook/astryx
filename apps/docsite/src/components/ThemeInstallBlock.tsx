// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Link} from '@astryxdesign/core/Link';
import {CodeExampleBlock} from './CodeExampleBlock';
import {layout} from '../layout.stylex';

// Theme packages export a single named theme object: `<slug>Theme` (e.g.
// `y2kTheme`, `neutralTheme`). The export name is derived from the package
// slug rather than read from the registry — every theme in the workspace
// follows this convention, and threading the import name through
// generate-data.mjs would add a registry field for one consumer.
function importNameForSlug(slug: string): string {
  return `${slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}Theme`;
}

const styles = stylex.create({
  // Caps the install block at the same width as the showcase card below
  // it so the two surfaces line up visually instead of the install
  // block running edge-to-edge while the showcase is centered.
  block: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    marginInline: 'auto',
  },
  card: {
    padding: 'var(--spacing-4)',
  },
  // Keep heading + lede tight; the code blocks below provide the
  // visual breathing room.
  heading: {
    margin: 0,
  },
});

interface ThemeInstallBlockProps {
  /** Full npm package name, e.g. `@astryxdesign/theme-y2k`. */
  packageName: string;
  /** Friendly wordmark, e.g. `Y2K`. */
  themeLabel: string;
}

/**
 * Inline "Use this theme" affordance shown above the themed preview on the
 * /themes explorer. Surfaces the two-step path — `npm install` and the
 * matching `import` — so visitors can copy both without hunting through the
 * separate /docs/theme guide. Renders the code inline (rather than behind a
 * popover) because the report on issue #3082 was specifically that the
 * install instructions weren't discoverable on the theme preview itself.
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
    <div {...stylex.props(styles.block)}>
      <Card padding={0} xstyle={styles.card}>
        <VStack gap={3}>
          <VStack gap={1}>
            <Heading level={2} xstyle={styles.heading}>
              Use the {themeLabel} theme
            </Heading>
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
          <Card padding={0}>
            <CodeExampleBlock
              code={installCode}
              language="bash"
              hasCopyButton
            />
          </Card>
          <Card padding={0}>
            <CodeExampleBlock code={importCode} language="tsx" hasCopyButton />
          </Card>
        </VStack>
      </Card>
    </div>
  );
}
