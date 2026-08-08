import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./Button-BVMvoKVE.js";import{n as s,t as c}from"./Table-ClbWztQk.js";import{n as l,t as u}from"./MultiSelector-BmMbiZNG.js";import{i as d,n as f,r as p,t as m}from"./useTableSelectionState-BSKEXSen.js";import{n as h,t as g}from"./Toolbar-Cbo7TghG.js";function _(e){let t=(0,v.useRef)(e);return t.current=e,(0,v.useMemo)(()=>({transformColumns(e){let n=t.current,r=new Set(n.activeColumnKeys),i=new Map(n.activeColumnKeys.map((e,t)=>[e,t]));return e.filter(e=>r.has(e.key)).sort((e,t)=>(i.get(e.key)??1/0)-(i.get(t.key)??1/0))}}),[])}var v;function y(){return(y=e((()=>{v=t()})))()}function b(e){let{columns:t,activeColumnKeys:n}=e,r=(0,x.useRef)(e);r.current=e;let i=(0,x.useMemo)(()=>new Set(n),[n]),a=(0,x.useMemo)(()=>new Set(t.filter(e=>e.isAlwaysVisible).map(e=>e.key)),[t]);return{columnSettingsConfig:e,activeColumnKeys:n,toggleColumn:(0,x.useCallback)(e=>{let t=r.current;if(new Set(t.columns.filter(e=>e.isAlwaysVisible).map(e=>e.key)).has(e))return;let n=t.activeColumnKeys;new Set(n).has(e)?t.onChangeActiveColumnKeys(n.filter(t=>t!==e)):t.onChangeActiveColumnKeys([...n,e])},[]),isColumnActive:(0,x.useCallback)(e=>i.has(e),[i]),isColumnToggleable:(0,x.useCallback)(e=>!a.has(e),[a]),showAllColumns:(0,x.useCallback)(()=>{let e=r.current;e.onChangeActiveColumnKeys(e.columns.map(e=>e.key))},[]),resetToDefault:(0,x.useCallback)(()=>{let e=r.current;e.defaultColumnKeys?e.onChangeActiveColumnKeys([...e.defaultColumnKeys]):e.onChangeActiveColumnKeys(e.columns.map(e=>e.key))},[]),setActiveColumnKeys:(0,x.useCallback)(e=>{let t=r.current,n=new Set(t.columns.filter(e=>e.isAlwaysVisible).map(e=>e.key)),i=new Set(e);for(let e of n)i.add(e);t.onChangeActiveColumnKeys(Array.from(i))},[])}}var x;function S(){return(S=e((()=>{x=t()})))()}var C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{C=t(),s(),y(),S(),p(),m(),l(),a(),h(),n(),w=i(),T=[{id:`1`,name:`Alice`,email:`alice@example.com`,role:`Engineer`,department:`Platform`,status:`Active`},{id:`2`,name:`Bob`,email:`bob@example.com`,role:`Designer`,department:`Product`,status:`Active`},{id:`3`,name:`Charlie`,email:`charlie@example.com`,role:`Manager`,department:`Platform`,status:`Away`},{id:`4`,name:`Diana`,email:`diana@example.com`,role:`Engineer`,department:`Infrastructure`,status:`Active`},{id:`5`,name:`Eve`,email:`eve@example.com`,role:`Admin`,department:`Operations`,status:`Inactive`}],E=[{key:`name`,header:`Name`},{key:`email`,header:`Email`},{key:`role`,header:`Role`},{key:`department`,header:`Department`},{key:`status`,header:`Status`}],D=[{key:`name`,label:`Name`,isAlwaysVisible:!0},{key:`email`,label:`Email`},{key:`role`,label:`Role`},{key:`department`,label:`Department`},{key:`status`,label:`Status`}],O=[`name`,`email`,`role`,`department`,`status`],k={title:`Core/TableColumnSettings`,tags:[`autodocs`]},A={render:()=>{let[e,t]=(0,C.useState)(O),n=b({columns:D,activeColumnKeys:e,onChangeActiveColumnKeys:e=>t([...e])}),i=_(n.columnSettingsConfig),a=D.map(e=>({value:e.key,label:e.label,disabled:e.isAlwaysVisible===!0}));return(0,w.jsxs)(`div`,{style:{maxWidth:700},children:[(0,w.jsx)(g,{label:`Table actions`,startContent:(0,w.jsx)(r,{type:`label`,children:`Users`}),endContent:(0,w.jsx)(u,{label:`Columns`,isLabelHidden:!0,options:a,value:[...n.activeColumnKeys],onChange:n.setActiveColumnKeys})}),(0,w.jsx)(c,{data:T,columns:E,idKey:`id`,plugins:{columnSettings:i}})]})}},j={render:()=>{let[e,t]=(0,C.useState)([`name`,`email`,`role`]),n=b({columns:D,activeColumnKeys:e,onChangeActiveColumnKeys:e=>t([...e])}),i=_(n.columnSettingsConfig),a=D.map(e=>({value:e.key,label:e.label,disabled:e.isAlwaysVisible===!0}));return(0,w.jsxs)(`div`,{style:{maxWidth:700},children:[(0,w.jsx)(r,{type:`supporting`,children:`"Name" is always visible and cannot be unchecked.`}),(0,w.jsx)(g,{label:`Table actions`,startContent:(0,w.jsx)(r,{type:`label`,children:`Users`}),endContent:(0,w.jsx)(u,{label:`Columns`,isLabelHidden:!0,options:a,value:[...n.activeColumnKeys],onChange:n.setActiveColumnKeys})}),(0,w.jsx)(c,{data:T,columns:E,idKey:`id`,plugins:{columnSettings:i}})]})}},M={render:()=>{let e=[`name`,`email`,`role`],[t,n]=(0,C.useState)(e),i=b({columns:D,activeColumnKeys:t,onChangeActiveColumnKeys:e=>n([...e]),defaultColumnKeys:e}),a=_(i.columnSettingsConfig),s=D.map(e=>({value:e.key,label:e.label,disabled:e.isAlwaysVisible===!0}));return(0,w.jsxs)(`div`,{style:{maxWidth:700},children:[(0,w.jsx)(r,{type:`supporting`,children:`Toggle columns, then reset to restore the default set (Name, Email, Role).`}),(0,w.jsx)(g,{label:`Table actions`,startContent:(0,w.jsx)(r,{type:`label`,children:`Users`}),endContent:(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(o,{label:`Reset to default`,variant:`secondary`,onClick:i.resetToDefault}),(0,w.jsx)(u,{label:`Columns`,isLabelHidden:!0,options:s,value:[...i.activeColumnKeys],onChange:i.setActiveColumnKeys})]})}),(0,w.jsx)(c,{data:T,columns:E,idKey:`id`,plugins:{columnSettings:a}})]})}},N={render:()=>{let[e,t]=(0,C.useState)(O),[n,i]=(0,C.useState)(new Set),a=b({columns:D,activeColumnKeys:e,onChangeActiveColumnKeys:e=>t([...e])}),o=_(a.columnSettingsConfig),s=D.map(e=>({value:e.key,label:e.label,disabled:e.isAlwaysVisible===!0})),{selectionConfig:l}=f({data:T,idKey:`id`,selectedKeys:n,setSelectedKeys:i}),p=d(l);return(0,w.jsxs)(`div`,{style:{maxWidth:700},children:[(0,w.jsx)(g,{label:`Table actions`,startContent:(0,w.jsxs)(r,{type:`supporting`,children:[n.size,` of `,T.length,` selected`]}),endContent:(0,w.jsx)(u,{label:`Columns`,isLabelHidden:!0,options:s,value:[...a.activeColumnKeys],onChange:a.setActiveColumnKeys})}),(0,w.jsx)(c,{data:T,columns:E,idKey:`id`,plugins:{columnSettings:o,selection:p}})]})}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [activeKeys, setActiveKeys] = useState<UserColumnKey[]>(defaultActiveKeys);
    const state = useTableColumnSettingsState<UserColumnKey>({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: (keys: ReadonlyArray<UserColumnKey>) => setActiveKeys([...keys])
    });
    const plugin = useTableColumnSettings<User, UserColumnKey>(state.columnSettingsConfig);
    const selectorOptions = columnOptions.map(c => ({
      value: c.key,
      label: c.label,
      disabled: c.isAlwaysVisible === true
    }));
    return <div style={{
      maxWidth: 700
    }}>
        <Toolbar label="Table actions" startContent={<Text type="label">Users</Text>} endContent={<MultiSelector label="Columns" isLabelHidden options={selectorOptions} value={[...state.activeColumnKeys]} onChange={state.setActiveColumnKeys} />} />
        <Table data={users} columns={allColumns} idKey="id" plugins={{
        columnSettings: plugin
      }} />
      </div>;
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [activeKeys, setActiveKeys] = useState<UserColumnKey[]>(['name', 'email', 'role']);
    const state = useTableColumnSettingsState<UserColumnKey>({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: (keys: ReadonlyArray<UserColumnKey>) => setActiveKeys([...keys])
    });
    const plugin = useTableColumnSettings<User, UserColumnKey>(state.columnSettingsConfig);
    const selectorOptions = columnOptions.map(c => ({
      value: c.key,
      label: c.label,
      disabled: c.isAlwaysVisible === true
    }));
    return <div style={{
      maxWidth: 700
    }}>
        <Text type="supporting">
          &quot;Name&quot; is always visible and cannot be unchecked.
        </Text>
        <Toolbar label="Table actions" startContent={<Text type="label">Users</Text>} endContent={<MultiSelector label="Columns" isLabelHidden options={selectorOptions} value={[...state.activeColumnKeys]} onChange={state.setActiveColumnKeys} />} />
        <Table data={users} columns={allColumns} idKey="id" plugins={{
        columnSettings: plugin
      }} />
      </div>;
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const defaultKeys: UserColumnKey[] = ['name', 'email', 'role'];
    const [activeKeys, setActiveKeys] = useState<UserColumnKey[]>(defaultKeys);
    const state = useTableColumnSettingsState<UserColumnKey>({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: (keys: ReadonlyArray<UserColumnKey>) => setActiveKeys([...keys]),
      defaultColumnKeys: defaultKeys
    });
    const plugin = useTableColumnSettings<User, UserColumnKey>(state.columnSettingsConfig);
    const selectorOptions = columnOptions.map(c => ({
      value: c.key,
      label: c.label,
      disabled: c.isAlwaysVisible === true
    }));
    return <div style={{
      maxWidth: 700
    }}>
        <Text type="supporting">
          Toggle columns, then reset to restore the default set (Name, Email,
          Role).
        </Text>
        <Toolbar label="Table actions" startContent={<Text type="label">Users</Text>} endContent={<>
              <Button label="Reset to default" variant="secondary" onClick={state.resetToDefault} />
              <MultiSelector label="Columns" isLabelHidden options={selectorOptions} value={[...state.activeColumnKeys]} onChange={state.setActiveColumnKeys} />
            </>} />
        <Table data={users} columns={allColumns} idKey="id" plugins={{
        columnSettings: plugin
      }} />
      </div>;
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [activeKeys, setActiveKeys] = useState<UserColumnKey[]>(defaultActiveKeys);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const state = useTableColumnSettingsState<UserColumnKey>({
      columns: columnOptions,
      activeColumnKeys: activeKeys,
      onChangeActiveColumnKeys: (keys: ReadonlyArray<UserColumnKey>) => setActiveKeys([...keys])
    });
    const columnPlugin = useTableColumnSettings<User, UserColumnKey>(state.columnSettingsConfig);
    const selectorOptions = columnOptions.map(c => ({
      value: c.key,
      label: c.label,
      disabled: c.isAlwaysVisible === true
    }));
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
      maxWidth: 700
    }}>
        <Toolbar label="Table actions" startContent={<Text type="supporting">
              {selectedKeys.size} of {users.length} selected
            </Text>} endContent={<MultiSelector label="Columns" isLabelHidden options={selectorOptions} value={[...state.activeColumnKeys]} onChange={state.setActiveColumnKeys} />} />
        <Table data={users} columns={allColumns} idKey="id" plugins={{
        columnSettings: columnPlugin,
        selection: selectionPlugin
      }} />
      </div>;
  }
}`,...N.parameters?.docs?.source}}},P=[`BasicColumnToggle`,`DisabledColumns`,`ResetToDefault`,`WithSelection`]})))()}F();export{A as BasicColumnToggle,j as DisabledColumns,M as ResetToDefault,N as WithSelection,P as __namedExportsOrder,k as default};