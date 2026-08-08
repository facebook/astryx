import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{i as r,r as i}from"./columnUtils-BDDG7zo5.js";import{n as a,t as o}from"./Table-ClbWztQk.js";import{i as s,n as c,r as l,t as u}from"./useTableSelectionState-BSKEXSen.js";import{n as d,t as f}from"./useTableColumnResize-xrKCKQfH.js";var p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{p=t(),a(),f(),l(),u(),i(),m=n(),h=[{id:`1`,name:`Alice`,email:`alice@example.com`,role:`Engineer`,isLocked:!1},{id:`2`,name:`Bob`,email:`bob@example.com`,role:`Designer`,isLocked:!1},{id:`3`,name:`Charlie`,email:`charlie@example.com`,role:`Manager`,isLocked:!1},{id:`4`,name:`Diana`,email:`diana@example.com`,role:`Engineer`,isLocked:!0},{id:`5`,name:`Eve`,email:`eve@example.com`,role:`Admin`,isLocked:!1}],g=[{key:`name`,header:`Name`},{key:`email`,header:`Email`},{key:`role`,header:`Role`}],_={title:`Core/TableColumnResize`,tags:[`autodocs`]},v={render:()=>{let[e,t]=(0,p.useState)({}),n=d({columnWidths:e,columns:g,onColumnResizeEnd:e=>{t(t=>({...t,...e}))}});return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsx)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:`Drag the right edge of any column header to resize. The last proportional column has no handle; it flexes to fill remaining space.`}),(0,m.jsx)(o,{data:h,columns:g,idKey:`id`,plugins:{columnResize:n}})]})}},y={render:()=>{let[e,t]=(0,p.useState)({}),n=d({columnWidths:e,onColumnResizeEnd:e=>{t(t=>({...t,...e}))},columns:g,minWidth:80,maxWidth:300});return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsx)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:`Columns are constrained between 80px and 300px.`}),(0,m.jsx)(o,{data:h,columns:g,idKey:`id`,plugins:{columnResize:n}})]})}},b={render:()=>{let[e,t]=(0,p.useState)({}),n=d({columnWidths:e,columns:g,onColumnResizeEnd:e=>{t(t=>({...t,...e}))}});return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Current widths:`,` `,Object.keys(e).length>0?Object.entries(e).map(([e,t])=>`${e}: ${t}px`).join(`, `):`none set (resize a column to see)`]}),(0,m.jsx)(`button`,{onClick:()=>t({}),style:{marginBottom:8,fontSize:14},children:`Reset all widths`}),(0,m.jsx)(o,{data:h,columns:g,idKey:`id`,plugins:{columnResize:n}})]})}},x={render:()=>{let[e,t]=(0,p.useState)({}),n=d({columnWidths:e,columns:g,onColumnResizeEnd:e=>{t(t=>({...t,...e}))}});return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsx)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:`Tab to a resize handle, press Enter to activate, use Arrow keys to resize (Shift for larger steps), Enter to commit, Escape to cancel.`}),(0,m.jsx)(o,{data:h,columns:g,idKey:`id`,plugins:{columnResize:n}})]})}},S={render:()=>{let[e,t]=(0,p.useState)(new Set),[n,r]=(0,p.useState)({}),{selectionConfig:i}=c({data:h,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),a=s(i),l=d({columnWidths:n,columns:g,onColumnResizeEnd:e=>{r(t=>({...t,...e}))}});return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:[`Selection and column resize plugins composed together. Selected:`,` `,e.size,` of `,h.length]}),(0,m.jsx)(o,{data:h,columns:g,idKey:`id`,plugins:{selection:a,columnResize:l}})]})}},C=[{key:`name`,header:`Name`,width:r(200)},{key:`email`,header:`Email`,width:r(250)},{key:`role`,header:`Role`,width:r(150)}],w={render:()=>{let[e,t]=(0,p.useState)({}),n=d({columnWidths:e,columns:C,onColumnResizeEnd:e=>{t(t=>({...t,...e}))}});return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsx)(`p`,{style:{marginBottom:8,fontSize:14,color:`#666`},children:`All columns are pixel-width. Every column gets a resize handle, including the last one. Min width defaults to the column's declared pixel value.`}),(0,m.jsx)(o,{data:h,columns:C,idKey:`id`,plugins:{columnResize:n}})]})}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T=[`Default`,`WithMinMaxConstraints`,`PersistingWidths`,`KeyboardResize`,`WithSelectionAndResize`,`AllPixelColumns`]})))()}E();export{w as AllPixelColumns,v as Default,x as KeyboardResize,b as PersistingWidths,y as WithMinMaxConstraints,S as WithSelectionAndResize,T as __namedExportsOrder,_ as default};