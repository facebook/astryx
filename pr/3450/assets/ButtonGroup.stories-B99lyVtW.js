import{ah as r,a1 as e,B as o,I as g}from"./iframe-Cw8JXX6x.js";import{B as t}from"./ButtonGroup-zttiVSYP.js";import{I as B}from"./IconButton-7QLz3YeV.js";import{F as h}from"./ClipboardDocumentIcon-DISZeOaL.js";import{F as v,a as w}from"./ScissorsIcon-DlO9lKz3.js";import{F as f,a as I,b as S}from"./UnderlineIcon-BuXidsBr.js";import"./preload-helper-Ct5FWWRu.js";import"./useListFocus-D1vlaBt6.js";function z({title:n,titleId:s,...i},l){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:l,"aria-labelledby":s},i),n?r.createElement("title",{id:s},n):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"}))}const C=r.forwardRef(z);function G({title:n,titleId:s,...i},l){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:l,"aria-labelledby":s},i),n?r.createElement("title",{id:s},n):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"}))}const R=r.forwardRef(G);function E({title:n,titleId:s,...i},l){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:l,"aria-labelledby":s},i),n?r.createElement("title",{id:s},n):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m19.5 8.25-7.5 7.5-7.5-7.5"}))}const j=r.forwardRef(E),A={title:"Core/ButtonGroup",component:t,tags:["autodocs"],argTypes:{orientation:{control:"select",options:["horizontal","vertical"]},size:{control:"select",options:["sm","md","lg"]}}},a={width:16,height:16},c={render:()=>e.jsxs(t,{label:"Clipboard actions",children:[e.jsx(o,{label:"Copy",icon:e.jsx(h,{style:a})}),e.jsx(o,{label:"Cut",icon:e.jsx(v,{style:a})}),e.jsx(o,{label:"Paste",icon:e.jsx(w,{style:a})})]})},d={render:()=>e.jsxs(t,{label:"Actions",orientation:"vertical",children:[e.jsx(o,{label:"Copy"}),e.jsx(o,{label:"Cut"}),e.jsx(o,{label:"Paste"})]})},p={render:()=>e.jsxs(t,{label:"Text formatting",children:[e.jsx(B,{label:"Bold",icon:e.jsx(g,{icon:f,size:"sm"})}),e.jsx(B,{label:"Italic",icon:e.jsx(g,{icon:I,size:"sm"})}),e.jsx(B,{label:"Underline",icon:e.jsx(g,{icon:S,size:"sm"})})]})},u={render:()=>e.jsxs(t,{label:"History",children:[e.jsx(o,{label:"Undo",variant:"ghost",icon:e.jsx(C,{style:a}),isIconOnly:!0}),e.jsx(o,{label:"Redo",variant:"ghost",icon:e.jsx(R,{style:a}),isIconOnly:!0})]})},m={render:()=>e.jsxs("div",{style:{display:"flex",gap:16,alignItems:"center"},children:[e.jsxs(t,{label:"Small actions",size:"sm",children:[e.jsx(o,{label:"Copy"}),e.jsx(o,{label:"Paste"})]}),e.jsxs(t,{label:"Medium actions",size:"md",children:[e.jsx(o,{label:"Copy"}),e.jsx(o,{label:"Paste"})]}),e.jsxs(t,{label:"Large actions",size:"lg",children:[e.jsx(o,{label:"Copy"}),e.jsx(o,{label:"Paste"})]})]})},b={render:()=>e.jsxs(t,{label:"Save options",children:[e.jsx(o,{label:"Save",variant:"primary"}),e.jsx(o,{label:"Save options",variant:"primary",icon:e.jsx(j,{style:a}),isIconOnly:!0})]})},y={render:()=>e.jsxs(t,{label:"Merge options",children:[e.jsx(o,{label:"Merge pull request",variant:"primary"}),e.jsx(o,{label:"More merge options",variant:"primary",icon:e.jsx(j,{style:a}),isIconOnly:!0})]})},x={render:()=>e.jsxs(t,{label:"Edit actions",children:[e.jsx(o,{label:"Edit"}),e.jsx(B,{label:"More options",icon:e.jsx(j,{style:a})})]})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Clipboard actions">
      <Button label="Copy" icon={<ClipboardDocumentIcon style={iconSize} />} />
      <Button label="Cut" icon={<ScissorsIcon style={iconSize} />} />
      <Button label="Paste" icon={<ClipboardIcon style={iconSize} />} />
    </ButtonGroup>
}`,...c.parameters?.docs?.source},description:{story:"Basic horizontal button group with text buttons.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Actions" orientation="vertical">
      <Button label="Copy" />
      <Button label="Cut" />
      <Button label="Paste" />
    </ButtonGroup>
}`,...d.parameters?.docs?.source},description:{story:"Vertical button group.",...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Text formatting">
      <IconButton label="Bold" icon={<Icon icon={BoldIcon} size="sm" />} />
      <IconButton label="Italic" icon={<Icon icon={ItalicIcon} size="sm" />} />
      <IconButton label="Underline" icon={<Icon icon={UnderlineIcon} size="sm" />} />
    </ButtonGroup>
}`,...p.parameters?.docs?.source},description:{story:"Icon-only button group for compact toolbars.",...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="History">
      <Button label="Undo" variant="ghost" icon={<ArrowUturnLeftIcon style={iconSize} />} isIconOnly />
      <Button label="Redo" variant="ghost" icon={<ArrowUturnRightIcon style={iconSize} />} isIconOnly />
    </ButtonGroup>
}`,...u.parameters?.docs?.source},description:{story:"Undo/redo pair with ghost variant.",...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 16,
    alignItems: 'center'
  }}>
      <ButtonGroup label="Small actions" size="sm">
        <Button label="Copy" />
        <Button label="Paste" />
      </ButtonGroup>
      <ButtonGroup label="Medium actions" size="md">
        <Button label="Copy" />
        <Button label="Paste" />
      </ButtonGroup>
      <ButtonGroup label="Large actions" size="lg">
        <Button label="Copy" />
        <Button label="Paste" />
      </ButtonGroup>
    </div>
}`,...m.parameters?.docs?.source},description:{story:"All three sizes side by side.",...m.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Save options">
      <Button label="Save" variant="primary" />
      <Button label="Save options" variant="primary" icon={<ChevronDownIcon style={iconSize} />} isIconOnly />
    </ButtonGroup>
}`,...b.parameters?.docs?.source},description:{story:"Primary variant button group.",...b.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Merge options">
      <Button label="Merge pull request" variant="primary" />
      <Button label="More merge options" variant="primary" icon={<ChevronDownIcon style={iconSize} />} isIconOnly />
    </ButtonGroup>
}`,...y.parameters?.docs?.source},description:{story:"Two-button group (common split button pattern).",...y.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Edit actions">
      <Button label="Edit" />
      <IconButton label="More options" icon={<ChevronDownIcon style={iconSize} />} />
    </ButtonGroup>
}`,...x.parameters?.docs?.source},description:{story:"Mixed button and icon button children.",...x.parameters?.docs?.description}}};const D=["Horizontal","Vertical","IconOnly","GhostPair","Sizes","PrimaryVariant","SplitButton","Mixed"];export{u as GhostPair,c as Horizontal,p as IconOnly,x as Mixed,b as PrimaryVariant,m as Sizes,y as SplitButton,d as Vertical,D as __namedExportsOrder,A as default};
