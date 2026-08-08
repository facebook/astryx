import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{i,t as a}from"./Icon-hgxDpd-5.js";import{n as o,t as s}from"./TextInput-CRj2wfSg.js";import{n as c,t as l}from"./Selector-BSE-l2q5.js";import{n as u,t as d}from"./DateInput-DvsCtEut.js";import{n as f,t as p}from"./MultiSelector-BW-BDlDr.js";import{n as m,t as h}from"./TimeInput-Dp2U2sKS.js";import{n as g,t as _}from"./NumberInput-qMDZKX5i.js";import{n as v,t as y}from"./Tokenizer-sd5C-Gig.js";import{n as b,t as x}from"./Typeahead-UH7lD4pK.js";import{dn as S,pn as C,un as w}from"./iframe-D0RY8mrQ.js";var T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J;e((()=>{T=t(n()),w(),s(),_(),h(),d(),x(),y(),l(),p(),a(),E=r(),D=[{id:`1`,label:`Apple`},{id:`2`,label:`Banana`},{id:`3`,label:`Cherry`},{id:`4`,label:`Date`},{id:`5`,label:`Elderberry`},{id:`6`,label:`Fig`},{id:`7`,label:`Grape`}],O={search:e=>D.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>D.slice(0,5)},k={title:`Core/InputGroup`,component:C,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label`},description:{control:`text`,description:`Description text`},isDisabled:{control:`boolean`,description:`Disable the group`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Input size`}}},A=[`Design Systems`,`Infrastructure`,`Product`],j={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`$`}),(0,E.jsx)(o,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Price`}},M={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(o,{label:`Weight`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0`}),(0,E.jsx)(S,{children:`kg`})]})},args:{label:`Weight`}},N={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`https://`}),(0,E.jsx)(o,{label:`URL`,isLabelHidden:!0,value:t,onChange:n,placeholder:`example`}),(0,E.jsx)(S,{children:`.com`})]})},args:{label:`Website`}},P={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:(0,E.jsx)(i,{icon:`search`,size:`sm`,color:`secondary`})}),(0,E.jsx)(o,{label:`Search`,isLabelHidden:!0,value:t,onChange:n,placeholder:`Search...`})]})},args:{label:`Search`,isLabelHidden:!0}},F={render:e=>{let[t,n]=(0,T.useState)(null);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`Fruit`}),(0,E.jsx)(b,{label:`Selection`,isLabelHidden:!0,searchSource:O,value:t,onChange:n,placeholder:`Search fruits...`,hasEntriesOnFocus:!0})]})},args:{label:`Favorite fruit`,description:`Select one fruit from the list`}},I={render:e=>{let[t,n]=(0,T.useState)([D[0]]);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`Tags`}),(0,E.jsx)(v,{label:`Selections`,isLabelHidden:!0,searchSource:O,value:t,onChange:n,placeholder:`Add fruits...`,maxEntries:3,hasEntriesOnFocus:!0})]})},args:{label:`Favorite fruits`,description:`Pick up to three fruits`}},L={render:e=>{let[t,n]=(0,T.useState)(void 0);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`$`}),(0,E.jsx)(g,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Budget`}},R={render:e=>{let[t,n]=(0,T.useState)(`09:00`);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`Starts`}),(0,E.jsx)(m,{label:`Start time`,isLabelHidden:!0,value:t,onChange:n,hourFormat:`24h`,placeholder:`09:00`})]})},args:{label:`Schedule`,description:`Use local time`}},z={render:e=>{let[t,n]=(0,T.useState)(void 0);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`Due`}),(0,E.jsx)(u,{label:`Date`,isLabelHidden:!0,value:t,onChange:n,placeholder:`Select date`})]})},args:{label:`Deadline`,description:`Pick the due date`}},B={render:e=>{let[t,n]=(0,T.useState)(void 0);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`Team`}),(0,E.jsx)(c,{label:`Owner`,isLabelHidden:!0,options:A,value:t,onChange:n,placeholder:`Choose owner`})]})},args:{label:`Default owner`}},V={render:e=>{let[t,n]=(0,T.useState)([]);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`Teams`}),(0,E.jsx)(f,{label:`Owners`,isLabelHidden:!0,options:A,value:t,onChange:n,placeholder:`Choose owners`})]})},args:{label:`Default owners`,description:`Select one or more teams`}},H={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`@`}),(0,E.jsx)(o,{label:`Username`,isLabelHidden:!0,value:t,onChange:n,placeholder:`username`})]})},args:{label:`Username`,description:`Your public display name`}},U={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`$`}),(0,E.jsx)(o,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Price`,status:{type:`error`,message:`Price is required`}}},W={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`$`}),(0,E.jsx)(o,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Price`,size:`sm`}},G={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsx)(`div`,{style:{maxWidth:500},children:(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(S,{children:`https://`}),(0,E.jsx)(o,{label:`URL`,isLabelHidden:!0,value:t,onChange:n,placeholder:`example.com`})]})})},args:{label:`Website URL`}},K={render:e=>{let[t,n]=(0,T.useState)(``),[r,i]=(0,T.useState)(``);return(0,E.jsxs)(C,{...e,children:[(0,E.jsx)(o,{label:`Address`,isLabelHidden:!0,value:t,onChange:n,placeholder:`Address`}),(0,E.jsx)(S,{children:`@`}),(0,E.jsx)(o,{label:`Domain`,isLabelHidden:!0,value:r,onChange:i,placeholder:`Domain`})]})},args:{label:`Email`}},q={render:()=>{let[e,t]=(0,T.useState)(``),[n,r]=(0,T.useState)(``),[i,a]=(0,T.useState)(``),[s,l]=(0,T.useState)(``),[u,d]=(0,T.useState)(null),[f,p]=(0,T.useState)(void 0);return(0,E.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,E.jsxs)(C,{label:`Price`,children:[(0,E.jsx)(S,{children:`$`}),(0,E.jsx)(o,{label:`Amount`,isLabelHidden:!0,value:e,onChange:t,placeholder:`0.00`})]}),(0,E.jsxs)(C,{label:`Website`,children:[(0,E.jsx)(S,{children:`https://`}),(0,E.jsx)(o,{label:`URL`,isLabelHidden:!0,value:n,onChange:r,placeholder:`example`}),(0,E.jsx)(S,{children:`.com`})]}),(0,E.jsxs)(C,{label:`Favorite fruit`,children:[(0,E.jsx)(S,{children:`Fruit`}),(0,E.jsx)(b,{label:`Selection`,isLabelHidden:!0,searchSource:O,value:u,onChange:d,placeholder:`Search fruits...`,hasEntriesOnFocus:!0})]}),(0,E.jsxs)(C,{label:`Weight`,children:[(0,E.jsx)(o,{label:`Weight`,isLabelHidden:!0,value:i,onChange:a,placeholder:`0`}),(0,E.jsx)(S,{children:`kg`})]}),(0,E.jsxs)(C,{label:`Price`,status:{type:`error`,message:`Price is required`},children:[(0,E.jsx)(S,{children:`$`}),(0,E.jsx)(o,{label:`Amount`,isLabelHidden:!0,value:s,onChange:l,placeholder:`0.00`})]}),(0,E.jsxs)(C,{label:`Default owner`,children:[(0,E.jsx)(S,{children:`Team`}),(0,E.jsx)(c,{label:`Owner`,isLabelHidden:!0,options:A,value:f,onChange:p,placeholder:`Choose owner`})]})]})}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([fruits[0]]);
    return <InputGroup {...args}>
        <InputGroupText>Tags</InputGroupText>
        <Tokenizer label="Selections" isLabelHidden searchSource={fruitSource} value={value} onChange={setValue} placeholder="Add fruits..." maxEntries={3} hasEntriesOnFocus />
      </InputGroup>;
  },
  args: {
    label: 'Favorite fruits',
    description: 'Pick up to three fruits'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source}}},J=[`WithPrefix`,`WithSuffix`,`WithPrefixAndSuffix`,`WithIconPrefix`,`WithTypeahead`,`WithTokenizer`,`WithNumberInput`,`WithTimeInput`,`WithDateInput`,`WithSelector`,`WithMultiSelector`,`WithDescription`,`WithErrorStatus`,`SmallSize`,`FullWidth`,`TwoInputs`,`AllVariations`]}))();export{q as AllVariations,G as FullWidth,W as SmallSize,K as TwoInputs,z as WithDateInput,H as WithDescription,U as WithErrorStatus,P as WithIconPrefix,V as WithMultiSelector,L as WithNumberInput,j as WithPrefix,N as WithPrefixAndSuffix,B as WithSelector,M as WithSuffix,R as WithTimeInput,I as WithTokenizer,F as WithTypeahead,J as __namedExportsOrder,k as default};