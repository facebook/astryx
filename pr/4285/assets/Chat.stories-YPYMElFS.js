import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Button-BBk5Kqd0.js";import{t as r}from"./Button-CRpvXAU4.js";import{i,t as a}from"./Avatar-t1EyN3Lb.js";import{i as o,t as s}from"./CodeBlock-IQAiM3j8.js";import{o as c,t as l}from"./Stack-C7dTtCDZ.js";import{n as u,t as d}from"./Token-BXBfAklS.js";import{Br as f,C as p,Cr as m,Hr as h,Ir as g,Pr as _,Rr as v,Sr as y,Tr as b,w as x}from"./iframe-BPhJd9TG.js";import{Jt as S,ct as C,t as w,ut as T}from"./esm-DA7gAIBC.js";var E,D,O,k,A,j,M,N,P,F,I;e((()=>{b(),a(),y(),d(),l(),s(),r(),p(),w(),E=t(),D={title:`Core/Chat`,component:h,tags:[`autodocs`]},O={name:`Default`,render:()=>(0,E.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`},children:(0,E.jsxs)(h,{children:[(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{metadata:(0,E.jsx)(g,{timestamp:(0,E.jsx)(x,{value:`2026-03-15T14:30:00`,format:`time`}),status:`read`}),children:`How should I handle state management in a React app?`})}),(0,E.jsxs)(f,{sender:`assistant`,children:[(0,E.jsx)(m,{density:`compact`,children:`For most cases, **React's built-in state** is sufficient:

