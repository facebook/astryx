import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-CUw_qAJO.js";import{t as r}from"./Button-CpBrZi1Q.js";import{t as i}from"./Button-BdM_Mlh9.js";import{i as a,t as o}from"./Avatar-BhbvgEd4.js";import{i as s,t as c}from"./CodeBlock-BeoF3ioq.js";import{o as l,t as u}from"./Stack-Dntpv-r2.js";import{t as d}from"./Text-B194cPHg.js";import{n as f,t as p}from"./Token-pLH3ePYf.js";import{C as m,Fr as h,Lr as g,Si as _,Sr as v,Ur as y,Vr as b,w as x,wr as S,xi as C,xr as w,zr as T}from"./iframe-Y-SqSYW9.js";import{Xt as E,ft as D,t as O,ut as k}from"./esm-CL1f8dHF.js";var A,j,M,N,P,F,I,L,R,z,B,V,H;e((()=>{S(),o(),C(),d(),w(),p(),u(),c(),i(),m(),O(),A=t(),j={title:`Core/Chat`,component:y,tags:[`autodocs`]},M={name:`Default`,render:()=>(0,A.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`},children:(0,A.jsxs)(y,{children:[(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{metadata:(0,A.jsx)(g,{timestamp:(0,A.jsx)(x,{value:`2026-03-15T14:30:00`,format:`time`}),status:`read`}),children:`How should I handle state management in a React app?`})}),(0,A.jsxs)(b,{sender:`assistant`,children:[(0,A.jsx)(v,{density:`compact`,children:`For most cases, **React's built-in state** is sufficient:

