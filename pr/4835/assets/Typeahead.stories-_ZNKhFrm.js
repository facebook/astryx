import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Typeahead-DYlW9JTQ.js";import{n as a,t as o}from"./MagnifyingGlassIcon-uXl564nY.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{s=t(),r(),a(),c=n(),l=[{id:`1`,label:`Apple`},{id:`2`,label:`Banana`},{id:`3`,label:`Cherry`},{id:`4`,label:`Date`},{id:`5`,label:`Elderberry`},{id:`6`,label:`Fig`},{id:`7`,label:`Grape`},{id:`8`,label:`Honeydew`}],u={search:e=>l.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>l.slice(0,5)},d={title:`Core/Typeahead`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`},placeholder:{control:`text`},isDisabled:{control:`boolean`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled Typeahead in Tooltip.`},isRequired:{control:`boolean`},isOptional:{control:`boolean`},hasEntriesOnFocus:{control:`boolean`},hasClear:{control:`boolean`},maxMenuItems:{control:`number`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Input size`}},decorators:[e=>(0,c.jsx)(`div`,{style:{width:320},children:(0,c.jsx)(e,{})})]},f={render:e=>{let[t,n]=(0,s.useState)(null);return(0,c.jsx)(i,{...e,searchSource:u,value:t,onChange:n})},args:{label:`Fruit`,placeholder:`Search fruits...`}},p={...f,args:{...f.args,hasEntriesOnFocus:!0},name:`With Bootstrap Results`},m={...f,args:{...f.args,isRequired:!0}},h={...f,args:{...f.args,isOptional:!0}},g={...f,args:{...f.args,description:`Pick your favorite fruit from the list`}},_={...f,args:{...f.args,status:{type:`error`,message:`Please select a fruit`}}},v={...f,args:{...f.args,status:{type:`warning`,message:`This fruit may be out of season`}}},y={...f,args:{...f.args,status:{type:`success`,message:`Great choice!`}}},b={...f,args:{...f.args,isDisabled:!0}},x={...f,args:{...f.args,isDisabled:!0,disabledMessage:`You need the Editor role to change this`}},S={...f,args:{...f.args,hasClear:!1},name:`Without Clear Button`},C={...f,args:{...f.args,hasEntriesOnFocus:!0,maxMenuItems:3},name:`Max 3 Results`},w={render:()=>{let[e,t]=(0,s.useState)(null),[n,r]=(0,s.useState)(null),[a,o]=(0,s.useState)(null);return(0,c.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,c.jsx)(i,{label:`Small (28px)`,searchSource:u,value:e,onChange:t,placeholder:`Small size`,size:`sm`}),(0,c.jsx)(i,{label:`Medium (32px)`,searchSource:u,value:n,onChange:r,placeholder:`Medium size (default)`,size:`md`}),(0,c.jsx)(i,{label:`Large (36px)`,searchSource:u,value:a,onChange:o,placeholder:`Large size`,size:`lg`})]})}},T={...f,args:{...f.args,startIcon:o,hasEntriesOnFocus:!0},name:`With Start Icon`},E={render:()=>{let[e,t]=(0,s.useState)(null),[n,r]=(0,s.useState)(null);return(0,c.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:300},children:[(0,c.jsx)(i,{label:`Attached (default)`,searchSource:u,value:e,onChange:t,status:{type:`error`,message:`Please make a selection`}}),(0,c.jsx)(i,{label:`Detached`,searchSource:u,value:n,onChange:r,status:{type:`error`,message:`Please make a selection`},statusVariant:`detached`})]})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem | null>(null);
    return <Typeahead {...args} searchSource={fruitSource} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Fruit',
    placeholder: 'Search fruits...'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasEntriesOnFocus: true
  },
  name: 'With Bootstrap Results'
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isRequired: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isOptional: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    description: 'Pick your favorite fruit from the list'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'error',
      message: 'Please select a fruit'
    }
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'warning',
      message: 'This fruit may be out of season'
    }
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'success',
      message: 'Great choice!'
    }
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isDisabled: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasClear: false
  },
  name: 'Without Clear Button'
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasEntriesOnFocus: true,
    maxMenuItems: 3
  },
  name: 'Max 3 Results'
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [sm, setSm] = useState<SearchableItem | null>(null);
    const [md, setMd] = useState<SearchableItem | null>(null);
    const [lg, setLg] = useState<SearchableItem | null>(null);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <Typeahead label="Small (28px)" searchSource={fruitSource} value={sm} onChange={setSm} placeholder="Small size" size="sm" />
        <Typeahead label="Medium (32px)" searchSource={fruitSource} value={md} onChange={setMd} placeholder="Medium size (default)" size="md" />
        <Typeahead label="Large (36px)" searchSource={fruitSource} value={lg} onChange={setLg} placeholder="Large size" size="lg" />
      </div>;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    startIcon: MagnifyingGlassIcon,
    hasEntriesOnFocus: true
  },
  name: 'With Start Icon'
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<SearchableItem | null>(null);
    const [b, setB] = useState<SearchableItem | null>(null);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      width: 300
    }}>
        <Typeahead label="Attached (default)" searchSource={fruitSource} value={a} onChange={setA} status={{
        type: 'error',
        message: 'Please make a selection'
      }} />
        <Typeahead label="Detached" searchSource={fruitSource} value={b} onChange={setB} status={{
        type: 'error',
        message: 'Please make a selection'
      }} statusVariant="detached" />
      </div>;
  }
}`,...E.parameters?.docs?.source}}},D=[`Default`,`WithBootstrap`,`Required`,`Optional`,`WithDescription`,`WithError`,`WithWarning`,`WithSuccess`,`Disabled`,`DisabledWithMessage`,`NoClear`,`LimitedResults`,`SizeVariants`,`WithStartIcon`,`StatusVariantComparison`]})))()}O();export{f as Default,b as Disabled,x as DisabledWithMessage,C as LimitedResults,S as NoClear,h as Optional,m as Required,w as SizeVariants,E as StatusVariantComparison,p as WithBootstrap,g as WithDescription,_ as WithError,T as WithStartIcon,y as WithSuccess,v as WithWarning,D as __namedExportsOrder,d as default};