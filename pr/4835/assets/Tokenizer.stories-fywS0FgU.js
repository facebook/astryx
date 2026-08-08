import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Button-BVMvoKVE.js";import{n as a,t as o}from"./Tokenizer-CjzPOoii.js";import{n as s,t as c}from"./MagnifyingGlassIcon-uXl564nY.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I;function L(){return(L=e((()=>{l=t(),a(),r(),s(),u=n(),d=[{id:`1`,label:`Alice Johnson`},{id:`2`,label:`Bob Smith`},{id:`3`,label:`Charlie Brown`},{id:`4`,label:`Diana Prince`},{id:`5`,label:`Eve Williams`},{id:`6`,label:`Frank Miller`},{id:`7`,label:`Grace Lee`},{id:`8`,label:`Henry Davis`}],f={search:e=>d.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>d.slice(0,5)},p={title:`Core/Tokenizer`,component:o,tags:[`autodocs`],argTypes:{label:{control:`text`},placeholder:{control:`text`},isDisabled:{control:`boolean`},disabledMessage:{control:`text`,description:`Explains why the tokenizer is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled Tokenizer in Tooltip.`},isRequired:{control:`boolean`},isOptional:{control:`boolean`},hasClear:{control:`boolean`},maxEntries:{control:`number`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Input size`}},decorators:[e=>(0,u.jsx)(`div`,{style:{width:400},children:(0,u.jsx)(e,{})})]},m={render:e=>{let[t,n]=(0,l.useState)([]);return(0,u.jsx)(o,{...e,searchSource:f,value:t,onChange:e=>n(e)})},args:{label:`Team Members`,placeholder:`Search people...`}},h={render:e=>{let[t,n]=(0,l.useState)([d[0],d[2]]);return(0,u.jsx)(o,{...e,searchSource:f,value:t,onChange:e=>n(e)})},args:{label:`Team Members`,placeholder:`Add more...`},name:`Pre-selected Items`},g={...m,args:{...m.args,hasClear:!0},name:`With Clear All Button`},_={...m,args:{...m.args,maxEntries:3},name:`Max 3 Entries`},v={...m,args:{...m.args,isRequired:!0}},y={...m,args:{...m.args,description:`Select up to 5 team members for this project`}},b={...m,args:{...m.args,status:{type:`error`,message:`At least one member is required`}}},x={...m,args:{...m.args,status:{type:`warning`,message:`Some members may not have access`}}},S={...m,args:{...m.args,status:{type:`success`,message:`Team is ready!`}}},C={render:e=>{let[t]=(0,l.useState)([d[0],d[1]]);return(0,u.jsx)(o,{...e,searchSource:f,value:t,onChange:()=>{}})},args:{label:`Team Members`,isDisabled:!0}},w={...m,args:{...m.args,startIcon:c},name:`With Start Icon`},T={render:e=>{let[t,n]=(0,l.useState)([d[0],d[2]]);return(0,u.jsx)(o,{...e,searchSource:f,value:t,onChange:e=>n(e)})},args:{label:`Team Members`,startIcon:c},name:`With Start Icon and Tokens`},E={render:e=>{let[t,n]=(0,l.useState)([]);return(0,u.jsx)(o,{...e,searchSource:f,value:t,onChange:e=>n(e),hasEntriesOnFocus:!0})},args:{label:`Team Members`,placeholder:`Click to see suggestions...`},name:`With Entries On Focus`},D={render:e=>{let[t,n]=(0,l.useState)([d[0],d[1],d[2],d[3],d[4],d[5]]);return(0,u.jsxs)(`div`,{children:[(0,u.jsx)(o,{...e,searchSource:f,value:t,onChange:e=>n(e),tokenOverflowBehavior:`unfocusedInline`}),(0,u.jsx)(`p`,{style:{marginTop:8},children:`This text will shift down when the tokenizer expands on focus.`})]})},args:{label:`Team Members`,placeholder:`Add more...`},name:`Overflow Inline`},O={render:e=>{let[t,n]=(0,l.useState)([d[0],d[1],d[2],d[3],d[4],d[5]]);return(0,u.jsxs)(`div`,{children:[(0,u.jsx)(o,{...e,searchSource:f,value:t,onChange:e=>n(e),tokenOverflowBehavior:`unfocusedLayer`}),(0,u.jsx)(`p`,{style:{marginTop:8},children:`This text should not shift when the tokenizer expands on focus.`})]})},args:{label:`Team Members`,placeholder:`Add more...`},name:`Overflow Layer`},k={render:e=>{let[t,n]=(0,l.useState)([d[0],d[2]]);return(0,u.jsx)(o,{...e,searchSource:f,value:t,onChange:e=>n(e),endContent:(0,u.jsx)(i,{label:`Apply`,variant:`primary`,size:`sm`})})},args:{label:`Team Members`},name:`With End Content`},A={search:()=>[],bootstrap:()=>[]},j={render:e=>{let[t,n]=(0,l.useState)([]);return(0,u.jsxs)(`div`,{children:[(0,u.jsx)(o,{...e,searchSource:A,value:t,onChange:(e,t)=>{n(e)},hasCreate:!0,placeholder:`Type a tag and press Enter...`}),(0,u.jsxs)(`p`,{style:{marginTop:8,fontSize:14,color:`#666`},children:[t.length,` tag`,t.length===1?``:`s`,` added`]})]})},args:{label:`Tags`},name:`Creatable (Free Text)`},M={render:()=>{let[e,t]=(0,l.useState)([]),[n,r]=(0,l.useState)([d[0],d[2]]),[i,a]=(0,l.useState)([]);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,u.jsx)(o,{label:`Small (28px)`,searchSource:f,value:e,onChange:e=>t(e),placeholder:`Small size`,size:`sm`,hasClear:!0}),(0,u.jsx)(o,{label:`Medium (32px)`,searchSource:f,value:n,onChange:e=>r(e),placeholder:`Medium size (default)`,size:`md`,hasClear:!0}),(0,u.jsx)(o,{label:`Large (36px)`,searchSource:f,value:i,onChange:e=>a(e),placeholder:`Large size`,size:`lg`,hasClear:!0})]})}},N={render:e=>{let[t,n]=(0,l.useState)([]);return(0,u.jsx)(o,{...e,searchSource:f,value:t,onChange:(e,t)=>{n(e)},hasCreate:!0,hasEntriesOnFocus:!0,placeholder:`Search or type a new name...`})},args:{label:`Team Members`},name:`Creatable + Search`},P={render:e=>{let[t]=(0,l.useState)([d[0],d[1]]);return(0,u.jsx)(o,{...e,searchSource:f,value:t,onChange:()=>{}})},args:{label:`Team Members`,isDisabled:!0,disabledMessage:`You need edit access to change members`}},F={render:()=>{let[e,t]=(0,l.useState)([]),[n,r]=(0,l.useState)([]);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:320},children:[(0,u.jsx)(o,{label:`Attached (default)`,searchSource:f,value:e,onChange:e=>t(e),status:{type:`error`,message:`Select at least one member`}}),(0,u.jsx)(o,{label:`Detached`,searchSource:f,value:n,onChange:e=>r(e),status:{type:`error`,message:`Select at least one member`},statusVariant:`detached`})]})}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Search people...'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...'
  },
  name: 'Pre-selected Items'
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasClear: true
  },
  name: 'With Clear All Button'
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    maxEntries: 3
  },
  name: 'Max 3 Entries'
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isRequired: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    description: 'Select up to 5 team members for this project'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'error',
      message: 'At least one member is required'
    }
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'warning',
      message: 'Some members may not have access'
    }
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'success',
      message: 'Team is ready!'
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value] = useState([users[0], users[1]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={() => {}} />;
  },
  args: {
    label: 'Team Members',
    isDisabled: true
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    startIcon: MagnifyingGlassIcon
  },
  name: 'With Start Icon'
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} />;
  },
  args: {
    label: 'Team Members',
    startIcon: MagnifyingGlassIcon
  },
  name: 'With Start Icon and Tokens'
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} hasEntriesOnFocus />;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Click to see suggestions...'
  },
  name: 'With Entries On Focus'
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([users[0], users[1], users[2], users[3], users[4], users[5]]);
    return <div>
        <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} tokenOverflowBehavior="unfocusedInline" />
        <p style={{
        marginTop: 8
      }}>
          This text will shift down when the tokenizer expands on focus.
        </p>
      </div>;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...'
  },
  name: 'Overflow Inline'
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([users[0], users[1], users[2], users[3], users[4], users[5]]);
    return <div>
        <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} tokenOverflowBehavior="unfocusedLayer" />
        <p style={{
        marginTop: 8
      }}>
          This text should not shift when the tokenizer expands on focus.
        </p>
      </div>;
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...'
  },
  name: 'Overflow Layer'
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([users[0], users[2]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={items => setValue(items)} endContent={<Button label="Apply" variant="primary" size="sm" />} />;
  },
  args: {
    label: 'Team Members'
  },
  name: 'With End Content'
}`,...k.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [tags, setTags] = useState<SearchableItem[]>([]);
    return <div>
        <Tokenizer {...args} searchSource={emptySource} value={tags} onChange={(items, _change) => {
        setTags(items);
      }} hasCreate placeholder="Type a tag and press Enter..." />
        <p style={{
        marginTop: 8,
        fontSize: 14,
        color: '#666'
      }}>
          {tags.length} tag{tags.length !== 1 ? 's' : ''} added
        </p>
      </div>;
  },
  args: {
    label: 'Tags'
  },
  name: 'Creatable (Free Text)'
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [sm, setSm] = useState<SearchableItem[]>([]);
    const [md, setMd] = useState<SearchableItem[]>([users[0], users[2]]);
    const [lg, setLg] = useState<SearchableItem[]>([]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <Tokenizer label="Small (28px)" searchSource={userSource} value={sm} onChange={items => setSm(items)} placeholder="Small size" size="sm" hasClear />
        <Tokenizer label="Medium (32px)" searchSource={userSource} value={md} onChange={items => setMd(items)} placeholder="Medium size (default)" size="md" hasClear />
        <Tokenizer label="Large (36px)" searchSource={userSource} value={lg} onChange={items => setLg(items)} placeholder="Large size" size="lg" hasClear />
      </div>;
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={(items, _change) => {
      setValue(items);
    }} hasCreate hasEntriesOnFocus placeholder="Search or type a new name..." />;
  },
  args: {
    label: 'Team Members'
  },
  name: 'Creatable + Search'
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value] = useState([users[0], users[1]]);
    return <Tokenizer {...args} searchSource={userSource} value={value} onChange={() => {}} />;
  },
  args: {
    label: 'Team Members',
    isDisabled: true,
    disabledMessage: 'You need edit access to change members'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<SearchableItem[]>([]);
    const [b, setB] = useState<SearchableItem[]>([]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      width: 320
    }}>
        <Tokenizer label="Attached (default)" searchSource={userSource} value={a} onChange={items => setA(items)} status={{
        type: 'error',
        message: 'Select at least one member'
      }} />
        <Tokenizer label="Detached" searchSource={userSource} value={b} onChange={items => setB(items)} status={{
        type: 'error',
        message: 'Select at least one member'
      }} statusVariant="detached" />
      </div>;
  }
}`,...F.parameters?.docs?.source}}},I=[`Default`,`WithPreselected`,`WithClear`,`MaxEntries`,`Required`,`WithDescription`,`WithError`,`WithWarning`,`WithSuccess`,`Disabled`,`WithStartIcon`,`WithStartIconAndTokens`,`WithEntriesOnFocus`,`OverflowInline`,`OverflowLayer`,`WithEndContent`,`Creatable`,`SizeVariants`,`CreatableWithSearch`,`DisabledWithMessage`,`StatusVariantComparison`]})))()}L();export{j as Creatable,N as CreatableWithSearch,m as Default,C as Disabled,P as DisabledWithMessage,_ as MaxEntries,D as OverflowInline,O as OverflowLayer,v as Required,M as SizeVariants,F as StatusVariantComparison,g as WithClear,y as WithDescription,k as WithEndContent,E as WithEntriesOnFocus,b as WithError,h as WithPreselected,w as WithStartIcon,T as WithStartIconAndTokens,S as WithSuccess,x as WithWarning,I as __namedExportsOrder,p as default};