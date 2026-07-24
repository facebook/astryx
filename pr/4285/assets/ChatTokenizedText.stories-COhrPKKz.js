import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{Br as n,Rr as r,Tr as i,Wr as a}from"./iframe-BPhJd9TG.js";var o,s,c,l,u,d,f,p,m;e((()=>{i(),o=t(),s={title:`Core/ChatTokenizedText`,component:a,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,o.jsx)(`div`,{style:{width:500,padding:40},children:(0,o.jsx)(e,{})})]},c=[{value:`@cindy`,label:`@Cindy Zhang`,variant:`blue`},{value:`@navi`,label:`@Navi`,variant:`blue`},{value:`@alex`,label:`@Alex Rivera`,variant:`blue`}],l={render:()=>(0,o.jsx)(n,{sender:`user`,children:(0,o.jsx)(r,{children:(0,o.jsx)(a,{tokens:c,children:`Hey @cindy can you review this?`})})})},u={render:()=>(0,o.jsx)(n,{sender:`user`,children:(0,o.jsx)(r,{children:(0,o.jsx)(a,{tokens:c,children:`@cindy and @alex can @navi help with the review?`})})})},d={render:()=>(0,o.jsx)(n,{sender:`user`,children:(0,o.jsx)(r,{children:(0,o.jsx)(a,{children:`Just a regular message with no mentions.`})})})},f={render:()=>(0,o.jsx)(n,{sender:`user`,children:(0,o.jsx)(r,{children:(0,o.jsx)(a,{tokens:[{value:`@cindy`,label:`@Cindy`,variant:`blue`},{value:`#bug`,label:`#bug`,variant:`red`},{value:`#feat`,label:`#feature`,variant:`green`}],children:`@cindy filed #bug and #feat for the sprint`})})})},p={render:()=>(0,o.jsx)(n,{sender:`user`,children:(0,o.jsx)(r,{children:(0,o.jsx)(a,{tokens:c,children:`@cindy this is for @navi`})})})},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          Hey @cindy can you review this?
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...l.parameters?.docs?.source},description:{story:`Single mention token`,...l.parameters?.docs?.description}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          @cindy and @alex can @navi help with the review?
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...u.parameters?.docs?.source},description:{story:`Multiple mentions in one message`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText>
          Just a regular message with no mentions.
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...d.parameters?.docs?.source},description:{story:`No tokens — renders as plain text`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={[{
        value: '@cindy',
        label: '@Cindy',
        variant: 'blue'
      }, {
        value: '#bug',
        label: '#bug',
        variant: 'red'
      }, {
        value: '#feat',
        label: '#feature',
        variant: 'green'
      }]}>
          @cindy filed #bug and #feat for the sprint
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...f.parameters?.docs?.source},description:{story:`Tokens with different variants`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          @cindy this is for @navi
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...p.parameters?.docs?.source},description:{story:`Token at start and end of message`,...p.parameters?.docs?.description}}},m=[`SingleToken`,`MultipleTokens`,`PlainText`,`MixedVariants`,`TokensAtEdges`]}))();export{f as MixedVariants,u as MultipleTokens,d as PlainText,l as SingleToken,p as TokensAtEdges,m as __namedExportsOrder,s as default};