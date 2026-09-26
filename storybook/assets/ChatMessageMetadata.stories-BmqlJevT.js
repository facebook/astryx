import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Button-D8tXiYgG.js";import{t as r}from"./Button-2Dtq4nxO.js";import{_i as i,ei as a,hi as o,pi as s}from"./iframe-Cheb2vvR.js";var c,l,u,d,f;e((()=>{a(),r(),c=t(),l={title:`Core/ChatMessageMetadata`,component:s,tags:[`autodocs`]},u={render:()=>(0,c.jsxs)(`div`,{style:{display:`grid`,gap:16,maxWidth:640},children:[[`sending`,`sent`,`delivered`,`read`,`error`].map(e=>(0,c.jsx)(`section`,{"data-metadata-case":`status-${e}`,children:(0,c.jsx)(i,{sender:`user`,children:(0,c.jsxs)(o,{metadata:(0,c.jsx)(s,{timestamp:`10:30`,status:e}),children:[e,` message`]})})},e)),(0,c.jsx)(`section`,{"data-metadata-case":`assistant-footer`,children:(0,c.jsxs)(i,{sender:`assistant`,children:[(0,c.jsx)(o,{children:`Reply`}),(0,c.jsx)(s,{timestamp:`10:31`,footer:(0,c.jsx)(n,{label:`Copy reply`,onClick:()=>{},size:`sm`})})]})}),(0,c.jsx)(`section`,{"data-metadata-case":`empty-footer`,children:(0,c.jsx)(i,{sender:`assistant`,children:(0,c.jsx)(s,{timestamp:`10:32`,footer:!1})})}),(0,c.jsx)(`section`,{"data-metadata-case":`empty-timestamp`,children:(0,c.jsx)(i,{sender:`assistant`,children:(0,c.jsx)(s,{timestamp:!1,footer:`Model info`})})}),(0,c.jsx)(`section`,{"data-metadata-case":`empty-row`,style:{minHeight:24},children:(0,c.jsx)(i,{sender:`assistant`,children:(0,c.jsx)(s,{timestamp:``,footer:!1})})}),(0,c.jsx)(`section`,{"data-metadata-case":`numeric-slots`,children:(0,c.jsx)(i,{sender:`user`,children:(0,c.jsx)(s,{timestamp:0,footer:0})})}),(0,c.jsx)(`section`,{"data-metadata-case":`standalone`,children:(0,c.jsx)(s,{timestamp:`11:00`,status:`read`})})]})},d={render:()=>(0,c.jsx)(`div`,{"data-metadata-case":`narrow-overflow`,style:{width:320,maxWidth:`100%`},children:(0,c.jsx)(i,{sender:`assistant`,children:(0,c.jsx)(s,{timestamp:`10:32`,footer:`A longer metadata description that can grow when translated into a different language`,status:`delivered`})})})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gap: 16,
    maxWidth: 640
  }}>
      {(['sending', 'sent', 'delivered', 'read', 'error'] as const).map(status => <section key={status} data-metadata-case={\`status-\${status}\`}>
            <ChatMessage sender="user">
              <ChatMessageBubble metadata={<ChatMessageMetadata timestamp="10:30" status={status} />}>
                {status} message
              </ChatMessageBubble>
            </ChatMessage>
          </section>)}
      <section data-metadata-case="assistant-footer">
        <ChatMessage sender="assistant">
          <ChatMessageBubble>Reply</ChatMessageBubble>
          <ChatMessageMetadata timestamp="10:31" footer={<Button label="Copy reply" onClick={() => {}} size="sm" />} />
        </ChatMessage>
      </section>
      <section data-metadata-case="empty-footer">
        <ChatMessage sender="assistant">
          <ChatMessageMetadata timestamp="10:32" footer={false} />
        </ChatMessage>
      </section>
      <section data-metadata-case="empty-timestamp">
        <ChatMessage sender="assistant">
          <ChatMessageMetadata timestamp={false} footer="Model info" />
        </ChatMessage>
      </section>
      <section data-metadata-case="empty-row" style={{
      minHeight: 24
    }}>
        <ChatMessage sender="assistant">
          <ChatMessageMetadata timestamp="" footer={false} />
        </ChatMessage>
      </section>
      <section data-metadata-case="numeric-slots">
        <ChatMessage sender="user">
          <ChatMessageMetadata timestamp={0} footer={0} />
        </ChatMessage>
      </section>
      <section data-metadata-case="standalone">
        <ChatMessageMetadata timestamp="11:00" status="read" />
      </section>
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div data-metadata-case="narrow-overflow" style={{
    width: 320,
    maxWidth: '100%'
  }}>
      <ChatMessage sender="assistant">
        <ChatMessageMetadata timestamp="10:32" footer="A longer metadata description that can grow when translated into a different language" status="delivered" />
      </ChatMessage>
    </div>
}`,...d.parameters?.docs?.source}}},f=[`States`,`NarrowOverflow`]}))();export{d as NarrowOverflow,u as States,f as __namedExportsOrder,l as default};