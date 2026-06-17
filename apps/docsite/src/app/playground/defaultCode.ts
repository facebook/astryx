// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file defaultCode.ts
 * @output The default TSX source shown in the playground's Monaco editor.
 * @position Playground — the initial example users see and edit.
 *
 * A minimal, self-contained Card example (header, body text, footer button)
 * that runs in the preview sandbox (see (preview)/playground-preview/runner.ts).
 * Kept as a string because the playground edits/compiles it as user code rather
 * than importing it.
 */

export const DEFAULT_CODE = `import {Card} from '@xds/core/Card';
import {
  Layout,
  LayoutHeader,
  LayoutContent,
  LayoutFooter,
  HStack,
} from '@xds/core/Layout';
import {Text, Heading} from '@xds/core/Text';
import {Button} from '@xds/core/Button';

export default function Example() {
  return (
    <Card width={400} padding={4}>
      <Layout
        header={
          <LayoutHeader hasDivider>
            <Heading level={2}>Welcome</Heading>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <Text type="body" color="secondary">
              Try out components in the code editor, open a ready-made templates,
              and build your own theme in the theme editor — all in one place.
            </Text>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack hAlign="end">
              <Button label="Get started" variant="primary" />
            </HStack>
          </LayoutFooter>
        }
      />
    </Card>
  );
}`;
