# Chat

Chat layout components for AI chat interfaces.

## Files

| File                       | Purpose                                                           |
| -------------------------- | ----------------------------------------------------------------- |
| `XDSChatMessageList.tsx`   | Scrollable message container with auto-scroll and infinite scroll |
| `XDSChatMessage.tsx`       | Sender context wrapper — avatar, name, alignment by role          |
| `XDSChatMessageBubble.tsx` | Styled bubble container — reads sender from context               |
| `XDSChatSystemMessage.tsx` | Centered system/notice messages with optional divider             |
| `XDSChatContext.tsx`       | Internal React contexts for sender and density propagation        |
| `index.ts`                 | Public exports                                                    |

## Architecture

```
XDSChatMessageList           — scrollable container, auto-scroll
  XDSChatSystemMessage       — date separators, status notices
  XDSChatMessage             — sender context (avatar, name, alignment)
    XDSChatMessageBubble     — styled bubble (optional per content)
    (any other content)      — asset lists, tool calls, images
```

## Context Flow

- `XDSChatListContext` — density from list to messages
- `XDSChatMessageContext` — sender + density from message to bubbles

Both contexts are internal (not exported). Only types are public.
