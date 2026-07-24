import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Button-DlxrQzaK.js";import{t as r}from"./Button-PY4-RRjU.js";import{n as i,t as a}from"./Icon-Csbga5uN.js";import{n as o,t as s}from"./IconButton-CqHj5u-U.js";import{t as c}from"./DropdownMenu-DxsCerqq.js";import{W as l,_i as u,gi as d}from"./iframe-DRSfIdhd.js";import{A as f,Jt as p,Kt as m,Sn as h,X as g,en as _,f as v,mn as y,t as b,wn as x}from"./esm-DA7gAIBC.js";var S,C,w,T,E,D,O,k,A,j,M,N,P;e((()=>{d(),r(),s(),a(),l(),b(),S=t(),C={title:`Core/ButtonGroup`,component:u,tags:[`autodocs`],argTypes:{orientation:{control:`select`,options:[`horizontal`,`vertical`]},size:{control:`select`,options:[`sm`,`md`,`lg`]}}},w={width:16,height:16},T={render:()=>(0,S.jsxs)(u,{label:`Clipboard actions`,children:[(0,S.jsx)(n,{label:`Copy`,icon:(0,S.jsx)(p,{style:w})}),(0,S.jsx)(n,{label:`Cut`,icon:(0,S.jsx)(f,{style:w})}),(0,S.jsx)(n,{label:`Paste`,icon:(0,S.jsx)(m,{style:w})})]})},E={render:()=>(0,S.jsxs)(u,{label:`Actions`,orientation:`vertical`,children:[(0,S.jsx)(n,{label:`Copy`}),(0,S.jsx)(n,{label:`Cut`}),(0,S.jsx)(n,{label:`Paste`})]})},D={render:()=>(0,S.jsxs)(u,{label:`Text formatting`,children:[(0,S.jsx)(o,{label:`Bold`,icon:(0,S.jsx)(i,{icon:y,size:`sm`})}),(0,S.jsx)(o,{label:`Italic`,icon:(0,S.jsx)(i,{icon:g,size:`sm`})}),(0,S.jsx)(o,{label:`Underline`,icon:(0,S.jsx)(i,{icon:v,size:`sm`}),tooltip:`Underline`})]})},O={render:()=>(0,S.jsxs)(u,{label:`History`,children:[(0,S.jsx)(n,{label:`Undo`,variant:`ghost`,icon:(0,S.jsx)(x,{style:w}),isIconOnly:!0}),(0,S.jsx)(n,{label:`Redo`,variant:`ghost`,icon:(0,S.jsx)(h,{style:w}),isIconOnly:!0})]})},k={render:()=>(0,S.jsxs)(`div`,{style:{display:`flex`,gap:16,alignItems:`center`},children:[(0,S.jsxs)(u,{label:`Small actions`,size:`sm`,children:[(0,S.jsx)(n,{label:`Copy`}),(0,S.jsx)(n,{label:`Paste`})]}),(0,S.jsxs)(u,{label:`Medium actions`,size:`md`,children:[(0,S.jsx)(n,{label:`Copy`}),(0,S.jsx)(n,{label:`Paste`})]}),(0,S.jsxs)(u,{label:`Large actions`,size:`lg`,children:[(0,S.jsx)(n,{label:`Copy`}),(0,S.jsx)(n,{label:`Paste`})]})]})},A={render:()=>(0,S.jsxs)(u,{label:`Save options`,children:[(0,S.jsx)(n,{label:`Save`,variant:`primary`}),(0,S.jsx)(n,{label:`Save options`,variant:`primary`,icon:(0,S.jsx)(_,{style:w}),isIconOnly:!0})]})},j={render:()=>(0,S.jsxs)(u,{label:`Merge options`,children:[(0,S.jsx)(n,{label:`Merge pull request`,variant:`primary`}),(0,S.jsx)(n,{label:`More merge options`,variant:`primary`,icon:(0,S.jsx)(_,{style:w}),isIconOnly:!0})]})},M={render:()=>(0,S.jsxs)(u,{label:`Edit actions`,children:[(0,S.jsx)(n,{label:`Edit`}),(0,S.jsx)(o,{label:`More options`,icon:(0,S.jsx)(_,{style:w})})]})},N={render:()=>(0,S.jsxs)(u,{label:`Approve action`,children:[(0,S.jsx)(n,{label:`Allow once`,variant:`primary`}),(0,S.jsx)(c,{hasChevron:!1,button:{label:`Allow options`,variant:`primary`,isIconOnly:!0,icon:(0,S.jsx)(i,{icon:`chevronDown`})},items:[{label:`Allow for 30 minutes`},{label:`Always allow`}]})]})},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Clipboard actions">
      <Button label="Copy" icon={<ClipboardDocumentIcon style={iconSize} />} />
      <Button label="Cut" icon={<ScissorsIcon style={iconSize} />} />
      <Button label="Paste" icon={<ClipboardIcon style={iconSize} />} />
    </ButtonGroup>
}`,...T.parameters?.docs?.source},description:{story:`Basic horizontal button group with text buttons.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Actions" orientation="vertical">
      <Button label="Copy" />
      <Button label="Cut" />
      <Button label="Paste" />
    </ButtonGroup>
}`,...E.parameters?.docs?.source},description:{story:`Vertical button group.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Text formatting">
      <IconButton label="Bold" icon={<Icon icon={BoldIcon} size="sm" />} />
      <IconButton label="Italic" icon={<Icon icon={ItalicIcon} size="sm" />} />
      <IconButton label="Underline" icon={<Icon icon={UnderlineIcon} size="sm" />} tooltip="Underline" />
    </ButtonGroup>
}`,...D.parameters?.docs?.source},description:{story:`Icon-only button group for compact toolbars.

