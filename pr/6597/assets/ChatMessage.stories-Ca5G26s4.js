import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-BXEuttRu.js";import{i as r,t as i}from"./Avatar-Dgz1bH13.js";import{t as a}from"./Text-CRXEW_aT.js";import{_i as o,ei as s,hi as c,yi as l}from"./iframe-Bu7W2_bd.js";var u,d,f,p;e((()=>{s(),i(),a(),u=t(),d={title:`Core/ChatMessage`,component:o,tags:[`autodocs`,`visual-theme-matrix`],parameters:{layout:`centered`}},f={render:()=>(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:`min(720px, 90vw)`},children:[(0,u.jsxs)(`section`,{"aria-label":`Sender roles`,style:{display:`flex`,flexDirection:`column`,gap:20},children:[(0,u.jsx)(o,{sender:`assistant`,avatar:(0,u.jsx)(r,{name:`Astra`,size:`md`}),name:`Astra`,metadata:(0,u.jsx)(n,{type:`supporting`,color:`secondary`,children:`Updated just now`}),children:(0,u.jsx)(n,{type:`body`,children:`Here is the summary you asked for, with the sender identity and message metadata attached to the message wrapper.`})}),(0,u.jsx)(o,{sender:`user`,children:(0,u.jsx)(c,{children:`Thanks. Keep the follow-up concise and include the next action.`})}),(0,u.jsx)(o,{sender:`system`,avatar:(0,u.jsx)(r,{name:`System`,size:`md`}),name:`System`,metadata:(0,u.jsx)(`span`,{children:`Suppressed metadata`}),children:(0,u.jsx)(n,{type:`supporting`,color:`secondary`,children:`Conversation archived`})})]}),(0,u.jsx)(`section`,{"aria-label":`Density precedence`,children:(0,u.jsxs)(l,{density:`compact`,style:{border:`1px solid var(--color-border-primary)`,borderRadius:`var(--radius-container)`},children:[(0,u.jsxs)(o,{sender:`assistant`,avatar:(0,u.jsx)(r,{name:`Astra`,size:`sm`}),children:[(0,u.jsx)(c,{children:`Inherited compact density`}),(0,u.jsx)(c,{children:`Second grouped response`})]}),(0,u.jsx)(o,{sender:`user`,density:`spacious`,children:(0,u.jsx)(c,{children:`Explicit spacious density overrides the compact list.`})})]})}),(0,u.jsx)(`section`,{"aria-label":`Narrow long content`,style:{width:320,maxWidth:`100%`},children:(0,u.jsx)(o,{sender:`assistant`,name:`Astra`,children:(0,u.jsx)(c,{children:`Long messages wrap inside a narrow conversation without changing the sender alignment or forcing the message beyond its container. This sentence intentionally expands the content across several lines.`})})})]})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    width: 'min(720px, 90vw)'
  }}>
      <section aria-label="Sender roles" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }}>
        <ChatMessage sender="assistant" avatar={<Avatar name="Astra" size="md" />} name="Astra" metadata={<Text type="supporting" color="secondary">
              Updated just now
            </Text>}>
          <Text type="body">
            Here is the summary you asked for, with the sender identity and
            message metadata attached to the message wrapper.
          </Text>
        </ChatMessage>

        <ChatMessage sender="user">
          <ChatMessageBubble>
            Thanks. Keep the follow-up concise and include the next action.
          </ChatMessageBubble>
        </ChatMessage>

        <ChatMessage sender="system" avatar={<Avatar name="System" size="md" />} name="System" metadata={<span>Suppressed metadata</span>}>
          <Text type="supporting" color="secondary">
            Conversation archived
          </Text>
        </ChatMessage>
      </section>

      <section aria-label="Density precedence">
        <ChatMessageList density="compact" style={{
        border: '1px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-container)'
      }}>
          <ChatMessage sender="assistant" avatar={<Avatar name="Astra" size="sm" />}>
            <ChatMessageBubble>Inherited compact density</ChatMessageBubble>
            <ChatMessageBubble>Second grouped response</ChatMessageBubble>
          </ChatMessage>
          <ChatMessage sender="user" density="spacious">
            <ChatMessageBubble>
              Explicit spacious density overrides the compact list.
            </ChatMessageBubble>
          </ChatMessage>
        </ChatMessageList>
      </section>

      <section aria-label="Narrow long content" style={{
      width: 320,
      maxWidth: '100%'
    }}>
        <ChatMessage sender="assistant" name="Astra">
          <ChatMessageBubble>
            Long messages wrap inside a narrow conversation without changing the
            sender alignment or forcing the message beyond its container. This
            sentence intentionally expands the content across several lines.
          </ChatMessageBubble>
        </ChatMessage>
      </section>
    </div>
}`,...f.parameters?.docs?.source}}},p=[`Default`]}))();export{f as Default,p as __namedExportsOrder,d as default};