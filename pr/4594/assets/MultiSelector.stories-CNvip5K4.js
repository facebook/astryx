import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{o as i}from"./useTheme-CtYN2BP4.js";import{t as a,x as o}from"./theme-DgHJ8EgH.js";import{n as s,t as c}from"./MultiSelector-DAAj16Rt.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;e((()=>{l=t(n()),c(),a(),u=r(),d={title:`Core/MultiSelector`,component:s,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,u.jsx)(`div`,{style:{width:300},children:(0,u.jsx)(e,{})})],argTypes:{label:{control:`text`},isLabelHidden:{control:`boolean`},description:{control:`text`},placeholder:{control:`text`},size:{control:`radio`,options:[`sm`,`md`,`lg`]},triggerDisplay:{control:`radio`,options:[`count`,`labels`,`badges`]},isDisabled:{control:`boolean`},disabledMessage:{control:`text`},isOptional:{control:`boolean`},isRequired:{control:`boolean`},hasSelectAll:{control:`boolean`},hasSearch:{control:`boolean`}}},f={render:e=>{let[t,n]=(0,l.useState)([`Role`,`Created`]);return(0,u.jsx)(s,{...e,label:e.label??`Columns`,options:e.options??[`Name`,`Email`,`Role`,`Status`,`Created`],value:t,onChange:n})},args:{placeholder:`Select columns...`}},p={render:()=>{let[e,t]=(0,l.useState)([]);return(0,u.jsx)(s,{label:`Permissions`,options:[{type:`section`,title:`Read`,options:[{value:`read_posts`,label:`Read posts`},{value:`read_comments`,label:`Read comments`},{value:`read_users`,label:`Read users`}]},{type:`section`,title:`Write`,options:[{value:`write_posts`,label:`Write posts`},{value:`write_comments`,label:`Write comments`}]}],value:e,onChange:t,placeholder:`Select permissions...`})},decorators:[e=>(0,u.jsx)(e,{})]},m={render:()=>{let[e,t]=(0,l.useState)([]);return(0,u.jsx)(s,{label:`Permissions`,hasSearch:!0,options:[{type:`section`,title:`Read`,options:[{value:`read_posts`,label:`Read posts`},{value:`read_comments`,label:`Read comments`},{value:`read_users`,label:`Read users`}]},{type:`section`,title:`Write`,options:[{value:`write_posts`,label:`Write posts`},{value:`write_comments`,label:`Write comments`}]}],value:e,onChange:t,placeholder:`Select permissions...`})},decorators:[e=>(0,u.jsx)(e,{})]},h={render:()=>{let[e,t]=(0,l.useState)([]);return(0,u.jsx)(s,{label:`Columns`,options:[`Name`,`Email`,`Role`,`Status`,`Created`,`Updated`],value:e,onChange:t,hasSelectAll:!0,placeholder:`Select columns...`})},decorators:[e=>(0,u.jsx)(e,{})]},g={render:()=>{let[e,t]=(0,l.useState)([]);return(0,u.jsx)(s,{label:`Countries`,options:[`United States`,`United Kingdom`,`Canada`,`Australia`,`Germany`,`France`,`Japan`,`Brazil`,`India`,`Mexico`],value:e,onChange:t,hasSearch:!0,hasSelectAll:!0,placeholder:`Select countries...`})},decorators:[e=>(0,u.jsx)(e,{})]},_={render:()=>{let[e,t]=(0,l.useState)([`Name`,`Email`]),[n,r]=(0,l.useState)([`Name`,`Email`,`Role`]),[i,a]=(0,l.useState)([`Name`,`Email`,`Role`,`Status`,`Created`]);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:300},children:[(0,u.jsx)(s,{label:`Count (default)`,options:[`Name`,`Email`,`Role`,`Status`,`Created`],value:e,onChange:t,triggerDisplay:`count`}),(0,u.jsx)(s,{label:`Labels`,options:[`Name`,`Email`,`Role`,`Status`,`Created`],value:n,onChange:r,triggerDisplay:`labels`}),(0,u.jsx)(s,{label:`Badges`,options:[`Name`,`Email`,`Role`,`Status`,`Created`],value:i,onChange:a,triggerDisplay:`badges`,maxBadges:3})]})},decorators:[e=>(0,u.jsx)(e,{})]},v={render:()=>{let[e,t]=(0,l.useState)([`admin`]);return(0,u.jsx)(s,{label:`Roles`,options:[{value:`admin`,label:`Admin`,disabled:!0},{value:`editor`,label:`Editor`},{value:`viewer`,label:`Viewer`},{value:`guest`,label:`Guest`}],value:e,onChange:t,hasSelectAll:!0,placeholder:`Select roles...`})},decorators:[e=>(0,u.jsx)(e,{})]},y={render:()=>{let[e,t]=(0,l.useState)([]);return(0,u.jsx)(s,{label:`Columns`,options:[`Name`,`Email`,`Role`,`Status`,`Created`],value:e,onChange:t,isDisabled:!0,disabledMessage:`Select a table before choosing columns`,placeholder:`Select columns...`})},decorators:[e=>(0,u.jsx)(e,{})]},b={render:()=>{let[e,t]=(0,l.useState)([]),[n,r]=(0,l.useState)([`Email`]),[i,a]=(0,l.useState)([`Name`,`Email`]);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:300},children:[(0,u.jsx)(s,{label:`Error`,options:[`Name`,`Email`,`Role`],value:e,onChange:t,status:{type:`error`,message:`Please select at least one column`},placeholder:`Select...`}),(0,u.jsx)(s,{label:`Warning`,options:[`Name`,`Email`,`Role`],value:n,onChange:r,status:{type:`warning`,message:`Email column has issues`}}),(0,u.jsx)(s,{label:`Success`,options:[`Name`,`Email`,`Role`],value:i,onChange:a,status:{type:`success`}})]})},decorators:[e=>(0,u.jsx)(e,{})]},x={render:()=>{let[e,t]=(0,l.useState)([]),[n,r]=(0,l.useState)([]),[i,a]=(0,l.useState)([]);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:300},children:[(0,u.jsx)(s,{label:`Small`,size:`sm`,options:[`Name`,`Email`,`Role`],value:e,onChange:t,placeholder:`Small (28px)`}),(0,u.jsx)(s,{label:`Medium`,size:`md`,options:[`Name`,`Email`,`Role`],value:n,onChange:r,placeholder:`Medium (32px)`}),(0,u.jsx)(s,{label:`Large`,size:`lg`,options:[`Name`,`Email`,`Role`],value:i,onChange:a,placeholder:`Large (36px)`})]})},decorators:[e=>(0,u.jsx)(e,{})]},S={render:()=>{let[e,t]=(0,l.useState)([`name`,`email`]),[n,r]=(0,l.useState)([]);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:300},children:[(0,u.jsx)(s,{label:`Visible columns`,description:`Choose which columns to display in the table`,options:[{value:`name`,label:`Name`},{value:`email`,label:`Email`},{value:`role`,label:`Role`},{value:`status`,label:`Status`},{value:`created`,label:`Created at`}],value:e,onChange:t,hasSelectAll:!0,isRequired:!0,triggerDisplay:`labels`}),(0,u.jsx)(s,{label:`Status filter`,description:`Filter by status`,options:[`Active`,`Inactive`,`Pending`,`Archived`],value:n,onChange:r,isOptional:!0,triggerDisplay:`badges`,placeholder:`All statuses`})]})},decorators:[e=>(0,u.jsx)(e,{})]},C={render:()=>{let e=[{value:`name`,label:`Name`},{value:`email`,label:`Email`},{value:`role`,label:`Role`},{value:`status`,label:`Status`},{value:`created`,label:`Created`},{value:`updated`,label:`Updated`},{value:`actions`,label:`Actions`}],[t,n]=(0,l.useState)([`name`,`email`,`role`,`status`]);return(0,u.jsx)(s,{label:`Columns`,isLabelHidden:!0,options:e,value:t,onChange:n,hasSelectAll:!0,hasSearch:!0,triggerDisplay:`count`,placeholder:`Columns`})},decorators:[e=>(0,u.jsx)(e,{})]},w={render:e=>{let[t,n]=(0,l.useState)([`react`,`typescript`]);return(0,u.jsx)(s,{...e,options:[{value:`react`,label:`React`},{value:`typescript`,label:`TypeScript`},{value:`stylex`,label:`StyleX`},{value:`vitest`,label:`Vitest`}],value:t,onChange:n,hasClear:!0})},args:{label:`Technologies`,placeholder:`Select technologies...`}},T={render:()=>{let[e,t]=(0,l.useState)([]),[n,r]=(0,l.useState)([]);return(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:300},children:[(0,u.jsx)(s,{label:`Attached (default)`,options:[`Name`,`Email`,`Role`],value:e,onChange:t,status:{type:`error`,message:`Select at least one column`},placeholder:`Select...`}),(0,u.jsx)(s,{label:`Detached`,options:[`Name`,`Email`,`Role`],value:n,onChange:r,status:{type:`error`,message:`Select at least one column`},statusVariant:`detached`,placeholder:`Select...`})]})},decorators:[e=>(0,u.jsx)(e,{})]},E=i({name:`multi-selector-icon-demo`,components:{"multi-selector-clear-icon":{base:{width:`12px`,height:`12px`,fontSize:`12px`,color:`var(--color-icon-secondary)`,":hover":{color:`var(--color-accent)`}}},"multi-selector-indicator-icon":{base:{width:`14px`,height:`14px`,fontSize:`14px`,color:`var(--color-icon-secondary)`},"state:expanded":{color:`var(--color-accent)`}}}}),D={render:()=>{let[e,t]=(0,l.useState)([`Apple`,`Banana`]);return(0,u.jsx)(o,{theme:E,mode:`light`,children:(0,u.jsx)(s,{label:`Icons themed (accent on hover/open)`,options:[`Apple`,`Banana`,`Orange`],value:e,onChange:t,hasClear:!0})})}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>(['Role', 'Created']);
    return <MultiSelector {...args} label={args.label ?? 'Columns'} options={args.options ?? ['Name', 'Email', 'Role', 'Status', 'Created']} value={value} onChange={setValue} />;
  },
  args: {
    placeholder: 'Select columns...'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <MultiSelector label="Permissions" options={[{
      type: 'section',
      title: 'Read',
      options: [{
        value: 'read_posts',
        label: 'Read posts'
      }, {
        value: 'read_comments',
        label: 'Read comments'
      }, {
        value: 'read_users',
        label: 'Read users'
      }]
    }, {
      type: 'section',
      title: 'Write',
      options: [{
        value: 'write_posts',
        label: 'Write posts'
      }, {
        value: 'write_comments',
        label: 'Write comments'
      }]
    }]} value={value} onChange={setValue} placeholder="Select permissions..." />;
  },
  decorators: [Story => <Story />]
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <MultiSelector label="Permissions" hasSearch options={[{
      type: 'section',
      title: 'Read',
      options: [{
        value: 'read_posts',
        label: 'Read posts'
      }, {
        value: 'read_comments',
        label: 'Read comments'
      }, {
        value: 'read_users',
        label: 'Read users'
      }]
    }, {
      type: 'section',
      title: 'Write',
      options: [{
        value: 'write_posts',
        label: 'Write posts'
      }, {
        value: 'write_comments',
        label: 'Write comments'
      }]
    }]} value={value} onChange={setValue} placeholder="Select permissions..." />;
  },
  decorators: [Story => <Story />]
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <MultiSelector label="Columns" options={['Name', 'Email', 'Role', 'Status', 'Created', 'Updated']} value={value} onChange={setValue} hasSelectAll placeholder="Select columns..." />;
  },
  decorators: [Story => <Story />]
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <MultiSelector label="Countries" options={['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'India', 'Mexico']} value={value} onChange={setValue} hasSearch hasSelectAll placeholder="Select countries..." />;
  },
  decorators: [Story => <Story />]
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string[]>(['Name', 'Email']);
    const [value2, setValue2] = useState<string[]>(['Name', 'Email', 'Role']);
    const [value3, setValue3] = useState<string[]>(['Name', 'Email', 'Role', 'Status', 'Created']);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 300
    }}>
        <MultiSelector label="Count (default)" options={['Name', 'Email', 'Role', 'Status', 'Created']} value={value1} onChange={setValue1} triggerDisplay="count" />
        <MultiSelector label="Labels" options={['Name', 'Email', 'Role', 'Status', 'Created']} value={value2} onChange={setValue2} triggerDisplay="labels" />
        <MultiSelector label="Badges" options={['Name', 'Email', 'Role', 'Status', 'Created']} value={value3} onChange={setValue3} triggerDisplay="badges" maxBadges={3} />
      </div>;
  },
  decorators: [Story => <Story />]
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>(['admin']);
    return <MultiSelector label="Roles" options={[{
      value: 'admin',
      label: 'Admin',
      disabled: true
    }, {
      value: 'editor',
      label: 'Editor'
    }, {
      value: 'viewer',
      label: 'Viewer'
    }, {
      value: 'guest',
      label: 'Guest'
    }]} value={value} onChange={setValue} hasSelectAll placeholder="Select roles..." />;
  },
  decorators: [Story => <Story />]
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <MultiSelector label="Columns" options={['Name', 'Email', 'Role', 'Status', 'Created']} value={value} onChange={setValue} isDisabled disabledMessage="Select a table before choosing columns" placeholder="Select columns..." />;
  },
  decorators: [Story => <Story />]
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string[]>([]);
    const [value2, setValue2] = useState<string[]>(['Email']);
    const [value3, setValue3] = useState<string[]>(['Name', 'Email']);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 300
    }}>
        <MultiSelector label="Error" options={['Name', 'Email', 'Role']} value={value1} onChange={setValue1} status={{
        type: 'error',
        message: 'Please select at least one column'
      }} placeholder="Select..." />
        <MultiSelector label="Warning" options={['Name', 'Email', 'Role']} value={value2} onChange={setValue2} status={{
        type: 'warning',
        message: 'Email column has issues'
      }} />
        <MultiSelector label="Success" options={['Name', 'Email', 'Role']} value={value3} onChange={setValue3} status={{
        type: 'success'
      }} />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string[]>([]);
    const [value2, setValue2] = useState<string[]>([]);
    const [value3, setValue3] = useState<string[]>([]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 300
    }}>
        <MultiSelector label="Small" size="sm" options={['Name', 'Email', 'Role']} value={value1} onChange={setValue1} placeholder="Small (28px)" />
        <MultiSelector label="Medium" size="md" options={['Name', 'Email', 'Role']} value={value2} onChange={setValue2} placeholder="Medium (32px)" />
        <MultiSelector label="Large" size="lg" options={['Name', 'Email', 'Role']} value={value3} onChange={setValue3} placeholder="Large (36px)" />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [columns, setColumns] = useState<string[]>(['name', 'email']);
    const [filters, setFilters] = useState<string[]>([]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 300
    }}>
        <MultiSelector label="Visible columns" description="Choose which columns to display in the table" options={[{
        value: 'name',
        label: 'Name'
      }, {
        value: 'email',
        label: 'Email'
      }, {
        value: 'role',
        label: 'Role'
      }, {
        value: 'status',
        label: 'Status'
      }, {
        value: 'created',
        label: 'Created at'
      }]} value={columns} onChange={setColumns} hasSelectAll isRequired triggerDisplay="labels" />
        <MultiSelector label="Status filter" description="Filter by status" options={['Active', 'Inactive', 'Pending', 'Archived']} value={filters} onChange={setFilters} isOptional triggerDisplay="badges" placeholder="All statuses" />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const allColumns = [{
      value: 'name',
      label: 'Name'
    }, {
      value: 'email',
      label: 'Email'
    }, {
      value: 'role',
      label: 'Role'
    }, {
      value: 'status',
      label: 'Status'
    }, {
      value: 'created',
      label: 'Created'
    }, {
      value: 'updated',
      label: 'Updated'
    }, {
      value: 'actions',
      label: 'Actions'
    }];
    const [visible, setVisible] = useState<string[]>(['name', 'email', 'role', 'status']);
    return <MultiSelector label="Columns" isLabelHidden options={allColumns} value={visible} onChange={setVisible} hasSelectAll hasSearch triggerDisplay="count" placeholder="Columns" />;
  },
  decorators: [Story => <Story />]
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>(['react', 'typescript']);
    return <MultiSelector {...args} options={[{
      value: 'react',
      label: 'React'
    }, {
      value: 'typescript',
      label: 'TypeScript'
    }, {
      value: 'stylex',
      label: 'StyleX'
    }, {
      value: 'vitest',
      label: 'Vitest'
    }]} value={value} onChange={setValue} hasClear />;
  },
  args: {
    label: 'Technologies',
    placeholder: 'Select technologies...'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<string[]>([]);
    const [b, setB] = useState<string[]>([]);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      width: 300
    }}>
        <MultiSelector label="Attached (default)" options={['Name', 'Email', 'Role']} value={a} onChange={setA} status={{
        type: 'error',
        message: 'Select at least one column'
      }} placeholder="Select..." />
        <MultiSelector label="Detached" options={['Name', 'Email', 'Role']} value={b} onChange={setB} status={{
        type: 'error',
        message: 'Select at least one column'
      }} statusVariant="detached" placeholder="Select..." />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...T.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>(['Apple', 'Banana']);
    return <Theme theme={iconTheme} mode="light">
        <MultiSelector label="Icons themed (accent on hover/open)" options={['Apple', 'Banana', 'Orange']} value={value} onChange={setValue} hasClear />
      </Theme>;
  }
}`,...D.parameters?.docs?.source}}},O=[`Default`,`Sections`,`SearchableSections`,`SelectAll`,`Searchable`,`TriggerModes`,`DisabledItems`,`DisabledWithMessage`,`Status`,`Sizes`,`FormComposition`,`ColumnVisibility`,`Clearable`,`StatusVariantComparison`,`ThemedIcons`]}))();export{w as Clearable,C as ColumnVisibility,f as Default,v as DisabledItems,y as DisabledWithMessage,S as FormComposition,g as Searchable,m as SearchableSections,p as Sections,h as SelectAll,x as Sizes,b as Status,T as StatusVariantComparison,D as ThemedIcons,_ as TriggerModes,O as __namedExportsOrder,d as default};