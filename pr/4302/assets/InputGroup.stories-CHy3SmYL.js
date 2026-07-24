import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./Icon-BfxcVSRR.js";import{n as o,t as s}from"./Selector-Dxch3z5d.js";import{n as c,t as l}from"./DateInput-COIxX2kB.js";import{n as u,t as d}from"./MultiSelector-CW4g4EJ3.js";import{n as f,t as p}from"./TextInput-hmFYbSOY.js";import{n as m,t as h}from"./TimeInput-HeFvYlxE.js";import{n as g,t as _}from"./NumberInput-JmFg5-Zj.js";import{n as v,t as y}from"./Typeahead-D3yBPj-0.js";import{dn as b,pn as x,un as S}from"./iframe-rS7i1xed.js";var C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G;e((()=>{C=t(n()),S(),p(),_(),h(),l(),y(),s(),d(),a(),w=r(),T=[{id:`1`,label:`Apple`},{id:`2`,label:`Banana`},{id:`3`,label:`Cherry`},{id:`4`,label:`Date`},{id:`5`,label:`Elderberry`},{id:`6`,label:`Fig`},{id:`7`,label:`Grape`}],E={search:e=>T.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>T.slice(0,5)},D={title:`Core/InputGroup`,component:x,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label`},description:{control:`text`,description:`Description text`},isDisabled:{control:`boolean`,description:`Disable the group`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Input size`}}},O=[`Design Systems`,`Infrastructure`,`Product`],k={render:e=>{let[t,n]=(0,C.useState)(``);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:`$`}),(0,w.jsx)(f,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Price`}},A={render:e=>{let[t,n]=(0,C.useState)(``);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(f,{label:`Weight`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0`}),(0,w.jsx)(b,{children:`kg`})]})},args:{label:`Weight`}},j={render:e=>{let[t,n]=(0,C.useState)(``);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:`https://`}),(0,w.jsx)(f,{label:`URL`,isLabelHidden:!0,value:t,onChange:n,placeholder:`example`}),(0,w.jsx)(b,{children:`.com`})]})},args:{label:`Website`}},M={render:e=>{let[t,n]=(0,C.useState)(``);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:(0,w.jsx)(i,{icon:`search`,size:`sm`,color:`secondary`})}),(0,w.jsx)(f,{label:`Search`,isLabelHidden:!0,value:t,onChange:n,placeholder:`Search...`})]})},args:{label:`Search`,isLabelHidden:!0}},N={render:e=>{let[t,n]=(0,C.useState)(null);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:`Fruit`}),(0,w.jsx)(v,{label:`Selection`,isLabelHidden:!0,searchSource:E,value:t,onChange:n,placeholder:`Search fruits...`,hasEntriesOnFocus:!0})]})},args:{label:`Favorite fruit`,description:`Select one fruit from the list`}},P={render:e=>{let[t,n]=(0,C.useState)(void 0);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:`$`}),(0,w.jsx)(g,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Budget`}},F={render:e=>{let[t,n]=(0,C.useState)(`09:00`);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:`Starts`}),(0,w.jsx)(m,{label:`Start time`,isLabelHidden:!0,value:t,onChange:n,hourFormat:`24h`,placeholder:`09:00`})]})},args:{label:`Schedule`,description:`Use local time`}},I={render:e=>{let[t,n]=(0,C.useState)(void 0);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:`Due`}),(0,w.jsx)(c,{label:`Date`,isLabelHidden:!0,value:t,onChange:n,placeholder:`Select date`})]})},args:{label:`Deadline`,description:`Pick the due date`}},L={render:e=>{let[t,n]=(0,C.useState)(void 0);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:`Team`}),(0,w.jsx)(o,{label:`Owner`,isLabelHidden:!0,options:O,value:t,onChange:n,placeholder:`Choose owner`})]})},args:{label:`Default owner`}},R={render:e=>{let[t,n]=(0,C.useState)([]);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:`Teams`}),(0,w.jsx)(u,{label:`Owners`,isLabelHidden:!0,options:O,value:t,onChange:n,placeholder:`Choose owners`})]})},args:{label:`Default owners`,description:`Select one or more teams`}},z={render:e=>{let[t,n]=(0,C.useState)(``);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:`@`}),(0,w.jsx)(f,{label:`Username`,isLabelHidden:!0,value:t,onChange:n,placeholder:`username`})]})},args:{label:`Username`,description:`Your public display name`}},B={render:e=>{let[t,n]=(0,C.useState)(``);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:`$`}),(0,w.jsx)(f,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Price`,status:{type:`error`,message:`Price is required`}}},V={render:e=>{let[t,n]=(0,C.useState)(``);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:`$`}),(0,w.jsx)(f,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Price`,size:`sm`}},H={render:e=>{let[t,n]=(0,C.useState)(``);return(0,w.jsx)(`div`,{style:{maxWidth:500},children:(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(b,{children:`https://`}),(0,w.jsx)(f,{label:`URL`,isLabelHidden:!0,value:t,onChange:n,placeholder:`example.com`})]})})},args:{label:`Website URL`}},U={render:e=>{let[t,n]=(0,C.useState)(``),[r,i]=(0,C.useState)(``);return(0,w.jsxs)(x,{...e,children:[(0,w.jsx)(f,{label:`Address`,isLabelHidden:!0,value:t,onChange:n,placeholder:`Address`}),(0,w.jsx)(b,{children:`@`}),(0,w.jsx)(f,{label:`Domain`,isLabelHidden:!0,value:r,onChange:i,placeholder:`Domain`})]})},args:{label:`Email`}},W={render:()=>{let[e,t]=(0,C.useState)(``),[n,r]=(0,C.useState)(``),[i,a]=(0,C.useState)(``),[s,c]=(0,C.useState)(``),[l,u]=(0,C.useState)(null),[d,p]=(0,C.useState)(void 0);return(0,w.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,w.jsxs)(x,{label:`Price`,children:[(0,w.jsx)(b,{children:`$`}),(0,w.jsx)(f,{label:`Amount`,isLabelHidden:!0,value:e,onChange:t,placeholder:`0.00`})]}),(0,w.jsxs)(x,{label:`Website`,children:[(0,w.jsx)(b,{children:`https://`}),(0,w.jsx)(f,{label:`URL`,isLabelHidden:!0,value:n,onChange:r,placeholder:`example`}),(0,w.jsx)(b,{children:`.com`})]}),(0,w.jsxs)(x,{label:`Favorite fruit`,children:[(0,w.jsx)(b,{children:`Fruit`}),(0,w.jsx)(v,{label:`Selection`,isLabelHidden:!0,searchSource:E,value:l,onChange:u,placeholder:`Search fruits...`,hasEntriesOnFocus:!0})]}),(0,w.jsxs)(x,{label:`Weight`,children:[(0,w.jsx)(f,{label:`Weight`,isLabelHidden:!0,value:i,onChange:a,placeholder:`0`}),(0,w.jsx)(b,{children:`kg`})]}),(0,w.jsxs)(x,{label:`Price`,status:{type:`error`,message:`Price is required`},children:[(0,w.jsx)(b,{children:`$`}),(0,w.jsx)(f,{label:`Amount`,isLabelHidden:!0,value:s,onChange:c,placeholder:`0.00`})]}),(0,w.jsxs)(x,{label:`Default owner`,children:[(0,w.jsx)(b,{children:`Team`}),(0,w.jsx)(o,{label:`Owner`,isLabelHidden:!0,options:O,value:d,onChange:p,placeholder:`Choose owner`})]})]})}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <TextInput label="Amount" isLabelHidden value={value} onChange={setValue} placeholder="0.00" />
      </InputGroup>;
  },
  args: {
    label: 'Price'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <TextInput label="Weight" isLabelHidden value={value} onChange={setValue} placeholder="0" />
        <InputGroupText>kg</InputGroupText>
      </InputGroup>;
  },
  args: {
    label: 'Weight'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <InputGroupText>https://</InputGroupText>
        <TextInput label="URL" isLabelHidden value={value} onChange={setValue} placeholder="example" />
        <InputGroupText>.com</InputGroupText>
      </InputGroup>;
  },
  args: {
    label: 'Website'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <InputGroupText>
          <Icon icon="search" size="sm" color="secondary" />
        </InputGroupText>
        <TextInput label="Search" isLabelHidden value={value} onChange={setValue} placeholder="Search..." />
      </InputGroup>;
  },
  args: {
    label: 'Search',
    isLabelHidden: true
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem | null>(null);
    return <InputGroup {...args}>
        <InputGroupText>Fruit</InputGroupText>
        <Typeahead label="Selection" isLabelHidden searchSource={fruitSource} value={value} onChange={setValue} placeholder="Search fruits..." hasEntriesOnFocus />
      </InputGroup>;
  },
  args: {
    label: 'Favorite fruit',
    description: 'Select one fruit from the list'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<number | undefined>(undefined);
    return <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <NumberInput label="Amount" isLabelHidden value={value} onChange={setValue} placeholder="0.00" />
      </InputGroup>;
  },
  args: {
    label: 'Budget'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>('09:00' as ISOTimeString);
    return <InputGroup {...args}>
        <InputGroupText>Starts</InputGroupText>
        <TimeInput label="Start time" isLabelHidden value={value} onChange={setValue} hourFormat="24h" placeholder="09:00" />
      </InputGroup>;
  },
  args: {
    label: 'Schedule',
    description: 'Use local time'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <InputGroup {...args}>
        <InputGroupText>Due</InputGroupText>
        <DateInput label="Date" isLabelHidden value={value} onChange={setValue} placeholder="Select date" />
      </InputGroup>;
  },
  args: {
    label: 'Deadline',
    description: 'Pick the due date'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return <InputGroup {...args}>
        <InputGroupText>Team</InputGroupText>
        <Selector label="Owner" isLabelHidden options={TEAM_OPTIONS} value={value} onChange={setValue} placeholder="Choose owner" />
      </InputGroup>;
  },
  args: {
    label: 'Default owner'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>([]);
    return <InputGroup {...args}>
        <InputGroupText>Teams</InputGroupText>
        <MultiSelector label="Owners" isLabelHidden options={TEAM_OPTIONS} value={value} onChange={setValue} placeholder="Choose owners" />
      </InputGroup>;
  },
  args: {
    label: 'Default owners',
    description: 'Select one or more teams'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <InputGroupText>@</InputGroupText>
        <TextInput label="Username" isLabelHidden value={value} onChange={setValue} placeholder="username" />
      </InputGroup>;
  },
  args: {
    label: 'Username',
    description: 'Your public display name'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <TextInput label="Amount" isLabelHidden value={value} onChange={setValue} placeholder="0.00" />
      </InputGroup>;
  },
  args: {
    label: 'Price',
    status: {
      type: 'error',
      message: 'Price is required'
    }
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <TextInput label="Amount" isLabelHidden value={value} onChange={setValue} placeholder="0.00" />
      </InputGroup>;
  },
  args: {
    label: 'Price',
    size: 'sm'
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState('');
    return <div style={{
      maxWidth: 500
    }}>
        <InputGroup {...args}>
          <InputGroupText>https://</InputGroupText>
          <TextInput label="URL" isLabelHidden value={value} onChange={setValue} placeholder="example.com" />
        </InputGroup>
      </div>;
  },
  args: {
    label: 'Website URL'
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [left, setLeft] = useState('');
    const [right, setRight] = useState('');
    return <InputGroup {...args}>
        <TextInput label="Address" isLabelHidden value={left} onChange={setLeft} placeholder="Address" />
        <InputGroupText>@</InputGroupText>
        <TextInput label="Domain" isLabelHidden value={right} onChange={setRight} placeholder="Domain" />
      </InputGroup>;
  },
  args: {
    label: 'Email'
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v1, setV1] = useState('');
    const [v2, setV2] = useState('');
    const [v3, setV3] = useState('');
    const [v4, setV4] = useState('');
    const [v5, setV5] = useState<SearchableItem | null>(null);
    const [v6, setV6] = useState<string | undefined>(undefined);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '400px'
    }}>
        <InputGroup label="Price">
          <InputGroupText>$</InputGroupText>
          <TextInput label="Amount" isLabelHidden value={v1} onChange={setV1} placeholder="0.00" />
        </InputGroup>
        <InputGroup label="Website">
          <InputGroupText>https://</InputGroupText>
          <TextInput label="URL" isLabelHidden value={v2} onChange={setV2} placeholder="example" />
          <InputGroupText>.com</InputGroupText>
        </InputGroup>
        <InputGroup label="Favorite fruit">
          <InputGroupText>Fruit</InputGroupText>
          <Typeahead label="Selection" isLabelHidden searchSource={fruitSource} value={v5} onChange={setV5} placeholder="Search fruits..." hasEntriesOnFocus />
        </InputGroup>
        <InputGroup label="Weight">
          <TextInput label="Weight" isLabelHidden value={v3} onChange={setV3} placeholder="0" />
          <InputGroupText>kg</InputGroupText>
        </InputGroup>
        <InputGroup label="Price" status={{
        type: 'error',
        message: 'Price is required'
      }}>
          <InputGroupText>$</InputGroupText>
          <TextInput label="Amount" isLabelHidden value={v4} onChange={setV4} placeholder="0.00" />
        </InputGroup>
        <InputGroup label="Default owner">
          <InputGroupText>Team</InputGroupText>
          <Selector label="Owner" isLabelHidden options={TEAM_OPTIONS} value={v6} onChange={setV6} placeholder="Choose owner" />
        </InputGroup>
      </div>;
  }
}`,...W.parameters?.docs?.source}}},G=[`WithPrefix`,`WithSuffix`,`WithPrefixAndSuffix`,`WithIconPrefix`,`WithTypeahead`,`WithNumberInput`,`WithTimeInput`,`WithDateInput`,`WithSelector`,`WithMultiSelector`,`WithDescription`,`WithErrorStatus`,`SmallSize`,`FullWidth`,`TwoInputs`,`AllVariations`]}))();export{W as AllVariations,H as FullWidth,V as SmallSize,U as TwoInputs,I as WithDateInput,z as WithDescription,B as WithErrorStatus,M as WithIconPrefix,R as WithMultiSelector,P as WithNumberInput,k as WithPrefix,j as WithPrefixAndSuffix,L as WithSelector,A as WithSuffix,F as WithTimeInput,N as WithTypeahead,G as __namedExportsOrder,D as default};