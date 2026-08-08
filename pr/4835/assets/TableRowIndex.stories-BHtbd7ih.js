import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./VStack-C2SBQ4Fm.js";import{a as s,i as c,r as l}from"./columnUtils-BDDG7zo5.js";import{n as u,t as d}from"./Table-ClbWztQk.js";import{i as f,n as p,r as m,t as h}from"./useTableSortableState-CHVlCziu.js";import{n as g,t as _}from"./useTablePagination-DtNcJCv4.js";function v(e){let{data:t,getRowKey:n,label:r=`#`,startFrom:i=1}=e,a=(0,y.useMemo)(()=>{let e=new Map;for(let r=0;r<t.length;r++){let i=t[r];e.set(n?n(i):i,r)}return t=>e.get(n?n(t):t)},[t,n]);return(0,y.useMemo)(()=>({transformColumns(e){return[{key:`__rowIndex`,header:r,width:x,align:`end`,resizable:!1,renderCell:e=>{let t=a(e);return t==null?null:(0,b.jsx)(`span`,{className:`astryx9m5x89 astryx141an7d astryxss6m8b astryxv1l7n4`,children:t+i})}},...e]}}),[r,i,a])}var y,b,x;function S(){return(S=e((()=>{y=t(),b=i(),x={type:`pixel`,value:48}})))()}var C,w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{C=t(),u(),S(),_(),m(),h(),l(),n(),a(),w=i(),T=[{id:`t1`,title:`Nightfall`,artist:`Ava Chen`,plays:1820},{id:`t2`,title:`Ember`,artist:`Liam Park`,plays:942},{id:`t3`,title:`Tidal`,artist:`Zoe Vega`,plays:3310},{id:`t4`,title:`Cinder`,artist:`Max Ross`,plays:604},{id:`t5`,title:`Halcyon`,artist:`Mia Cole`,plays:2075}],E=[{key:`title`,header:`Title`,width:s(2)},{key:`artist`,header:`Artist`,width:s(2)},{key:`plays`,header:`Plays`,width:c(90),align:`end`,sortable:!0}],D={title:`Core/TableRowIndex`,tags:[`autodocs`]},O={render:()=>{let e=v({data:T});return(0,w.jsx)(d,{data:T,columns:E,idKey:`id`,hasHover:!0,plugins:{rowIndex:e}})}},k={render:()=>{let e=v({data:T,label:`No.`,startFrom:0});return(0,w.jsx)(d,{data:T,columns:E,idKey:`id`,hasHover:!0,plugins:{rowIndex:e}})}},A={render:()=>{let[e,t]=(0,C.useState)([{sortKey:`plays`,direction:`descending`}]),{sortedData:n,sortConfig:r}=p({data:T,sort:e,onSortChange:t}),i=f(r),a=v({data:n,getRowKey:e=>e.id}),o=(0,C.useMemo)(()=>({rowIndex:a,sort:i}),[a,i]);return(0,w.jsx)(d,{data:n,columns:E,idKey:`id`,hasHover:!0,plugins:o})}},j=Array.from({length:42},(e,t)=>({id:`c${t+1}`,name:`Contact ${t+1}`,city:[`Lisbon`,`Tokyo`,`Oslo`,`Cairo`][t%4]})),M=[{key:`name`,header:`Name`,width:s(2)},{key:`city`,header:`City`,width:s(1)}],N={render:()=>(0,w.jsxs)(o,{gap:2,children:[(0,w.jsx)(r,{type:`body`,children:`No visible index column, but each row still exposes aria-rowindex, and the table exposes aria-rowcount. Inspect the DOM to verify.`}),(0,w.jsx)(d,{data:j.slice(0,5),columns:M,idKey:`id`,rowCount:j.length})]})},P={render:()=>{let[e,t]=(0,C.useState)(3),n=(e-1)*10,r=j.slice(n,n+10),i=g({page:e,onPageChange:t,totalItems:j.length,pageSize:10}),a=v({data:r,getRowKey:e=>e.id,startFrom:n+1}),o=(0,C.useMemo)(()=>({rowIndex:a,pagination:i}),[a,i]);return(0,w.jsx)(d,{data:r,columns:M,idKey:`id`,hasHover:!0,rowIndexStart:n+1,rowCount:j.length,plugins:o})}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const rowIndex = useTableRowIndex<Track>({
      data: tracks
    });
    return <Table data={tracks} columns={columns} idKey="id" hasHover plugins={{
      rowIndex
    }} />;
  }
}`,...O.parameters?.docs?.source},description:{story:`A monospaced, right-aligned row-number column is prepended to the table.
Numbering follows the rendered data order and starts at 1 by default.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const rowIndex = useTableRowIndex<Track>({
      data: tracks,
      label: 'No.',
      startFrom: 0
    });
    return <Table data={tracks} columns={columns} idKey="id" hasHover plugins={{
      rowIndex
    }} />;
  }
}`,...k.parameters?.docs?.source},description:{story:"Customize the header `label` and the `startFrom` offset (e.g. 0-based).",...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [sort, setSort] = useState<TableSortState>([{
      sortKey: 'plays',
      direction: 'descending'
    }]);
    const {
      sortedData,
      sortConfig
    } = useTableSortableState<Track>({
      data: tracks,
      sort,
      onSortChange: setSort
    });
    const sortPlugin = useTableSortable<Track>(sortConfig);
    // Pass the sorted data + a stable key so the index tracks the sorted order.
    const rowIndex = useTableRowIndex<Track>({
      data: sortedData,
      getRowKey: item => item.id
    });
    const plugins = useMemo(() => ({
      rowIndex,
      sort: sortPlugin
    }), [rowIndex, sortPlugin]);
    return <Table data={sortedData} columns={columns} idKey="id" hasHover plugins={plugins} />;
  }
}`,...A.parameters?.docs?.source},description:{story:`The index reflects the current view: with sorting active, pass the **sorted**
data to \`useTableRowIndex\` so numbering renumbers as the order changes. Sort
by Plays to see rows renumber 1..n in the new order.`,...A.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={2}>
      <Text type="body">
        No visible index column, but each row still exposes aria-rowindex, and
        the table exposes aria-rowcount. Inspect the DOM to verify.
      </Text>
      <Table data={contacts.slice(0, 5)} columns={contactColumns} idKey="id" rowCount={contacts.length} />
    </VStack>
}`,...N.parameters?.docs?.source},description:{story:"The row ordinal is an accessibility concern, not just a visible column. Pass\n`rowCount` (and, for a windowed view, `rowIndexStart`) to emit `aria-rowindex`\non every `<tr>` and `aria-rowcount` on the `<table>`, correct even when no\nvisible `#` column is rendered. Inspect the DOM: rows carry `aria-rowindex`\nwith no index column in sight.",...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    const pageSize = 10;
    const [page, setPage] = useState(3);
    const start = (page - 1) * pageSize;
    const pageData = contacts.slice(start, start + pageSize);
    const pagination = useTablePagination<Contact>({
      page,
      onPageChange: setPage,
      totalItems: contacts.length,
      pageSize
    });
    const rowIndex = useTableRowIndex<Contact>({
      data: pageData,
      getRowKey: item => item.id,
      startFrom: start + 1
    });
    const plugins = useMemo(() => ({
      rowIndex,
      pagination
    }), [rowIndex, pagination]);
    return <Table data={pageData} columns={contactColumns} idKey="id" hasHover rowIndexStart={start + 1} rowCount={contacts.length} plugins={plugins} />;
  }
}`,...P.parameters?.docs?.source},description:{story:"With pagination, `aria-rowindex` must reflect the row's position in the\n**full** dataset, not the current page. Pass `rowIndexStart` as the offset of\nthe first visible row (`(page - 1) * pageSize + 1`) and `rowCount` as the\ntotal. On page 3 below, the first row announces as row 21 of 42. The visible\n`useTableRowIndex` numbering is seeded from the same offset so both agree.",...P.parameters?.docs?.description}}},F=[`Default`,`CustomLabelAndStart`,`RenumbersWithSort`,`AriaRowIndexNoVisibleColumn`,`AriaRowIndexWithPagination`]})))()}I();export{N as AriaRowIndexNoVisibleColumn,P as AriaRowIndexWithPagination,k as CustomLabelAndStart,O as Default,A as RenumbersWithSort,F as __namedExportsOrder,D as default};