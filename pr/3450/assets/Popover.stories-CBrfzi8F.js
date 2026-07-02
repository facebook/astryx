import{a1 as e,B as a,T as r,R as c}from"./iframe-Cw8JXX6x.js";import{P as s}from"./Popover-DjPywt4F.js";import{T as w}from"./Token-DSaeuArz.js";import{L as R}from"./Link-_RnBZX_s.js";import{S as C}from"./Switch-CdfnBvu5.js";import{C as g}from"./CheckboxInput-7ijgnJ1p.js";import{D as d}from"./Divider-CXkzIgPQ.js";import{V as i}from"./VStack-C8L6Y9II.js";import{H as l}from"./Heading-H2Jt0VgN.js";import{H as u}from"./HStack-CB35wW_k.js";import"./preload-helper-Ct5FWWRu.js";import"./usePopover-DBfyiMp1.js";import"./useFocusTrap-RYvdVaLT.js";import"./useInteractiveRole-GZ6CKFNP.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./FieldStatus-C1k4mIkj.js";import"./Stack-Cz_yxa3U.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";const X={title:"Core/Popover",component:s,tags:["autodocs"],argTypes:{placement:{control:"select",options:["above","below","start","end"],description:"Position relative to trigger"},alignment:{control:"select",options:["start","center","end"],description:"Alignment on placement axis"},isEnabled:{control:"boolean",description:"Enable/disable the popover"}}};function P(){const[n,t]=c.useState(!0),[o,p]=c.useState(!1),[b,h]=c.useState(!0);return e.jsxs(i,{gap:3,children:[e.jsx(l,{level:4,tabIndex:-1,children:"Settings"}),e.jsx(d,{}),e.jsx(C,{label:"Notifications",description:"Receive push notifications",value:n,onChange:t}),e.jsx(C,{label:"Dark mode",description:"Use dark color theme",value:o,onChange:p}),e.jsx(C,{label:"Sounds",description:"Play sounds for actions",value:b,onChange:h})]})}const m={args:{placement:"below",label:"Settings",width:280,content:e.jsx(P,{}),children:e.jsx(a,{label:"Settings",children:"Settings"})}};function D({onApply:n}){const[t,o]=c.useState({active:!0,archived:!1,drafts:!0,shared:!1}),p=b=>o(h=>({...h,[b]:!h[b]}));return e.jsxs(i,{gap:3,children:[e.jsx(l,{level:4,tabIndex:-1,children:"Filter by status"}),e.jsx(d,{}),e.jsx(g,{label:"Active",value:t.active,onChange:()=>p("active")}),e.jsx(g,{label:"Archived",value:t.archived,onChange:()=>p("archived")}),e.jsx(g,{label:"Drafts",value:t.drafts,onChange:()=>p("drafts")}),e.jsx(g,{label:"Shared with me",value:t.shared,onChange:()=>p("shared")}),e.jsx(d,{}),e.jsxs(u,{gap:2,hAlign:"end",children:[e.jsx(a,{label:"Apply",variant:"primary",onClick:n,children:"Apply"}),e.jsx(a,{label:"Reset",variant:"ghost",onClick:()=>o({active:!0,archived:!1,drafts:!0,shared:!1}),children:"Reset"})]})]})}const x={render:function(){const[t,o]=c.useState(!1);return e.jsx(s,{placement:"below",label:"Filter",width:240,isOpen:t,onOpenChange:o,content:e.jsx(D,{onApply:()=>o(!1)}),children:e.jsx(a,{label:"Filter",children:"Filter"})})}};function I({onConfirm:n,onCancel:t}){return e.jsxs(i,{gap:3,children:[e.jsx(l,{level:4,tabIndex:-1,children:"Delete project?"}),e.jsx(r,{type:"body",children:"This will permanently delete the project and all its data. This action cannot be undone."}),e.jsxs(u,{gap:2,hAlign:"end",children:[e.jsx(a,{label:"Delete",variant:"destructive",onClick:n,children:"Delete"}),e.jsx(a,{label:"Cancel",variant:"ghost",onClick:t,children:"Cancel"})]})]})}const f={render:function(){const[t,o]=c.useState(!1);return e.jsx(s,{placement:"below",label:"Confirm deletion",width:300,isOpen:t,onOpenChange:o,content:e.jsx(I,{onConfirm:()=>o(!1),onCancel:()=>o(!1)}),children:e.jsx(a,{label:"Delete project",variant:"destructive",children:"Delete project"})})}},v={render:function(){const t=c.useRef(null);return e.jsxs(e.Fragment,{children:[e.jsx(a,{ref:t,label:"Anchor button",children:"Anchor button"}),e.jsx(s,{anchorRef:t,label:"Sibling popover",width:260,placement:"below",content:e.jsxs(i,{gap:2,children:[e.jsx(l,{level:4,tabIndex:-1,children:"Sibling mode"}),e.jsx(r,{type:"body",children:"This popover uses anchorRef to attach to the button as a sibling, without wrapping it."})]})})]})}},j={render:()=>e.jsx("div",{style:{paddingTop:200},children:e.jsx(s,{placement:"above",label:"Info",width:260,content:e.jsxs(i,{gap:2,children:[e.jsx(l,{level:4,tabIndex:-1,children:"Keyboard shortcuts"}),e.jsx(d,{}),e.jsxs(u,{gap:3,children:[e.jsx(r,{type:"body",weight:"bold",children:"⌘K"}),e.jsx(r,{type:"body",children:"Command palette"})]}),e.jsxs(u,{gap:3,children:[e.jsx(r,{type:"body",weight:"bold",children:"⌘/"}),e.jsx(r,{type:"body",children:"Toggle sidebar"})]}),e.jsxs(u,{gap:3,children:[e.jsx(r,{type:"body",weight:"bold",children:"⌘."}),e.jsx(r,{type:"body",children:"Quick actions"})]})]}),children:e.jsx(a,{label:"Shortcuts",children:"Shortcuts"})})})},y={args:{placement:"below",label:"Disabled popover",isEnabled:!1,content:e.jsx(r,{type:"body",children:"This should not appear."}),children:e.jsx(a,{label:"Disabled popover",children:"Disabled"})}},S={render:()=>e.jsx(s,{placement:"below",label:"Token options",width:220,content:e.jsxs(i,{gap:2,children:[e.jsx(l,{level:4,tabIndex:-1,children:"Filter options"}),e.jsx(d,{}),e.jsx(r,{type:"body",children:"The token automatically renders as a button via context."})]}),children:e.jsx(w,{label:"Status: Active",icon:"filter"})})},k={render:()=>e.jsx(s,{placement:"below",label:"Link actions",width:220,content:e.jsxs(i,{gap:2,children:[e.jsx(l,{level:4,tabIndex:-1,children:"Quick actions"}),e.jsx(d,{}),e.jsx(r,{type:"body",children:"Link without href renders as a button, suitable for triggers."})]}),children:e.jsx(R,{children:"More options"})})},T={render:()=>e.jsx(s,{placement:"below",label:"Custom trigger",width:260,content:e.jsxs(i,{gap:2,children:[e.jsx(l,{level:4,tabIndex:-1,children:"Custom trigger"}),e.jsx(d,{}),e.jsx(r,{type:"body",children:"The render prop gives full control over the trigger element."})]}),children:n=>e.jsx("button",{ref:n.ref,onClick:n.onClick,"aria-haspopup":n["aria-haspopup"],"aria-expanded":n["aria-expanded"],"aria-controls":n["aria-controls"],style:{padding:"8px 16px",border:"1px dashed currentColor",borderRadius:4,background:"transparent",cursor:"pointer"},children:"Custom trigger element"})})};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    label: 'Settings',
    width: 280,
    content: <SettingsContent />,
    children: <Button label="Settings">Settings</Button>
  }
}`,...m.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: function FilterPanelStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    return <Popover placement="below" label="Filter" width={240} isOpen={isOpen} onOpenChange={setIsOpen} content={<FilterContent onApply={() => setIsOpen(false)} />}>
        <Button label="Filter">Filter</Button>
      </Popover>;
  }
}`,...x.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: function ConfirmationStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    return <Popover placement="below" label="Confirm deletion" width={300} isOpen={isOpen} onOpenChange={setIsOpen} content={<ConfirmContent onConfirm={() => setIsOpen(false)} onCancel={() => setIsOpen(false)} />}>
        <Button label="Delete project" variant="destructive">
          Delete project
        </Button>
      </Popover>;
  }
}`,...f.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    label: 'Disabled popover',
    isEnabled: false,
    content: <Text type="body">This should not appear.</Text>,
    children: <Button label="Disabled popover">Disabled</Button>
  }
}`,...y.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}};const Y=["Default","FilterPanel","Confirmation","AnchorRef","Above","Disabled","TokenTrigger","LinkTrigger","RenderProp"];export{j as Above,v as AnchorRef,f as Confirmation,m as Default,y as Disabled,x as FilterPanel,k as LinkTrigger,T as RenderProp,S as TokenTrigger,Y as __namedExportsOrder,X as default};
