import{ah as l,a1 as e}from"./iframe-JfpySt6L.js";import{T as c}from"./Table-D20hfoB_.js";import{a,u as d}from"./useTableSelectionState-CMvL8GYC.js";import"./preload-helper-Ct5FWWRu.js";import"./ContextMenu-B7lms9S5.js";import"./renderDropdownItems-Dh7vtcw0.js";import"./Divider-DoN3EcNV.js";import"./Item-BE2Cczl9.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useListFocus-BWq12HVg.js";import"./EmptyState-DZsjsAew.js";import"./CheckboxInput-Of0Ukwxh.js";import"./FieldStatus-DZfAoZoW.js";const t=[{id:"1",name:"Alice",email:"alice@example.com",role:"Engineer",isLocked:!1},{id:"2",name:"Bob",email:"bob@example.com",role:"Designer",isLocked:!1},{id:"3",name:"Charlie",email:"charlie@example.com",role:"Manager",isLocked:!1},{id:"4",name:"Diana",email:"diana@example.com",role:"Engineer",isLocked:!0},{id:"5",name:"Eve",email:"eve@example.com",role:"Admin",isLocked:!1}],r=[{key:"name",header:"Name"},{key:"email",header:"Email"},{key:"role",header:"Role"}],B={title:"Core/TableSelection",tags:["autodocs"]},u={render:()=>{const[s,i]=l.useState(new Set),{selectionConfig:o}=a({data:t,idKey:"id",selectedKeys:s,setSelectedKeys:i}),n=d(o);return e.jsxs("div",{style:{maxWidth:600},children:[e.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Selected: ",s.size," of ",t.length]}),e.jsx(c,{data:t,columns:r,idKey:"id",plugins:{selection:n}})]})}},m={render:()=>{const[s,i]=l.useState(new Set(["1","3"])),{selectionConfig:o}=a({data:t,idKey:"id",selectedKeys:s,setSelectedKeys:i}),n=d(o);return e.jsxs("div",{style:{maxWidth:600},children:[e.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Selected: ",[...s].join(", ")||"none"]}),e.jsx(c,{data:t,columns:r,idKey:"id",plugins:{selection:n}})]})}},S={render:()=>{const[s,i]=l.useState(new Set),{selectionConfig:o}=a({data:t,idKey:"id",selectedKeys:s,setSelectedKeys:i,getIsItemSelectable:h=>h.role!=="Admin"}),n=d(o);return e.jsxs("div",{style:{maxWidth:600},children:[e.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Admin rows have no checkbox. Selected: ",s.size]}),e.jsx(c,{data:t,columns:r,idKey:"id",plugins:{selection:n}})]})}},y={render:()=>{const[s,i]=l.useState(new Set),{selectionConfig:o}=a({data:t,idKey:"id",selectedKeys:s,setSelectedKeys:i,getIsItemEnabled:h=>!h.isLocked}),n=d(o);return e.jsxs("div",{style:{maxWidth:600},children:[e.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Locked rows (Diana) have a disabled checkbox. Select-all skips them. Selected: ",s.size]}),e.jsx(c,{data:t,columns:r,idKey:"id",plugins:{selection:n}})]})}},p={render:()=>{const[s,i]=l.useState(new Set),{selectionConfig:o}=a({data:t,idKey:"id",selectedKeys:s,setSelectedKeys:i}),n=d(o);return e.jsx("div",{style:{maxWidth:600},children:e.jsx(c,{data:t,columns:r,idKey:"id",density:"compact",plugins:{selection:n}})})}},g={render:()=>{const[s,i]=l.useState(new Set),{selectionConfig:o}=a({data:t,idKey:"id",selectedKeys:s,setSelectedKeys:i}),n=d(o);return e.jsx("div",{style:{maxWidth:600},children:e.jsx(c,{data:t,columns:r,idKey:"id",density:"spacious",hasHover:!0,plugins:{selection:n}})})}},K={render:()=>{const[s,i]=l.useState(new Set),{selectionConfig:o}=a({data:t,idKey:"id",selectedKeys:s,setSelectedKeys:i}),n=d(o);return e.jsx("div",{style:{maxWidth:600},children:e.jsx(c,{data:t,columns:r,idKey:"id",isStriped:!0,plugins:{selection:n}})})}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}};const E=["Default","WithPreselection","NonSelectableRows","DisabledRows","Compact","Spacious","WithStripedRows"];export{p as Compact,u as Default,y as DisabledRows,S as NonSelectableRows,g as Spacious,m as WithPreselection,K as WithStripedRows,E as __namedExportsOrder,B as default};
