import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Icon-CDNRBkXA.js";import{t as a}from"./Icon-B1Jcw32f.js";import{n as o,t as s}from"./Selector-C0IS8mAT.js";import{n as c,t as l}from"./DateInput-CG9n9BRR.js";import{i as u,n as d,t as f}from"./InputGroup-B-HmZX8G.js";import{n as p,t as m}from"./MultiSelector-CmpfnsCq.js";import{n as h,t as g}from"./TextInput-CXcuN8ws.js";import{n as _,t as v}from"./TimeInput-zNIpYCMu.js";import{n as y,t as b}from"./NumberInput-BF8ieELo.js";import{n as x,t as S}from"./Tokenizer-BoxU4JMv.js";import{n as C,t as w}from"./Typeahead-CZgyMFwM.js";var T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J;e((()=>{T=t(n()),f(),g(),b(),v(),l(),w(),S(),s(),m(),a(),E=r(),D=[{id:`1`,label:`Apple`},{id:`2`,label:`Banana`},{id:`3`,label:`Cherry`},{id:`4`,label:`Date`},{id:`5`,label:`Elderberry`},{id:`6`,label:`Fig`},{id:`7`,label:`Grape`}],O={search:e=>D.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>D.slice(0,5)},k={title:`Core/InputGroup`,component:u,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label`},description:{control:`text`,description:`Description text`},isDisabled:{control:`boolean`,description:`Disable the group`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Input size`}}},A=[`Design Systems`,`Infrastructure`,`Product`],j={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`$`}),(0,E.jsx)(h,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Price`}},M={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(h,{label:`Weight`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0`}),(0,E.jsx)(d,{children:`kg`})]})},args:{label:`Weight`}},N={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`https://`}),(0,E.jsx)(h,{label:`URL`,isLabelHidden:!0,value:t,onChange:n,placeholder:`example`}),(0,E.jsx)(d,{children:`.com`})]})},args:{label:`Website`}},P={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:(0,E.jsx)(i,{icon:`search`,size:`sm`,color:`secondary`})}),(0,E.jsx)(h,{label:`Search`,isLabelHidden:!0,value:t,onChange:n,placeholder:`Search...`})]})},args:{label:`Search`,isLabelHidden:!0}},F={render:e=>{let[t,n]=(0,T.useState)(null);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`Fruit`}),(0,E.jsx)(C,{label:`Selection`,isLabelHidden:!0,searchSource:O,value:t,onChange:n,placeholder:`Search fruits...`,hasEntriesOnFocus:!0})]})},args:{label:`Favorite fruit`,description:`Select one fruit from the list`}},I={render:e=>{let[t,n]=(0,T.useState)([D[0]]);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`Tags`}),(0,E.jsx)(x,{label:`Selections`,isLabelHidden:!0,searchSource:O,value:t,onChange:n,placeholder:`Add fruits...`,maxEntries:3,hasEntriesOnFocus:!0})]})},args:{label:`Favorite fruits`,description:`Pick up to three fruits`}},L={render:e=>{let[t,n]=(0,T.useState)(void 0);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`$`}),(0,E.jsx)(y,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Budget`}},R={render:e=>{let[t,n]=(0,T.useState)(`09:00`);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`Starts`}),(0,E.jsx)(_,{label:`Start time`,isLabelHidden:!0,value:t,onChange:n,hourFormat:`24h`,placeholder:`09:00`})]})},args:{label:`Schedule`,description:`Use local time`}},z={render:e=>{let[t,n]=(0,T.useState)(void 0);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`Due`}),(0,E.jsx)(c,{label:`Date`,isLabelHidden:!0,value:t,onChange:n,placeholder:`Select date`})]})},args:{label:`Deadline`,description:`Pick the due date`}},B={render:e=>{let[t,n]=(0,T.useState)(void 0);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`Team`}),(0,E.jsx)(o,{label:`Owner`,isLabelHidden:!0,options:A,value:t,onChange:n,placeholder:`Choose owner`})]})},args:{label:`Default owner`}},V={render:e=>{let[t,n]=(0,T.useState)([]);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`Teams`}),(0,E.jsx)(p,{label:`Owners`,isLabelHidden:!0,options:A,value:t,onChange:n,placeholder:`Choose owners`})]})},args:{label:`Default owners`,description:`Select one or more teams`}},H={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`@`}),(0,E.jsx)(h,{label:`Username`,isLabelHidden:!0,value:t,onChange:n,placeholder:`username`})]})},args:{label:`Username`,description:`Your public display name`}},U={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`$`}),(0,E.jsx)(h,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Price`,status:{type:`error`,message:`Price is required`}}},W={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`$`}),(0,E.jsx)(h,{label:`Amount`,isLabelHidden:!0,value:t,onChange:n,placeholder:`0.00`})]})},args:{label:`Price`,size:`sm`}},G={render:e=>{let[t,n]=(0,T.useState)(``);return(0,E.jsx)(`div`,{style:{maxWidth:500},children:(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(d,{children:`https://`}),(0,E.jsx)(h,{label:`URL`,isLabelHidden:!0,value:t,onChange:n,placeholder:`example.com`})]})})},args:{label:`Website URL`}},K={render:e=>{let[t,n]=(0,T.useState)(``),[r,i]=(0,T.useState)(``);return(0,E.jsxs)(u,{...e,children:[(0,E.jsx)(h,{label:`Address`,isLabelHidden:!0,value:t,onChange:n,placeholder:`Address`}),(0,E.jsx)(d,{children:`@`}),(0,E.jsx)(h,{label:`Domain`,isLabelHidden:!0,value:r,onChange:i,placeholder:`Domain`})]})},args:{label:`Email`}},q={render:()=>{let[e,t]=(0,T.useState)(``),[n,r]=(0,T.useState)(``),[i,a]=(0,T.useState)(``),[s,c]=(0,T.useState)(``),[l,f]=(0,T.useState)(null),[p,m]=(0,T.useState)(void 0);return(0,E.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,E.jsxs)(u,{label:`Price`,children:[(0,E.jsx)(d,{children:`$`}),(0,E.jsx)(h,{label:`Amount`,isLabelHidden:!0,value:e,onChange:t,placeholder:`0.00`})]}),(0,E.jsxs)(u,{label:`Website`,children:[(0,E.jsx)(d,{children:`https://`}),(0,E.jsx)(h,{label:`URL`,isLabelHidden:!0,value:n,onChange:r,placeholder:`example`}),(0,E.jsx)(d,{children:`.com`})]}),(0,E.jsxs)(u,{label:`Favorite fruit`,children:[(0,E.jsx)(d,{children:`Fruit`}),(0,E.jsx)(C,{label:`Selection`,isLabelHidden:!0,searchSource:O,value:l,onChange:f,placeholder:`Search fruits...`,hasEntriesOnFocus:!0})]}),(0,E.jsxs)(u,{label:`Weight`,children:[(0,E.jsx)(h,{label:`Weight`,isLabelHidden:!0,value:i,onChange:a,placeholder:`0`}),(0,E.jsx)(d,{children:`kg`})]}),(0,E.jsxs)(u,{label:`Price`,status:{type:`error`,message:`Price is required`},children:[(0,E.jsx)(d,{children:`$`}),(0,E.jsx)(h,{label:`Amount`,isLabelHidden:!0,value:s,onChange:c,placeholder:`0.00`})]}),(0,E.jsxs)(u,{label:`Default owner`,children:[(0,E.jsx)(d,{children:`Team`}),(0,E.jsx)(o,{label:`Owner`,isLabelHidden:!0,options:A,value:p,onChange:m,placeholder:`Choose owner`})]})]})}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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