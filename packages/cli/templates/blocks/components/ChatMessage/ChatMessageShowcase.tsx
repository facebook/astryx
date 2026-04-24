'use client';

import {
  XDSChatMessageList,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageMetadata,
  XDSChatSystemMessage,
} from '@xds/core/Chat';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSText} from '@xds/core/Text';
import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';

export default function ChatMessageShowcase() {
  return (
    <XDSVStack gap={4}>
      <XDSText type="supporting" color="secondary">
        With message bubbles
      </XDSText>
      <XDSChatMessageList>
        <XDSChatSystemMessage variant="divider">
          Today
        </XDSChatSystemMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={<XDSTimestamp value="2026-03-15T14:30:00" format="time" />}
                status="read"
              />
            }>
            Can you review my pull request?
          </XDSChatMessageBubble>
        </XDSChatMessage>

        {/* Full props: avatar, name, bubble, multi-bubble group, metadata with actions */}
        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size="small" />}>
          <XDSChatMessageBubble
            group="first"
            name={
              <XDSText type="supporting" weight="semibold" color="secondary">
                Navi
              </XDSText>
            }>
            Sure! I took a look at PR #1742.
          </XDSChatMessageBubble>
          <XDSChatMessageBubble
            group="last"
            metadata={
              <XDSChatMessageMetadata
                timestamp={<XDSTimestamp value="2026-03-15T14:31:00" format="time" />}
                footer={
                  <XDSHStack gap={1}>
                    <XDSButton
                      label="Copy"
                      variant="ghost"
                      size="sm"
                      icon={<XDSIcon icon="copy" size="sm" />}
                      isIconOnly
                      onClick={() => {}}
                    />
                    <XDSText type="supporting" color="secondary">
                      Claude Opus 4.6
                    </XDSText>
                  </XDSHStack>
                }
              />
            }>
            The changes look great — clean code, good test coverage. Ship it!
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble
            metadata={
              <XDSChatMessageMetadata
                timestamp={<XDSTimestamp value="2026-03-15T14:32:00" format="time" />}
                status="delivered"
              />
            }>
            Thanks, shipping now!
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>

      <XDSText type="supporting" color="secondary">
        Without message bubbles (ghost variant)
      </XDSText>
      <XDSChatMessageList>
        <XDSChatMessage
          sender="assistant"
          avatar={<XDSAvatar name="Navi" size="small" />}
          name={
            <XDSText type="supporting" weight="semibold" color="secondary">
              Navi
            </XDSText>
          }
          metadata={
            <XDSChatMessageMetadata
              timestamp={<XDSTimestamp value="2026-03-15T14:31:00" format="time" />}
              footer={<XDSText type="supporting" color="secondary">Claude Opus 4.6</XDSText>}
            />
          }>
          <XDSChatMessageBubble variant="ghost">
            Here is a response without a visible bubble boundary. The ghost
            variant keeps padding for alignment but renders transparent.
          </XDSChatMessageBubble>
        </XDSChatMessage>

        <XDSChatMessage sender="user">
          <XDSChatMessageBubble variant="ghost">
            User messages can also use the ghost variant for a minimal look.
          </XDSChatMessageBubble>
        </XDSChatMessage>
      </XDSChatMessageList>
    </XDSVStack>
  );
}
