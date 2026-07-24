import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{n as r,t as i}from"./themeProps-_oSbOSxB.js";import{S as a,_ as o,t as s}from"./utils-CD2ovDaz.js";import{t as c}from"./jsx-runtime-DqZldVDK.js";import{n as l}from"./useTooltip-CdbL6YrA.js";import{r as u,t as d}from"./i18n-CdSqim6v.js";import{t as f}from"./Tooltip-B1rE8XDl.js";import{n as p,t as m}from"./Field-F7ic11LC.js";import{a as h,i as g,n as _,o as v,r as y,t as b}from"./ListItem-B04E78Mx.js";import{i as x,n as S,r as C,t as w}from"./CheckboxInput-DImPD3fv.js";function T({label:e,isLabelHidden:t=!1,description:n,status:i,value:o,onChange:s,changeAction:c,density:u=`balanced`,hasDividers:d=!1,isDisabled:f=!1,disabledMessage:p,isReadOnly:h=!1,children:g,ref:_,width:v,xstyle:b,className:x,style:S,"data-testid":w,...T}){let k=(0,E.useId)(),A=(0,E.useId)(),j=(0,E.useId)(),M=(0,E.useId)(),[,N]=(0,E.useTransition)(),P=o!==void 0,[F,I]=(0,E.useOptimistic)(o??O),[L,R]=(0,E.useOptimistic)(null),z=f&&!!p,B=l({placement:`above`,focusTrigger:`always`,isEnabled:z}),V=(0,E.useCallback)((e,t)=>{s?.(e),c&&N(async()=>{I(e),t!==void 0&&R(t),await c(e)})},[s,c,N,I,R]),H=(0,E.useMemo)(()=>({value:P?F:void 0,onChange:P?V:void 0,isDisabled:f,hasDisabledMessage:z,isReadOnly:h,loadingValue:L}),[P,F,V,f,z,h,L]);return(0,D.jsxs)(m,{...T,ref:_,"data-testid":w,label:e,isLabelHidden:t,description:n,inputID:k,labelID:A,isGroupLabel:!0,descriptionID:n?j:void 0,isDisabled:f,status:i?{type:i.type,message:i.message,messageID:i.message?M:void 0}:void 0,statusVariant:`detached`,width:v,xstyle:b,...a(r(`checkbox-list`),{className:x,style:S}),children:[(0,D.jsx)(C,{value:H,children:(0,D.jsx)(`div`,{ref:e=>{B.ref(e)},role:`group`,"aria-labelledby":A,"aria-describedby":[n?j:null,i?.message?M:null,z?B.describedBy:null].filter(Boolean).join(` `)||void 0,children:(0,D.jsx)(y,{density:u,hasDividers:d,children:g})})}),z&&B.renderTooltip(p)]})}var E,D,O,k=e((()=>{E=t(n(),1),p(),g(),f(),s(),i(),x(),D=c(),O=[],T.displayName=`CheckboxList`,T.__docgenInfo={description:`A checkbox group component for multi-value selection.

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
@default false`,defaultValue:{value:`false`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},children:{required:!0,tsType:{name:`ReactNode`},description:`Checkbox list items to render.`}},composes:[`Omit`]}}));function A({label:e,value:t,description:n,endContent:r,isDisabled:i=!1,isLoading:a=!1,isChecked:s,onCheck:c,ref:l,xstyle:d,className:f,style:p,onClick:m,...g}){let _=u(),v=(0,j.use)(C);if(v&&v.value!==void 0&&t===void 0)throw Error("CheckboxListItem requires a `value` prop when used inside CheckboxList with a value array.");let y=((0,j.use)(h)?.density??`balanced`)===`compact`?`sm`:`md`,x=(v?.isDisabled??!1)||i,S=v?.isReadOnly??!1,T=a||(v?.loadingValue!=null&&t!==void 0?v.loadingValue===t:!1),E=!1;v&&v.value!==void 0&&t!==void 0?E=v.value.includes(t):s!==void 0&&(E=s);let D=!S&&(v!=null||c!=null),O=()=>{x||S||T||(v&&v.value!==void 0&&t!==void 0?v.value.includes(t)?v.onChange?.(v.value.filter(e=>e!==t),t):v.onChange?.([...v.value,t],t):c?.(E!==!0))};return(0,M.jsx)(b,{...g,ref:l,label:e,description:n,endContent:r,isDisabled:x,onClick:D||m?o(m,D?O:void 0):void 0,"aria-busy":T||void 0,xstyle:[E===!0&&!x&&!S&&N.selected,d],className:f,style:p,startContent:(0,M.jsx)(w,{label:typeof e==`string`?e:_(`@astryx.checkboxList.item.checkbox`),isLabelHidden:!0,value:E,onChange:()=>O(),isDisabled:x,isReadOnly:S,isLoading:T,size:y})})}var j,M,N,P=e((()=>{j=t(n(),1),s(),S(),_(),v(),x(),d(),M=c(),N={selected:{kWkggS:`astryxgcxg3y`,$$css:!0}},A.displayName=`CheckboxListItem`,A.__docgenInfo={description:`A checkbox item for use within CheckboxList (collection mode)
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
child components control their own text behavior).`},value:{required:!1,tsType:{name:`string`},description:`Identity key for collection mode (REQUIRED inside CheckboxList).
Throws a runtime error if missing when used inside CheckboxList.`},description:{required:!1,tsType:{name:`string`},description:`Secondary text below the label.`},endContent:{required:!1,tsType:{name:`ReactNode`},description:`Content rendered after the label area.`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether this individual item is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},isLoading:{required:!1,tsType:{name:`boolean`},description:`Whether this item is in a loading state. Renders a spinner inside the
checkbox and blocks interaction on this item only.

In collection mode, this is also driven automatically: when the parent
\`CheckboxList\` has a \`changeAction\`, the toggled item shows its
spinner while that promise is pending.
@default false`,defaultValue:{value:`false`,computed:!1}},isChecked:{required:!1,tsType:{name:`union`,raw:`boolean | 'indeterminate'`,elements:[{name:`boolean`},{name:`literal`,value:`'indeterminate'`}]},description:`Direct checked state (standalone mode only).
Ignored when inside CheckboxList.`},onCheck:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(checked: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`checked`}],return:{name:`void`}}},description:`Direct check handler (standalone mode only).
Ignored when inside CheckboxList.`},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLLIElement>`,elements:[{name:`HTMLLIElement`}]},description:`Ref forwarded to the root element`}},composes:[`Omit`]}}));export{k as i,P as n,T as r,A as t};