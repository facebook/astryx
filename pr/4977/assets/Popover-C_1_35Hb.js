import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{A as r,C as i,S as a,_ as o,j as s,u as c}from"./tokens.stylex-Dlps2mzj.js";import{F as l,d as u,t as d}from"./utils-CS5QvixW.js";import{t as f}from"./jsx-runtime-DqZldVDK.js";import{n as p,t as m}from"./layerAnimations.stylex-Dwepen3t.js";import{n as h,t as g}from"./useIsomorphicLayoutEffect-AEBSTB0m.js";import{n as _,t as v}from"./usePopover-B0FwwRCt.js";import{n as y,t as b}from"./InteractiveRoleContext-DtotSF-S.js";function x(e){return e.matches(T)?e:e.querySelector(T)}function S({children:e,anchorRef:t,content:n,placement:r=`below`,alignment:a=`start`,isOpen:c,onOpenChange:u,isEnabled:d=!0,width:f,label:m,role:g=`dialog`,isModal:v,hasCloseButton:y,closeButtonLabel:S,hasAutoFocus:T,hasLightDismiss:D=!0,hasEscapeDismiss:O=!0,xstyle:k,className:A,style:j,"data-testid":M}){let N=(0,C.useRef)(null),P=c!==void 0,F=(0,C.useRef)(0),I=_({dialogLabel:m,role:g,isModal:v,hasLightDismiss:D,hasEscapeDismiss:O,hasCloseButton:y,closeButtonLabel:S,hasAutoFocus:T,onShow:(0,C.useCallback)(()=>{u?.(!0)},[u]),onHide:(0,C.useCallback)(()=>{F.current=Date.now(),u?.(!1)},[u])}),L=(0,C.useCallback)(()=>{d&&(Date.now()-F.current<50||I.toggle())},[d,I]),R=(0,C.useCallback)(e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),L())},[L]),z=(0,C.useCallback)(e=>{e.setAttribute(`aria-haspopup`,I.triggerProps[`aria-haspopup`]),e.setAttribute(`aria-expanded`,String(I.triggerProps[`aria-expanded`])),e.setAttribute(`aria-controls`,I.triggerProps[`aria-controls`]),e.addEventListener(`click`,L);let t=e.tagName!==`BUTTON`&&e.getAttribute(`role`)===`button`;return t&&e.addEventListener(`keydown`,R),()=>{e.removeAttribute(`aria-haspopup`),e.removeAttribute(`aria-expanded`),e.removeAttribute(`aria-controls`),e.removeEventListener(`click`,L),t&&e.removeEventListener(`keydown`,R)}},[I,L,R]);h(()=>{if(!t)return;let e=t.current;if(!e)return;let n=x(e);if(!n)return;I.triggerRef(e);let r=z(n);return()=>{I.triggerRef(null),r()}},[t,I,z]),h(()=>{if(t||typeof e==`function`)return;let n=N.current;if(!n)return;I.triggerRef(n);let r=x(n);if(!r)return;let i=z(r);return()=>{I.triggerRef(null),i()}},[t,I,z]),h(()=>{P&&(c&&!I.isOpen?I.show():!c&&I.isOpen&&I.hide())},[c,P,I]);let B=f?E.customWidth(f):E.matchTrigger;return t&&e==null?(0,w.jsx)(w.Fragment,{children:I.render((0,w.jsx)(`div`,{"data-testid":M,...l(i(`popover`),s(E.contentPadding,k),A,j),children:n}),{placement:r,alignment:a,offset:o[`--spacing-1`],xstyle:[B,p[r]]})}):typeof e==`function`?(0,w.jsxs)(w.Fragment,{children:[e({ref:I.triggerRef,onClick:L,"aria-haspopup":`dialog`,"aria-expanded":I.isOpen,"aria-controls":I.id}),I.render((0,w.jsx)(`div`,{"data-testid":M,...l(i(`popover`),s(E.contentPadding,k),A,j),children:n}),{placement:r,alignment:a,offset:o[`--spacing-1`],xstyle:[B,p[r]]})]}):(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(b,{value:`button`,children:(0,w.jsx)(`div`,{ref:N,className:`astryx3nfvp2`,children:e})}),I.render((0,w.jsx)(`div`,{"data-testid":M,...l(i(`popover`),s(E.contentPadding,k),A,j),children:n}),{placement:r,alignment:a,offset:o[`--spacing-1`],xstyle:[B,p[r]]})]})}var C,w,T,E,D=e((()=>{C=t(n(),1),g(),r(),d(),u(),v(),m(),c(),y(),a(),w=f(),T=`button, [role="button"]`,E={contentPadding:{kLKAdn:`astryx1vlblms`,kGO01o:`astryxvmdzux`,kZCmMZ:`astryx126nfab`,kwRFfy:`astryx1t818jl`,$$css:!0},customWidth:e=>[{kzqmXN:(typeof e==`number`?`${e}px`:e)==null?typeof e==`number`?`${e}px`:e:`astryx5lhr3w`,$$css:!0},{"--x-width":(e=>typeof e==`number`?e+`px`:e??void 0)(typeof e==`number`?`${e}px`:e)}],matchTrigger:{k7Eaqz:`astryxrzjruh`,$$css:!0}},S.displayName=`Popover`,S.__docgenInfo={description:`A click-triggered popover for displaying interactive content anchored to a trigger.

Implements the button + dialog ARIA pattern. The trigger must contain a
\`<button>\` or \`[role="button"]\` element — the popover finds it and applies
click/keydown handlers and ARIA attributes automatically.

Uses an inline-flex wrapper as the CSS anchor for stable positioning
(immune to pressed-state transforms like \`:active { scale(0.98) }\`).

Focus is trapped inside the popover when open.
Supports light dismiss by default (click outside or Escape to close).

For hover-triggered overlays, use {@link HoverCard} instead.

@example
\`\`\`
<Popover label="Settings" content={<SettingsPanel />} placement="below">
  <Button label="Settings" />
</Popover>
<Popover
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Filter"
  content={<FilterForm />}>
  <Button label="Filter" />
</Popover>
<Popover
  anchorRef={myButtonRef}
  label="Actions"
  content={<ActionMenu />}
  placement="below"
/>
\`\`\``,methods:[],displayName:`Popover`,props:{children:{required:!1,tsType:{name:`union`,raw:`ReactNode | ((props: PopoverTriggerRenderProps) => ReactNode)`,elements:[{name:`ReactNode`},{name:`unknown`}]},description:`The trigger element. Accepts either:

**ReactNode (automatic mode):** Must contain a \`<button>\` or
\`[role="button"]\` element — the popover locates it and applies
click/keydown handlers and ARIA attributes automatically.
Components that consume \`InteractiveRoleContext\` (e.g., Token)
will render as a button automatically when placed here.

**Render function (explicit mode):** Receives \`PopoverTriggerRenderProps\`
with ref, onClick, and ARIA attributes. The consumer is responsible
for attaching these to their trigger element. Use this for custom
triggers or third-party components.

The trigger is rendered inside an anchor wrapper used for CSS anchor
positioning. The wrapper is stable (no pressed-state transforms),
preventing popover position jitter.

When \`anchorRef\` is provided, children can be omitted and the popover
attaches to the external ref element as a sibling.

@example
\`\`\`
<Popover content={...}><Button label="Open" /></Popover>
<Popover content={...}><Token label="Filter" /></Popover>
<Popover content={...}>
  {(triggerProps) => <MyCustomTrigger {...triggerProps} />}
</Popover>
\`\`\``},anchorRef:{required:!1,tsType:{name:`ReactRefObject`,raw:`React.RefObject<HTMLElement>`,elements:[{name:`HTMLElement`}]},description:`External ref to use as the popover anchor.
When provided (and no children), the popover attaches to this element
instead of wrapping children. The referenced element must be a
\`<button>\` or \`[role="button"]\` — the popover applies click/keydown
handlers and ARIA attributes to it directly.`},content:{required:!0,tsType:{name:`ReactNode`},description:`Content to display inside the popover.`},placement:{required:!1,tsType:{name:`union`,raw:`'above' | 'below' | 'start' | 'end'`,elements:[{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`}]},description:`Position placement relative to the trigger.
Uses CSS anchor positioning via useLayer.
@default 'below'`,defaultValue:{value:`'below'`,computed:!1}},alignment:{required:!1,tsType:{name:`union`,raw:`'start' | 'center' | 'end'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'center'`},{name:`literal`,value:`'end'`}]},description:`Alignment along the placement axis.
@default 'start'`,defaultValue:{value:`'start'`,computed:!1}},isOpen:{required:!1,tsType:{name:`boolean`},description:`Whether the popover is open (controlled mode).
Omit for uncontrolled behavior.`},onOpenChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(isOpen: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`isOpen`}],return:{name:`void`}}},description:`Callback fired when the popover visibility changes.`},isEnabled:{required:!1,tsType:{name:`boolean`},description:`Whether the popover is enabled.
When false, trigger interactions are ignored.
@default true`,defaultValue:{value:`true`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Width of the popover container.
Numbers are px, strings used as-is.
@default 'auto'`},label:{required:!1,tsType:{name:`string`},description:"Accessible label for the popover dialog.\nRecommended for accessibility when `role` is `'dialog'`."},role:{required:!1,tsType:{name:`union`,raw:`'dialog' | 'none'`,elements:[{name:`literal`,value:`'dialog'`},{name:`literal`,value:`'none'`}]},description:`ARIA role stamped on the popover content wrapper.

Use \`'dialog'\` for dialog-style popovers. Use \`'none'\` when the popup
content owns its own role, such as a child \`role="menu"\` or
\`role="listbox"\`.

@default 'dialog'`,defaultValue:{value:`'dialog'`,computed:!1}},isModal:{required:!1,tsType:{name:`boolean`},description:"Whether a dialog-style popover is modal (`aria-modal`). Only applies when\n`role` is `'dialog'`.\n\n@default true"},hasCloseButton:{required:!1,tsType:{name:`boolean`},description:`Whether to include a hidden close button for accessibility.
The button appears when keyboard users tab past the last element.
@default true`},closeButtonLabel:{required:!1,tsType:{name:`string`},description:`Label for the hidden close button.
@default "Close popover"`},hasAutoFocus:{required:!1,tsType:{name:`boolean`},description:`Whether to auto-focus the first focusable element when the popover opens.
Set to \`false\` for inline showcases or documentation previews.
@default true`},hasLightDismiss:{required:!1,tsType:{name:`boolean`},description:`Whether clicking outside dismisses the popover.
Set to \`false\` for surfaces that should stay open until explicitly
dismissed, like onboarding coachmarks or multi-step flows.
@default true`,defaultValue:{value:`true`,computed:!1}},hasEscapeDismiss:{required:!1,tsType:{name:`boolean`},description:`Whether pressing Escape dismisses the popover.

Only takes full effect together with \`hasLightDismiss={false}\`: with
light dismiss on, the browser's native light dismiss also closes on
Escape. Set both to \`false\` for explicit-dismiss-only surfaces.
@default true`,defaultValue:{value:`true`,computed:!1}},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the popover container.`}},composes:[`Pick`]}})),O=e((()=>{v(),D()}));export{S as n,D as r,O as t};