- \`useState\` for local component state
- \`useReducer\` for complex state logic
- \`useContext\` for shared state across a subtree

For **server state**, use a library like **TanStack Query** or **SWR** — they handle caching, revalidation, and loading states out of the box.

Avoid global state managers unless you have a genuine need for cross-cutting state. Most apps are over-engineered in this area.`}),(0,E.jsx)(g,{timestamp:(0,E.jsx)(x,{value:`2026-03-15T14:30:30`,format:`time`}),footer:(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(`span`,{children:`Claude Opus 4.6`}),(0,E.jsx)(`span`,{children:`·`}),(0,E.jsx)(n,{label:`Thumbs up`,icon:(0,E.jsx)(C,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0}),(0,E.jsx)(n,{label:`Thumbs down`,icon:(0,E.jsx)(T,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0}),(0,E.jsx)(n,{label:`Copy`,icon:(0,E.jsx)(S,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0})]})})]}),(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{metadata:(0,E.jsx)(g,{timestamp:(0,E.jsx)(x,{value:`2026-03-15T14:31:00`,format:`time`}),status:`read`}),children:`Can you show me a useReducer example?`})}),(0,E.jsxs)(f,{sender:`assistant`,children:[(0,E.jsx)(m,{density:`compact`,children:`Here's a common pattern for form state:`}),(0,E.jsx)(o,{code:`const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, initialState);`,language:`tsx`}),(0,E.jsx)(m,{density:`compact`,children:"This keeps all your form logic in one place. The reducer is pure and easy to test — just pass in state and action, assert on the output.\n\n| Hook | Use case | Re-renders | Complexity | Best for |\n|------|----------|------------|------------|----------|\n| `useState` | Simple values | On every set | Low | Toggles, inputs, counters |\n| `useReducer` | Complex state logic | On dispatch | Medium | Forms, multi-field state |\n| `useContext` | Shared subtree state | All consumers | Low | Theme, auth, locale |\n| `useSyncExternalStore` | External stores | On snapshot change | High | Redux, Zustand, signals |\n| `useRef` | Mutable values | Never | Low | DOM refs, timers, previous values |"}),(0,E.jsx)(g,{timestamp:(0,E.jsx)(x,{value:`2026-03-15T14:31:30`,format:`time`}),footer:(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(`span`,{children:`Claude Opus 4.6`}),(0,E.jsx)(`span`,{children:`·`}),(0,E.jsx)(n,{label:`Thumbs up`,icon:(0,E.jsx)(C,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0}),(0,E.jsx)(n,{label:`Thumbs down`,icon:(0,E.jsx)(T,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0}),(0,E.jsx)(n,{label:`Copy`,icon:(0,E.jsx)(S,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0})]})})]})]})})},k={name:`Mixed Content`,render:()=>(0,E.jsx)(`div`,{style:{height:600,display:`flex`,flexDirection:`column`},children:(0,E.jsxs)(h,{children:[(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{children:`Show me the component files and explain the architecture`})}),(0,E.jsxs)(f,{sender:`assistant`,children:[(0,E.jsx)(v,{children:`Sure! Here's an overview of the component architecture.`}),(0,E.jsx)(v,{variant:`ghost`,children:(0,E.jsx)(m,{density:`compact`,children:`The system uses a **compound component** pattern with three layers:

1. **MessageList** — scrollable container with auto-scroll
2. **Message** — layout wrapper with sender context
3. **Bubble** — styled content container`})}),(0,E.jsxs)(v,{variant:`ghost`,children:[(0,E.jsx)(m,{density:`compact`,children:`Here are the files:`}),(0,E.jsxs)(c,{gap:2,wrap:`wrap`,children:[(0,E.jsx)(u,{label:`Button.tsx`}),(0,E.jsx)(u,{label:`Card.tsx`}),(0,E.jsx)(u,{label:`Dialog.tsx`})]}),(0,E.jsx)(o,{code:`export * from './Button';
export * from './Card';
export * from './Dialog';`,language:`typescript`})]}),(0,E.jsx)(v,{children:`Let me know which one to open — I can walk through the implementation.`})]}),(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{children:`Open Button.tsx`})}),(0,E.jsx)(_,{children:`Navi opened Button.tsx`}),(0,E.jsx)(f,{sender:`assistant`,children:(0,E.jsxs)(v,{variant:`ghost`,children:[(0,E.jsx)(o,{code:`import * as stylex from '@stylexjs/stylex';

export function Button({ label, variant = 'primary' }) {
  return (
    <button {...stylex.props(styles.base, styles[variant])}>
      {label}
    </button>
  );
}`,language:`tsx`}),(0,E.jsx)(m,{density:`compact`,children:`The Button uses StyleX for styles and reads variant from props.`})]})})]})})},A={name:`Chat Conversation`,render:()=>{let e={fontSize:12,fontWeight:600,color:`#666`,lineHeight:`16px`};return(0,E.jsx)(`div`,{style:{height:500,display:`flex`,flexDirection:`column`},children:(0,E.jsxs)(h,{children:[(0,E.jsx)(_,{variant:`divider`,children:`Today`}),(0,E.jsx)(f,{sender:`assistant`,avatar:(0,E.jsx)(i,{name:`Navi`,size:`md`}),children:(0,E.jsx)(v,{name:(0,E.jsx)(`span`,{style:e,children:`Navi`}),metadata:(0,E.jsx)(g,{timestamp:(0,E.jsx)(x,{value:`2026-03-15T14:30:00`,format:`time`})}),children:`Hey! I looked at the PR and left a few comments on the density styles.`})}),(0,E.jsxs)(f,{sender:`user`,avatar:(0,E.jsx)(i,{name:`Cindy`,size:`md`}),children:[(0,E.jsx)(v,{group:`first`,name:(0,E.jsx)(`span`,{style:e,children:`Cindy`}),children:`Thanks! I'll take a look.`}),(0,E.jsx)(v,{group:`last`,metadata:(0,E.jsx)(g,{timestamp:(0,E.jsx)(x,{value:`2026-03-15T14:31:00`,format:`time`}),status:`read`}),children:`Should be quick to fix.`})]}),(0,E.jsx)(f,{sender:`assistant`,avatar:(0,E.jsx)(i,{name:`Navi`,size:`md`}),children:(0,E.jsx)(v,{name:(0,E.jsx)(`span`,{style:e,children:`Navi`}),metadata:(0,E.jsx)(g,{timestamp:(0,E.jsx)(x,{value:`2026-03-15T14:32:00`,format:`time`})}),children:`Sounds good. The main thing is the compact radius — it should use the container token, not the page token.`})}),(0,E.jsx)(f,{sender:`user`,avatar:(0,E.jsx)(i,{name:`Cindy`,size:`md`}),children:(0,E.jsx)(v,{name:(0,E.jsx)(`span`,{style:e,children:`Cindy`}),metadata:(0,E.jsx)(g,{timestamp:(0,E.jsx)(x,{value:`2026-03-15T14:33:00`,format:`time`}),status:`delivered`}),children:`Good catch, fixed and pushed.`})}),(0,E.jsx)(_,{children:`Cindy liked a message`})]})})}},j={name:`Density Comparison`,render:()=>{let e={compact:`sm`,balanced:`md`,spacious:`md`},t=t=>(0,E.jsxs)(`div`,{style:{flex:1,display:`flex`,flexDirection:`column`,minWidth:0,border:`1px solid var(--color-border-primary)`,borderRadius:8},children:[(0,E.jsx)(`div`,{style:{padding:`8px 12px`,borderBottom:`1px solid var(--color-border-primary)`,fontSize:12,fontWeight:600,textTransform:`uppercase`,letterSpacing:`0.05em`},children:t}),(0,E.jsx)(`div`,{style:{flex:1,display:`flex`,flexDirection:`column`,minHeight:0},children:(0,E.jsxs)(h,{density:t,children:[(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{children:`How does the density system work?`})}),(0,E.jsx)(f,{sender:`assistant`,avatar:(0,E.jsx)(i,{name:`Navi`,size:e[t]}),children:(0,E.jsx)(m,{density:`compact`,children:`Density controls **spacing** at every level:

- **Default gap** between messages
- **Padding** inside bubbles
- **Gap** between child elements

Use gap when top-level rows need different spacing from density.

This is the **${t}** density. ${t===`compact`?`Great for sidebars and panels where space is limited.`:t===`spacious`?`Ideal for long-form reading where breathing room helps comprehension.`:`The default — works well for most full-page chat interfaces.`}`})}),(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{children:`Makes sense, thanks!`})})]})})]});return(0,E.jsxs)(`div`,{style:{display:`flex`,gap:16,height:500},children:[t(`compact`),t(`balanced`),t(`spacious`)]})}},M={name:`Message Gap Override`,render:()=>(0,E.jsx)(`div`,{style:{height:420,display:`flex`,flexDirection:`column`},children:(0,E.jsxs)(h,{density:`compact`,gap:5,children:[(0,E.jsx)(f,{sender:`assistant`,children:(0,E.jsx)(v,{name:`Clio`,children:`Starting the requested change.`})}),(0,E.jsx)(f,{sender:`assistant`,children:(0,E.jsx)(v,{variant:`ghost`,children:`Reading repository context and relevant files...`})}),(0,E.jsx)(f,{sender:`assistant`,children:(0,E.jsx)(v,{variant:`ghost`,children:`Running tests for the updated package.`})}),(0,E.jsx)(f,{sender:`assistant`,children:(0,E.jsx)(v,{metadata:(0,E.jsx)(g,{footer:`Done`}),children:`The patch is ready for review.`})})]})})},N={name:`System Messages`,render:()=>(0,E.jsx)(`div`,{style:{height:400,display:`flex`,flexDirection:`column`},children:(0,E.jsxs)(h,{children:[(0,E.jsx)(_,{variant:`divider`,children:`March 15, 2026`}),(0,E.jsx)(f,{sender:`assistant`,avatar:(0,E.jsx)(i,{name:`Navi`,size:`md`}),children:(0,E.jsx)(m,{density:`compact`,children:`Good morning!`})}),(0,E.jsx)(_,{children:`Conversation started`}),(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{children:`Hey Navi`})}),(0,E.jsx)(_,{variant:`divider`,children:`Today`}),(0,E.jsx)(_,{children:`Cindy shared a file`})]})})},P={name:`Message Status`,render:()=>(0,E.jsx)(`div`,{style:{height:400,display:`flex`,flexDirection:`column`},children:(0,E.jsxs)(h,{children:[(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{metadata:(0,E.jsx)(g,{status:`sending`}),children:`Sending...`})}),(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{metadata:(0,E.jsx)(g,{status:`sent`}),children:`Sent`})}),(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{metadata:(0,E.jsx)(g,{status:`delivered`}),children:`Delivered`})}),(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{metadata:(0,E.jsx)(g,{status:`read`}),children:`Read`})}),(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{metadata:(0,E.jsx)(g,{status:`error`}),children:`Failed to send`})})]})})},F={name:`Multi-Bubble Grouping`,render:()=>(0,E.jsx)(`div`,{style:{height:500,display:`flex`,flexDirection:`column`},children:(0,E.jsxs)(h,{children:[(0,E.jsxs)(f,{sender:`user`,children:[(0,E.jsx)(v,{group:`first`,children:`Hey, can you review my PR?`}),(0,E.jsx)(v,{group:`middle`,children:`It's the one for the chat components`}),(0,E.jsx)(v,{group:`last`,metadata:(0,E.jsx)(g,{timestamp:(0,E.jsx)(x,{value:`2026-03-15T14:31:00`,format:`time`}),status:`delivered`}),children:`Link: github.com/facebook/astryx/pull/1180`})]}),(0,E.jsxs)(f,{sender:`assistant`,avatar:(0,E.jsx)(i,{name:`Navi`,size:`md`}),children:[(0,E.jsx)(v,{group:`first`,children:`Sure, looking at it now!`}),(0,E.jsx)(v,{group:`middle`,children:`The compound pattern looks solid. A few minor comments on the density styles.`}),(0,E.jsx)(v,{group:`last`,metadata:(0,E.jsx)(g,{timestamp:(0,E.jsx)(x,{value:`2026-03-15T14:33:00`,format:`time`})}),children:`I'll leave them as review comments.`})]}),(0,E.jsx)(f,{sender:`user`,children:(0,E.jsx)(v,{metadata:(0,E.jsx)(g,{timestamp:(0,E.jsx)(x,{value:`2026-03-15T14:34:00`,format:`time`}),status:`sending`}),children:`Thanks, will address those`})})]})})},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'Default',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
      <ChatMessageList>
        <ChatMessage sender="user">
          <ChatMessageBubble metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:30:00" format="time" />} status="read" />}>
            How should I handle state management in a React app?
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="assistant">
          <Markdown density="compact">{\`For most cases, **React's built-in state** is sufficient:

- \\\`useState\\\` for local component state
- \\\`useReducer\\\` for complex state logic
- \\\`useContext\\\` for shared state across a subtree

For **server state**, use a library like **TanStack Query** or **SWR** — they handle caching, revalidation, and loading states out of the box.

Avoid global state managers unless you have a genuine need for cross-cutting state. Most apps are over-engineered in this area.\`}</Markdown>
          <ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:30:30" format="time" />} footer={<>
                <span>Claude Opus 4.6</span>
                <span>·</span>
                <Button label="Thumbs up" icon={<HandThumbUpIcon style={{
            width: 14,
            height: 14
          }} />} variant="ghost" size="sm" isIconOnly />
                <Button label="Thumbs down" icon={<HandThumbDownIcon style={{
            width: 14,
            height: 14
          }} />} variant="ghost" size="sm" isIconOnly />
                <Button label="Copy" icon={<ClipboardDocumentIcon style={{
            width: 14,
            height: 14
          }} />} variant="ghost" size="sm" isIconOnly />
              </>} />
        </ChatMessage>
        <ChatMessage sender="user">
          <ChatMessageBubble metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:31:00" format="time" />} status="read" />}>
            Can you show me a useReducer example?
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="assistant">
          <Markdown density="compact">
            Here's a common pattern for form state:
          </Markdown>
          <CodeBlock code={\`const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, initialState);\`} language="tsx" />
          <Markdown density="compact">{\`This keeps all your form logic in one place. The reducer is pure and easy to test — just pass in state and action, assert on the output.

| Hook | Use case | Re-renders | Complexity | Best for |
|------|----------|------------|------------|----------|
| \\\`useState\\\` | Simple values | On every set | Low | Toggles, inputs, counters |
| \\\`useReducer\\\` | Complex state logic | On dispatch | Medium | Forms, multi-field state |
| \\\`useContext\\\` | Shared subtree state | All consumers | Low | Theme, auth, locale |
| \\\`useSyncExternalStore\\\` | External stores | On snapshot change | High | Redux, Zustand, signals |
| \\\`useRef\\\` | Mutable values | Never | Low | DOM refs, timers, previous values |\`}</Markdown>
          <ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:31:30" format="time" />} footer={<>
                <span>Claude Opus 4.6</span>
                <span>·</span>
                <Button label="Thumbs up" icon={<HandThumbUpIcon style={{
            width: 14,
            height: 14
          }} />} variant="ghost" size="sm" isIconOnly />
                <Button label="Thumbs down" icon={<HandThumbDownIcon style={{
            width: 14,
            height: 14
          }} />} variant="ghost" size="sm" isIconOnly />
                <Button label="Copy" icon={<ClipboardDocumentIcon style={{
            width: 14,
            height: 14
          }} />} variant="ghost" size="sm" isIconOnly />
              </>} />
        </ChatMessage>
      </ChatMessageList>
    </div>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Mixed Content',
  render: () => <div style={{
    height: 600,
    display: 'flex',
    flexDirection: 'column'
  }}>
      <ChatMessageList>
        <ChatMessage sender="user">
          <ChatMessageBubble>
            Show me the component files and explain the architecture
          </ChatMessageBubble>
        </ChatMessage>

        <ChatMessage sender="assistant">
          <ChatMessageBubble>
            Sure! Here's an overview of the component architecture.
          </ChatMessageBubble>
          <ChatMessageBubble variant="ghost">
            <Markdown density="compact">{\`The system uses a **compound component** pattern with three layers:

1. **MessageList** — scrollable container with auto-scroll
2. **Message** — layout wrapper with sender context
3. **Bubble** — styled content container\`}</Markdown>
          </ChatMessageBubble>
          <ChatMessageBubble variant="ghost">
            <Markdown density="compact">Here are the files:</Markdown>
            <HStack gap={2} wrap="wrap">
              <Token label="Button.tsx" />
              <Token label="Card.tsx" />
              <Token label="Dialog.tsx" />
            </HStack>
            <CodeBlock code={"export * from './Button';\\nexport * from './Card';\\nexport * from './Dialog';"} language="typescript" />
          </ChatMessageBubble>
          <ChatMessageBubble>
            Let me know which one to open — I can walk through the
            implementation.
          </ChatMessageBubble>
        </ChatMessage>

        <ChatMessage sender="user">
          <ChatMessageBubble>Open Button.tsx</ChatMessageBubble>
        </ChatMessage>

        <ChatSystemMessage>Navi opened Button.tsx</ChatSystemMessage>

        <ChatMessage sender="assistant">
          <ChatMessageBubble variant="ghost">
            <CodeBlock code={\`import * as stylex from '@stylexjs/stylex';

export function Button({ label, variant = 'primary' }) {
  return (
    <button {...stylex.props(styles.base, styles[variant])}>
      {label}
    </button>
  );
}\`} language="tsx" />
            <Markdown density="compact">{\`The Button uses StyleX for styles and reads variant from props.\`}</Markdown>
          </ChatMessageBubble>
        </ChatMessage>
      </ChatMessageList>
    </div>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'Chat Conversation',
  render: () => {
    const nameStyle = {
      fontSize: 12,
      fontWeight: 600,
      color: '#666',
      lineHeight: '16px'
    };
    return <div style={{
      height: 500,
      display: 'flex',
      flexDirection: 'column'
    }}>
        <ChatMessageList>
          <ChatSystemMessage variant="divider">Today</ChatSystemMessage>
          <ChatMessage sender="assistant" avatar={<Avatar name="Navi" size="md" />}>
            <ChatMessageBubble name={<span style={nameStyle}>Navi</span>} metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:30:00" format="time" />} />}>
              Hey! I looked at the PR and left a few comments on the density
              styles.
            </ChatMessageBubble>
          </ChatMessage>

          <ChatMessage sender="user" avatar={<Avatar name="Cindy" size="md" />}>
            <ChatMessageBubble group="first" name={<span style={nameStyle}>Cindy</span>}>
              Thanks! I'll take a look.
            </ChatMessageBubble>
            <ChatMessageBubble group="last" metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:31:00" format="time" />} status="read" />}>
              Should be quick to fix.
            </ChatMessageBubble>
          </ChatMessage>

          <ChatMessage sender="assistant" avatar={<Avatar name="Navi" size="md" />}>
            <ChatMessageBubble name={<span style={nameStyle}>Navi</span>} metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:32:00" format="time" />} />}>
              Sounds good. The main thing is the compact radius — it should use
              the container token, not the page token.
            </ChatMessageBubble>
          </ChatMessage>

          <ChatMessage sender="user" avatar={<Avatar name="Cindy" size="md" />}>
            <ChatMessageBubble name={<span style={nameStyle}>Cindy</span>} metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:33:00" format="time" />} status="delivered" />}>
              Good catch, fixed and pushed.
            </ChatMessageBubble>
          </ChatMessage>

          <ChatSystemMessage>Cindy liked a message</ChatSystemMessage>
        </ChatMessageList>
      </div>;
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'Density Comparison',
  render: () => {
    const avatarSize = {
      compact: 'sm' as const,
      balanced: 'md' as const,
      spacious: 'md' as const
    };
    const messages = (density: 'compact' | 'balanced' | 'spacious') => <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      border: '1px solid var(--color-border-primary)',
      borderRadius: 8
    }}>
        <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--color-border-primary)',
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
          {density}
        </div>
        <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
          <ChatMessageList density={density}>
            <ChatMessage sender="user">
              <ChatMessageBubble>
                How does the density system work?
              </ChatMessageBubble>
            </ChatMessage>
            <ChatMessage sender="assistant" avatar={<Avatar name="Navi" size={avatarSize[density]} />}>
              <Markdown density="compact">{\`Density controls **spacing** at every level:

- **Default gap** between messages
- **Padding** inside bubbles
- **Gap** between child elements

Use gap when top-level rows need different spacing from density.

This is the **\${density}** density. \${density === 'compact' ? 'Great for sidebars and panels where space is limited.' : density === 'spacious' ? 'Ideal for long-form reading where breathing room helps comprehension.' : 'The default — works well for most full-page chat interfaces.'}\`}</Markdown>
            </ChatMessage>
            <ChatMessage sender="user">
              <ChatMessageBubble>Makes sense, thanks!</ChatMessageBubble>
            </ChatMessage>
          </ChatMessageList>
        </div>
      </div>;
    return <div style={{
      display: 'flex',
      gap: 16,
      height: 500
    }}>
        {messages('compact')}
        {messages('balanced')}
        {messages('spacious')}
      </div>;
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'Message Gap Override',
  render: () => <div style={{
    height: 420,
    display: 'flex',
    flexDirection: 'column'
  }}>
      <ChatMessageList density="compact" gap={5}>
        <ChatMessage sender="assistant">
          <ChatMessageBubble name="Clio">
            Starting the requested change.
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="assistant">
          <ChatMessageBubble variant="ghost">
            Reading repository context and relevant files...
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="assistant">
          <ChatMessageBubble variant="ghost">
            Running tests for the updated package.
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="assistant">
          <ChatMessageBubble metadata={<ChatMessageMetadata footer="Done" />}>
            The patch is ready for review.
          </ChatMessageBubble>
        </ChatMessage>
      </ChatMessageList>
    </div>
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'System Messages',
  render: () => <div style={{
    height: 400,
    display: 'flex',
    flexDirection: 'column'
  }}>
      <ChatMessageList>
        <ChatSystemMessage variant="divider">March 15, 2026</ChatSystemMessage>
        <ChatMessage sender="assistant" avatar={<Avatar name="Navi" size="md" />}>
          <Markdown density="compact">Good morning!</Markdown>
        </ChatMessage>
        <ChatSystemMessage>Conversation started</ChatSystemMessage>
        <ChatMessage sender="user">
          <ChatMessageBubble>Hey Navi</ChatMessageBubble>
        </ChatMessage>
        <ChatSystemMessage variant="divider">Today</ChatSystemMessage>
        <ChatSystemMessage>Cindy shared a file</ChatSystemMessage>
      </ChatMessageList>
    </div>
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'Message Status',
  render: () => <div style={{
    height: 400,
    display: 'flex',
    flexDirection: 'column'
  }}>
      <ChatMessageList>
        <ChatMessage sender="user">
          <ChatMessageBubble metadata={<ChatMessageMetadata status="sending" />}>
            Sending...
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="user">
          <ChatMessageBubble metadata={<ChatMessageMetadata status="sent" />}>
            Sent
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="user">
          <ChatMessageBubble metadata={<ChatMessageMetadata status="delivered" />}>
            Delivered
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="user">
          <ChatMessageBubble metadata={<ChatMessageMetadata status="read" />}>
            Read
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="user">
          <ChatMessageBubble metadata={<ChatMessageMetadata status="error" />}>
            Failed to send
          </ChatMessageBubble>
        </ChatMessage>
      </ChatMessageList>
    </div>
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'Multi-Bubble Grouping',
  render: () => <div style={{
    height: 500,
    display: 'flex',
    flexDirection: 'column'
  }}>
      <ChatMessageList>
        <ChatMessage sender="user">
          <ChatMessageBubble group="first">
            Hey, can you review my PR?
          </ChatMessageBubble>
          <ChatMessageBubble group="middle">
            It's the one for the chat components
          </ChatMessageBubble>
          <ChatMessageBubble group="last" metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:31:00" format="time" />} status="delivered" />}>
            Link: github.com/facebook/astryx/pull/1180
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="assistant" avatar={<Avatar name="Navi" size="md" />}>
          <ChatMessageBubble group="first">
            Sure, looking at it now!
          </ChatMessageBubble>
          <ChatMessageBubble group="middle">
            The compound pattern looks solid. A few minor comments on the
            density styles.
          </ChatMessageBubble>
          <ChatMessageBubble group="last" metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:33:00" format="time" />} />}>
            I'll leave them as review comments.
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="user">
          <ChatMessageBubble metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:34:00" format="time" />} status="sending" />}>
            Thanks, will address those
          </ChatMessageBubble>
        </ChatMessage>
      </ChatMessageList>
    </div>
}`,...F.parameters?.docs?.source}}},I=[`Default`,`MixedContent`,`ChatConversation`,`DensityComparison`,`GapOverride`,`SystemMessages`,`MessageStatus`,`MultiBubble`]}))();export{A as ChatConversation,O as Default,j as DensityComparison,M as GapOverride,P as MessageStatus,k as MixedContent,F as MultiBubble,N as SystemMessages,I as __namedExportsOrder,D as default};