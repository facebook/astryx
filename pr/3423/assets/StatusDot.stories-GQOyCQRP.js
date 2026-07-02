import{a1 as a}from"./iframe-FpdBIrKz.js";import{S as e}from"./StatusDot-CM8sJB1Z.js";import"./preload-helper-Ct5FWWRu.js";const p={title:"Core/StatusDot",component:e,tags:["autodocs"],argTypes:{variant:{control:"select",options:["success","warning","error","accent","neutral"],description:"Semantic color variant"},label:{control:"text",description:"Accessible label"},isPulsing:{control:"boolean",description:"Pulse animation"},tooltip:{control:"text",description:"Tooltip text on hover"}}},t={args:{variant:"success",label:"Online"}},s={render:()=>a.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[a.jsx(e,{variant:"success",label:"Positive"}),a.jsx(e,{variant:"warning",label:"Warning"}),a.jsx(e,{variant:"error",label:"Negative"}),a.jsx(e,{variant:"accent",label:"Info"}),a.jsx(e,{variant:"neutral",label:"Neutral"})]})},n={render:()=>a.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[a.jsx(e,{variant:"success",label:"Live",isPulsing:!0}),a.jsx(e,{variant:"warning",label:"Processing",isPulsing:!0}),a.jsx(e,{variant:"error",label:"Error",isPulsing:!0})]})},r={render:()=>a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[a.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[a.jsx(e,{variant:"success",label:"Online"}),a.jsx("span",{children:"Online"})]}),a.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[a.jsx(e,{variant:"warning",label:"Away"}),a.jsx("span",{children:"Away"})]}),a.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[a.jsx(e,{variant:"error",label:"Offline"}),a.jsx("span",{children:"Offline"})]}),a.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center"},children:[a.jsx(e,{variant:"neutral",label:"Unknown"}),a.jsx("span",{children:"Unknown"})]})]})},l={render:()=>a.jsxs("div",{style:{display:"flex",gap:"16px",alignItems:"center"},children:[a.jsx(e,{variant:"success",label:"Online",tooltip:"Online"}),a.jsx(e,{variant:"warning",label:"Away",tooltip:"Away"}),a.jsx(e,{variant:"error",label:"Offline",tooltip:"Offline"}),a.jsx(e,{variant:"neutral",label:"Unknown",tooltip:"Unknown"})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'success',
    label: 'Online'
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <StatusDot variant="success" label="Positive" />
      <StatusDot variant="warning" label="Warning" />
      <StatusDot variant="error" label="Negative" />
      <StatusDot variant="accent" label="Info" />
      <StatusDot variant="neutral" label="Neutral" />
    </div>
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <StatusDot variant="success" label="Live" isPulsing />
      <StatusDot variant="warning" label="Processing" isPulsing />
      <StatusDot variant="error" label="Error" isPulsing />
    </div>
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
      <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    }}>
        <StatusDot variant="success" label="Online" />
        <span>Online</span>
      </div>
      <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    }}>
        <StatusDot variant="warning" label="Away" />
        <span>Away</span>
      </div>
      <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    }}>
        <StatusDot variant="error" label="Offline" />
        <span>Offline</span>
      </div>
      <div style={{
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    }}>
        <StatusDot variant="neutral" label="Unknown" />
        <span>Unknown</span>
      </div>
    </div>
}`,...r.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  }}>
      <StatusDot variant="success" label="Online" tooltip="Online" />
      <StatusDot variant="warning" label="Away" tooltip="Away" />
      <StatusDot variant="error" label="Offline" tooltip="Offline" />
      <StatusDot variant="neutral" label="Unknown" tooltip="Unknown" />
    </div>
}`,...l.parameters?.docs?.source}}};const d=["Default","Variants","Pulsing","StatusIndicators","WithTooltip"];export{t as Default,n as Pulsing,r as StatusIndicators,s as Variants,l as WithTooltip,d as __namedExportsOrder,p as default};
