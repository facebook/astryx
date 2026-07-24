import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{Bn as i,zn as a}from"./iframe-4XAMyx57.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y;e((()=>{o=t(n()),a(),s=r(),c={title:`Core/Slider`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},isDisabled:{control:`boolean`,description:`Whether the slider is disabled`},disabledMessage:{control:`text`,description:`Explains why the slider is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the thumb focusable via aria-disabled (value changes stay blocked). Use this instead of wrapping a disabled Slider in Tooltip.`},min:{control:`number`,description:`Minimum value`},max:{control:`number`,description:`Maximum value`},step:{control:`number`,description:`Step increment`},orientation:{control:`select`,options:[`horizontal`,`vertical`],description:`Slider orientation`},valueDisplay:{control:`select`,options:[`tooltip`,`text`,`none`],description:`How the value is displayed`}}},l={render:e=>{let[t,n]=(0,o.useState)(50);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Volume`}},u={render:e=>{let[t,n]=(0,o.useState)([20,80]);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Price range`}},d={render:e=>{let[t,n]=(0,o.useState)(50);return(0,s.jsx)(i,{...e,value:t,onChange:n})},args:{label:`Volume`,marks:[{value:0,label:`0`},{value:25,label:`25`},{value:50,label:`50`},{value:75,label:`75`},{value:100,label:`100`}]}},f={render:e=>{let[t,n]=(0,o.useState)(50);return(0,s.jsx)(i,{...e,value:t,onChange:n,valueDisplay:`text`})},args:{label:`Quantity`,min:0,max:100,step:10}},p={render:e=>{let[t,n]=(0,o.useState)(72);return(0,s.jsx)(i,{...e,value:t,onChange:n,valueDisplay:`text`})},args:{label:`Temperature`,min:60,max:90,step:1,formatValue:e=>`${e}°F`}},m={render:e=>(0,s.jsx)(i,{...e}),args:{label:`Volume`,value:50,isDisabled:!0}},h={render:e=>{let[t,n]=(0,o.useState)(50);return(0,s.jsx)(`div`,{style:{height:200},children:(0,s.jsx)(i,{...e,value:t,onChange:n})})},args:{label:`Volume`,orientation:`vertical`}},g={render:()=>{let[e,t]=(0,o.useState)(95),[n,r]=(0,o.useState)(50),[a,c]=(0,o.useState)(75);return(0,s.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,s.jsx)(i,{label:`CPU Usage`,value:e,onChange:t,status:{type:`error`,message:`CPU usage is critically high`}}),(0,s.jsx)(i,{label:`Memory`,value:n,onChange:r,status:{type:`warning`,message:`Memory usage is moderate`}}),(0,s.jsx)(i,{label:`Disk`,value:a,onChange:c,status:{type:`success`,message:`Disk usage is healthy`}})]})}},_={render:()=>{let[e,t]=(0,o.useState)(50),[n,r]=(0,o.useState)([20,80]),[a,c]=(0,o.useState)(30),[l,u]=(0,o.useState)(72);return(0,s.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`,maxWidth:`400px`},children:[(0,s.jsx)(i,{label:`Default slider`,value:e,onChange:t}),(0,s.jsx)(i,{label:`Range slider`,value:n,onChange:r}),(0,s.jsx)(i,{label:`With marks`,value:a,onChange:c,marks:[{value:0,label:`0%`},{value:50,label:`50%`},{value:100,label:`100%`}]}),(0,s.jsx)(i,{label:`With text display`,value:l,onChange:u,formatValue:e=>`${e}°F`,valueDisplay:`text`,min:60,max:90}),(0,s.jsx)(i,{label:`Disabled`,value:50,isDisabled:!0}),(0,s.jsx)(i,{label:`No value display`,value:e,onChange:t,valueDisplay:`none`})]})}},v={render:e=>(0,s.jsx)(i,{...e}),args:{label:`Volume`,value:50,isDisabled:!0,disabledMessage:`Volume is locked while sharing your screen`}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(50);
    return <Slider {...args as any} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Volume'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<[number, number]>([20, 80]);
    return <Slider {...args as any} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Price range'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(50);
    return <Slider {...args as any} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Volume',
    marks: [{
      value: 0,
      label: '0'
    }, {
      value: 25,
      label: '25'
    }, {
      value: 50,
      label: '50'
    }, {
      value: 75,
      label: '75'
    }, {
      value: 100,
      label: '100'
    }]
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(50);
    return <Slider {...args as any} value={value} onChange={setValue} valueDisplay="text" />;
  },
  args: {
    label: 'Quantity',
    min: 0,
    max: 100,
    step: 10
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(72);
    return <Slider {...args as any} value={value} onChange={setValue} valueDisplay="text" />;
  },
  args: {
    label: 'Temperature',
    min: 60,
    max: 90,
    step: 1,
    formatValue: (v: number) => \`\${v}°F\`
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    return <Slider {...args as any} />;
  },
  args: {
    label: 'Volume',
    value: 50,
    isDisabled: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(50);
    return <div style={{
      height: 200
    }}>
        <Slider {...args as any} value={value} onChange={setValue} />
      </div>;
  },
  args: {
    label: 'Volume',
    orientation: 'vertical'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState(95);
    const [value2, setValue2] = useState(50);
    const [value3, setValue3] = useState(75);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '400px'
    }}>
        <Slider label="CPU Usage" value={value1} onChange={setValue1} status={{
        type: 'error',
        message: 'CPU usage is critically high'
      }} />
        <Slider label="Memory" value={value2} onChange={setValue2} status={{
        type: 'warning',
        message: 'Memory usage is moderate'
      }} />
        <Slider label="Disk" value={value3} onChange={setValue3} status={{
        type: 'success',
        message: 'Disk usage is healthy'
      }} />
      </div>;
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v1, setV1] = useState(50);
    const [v2, setV2] = useState<[number, number]>([20, 80]);
    const [v3, setV3] = useState(30);
    const [v4, setV4] = useState(72);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      maxWidth: '400px'
    }}>
        <Slider label="Default slider" value={v1} onChange={setV1} />
        <Slider label="Range slider" value={v2} onChange={setV2} />
        <Slider label="With marks" value={v3} onChange={setV3} marks={[{
        value: 0,
        label: '0%'
      }, {
        value: 50,
        label: '50%'
      }, {
        value: 100,
        label: '100%'
      }]} />
        <Slider label="With text display" value={v4} onChange={setV4} formatValue={v => \`\${v}°F\`} valueDisplay="text" min={60} max={90} />
        <Slider label="Disabled" value={50} isDisabled />
        <Slider label="No value display" value={v1} onChange={setV1} valueDisplay="none" />
      </div>;
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    return <Slider {...args as any} />;
  },
  args: {
    label: 'Volume',
    value: 50,
    isDisabled: true,
    disabledMessage: 'Volume is locked while sharing your screen'
  }
}`,...v.parameters?.docs?.source}}},y=[`Default`,`Range`,`WithMarks`,`CustomStep`,`WithFormatValue`,`Disabled`,`VerticalOrientation`,`WithStatus`,`AllVariations`,`DisabledWithMessage`]}))();export{_ as AllVariations,f as CustomStep,l as Default,m as Disabled,v as DisabledWithMessage,u as Range,h as VerticalOrientation,p as WithFormatValue,d as WithMarks,g as WithStatus,y as __namedExportsOrder,c as default};