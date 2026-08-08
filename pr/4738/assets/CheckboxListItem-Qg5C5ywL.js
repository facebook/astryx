import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{n as r,t as i}from"./themeProps-_oSbOSxB.js";import{O as a,t as o}from"./utils-HhVKRT_p.js";import{t as s}from"./jsx-runtime-DqZldVDK.js";import{n as c}from"./useTooltip-q7njLCs1.js";import{r as l,t as u}from"./i18n-Bc2iW1Ks.js";import{n as d,t as f}from"./useDevWarning-BoL_WOwv.js";import{t as p}from"./Tooltip-BnbJ3j7w.js";import{i as m,n as h,r as g,t as _}from"./CheckboxInput-DzYZHIkO.js";import{n as v,t as y}from"./Field-Dgi3VJxX.js";import{a as b,i as x,n as S,o as C,r as w,t as T}from"./ListItem-DB4DA4Ae.js";function E({label:e,isLabelHidden:t=!1,description:n,status:i,value:o,onChange:s,changeAction:l,density:u=`balanced`,hasDividers:d=!1,isDisabled:f=!1,disabledMessage:p,isReadOnly:m=!1,children:h,ref:_,width:v,xstyle:b,className:x,style:S,"data-testid":C,...T}){let E=(0,D.useId)(),A=(0,D.useId)(),j=(0,D.useId)(),M=(0,D.useId)(),[,N]=(0,D.useTransition)(),P=o!==void 0,[F,I]=(0,D.useOptimistic)(o??k),[L,R]=(0,D.useOptimistic)(null),z=f&&!!p,B=c({placement:`above`,focusTrigger:`always`,isEnabled:z}),V=(0,D.useCallback)((e,t)=>{s?.(e),l&&N(async()=>{I(e),t!==void 0&&R(t),await l(e)})},[s,l,N,I,R]),H=(0,D.useMemo)(()=>({value:P?F:void 0,onChange:P?V:void 0,isDisabled:f,hasDisabledMessage:z,isReadOnly:m,loadingValue:L}),[P,F,V,f,z,m,L]);return(0,O.jsxs)(y,{...T,ref:_,"data-testid":C,label:e,isLabelHidden:t,description:n,inputID:E,labelID:A,isGroupLabel:!0,descriptionID:n?j:void 0,isDisabled:f,status:i?{type:i.type,message:i.message,messageID:i.message?M:void 0}:void 0,statusVariant:`detached`,width:v,xstyle:b,...a(r(`checkbox-list`),{className:x,style:S}),children:[(0,O.jsx)(g,{value:H,children:(0,O.jsx)(`div`,{ref:e=>{B.ref(e)},role:`group`,"aria-labelledby":A,"aria-describedby":[n?j:null,i?.message?M:null,z?B.describedBy:null].filter(Boolean).join(` `)||void 0,children:(0,O.jsx)(w,{density:u,hasDividers:d,children:h})})}),z&&B.renderTooltip(p)]})}var D,O,k,A=e((()=>{D=t(n(),1),v(),x(),p(),o(),i(),m(),O=s(),k=[],E.displayName=`CheckboxList`,E.__docgenInfo={description:`A checkbox group component for multi-value selection.

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
@default false`,defaultValue:{value:`false`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},children:{required:!0,tsType:{name:`ReactNode`},description:`Checkbox list items to render.`}},composes:[`Omit`]}}));function j({label:e,"aria-label":t,value:n,description:r,endContent:i,isDisabled:a=!1,isLoading:o=!1,isChecked:s,onCheck:c,ref:u,xstyle:f,className:p,style:m,onClick:h,...v}){let y=l(),x=(0,M.use)(g);if(x&&x.value!==void 0&&n===void 0)throw Error("CheckboxListItem requires a `value` prop when used inside CheckboxList with a value array.");let S=t??(typeof e==`string`?e:y(`@astryx.checkboxList.item.checkbox`));d(`CheckboxListItem`,'`label` is a ReactNode, so the checkbox falls back to the generic accessible name "Checkbox". Pass `aria-label` with a concise string equivalent of the visible label so screen readers can tell items apart.',typeof e!=`string`&&t==null);let C=((0,M.use)(b)?.density??`balanced`)===`compact`?`sm`:`md`,w=(x?.isDisabled??!1)||a,E=x?.isReadOnly??!1,D=o||(x?.loadingValue!=null&&n!==void 0?x.loadingValue===n:!1),O=!1;x&&x.value!==void 0&&n!==void 0?O=x.value.includes(n):s!==void 0&&(O=s);let k=!E&&(x!=null||c!=null),A=(0,M.useRef)(null),j=k||h!=null,F=()=>{w||E||D||(x&&x.value!==void 0&&n!==void 0?x.value.includes(n)?x.onChange?.(x.value.filter(e=>e!==n),n):x.onChange?.([...x.value,n],n):c?.(O!==!0))};return(0,N.jsx)(T,{...v,ref:u,label:e,description:r,endContent:i,isDisabled:w,interactiveRef:j?A:void 0,"aria-busy":D||void 0,xstyle:[O===!0&&!w&&!E&&P.selected,f],className:p,style:m,startContent:(0,N.jsx)(_,{ref:A,label:S,isLabelHidden:!0,value:O,onChange:()=>F(),onClick:h,isDisabled:w,isReadOnly:E,isLoading:D,size:C})})}var M,N,P,F=e((()=>{M=t(n(),1),f(),h(),S(),C(),m(),u(),N=s(),P={selected:{kWkggS:`astryxgcxg3y`,$$css:!0}},j.displayName=`CheckboxListItem`,j.__docgenInfo={description:`A checkbox item for use within CheckboxList (collection mode)
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
child components control their own text behavior).`},"aria-label":{required:!1,tsType:{name:`string`},description:`Plain-text accessible name for the checkbox when \`label\` is a ReactNode.

A string \`label\` names the checkbox automatically. A rich (ReactNode)
\`label\` cannot, so pass a concise string equivalent via the standard
\`aria-label\` — otherwise the checkbox falls back to the generic name
"Checkbox" and every rich-label item in a list announces identically to
screen readers. Applied to the checkbox control, not the row.

@example
\`\`\`
<CheckboxListItem
  label={<span>Pro plan <Badge label="Recommended" /></span>}
  aria-label="Pro plan"
  value="pro"
/>
\`\`\``},value:{required:!1,tsType:{name:`string`},description:`Identity key for collection mode (REQUIRED inside CheckboxList).
Throws a runtime error if missing when used inside CheckboxList.`},description:{required:!1,tsType:{name:`string`},description:`Secondary text below the label.`},endContent:{required:!1,tsType:{name:`ReactNode`},description:`Content rendered after the label area.`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether this individual item is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},isLoading:{required:!1,tsType:{name:`boolean`},description:`Whether this item is in a loading state. Renders a spinner inside the
checkbox and blocks interaction on this item only.

In collection mode, this is also driven automatically: when the parent
\`CheckboxList\` has a \`changeAction\`, the toggled item shows its
spinner while that promise is pending.
@default false`,defaultValue:{value:`false`,computed:!1}},isChecked:{required:!1,tsType:{name:`union`,raw:`boolean | 'indeterminate'`,elements:[{name:`boolean`},{name:`literal`,value:`'indeterminate'`}]},description:`Direct checked state (standalone mode only).
Ignored when inside CheckboxList.`},onCheck:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(checked: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`checked`}],return:{name:`void`}}},description:`Direct check handler (standalone mode only).
Ignored when inside CheckboxList.`},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLLIElement>`,elements:[{name:`HTMLLIElement`}]},description:`Ref forwarded to the root element`}},composes:[`Omit`]}}));export{A as i,F as n,E as r,j as t};