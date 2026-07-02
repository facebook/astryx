import{a1 as e,B as C}from"./iframe-Cm6U1NA5.js";import{M as o}from"./MoreMenu-BrZMjukf.js";import{F as E}from"./Cog6ToothIcon-CJJ1jdQ2.js";import{F as l}from"./PencilIcon-jVoo6MXx.js";import{F as D}from"./ArrowDownTrayIcon-BCQgE4Wt.js";import{F as k}from"./ShareIcon-hF3oCBHH.js";import{F as n}from"./TrashIcon-C6BZi7vd.js";import{F as g}from"./DocumentDuplicateIcon-DxGCFODw.js";import"./preload-helper-Ct5FWWRu.js";import"./DropdownMenu-FagTdkRK.js";import"./usePopover-cP9R4NJf.js";import"./useFocusTrap-D5IA7LFu.js";import"./renderDropdownItems-bQ0yesD3.js";import"./Divider-BVACQv4v.js";import"./Item-Cm2fUJ9g.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useListFocus-DgEo17xf.js";import"./useTypeahead-t21n__Fr.js";const $={title:"Core/MoreMenu",component:o,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{items:{description:"Menu items (items, dividers, or sections)"},label:{control:"text",description:"Accessible label for the trigger button"},variant:{control:"select",options:["primary","secondary","ghost","destructive"],description:"Visual style variant of the trigger button"},size:{control:"select",options:["sm","md","lg"],description:"Size of the trigger button"},isDisabled:{control:"boolean",description:"Whether the menu trigger is disabled"},"data-testid":{control:"text",description:"Test ID for testing frameworks"}}},i={render:()=>e.jsx(o,{items:[{label:"Edit",onClick:()=>console.log("Edit clicked")},{label:"Duplicate",onClick:()=>console.log("Duplicate clicked")},{label:"Delete",onClick:()=>console.log("Delete clicked")}]})},t={render:()=>e.jsx(o,{items:[{label:"Edit",icon:l,onClick:()=>console.log("Edit")},{label:"Duplicate",icon:g,onClick:()=>console.log("Duplicate")},{label:"Download",icon:D,onClick:()=>console.log("Download")},{label:"Share",icon:k,onClick:()=>console.log("Share")}]})},c={render:()=>e.jsx(o,{items:[{label:"Edit",icon:l,onClick:()=>console.log("Edit")},{label:"Duplicate",icon:g,onClick:()=>console.log("Duplicate")},{type:"divider"},{label:"Delete",icon:n,onClick:()=>console.log("Delete")}]})},r={render:()=>e.jsx(o,{label:"Document actions",items:[{type:"section",title:"Actions",items:[{label:"Edit",icon:l,onClick:()=>console.log("Edit")},{label:"Duplicate",icon:g,onClick:()=>console.log("Duplicate")}]},{type:"section",title:"Danger zone",items:[{label:"Delete",icon:n,onClick:()=>console.log("Delete")}]}]})},s={render:()=>e.jsx(o,{size:"sm",label:"Row actions",items:[{label:"Edit",icon:l,onClick:()=>console.log("Edit")},{type:"divider"},{label:"Delete",icon:n,onClick:()=>console.log("Delete")}]})},a={render:()=>e.jsxs("div",{style:{display:"flex",gap:16,alignItems:"center"},children:[e.jsx(o,{variant:"ghost",label:"Ghost variant",items:[{label:"Action",onClick:()=>{}}]}),e.jsx(o,{variant:"secondary",label:"Secondary variant",items:[{label:"Action",onClick:()=>{}}]}),e.jsx(o,{variant:"primary",label:"Primary variant",items:[{label:"Action",onClick:()=>{}}]})]})},d={render:()=>e.jsx(o,{isDisabled:!0,items:[{label:"Edit",onClick:()=>console.log("Edit")},{label:"Delete",onClick:()=>console.log("Delete")}]})},m={render:()=>e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"center"},children:[e.jsx(C,{label:"Save",variant:"primary",onClick:()=>{}}),e.jsx(C,{label:"Preview",variant:"secondary",onClick:()=>{}}),e.jsx(o,{label:"More actions",items:[{label:"Export",icon:D,onClick:()=>console.log("Export")},{label:"Share",icon:k,onClick:()=>console.log("Share")},{type:"divider"},{label:"Delete",icon:n,onClick:()=>console.log("Delete")}]})]})},p={render:()=>e.jsx(o,{label:"User actions",items:[{label:"Alice Johnson",onClick:()=>console.log("Alice")},{label:"Bob Smith",onClick:()=>console.log("Bob")},{label:"Carol Williams",onClick:()=>console.log("Carol")}]})},b={render:()=>e.jsx(o,{items:[{label:"Edit",icon:l,onClick:()=>console.log("Edit")},{label:"Duplicate",icon:g,onClick:()=>console.log("Duplicate"),isDisabled:!0},{type:"divider"},{label:"Delete",icon:n,onClick:()=>console.log("Delete"),isDisabled:!0}]})},u={render:()=>e.jsxs("div",{style:{display:"flex",gap:16,alignItems:"center"},children:[e.jsx(o,{icon:e.jsx(E,{}),label:"Settings",items:[{label:"Preferences",onClick:()=>console.log("Preferences")},{label:"Account",onClick:()=>console.log("Account")},{label:"Logout",onClick:()=>console.log("Logout")}]}),e.jsx(o,{icon:e.jsx(l,{}),label:"Edit options",items:[{label:"Edit title",onClick:()=>console.log("Edit title")},{label:"Edit description",onClick:()=>console.log("Edit description")}]})]})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <MoreMenu isDisabled items={[{
    label: 'Edit',
    onClick: () => console.log('Edit')
  }, {
    label: 'Delete',
    onClick: () => console.log('Delete')
  }]} />
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};const L=["Default","WithIcons","WithDividers","WithSections","SmallSize","Variants","Disabled","InToolbar","CustomItemRendering","WithDisabledItems","CustomIcon"];export{u as CustomIcon,p as CustomItemRendering,i as Default,d as Disabled,m as InToolbar,s as SmallSize,a as Variants,b as WithDisabledItems,c as WithDividers,t as WithIcons,r as WithSections,L as __namedExportsOrder,$ as default};
