import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Icon-nqzzJpQf.js";import{t as r}from"./Icon-Dn-zG4Ea.js";import{Gr as i,Vr as a,wr as o,zr as s}from"./iframe-Y-SqSYW9.js";import{i as c,t as l}from"./esm-B13qlNX_.js";var u,d,f,p,m,h,g,_,v,y;e((()=>{o(),r(),l(),u=t(),d={title:`Core/ChatTokenizedText`,component:i,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,u.jsx)(`div`,{style:{width:500,padding:40},children:(0,u.jsx)(e,{})})]},f=[{value:`@cindy`,label:`@Cindy Zhang`,variant:`blue`},{value:`@navi`,label:`@Navi`,variant:`blue`},{value:`@alex`,label:`@Alex Rivera`,variant:`blue`}],p={render:()=>(0,u.jsx)(a,{sender:`user`,children:(0,u.jsx)(s,{children:(0,u.jsx)(i,{tokens:f,children:`Hey @cindy can you review this?`})})})},m={render:()=>(0,u.jsx)(a,{sender:`user`,children:(0,u.jsx)(s,{children:(0,u.jsx)(i,{tokens:f,children:`@cindy and @alex can @navi help with the review?`})})})},h={render:()=>(0,u.jsx)(a,{sender:`user`,children:(0,u.jsx)(s,{children:(0,u.jsx)(i,{children:`Just a regular message with no mentions.`})})})},g={render:()=>(0,u.jsx)(a,{sender:`user`,children:(0,u.jsx)(s,{children:(0,u.jsx)(i,{tokens:[{value:`@cindy`,label:`@Cindy`,variant:`blue`},{value:`#bug`,label:`#bug`,variant:`red`},{value:`#feat`,label:`#feature`,variant:`green`}],children:`@cindy filed #bug and #feat for the sprint`})})})},_={render:()=>(0,u.jsx)(a,{sender:`user`,children:(0,u.jsx)(s,{children:(0,u.jsx)(i,{tokens:f,children:`@cindy this is for @navi`})})})},v={render:()=>(0,u.jsx)(a,{sender:`user`,children:(0,u.jsx)(s,{children:(0,u.jsx)(i,{tokens:[{value:`@cindy`,label:`@Cindy Zhang`,variant:`blue`,icon:(0,u.jsx)(n,{icon:c,size:`sm`})},{value:`@navi`,render:()=>(0,u.jsxs)(`span`,{style:{display:`inline-flex`,alignItems:`center`,gap:4,height:20,padding:`0 8px`,borderRadius:999,background:`#e8def8`,fontSize:12},children:[(0,u.jsx)(`span`,{"aria-hidden":!0,children:`★`}),`@Navi`]})}],children:`Hey @cindy and @navi can you take a look?`})})})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          Hey @cindy can you review this?
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...p.parameters?.docs?.source},description:{story:`Single mention token`,...p.parameters?.docs?.description}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          @cindy and @alex can @navi help with the review?
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...m.parameters?.docs?.source},description:{story:`Multiple mentions in one message`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText>
          Just a regular message with no mentions.
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...h.parameters?.docs?.source},description:{story:`No tokens — renders as plain text`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:`Tokens with different variants`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={mentionTokens}>
          @cindy this is for @navi
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,..._.parameters?.docs?.source},description:{story:`Token at start and end of message`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessage sender="user">
      <ChatMessageBubble>
        <ChatTokenizedText tokens={[{
        value: '@cindy',
        label: '@Cindy Zhang',
        variant: 'blue',
        icon: <Icon icon={UserCircleIcon} size="sm" />
      }, {
        value: '@navi',
        render: () => <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          height: 20,
          padding: '0 8px',
          borderRadius: 999,
          background: '#e8def8',
          fontSize: 12
        }}>
                  <span aria-hidden>★</span>
                  @Navi
                </span>
      }]}>
          Hey @cindy and @navi can you take a look?
        </ChatTokenizedText>
      </ChatMessageBubble>
    </ChatMessage>
}`,...v.parameters?.docs?.source},description:{story:`Tokens carrying an icon, and a fully custom token — both sit on the line`,...v.parameters?.docs?.description}}},y=[`SingleToken`,`MultipleTokens`,`PlainText`,`MixedVariants`,`TokensAtEdges`,`IconAndCustomTokens`]}))();export{v as IconAndCustomTokens,g as MixedVariants,m as MultipleTokens,h as PlainText,p as SingleToken,_ as TokensAtEdges,y as __namedExportsOrder,d as default};