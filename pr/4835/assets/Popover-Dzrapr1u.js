import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./stylex-Dft6gtPK.js";import{n as a}from"./mergeProps-JRyAvMxc.js";import{n as o,t as s}from"./themeProps-CREkzZh6.js";import{r as c}from"./devWarning-DiDrVodI.js";import{t as l}from"./jsx-runtime-DeHZSEgm.js";import{n as u,t as d}from"./layerAnimations.stylex-18OH5AHk.js";import{n as f,t as p}from"./useIsomorphicLayoutEffect-vnms8l8s.js";import{n as m,t as h}from"./usePopover-DPO-mU50.js";import{n as g,t as _}from"./InteractiveRoleContext-qXvwHw-C.js";function v(e){return e.matches(S)?e:e.querySelector(S)}function y({children:e,anchorRef:t,content:n,placement:i=`below`,alignment:s=`start`,isOpen:c,onOpenChange:l,isEnabled:d=!0,width:p,label:h,role:g=`dialog`,isModal:y,hasCloseButton:S,closeButtonLabel:w,hasAutoFocus:T,hasLightDismiss:E=!0,hasEscapeDismiss:D=!0,xstyle:O,className:k,style:A,"data-testid":j}){let M=(0,b.useRef)(null),N=c!==void 0,P=(0,b.useRef)(0),F=(0,b.useCallback)(()=>{l?.(!0)},[l]),I=(0,b.useCallback)(()=>{P.current=Date.now(),l?.(!1)},[l]),L=m({dialogLabel:h,role:g,isModal:y,hasLightDismiss:E,hasEscapeDismiss:D,hasCloseButton:S,closeButtonLabel:w,hasAutoFocus:T,onShow:F,onHide:I}),R=(0,b.useCallback)(()=>{d&&(Date.now()-P.current<50||L.toggle())},[d,L]),z=(0,b.useCallback)(e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),R())},[R]),B=(0,b.useCallback)(e=>{e.setAttribute(`aria-haspopup`,L.triggerProps[`aria-haspopup`]),e.setAttribute(`aria-expanded`,String(L.triggerProps[`aria-expanded`])),e.setAttribute(`aria-controls`,L.triggerProps[`aria-controls`]),e.addEventListener(`click`,R);let t=e.tagName!==`BUTTON`&&e.getAttribute(`role`)===`button`;return t&&e.addEventListener(`keydown`,z),()=>{e.removeAttribute(`aria-haspopup`),e.removeAttribute(`aria-expanded`),e.removeAttribute(`aria-controls`),e.removeEventListener(`click`,R),t&&e.removeEventListener(`keydown`,z)}},[L,R,z]);f(()=>{if(!t)return;let e=t.current;if(!e)return;let n=v(e);if(!n)return;L.triggerRef(e);let r=B(n);return()=>{L.triggerRef(null),r()}},[t,L,B]),f(()=>{if(t||typeof e==`function`)return;let n=M.current;if(!n)return;L.triggerRef(n);let r=v(n);if(!r)return;let i=B(r);return()=>{L.triggerRef(null),i()}},[t,L,B]),f(()=>{N&&(c&&!L.isOpen?L.show():!c&&L.isOpen&&L.hide())},[c,N,L]);let V=p?C.customWidth(p):C.matchTrigger;if(t&&e==null)return(0,x.jsx)(x.Fragment,{children:L.render((0,x.jsx)(`div`,{"data-testid":j,...a(o(`popover`),r(C.contentPadding,O),k,A),children:n}),{placement:i,alignment:s,xstyle:[V,C.gap,u[i]]})});if(typeof e==`function`){let t={ref:L.triggerRef,onClick:R,"aria-haspopup":`dialog`,"aria-expanded":L.isOpen,"aria-controls":L.id};return(0,x.jsxs)(x.Fragment,{children:[e(t),L.render((0,x.jsx)(`div`,{"data-testid":j,...a(o(`popover`),r(C.contentPadding,O),k,A),children:n}),{placement:i,alignment:s,xstyle:[V,C.gap,u[i]]})]})}return(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(_,{value:`button`,children:(0,x.jsx)(`div`,{ref:M,className:`astryx3nfvp2`,children:e})}),L.render((0,x.jsx)(`div`,{"data-testid":j,...a(o(`popover`),r(C.contentPadding,O),k,A),children:n}),{placement:i,alignment:s,xstyle:[V,C.gap,u[i]]})]})}var b,x,S,C;function w(){return(w=t((()=>{b=e(n(),1),p(),i(),c(),h(),d(),g(),s(),x=l(),S=`button, [role="button"]`,C={contentPadding:{kLKAdn:`astryx1vlblms`,kGO01o:`astryxvmdzux`,kZCmMZ:`astryx126nfab`,kwRFfy:`astryx1t818jl`,$$css:!0},gap:{keoZOQ:`astryxcsaf9d`,k1K539:`astryx14cgwvg`,$$css:!0},customWidth:e=>[{kzqmXN:(typeof e==`number`?`${e}px`:e)==null?typeof e==`number`?`${e}px`:e:`astryx5lhr3w`,$$css:!0},{"--x-width":(e=>typeof e==`number`?e+`px`:e??void 0)(typeof e==`number`?`${e}px`:e)}],matchTrigger:{k7Eaqz:`astryxrzjruh`,$$css:!0}},y.displayName=`Popover`,y.__docgenInfo={description:`A click-triggered popover for displaying interactive content anchored to a trigger.

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
@default true`,defaultValue:{value:`true`,computed:!1}},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the popover container.`}},composes:[`Pick`]}})))()}export{w as n,y as t};