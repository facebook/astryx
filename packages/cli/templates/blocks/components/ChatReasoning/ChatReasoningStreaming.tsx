'use client';

import {XDSChatReasoning} from '@xds/lab';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatReasoningStreaming() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Default streaming label
        </XDSText>
        <XDSChatReasoning isStreaming>
          Working through the combinatorial constraints and evaluating possible
          solutions for the optimization problem.
        </XDSChatReasoning>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Custom streaming label
        </XDSText>
        <XDSChatReasoning isStreaming label="Analyzing">
          Reviewing the repository structure and identifying relevant files for
          the requested changes.
        </XDSChatReasoning>
      </XDSStack>
    </XDSStack>
  );
}
