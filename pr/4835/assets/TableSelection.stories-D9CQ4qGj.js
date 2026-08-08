import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Table-ClbWztQk.js";import{i as a,n as o,r as s,t as c}from"./useTableSelectionState-BSKEXSen.js";var l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{l=t(),r(),s(),c(),u=n(),d=[{id:`1`,name:`Alice`,email:`alice@example.com`,role:`Engineer`,isLocked:!1},{id:`2`,name:`Bob`,email:`bob@example.com`,role:`Designer`,isLocked:!1},{id:`3`,name:`Charlie`,email:`charlie@example.com`,role:`Manager`,isLocked:!1},{id:`4`,name:`Diana`,email:`diana@example.com`,role:`Engineer`,isLocked:!0},{id:`5`,name:`Eve`,email:`eve@example.com`,role:`Admin`,isLocked:!1}],f=[{key:`name`,header:`Name`},{key:`email`,header:`Email`},{key:`role`,header:`Role`}],p={title:`Core/TableSelection`,tags:[`autodocs`]},m={render:()=>{let[e,t]=(0,l.useState)(new Set),{selectionConfig:n}=o({data:d,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=a(n);return(0,u.jsxs)(`div`,{style:{maxWidth:600},children:[(0,u.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Selected: `,e.size,` of `,d.length]}),(0,u.jsx)(i,{data:d,columns:f,idKey:`id`,plugins:{selection:r}})]})}},h={render:()=>{let[e,t]=(0,l.useState)(new Set([`1`,`3`])),{selectionConfig:n}=o({data:d,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=a(n);return(0,u.jsxs)(`div`,{style:{maxWidth:600},children:[(0,u.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Selected: `,[...e].join(`, `)||`none`]}),(0,u.jsx)(i,{data:d,columns:f,idKey:`id`,plugins:{selection:r}})]})}},g={render:()=>{let[e,t]=(0,l.useState)(new Set),{selectionConfig:n}=o({data:d,idKey:`id`,selectedKeys:e,setSelectedKeys:t,getIsItemSelectable:e=>e.role!==`Admin`}),r=a(n);return(0,u.jsxs)(`div`,{style:{maxWidth:600},children:[(0,u.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Admin rows have no checkbox. Selected: `,e.size]}),(0,u.jsx)(i,{data:d,columns:f,idKey:`id`,plugins:{selection:r}})]})}},_={render:()=>{let[e,t]=(0,l.useState)(new Set),{selectionConfig:n}=o({data:d,idKey:`id`,selectedKeys:e,setSelectedKeys:t,getIsItemEnabled:e=>!e.isLocked}),r=a(n);return(0,u.jsxs)(`div`,{style:{maxWidth:600},children:[(0,u.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Locked rows (Diana) have a disabled checkbox. Select-all skips them. Selected: `,e.size]}),(0,u.jsx)(i,{data:d,columns:f,idKey:`id`,plugins:{selection:r}})]})}},v={render:()=>{let[e,t]=(0,l.useState)(new Set),{selectionConfig:n}=o({data:d,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=a(n);return(0,u.jsx)(`div`,{style:{maxWidth:600},children:(0,u.jsx)(i,{data:d,columns:f,idKey:`id`,density:`compact`,plugins:{selection:r}})})}},y={render:()=>{let[e,t]=(0,l.useState)(new Set),{selectionConfig:n}=o({data:d,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=a(n);return(0,u.jsx)(`div`,{style:{maxWidth:600},children:(0,u.jsx)(i,{data:d,columns:f,idKey:`id`,density:`spacious`,hasHover:!0,plugins:{selection:r}})})}},b={render:()=>{let[e,t]=(0,l.useState)(new Set),{selectionConfig:n}=o({data:d,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=a(n);return(0,u.jsx)(`div`,{style:{maxWidth:600},children:(0,u.jsx)(i,{data:d,columns:f,idKey:`id`,isStriped:!0,plugins:{selection:r}})})}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Selected: {selectedKeys.size} of {users.length}
        </p>
        <Table data={users} columns={columns} idKey="id" plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(['1', '3']));
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Selected: {[...selectedKeys].join(', ') || 'none'}
        </p>
        <Table data={users} columns={columns} idKey="id" plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
      getIsItemSelectable: item => item.role !== 'Admin'
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Admin rows have no checkbox. Selected: {selectedKeys.size}
        </p>
        <Table data={users} columns={columns} idKey="id" plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
      getIsItemEnabled: item => !item.isLocked
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Locked rows (Diana) have a disabled checkbox. Select-all skips them.
          Selected: {selectedKeys.size}
        </p>
        <Table data={users} columns={columns} idKey="id" plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <Table data={users} columns={columns} idKey="id" density="compact" plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <Table data={users} columns={columns} idKey="id" density="spacious" hasHover plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <Table data={users} columns={columns} idKey="id" isStriped plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...b.parameters?.docs?.source}}},x=[`Default`,`WithPreselection`,`NonSelectableRows`,`DisabledRows`,`Compact`,`Spacious`,`WithStripedRows`]})))()}S();export{v as Compact,m as Default,_ as DisabledRows,g as NonSelectableRows,y as Spacious,h as WithPreselection,b as WithStripedRows,x as __namedExportsOrder,p as default};