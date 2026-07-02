import{a1 as a,ah as o}from"./iframe-j1EZkcGb.js";import{S as t,a as F}from"./Selector-D493drRu.js";import{F as D}from"./UserIcon-a4i5dukp.js";import{F as W}from"./CogIcon-D-GCpw9M.js";import{F as w}from"./BellIcon-B9nKx5rR.js";import"./preload-helper-Ct5FWWRu.js";import"./usePopover-Db3MCAxh.js";import"./Field-MJLQjcWT.js";import"./FieldStatus-BgagH4tV.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./Divider-D8-Tp5ON.js";import"./utils-_uNaBhDK.js";import"./hooks-Bff1Ak_F.js";import"./Item-DyLXzivy.js";import"./computeTargetAndRel-BlG0ENK0.js";const G={title:"Core/Selector",component:t,tags:["autodocs"],parameters:{layout:"centered"},decorators:[e=>a.jsx("div",{style:{width:250},children:a.jsx(e,{})})],argTypes:{label:{control:"text",description:"Label text for the selector"},isLabelHidden:{control:"boolean",description:"Whether to visually hide the label"},description:{control:"text",description:"Description text displayed between label and selector"},options:{control:"object",description:"Array of options to display. Can be strings, objects, dividers, or sections."},value:{control:"text",description:"The currently selected value"},placeholder:{control:"text",description:"Placeholder text when no value is selected"},size:{control:"radio",options:["sm","md","lg"],description:"Size variant of the selector"},placement:{control:"select",options:["above","below","start","end"],description:"Explicit menu placement. Leave unset for selected-item overlay behavior."},isDisabled:{control:"boolean",description:"Whether the selector is disabled"},isOptional:{control:"boolean",description:"Whether the field is optional"},isRequired:{control:"boolean",description:"Whether the field is required"},renderOption:{description:"Optional render function for custom option rendering",table:{type:{summary:"(option: SelectorOptionData) => ReactNode"}}},"data-testid":{control:"text",description:"Test ID for testing frameworks"}}},g={render:e=>{const{value:n,onChange:i,changeAction:c,hasClear:p,...l}=e,[r,s]=o.useState(n??void 0);return a.jsx(t,{...l,label:e.label??"Fruit",options:e.options??["Apple","Banana","Orange","Mango","Pineapple"],value:r,onChange:u=>s(u)})},args:{placeholder:"Select a fruit..."}},h={render:e=>{const{value:n,onChange:i,changeAction:c,hasClear:p,...l}=e,[r,s]=o.useState(n??void 0);return a.jsx(t,{...l,label:"Fruit",isLabelHidden:!0,options:["Apple","Banana","Orange","Mango","Pineapple"],value:r,onChange:u=>s(u),placeholder:"Select a fruit..."})}},v={render:e=>{const{value:n,onChange:i,changeAction:c,hasClear:p,...l}=e,[r,s]=o.useState(n??void 0);return a.jsx(t,{...l,label:"Fruit",description:"Choose your favorite fruit from the list",options:["Apple","Banana","Orange","Mango","Pineapple"],value:r,onChange:u=>s(u),placeholder:"Select a fruit..."})}},b={render:e=>{const{value:n,onChange:i,changeAction:c,hasClear:p,...l}=e,[r,s]=o.useState(n??void 0);return a.jsx(t,{...l,label:"Fruit",options:[{value:"apple",label:"Apple"},{value:"banana",label:"Banana"},{value:"orange",label:"Orange",disabled:!0},{value:"mango",label:"Mango"}],value:r,onChange:u=>s(u)})},args:{placeholder:"Select a fruit..."}},m={render:e=>{const{value:n,onChange:i,changeAction:c,hasClear:p,...l}=e,[r,s]=o.useState(n??void 0);return a.jsx(t,{...l,label:"Settings",options:[{value:"profile",label:"Profile",icon:D},{value:"settings",label:"Settings",icon:W},{value:"notifications",label:"Notifications",icon:w}],value:r,onChange:u=>s(u)})},args:{placeholder:"Select an option..."}},S={render:e=>{const{value:n,onChange:i,changeAction:c,hasClear:p,...l}=e,[r,s]=o.useState(n??void 0);return a.jsx(t,{...l,label:"Fruit",options:[{value:"apple",label:"Apple"},{value:"banana",label:"Banana"},{type:"section",title:"Citrus",options:[{value:"orange",label:"Orange"},{value:"lemon",label:"Lemon"},{value:"lime",label:"Lime"}]},{type:"section",title:"Tropical",options:[{value:"mango",label:"Mango"},{value:"pineapple",label:"Pineapple"}]}],value:r,onChange:u=>s(u)})},args:{placeholder:"Select a fruit..."}},C={render:e=>{const{value:n,onChange:i,changeAction:c,hasClear:p,...l}=e,[r,s]=o.useState(n??void 0),u=[{value:"user1",label:"Alice Johnson",email:"alice@example.com"},{value:"user2",label:"Bob Smith",email:"bob@example.com"},{value:"user3",label:"Carol White",email:"carol@example.com"}];return a.jsx(t,{...l,label:"User",options:u,value:r,onChange:d=>s(d),placeholder:"Select a user...",renderOption:d=>a.jsx(F,{icon:D,label:d.label,description:d.email})})}},f={render:()=>{const[e,n]=o.useState(),[i,c]=o.useState(),[p,l]=o.useState();return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16,width:250},children:[a.jsx(t,{label:"Small",size:"sm",options:["Apple","Banana","Orange"],value:e,onChange:n,placeholder:"Small size (28px)"}),a.jsx(t,{label:"Medium",size:"md",options:["Apple","Banana","Orange"],value:i,onChange:c,placeholder:"Medium size (32px)"}),a.jsx(t,{label:"Large",size:"lg",options:["Apple","Banana","Orange"],value:p,onChange:l,placeholder:"Large size (36px)"})]})},decorators:[e=>a.jsx(e,{})]},V={render:()=>{const[e,n]=o.useState(),[i,c]=o.useState("banana"),[p,l]=o.useState("apple");return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16,width:250},children:[a.jsx(t,{label:"Error status",options:[{value:"apple",label:"Apple"},{value:"banana",label:"Banana"}],value:e,onChange:n,placeholder:"Select a fruit...",status:{type:"error",message:"Please select a fruit"}}),a.jsx(t,{label:"Warning status",options:[{value:"apple",label:"Apple"},{value:"banana",label:"Banana"}],value:i,onChange:c,status:{type:"warning",message:"Banana is out of season"}}),a.jsx(t,{label:"Success status",options:[{value:"apple",label:"Apple"},{value:"banana",label:"Banana"}],value:p,onChange:l,status:{type:"success"}})]})},decorators:[e=>a.jsx(e,{})]},A={render:()=>{const[e,n]=o.useState(),[i,c]=o.useState();return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16,width:250},children:[a.jsx(t,{label:"Optional field",isOptional:!0,options:["Apple","Banana","Orange"],value:e,onChange:n,placeholder:"Select a fruit..."}),a.jsx(t,{label:"Required field",isRequired:!0,options:["Apple","Banana","Orange"],value:i,onChange:c,placeholder:"Select a fruit..."})]})},decorators:[e=>a.jsx(e,{})]},x={args:{label:"Fruit",options:["Apple","Banana","Orange"],value:"Apple",isDisabled:!0,placeholder:"Select a fruit..."}},_={render:e=>{const{value:n,onChange:i,changeAction:c,hasClear:p,...l}=e,[r,s]=o.useState("Banana");return a.jsx(t,{...l,label:"Fruit",options:["Apple","Banana","Orange","Mango"],value:r,onChange:u=>s(u)})}},B={render:()=>{const[e,n]=o.useState(),[i,c]=o.useState("banana"),[p,l]=o.useState(),[r,s]=o.useState();return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"250px"},children:[a.jsx(t,{label:"Default",options:["Apple","Banana","Orange"],value:e,onChange:n,placeholder:"Select..."}),a.jsx(t,{label:"Pre-selected",options:[{value:"apple",label:"Apple"},{value:"banana",label:"Banana"}],value:i,onChange:c}),a.jsx(t,{label:"With disabled option",options:[{value:"apple",label:"Apple",disabled:!0},{value:"banana",label:"Banana"}],value:p,onChange:l,placeholder:"Select..."}),a.jsx(t,{label:"Disabled selector",options:["Apple","Banana"],value:r,onChange:s,isDisabled:!0,placeholder:"Select..."})]})},decorators:[e=>a.jsx(e,{})]},y={render:e=>{const{value:n,onChange:i,changeAction:c,hasClear:p,...l}=e,[r,s]=o.useState("Banana");return a.jsx(t,{...l,options:["Apple","Banana","Cherry","Date"],value:r,onChange:u=>s(u),hasClear:!0})},args:{label:"Fruit",placeholder:"Select a fruit..."}},O={render:e=>{const{value:n,onChange:i,changeAction:c,hasClear:p,...l}=e,[r,s]=o.useState("Banana");return a.jsx(t,{...l,options:["Apple","Banana","Cherry"],value:r,onChange:u=>s(u),hasClear:!0})},args:{label:"Required fruit",status:{type:"warning",message:"Selection is recommended"}}},j={render:e=>{const{value:n,onChange:i,changeAction:c,hasClear:p,...l}=e,[r,s]=o.useState(n??"Banana");return a.jsx(t,{...l,label:"Bottom toolbar selector",options:["Apple","Banana","Cherry","Date"],value:r,onChange:u=>s(u),placement:"above"})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Fruit',
    options: ['Apple', 'Banana', 'Orange'],
    value: 'Apple',
    isDisabled: true,
    placeholder: 'Select a fruit...'
  }
}`,...x.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};const K=["Default","HiddenLabel","WithDescription","WithObjects","WithIcons","WithSections","CustomRender","SizeVariants","WithStatus","OptionalRequired","Disabled","PreSelected","AllVariations","Clearable","ClearableWithStatus","PlacementAbove"];export{B as AllVariations,y as Clearable,O as ClearableWithStatus,C as CustomRender,g as Default,x as Disabled,h as HiddenLabel,A as OptionalRequired,j as PlacementAbove,_ as PreSelected,f as SizeVariants,v as WithDescription,m as WithIcons,b as WithObjects,S as WithSections,V as WithStatus,K as __namedExportsOrder,G as default};
