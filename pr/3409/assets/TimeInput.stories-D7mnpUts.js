import{ah as s,a1 as n}from"./iframe-Z8EfSKmM.js";import{T as r}from"./TimeInput-BNzBXpUd.js";import"./preload-helper-Ct5FWWRu.js";import"./Field-BUd1jCAy.js";import"./FieldStatus-B_cgkwjT.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./useInputContainer-zDUZYNNM.js";import"./timeParser-CAi7zy_b.js";const H={title:"Core/TimeInput",component:r,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label (still accessible to screen readers)"},placeholder:{control:"text",description:"Placeholder text"},description:{control:"text",description:"Description text displayed between the label and input"},isOptional:{control:"boolean",description:"Whether the field is optional (mutually exclusive with isRequired)"},isRequired:{control:"boolean",description:"Whether the field is required (mutually exclusive with isOptional)"},isDisabled:{control:"boolean",description:"Whether the input is disabled"},size:{control:"radio",options:["sm","md","lg"],description:"Size of the input"},hourFormat:{control:"radio",options:["12h","24h"],description:"Hour format for display"},hasSeconds:{control:"boolean",description:"Whether to include seconds in the time"},hasClear:{control:"boolean",description:"Whether to show a clear button"},increment:{control:"number",description:"Minutes to increment/decrement with arrow keys"}}},i={render:e=>{const[a,t]=s.useState(void 0);return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Time",placeholder:"Select a time"}},u={render:e=>{const[a,t]=s.useState("14:30");return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Meeting time"}},l={render:e=>{const[a,t]=s.useState("14:30");return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Time (24h)",hourFormat:"24h"}},o={render:e=>{const[a,t]=s.useState("14:30:45");return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Precise time",hasSeconds:!0}},c={render:e=>{const[a,t]=s.useState("09:00");return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Start time",hasClear:!0}},d={render:e=>{const[a,t]=s.useState(void 0);return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Alarm time",description:"When should we wake you up?",placeholder:"Set alarm time"}},m={render:e=>{const[a,t]=s.useState(void 0);return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Appointment time",min:"09:00",max:"17:00",description:"Business hours: 9 AM - 5 PM",placeholder:"Select appointment time"}},p={render:e=>{const[a,t]=s.useState("09:00");return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Time slot",increment:15,description:"Use arrow keys to change by 15 minutes"}},g={render:e=>{const[a,t]=s.useState(void 0);return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Preferred time",isOptional:!0,placeholder:"Select a time (optional)"}},S={render:e=>{const[a,t]=s.useState(void 0);return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Start time",isRequired:!0,placeholder:"Select a start time"}},h={render:e=>{const[a,t]=s.useState("10:00");return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Locked time",isDisabled:!0}},v={render:e=>{const[a,t]=s.useState(void 0);return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Time",size:"sm",placeholder:"Select a time"}},b={render:e=>{const[a,t]=s.useState("22:00");return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Event time",status:{type:"error",message:"Time must be during business hours"}}},T={render:e=>{const[a,t]=s.useState("07:00");return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Meeting time",status:{type:"warning",message:"Early morning meeting - are you sure?"}}},V={render:e=>{const[a,t]=s.useState("10:00");return n.jsx(r,{...e,value:a,onChange:t})},args:{label:"Scheduled time",status:{type:"success",message:"Time slot is available"}}},I={render:()=>{const[e,a]=s.useState(void 0),[t,f]=s.useState("14:30"),[C,x]=s.useState("09:15:30"),[O,W]=s.useState(void 0),[y,j]=s.useState(void 0),[D,w]=s.useState("10:00"),[M,k]=s.useState("22:00");return n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"300px"},children:[n.jsx(r,{label:"Default (12h)",value:e,onChange:a,placeholder:"Select a time"}),n.jsx(r,{label:"24-hour format",value:t,onChange:f,hourFormat:"24h"}),n.jsx(r,{label:"With seconds",value:C,onChange:x,hasSeconds:!0}),n.jsx(r,{label:"With clear button",value:O,onChange:W,hasClear:!0,placeholder:"Select a time"}),n.jsx(r,{label:"With description",description:"Pick your preferred time",value:y,onChange:j,placeholder:"Select a time"}),n.jsx(r,{label:"Disabled",isDisabled:!0,value:D,onChange:w}),n.jsx(r,{label:"With error",value:M,onChange:k,status:{type:"error",message:"Invalid time selection"}})]})}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time',
    placeholder: 'Select a time'
  }
}`,...i.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('14:30' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time'
  }
}`,...u.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('14:30' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time (24h)',
    hourFormat: '24h'
  }
}`,...l.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('14:30:45' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Precise time',
    hasSeconds: true
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('09:00' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    hasClear: true
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Alarm time',
    description: 'When should we wake you up?',
    placeholder: 'Set alarm time'
  }
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment time',
    min: '09:00' as ISOTimeString,
    max: '17:00' as ISOTimeString,
    description: 'Business hours: 9 AM - 5 PM',
    placeholder: 'Select appointment time'
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('09:00' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time slot',
    increment: 15,
    description: 'Use arrow keys to change by 15 minutes'
  }
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Preferred time',
    isOptional: true,
    placeholder: 'Select a time (optional)'
  }
}`,...g.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    isRequired: true,
    placeholder: 'Select a start time'
  }
}`,...S.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('10:00' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked time',
    isDisabled: true
  }
}`,...h.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time',
    size: 'sm',
    placeholder: 'Select a time'
  }
}`,...v.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('22:00' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time',
    status: {
      type: 'error',
      message: 'Time must be during business hours'
    }
  }
}`,...b.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('07:00' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    status: {
      type: 'warning',
      message: 'Early morning meeting - are you sure?'
    }
  }
}`,...T.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('10:00' as ISOTimeString);
    return <TimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Scheduled time',
    status: {
      type: 'success',
      message: 'Time slot is available'
    }
  }
}`,...V.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<ISOTimeString | undefined>(undefined);
    const [value2, setValue2] = useState<ISOTimeString | undefined>('14:30' as ISOTimeString);
    const [value3, setValue3] = useState<ISOTimeString | undefined>('09:15:30' as ISOTimeString);
    const [value4, setValue4] = useState<ISOTimeString | undefined>(undefined);
    const [value5, setValue5] = useState<ISOTimeString | undefined>(undefined);
    const [value6, setValue6] = useState<ISOTimeString | undefined>('10:00' as ISOTimeString);
    const [value7, setValue7] = useState<ISOTimeString | undefined>('22:00' as ISOTimeString);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '300px'
    }}>
        <TimeInput label="Default (12h)" value={value1} onChange={setValue1} placeholder="Select a time" />
        <TimeInput label="24-hour format" value={value2} onChange={setValue2} hourFormat="24h" />
        <TimeInput label="With seconds" value={value3} onChange={setValue3} hasSeconds />
        <TimeInput label="With clear button" value={value4} onChange={setValue4} hasClear placeholder="Select a time" />
        <TimeInput label="With description" description="Pick your preferred time" value={value5} onChange={setValue5} placeholder="Select a time" />
        <TimeInput label="Disabled" isDisabled value={value6} onChange={setValue6} />
        <TimeInput label="With error" value={value7} onChange={setValue7} status={{
        type: 'error',
        message: 'Invalid time selection'
      }} />
      </div>;
  }
}`,...I.parameters?.docs?.source}}};const L=["Default","WithValue","TwentyFourHourFormat","WithSeconds","WithClearButton","WithDescription","WithMinMax","WithIncrement","Optional","Required","Disabled","SmallSize","WithErrorStatus","WithWarningStatus","WithSuccessStatus","AllVariations"];export{I as AllVariations,i as Default,h as Disabled,g as Optional,S as Required,v as SmallSize,l as TwentyFourHourFormat,c as WithClearButton,d as WithDescription,b as WithErrorStatus,p as WithIncrement,m as WithMinMax,o as WithSeconds,V as WithSuccessStatus,u as WithValue,T as WithWarningStatus,L as __namedExportsOrder,H as default};
