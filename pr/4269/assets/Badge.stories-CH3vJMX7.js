import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./Badge-x089lqwb.js";var i,a,o,s,c,l,u,d;e((()=>{r(),i=t(),a={title:`Core/Badge`,component:n,tags:[`autodocs`],argTypes:{variant:{control:`select`,options:[`neutral`,`info`,`success`,`warning`,`error`,`blue`,`cyan`,`green`,`orange`,`pink`,`purple`,`red`,`teal`,`yellow`],description:`Visual style variant`},label:{control:`text`,description:`Badge label text`}}},o={args:{label:`Badge`}},s={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`neutral`,label:`Neutral`}),(0,i.jsx)(n,{variant:`info`,label:`Info`}),(0,i.jsx)(n,{variant:`success`,label:`Success`}),(0,i.jsx)(n,{variant:`warning`,label:`Warning`}),(0,i.jsx)(n,{variant:`error`,label:`Error`})]})},c={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`info`,label:3}),(0,i.jsx)(n,{variant:`error`,label:`99+`}),(0,i.jsx)(n,{variant:`success`,label:12})]})},l={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`success`,label:`Active`}),(0,i.jsx)(n,{variant:`warning`,label:`Pending`}),(0,i.jsx)(n,{variant:`error`,label:`Failed`}),(0,i.jsx)(n,{variant:`neutral`,label:`Draft`})]})},u={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`},children:[(0,i.jsx)(n,{variant:`blue`,label:`Design`}),(0,i.jsx)(n,{variant:`cyan`,label:`DevOps`}),(0,i.jsx)(n,{variant:`green`,label:`Backend`}),(0,i.jsx)(n,{variant:`orange`,label:`Urgent`}),(0,i.jsx)(n,{variant:`pink`,label:`Marketing`}),(0,i.jsx)(n,{variant:`purple`,label:`Engineering`}),(0,i.jsx)(n,{variant:`red`,label:`Critical`}),(0,i.jsx)(n,{variant:`teal`,label:`Research`}),(0,i.jsx)(n,{variant:`yellow`,label:`Review`})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Badge'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  }}>
      <Badge variant="info" label={3} />
      <Badge variant="error" label="99+" />
      <Badge variant="success" label={12} />
    </div>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d=[`Default`,`Variants`,`Counts`,`StatusLabels`,`NonSemanticColors`]}))();export{c as Counts,o as Default,u as NonSemanticColors,l as StatusLabels,s as Variants,d as __namedExportsOrder,a as default};