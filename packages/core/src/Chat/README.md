# Chat

Chat components for AI chat interfaces — layout (messages, bubbles) and composer (input, trigger menus, attachments).

## Files

| File                         | Purpose                                                           |
| ---------------------------- | ----------------------------------------------------------------- |
| `XDSChatMessageList.tsx`     | Scrollable message container with auto-scroll and infinite scroll |
| `XDSChatMessage.tsx`         | Sender context wrapper — avatar, name, alignment by role          |
| `XDSChatMessageBubble.tsx`   | Styled bubble container — reads sender from context               |
| `XDSChatMessageMetadata.tsx` | Timestamp + status display for bubbles                            |
| `XDSChatSystemMessage.tsx`   | Centered system/notice messages with optional divider             |
| `XDSChatComposer.tsx`        | Layout shell with named slots, concentric radius, hover shadows   |
| `XDSChatComposerInput.tsx`   | ContentEditable with trigger menus, tokens, history, paste/drop   |
| `XDSChatComposerDrawer.tsx`  | Collapsible drawer panel for supplementary content                |
| `useTriggerMenu.tsx`         | Internal hook — trigger detection, popover, keyboard nav, search  |
| `useAutoScroll.ts`           | Internal hook — auto-scroll and "new messages" detection          |
| `XDSChatContext.tsx`         | Internal React contexts for sender and density propagation        |
| `index.ts`                   | Public exports                                                    |

## Architecture

```
XDSChatMessageList             — scrollable container, auto-scroll
  XDSChatSystemMessage         — date separators, status notices
  XDSChatMessage               — sender context (avatar, name, alignment)
    XDSChatMessageBubble       — styled bubble (optional per content)
    (any other content)        — asset lists, tool calls, images

XDSChatComposer                — layout shell with named slots
  XDSChatComposerDrawer   — collapsible drawer (attachments, context, etc.)
  XDSChatComposerInput         — contentEditable with trigger menus
    useTriggerMenu             — @ mentions, / commands via XDSSearchSource
```

## Context Flow

- `XDSChatListContext` — density from list to messages
- `XDSChatMessageContext` — sender + density from message to bubbles

Both contexts are internal (not exported). Only types are public.

## Theming

### Component CSS Vars

| Var                  | Default              | Description                        |
| -------------------- | -------------------- | ---------------------------------- |
| `--composer-radius`  | `var(--radius-page)` | Border radius of the composer body |
| `--composer-padding` | `var(--spacing-3)`   | Padding of the composer body       |

### Concentric Radius

Inner elements (buttons, tokens) derive their radius from the container:

```css
--radius-element: calc(var(--composer-radius) - var(--composer-padding));
```

Default: `28px - 12px = 16px`, which fully rounds 32px buttons.

Only `--radius-element` is overridden — `--radius-container` is left alone
so popovers, hovercards, and tooltips keep their normal surface radius.

### Theme Override Example

```ts
defineTheme({
  components: {
    'chat-composer': {
      base: {
        '--composer-radius': '20px',
        '--composer-padding': '16px',
      },
    },
  },
});
```

### Theming Targets

| Class                     | Variants | States |
| ------------------------- | -------- | ------ |
| `xds-chat-composer`       | density  | —      |
| `xds-chat-composer-input` | —        | —      |
