// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file defaultCode.ts
 * @output The default TSX source shown in the playground's Monaco editor.
 * @position Playground — the initial example users see and edit.
 *
 * A minimal, self-contained Card example (header, body text, footer button)
 * that runs in the preview sandbox (see playground/preview/runner.ts).
 * Kept as a string because the playground edits/compiles it as user code rather
 * than importing it.
 *
 * The example is wrapped in the playground's standard theme scaffold: an
 * `appTheme` declared with `defineTheme` and applied via a root `<Theme>`. This
 * makes the theme the code's source of truth — the Theme editor edits
 * `appTheme.tokens` (global styles) and targeting in Theme mode edits
 * `appTheme.components` (per-component-type overrides). See themeSource.ts.
 */

export const DEFAULT_CODE = `import {Card} from '@astryxdesign/core/Card';
import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
  HStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Theme, defineTheme} from '@astryxdesign/core/theme';

// Global theme — edit in the Theme editor, or by hand here. Applied via <Theme>.
const appTheme = defineTheme({
  name: 'custom',
});

export default function Example() {
  return (
    <Theme theme={appTheme}>
      <Card width="100%" maxWidth={480} padding={4}>
        <Layout
          header={
            <LayoutHeader>
              <Heading level={2}>Welcome to Astryx Playground</Heading>
            </LayoutHeader>
          }
          content={
            <LayoutContent>
              <Text type="body" color="secondary">
                Edit components in the code editor, target an element to tweak
                its design, and build a theme — all in one place.
              </Text>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} hAlign="end" wrap="wrap">
                <Button label="Learn more" variant="secondary" />
                <Button label="Get started" variant="primary" />
              </HStack>
            </LayoutFooter>
          }
        />
      </Card>
    </Theme>
  );
}`;
