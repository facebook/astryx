import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{D as r,E as i,F as a,P as o}from"./ime-Dy4QRKoo.js";import{P as s,t as c}from"./utils-eYNPhPe_.js";import{t as l}from"./jsx-runtime-DqZldVDK.js";import{n as u}from"./useTooltip-DAlyoPtn.js";import{n as d,t as f}from"./useMergedRefs-BMVAJ2uJ.js";import{n as p,t as m}from"./Spinner-BhW9O0CQ.js";import{n as h,r as g}from"./hooks-ByKouNzz.js";import{t as _}from"./Tooltip-Cg5Ktddr.js";import{a as ee,n as v,r as y,t as b}from"./Indicator-C7gebTrz.js";import{i as x,n as S,r as C,t as w}from"./FieldStatus-MOibOF7u.js";import{n as T,t as E}from"./useResolvedRequired-DEAhpkYS.js";var D,O,k=e((()=>{D=t(n(),1),O=(0,D.createContext)(null),O.displayName=`CheckboxListContext`}));function A({label:e,isLabelHidden:t=!1,description:n,onChange:i,changeAction:o,isLoading:c=!1,value:l,isDisabled:f=!1,htmlName:m,disabledMessage:h,isReadOnly:_=!1,isOptional:y=!1,isRequired:b=!1,size:x=`md`,onFocus:S,onBlur:E,labelIcon:D,status:k,width:A,xstyle:I,className:L,style:te,ref:ne,...re}){let R=(0,j.useId)(),z=(0,j.useId)(),B=(0,j.useId)(),V=T({isRequired:b,isOptional:y}),[,H]=(0,j.useTransition)(),[U,W]=(0,j.useOptimistic)(l),G=c||U!==l,K=f&&!!h,q=(0,j.use)(O),J=f&&(K||(q?.hasDisabledMessage??!1)),Y=u({placement:`above`,focusTrigger:`always`,isEnabled:K}),ie=ee(`checkbox`),X=(0,j.useRef)(null),{focusProps:ae}=g(X,f),Z=U===`indeterminate`,Q=U===!0,oe=(0,j.useCallback)(e=>{e&&(e.indeterminate=Z)},[Z]),$=[];n&&$.push(z),k?.message&&$.push(B),K&&$.push(Y.describedBy);let se=$.length>0?$.join(` `):void 0;return(0,M.jsxs)(`div`,{...s(r(`checkbox-input`,{size:x}),a(A!=null&&F.width(A),I),L,te),children:[(0,M.jsxs)(`div`,{ref:e=>{Y.interactionRef(e)},...a(N.container,t&&N.containerLabelHidden,!f&&v),children:[(0,M.jsxs)(`div`,{...a(N.checkboxWrapper,P[x]),...ae,children:[(0,M.jsx)(`input`,{...re,ref:d(ne,oe,Y.positionRef),id:R,type:`checkbox`,name:f?void 0:m,checked:Q,disabled:f&&!J,"aria-disabled":J?`true`:void 0,form:J?``:void 0,readOnly:_,required:b,"aria-required":V?`true`:void 0,onChange:e=>{if(f||G||_)return;let t=e.target.checked;i?.(t,e),o&&!e.defaultPrevented&&H(async()=>{W(t),await o(t,e)})},onFocus:S,onBlur:E,"aria-readonly":_||void 0,"aria-describedby":se,"aria-invalid":k?.type===`error`?!0:void 0,"aria-busy":G||void 0,...a(N.input,P[x],f&&N.inputDisabled)}),(0,M.jsx)(`span`,{ref:X,className:`astryxjp7ctv`,children:(0,M.jsx)(ie,{state:Z?`indeterminate`:Q?`checked`:`unchecked`,size:x,isDisabled:f,children:G?(0,M.jsx)(p,{size:`sm`,shade:`inherit`}):null})})]}),(0,M.jsx)(`div`,{className:`astryx78zum5 astryxdt5ytf astryx1lsbc85`,children:(0,M.jsx)(C,{...r(`checkbox-label`),label:e,inputID:R,isLabelHidden:t,isDisabled:f,isOptional:y,isRequired:b,labelIcon:D,description:n,descriptionID:z})})]}),k?.message&&(0,M.jsx)(w,{type:k.type,message:k.message,id:B,variant:`detached`}),K&&Y.renderTooltip(h)]})}var j,M,N,P,F,I=e((()=>{j=t(n(),1),o(),x(),S(),m(),_(),c(),y(),h(),E(),b(),i(),k(),f(),M=l(),N={container:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,$$css:!0},containerLabelHidden:{kOIVth:`astryxxhr3t`,$$css:!0},checkboxWrapper:{kVAEAm:`astryx1n2onr6`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmuXW:`astryx2lah0s`,kHBbk8:`astryxc8icb0`,$$css:!0},input:{kVAEAm:`astryx10l6tqk`,kogj98:`astryx1ghz6dp`,kmVPX3:`astryx1717udv`,kSiTet:`astryxg01cxk`,kkrTdU:`astryx1ypdohk astryx16khyan`,kY2c9j:`astryx1vjfegm`,k7Eaqz:`astryxkagaj0`,kAzted:`astryx80b3aj`,k87sOh:`astryxijlfn0`,kLqNvP:`astryx1hsn8va`,k3aq6I:`astryx8i4i9p`,$$css:!0},inputDisabled:{kkrTdU:`astryxt0e3qv`,$$css:!0}},P={sm:{kzqmXN:`astryxw4jnvo`,kZKoxP:`astryx1qx5ct2`,$$css:!0},md:{kzqmXN:`astryxvy4d1p`,kZKoxP:`astryxxk0z11`,$$css:!0}},F={width:e=>[{kzqmXN:e==null?e:`astryx5lhr3w`,$$css:!0},{"--x-width":(e=>typeof e==`number`?e+`px`:e??void 0)(e)}]},A.displayName=`CheckboxInput`,A.__docgenInfo={description:`A checkbox input component for toggling boolean values.

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
When set with a message, displays a colored message box below the checkbox.`}},composes:[`Omit`]}}));export{k as i,I as n,O as r,A as t};