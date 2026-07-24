import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{t as a}from"./Button-BBk5Kqd0.js";import{t as o}from"./Button-CRpvXAU4.js";import{n as s,t as c}from"./Popover-D3RDZ-Kb.js";import{t as l}from"./Heading-D-Ri_Mjs.js";import{i as u,o as d}from"./Stack-C7dTtCDZ.js";import{t as f}from"./Layout-BvMyrLFX.js";import{t as p}from"./Text-BUJwo4gL.js";import{t as m}from"./Divider-CyxlzlSx.js";import{t as h}from"./Divider-keWi-KmE.js";import{t as g}from"./CheckboxInput-DImPD3fv.js";import{t as _}from"./CheckboxInput-CJNf_FJg.js";import{i as v,t as y}from"./Link-Dbbw0J_w.js";import{n as b,t as x}from"./Token-BXBfAklS.js";import{Rn as S,zn as C}from"./iframe-DDpBXOWV.js";function w(){let[e,t]=D.useState(!0),[n,r]=D.useState(!1),[i,a]=D.useState(!0);return(0,O.jsxs)(u,{gap:3,children:[(0,O.jsx)(l,{level:4,tabIndex:-1,children:`Settings`}),(0,O.jsx)(m,{}),(0,O.jsx)(C,{label:`Notifications`,description:`Receive push notifications`,value:e,onChange:t}),(0,O.jsx)(C,{label:`Dark mode`,description:`Use dark color theme`,value:n,onChange:r}),(0,O.jsx)(C,{label:`Sounds`,description:`Play sounds for actions`,value:i,onChange:a})]})}function T({onApply:e}){let[t,n]=D.useState({active:!0,archived:!1,drafts:!0,shared:!1}),r=e=>n(t=>({...t,[e]:!t[e]}));return(0,O.jsxs)(u,{gap:3,children:[(0,O.jsx)(l,{level:4,tabIndex:-1,children:`Filter by status`}),(0,O.jsx)(m,{}),(0,O.jsx)(g,{label:`Active`,value:t.active,onChange:()=>r(`active`)}),(0,O.jsx)(g,{label:`Archived`,value:t.archived,onChange:()=>r(`archived`)}),(0,O.jsx)(g,{label:`Drafts`,value:t.drafts,onChange:()=>r(`drafts`)}),(0,O.jsx)(g,{label:`Shared with me`,value:t.shared,onChange:()=>r(`shared`)}),(0,O.jsx)(m,{}),(0,O.jsxs)(d,{gap:2,hAlign:`end`,children:[(0,O.jsx)(a,{label:`Apply`,variant:`primary`,onClick:e,children:`Apply`}),(0,O.jsx)(a,{label:`Reset`,variant:`ghost`,onClick:()=>n({active:!0,archived:!1,drafts:!0,shared:!1}),children:`Reset`})]})]})}function E({onConfirm:e,onCancel:t}){return(0,O.jsxs)(u,{gap:3,children:[(0,O.jsx)(l,{level:4,tabIndex:-1,children:`Delete project?`}),(0,O.jsx)(i,{type:`body`,children:`This will permanently delete the project and all its data. This action cannot be undone.`}),(0,O.jsxs)(d,{gap:2,hAlign:`end`,children:[(0,O.jsx)(a,{label:`Delete`,variant:`destructive`,onClick:e,children:`Delete`}),(0,O.jsx)(a,{label:`Cancel`,variant:`ghost`,onClick:t,children:`Cancel`})]})]})}var D,O,k,A,j,M,N,P,F,I,L,R,z;e((()=>{D=t(n()),c(),o(),x(),y(),f(),p(),S(),_(),h(),O=r(),k={title:`Core/Popover`,component:s,tags:[`autodocs`],argTypes:{placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Position relative to trigger`},alignment:{control:`select`,options:[`start`,`center`,`end`],description:`Alignment on placement axis`},isEnabled:{control:`boolean`,description:`Enable/disable the popover`}}},A={args:{placement:`below`,label:`Settings`,width:280,content:(0,O.jsx)(w,{}),children:(0,O.jsx)(a,{label:`Settings`,children:`Settings`})}},j={render:function(){let[e,t]=D.useState(!1);return(0,O.jsx)(s,{placement:`below`,label:`Filter`,width:240,isOpen:e,onOpenChange:t,content:(0,O.jsx)(T,{onApply:()=>t(!1)}),children:(0,O.jsx)(a,{label:`Filter`,children:`Filter`})})}},M={render:function(){let[e,t]=D.useState(!1);return(0,O.jsx)(s,{placement:`below`,label:`Confirm deletion`,width:300,isOpen:e,onOpenChange:t,content:(0,O.jsx)(E,{onConfirm:()=>t(!1),onCancel:()=>t(!1)}),children:(0,O.jsx)(a,{label:`Delete project`,variant:`destructive`,children:`Delete project`})})}},N={render:function(){let e=D.useRef(null);return(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(a,{ref:e,label:`Anchor button`,children:`Anchor button`}),(0,O.jsx)(s,{anchorRef:e,label:`Sibling popover`,width:260,placement:`below`,content:(0,O.jsxs)(u,{gap:2,children:[(0,O.jsx)(l,{level:4,tabIndex:-1,children:`Sibling mode`}),(0,O.jsx)(i,{type:`body`,children:`This popover uses anchorRef to attach to the button as a sibling, without wrapping it.`})]})})]})}},P={render:()=>(0,O.jsx)(`div`,{style:{paddingTop:200},children:(0,O.jsx)(s,{placement:`above`,label:`Info`,width:260,content:(0,O.jsxs)(u,{gap:2,children:[(0,O.jsx)(l,{level:4,tabIndex:-1,children:`Keyboard shortcuts`}),(0,O.jsx)(m,{}),(0,O.jsxs)(d,{gap:3,children:[(0,O.jsx)(i,{type:`body`,weight:`bold`,children:`⌘K`}),(0,O.jsx)(i,{type:`body`,children:`Command palette`})]}),(0,O.jsxs)(d,{gap:3,children:[(0,O.jsx)(i,{type:`body`,weight:`bold`,children:`⌘/`}),(0,O.jsx)(i,{type:`body`,children:`Toggle sidebar`})]}),(0,O.jsxs)(d,{gap:3,children:[(0,O.jsx)(i,{type:`body`,weight:`bold`,children:`⌘.`}),(0,O.jsx)(i,{type:`body`,children:`Quick actions`})]})]}),children:(0,O.jsx)(a,{label:`Shortcuts`,children:`Shortcuts`})})})},F={args:{placement:`below`,label:`Disabled popover`,isEnabled:!1,content:(0,O.jsx)(i,{type:`body`,children:`This should not appear.`}),children:(0,O.jsx)(a,{label:`Disabled popover`,children:`Disabled`})}},I={render:()=>(0,O.jsx)(s,{placement:`below`,label:`Token options`,width:220,content:(0,O.jsxs)(u,{gap:2,children:[(0,O.jsx)(l,{level:4,tabIndex:-1,children:`Filter options`}),(0,O.jsx)(m,{}),(0,O.jsx)(i,{type:`body`,children:`The token automatically renders as a button via context.`})]}),children:(0,O.jsx)(b,{label:`Status: Active`,icon:`filter`})})},L={render:()=>(0,O.jsx)(s,{placement:`below`,label:`Link actions`,width:220,content:(0,O.jsxs)(u,{gap:2,children:[(0,O.jsx)(l,{level:4,tabIndex:-1,children:`Quick actions`}),(0,O.jsx)(m,{}),(0,O.jsx)(i,{type:`body`,children:`Link without href renders as a button, suitable for triggers.`})]}),children:(0,O.jsx)(v,{children:`More options`})})},R={render:()=>(0,O.jsx)(s,{placement:`below`,label:`Custom trigger`,width:260,content:(0,O.jsxs)(u,{gap:2,children:[(0,O.jsx)(l,{level:4,tabIndex:-1,children:`Custom trigger`}),(0,O.jsx)(m,{}),(0,O.jsx)(i,{type:`body`,children:`The render prop gives full control over the trigger element.`})]}),children:e=>(0,O.jsx)(`button`,{ref:e.ref,onClick:e.onClick,"aria-haspopup":e[`aria-haspopup`],"aria-expanded":e[`aria-expanded`],"aria-controls":e[`aria-controls`],style:{padding:`8px 16px`,border:`1px dashed currentColor`,borderRadius:4,background:`transparent`,cursor:`pointer`},children:`Custom trigger element`})})},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    label: 'Settings',
    width: 280,
    content: <SettingsContent />,
    children: <Button label="Settings">Settings</Button>
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: function FilterPanelStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    return <Popover placement="below" label="Filter" width={240} isOpen={isOpen} onOpenChange={setIsOpen} content={<FilterContent onApply={() => setIsOpen(false)} />}>
        <Button label="Filter">Filter</Button>
      </Popover>;
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: function ConfirmationStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    return <Popover placement="below" label="Confirm deletion" width={300} isOpen={isOpen} onOpenChange={setIsOpen} content={<ConfirmContent onConfirm={() => setIsOpen(false)} onCancel={() => setIsOpen(false)} />}>
        <Button label="Delete project" variant="destructive">
          Delete project
        </Button>
      </Popover>;
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: function AnchorRefStory() {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    return <>
        <Button ref={buttonRef} label="Anchor button">
          Anchor button
        </Button>
        <Popover anchorRef={buttonRef as React.RefObject<HTMLElement>} label="Sibling popover" width={260} placement="below" content={<VStack gap={2}>
              <Heading level={4} tabIndex={-1}>
                Sibling mode
              </Heading>
              <Text type="body">
                This popover uses anchorRef to attach to the button as a
                sibling, without wrapping it.
              </Text>
            </VStack>} />
      </>;
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    paddingTop: 200
  }}>
      <Popover placement="above" label="Info" width={260} content={<VStack gap={2}>
            <Heading level={4} tabIndex={-1}>
              Keyboard shortcuts
            </Heading>
            <Divider />
            <HStack gap={3}>
              <Text type="body" weight="bold">
                ⌘K
              </Text>
              <Text type="body">Command palette</Text>
            </HStack>
            <HStack gap={3}>
              <Text type="body" weight="bold">
                ⌘/
              </Text>
              <Text type="body">Toggle sidebar</Text>
            </HStack>
            <HStack gap={3}>
              <Text type="body" weight="bold">
                ⌘.
              </Text>
              <Text type="body">Quick actions</Text>
            </HStack>
          </VStack>}>
        <Button label="Shortcuts">Shortcuts</Button>
      </Popover>
    </div>
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    label: 'Disabled popover',
    isEnabled: false,
    content: <Text type="body">This should not appear.</Text>,
    children: <Button label="Disabled popover">Disabled</Button>
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <Popover placement="below" label="Token options" width={220} content={<VStack gap={2}>
          <Heading level={4} tabIndex={-1}>
            Filter options
          </Heading>
          <Divider />
          <Text type="body">
            The token automatically renders as a button via context.
          </Text>
        </VStack>}>
      <Token label="Status: Active" icon="filter" />
    </Popover>
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <Popover placement="below" label="Link actions" width={220} content={<VStack gap={2}>
          <Heading level={4} tabIndex={-1}>
            Quick actions
          </Heading>
          <Divider />
          <Text type="body">
            Link without href renders as a button, suitable for triggers.
          </Text>
        </VStack>}>
      <Link>More options</Link>
    </Popover>
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <Popover placement="below" label="Custom trigger" width={260} content={<VStack gap={2}>
          <Heading level={4} tabIndex={-1}>
            Custom trigger
          </Heading>
          <Divider />
          <Text type="body">
            The render prop gives full control over the trigger element.
          </Text>
        </VStack>}>
      {(triggerProps: PopoverTriggerRenderProps) => <button ref={triggerProps.ref} onClick={triggerProps.onClick} aria-haspopup={triggerProps['aria-haspopup']} aria-expanded={triggerProps['aria-expanded']} aria-controls={triggerProps['aria-controls']} style={{
      padding: '8px 16px',
      border: '1px dashed currentColor',
      borderRadius: 4,
      background: 'transparent',
      cursor: 'pointer'
    }}>
          Custom trigger element
        </button>}
    </Popover>
}`,...R.parameters?.docs?.source}}},z=[`Default`,`FilterPanel`,`Confirmation`,`AnchorRef`,`Above`,`Disabled`,`TokenTrigger`,`LinkTrigger`,`RenderProp`]}))();export{P as Above,N as AnchorRef,M as Confirmation,A as Default,F as Disabled,j as FilterPanel,L as LinkTrigger,R as RenderProp,I as TokenTrigger,z as __namedExportsOrder,k as default};