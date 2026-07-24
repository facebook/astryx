import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{_ as i,g as a,t as o}from"./Table-DPpibL4M.js";import{Ct as s,ft as c,wt as l}from"./iframe-CPRczjHQ.js";var u,d,f,p,m,h,g,_,v;e((()=>{u=t(n()),c(),d=r(),f=[{id:`src`,name:`src`,type:`folder`,size:`—`,modified:`2026-06-20`,children:[{id:`src/components`,name:`components`,type:`folder`,size:`—`,modified:`2026-06-19`,children:[{id:`src/components/Button.tsx`,name:`Button.tsx`,type:`file`,size:`4.2 KB`,modified:`2026-06-18`,children:[]},{id:`src/components/Table.tsx`,name:`Table.tsx`,type:`file`,size:`12.8 KB`,modified:`2026-06-20`,children:[]},{id:`src/components/Dialog.tsx`,name:`Dialog.tsx`,type:`file`,size:`6.1 KB`,modified:`2026-06-15`,children:[]}]},{id:`src/utils`,name:`utils`,type:`folder`,size:`—`,modified:`2026-06-17`,children:[{id:`src/utils/format.ts`,name:`format.ts`,type:`file`,size:`1.3 KB`,modified:`2026-06-17`,children:[]},{id:`src/utils/merge.ts`,name:`merge.ts`,type:`file`,size:`0.8 KB`,modified:`2026-06-10`,children:[]}]},{id:`src/index.ts`,name:`index.ts`,type:`file`,size:`0.4 KB`,modified:`2026-06-20`,children:[]}]},{id:`public`,name:`public`,type:`folder`,size:`—`,modified:`2026-06-01`,children:[{id:`public/favicon.ico`,name:`favicon.ico`,type:`file`,size:`15 KB`,modified:`2026-05-20`,children:[]}]},{id:`package.json`,name:`package.json`,type:`file`,size:`1.8 KB`,modified:`2026-06-22`,children:[]},{id:`tsconfig.json`,name:`tsconfig.json`,type:`file`,size:`0.6 KB`,modified:`2026-06-01`,children:[]}],p=[{key:`name`,header:`Name`,width:i(2)},{key:`type`,header:`Type`,width:a(80)},{key:`size`,header:`Size`,width:a(90)},{key:`modified`,header:`Modified`,width:a(120)}],m={title:`Core/TableRowExpansion`,tags:[`autodocs`]},h={render:()=>{let[e,t]=(0,u.useState)(new Set([`src`])),{data:n,expansionConfig:r}=l({baseData:f,getChildren:e=>e.children??[],getRowKey:e=>e.id,expandedKeys:e,setExpandedKeys:t}),i=s(r);return(0,d.jsx)(o,{data:n,columns:p,idKey:`id`,hasHover:!0,plugins:{expansion:i}})}},g={render:()=>{let[e,t]=(0,u.useState)(new Set([`src`,`src/components`])),{data:n,expansionConfig:r}=l({baseData:f,getChildren:e=>e.children??[],getRowKey:e=>e.id,getIsItemExpandable:e=>e.type===`folder`,expandedKeys:e,setExpandedKeys:t}),i=s(r);return(0,d.jsx)(o,{data:n,columns:p,idKey:`id`,hasHover:!0,plugins:{expansion:i}})}},_={render:()=>{let[e,t]=(0,u.useState)(new Set),{data:n,expansionConfig:r}=l({baseData:f,getChildren:e=>e.children??[],getRowKey:e=>e.id,expandedKeys:e,setExpandedKeys:t}),i=s({...r,hasRowClickExpansion:!0});return(0,d.jsx)(o,{data:n,columns:p,idKey:`id`,hasHover:!0,plugins:{expansion:i}})}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['src']));

    // The state hook flattens the tree, tracks depth, and derives the
    // expand/collapse + expand-all handlers — no boilerplate in the consumer.
    const {
      data,
      expansionConfig
    } = useTableRowExpansionState<FileNode>({
      baseData: fileTree,
      getChildren: item => item.children ?? [],
      getRowKey: item => item.id,
      expandedKeys,
      setExpandedKeys
    });
    const expansion = useTableRowExpansion(expansionConfig);
    return <Table data={data} columns={columns} idKey="id" hasHover plugins={{
      expansion
    }} />;
  }
}`,...h.parameters?.docs?.source},description:{story:`A file tree rendered as a table with expandable folder rows. Child rows
inherit the parent's columns and are indented based on depth. Click the
chevron (or right-click → "Expand/Collapse row") to expand a folder.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['src', 'src/components']));

    // \`getIsItemExpandable\` restricts expandability (and expand-all) to folders.
    const {
      data,
      expansionConfig
    } = useTableRowExpansionState<FileNode>({
      baseData: fileTree,
      getChildren: item => item.children ?? [],
      getRowKey: item => item.id,
      getIsItemExpandable: item => item.type === 'folder',
      expandedKeys,
      setExpandedKeys
    });
    const expansion = useTableRowExpansion(expansionConfig);
    return <Table data={data} columns={columns} idKey="id" hasHover plugins={{
      expansion
    }} />;
  }
}`,...g.parameters?.docs?.source},description:{story:`Only folders are expandable (files have no children). The chevron and
context-menu action are hidden for leaf nodes.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
    const {
      data,
      expansionConfig
    } = useTableRowExpansionState<FileNode>({
      baseData: fileTree,
      getChildren: item => item.children ?? [],
      getRowKey: item => item.id,
      expandedKeys,
      setExpandedKeys
    });

    // Opt into row-click expansion by extending the derived config.
    const expansion = useTableRowExpansion({
      ...expansionConfig,
      hasRowClickExpansion: true
    });
    return <Table data={data} columns={columns} idKey="id" hasHover plugins={{
      expansion
    }} />;
  }
}`,..._.parameters?.docs?.source},description:{story:"`hasRowClickExpansion: true` — clicking anywhere on the row toggles expansion\n(in addition to the chevron). The row shows a pointer cursor.",..._.parameters?.docs?.description}}},v=[`InheritedColumns`,`LeafNodesNotExpandable`,`ExpandOnRowClick`]}))();export{_ as ExpandOnRowClick,h as InheritedColumns,g as LeafNodesNotExpandable,v as __namedExportsOrder,m as default};