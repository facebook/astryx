import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./Badge-C2n4rYrU.js";var i,a,o,s,c,l,u,d,f;e((()=>{r(),i=t(),a={title:`Core/Badge`,component:n,tags:[`autodocs`],argTypes:{variant:{control:`select`,options:[`neutral`,`info`,`success`,`warning`,`error`,`blue`,`cyan`,`green`,`orange`,`pink`,`purple`,`red`,`teal`,`yellow`],description:`Visual style variant`},label:{control:`text`,description:`Badge label text`}}},o={args:{label:`Badge`}},s={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`neutral`,label:`Neutral`}),(0,i.jsx)(n,{variant:`info`,label:`Info`}),(0,i.jsx)(n,{variant:`success`,label:`Success`}),(0,i.jsx)(n,{variant:`warning`,label:`Warning`}),(0,i.jsx)(n,{variant:`error`,label:`Error`})]})},c={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`info`,label:3}),(0,i.jsx)(n,{variant:`error`,label:`99+`}),(0,i.jsx)(n,{variant:`success`,label:12})]})},l={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,i.jsx)(n,{variant:`success`,label:`Active`}),(0,i.jsx)(n,{variant:`warning`,label:`Pending`}),(0,i.jsx)(n,{variant:`error`,label:`Failed`}),(0,i.jsx)(n,{variant:`neutral`,label:`Draft`})]})},u={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`},children:[(0,i.jsx)(n,{variant:`blue`,label:`Design`}),(0,i.jsx)(n,{variant:`cyan`,label:`DevOps`}),(0,i.jsx)(n,{variant:`green`,label:`Backend`}),(0,i.jsx)(n,{variant:`orange`,label:`Urgent`}),(0,i.jsx)(n,{variant:`pink`,label:`Marketing`}),(0,i.jsx)(n,{variant:`purple`,label:`Engineering`}),(0,i.jsx)(n,{variant:`red`,label:`Critical`}),(0,i.jsx)(n,{variant:`teal`,label:`Research`}),(0,i.jsx)(n,{variant:`yellow`,label:`Review`})]})},d={name:`Long labels in tight space`,render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:20},children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`div`,{style:{font:`600 12px system-ui`,marginBottom:6},children:`In a 100px column`}),(0,i.jsx)(`div`,{style:{width:100,outline:`1px dashed var(--color-border)`,padding:4},children:(0,i.jsx)(n,{variant:`pink`,label:`Awaiting security review`})})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`div`,{style:{font:`600 12px system-ui`,marginBottom:6},children:`With an icon — the icon holds its place, the label gives way`}),(0,i.jsx)(`div`,{style:{width:140,outline:`1px dashed var(--color-border)`,padding:4},children:(0,i.jsx)(n,{variant:`warning`,icon:(0,i.jsx)(`span`,{"aria-hidden":`true`,children:`⚠`}),label:`Awaiting security review`})})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`div`,{style:{font:`600 12px system-ui`,marginBottom:6},children:`Room to spare — unchanged`}),(0,i.jsx)(`div`,{style:{width:300,outline:`1px dashed var(--color-border)`,padding:4},children:(0,i.jsx)(n,{variant:`success`,label:`Active`})})]})]}),parameters:{docs:{description:{story:`A badge has a fixed height and never wraps, so a label wider than its container is truncated with an ellipsis rather than escaping the container. A badge that fits is untouched — the clamp only ever changes the case that would otherwise overflow.`}}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Long labels in tight space',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  }}>
      <div>
        <div style={{
        font: '600 12px system-ui',
        marginBottom: 6
      }}>
          In a 100px column
        </div>
        <div style={{
        width: 100,
        outline: '1px dashed var(--color-border)',
        padding: 4
      }}>
          <Badge variant="pink" label="Awaiting security review" />
        </div>
      </div>
      <div>
        <div style={{
        font: '600 12px system-ui',
        marginBottom: 6
      }}>
          With an icon — the icon holds its place, the label gives way
        </div>
        <div style={{
        width: 140,
        outline: '1px dashed var(--color-border)',
        padding: 4
      }}>
          <Badge variant="warning" icon={<span aria-hidden="true">⚠</span>} label="Awaiting security review" />
        </div>
      </div>
      <div>
        <div style={{
        font: '600 12px system-ui',
        marginBottom: 6
      }}>
          Room to spare — unchanged
        </div>
        <div style={{
        width: 300,
        outline: '1px dashed var(--color-border)',
        padding: 4
      }}>
          <Badge variant="success" label="Active" />
        </div>
      </div>
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'A badge has a fixed height and never wraps, so a label wider than its container is truncated with an ellipsis rather than escaping the container. A badge that fits is untouched — the clamp only ever changes the case that would otherwise overflow.'
      }
    }
  }
}`,...d.parameters?.docs?.source}}},f=[`Default`,`Variants`,`Counts`,`StatusLabels`,`NonSemanticColors`,`LongLabels`]}))();export{c as Counts,o as Default,d as LongLabels,u as NonSemanticColors,l as StatusLabels,s as Variants,f as __namedExportsOrder,a as default};