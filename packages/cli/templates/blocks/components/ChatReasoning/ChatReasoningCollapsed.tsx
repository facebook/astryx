'use client';

import {XDSChatReasoning} from '@xds/lab/ChatReasoning';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ChatReasoningCollapsed() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Default label with duration
        </XDSText>
        <XDSChatReasoning duration="12s">
          Let me work through the constraints systematically. The farmer has 3
          fields and rotates wheat, corn, soy. No same crop in adjacent fields
          and no same crop in the same field two years in a row.
        </XDSChatReasoning>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Custom label with duration
        </XDSText>
        <XDSChatReasoning label="Analyzing" duration="3s">
          Checking the codebase for similar patterns and reviewing the test
          coverage to identify any gaps in the current implementation.
        </XDSChatReasoning>
      </XDSStack>
    </XDSStack>
  );
}
