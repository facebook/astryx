import{ah as s,a1 as u,a6 as O,ay as P}from"./iframe-JfpySt6L.js";import{F as j}from"./Field-el4uhoSa.js";import{L as H}from"./List-Dh1cZcK4.js";import{C as _}from"./CheckboxInput-Of0Ukwxh.js";import{L as F,a as z}from"./ListItem-8iadexre.js";const I=s.createContext(null);I.displayName="CheckboxListContext";const B=[];function A({label:d,isLabelHidden:t=!1,description:p,status:i,value:h,onChange:f,changeAction:a,density:y="balanced",hasDividers:x=!1,isDisabled:c=!1,isReadOnly:b=!1,children:k,ref:C,width:e,xstyle:q,className:R,style:L,"data-testid":o}){const l=s.useId(),m=s.useId(),n=s.useId(),[,g]=s.useTransition(),r=h!==void 0,w=h??B,[v,D]=s.useOptimistic(w),[S,V]=s.useOptimistic(null),E=s.useCallback((T,N)=>{f?.(T),a&&g(async()=>{D(T),N!==void 0&&V(N),await a(T)})},[f,a,g,D,V]),W=s.useMemo(()=>({value:r?v:void 0,onChange:r?E:void 0,isDisabled:c,isReadOnly:b,loadingValue:S}),[r,v,E,c,b,S]);return u.jsx(j,{ref:C,"data-testid":o,label:d,isLabelHidden:t,description:p,inputID:l,descriptionID:p?m:void 0,isDisabled:c,status:i?{type:i.type,message:i.message,messageID:i.message?n:void 0}:void 0,statusVariant:"detached",width:e,xstyle:q,...O(P("checkbox-list"),{className:R,style:L}),children:u.jsx(I,{value:W,children:u.jsx(H,{density:y,hasDividers:x,children:k})})})}A.displayName="CheckboxList";A.__docgenInfo={description:`A checkbox group component for multi-value selection.

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
\`\`\``,methods:[],displayName:"CheckboxList",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the root element"},label:{required:!0,tsType:{name:"string"},description:"Label text for the checkbox group (always rendered for accessibility)."},isLabelHidden:{required:!1,tsType:{name:"boolean"},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`,defaultValue:{value:"false",computed:!1}},description:{required:!1,tsType:{name:"string"},description:"Description text displayed below the label."},status:{required:!1,tsType:{name:"InputStatus"},description:`Status indicator for the checkbox group.
When set with a message, displays a colored message box below the group.`},value:{required:!1,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:"The currently selected values (collection mode)."},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(values: string[]) => void",signature:{arguments:[{type:{name:"Array",elements:[{name:"string"}],raw:"string[]"},name:"values"}],return:{name:"void"}}},description:"Callback fired when the selected values change (collection mode)."},changeAction:{required:!1,tsType:{name:"signature",type:"function",raw:"(values: string[]) => void | Promise<void>",signature:{arguments:[{type:{name:"Array",elements:[{name:"string"}],raw:"string[]"},name:"values"}],return:{name:"union",raw:"void | Promise<void>",elements:[{name:"void"},{name:"Promise",elements:[{name:"void"}],raw:"Promise<void>"}]}}},description:`Async action on change. Fires after onChange.
While the returned promise is pending, the toggled item shows a spinner
inside its checkbox and is marked \`aria-busy\`, and re-toggling it is
blocked. Other items remain interactive.`},density:{required:!1,tsType:{name:"union",raw:"'compact' | 'balanced' | 'spacious'",elements:[{name:"literal",value:"'compact'"},{name:"literal",value:"'balanced'"},{name:"literal",value:"'spacious'"}]},description:`Spacing density for list items.
@default 'balanced'`,defaultValue:{value:"'balanced'",computed:!1}},hasDividers:{required:!1,tsType:{name:"boolean"},description:`Whether to show dividers between list items.
@default false`,defaultValue:{value:"false",computed:!1}},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether all checkbox items are disabled.
@default false`,defaultValue:{value:"false",computed:!1}},isReadOnly:{required:!1,tsType:{name:"boolean"},description:`Whether all checkbox items are read-only.
Displays the current state at full opacity but prevents interaction.
Unlike \`isDisabled\`, read-only checkboxes are not visually dimmed.
@default false`,defaultValue:{value:"false",computed:!1}},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},children:{required:!0,tsType:{name:"ReactNode"},description:"Checkbox list items to render."}},composes:["Omit"]};const U={selected:{kWkggS:"astryxgcxg3y",$$css:!0}};function M({label:d,value:t,description:p,endContent:i,isDisabled:h=!1,isLoading:f=!1,isChecked:a,onCheck:y,ref:x,xstyle:c,className:b,style:k,...C}){const e=s.use(I);if(e&&e.value!==void 0&&t===void 0)throw new Error("CheckboxListItem requires a `value` prop when used inside CheckboxList with a value array.");const L=(s.use(F)?.density??"balanced")==="compact"?"sm":"md",o=(e?.isDisabled??!1)||h,l=e?.isReadOnly??!1,m=f||(e?.loadingValue!=null&&t!==void 0?e.loadingValue===t:!1);let n=!1;e&&e.value!==void 0&&t!==void 0?n=e.value.includes(t):a!==void 0&&(n=a);const g=!l&&(e!=null||y!=null),r=()=>{o||l||m||(e&&e.value!==void 0&&t!==void 0?e.value.includes(t)?e.onChange?.(e.value.filter(v=>v!==t),t):e.onChange?.([...e.value,t],t):y?.(n!==!0))};return u.jsx(z,{...C,ref:x,label:d,description:p,endContent:i,isDisabled:o,onClick:g?r:void 0,"aria-checked":n==="indeterminate"?"mixed":n,"aria-busy":m||void 0,xstyle:[n===!0&&!o&&!l&&U.selected,c],className:b,style:k,startContent:u.jsx(_,{label:typeof d=="string"?d:"Checkbox",isLabelHidden:!0,value:n,onChange:()=>r(),isDisabled:o,isReadOnly:l,isLoading:m,size:L})})}M.displayName="CheckboxListItem";M.__docgenInfo={description:`A checkbox item for use within CheckboxList (collection mode)
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
\`\`\``,methods:[],displayName:"CheckboxListItem",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},label:{required:!0,tsType:{name:"ReactNode"},description:`Primary text label for the item.

Accepts a plain string (single-line truncation applied automatically)
or a ReactNode for rich content (no truncation constraints —
child components control their own text behavior).`},value:{required:!1,tsType:{name:"string"},description:`Identity key for collection mode (REQUIRED inside CheckboxList).
Throws a runtime error if missing when used inside CheckboxList.`},description:{required:!1,tsType:{name:"string"},description:"Secondary text below the label."},endContent:{required:!1,tsType:{name:"ReactNode"},description:"Content rendered after the label area."},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether this individual item is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},isLoading:{required:!1,tsType:{name:"boolean"},description:`Whether this item is in a loading state. Renders a spinner inside the
checkbox and blocks interaction on this item only.

In collection mode, this is also driven automatically: when the parent
\`CheckboxList\` has a \`changeAction\`, the toggled item shows its
spinner while that promise is pending.
@default false`,defaultValue:{value:"false",computed:!1}},isChecked:{required:!1,tsType:{name:"union",raw:"boolean | 'indeterminate'",elements:[{name:"boolean"},{name:"literal",value:"'indeterminate'"}]},description:`Direct checked state (standalone mode only).
Ignored when inside CheckboxList.`},onCheck:{required:!1,tsType:{name:"signature",type:"function",raw:"(checked: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"checked"}],return:{name:"void"}}},description:`Direct check handler (standalone mode only).
Ignored when inside CheckboxList.`},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLLIElement>",elements:[{name:"HTMLLIElement"}]},description:"Ref forwarded to the root element"}},composes:["Omit"]};export{A as C,M as a};
