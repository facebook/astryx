import{a1 as e,B as m}from"./iframe-BzSUXdLu.js";import{C as r}from"./ChatMessageList-DTHLzUyF.js";import{C as a}from"./ChatMessage-LYXxMOyX.js";import{C as s}from"./ChatMessageBubble-BgUfOazI.js";import{a as o,C as t,F as j,b as w}from"./HandThumbUpIcon-CJDvhFes.js";import{A as l}from"./Avatar-Bvf0vSe1.js";import{M as i}from"./Markdown-Cakkwq6E.js";import{T as v}from"./Token-C_5OZD9I.js";import{C as f}from"./CodeBlock-E41fH2JK.js";import{T as n}from"./Timestamp-DDEDfRmY.js";import{F as B}from"./ClipboardDocumentIcon-Tjl7hyAX.js";import{H as S}from"./HStack-BldzXftl.js";import"./preload-helper-Ct5FWWRu.js";import"./ChatContext-Dphi1SNI.js";import"./Divider-Cp8qF4Uz.js";import"./CheckboxListItem-Dwy5eAzg.js";import"./Field-DvKAfOMj.js";import"./FieldStatus-CM_meSLQ.js";import"./List-C9SG2VGH.js";import"./ListItem-BUBKye_1.js";import"./Item-CeA2fTPg.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./CheckboxInput-BiNL1EtH.js";import"./Blockquote-Bl5wdmPi.js";import"./Table-Tf-n7bmU.js";import"./ContextMenu-WpclEpmg.js";import"./renderDropdownItems-BqNLEgkE.js";import"./useListFocus-DBqdkSd4.js";import"./useTypeahead-suSY7K7S.js";import"./EmptyState-CHvZJUyE.js";import"./useStreamingText-DQ81vniW.js";import"./Citation-CVQv-QLJ.js";import"./Code-BYlv9wvL.js";import"./useInteractiveRole-DrhPSvmS.js";import"./highlightRanges-CHeDcUzc.js";import"./Stack-Tj4_Mi0e.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";const me={title:"Core/Chat",component:r,tags:["autodocs"]},c={name:"Default",render:()=>e.jsx("div",{style:{display:"flex",flexDirection:"column"},children:e.jsxs(r,{children:[e.jsx(a,{sender:"user",children:e.jsx(s,{metadata:e.jsx(t,{timestamp:e.jsx(n,{value:"2026-03-15T14:30:00",format:"time"}),status:"read"}),children:"How should I handle state management in a React app?"})}),e.jsxs(a,{sender:"assistant",children:[e.jsx(i,{density:"compact",children:`For most cases, **React's built-in state** is sufficient:

- \`useState\` for local component state
- \`useReducer\` for complex state logic
- \`useContext\` for shared state across a subtree

For **server state**, use a library like **TanStack Query** or **SWR** — they handle caching, revalidation, and loading states out of the box.

Avoid global state managers unless you have a genuine need for cross-cutting state. Most apps are over-engineered in this area.`}),e.jsx(t,{timestamp:e.jsx(n,{value:"2026-03-15T14:30:30",format:"time"}),footer:e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"Claude Opus 4.6"}),e.jsx("span",{children:"·"}),e.jsx(m,{label:"Thumbs up",icon:e.jsx(j,{style:{width:14,height:14}}),variant:"ghost",size:"sm",isIconOnly:!0}),e.jsx(m,{label:"Thumbs down",icon:e.jsx(w,{style:{width:14,height:14}}),variant:"ghost",size:"sm",isIconOnly:!0}),e.jsx(m,{label:"Copy",icon:e.jsx(B,{style:{width:14,height:14}}),variant:"ghost",size:"sm",isIconOnly:!0})]})})]}),e.jsx(a,{sender:"user",children:e.jsx(s,{metadata:e.jsx(t,{timestamp:e.jsx(n,{value:"2026-03-15T14:31:00",format:"time"}),status:"read"}),children:"Can you show me a useReducer example?"})}),e.jsxs(a,{sender:"assistant",children:[e.jsx(i,{density:"compact",children:"Here's a common pattern for form state:"}),e.jsx(f,{code:`const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, initialState);`,language:"tsx"}),e.jsx(i,{density:"compact",children:"This keeps all your form logic in one place. The reducer is pure and easy to test — just pass in state and action, assert on the output.\n\n| Hook | Use case | Re-renders | Complexity | Best for |\n|------|----------|------------|------------|----------|\n| `useState` | Simple values | On every set | Low | Toggles, inputs, counters |\n| `useReducer` | Complex state logic | On dispatch | Medium | Forms, multi-field state |\n| `useContext` | Shared subtree state | All consumers | Low | Theme, auth, locale |\n| `useSyncExternalStore` | External stores | On snapshot change | High | Redux, Zustand, signals |\n| `useRef` | Mutable values | Never | Low | DOM refs, timers, previous values |"}),e.jsx(t,{timestamp:e.jsx(n,{value:"2026-03-15T14:31:30",format:"time"}),footer:e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"Claude Opus 4.6"}),e.jsx("span",{children:"·"}),e.jsx(m,{label:"Thumbs up",icon:e.jsx(j,{style:{width:14,height:14}}),variant:"ghost",size:"sm",isIconOnly:!0}),e.jsx(m,{label:"Thumbs down",icon:e.jsx(w,{style:{width:14,height:14}}),variant:"ghost",size:"sm",isIconOnly:!0}),e.jsx(m,{label:"Copy",icon:e.jsx(B,{style:{width:14,height:14}}),variant:"ghost",size:"sm",isIconOnly:!0})]})})]})]})})},u={name:"Mixed Content",render:()=>e.jsx("div",{style:{height:600,display:"flex",flexDirection:"column"},children:e.jsxs(r,{children:[e.jsx(a,{sender:"user",children:e.jsx(s,{children:"Show me the component files and explain the architecture"})}),e.jsxs(a,{sender:"assistant",children:[e.jsx(s,{children:"Sure! Here's an overview of the component architecture."}),e.jsx(s,{variant:"ghost",children:e.jsx(i,{density:"compact",children:`The system uses a **compound component** pattern with three layers:

1. **MessageList** — scrollable container with auto-scroll
2. **Message** — layout wrapper with sender context
3. **Bubble** — styled content container`})}),e.jsxs(s,{variant:"ghost",children:[e.jsx(i,{density:"compact",children:"Here are the files:"}),e.jsxs(S,{gap:2,wrap:"wrap",children:[e.jsx(v,{label:"Button.tsx"}),e.jsx(v,{label:"Card.tsx"}),e.jsx(v,{label:"Dialog.tsx"})]}),e.jsx(f,{code:`export * from './Button';
export * from './Card';
export * from './Dialog';`,language:"typescript"})]}),e.jsx(s,{children:"Let me know which one to open — I can walk through the implementation."})]}),e.jsx(a,{sender:"user",children:e.jsx(s,{children:"Open Button.tsx"})}),e.jsx(o,{children:"Navi opened Button.tsx"}),e.jsx(a,{sender:"assistant",children:e.jsxs(s,{variant:"ghost",children:[e.jsx(f,{code:`import * as stylex from '@stylexjs/stylex';

export function Button({ label, variant = 'primary' }) {
  return (
    <button {...stylex.props(styles.base, styles[variant])}>
      {label}
    </button>
  );
}`,language:"tsx"}),e.jsx(i,{density:"compact",children:"The Button uses StyleX for styles and reads variant from props."})]})})]})})},p={name:"Chat Conversation",render:()=>{const d={fontSize:12,fontWeight:600,color:"#666",lineHeight:"16px"};return e.jsx("div",{style:{height:500,display:"flex",flexDirection:"column"},children:e.jsxs(r,{children:[e.jsx(o,{variant:"divider",children:"Today"}),e.jsx(a,{sender:"assistant",avatar:e.jsx(l,{name:"Navi",size:"small"}),children:e.jsx(s,{name:e.jsx("span",{style:d,children:"Navi"}),metadata:e.jsx(t,{timestamp:e.jsx(n,{value:"2026-03-15T14:30:00",format:"time"})}),children:"Hey! I looked at the PR and left a few comments on the density styles."})}),e.jsxs(a,{sender:"user",avatar:e.jsx(l,{name:"Cindy",size:"small"}),children:[e.jsx(s,{group:"first",name:e.jsx("span",{style:d,children:"Cindy"}),children:"Thanks! I'll take a look."}),e.jsx(s,{group:"last",metadata:e.jsx(t,{timestamp:e.jsx(n,{value:"2026-03-15T14:31:00",format:"time"}),status:"read"}),children:"Should be quick to fix."})]}),e.jsx(a,{sender:"assistant",avatar:e.jsx(l,{name:"Navi",size:"small"}),children:e.jsx(s,{name:e.jsx("span",{style:d,children:"Navi"}),metadata:e.jsx(t,{timestamp:e.jsx(n,{value:"2026-03-15T14:32:00",format:"time"})}),children:"Sounds good. The main thing is the compact radius — it should use the container token, not the page token."})}),e.jsx(a,{sender:"user",avatar:e.jsx(l,{name:"Cindy",size:"small"}),children:e.jsx(s,{name:e.jsx("span",{style:d,children:"Cindy"}),metadata:e.jsx(t,{timestamp:e.jsx(n,{value:"2026-03-15T14:33:00",format:"time"}),status:"delivered"}),children:"Good catch, fixed and pushed."})}),e.jsx(o,{children:"Cindy liked a message"})]})})}},g={name:"Density Comparison",render:()=>{const d={compact:"xsmall",balanced:"small",spacious:"small"},y=h=>e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",minWidth:0,border:"1px solid var(--color-border-primary)",borderRadius:8},children:[e.jsx("div",{style:{padding:"8px 12px",borderBottom:"1px solid var(--color-border-primary)",fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em"},children:h}),e.jsx("div",{style:{flex:1,display:"flex",flexDirection:"column",minHeight:0},children:e.jsxs(r,{density:h,children:[e.jsx(a,{sender:"user",children:e.jsx(s,{children:"How does the density system work?"})}),e.jsx(a,{sender:"assistant",avatar:e.jsx(l,{name:"Navi",size:d[h]}),children:e.jsx(i,{density:"compact",children:`Density controls **spacing** at every level:

- **Default gap** between messages
- **Padding** inside bubbles
- **Gap** between child elements

Use gap when top-level rows need different spacing from density.

This is the **${h}** density. ${h==="compact"?"Great for sidebars and panels where space is limited.":h==="spacious"?"Ideal for long-form reading where breathing room helps comprehension.":"The default — works well for most full-page chat interfaces."}`})}),e.jsx(a,{sender:"user",children:e.jsx(s,{children:"Makes sense, thanks!"})})]})})]});return e.jsxs("div",{style:{display:"flex",gap:16,height:500},children:[y("compact"),y("balanced"),y("spacious")]})}},x={name:"Message Gap Override",render:()=>e.jsx("div",{style:{height:420,display:"flex",flexDirection:"column"},children:e.jsxs(r,{density:"compact",gap:5,children:[e.jsx(a,{sender:"assistant",children:e.jsx(s,{name:"Clio",children:"Starting the requested change."})}),e.jsx(a,{sender:"assistant",children:e.jsx(s,{variant:"ghost",children:"Reading repository context and relevant files..."})}),e.jsx(a,{sender:"assistant",children:e.jsx(s,{variant:"ghost",children:"Running tests for the updated package."})}),e.jsx(a,{sender:"assistant",children:e.jsx(s,{metadata:e.jsx(t,{footer:"Done"}),children:"The patch is ready for review."})})]})})},M={name:"System Messages",render:()=>e.jsx("div",{style:{height:400,display:"flex",flexDirection:"column"},children:e.jsxs(r,{children:[e.jsx(o,{variant:"divider",children:"March 15, 2026"}),e.jsx(a,{sender:"assistant",avatar:e.jsx(l,{name:"Navi",size:"small"}),children:e.jsx(i,{density:"compact",children:"Good morning!"})}),e.jsx(o,{children:"Conversation started"}),e.jsx(a,{sender:"user",children:e.jsx(s,{children:"Hey Navi"})}),e.jsx(o,{variant:"divider",children:"Today"}),e.jsx(o,{children:"Cindy shared a file"})]})})},C={name:"Message Status",render:()=>e.jsx("div",{style:{height:400,display:"flex",flexDirection:"column"},children:e.jsxs(r,{children:[e.jsx(a,{sender:"user",children:e.jsx(s,{metadata:e.jsx(t,{status:"sending"}),children:"Sending..."})}),e.jsx(a,{sender:"user",children:e.jsx(s,{metadata:e.jsx(t,{status:"sent"}),children:"Sent"})}),e.jsx(a,{sender:"user",children:e.jsx(s,{metadata:e.jsx(t,{status:"delivered"}),children:"Delivered"})}),e.jsx(a,{sender:"user",children:e.jsx(s,{metadata:e.jsx(t,{status:"read"}),children:"Read"})}),e.jsx(a,{sender:"user",children:e.jsx(s,{metadata:e.jsx(t,{status:"error"}),children:"Failed to send"})})]})})},b={name:"Multi-Bubble Grouping",render:()=>e.jsx("div",{style:{height:500,display:"flex",flexDirection:"column"},children:e.jsxs(r,{children:[e.jsxs(a,{sender:"user",children:[e.jsx(s,{group:"first",children:"Hey, can you review my PR?"}),e.jsx(s,{group:"middle",children:"It's the one for the chat components"}),e.jsx(s,{group:"last",metadata:e.jsx(t,{timestamp:e.jsx(n,{value:"2026-03-15T14:31:00",format:"time"}),status:"delivered"}),children:"Link: github.com/facebook/astryx/pull/1180"})]}),e.jsxs(a,{sender:"assistant",avatar:e.jsx(l,{name:"Navi",size:"small"}),children:[e.jsx(s,{group:"first",children:"Sure, looking at it now!"}),e.jsx(s,{group:"middle",children:"The compound pattern looks solid. A few minor comments on the density styles."}),e.jsx(s,{group:"last",metadata:e.jsx(t,{timestamp:e.jsx(n,{value:"2026-03-15T14:33:00",format:"time"})}),children:"I'll leave them as review comments."})]}),e.jsx(a,{sender:"user",children:e.jsx(s,{metadata:e.jsx(t,{timestamp:e.jsx(n,{value:"2026-03-15T14:34:00",format:"time"}),status:"sending"}),children:"Thanks, will address those"})})]})})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
          <ChatMessage sender="assistant" avatar={<Avatar name="Navi" size="small" />}>
            <ChatMessageBubble name={<span style={nameStyle}>Navi</span>} metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:30:00" format="time" />} />}>
              Hey! I looked at the PR and left a few comments on the density
              styles.
            </ChatMessageBubble>
          </ChatMessage>

          <ChatMessage sender="user" avatar={<Avatar name="Cindy" size="small" />}>
            <ChatMessageBubble group="first" name={<span style={nameStyle}>Cindy</span>}>
              Thanks! I'll take a look.
            </ChatMessageBubble>
            <ChatMessageBubble group="last" metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:31:00" format="time" />} status="read" />}>
              Should be quick to fix.
            </ChatMessageBubble>
          </ChatMessage>

          <ChatMessage sender="assistant" avatar={<Avatar name="Navi" size="small" />}>
            <ChatMessageBubble name={<span style={nameStyle}>Navi</span>} metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:32:00" format="time" />} />}>
              Sounds good. The main thing is the compact radius — it should use
              the container token, not the page token.
            </ChatMessageBubble>
          </ChatMessage>

          <ChatMessage sender="user" avatar={<Avatar name="Cindy" size="small" />}>
            <ChatMessageBubble name={<span style={nameStyle}>Cindy</span>} metadata={<ChatMessageMetadata timestamp={<Timestamp value="2026-03-15T14:33:00" format="time" />} status="delivered" />}>
              Good catch, fixed and pushed.
            </ChatMessageBubble>
          </ChatMessage>

          <ChatSystemMessage>Cindy liked a message</ChatSystemMessage>
        </ChatMessageList>
      </div>;
  }
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Density Comparison',
  render: () => {
    const avatarSize = {
      compact: 'xsmall' as const,
      balanced: 'small' as const,
      spacious: 'small' as const
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
}`,...g.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'System Messages',
  render: () => <div style={{
    height: 400,
    display: 'flex',
    flexDirection: 'column'
  }}>
      <ChatMessageList>
        <ChatSystemMessage variant="divider">
          March 15, 2026
        </ChatSystemMessage>
        <ChatMessage sender="assistant" avatar={<Avatar name="Navi" size="small" />}>
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
}`,...M.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
        <ChatMessage sender="assistant" avatar={<Avatar name="Navi" size="small" />}>
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
}`,...b.parameters?.docs?.source}}};const ce=["Default","MixedContent","ChatConversation","DensityComparison","GapOverride","SystemMessages","MessageStatus","MultiBubble"];export{p as ChatConversation,c as Default,g as DensityComparison,x as GapOverride,C as MessageStatus,u as MixedContent,b as MultiBubble,M as SystemMessages,ce as __namedExportsOrder,me as default};
