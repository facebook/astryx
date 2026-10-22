// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AskYourAgent.tsx
 * @input One guide's CLI line
 * @output The "Ask your agent" block that ends a guide page
 * @position Docsite guide pages: the visible join between a guide and the
 *   command an agent runs for it
 */

import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {AnchorHeading} from './AnchorHeading';
import {CodeBlockRenderer} from './CodeBlock';

export function AskYourAgent({command}: {command: string}) {
  return (
    <VStack gap={3}>
      <AnchorHeading id="ask-your-agent" level={2} type="display-3">
        Ask your agent
      </AnchorHeading>
      <Text type="body" color="secondary">
        The line a coding agent runs for this guide:
      </Text>
      <CodeBlockRenderer lang="bash" code={command} />
    </VStack>
  );
}
