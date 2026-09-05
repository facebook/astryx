import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Button-CJ0yeiFV.js";import{t as r}from"./Button-DBQO7xlr.js";import{B as i,V as a}from"./iframe-DWqScW-P.js";import{A as o,In as s,It as c,R as l,Wt as u,g as d,t as f}from"./esm-BNuSW8ar.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;e((()=>{i(),r(),f(),p=t(),m={title:`Core/MoreMenu`,component:a,tags:[`autodocs`],parameters:{layout:`centered`},argTypes:{items:{description:`Menu items (items, dividers, or sections)`},label:{control:`text`,description:`Accessible label for the trigger button`},variant:{control:`select`,options:[`primary`,`secondary`,`ghost`,`destructive`],description:`Visual style variant of the trigger button`},size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Size of the trigger button`},isDisabled:{control:`boolean`,description:`Whether the menu trigger is disabled`},placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Position of the menu relative to the trigger`},alignment:{control:`select`,options:[`start`,`center`,`end`],description:`Alignment of the menu along the placement axis`},presentation:{control:`select`,options:[`popover`,`bottom-sheet`,`adaptive`],description:`Popover, BottomSheet, or adaptive compact-touch presentation`},"data-testid":{control:`text`,description:`Test ID for testing frameworks`}}},h={render:()=>(0,p.jsx)(a,{items:[{label:`Edit`,onClick:()=>console.log(`Edit clicked`)},{label:`Duplicate`,onClick:()=>console.log(`Duplicate clicked`)},{label:`Delete`,onClick:()=>console.log(`Delete clicked`)}]})},g={render:()=>(0,p.jsx)(a,{items:[{label:`Edit`,icon:l,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,icon:c,onClick:()=>console.log(`Duplicate`)},{label:`Download`,icon:s,onClick:()=>console.log(`Download`)},{label:`Share`,icon:o,onClick:()=>console.log(`Share`)}]})},_={render:()=>(0,p.jsx)(a,{items:[{label:`Edit`,icon:l,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,icon:c,onClick:()=>console.log(`Duplicate`)},{type:`divider`},{label:`Delete`,icon:d,onClick:()=>console.log(`Delete`)}]})},v={render:()=>(0,p.jsx)(a,{label:`Document actions`,items:[{type:`section`,title:`Actions`,items:[{label:`Edit`,icon:l,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,icon:c,onClick:()=>console.log(`Duplicate`)}]},{type:`section`,title:`Danger zone`,items:[{label:`Delete`,icon:d,onClick:()=>console.log(`Delete`)}]}]})},y={render:()=>(0,p.jsx)(a,{size:`sm`,label:`Row actions`,items:[{label:`Edit`,icon:l,onClick:()=>console.log(`Edit`)},{type:`divider`},{label:`Delete`,icon:d,onClick:()=>console.log(`Delete`)}]})},b={render:()=>(0,p.jsxs)(`div`,{style:{display:`flex`,gap:16,alignItems:`center`},children:[(0,p.jsx)(a,{variant:`ghost`,label:`Ghost variant`,items:[{label:`Action`,onClick:()=>{}}]}),(0,p.jsx)(a,{variant:`secondary`,label:`Secondary variant`,items:[{label:`Action`,onClick:()=>{}}]}),(0,p.jsx)(a,{variant:`primary`,label:`Primary variant`,items:[{label:`Action`,onClick:()=>{}}]})]})},x={render:()=>(0,p.jsx)(a,{isDisabled:!0,items:[{label:`Edit`,onClick:()=>console.log(`Edit`)},{label:`Delete`,onClick:()=>console.log(`Delete`)}]})},S={render:()=>(0,p.jsxs)(`div`,{style:{display:`flex`,gap:8,alignItems:`center`},children:[(0,p.jsx)(n,{label:`Save`,variant:`primary`,onClick:()=>{}}),(0,p.jsx)(n,{label:`Preview`,variant:`secondary`,onClick:()=>{}}),(0,p.jsx)(a,{label:`More actions`,items:[{label:`Export`,icon:s,onClick:()=>console.log(`Export`)},{label:`Share`,icon:o,onClick:()=>console.log(`Share`)},{type:`divider`},{label:`Delete`,icon:d,onClick:()=>console.log(`Delete`)}]})]})},C={name:`Presentation / BottomSheet`,parameters:{layout:`fullscreen`,viewport:{defaultViewport:`mobile1`},docs:{story:{inline:!1,height:`560px`},description:{story:`The real MoreMenu component using DropdownMenu’s BottomSheet presentation. Its visible kebab trigger remains the discoverable mobile entry point.`}}},render:()=>(0,p.jsx)(`div`,{style:{padding:16,display:`flex`,justifyContent:`flex-end`},children:(0,p.jsx)(a,{presentation:`bottom-sheet`,label:`Project actions`,items:[{label:`Edit`,icon:l,onClick:()=>{}},{label:`Duplicate`,icon:c,onClick:()=>{}},{label:`Share`,icon:o,onClick:()=>{}},{label:`Delete`,icon:d,variant:`destructive`,onClick:()=>{}}]})}),play:async({canvasElement:e})=>{let t=e.querySelector(`button`);t instanceof HTMLElement&&t.click()}},w={name:`Presentation / adaptive`,parameters:{layout:`fullscreen`,viewport:{defaultViewport:`mobile1`},docs:{description:{story:`Uses the built-in adaptive policy: BottomSheet at 768px and below with a coarse primary pointer, anchored popover otherwise. Use device emulation to exercise the touch branch.`}}},render:()=>(0,p.jsx)(`div`,{style:{padding:16,display:`flex`,justifyContent:`flex-end`},children:(0,p.jsx)(a,{presentation:`adaptive`,label:`Project actions`,items:[{label:`Edit`,icon:l,onClick:()=>{}},{label:`Share`,icon:o,onClick:()=>{}},{label:`Delete`,icon:d,variant:`destructive`,onClick:()=>{}}]})})},T={render:()=>(0,p.jsx)(a,{label:`User actions`,items:[{label:`Alice Johnson`,onClick:()=>console.log(`Alice`)},{label:`Bob Smith`,onClick:()=>console.log(`Bob`)},{label:`Carol Williams`,onClick:()=>console.log(`Carol`)}]})},E={render:()=>(0,p.jsx)(a,{items:[{label:`Edit`,icon:l,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,icon:c,onClick:()=>console.log(`Duplicate`),isDisabled:!0},{type:`divider`},{label:`Delete`,icon:d,onClick:()=>console.log(`Delete`),isDisabled:!0}]})},D={parameters:{layout:`padded`},render:()=>(0,p.jsxs)(`div`,{style:{display:`flex`,gap:240,justifyContent:`center`,paddingBlock:120},children:[(0,p.jsx)(a,{label:`Start aligned`,items:[{label:`Edit`,icon:l,onClick:()=>{}},{label:`Duplicate`,icon:c,onClick:()=>{}},{type:`divider`},{label:`Delete`,icon:d,onClick:()=>{}}]}),(0,p.jsx)(a,{label:`End aligned`,alignment:`end`,items:[{label:`Edit`,icon:l,onClick:()=>{}},{label:`Duplicate`,icon:c,onClick:()=>{}},{type:`divider`},{label:`Delete`,icon:d,onClick:()=>{}}]})]})},O={render:()=>(0,p.jsxs)(`div`,{style:{display:`flex`,gap:16,alignItems:`center`},children:[(0,p.jsx)(a,{icon:(0,p.jsx)(u,{}),label:`Settings`,items:[{label:`Preferences`,onClick:()=>console.log(`Preferences`)},{label:`Account`,onClick:()=>console.log(`Account`)},{label:`Logout`,onClick:()=>console.log(`Logout`)}]}),(0,p.jsx)(a,{icon:(0,p.jsx)(l,{}),label:`Edit options`,items:[{label:`Edit title`,onClick:()=>console.log(`Edit title`)},{label:`Edit description`,onClick:()=>console.log(`Edit description`)}]})]})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
  name: 'Presentation / BottomSheet',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      story: {
        inline: false,
        height: '560px'
      },
      description: {
        story: 'The real MoreMenu component using DropdownMenu’s BottomSheet presentation. Its visible kebab trigger remains the discoverable mobile entry point.'
      }
    }
  },
  render: () => <div style={{
    padding: 16,
    display: 'flex',
    justifyContent: 'flex-end'
  }}>
      <MoreMenu presentation="bottom-sheet" label="Project actions" items={[{
      label: 'Edit',
      icon: PencilIcon,
      onClick: () => {}
    }, {
      label: 'Duplicate',
      icon: DocumentDuplicateIcon,
      onClick: () => {}
    }, {
      label: 'Share',
      icon: ShareIcon,
      onClick: () => {}
    }, {
      label: 'Delete',
      icon: TrashIcon,
      variant: 'destructive',
      onClick: () => {}
    }]} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const trigger = canvasElement.querySelector('button');
    if (trigger instanceof HTMLElement) {
      trigger.click();
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Presentation / adaptive',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Uses the built-in adaptive policy: BottomSheet at 768px and below with a coarse primary pointer, anchored popover otherwise. Use device emulation to exercise the touch branch.'
      }
    }
  },
  render: () => <div style={{
    padding: 16,
    display: 'flex',
    justifyContent: 'flex-end'
  }}>
      <MoreMenu presentation="adaptive" label="Project actions" items={[{
      label: 'Edit',
      icon: PencilIcon,
      onClick: () => {}
    }, {
      label: 'Share',
      icon: ShareIcon,
      onClick: () => {}
    }, {
      label: 'Delete',
      icon: TrashIcon,
      variant: 'destructive',
      onClick: () => {}
    }]} />
    </div>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: () => <div style={{
    display: 'flex',
    gap: 240,
    justifyContent: 'center',
    paddingBlock: 120
  }}>
      <MoreMenu label="Start aligned" items={[{
      label: 'Edit',
      icon: PencilIcon,
      onClick: () => {}
    }, {
      label: 'Duplicate',
      icon: DocumentDuplicateIcon,
      onClick: () => {}
    }, {
      type: 'divider'
    }, {
      label: 'Delete',
      icon: TrashIcon,
      onClick: () => {}
    }]} />
      <MoreMenu label="End aligned" alignment="end" items={[{
      label: 'Edit',
      icon: PencilIcon,
      onClick: () => {}
    }, {
      label: 'Duplicate',
      icon: DocumentDuplicateIcon,
      onClick: () => {}
    }, {
      type: 'divider'
    }, {
      label: 'Delete',
      icon: TrashIcon,
      onClick: () => {}
    }]} />
    </div>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k=[`Default`,`WithIcons`,`WithDividers`,`WithSections`,`SmallSize`,`Variants`,`Disabled`,`InToolbar`,`BottomSheetPresentation`,`AdaptivePresentation`,`CustomItemRendering`,`WithDisabledItems`,`Alignment`,`CustomIcon`]}))();export{w as AdaptivePresentation,D as Alignment,C as BottomSheetPresentation,O as CustomIcon,T as CustomItemRendering,h as Default,x as Disabled,S as InToolbar,y as SmallSize,b as Variants,E as WithDisabledItems,_ as WithDividers,g as WithIcons,v as WithSections,k as __namedExportsOrder,m as default};