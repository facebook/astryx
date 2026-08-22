import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{s as i}from"./useTheme-B6xXbjjg.js";import{t as a}from"./Button-CJLo6QPp.js";import{t as o}from"./Button-fI36SH-3.js";import{o as s,t as c}from"./Indicator-BT5vGEPi.js";import{t as l,x as u}from"./theme-R67KAzkK.js";import{i as d,n as f,t as p}from"./Selector-1hXFIT0Z.js";import{Rt as m,gn as h,o as g,t as _}from"./esm-DA7gAIBC.js";var v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q;e((()=>{v=t(n()),o(),p(),l(),c(),_(),y=r(),b={title:`Core/Selector`,component:f,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,y.jsx)(`div`,{style:{width:250},children:(0,y.jsx)(e,{})})],argTypes:{label:{control:`text`,description:`Label text for the selector`},isLabelHidden:{control:`boolean`,description:`Whether to visually hide the label`},description:{control:`text`,description:`Description text displayed between label and selector`},options:{control:`object`,description:`Array of options to display. Can be strings, objects, dividers, or sections.`},value:{control:`text`,description:`The currently selected value`},placeholder:{control:`text`,description:`Placeholder text when no value is selected`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Size variant of the selector`},variant:{control:`radio`,options:[`input`,`ghost`],description:`Visual trigger style`},placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Explicit menu placement. Leave unset for selected-item overlay behavior.`},isDisabled:{control:`boolean`,description:`Whether the selector is disabled`},disabledMessage:{control:`text`,description:`Explains why the selector is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the trigger focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled Selector in Tooltip.`},isOptional:{control:`boolean`,description:`Whether the field is optional`},isRequired:{control:`boolean`,description:`Whether the field is required`},renderOption:{description:`Optional render function for custom option rendering`,table:{type:{summary:`(option: SelectorOptionData) => ReactNode`}}},"data-testid":{control:`text`,description:`Test ID for testing frameworks`}}},x={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(t??void 0);return(0,y.jsx)(f,{...a,label:e.label??`Fruit`,options:e.options??[`Apple`,`Banana`,`Orange`,`Mango`,`Pineapple`],value:o,onChange:e=>s(e)})},args:{placeholder:`Select a fruit...`}},S={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(t??void 0);return(0,y.jsx)(f,{...a,label:`Fruit`,isLabelHidden:!0,options:[`Apple`,`Banana`,`Orange`,`Mango`,`Pineapple`],value:o,onChange:e=>s(e),placeholder:`Select a fruit...`})}},C={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(t??void 0);return(0,y.jsx)(f,{...a,label:`Fruit`,description:`Choose your favorite fruit from the list`,options:[`Apple`,`Banana`,`Orange`,`Mango`,`Pineapple`],value:o,onChange:e=>s(e),placeholder:`Select a fruit...`})}},w={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(t??void 0);return(0,y.jsx)(f,{...a,label:`Fruit`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`},{value:`orange`,label:`Orange`,disabled:!0},{value:`mango`,label:`Mango`}],value:o,onChange:e=>s(e)})},args:{placeholder:`Select a fruit...`}},T={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(t??void 0);return(0,y.jsx)(f,{...a,label:`Settings`,options:[{value:`profile`,label:`Profile`,icon:g},{value:`settings`,label:`Settings`,icon:m},{value:`notifications`,label:`Notifications`,icon:h}],value:o,onChange:e=>s(e)})},args:{placeholder:`Select an option...`}},E={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(t??void 0);return(0,y.jsx)(f,{...a,label:`Fruit`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`},{type:`section`,title:`Citrus`,options:[{value:`orange`,label:`Orange`},{value:`lemon`,label:`Lemon`},{value:`lime`,label:`Lime`}]},{type:`section`,title:`Tropical`,options:[{value:`mango`,label:`Mango`},{value:`pineapple`,label:`Pineapple`}]}],value:o,onChange:e=>s(e)})},args:{placeholder:`Select a fruit...`}},D={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(t??void 0);return(0,y.jsx)(f,{...a,label:`Fruit`,hasSearch:!0,options:[{type:`section`,title:`Citrus`,options:[{value:`orange`,label:`Orange`},{value:`lemon`,label:`Lemon`},{value:`lime`,label:`Lime`},{value:`grapefruit`,label:`Grapefruit`}]},{type:`section`,title:`Tropical`,options:[{value:`mango`,label:`Mango`},{value:`pineapple`,label:`Pineapple`},{value:`papaya`,label:`Papaya`},{value:`guava`,label:`Guava`}]}],value:o,onChange:e=>s(e)})},args:{placeholder:`Select a fruit...`}},O={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(t??void 0);return(0,y.jsx)(f,{...a,label:`Fruit`,hasSearch:!0,options:[`Apple`,`Apricot`,`Banana`,`Blueberry`,`Cherry`,`Grapefruit`,`Mango`,`Orange`],value:o,onChange:e=>s(e)})},args:{placeholder:`Select a fruit...`}},k={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(t??void 0),c=[{value:`user1`,label:`Alice Johnson`,email:`alice@example.com`},{value:`user2`,label:`Bob Smith`,email:`bob@example.com`},{value:`user3`,label:`Carol White`,email:`carol@example.com`}];return(0,y.jsx)(f,{...a,label:`User`,options:c,value:o,onChange:e=>s(e),placeholder:`Select a user...`,renderOption:e=>(0,y.jsx)(d,{icon:g,label:e.label,description:e.email})})}},A={render:()=>{let[e,t]=(0,v.useState)(),[n,r]=(0,v.useState)(),[i,a]=(0,v.useState)();return(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:250},children:[(0,y.jsx)(f,{label:`Small`,size:`sm`,options:[`Apple`,`Banana`,`Orange`],value:e,onChange:t,placeholder:`Small size (28px)`}),(0,y.jsx)(f,{label:`Medium`,size:`md`,options:[`Apple`,`Banana`,`Orange`],value:n,onChange:r,placeholder:`Medium size (32px)`}),(0,y.jsx)(f,{label:`Large`,size:`lg`,options:[`Apple`,`Banana`,`Orange`],value:i,onChange:a,placeholder:`Large size (36px)`})]})},decorators:[e=>(0,y.jsx)(e,{})]},j={render:()=>{let[e,t]=(0,v.useState)(`week`),[n,r]=(0,v.useState)(`comfortable`);return(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:8,width:`max-content`},children:[(0,y.jsx)(a,{label:`Today`,variant:`ghost`}),(0,y.jsx)(f,{label:`View`,isLabelHidden:!0,variant:`ghost`,size:`md`,options:[{value:`day`,label:`Day`},{value:`week`,label:`Week`},{value:`month`,label:`Month`}],value:e,onChange:t}),(0,y.jsx)(f,{label:`Density`,isLabelHidden:!0,variant:`ghost`,size:`md`,options:[{value:`compact`,label:`Compact`},{value:`comfortable`,label:`Comfortable`},{value:`spacious`,label:`Spacious`}],value:n,onChange:r,status:{type:`warning`,message:`This setting affects all users`},statusVariant:`tooltip`}),(0,y.jsx)(a,{label:`Export`,variant:`ghost`})]})},decorators:[e=>(0,y.jsx)(e,{})]},M={render:()=>{let[e,t]=(0,v.useState)(),[n,r]=(0,v.useState)(`banana`),[i,a]=(0,v.useState)(`apple`);return(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:250},children:[(0,y.jsx)(f,{label:`Error status`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}],value:e,onChange:t,placeholder:`Select a fruit...`,status:{type:`error`,message:`Please select a fruit`}}),(0,y.jsx)(f,{label:`Warning status`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}],value:n,onChange:r,status:{type:`warning`,message:`Banana is out of season`}}),(0,y.jsx)(f,{label:`Success status`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}],value:i,onChange:a,status:{type:`success`}})]})},decorators:[e=>(0,y.jsx)(e,{})]},N={render:()=>{let[e,t]=(0,v.useState)(),[n,r]=(0,v.useState)();return(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:250},children:[(0,y.jsx)(f,{label:`Optional field`,isOptional:!0,options:[`Apple`,`Banana`,`Orange`],value:e,onChange:t,placeholder:`Select a fruit...`}),(0,y.jsx)(f,{label:`Required field`,isRequired:!0,options:[`Apple`,`Banana`,`Orange`],value:n,onChange:r,placeholder:`Select a fruit...`})]})},decorators:[e=>(0,y.jsx)(e,{})]},P={args:{label:`Fruit`,options:[`Apple`,`Banana`,`Orange`],value:`Apple`,isDisabled:!0,placeholder:`Select a fruit...`}},F={args:{label:`Owner`,options:[`Alice`,`Bob`,`Carol`],isDisabled:!0,disabledMessage:`You need the Editor role to change this`,placeholder:`Select an owner...`}},I={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(`Banana`);return(0,y.jsx)(f,{...a,label:`Fruit`,options:[`Apple`,`Banana`,`Orange`,`Mango`],value:o,onChange:e=>s(e)})}},L={render:()=>{let[e,t]=(0,v.useState)(),[n,r]=(0,v.useState)(`banana`),[i,a]=(0,v.useState)(),[o,s]=(0,v.useState)();return(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,width:`250px`},children:[(0,y.jsx)(f,{label:`Default`,options:[`Apple`,`Banana`,`Orange`],value:e,onChange:t,placeholder:`Select...`}),(0,y.jsx)(f,{label:`Pre-selected`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}],value:n,onChange:r}),(0,y.jsx)(f,{label:`With disabled option`,options:[{value:`apple`,label:`Apple`,disabled:!0},{value:`banana`,label:`Banana`}],value:i,onChange:a,placeholder:`Select...`}),(0,y.jsx)(f,{label:`Disabled selector`,options:[`Apple`,`Banana`],value:o,onChange:s,isDisabled:!0,placeholder:`Select...`})]})},decorators:[e=>(0,y.jsx)(e,{})]},R={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(`Banana`);return(0,y.jsx)(f,{...a,options:[`Apple`,`Banana`,`Cherry`,`Date`],value:o,onChange:e=>s(e),hasClear:!0})},args:{label:`Fruit`,placeholder:`Select a fruit...`}},z={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(`Banana`);return(0,y.jsx)(f,{...a,options:[`Apple`,`Banana`,`Cherry`],value:o,onChange:e=>s(e),hasClear:!0})},args:{label:`Required fruit`,status:{type:`warning`,message:`Selection is recommended`}}},B={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,v.useState)(t??`Banana`);return(0,y.jsx)(f,{...a,label:`Bottom toolbar selector`,options:[`Apple`,`Banana`,`Cherry`,`Date`],value:o,onChange:e=>s(e),placement:`above`})}},V={render:()=>{let[e,t]=(0,v.useState)(),[n,r]=(0,v.useState)();return(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:280},children:[(0,y.jsx)(f,{label:`Attached (default)`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}],value:e,onChange:t,placeholder:`Select a fruit...`,status:{type:`error`,message:`Please select a fruit`}}),(0,y.jsx)(f,{label:`Detached`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}],value:n,onChange:r,placeholder:`Select a fruit...`,status:{type:`error`,message:`Please select a fruit`},statusVariant:`detached`})]})},decorators:[e=>(0,y.jsx)(e,{})]},H=i({name:`selector-icon-demo`,components:{"selector-clear-icon":{base:{width:`12px`,height:`12px`,fontSize:`12px`,color:`var(--color-icon-secondary)`,":hover":{color:`var(--color-accent)`}}},"selector-indicator-icon":{base:{width:`14px`,height:`14px`,fontSize:`14px`,color:`var(--color-icon-secondary)`},"state:expanded":{color:`var(--color-accent)`}}}}),U={render:()=>{let[e,t]=(0,v.useState)(`Banana`);return(0,y.jsx)(u,{theme:H,mode:`light`,children:(0,y.jsx)(f,{label:`Icons themed (accent on hover/open)`,options:[`Apple`,`Banana`,`Cherry`],value:e,onChange:t,hasClear:!0})})}},W=i({name:`radio-selection-demo`,indicators:{check:s}}),G={render:()=>{let[e,t]=(0,v.useState)(`Banana`);return(0,y.jsx)(u,{theme:W,mode:`light`,children:(0,y.jsx)(f,{label:`Single selection drawn as a radio`,options:[`Apple`,`Banana`,`Cherry`],value:e,onChange:t,isDefaultOpen:!0})})}},K={render:()=>{let[e,t]=(0,v.useState)(`Banana`);return(0,y.jsx)(f,{label:`Single selection drawn as a check (default)`,options:[`Apple`,`Banana`,`Cherry`],value:e,onChange:t,isDefaultOpen:!0})}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label={args.label ?? 'Fruit'} options={args.options ?? ['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']} value={value} onChange={v => setValue(v)} />;
  },
  args: {
    placeholder: 'Select a fruit...'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Fruit" isLabelHidden options={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']} value={value} onChange={v => setValue(v)} placeholder="Select a fruit..." />;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Fruit" description="Choose your favorite fruit from the list" options={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']} value={value} onChange={v => setValue(v)} placeholder="Select a fruit..." />;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Fruit" options={[{
      value: 'apple',
      label: 'Apple'
    }, {
      value: 'banana',
      label: 'Banana'
    }, {
      value: 'orange',
      label: 'Orange',
      disabled: true
    }, {
      value: 'mango',
      label: 'Mango'
    }]} value={value} onChange={v => setValue(v)} />;
  },
  args: {
    placeholder: 'Select a fruit...'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Settings" options={[{
      value: 'profile',
      label: 'Profile',
      icon: UserIcon
    }, {
      value: 'settings',
      label: 'Settings',
      icon: CogIcon
    }, {
      value: 'notifications',
      label: 'Notifications',
      icon: BellIcon
    }]} value={value} onChange={v => setValue(v)} />;
  },
  args: {
    placeholder: 'Select an option...'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Fruit" options={[{
      value: 'apple',
      label: 'Apple'
    }, {
      value: 'banana',
      label: 'Banana'
    }, {
      type: 'section',
      title: 'Citrus',
      options: [{
        value: 'orange',
        label: 'Orange'
      }, {
        value: 'lemon',
        label: 'Lemon'
      }, {
        value: 'lime',
        label: 'Lime'
      }]
    }, {
      type: 'section',
      title: 'Tropical',
      options: [{
        value: 'mango',
        label: 'Mango'
      }, {
        value: 'pineapple',
        label: 'Pineapple'
      }]
    }]} value={value} onChange={v => setValue(v)} />;
  },
  args: {
    placeholder: 'Select a fruit...'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Fruit" hasSearch options={[{
      type: 'section',
      title: 'Citrus',
      options: [{
        value: 'orange',
        label: 'Orange'
      }, {
        value: 'lemon',
        label: 'Lemon'
      }, {
        value: 'lime',
        label: 'Lime'
      }, {
        value: 'grapefruit',
        label: 'Grapefruit'
      }]
    }, {
      type: 'section',
      title: 'Tropical',
      options: [{
        value: 'mango',
        label: 'Mango'
      }, {
        value: 'pineapple',
        label: 'Pineapple'
      }, {
        value: 'papaya',
        label: 'Papaya'
      }, {
        value: 'guava',
        label: 'Guava'
      }]
    }]} value={value} onChange={v => setValue(v)} />;
  },
  args: {
    placeholder: 'Select a fruit...'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Fruit" hasSearch options={['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grapefruit', 'Mango', 'Orange']} value={value} onChange={v => setValue(v)} />;
  },
  args: {
    placeholder: 'Select a fruit...'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    const users = [{
      value: 'user1',
      label: 'Alice Johnson',
      email: 'alice@example.com'
    }, {
      value: 'user2',
      label: 'Bob Smith',
      email: 'bob@example.com'
    }, {
      value: 'user3',
      label: 'Carol White',
      email: 'carol@example.com'
    }];
    return <Selector {...rest} label="User" options={users} value={value} onChange={v => setValue(v)} placeholder="Select a user..." renderOption={user => <SelectorOption icon={UserIcon} label={user.label} description={(user as (typeof users)[number]).email} />} />;
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>();
    const [value3, setValue3] = useState<string | undefined>();
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 250
    }}>
        <Selector label="Small" size="sm" options={['Apple', 'Banana', 'Orange']} value={value1} onChange={setValue1} placeholder="Small size (28px)" />
        <Selector label="Medium" size="md" options={['Apple', 'Banana', 'Orange']} value={value2} onChange={setValue2} placeholder="Medium size (32px)" />
        <Selector label="Large" size="lg" options={['Apple', 'Banana', 'Orange']} value={value3} onChange={setValue3} placeholder="Large size (36px)" />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [view, setView] = useState<string | undefined>('week');
    const [density, setDensity] = useState<string | undefined>('comfortable');
    return <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: 'max-content'
    }}>
        <Button label="Today" variant="ghost" />
        <Selector label="View" isLabelHidden variant="ghost" size="md" options={[{
        value: 'day',
        label: 'Day'
      }, {
        value: 'week',
        label: 'Week'
      }, {
        value: 'month',
        label: 'Month'
      }]} value={view} onChange={setView} />
        <Selector label="Density" isLabelHidden variant="ghost" size="md" options={[{
        value: 'compact',
        label: 'Compact'
      }, {
        value: 'comfortable',
        label: 'Comfortable'
      }, {
        value: 'spacious',
        label: 'Spacious'
      }]} value={density} onChange={setDensity} status={{
        type: 'warning',
        message: 'This setting affects all users'
      }} statusVariant="tooltip" />
        <Button label="Export" variant="ghost" />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>('banana');
    const [value3, setValue3] = useState<string | undefined>('apple');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 250
    }}>
        <Selector label="Error status" options={[{
        value: 'apple',
        label: 'Apple'
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={value1} onChange={setValue1} placeholder="Select a fruit..." status={{
        type: 'error',
        message: 'Please select a fruit'
      }} />
        <Selector label="Warning status" options={[{
        value: 'apple',
        label: 'Apple'
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={value2} onChange={setValue2} status={{
        type: 'warning',
        message: 'Banana is out of season'
      }} />
        <Selector label="Success status" options={[{
        value: 'apple',
        label: 'Apple'
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={value3} onChange={setValue3} status={{
        type: 'success'
      }} />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>();
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 250
    }}>
        <Selector label="Optional field" isOptional options={['Apple', 'Banana', 'Orange']} value={value1} onChange={setValue1} placeholder="Select a fruit..." />
        <Selector label="Required field" isRequired options={['Apple', 'Banana', 'Orange']} value={value2} onChange={setValue2} placeholder="Select a fruit..." />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Fruit',
    options: ['Apple', 'Banana', 'Orange'],
    value: 'Apple',
    isDisabled: true,
    placeholder: 'Select a fruit...'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Owner',
    options: ['Alice', 'Bob', 'Carol'],
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this',
    placeholder: 'Select an owner...'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: _value,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState('Banana');
    return <Selector {...rest} label="Fruit" options={['Apple', 'Banana', 'Orange', 'Mango']} value={value} onChange={v => setValue(v)} />;
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>('banana');
    const [value3, setValue3] = useState<string | undefined>();
    const [value4, setValue4] = useState<string | undefined>();
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '250px'
    }}>
        <Selector label="Default" options={['Apple', 'Banana', 'Orange']} value={value1} onChange={setValue1} placeholder="Select..." />
        <Selector label="Pre-selected" options={[{
        value: 'apple',
        label: 'Apple'
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={value2} onChange={setValue2} />
        <Selector label="With disabled option" options={[{
        value: 'apple',
        label: 'Apple',
        disabled: true
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={value3} onChange={setValue3} placeholder="Select..." />
        <Selector label="Disabled selector" options={['Apple', 'Banana']} value={value4} onChange={setValue4} isDisabled placeholder="Select..." />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: _value,
      onChange: _onChange,
      changeAction: _changeAction,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState<string | null>('Banana');
    return <Selector {...rest} options={['Apple', 'Banana', 'Cherry', 'Date']} value={value} onChange={v => setValue(v)} hasClear />;
  },
  args: {
    label: 'Fruit',
    placeholder: 'Select a fruit...'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: _value,
      onChange: _onChange,
      changeAction: _changeAction,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState<string | null>('Banana');
    return <Selector {...rest} options={['Apple', 'Banana', 'Cherry']} value={value} onChange={v => setValue(v)} hasClear />;
  },
  args: {
    label: 'Required fruit',
    status: {
      type: 'warning',
      message: 'Selection is recommended'
    }
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _changeAction,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? 'Banana');
    return <Selector {...rest} label="Bottom toolbar selector" options={['Apple', 'Banana', 'Cherry', 'Date']} value={value} onChange={v => setValue(v)} placement="above" />;
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<string | undefined>();
    const [b, setB] = useState<string | undefined>();
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      width: 280
    }}>
        <Selector label="Attached (default)" options={[{
        value: 'apple',
        label: 'Apple'
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={a} onChange={setA} placeholder="Select a fruit..." status={{
        type: 'error',
        message: 'Please select a fruit'
      }} />
        <Selector label="Detached" options={[{
        value: 'apple',
        label: 'Apple'
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={b} onChange={setB} placeholder="Select a fruit..." status={{
        type: 'error',
        message: 'Please select a fruit'
      }} statusVariant="detached" />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...V.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string | null>('Banana');
    return <Theme theme={iconTheme} mode="light">
        <Selector label="Icons themed (accent on hover/open)" options={['Apple', 'Banana', 'Cherry']} value={value} onChange={setValue} hasClear />
      </Theme>;
  }
}`,...U.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string | undefined>('Banana');
    return <Theme theme={radioSelectionTheme} mode="light">
        <Selector label="Single selection drawn as a radio" options={['Apple', 'Banana', 'Cherry']} value={value} onChange={setValue} isDefaultOpen />
      </Theme>;
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string | undefined>('Banana');
    return <Selector label="Single selection drawn as a check (default)" options={['Apple', 'Banana', 'Cherry']} value={value} onChange={setValue} isDefaultOpen />;
  }
}`,...K.parameters?.docs?.source},description:{story:`The same Selector with no theme, for comparison: a checkmark on the selected
row, and nothing at all on the others.`,...K.parameters?.docs?.description}}},q=[`Default`,`HiddenLabel`,`WithDescription`,`WithObjects`,`WithIcons`,`WithSections`,`SearchableWithSections`,`Searchable`,`CustomRender`,`SizeVariants`,`GhostVariant`,`WithStatus`,`OptionalRequired`,`Disabled`,`DisabledWithMessage`,`PreSelected`,`AllVariations`,`Clearable`,`ClearableWithStatus`,`PlacementAbove`,`StatusVariantComparison`,`ThemedIcons`,`RadioSelectionIndicator`,`DefaultSelectionIndicator`]}))();export{L as AllVariations,R as Clearable,z as ClearableWithStatus,k as CustomRender,x as Default,K as DefaultSelectionIndicator,P as Disabled,F as DisabledWithMessage,j as GhostVariant,S as HiddenLabel,N as OptionalRequired,B as PlacementAbove,I as PreSelected,G as RadioSelectionIndicator,O as Searchable,D as SearchableWithSections,A as SizeVariants,V as StatusVariantComparison,U as ThemedIcons,C as WithDescription,T as WithIcons,w as WithObjects,E as WithSections,M as WithStatus,q as __namedExportsOrder,b as default};