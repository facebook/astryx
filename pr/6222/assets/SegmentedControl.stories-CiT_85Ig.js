import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Icon-BUqn92ti.js";import{t as a}from"./Icon-Dr_IHq7r.js";import{Bn as o,Ln as s,Rn as c}from"./iframe-aFDuI-7a.js";import{E as l,X as u,b as d,t as f}from"./esm-BNuSW8ar.js";var p,m,h,g,_,v,y,b,x,S,C,w;e((()=>{p=t(n()),s(),a(),f(),m=r(),h={title:`Core/SegmentedControl`,component:o,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Size variant for the control`},isDisabled:{control:`boolean`,description:`Whether the entire control is disabled`},disabledMessage:{control:`text`,description:`Explains why the control is disabled (whole-group state, not per segment). With isDisabled, shows a tooltip on hover/keyboard focus and keeps the control focusable via aria-disabled (selection stays blocked). Use this instead of wrapping a disabled SegmentedControl in Tooltip.`}}},g={args:{size:`md`,isDisabled:!1},render:e=>{let[t,n]=(0,p.useState)(`grid`);return(0,m.jsxs)(o,{value:t,onChange:n,label:`View mode`,size:e.size,isDisabled:e.isDisabled,children:[(0,m.jsx)(c,{value:`grid`,label:`Grid`}),(0,m.jsx)(c,{value:`list`,label:`List`}),(0,m.jsx)(c,{value:`table`,label:`Table`})]})}},_={args:{size:`md`},render:e=>{let[t,n]=(0,p.useState)(`grid`);return(0,m.jsxs)(o,{value:t,onChange:n,label:`View mode`,size:e.size,children:[(0,m.jsx)(c,{value:`grid`,label:`Grid`,icon:(0,m.jsx)(i,{icon:l,color:`inherit`})}),(0,m.jsx)(c,{value:`list`,label:`List`,icon:(0,m.jsx)(i,{icon:u,color:`inherit`})}),(0,m.jsx)(c,{value:`table`,label:`Table`,icon:(0,m.jsx)(i,{icon:d,color:`inherit`})})]})}},v={args:{size:`sm`},render:e=>{let[t,n]=(0,p.useState)(`grid`);return(0,m.jsxs)(o,{value:t,onChange:n,label:`View mode`,size:e.size,children:[(0,m.jsx)(c,{value:`grid`,label:`Grid`,isLabelHidden:!0,icon:(0,m.jsx)(i,{icon:l,color:`inherit`})}),(0,m.jsx)(c,{value:`list`,label:`List`,isLabelHidden:!0,icon:(0,m.jsx)(i,{icon:u,color:`inherit`})})]})}},y={render:()=>{let[e,t]=(0,p.useState)(`day`);return(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`},children:[(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`div`,{style:{marginBottom:`8px`,fontSize:`12px`,color:`var(--color-text-secondary)`},children:`Small`}),(0,m.jsxs)(o,{value:e,onChange:t,label:`Time period`,size:`sm`,children:[(0,m.jsx)(c,{value:`day`,label:`Day`}),(0,m.jsx)(c,{value:`week`,label:`Week`}),(0,m.jsx)(c,{value:`month`,label:`Month`})]})]}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`div`,{style:{marginBottom:`8px`,fontSize:`12px`,color:`var(--color-text-secondary)`},children:`Medium (default)`}),(0,m.jsxs)(o,{value:e,onChange:t,label:`Time period`,size:`md`,children:[(0,m.jsx)(c,{value:`day`,label:`Day`}),(0,m.jsx)(c,{value:`week`,label:`Week`}),(0,m.jsx)(c,{value:`month`,label:`Month`})]})]}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`div`,{style:{marginBottom:`8px`,fontSize:`12px`,color:`var(--color-text-secondary)`},children:`Large`}),(0,m.jsxs)(o,{value:e,onChange:t,label:`Time period`,size:`lg`,children:[(0,m.jsx)(c,{value:`day`,label:`Day`}),(0,m.jsx)(c,{value:`week`,label:`Week`}),(0,m.jsx)(c,{value:`month`,label:`Month`})]})]})]})}},b={render:()=>{let[e,t]=(0,p.useState)(`all`);return(0,m.jsxs)(o,{value:e,onChange:t,label:`Filter`,isDisabled:!0,children:[(0,m.jsx)(c,{value:`all`,label:`All`}),(0,m.jsx)(c,{value:`active`,label:`Active`}),(0,m.jsx)(c,{value:`completed`,label:`Completed`})]})}},x={render:()=>{let[e,t]=(0,p.useState)(`hourly`);return(0,m.jsxs)(o,{value:e,onChange:t,label:`Data granularity`,children:[(0,m.jsx)(c,{value:`hourly`,label:`Hourly`}),(0,m.jsx)(c,{value:`daily`,label:`Daily`}),(0,m.jsx)(c,{value:`weekly`,label:`Weekly`,isDisabled:!0})]})}},S={render:()=>{let[e,t]=(0,p.useState)(`all`);return(0,m.jsxs)(o,{value:e,onChange:t,label:`Filter`,isDisabled:!0,disabledMessage:`Choose a project to filter tasks`,children:[(0,m.jsx)(c,{value:`all`,label:`All`}),(0,m.jsx)(c,{value:`active`,label:`Active`}),(0,m.jsx)(c,{value:`completed`,label:`Completed`})]})}},C={name:`Pressed state`,parameters:{docs:{description:{story:"Press and hold an unselected item to see the system's `--color-overlay-pressed` layer. The selected item keeps its raised surface, and the disabled item remains visually unchanged and cannot be selected."}}},render:()=>{let[e,t]=(0,p.useState)(`grid`);return(0,m.jsxs)(o,{value:e,onChange:t,label:`View mode`,children:[(0,m.jsx)(c,{value:`grid`,label:`Grid — selected`}),(0,m.jsx)(c,{value:`list`,label:`List — press and hold`}),(0,m.jsx)(c,{value:`board`,label:`Board`}),(0,m.jsx)(c,{value:`unavailable`,label:`Unavailable — no pressed state`,isDisabled:!0})]})}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('all');
    return <SegmentedControl value={value} onChange={setValue} label="Filter" isDisabled>
        <SegmentedControlItem value="all" label="All" />
        <SegmentedControlItem value="active" label="Active" />
        <SegmentedControlItem value="completed" label="Completed" />
      </SegmentedControl>;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('hourly');
    return <SegmentedControl value={value} onChange={setValue} label="Data granularity">
        <SegmentedControlItem value="hourly" label="Hourly" />
        <SegmentedControlItem value="daily" label="Daily" />
        <SegmentedControlItem value="weekly" label="Weekly" isDisabled />
      </SegmentedControl>;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('all');
    return <SegmentedControl value={value} onChange={setValue} label="Filter" isDisabled disabledMessage="Choose a project to filter tasks">
        <SegmentedControlItem value="all" label="All" />
        <SegmentedControlItem value="active" label="Active" />
        <SegmentedControlItem value="completed" label="Completed" />
      </SegmentedControl>;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w=[`Default`,`WithIcons`,`IconOnly`,`SizeVariants`,`Disabled`,`DisabledItem`,`DisabledWithMessage`,`PressedState`]}))();export{g as Default,b as Disabled,x as DisabledItem,S as DisabledWithMessage,v as IconOnly,C as PressedState,y as SizeVariants,_ as WithIcons,w as __namedExportsOrder,h as default};