import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./ChatTokenizedText-DXBhpWZ0.js";import{n as i,t as a}from"./ChatMessage-CIX1HzVk.js";import{n as o,t as s}from"./ChatMessageBubble-Crrsl6XG.js";var c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{n(),i(),o(),c=t(),l={title:`Core/ChatTokenizedText`,component:r,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,c.jsx)(`div`,{style:{width:500,padding:40},children:(0,c.jsx)(e,{})})]},u=[{value:`@cindy`,label:`@Cindy Zhang`,variant:`blue`},{value:`@navi`,label:`@Navi`,variant:`blue`},{value:`@alex`,label:`@Alex Rivera`,variant:`blue`}],d={render:()=>(0,c.jsx)(a,{sender:`user`,children:(0,c.jsx)(s,{children:(0,c.jsx)(r,{tokens:u,children:`Hey @cindy can you review this?`})})})},f={render:()=>(0,c.jsx)(a,{sender:`user`,children:(0,c.jsx)(s,{children:(0,c.jsx)(r,{tokens:u,children:`@cindy and @alex can @navi help with the review?`})})})},p={render:()=>(0,c.jsx)(a,{sender:`user`,children:(0,c.jsx)(s,{children:(0,c.jsx)(r,{children:`Just a regular message with no mentions.`})})})},m={render:()=>(0,c.jsx)(a,{sender:`user`,children:(0,c.jsx)(s,{children:(0,c.jsx)(r,{tokens:[{value:`@cindy`,label:`@Cindy`,variant:`blue`},{value:`#bug`,label:`#bug`,variant:`red`},{value:`#feat`,label:`#feature`,variant:`green`}],children:`@cindy filed #bug and #feat for the sprint`})})})},h={render:()=>(0,c.jsx)(a,{sender:`user`,children:(0,c.jsx)(s,{children:(0,c.jsx)(r,{tokens:u,children:`@cindy this is for @navi`})})})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          Hey @cindy can you review this?
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...d.parameters?.docs?.source},description:{story:`Single mention token`,...d.parameters?.docs?.description}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          @cindy and @alex can @navi help with the review?
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...f.parameters?.docs?.source},description:{story:`Multiple mentions in one message`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText>
          Just a regular message with no mentions.
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...p.parameters?.docs?.source},description:{story:`No tokens — renders as plain text`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:`Tokens with different variants`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          @cindy this is for @navi
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...h.parameters?.docs?.source},description:{story:`Token at start and end of message`,...h.parameters?.docs?.description}}},g=[`SingleToken`,`MultipleTokens`,`PlainText`,`MixedVariants`,`TokensAtEdges`]})))()}_();export{m as MixedVariants,f as MultipleTokens,p as PlainText,d as SingleToken,h as TokensAtEdges,g as __namedExportsOrder,l as default};