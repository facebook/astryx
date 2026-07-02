import{a1 as a}from"./iframe-Z8EfSKmM.js";import{B as e}from"./Badge-md6xy498.js";import"./preload-helper-Ct5FWWRu.js";const c={title:"Core/Badge",component:e,tags:["autodocs"],argTypes:{variant:{control:"select",options:["neutral","info","success","warning","error","blue","cyan","green","orange","pink","purple","red","teal","yellow"],description:"Visual style variant"},label:{control:"text",description:"Badge label text"}}},r={args:{label:"Badge"}},l={render:()=>a.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[a.jsx(e,{variant:"neutral",label:"Neutral"}),a.jsx(e,{variant:"info",label:"Info"}),a.jsx(e,{variant:"success",label:"Success"}),a.jsx(e,{variant:"warning",label:"Warning"}),a.jsx(e,{variant:"error",label:"Error"})]})},s={render:()=>a.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[a.jsx(e,{variant:"info",label:3}),a.jsx(e,{variant:"error",label:"99+"}),a.jsx(e,{variant:"success",label:12})]})},n={render:()=>a.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[a.jsx(e,{variant:"success",label:"Active"}),a.jsx(e,{variant:"warning",label:"Pending"}),a.jsx(e,{variant:"error",label:"Failed"}),a.jsx(e,{variant:"neutral",label:"Draft"})]})},t={render:()=>a.jsxs("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap"},children:[a.jsx(e,{variant:"blue",label:"Design"}),a.jsx(e,{variant:"cyan",label:"DevOps"}),a.jsx(e,{variant:"green",label:"Backend"}),a.jsx(e,{variant:"orange",label:"Urgent"}),a.jsx(e,{variant:"pink",label:"Marketing"}),a.jsx(e,{variant:"purple",label:"Engineering"}),a.jsx(e,{variant:"red",label:"Critical"}),a.jsx(e,{variant:"teal",label:"Research"}),a.jsx(e,{variant:"yellow",label:"Review"})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Badge'
  }
}`,...r.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Badge variant="neutral" label="Neutral" />
      <Badge variant="info" label="Info" />
      <Badge variant="success" label="Success" />
      <Badge variant="warning" label="Warning" />
      <Badge variant="error" label="Error" />
    </div>
}`,...l.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Badge variant="info" label={3} />
      <Badge variant="error" label="99+" />
      <Badge variant="success" label={12} />
    </div>
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Badge variant="success" label="Active" />
      <Badge variant="warning" label="Pending" />
      <Badge variant="error" label="Failed" />
      <Badge variant="neutral" label="Draft" />
    </div>
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  }}>
      <Badge variant="blue" label="Design" />
      <Badge variant="cyan" label="DevOps" />
      <Badge variant="green" label="Backend" />
      <Badge variant="orange" label="Urgent" />
      <Badge variant="pink" label="Marketing" />
      <Badge variant="purple" label="Engineering" />
      <Badge variant="red" label="Critical" />
      <Badge variant="teal" label="Research" />
      <Badge variant="yellow" label="Review" />
    </div>
}`,...t.parameters?.docs?.source}}};const g=["Default","Variants","Counts","StatusLabels","NonSemanticColors"];export{s as Counts,r as Default,t as NonSemanticColors,n as StatusLabels,l as Variants,g as __namedExportsOrder,c as default};
