import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{t as r}from"./jsx-runtime-cM__dR4X.js";import{g as i,t as a}from"./Table-DjDHccIx.js";import{C as o,L as s,t as c,z as l}from"./Table-t0v56ewI.js";var u,d,f,p,m,h,g,_,v,y,b,x,S;t((()=>{u=e(n()),c(),d=r(),f=[{id:`1`,name:`Alice`,email:`alice@example.com`,role:`Engineer`,isLocked:!1},{id:`2`,name:`Bob`,email:`bob@example.com`,role:`Designer`,isLocked:!1},{id:`3`,name:`Charlie`,email:`charlie@example.com`,role:`Manager`,isLocked:!1},{id:`4`,name:`Diana`,email:`diana@example.com`,role:`Engineer`,isLocked:!0},{id:`5`,name:`Eve`,email:`eve@example.com`,role:`Admin`,isLocked:!1}],p=[{key:`name`,header:`Name`},{key:`email`,header:`Email`},{key:`role`,header:`Role`}],m={title:`Core/TableColumnResize`,tags:[`autodocs`]},h={render:()=>{let[e,t]=(0,u.useState)({}),n=o({columnWidths:e,columns:p,onColumnResizeEnd:e=>{t(t=>({...t,...e}))}});return(0,d.jsxs)(`div`,{style:{maxWidth:600},children:[(0,d.jsx)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:`Drag the right edge of any column header to resize. The last proportional column has no handle; it flexes to fill remaining space.`}),(0,d.jsx)(a,{data:f,columns:p,idKey:`id`,plugins:{columnResize:n}})]})}},g={render:()=>{let[e,t]=(0,u.useState)({}),n=o({columnWidths:e,onColumnResizeEnd:e=>{t(t=>({...t,...e}))},columns:p,minWidth:80,maxWidth:300});return(0,d.jsxs)(`div`,{style:{maxWidth:600},children:[(0,d.jsx)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:`Columns are constrained between 80px and 300px.`}),(0,d.jsx)(a,{data:f,columns:p,idKey:`id`,plugins:{columnResize:n}})]})}},_={render:()=>{let[e,t]=(0,u.useState)({}),n=o({columnWidths:e,columns:p,onColumnResizeEnd:e=>{t(t=>({...t,...e}))}});return(0,d.jsxs)(`div`,{style:{maxWidth:600},children:[(0,d.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Current widths:`,` `,Object.keys(e).length>0?Object.entries(e).map(([e,t])=>`${e}: ${t}px`).join(`, `):`none set (resize a column to see)`]}),(0,d.jsx)(`button`,{onClick:()=>t({}),style:{marginBottom:8,fontSize:14},children:`Reset all widths`}),(0,d.jsx)(a,{data:f,columns:p,idKey:`id`,plugins:{columnResize:n}})]})}},v={render:()=>{let[e,t]=(0,u.useState)({}),n=o({columnWidths:e,columns:p,onColumnResizeEnd:e=>{t(t=>({...t,...e}))}});return(0,d.jsxs)(`div`,{style:{maxWidth:600},children:[(0,d.jsx)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:`Tab to a resize handle, press Enter to activate, use Arrow keys to resize (Shift for larger steps), Enter to commit, Escape to cancel.`}),(0,d.jsx)(a,{data:f,columns:p,idKey:`id`,plugins:{columnResize:n}})]})}},y={render:()=>{let[e,t]=(0,u.useState)(new Set),[n,r]=(0,u.useState)({}),{selectionConfig:i}=s({data:f,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),c=l(i),m=o({columnWidths:n,columns:p,onColumnResizeEnd:e=>{r(t=>({...t,...e}))}});return(0,d.jsxs)(`div`,{style:{maxWidth:600},children:[(0,d.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Selection and column resize plugins composed together. Selected:`,` `,e.size,` of `,f.length]}),(0,d.jsx)(a,{data:f,columns:p,idKey:`id`,plugins:{selection:c,columnResize:m}})]})}},b=[{key:`name`,header:`Name`,width:i(200)},{key:`email`,header:`Email`,width:i(250)},{key:`role`,header:`Role`,width:i(150)}],x={render:()=>{let[e,t]=(0,u.useState)({}),n=o({columnWidths:e,columns:b,onColumnResizeEnd:e=>{t(t=>({...t,...e}))}});return(0,d.jsxs)(`div`,{style:{maxWidth:600},children:[(0,d.jsx)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:`All columns are pixel-width. Every column gets a resize handle, including the last one. Min width defaults to the column's declared pixel value.`}),(0,d.jsx)(a,{data:f,columns:b,idKey:`id`,plugins:{columnResize:n}})]})}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S=[`Default`,`WithMinMaxConstraints`,`PersistingWidths`,`KeyboardResize`,`WithSelectionAndResize`,`AllPixelColumns`]}))();export{x as AllPixelColumns,h as Default,v as KeyboardResize,_ as PersistingWidths,g as WithMinMaxConstraints,y as WithSelectionAndResize,S as __namedExportsOrder,m as default};