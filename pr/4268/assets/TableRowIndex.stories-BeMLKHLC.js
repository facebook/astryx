import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{_ as i,g as a,t as o}from"./Table-CpG1eUw3.js";import{Ot as s,Yt as c,ft as l,qt as u}from"./iframe-1XPcLcD3.js";var d,f,p,m,h,g,_,v,y;e((()=>{d=t(n()),l(),f=r(),p=[{id:`t1`,title:`Nightfall`,artist:`Ava Chen`,plays:1820},{id:`t2`,title:`Ember`,artist:`Liam Park`,plays:942},{id:`t3`,title:`Tidal`,artist:`Zoe Vega`,plays:3310},{id:`t4`,title:`Cinder`,artist:`Max Ross`,plays:604},{id:`t5`,title:`Halcyon`,artist:`Mia Cole`,plays:2075}],m=[{key:`title`,header:`Title`,width:i(2)},{key:`artist`,header:`Artist`,width:i(2)},{key:`plays`,header:`Plays`,width:a(90),align:`end`,sortable:!0}],h={title:`Core/TableRowIndex`,tags:[`autodocs`]},g={render:()=>{let e=s({data:p});return(0,f.jsx)(o,{data:p,columns:m,idKey:`id`,hasHover:!0,plugins:{rowIndex:e}})}},_={render:()=>{let e=s({data:p,label:`No.`,startFrom:0});return(0,f.jsx)(o,{data:p,columns:m,idKey:`id`,hasHover:!0,plugins:{rowIndex:e}})}},v={render:()=>{let[e,t]=(0,d.useState)([{sortKey:`plays`,direction:`descending`}]),{sortedData:n,sortConfig:r}=u({data:p,sort:e,onSortChange:t}),i=c(r),a=s({data:n,getRowKey:e=>e.id}),l=(0,d.useMemo)(()=>({rowIndex:a,sort:i}),[a,i]);return(0,f.jsx)(o,{data:n,columns:m,idKey:`id`,hasHover:!0,plugins:l})}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const rowIndex = useTableRowIndex<Track>({
      data: tracks
    });
    return <Table data={tracks} columns={columns} idKey="id" hasHover plugins={{
      rowIndex
    }} />;
  }
}`,...g.parameters?.docs?.source},description:{story:`A monospaced, right-aligned row-number column is prepended to the table.
Numbering follows the rendered data order and starts at 1 by default.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source},description:{story:"Customize the header `label` and the `startFrom` offset (e.g. 0-based).",..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`The index reflects the current view: with sorting active, pass the **sorted**
data to \`useTableRowIndex\` so numbering renumbers as the order changes. Sort
by Plays to see rows renumber 1..n in the new order.`,...v.parameters?.docs?.description}}},y=[`Default`,`CustomLabelAndStart`,`RenumbersWithSort`]}))();export{_ as CustomLabelAndStart,g as Default,v as RenumbersWithSort,y as __namedExportsOrder,h as default};