import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-z8muYPH2.js";import{t as a}from"./Button-48QSFpsH.js";import{t as o}from"./Button-1z9XK41_.js";import{t as s}from"./BottomSheet-BmLgMuy3.js";import{t as c}from"./BottomSheet-CSN89dz-.js";import{t as l}from"./Divider-BzKkd_zR.js";import{t as u}from"./Divider-BDHAhJpM.js";import{n as d,t as f}from"./Popover-DwnpTDQa.js";import{t as p}from"./Heading-BMJaxfK2.js";import{i as m,o as h}from"./Stack-B9pi7ZUb.js";import{t as g}from"./Section-2qDtbU00.js";import{t as _}from"./Section-DqzsisiF.js";import{t as v}from"./Layout-Dt4bRu5Z.js";import{t as y}from"./Text-Cy3vzSsU.js";import{i as b,n as x,t as S}from"./List-CGALxfJQ.js";import{t as C}from"./CheckboxInput-D_V9gkvw.js";import{t as ee}from"./CheckboxInput-D3yrLsxZ.js";import{i as te,t as ne}from"./Link-DDGb8tQ1.js";import{n as re,t as ie}from"./Token-CuPHvpYN.js";import{Dn as w,En as ae}from"./iframe-DEEdj1HO.js";function oe({selectedAction:e,onSelectAction:t,onReset:n,presentation:r}){return(0,j.jsxs)(m,{gap:3,xstyle:F.actionList,children:[(0,j.jsx)(b,{density:`compact`,hasDividers:!0,header:(0,j.jsxs)(m,{gap:1,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Project actions`}),(0,j.jsx)(i,{type:`supporting`,color:`secondary`,children:r===`popover`?`Compact supplemental actions stay anchored to the trigger and keep the surrounding context visible.`:`The same actions can move into a BottomSheet when a product explicitly wants a bottom-edge touch surface.`})]}),children:N.map(n=>(0,j.jsx)(x,{label:n.label,description:n.description,isSelected:e===n.id,onClick:()=>t(n.id)},n.id))}),(0,j.jsx)(l,{}),(0,j.jsxs)(h,{gap:2,hAlign:`between`,children:[(0,j.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`Selected:`,` `,e==null?`none`:N.find(t=>t.id===e)?.label]}),(0,j.jsx)(a,{label:`Reset selection`,variant:`ghost`,onClick:n,children:`Reset`})]})]})}function se(e,t){let[n,r]=A.useState(!1);return A.useEffect(()=>{if(typeof window>`u`||!window.matchMedia)return;let e=window.matchMedia(`(max-width: 639px) and (pointer: coarse) and (hover: none)`),t=()=>r(e.matches);return t(),e.addEventListener(`change`,t),()=>e.removeEventListener(`change`,t)},[]),e??(t===`bottom-sheet`&&n?`bottom-sheet`:`popover`)}function T({presentation:e=`popover`,touchPresentation:t=`bottom-sheet`}){let n=se(e,t),[r,i]=A.useState(!1),[o,c]=A.useState(null),l=(0,j.jsx)(oe,{presentation:n,selectedAction:o,onSelectAction:c,onReset:()=>c(null)});return n===`bottom-sheet`?(0,j.jsxs)(`div`,{className:`x9f619 xh8yej3 x1ov3xa9 x1oa1p4a x1awphl8 x1rey3nv xnjyzlh x7giv3`,children:[(0,j.jsx)(a,{label:`Open project actions`,onClick:()=>i(!0),children:`Open project actions`}),(0,j.jsx)(s,{isOpen:r,onOpenChange:i,label:`Project actions`,height:`hug`,children:(0,j.jsx)(g,{padding:4,children:l})})]}):(0,j.jsx)(`div`,{className:`x9f619 xh8yej3 x1ov3xa9 x1oa1p4a x1awphl8 x1rey3nv xnjyzlh x7giv3`,children:(0,j.jsx)(d,{isOpen:r,onOpenChange:i,placement:`below`,alignment:`start`,label:`Project actions`,width:320,content:l,children:(0,j.jsx)(a,{label:`Open project actions`,children:`Open project actions`})})})}function E(){let[e,t]=A.useState(null);return(0,j.jsx)(`div`,{className:`x9f619 xh8yej3 x1ov3xa9 x1oa1p4a x1awphl8 x1rey3nv xnjyzlh x7giv3`,children:(0,j.jsx)(d,{placement:`below`,alignment:`start`,label:`Move to project`,width:320,"data-testid":`tall-popover`,xstyle:F.boundedPopoverContent,content:(0,j.jsx)(b,{density:`compact`,hasDividers:!0,header:(0,j.jsxs)(m,{gap:1,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Move to project`}),(0,j.jsx)(i,{type:`supporting`,color:`secondary`,children:`Choose a destination for this task.`})]}),children:P.map(([n,r])=>(0,j.jsx)(x,{label:n,description:r,isSelected:e===n,onClick:()=>t(n)},n))}),children:(0,j.jsx)(a,{label:`Move task`,children:`Move task`})})})}function D(){let[e,t]=A.useState(!0),[n,r]=A.useState(!1),[i,a]=A.useState(!0);return(0,j.jsxs)(m,{gap:3,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Settings`}),(0,j.jsx)(l,{}),(0,j.jsx)(w,{label:`Notifications`,description:`Receive push notifications`,value:e,onChange:t}),(0,j.jsx)(w,{label:`Dark mode`,description:`Use dark color theme`,value:n,onChange:r}),(0,j.jsx)(w,{label:`Sounds`,description:`Play sounds for actions`,value:i,onChange:a})]})}function O({onApply:e}){let[t,n]=A.useState({active:!0,archived:!1,drafts:!0,shared:!1}),r=e=>n(t=>({...t,[e]:!t[e]}));return(0,j.jsxs)(m,{gap:3,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Filter by status`}),(0,j.jsx)(l,{}),(0,j.jsx)(C,{label:`Active`,value:t.active,onChange:()=>r(`active`)}),(0,j.jsx)(C,{label:`Archived`,value:t.archived,onChange:()=>r(`archived`)}),(0,j.jsx)(C,{label:`Drafts`,value:t.drafts,onChange:()=>r(`drafts`)}),(0,j.jsx)(C,{label:`Shared with me`,value:t.shared,onChange:()=>r(`shared`)}),(0,j.jsx)(l,{}),(0,j.jsxs)(h,{gap:2,hAlign:`end`,children:[(0,j.jsx)(a,{label:`Apply`,variant:`primary`,onClick:e,children:`Apply`}),(0,j.jsx)(a,{label:`Reset`,variant:`ghost`,onClick:()=>n({active:!0,archived:!1,drafts:!0,shared:!1}),children:`Reset`})]})]})}function k({onConfirm:e,onCancel:t}){return(0,j.jsxs)(m,{gap:3,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Delete project?`}),(0,j.jsx)(i,{type:`body`,children:`This will permanently delete the project and all its data. This action cannot be undone.`}),(0,j.jsxs)(h,{gap:2,hAlign:`end`,children:[(0,j.jsx)(a,{label:`Delete`,variant:`destructive`,onClick:e,children:`Delete`}),(0,j.jsx)(a,{label:`Cancel`,variant:`ghost`,onClick:t,children:`Cancel`})]})]})}var A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$;e((()=>{A=t(n()),c(),f(),o(),ie(),ne(),S(),v(),y(),ae(),ee(),u(),_(),j=r(),M={title:`Core/Popover`,component:d,tags:[`autodocs`],argTypes:{placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Position relative to trigger`},alignment:{control:`select`,options:[`start`,`center`,`end`],description:`Alignment on placement axis`},isEnabled:{control:`boolean`,description:`Enable/disable the popover`}}},N=[{id:`owner`,label:`Assign owner`,description:`Route follow-up to a teammate.`},{id:`label`,label:`Add label`,description:`Group this item with related work.`},{id:`due-date`,label:`Set due date`,description:`Pick a lightweight reminder for review.`}],P=[[`Apollo launch`,`Marketing · 12 open tasks`],[`Customer insights`,`Research · 8 open tasks`],[`Design systems`,`Platform · 24 open tasks`],[`Growth experiments`,`Product · 6 open tasks`],[`Incident review`,`Operations · 4 open tasks`],[`Mobile quality`,`Engineering · 15 open tasks`],[`Quarterly planning`,`Strategy · 9 open tasks`],[`Recruiting plan`,`People · 7 open tasks`],[`Security follow-up`,`Trust · 3 open tasks`],[`Website refresh`,`Brand · 11 open tasks`]],F={oversizedTrigger:{kzqmXN:`x11i3ho8`,$$css:!0},boundedPopoverContent:{kskxy:`x1nsf087`,$$css:!0},evidenceCopy:{ks0D6T:`x1lwm3bp`,kHjlTd:`xj0a0fe`,$$css:!0},actionList:{kzqmXN:`xh8yej3`,$$css:!0}},I={args:{placement:`below`,label:`Settings`,width:280,content:(0,j.jsx)(D,{}),children:(0,j.jsx)(a,{label:`Settings`,children:`Settings`})}},L={render:function(){let[e,t]=A.useState(!1);return(0,j.jsx)(d,{placement:`below`,label:`Filter`,width:240,isOpen:e,onOpenChange:t,content:(0,j.jsx)(O,{onApply:()=>t(!1)}),children:(0,j.jsx)(a,{label:`Filter`,children:`Filter`})})}},R={render:function(){let[e,t]=A.useState(!1);return(0,j.jsx)(d,{placement:`below`,label:`Confirm deletion`,width:300,isOpen:e,onOpenChange:t,content:(0,j.jsx)(k,{onConfirm:()=>t(!1),onCancel:()=>t(!1)}),children:(0,j.jsx)(a,{label:`Delete project`,variant:`destructive`,children:`Delete project`})})}},z={render:function(){let e=A.useRef(null);return(0,j.jsxs)(j.Fragment,{children:[(0,j.jsx)(a,{ref:e,label:`Anchor button`,children:`Anchor button`}),(0,j.jsx)(d,{anchorRef:e,label:`Sibling popover`,width:260,placement:`below`,content:(0,j.jsxs)(m,{gap:2,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Sibling mode`}),(0,j.jsx)(i,{type:`body`,children:`This popover uses anchorRef to attach to the button as a sibling, without wrapping it.`})]})})]})}},B={render:()=>(0,j.jsx)(`div`,{style:{paddingTop:200},children:(0,j.jsx)(d,{placement:`above`,label:`Info`,width:260,content:(0,j.jsxs)(m,{gap:2,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Keyboard shortcuts`}),(0,j.jsx)(l,{}),(0,j.jsxs)(h,{gap:3,children:[(0,j.jsx)(i,{type:`body`,weight:`bold`,children:`⌘K`}),(0,j.jsx)(i,{type:`body`,children:`Command palette`})]}),(0,j.jsxs)(h,{gap:3,children:[(0,j.jsx)(i,{type:`body`,weight:`bold`,children:`⌘/`}),(0,j.jsx)(i,{type:`body`,children:`Toggle sidebar`})]}),(0,j.jsxs)(h,{gap:3,children:[(0,j.jsx)(i,{type:`body`,weight:`bold`,children:`⌘.`}),(0,j.jsx)(i,{type:`body`,children:`Quick actions`})]})]}),children:(0,j.jsx)(a,{label:`Shortcuts`,children:`Shortcuts`})})})},V={args:{placement:`below`,label:`Disabled popover`,isEnabled:!1,content:(0,j.jsx)(i,{type:`body`,children:`This should not appear.`}),children:(0,j.jsx)(a,{label:`Disabled popover`,isDisabled:!0,children:`Disabled`})}},H={render:()=>(0,j.jsx)(d,{placement:`below`,label:`Token options`,width:220,content:(0,j.jsxs)(m,{gap:2,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Filter options`}),(0,j.jsx)(l,{}),(0,j.jsx)(i,{type:`body`,children:`The token automatically renders as a button via context.`})]}),children:(0,j.jsx)(re,{label:`Status: Active`,icon:`filter`})})},U={render:()=>(0,j.jsx)(d,{placement:`below`,label:`Link actions`,width:220,content:(0,j.jsxs)(m,{gap:2,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Quick actions`}),(0,j.jsx)(l,{}),(0,j.jsx)(i,{type:`body`,children:`Link without href renders as a button, suitable for triggers.`})]}),children:(0,j.jsx)(te,{children:`More options`})})},W={render:()=>(0,j.jsx)(d,{placement:`below`,label:`Custom trigger`,width:260,content:(0,j.jsxs)(m,{gap:2,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Custom trigger`}),(0,j.jsx)(l,{}),(0,j.jsx)(i,{type:`body`,children:`The render prop gives full control over the trigger element.`})]}),children:e=>(0,j.jsx)(`button`,{ref:e.ref,onClick:e.onClick,"aria-haspopup":e[`aria-haspopup`],"aria-expanded":e[`aria-expanded`],"aria-controls":e[`aria-controls`],style:{padding:`8px 16px`,border:`1px dashed currentColor`,borderRadius:4,background:`transparent`,cursor:`pointer`},children:`Custom trigger element`})})},G={name:`Viewport Fit`,parameters:{layout:`fullscreen`,viewport:{defaultViewport:`mobile1`},docs:{story:{inline:!1,height:`844px`},description:{story:`Uses the actual Storybook viewport rather than a simulated phone frame. The Popover requests a 640px width and must stay anchored to the trigger while preserving at least 16px safe-area-aware gutters from both viewport edges.`}}},render:()=>(0,j.jsx)(`div`,{className:`x9f619 xh8yej3 x1ov3xa9 x1oa1p4a x1awphl8 x1rey3nv xnjyzlh x7giv3`,children:(0,j.jsx)(`div`,{className:`x78zum5 x13a6bvl`,children:(0,j.jsx)(d,{placement:`below`,alignment:`end`,label:`Narrow viewport fit evidence`,width:640,content:(0,j.jsxs)(m,{gap:3,xstyle:F.evidenceCopy,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Narrow viewport fit`}),(0,j.jsx)(i,{type:`body`,wordBreak:`break-word`,children:`This intentionally requests a wider-than-mobile popover. The layer should stay anchored to the trigger, preserve safe gutters on both viewport edges, and allow long content to reflow instead of causing horizontal page overflow.`}),(0,j.jsx)(i,{type:`supporting`,wordBreak:`break-word`,children:`Long localized-token-like content: project-settings-notification-delivery-exception-review-queue`})]}),children:(0,j.jsx)(a,{label:`Open fit evidence`,children:`Open fit evidence`})})})}),play:async({canvasElement:e})=>{let t=e.querySelector(`button`);t instanceof HTMLElement&&t.click()}},K={name:`Match-trigger viewport fit`,parameters:{layout:`fullscreen`,viewport:{defaultViewport:`mobile1`},docs:{story:{inline:!1,height:`844px`},description:{story:`Uses the actual Storybook viewport. The real trigger is intentionally 640px wide, while Popover keeps its default match-trigger sizing; the Popover must cap to the available viewport instead of inheriting the full trigger width.`}}},render:()=>(0,j.jsx)(`div`,{className:`x9f619 xh8yej3 x1ov3xa9 x1oa1p4a x1awphl8 x1rey3nv xnjyzlh x7giv3`,children:(0,j.jsx)(d,{placement:`below`,alignment:`start`,label:`Match-trigger viewport evidence`,"data-testid":`match-trigger-popover`,content:(0,j.jsxs)(m,{gap:2,xstyle:F.evidenceCopy,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Match-trigger sizing`}),(0,j.jsx)(i,{type:`body`,children:`The anchor is wider than this viewport, but the Popover stays inside the available inline space.`})]}),children:(0,j.jsx)(a,{label:`Oversized match-width trigger`,xstyle:F.oversizedTrigger,children:`Oversized match-width trigger`})})}),play:async({canvasElement:e})=>{let t=e.querySelector(`button`);t instanceof HTMLElement&&t.click()}},q={name:`Tall content overflow`,parameters:{layout:`fullscreen`,viewport:{defaultViewport:`mobile1`},docs:{story:{inline:!1,height:`844px`},description:{story:`Uses the actual Storybook viewport and a realistic project picker. The product-level 360px/50dvh cap keeps this lightweight anchored surface compact, while Popover detects the overflow and makes its content scrollable. Scrolling demonstrates bounded overflow handling; it does not by itself determine whether another presentation is more appropriate.`}}},render:()=>(0,j.jsx)(E,{}),play:async({canvasElement:e})=>{let t=e.querySelector(`button`);t instanceof HTMLElement&&t.click()}},J={name:`Read-only dialog focus`,parameters:{layout:`fullscreen`,docs:{story:{inline:!1,height:`844px`},description:{story:`Manual assistive-technology check for a dialog-style Popover with no content controls. On open, the labeled dialog container receives focus without revealing the fallback close button. Confirm the dialog name and role are announced, Tab reaches Close popover, Shift+Tab remains contained, Escape closes, and focus returns to the trigger.`}}},render:()=>(0,j.jsx)(d,{placement:`below`,label:`Deployment status`,content:(0,j.jsxs)(m,{gap:2,children:[(0,j.jsx)(p,{level:4,children:`Deployment status`}),(0,j.jsx)(i,{type:`body`,children:`The latest production deployment completed successfully.`})]}),children:(0,j.jsx)(a,{label:`View deployment status`,children:`View deployment status`})}),play:async({canvasElement:e})=>{let t=e.querySelector(`button`);t instanceof HTMLElement&&t.click()}},Y={name:`Trigger Interaction Evidence`,parameters:{layout:`fullscreen`,docs:{story:{inline:!1,height:`844px`},description:{story:`Desktop Storybook interaction evidence: the native button trigger opens the popover without hover. Use real touch/iOS evidence before claiming mobile Safari behavior.`}}},render:()=>(0,j.jsx)(d,{placement:`below`,label:`Interaction evidence`,content:(0,j.jsxs)(m,{gap:2,children:[(0,j.jsx)(p,{level:4,tabIndex:-1,children:`Interaction evidence`}),(0,j.jsx)(i,{type:`body`,children:`Opened by trigger activation; Escape, outside press, and focus return are covered by unit tests.`})]}),children:(0,j.jsx)(a,{label:`Open interaction evidence`,children:`Open interaction evidence`})}),play:async({canvasElement:e})=>{let t=e.querySelector(`button`);t instanceof HTMLElement&&t.click()}},X={name:`Keep Popover Presentation`,parameters:{layout:`fullscreen`,docs:{story:{inline:!1,height:`844px`},description:{story:`Keep Popover for anchored, compact supplemental details and actions. The trigger is click/tap activated, not hover dependent, and the compact surface keeps context near the trigger.`}}},render:()=>(0,j.jsx)(T,{presentation:`popover`}),play:async({canvasElement:e})=>{let t=e.querySelector(`button`);t instanceof HTMLElement&&t.click()}},Z={name:`BottomSheet Presentation Option`,parameters:{layout:`fullscreen`,docs:{story:{inline:!1,height:`844px`},description:{story:`This story shows BottomSheet as an explicit alternative for the same focused task when a product wants a bottom-edge modal touch surface. It changes the contract: dialog focus ownership, scrim behavior, Escape handling, swipe-to-dismiss, and sheet body scrolling differ from Popover.`}}},render:()=>(0,j.jsx)(T,{presentation:`bottom-sheet`}),play:async({canvasElement:e})=>{let t=e.querySelector(`button`);t instanceof HTMLElement&&t.click()}},Q={name:`Adaptive Popover Recipe`,args:{presentation:`popover`,touchPresentation:`bottom-sheet`},argTypes:{presentation:{control:`select`,options:[`popover`,`bottom-sheet`],description:`Deterministic review/test override for the presentation used by this recipe story.`},touchPresentation:{control:`select`,options:[`popover`,`bottom-sheet`],description:`Opt-in touch presentation. If a consumer omits the deterministic presentation override, the recipe may choose BottomSheet only for compact + coarse pointer + no hover.`}},parameters:{layout:`fullscreen`,docs:{story:{inline:!1,height:`844px`},description:{story:`Story-local recipe only: Core Popover does not silently adapt. Products opt in with touchPresentation="bottom-sheet" and can force presentation="popover" or presentation="bottom-sheet" for review and tests.`}}},render:e=>(0,j.jsx)(T,{...e}),play:async({canvasElement:e})=>{let t=e.querySelector(`button`);t instanceof HTMLElement&&t.click()}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    label: 'Settings',
    width: 280,
    content: <SettingsContent />,
    children: <Button label="Settings">Settings</Button>
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: function FilterPanelStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    return <Popover placement="below" label="Filter" width={240} isOpen={isOpen} onOpenChange={setIsOpen} content={<FilterContent onApply={() => setIsOpen(false)} />}>
        <Button label="Filter">Filter</Button>
      </Popover>;
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: function ConfirmationStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    return <Popover placement="below" label="Confirm deletion" width={300} isOpen={isOpen} onOpenChange={setIsOpen} content={<ConfirmContent onConfirm={() => setIsOpen(false)} onCancel={() => setIsOpen(false)} />}>
        <Button label="Delete project" variant="destructive">
          Delete project
        </Button>
      </Popover>;
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'below',
    label: 'Disabled popover',
    isEnabled: false,
    content: <Text type="body">This should not appear.</Text>,
    children: <Button label="Disabled popover" isDisabled>
        Disabled
      </Button>
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Viewport Fit',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      story: {
        inline: false,
        height: '844px'
      },
      description: {
        story: 'Uses the actual Storybook viewport rather than a simulated phone frame. The Popover requests a 640px width and must stay anchored to the trigger while preserving at least 16px safe-area-aware gutters from both viewport edges.'
      }
    }
  },
  render: () => <div {...stylex.props(readinessStyles.viewportStoryCanvas)}>
      <div {...stylex.props(readinessStyles.edgeAnchorRow)}>
        <Popover placement="below" alignment="end" label="Narrow viewport fit evidence" width={640} content={<VStack gap={3} xstyle={readinessStyles.evidenceCopy}>
              <Heading level={4} tabIndex={-1}>
                Narrow viewport fit
              </Heading>
              <Text type="body" wordBreak="break-word">
                This intentionally requests a wider-than-mobile popover. The
                layer should stay anchored to the trigger, preserve safe gutters
                on both viewport edges, and allow long content to reflow instead
                of causing horizontal page overflow.
              </Text>
              <Text type="supporting" wordBreak="break-word">
                Long localized-token-like content:
                project-settings-notification-delivery-exception-review-queue
              </Text>
            </VStack>}>
          <Button label="Open fit evidence">Open fit evidence</Button>
        </Popover>
      </div>
    </div>,
  play: async ({
    canvasElement
  }) => {
    const trigger = canvasElement.querySelector('button');
    if (trigger instanceof HTMLElement) {
      trigger.click();
    }
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'Match-trigger viewport fit',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      story: {
        inline: false,
        height: '844px'
      },
      description: {
        story: 'Uses the actual Storybook viewport. The real trigger is intentionally 640px wide, while Popover keeps its default match-trigger sizing; the Popover must cap to the available viewport instead of inheriting the full trigger width.'
      }
    }
  },
  render: () => <div {...stylex.props(readinessStyles.viewportStoryCanvas)}>
      <Popover placement="below" alignment="start" label="Match-trigger viewport evidence" data-testid="match-trigger-popover" content={<VStack gap={2} xstyle={readinessStyles.evidenceCopy}>
            <Heading level={4} tabIndex={-1}>
              Match-trigger sizing
            </Heading>
            <Text type="body">
              The anchor is wider than this viewport, but the Popover stays
              inside the available inline space.
            </Text>
          </VStack>}>
        <Button label="Oversized match-width trigger" xstyle={readinessStyles.oversizedTrigger}>
          Oversized match-width trigger
        </Button>
      </Popover>
    </div>,
  play: async ({
    canvasElement
  }) => {
    const trigger = canvasElement.querySelector('button');
    if (trigger instanceof HTMLElement) {
      trigger.click();
    }
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'Tall content overflow',
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      story: {
        inline: false,
        height: '844px'
      },
      description: {
        story: 'Uses the actual Storybook viewport and a realistic project picker. The product-level 360px/50dvh cap keeps this lightweight anchored surface compact, while Popover detects the overflow and makes its content scrollable. Scrolling demonstrates bounded overflow handling; it does not by itself determine whether another presentation is more appropriate.'
      }
    }
  },
  render: () => <TallContentOverflowExample />,
  play: async ({
    canvasElement
  }) => {
    const trigger = canvasElement.querySelector('button');
    if (trigger instanceof HTMLElement) {
      trigger.click();
    }
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'Read-only dialog focus',
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        height: '844px'
      },
      description: {
        story: 'Manual assistive-technology check for a dialog-style Popover with no content controls. On open, the labeled dialog container receives focus without revealing the fallback close button. Confirm the dialog name and role are announced, Tab reaches Close popover, Shift+Tab remains contained, Escape closes, and focus returns to the trigger.'
      }
    }
  },
  render: () => <Popover placement="below" label="Deployment status" content={<VStack gap={2}>
          <Heading level={4}>Deployment status</Heading>
          <Text type="body">
            The latest production deployment completed successfully.
          </Text>
        </VStack>}>
      <Button label="View deployment status">View deployment status</Button>
    </Popover>,
  play: async ({
    canvasElement
  }) => {
    const trigger = canvasElement.querySelector('button');
    if (trigger instanceof HTMLElement) {
      trigger.click();
    }
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'Trigger Interaction Evidence',
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        height: '844px'
      },
      description: {
        story: 'Desktop Storybook interaction evidence: the native button trigger opens the popover without hover. Use real touch/iOS evidence before claiming mobile Safari behavior.'
      }
    }
  },
  render: () => <Popover placement="below" label="Interaction evidence" content={<VStack gap={2}>
          <Heading level={4} tabIndex={-1}>
            Interaction evidence
          </Heading>
          <Text type="body">
            Opened by trigger activation; Escape, outside press, and focus
            return are covered by unit tests.
          </Text>
        </VStack>}>
      <Button label="Open interaction evidence">
        Open interaction evidence
      </Button>
    </Popover>,
  play: async ({
    canvasElement
  }) => {
    const trigger = canvasElement.querySelector('button');
    if (trigger instanceof HTMLElement) {
      trigger.click();
    }
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'Keep Popover Presentation',
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        height: '844px'
      },
      description: {
        story: 'Keep Popover for anchored, compact supplemental details and actions. The trigger is click/tap activated, not hover dependent, and the compact surface keeps context near the trigger.'
      }
    }
  },
  render: () => <ProjectActionSurface presentation="popover" />,
  play: async ({
    canvasElement
  }) => {
    const trigger = canvasElement.querySelector('button');
    if (trigger instanceof HTMLElement) {
      trigger.click();
    }
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'BottomSheet Presentation Option',
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        height: '844px'
      },
      description: {
        story: 'This story shows BottomSheet as an explicit alternative for the same focused task when a product wants a bottom-edge modal touch surface. It changes the contract: dialog focus ownership, scrim behavior, Escape handling, swipe-to-dismiss, and sheet body scrolling differ from Popover.'
      }
    }
  },
  render: () => <ProjectActionSurface presentation="bottom-sheet" />,
  play: async ({
    canvasElement
  }) => {
    const trigger = canvasElement.querySelector('button');
    if (trigger instanceof HTMLElement) {
      trigger.click();
    }
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'Adaptive Popover Recipe',
  args: {
    presentation: 'popover',
    touchPresentation: 'bottom-sheet'
  },
  argTypes: {
    presentation: {
      control: 'select',
      options: ['popover', 'bottom-sheet'],
      description: 'Deterministic review/test override for the presentation used by this recipe story.'
    },
    touchPresentation: {
      control: 'select',
      options: ['popover', 'bottom-sheet'],
      description: 'Opt-in touch presentation. If a consumer omits the deterministic presentation override, the recipe may choose BottomSheet only for compact + coarse pointer + no hover.'
    }
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: {
        inline: false,
        height: '844px'
      },
      description: {
        story: 'Story-local recipe only: Core Popover does not silently adapt. Products opt in with touchPresentation="bottom-sheet" and can force presentation="popover" or presentation="bottom-sheet" for review and tests.'
      }
    }
  },
  render: args => <ProjectActionSurface {...args} />,
  play: async ({
    canvasElement
  }) => {
    const trigger = canvasElement.querySelector('button');
    if (trigger instanceof HTMLElement) {
      trigger.click();
    }
  }
}`,...Q.parameters?.docs?.source}}},$=[`Default`,`FilterPanel`,`Confirmation`,`AnchorRef`,`Above`,`Disabled`,`TokenTrigger`,`LinkTrigger`,`RenderProp`,`ViewportFit`,`MatchTriggerViewportFit`,`TallContentOverflow`,`ReadOnlyDialogFocus`,`TriggerInteractionEvidence`,`KeepPopoverPresentation`,`BottomSheetPresentationOption`,`AdaptivePopoverRecipe`]}))();export{B as Above,Q as AdaptivePopoverRecipe,z as AnchorRef,Z as BottomSheetPresentationOption,R as Confirmation,I as Default,V as Disabled,L as FilterPanel,X as KeepPopoverPresentation,U as LinkTrigger,K as MatchTriggerViewportFit,J as ReadOnlyDialogFocus,W as RenderProp,q as TallContentOverflow,H as TokenTrigger,Y as TriggerInteractionEvidence,G as ViewportFit,$ as __namedExportsOrder,M as default};