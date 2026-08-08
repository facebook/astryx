import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a,t as o}from"./themeProps-CREkzZh6.js";import{t as s}from"./jsx-runtime-DeHZSEgm.js";import{n as c,t as l}from"./Avatar-DiNe9zDi.js";import{n as u,t as d}from"./ChatMessageList-DlT3EcUX.js";import{n as f,t as p}from"./ChatMessage-CIX1HzVk.js";import{n as m,t as h}from"./ChatMessageBubble-Crrsl6XG.js";import{n as g,t as _}from"./Markdown-DFqNxorh.js";function v(){return(0,S.jsxs)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 14 14`,fill:`none`,children:[(0,S.jsx)(`circle`,{cx:`7`,cy:`7`,r:`5.5`,stroke:`currentColor`,strokeWidth:`1.5`,strokeDasharray:`3 2`}),(0,S.jsx)(`circle`,{cx:`5.5`,cy:`7`,r:`0.75`,fill:`currentColor`}),(0,S.jsx)(`circle`,{cx:`8.5`,cy:`7`,r:`0.75`,fill:`currentColor`})]})}function y(){return(0,S.jsx)(`svg`,{width:`12`,height:`12`,viewBox:`0 0 12 12`,fill:`none`,children:(0,S.jsx)(`path`,{d:`M3 4.5L6 7.5L9 4.5`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`})})}function b(e){let{children:t,label:r=`Thinking`,duration:o,isStreaming:s=!1,isExpanded:c,defaultIsExpanded:l=!1,onExpandedChange:u,xstyle:d,className:f,style:p,...m}=e,[h,g]=(0,x.useState)(l),_=c!==void 0,b=_?c:h,w=(0,x.useId)(),T=(0,x.useCallback)(()=>{let e=!b;_||g(e),u?.(e)},[b,_,u]),E=typeof t==`string`?t:null;return(0,S.jsxs)(`div`,{...i(a(`chat-reasoning`,{expanded:b?`expanded`:null,streaming:s?`streaming`:null}),n(C.root,d),f,p),...m,children:[(0,S.jsxs)(`div`,{role:`button`,tabIndex:0,"aria-expanded":b,"aria-controls":w,onClick:T,onKeyDown:e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),T())},className:`astryx78zum5 astryx6s0dn4 astryx1s4dlld astryx1ypdohk astryx87ps6o astryxjwf9q1 astryx13f7esw`,children:[(0,S.jsx)(`span`,{className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx2lah0s astryx1kky2od astryxlup9mm astryxv1l7n4`,children:(0,S.jsx)(v,{})}),(0,S.jsxs)(`div`,{className:`astryx78zum5 astryx6s0dn4 astryxzye2dw astryxeuugli astryxb3r6kr`,children:[(0,S.jsx)(`span`,{...{0:{className:`astryx141an7d astryx1ltkj2j astryx9ynric astryx1e4wzip astryxv1l7n4 astryxuxw1ft astryx2lah0s`},1:{className:`astryx141an7d astryx1ltkj2j astryx9ynric astryx1e4wzip astryxuxw1ft astryx2lah0s astryxct3ic7 astryxakli9p astryx1ta4xzc astryx19co3pv astryx1jnua58 astryxeaay5l astryx1esw782 astryxa4qsjk`}}[!!s<<0],children:r}),o!=null&&!s&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`span`,{className:`astryx141an7d astryxnbbluu astryx2lah0s`,children:`·`}),(0,S.jsx)(`span`,{className:`astryx141an7d astryx1ltkj2j astryx9ynric astryxnbbluu astryxuxw1ft astryx2lah0s`,children:o})]}),!b&&E&&!s&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`span`,{className:`astryx141an7d astryxnbbluu astryx2lah0s`,children:`—`}),(0,S.jsx)(`span`,{className:`astryx141an7d astryx1ltkj2j astryx9ynric astryxnbbluu astryxuxw1ft astryxb3r6kr astryxlyipyv astryxeuugli`,children:E})]})]}),(0,S.jsx)(`span`,{...{0:{className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx2lah0s astryx6jxa94 astryx1v9usgg astryxnbbluu astryx1ob6yzd`},1:{className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx2lah0s astryx6jxa94 astryx1v9usgg astryxnbbluu astryx1ob6yzd astryx19jd1h0`}}[!!b<<0],children:(0,S.jsx)(y,{})})]}),(0,S.jsx)(`div`,{id:w,inert:!b,...{0:{className:`astryxrvj5dj astryxihq33y astryxb0j27v`},1:{className:`astryxrvj5dj astryxb0j27v astryx1tu4anv`}}[!!b<<0],children:(0,S.jsx)(`div`,{className:`astryxb3r6kr astryx2lwn1j`,children:(0,S.jsx)(`div`,{className:`astryx1xye8es astryx1f43n9v astryx141an7d astryx1ltkj2j astryx9ynric astryxv1l7n4`,children:t})})})]})}var x,S,C;function w(){return(w=e((()=>{x=t(),r(),o(),S=s(),C={root:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,keoZOQ:`astryxtbrsbv`,$$css:!0}},b.displayName=`ChatReasoning`,b.__docgenInfo={description:`Compact collapsible display for model reasoning/thinking content.

Renders as a single line: icon + label + duration + ellipsized preview.
Expands to show full reasoning on click.

@example
\`\`\`
<ChatMessage sender="assistant">
  <ChatReasoning duration="12s">
    Let me work through the constraints on adjacent fields...
  </ChatReasoning>
  <Markdown>{response}</Markdown>
</ChatMessage>
\`\`\``,methods:[],displayName:`ChatReasoning`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},children:{required:!0,tsType:{name:`ReactNode`},description:`Reasoning content. String renders as plain text; ReactNode for Markdown etc.`},label:{required:!1,tsType:{name:`string`},description:`Header label. @default 'Thinking'`},duration:{required:!1,tsType:{name:`string`},description:`Duration string shown after label (e.g. "12s").`},isStreaming:{required:!1,tsType:{name:`boolean`},description:`Whether reasoning is still streaming. Shows shimmer on label.`},isExpanded:{required:!1,tsType:{name:`boolean`},description:`Controlled expanded state.`},defaultIsExpanded:{required:!1,tsType:{name:`boolean`},description:`Default expanded state (uncontrolled). @default false`},onExpandedChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(isExpanded: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`isExpanded`}],return:{name:`void`}}},description:`Callback when expanded state changes.`}},composes:[`Omit`]}})))()}var T,E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{u(),f(),m(),w(),c(),g(),T=t(),E=s(),D={title:`Lab/ChatReasoning`,component:b,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,E.jsx)(`div`,{style:{width:600,padding:40},children:(0,E.jsx)(e,{})})]},O={render:()=>(0,E.jsx)(b,{duration:`12s`,children:`Let me work through the constraints systematically. The farmer has 3 fields and rotates wheat, corn, soy. No same crop in adjacent fields and no same crop in the same field two years in a row...`})},k={render:()=>(0,E.jsx)(b,{duration:`8s`,defaultIsExpanded:!0,children:(0,E.jsx)(_,{density:`compact`,children:`First, I need to understand the constraints:
1. Three fields, three crops (wheat, corn, soy)
2. No adjacent fields can have the same crop
3. No field can repeat its crop from the previous year

For **Year 1**: 3 × 2 × 2 = 12 arrangements...`})})},A={render:()=>{let[e,t]=(0,T.useState)(!0);return(0,T.useEffect)(()=>{let e=setTimeout(()=>t(!1),5e3);return()=>clearTimeout(e)},[]),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(b,{isStreaming:e,label:`Thinking`,children:`Working through the combinatorial constraints...`}),!e&&(0,E.jsx)(`p`,{style:{marginTop:8,fontSize:13,color:`#888`},children:`(Shimmer stopped after 5s)`})]})}},j={render:()=>(0,E.jsx)(b,{label:`Analyzing`,duration:`3s`,children:`Checking the codebase for similar patterns...`})},M={render:()=>(0,E.jsxs)(d,{children:[(0,E.jsx)(p,{sender:`user`,children:(0,E.jsx)(h,{children:`How many valid planting arrangements are possible over 3 years?`})}),(0,E.jsxs)(p,{sender:`assistant`,avatar:(0,E.jsx)(l,{name:`AI`,size:`md`}),children:[(0,E.jsx)(b,{duration:`12s`,children:`Let me work through the constraints systematically...`}),(0,E.jsx)(_,{density:`compact`,children:`There are **42** valid planting arrangements over 3 years.`})]})]})},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <ChatReasoning duration="12s">
      Let me work through the constraints systematically. The farmer has 3
      fields and rotates wheat, corn, soy. No same crop in adjacent fields and
      no same crop in the same field two years in a row...
    </ChatReasoning>
}`,...O.parameters?.docs?.source},description:{story:`Collapsed (default) — shows label, duration, and ellipsis preview`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <ChatReasoning duration="8s" defaultIsExpanded>
      <Markdown density="compact">{\`First, I need to understand the constraints:
1. Three fields, three crops (wheat, corn, soy)
2. No adjacent fields can have the same crop
3. No field can repeat its crop from the previous year

For **Year 1**: 3 \\u00d7 2 \\u00d7 2 = 12 arrangements...\`}</Markdown>
    </ChatReasoning>
}`,...k.parameters?.docs?.source},description:{story:`Expanded — shows full reasoning content`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [streaming, setStreaming] = useState(true);
    useEffect(() => {
      const t = setTimeout(() => setStreaming(false), 5000);
      return () => clearTimeout(t);
    }, []);
    return <div>
        <ChatReasoning isStreaming={streaming} label="Thinking">
          Working through the combinatorial constraints...
        </ChatReasoning>
        {!streaming && <p style={{
        marginTop: 8,
        fontSize: 13,
        color: '#888'
      }}>
            (Shimmer stopped after 5s)
          </p>}
      </div>;
  }
}`,...A.parameters?.docs?.source},description:{story:`Streaming — shimmer effect on label while thinking`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <ChatReasoning label="Analyzing" duration="3s">
      Checking the codebase for similar patterns...
    </ChatReasoning>
}`,...j.parameters?.docs?.source},description:{story:`Custom label`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessageList>
      <ChatMessage sender="user">
        <ChatMessageBubble>
          How many valid planting arrangements are possible over 3 years?
        </ChatMessageBubble>
      </ChatMessage>
      <ChatMessage sender="assistant" avatar={<Avatar name="AI" size="md" />}>
        <ChatReasoning duration="12s">
          Let me work through the constraints systematically...
        </ChatReasoning>
        <Markdown density="compact">{\`There are **42** valid planting arrangements over 3 years.\`}</Markdown>
      </ChatMessage>
    </ChatMessageList>
}`,...M.parameters?.docs?.source},description:{story:`In a message — reasoning above the response`,...M.parameters?.docs?.description}}},N=[`Collapsed`,`Expanded`,`Streaming`,`CustomLabel`,`InMessage`]})))()}P();export{O as Collapsed,j as CustomLabel,k as Expanded,M as InMessage,A as Streaming,N as __namedExportsOrder,D as default};