import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{i,t as a}from"./Avatar-Bz4t0ZiU.js";import{Br as o,Cr as s,Hr as c,Rr as l,Sr as u,Tr as d}from"./iframe-DDpBXOWV.js";import{kn as f,t as p}from"./src-t7an_AE-.js";var m,h,g,_,v,y,b,x,S;e((()=>{d(),p(),a(),u(),m=t(n()),h=r(),g={title:`Lab/ChatReasoning`,component:f,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,h.jsx)(`div`,{style:{width:600,padding:40},children:(0,h.jsx)(e,{})})]},_={render:()=>(0,h.jsx)(f,{duration:`12s`,children:`Let me work through the constraints systematically. The farmer has 3 fields and rotates wheat, corn, soy. No same crop in adjacent fields and no same crop in the same field two years in a row...`})},v={render:()=>(0,h.jsx)(f,{duration:`8s`,defaultIsExpanded:!0,children:(0,h.jsx)(s,{density:`compact`,children:`First, I need to understand the constraints:
1. Three fields, three crops (wheat, corn, soy)
2. No adjacent fields can have the same crop
3. No field can repeat its crop from the previous year

For **Year 1**: 3 × 2 × 2 = 12 arrangements...`})})},y={render:()=>{let[e,t]=(0,m.useState)(!0);return(0,m.useEffect)(()=>{let e=setTimeout(()=>t(!1),5e3);return()=>clearTimeout(e)},[]),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(f,{isStreaming:e,label:`Thinking`,children:`Working through the combinatorial constraints...`}),!e&&(0,h.jsx)(`p`,{style:{marginTop:8,fontSize:13,color:`#888`},children:`(Shimmer stopped after 5s)`})]})}},b={render:()=>(0,h.jsx)(f,{label:`Analyzing`,duration:`3s`,children:`Checking the codebase for similar patterns...`})},x={render:()=>(0,h.jsxs)(c,{children:[(0,h.jsx)(o,{sender:`user`,children:(0,h.jsx)(l,{children:`How many valid planting arrangements are possible over 3 years?`})}),(0,h.jsxs)(o,{sender:`assistant`,avatar:(0,h.jsx)(i,{name:`AI`,size:`md`}),children:[(0,h.jsx)(f,{duration:`12s`,children:`Let me work through the constraints systematically...`}),(0,h.jsx)(s,{density:`compact`,children:`There are **42** valid planting arrangements over 3 years.`})]})]})},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <ChatReasoning duration="12s">
      Let me work through the constraints systematically. The farmer has 3
      fields and rotates wheat, corn, soy. No same crop in adjacent fields and
      no same crop in the same field two years in a row...
    </ChatReasoning>
}`,..._.parameters?.docs?.source},description:{story:`Collapsed (default) — shows label, duration, and ellipsis preview`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <ChatReasoning duration="8s" defaultIsExpanded>
      <Markdown density="compact">{\`First, I need to understand the constraints:
1. Three fields, three crops (wheat, corn, soy)
2. No adjacent fields can have the same crop
3. No field can repeat its crop from the previous year

For **Year 1**: 3 \\u00d7 2 \\u00d7 2 = 12 arrangements...\`}</Markdown>
    </ChatReasoning>
}`,...v.parameters?.docs?.source},description:{story:`Expanded — shows full reasoning content`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`Streaming — shimmer effect on label while thinking`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <ChatReasoning label="Analyzing" duration="3s">
      Checking the codebase for similar patterns...
    </ChatReasoning>
}`,...b.parameters?.docs?.source},description:{story:`Custom label`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:`In a message — reasoning above the response`,...x.parameters?.docs?.description}}},S=[`Collapsed`,`Expanded`,`Streaming`,`CustomLabel`,`InMessage`]}))();export{_ as Collapsed,b as CustomLabel,v as Expanded,x as InMessage,y as Streaming,S as __namedExportsOrder,g as default};