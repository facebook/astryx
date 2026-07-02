import{ah as s,aI as P,a1 as o,a6 as w,af as k,ay as R,a3 as A}from"./iframe-Z8EfSKmM.js";import{u as H}from"./usePopover-ay_XHQXA.js";import{I as M}from"./useInteractiveRole-l77ufAgN.js";const I='button, [role="button"]';function L(n){return n.matches(I)?n:n.querySelector(I)}const i={contentPadding:{kLKAdn:"astryx1vlblms",kGO01o:"astryxvmdzux",kZCmMZ:"astryx126nfab",kwRFfy:"astryx1t818jl",$$css:!0},gap:{keoZOQ:"astryxcsaf9d",k1K539:"astryx14cgwvg",$$css:!0},customWidth:n=>[{kzqmXN:(typeof n=="number"?`${n}px`:n)!=null?"astryx5lhr3w":typeof n=="number"?`${n}px`:n,$$css:!0},{"--x-width":(r=>typeof r=="number"?r+"px":r??void 0)(typeof n=="number"?`${n}px`:n)}],matchTrigger:{k7Eaqz:"astryxrzjruh",$$css:!0}};function O({children:n,anchorRef:r,content:m,placement:l="below",alignment:g="start",isOpen:d,onOpenChange:u,isEnabled:C=!0,width:q,label:F,hasCloseButton:N,closeButtonLabel:$,hasAutoFocus:W,xstyle:f,className:h,style:v,"data-testid":b}){const S=s.useRef(null),E=d!==void 0,j=s.useRef(0),B=s.useCallback(()=>{u?.(!0)},[u]),D=s.useCallback(()=>{j.current=Date.now(),u?.(!1)},[u]),t=H({dialogLabel:F,hasLightDismiss:!0,hasCloseButton:N,closeButtonLabel:$,hasAutoFocus:W,onShow:B,onHide:D}),p=s.useCallback(()=>{C&&(Date.now()-j.current<50||t.toggle())},[C,t]),y=s.useCallback(e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),p())},[p]),c=s.useCallback(e=>{e.setAttribute("aria-haspopup",t.triggerProps["aria-haspopup"]),e.setAttribute("aria-expanded",String(t.triggerProps["aria-expanded"])),e.setAttribute("aria-controls",t.triggerProps["aria-controls"]),e.addEventListener("click",p);const a=e.tagName!=="BUTTON"&&e.getAttribute("role")==="button";return a&&e.addEventListener("keydown",y),()=>{e.removeAttribute("aria-haspopup"),e.removeAttribute("aria-expanded"),e.removeAttribute("aria-controls"),e.removeEventListener("click",p),a&&e.removeEventListener("keydown",y)}},[t,p,y]);P(()=>{if(!r)return;const e=r.current;if(!e)return;const a=L(e);if(a||console.warn('Popover: anchorRef must reference a <button> or [role="button"] element. The popover trigger implements the button + dialog ARIA pattern.'),!a)return;t.triggerRef(e);const x=c(a);return()=>{t.triggerRef(null),x()}},[r,t,c]),P(()=>{if(r||typeof n=="function")return;const e=S.current;if(!e)return;t.triggerRef(e);const a=L(e);if(a||console.warn('Popover: children must contain a <button> or [role="button"] element. The popover trigger implements the button + dialog ARIA pattern.'),!a)return;const x=c(a);return()=>{t.triggerRef(null),x()}},[r,t,c]),P(()=>{E&&(d&&!t.isOpen?t.show():!d&&t.isOpen&&t.hide())},[d,E,t]);const T=q?i.customWidth(q):i.matchTrigger;if(r&&n==null)return o.jsx(o.Fragment,{children:t.render(o.jsx("div",{"data-testid":b,...w(R("popover"),k(i.contentPadding,f),h,v),children:m}),{placement:l,alignment:g,xstyle:[T,i.gap,A[l]]})});if(typeof n=="function"){const e={ref:t.triggerRef,onClick:p,"aria-haspopup":"dialog","aria-expanded":t.isOpen,"aria-controls":t.id};return o.jsxs(o.Fragment,{children:[n(e),t.render(o.jsx("div",{"data-testid":b,...w(R("popover"),k(i.contentPadding,f),h,v),children:m}),{placement:l,alignment:g,xstyle:[T,i.gap,A[l]]})]})}return o.jsxs(o.Fragment,{children:[o.jsx(M,{value:"button",children:o.jsx("div",{ref:S,className:"astryx3nfvp2",children:n})}),t.render(o.jsx("div",{"data-testid":b,...w(R("popover"),k(i.contentPadding,f),h,v),children:m}),{placement:l,alignment:g,xstyle:[T,i.gap,A[l]]})]})}O.displayName="Popover";O.__docgenInfo={description:`A click-triggered popover for displaying interactive content anchored to a trigger.

Implements the button + dialog ARIA pattern. The trigger must contain a
\`<button>\` or \`[role="button"]\` element — the popover finds it and applies
click/keydown handlers and ARIA attributes automatically.

Uses an inline-flex wrapper as the CSS anchor for stable positioning
(immune to pressed-state transforms like \`:active { scale(0.98) }\`).

Focus is trapped inside the popover when open.
Supports light dismiss (click outside or Escape to close).

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
\`\`\``,methods:[],displayName:"Popover",props:{children:{required:!1,tsType:{name:"union",raw:"ReactNode | ((props: PopoverTriggerRenderProps) => ReactNode)",elements:[{name:"ReactNode"},{name:"unknown"}]},description:`The trigger element. Accepts either:

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
\`\`\``},anchorRef:{required:!1,tsType:{name:"ReactRefObject",raw:"React.RefObject<HTMLElement>",elements:[{name:"HTMLElement"}]},description:'External ref to use as the popover anchor.\nWhen provided (and no children), the popover attaches to this element\ninstead of wrapping children. The referenced element must be a\n`<button>` or `[role="button"]` — the popover applies click/keydown\nhandlers and ARIA attributes to it directly.'},content:{required:!0,tsType:{name:"ReactNode"},description:"Content to display inside the popover."},placement:{required:!1,tsType:{name:"union",raw:"'above' | 'below' | 'start' | 'end'",elements:[{name:"literal",value:"'above'"},{name:"literal",value:"'below'"},{name:"literal",value:"'start'"},{name:"literal",value:"'end'"}]},description:`Position placement relative to the trigger.
Uses CSS anchor positioning via useLayer.
@default 'below'`,defaultValue:{value:"'below'",computed:!1}},alignment:{required:!1,tsType:{name:"union",raw:"'start' | 'center' | 'end'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'center'"},{name:"literal",value:"'end'"}]},description:`Alignment along the placement axis.
@default 'start'`,defaultValue:{value:"'start'",computed:!1}},isOpen:{required:!1,tsType:{name:"boolean"},description:`Whether the popover is open (controlled mode).
Omit for uncontrolled behavior.`},onOpenChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(isOpen: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"isOpen"}],return:{name:"void"}}},description:"Callback fired when the popover visibility changes."},isEnabled:{required:!1,tsType:{name:"boolean"},description:`Whether the popover is enabled.
When false, trigger interactions are ignored.
@default true`,defaultValue:{value:"true",computed:!1}},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:`Width of the popover container.
Numbers are px, strings used as-is.
@default 'auto'`},label:{required:!1,tsType:{name:"string"},description:`Accessible label for the popover dialog.
Recommended for accessibility (used as aria-label on the dialog).`},hasCloseButton:{required:!1,tsType:{name:"boolean"},description:`Whether to include a hidden close button for accessibility.
The button appears when keyboard users tab past the last element.
@default true`},closeButtonLabel:{required:!1,tsType:{name:"string"},description:`Label for the hidden close button.
@default "Close popover"`},hasAutoFocus:{required:!1,tsType:{name:"boolean"},description:"Whether to auto-focus the first focusable element when the popover opens.\nSet to `false` for inline showcases or documentation previews.\n@default true"},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for the popover container."}},composes:["Pick"]};export{O as P};
