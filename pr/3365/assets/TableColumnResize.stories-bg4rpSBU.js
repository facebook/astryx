import{ah as a,a1 as e}from"./iframe-CF49Wwf0.js";import{T as d,p as y}from"./Table-BNg0XaZU.js";import{u}from"./useTableColumnResize-DGhROFSU.js";import{a as b,u as f}from"./useTableSelectionState-ELQeGGRv.js";import"./preload-helper-Ct5FWWRu.js";import"./ContextMenu-BZk9skAV.js";import"./renderDropdownItems-BK_aigRT.js";import"./Divider-B8NVXNDK.js";import"./Item-D1VdvwZp.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useListFocus-BOVcRWcC.js";import"./useTypeahead-CaUdhu09.js";import"./EmptyState-B3qqYJ5J.js";import"./CheckboxInput-CuQs2wdN.js";import"./FieldStatus-R68hTSFm.js";const r=[{id:"1",name:"Alice",email:"alice@example.com",role:"Engineer",isLocked:!1},{id:"2",name:"Bob",email:"bob@example.com",role:"Designer",isLocked:!1},{id:"3",name:"Charlie",email:"charlie@example.com",role:"Manager",isLocked:!1},{id:"4",name:"Diana",email:"diana@example.com",role:"Engineer",isLocked:!0},{id:"5",name:"Eve",email:"eve@example.com",role:"Admin",isLocked:!1}],l=[{key:"name",header:"Name"},{key:"email",header:"Email"},{key:"role",header:"Role"}],$={title:"Core/TableColumnResize",tags:["autodocs"]},m={render:()=>{const[s,o]=a.useState({}),i=u({columnWidths:s,columns:l,onColumnResizeEnd:n=>{o(t=>({...t,...n}))}});return e.jsxs("div",{style:{maxWidth:600},children:[e.jsx("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:"Drag the right edge of any column header to resize. The last proportional column has no handle; it flexes to fill remaining space."}),e.jsx(d,{data:r,columns:l,idKey:"id",plugins:{columnResize:i}})]})}},c={render:()=>{const[s,o]=a.useState({}),i=u({columnWidths:s,onColumnResizeEnd:n=>{o(t=>({...t,...n}))},columns:l,minWidth:80,maxWidth:300});return e.jsxs("div",{style:{maxWidth:600},children:[e.jsx("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:"Columns are constrained between 80px and 300px."}),e.jsx(d,{data:r,columns:l,idKey:"id",plugins:{columnResize:i}})]})}},p={render:()=>{const[s,o]=a.useState({}),i=u({columnWidths:s,columns:l,onColumnResizeEnd:n=>{o(t=>({...t,...n}))}});return e.jsxs("div",{style:{maxWidth:600},children:[e.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Current widths:"," ",Object.keys(s).length>0?Object.entries(s).map(([n,t])=>`${n}: ${t}px`).join(", "):"none set (resize a column to see)"]}),e.jsx("button",{onClick:()=>o({}),style:{marginBottom:8,fontSize:14},children:"Reset all widths"}),e.jsx(d,{data:r,columns:l,idKey:"id",plugins:{columnResize:i}})]})}},h={render:()=>{const[s,o]=a.useState({}),i=u({columnWidths:s,columns:l,onColumnResizeEnd:n=>{o(t=>({...t,...n}))}});return e.jsxs("div",{style:{maxWidth:600},children:[e.jsx("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:"Tab to a resize handle, press Enter to activate, use Arrow keys to resize (Shift for larger steps), Enter to commit, Escape to cancel."}),e.jsx(d,{data:r,columns:l,idKey:"id",plugins:{columnResize:i}})]})}},g={render:()=>{const[s,o]=a.useState(new Set),[i,n]=a.useState({}),{selectionConfig:t}=b({data:r,idKey:"id",selectedKeys:s,setSelectedKeys:o}),C=f(t),W=u({columnWidths:i,columns:l,onColumnResizeEnd:S=>{n(R=>({...R,...S}))}});return e.jsxs("div",{style:{maxWidth:600},children:[e.jsxs("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:["Selection and column resize plugins composed together. Selected:"," ",s.size," of ",r.length]}),e.jsx(d,{data:r,columns:l,idKey:"id",plugins:{selection:C,columnResize:W}})]})}},x=[{key:"name",header:"Name",width:y(200)},{key:"email",header:"Email",width:y(250)},{key:"role",header:"Role",width:y(150)}],z={render:()=>{const[s,o]=a.useState({}),i=u({columnWidths:s,columns:x,onColumnResizeEnd:n=>{o(t=>({...t,...n}))}});return e.jsxs("div",{style:{maxWidth:600},children:[e.jsx("p",{style:{marginBottom:8,fontSize:14,color:"#666"},children:"All columns are pixel-width. Every column gets a resize handle, including the last one. Min width defaults to the column's declared pixel value."}),e.jsx(d,{data:r,columns:x,idKey:"id",plugins:{columnResize:i}})]})}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const resizePlugin = useTableColumnResize<User>({
      columnWidths,
      columns: columns as TableColumn<Record<string, unknown>>[],
      onColumnResizeEnd: updates => {
        setColumnWidths(prev => ({
          ...prev,
          ...updates
        }));
      }
    });
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Drag the right edge of any column header to resize. The last
          proportional column has no handle; it flexes to fill remaining space.
        </p>
        <Table data={users} columns={columns} idKey="id" plugins={{
        columnResize: resizePlugin
      }} />
      </div>;
  }
}`,...m.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const resizePlugin = useTableColumnResize<User>({
      columnWidths,
      onColumnResizeEnd: updates => {
        setColumnWidths(prev => ({
          ...prev,
          ...updates
        }));
      },
      columns: columns as TableColumn<Record<string, unknown>>[],
      minWidth: 80,
      maxWidth: 300
    });
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Columns are constrained between 80px and 300px.
        </p>
        <Table data={users} columns={columns} idKey="id" plugins={{
        columnResize: resizePlugin
      }} />
      </div>;
  }
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const resizePlugin = useTableColumnResize<User>({
      columnWidths,
      columns: columns as TableColumn<Record<string, unknown>>[],
      onColumnResizeEnd: updates => {
        setColumnWidths(prev => ({
          ...prev,
          ...updates
        }));
      }
    });
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Current widths:{' '}
          {Object.keys(columnWidths).length > 0 ? Object.entries(columnWidths).map(([key, width]) => \`\${key}: \${width}px\`).join(', ') : 'none set (resize a column to see)'}
        </p>
        <button onClick={() => setColumnWidths({})} style={{
        marginBottom: 8,
        fontSize: 14
      }}>
          Reset all widths
        </button>
        <Table data={users} columns={columns} idKey="id" plugins={{
        columnResize: resizePlugin
      }} />
      </div>;
  }
}`,...p.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const resizePlugin = useTableColumnResize<User>({
      columnWidths,
      columns: columns as TableColumn<Record<string, unknown>>[],
      onColumnResizeEnd: updates => {
        setColumnWidths(prev => ({
          ...prev,
          ...updates
        }));
      }
    });
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Tab to a resize handle, press Enter to activate, use Arrow keys to
          resize (Shift for larger steps), Enter to commit, Escape to cancel.
        </p>
        <Table data={users} columns={columns} idKey="id" plugins={{
        columnResize: resizePlugin
      }} />
      </div>;
  }
}`,...h.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    const resizePlugin = useTableColumnResize<User>({
      columnWidths,
      columns: columns as TableColumn<Record<string, unknown>>[],
      onColumnResizeEnd: updates => {
        setColumnWidths(prev => ({
          ...prev,
          ...updates
        }));
      }
    });
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          Selection and column resize plugins composed together. Selected:{' '}
          {selectedKeys.size} of {users.length}
        </p>
        <Table data={users} columns={columns} idKey="id" plugins={{
        selection: selectionPlugin,
        columnResize: resizePlugin
      }} />
      </div>;
  }
}`,...g.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const resizePlugin = useTableColumnResize<User>({
      columnWidths,
      columns: pixelColumns as TableColumn<Record<string, unknown>>[],
      onColumnResizeEnd: updates => {
        setColumnWidths(prev => ({
          ...prev,
          ...updates
        }));
      }
    });
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: '#666'
      }}>
          All columns are pixel-width. Every column gets a resize handle,
          including the last one. Min width defaults to the column&apos;s
          declared pixel value.
        </p>
        <Table data={users} columns={pixelColumns} idKey="id" plugins={{
        columnResize: resizePlugin
      }} />
      </div>;
  }
}`,...z.parameters?.docs?.source}}};const N=["Default","WithMinMaxConstraints","PersistingWidths","KeyboardResize","WithSelectionAndResize","AllPixelColumns"];export{z as AllPixelColumns,m as Default,h as KeyboardResize,p as PersistingWidths,c as WithMinMaxConstraints,g as WithSelectionAndResize,N as __namedExportsOrder,$ as default};
