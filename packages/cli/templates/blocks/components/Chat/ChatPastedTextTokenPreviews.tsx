'use client';

import {XDSChatPastedTextToken} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const SHORT_TEXT = 'SELECT id, name FROM users WHERE active = true;';

const MULTI_LINE_TEXT = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`;

const LONG_TEXT =
  'The quick brown fox jumps over the lazy dog. ' +
  'Pack my box with five dozen liquor jugs. ' +
  'How vexingly quick daft zebras jump. ' +
  'The five boxing wizards jump quickly. ' +
  'Sphinx of black quartz, judge my vow.';

export default function ChatPastedTextTokenPreviews() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Short single-line text
        </XDSText>
        <XDSStack direction="horizontal" gap={2}>
          <XDSChatPastedTextToken text={SHORT_TEXT} />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Multi-line code snippet
        </XDSText>
        <XDSStack direction="horizontal" gap={2}>
          <XDSChatPastedTextToken text={MULTI_LINE_TEXT} />
        </XDSStack>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Long paragraph
        </XDSText>
        <XDSStack direction="horizontal" gap={2}>
          <XDSChatPastedTextToken text={LONG_TEXT} />
        </XDSStack>
      </XDSStack>
    </XDSStack>
  );
}
