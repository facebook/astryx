import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Button-BBk5Kqd0.js";import{t as r}from"./Button-CRpvXAU4.js";import{H as i,V as a}from"./iframe-DDpBXOWV.js";import{Bt as o,I as s,Mn as c,Mt as l,O as u,m as d,t as f}from"./esm-DA7gAIBC.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E;e((()=>{a(),r(),f(),p=t(),m={title:`Core/MoreMenu`,component:i,tags:[`autodocs`],parameters:{layout:`centered`},argTypes:{items:{description:`Menu items (items, dividers, or sections)`},label:{control:`text`,description:`Accessible label for the trigger button`},variant:{control:`select`,options:[`primary`,`secondary`,`ghost`,`destructive`],description:`Visual style variant of the trigger button`},size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Size of the trigger button`},isDisabled:{control:`boolean`,description:`Whether the menu trigger is disabled`},"data-testid":{control:`text`,description:`Test ID for testing frameworks`}}},h={render:()=>(0,p.jsx)(i,{items:[{label:`Edit`,onClick:()=>console.log(`Edit clicked`)},{label:`Duplicate`,onClick:()=>console.log(`Duplicate clicked`)},{label:`Delete`,onClick:()=>console.log(`Delete clicked`)}]})},g={render:()=>(0,p.jsx)(i,{items:[{label:`Edit`,icon:s,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,icon:l,onClick:()=>console.log(`Duplicate`)},{label:`Download`,icon:c,onClick:()=>console.log(`Download`)},{label:`Share`,icon:u,onClick:()=>console.log(`Share`)}]})},_={render:()=>(0,p.jsx)(i,{items:[{label:`Edit`,icon:s,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,icon:l,onClick:()=>console.log(`Duplicate`)},{type:`divider`},{label:`Delete`,icon:d,onClick:()=>console.log(`Delete`)}]})},v={render:()=>(0,p.jsx)(i,{label:`Document actions`,items:[{type:`section`,title:`Actions`,items:[{label:`Edit`,icon:s,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,icon:l,onClick:()=>console.log(`Duplicate`)}]},{type:`section`,title:`Danger zone`,items:[{label:`Delete`,icon:d,onClick:()=>console.log(`Delete`)}]}]})},y={render:()=>(0,p.jsx)(i,{size:`sm`,label:`Row actions`,items:[{label:`Edit`,icon:s,onClick:()=>console.log(`Edit`)},{type:`divider`},{label:`Delete`,icon:d,onClick:()=>console.log(`Delete`)}]})},b={render:()=>(0,p.jsxs)(`div`,{style:{display:`flex`,gap:16,alignItems:`center`},children:[(0,p.jsx)(i,{variant:`ghost`,label:`Ghost variant`,items:[{label:`Action`,onClick:()=>{}}]}),(0,p.jsx)(i,{variant:`secondary`,label:`Secondary variant`,items:[{label:`Action`,onClick:()=>{}}]}),(0,p.jsx)(i,{variant:`primary`,label:`Primary variant`,items:[{label:`Action`,onClick:()=>{}}]})]})},x={render:()=>(0,p.jsx)(i,{isDisabled:!0,items:[{label:`Edit`,onClick:()=>console.log(`Edit`)},{label:`Delete`,onClick:()=>console.log(`Delete`)}]})},S={render:()=>(0,p.jsxs)(`div`,{style:{display:`flex`,gap:8,alignItems:`center`},children:[(0,p.jsx)(n,{label:`Save`,variant:`primary`,onClick:()=>{}}),(0,p.jsx)(n,{label:`Preview`,variant:`secondary`,onClick:()=>{}}),(0,p.jsx)(i,{label:`More actions`,items:[{label:`Export`,icon:c,onClick:()=>console.log(`Export`)},{label:`Share`,icon:u,onClick:()=>console.log(`Share`)},{type:`divider`},{label:`Delete`,icon:d,onClick:()=>console.log(`Delete`)}]})]})},C={render:()=>(0,p.jsx)(i,{label:`User actions`,items:[{label:`Alice Johnson`,onClick:()=>console.log(`Alice`)},{label:`Bob Smith`,onClick:()=>console.log(`Bob`)},{label:`Carol Williams`,onClick:()=>console.log(`Carol`)}]})},w={render:()=>(0,p.jsx)(i,{items:[{label:`Edit`,icon:s,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,icon:l,onClick:()=>console.log(`Duplicate`),isDisabled:!0},{type:`divider`},{label:`Delete`,icon:d,onClick:()=>console.log(`Delete`),isDisabled:!0}]})},T={render:()=>(0,p.jsxs)(`div`,{style:{display:`flex`,gap:16,alignItems:`center`},children:[(0,p.jsx)(i,{icon:(0,p.jsx)(o,{}),label:`Settings`,items:[{label:`Preferences`,onClick:()=>console.log(`Preferences`)},{label:`Account`,onClick:()=>console.log(`Account`)},{label:`Logout`,onClick:()=>console.log(`Logout`)}]}),(0,p.jsx)(i,{icon:(0,p.jsx)(s,{}),label:`Edit options`,items:[{label:`Edit title`,onClick:()=>console.log(`Edit title`)},{label:`Edit description`,onClick:()=>console.log(`Edit description`)}]})]})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <MoreMenu items={[{
    label: 'Edit',
    onClick: () => console.log('Edit clicked')
  }, {
    label: 'Duplicate',
    onClick: () => console.log('Duplicate clicked')
  }, {
    label: 'Delete',
    onClick: () => console.log('Delete clicked')
  }]} />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <MoreMenu items={[{
    label: 'Edit',
    icon: PencilIcon,
    onClick: () => console.log('Edit')
  }, {
    label: 'Duplicate',
    icon: DocumentDuplicateIcon,
    onClick: () => console.log('Duplicate')
  }, {
    label: 'Download',
    icon: ArrowDownTrayIcon,
    onClick: () => console.log('Download')
  }, {
    label: 'Share',
    icon: ShareIcon,
    onClick: () => console.log('Share')
  }]} />
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <MoreMenu items={[{
    label: 'Edit',
    icon: PencilIcon,
    onClick: () => console.log('Edit')
  }, {
    label: 'Duplicate',
    icon: DocumentDuplicateIcon,
    onClick: () => console.log('Duplicate')
  }, {
    type: 'divider'
  }, {
    label: 'Delete',
    icon: TrashIcon,
    onClick: () => console.log('Delete')
  }]} />
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <MoreMenu label="Document actions" items={[{
    type: 'section',
    title: 'Actions',
    items: [{
      label: 'Edit',
      icon: PencilIcon,
      onClick: () => console.log('Edit')
    }, {
      label: 'Duplicate',
      icon: DocumentDuplicateIcon,
      onClick: () => console.log('Duplicate')
    }]
  }, {
    type: 'section',
    title: 'Danger zone',
    items: [{
      label: 'Delete',
      icon: TrashIcon,
      onClick: () => console.log('Delete')
    }]
  }]} />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <MoreMenu size="sm" label="Row actions" items={[{
    label: 'Edit',
    icon: PencilIcon,
    onClick: () => console.log('Edit')
  }, {
    type: 'divider'
  }, {
    label: 'Delete',
    icon: TrashIcon,
    onClick: () => console.log('Delete')
  }]} />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 16,
    alignItems: 'center'
  }}>
      <MoreMenu variant="ghost" label="Ghost variant" items={[{
      label: 'Action',
      onClick: () => {}
    }]} />
      <MoreMenu variant="secondary" label="Secondary variant" items={[{
      label: 'Action',
      onClick: () => {}
    }]} />
      <MoreMenu variant="primary" label="Primary variant" items={[{
      label: 'Action',
      onClick: () => {}
    }]} />
    </div>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <MoreMenu isDisabled items={[{
    label: 'Edit',
    onClick: () => console.log('Edit')
  }, {
    label: 'Delete',
    onClick: () => console.log('Delete')
  }]} />
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 8,
    alignItems: 'center'
  }}>
      <Button label="Save" variant="primary" onClick={() => {}} />
      <Button label="Preview" variant="secondary" onClick={() => {}} />
      <MoreMenu label="More actions" items={[{
      label: 'Export',
      icon: ArrowDownTrayIcon,
      onClick: () => console.log('Export')
    }, {
      label: 'Share',
      icon: ShareIcon,
      onClick: () => console.log('Share')
    }, {
      type: 'divider'
    }, {
      label: 'Delete',
      icon: TrashIcon,
      onClick: () => console.log('Delete')
    }]} />
    </div>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <MoreMenu label="User actions" items={[{
    label: 'Alice Johnson',
    onClick: () => console.log('Alice')
  }, {
    label: 'Bob Smith',
    onClick: () => console.log('Bob')
  }, {
    label: 'Carol Williams',
    onClick: () => console.log('Carol')
  }]} />
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <MoreMenu items={[{
    label: 'Edit',
    icon: PencilIcon,
    onClick: () => console.log('Edit')
  }, {
    label: 'Duplicate',
    icon: DocumentDuplicateIcon,
    onClick: () => console.log('Duplicate'),
    isDisabled: true
  }, {
    type: 'divider'
  }, {
    label: 'Delete',
    icon: TrashIcon,
    onClick: () => console.log('Delete'),
    isDisabled: true
  }]} />
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 16,
    alignItems: 'center'
  }}>
      <MoreMenu icon={<Cog6ToothIcon />} label="Settings" items={[{
      label: 'Preferences',
      onClick: () => console.log('Preferences')
    }, {
      label: 'Account',
      onClick: () => console.log('Account')
    }, {
      label: 'Logout',
      onClick: () => console.log('Logout')
    }]} />
      <MoreMenu icon={<PencilIcon />} label="Edit options" items={[{
      label: 'Edit title',
      onClick: () => console.log('Edit title')
    }, {
      label: 'Edit description',
      onClick: () => console.log('Edit description')
    }]} />
    </div>
}`,...T.parameters?.docs?.source}}},E=[`Default`,`WithIcons`,`WithDividers`,`WithSections`,`SmallSize`,`Variants`,`Disabled`,`InToolbar`,`CustomItemRendering`,`WithDisabledItems`,`CustomIcon`]}))();export{T as CustomIcon,C as CustomItemRendering,h as Default,x as Disabled,S as InToolbar,y as SmallSize,b as Variants,w as WithDisabledItems,_ as WithDividers,g as WithIcons,v as WithSections,E as __namedExportsOrder,m as default};