The trailing button carries a tooltip, which renders an invisible layer after
it in the DOM — its outer corners must still round (#2508).`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="History">
      <Button label="Undo" variant="ghost" icon={<ArrowUturnLeftIcon style={iconSize} />} isIconOnly />
      <Button label="Redo" variant="ghost" icon={<ArrowUturnRightIcon style={iconSize} />} isIconOnly />
    </ButtonGroup>
}`,...O.parameters?.docs?.source},description:{story:`Undo/redo pair with ghost variant.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:`All three sizes side by side.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Save options">
      <Button label="Save" variant="primary" />
      <Button label="Save options" variant="primary" icon={<ChevronDownIcon style={iconSize} />} isIconOnly />
    </ButtonGroup>
}`,...A.parameters?.docs?.source},description:{story:`Primary variant button group.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Merge options">
      <Button label="Merge pull request" variant="primary" />
      <Button label="More merge options" variant="primary" icon={<ChevronDownIcon style={iconSize} />} isIconOnly />
    </ButtonGroup>
}`,...j.parameters?.docs?.source},description:{story:`Two-button group (common split button pattern).`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Edit actions">
      <Button label="Edit" />
      <IconButton label="More options" icon={<ChevronDownIcon style={iconSize} />} />
    </ButtonGroup>
}`,...M.parameters?.docs?.source},description:{story:`Mixed button and icon button children.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <ButtonGroup label="Approve action">
      <Button label="Allow once" variant="primary" />
      <DropdownMenu hasChevron={false} button={{
      label: 'Allow options',
      variant: 'primary',
      isIconOnly: true,
      icon: <Icon icon="chevronDown" />
    }} items={[{
      label: 'Allow for 30 minutes'
    }, {
      label: 'Always allow'
    }]} />
    </ButtonGroup>
}`,...N.parameters?.docs?.source},description:{story:`A DropdownMenu composes as a group member — the split-button pattern, with no
dedicated primitive. Its popover is an invisible DOM sibling after the
trigger, so the trailing corner must still round (#2508).`,...N.parameters?.docs?.description}}},P=[`Horizontal`,`Vertical`,`IconOnly`,`GhostPair`,`Sizes`,`PrimaryVariant`,`SplitButton`,`Mixed`,`WithDropdownMenu`]}))();export{O as GhostPair,T as Horizontal,D as IconOnly,M as Mixed,A as PrimaryVariant,k as Sizes,j as SplitButton,E as Vertical,N as WithDropdownMenu,P as __namedExportsOrder,C as default};