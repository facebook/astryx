// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file defaultCode.ts
 * @output The default TSX source shown in the playground's Monaco editor.
 * @position Playground — the initial example users see and edit.
 *
 * A minimal, self-contained XDSCard example (header, body text, footer button)
 * that runs in the preview sandbox (see (preview)/playground-preview/runner.ts).
 * Kept as a string because the playground edits/compiles it as user code rather
 * than importing it.
 */

export const DEFAULT_CODE = `import {XDSCard} from '@xds/core/Card';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSHStack,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

export default function Example() {
  return (
    <XDSCard width={400} padding={4}>
      <XDSLayout
        header={
          <XDSLayoutHeader hasDivider>
            <XDSHeading level={2}>Welcome</XDSHeading>
          </XDSLayoutHeader>
        }
        content={
          <XDSLayoutContent>
            <XDSText type="body" color="secondary">
              Try out components in the code editor, open a ready-made templates,
              and build your own theme in the theme editor — all in one place.
            </XDSText>
          </XDSLayoutContent>
        }
        footer={
          <XDSLayoutFooter hasDivider>
            <XDSHStack hAlign="end">
              <XDSButton label="Get started" variant="primary" />
            </XDSHStack>
          </XDSLayoutFooter>
        }
      />
    </XDSCard>
  );
}`;
