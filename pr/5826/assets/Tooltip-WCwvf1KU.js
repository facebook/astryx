import{a as e,i as t,s as n}from"./preload-helper-CT_b8DTk.js";import{t as r}from"./react-B7Te67-h.js";import{t as i}from"./jsx-runtime-DqZldVDK.js";import{n as a,t as o}from"./useTooltip-BTsK3k9m.js";import{n as s,t as c}from"./useIsomorphicLayoutEffect-AEBSTB0m.js";var l=e({Tooltip:()=>f});function u(e){return typeof e==`string`||typeof e==`number`}function d(...e){let t=e.filter(Boolean);return t.length>0?t.join(` `):void 0}function f({children:e,anchorRef:t,content:n,placement:r=`above`,alignment:i=`center`,delay:o=200,hideDelay:c=0,focusTrigger:l=`auto`,touchTrigger:f=`auto`,isEnabled:h=!0,onOpenChange:g,hasHoverIndication:_=`auto`,isOpen:v,isDefaultOpen:y}){let b=(0,p.useRef)(null),x=e==null?!1:u(e),S=_===!0||_===`auto`&&x,C=a({placement:r,alignment:i,delay:o,hideDelay:c,focusTrigger:l,touchTrigger:f,isEnabled:h,isOpen:v,isDefaultOpen:y,onShow:(0,p.useCallback)(()=>{g?.(!0)},[g]),onHide:(0,p.useCallback)(()=>{g?.(!1)},[g])});return s(()=>{if(!t)return;let e=t.current;if(!e)return;C.ref(e);let n=e.getAttribute(`aria-describedby`);return e.setAttribute(`aria-describedby`,d(n,C.describedBy)??``),()=>{C.ref(null),n?e.setAttribute(`aria-describedby`,n):e.removeAttribute(`aria-describedby`)}},[t,C.ref,C.describedBy]),s(()=>{if(t||x)return;let e=b.current;if(!e)return;let n=e.firstElementChild;if(!n)return;C.ref(n);let r=n.getAttribute(`aria-describedby`);return n.setAttribute(`aria-describedby`,d(r,C.describedBy)??``),()=>{C.ref(null),r?n.setAttribute(`aria-describedby`,r):n.removeAttribute(`aria-describedby`)}},[t,x,C.ref,C.describedBy]),t&&e==null?(0,m.jsx)(m.Fragment,{children:C.renderTooltip(n)}):x?(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`span`,{ref:C.ref,tabIndex:0,"aria-describedby":C.describedBy,...{0:{className:`astryxt0psk2`},1:{className:`astryxt0psk2 astryxujl8zx astryxev0dqp astryxycaml9 astryxrys4gj`}}[!!S<<0],children:e}),C.renderTooltip(n)]}):(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`div`,{ref:b,className:`astryxjp7ctv`,children:e}),C.renderTooltip(n)]})}var p,m,h=t((()=>{p=n(r(),1),c(),o(),m=i(),f.displayName=`Tooltip`,f.__docgenInfo={description:`Tooltip component for displaying informative text on hover/focus.

Uses inverted colors (dark background, light text) for high contrast.
Uses a display:contents wrapper so children refs are preserved.
Uses CSS anchor positioning and the Popover API for optimal performance.

@example
\`\`\`
<Tooltip content="Helpful tooltip text" placement="above">
  <Button>Hover me</Button>
</Tooltip>
\`\`\``,methods:[],displayName:`Tooltip`,props:{children:{required:!1,tsType:{name:`ReactNode`},description:`The trigger element(s). Children refs are preserved.
When \`anchorRef\` is provided, children can be omitted and the tooltip
attaches to the external ref element as a sibling.`},anchorRef:{required:!1,tsType:{name:`ReactRefObject`,raw:`React.RefObject<HTMLElement | null>`,elements:[{name:`union`,raw:`HTMLElement | null`,elements:[{name:`HTMLElement`},{name:`null`}]}]},description:`External ref to use as the tooltip anchor.
When provided (and no children), the tooltip attaches to this element
instead of wrapping children. This enables sibling-mode rendering,
useful for lazy-loaded tooltips that shouldn't remount children.`},content:{required:!0,tsType:{name:`ReactNode`},description:`Content to display in the tooltip.
Typically short, non-interactive text.`},placement:{required:!1,tsType:{name:`union`,raw:`'above' | 'below' | 'start' | 'end'`,elements:[{name:`literal`,value:`'above'`},{name:`literal`,value:`'below'`},{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`}]},description:`Position placement relative to anchor
@default 'above'`,defaultValue:{value:`'above'`,computed:!1}},alignment:{required:!1,tsType:{name:`union`,raw:`'start' | 'center' | 'end'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'center'`},{name:`literal`,value:`'end'`}]},description:`Alignment along the placement axis
@default 'center'`,defaultValue:{value:`'center'`,computed:!1}},delay:{required:!1,tsType:{name:`number`},description:`Delay before showing on hover (ms)
@default 200`,defaultValue:{value:`200`,computed:!1}},hideDelay:{required:!1,tsType:{name:`number`},description:`Delay before hiding after mouse/focus leave (ms)
@default 0`,defaultValue:{value:`0`,computed:!1}},focusTrigger:{required:!1,tsType:{name:`union`,raw:`'auto' | 'always' | 'never'`,elements:[{name:`literal`,value:`'auto'`},{name:`literal`,value:`'always'`},{name:`literal`,value:`'never'`}]},description:"When to trigger on focus:\n- `auto`: Only if element is naturally focusable\n- `always`: Always attach focus listeners\n- `never`: Never attach focus listeners (for composite widgets)\n\n@default 'auto'",defaultValue:{value:`'auto'`,computed:!1}},touchTrigger:{required:!1,tsType:{name:`union`,raw:`'auto' | 'tap' | 'none'`,elements:[{name:`literal`,value:`'auto'`},{name:`literal`,value:`'tap'`},{name:`literal`,value:`'none'`}]},description:`What a tap does on a touch pointer, where there is no hover:
- \`auto\`: tap opens the tooltip, unless the trigger performs an action of
  its own (a button, a link, a form control) — that tap belongs to the
  control, and a hint about a control the user just operated is noise
- \`tap\`: tap always opens the tooltip. This is what an info icon rendered
  as a button wants: it looks like an action to the DOM, but revealing the
  tooltip is the only thing it does
- \`none\`: touch never opens the tooltip

@default 'auto'`,defaultValue:{value:`'auto'`,computed:!1}},isEnabled:{required:!1,tsType:{name:`boolean`},description:`Whether the tooltip is enabled.
When false, hover/focus triggers are disabled.

@default true`,defaultValue:{value:`true`,computed:!1}},onOpenChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(isOpen: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`isOpen`}],return:{name:`void`}}},description:"Callback fired when tooltip visibility changes.\nCalled with `true` when shown and `false` when hidden."},hasHoverIndication:{required:!1,tsType:{name:`union`,raw:`'auto' | boolean`,elements:[{name:`literal`,value:`'auto'`},{name:`boolean`}]},description:"Whether to show hover indication (dashed underline) on the trigger.\n- `'auto'`: Show for text-only children\n- `true`: Always show\n- `false`: Never show\n\n@default 'auto'",defaultValue:{value:`'auto'`,computed:!1}},isOpen:{required:!1,tsType:{name:`boolean`},description:`Controlled open state. When provided, overrides hover/focus triggers:
- \`true\`: force-show the tooltip (hover/focus hide is suppressed)
- \`false\`: force-hide the tooltip
- \`undefined\`: uncontrolled — hover/focus triggers manage visibility

A controlled tooltip still takes Escape when it is the top-most layer, and
answers by calling \`onOpenChange(false)\` without hiding itself — closing is
your update's decision, exactly as for a controlled Dialog. Ignore the call
and the tip stays, and so does the press: nothing underneath dismisses.`},isDefaultOpen:{required:!1,tsType:{name:`boolean`},description:`Whether the tooltip should be shown on mount.
The tooltip is still dismissible — this just opens it initially.`}}}}));export{l as n,h as r,f as t};