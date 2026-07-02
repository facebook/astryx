import{a1 as e}from"./iframe-JfpySt6L.js";import{C as o}from"./ContextMenu-B7lms9S5.js";import{a as n}from"./renderDropdownItems-Dh7vtcw0.js";import{D as C}from"./Divider-DoN3EcNV.js";import{F as x}from"./PencilIcon-BUw6uLUj.js";import{F as g}from"./DocumentDuplicateIcon-B6xpsiwB.js";import{F as m}from"./TrashIcon-DDeByIaR.js";import{F as h}from"./ShareIcon-DsViUw44.js";import{F as b,a as k}from"./ScissorsIcon-D5_DkRTd.js";import{F as f}from"./ClipboardDocumentIcon-BNdHTqNz.js";import{F as y}from"./ArrowDownTrayIcon-DybhkgVL.js";import"./preload-helper-Ct5FWWRu.js";import"./useListFocus-BWq12HVg.js";import"./Item-BE2Cczl9.js";import"./computeTargetAndRel-BlG0ENK0.js";const O={title:"Core/ContextMenu",component:o,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{items:{description:"Menu items (items, dividers, or sections)"},menuWidth:{control:"text",description:"Custom menu width (number for px or CSS string)"},size:{control:"select",options:["sm","md","lg"],description:"Menu item size"},isDisabled:{control:"boolean",description:"Disable custom context menu"},"data-testid":{control:"text",description:"Test ID for testing frameworks"}}},l={render:()=>e.jsx(o,{items:[{label:"Cut",onClick:()=>console.log("Cut")},{label:"Copy",onClick:()=>console.log("Copy")},{label:"Paste",onClick:()=>console.log("Paste")}],children:e.jsx("div",{className:"x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o",children:"Right-click this area"})})},i={render:()=>e.jsx(o,{items:[{label:"Cut",icon:b,onClick:()=>console.log("Cut")},{label:"Copy",icon:f,onClick:()=>console.log("Copy")},{label:"Paste",icon:k,onClick:()=>console.log("Paste")},{type:"divider"},{label:"Delete",icon:m,onClick:()=>console.log("Delete")}],children:e.jsx("div",{className:"x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o",children:"Right-click for actions"})})},t={render:()=>e.jsx(o,{items:[{type:"section",title:"Edit",items:[{label:"Cut",icon:b,onClick:()=>console.log("Cut")},{label:"Copy",icon:f,onClick:()=>console.log("Copy")},{label:"Paste",icon:k,onClick:()=>console.log("Paste")}]},{type:"section",title:"Share",items:[{label:"Share",icon:h,onClick:()=>console.log("Share")},{label:"Download",icon:y,onClick:()=>console.log("Download")}]}],children:e.jsx("div",{className:"x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o",children:"Right-click for grouped actions"})})},s={render:()=>e.jsx(o,{items:[{label:"Edit",onClick:()=>console.log("Edit")},{label:"Duplicate",onClick:()=>console.log("Duplicate")},{type:"divider"},{label:"Delete",onClick:()=>console.log("Delete")}],children:e.jsx("div",{className:"x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o",children:"Right-click this area"})})},r={render:()=>e.jsx(o,{items:[{label:"Edit",icon:x,onClick:()=>console.log("Edit")},{label:"Duplicate",icon:g,onClick:()=>console.log("Duplicate")},{label:"Delete (no permission)",icon:m,isDisabled:!0}],children:e.jsx("div",{className:"x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o",children:"Right-click this area"})})},c={render:()=>e.jsx(o,{menuWidth:280,items:[{label:"This is a longer option that needs more space",onClick:()=>console.log("Option 1")},{label:"Another long option",onClick:()=>console.log("Option 2")},{label:"Short",onClick:()=>console.log("Option 3")}],children:e.jsx("div",{className:"x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o",children:"Right-click for wide menu"})})},a={render:()=>e.jsx(o,{size:"sm",items:[{label:"Cut",onClick:()=>console.log("Cut")},{label:"Copy",onClick:()=>console.log("Copy")},{label:"Paste",onClick:()=>console.log("Paste")}],children:e.jsx("div",{className:"x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o",children:"Right-click for compact menu"})})},d={render:()=>e.jsx(o,{isDisabled:!0,items:[{label:"Cut",onClick:()=>console.log("Cut")},{label:"Copy",onClick:()=>console.log("Copy")}],children:e.jsx("div",{className:"x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o",children:"Right-click shows native menu (disabled)"})})},p={render:()=>e.jsx(o,{menuContent:e.jsxs(e.Fragment,{children:[e.jsx(n,{icon:x,label:"Edit",onClick:()=>console.log("Edit")}),e.jsx(n,{icon:g,label:"Duplicate",onClick:()=>console.log("Duplicate")}),e.jsx(C,{}),e.jsx(n,{icon:m,label:"Delete",onClick:()=>console.log("Delete")})]}),children:e.jsx("div",{className:"x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o",children:"Right-click for compound menu"})})},u={render:()=>e.jsx(o,{menuWidth:280,menuContent:e.jsxs(e.Fragment,{children:[e.jsx(n,{icon:x,label:"Edit",description:"Modify this item",onClick:()=>console.log("Edit")}),e.jsx(n,{icon:h,label:"Share",description:"Share with others",onClick:()=>console.log("Share")}),e.jsx(C,{}),e.jsx(n,{icon:m,label:"Delete",description:"Permanently remove",onClick:()=>console.log("Delete")})]}),children:e.jsx("div",{className:"x1o8uwn5 xdh2fpr xbsl7fq x1y0avi5 xur7f20 x2b8uid x93p4j0 x87ps6o",children:"Right-click for detailed menu"})})};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};const $=["Default","WithIcons","WithSections","WithDividers","WithDisabledItems","CustomWidth","SmallSize","Disabled","CompoundBasic","CompoundWithDescriptions"];export{p as CompoundBasic,u as CompoundWithDescriptions,c as CustomWidth,l as Default,d as Disabled,a as SmallSize,r as WithDisabledItems,s as WithDividers,i as WithIcons,t as WithSections,$ as __namedExportsOrder,O as default};
