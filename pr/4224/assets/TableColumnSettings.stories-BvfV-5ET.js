import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{t as r}from"./Text-Bs-khaxO.js";import{t as i}from"./jsx-runtime-cM__dR4X.js";import{t as a}from"./Button-Cx-mMzJ7.js";import{t as o}from"./Button-D1MmXezA.js";import{t as s}from"./Text-DRSNMNB3.js";import{t as c}from"./Table-DjDHccIx.js";import{n as l,t as u}from"./MultiSelector-BWVBiatt.js";import{D as d,L as f,T as p,t as m,z as h}from"./Table-t0v56ewI.js";import{A as g,j as _}from"./iframe-CorsBOL8.js";var v,y,b,x,S,C,w,T,E,D,O,k;t((()=>{v=e(n()),m(),u(),o(),g(),s(),y=i(),b=[{id:`1`,name:`Alice`,email:`alice@example.com`,role:`Engineer`,department:`Platform`,status:`Active`},{id:`2`,name:`Bob`,email:`bob@example.com`,role:`Designer`,department:`Product`,status:`Active`},{id:`3`,name:`Charlie`,email:`charlie@example.com`,role:`Manager`,department:`Platform`,status:`Away`},{id:`4`,name:`Diana`,email:`diana@example.com`,role:`Engineer`,department:`Infrastructure`,status:`Active`},{id:`5`,name:`Eve`,email:`eve@example.com`,role:`Admin`,department:`Operations`,status:`Inactive`}],x=[{key:`name`,header:`Name`},{key:`email`,header:`Email`},{key:`role`,header:`Role`},{key:`department`,header:`Department`},{key:`status`,header:`Status`}],S=[{key:`name`,label:`Name`,isAlwaysVisible:!0},{key:`email`,label:`Email`},{key:`role`,label:`Role`},{key:`department`,label:`Department`},{key:`status`,label:`Status`}],C=[`name`,`email`,`role`,`department`,`status`],w={title:`Core/TableColumnSettings`,tags:[`autodocs`]},T={render:()=>{let[e,t]=(0,v.useState)(C),n=p({columns:S,activeColumnKeys:e,onChangeActiveColumnKeys:e=>t([...e])}),i=d(n.columnSettingsConfig),a=S.map(e=>({value:e.key,label:e.label,disabled:e.isAlwaysVisible===!0}));return(0,y.jsxs)(`div`,{style:{maxWidth:700},children:[(0,y.jsx)(_,{label:`Table actions`,startContent:(0,y.jsx)(r,{type:`label`,children:`Users`}),endContent:(0,y.jsx)(l,{label:`Columns`,isLabelHidden:!0,options:a,value:[...n.activeColumnKeys],onChange:n.setActiveColumnKeys})}),(0,y.jsx)(c,{data:b,columns:x,idKey:`id`,plugins:{columnSettings:i}})]})}},E={render:()=>{let[e,t]=(0,v.useState)([`name`,`email`,`role`]),n=p({columns:S,activeColumnKeys:e,onChangeActiveColumnKeys:e=>t([...e])}),i=d(n.columnSettingsConfig),a=S.map(e=>({value:e.key,label:e.label,disabled:e.isAlwaysVisible===!0}));return(0,y.jsxs)(`div`,{style:{maxWidth:700},children:[(0,y.jsx)(r,{type:`supporting`,children:`"Name" is always visible and cannot be unchecked.`}),(0,y.jsx)(_,{label:`Table actions`,startContent:(0,y.jsx)(r,{type:`label`,children:`Users`}),endContent:(0,y.jsx)(l,{label:`Columns`,isLabelHidden:!0,options:a,value:[...n.activeColumnKeys],onChange:n.setActiveColumnKeys})}),(0,y.jsx)(c,{data:b,columns:x,idKey:`id`,plugins:{columnSettings:i}})]})}},D={render:()=>{let e=[`name`,`email`,`role`],[t,n]=(0,v.useState)(e),i=p({columns:S,activeColumnKeys:t,onChangeActiveColumnKeys:e=>n([...e]),defaultColumnKeys:e}),o=d(i.columnSettingsConfig),s=S.map(e=>({value:e.key,label:e.label,disabled:e.isAlwaysVisible===!0}));return(0,y.jsxs)(`div`,{style:{maxWidth:700},children:[(0,y.jsx)(r,{type:`supporting`,children:`Toggle columns, then reset to restore the default set (Name, Email, Role).`}),(0,y.jsx)(_,{label:`Table actions`,startContent:(0,y.jsx)(r,{type:`label`,children:`Users`}),endContent:(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(a,{label:`Reset to default`,variant:`secondary`,onClick:i.resetToDefault}),(0,y.jsx)(l,{label:`Columns`,isLabelHidden:!0,options:s,value:[...i.activeColumnKeys],onChange:i.setActiveColumnKeys})]})}),(0,y.jsx)(c,{data:b,columns:x,idKey:`id`,plugins:{columnSettings:o}})]})}},O={render:()=>{let[e,t]=(0,v.useState)(C),[n,i]=(0,v.useState)(new Set),a=p({columns:S,activeColumnKeys:e,onChangeActiveColumnKeys:e=>t([...e])}),o=d(a.columnSettingsConfig),s=S.map(e=>({value:e.key,label:e.label,disabled:e.isAlwaysVisible===!0})),{selectionConfig:u}=f({data:b,idKey:`id`,selectedKeys:n,setSelectedKeys:i}),m=h(u);return(0,y.jsxs)(`div`,{style:{maxWidth:700},children:[(0,y.jsx)(_,{label:`Table actions`,startContent:(0,y.jsxs)(r,{type:`supporting`,children:[n.size,` of `,b.length,` selected`]}),endContent:(0,y.jsx)(l,{label:`Columns`,isLabelHidden:!0,options:s,value:[...a.activeColumnKeys],onChange:a.setActiveColumnKeys})}),(0,y.jsx)(c,{data:b,columns:x,idKey:`id`,plugins:{columnSettings:o,selection:m}})]})}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k=[`BasicColumnToggle`,`DisabledColumns`,`ResetToDefault`,`WithSelection`]}))();export{T as BasicColumnToggle,E as DisabledColumns,D as ResetToDefault,O as WithSelection,k as __namedExportsOrder,w as default};