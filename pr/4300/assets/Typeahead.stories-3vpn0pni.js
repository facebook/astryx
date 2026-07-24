import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./Typeahead-DBPcEacl.js";import{W as o,t as s}from"./esm-DA7gAIBC.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;e((()=>{c=t(n()),a(),s(),l=r(),u=[{id:`1`,label:`Apple`},{id:`2`,label:`Banana`},{id:`3`,label:`Cherry`},{id:`4`,label:`Date`},{id:`5`,label:`Elderberry`},{id:`6`,label:`Fig`},{id:`7`,label:`Grape`},{id:`8`,label:`Honeydew`}],d={search:e=>u.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>u.slice(0,5)},f={title:`Core/Typeahead`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`},placeholder:{control:`text`},isDisabled:{control:`boolean`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled Typeahead in Tooltip.`},isRequired:{control:`boolean`},isOptional:{control:`boolean`},hasEntriesOnFocus:{control:`boolean`},hasClear:{control:`boolean`},maxMenuItems:{control:`number`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Input size`}},decorators:[e=>(0,l.jsx)(`div`,{style:{width:320},children:(0,l.jsx)(e,{})})]},p={render:e=>{let[t,n]=(0,c.useState)(null);return(0,l.jsx)(i,{...e,searchSource:d,value:t,onChange:n})},args:{label:`Fruit`,placeholder:`Search fruits...`}},m={...p,args:{...p.args,hasEntriesOnFocus:!0},name:`With Bootstrap Results`},h={...p,args:{...p.args,isRequired:!0}},g={...p,args:{...p.args,isOptional:!0}},_={...p,args:{...p.args,description:`Pick your favorite fruit from the list`}},v={...p,args:{...p.args,status:{type:`error`,message:`Please select a fruit`}}},y={...p,args:{...p.args,status:{type:`warning`,message:`This fruit may be out of season`}}},b={...p,args:{...p.args,status:{type:`success`,message:`Great choice!`}}},x={...p,args:{...p.args,isDisabled:!0}},S={...p,args:{...p.args,isDisabled:!0,disabledMessage:`You need the Editor role to change this`}},C={...p,args:{...p.args,hasClear:!1},name:`Without Clear Button`},w={...p,args:{...p.args,hasEntriesOnFocus:!0,maxMenuItems:3},name:`Max 3 Results`},T={render:()=>{let[e,t]=(0,c.useState)(null),[n,r]=(0,c.useState)(null),[a,o]=(0,c.useState)(null);return(0,l.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,l.jsx)(i,{label:`Small (28px)`,searchSource:d,value:e,onChange:t,placeholder:`Small size`,size:`sm`}),(0,l.jsx)(i,{label:`Medium (32px)`,searchSource:d,value:n,onChange:r,placeholder:`Medium size (default)`,size:`md`}),(0,l.jsx)(i,{label:`Large (36px)`,searchSource:d,value:a,onChange:o,placeholder:`Large size`,size:`lg`})]})}},E={...p,args:{...p.args,startIcon:o,hasEntriesOnFocus:!0},name:`With Start Icon`},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem | null>(null);
    return <Typeahead {...args} searchSource={fruitSource} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Fruit',
    placeholder: 'Search fruits...'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasEntriesOnFocus: true
  },
  name: 'With Bootstrap Results'
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isRequired: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isOptional: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    description: 'Pick your favorite fruit from the list'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'error',
      message: 'Please select a fruit'
    }
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'warning',
      message: 'This fruit may be out of season'
    }
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'success',
      message: 'Great choice!'
    }
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isDisabled: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasClear: false
  },
  name: 'Without Clear Button'
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasEntriesOnFocus: true,
    maxMenuItems: 3
  },
  name: 'Max 3 Results'
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    startIcon: MagnifyingGlassIcon,
    hasEntriesOnFocus: true
  },
  name: 'With Start Icon'
}`,...E.parameters?.docs?.source}}},D=[`Default`,`WithBootstrap`,`Required`,`Optional`,`WithDescription`,`WithError`,`WithWarning`,`WithSuccess`,`Disabled`,`DisabledWithMessage`,`NoClear`,`LimitedResults`,`SizeVariants`,`WithStartIcon`]}))();export{p as Default,x as Disabled,S as DisabledWithMessage,w as LimitedResults,C as NoClear,g as Optional,h as Required,T as SizeVariants,m as WithBootstrap,_ as WithDescription,v as WithError,E as WithStartIcon,b as WithSuccess,y as WithWarning,D as __namedExportsOrder,f as default};