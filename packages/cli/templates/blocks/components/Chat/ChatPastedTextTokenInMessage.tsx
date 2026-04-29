'use client';

import {
  XDSChatPastedTextToken,
  XDSChatMessage,
  XDSChatMessageBubble,
  XDSChatMessageList,
} from '@xds/core/Chat';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const PASTED_CODE = `import {useState} from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}`;

const PASTED_ERROR = `TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (UserList.tsx:14:22)
    at renderWithHooks (react-dom.js:16305:18)
    at mountIndeterminateComponent (react-dom.js:20069:13)`;

export default function ChatPastedTextTokenInMessage() {
  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          User shares a code snippet
        </XDSText>
        <XDSChatMessageList>
          <XDSChatMessage sender="user">
            <XDSChatMessageBubble>
              <XDSStack direction="vertical" gap={2}>
                <XDSText type="body">Can you review this component?</XDSText>
                <XDSChatPastedTextToken text={PASTED_CODE} />
              </XDSStack>
            </XDSChatMessageBubble>
          </XDSChatMessage>
        </XDSChatMessageList>
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          User shares an error log
        </XDSText>
        <XDSChatMessageList>
          <XDSChatMessage sender="user">
            <XDSChatMessageBubble>
              <XDSStack direction="vertical" gap={2}>
                <XDSText type="body">
                  I'm getting this error in production:
                </XDSText>
                <XDSChatPastedTextToken text={PASTED_ERROR} />
              </XDSStack>
            </XDSChatMessageBubble>
          </XDSChatMessage>
        </XDSChatMessageList>
      </XDSStack>
    </XDSStack>
  );
}