- \`useState\` for local component state
- \`useReducer\` for complex state logic
- \`useContext\` for shared state across a subtree

For **server state**, use a library like **TanStack Query** or **SWR** — they handle caching, revalidation, and loading states out of the box.

Avoid global state managers unless you have a genuine need for cross-cutting state. Most apps are over-engineered in this area.`}),(0,A.jsx)(g,{timestamp:(0,A.jsx)(x,{value:`2026-03-15T14:30:30`,format:`time`}),footer:(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(`span`,{children:`Claude Opus 4.6`}),(0,A.jsx)(`span`,{children:`·`}),(0,A.jsx)(r,{label:`Thumbs up`,icon:(0,A.jsx)(k,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0}),(0,A.jsx)(r,{label:`Thumbs down`,icon:(0,A.jsx)(D,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0}),(0,A.jsx)(r,{label:`Copy`,icon:(0,A.jsx)(E,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0})]})})]}),(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{metadata:(0,A.jsx)(g,{timestamp:(0,A.jsx)(x,{value:`2026-03-15T14:31:00`,format:`time`}),status:`read`}),children:`Can you show me a useReducer example?`})}),(0,A.jsxs)(b,{sender:`assistant`,children:[(0,A.jsx)(v,{density:`compact`,children:`Here's a common pattern for form state:`}),(0,A.jsx)(s,{code:`const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, initialState);`,language:`tsx`}),(0,A.jsx)(v,{density:`compact`,children:"This keeps all your form logic in one place. The reducer is pure and easy to test — just pass in state and action, assert on the output.\n\n| Hook | Use case | Re-renders | Complexity | Best for |\n|------|----------|------------|------------|----------|\n| `useState` | Simple values | On every set | Low | Toggles, inputs, counters |\n| `useReducer` | Complex state logic | On dispatch | Medium | Forms, multi-field state |\n| `useContext` | Shared subtree state | All consumers | Low | Theme, auth, locale |\n| `useSyncExternalStore` | External stores | On snapshot change | High | Redux, Zustand, signals |\n| `useRef` | Mutable values | Never | Low | DOM refs, timers, previous values |"}),(0,A.jsx)(g,{timestamp:(0,A.jsx)(x,{value:`2026-03-15T14:31:30`,format:`time`}),footer:(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(`span`,{children:`Claude Opus 4.6`}),(0,A.jsx)(`span`,{children:`·`}),(0,A.jsx)(r,{label:`Thumbs up`,icon:(0,A.jsx)(k,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0}),(0,A.jsx)(r,{label:`Thumbs down`,icon:(0,A.jsx)(D,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0}),(0,A.jsx)(r,{label:`Copy`,icon:(0,A.jsx)(E,{style:{width:14,height:14}}),variant:`ghost`,size:`sm`,isIconOnly:!0})]})})]})]})})},N={name:`Mixed Content`,render:()=>(0,A.jsx)(`div`,{style:{height:600,display:`flex`,flexDirection:`column`},children:(0,A.jsxs)(y,{children:[(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{children:`Show me the component files and explain the architecture`})}),(0,A.jsxs)(b,{sender:`assistant`,children:[(0,A.jsx)(T,{children:`Sure! Here's an overview of the component architecture.`}),(0,A.jsx)(T,{variant:`ghost`,children:(0,A.jsx)(v,{density:`compact`,children:`The system uses a **compound component** pattern with three layers:

1. **MessageList** — scrollable container with auto-scroll
2. **Message** — layout wrapper with sender context
3. **Bubble** — styled content container`})}),(0,A.jsxs)(T,{variant:`ghost`,children:[(0,A.jsx)(v,{density:`compact`,children:`Here are the files:`}),(0,A.jsxs)(l,{gap:2,wrap:`wrap`,children:[(0,A.jsx)(f,{label:`Button.tsx`}),(0,A.jsx)(f,{label:`Card.tsx`}),(0,A.jsx)(f,{label:`Dialog.tsx`})]}),(0,A.jsx)(s,{code:`export * from './Button';
export * from './Card';
export * from './Dialog';`,language:`typescript`})]}),(0,A.jsx)(T,{children:`Let me know which one to open — I can walk through the implementation.`})]}),(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{children:`Open Button.tsx`})}),(0,A.jsx)(h,{children:`Navi opened Button.tsx`}),(0,A.jsx)(b,{sender:`assistant`,children:(0,A.jsxs)(T,{variant:`ghost`,children:[(0,A.jsx)(s,{code:`import * as stylex from '@stylexjs/stylex';

export function Button({ label, variant = 'primary' }) {
  return (
    <button {...stylex.props(styles.base, styles[variant])}>
      {label}
    </button>
  );
}`,language:`tsx`}),(0,A.jsx)(v,{density:`compact`,children:`The Button uses StyleX for styles and reads variant from props.`})]})})]})})},P={name:`Custom Content`,render:()=>(0,A.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`},children:(0,A.jsxs)(y,{style:{maxWidth:520},children:[(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{children:`Can you pull up the Q3 report?`})}),(0,A.jsxs)(b,{sender:`assistant`,children:[(0,A.jsx)(T,{name:`Navi`,children:`Sure, here is the artifact from last quarter.`}),(0,A.jsx)(T,{variant:`ghost`,width:`100%`,metadata:(0,A.jsx)(g,{timestamp:(0,A.jsx)(x,{value:`2026-03-15T14:32:00`,format:`time`}),footer:(0,A.jsx)(`span`,{children:`Claude Opus 4.6`})}),children:(0,A.jsxs)(_,{label:`Open Q3 performance report`,onClick:()=>{},children:[(0,A.jsx)(n,{type:`body`,weight:`semibold`,display:`block`,children:`Q3 Performance Report`}),(0,A.jsx)(n,{type:`supporting`,color:`secondary`,display:`block`,children:`12 pages · updated 2 days ago`})]})})]})]})})},F={name:`Chat Conversation`,render:()=>{let e={fontSize:12,fontWeight:600,color:`var(--color-text-secondary)`,lineHeight:`16px`};return(0,A.jsx)(`div`,{style:{height:500,display:`flex`,flexDirection:`column`},children:(0,A.jsxs)(y,{children:[(0,A.jsx)(h,{variant:`divider`,children:`Today`}),(0,A.jsx)(b,{sender:`assistant`,avatar:(0,A.jsx)(a,{name:`Navi`,size:`md`}),children:(0,A.jsx)(T,{name:(0,A.jsx)(`span`,{style:e,children:`Navi`}),metadata:(0,A.jsx)(g,{timestamp:(0,A.jsx)(x,{value:`2026-03-15T14:30:00`,format:`time`})}),children:`Hey! I looked at the PR and left a few comments on the density styles.`})}),(0,A.jsxs)(b,{sender:`user`,avatar:(0,A.jsx)(a,{name:`Cindy`,size:`md`}),children:[(0,A.jsx)(T,{group:`first`,name:(0,A.jsx)(`span`,{style:e,children:`Cindy`}),children:`Thanks! I'll take a look.`}),(0,A.jsx)(T,{group:`last`,metadata:(0,A.jsx)(g,{timestamp:(0,A.jsx)(x,{value:`2026-03-15T14:31:00`,format:`time`}),status:`read`}),children:`Should be quick to fix.`})]}),(0,A.jsx)(b,{sender:`assistant`,avatar:(0,A.jsx)(a,{name:`Navi`,size:`md`}),children:(0,A.jsx)(T,{name:(0,A.jsx)(`span`,{style:e,children:`Navi`}),metadata:(0,A.jsx)(g,{timestamp:(0,A.jsx)(x,{value:`2026-03-15T14:32:00`,format:`time`})}),children:`Sounds good. The main thing is the compact radius — it should use the container token, not the page token.`})}),(0,A.jsx)(b,{sender:`user`,avatar:(0,A.jsx)(a,{name:`Cindy`,size:`md`}),children:(0,A.jsx)(T,{name:(0,A.jsx)(`span`,{style:e,children:`Cindy`}),metadata:(0,A.jsx)(g,{timestamp:(0,A.jsx)(x,{value:`2026-03-15T14:33:00`,format:`time`}),status:`delivered`}),children:`Good catch, fixed and pushed.`})}),(0,A.jsx)(h,{children:`Cindy liked a message`})]})})}},I={name:`Density Comparison`,render:()=>{let e={compact:`sm`,balanced:`md`,spacious:`md`},t=t=>(0,A.jsxs)(`div`,{style:{flex:1,display:`flex`,flexDirection:`column`,minWidth:0,border:`1px solid var(--color-border-primary)`,borderRadius:8},children:[(0,A.jsx)(`div`,{style:{padding:`8px 12px`,borderBottom:`1px solid var(--color-border-primary)`,fontSize:12,fontWeight:600,textTransform:`uppercase`,letterSpacing:`0.05em`},children:t}),(0,A.jsx)(`div`,{style:{flex:1,display:`flex`,flexDirection:`column`,minHeight:0},children:(0,A.jsxs)(y,{density:t,children:[(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{children:`How does the density system work?`})}),(0,A.jsx)(b,{sender:`assistant`,avatar:(0,A.jsx)(a,{name:`Navi`,size:e[t]}),children:(0,A.jsx)(v,{density:`compact`,children:`Density controls **spacing** at every level:

- **Default gap** between messages
- **Padding** inside bubbles
- **Gap** between child elements

Use gap when top-level rows need different spacing from density.

This is the **${t}** density. ${t===`compact`?`Great for sidebars and panels where space is limited.`:t===`spacious`?`Ideal for long-form reading where breathing room helps comprehension.`:`The default — works well for most full-page chat interfaces.`}`})}),(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{children:`Makes sense, thanks!`})})]})})]});return(0,A.jsxs)(`div`,{style:{display:`flex`,gap:16,height:500},children:[t(`compact`),t(`balanced`),t(`spacious`)]})}},L={name:`Message Gap Override`,render:()=>(0,A.jsx)(`div`,{style:{height:420,display:`flex`,flexDirection:`column`},children:(0,A.jsxs)(y,{density:`compact`,gap:5,children:[(0,A.jsx)(b,{sender:`assistant`,children:(0,A.jsx)(T,{name:`Clio`,children:`Starting the requested change.`})}),(0,A.jsx)(b,{sender:`assistant`,children:(0,A.jsx)(T,{variant:`ghost`,children:`Reading repository context and relevant files...`})}),(0,A.jsx)(b,{sender:`assistant`,children:(0,A.jsx)(T,{variant:`ghost`,children:`Running tests for the updated package.`})}),(0,A.jsx)(b,{sender:`assistant`,children:(0,A.jsx)(T,{metadata:(0,A.jsx)(g,{footer:`Done`}),children:`The patch is ready for review.`})})]})})},R={name:`System Messages`,render:()=>(0,A.jsx)(`div`,{style:{height:400,display:`flex`,flexDirection:`column`},children:(0,A.jsxs)(y,{children:[(0,A.jsx)(h,{variant:`divider`,children:`March 15, 2026`}),(0,A.jsx)(b,{sender:`assistant`,avatar:(0,A.jsx)(a,{name:`Navi`,size:`md`}),children:(0,A.jsx)(v,{density:`compact`,children:`Good morning!`})}),(0,A.jsx)(h,{children:`Conversation started`}),(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{children:`Hey Navi`})}),(0,A.jsx)(h,{variant:`divider`,children:`Today`}),(0,A.jsx)(h,{children:`Cindy shared a file`})]})})},z={name:`Message Status`,render:()=>(0,A.jsx)(`div`,{style:{height:400,display:`flex`,flexDirection:`column`},children:(0,A.jsxs)(y,{children:[(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{metadata:(0,A.jsx)(g,{status:`sending`}),children:`Sending...`})}),(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{metadata:(0,A.jsx)(g,{status:`sent`}),children:`Sent`})}),(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{metadata:(0,A.jsx)(g,{status:`delivered`}),children:`Delivered`})}),(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{metadata:(0,A.jsx)(g,{status:`read`}),children:`Read`})}),(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{metadata:(0,A.jsx)(g,{status:`error`}),children:`Failed to send`})})]})})},B={name:`Multi-Bubble Grouping`,render:()=>(0,A.jsx)(`div`,{style:{height:500,display:`flex`,flexDirection:`column`},children:(0,A.jsxs)(y,{children:[(0,A.jsxs)(b,{sender:`user`,children:[(0,A.jsx)(T,{group:`first`,children:`Hey, can you review my PR?`}),(0,A.jsx)(T,{group:`middle`,children:`It's the one for the chat components`}),(0,A.jsx)(T,{group:`last`,metadata:(0,A.jsx)(g,{timestamp:(0,A.jsx)(x,{value:`2026-03-15T14:31:00`,format:`time`}),status:`delivered`}),children:`Link: github.com/facebook/astryx/pull/1180`})]}),(0,A.jsxs)(b,{sender:`assistant`,avatar:(0,A.jsx)(a,{name:`Navi`,size:`md`}),children:[(0,A.jsx)(T,{group:`first`,children:`Sure, looking at it now!`}),(0,A.jsx)(T,{group:`middle`,children:`The compound pattern looks solid. A few minor comments on the density styles.`}),(0,A.jsx)(T,{group:`last`,metadata:(0,A.jsx)(g,{timestamp:(0,A.jsx)(x,{value:`2026-03-15T14:33:00`,format:`time`})}),children:`I'll leave them as review comments.`})]}),(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{metadata:(0,A.jsx)(g,{timestamp:(0,A.jsx)(x,{value:`2026-03-15T14:34:00`,format:`time`}),status:`sending`}),children:`Thanks, will address those`})})]})})},V={name:`Alignment`,render:()=>{let e=e=>(0,A.jsxs)(`div`,{style:{flex:1,minWidth:0,display:`flex`,flexDirection:`column`,border:`1px solid var(--color-border-primary)`,borderRadius:8,overflow:`hidden`},children:[(0,A.jsxs)(`div`,{style:{padding:`8px 12px`,borderBottom:`1px solid var(--color-border-primary)`,fontSize:12,fontWeight:600,textTransform:`uppercase`,letterSpacing:`0.05em`},children:[`align="`,e,`"`]}),(0,A.jsx)(`div`,{style:{flex:1,display:`flex`,flexDirection:`column`,minHeight:0},children:(0,A.jsxs)(y,{align:e,children:[(0,A.jsx)(b,{sender:`user`,children:(0,A.jsx)(T,{children:`Just one short message.`})}),(0,A.jsx)(b,{sender:`assistant`,avatar:(0,A.jsx)(a,{name:`Navi`,size:`sm`}),children:(0,A.jsx)(T,{children:e===`top`?`Top alignment keeps messages at the top — good for logs and document-style lists.`:`Bottom alignment keeps a short thread just above the composer — the familiar messaging layout.`})})]})})]});return(0,A.jsxs)(`div`,{style:{display:`flex`,gap:16,height:420},children:[e(`bottom`),e(`top`)]})}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'Custom Content',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
      <ChatMessageList style={{
      maxWidth: 520
    }}>
        <ChatMessage sender="user">
          <ChatMessageBubble>Can you pull up the Q3 report?</ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="assistant">
          <ChatMessageBubble name="Navi">
            Sure, here is the artifact from last quarter.
          </ChatMessageBubble>
          {/* A ghost bubble insets custom content to the bubble's text
              column; width="100%" spans the full message column instead
              of the default bubble width cap (#2574). */}
          <ChatMessageBubble variant="ghost" width="100%" metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:32:00" format="time" />} footer={<span>Claude Opus 4.6</span>} />}>
            <ClickableCard label="Open Q3 performance report" onClick={() => {}}>
              <Text type="body" weight="semibold" display="block">
                Q3 Performance Report
              </Text>
              <Text type="supporting" color="secondary" display="block">
                12 pages · updated 2 days ago
              </Text>
            </ClickableCard>
          </ChatMessageBubble>
        </ChatMessage>
      </ChatMessageList>
    </div>
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'Chat Conversation',
  render: () => {
    const nameStyle = {
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--color-text-secondary)',
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: 'Alignment',
  render: () => {
    const shortConversation = (align: 'top' | 'bottom') => <div style={{
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid var(--color-border-primary)',
      borderRadius: 8,
      overflow: 'hidden'
    }}>
        <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--color-border-primary)',
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
          align=&quot;{align}&quot;
        </div>
        <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
          <ChatMessageList align={align}>
            <ChatMessage sender="user">
              <ChatMessageBubble>Just one short message.</ChatMessageBubble>
            </ChatMessage>
            <ChatMessage sender="assistant" avatar={<Avatar name="Navi" size="sm" />}>
              <ChatMessageBubble>
                {align === 'top' ? 'Top alignment keeps messages at the top — good for logs and document-style lists.' : 'Bottom alignment keeps a short thread just above the composer — the familiar messaging layout.'}
              </ChatMessageBubble>
            </ChatMessage>
          </ChatMessageList>
        </div>
      </div>;
    return <div style={{
      display: 'flex',
      gap: 16,
      height: 420
    }}>
        {shortConversation('bottom')}
        {shortConversation('top')}
      </div>;
  }
}`,...V.parameters?.docs?.source}}},H=[`Default`,`MixedContent`,`CustomContent`,`ChatConversation`,`DensityComparison`,`GapOverride`,`SystemMessages`,`MessageStatus`,`MultiBubble`,`Alignment`]}))();export{V as Alignment,F as ChatConversation,P as CustomContent,M as Default,I as DensityComparison,L as GapOverride,z as MessageStatus,N as MixedContent,B as MultiBubble,R as SystemMessages,H as __namedExportsOrder,j as default};