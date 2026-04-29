'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    maxWidth: 600,
  },
});

export default function ChatMessageShowcase() {
  return (
    <XDSStack direction="vertical" gap={4} xstyle={styles.root}>
      <XDSChatMessageList>
        <XDSChatMessage sender="user">
          <XDSChatMessageBubble group="first">
            I just pushed the refactored auth module.
          </XDSChatMessageBubble>
          <XDSChatMessageBubble
            group="last"
            metadata={
              <XDSChatMessageMetadata
                timestamp={
                  <XDSTimestamp value="2026-04-28T14:30:00" format="time" />
                }
                status="read"
              />
            }>
            Can you review the token validation changes?
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Agent" size="small" />}
          name={
            <XDSText type="supporting" weight="semibold" color="secondary">
              Agent
            </XDSText>
          }
          metadata={
            <XDSChatMessageMetadata
              timestamp={
                <XDSTimestamp value="2026-04-28T14:31:00" format="time" />
              }
              footer={
                <XDSText type="supporting" color="secondary">
                  Claude Opus 4.6
                </XDSText>
              }
            />
          }>
          <XDSChatMessageBubble variant="ghost">
            Looks good — the refresh token rotation is solid and the error
            handling covers all the edge cases. Ship it.
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </XDSStack>
  );
}
