import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as ee}from"./Badge-D9PPEJhK.js";import{a,r as o,s}from"./renderDropdownItems-ux_5p6VL.js";import{a as c,r as l,t as u}from"./DropdownMenuRadioItem-DxXfYvdm.js";import{t as d}from"./DropdownMenu-DvUzTNbf.js";import{W as te}from"./iframe-B2K-Xl1P.js";import{Et as ne,Ht as f,I as p,In as re,Mt as ie,O as m,Pn as ae,Pt as h,W as g,bt as _,m as v,o as y,t as oe}from"./esm-CL1f8dHF.js";var b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,se;e((()=>{ee(),b=t(n()),te(),oe(),x=r(),S={title:`Core/DropdownMenu`,component:d,tags:[`autodocs`],parameters:{layout:`centered`},argTypes:{button:{description:`Props for customizing the trigger button`},items:{description:`Menu items (items, dividers, or sections)`},isMenuOpen:{control:`boolean`,description:`Controlled open state`},menuWidth:{control:`text`,description:`Custom menu width (number for px or CSS string)`},placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Menu placement relative to trigger`},alignment:{control:`select`,options:[`start`,`center`,`end`],description:`Menu alignment along the placement axis`},"data-testid":{control:`text`,description:`Test ID for testing frameworks`}}},C={render:()=>(0,x.jsx)(d,{button:{label:`Actions`},items:[{label:`Edit`,onClick:()=>console.log(`Edit clicked`)},{label:`Duplicate`,onClick:()=>console.log(`Duplicate clicked`)},{label:`Delete`,onClick:()=>console.log(`Delete clicked`)}]})},w={render:()=>(0,x.jsx)(d,{button:{label:`Actions`,variant:`primary`},items:[{label:`Edit`,icon:p,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,icon:h,onClick:()=>console.log(`Duplicate`)},{label:`Download`,icon:ae,onClick:()=>console.log(`Download`)},{label:`Delete`,icon:v,onClick:()=>console.log(`Delete`)}]})},T={render:()=>(0,x.jsx)(d,{button:{label:`File`,variant:`ghost`},items:[{type:`section`,title:`Create`,items:[{label:`New File`,icon:ie,onClick:()=>console.log(`New File`)},{label:`New Folder`,icon:_,onClick:()=>console.log(`New Folder`)}]},{type:`section`,title:`Share`,items:[{label:`Share`,icon:m,onClick:()=>console.log(`Share`)},{label:`Archive`,icon:re,onClick:()=>console.log(`Archive`)}]}]})},E={render:()=>(0,x.jsx)(d,{button:{label:`Actions`},items:[{label:`Edit`,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,onClick:()=>console.log(`Duplicate`)},{type:`divider`},{label:`Delete`,onClick:()=>console.log(`Delete`)}]})},D={render:()=>(0,x.jsx)(d,{button:{label:`Actions`},items:[{label:`Edit`,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,onClick:()=>console.log(`Duplicate`)},{label:`Delete (disabled)`,isDisabled:!0}]})},O={name:`Destructive item`,render:()=>(0,x.jsx)(d,{button:{label:`Actions`},items:[{label:`Edit`,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,icon:`copy`,onClick:()=>console.log(`Duplicate`)},{type:`divider`},{label:`Delete`,icon:`close`,variant:`destructive`,onClick:()=>console.log(`Delete`)}]})},k={render:()=>{let[e,t]=(0,b.useState)(!1);return(0,x.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,alignItems:`center`},children:[(0,x.jsxs)(`div`,{children:[`Menu is `,e?`open`:`closed`]}),(0,x.jsx)(d,{button:{label:`Controlled Menu`},isMenuOpen:e,onOpenChange:t,items:[{label:`Item 1`,onClick:()=>console.log(`Item 1`)},{label:`Item 2`,onClick:()=>console.log(`Item 2`)},{label:`Item 3`,onClick:()=>console.log(`Item 3`)}]})]})}},A={render:()=>(0,x.jsx)(d,{button:{label:`Wide Menu`},menuWidth:300,items:[{label:`This is a longer option that needs more space`,onClick:()=>console.log(`Option 1`)},{label:`Another long option with extra text`,onClick:()=>console.log(`Option 2`)},{label:`Short one`,onClick:()=>console.log(`Option 3`)}]})},j={render:()=>(0,x.jsxs)(`div`,{style:{display:`flex`,gap:16,flexWrap:`wrap`},children:[(0,x.jsx)(d,{button:{label:`Secondary`,variant:`secondary`},items:[{label:`Option 1`},{label:`Option 2`}]}),(0,x.jsx)(d,{button:{label:`Primary`,variant:`primary`},items:[{label:`Option 1`},{label:`Option 2`}]}),(0,x.jsx)(d,{button:{label:`Ghost`,variant:`ghost`},items:[{label:`Option 1`},{label:`Option 2`}]}),(0,x.jsx)(d,{button:{label:`Destructive`,variant:`destructive`},items:[{label:`Option 1`},{label:`Option 2`}]})]})},M={render:()=>(0,x.jsxs)(`div`,{style:{display:`flex`,gap:16,alignItems:`center`},children:[(0,x.jsx)(d,{button:{label:`Small`,size:`sm`},items:[{label:`Option 1`},{label:`Option 2`}]}),(0,x.jsx)(d,{button:{label:`Medium`,size:`md`},items:[{label:`Option 1`},{label:`Option 2`}]}),(0,x.jsx)(d,{button:{label:`Large`,size:`lg`},items:[{label:`Option 1`},{label:`Option 2`}]})]})},N={render:()=>{let[e,t]=(0,b.useState)(0);return(0,x.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,alignItems:`center`},children:[(0,x.jsxs)(`div`,{children:[`Button clicked `,e,` times`]}),(0,x.jsx)(d,{button:{label:`Click Me`},onClick:()=>t(e=>e+1),items:[{label:`Menu Item`,onClick:()=>console.log(`Item clicked`)}]})]})}},P={render:()=>{let[e,t]=(0,b.useState)(!1);return(0,x.jsx)(d,{button:{label:`Session`},items:[{label:e?`Copied`:`Copy session ID`,icon:(0,x.jsx)(h,{style:{width:16,height:16}}),hasCloseOnSelect:!1,onClick:()=>t(!0)},{label:`Rename`},{label:`Delete`,variant:`destructive`}],onOpenChange:e=>{e||t(!1)}})}},F={render:()=>(0,x.jsxs)(d,{button:{label:`Select User`},menuWidth:280,children:[(0,x.jsx)(s,{icon:y,label:`Alice Johnson`,description:`alice.johnson@example.com`,onClick:()=>console.log(`Alice`)}),(0,x.jsx)(s,{icon:y,label:`Bob Smith`,description:`bob.smith@example.com`,onClick:()=>console.log(`Bob`)}),(0,x.jsx)(s,{icon:y,label:`Carol Williams`,description:`carol.williams@example.com`,onClick:()=>console.log(`Carol`)})]})},I={render:()=>(0,x.jsxs)(`div`,{style:{display:`flex`,gap:16,alignItems:`center`},children:[(0,x.jsx)(d,{button:{label:`More options`,icon:(0,x.jsx)(ne,{}),variant:`ghost`,isIconOnly:!0},items:[{label:`Edit`,icon:p,onClick:()=>console.log(`Edit`)},{label:`Delete`,icon:v,onClick:()=>console.log(`Delete`)}]}),(0,x.jsx)(d,{button:{label:`Settings`,icon:(0,x.jsx)(f,{}),variant:`secondary`,isIconOnly:!0},items:[{label:`Preferences`,onClick:()=>console.log(`Preferences`)},{label:`Account`,onClick:()=>console.log(`Account`)}]})]})},L={render:()=>(0,x.jsx)(d,{button:{label:`Settings`,icon:(0,x.jsx)(f,{}),variant:`ghost`,children:`Settings`},items:[{label:`Preferences`,onClick:()=>console.log(`Preferences`)},{label:`Account`,onClick:()=>console.log(`Account`)}]})},R={render:()=>(0,x.jsx)(d,{button:{label:`Sort by: Name`,variant:`ghost`},hasChevron:!1,items:[{label:`Name`,onClick:()=>console.log(`Name`)},{label:`Date`,onClick:()=>console.log(`Date`)},{label:`Size`,onClick:()=>console.log(`Size`)}]})},z={render:()=>(0,x.jsxs)(d,{button:{label:`Actions`},children:[(0,x.jsx)(s,{icon:p,label:`Edit`,onClick:()=>console.log(`Edit`)}),(0,x.jsx)(s,{icon:h,label:`Duplicate`,onClick:()=>console.log(`Duplicate`)}),(0,x.jsx)(a,{}),(0,x.jsx)(s,{icon:v,label:`Delete`,onClick:()=>console.log(`Delete`)})]})},B={render:()=>(0,x.jsxs)(d,{button:{label:`File Actions`},children:[(0,x.jsx)(s,{icon:p,label:`Edit`,onClick:()=>console.log(`Edit`)}),(0,x.jsx)(s,{icon:h,label:`Duplicate`,onClick:()=>console.log(`Duplicate`)}),(0,x.jsx)(a,{}),(0,x.jsx)(s,{icon:v,label:`Delete (no permission)`,isDisabled:!0})]})},V={render:()=>{let[e,t]=(0,b.useState)(!1);return(0,x.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,alignItems:`center`},children:[(0,x.jsxs)(`label`,{style:{display:`flex`,gap:8,alignItems:`center`},children:[(0,x.jsx)(`input`,{type:`checkbox`,checked:e,onChange:e=>t(e.target.checked)}),`Show delete option`]}),(0,x.jsxs)(d,{button:{label:`Actions`},children:[(0,x.jsx)(s,{icon:p,label:`Edit`,onClick:()=>console.log(`Edit`)}),(0,x.jsx)(s,{icon:m,label:`Share`,onClick:()=>console.log(`Share`)}),e&&(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(a,{}),(0,x.jsx)(s,{icon:v,label:`Delete`,onClick:()=>console.log(`Delete`)})]})]})]})}},H={render:()=>(0,x.jsxs)(d,{button:{label:`Select User`},menuWidth:280,children:[(0,x.jsx)(s,{icon:y,label:`Alice Johnson`,description:`alice.johnson@example.com`,onClick:()=>console.log(`Alice`)}),(0,x.jsx)(s,{icon:y,label:`Bob Smith`,description:`bob.smith@example.com`,onClick:()=>console.log(`Bob`)}),(0,x.jsx)(s,{icon:y,label:`Carol Williams`,description:`carol.williams@example.com`,onClick:()=>console.log(`Carol`)})]})},U={render:()=>(0,x.jsx)(d,{button:{label:`Bottom toolbar menu`},placement:`above`,items:[{label:`Edit`,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,onClick:()=>console.log(`Duplicate`)},{label:`Delete`,onClick:()=>console.log(`Delete`)}]})},W={render:()=>(0,x.jsx)(d,{button:{label:`Row actions`},alignment:`end`,menuWidth:220,items:[{label:`Edit`,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,onClick:()=>console.log(`Duplicate`)},{label:`Delete`,onClick:()=>console.log(`Delete`)}]}),parameters:{docs:{description:{story:`Use alignment="end" when a menu should extend back over the trigger, such as a row action menu near the inline-end edge.`}}}},G={render:()=>(0,x.jsxs)(`div`,{style:{direction:`rtl`,display:`flex`,gap:`16px`},children:[(0,x.jsx)(d,{button:{label:`CSS direction: rtl`},items:[{label:`Edit`,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,onClick:()=>console.log(`Duplicate`)},{label:`Delete`,onClick:()=>console.log(`Delete`)}]}),(0,x.jsx)(`div`,{dir:`ltr`,children:(0,x.jsx)(`div`,{dir:`rtl`,children:(0,x.jsx)(d,{button:{label:`dir="rtl" attribute`},items:[{label:`Edit`,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,onClick:()=>console.log(`Duplicate`)},{label:`Delete`,onClick:()=>console.log(`Delete`)}]})})})]}),parameters:{docs:{description:{story:`In RTL contexts (CSS direction property or dir attribute) the menu right-edge-aligns to the trigger and grows toward the left — the logical mirror of the LTR default (#3389). Both direction mechanisms are shown; the popover inherits direction from the trigger subtree and the self-* position-area keywords mirror it in pure CSS.`}}}},K={render:function(){let[e,t]=(0,b.useState)(!1),[n,r]=(0,b.useState)(!0);return(0,x.jsxs)(d,{button:{label:`View`},children:[(0,x.jsx)(c,{label:`Show archived`,value:e,onChange:t}),(0,x.jsx)(c,{label:`Show drafts`,description:`Include unpublished items`,value:n,onChange:r})]})},parameters:{docs:{description:{story:`DropdownMenuCheckboxItem — independent toggles (role="menuitemcheckbox"). The menu stays open on toggle by default so several can be flipped at once.`}}}},q={render:function(){let[e,t]=(0,b.useState)(`newest`);return(0,x.jsx)(d,{button:{label:`Sort`},children:(0,x.jsxs)(l,{value:e,onChange:t,label:`Sort by`,children:[(0,x.jsx)(u,{value:`newest`,label:`Newest`}),(0,x.jsx)(u,{value:`oldest`,label:`Oldest`}),(0,x.jsx)(u,{value:`az`,label:`Alphabetical`,description:`A → Z`})]})})},parameters:{docs:{description:{story:`DropdownMenuRadioGroup + DropdownMenuRadioItem — single-select group (role="menuitemradio"). Selecting closes the menu by default.`}}}},J={render:function(){let[e,t]=(0,b.useState)(`a`),[n,r]=(0,b.useState)(`a`);return(0,x.jsxs)(`div`,{style:{display:`flex`,gap:24},children:[(0,x.jsx)(d,{button:{label:`Small menu`,size:`sm`},children:(0,x.jsxs)(l,{value:e,onChange:t,label:`Small`,children:[(0,x.jsx)(u,{value:`a`,label:`Option A`}),(0,x.jsx)(u,{value:`b`,label:`Option B`})]})}),(0,x.jsx)(d,{button:{label:`Large menu`,size:`lg`},children:(0,x.jsxs)(l,{value:n,onChange:r,label:`Large`,children:[(0,x.jsx)(u,{value:`a`,label:`Option A`}),(0,x.jsx)(u,{value:`b`,label:`Option B`})]})})]})},parameters:{docs:{description:{story:"The checkbox/radio control size is derived from the menu item size — a `sm` menu renders the small (18px) control, `md`/`lg` render the standard (22px) control. On coarse-pointer (touch) devices the control swaps to the inline-end of the row."}}}},Y={render:()=>(0,x.jsxs)(d,{button:{label:`Actions`},children:[(0,x.jsx)(s,{icon:p,label:`Rename`,onClick:()=>{}}),(0,x.jsxs)(o,{icon:_,label:`Move to`,children:[(0,x.jsx)(s,{label:`Folder A`,onClick:()=>{}}),(0,x.jsx)(s,{label:`Folder B`,onClick:()=>{}}),(0,x.jsx)(s,{label:`Folder C`,onClick:()=>{}})]}),(0,x.jsx)(s,{icon:v,label:`Delete`,onClick:()=>{}})]}),parameters:{docs:{description:{story:`DropdownMenuSubMenu is a single menu row that reveals a nested flyout of its own children. Hover or Right arrow (Left in RTL) / Enter / Space opens it and moves focus to its first item; Left arrow / Escape closes it and returns focus to the trigger. The flyout opens inline-end by default and auto-flips at the viewport edge.`}}}},X={render:()=>(0,x.jsxs)(d,{button:{label:`Share`},children:[(0,x.jsx)(s,{icon:m,label:`Copy link`,onClick:()=>{}}),(0,x.jsxs)(o,{label:`Share to`,children:[(0,x.jsx)(s,{label:`Email`,onClick:()=>{}}),(0,x.jsxs)(o,{label:`Team`,children:[(0,x.jsx)(s,{label:`Design`,onClick:()=>{}}),(0,x.jsx)(s,{label:`Engineering`,onClick:()=>{}})]})]})]}),parameters:{docs:{description:{story:`Submenus nest to arbitrary depth — each level owns its own roving focus and positioning layer.`}}}},Z={render:()=>(0,x.jsxs)(d,{button:{label:`Actions`},children:[(0,x.jsx)(s,{label:`Rename`,onClick:()=>{}}),(0,x.jsx)(o,{label:`Move to`,hasSpinner:!0,children:(0,x.jsx)(s,{label:`Loading…`,isDisabled:!0,onClick:()=>{}})})]}),parameters:{docs:{description:{story:"A submenu row can show a spinner in place of the caret via `hasSpinner`, e.g. while a lazy submenu’s children load."}}}},Q={render:()=>(0,x.jsx)(d,{button:{label:`Actions`},items:[{label:`Rename`,onClick:()=>{}},{label:`Move to`,icon:_,items:[{label:`Folder A`,onClick:()=>{}},{label:`Folder B`,onClick:()=>{}}]},{type:`divider`},{label:`Delete`,onClick:()=>{}}]}),parameters:{docs:{description:{story:"Data-driven parity: give a menu item a nested `items` array and it becomes a submenu automatically — no separate item type."}}}},$={parameters:{layout:`padded`},render:()=>(0,x.jsxs)(`div`,{style:{display:`flex`,gap:160,justifyContent:`center`},children:[(0,x.jsx)(d,{button:{label:`Data mode`},menuWidth:220,items:[{label:`Search`,icon:g,endContent:(0,x.jsx)(i,{label:`⌘K`})},{label:`Duplicate`,icon:h,endContent:(0,x.jsx)(i,{label:`⌘D`})},{type:`divider`},{label:`Delete`,icon:v,variant:`destructive`}]}),(0,x.jsxs)(d,{button:{label:`Compound mode`},menuWidth:220,children:[(0,x.jsx)(s,{icon:g,label:`Search`,endContent:(0,x.jsx)(i,{label:`⌘K`})}),(0,x.jsx)(s,{icon:h,label:`Duplicate`,endContent:(0,x.jsx)(i,{label:`⌘D`})}),(0,x.jsx)(a,{}),(0,x.jsx)(s,{icon:v,label:`Delete`,variant:`destructive`})]})]})},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Actions'
  }} items={[{
    label: 'Edit',
    onClick: () => console.log('Edit clicked')
  }, {
    label: 'Duplicate',
    onClick: () => console.log('Duplicate clicked')
  }, {
    label: 'Delete',
    onClick: () => console.log('Delete clicked')
  }]} />
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Actions',
    variant: 'primary'
  }} items={[{
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
    label: 'Delete',
    icon: TrashIcon,
    onClick: () => console.log('Delete')
  }]} />
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'File',
    variant: 'ghost'
  }} items={[{
    type: 'section',
    title: 'Create',
    items: [{
      label: 'New File',
      icon: DocumentPlusIcon,
      onClick: () => console.log('New File')
    }, {
      label: 'New Folder',
      icon: FolderPlusIcon,
      onClick: () => console.log('New Folder')
    }]
  }, {
    type: 'section',
    title: 'Share',
    items: [{
      label: 'Share',
      icon: ShareIcon,
      onClick: () => console.log('Share')
    }, {
      label: 'Archive',
      icon: ArchiveBoxIcon,
      onClick: () => console.log('Archive')
    }]
  }]} />
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Actions'
  }} items={[{
    label: 'Edit',
    onClick: () => console.log('Edit')
  }, {
    label: 'Duplicate',
    onClick: () => console.log('Duplicate')
  }, {
    type: 'divider'
  }, {
    label: 'Delete',
    onClick: () => console.log('Delete')
  }]} />
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Actions'
  }} items={[{
    label: 'Edit',
    onClick: () => console.log('Edit')
  }, {
    label: 'Duplicate',
    onClick: () => console.log('Duplicate')
  }, {
    label: 'Delete (disabled)',
    isDisabled: true
  }]} />
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'Destructive item',
  render: () => <DropdownMenu button={{
    label: 'Actions'
  }} items={[{
    label: 'Edit',
    onClick: () => console.log('Edit')
  }, {
    label: 'Duplicate',
    icon: 'copy',
    onClick: () => console.log('Duplicate')
  }, {
    type: 'divider'
  }, {
    label: 'Delete',
    icon: 'close',
    variant: 'destructive',
    onClick: () => console.log('Delete')
  }]} />
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'center'
    }}>
        <div>Menu is {isOpen ? 'open' : 'closed'}</div>
        <DropdownMenu button={{
        label: 'Controlled Menu'
      }} isMenuOpen={isOpen} onOpenChange={setIsOpen} items={[{
        label: 'Item 1',
        onClick: () => console.log('Item 1')
      }, {
        label: 'Item 2',
        onClick: () => console.log('Item 2')
      }, {
        label: 'Item 3',
        onClick: () => console.log('Item 3')
      }]} />
      </div>;
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Wide Menu'
  }} menuWidth={300} items={[{
    label: 'This is a longer option that needs more space',
    onClick: () => console.log('Option 1')
  }, {
    label: 'Another long option with extra text',
    onClick: () => console.log('Option 2')
  }, {
    label: 'Short one',
    onClick: () => console.log('Option 3')
  }]} />
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap'
  }}>
      <DropdownMenu button={{
      label: 'Secondary',
      variant: 'secondary'
    }} items={[{
      label: 'Option 1'
    }, {
      label: 'Option 2'
    }]} />
      <DropdownMenu button={{
      label: 'Primary',
      variant: 'primary'
    }} items={[{
      label: 'Option 1'
    }, {
      label: 'Option 2'
    }]} />
      <DropdownMenu button={{
      label: 'Ghost',
      variant: 'ghost'
    }} items={[{
      label: 'Option 1'
    }, {
      label: 'Option 2'
    }]} />
      <DropdownMenu button={{
      label: 'Destructive',
      variant: 'destructive'
    }} items={[{
      label: 'Option 1'
    }, {
      label: 'Option 2'
    }]} />
    </div>
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 16,
    alignItems: 'center'
  }}>
      <DropdownMenu button={{
      label: 'Small',
      size: 'sm'
    }} items={[{
      label: 'Option 1'
    }, {
      label: 'Option 2'
    }]} />
      <DropdownMenu button={{
      label: 'Medium',
      size: 'md'
    }} items={[{
      label: 'Option 1'
    }, {
      label: 'Option 2'
    }]} />
      <DropdownMenu button={{
      label: 'Large',
      size: 'lg'
    }} items={[{
      label: 'Option 1'
    }, {
      label: 'Option 2'
    }]} />
    </div>
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [clickCount, setClickCount] = useState(0);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'center'
    }}>
        <div>Button clicked {clickCount} times</div>
        <DropdownMenu button={{
        label: 'Click Me'
      }} onClick={() => setClickCount(c => c + 1)} items={[{
        label: 'Menu Item',
        onClick: () => console.log('Item clicked')
      }]} />
      </div>;
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [copied, setCopied] = useState(false);
    return <DropdownMenu button={{
      label: 'Session'
    }} items={[{
      label: copied ? 'Copied' : 'Copy session ID',
      icon: <DocumentDuplicateIcon style={{
        width: 16,
        height: 16
      }} />,
      hasCloseOnSelect: false,
      onClick: () => setCopied(true)
    }, {
      label: 'Rename'
    }, {
      label: 'Delete',
      variant: 'destructive'
    }]} onOpenChange={isOpen => {
      if (!isOpen) {
        setCopied(false);
      }
    }} />;
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Select User'
  }} menuWidth={280}>
      <DropdownMenuItem icon={UserIcon} label="Alice Johnson" description="alice.johnson@example.com" onClick={() => console.log('Alice')} />
      <DropdownMenuItem icon={UserIcon} label="Bob Smith" description="bob.smith@example.com" onClick={() => console.log('Bob')} />
      <DropdownMenuItem icon={UserIcon} label="Carol Williams" description="carol.williams@example.com" onClick={() => console.log('Carol')} />
    </DropdownMenu>
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 16,
    alignItems: 'center'
  }}>
      <DropdownMenu button={{
      label: 'More options',
      icon: <EllipsisHorizontalIcon />,
      variant: 'ghost',
      isIconOnly: true
    }} items={[{
      label: 'Edit',
      icon: PencilIcon,
      onClick: () => console.log('Edit')
    }, {
      label: 'Delete',
      icon: TrashIcon,
      onClick: () => console.log('Delete')
    }]} />
      <DropdownMenu button={{
      label: 'Settings',
      icon: <Cog6ToothIcon />,
      variant: 'secondary',
      isIconOnly: true
    }} items={[{
      label: 'Preferences',
      onClick: () => console.log('Preferences')
    }, {
      label: 'Account',
      onClick: () => console.log('Account')
    }]} />
    </div>
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Settings',
    icon: <Cog6ToothIcon />,
    variant: 'ghost',
    children: 'Settings'
  }} items={[{
    label: 'Preferences',
    onClick: () => console.log('Preferences')
  }, {
    label: 'Account',
    onClick: () => console.log('Account')
  }]} />
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Sort by: Name',
    variant: 'ghost'
  }} hasChevron={false} items={[{
    label: 'Name',
    onClick: () => console.log('Name')
  }, {
    label: 'Date',
    onClick: () => console.log('Date')
  }, {
    label: 'Size',
    onClick: () => console.log('Size')
  }]} />
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Actions'
  }}>
      <DropdownMenuItem icon={PencilIcon} label="Edit" onClick={() => console.log('Edit')} />
      <DropdownMenuItem icon={DocumentDuplicateIcon} label="Duplicate" onClick={() => console.log('Duplicate')} />
      <DropdownMenuDivider />
      <DropdownMenuItem icon={TrashIcon} label="Delete" onClick={() => console.log('Delete')} />
    </DropdownMenu>
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'File Actions'
  }}>
      <DropdownMenuItem icon={PencilIcon} label="Edit" onClick={() => console.log('Edit')} />
      <DropdownMenuItem icon={DocumentDuplicateIcon} label="Duplicate" onClick={() => console.log('Duplicate')} />
      <DropdownMenuDivider />
      <DropdownMenuItem icon={TrashIcon} label="Delete (no permission)" isDisabled />
    </DropdownMenu>
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [canDelete, setCanDelete] = useState(false);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'center'
    }}>
        <label style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }}>
          <input type="checkbox" checked={canDelete} onChange={e => setCanDelete(e.target.checked)} />
          Show delete option
        </label>
        <DropdownMenu button={{
        label: 'Actions'
      }}>
          <DropdownMenuItem icon={PencilIcon} label="Edit" onClick={() => console.log('Edit')} />
          <DropdownMenuItem icon={ShareIcon} label="Share" onClick={() => console.log('Share')} />
          {canDelete && <>
              <DropdownMenuDivider />
              <DropdownMenuItem icon={TrashIcon} label="Delete" onClick={() => console.log('Delete')} />
            </>}
        </DropdownMenu>
      </div>;
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Select User'
  }} menuWidth={280}>
      <DropdownMenuItem icon={UserIcon} label="Alice Johnson" description="alice.johnson@example.com" onClick={() => console.log('Alice')} />
      <DropdownMenuItem icon={UserIcon} label="Bob Smith" description="bob.smith@example.com" onClick={() => console.log('Bob')} />
      <DropdownMenuItem icon={UserIcon} label="Carol Williams" description="carol.williams@example.com" onClick={() => console.log('Carol')} />
    </DropdownMenu>
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Bottom toolbar menu'
  }} placement="above" items={[{
    label: 'Edit',
    onClick: () => console.log('Edit')
  }, {
    label: 'Duplicate',
    onClick: () => console.log('Duplicate')
  }, {
    label: 'Delete',
    onClick: () => console.log('Delete')
  }]} />
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Row actions'
  }} alignment="end" menuWidth={220} items={[{
    label: 'Edit',
    onClick: () => console.log('Edit')
  }, {
    label: 'Duplicate',
    onClick: () => console.log('Duplicate')
  }, {
    label: 'Delete',
    onClick: () => console.log('Delete')
  }]} />,
  parameters: {
    docs: {
      description: {
        story: 'Use alignment="end" when a menu should extend back over the trigger, such as a row action menu near the inline-end edge.'
      }
    }
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    direction: 'rtl',
    display: 'flex',
    gap: '16px'
  }}>
      <DropdownMenu button={{
      label: 'CSS direction: rtl'
    }} items={[{
      label: 'Edit',
      onClick: () => console.log('Edit')
    }, {
      label: 'Duplicate',
      onClick: () => console.log('Duplicate')
    }, {
      label: 'Delete',
      onClick: () => console.log('Delete')
    }]} />
      <div dir="ltr">
        <div dir="rtl">
          <DropdownMenu button={{
          label: 'dir="rtl" attribute'
        }} items={[{
          label: 'Edit',
          onClick: () => console.log('Edit')
        }, {
          label: 'Duplicate',
          onClick: () => console.log('Duplicate')
        }, {
          label: 'Delete',
          onClick: () => console.log('Delete')
        }]} />
        </div>
      </div>
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'In RTL contexts (CSS direction property or dir attribute) the menu right-edge-aligns to the trigger and grows toward the left — the logical mirror of the LTR default (#3389). Both direction mechanisms are shown; the popover inherits direction from the trigger subtree and the self-* position-area keywords mirror it in pure CSS.'
      }
    }
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: function LabCheckboxItemsStory() {
    const [showArchived, setShowArchived] = useState(false);
    const [showDrafts, setShowDrafts] = useState(true);
    return <DropdownMenu button={{
      label: 'View'
    }}>
        <DropdownMenuCheckboxItem label="Show archived" value={showArchived} onChange={setShowArchived} />
        <DropdownMenuCheckboxItem label="Show drafts" description="Include unpublished items" value={showDrafts} onChange={setShowDrafts} />
      </DropdownMenu>;
  },
  parameters: {
    docs: {
      description: {
        story: 'DropdownMenuCheckboxItem — independent toggles (role="menuitemcheckbox"). The menu stays open on toggle by default so several can be flipped at once.'
      }
    }
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: function LabRadioGroupStory() {
    const [sort, setSort] = useState('newest');
    return <DropdownMenu button={{
      label: 'Sort'
    }}>
        <DropdownMenuRadioGroup value={sort} onChange={setSort} label="Sort by">
          <DropdownMenuRadioItem value="newest" label="Newest" />
          <DropdownMenuRadioItem value="oldest" label="Oldest" />
          <DropdownMenuRadioItem value="az" label="Alphabetical" description="A → Z" />
        </DropdownMenuRadioGroup>
      </DropdownMenu>;
  },
  parameters: {
    docs: {
      description: {
        story: 'DropdownMenuRadioGroup + DropdownMenuRadioItem — single-select group (role="menuitemradio"). Selecting closes the menu by default.'
      }
    }
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: function LabSelectableSizesStory() {
    const [sm, setSm] = useState('a');
    const [lg, setLg] = useState('a');
    return <div style={{
      display: 'flex',
      gap: 24
    }}>
        <DropdownMenu button={{
        label: 'Small menu',
        size: 'sm'
      }}>
          <DropdownMenuRadioGroup value={sm} onChange={setSm} label="Small">
            <DropdownMenuRadioItem value="a" label="Option A" />
            <DropdownMenuRadioItem value="b" label="Option B" />
          </DropdownMenuRadioGroup>
        </DropdownMenu>
        <DropdownMenu button={{
        label: 'Large menu',
        size: 'lg'
      }}>
          <DropdownMenuRadioGroup value={lg} onChange={setLg} label="Large">
            <DropdownMenuRadioItem value="a" label="Option A" />
            <DropdownMenuRadioItem value="b" label="Option B" />
          </DropdownMenuRadioGroup>
        </DropdownMenu>
      </div>;
  },
  parameters: {
    docs: {
      description: {
        story: 'The checkbox/radio control size is derived from the menu item size — a \`sm\` menu renders the small (18px) control, \`md\`/\`lg\` render the standard (22px) control. On coarse-pointer (touch) devices the control swaps to the inline-end of the row.'
      }
    }
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Actions'
  }}>
      <DropdownMenuItem icon={PencilIcon} label="Rename" onClick={() => {}} />
      <DropdownMenuSubMenu icon={FolderPlusIcon} label="Move to">
        <DropdownMenuItem label="Folder A" onClick={() => {}} />
        <DropdownMenuItem label="Folder B" onClick={() => {}} />
        <DropdownMenuItem label="Folder C" onClick={() => {}} />
      </DropdownMenuSubMenu>
      <DropdownMenuItem icon={TrashIcon} label="Delete" onClick={() => {}} />
    </DropdownMenu>,
  parameters: {
    docs: {
      description: {
        story: 'DropdownMenuSubMenu is a single menu row that reveals a nested flyout of its own children. Hover or Right arrow (Left in RTL) / Enter / Space opens it and moves focus to its first item; Left arrow / Escape closes it and returns focus to the trigger. The flyout opens inline-end by default and auto-flips at the viewport edge.'
      }
    }
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Share'
  }}>
      <DropdownMenuItem icon={ShareIcon} label="Copy link" onClick={() => {}} />
      <DropdownMenuSubMenu label="Share to">
        <DropdownMenuItem label="Email" onClick={() => {}} />
        <DropdownMenuSubMenu label="Team">
          <DropdownMenuItem label="Design" onClick={() => {}} />
          <DropdownMenuItem label="Engineering" onClick={() => {}} />
        </DropdownMenuSubMenu>
      </DropdownMenuSubMenu>
    </DropdownMenu>,
  parameters: {
    docs: {
      description: {
        story: 'Submenus nest to arbitrary depth — each level owns its own roving focus and positioning layer.'
      }
    }
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Actions'
  }}>
      <DropdownMenuItem label="Rename" onClick={() => {}} />
      <DropdownMenuSubMenu label="Move to" hasSpinner>
        <DropdownMenuItem label="Loading…" isDisabled onClick={() => {}} />
      </DropdownMenuSubMenu>
    </DropdownMenu>,
  parameters: {
    docs: {
      description: {
        story: 'A submenu row can show a spinner in place of the caret via \`hasSpinner\`, e.g. while a lazy submenu\\u2019s children load.'
      }
    }
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu button={{
    label: 'Actions'
  }} items={[{
    label: 'Rename',
    onClick: () => {}
  }, {
    label: 'Move to',
    icon: FolderPlusIcon,
    items: [{
      label: 'Folder A',
      onClick: () => {}
    }, {
      label: 'Folder B',
      onClick: () => {}
    }]
  }, {
    type: 'divider'
  }, {
    label: 'Delete',
    onClick: () => {}
  }]} />,
  parameters: {
    docs: {
      description: {
        story: 'Data-driven parity: give a menu item a nested \`items\` array and it becomes a submenu automatically — no separate item type.'
      }
    }
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'padded'
  },
  render: () => <div style={{
    display: 'flex',
    gap: 160,
    justifyContent: 'center'
  }}>
      <DropdownMenu button={{
      label: 'Data mode'
    }} menuWidth={220} items={[{
      label: 'Search',
      icon: MagnifyingGlassIcon,
      endContent: <Badge label="⌘K" />
    }, {
      label: 'Duplicate',
      icon: DocumentDuplicateIcon,
      endContent: <Badge label="⌘D" />
    }, {
      type: 'divider'
    }, {
      label: 'Delete',
      icon: TrashIcon,
      variant: 'destructive'
    }]} />
      <DropdownMenu button={{
      label: 'Compound mode'
    }} menuWidth={220}>
        <DropdownMenuItem icon={MagnifyingGlassIcon} label="Search" endContent={<Badge label="⌘K" />} />
        <DropdownMenuItem icon={DocumentDuplicateIcon} label="Duplicate" endContent={<Badge label="⌘D" />} />
        <DropdownMenuDivider />
        <DropdownMenuItem icon={TrashIcon} label="Delete" variant="destructive" />
      </DropdownMenu>
    </div>
}`,...$.parameters?.docs?.source}}},se=`Default.WithIcons.WithSections.WithDividers.WithDisabledItems.DestructiveItem.Controlled.CustomWidth.ButtonVariants.ButtonSizes.WithOnClick.StaysOpenOnSelect.CustomItemRender.IconOnly.IconWithLabel.NoChevron.CompoundBasic.CompoundWithDisabled.CompoundConditional.CompoundWithDescriptions.PlacementAbove.AlignmentEnd.RTL.LabCheckboxItems.LabRadioGroup.LabSelectableSizes.Submenu.NestedSubmenu.SubmenuAsyncSpinner.SubmenuDataDriven.ModeParity`.split(`.`)}))();export{W as AlignmentEnd,M as ButtonSizes,j as ButtonVariants,z as CompoundBasic,V as CompoundConditional,H as CompoundWithDescriptions,B as CompoundWithDisabled,k as Controlled,F as CustomItemRender,A as CustomWidth,C as Default,O as DestructiveItem,I as IconOnly,L as IconWithLabel,K as LabCheckboxItems,q as LabRadioGroup,J as LabSelectableSizes,$ as ModeParity,X as NestedSubmenu,R as NoChevron,U as PlacementAbove,G as RTL,P as StaysOpenOnSelect,Y as Submenu,Z as SubmenuAsyncSpinner,Q as SubmenuDataDriven,D as WithDisabledItems,E as WithDividers,w as WithIcons,N as WithOnClick,T as WithSections,se as __namedExportsOrder,S as default};