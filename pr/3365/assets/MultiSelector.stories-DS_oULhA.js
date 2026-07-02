import{ah as s,a1 as a}from"./iframe-CF49Wwf0.js";import{M as t}from"./MultiSelector-BLqepGQo.js";import"./preload-helper-Ct5FWWRu.js";import"./usePopover-dK0N4tGE.js";import"./useFocusTrap-CTs8glkB.js";import"./Field-B4k7n2cG.js";import"./FieldStatus-R68hTSFm.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./Divider-B8NVXNDK.js";import"./CheckboxInput-CuQs2wdN.js";import"./Badge-B7t8Dbk0.js";import"./utils-_uNaBhDK.js";const _={title:"Core/MultiSelector",component:t,tags:["autodocs"],parameters:{layout:"centered"},decorators:[e=>a.jsx("div",{style:{width:300},children:a.jsx(e,{})})],argTypes:{label:{control:"text"},isLabelHidden:{control:"boolean"},description:{control:"text"},placeholder:{control:"text"},size:{control:"radio",options:["sm","md","lg"]},triggerDisplay:{control:"radio",options:["count","labels","badges"]},isDisabled:{control:"boolean"},isOptional:{control:"boolean"},isRequired:{control:"boolean"},hasSelectAll:{control:"boolean"},hasSearch:{control:"boolean"}}},u={render:e=>{const[l,o]=s.useState(["Role","Created"]);return a.jsx(t,{...e,label:e.label??"Columns",options:e.options??["Name","Email","Role","Status","Created"],value:l,onChange:o})},args:{placeholder:"Select columns..."}},c={render:()=>{const[e,l]=s.useState([]);return a.jsx(t,{label:"Permissions",options:[{type:"section",title:"Read",options:[{value:"read_posts",label:"Read posts"},{value:"read_comments",label:"Read comments"},{value:"read_users",label:"Read users"}]},{type:"section",title:"Write",options:[{value:"write_posts",label:"Write posts"},{value:"write_comments",label:"Write comments"}]}],value:e,onChange:l,placeholder:"Select permissions..."})},decorators:[e=>a.jsx(e,{})]},d={render:()=>{const[e,l]=s.useState([]);return a.jsx(t,{label:"Columns",options:["Name","Email","Role","Status","Created","Updated"],value:e,onChange:l,hasSelectAll:!0,placeholder:"Select columns..."})},decorators:[e=>a.jsx(e,{})]},m={render:()=>{const[e,l]=s.useState([]);return a.jsx(t,{label:"Countries",options:["United States","United Kingdom","Canada","Australia","Germany","France","Japan","Brazil","India","Mexico"],value:e,onChange:l,hasSearch:!0,hasSelectAll:!0,placeholder:"Select countries..."})},decorators:[e=>a.jsx(e,{})]},p={render:()=>{const[e,l]=s.useState(["Name","Email"]),[o,r]=s.useState(["Name","Email","Role"]),[n,i]=s.useState(["Name","Email","Role","Status","Created"]);return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16,width:300},children:[a.jsx(t,{label:"Count (default)",options:["Name","Email","Role","Status","Created"],value:e,onChange:l,triggerDisplay:"count"}),a.jsx(t,{label:"Labels",options:["Name","Email","Role","Status","Created"],value:o,onChange:r,triggerDisplay:"labels"}),a.jsx(t,{label:"Badges",options:["Name","Email","Role","Status","Created"],value:n,onChange:i,triggerDisplay:"badges",maxBadges:3})]})},decorators:[e=>a.jsx(e,{})]},S={render:()=>{const[e,l]=s.useState(["admin"]);return a.jsx(t,{label:"Roles",options:[{value:"admin",label:"Admin",disabled:!0},{value:"editor",label:"Editor"},{value:"viewer",label:"Viewer"},{value:"guest",label:"Guest"}],value:e,onChange:l,hasSelectAll:!0,placeholder:"Select roles..."})},decorators:[e=>a.jsx(e,{})]},v={render:()=>{const[e,l]=s.useState([]),[o,r]=s.useState(["Email"]),[n,i]=s.useState(["Name","Email"]);return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16,width:300},children:[a.jsx(t,{label:"Error",options:["Name","Email","Role"],value:e,onChange:l,status:{type:"error",message:"Please select at least one column"},placeholder:"Select..."}),a.jsx(t,{label:"Warning",options:["Name","Email","Role"],value:o,onChange:r,status:{type:"warning",message:"Email column has issues"}}),a.jsx(t,{label:"Success",options:["Name","Email","Role"],value:n,onChange:i,status:{type:"success"}})]})},decorators:[e=>a.jsx(e,{})]},g={render:()=>{const[e,l]=s.useState([]),[o,r]=s.useState([]),[n,i]=s.useState([]);return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16,width:300},children:[a.jsx(t,{label:"Small",size:"sm",options:["Name","Email","Role"],value:e,onChange:l,placeholder:"Small (28px)"}),a.jsx(t,{label:"Medium",size:"md",options:["Name","Email","Role"],value:o,onChange:r,placeholder:"Medium (32px)"}),a.jsx(t,{label:"Large",size:"lg",options:["Name","Email","Role"],value:n,onChange:i,placeholder:"Large (36px)"})]})},decorators:[e=>a.jsx(e,{})]},b={render:()=>{const[e,l]=s.useState(["name","email"]),[o,r]=s.useState([]);return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16,width:300},children:[a.jsx(t,{label:"Visible columns",description:"Choose which columns to display in the table",options:[{value:"name",label:"Name"},{value:"email",label:"Email"},{value:"role",label:"Role"},{value:"status",label:"Status"},{value:"created",label:"Created at"}],value:e,onChange:l,hasSelectAll:!0,isRequired:!0,triggerDisplay:"labels"}),a.jsx(t,{label:"Status filter",description:"Filter by status",options:["Active","Inactive","Pending","Archived"],value:o,onChange:r,isOptional:!0,triggerDisplay:"badges",placeholder:"All statuses"})]})},decorators:[e=>a.jsx(e,{})]},h={render:()=>{const e=[{value:"name",label:"Name"},{value:"email",label:"Email"},{value:"role",label:"Role"},{value:"status",label:"Status"},{value:"created",label:"Created"},{value:"updated",label:"Updated"},{value:"actions",label:"Actions"}],[l,o]=s.useState(["name","email","role","status"]);return a.jsx(t,{label:"Columns",isLabelHidden:!0,options:e,value:l,onChange:o,hasSelectAll:!0,hasSearch:!0,triggerDisplay:"count",placeholder:"Columns"})},decorators:[e=>a.jsx(e,{})]},C={render:e=>{const[l,o]=s.useState(["react","typescript"]);return a.jsx(t,{...e,options:[{value:"react",label:"React"},{value:"typescript",label:"TypeScript"},{value:"stylex",label:"StyleX"},{value:"vitest",label:"Vitest"}],value:l,onChange:o,hasClear:!0})},args:{label:"Technologies",placeholder:"Select technologies..."}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>(['Role', 'Created']);
    return <MultiSelector {...args} label={args.label ?? 'Columns'} options={args.options ?? ['Name', 'Email', 'Role', 'Status', 'Created']} value={value} onChange={setValue} />;
  },
  args: {
    placeholder: 'Select columns...'
  }
}`,...u.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <MultiSelector label="Columns" options={['Name', 'Email', 'Role', 'Status', 'Created', 'Updated']} value={value} onChange={setValue} hasSelectAll placeholder="Select columns..." />;
  },
  decorators: [Story => <Story />]
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <MultiSelector label="Countries" options={['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'India', 'Mexico']} value={value} onChange={setValue} hasSearch hasSelectAll placeholder="Select countries..." />;
  },
  decorators: [Story => <Story />]
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};const z=["Default","Sections","SelectAll","Searchable","TriggerModes","DisabledItems","Status","Sizes","FormComposition","ColumnVisibility","Clearable"];export{C as Clearable,h as ColumnVisibility,u as Default,S as DisabledItems,b as FormComposition,m as Searchable,c as Sections,d as SelectAll,g as Sizes,v as Status,p as TriggerModes,z as __namedExportsOrder,_ as default};
