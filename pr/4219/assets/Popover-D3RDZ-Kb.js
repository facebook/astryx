import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{l as r,n as i,t as a,u as o}from"./themeProps-_oSbOSxB.js";import{S as s,t as c}from"./utils-CD2ovDaz.js";import{t as l}from"./jsx-runtime-DqZldVDK.js";import{n as u,t as d}from"./layerAnimations.stylex-B02Rgc52.js";import{n as f,t as p}from"./useIsomorphicLayoutEffect-AEBSTB0m.js";import{n as m,t as h}from"./usePopover-BHhjpZNo.js";import{n as g,t as _}from"./InteractiveRoleContext-DtotSF-S.js";function v(e){return e.matches(S)?e:e.querySelector(S)}function y({children:e,anchorRef:t,content:n,placement:r=`below`,alignment:a=`start`,isOpen:c,onOpenChange:l,isEnabled:d=!0,width:p,label:h,hasCloseButton:g,closeButtonLabel:y,hasAutoFocus:S,hasLightDismiss:w=!0,hasEscapeDismiss:T=!0,xstyle:E,className:D,style:O,"data-testid":k}){let A=(0,b.useRef)(null),j=c!==void 0,M=(0,b.useRef)(0),N=m({dialogLabel:h,hasLightDismiss:w,hasEscapeDismiss:T,hasCloseButton:g,closeButtonLabel:y,hasAutoFocus:S,onShow:(0,b.useCallback)(()=>{l?.(!0)},[l]),onHide:(0,b.useCallback)(()=>{M.current=Date.now(),l?.(!1)},[l])}),P=(0,b.useCallback)(()=>{d&&(Date.now()-M.current<50||N.toggle())},[d,N]),F=(0,b.useCallback)(e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),P())},[P]),I=(0,b.useCallback)(e=>{e.setAttribute(`aria-haspopup`,N.triggerProps[`aria-haspopup`]),e.setAttribute(`aria-expanded`,String(N.triggerProps[`aria-expanded`])),e.setAttribute(`aria-controls`,N.triggerProps[`aria-controls`]),e.addEventListener(`click`,P);let t=e.tagName!==`BUTTON`&&e.getAttribute(`role`)===`button`;return t&&e.addEventListener(`keydown`,F),()=>{e.removeAttribute(`aria-haspopup`),e.removeAttribute(`aria-expanded`),e.removeAttribute(`aria-controls`),e.removeEventListener(`click`,P),t&&e.removeEventListener(`keydown`,F)}},[N,P,F]);f(()=>{if(!t)return;let e=t.current;if(!e)return;let n=v(e);if(n||console.warn(`Popover: anchorRef must reference a <button> or [role="button"] element. The popover trigger implements the button + dialog ARIA pattern.`),!n)return;N.triggerRef(e);let r=I(n);return()=>{N.triggerRef(null),r()}},[t,N,I]),f(()=>{if(t||typeof e==`function`)return;let n=A.current;if(!n)return;N.triggerRef(n);let r=v(n);if(r||console.warn(`Popover: children must contain a <button> or [role="button"] element. The popover trigger implements the button + dialog ARIA pattern.`),!r)return;let i=I(r);return()=>{N.triggerRef(null),i()}},[t,N,I]),f(()=>{j&&(c&&!N.isOpen?N.show():!c&&N.isOpen&&N.hide())},[c,j,N]);let L=p?C.customWidth(p):C.matchTrigger;return t&&e==null?(0,x.jsx)(x.Fragment,{children:N.render((0,x.jsx)(`div`,{"data-testid":k,...s(i(`popover`),o(C.contentPadding,E),D,O),children:n}),{placement:r,alignment:a,xstyle:[L,C.gap,u[r]]})}):typeof e==`function`?(0,x.jsxs)(x.Fragment,{children:[e({ref:N.triggerRef,onClick:P,"aria-haspopup":`dialog`,"aria-expanded":N.isOpen,"aria-controls":N.id}),N.render((0,x.jsx)(`div`,{"data-testid":k,...s(i(`popover`),o(C.contentPadding,E),D,O),children:n}),{placement:r,alignment:a,xstyle:[L,C.gap,u[r]]})]}):(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(_,{value:`button`,children:(0,x.jsx)(`div`,{ref:A,className:`astryx3nfvp2`,children:e})}),N.render((0,x.jsx)(`div`,{"data-testid":k,...s(i(`popover`),o(C.contentPadding,E),D,O),children:n}),{placement:r,alignment:a,xstyle:[L,C.gap,u[r]]})]})}var b,x,S,C,w=e((()=>{b=t(n(),1),p(),r(),c(),h(),d(),g(),a(),x=l(),S=`button, [role="button"]`,C={contentPadding:{kLKAdn:`astryx1vlblms`,kGO01o:`astryxvmdzux`,kZCmMZ:`astryx126nfab`,kwRFfy:`astryx1t818jl`,$$css:!0},gap:{keoZOQ:`astryxcsaf9d`,k1K539:`astryx14cgwvg`,$$css:!0},customWidth:e=>[{kzqmXN:(typeof e==`number`?`${e}px`:e)==null?typeof e==`number`?`${e}px`:e:`astryx5lhr3w`,$$css:!0},{"--x-width":(e=>typeof e==`number`?e+`px`:e??void 0)(typeof e==`number`?`${e}px`:e)}],matchTrigger:{k7Eaqz:`astryxrzjruh`,$$css:!0}},y.displayName=`Popover`,y.__docgenInfo={description:`A click-triggered popover for displaying interactive content anchored to a trigger.

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
@default 'auto'`},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the popover dialog.
Recommended for accessibility (used as aria-label on the dialog).`},hasCloseButton:{required:!1,tsType:{name:`boolean`},description:`Whether to include a hidden close button for accessibility.
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
@default true`,defaultValue:{value:`true`,computed:!1}},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the popover container.`}},composes:[`Pick`]}})),T=e((()=>{h(),w()}));export{y as n,w as r,T as t};