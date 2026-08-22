import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{l as r,n as i,t as a,u as o}from"./themeProps-BLML-F6E.js";import{A as s,O as c,t as l}from"./utils-BuW-ky-j.js";import{t as u}from"./jsx-runtime-DqZldVDK.js";import{n as d}from"./useTooltip-BHvim3zP.js";import{n as f,t as p}from"./Spinner-Bk7TM9RN.js";import{a as m,n as h,r as g,t as _}from"./Indicator-DNdYe5YE.js";import{t as v}from"./Tooltip-D2ITaKL4.js";import{n as y,r as b}from"./hooks-YDRZMFb7.js";import{i as x,n as S,r as C,t as w}from"./FieldStatus-CDT-2cDI.js";var T,E,D=e((()=>{T=t(n(),1),E=(0,T.createContext)(null),E.displayName=`CheckboxListContext`}));function O({label:e,isLabelHidden:t=!1,description:n,onChange:r,changeAction:a,isLoading:l=!1,value:u,isDisabled:p=!1,htmlName:g,disabledMessage:_,isReadOnly:v=!1,isOptional:y=!1,isRequired:x=!1,size:S=`md`,onFocus:T,onBlur:D,labelIcon:O,status:P,width:F,xstyle:I,className:ee,style:te,ref:ne,...L}){let R=(0,k.useId)(),z=(0,k.useId)(),B=(0,k.useId)(),[,V]=(0,k.useTransition)(),[H,U]=(0,k.useOptimistic)(u),W=l||H!==u,G=p&&!!_,K=(0,k.use)(E),q=p&&(G||(K?.hasDisabledMessage??!1)),J=d({placement:`above`,focusTrigger:`always`,isEnabled:G}),Y=m(`checkbox`),X=(0,k.useRef)(null),{focusProps:re}=b(X,p),Z=H===`indeterminate`,Q=H===!0,ie=(0,k.useCallback)(e=>{e&&(e.indeterminate=Z)},[Z]),$=[];n&&$.push(z),P?.message&&$.push(B),G&&$.push(J.describedBy);let ae=$.length>0?$.join(` `):void 0;return(0,A.jsxs)(`div`,{...s(i(`checkbox-input`,{size:S}),o(F!=null&&N.width(F),I),ee,te),children:[(0,A.jsxs)(`div`,{ref:e=>{J.interactionRef(e)},...o(j.container,t&&j.containerLabelHidden,!p&&h),children:[(0,A.jsxs)(`div`,{...o(j.checkboxWrapper,M[S]),...re,children:[(0,A.jsx)(`input`,{...L,ref:c(ne,ie,J.positionRef),id:R,type:`checkbox`,name:p?void 0:g,checked:Q,disabled:p&&!q,"aria-disabled":q?`true`:void 0,form:q?``:void 0,readOnly:v,required:x,onChange:e=>{if(p||W||v)return;let t=e.target.checked;r?.(t,e),a&&!e.defaultPrevented&&V(async()=>{U(t),await a(t,e)})},onFocus:T,onBlur:D,"aria-readonly":v||void 0,"aria-describedby":ae,"aria-invalid":P?.type===`error`?!0:void 0,"aria-busy":W||void 0,...o(j.input,M[S],p&&j.inputDisabled)}),(0,A.jsx)(`span`,{ref:X,className:`astryxjp7ctv`,children:(0,A.jsx)(Y,{state:Z?`indeterminate`:Q?`checked`:`unchecked`,size:S,isDisabled:p,children:W?(0,A.jsx)(f,{size:`sm`,shade:`inherit`}):null})})]}),(0,A.jsx)(`div`,{className:`astryx78zum5 astryxdt5ytf astryx1lsbc85`,children:(0,A.jsx)(C,{label:e,inputID:R,isLabelHidden:t,isDisabled:p,isOptional:y,isRequired:x,labelIcon:O,description:n,descriptionID:z})})]}),P?.message&&(0,A.jsx)(w,{type:P.type,message:P.message,id:B,variant:`detached`}),G&&J.renderTooltip(_)]})}var k,A,j,M,N,P=e((()=>{k=t(n(),1),r(),x(),S(),p(),v(),l(),g(),y(),_(),a(),D(),A=u(),j={container:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,$$css:!0},containerLabelHidden:{kOIVth:`astryxxhr3t`,$$css:!0},checkboxWrapper:{kVAEAm:`astryx1n2onr6`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmuXW:`astryx2lah0s`,kHBbk8:`astryxc8icb0`,$$css:!0},input:{kVAEAm:`astryx10l6tqk`,kogj98:`astryx1ghz6dp`,kmVPX3:`astryx1717udv`,kSiTet:`astryxg01cxk`,kkrTdU:`astryx1ypdohk`,kY2c9j:`astryx1vjfegm`,$$css:!0},inputDisabled:{kkrTdU:`astryx1h6gzvc`,$$css:!0}},M={sm:{kzqmXN:`astryxw4jnvo`,kZKoxP:`astryx1qx5ct2`,$$css:!0},md:{kzqmXN:`astryxvy4d1p`,kZKoxP:`astryxxk0z11`,$$css:!0}},N={width:e=>[{kzqmXN:e==null?e:`astryx5lhr3w`,$$css:!0},{"--x-width":(e=>typeof e==`number`?e+`px`:e??void 0)(e)}]},O.displayName=`CheckboxInput`,O.__docgenInfo={description:`A checkbox input component for toggling boolean values.

@example
\`\`\`
<CheckboxInput
  label="Accept terms"
  value={accepted}
  onChange={setAccepted}
/>
<CheckboxInput
  label="Subscribe"
  description="Receive weekly updates"
  value={subscribed}
  onChange={setSubscribed}
/>
\`\`\``,methods:[],displayName:`CheckboxInput`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:"Ref forwarded to the underlying `<input>` element"},label:{required:!0,tsType:{name:`string`},description:`Label text for the checkbox (always rendered for accessibility).`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`Whether to visually hide the label (still accessible to screen readers).
@default false`,defaultValue:{value:`false`,computed:!1}},description:{required:!1,tsType:{name:`string`},description:`Description text displayed below the label.`},onChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(checked: boolean, e: ChangeEvent<HTMLInputElement>) => void`,signature:{arguments:[{type:{name:`boolean`},name:`checked`},{type:{name:`ChangeEvent`,elements:[{name:`HTMLInputElement`}],raw:`ChangeEvent<HTMLInputElement>`},name:`e`}],return:{name:`void`}}},description:`Callback fired when the checkbox state changes.`},changeAction:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(
  checked: boolean,
  e: ChangeEvent<HTMLInputElement>,
) => void | Promise<void>`,signature:{arguments:[{type:{name:`boolean`},name:`checked`},{type:{name:`ChangeEvent`,elements:[{name:`HTMLInputElement`}],raw:`ChangeEvent<HTMLInputElement>`},name:`e`}],return:{name:`union`,raw:`void | Promise<void>`,elements:[{name:`void`},{name:`Promise`,elements:[{name:`void`}],raw:`Promise<void>`}]}}},description:`Async action on change. Fires after onChange if not prevented.`},isLoading:{required:!1,tsType:{name:`boolean`},description:`Whether the checkbox is in a loading state.
@default false`,defaultValue:{value:`false`,computed:!1}},value:{required:!0,tsType:{name:`union`,raw:`boolean | 'indeterminate'`,elements:[{name:`boolean`},{name:`literal`,value:`'indeterminate'`}]},description:`Whether the checkbox is checked, unchecked, or indeterminate.`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the checkbox is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},htmlName:{required:!1,tsType:{name:`string`},description:`The HTML name attribute for the underlying checkbox input.
Useful for form submissions.`},disabledMessage:{required:!1,tsType:{name:`string`},description:`Explains why the checkbox is disabled. When set together with
\`isDisabled\`, the checkbox shows a tooltip with this text on hover and
keyboard focus, and the control stays focusable (via \`aria-disabled\`) so
the reason is discoverable by keyboard and assistive technology.
Activation stays blocked.

Use this instead of wrapping a disabled checkbox in \`Tooltip\` — disabled
controls don't emit the pointer events an external tooltip needs.

@example
\`\`\`
<CheckboxInput
  label="Accept terms"
  value={accepted}
  isDisabled
  disabledMessage="Terms are managed by your administrator"
/>
\`\`\``},isReadOnly:{required:!1,tsType:{name:`boolean`},description:`Whether the checkbox is read-only.
Displays the current state at full opacity but prevents interaction.
Unlike \`isDisabled\`, read-only checkboxes are not visually dimmed.
@default false`,defaultValue:{value:`false`,computed:!1}},isOptional:{required:!1,tsType:{name:`boolean`},description:`Whether the field is optional. Mutually exclusive with isRequired.
@default false`,defaultValue:{value:`false`,computed:!1}},isRequired:{required:!1,tsType:{name:`boolean`},description:`Whether the checkbox is required. Mutually exclusive with isOptional.
@default false`,defaultValue:{value:`false`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:"Width of the field. Numbers are treated as pixels, strings are used as-is\n(e.g. `'100%'`). Sizes the whole field (label, control, and status) so they\nstay aligned, unlike setting width via `xstyle`/`className`/`style`."},size:{required:!1,tsType:{name:`unknown`},description:`The size of the checkbox.
- 'sm': Compact size (28px row height)
- 'md': Default size (36px row height)
@default 'md'`,defaultValue:{value:`'md'`,computed:!1}},onFocus:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(e: FocusEvent<HTMLInputElement>) => void`,signature:{arguments:[{type:{name:`FocusEvent`,elements:[{name:`HTMLInputElement`}],raw:`FocusEvent<HTMLInputElement>`},name:`e`}],return:{name:`void`}}},description:`Callback fired when the checkbox receives focus.`},onBlur:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(e: FocusEvent<HTMLInputElement>) => void`,signature:{arguments:[{type:{name:`FocusEvent`,elements:[{name:`HTMLInputElement`}],raw:`FocusEvent<HTMLInputElement>`},name:`e`}],return:{name:`void`}}},description:`Callback fired when the checkbox loses focus.`},labelIcon:{required:!1,tsType:{name:`union`,raw:`ReactNode | IconType`,elements:[{name:`ReactNode`},{name:`ComponentType`,elements:[{name:`SVGProps`,elements:[{name:`SVGSVGElement`}],raw:`SVGProps<SVGSVGElement>`}],raw:`ComponentType<SVGProps<SVGSVGElement>>`}]},description:`Icon to display before the label text.`},status:{required:!1,tsType:{name:`InputStatus`},description:`Status indicator for the checkbox.
When set with a message, displays a colored message box below the checkbox.`}},composes:[`Omit`]}}));export{D as i,P as n,E as r,O as t};