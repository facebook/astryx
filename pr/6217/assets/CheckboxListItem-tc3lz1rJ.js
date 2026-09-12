import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{E as r,O as i}from"./ime-B2gVvZm0.js";import{P as a,t as o}from"./utils-CuDRdYlB.js";import{t as s}from"./jsx-runtime-DqZldVDK.js";import{n as c}from"./useTooltip-yc2D-N9u.js";import{l,t as u}from"./i18n-YlZvJnd3.js";import{t as d}from"./Tooltip-fmzsZ8AL.js";import{a as f,i as p}from"./Item-C3XFfttu.js";import{n as m,t as h}from"./Field-CJsPKUxT.js";import{a as g,i as _,n as v,o as y,r as b,s as x}from"./List-DyEds69m.js";import{i as S,n as C,r as w,t as T}from"./CheckboxInput-L7GTGL_x.js";function E({label:e,isLabelHidden:t=!1,description:n,status:r,value:o,onChange:s,changeAction:l,density:u=`balanced`,hasDividers:d=!1,isDisabled:f=!1,disabledMessage:p,isReadOnly:m=!1,children:g,ref:v,width:y,xstyle:b,className:x,style:S,"data-testid":C,...T}){let E=(0,D.useId)(),A=(0,D.useId)(),j=(0,D.useId)(),M=(0,D.useId)(),[,N]=(0,D.useTransition)(),P=o!==void 0,[F,I]=(0,D.useOptimistic)(o??k),[L,R]=(0,D.useOptimistic)(null),z=f&&!!p,B=c({placement:`above`,focusTrigger:`always`,isEnabled:z}),V=(0,D.useCallback)((e,t)=>{s?.(e),l&&N(async()=>{I(e),t!==void 0&&R(t),await l(e)})},[s,l,N,I,R]),H=(0,D.useMemo)(()=>({value:P?F:void 0,onChange:P?V:void 0,isDisabled:f,hasDisabledMessage:z,isReadOnly:m,loadingValue:L}),[P,F,V,f,z,m,L]);return(0,O.jsxs)(h,{...T,ref:v,"data-testid":C,label:e,isLabelHidden:t,description:n,inputID:E,labelID:A,isGroupLabel:!0,descriptionID:n?j:void 0,isDisabled:f,status:r?{type:r.type,message:r.message,messageID:r.message?M:void 0}:void 0,statusVariant:`detached`,width:y,xstyle:b,...a(i(`checkbox-list`),{className:x,style:S}),children:[(0,O.jsx)(w,{value:H,children:(0,O.jsx)(`div`,{ref:e=>{B.ref(e)},role:`group`,"aria-labelledby":A,"aria-describedby":[n?j:null,r?.message?M:null,z?B.describedBy:null].filter(Boolean).join(` `)||void 0,children:(0,O.jsx)(_,{density:u,hasDividers:d,children:g})})}),z&&B.renderTooltip(p)]})}var D,O,k,A=e((()=>{D=t(n(),1),m(),g(),d(),o(),r(),S(),O=s(),k=[],E.displayName=`CheckboxList`,E.__docgenInfo={description:`A checkbox group component for multi-value selection.

Composes Field (for label, description, status) and List
(for density, dividers) with a context provider for collection mode.

@example
\`\`\`
<CheckboxList
  label="Notifications"
  value={selected}
  onChange={setSelected}>
  <CheckboxListItem label="Email" value="email" />
  <CheckboxListItem label="SMS" value="sms" />
  <CheckboxListItem label="Push" value="push" />
</CheckboxList>
\`\`\``,methods:[],displayName:`CheckboxList`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},label:{required:!0,tsType:{name:`string`},description:`Label text for the checkbox group (always rendered for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`,defaultValue:{value:`false`,computed:!1}},description:{required:!1,tsType:{name:`string`},description:`Description text displayed below the label.`},status:{required:!1,tsType:{name:`InputStatus`},description:`Status indicator for the checkbox group.
When set with a message, displays a colored message box below the group.`},value:{required:!1,tsType:{name:`Array`,elements:[{name:`string`}],raw:`string[]`},description:`The currently selected values (collection mode).`},onChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(values: string[]) => void`,signature:{arguments:[{type:{name:`Array`,elements:[{name:`string`}],raw:`string[]`},name:`values`}],return:{name:`void`}}},description:`Callback fired when the selected values change (collection mode).`},changeAction:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(values: string[]) => void | Promise<void>`,signature:{arguments:[{type:{name:`Array`,elements:[{name:`string`}],raw:`string[]`},name:`values`}],return:{name:`union`,raw:`void | Promise<void>`,elements:[{name:`void`},{name:`Promise`,elements:[{name:`void`}],raw:`Promise<void>`}]}}},description:`Async action on change. Fires after onChange.
While the returned promise is pending, the toggled item shows a spinner
inside its checkbox and is marked \`aria-busy\`, and re-toggling it is
blocked. Other items remain interactive.`},density:{required:!1,tsType:{name:`union`,raw:`'compact' | 'balanced' | 'spacious'`,elements:[{name:`literal`,value:`'compact'`},{name:`literal`,value:`'balanced'`},{name:`literal`,value:`'spacious'`}]},description:`Spacing density for list items.
@default 'balanced'`,defaultValue:{value:`'balanced'`,computed:!1}},hasDividers:{required:!1,tsType:{name:`boolean`},description:`Whether to show dividers between list items.
@default false`,defaultValue:{value:`false`,computed:!1}},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether all checkbox items are disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},disabledMessage:{required:!1,tsType:{name:`string`},description:`Explains why the checkbox group is disabled. Applies to the whole-group
disabled state (\`isDisabled\`), not individual items. When set together with
\`isDisabled\`, the group shows a tooltip with this text on hover and keyboard
focus, and its checkboxes stay focusable (via \`aria-disabled\`) so the reason
is discoverable by keyboard and assistive technology. Toggling stays
blocked.

Use this instead of wrapping a disabled group in \`Tooltip\` — disabled
controls don't emit the pointer events an external tooltip needs.`},isReadOnly:{required:!1,tsType:{name:`boolean`},description:`Whether all checkbox items are read-only.
Displays the current state at full opacity but prevents interaction.
Unlike \`isDisabled\`, read-only checkboxes are not visually dimmed.
@default false`,defaultValue:{value:`false`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},children:{required:!0,tsType:{name:`ReactNode`},description:`Checkbox list items to render.`}},composes:[`Omit`]}}));function j(e){let t=(0,N.use)(p);return(0,P.jsx)(T,{...e,"aria-describedby":t??void 0})}function M({label:e,"aria-label":t,value:n,description:r,endContent:i,isDisabled:a=!1,isLoading:o=!1,isChecked:s,onCheck:c,ref:u,xstyle:d,className:f,style:p,onClick:m,...h}){let g=l(),_=(0,N.use)(w);if(_&&_.value!==void 0&&n===void 0)throw Error("CheckboxListItem requires a `value` prop when used inside CheckboxList with a value array.");let b=typeof e!=`string`,x=(0,N.useId)(),S=b&&t==null,C=t??(b?g(`@astryx.checkboxList.item.checkbox`):e),T=((0,N.use)(y)?.density??`balanced`)===`compact`?`sm`:`md`,E=(_?.isDisabled??!1)||a,D=_?.isReadOnly??!1,O=o||(_?.loadingValue!=null&&n!==void 0?_.loadingValue===n:!1),k=!1;_&&_.value!==void 0&&n!==void 0?k=_.value.includes(n):s!==void 0&&(k=s);let A=!D&&(_!=null||c!=null),M=(0,N.useRef)(null),I=A||m!=null,L=()=>{E||D||O||(_&&_.value!==void 0&&n!==void 0?_.value.includes(n)?_.onChange?.(_.value.filter(e=>e!==n),n):_.onChange?.([..._.value,n],n):c?.(k!==!0))};return(0,P.jsx)(v,{...h,ref:u,label:S?(0,P.jsx)(`span`,{id:x,children:e}):e,description:r,endContent:i,isDisabled:E,interactiveRef:I?M:void 0,"aria-busy":O||void 0,xstyle:[k===!0&&!E&&!D&&F.selected,d],className:f,style:p,startContent:(0,P.jsx)(j,{ref:M,label:C,"aria-labelledby":S?x:void 0,isLabelHidden:!0,value:k,onChange:()=>L(),onClick:m,isDisabled:E,isReadOnly:D,isLoading:O,size:T})})}var N,P,F,I=e((()=>{N=t(n(),1),C(),b(),x(),S(),u(),f(),P=s(),F={selected:{kWkggS:`astryxgcxg3y`,$$css:!0}},M.displayName=`CheckboxListItem`,M.__docgenInfo={description:`A checkbox item for use within CheckboxList (collection mode)
or List (standalone mode).

In collection mode, checked state is derived from the parent's value array.
In standalone mode, uses isChecked/onCheck props directly.

Composes ListItem internally — gets density, dividers, hover/press,
focus, and container alignment for free.

@example
\`\`\`
<CheckboxListItem label="Email" value="email" />
<CheckboxListItem
  label="Accept terms"
  isChecked={accepted}
  onCheck={setAccepted}
/>
\`\`\``,methods:[],displayName:`CheckboxListItem`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},label:{required:!0,tsType:{name:`ReactNode`},description:`Primary text label for the item.

Accepts a plain string (single-line truncation applied automatically)
or a ReactNode for rich content (no truncation constraints —
child components control their own text behavior). Links and buttons in
the label keep their own behavior; only non-interactive row clicks
delegate to the checkbox.

A string names the checkbox directly. A ReactNode names it from its
visible text through \`aria-labelledby\`; if that text is absent, pass
\`aria-label\`. When visible text is present, an override must retain every
visible word so speech-input users can say what they see.`},"aria-label":{required:!1,tsType:{name:`string`},description:`Plain-text accessible name for the checkbox, replacing the one derived
from \`label\`.

A string \`label\` names the checkbox directly, and a rich (ReactNode)
\`label\` names it from its visible text through \`aria-labelledby\`. Pass
\`aria-label\` when that text is absent. When visible text is present, the
override must retain every visible word so speech-input users can say what
they see. It replaces the derived name and applies to the checkbox control,
not the row.

@example
\`\`\`
<CheckboxListItem
  label={<span>Pro plan <Badge label="Recommended" /></span>}
  aria-label="Pro plan Recommended option"
  value="pro"
/>
\`\`\``},value:{required:!1,tsType:{name:`string`},description:`Identity key for collection mode (REQUIRED inside CheckboxList).
Throws a runtime error if missing when used inside CheckboxList.`},description:{required:!1,tsType:{name:`ReactNode`},description:`Secondary content below the label. Accepts a plain string or a ReactNode.
Exposed as the checkbox's accessible description through
\`aria-describedby\`, so assistive technology can tell it is the explanation
for this choice rather than unrelated row text.`},endContent:{required:!1,tsType:{name:`ReactNode`},description:`Content rendered after the label area.`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether this individual item is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},isLoading:{required:!1,tsType:{name:`boolean`},description:`Whether this item is in a loading state. Renders a spinner inside the
checkbox and blocks interaction on this item only.

In collection mode, this is also driven automatically: when the parent
\`CheckboxList\` has a \`changeAction\`, the toggled item shows its
spinner while that promise is pending.
@default false`,defaultValue:{value:`false`,computed:!1}},isChecked:{required:!1,tsType:{name:`union`,raw:`boolean | 'indeterminate'`,elements:[{name:`boolean`},{name:`literal`,value:`'indeterminate'`}]},description:`Direct checked state (standalone mode only).
Ignored when inside CheckboxList.`},onCheck:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(checked: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`checked`}],return:{name:`void`}}},description:`Direct check handler (standalone mode only).
Ignored when inside CheckboxList.`},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLLIElement>`,elements:[{name:`HTMLLIElement`}]},description:`Ref forwarded to the root element`}},composes:[`Omit`]}}));export{A as i,I as n,E as r,M as t};