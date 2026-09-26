import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-BXEuttRu.js";import{t as r}from"./Text-CRXEW_aT.js";import{_i as i,di as a,ei as o,hi as s,yi as c}from"./iframe-Cheb2vvR.js";var l,u,d,f,p,m,h,g,_;e((()=>{o(),r(),l=t(),u={title:`Core/ChatMessageList`,component:c,tags:[`autodocs`],args:{children:null}},d=()=>new Promise(()=>{}),f={args:{density:`balanced`,align:`bottom`,isStreaming:!1},render:e=>(0,l.jsx)(`div`,{style:{height:440,display:`flex`,flexDirection:`column`},children:(0,l.jsxs)(c,{...e,children:[(0,l.jsx)(a,{variant:`divider`,children:`Today`}),(0,l.jsx)(i,{sender:`user`,children:(0,l.jsx)(s,{children:`Could you summarize the update?`})}),(0,l.jsx)(i,{sender:`assistant`,children:(0,l.jsx)(s,{children:`The issue is resolved. The next update will include the remaining details.`})})]})})},p={render:()=>(0,l.jsxs)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:16},children:[(0,l.jsx)(`div`,{style:{width:280,height:320,display:`flex`,flexDirection:`column`},children:(0,l.jsx)(c,{"aria-label":`Text empty state`,emptyState:(0,l.jsx)(n,{children:`No messages yet`}),children:[]})}),(0,l.jsx)(`div`,{style:{width:280,height:320,display:`flex`,flexDirection:`column`},children:(0,l.jsx)(c,{"aria-label":`Numeric empty state`,emptyState:0,children:[]})})]})},m={render:()=>(0,l.jsx)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:16},children:[`compact`,`balanced`,`spacious`].map((e,t)=>(0,l.jsxs)(`div`,{style:{width:280,height:320,display:`flex`,flexDirection:`column`},children:[(0,l.jsxs)(n,{type:`supporting`,children:[e,` / `,t===0?`top`:`bottom`]}),(0,l.jsx)(c,{density:e,align:t===0?`top`:`bottom`,children:(0,l.jsx)(i,{sender:`assistant`,children:(0,l.jsx)(s,{children:`A short conversation.`})})})]},e))})},h={render:()=>(0,l.jsx)(`div`,{style:{height:220,overflowY:`auto`},children:(0,l.jsx)(c,{align:`top`,children:Array.from({length:8},(e,t)=>(0,l.jsx)(i,{sender:t%2==0?`user`:`assistant`,children:(0,l.jsxs)(s,{children:[`Conversation item `,t+1,`. This message wraps on narrower screens while the surrounding transcript remains scrollable.`]})},t))})})},g={render:()=>(0,l.jsx)(`div`,{style:{height:320,display:`flex`,flexDirection:`column`},children:(0,l.jsx)(c,{align:`top`,scrollToTopAction:d,children:(0,l.jsx)(i,{sender:`assistant`,children:(0,l.jsx)(s,{children:`Earlier message remains readable while older messages load.`})})})})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'balanced',
    align: 'bottom',
    isStreaming: false
  },
  render: args => <div style={{
    height: 440,
    display: 'flex',
    flexDirection: 'column'
  }}>
      <ChatMessageList {...args}>
        <ChatSystemMessage variant="divider">Today</ChatSystemMessage>
        <ChatMessage sender="user">
          <ChatMessageBubble>Could you summarize the update?</ChatMessageBubble>
        </ChatMessage>
        <ChatMessage sender="assistant">
          <ChatMessageBubble>
            The issue is resolved. The next update will include the remaining
            details.
          </ChatMessageBubble>
        </ChatMessage>
      </ChatMessageList>
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16
  }}>
      <div style={{
      width: 280,
      height: 320,
      display: 'flex',
      flexDirection: 'column'
    }}>
        <ChatMessageList aria-label="Text empty state" emptyState={<Text>No messages yet</Text>}>
          {[]}
        </ChatMessageList>
      </div>
      <div style={{
      width: 280,
      height: 320,
      display: 'flex',
      flexDirection: 'column'
    }}>
        <ChatMessageList aria-label="Numeric empty state" emptyState={0}>
          {[]}
        </ChatMessageList>
      </div>
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16
  }}>
      {(['compact', 'balanced', 'spacious'] as const).map((density, index) => <div key={density} style={{
      width: 280,
      height: 320,
      display: 'flex',
      flexDirection: 'column'
    }}>
          <Text type="supporting">
            {density} / {index === 0 ? 'top' : 'bottom'}
          </Text>
          <ChatMessageList density={density} align={index === 0 ? 'top' : 'bottom'}>
            <ChatMessage sender="assistant">
              <ChatMessageBubble>A short conversation.</ChatMessageBubble>
            </ChatMessage>
          </ChatMessageList>
        </div>)}
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    height: 220,
    overflowY: 'auto'
  }}>
      <ChatMessageList align="top">
        {Array.from({
        length: 8
      }, (_, index) => <ChatMessage key={index} sender={index % 2 === 0 ? 'user' : 'assistant'}>
            <ChatMessageBubble>
              Conversation item {index + 1}. This message wraps on narrower
              screens while the surrounding transcript remains scrollable.
            </ChatMessageBubble>
          </ChatMessage>)}
      </ChatMessageList>
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    height: 320,
    display: 'flex',
    flexDirection: 'column'
  }}>
      <ChatMessageList align="top" scrollToTopAction={pendingOlderMessages}>
        <ChatMessage sender="assistant">
          <ChatMessageBubble>
            Earlier message remains readable while older messages load.
          </ChatMessageBubble>
        </ChatMessage>
      </ChatMessageList>
    </div>
}`,...g.parameters?.docs?.source}}},_=[`Conversation`,`Empty`,`DensityAndAlignment`,`Overflow`,`LoadingOlder`]}))();export{f as Conversation,m as DensityAndAlignment,p as Empty,g as LoadingOlder,h as Overflow,_ as __namedExportsOrder,u as default};