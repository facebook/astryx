import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Table-BQvuW5nX.js";import{$t as a,Zt as o,ft as s}from"./iframe-rS7i1xed.js";var c,l,u,d,f,p,m,h,g,_,v,y,b;e((()=>{c=t(n()),s(),l=r(),u=[{id:`1`,name:`Alice`,email:`alice@example.com`,role:`Engineer`,isLocked:!1},{id:`2`,name:`Bob`,email:`bob@example.com`,role:`Designer`,isLocked:!1},{id:`3`,name:`Charlie`,email:`charlie@example.com`,role:`Manager`,isLocked:!1},{id:`4`,name:`Diana`,email:`diana@example.com`,role:`Engineer`,isLocked:!0},{id:`5`,name:`Eve`,email:`eve@example.com`,role:`Admin`,isLocked:!1}],d=[{key:`name`,header:`Name`},{key:`email`,header:`Email`},{key:`role`,header:`Role`}],f={title:`Core/TableSelection`,tags:[`autodocs`]},p={render:()=>{let[e,t]=(0,c.useState)(new Set),{selectionConfig:n}=o({data:u,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=a(n);return(0,l.jsxs)(`div`,{style:{maxWidth:600},children:[(0,l.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Selected: `,e.size,` of `,u.length]}),(0,l.jsx)(i,{data:u,columns:d,idKey:`id`,plugins:{selection:r}})]})}},m={render:()=>{let[e,t]=(0,c.useState)(new Set([`1`,`3`])),{selectionConfig:n}=o({data:u,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=a(n);return(0,l.jsxs)(`div`,{style:{maxWidth:600},children:[(0,l.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Selected: `,[...e].join(`, `)||`none`]}),(0,l.jsx)(i,{data:u,columns:d,idKey:`id`,plugins:{selection:r}})]})}},h={render:()=>{let[e,t]=(0,c.useState)(new Set),{selectionConfig:n}=o({data:u,idKey:`id`,selectedKeys:e,setSelectedKeys:t,getIsItemSelectable:e=>e.role!==`Admin`}),r=a(n);return(0,l.jsxs)(`div`,{style:{maxWidth:600},children:[(0,l.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Admin rows have no checkbox. Selected: `,e.size]}),(0,l.jsx)(i,{data:u,columns:d,idKey:`id`,plugins:{selection:r}})]})}},g={render:()=>{let[e,t]=(0,c.useState)(new Set),{selectionConfig:n}=o({data:u,idKey:`id`,selectedKeys:e,setSelectedKeys:t,getIsItemEnabled:e=>!e.isLocked}),r=a(n);return(0,l.jsxs)(`div`,{style:{maxWidth:600},children:[(0,l.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Locked rows (Diana) have a disabled checkbox. Select-all skips them. Selected: `,e.size]}),(0,l.jsx)(i,{data:u,columns:d,idKey:`id`,plugins:{selection:r}})]})}},_={render:()=>{let[e,t]=(0,c.useState)(new Set),{selectionConfig:n}=o({data:u,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=a(n);return(0,l.jsx)(`div`,{style:{maxWidth:600},children:(0,l.jsx)(i,{data:u,columns:d,idKey:`id`,density:`compact`,plugins:{selection:r}})})}},v={render:()=>{let[e,t]=(0,c.useState)(new Set),{selectionConfig:n}=o({data:u,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=a(n);return(0,l.jsx)(`div`,{style:{maxWidth:600},children:(0,l.jsx)(i,{data:u,columns:d,idKey:`id`,density:`spacious`,hasHover:!0,plugins:{selection:r}})})}},y={render:()=>{let[e,t]=(0,c.useState)(new Set),{selectionConfig:n}=o({data:u,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=a(n);return(0,l.jsx)(`div`,{style:{maxWidth:600},children:(0,l.jsx)(i,{data:u,columns:d,idKey:`id`,isStriped:!0,plugins:{selection:r}})})}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
        <Table data={users} columns={columns} idKey="id" density="spacious" hasHover plugins={{
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
        <Table data={users} columns={columns} idKey="id" isStriped plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...y.parameters?.docs?.source}}},b=[`Default`,`WithPreselection`,`NonSelectableRows`,`DisabledRows`,`Compact`,`Spacious`,`WithStripedRows`]}))();export{_ as Compact,p as Default,g as DisabledRows,h as NonSelectableRows,v as Spacious,m as WithPreselection,y as WithStripedRows,b as __namedExportsOrder,f as default};