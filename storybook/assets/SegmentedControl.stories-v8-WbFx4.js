import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Icon-0TiHt-2W.js";import{t as a}from"./Icon-dufoBKKJ.js";import{i as o,t as s}from"./Stack-CfnjGhmq.js";import{Bn as c,Un as l,Vn as u}from"./iframe-Cheb2vvR.js";import{E as d,X as f,b as p,t as m}from"./esm-BNuSW8ar.js";var h,g,_,v,y,b,x,S,C,w,T,E,D;e((()=>{h=t(n()),c(),a(),s(),m(),g=r(),_={title:`Core/SegmentedControl`,component:l,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Size variant for the control`},isDisabled:{control:`boolean`,description:`Whether the entire control is disabled`},disabledMessage:{control:`text`,description:`Explains why the control is disabled (whole-group state, not per segment). With isDisabled, shows a tooltip on hover/keyboard focus and keeps the control focusable via aria-disabled (selection stays blocked). Use this instead of wrapping a disabled SegmentedControl in Tooltip.`}}},v={args:{size:`md`,isDisabled:!1},render:e=>{let[t,n]=(0,h.useState)(`grid`);return(0,g.jsxs)(l,{value:t,onChange:n,label:`View mode`,size:e.size,isDisabled:e.isDisabled,children:[(0,g.jsx)(u,{value:`grid`,label:`Grid`}),(0,g.jsx)(u,{value:`list`,label:`List`}),(0,g.jsx)(u,{value:`table`,label:`Table`})]})}},y={name:`Inside a vertical stack`,render:()=>{let[e,t]=(0,h.useState)(`viewer`);return(0,g.jsx)(o,{width:`100%`,children:(0,g.jsxs)(l,{value:e,onChange:t,label:`Access level`,layout:`hug`,children:[(0,g.jsx)(u,{value:`viewer`,label:`Viewer`}),(0,g.jsx)(u,{value:`operator`,label:`Operator`}),(0,g.jsx)(u,{value:`owner`,label:`Owner`})]})})}},b={args:{size:`md`},render:e=>{let[t,n]=(0,h.useState)(`grid`);return(0,g.jsxs)(l,{value:t,onChange:n,label:`View mode`,size:e.size,children:[(0,g.jsx)(u,{value:`grid`,label:`Grid`,icon:(0,g.jsx)(i,{icon:d,color:`inherit`})}),(0,g.jsx)(u,{value:`list`,label:`List`,icon:(0,g.jsx)(i,{icon:f,color:`inherit`})}),(0,g.jsx)(u,{value:`table`,label:`Table`,icon:(0,g.jsx)(i,{icon:p,color:`inherit`})})]})}},x={args:{size:`sm`},render:e=>{let[t,n]=(0,h.useState)(`grid`);return(0,g.jsxs)(l,{value:t,onChange:n,label:`View mode`,size:e.size,children:[(0,g.jsx)(u,{value:`grid`,label:`Grid`,isLabelHidden:!0,icon:(0,g.jsx)(i,{icon:d,color:`inherit`})}),(0,g.jsx)(u,{value:`list`,label:`List`,isLabelHidden:!0,icon:(0,g.jsx)(i,{icon:f,color:`inherit`})})]})}},S={render:()=>{let[e,t]=(0,h.useState)(`day`);return(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`},children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{style:{marginBottom:`8px`,fontSize:`12px`,color:`var(--color-text-secondary)`},children:`Small`}),(0,g.jsxs)(l,{value:e,onChange:t,label:`Time period`,size:`sm`,children:[(0,g.jsx)(u,{value:`day`,label:`Day`}),(0,g.jsx)(u,{value:`week`,label:`Week`}),(0,g.jsx)(u,{value:`month`,label:`Month`})]})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{style:{marginBottom:`8px`,fontSize:`12px`,color:`var(--color-text-secondary)`},children:`Medium (default)`}),(0,g.jsxs)(l,{value:e,onChange:t,label:`Time period`,size:`md`,children:[(0,g.jsx)(u,{value:`day`,label:`Day`}),(0,g.jsx)(u,{value:`week`,label:`Week`}),(0,g.jsx)(u,{value:`month`,label:`Month`})]})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`div`,{style:{marginBottom:`8px`,fontSize:`12px`,color:`var(--color-text-secondary)`},children:`Large`}),(0,g.jsxs)(l,{value:e,onChange:t,label:`Time period`,size:`lg`,children:[(0,g.jsx)(u,{value:`day`,label:`Day`}),(0,g.jsx)(u,{value:`week`,label:`Week`}),(0,g.jsx)(u,{value:`month`,label:`Month`})]})]})]})}},C={render:()=>{let[e,t]=(0,h.useState)(`all`);return(0,g.jsxs)(l,{value:e,onChange:t,label:`Filter`,isDisabled:!0,children:[(0,g.jsx)(u,{value:`all`,label:`All`}),(0,g.jsx)(u,{value:`active`,label:`Active`}),(0,g.jsx)(u,{value:`completed`,label:`Completed`})]})}},w={render:()=>{let[e,t]=(0,h.useState)(`hourly`);return(0,g.jsxs)(l,{value:e,onChange:t,label:`Data granularity`,children:[(0,g.jsx)(u,{value:`hourly`,label:`Hourly`}),(0,g.jsx)(u,{value:`daily`,label:`Daily`}),(0,g.jsx)(u,{value:`weekly`,label:`Weekly`,isDisabled:!0})]})}},T={render:()=>{let[e,t]=(0,h.useState)(`all`);return(0,g.jsxs)(l,{value:e,onChange:t,label:`Filter`,isDisabled:!0,disabledMessage:`Choose a project to filter tasks`,children:[(0,g.jsx)(u,{value:`all`,label:`All`}),(0,g.jsx)(u,{value:`active`,label:`Active`}),(0,g.jsx)(u,{value:`completed`,label:`Completed`})]})}},E={name:`Pressed state`,parameters:{docs:{description:{story:"Press and hold an unselected item to see the system's `--color-overlay-pressed` layer. The selected item keeps its raised surface, and the disabled item remains visually unchanged and cannot be selected."}}},render:()=>{let[e,t]=(0,h.useState)(`grid`);return(0,g.jsxs)(l,{value:e,onChange:t,label:`View mode`,children:[(0,g.jsx)(u,{value:`grid`,label:`Grid — selected`}),(0,g.jsx)(u,{value:`list`,label:`List — press and hold`}),(0,g.jsx)(u,{value:`board`,label:`Board`}),(0,g.jsx)(u,{value:`unavailable`,label:`Unavailable — no pressed state`,isDisabled:!0})]})}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md',
    isDisabled: false
  },
  render: args => {
    const [value, setValue] = useState('grid');
    return <SegmentedControl value={value} onChange={setValue} label="View mode" size={args.size} isDisabled={args.isDisabled}>
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Inside a vertical stack',
  render: () => {
    const [value, setValue] = useState('viewer');
    return <VStack width="100%">
        <SegmentedControl value={value} onChange={setValue} label="Access level" layout="hug">
          <SegmentedControlItem value="viewer" label="Viewer" />
          <SegmentedControlItem value="operator" label="Operator" />
          <SegmentedControlItem value="owner" label="Owner" />
        </SegmentedControl>
      </VStack>;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  },
  render: args => {
    const [value, setValue] = useState('grid');
    return <SegmentedControl value={value} onChange={setValue} label="View mode" size={args.size}>
        <SegmentedControlItem value="grid" label="Grid" icon={<Icon icon={Squares2X2Icon} color="inherit" />} />
        <SegmentedControlItem value="list" label="List" icon={<Icon icon={ListBulletIcon} color="inherit" />} />
        <SegmentedControlItem value="table" label="Table" icon={<Icon icon={TableCellsIcon} color="inherit" />} />
      </SegmentedControl>;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  },
  render: args => {
    const [value, setValue] = useState('grid');
    return <SegmentedControl value={value} onChange={setValue} label="View mode" size={args.size}>
        <SegmentedControlItem value="grid" label="Grid" isLabelHidden icon={<Icon icon={Squares2X2Icon} color="inherit" />} />
        <SegmentedControlItem value="list" label="List" isLabelHidden icon={<Icon icon={ListBulletIcon} color="inherit" />} />
      </SegmentedControl>;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('day');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
        <div>
          <div style={{
          marginBottom: '8px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)'
        }}>
            Small
          </div>
          <SegmentedControl value={value} onChange={setValue} label="Time period" size="sm">
            <SegmentedControlItem value="day" label="Day" />
            <SegmentedControlItem value="week" label="Week" />
            <SegmentedControlItem value="month" label="Month" />
          </SegmentedControl>
        </div>
        <div>
          <div style={{
          marginBottom: '8px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)'
        }}>
            Medium (default)
          </div>
          <SegmentedControl value={value} onChange={setValue} label="Time period" size="md">
            <SegmentedControlItem value="day" label="Day" />
            <SegmentedControlItem value="week" label="Week" />
            <SegmentedControlItem value="month" label="Month" />
          </SegmentedControl>
        </div>
        <div>
          <div style={{
          marginBottom: '8px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)'
        }}>
            Large
          </div>
          <SegmentedControl value={value} onChange={setValue} label="Time period" size="lg">
            <SegmentedControlItem value="day" label="Day" />
            <SegmentedControlItem value="week" label="Week" />
            <SegmentedControlItem value="month" label="Month" />
          </SegmentedControl>
        </div>
      </div>;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('all');
    return <SegmentedControl value={value} onChange={setValue} label="Filter" isDisabled>
        <SegmentedControlItem value="all" label="All" />
        <SegmentedControlItem value="active" label="Active" />
        <SegmentedControlItem value="completed" label="Completed" />
      </SegmentedControl>;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('hourly');
    return <SegmentedControl value={value} onChange={setValue} label="Data granularity">
        <SegmentedControlItem value="hourly" label="Hourly" />
        <SegmentedControlItem value="daily" label="Daily" />
        <SegmentedControlItem value="weekly" label="Weekly" isDisabled />
      </SegmentedControl>;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('all');
    return <SegmentedControl value={value} onChange={setValue} label="Filter" isDisabled disabledMessage="Choose a project to filter tasks">
        <SegmentedControlItem value="all" label="All" />
        <SegmentedControlItem value="active" label="Active" />
        <SegmentedControlItem value="completed" label="Completed" />
      </SegmentedControl>;
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'Pressed state',
  parameters: {
    docs: {
      description: {
        story: "Press and hold an unselected item to see the system's \`--color-overlay-pressed\` layer. The selected item keeps its raised surface, and the disabled item remains visually unchanged and cannot be selected."
      }
    }
  },
  render: () => {
    const [value, setValue] = useState('grid');
    return <SegmentedControl value={value} onChange={setValue} label="View mode">
        <SegmentedControlItem value="grid" label="Grid — selected" />
        <SegmentedControlItem value="list" label="List — press and hold" />
        <SegmentedControlItem value="board" label="Board" />
        <SegmentedControlItem value="unavailable" label="Unavailable — no pressed state" isDisabled />
      </SegmentedControl>;
  }
}`,...E.parameters?.docs?.source}}},D=[`Default`,`InVerticalStack`,`WithIcons`,`IconOnly`,`SizeVariants`,`Disabled`,`DisabledItem`,`DisabledWithMessage`,`PressedState`]}))();export{v as Default,C as Disabled,w as DisabledItem,T as DisabledWithMessage,x as IconOnly,y as InVerticalStack,E as PressedState,S as SizeVariants,b as WithIcons,D as __namedExportsOrder,_ as default};