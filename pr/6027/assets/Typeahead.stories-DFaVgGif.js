import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./Typeahead-kdD0gD2P.js";import{K as o,t as s}from"./esm-BNuSW8ar.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I;e((()=>{c=t(n()),a(),s(),l=r(),u=[{id:`1`,label:`Apple`},{id:`2`,label:`Banana`},{id:`3`,label:`Cherry`},{id:`4`,label:`Date`},{id:`5`,label:`Elderberry`},{id:`6`,label:`Fig`},{id:`7`,label:`Grape`},{id:`8`,label:`Honeydew`}],d={search:e=>u.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>u.slice(0,5)},f={id:`9`,label:`Elderberry and Blackcurrant Preserve`},p={search:e=>[...u,f].filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>[f,...u.slice(0,4)]},m={search:e=>new Promise(t=>{setTimeout(()=>t(u.filter(t=>t.label.toLowerCase().includes(e.toLowerCase()))),1200)}),bootstrap:()=>new Promise(e=>setTimeout(()=>e(u.slice(0,5)),1200))},h={title:`Core/Typeahead`,component:i,tags:[`autodocs`],argTypes:{label:{control:`text`},placeholder:{control:`text`},isDisabled:{control:`boolean`},disabledMessage:{control:`text`,description:`Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled Typeahead in Tooltip.`},isRequired:{control:`boolean`},isOptional:{control:`boolean`},hasEntriesOnFocus:{control:`boolean`},hasClear:{control:`boolean`},maxMenuItems:{control:`number`},minQueryLength:{control:`number`,description:`Minimum query length before the search source is queried. Below it no search runs and the menu stays closed.`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Input size`}},decorators:[e=>(0,l.jsx)(`div`,{style:{width:320},children:(0,l.jsx)(e,{})})]},g={render:e=>{let[t,n]=(0,c.useState)(null);return(0,l.jsx)(i,{...e,searchSource:d,value:t,onChange:n})},args:{label:`Fruit`,placeholder:`Search fruits...`}},_={...g,args:{...g.args,hasEntriesOnFocus:!0},name:`With Bootstrap Results`},v={...g,args:{...g.args,isRequired:!0}},y={...g,args:{...g.args,isOptional:!0}},b={...g,args:{...g.args,description:`Pick your favorite fruit from the list`}},x={...g,args:{...g.args,status:{type:`error`,message:`Please select a fruit`}}},S={...g,args:{...g.args,status:{type:`warning`,message:`This fruit may be out of season`}}},C={...g,args:{...g.args,status:{type:`success`,message:`Great choice!`}}},w={...g,args:{...g.args,isDisabled:!0}},T={...g,args:{...g.args,isDisabled:!0,disabledMessage:`You need the Editor role to change this`}},E={...g,args:{...g.args,hasClear:!1},name:`Without Clear Button`},D={...g,args:{...g.args,hasEntriesOnFocus:!0,maxMenuItems:3},name:`Max 3 Results`},O={...g,args:{...g.args,label:`Fruit (type 3 characters)`,placeholder:`Search fruits...`,description:`The search runs once three characters are typed.`,minQueryLength:3},name:`Minimum Query Length`},k={render:()=>{let[e,t]=(0,c.useState)(null),[n,r]=(0,c.useState)(null),[a,o]=(0,c.useState)(null);return(0,l.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,l.jsx)(i,{label:`Small (28px)`,searchSource:d,value:e,onChange:t,placeholder:`Small size`,size:`sm`}),(0,l.jsx)(i,{label:`Medium (32px)`,searchSource:d,value:n,onChange:r,placeholder:`Medium size (default)`,size:`md`}),(0,l.jsx)(i,{label:`Large (36px)`,searchSource:d,value:a,onChange:o,placeholder:`Large size`,size:`lg`})]})}},A={...g,args:{...g.args,startIcon:o,hasEntriesOnFocus:!0},name:`With Start Icon`},j={render:()=>{let[e,t]=(0,c.useState)(null),[n,r]=(0,c.useState)(null);return(0,l.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:300},children:[(0,l.jsx)(i,{label:`Attached (default)`,searchSource:d,value:e,onChange:t,status:{type:`error`,message:`Please make a selection`}}),(0,l.jsx)(i,{label:`Detached`,searchSource:d,value:n,onChange:r,status:{type:`error`,message:`Please make a selection`},statusVariant:`detached`})]})}},M={render:()=>{let[e,t]=(0,c.useState)(null);return(0,l.jsx)(`div`,{style:{width:320},children:(0,l.jsx)(i,{label:`Fruit`,placeholder:`Type to search…`,searchSource:m,value:e,onChange:t,hasClear:!0,debounceMs:0})})},name:`Loading (async source)`},N={render:()=>{let[e,t]=(0,c.useState)(f),[n,r]=(0,c.useState)(null);return(0,l.jsxs)(`div`,{style:{display:`flex`,alignItems:`flex-start`,gap:16},children:[(0,l.jsx)(i,{label:`Selected`,searchSource:p,value:e,onChange:t,hasClear:!0}),(0,l.jsx)(i,{label:`Empty`,placeholder:`Type to search…`,searchSource:p,value:n,onChange:r,hasClear:!0})]})},name:`Selected value in a content-sized parent`},P={render:()=>{let[e,t]=(0,c.useState)(f);return(0,l.jsx)(`div`,{style:{width:320},children:(0,l.jsx)(i,{label:`Fruit`,searchSource:p,value:e,onChange:t,hasClear:!0})})},name:`Logical order`},F={render:()=>(0,l.jsx)(`div`,{style:{width:320},children:(0,l.jsx)(i,{label:`Fruit`,searchSource:d,value:u[0],onChange:()=>{},hasClear:!0})}),name:`RTL end lane (selected + clear)`},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<SearchableItem | null>(null);
    return <Typeahead {...args} searchSource={fruitSource} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Fruit',
    placeholder: 'Search fruits...'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasEntriesOnFocus: true
  },
  name: 'With Bootstrap Results'
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
    isOptional: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    description: 'Pick your favorite fruit from the list'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'error',
      message: 'Please select a fruit'
    }
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'warning',
      message: 'This fruit may be out of season'
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    status: {
      type: 'success',
      message: 'Great choice!'
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isDisabled: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasClear: false
  },
  name: 'Without Clear Button'
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    hasEntriesOnFocus: true,
    maxMenuItems: 3
  },
  name: 'Max 3 Results'
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    label: 'Fruit (type 3 characters)',
    placeholder: 'Search fruits...',
    description: 'The search runs once three characters are typed.',
    minQueryLength: 3
  },
  name: 'Minimum Query Length'
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    ...Default.args,
    startIcon: MagnifyingGlassIcon,
    hasEntriesOnFocus: true
  },
  name: 'With Start Icon'
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<SearchableItem | null>(null);
    return <div style={{
      width: 320
    }}>
        <Typeahead label="Fruit" placeholder="Type to search…" searchSource={slowFruitSource} value={value} onChange={setValue} hasClear debounceMs={0} />
      </div>;
  },
  name: 'Loading (async source)'
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<SearchableItem | null>(longFruit);
    const [b, setB] = useState<SearchableItem | null>(null);
    return <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16
    }}>
        <Typeahead label="Selected" searchSource={longFruitSource} value={a} onChange={setA} hasClear />
        <Typeahead label="Empty" placeholder="Type to search…" searchSource={longFruitSource} value={b} onChange={setB} hasClear />
      </div>;
  },
  name: 'Selected value in a content-sized parent'
}`,...N.parameters?.docs?.source},description:{story:`The two cases no Typeahead story covered, which is why a bug this visible
survived: a value selected, and a parent that is sized by its content.

Every other story renders in a fixed-width container, and a block-level
parent fills its container whatever its content is — so both hid a field
that sized itself to its value. Here the field is a flex item, so it is
shrink-to-fit: a table cell, an inline toolbar, a floated column.

Left, a long value: it must not widen the field, and it must ellipsize
before the clear button rather than under it. Right, an empty field for
comparison — the two must be the same width.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<SearchableItem | null>(longFruit);
    return <div style={{
      width: 320
    }}>
        <Typeahead label="Fruit" searchSource={longFruitSource} value={value} onChange={setValue} hasClear />
      </div>;
  },
  name: 'Logical order'
}`,...P.parameters?.docs?.source},description:{story:`One field with a selected value and a clear button — the two ends of the
content lane. The token opens the lane and the clear button closes it, so
under RTL they must swap sides: this is the story the RTL audit measures as
a D2 layout-order-flip.

A single field on purpose. The comparison story next to it renders two, and
the audit's selectors would match across both.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: 320
  }}>
      <Typeahead label="Fruit" searchSource={fruitSource} value={fruits[0]} onChange={() => {}} hasClear />
    </div>,
  name: 'RTL end lane (selected + clear)'
}`,...F.parameters?.docs?.source},description:{story:`The inline-end lane, populated at rest, for the RTL audit's D4 pass.

The lane holds the busy Spinner, and the busy state only exists between a
keystroke and its response — nothing the audit can hold still. A selected
value with \`hasClear\` puts the same lane on screen with no interaction, so
the audit measures the geometry the indicator lands in.`,...F.parameters?.docs?.description}}},I=[`Default`,`WithBootstrap`,`Required`,`Optional`,`WithDescription`,`WithError`,`WithWarning`,`WithSuccess`,`Disabled`,`DisabledWithMessage`,`NoClear`,`LimitedResults`,`MinQueryLength`,`SizeVariants`,`WithStartIcon`,`StatusVariantComparison`,`Loading`,`SelectedValueInAContentSizedParent`,`LogicalOrder`,`RtlEndLane`]}))();export{g as Default,w as Disabled,T as DisabledWithMessage,D as LimitedResults,M as Loading,P as LogicalOrder,O as MinQueryLength,E as NoClear,y as Optional,v as Required,F as RtlEndLane,N as SelectedValueInAContentSizedParent,k as SizeVariants,j as StatusVariantComparison,_ as WithBootstrap,b as WithDescription,x as WithError,A as WithStartIcon,C as WithSuccess,S as WithWarning,I as __namedExportsOrder,h as default};