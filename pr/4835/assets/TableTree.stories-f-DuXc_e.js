import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeRefs-CPqjs56a.js";import{n as a,t as o}from"./rtlStyles-Dba7YIbF.js";import{t as s}from"./jsx-runtime-DeHZSEgm.js";import{c,h as l}from"./tokens.stylex-C15xwlpu.js";import{n as u,t as d}from"./useTranslator-BMnme3me.js";import{n as f,t as p}from"./Icon-C24cO4CC.js";import{a as m,i as ee,r as h}from"./columnUtils-BDDG7zo5.js";import{n as g,t as _}from"./Table-ClbWztQk.js";import{i as v,n as y,r as b,t as x}from"./useTableSelectionState-BSKEXSen.js";import{i as S,n as C,r as w,t as T}from"./useTableSortableState-CHVlCziu.js";function E(e){let t=new Set;return{subscribe(e){return t.add(e),()=>t.delete(e)},notify(){for(let e of t)e()},getConfig(){return e.current}}}function D(e,t){let n=e.getRowMeta(t);return n?n.level*16+N[e.indent??`md`]*4+(n.hasChildren?2:0)+ +!!n.isExpanded:-1}function O(e,t){let n=(0,A.useCallback)(()=>D(e.getConfig(),t),[e,t]);return(0,A.useSyncExternalStore)(e.subscribe,n,n)}function te(e,t){if(!t){e.removeAttribute(`aria-level`),e.removeAttribute(`aria-expanded`);return}e.setAttribute(`aria-level`,String(t.level+1)),t.hasChildren?e.setAttribute(`aria-expanded`,String(t.isExpanded)):e.removeAttribute(`aria-expanded`)}function ne({isExpanded:e,onToggle:t}){let r=u();return(0,j.jsx)(`button`,{type:`button`,className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryxvy4d1p astryxxk0z11 astryx1md70p1 astryx1gs6z28 astryxx3sua9 astryx1ypdohk astryxv9yike astryx1gbuem2 astryxx6bhzk astryx1717udv astryx2lah0s astryx1ilzqfv astryx1cqbx0l`,onClick:e=>{e.stopPropagation(),t()},"aria-label":r(e?`@astryx.tableTree.collapseRow`:`@astryx.tableTree.expandRow`),"aria-expanded":e,children:(0,j.jsx)(`span`,{...n(a.mirror),children:(0,j.jsx)(`span`,{...{0:{className:`astryx3nfvp2 astryx11xpdln astryxx6bhzk astryx7p49u4`},1:{className:`astryx3nfvp2 astryx11xpdln astryxx6bhzk astryx1iffjtl`}}[!!e<<0],children:(0,j.jsx)(p,{icon:`chevronRight`,size:`xsm`})})})})}function re({isAllExpanded:e,onExpandAll:t,onCollapseAll:r}){let i=u(),o=e===!0;return(0,j.jsx)(`button`,{type:`button`,className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryxvy4d1p astryxxk0z11 astryx1md70p1 astryx1gs6z28 astryxx3sua9 astryx1ypdohk astryxv9yike astryx1gbuem2 astryxx6bhzk astryx1717udv astryx2lah0s astryx1ilzqfv astryx1cqbx0l`,onClick:e=>{e.stopPropagation(),o?r():t()},"aria-label":i(o?`@astryx.tableTree.collapseAllRows`:`@astryx.tableTree.expandAllRows`),"aria-expanded":o,children:(0,j.jsx)(`span`,{...n(a.mirror),children:(0,j.jsx)(`span`,{...{0:{className:`astryx3nfvp2 astryx11xpdln astryxx6bhzk astryx7p49u4`},1:{className:`astryx3nfvp2 astryx11xpdln astryxx6bhzk astryx1iffjtl`}}[!!o<<0],children:(0,j.jsx)(p,{icon:`chevronRight`,size:`xsm`})})})})}function ie({item:e,children:t}){let n=(0,A.use)(M);return n?(0,j.jsx)(ae,{store:n,item:e,children:t}):(0,j.jsx)(j.Fragment,{children:t})}function ae({store:e,item:t,children:r}){O(e,t);let i=e.getConfig(),a=i.getRowMeta(t);if(!a)return(0,j.jsx)(j.Fragment,{children:r});let o=P[i.indent??`md`],s=`calc(${a.level} * ${o})`;return(0,j.jsxs)(`div`,{...n(I.cell,a.level>0&&I.indent(s)),children:[a.hasChildren?(0,j.jsx)(ne,{isExpanded:a.isExpanded,onToggle:()=>e.getConfig().onToggleItem(t)}):(0,j.jsx)(`span`,{className:`astryx1rg5ohu astryxvy4d1p astryxxk0z11 astryx2lah0s`}),r]})}function k(e){let t=(0,A.useRef)(e);t.current=e;let n=(0,A.useRef)(null);n.current??=E(t);let r=n.current;(0,A.useEffect)(()=>{r.notify()});let a=(0,A.useRef)(null),o=(0,A.useRef)(void 0);return(0,A.useMemo)(()=>{let e=(e,t,n)=>{let r=a.current;if(!r||r.treeKey!==t||r.wrapped!==n)return null;let i=r.input;if(i!==e){if(i.length!==e.length)return null;for(let t=0;t<i.length;t++)if(i[t]!==e[t])return null}return r.output};return{transformTableContext(e){return(0,j.jsx)(M,{value:r,children:e})},transformColumns(t){let{hasExpandableRows:n,treeColumnKey:i}=r.getConfig(),s=i!=null&&t.some(e=>e.key===i)?i:t.find(e=>!e.key.startsWith(`__`))?.key??t[0]?.key;o.current=s;let c=n,l=e(t,s,c);if(l)return l;let u=c?t.map(e=>{if(e.key!==s)return e;let t=e.renderCell;return{...e,renderCell:n=>(0,j.jsx)(ie,{item:n,children:t?t(n):String(n[e.key]??``)})}}):t;return a.current={input:t,treeKey:s,wrapped:c,output:u},u},transformHeaderCell(e,t){let{hasExpandableRows:n,hasExpandAllControl:i,isAllExpanded:a,onExpandAll:s,onCollapseAll:c}=r.getConfig();return!i||!n||t.key!==o.current||a===void 0||!s||!c?e:{...e,content:(0,j.jsxs)(`span`,{className:`astryx3nfvp2 astryx6s0dn4 astryxzye2dw astryxeuugli`,children:[(0,j.jsx)(re,{isAllExpanded:a,onExpandAll:s,onCollapseAll:c}),e.content]})}},transformBodyRow(e,t){let n=e=>{if(!e)return;let n=()=>{let n=r.getConfig();te(e,n.hasExpandableRows?n.getRowMeta(t):void 0)};n();let i=r.subscribe(n);return()=>{i()}},a={...e,ref:e.ref?i(e.ref,n):n},o=r.getConfig();return o.hasRowClickExpansion===!0&&o.hasExpandableRows&&o.getRowMeta(t)?.hasChildren===!0?{...a,htmlProps:{...a.htmlProps,onClick:e=>{e.target.closest(`button, a, input, select, textarea, [role="button"], [role="checkbox"], [contenteditable="true"]`)||(window.getSelection()?.toString()??``)===``&&o.onToggleItem(t)}},xstyle:[...a.xstyle,I.clickableRow]}:a}}},[r])}var A,j,M,N,P,F,I;function oe(){return(oe=e((()=>{A=t(),r(),c(),f(),o(),d(),j=s(),M=(0,A.createContext)(null),M.displayName=`TreeStoreContext`,N={sm:0,md:1,lg:2},P={sm:l[`--spacing-3`],md:l[`--spacing-4`],lg:l[`--spacing-6`]},F={kE3dHu:``,kpe85a:``,$$css:!0},I={cell:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryxzye2dw`,$$css:!0},indent:e=>[F,{kZCmMZ:e==null?e:`astryxnvo3vl`,$$css:!0},{"--x-paddingInlineStart":(e=>typeof e==`number`?e+`px`:e??void 0)(e)}],clickableRow:{kkrTdU:`astryx1ypdohk`,$$css:!0}}})))()}function L(e){let{data:t,idKey:n,childrenKey:r=`children`,defaultExpandedIds:i,expandedIds:a,onExpandedIdsChange:o,isItemExpandable:s,sortSiblings:c,indent:l,treeColumnKey:u}=e,d=(0,R.useCallback)(e=>String(typeof n==`function`?n(e):e[n]),[n]),f=(0,R.useCallback)(e=>{let t=e[r];return Array.isArray(t)?t:[]},[r]),p=(0,R.useCallback)(e=>s?s(e):f(e).length>0,[s,f]),[m,ee]=(0,R.useState)(()=>new Set(i)),h=a!==void 0,g=h?a:m,_=(0,R.useRef)(g);_.current=g;let v=(0,R.useRef)(o);v.current=o;let y=(0,R.useCallback)(e=>{_.current=e,h||ee(e),v.current?.(e)},[h]),{visibleData:b,metaMap:x}=(0,R.useMemo)(()=>{let e=[],n=new Map,r=new Set,i=(t,a)=>{let o=c?c([...t]):t;for(let t of o){let o=d(t);if(r.has(o))continue;let s=p(t),c=s&&g.has(o);e.push(t),n.set(o,{id:o,level:a,hasChildren:s,isExpanded:c}),c&&(r.add(o),i(f(t),a+1),r.delete(o))}};return i(t,0),{visibleData:e,metaMap:n}},[t,g,d,f,p,c]),S=(0,R.useMemo)(()=>{let e=[],n=new Set,r=t=>{for(let i of t){let t=d(i);n.has(t)||(p(i)&&e.push(t),n.add(t),r(f(i)),n.delete(t))}};return r(t),e},[t,d,f,p]),C=S.length>0,w=(0,R.useMemo)(()=>{if(!C)return!1;let e=S.filter(e=>g.has(e)).length;return e===0?!1:e===S.length||`indeterminate`},[C,S,g]),T=(0,R.useCallback)(e=>{let t=d(e),n=new Set(_.current);n.has(t)?n.delete(t):n.add(t),y(n)},[d,y]),E=(0,R.useCallback)(()=>{y(new Set(S))},[y,S]),D=(0,R.useCallback)(()=>{y(new Set)},[y]),O=(0,R.useCallback)(e=>x.get(d(e)),[x,d]);return{visibleData:b,treeConfig:(0,R.useMemo)(()=>({getRowMeta:O,onToggleItem:T,hasExpandableRows:C,isAllExpanded:w,onExpandAll:E,onCollapseAll:D,indent:l,treeColumnKey:u}),[O,T,C,w,E,D,l,u]),expandedIds:g,isAllExpanded:w,expandAll:E,collapseAll:D}}var R;function se(){return(se=e((()=>{R=t()})))()}function ce({indent:e}){let{visibleData:t,treeConfig:n}=L({data:V,idKey:`id`,indent:e,defaultExpandedIds:[`eng`,`eng-platform`,`eng-platform-core`]}),r=k(n);return(0,B.jsxs)(`div`,{children:[(0,B.jsxs)(`p`,{style:{marginBlockEnd:8,fontWeight:600},children:[`indent="`,e,`"`]}),(0,B.jsx)(_,{data:t,columns:H,idKey:`id`,plugins:{tree:r}})]})}var z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,le;function ue(){return(ue=e((()=>{z=t(),g(),oe(),se(),b(),x(),w(),T(),h(),B=s(),V=[{id:`eng`,name:`Engineering`,title:`VP Engineering`,team:`Engineering`,headcount:48,children:[{id:`eng-platform`,name:`Platform`,title:`Director`,team:`Engineering`,headcount:22,children:[{id:`eng-platform-core`,name:`Core Services`,title:`Manager`,team:`Platform`,headcount:12,children:[{id:`eng-platform-core-api`,name:`API Gateway`,title:`Tech Lead`,team:`Core Services`,headcount:5},{id:`eng-platform-core-data`,name:`Data Pipeline`,title:`Tech Lead`,team:`Core Services`,headcount:7}]},{id:`eng-platform-infra`,name:`Infrastructure`,title:`Manager`,team:`Platform`,headcount:10}]},{id:`eng-product`,name:`Product Engineering`,title:`Director`,team:`Engineering`,headcount:26,children:[{id:`eng-product-web`,name:`Web`,title:`Manager`,team:`Product Engineering`,headcount:14},{id:`eng-product-mobile`,name:`Mobile`,title:`Manager`,team:`Product Engineering`,headcount:12}]}]},{id:`design`,name:`Design`,title:`VP Design`,team:`Design`,headcount:11,children:[{id:`design-systems`,name:`Design Systems`,title:`Manager`,team:`Design`,headcount:4},{id:`design-research`,name:`Research`,title:`Manager`,team:`Design`,headcount:7}]},{id:`ops`,name:`Operations`,title:`VP Operations`,team:`Operations`,headcount:6}],H=[{key:`name`,header:`Group`,width:m(2)},{key:`title`,header:`Lead`,width:m(1)},{key:`team`,header:`Parent team`,width:m(1)},{key:`headcount`,header:`Headcount`,width:ee(110),align:`end`}],U=H.map(e=>e.key===`name`||e.key===`headcount`?{...e,sortable:!0,sortKey:e.key}:e),W={title:`Core/TableTree`,tags:[`autodocs`]},G={render:()=>{let{visibleData:e,treeConfig:t}=L({data:V,idKey:`id`,defaultExpandedIds:[`eng`]}),n=k(t);return(0,B.jsx)(_,{data:e,columns:H,idKey:`id`,hasHover:!0,plugins:{tree:n}})}},K={render:()=>{let{visibleData:e,treeConfig:t,expandAll:n,collapseAll:r}=L({data:V,idKey:`id`,defaultExpandedIds:[`eng`,`eng-platform`,`eng-platform-core`]}),i=k(t);return(0,B.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,B.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,B.jsx)(`button`,{type:`button`,onClick:n,children:`Expand all`}),(0,B.jsx)(`button`,{type:`button`,onClick:r,children:`Collapse all`})]}),(0,B.jsx)(_,{data:e,columns:H,idKey:`id`,hasHover:!0,plugins:{tree:i}})]})}},q={render:()=>{let{visibleData:e,treeConfig:t}=L({data:V,idKey:`id`,defaultExpandedIds:[`eng`]}),n=k({...t,hasExpandAllControl:!0});return(0,B.jsx)(_,{data:e,columns:H,idKey:`id`,hasHover:!0,plugins:{tree:n}})}},J={render:()=>{let{visibleData:e,treeConfig:t}=L({data:V,idKey:`id`,defaultExpandedIds:[`eng`]}),n=k({...t,hasRowClickExpansion:!0});return(0,B.jsx)(_,{data:e,columns:H,idKey:`id`,hasHover:!0,plugins:{tree:n}})}},Y={render:()=>(0,B.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:32},children:[`sm`,`md`,`lg`].map(e=>(0,B.jsx)(ce,{indent:e},e))})},X={render:()=>{let[e,t]=(0,z.useState)(()=>new Set([`design-systems`])),{visibleData:n,treeConfig:r}=L({data:V,idKey:`id`,defaultExpandedIds:[`eng`,`design`]}),{selectionConfig:i}=y({data:n,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),a=k(r),o=v(i);return(0,B.jsx)(_,{data:n,columns:H,idKey:`id`,hasHover:!0,plugins:{tree:a,selection:o}})}},Z={render:()=>{let{sortConfig:e,applySort:t}=C({data:V,defaultSort:[{sortKey:`headcount`,direction:`descending`}]}),{visibleData:n,treeConfig:r}=L({data:V,idKey:`id`,defaultExpandedIds:[`eng`,`eng-platform`],sortSiblings:t}),i=k(r),a=S(e);return(0,B.jsx)(_,{data:n,columns:U,idKey:`id`,hasHover:!0,plugins:{sort:a,tree:i}})}},Q={render:()=>{let[e,t]=(0,z.useState)([{id:`remote`,name:`Remote team`,title:`Director`,team:`—`,headcount:9}]),[n,r]=(0,z.useState)(()=>new Set),{visibleData:i,treeConfig:a}=L({data:e,idKey:`id`,isItemExpandable:e=>e.id===`remote`,onExpandedIdsChange:n=>{!n.has(`remote`)||e[0].children||(r(new Set([`remote`])),window.setTimeout(()=>{t([{...e[0],children:[{id:`remote-emea`,name:`EMEA`,title:`Manager`,team:`Remote team`,headcount:5},{id:`remote-apac`,name:`APAC`,title:`Manager`,team:`Remote team`,headcount:4}]}]),r(new Set)},600))}}),o=k(a);return(0,B.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:8},children:[(0,B.jsx)(_,{data:i,columns:H,idKey:`id`,hasHover:!0,plugins:{tree:o}}),n.size>0&&(0,B.jsx)(`p`,{children:`Loading children…`})]})}},$={render:()=>{let{visibleData:e,treeConfig:t}=L({data:[{id:`a`,name:`Engineering`,title:`VP Engineering`,team:`—`,headcount:48},{id:`b`,name:`Design`,title:`VP Design`,team:`—`,headcount:11},{id:`c`,name:`Operations`,title:`VP Operations`,team:`—`,headcount:6}],idKey:`id`}),n=k(t);return(0,B.jsx)(_,{data:e,columns:H,idKey:`id`,hasHover:!0,plugins:{tree:n}})}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source},description:{story:"Hierarchical records rendered as a table. `useTableTreeState` flattens the\nnested data into the visible rows and owns the expanded set;\n`useTableTreeData` draws the indent + expander in the first column.\n\nCollapsed branches are unmounted, not hidden — the `<tbody>` holds exactly\nthe visible rows.",...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source},description:{story:"`expandAll` / `collapseAll` from the state hook, driving a deep hierarchy.\nIndentation is `calc(level * token)` — there is no depth cap.",...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      visibleData,
      treeConfig
    } = useTableTreeState<OrgRow>({
      data: orgChart,
      idKey: 'id',
      defaultExpandedIds: ['eng']
    });
    const tree = useTableTreeData({
      ...treeConfig,
      hasExpandAllControl: true
    });
    return <Table data={visibleData} columns={columns} idKey="id" hasHover plugins={{
      tree
    }} />;
  }
}`,...q.parameters?.docs?.source},description:{story:"`hasExpandAllControl` renders a built-in expand-all/collapse-all toggle in\nthe tree column header, wired to the state hook. No external buttons needed:\nthe toggle reads the aggregate `isAllExpanded` state (down chevron only when\nevery expandable row is expanded) and calls `expandAll`/`collapseAll`.",...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      visibleData,
      treeConfig
    } = useTableTreeState<OrgRow>({
      data: orgChart,
      idKey: 'id',
      defaultExpandedIds: ['eng']
    });
    const tree = useTableTreeData({
      ...treeConfig,
      hasRowClickExpansion: true
    });
    return <Table data={visibleData} columns={columns} idKey="id" hasHover plugins={{
      tree
    }} />;
  }
}`,...J.parameters?.docs?.source},description:{story:`\`hasRowClickExpansion\` lets a click anywhere on an expandable row toggle it,
in addition to the chevron. Leaf rows stay inert, and the chevron still works
on its own (it stops propagation, so a chevron click never double-toggles).`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source},description:{story:"The `indent` token controls the step per level: `sm` (spacing-3), `md`\n(spacing-4, the default), and `lg` (spacing-6).",...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
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
}`,...X.parameters?.docs?.source},description:{story:"Composed with selection. The canonical plugin order puts `tree` before\n`selection`, so the checkbox column lands to the left of the indented\ntree column, and selection operates on the visible (flattened) rows.",...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source},description:{story:"Composed with sorting. `applySort` is passed as `sortSiblings`, so each\nsibling group sorts independently — children always stay directly under\ntheir parent and levels never interleave. Sort by Group or Headcount.",...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
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
}`,...Q.parameters?.docs?.source},description:{story:"Lazy loading. `isItemExpandable` shows an expander before the children\nexist; `onExpandedIdsChange` triggers the fetch, and the rows appear when\nthe data arrives.",...Q.parameters?.docs?.description}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source},description:{story:`Migration case: the same plugin on flat data (no \`children\` anywhere) is a
no-op — no expanders, no indent spacers, no tree ARIA. Adopting the plugin
before the data becomes hierarchical changes nothing.`,...$.parameters?.docs?.description}}},le=[`Default`,`ExpandAndCollapseAll`,`HeaderExpandAllControl`,`RowClickExpansion`,`IndentSizes`,`WithSelection`,`WithSiblingSorting`,`LazyLoadedChildren`,`FlatDataIsANoOp`]})))()}ue();export{G as Default,K as ExpandAndCollapseAll,$ as FlatDataIsANoOp,q as HeaderExpandAllControl,Y as IndentSizes,Q as LazyLoadedChildren,J as RowClickExpansion,X as WithSelection,Z as WithSiblingSorting,le as __namedExportsOrder,W as default};