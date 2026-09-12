import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{D as n,E as r}from"./iframe-hWoot3SQ.js";function i(){return(0,a.jsx)(`svg`,{viewBox:`0 0 8 8`,width:8,height:8,"aria-hidden":`true`,children:(0,a.jsx)(`rect`,{x:2.4,y:2.4,width:3.2,height:3.2,fill:`currentColor`,transform:`rotate(45 4 4)`})})}var a,o,s,c,l,u,d,f,p;e((()=>{r(),a=t(),o={title:`Core/StatusDot`,component:n,tags:[`autodocs`],argTypes:{variant:{control:`select`,options:[`success`,`warning`,`error`,`accent`,`neutral`],description:`Semantic color variant`},label:{control:`text`,description:`Accessible label`},isPulsing:{control:`boolean`,description:`Pulse animation`},tooltip:{control:`text`,description:`Tooltip text on hover`}}},s={args:{variant:`success`,label:`Online`}},c={render:()=>(0,a.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,a.jsx)(n,{variant:`success`,label:`Positive`}),(0,a.jsx)(n,{variant:`warning`,label:`Warning`}),(0,a.jsx)(n,{variant:`error`,label:`Negative`}),(0,a.jsx)(n,{variant:`accent`,label:`Info`}),(0,a.jsx)(n,{variant:`neutral`,label:`Neutral`})]})},l={render:()=>(0,a.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,a.jsx)(n,{variant:`success`,label:`Live`,isPulsing:!0}),(0,a.jsx)(n,{variant:`warning`,label:`Processing`,isPulsing:!0}),(0,a.jsx)(n,{variant:`error`,label:`Error`,isPulsing:!0})]})},u={render:()=>(0,a.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,a.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,a.jsx)(n,{variant:`success`,label:`Online`}),(0,a.jsx)(`span`,{children:`Online`})]}),(0,a.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,a.jsx)(n,{variant:`warning`,label:`Away`}),(0,a.jsx)(`span`,{children:`Away`})]}),(0,a.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,a.jsx)(n,{variant:`error`,label:`Offline`}),(0,a.jsx)(`span`,{children:`Offline`})]}),(0,a.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,a.jsx)(n,{variant:`neutral`,label:`Unknown`}),(0,a.jsx)(`span`,{children:`Unknown`})]})]})},d={render:()=>(0,a.jsxs)(`div`,{style:{display:`flex`,gap:`16px`,alignItems:`center`},children:[(0,a.jsx)(n,{variant:`success`,label:`Online`,tooltip:`Online`}),(0,a.jsx)(n,{variant:`warning`,label:`Away`,tooltip:`Away`}),(0,a.jsx)(n,{variant:`error`,label:`Offline`,tooltip:`Offline`}),(0,a.jsx)(n,{variant:`neutral`,label:`Unknown`,tooltip:`Unknown`})]})},f={parameters:{docs:{description:{story:"A custom `icon` rendered centered in the dot, painted from `currentColor`. Use a different icon per status so meaning does not rely on colour alone."}}},render:()=>(0,a.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,a.jsx)(n,{variant:`success`,label:`Verified`,icon:(0,a.jsx)(i,{})}),(0,a.jsx)(n,{variant:`accent`,label:`Featured`,icon:(0,a.jsx)(i,{})}),(0,a.jsx)(`span`,{style:{fontSize:`11px`},children:`icon carries the status as a shape`})]})},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'success',
    label: 'Online'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <StatusDot variant="success" label="Live" isPulsing />
      <StatusDot variant="warning" label="Processing" isPulsing />
      <StatusDot variant="error" label="Error" isPulsing />
    </div>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: 'A custom \`icon\` rendered centered in the dot, painted from \`currentColor\`. Use a different icon per status so meaning does not rely on colour alone.'
      }
    }
  },
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <StatusDot variant="success" label="Verified" icon={<DiamondIcon />} />
      <StatusDot variant="accent" label="Featured" icon={<DiamondIcon />} />
      <span style={{
      fontSize: '11px'
    }}>icon carries the status as a shape</span>
    </div>
}`,...f.parameters?.docs?.source},description:{story:`The \`icon\` prop gives the status a non-colour mark. The dot itself is a
colour-only signal by default, so when a dot must stand on its own without
adjacent text, pass a different icon per status (see the usage guidance in
the component docs).`,...f.parameters?.docs?.description}}},p=[`Default`,`Variants`,`Pulsing`,`StatusIndicators`,`WithTooltip`,`WithIcon`]}))();export{s as Default,l as Pulsing,u as StatusIndicators,c as Variants,f as WithIcon,d as WithTooltip,p as __namedExportsOrder,o as default};