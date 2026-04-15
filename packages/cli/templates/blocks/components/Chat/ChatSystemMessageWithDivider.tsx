'use client';

import {XDSChatSystemMessage} from '@xds/core/Chat';

export default function ChatSystemMessageWithDivider() {
  return <XDSChatSystemMessage variant="divider">Today</XDSChatSystemMessage>;
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: ChatSystemMessageWithDivider,
};
