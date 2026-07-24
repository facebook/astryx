import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{_ as i,g as a,t as o}from"./Table-CpG1eUw3.js";import{Gt as s,Yt as c,Zt as l,ft as u,qt as d,xt as f,yt as p}from"./iframe-4XAMyx57.js";function m({indent:e}){let{visibleData:t,treeConfig:n}=p({data:_,idKey:`id`,indent:e,defaultExpandedIds:[`eng`,`eng-platform`,`eng-platform-core`]}),r=f(n);return(0,g.jsxs)(`div`,{children:[(0,g.jsxs)(`p`,{style:{marginBlockEnd:8,fontWeight:600},children:[`indent="`,e,`"`]}),(0,g.jsx)(o,{data:t,columns:v,idKey:`id`,plugins:{tree:r}})]})}var h,g,_,v,y,b,x,S,C,w,T,E,D,O;e((()=>{h=t(n()),u(),g=r(),_=[{id:`eng`,name:`Engineering`,title:`VP Engineering`,team:`Engineering`,headcount:48,children:[{id:`eng-platform`,name:`Platform`,title:`Director`,team:`Engineering`,headcount:22,children:[{id:`eng-platform-core`,name:`Core Services`,title:`Manager`,team:`Platform`,headcount:12,children:[{id:`eng-platform-core-api`,name:`API Gateway`,title:`Tech Lead`,team:`Core Services`,headcount:5},{id:`eng-platform-core-data`,name:`Data Pipeline`,title:`Tech Lead`,team:`Core Services`,headcount:7}]},{id:`eng-platform-infra`,name:`Infrastructure`,title:`Manager`,team:`Platform`,headcount:10}]},{id:`eng-product`,name:`Product Engineering`,title:`Director`,team:`Engineering`,headcount:26,children:[{id:`eng-product-web`,name:`Web`,title:`Manager`,team:`Product Engineering`,headcount:14},{id:`eng-product-mobile`,name:`Mobile`,title:`Manager`,team:`Product Engineering`,headcount:12}]}]},{id:`design`,name:`Design`,title:`VP Design`,team:`Design`,headcount:11,children:[{id:`design-systems`,name:`Design Systems`,title:`Manager`,team:`Design`,headcount:4},{id:`design-research`,name:`Research`,title:`Manager`,team:`Design`,headcount:7}]},{id:`ops`,name:`Operations`,title:`VP Operations`,team:`Operations`,headcount:6}],v=[{key:`name`,header:`Group`,width:i(2)},{key:`title`,header:`Lead`,width:i(1)},{key:`team`,header:`Parent team`,width:i(1)},{key:`headcount`,header:`Headcount`,width:a(110),align:`end`}],y=v.map(e=>e.key===`name`||e.key===`headcount`?{...e,sortable:!0,sortKey:e.key}:e),b={title:`Core/TableTree`,tags:[`autodocs`]},x={render:()=>{let{visibleData:e,treeConfig:t}=p({data:_,idKey:`id`,defaultExpandedIds:[`eng`]}),n=f(t);return(0,g.jsx)(o,{data:e,columns:v,idKey:`id`,hasHover:!0,plugins:{tree:n}})}},S={render:()=>{let{visibleData:e,treeConfig:t,expandAll:n,collapseAll:r}=p({data:_,idKey:`id`,defaultExpandedIds:[`eng`,`eng-platform`,`eng-platform-core`]}),i=f(t);return(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,g.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,g.jsx)(`button`,{type:`button`,onClick:n,children:`Expand all`}),(0,g.jsx)(`button`,{type:`button`,onClick:r,children:`Collapse all`})]}),(0,g.jsx)(o,{data:e,columns:v,idKey:`id`,hasHover:!0,plugins:{tree:i}})]})}},C={render:()=>(0,g.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:32},children:[`sm`,`md`,`lg`].map(e=>(0,g.jsx)(m,{indent:e},e))})},w={render:()=>{let[e,t]=(0,h.useState)(()=>new Set([`design-systems`])),{visibleData:n,treeConfig:r}=p({data:_,idKey:`id`,defaultExpandedIds:[`eng`,`design`]}),{selectionConfig:i}=c({data:n,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),a=f(r),s=l(i);return(0,g.jsx)(o,{data:n,columns:v,idKey:`id`,hasHover:!0,plugins:{tree:a,selection:s}})}},T={render:()=>{let{sortConfig:e,applySort:t}=s({data:_,defaultSort:[{sortKey:`headcount`,direction:`descending`}]}),{visibleData:n,treeConfig:r}=p({data:_,idKey:`id`,defaultExpandedIds:[`eng`,`eng-platform`],sortSiblings:t}),i=f(r),a=d(e);return(0,g.jsx)(o,{data:n,columns:y,idKey:`id`,hasHover:!0,plugins:{sort:a,tree:i}})}},E={render:()=>{let[e,t]=(0,h.useState)([{id:`remote`,name:`Remote team`,title:`Director`,team:`—`,headcount:9}]),[n,r]=(0,h.useState)(()=>new Set),{visibleData:i,treeConfig:a}=p({data:e,idKey:`id`,isItemExpandable:e=>e.id===`remote`,onExpandedIdsChange:n=>{!n.has(`remote`)||e[0].children||(r(new Set([`remote`])),window.setTimeout(()=>{t([{...e[0],children:[{id:`remote-emea`,name:`EMEA`,title:`Manager`,team:`Remote team`,headcount:5},{id:`remote-apac`,name:`APAC`,title:`Manager`,team:`Remote team`,headcount:4}]}]),r(new Set)},600))}}),s=f(a);return(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:8},children:[(0,g.jsx)(o,{data:i,columns:v,idKey:`id`,hasHover:!0,plugins:{tree:s}}),n.size>0&&(0,g.jsx)(`p`,{children:`Loading children…`})]})}},D={render:()=>{let{visibleData:e,treeConfig:t}=p({data:[{id:`a`,name:`Engineering`,title:`VP Engineering`,team:`—`,headcount:48},{id:`b`,name:`Design`,title:`VP Design`,team:`—`,headcount:11},{id:`c`,name:`Operations`,title:`VP Operations`,team:`—`,headcount:6}],idKey:`id`}),n=f(t);return(0,g.jsx)(o,{data:e,columns:v,idKey:`id`,hasHover:!0,plugins:{tree:n}})}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      visibleData,
      treeConfig
    } = useTableTreeState<OrgRow>({
      data: orgChart,
      idKey: 'id',
      defaultExpandedIds: ['eng']
    });
    const tree = useTableTreeData(treeConfig);
    return <Table data={visibleData} columns={columns} idKey="id" hasHover plugins={{
      tree
    }} />;
  }
}`,...x.parameters?.docs?.source},description:{story:"Hierarchical records rendered as a table. `useTableTreeState` flattens the\nnested data into the visible rows and owns the expanded set;\n`useTableTreeData` draws the indent + expander in the first column.\n\nCollapsed branches are unmounted, not hidden — the `<tbody>` holds exactly\nthe visible rows.",...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      visibleData,
      treeConfig,
      expandAll,
      collapseAll
    } = useTableTreeState<OrgRow>({
      data: orgChart,
      idKey: 'id',
      defaultExpandedIds: ['eng', 'eng-platform', 'eng-platform-core']
    });
    const tree = useTableTreeData(treeConfig);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
        <div style={{
        display: 'flex',
        gap: 8
      }}>
          <button type="button" onClick={expandAll}>
            Expand all
          </button>
          <button type="button" onClick={collapseAll}>
            Collapse all
          </button>
        </div>
        <Table data={visibleData} columns={columns} idKey="id" hasHover plugins={{
        tree
      }} />
      </div>;
  }
}`,...S.parameters?.docs?.source},description:{story:"`expandAll` / `collapseAll` from the state hook, driving a deep hierarchy.\nIndentation is `calc(level * token)` — there is no depth cap.",...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const indents = ['sm', 'md', 'lg'] as const;
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 32
    }}>
        {indents.map(indent => <IndentExample key={indent} indent={indent} />)}
      </div>;
  }
}`,...C.parameters?.docs?.source},description:{story:"The `indent` token controls the step per level: `sm` (spacing-3), `md`\n(spacing-4, the default), and `lg` (spacing-6).",...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set(['design-systems']));
    const {
      visibleData,
      treeConfig
    } = useTableTreeState<OrgRow>({
      data: orgChart,
      idKey: 'id',
      defaultExpandedIds: ['eng', 'design']
    });
    const {
      selectionConfig
    } = useTableSelectionState<OrgRow>({
      data: visibleData,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const tree = useTableTreeData(treeConfig);
    const selection = useTableSelection(selectionConfig);
    return <Table data={visibleData} columns={columns} idKey="id" hasHover plugins={{
      tree,
      selection
    }} />;
  }
}`,...w.parameters?.docs?.source},description:{story:"Composed with selection. The canonical plugin order puts `tree` before\n`selection`, so the checkbox column lands to the left of the indented\ntree column, and selection operates on the visible (flattened) rows.",...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      sortConfig,
      applySort
    } = useTableSortableState<OrgRow>({
      data: orgChart,
      defaultSort: [{
        sortKey: 'headcount',
        direction: 'descending'
      }]
    });
    const {
      visibleData,
      treeConfig
    } = useTableTreeState<OrgRow>({
      data: orgChart,
      idKey: 'id',
      defaultExpandedIds: ['eng', 'eng-platform'],
      sortSiblings: applySort
    });
    const tree = useTableTreeData(treeConfig);
    // T can't be inferred from the sort config (it only carries the sort key).
    const sort = useTableSortable<OrgRow>(sortConfig);
    return <Table data={visibleData} columns={sortableColumns} idKey="id" hasHover plugins={{
      sort,
      tree
    }} />;
  }
}`,...T.parameters?.docs?.source},description:{story:"Composed with sorting. `applySort` is passed as `sortSiblings`, so each\nsibling group sorts independently — children always stay directly under\ntheir parent and levels never interleave. Sort by Group or Headcount.",...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [data, setData] = useState<OrgRow[]>([{
      id: 'remote',
      name: 'Remote team',
      title: 'Director',
      team: '—',
      headcount: 9
    }]);
    const [loadingIds, setLoadingIds] = useState<Set<string>>(() => new Set());
    const {
      visibleData,
      treeConfig
    } = useTableTreeState<OrgRow>({
      data,
      idKey: 'id',
      // Expandable before children exist.
      isItemExpandable: item => item.id === 'remote',
      onExpandedIdsChange: ids => {
        if (!ids.has('remote') || data[0].children) {
          return;
        }
        setLoadingIds(new Set(['remote']));
        window.setTimeout(() => {
          setData([{
            ...data[0],
            children: [{
              id: 'remote-emea',
              name: 'EMEA',
              title: 'Manager',
              team: 'Remote team',
              headcount: 5
            }, {
              id: 'remote-apac',
              name: 'APAC',
              title: 'Manager',
              team: 'Remote team',
              headcount: 4
            }]
          }]);
          setLoadingIds(new Set());
        }, 600);
      }
    });
    const tree = useTableTreeData(treeConfig);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
        <Table data={visibleData} columns={columns} idKey="id" hasHover plugins={{
        tree
      }} />
        {loadingIds.size > 0 && <p>Loading children…</p>}
      </div>;
  }
}`,...E.parameters?.docs?.source},description:{story:"Lazy loading. `isItemExpandable` shows an expander before the children\nexist; `onExpandedIdsChange` triggers the fetch, and the rows appear when\nthe data arrives.",...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const flat: OrgRow[] = [{
      id: 'a',
      name: 'Engineering',
      title: 'VP Engineering',
      team: '—',
      headcount: 48
    }, {
      id: 'b',
      name: 'Design',
      title: 'VP Design',
      team: '—',
      headcount: 11
    }, {
      id: 'c',
      name: 'Operations',
      title: 'VP Operations',
      team: '—',
      headcount: 6
    }];
    const {
      visibleData,
      treeConfig
    } = useTableTreeState<OrgRow>({
      data: flat,
      idKey: 'id'
    });
    const tree = useTableTreeData(treeConfig);
    return <Table data={visibleData} columns={columns} idKey="id" hasHover plugins={{
      tree
    }} />;
  }
}`,...D.parameters?.docs?.source},description:{story:`Migration case: the same plugin on flat data (no \`children\` anywhere) is a
no-op — no expanders, no indent spacers, no tree ARIA. Adopting the plugin
before the data becomes hierarchical changes nothing.`,...D.parameters?.docs?.description}}},O=[`Default`,`ExpandAndCollapseAll`,`IndentSizes`,`WithSelection`,`WithSiblingSorting`,`LazyLoadedChildren`,`FlatDataIsANoOp`]}))();export{x as Default,S as ExpandAndCollapseAll,D as FlatDataIsANoOp,C as IndentSizes,E as LazyLoadedChildren,w as WithSelection,T as WithSiblingSorting,O as __namedExportsOrder,b as default};