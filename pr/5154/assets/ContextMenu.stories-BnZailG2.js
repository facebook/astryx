import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{s as i}from"./renderDropdownItems-CkWYSASr.js";import{t as a}from"./Divider-Bnz7ZhwU.js";import{t as o}from"./Divider-BLN6xOwW.js";import{a as s,r as c,t as l}from"./DropdownMenuRadioItem-U5ZytJpU.js";import{n as u,t as d}from"./ContextMenu-D4H7SJnN.js";import{A as f,I as p,Jt as m,O as h,Pn as g,Pt as _,Xt as v,m as y,t as b}from"./esm-CL1f8dHF.js";var x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I;e((()=>{x=t(n()),d(),o(),b(),S=r(),C={title:`Core/ContextMenu`,component:u,tags:[`autodocs`],parameters:{layout:`centered`},argTypes:{items:{description:`Menu items (items, dividers, or sections)`},menuWidth:{control:`text`,description:`Custom menu width (number for px or CSS string)`},size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Menu item size`},isDisabled:{control:`boolean`,description:`Disable custom context menu`},"data-testid":{control:`text`,description:`Test ID for testing frameworks`}}},w={render:()=>(0,S.jsx)(u,{items:[{label:`Cut`,onClick:()=>console.log(`Cut`)},{label:`Copy`,onClick:()=>console.log(`Copy`)},{label:`Paste`,onClick:()=>console.log(`Paste`)}],children:(0,S.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click this area`})})},T={render:()=>(0,S.jsx)(u,{items:[{label:`Cut`,icon:f,onClick:()=>console.log(`Cut`)},{label:`Copy`,icon:v,onClick:()=>console.log(`Copy`)},{label:`Paste`,icon:m,onClick:()=>console.log(`Paste`)},{type:`divider`},{label:`Delete`,icon:y,onClick:()=>console.log(`Delete`)}],children:(0,S.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for actions`})})},E={name:`Destructive item`,render:()=>(0,S.jsx)(u,{items:[{label:`Rename`,onClick:()=>console.log(`Rename`)},{label:`Duplicate`,icon:v,onClick:()=>console.log(`Duplicate`)},{type:`divider`},{label:`Delete`,icon:y,variant:`destructive`,onClick:()=>console.log(`Delete`)}],children:(0,S.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for actions`})})},D={render:()=>(0,S.jsx)(u,{items:[{type:`section`,title:`Edit`,items:[{label:`Cut`,icon:f,onClick:()=>console.log(`Cut`)},{label:`Copy`,icon:v,onClick:()=>console.log(`Copy`)},{label:`Paste`,icon:m,onClick:()=>console.log(`Paste`)}]},{type:`section`,title:`Share`,items:[{label:`Share`,icon:h,onClick:()=>console.log(`Share`)},{label:`Download`,icon:g,onClick:()=>console.log(`Download`)}]}],children:(0,S.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for grouped actions`})})},O={render:()=>(0,S.jsx)(u,{items:[{label:`Edit`,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,onClick:()=>console.log(`Duplicate`)},{type:`divider`},{label:`Delete`,onClick:()=>console.log(`Delete`)}],children:(0,S.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click this area`})})},k={render:()=>(0,S.jsx)(u,{items:[{label:`Edit`,icon:p,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,icon:_,onClick:()=>console.log(`Duplicate`)},{label:`Delete (no permission)`,icon:y,isDisabled:!0}],children:(0,S.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click this area`})})},A={render:()=>(0,S.jsx)(u,{menuWidth:280,items:[{label:`This is a longer option that needs more space`,onClick:()=>console.log(`Option 1`)},{label:`Another long option`,onClick:()=>console.log(`Option 2`)},{label:`Short`,onClick:()=>console.log(`Option 3`)}],children:(0,S.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for wide menu`})})},j={render:()=>(0,S.jsx)(u,{size:`sm`,items:[{label:`Cut`,onClick:()=>console.log(`Cut`)},{label:`Copy`,onClick:()=>console.log(`Copy`)},{label:`Paste`,onClick:()=>console.log(`Paste`)}],children:(0,S.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for compact menu`})})},M={render:()=>(0,S.jsx)(u,{isDisabled:!0,items:[{label:`Cut`,onClick:()=>console.log(`Cut`)},{label:`Copy`,onClick:()=>console.log(`Copy`)}],children:(0,S.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click shows native menu (disabled)`})})},N={render:()=>(0,S.jsx)(u,{menuContent:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(i,{icon:p,label:`Edit`,onClick:()=>console.log(`Edit`)}),(0,S.jsx)(i,{icon:_,label:`Duplicate`,onClick:()=>console.log(`Duplicate`)}),(0,S.jsx)(a,{}),(0,S.jsx)(i,{icon:y,label:`Delete`,onClick:()=>console.log(`Delete`)})]}),children:(0,S.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for compound menu`})})},P={render:()=>(0,S.jsx)(u,{menuWidth:280,menuContent:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(i,{icon:p,label:`Edit`,description:`Modify this item`,onClick:()=>console.log(`Edit`)}),(0,S.jsx)(i,{icon:h,label:`Share`,description:`Share with others`,onClick:()=>console.log(`Share`)}),(0,S.jsx)(a,{}),(0,S.jsx)(i,{icon:y,label:`Delete`,description:`Permanently remove`,onClick:()=>console.log(`Delete`)})]}),children:(0,S.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for detailed menu`})})},F={render:function(){let[e,t]=(0,x.useState)(`name`),[n,r]=(0,x.useState)(!1),[o,d]=(0,x.useState)(!0);return(0,S.jsx)(u,{menuWidth:220,menuContent:(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(i,{icon:p,label:`Rename`,onClick:()=>console.log(`Rename`)}),(0,S.jsx)(a,{}),(0,S.jsxs)(c,{value:e,onChange:t,label:`Sort by`,children:[(0,S.jsx)(l,{value:`name`,label:`Sort by name`}),(0,S.jsx)(l,{value:`date`,label:`Sort by date`}),(0,S.jsx)(l,{value:`size`,label:`Sort by size`})]}),(0,S.jsx)(a,{}),(0,S.jsx)(s,{label:`Show hidden files`,value:n,onChange:r}),(0,S.jsx)(s,{label:`Show preview pane`,value:o,onChange:d})]}),children:(0,S.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for selectable items`})})},parameters:{docs:{description:{story:`Checkbox and radio menu items compose inside a ContextMenu just like in a DropdownMenu. The radio group is a single-select set (menuitemradio) that closes the menu on selection; the checkbox items are independent toggles (menuitemcheckbox) that keep the menu open so several can be flipped. Arrow keys, typeahead, and Enter/Space traverse and activate all three row types alongside plain items.`}}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <ContextMenu items={[{
    label: 'Cut',
    onClick: () => console.log('Cut')
  }, {
    label: 'Copy',
    onClick: () => console.log('Copy')
  }, {
    label: 'Paste',
    onClick: () => console.log('Paste')
  }]}>
      <div {...stylex.props(triggerStyles.area)}>Right-click this area</div>
    </ContextMenu>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <ContextMenu items={[{
    label: 'Cut',
    icon: ScissorsIcon,
    onClick: () => console.log('Cut')
  }, {
    label: 'Copy',
    icon: ClipboardDocumentIcon,
    onClick: () => console.log('Copy')
  }, {
    label: 'Paste',
    icon: ClipboardIcon,
    onClick: () => console.log('Paste')
  }, {
    type: 'divider'
  }, {
    label: 'Delete',
    icon: TrashIcon,
    onClick: () => console.log('Delete')
  }]}>
      <div {...stylex.props(triggerStyles.area)}>Right-click for actions</div>
    </ContextMenu>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'Destructive item',
  render: () => <ContextMenu items={[{
    label: 'Rename',
    onClick: () => console.log('Rename')
  }, {
    label: 'Duplicate',
    icon: ClipboardDocumentIcon,
    onClick: () => console.log('Duplicate')
  }, {
    type: 'divider'
  }, {
    label: 'Delete',
    icon: TrashIcon,
    variant: 'destructive',
    onClick: () => console.log('Delete')
  }]}>
      <div {...stylex.props(triggerStyles.area)}>Right-click for actions</div>
    </ContextMenu>
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <ContextMenu items={[{
    type: 'section',
    title: 'Edit',
    items: [{
      label: 'Cut',
      icon: ScissorsIcon,
      onClick: () => console.log('Cut')
    }, {
      label: 'Copy',
      icon: ClipboardDocumentIcon,
      onClick: () => console.log('Copy')
    }, {
      label: 'Paste',
      icon: ClipboardIcon,
      onClick: () => console.log('Paste')
    }]
  }, {
    type: 'section',
    title: 'Share',
    items: [{
      label: 'Share',
      icon: ShareIcon,
      onClick: () => console.log('Share')
    }, {
      label: 'Download',
      icon: ArrowDownTrayIcon,
      onClick: () => console.log('Download')
    }]
  }]}>
      <div {...stylex.props(triggerStyles.area)}>
        Right-click for grouped actions
      </div>
    </ContextMenu>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <ContextMenu items={[{
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
  }]}>
      <div {...stylex.props(triggerStyles.area)}>Right-click this area</div>
    </ContextMenu>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <ContextMenu items={[{
    label: 'Edit',
    icon: PencilIcon,
    onClick: () => console.log('Edit')
  }, {
    label: 'Duplicate',
    icon: DocumentDuplicateIcon,
    onClick: () => console.log('Duplicate')
  }, {
    label: 'Delete (no permission)',
    icon: TrashIcon,
    isDisabled: true
  }]}>
      <div {...stylex.props(triggerStyles.area)}>Right-click this area</div>
    </ContextMenu>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <ContextMenu menuWidth={280} items={[{
    label: 'This is a longer option that needs more space',
    onClick: () => console.log('Option 1')
  }, {
    label: 'Another long option',
    onClick: () => console.log('Option 2')
  }, {
    label: 'Short',
    onClick: () => console.log('Option 3')
  }]}>
      <div {...stylex.props(triggerStyles.area)}>Right-click for wide menu</div>
    </ContextMenu>
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <ContextMenu size="sm" items={[{
    label: 'Cut',
    onClick: () => console.log('Cut')
  }, {
    label: 'Copy',
    onClick: () => console.log('Copy')
  }, {
    label: 'Paste',
    onClick: () => console.log('Paste')
  }]}>
      <div {...stylex.props(triggerStyles.area)}>
        Right-click for compact menu
      </div>
    </ContextMenu>
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <ContextMenu isDisabled items={[{
    label: 'Cut',
    onClick: () => console.log('Cut')
  }, {
    label: 'Copy',
    onClick: () => console.log('Copy')
  }]}>
      <div {...stylex.props(triggerStyles.area)}>
        Right-click shows native menu (disabled)
      </div>
    </ContextMenu>
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <ContextMenu menuContent={<>
          <ContextMenuItem icon={PencilIcon} label="Edit" onClick={() => console.log('Edit')} />
          <ContextMenuItem icon={DocumentDuplicateIcon} label="Duplicate" onClick={() => console.log('Duplicate')} />
          <Divider />
          <ContextMenuItem icon={TrashIcon} label="Delete" onClick={() => console.log('Delete')} />
        </>}>
      <div {...stylex.props(triggerStyles.area)}>
        Right-click for compound menu
      </div>
    </ContextMenu>
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <ContextMenu menuWidth={280} menuContent={<>
          <ContextMenuItem icon={PencilIcon} label="Edit" description="Modify this item" onClick={() => console.log('Edit')} />
          <ContextMenuItem icon={ShareIcon} label="Share" description="Share with others" onClick={() => console.log('Share')} />
          <Divider />
          <ContextMenuItem icon={TrashIcon} label="Delete" description="Permanently remove" onClick={() => console.log('Delete')} />
        </>}>
      <div {...stylex.props(triggerStyles.area)}>
        Right-click for detailed menu
      </div>
    </ContextMenu>
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: function WithSelectableItemsStory() {
    const [sort, setSort] = useState('name');
    const [showHidden, setShowHidden] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    return <ContextMenu menuWidth={220} menuContent={<>
            <ContextMenuItem icon={PencilIcon} label="Rename" onClick={() => console.log('Rename')} />
            <Divider />
            <ContextMenuRadioGroup value={sort} onChange={setSort} label="Sort by">
              <ContextMenuRadioItem value="name" label="Sort by name" />
              <ContextMenuRadioItem value="date" label="Sort by date" />
              <ContextMenuRadioItem value="size" label="Sort by size" />
            </ContextMenuRadioGroup>
            <Divider />
            <ContextMenuCheckboxItem label="Show hidden files" value={showHidden} onChange={setShowHidden} />
            <ContextMenuCheckboxItem label="Show preview pane" value={showPreview} onChange={setShowPreview} />
          </>}>
        <div {...stylex.props(triggerStyles.area)}>
          Right-click for selectable items
        </div>
      </ContextMenu>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox and radio menu items compose inside a ContextMenu just like in a DropdownMenu. The radio group is a single-select set (menuitemradio) that closes the menu on selection; the checkbox items are independent toggles (menuitemcheckbox) that keep the menu open so several can be flipped. Arrow keys, typeahead, and Enter/Space traverse and activate all three row types alongside plain items.'
      }
    }
  }
}`,...F.parameters?.docs?.source}}},I=[`Default`,`WithIcons`,`DestructiveItem`,`WithSections`,`WithDividers`,`WithDisabledItems`,`CustomWidth`,`SmallSize`,`Disabled`,`CompoundBasic`,`CompoundWithDescriptions`,`WithSelectableItems`]}))();export{N as CompoundBasic,P as CompoundWithDescriptions,A as CustomWidth,w as Default,E as DestructiveItem,M as Disabled,j as SmallSize,k as WithDisabledItems,O as WithDividers,T as WithIcons,D as WithSections,F as WithSelectableItems,I as __namedExportsOrder,C as default};