import{ah as a,a1 as e,T as g,B as D}from"./iframe-CF49Wwf0.js";import{T}from"./Table-BNg0XaZU.js";import{M as x}from"./MultiSelector-BLqepGQo.js";import{T as k}from"./Toolbar-DjLjZxoK.js";import{a as E,u as W}from"./useTableSelectionState-ELQeGGRv.js";import"./preload-helper-Ct5FWWRu.js";import"./ContextMenu-BZk9skAV.js";import"./renderDropdownItems-BK_aigRT.js";import"./Divider-B8NVXNDK.js";import"./Item-D1VdvwZp.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useListFocus-BOVcRWcC.js";import"./useTypeahead-CaUdhu09.js";import"./EmptyState-B3qqYJ5J.js";import"./usePopover-dK0N4tGE.js";import"./useFocusTrap-CTs8glkB.js";import"./Field-B4k7n2cG.js";import"./FieldStatus-R68hTSFm.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./CheckboxInput-CuQs2wdN.js";import"./Badge-B7t8Dbk0.js";import"./utils-_uNaBhDK.js";import"./Section-BDV89mZT.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";function U(o){const u=a.useRef(o);return u.current=o,a.useMemo(()=>({transformColumns(l){const n=u.current,c=new Set(n.activeColumnKeys),s=new Map(n.activeColumnKeys.map((i,d)=>[i,d]));return l.filter(i=>c.has(i.key)).sort((i,d)=>{const v=s.get(i.key)??1/0,m=s.get(d.key)??1/0;return v-m})}}),[])}function w(o){const{columns:u,activeColumnKeys:l}=o,n=a.useRef(o);n.current=o;const c=a.useMemo(()=>new Set(l),[l]),s=a.useMemo(()=>new Set(u.filter(t=>t.isAlwaysVisible).map(t=>t.key)),[u]),i=a.useCallback(t=>{const r=n.current;if(new Set(r.columns.filter(K=>K.isAlwaysVisible).map(K=>K.key)).has(t))return;const C=r.activeColumnKeys;new Set(C).has(t)?r.onChangeActiveColumnKeys(C.filter(K=>K!==t)):r.onChangeActiveColumnKeys([...C,t])},[]),d=a.useCallback(t=>c.has(t),[c]),v=a.useCallback(t=>!s.has(t),[s]),m=a.useCallback(()=>{const t=n.current;t.onChangeActiveColumnKeys(t.columns.map(r=>r.key))},[]),V=a.useCallback(()=>{const t=n.current;t.defaultColumnKeys?t.onChangeActiveColumnKeys([...t.defaultColumnKeys]):t.onChangeActiveColumnKeys(t.columns.map(r=>r.key))},[]),M=a.useCallback(t=>{const r=n.current,O=new Set(r.columns.filter(p=>p.isAlwaysVisible).map(p=>p.key)),C=new Set(t);for(const p of O)C.add(p);r.onChangeActiveColumnKeys(Array.from(C))},[]);return{columnSettingsConfig:o,activeColumnKeys:l,toggleColumn:i,isColumnActive:d,isColumnToggleable:v,showAllColumns:m,resetToDefault:V,setActiveColumnKeys:M}}const b=[{id:"1",name:"Alice",email:"alice@example.com",role:"Engineer",department:"Platform",status:"Active"},{id:"2",name:"Bob",email:"bob@example.com",role:"Designer",department:"Product",status:"Active"},{id:"3",name:"Charlie",email:"charlie@example.com",role:"Manager",department:"Platform",status:"Away"},{id:"4",name:"Diana",email:"diana@example.com",role:"Engineer",department:"Infrastructure",status:"Active"},{id:"5",name:"Eve",email:"eve@example.com",role:"Admin",department:"Operations",status:"Inactive"}],j=[{key:"name",header:"Name"},{key:"email",header:"Email"},{key:"role",header:"Role"},{key:"department",header:"Department"},{key:"status",header:"Status"}],y=[{key:"name",label:"Name",isAlwaysVisible:!0},{key:"email",label:"Email"},{key:"role",label:"Role"},{key:"department",label:"Department"},{key:"status",label:"Status"}],R=["name","email","role","department","status"],ce={title:"Core/TableColumnSettings",tags:["autodocs"]},S={render:()=>{const[o,u]=a.useState(R),l=w({columns:y,activeColumnKeys:o,onChangeActiveColumnKeys:s=>u([...s])}),n=U(l.columnSettingsConfig),c=y.map(s=>({value:s.key,label:s.label,disabled:s.isAlwaysVisible===!0}));return e.jsxs("div",{style:{maxWidth:700},children:[e.jsx(k,{label:"Table actions",startContent:e.jsx(g,{type:"label",children:"Users"}),endContent:e.jsx(x,{label:"Columns",isLabelHidden:!0,options:c,value:[...l.activeColumnKeys],onChange:l.setActiveColumnKeys})}),e.jsx(T,{data:b,columns:j,idKey:"id",plugins:{columnSettings:n}})]})}},f={render:()=>{const[o,u]=a.useState(["name","email","role"]),l=w({columns:y,activeColumnKeys:o,onChangeActiveColumnKeys:s=>u([...s])}),n=U(l.columnSettingsConfig),c=y.map(s=>({value:s.key,label:s.label,disabled:s.isAlwaysVisible===!0}));return e.jsxs("div",{style:{maxWidth:700},children:[e.jsx(g,{type:"supporting",children:'"Name" is always visible and cannot be unchecked.'}),e.jsx(k,{label:"Table actions",startContent:e.jsx(g,{type:"label",children:"Users"}),endContent:e.jsx(x,{label:"Columns",isLabelHidden:!0,options:c,value:[...l.activeColumnKeys],onChange:l.setActiveColumnKeys})}),e.jsx(T,{data:b,columns:j,idKey:"id",plugins:{columnSettings:n}})]})}},h={render:()=>{const o=["name","email","role"],[u,l]=a.useState(o),n=w({columns:y,activeColumnKeys:u,onChangeActiveColumnKeys:i=>l([...i]),defaultColumnKeys:o}),c=U(n.columnSettingsConfig),s=y.map(i=>({value:i.key,label:i.label,disabled:i.isAlwaysVisible===!0}));return e.jsxs("div",{style:{maxWidth:700},children:[e.jsx(g,{type:"supporting",children:"Toggle columns, then reset to restore the default set (Name, Email, Role)."}),e.jsx(k,{label:"Table actions",startContent:e.jsx(g,{type:"label",children:"Users"}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(D,{label:"Reset to default",variant:"secondary",onClick:n.resetToDefault}),e.jsx(x,{label:"Columns",isLabelHidden:!0,options:s,value:[...n.activeColumnKeys],onChange:n.setActiveColumnKeys})]})}),e.jsx(T,{data:b,columns:j,idKey:"id",plugins:{columnSettings:c}})]})}},A={render:()=>{const[o,u]=a.useState(R),[l,n]=a.useState(new Set),c=w({columns:y,activeColumnKeys:o,onChangeActiveColumnKeys:m=>u([...m])}),s=U(c.columnSettingsConfig),i=y.map(m=>({value:m.key,label:m.label,disabled:m.isAlwaysVisible===!0})),{selectionConfig:d}=E({data:b,idKey:"id",selectedKeys:l,setSelectedKeys:n}),v=W(d);return e.jsxs("div",{style:{maxWidth:700},children:[e.jsx(k,{label:"Table actions",startContent:e.jsxs(g,{type:"supporting",children:[l.size," of ",b.length," selected"]}),endContent:e.jsx(x,{label:"Columns",isLabelHidden:!0,options:i,value:[...c.activeColumnKeys],onChange:c.setActiveColumnKeys})}),e.jsx(T,{data:b,columns:j,idKey:"id",plugins:{columnSettings:s,selection:v}})]})}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};const ue=["BasicColumnToggle","DisabledColumns","ResetToDefault","WithSelection"];export{S as BasicColumnToggle,f as DisabledColumns,h as ResetToDefault,A as WithSelection,ue as __namedExportsOrder,ce as default};
