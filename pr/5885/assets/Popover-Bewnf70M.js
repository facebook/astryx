import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{b as r,p as i}from"./ime-Dy4QRKoo.js";import{d as a}from"./utils-eYNPhPe_.js";import{t as o}from"./jsx-runtime-DqZldVDK.js";import{c as s,s as c}from"./useTooltip-B06VSoGn.js";import{n as l,t as u}from"./useIsomorphicLayoutEffect-AEBSTB0m.js";import{n as d,t as f}from"./InteractiveRoleContext-DtotSF-S.js";import{r as p,t as m}from"./usePopover-CJkrOE9x.js";function h(e){return e.matches(y)?e:e.querySelector(y)}function g({children:e,anchorRef:t,content:n,placement:i=`below`,alignment:a=`start`,isOpen:o,onOpenChange:c,isEnabled:u=!0,width:d,label:m,role:g=`dialog`,isModal:y,hasCloseButton:b,closeButtonLabel:S,hasAutoFocus:C,hasLightDismiss:w=!0,hasEscapeDismiss:T=!0,xstyle:E,className:D,style:O,"data-testid":k}){let A=(0,_.useRef)(null),j=(0,_.useRef)(null),[M,N]=(0,_.useState)(!1),P=o!==void 0,F=(0,_.useCallback)(()=>{c?.(!0)},[c]),I=(0,_.useCallback)(()=>{c?.(!1)},[c]),L=p({dialogLabel:m,role:g,isModal:y,hasLightDismiss:w,hasEscapeDismiss:T,hasCloseButton:b,closeButtonLabel:S,hasAutoFocus:C,surfaceTarget:`popover`,xstyle:[x.contentPadding,x.surfaceViewportFit,M&&x.surfaceScrollable,E],className:D,style:O,onShow:F,onHide:I}),R=(0,_.useCallback)(()=>{let e=L.contentRef.current;if(!e)return;let t=e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1;N(e=>e===t?e:t)},[L.contentRef]),z=(0,_.useCallback)(()=>{j.current??=window.requestAnimationFrame(()=>{j.current=null,R()})},[R]);l(()=>{if(!L.isOpen)return;let e=L.contentRef.current;if(!e)return;R();let t=typeof ResizeObserver>`u`?null:new ResizeObserver(z),n=typeof MutationObserver>`u`?null:new MutationObserver(z);return t?.observe(e),n?.observe(e,{childList:!0,characterData:!0,subtree:!0}),e.addEventListener(`load`,z,!0),window.addEventListener(`resize`,z),window.visualViewport?.addEventListener(`resize`,z),()=>{t?.disconnect(),n?.disconnect(),e.removeEventListener(`load`,z,!0),window.removeEventListener(`resize`,z),window.visualViewport?.removeEventListener(`resize`,z),j.current!=null&&(window.cancelAnimationFrame(j.current),j.current=null)}},[R,L.isOpen,z]),l(()=>{L.isOpen&&z()},[n,L.isOpen,z]);let B=(0,_.useCallback)(e=>{u&&L.toggleWithOptions({focusTarget:g===`dialog`&&e!=null&&e.detail>0?`container`:`first`})},[u,L,g]),V=(0,_.useCallback)(e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),B())},[B]),H=(0,_.useCallback)(e=>{e.setAttribute(`aria-haspopup`,L.triggerProps[`aria-haspopup`]),e.setAttribute(`aria-expanded`,String(L.triggerProps[`aria-expanded`])),e.setAttribute(`aria-controls`,L.triggerProps[`aria-controls`]),e.addEventListener(`click`,B);let t=e.tagName!==`BUTTON`&&e.getAttribute(`role`)===`button`;return t&&e.addEventListener(`keydown`,V),()=>{e.removeAttribute(`aria-haspopup`),e.removeAttribute(`aria-expanded`),e.removeAttribute(`aria-controls`),e.removeEventListener(`click`,B),t&&e.removeEventListener(`keydown`,V)}},[L,B,V]);l(()=>{if(!t)return;let e=t.current;if(!e)return;let n=h(e);if(!n)return;L.triggerRef(e);let r=H(n);return()=>{L.triggerRef(null),r()}},[t,L,H]),l(()=>{if(t||typeof e==`function`)return;let n=A.current;if(!n)return;L.triggerRef(n);let r=h(n);if(!r)return;let i=H(r);return()=>{L.triggerRef(null),i()}},[t,L,H]),l(()=>{P&&(o&&!L.isOpen?L.show():!o&&L.isOpen&&L.hide())},[o,P,L]);let U=d?x.customWidth(d):a===`center`?x.matchTriggerCentered:x.matchTriggerAligned,W=i===`start`||i===`end`,G=a===`center`?W?x.viewportBlockCentered:x.viewportCentered:[x.viewportAligned,W?a===`start`?x.viewportBlockStart:x.viewportBlockEnd:a===`start`?x.viewportStart:x.viewportEnd];return t&&e==null?(0,v.jsx)(v.Fragment,{children:L.render((0,v.jsx)(`div`,{"data-testid":k,children:n}),{placement:i,alignment:a,offset:r[`--spacing-1`],xstyle:[x.viewportFit,G,U,s[i]]})}):typeof e==`function`?(0,v.jsxs)(v.Fragment,{children:[e({ref:L.triggerRef,onClick:B,"aria-haspopup":`dialog`,"aria-expanded":L.isOpen,"aria-controls":L.id}),L.render((0,v.jsx)(`div`,{"data-testid":k,children:n}),{placement:i,alignment:a,offset:r[`--spacing-1`],xstyle:[x.viewportFit,G,U,s[i]]})]}):(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(f,{value:`button`,children:(0,v.jsx)(`div`,{ref:A,className:`astryx3nfvp2`,children:e})}),L.render((0,v.jsx)(`div`,{"data-testid":k,children:n}),{placement:i,alignment:a,offset:r[`--spacing-1`],xstyle:[x.viewportFit,G,U,s[i]]})]})}var _,v,y,b,x,S=e((()=>{_=t(n(),1),u(),a(),m(),c(),i(),d(),v=o(),y=`button, [role="button"]`,b=r[`--spacing-4`],`${b}${b}`,`${b}${b}`,`${b}${b}`,`${b}${b}`,`${b}`,`${b}`,`${b}`,x={viewportFit:{kB7OPa:`astryx9f619`,kskxy:`astryxtm2925`,$$css:!0},viewportAligned:{ks0D6T:`astryxbd96yr`,$$css:!0},viewportStart:{k71WvV:`astryxxeicf8`,koQZXg:null,km5ZXQ:null,$$css:!0},viewportEnd:{keTefX:`astryx47fqr9`,koQZXg:null,km5ZXQ:null,$$css:!0},viewportBlockStart:{k1K539:`astryx1kps3mo`,$$css:!0},viewportBlockEnd:{keoZOQ:`astryxsoubt3`,$$css:!0},viewportCentered:{keTefX:`astryx47fqr9`,k71WvV:`astryxxeicf8`,koQZXg:null,km5ZXQ:null,ks0D6T:`astryxs2v1xk`,$$css:!0},viewportBlockCentered:{keoZOQ:`astryxsoubt3`,k1K539:`astryx1kps3mo`,ks0D6T:`astryxs2v1xk`,$$css:!0},surfaceViewportFit:{kB7OPa:`astryx9f619`,ks0D6T:`astryxs2v1xk`,kskxy:`astryxtm2925`,$$css:!0},surfaceScrollable:{kVQacm:`astryxysyzu8`,kXHlph:null,kORKVm:null,kZeWKH:`astryxish69e`,$$css:!0},contentPadding:{kLKAdn:`astryx1vlblms`,kGO01o:`astryxvmdzux`,kZCmMZ:`astryx126nfab`,kwRFfy:`astryx1t818jl`,kE3dHu:null,kpe85a:null,$$css:!0},customWidth:e=>[{kzqmXN:(typeof e==`number`?`${e}px`:e)==null?typeof e==`number`?`${e}px`:e:`astryx5lhr3w`,$$css:!0},{"--x-width":(e=>typeof e==`number`?e+`px`:e??void 0)(typeof e==`number`?`${e}px`:e)}],matchTriggerAligned:{k7Eaqz:`astryx1ks9poc`,$$css:!0},matchTriggerCentered:{k7Eaqz:`astryxagy28z`,$$css:!0}},g.displayName=`Popover`,g.__docgenInfo={description:`A click-triggered popover for displaying interactive content anchored to a trigger.

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
@default "Close popover"`},hasAutoFocus:{required:!1,tsType:{name:`boolean`},description:`Whether to move focus into the popover when it opens. Keyboard activation
focuses the first content control; pointer activation focuses the labeled
dialog container so an action does not appear preselected.
Set to \`false\` for inline showcases or documentation previews.
@default true`},hasLightDismiss:{required:!1,tsType:{name:`boolean`},description:`Whether clicking outside dismisses the popover.
Set to \`false\` for surfaces that should stay open until explicitly
dismissed, like onboarding coachmarks or multi-step flows.
@default true`,defaultValue:{value:`true`,computed:!1}},hasEscapeDismiss:{required:!1,tsType:{name:`boolean`},description:`Whether pressing Escape dismisses the popover.

Only takes full effect together with \`hasLightDismiss={false}\`: with
light dismiss on, the browser's native light dismiss also closes on
Escape. Set both to \`false\` for explicit-dismiss-only surfaces.
@default true`,defaultValue:{value:`true`,computed:!1}},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the popover container.`}},composes:[`Pick`]}})),C=e((()=>{m(),S()}));export{g as n,S as r,C as t};