import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{D as n,E as r}from"./iframe-iQ3nuRH_.js";var i,a,o,s,c,l,u,d;e((()=>{r(),i=t(),a={title:`Core/StatusDot`,component:n,tags:[`autodocs`],argTypes:{variant:{control:`select`,options:[`success`,`warning`,`error`,`accent`,`neutral`],description:`Semantic color variant`},label:{control:`text`,description:`Accessible label`},isPulsing:{control:`boolean`,description:`Pulse animation`},tooltip:{control:`text`,description:`Tooltip text on hover`}}},o={args:{variant:`success`,label:`Online`}},s={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`success`,label:`Positive`}),(0,i.jsx)(n,{variant:`warning`,label:`Warning`}),(0,i.jsx)(n,{variant:`error`,label:`Negative`}),(0,i.jsx)(n,{variant:`accent`,label:`Info`}),(0,i.jsx)(n,{variant:`neutral`,label:`Neutral`})]})},c={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`success`,label:`Live`,isPulsing:!0}),(0,i.jsx)(n,{variant:`warning`,label:`Processing`,isPulsing:!0}),(0,i.jsx)(n,{variant:`error`,label:`Error`,isPulsing:!0})]})},l={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`success`,label:`Online`}),(0,i.jsx)(`span`,{children:`Online`})]}),(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`warning`,label:`Away`}),(0,i.jsx)(`span`,{children:`Away`})]}),(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`error`,label:`Offline`}),(0,i.jsx)(`span`,{children:`Offline`})]}),(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`neutral`,label:`Unknown`}),(0,i.jsx)(`span`,{children:`Unknown`})]})]})},u={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`16px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`success`,label:`Online`,tooltip:`Online`}),(0,i.jsx)(n,{variant:`warning`,label:`Away`,tooltip:`Away`}),(0,i.jsx)(n,{variant:`error`,label:`Offline`,tooltip:`Offline`}),(0,i.jsx)(n,{variant:`neutral`,label:`Unknown`,tooltip:`Unknown`})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'success',
    label: 'Online'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <StatusDot variant="success" label="Live" isPulsing />
      <StatusDot variant="warning" label="Processing" isPulsing />
      <StatusDot variant="error" label="Error" isPulsing />
    </div>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d=[`Default`,`Variants`,`Pulsing`,`StatusIndicators`,`WithTooltip`]}))();export{o as Default,c as Pulsing,l as StatusIndicators,s as Variants,u as WithTooltip,d as __namedExportsOrder,a as default};