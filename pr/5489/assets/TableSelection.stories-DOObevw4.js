import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-JsegAPMn.js";import{t as a}from"./Button-lJKVtWko.js";import{t as o}from"./Table-C5Si53f3.js";import{St as s,cn as c,ln as l,on as u}from"./iframe-BVFSxNtI.js";function d({layout:e,selection:t}){return(0,m.jsx)(l,{selection:t,"data-layout":e,xstyle:e===`floating`?A.floatingToolbar:void 0,startContent:e===`floating`?(0,m.jsx)(i,{label:`Approve`,variant:`ghost`,onClick:()=>{}}):(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(i,{label:`Export`,variant:`ghost`,onClick:()=>{}}),(0,m.jsx)(i,{label:`Delete`,variant:`ghost`,onClick:t.clearSelection})]})})}function f({layout:e}){let t=e===`floating`?k:y,[n,r]=(0,p.useState)(new Set),{selectionConfig:i,selectionState:a}=u({data:t,idKey:`id`,selectedKeys:n,setSelectedKeys:r}),s=c(i);return(0,m.jsxs)(`div`,{role:e===`floating`?`region`:void 0,"aria-label":e===`floating`?`Bulk actions example`:void 0,tabIndex:e===`floating`?0:void 0,...{0:{className:`xrlsmeg xvueqy4`},1:{className:`xrlsmeg xvueqy4 x159tps6 x1odjw0f xish69e x185mbhu`}}[(e===`floating`)<<0],children:[e===`floating`?(0,m.jsx)(`div`,{className:`xrvj5dj x185a7wo xjcht0a x4d5cxa`,role:`region`,"aria-label":`Metrics`,children:[[`Active users`,`12,840`],[`Selection rate`,`18.4%`],[`Pending reviews`,`247`]].map(([e,t])=>(0,m.jsxs)(`div`,{className:`x1shk3sm x1hviunn xwmxj5m`,children:[(0,m.jsx)(`span`,{className:`x1lliihq xv1l7n4`,children:e}),(0,m.jsx)(`strong`,{className:`x1lliihq xcsaf9d x1tgivj0`,children:t})]},e))}):null,(0,m.jsxs)(`div`,{"data-table-region":e,...{0:{className:`x1n2onr6`},1:{className:`x1n2onr6 x3kwlty`}}[(e===`floating`)<<0],children:[(0,m.jsx)(d,{layout:e,selection:a}),(0,m.jsx)(o,{data:t,columns:b,idKey:`id`,hasHover:!0,plugins:{selection:s}})]})]})}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;e((()=>{p=t(n()),a(),s(),m=r(),{expect:h,userEvent:g,waitFor:_,within:v}=__STORYBOOK_MODULE_TEST__,y=[{id:`1`,name:`Alice`,email:`alice@example.com`,role:`Engineer`,isLocked:!1},{id:`2`,name:`Bob`,email:`bob@example.com`,role:`Designer`,isLocked:!1},{id:`3`,name:`Charlie`,email:`charlie@example.com`,role:`Manager`,isLocked:!1},{id:`4`,name:`Diana`,email:`diana@example.com`,role:`Engineer`,isLocked:!0},{id:`5`,name:`Eve`,email:`eve@example.com`,role:`Admin`,isLocked:!1}],b=[{key:`name`,header:`Name`},{key:`email`,header:`Email`},{key:`role`,header:`Role`}],x={title:`Core/TableSelection`,tags:[`autodocs`]},S={render:()=>{let[e,t]=(0,p.useState)(new Set),{selectionConfig:n}=u({data:y,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=c(n);return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`var(--color-text-secondary)`},children:[`Selected: `,e.size,` of `,y.length]}),(0,m.jsx)(o,{data:y,columns:b,idKey:`id`,plugins:{selection:r}})]})}},C={render:()=>{let[e,t]=(0,p.useState)(new Set([`1`,`3`])),{selectionConfig:n}=u({data:y,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=c(n);return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`var(--color-text-secondary)`},children:[`Selected: `,[...e].join(`, `)||`none`]}),(0,m.jsx)(o,{data:y,columns:b,idKey:`id`,plugins:{selection:r}})]})}},w={render:()=>{let[e,t]=(0,p.useState)(new Set),{selectionConfig:n}=u({data:y,idKey:`id`,selectedKeys:e,setSelectedKeys:t,getIsItemSelectable:e=>e.role!==`Admin`}),r=c(n);return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`var(--color-text-secondary)`},children:[`Admin rows have no checkbox. Selected: `,e.size]}),(0,m.jsx)(o,{data:y,columns:b,idKey:`id`,plugins:{selection:r}})]})}},T={render:()=>{let[e,t]=(0,p.useState)(new Set),{selectionConfig:n}=u({data:y,idKey:`id`,selectedKeys:e,setSelectedKeys:t,getIsItemEnabled:e=>!e.isLocked}),r=c(n);return(0,m.jsxs)(`div`,{style:{maxWidth:600},children:[(0,m.jsxs)(`p`,{style:{marginBottom:8,fontSize:14,color:`var(--color-text-secondary)`},children:[`Locked rows (Diana) have a disabled checkbox. Select-all skips them. Selected: `,e.size]}),(0,m.jsx)(o,{data:y,columns:b,idKey:`id`,plugins:{selection:r}})]})}},E={render:()=>{let[e,t]=(0,p.useState)(new Set),{selectionConfig:n}=u({data:y,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=c(n);return(0,m.jsx)(`div`,{style:{maxWidth:600},children:(0,m.jsx)(o,{data:y,columns:b,idKey:`id`,density:`compact`,plugins:{selection:r}})})}},D={render:()=>{let[e,t]=(0,p.useState)(new Set),{selectionConfig:n}=u({data:y,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=c(n);return(0,m.jsx)(`div`,{style:{maxWidth:600},children:(0,m.jsx)(o,{data:y,columns:b,idKey:`id`,density:`spacious`,hasHover:!0,plugins:{selection:r}})})}},O={render:()=>{let[e,t]=(0,p.useState)(new Set),{selectionConfig:n}=u({data:y,idKey:`id`,selectedKeys:e,setSelectedKeys:t}),r=c(n);return(0,m.jsx)(`div`,{style:{maxWidth:600},children:(0,m.jsx)(o,{data:y,columns:b,idKey:`id`,isStriped:!0,plugins:{selection:r}})})}},k=Array.from({length:40},(e,t)=>{let n=y[t%y.length];return{...n,id:`long-${t+1}`,name:`${n.name} ${t+1}`}}),A={floatingToolbar:{kVAEAm:`x7wzq59`,k87sOh:`x1dljrx`,k3aq6I:`x17h9703`,k1K539:`xfrzm14`,kY2c9j:`x1355qak`,kaIpWk:`xh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kGVxlE:`x14hfi27`,$$css:!0}},j={render:()=>(0,m.jsx)(f,{layout:`fixed`}),play:async({canvasElement:e})=>{let t=v(e);await g.click(t.getAllByLabelText(`Select row`)[0]);let n=t.getByRole(`toolbar`,{name:`Bulk actions`}),r=n.closest(`.astryx-section`);await h(n).toHaveAttribute(`data-layout`,`fixed`),await h(n).toHaveAttribute(`data-size`,`sm`),await h(r).toHaveAttribute(`data-variant`,`muted`),await h(n.closest(`[role="group"]`)).toBeNull(),await h(t.getByText(`1 selected`)).toBeInTheDocument(),await g.click(t.getByRole(`button`,{name:`Unselect All`})),await h(t.queryByRole(`toolbar`,{name:`Bulk actions`})).not.toBeInTheDocument(),await g.click(t.getAllByLabelText(`Select row`)[0])}},M={render:()=>(0,m.jsx)(f,{layout:`floating`}),play:async({canvasElement:e})=>{let t=v(e),n=t.getByRole(`region`,{name:`Bulk actions example`}),r=t.getByRole(`table`),i=r.getBoundingClientRect().top;await h(n.scrollHeight).toBeGreaterThan(n.clientHeight),await g.click(t.getAllByLabelText(`Select row`)[0]);let a=t.getByRole(`toolbar`,{name:`Bulk actions`}),o=a.closest(`.astryx-section`);if(o==null)throw Error(`Expected the Toolbar surface`);await h(a).toHaveAttribute(`data-layout`,`floating`),await h(a).toHaveAttribute(`data-size`,`sm`),await h(o).toHaveAttribute(`data-variant`,`muted`),await h(a.closest(`[role="group"]`)).toBeNull(),await h(Math.abs(r.getBoundingClientRect().top-i)).toBeLessThanOrEqual(1),n.scrollTop=300,n.dispatchEvent(new Event(`scroll`)),await _(()=>{h(Math.round(o.getBoundingClientRect().top-n.getBoundingClientRect().top)).toBe(16)}),n.scrollTop=0}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: 'var(--color-text-secondary)'
      }}>
          Selected: {selectedKeys.size} of {users.length}
        </p>
        <Table data={users} columns={columns} idKey="id" plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(['1', '3']));
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: 'var(--color-text-secondary)'
      }}>
          Selected: {[...selectedKeys].join(', ') || 'none'}
        </p>
        <Table data={users} columns={columns} idKey="id" plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
      getIsItemSelectable: item => item.role !== 'Admin'
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: 'var(--color-text-secondary)'
      }}>
          Admin rows have no checkbox. Selected: {selectedKeys.size}
        </p>
        <Table data={users} columns={columns} idKey="id" plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys,
      getIsItemEnabled: item => !item.isLocked
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <p style={{
        marginBottom: 8,
        fontSize: 14,
        color: 'var(--color-text-secondary)'
      }}>
          Locked rows (Diana) have a disabled checkbox. Select-all skips them.
          Selected: {selectedKeys.size}
        </p>
        <Table data={users} columns={columns} idKey="id" plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <Table data={users} columns={columns} idKey="id" density="compact" plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <Table data={users} columns={columns} idKey="id" density="spacious" hasHover plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const {
      selectionConfig
    } = useTableSelectionState<User>({
      data: users,
      idKey: 'id',
      selectedKeys,
      setSelectedKeys
    });
    const selectionPlugin = useTableSelection<User>(selectionConfig);
    return <div style={{
      maxWidth: 600
    }}>
        <Table data={users} columns={columns} idKey="id" isStriped plugins={{
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...O.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <BulkActionsExample layout="fixed" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByLabelText('Select row')[0]);
    const toolbar = canvas.getByRole('toolbar', {
      name: 'Bulk actions'
    });
    const toolbarSurface = toolbar.closest('.astryx-section');
    await expect(toolbar).toHaveAttribute('data-layout', 'fixed');
    await expect(toolbar).toHaveAttribute('data-size', 'sm');
    await expect(toolbarSurface).toHaveAttribute('data-variant', 'muted');
    await expect(toolbar.closest('[role="group"]')).toBeNull();
    await expect(canvas.getByText('1 selected')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Unselect All'
    }));
    await expect(canvas.queryByRole('toolbar', {
      name: 'Bulk actions'
    })).not.toBeInTheDocument();

    // Leave the story ready for manual review.
    await userEvent.click(canvas.getAllByLabelText('Select row')[0]);
  }
}`,...j.parameters?.docs?.source},description:{story:`Product-composed in-flow bar. Actions lead; selection status and clear trail.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <BulkActionsExample layout="floating" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const scrollRegion = canvas.getByRole('region', {
      name: 'Bulk actions example'
    });
    const table = canvas.getByRole('table');
    const tableTopBeforeSelection = table.getBoundingClientRect().top;
    await expect(scrollRegion.scrollHeight).toBeGreaterThan(scrollRegion.clientHeight);
    await userEvent.click(canvas.getAllByLabelText('Select row')[0]);
    const toolbar = canvas.getByRole('toolbar', {
      name: 'Bulk actions'
    });
    const toolbarSurface = toolbar.closest<HTMLElement>('.astryx-section');
    if (toolbarSurface == null) {
      throw new Error('Expected the Toolbar surface');
    }
    await expect(toolbar).toHaveAttribute('data-layout', 'floating');
    await expect(toolbar).toHaveAttribute('data-size', 'sm');
    await expect(toolbarSurface).toHaveAttribute('data-variant', 'muted');
    await expect(toolbar.closest('[role="group"]')).toBeNull();
    await expect(Math.abs(table.getBoundingClientRect().top - tableTopBeforeSelection)).toBeLessThanOrEqual(1);
    scrollRegion.scrollTop = 300;
    scrollRegion.dispatchEvent(new Event('scroll'));
    await waitFor(() => {
      expect(Math.round(toolbarSurface.getBoundingClientRect().top - scrollRegion.getBoundingClientRect().top)).toBe(16);
    });
    scrollRegion.scrollTop = 0;
  }
}`,...M.parameters?.docs?.source},description:{story:`Product-composed floating bar for a long, non-sticky table below metrics.
The example owns a capped scrollport; the toolbar stays 16px from that
scrollport and releases at the table region's block-end boundary.`,...M.parameters?.docs?.description}}},N=[`Default`,`WithPreselection`,`NonSelectableRows`,`DisabledRows`,`Compact`,`Spacious`,`WithStripedRows`,`BulkActions`,`BulkActionsFloating`]}))();export{j as BulkActions,M as BulkActionsFloating,E as Compact,S as Default,T as DisabledRows,w as NonSelectableRows,D as Spacious,C as WithPreselection,O as WithStripedRows,N as __namedExportsOrder,x as default};