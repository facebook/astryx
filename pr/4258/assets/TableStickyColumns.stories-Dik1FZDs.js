import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{g as i,t as a}from"./Table-CpG1eUw3.js";import{At as o,Mt as s,ft as c}from"./iframe-4XAMyx57.js";var l,u,d,f,p,m,h,g,_,v,y,b;e((()=>{l=t(n()),c(),u=r(),d=[{id:`1`,name:`Alice Nguyen`,email:`alice@example.com`,team:`Design Systems`,role:`Staff Engineer`,location:`San Francisco`,startDate:`2019-03-12`,manager:`Priya Patel`,status:`Active`},{id:`2`,name:`Bob Martinez`,email:`bob@example.com`,team:`Design Systems`,role:`Senior Designer`,location:`New York`,startDate:`2020-07-01`,manager:`Priya Patel`,status:`Active`},{id:`3`,name:`Charlie Okafor`,email:`charlie@example.com`,team:`Platform`,role:`Engineering Manager`,location:`London`,startDate:`2017-11-20`,manager:`Sam Lee`,status:`On leave`},{id:`4`,name:`Diana Rossi`,email:`diana@example.com`,team:`Platform`,role:`Staff Engineer`,location:`Remote`,startDate:`2021-01-15`,manager:`Sam Lee`,status:`Active`},{id:`5`,name:`Ehsan Karimi`,email:`ehsan@example.com`,team:`Growth`,role:`Product Engineer`,location:`Berlin`,startDate:`2022-05-30`,manager:`Mei Chen`,status:`Active`}],f=[{key:`name`,header:`Name`,width:i(180)},{key:`email`,header:`Email`,width:i(220)},{key:`team`,header:`Team`,width:i(180)},{key:`role`,header:`Role`,width:i(200)},{key:`location`,header:`Location`,width:i(160)},{key:`startDate`,header:`Start date`,width:i(140)},{key:`manager`,header:`Manager`,width:i(180)},{key:`status`,header:`Status`,width:i(140)}],p={title:`Core/TableStickyColumns`,tags:[`autodocs`]},m={marginBottom:8,fontSize:14,color:`#666`},h={render:()=>{let e=o({startKeys:[`name`]});return(0,u.jsxs)(`div`,{style:{maxWidth:720},children:[(0,u.jsxs)(`p`,{style:m,children:[(0,u.jsx)(`code`,{children:`startKeys: ['name']`}),` — scroll right to see the Name column stay pinned with a drop shadow.`]}),(0,u.jsx)(a,{data:d,columns:f,idKey:`id`,plugins:{stickyColumns:e}})]})}},g={render:()=>{let e=o({endKeys:[`status`]});return(0,u.jsxs)(`div`,{style:{maxWidth:720},children:[(0,u.jsxs)(`p`,{style:m,children:[(0,u.jsx)(`code`,{children:`endKeys: ['status']`}),` — the Status column stays pinned to the right edge while the rest scrolls.`]}),(0,u.jsx)(a,{data:d,columns:f,idKey:`id`,plugins:{stickyColumns:e}})]})}},_={render:()=>{let e=o({startKeys:[`name`,`email`],endKeys:[`status`]});return(0,u.jsxs)(`div`,{style:{maxWidth:720},children:[(0,u.jsxs)(`p`,{style:m,children:[(0,u.jsx)(`code`,{children:`startKeys: ['name', 'email']`}),` +`,` `,(0,u.jsx)(`code`,{children:`endKeys: ['status']`}),` — two columns pinned left with cumulative offsets, one pinned right.`]}),(0,u.jsx)(a,{data:d,columns:f,idKey:`id`,plugins:{stickyColumns:e}})]})}},v={render:()=>{let[e,t]=(0,l.useState)({}),n=s({columnWidths:e,columns:f,onColumnResizeEnd:e=>t(t=>({...t,...e}))}),r=o({startKeys:[`name`]});return(0,u.jsxs)(`div`,{style:{maxWidth:720},children:[(0,u.jsxs)(`p`,{style:m,children:[`Resize columns by dragging header edges; the pinned Name column stays sticky. Plugins compose:`,` `,(0,u.jsx)(`code`,{children:`{ columnResize, stickyColumns }`}),`.`]}),(0,u.jsx)(a,{data:d,columns:f,idKey:`id`,plugins:{columnResize:n,stickyColumns:r}})]})}},y={render:()=>{let e=o({});return(0,u.jsxs)(`div`,{style:{maxWidth:720},children:[(0,u.jsxs)(`p`,{style:m,children:[(0,u.jsxs)(`code`,{children:[`useTableStickyColumns(`,`{}`,`)`]}),` — no pinned columns; the table behaves as if the plugin weren't installed.`]}),(0,u.jsx)(a,{data:d,columns:f,idKey:`id`,plugins:{stickyColumns:e}})]})}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sticky = useTableStickyColumns<Employee>({
      startKeys: ['name']
    });
    return <div style={{
      maxWidth: 720
    }}>
        <p style={note}>
          <code>startKeys: ['name']</code> — scroll right to see the Name column
          stay pinned with a drop shadow.
        </p>
        <Table data={employees} columns={columns} idKey="id" plugins={{
        stickyColumns: sticky
      }} />
      </div>;
  }
}`,...h.parameters?.docs?.source},description:{story:"Pin the leading `Name` column to the start edge. Scroll horizontally — the\nname stays put and a drop shadow appears over the scrolling content.",...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sticky = useTableStickyColumns<Employee>({
      endKeys: ['status']
    });
    return <div style={{
      maxWidth: 720
    }}>
        <p style={note}>
          <code>endKeys: ['status']</code> — the Status column stays pinned to
          the right edge while the rest scrolls.
        </p>
        <Table data={employees} columns={columns} idKey="id" plugins={{
        stickyColumns: sticky
      }} />
      </div>;
  }
}`,...g.parameters?.docs?.source},description:{story:"Pin the trailing `Status` column to the end edge.",...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sticky = useTableStickyColumns<Employee>({
      startKeys: ['name', 'email'],
      endKeys: ['status']
    });
    return <div style={{
      maxWidth: 720
    }}>
        <p style={note}>
          <code>startKeys: ['name', 'email']</code> +{' '}
          <code>endKeys: ['status']</code> — two columns pinned left with
          cumulative offsets, one pinned right.
        </p>
        <Table data={employees} columns={columns} idKey="id" plugins={{
        stickyColumns: sticky
      }} />
      </div>;
  }
}`,..._.parameters?.docs?.source},description:{story:"Pin both edges at once. `startKeys`/`endKeys` each define a contiguous run\nfrom their edge inward; columns get cumulative offsets so multiple pinned\ncolumns stack correctly.",..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const resize = useTableColumnResize<Employee>({
      columnWidths,
      columns: columns as TableColumn<Record<string, unknown>>[],
      onColumnResizeEnd: updates => setColumnWidths(prev => ({
        ...prev,
        ...updates
      }))
    });
    const sticky = useTableStickyColumns<Employee>({
      startKeys: ['name']
    });
    return <div style={{
      maxWidth: 720
    }}>
        <p style={note}>
          Resize columns by dragging header edges; the pinned Name column stays
          sticky. Plugins compose:{' '}
          <code>{'{ columnResize, stickyColumns }'}</code>.
        </p>
        <Table data={employees} columns={columns} idKey="id" plugins={{
        columnResize: resize,
        stickyColumns: sticky
      }} />
      </div>;
  }
}`,...v.parameters?.docs?.source},description:{story:`Sticky columns composed with column resize. Resizing a pinned column keeps it
pinned; the plugin order (sticky after resize) ensures the sticky inline
offset wins over the resize handle's inline width.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sticky = useTableStickyColumns<Employee>({});
    return <div style={{
      maxWidth: 720
    }}>
        <p style={note}>
          <code>useTableStickyColumns({'{}'})</code> — no pinned columns; the
          table behaves as if the plugin weren't installed.
        </p>
        <Table data={employees} columns={columns} idKey="id" plugins={{
        stickyColumns: sticky
      }} />
      </div>;
  }
}`,...y.parameters?.docs?.source},description:{story:`Empty config is a valid no-op — nothing is pinned, every cell passes through
untouched. Lets callers compute keys conditionally without branching on
whether to install the plugin.`,...y.parameters?.docs?.description}}},b=[`PinStart`,`PinEnd`,`PinBothEdges`,`WithColumnResize`,`NoOpEmptyConfig`]}))();export{y as NoOpEmptyConfig,_ as PinBothEdges,g as PinEnd,h as PinStart,v as WithColumnResize,b as __namedExportsOrder,p as default};