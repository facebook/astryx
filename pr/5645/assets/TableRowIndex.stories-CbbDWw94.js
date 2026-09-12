import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-z8muYPH2.js";import{i as a}from"./Stack-B9pi7ZUb.js";import{t as o}from"./Layout-Dt4bRu5Z.js";import{t as s}from"./Text-Cy3vzSsU.js";import{_ as c,g as l,t as u}from"./Table-B8VivTLr.js";import{Bt as d,Et as f,Gt as p,dt as m,qt as h}from"./iframe-BV8YN37_.js";var g,_,v,y,b,x,S,C,w,T,E,D,O;e((()=>{g=t(n()),m(),s(),o(),_=r(),v=[{id:`t1`,title:`Nightfall`,artist:`Ava Chen`,plays:1820},{id:`t2`,title:`Ember`,artist:`Liam Park`,plays:942},{id:`t3`,title:`Tidal`,artist:`Zoe Vega`,plays:3310},{id:`t4`,title:`Cinder`,artist:`Max Ross`,plays:604},{id:`t5`,title:`Halcyon`,artist:`Mia Cole`,plays:2075}],y=[{key:`title`,header:`Title`,width:c(2)},{key:`artist`,header:`Artist`,width:c(2)},{key:`plays`,header:`Plays`,width:l(90),align:`end`,sortable:!0}],b={title:`Core/TableRowIndex`,tags:[`autodocs`]},x={render:()=>{let e=f({data:v});return(0,_.jsx)(u,{data:v,columns:y,idKey:`id`,hasHover:!0,plugins:{rowIndex:e}})}},S={render:()=>{let e=f({data:v,label:`No.`,startFrom:0});return(0,_.jsx)(u,{data:v,columns:y,idKey:`id`,hasHover:!0,plugins:{rowIndex:e}})}},C={render:()=>{let[e,t]=(0,g.useState)([{sortKey:`plays`,direction:`descending`}]),{sortedData:n,sortConfig:r}=p({data:v,sort:e,onSortChange:t}),i=h(r),a=f({data:n,getRowKey:e=>e.id}),o=(0,g.useMemo)(()=>({rowIndex:a,sort:i}),[a,i]);return(0,_.jsx)(u,{data:n,columns:y,idKey:`id`,hasHover:!0,plugins:o})}},w=Array.from({length:42},(e,t)=>({id:`c${t+1}`,name:`Contact ${t+1}`,city:[`Lisbon`,`Tokyo`,`Oslo`,`Cairo`][t%4]})),T=[{key:`name`,header:`Name`,width:c(2)},{key:`city`,header:`City`,width:c(1)}],E={render:()=>(0,_.jsxs)(a,{gap:2,children:[(0,_.jsx)(i,{type:`body`,children:`No visible index column, but each row still exposes aria-rowindex, and the table exposes aria-rowcount. Inspect the DOM to verify.`}),(0,_.jsx)(u,{data:w.slice(0,5),columns:T,idKey:`id`,rowCount:w.length})]})},D={render:()=>{let[e,t]=(0,g.useState)(3),n=(e-1)*10,r=w.slice(n,n+10),i=d({page:e,onPageChange:t,totalItems:w.length,pageSize:10}),a=f({data:r,getRowKey:e=>e.id,startFrom:n+1}),o=(0,g.useMemo)(()=>({rowIndex:a,pagination:i}),[a,i]);return(0,_.jsx)(u,{data:r,columns:T,idKey:`id`,hasHover:!0,rowIndexStart:n+1,rowCount:w.length,plugins:o})}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const rowIndex = useTableRowIndex<Track>({
      data: tracks
    });
    return <Table data={tracks} columns={columns} idKey="id" hasHover plugins={{
      rowIndex
    }} />;
  }
}`,...x.parameters?.docs?.source},description:{story:`A monospaced, right-aligned row-number column is prepended to the table.
Numbering follows the rendered data order and starts at 1 by default.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source},description:{story:"Customize the header `label` and the `startFrom` offset (e.g. 0-based).",...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:`The index reflects the current view: with sorting active, pass the **sorted**
data to \`useTableRowIndex\` so numbering renumbers as the order changes. Sort
by Plays to see rows renumber 1..n in the new order.`,...C.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={2}>
      <Text type="body">
        No visible index column, but each row still exposes aria-rowindex, and
        the table exposes aria-rowcount. Inspect the DOM to verify.
      </Text>
      <Table data={contacts.slice(0, 5)} columns={contactColumns} idKey="id" rowCount={contacts.length} />
    </VStack>
}`,...E.parameters?.docs?.source},description:{story:"The row ordinal is an accessibility concern, not just a visible column. Pass\n`rowCount` (and, for a windowed view, `rowIndexStart`) to emit `aria-rowindex`\non every `<tr>` and `aria-rowcount` on the `<table>`, correct even when no\nvisible `#` column is rendered. Inspect the DOM: rows carry `aria-rowindex`\nwith no index column in sight.",...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:"With pagination, `aria-rowindex` must reflect the row's position in the\n**full** dataset, not the current page. Pass `rowIndexStart` as the offset of\nthe first visible row (`(page - 1) * pageSize + 1`) and `rowCount` as the\ntotal. On page 3 below, the first row announces as row 21 of 42. The visible\n`useTableRowIndex` numbering is seeded from the same offset so both agree.",...D.parameters?.docs?.description}}},O=[`Default`,`CustomLabelAndStart`,`RenumbersWithSort`,`AriaRowIndexNoVisibleColumn`,`AriaRowIndexWithPagination`]}))();export{E as AriaRowIndexNoVisibleColumn,D as AriaRowIndexWithPagination,S as CustomLabelAndStart,x as Default,C as RenumbersWithSort,O as __namedExportsOrder,b as default};