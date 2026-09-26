import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{_i as n,ei as r,hi as i,pi as a}from"./iframe-Cheb2vvR.js";function o({state:e,children:t}){return(0,s.jsxs)(`section`,{"data-bubble-audit-state":e,style:u,children:[(0,s.jsx)(`div`,{style:d,children:e}),t]})}var s,c,l,u,d,f,p,m;e((()=>{r(),s=t(),c={title:`Core/ChatMessageBubble`,component:i,tags:[`autodocs`]},l={display:`flex`,flexDirection:`column`,gap:20,maxWidth:720},u={display:`flex`,flexDirection:`column`,gap:8,padding:12,border:`1px solid var(--color-border-primary)`,borderRadius:8},d={color:`var(--color-text-secondary)`,fontSize:12,fontWeight:600},f={render:()=>(0,s.jsxs)(`div`,{"data-chat-message-bubble-audit":!0,style:l,children:[(0,s.jsxs)(o,{state:`sender-alignment`,children:[(0,s.jsx)(n,{sender:`assistant`,children:(0,s.jsx)(i,{name:`Navi`,children:`Assistant message`})}),(0,s.jsx)(n,{sender:`user`,children:(0,s.jsx)(i,{name:`You`,children:`User message`})})]}),(0,s.jsxs)(o,{state:`filled-and-ghost`,children:[(0,s.jsxs)(n,{sender:`assistant`,children:[(0,s.jsx)(i,{children:`Filled assistant bubble`}),(0,s.jsx)(i,{variant:`ghost`,width:`100%`,children:`Ghost assistant content spans the message column`})]}),(0,s.jsxs)(n,{sender:`user`,children:[(0,s.jsx)(i,{children:`Filled user bubble`}),(0,s.jsx)(i,{variant:`ghost`,children:`Ghost user content`})]})]}),(0,s.jsx)(o,{state:`assistant-group`,children:(0,s.jsxs)(n,{sender:`assistant`,children:[(0,s.jsx)(i,{"data-testid":`assistant-group-first`,group:`first`,name:`Navi`,children:`First assistant bubble`}),(0,s.jsx)(i,{"data-testid":`assistant-group-middle`,group:`middle`,children:`Middle assistant bubble`}),(0,s.jsx)(i,{"data-testid":`assistant-group-last`,group:`last`,metadata:(0,s.jsx)(a,{timestamp:`10:32 AM`}),children:`Last assistant bubble`})]})}),(0,s.jsx)(o,{state:`user-group`,children:(0,s.jsxs)(n,{sender:`user`,children:[(0,s.jsx)(i,{"data-testid":`user-group-first`,group:`first`,name:`You`,children:`First user bubble`}),(0,s.jsx)(i,{"data-testid":`user-group-middle`,group:`middle`,children:`Middle user bubble`}),(0,s.jsx)(i,{"data-testid":`user-group-last`,group:`last`,metadata:(0,s.jsx)(a,{timestamp:`10:33 AM`,status:`read`}),children:`Last user bubble`})]})}),(0,s.jsx)(o,{state:`density`,children:[`compact`,`balanced`,`spacious`].map(e=>(0,s.jsx)(n,{sender:`assistant`,density:e,children:(0,s.jsxs)(i,{children:[e,` density`]})},e))}),(0,s.jsx)(o,{state:`numeric-slots`,children:(0,s.jsx)(n,{sender:`assistant`,children:(0,s.jsx)(i,{"data-testid":`numeric-slot-bubble`,name:0,metadata:0,children:`Zero is valid React content`})})}),(0,s.jsx)(o,{state:`empty-content`,children:(0,s.jsx)(n,{sender:`assistant`,children:(0,s.jsx)(i,{children:null})})})]})},p={render:()=>(0,s.jsx)(`div`,{"data-chat-message-bubble-narrow":!0,style:{...l,width:320,maxWidth:`100%`},children:(0,s.jsxs)(o,{state:`narrow-long-content`,children:[(0,s.jsx)(n,{sender:`assistant`,children:(0,s.jsx)(i,{name:`Navi`,children:`A long message wraps without forcing horizontal scrolling, including the unbroken value abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz0123456789.`})}),(0,s.jsx)(n,{sender:`user`,children:(0,s.jsx)(i,{width:`100%`,children:`A full-width bubble remains inside its narrow parent.`})})]})})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div data-chat-message-bubble-audit style={fixtureStyle}>
      <Panel state="sender-alignment">
        <ChatMessage sender="assistant">
          <ChatMessageBubble name="Navi">Assistant message</ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="user">
          <ChatMessageBubble name="You">User message</ChatMessageBubble>
        </ChatMessage>
      </Panel>

      <Panel state="filled-and-ghost">
        <ChatMessage sender="assistant">
          <ChatMessageBubble>Filled assistant bubble</ChatMessageBubble>
          <ChatMessageBubble variant="ghost" width="100%">
            Ghost assistant content spans the message column
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="user">
          <ChatMessageBubble>Filled user bubble</ChatMessageBubble>
          <ChatMessageBubble variant="ghost">
            Ghost user content
          </ChatMessageBubble>
        </ChatMessage>
      </Panel>

      <Panel state="assistant-group">
        <ChatMessage sender="assistant">
          <ChatMessageBubble data-testid="assistant-group-first" group="first" name="Navi">
            First assistant bubble
          </ChatMessageBubble>
          <ChatMessageBubble data-testid="assistant-group-middle" group="middle">
            Middle assistant bubble
          </ChatMessageBubble>
          <ChatMessageBubble data-testid="assistant-group-last" group="last" metadata={<ChatMessageMetadata timestamp="10:32 AM" />}>
            Last assistant bubble
          </ChatMessageBubble>
        </ChatMessage>
      </Panel>

      <Panel state="user-group">
        <ChatMessage sender="user">
          <ChatMessageBubble data-testid="user-group-first" group="first" name="You">
            First user bubble
          </ChatMessageBubble>
          <ChatMessageBubble data-testid="user-group-middle" group="middle">
            Middle user bubble
          </ChatMessageBubble>
          <ChatMessageBubble data-testid="user-group-last" group="last" metadata={<ChatMessageMetadata timestamp="10:33 AM" status="read" />}>
            Last user bubble
          </ChatMessageBubble>
        </ChatMessage>
      </Panel>

      <Panel state="density">
        {(['compact', 'balanced', 'spacious'] as const).map(density => <ChatMessage key={density} sender="assistant" density={density}>
            <ChatMessageBubble>{density} density</ChatMessageBubble>
          </ChatMessage>)}
      </Panel>

      <Panel state="numeric-slots">
        <ChatMessage sender="assistant">
          <ChatMessageBubble data-testid="numeric-slot-bubble" name={0} metadata={0}>
            Zero is valid React content
          </ChatMessageBubble>
        </ChatMessage>
      </Panel>

      <Panel state="empty-content">
        <ChatMessage sender="assistant">
          <ChatMessageBubble>{null}</ChatMessageBubble>
        </ChatMessage>
      </Panel>
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div data-chat-message-bubble-narrow style={{
    ...fixtureStyle,
    width: 320,
    maxWidth: '100%'
  }}>
      <Panel state="narrow-long-content">
        <ChatMessage sender="assistant">
          <ChatMessageBubble name="Navi">
            A long message wraps without forcing horizontal scrolling, including
            the unbroken value
            abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz0123456789.
          </ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="user">
          <ChatMessageBubble width="100%">
            A full-width bubble remains inside its narrow parent.
          </ChatMessageBubble>
        </ChatMessage>
      </Panel>
    </div>
}`,...p.parameters?.docs?.source}}},m=[`States`,`NarrowLongContent`]}))();export{p as NarrowLongContent,f as States,m as __namedExportsOrder,c as default};