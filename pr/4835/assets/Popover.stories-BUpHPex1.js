import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./Text-BfjtEFtP.js";import{t as a}from"./jsx-runtime-DeHZSEgm.js";import{n as o,t as s}from"./Button-BVMvoKVE.js";import{n as c,t as l}from"./Divider-D4km6nVj.js";import{n as u,t as d}from"./CheckboxInput-DJd8Fdr_.js";import{n as f,t as p}from"./Popover-Dzrapr1u.js";import{n as m,t as h}from"./Heading-CaMVckJS.js";import{n as g,t as _}from"./HStack-DtZv8gmp.js";import{n as v,t as y}from"./VStack-C2SBQ4Fm.js";import{n as b,t as x}from"./Link-BsCID4Uz.js";import{n as S,t as C}from"./Switch-Bd0bzgyN.js";import{n as w,t as T}from"./Token-Y_2gT4Oy.js";function E(){let[e,t]=k.useState(!0),[n,r]=k.useState(!1),[i,a]=k.useState(!0);return(0,A.jsxs)(y,{gap:3,children:[(0,A.jsx)(h,{level:4,tabIndex:-1,children:`Settings`}),(0,A.jsx)(l,{}),(0,A.jsx)(C,{label:`Notifications`,description:`Receive push notifications`,value:e,onChange:t}),(0,A.jsx)(C,{label:`Dark mode`,description:`Use dark color theme`,value:n,onChange:r}),(0,A.jsx)(C,{label:`Sounds`,description:`Play sounds for actions`,value:i,onChange:a})]})}function D({onApply:e}){let[t,n]=k.useState({active:!0,archived:!1,drafts:!0,shared:!1}),r=e=>n(t=>({...t,[e]:!t[e]}));return(0,A.jsxs)(y,{gap:3,children:[(0,A.jsx)(h,{level:4,tabIndex:-1,children:`Filter by status`}),(0,A.jsx)(l,{}),(0,A.jsx)(d,{label:`Active`,value:t.active,onChange:()=>r(`active`)}),(0,A.jsx)(d,{label:`Archived`,value:t.archived,onChange:()=>r(`archived`)}),(0,A.jsx)(d,{label:`Drafts`,value:t.drafts,onChange:()=>r(`drafts`)}),(0,A.jsx)(d,{label:`Shared with me`,value:t.shared,onChange:()=>r(`shared`)}),(0,A.jsx)(l,{}),(0,A.jsxs)(_,{gap:2,hAlign:`end`,children:[(0,A.jsx)(s,{label:`Apply`,variant:`primary`,onClick:e,children:`Apply`}),(0,A.jsx)(s,{label:`Reset`,variant:`ghost`,onClick:()=>n({active:!0,archived:!1,drafts:!0,shared:!1}),children:`Reset`})]})]})}function O({onConfirm:e,onCancel:t}){return(0,A.jsxs)(y,{gap:3,children:[(0,A.jsx)(h,{level:4,tabIndex:-1,children:`Delete project?`}),(0,A.jsx)(i,{type:`body`,children:`This will permanently delete the project and all its data. This action cannot be undone.`}),(0,A.jsxs)(_,{gap:2,hAlign:`end`,children:[(0,A.jsx)(s,{label:`Delete`,variant:`destructive`,onClick:e,children:`Delete`}),(0,A.jsx)(s,{label:`Cancel`,variant:`ghost`,onClick:t,children:`Cancel`})]})]})}var k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=t((()=>{k=e(n()),f(),o(),w(),b(),v(),g(),r(),m(),S(),u(),c(),A=a(),j={title:`Core/Popover`,component:p,tags:[`autodocs`],argTypes:{placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Position relative to trigger`},alignment:{control:`select`,options:[`start`,`center`,`end`],description:`Alignment on placement axis`},isEnabled:{control:`boolean`,description:`Enable/disable the popover`}}},M={args:{placement:`below`,label:`Settings`,width:280,content:(0,A.jsx)(E,{}),children:(0,A.jsx)(s,{label:`Settings`,children:`Settings`})}},N={render:function(){let[e,t]=k.useState(!1);return(0,A.jsx)(p,{placement:`below`,label:`Filter`,width:240,isOpen:e,onOpenChange:t,content:(0,A.jsx)(D,{onApply:()=>t(!1)}),children:(0,A.jsx)(s,{label:`Filter`,children:`Filter`})})}},P={render:function(){let[e,t]=k.useState(!1);return(0,A.jsx)(p,{placement:`below`,label:`Confirm deletion`,width:300,isOpen:e,onOpenChange:t,content:(0,A.jsx)(O,{onConfirm:()=>t(!1),onCancel:()=>t(!1)}),children:(0,A.jsx)(s,{label:`Delete project`,variant:`destructive`,children:`Delete project`})})}},F={render:function(){let e=k.useRef(null);return(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(s,{ref:e,label:`Anchor button`,children:`Anchor button`}),(0,A.jsx)(p,{anchorRef:e,label:`Sibling popover`,width:260,placement:`below`,content:(0,A.jsxs)(y,{gap:2,children:[(0,A.jsx)(h,{level:4,tabIndex:-1,children:`Sibling mode`}),(0,A.jsx)(i,{type:`body`,children:`This popover uses anchorRef to attach to the button as a sibling, without wrapping it.`})]})})]})}},I={render:()=>(0,A.jsx)(`div`,{style:{paddingTop:200},children:(0,A.jsx)(p,{placement:`above`,label:`Info`,width:260,content:(0,A.jsxs)(y,{gap:2,children:[(0,A.jsx)(h,{level:4,tabIndex:-1,children:`Keyboard shortcuts`}),(0,A.jsx)(l,{}),(0,A.jsxs)(_,{gap:3,children:[(0,A.jsx)(i,{type:`body`,weight:`bold`,children:`⌘K`}),(0,A.jsx)(i,{type:`body`,children:`Command palette`})]}),(0,A.jsxs)(_,{gap:3,children:[(0,A.jsx)(i,{type:`body`,weight:`bold`,children:`⌘/`}),(0,A.jsx)(i,{type:`body`,children:`Toggle sidebar`})]}),(0,A.jsxs)(_,{gap:3,children:[(0,A.jsx)(i,{type:`body`,weight:`bold`,children:`⌘.`}),(0,A.jsx)(i,{type:`body`,children:`Quick actions`})]})]}),children:(0,A.jsx)(s,{label:`Shortcuts`,children:`Shortcuts`})})})},L={args:{placement:`below`,label:`Disabled popover`,isEnabled:!1,content:(0,A.jsx)(i,{type:`body`,children:`This should not appear.`}),children:(0,A.jsx)(s,{label:`Disabled popover`,children:`Disabled`})}},R={render:()=>(0,A.jsx)(p,{placement:`below`,label:`Token options`,width:220,content:(0,A.jsxs)(y,{gap:2,children:[(0,A.jsx)(h,{level:4,tabIndex:-1,children:`Filter options`}),(0,A.jsx)(l,{}),(0,A.jsx)(i,{type:`body`,children:`The token automatically renders as a button via context.`})]}),children:(0,A.jsx)(T,{label:`Status: Active`,icon:`filter`})})},z={render:()=>(0,A.jsx)(p,{placement:`below`,label:`Link actions`,width:220,content:(0,A.jsxs)(y,{gap:2,children:[(0,A.jsx)(h,{level:4,tabIndex:-1,children:`Quick actions`}),(0,A.jsx)(l,{}),(0,A.jsx)(i,{type:`body`,children:`Link without href renders as a button, suitable for triggers.`})]}),children:(0,A.jsx)(x,{children:`More options`})})},B={render:()=>(0,A.jsx)(p,{placement:`below`,label:`Custom trigger`,width:260,content:(0,A.jsxs)(y,{gap:2,children:[(0,A.jsx)(h,{level:4,tabIndex:-1,children:`Custom trigger`}),(0,A.jsx)(l,{}),(0,A.jsx)(i,{type:`body`,children:`The render prop gives full control over the trigger element.`})]}),children:e=>(0,A.jsx)(`button`,{ref:e.ref,onClick:e.onClick,"aria-haspopup":e[`aria-haspopup`],"aria-expanded":e[`aria-expanded`],"aria-controls":e[`aria-controls`],style:{padding:`8px 16px`,border:`1px dashed currentColor`,borderRadius:4,background:`transparent`,cursor:`pointer`},children:`Custom trigger element`})})},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    label: 'Settings',
    width: 280,
    content: <SettingsContent />,
    children: <Button label="Settings">Settings</Button>
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: function FilterPanelStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    return <Popover placement="below" label="Filter" width={240} isOpen={isOpen} onOpenChange={setIsOpen} content={<FilterContent onApply={() => setIsOpen(false)} />}>
        <Button label="Filter">Filter</Button>
      </Popover>;
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: function ConfirmationStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    return <Popover placement="below" label="Confirm deletion" width={300} isOpen={isOpen} onOpenChange={setIsOpen} content={<ConfirmContent onConfirm={() => setIsOpen(false)} onCancel={() => setIsOpen(false)} />}>
        <Button label="Delete project" variant="destructive">
          Delete project
        </Button>
      </Popover>;
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    label: 'Disabled popover',
    isEnabled: false,
    content: <Text type="body">This should not appear.</Text>,
    children: <Button label="Disabled popover">Disabled</Button>
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V=[`Default`,`FilterPanel`,`Confirmation`,`AnchorRef`,`Above`,`Disabled`,`TokenTrigger`,`LinkTrigger`,`RenderProp`]})))()}H();export{I as Above,F as AnchorRef,P as Confirmation,M as Default,L as Disabled,N as FilterPanel,z as LinkTrigger,B as RenderProp,R as TokenTrigger,V as __namedExportsOrder,j as default};