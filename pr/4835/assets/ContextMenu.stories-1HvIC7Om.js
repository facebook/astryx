import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Divider-D4km6nVj.js";import{a,o}from"./renderDropdownItems-BttNFrw6.js";import{n as s,t as c}from"./ContextMenu-Cvd8OFMD.js";import{a as l,i as u,n as d,o as f,r as p,t as m}from"./DropdownMenuRadioItem-CAXIxLyY.js";import{n as h,t as g}from"./ArrowDownTrayIcon-CUe7-WvT.js";import{n as _,t as v}from"./ClipboardDocumentIcon-CYJylhoT.js";import{i as y,n as b,r as x,t as S}from"./ScissorsIcon--6VrF4Sg.js";import{n as C,t as w}from"./DocumentDuplicateIcon-CmljHdQx.js";import{n as T,t as E}from"./PencilIcon-B4auCeVm.js";import{n as D,t as O}from"./ShareIcon-CsrH6mRD.js";import{n as k,t as A}from"./TrashIcon-Be9eoYl2.js";var j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K;function q(){return(q=e((()=>{j=t(),s(),o(),f(),u(),d(),r(),T(),k(),C(),h(),D(),b(),y(),_(),M=n(),N={title:`Core/ContextMenu`,component:c,tags:[`autodocs`],parameters:{layout:`centered`},argTypes:{items:{description:`Menu items (items, dividers, or sections)`},menuWidth:{control:`text`,description:`Custom menu width (number for px or CSS string)`},size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Menu item size`},isDisabled:{control:`boolean`,description:`Disable custom context menu`},"data-testid":{control:`text`,description:`Test ID for testing frameworks`}}},P={render:()=>(0,M.jsx)(c,{items:[{label:`Cut`,onClick:()=>console.log(`Cut`)},{label:`Copy`,onClick:()=>console.log(`Copy`)},{label:`Paste`,onClick:()=>console.log(`Paste`)}],children:(0,M.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click this area`})})},F={render:()=>(0,M.jsx)(c,{items:[{label:`Cut`,icon:S,onClick:()=>console.log(`Cut`)},{label:`Copy`,icon:v,onClick:()=>console.log(`Copy`)},{label:`Paste`,icon:x,onClick:()=>console.log(`Paste`)},{type:`divider`},{label:`Delete`,icon:A,onClick:()=>console.log(`Delete`)}],children:(0,M.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for actions`})})},I={name:`Destructive item`,render:()=>(0,M.jsx)(c,{items:[{label:`Rename`,onClick:()=>console.log(`Rename`)},{label:`Duplicate`,icon:v,onClick:()=>console.log(`Duplicate`)},{type:`divider`},{label:`Delete`,icon:A,variant:`destructive`,onClick:()=>console.log(`Delete`)}],children:(0,M.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for actions`})})},L={render:()=>(0,M.jsx)(c,{items:[{type:`section`,title:`Edit`,items:[{label:`Cut`,icon:S,onClick:()=>console.log(`Cut`)},{label:`Copy`,icon:v,onClick:()=>console.log(`Copy`)},{label:`Paste`,icon:x,onClick:()=>console.log(`Paste`)}]},{type:`section`,title:`Share`,items:[{label:`Share`,icon:O,onClick:()=>console.log(`Share`)},{label:`Download`,icon:g,onClick:()=>console.log(`Download`)}]}],children:(0,M.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for grouped actions`})})},R={render:()=>(0,M.jsx)(c,{items:[{label:`Edit`,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,onClick:()=>console.log(`Duplicate`)},{type:`divider`},{label:`Delete`,onClick:()=>console.log(`Delete`)}],children:(0,M.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click this area`})})},z={render:()=>(0,M.jsx)(c,{items:[{label:`Edit`,icon:E,onClick:()=>console.log(`Edit`)},{label:`Duplicate`,icon:w,onClick:()=>console.log(`Duplicate`)},{label:`Delete (no permission)`,icon:A,isDisabled:!0}],children:(0,M.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click this area`})})},B={render:()=>(0,M.jsx)(c,{menuWidth:280,items:[{label:`This is a longer option that needs more space`,onClick:()=>console.log(`Option 1`)},{label:`Another long option`,onClick:()=>console.log(`Option 2`)},{label:`Short`,onClick:()=>console.log(`Option 3`)}],children:(0,M.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for wide menu`})})},V={render:()=>(0,M.jsx)(c,{size:`sm`,items:[{label:`Cut`,onClick:()=>console.log(`Cut`)},{label:`Copy`,onClick:()=>console.log(`Copy`)},{label:`Paste`,onClick:()=>console.log(`Paste`)}],children:(0,M.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for compact menu`})})},H={render:()=>(0,M.jsx)(c,{isDisabled:!0,items:[{label:`Cut`,onClick:()=>console.log(`Cut`)},{label:`Copy`,onClick:()=>console.log(`Copy`)}],children:(0,M.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click shows native menu (disabled)`})})},U={render:()=>(0,M.jsx)(c,{menuContent:(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(a,{icon:E,label:`Edit`,onClick:()=>console.log(`Edit`)}),(0,M.jsx)(a,{icon:w,label:`Duplicate`,onClick:()=>console.log(`Duplicate`)}),(0,M.jsx)(i,{}),(0,M.jsx)(a,{icon:A,label:`Delete`,onClick:()=>console.log(`Delete`)})]}),children:(0,M.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for compound menu`})})},W={render:()=>(0,M.jsx)(c,{menuWidth:280,menuContent:(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(a,{icon:E,label:`Edit`,description:`Modify this item`,onClick:()=>console.log(`Edit`)}),(0,M.jsx)(a,{icon:O,label:`Share`,description:`Share with others`,onClick:()=>console.log(`Share`)}),(0,M.jsx)(i,{}),(0,M.jsx)(a,{icon:A,label:`Delete`,description:`Permanently remove`,onClick:()=>console.log(`Delete`)})]}),children:(0,M.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for detailed menu`})})},G={render:function(){let[e,t]=(0,j.useState)(`name`),[n,r]=(0,j.useState)(!1),[o,s]=(0,j.useState)(!0);return(0,M.jsx)(c,{menuWidth:220,menuContent:(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(a,{icon:E,label:`Rename`,onClick:()=>console.log(`Rename`)}),(0,M.jsx)(i,{}),(0,M.jsxs)(p,{value:e,onChange:t,label:`Sort by`,children:[(0,M.jsx)(m,{value:`name`,label:`Sort by name`}),(0,M.jsx)(m,{value:`date`,label:`Sort by date`}),(0,M.jsx)(m,{value:`size`,label:`Sort by size`})]}),(0,M.jsx)(i,{}),(0,M.jsx)(l,{label:`Show hidden files`,value:n,onChange:r}),(0,M.jsx)(l,{label:`Show preview pane`,value:o,onChange:s})]}),children:(0,M.jsx)(`div`,{className:`x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o`,children:`Right-click for selectable items`})})},parameters:{docs:{description:{story:`Checkbox and radio menu items compose inside a ContextMenu just like in a DropdownMenu. The radio group is a single-select set (menuitemradio) that closes the menu on selection; the checkbox items are independent toggles (menuitemcheckbox) that keep the menu open so several can be flipped. Arrow keys, typeahead, and Enter/Space traverse and activate all three row types alongside plain items.`}}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K=[`Default`,`WithIcons`,`DestructiveItem`,`WithSections`,`WithDividers`,`WithDisabledItems`,`CustomWidth`,`SmallSize`,`Disabled`,`CompoundBasic`,`CompoundWithDescriptions`,`WithSelectableItems`]})))()}q();export{U as CompoundBasic,W as CompoundWithDescriptions,B as CustomWidth,P as Default,I as DestructiveItem,H as Disabled,V as SmallSize,z as WithDisabledItems,R as WithDividers,F as WithIcons,L as WithSections,G as WithSelectableItems,K as __namedExportsOrder,N as default};