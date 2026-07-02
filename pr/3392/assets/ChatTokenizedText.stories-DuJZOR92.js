import{a1 as e}from"./iframe-BAsU9Dt9.js";import{C as s}from"./ChatTokenizedText-BAoeHy5H.js";import{C as o}from"./ChatMessage-DwdFsmVK.js";import{C as d}from"./ChatMessageBubble-OxDlNFZM.js";import"./preload-helper-Ct5FWWRu.js";import"./Badge-Besxgd5t.js";import"./ChatContext-CEuX1x8U.js";const C={title:"Core/ChatTokenizedText",component:s,tags:["autodocs"],parameters:{layout:"centered"},decorators:[c=>e.jsx("div",{style:{width:500,padding:40},children:e.jsx(c,{})})]},l=[{value:"@cindy",label:"@Cindy Zhang",variant:"blue"},{value:"@navi",label:"@Navi",variant:"blue"},{value:"@alex",label:"@Alex Rivera",variant:"blue"}],a={render:()=>e.jsx(o,{sender:"user",children:e.jsx(d,{children:e.jsx(s,{tokens:l,children:"Hey @cindy can you review this?"})})})},n={render:()=>e.jsx(o,{sender:"user",children:e.jsx(d,{children:e.jsx(s,{tokens:l,children:"@cindy and @alex can @navi help with the review?"})})})},r={render:()=>e.jsx(o,{sender:"user",children:e.jsx(d,{children:e.jsx(s,{children:"Just a regular message with no mentions."})})})},t={render:()=>e.jsx(o,{sender:"user",children:e.jsx(d,{children:e.jsx(s,{tokens:[{value:"@cindy",label:"@Cindy",variant:"blue"},{value:"#bug",label:"#bug",variant:"red"},{value:"#feat",label:"#feature",variant:"green"}],children:"@cindy filed #bug and #feat for the sprint"})})})},i={render:()=>e.jsx(o,{sender:"user",children:e.jsx(d,{children:e.jsx(s,{tokens:l,children:"@cindy this is for @navi"})})})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          Hey @cindy can you review this?
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...a.parameters?.docs?.source},description:{story:"Single mention token",...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          @cindy and @alex can @navi help with the review?
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...n.parameters?.docs?.source},description:{story:"Multiple mentions in one message",...n.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText>
          Just a regular message with no mentions.
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...r.parameters?.docs?.source},description:{story:"No tokens — renders as plain text",...r.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source},description:{story:"Tokens with different variants",...t.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          @cindy this is for @navi
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...i.parameters?.docs?.source},description:{story:"Token at start and end of message",...i.parameters?.docs?.description}}};const T=["SingleToken","MultipleTokens","PlainText","MixedVariants","TokensAtEdges"];export{t as MixedVariants,n as MultipleTokens,r as PlainText,a as SingleToken,i as TokensAtEdges,T as __namedExportsOrder,C as default};
