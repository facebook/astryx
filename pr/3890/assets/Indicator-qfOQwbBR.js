import{i as e}from"./preload-helper-CT_b8DTk.js";import{D as t,F as n,P as r}from"./ime-Dy4QRKoo.js";import{F as i,S as a,t as o}from"./utils-Dhf52ZkT.js";import{t as s}from"./jsx-runtime-DqZldVDK.js";import{f as c,i as l,n as u,p as d}from"./useTheme-Zg5qnGSO.js";import{n as f,t as p}from"./Icon-UmWqdkV4.js";function m({state:e,size:r=`md`,isDisabled:o=!1,children:s,ref:c,className:l,style:u,xstyle:d,...f}){let p=e===`checked`,m=e===`indeterminate`,b=p||m;return(0,h.jsx)(`span`,{...f,ref:c,"aria-hidden":`true`,...i(t(`checkbox-indicator`,{size:r,checked:p?`checked`:m?`indeterminate`:null,disabled:o?`disabled`:null},{legacyNames:[`checkbox`]}),n(g.box,_[r],b?g.checked:g.unchecked,o&&g.disabled,o&&!b&&g.disabledUnchecked,d),l,u),children:a(s)?s:(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(`svg`,{viewBox:`0 0 10 10`,...i(t(`checkbox-indicator-check`,{size:r}),n(g.checkmark,v[r],p&&g.checkmarkVisible)),children:(0,h.jsx)(`path`,{d:`M8.5 2.5L4 7.5L1.5 5`,stroke:`currentColor`,strokeWidth:`1.5`,fill:`none`,strokeLinecap:`round`,strokeLinejoin:`round`})}),(0,h.jsx)(`span`,{...i(t(`checkbox-indicator-dash`,{size:r}),n(g.indeterminateMark,y[r],m&&g.indeterminateMarkVisible))})]})})}var h,g,_,v,y,b=e((()=>{r(),o(),h=s(),g={box:{kB7OPa:`astryx9f619`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmuXW:`astryx2lah0s`,kMzoRj:`astryx1litavf`,ksu8eU:`astryx1y0btm7`,kaIpWk:`astryxx3sua9`,k1ekBW:`astryxts7igz`,kIyJzY:`astryxuedmi6 astryx12w9bfk`,kAMwcw:`astryxlr8y92`,$$css:!0},unchecked:{kMwMTN:`astryxqwr325`,kVAM5u:`astryxvy26l8 astryxvr0s6v`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kWkggS:`astryx10xzikg astryx1orexks`,$$css:!0},checked:{kMwMTN:`astryx17wrial`,kVAM5u:`astryxad5do astryx1nccqs`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kWkggS:`astryx1ewilqj astryxe50u90`,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,kVAM5u:`astryx14i3s5s astryxzl8x75`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,$$css:!0},disabledUnchecked:{kWkggS:`astryxwmxj5m astryxejnnay`,$$css:!0},checkmark:{k1xSpc:`astryx1s85apg`,kMwMTN:`astryx17wrial astryxs5hli`,$$css:!0},checkmarkVisible:{k1xSpc:`astryx1lliihq`,$$css:!0},indeterminateMark:{k1xSpc:`astryx1s85apg`,kWkggS:`astryx1azo05 astryxwvh9j7`,kaIpWk:`astryxjspbzw`,$$css:!0},indeterminateMarkVisible:{k1xSpc:`astryx1lliihq`,$$css:!0}},_={sm:{kzqmXN:`astryxw4jnvo`,kZKoxP:`astryx1qx5ct2`,$$css:!0},md:{kzqmXN:`astryxvy4d1p`,kZKoxP:`astryxxk0z11`,$$css:!0}},v={sm:{kzqmXN:`astryxsmyaan`,kZKoxP:`astryx1kpxq89`,$$css:!0},md:{kzqmXN:`astryx6jxa94`,kZKoxP:`astryx1v9usgg`,$$css:!0}},y={sm:{kzqmXN:`astryx1fsd2vl`,kZKoxP:`astryx36qwtl`,$$css:!0},md:{kzqmXN:`astryxsmyaan`,kZKoxP:`astryx36qwtl`,$$css:!0}},m.displayName=`CheckboxIndicator`,m.__docgenInfo={description:`The default checkbox visual: a square box with a checkmark or an
indeterminate bar.

Decorative and non-interactive — it renders \`aria-hidden\` and owns no input,
role, or focus behavior. The focus ring lives on the owner's control wrapper
(see CheckboxInput), so a theme that replaces this component keeps a visible
focus indicator for free. Themes replace it wholesale through
\`defineTheme({indicators: {checkbox: MyCheckbox}})\`, or restyle it through
the \`checkbox\` theme target like any other component.

@example
\`\`\`
<CheckboxIndicator state="indeterminate" size="sm" />
\`\`\``,methods:[],displayName:`CheckboxIndicator`,props:{ref:{required:!1,tsType:{name:`Ref`,elements:[{name:`HTMLSpanElement`}],raw:`Ref<HTMLSpanElement>`},description:`Ref forwarded to the indicator's root element.`},state:{required:!0,tsType:{name:`IndicatorFamilyMap[F]`,raw:`IndicatorFamilyMap[F]`},description:`Which state to draw. The state space is fixed by the family.`},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`}]},description:`Control size.
@default 'md'`,defaultValue:{value:`'md'`,computed:!1}},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the owning control is disabled. Purely visual — the owner still
owns the actual disabled semantics.
@default false`,defaultValue:{value:`false`,computed:!1}},children:{required:!1,tsType:{name:`ReactNode`},description:`Content rendered inside the indicator chrome *instead of* the state mark.
CheckboxInput uses this to show a loading Spinner inside the box while a
change action is pending.`}},composes:[`Omit`]}}));function x({state:e,size:t=`md`,isDisabled:r=!1,children:o,ref:s,className:c,style:l,xstyle:u,...d}){let f=e===`checked`;return a(o)?(0,S.jsx)(`span`,{...d,ref:s,"aria-hidden":`true`,...i(n(w.slot,r?w.disabled:w.enabled,u),c,l),children:o}):f?(0,S.jsx)(p,{...d,"aria-hidden":`true`,icon:`check`,size:C[t],color:r?`disabled`:`accent`,xstyle:u,className:c,style:l}):null}var S,C,w,T=e((()=>{r(),f(),o(),S=s(),C={sm:`sm`,md:`sm`},w={slot:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmuXW:`astryx2lah0s`,kzqmXN:`astryxcdlrvm`,kZKoxP:`astryx1l36t39`,$$css:!0},enabled:{kMwMTN:`astryxqwr325`,$$css:!0},disabled:{kMwMTN:`astryxqa6c3m`,$$css:!0}},x.displayName=`CheckIndicator`,x.__docgenInfo={description:`The default single-selection mark: a checkmark when chosen, nothing when not.

Decorative and non-interactive — it renders \`aria-hidden\` and owns no role,
state, or focus behavior; the option or row that hosts it keeps all of that.

@example
\`\`\`
<CheckIndicator state={isSelected ? 'checked' : 'unchecked'} size="sm" />
\`\`\`

Swap every single-selection mark for a radio:

@example
\`\`\`
import {RadioIndicator} from '@astryxdesign/core/Indicator';
defineTheme({name: 'brand', indicators: {check: RadioIndicator}});
\`\`\``,methods:[],displayName:`CheckIndicator`,props:{ref:{required:!1,tsType:{name:`Ref`,elements:[{name:`HTMLSpanElement`}],raw:`Ref<HTMLSpanElement>`},description:`Ref forwarded to the indicator's root element.`},state:{required:!0,tsType:{name:`IndicatorFamilyMap[F]`,raw:`IndicatorFamilyMap[F]`},description:`Which state to draw. The state space is fixed by the family.`},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`}]},description:`Control size.
@default 'md'`,defaultValue:{value:`'md'`,computed:!1}},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the owning control is disabled. Purely visual — the owner still
owns the actual disabled semantics.
@default false`,defaultValue:{value:`false`,computed:!1}},children:{required:!1,tsType:{name:`ReactNode`},description:`Content rendered inside the indicator chrome *instead of* the state mark.
CheckboxInput uses this to show a loading Spinner inside the box while a
change action is pending.`}},composes:[`Omit`]}}));function E({state:e,size:r=`md`,isDisabled:o=!1,children:s,ref:c,className:l,style:u,xstyle:d,...f}){let p=e!==`unchecked`;return(0,D.jsx)(`span`,{...f,ref:c,"aria-hidden":`true`,...i(t(`radio-indicator`,{size:r,checked:p?`checked`:null,disabled:o?`disabled`:null},{legacyNames:[`radio`]}),n(O.circle,k[r],p?O.checked:O.unchecked,o&&O.disabled,o&&!p&&O.disabledUnchecked,d),l,u),children:a(s)?s:p&&(0,D.jsx)(`span`,{...i(t(`radio-indicator-dot`,{size:r},{legacyNames:[`radio-dot`]}),n(O.dot,A[r]))})})}var D,O,k,A,j=e((()=>{r(),o(),D=s(),O={circle:{kB7OPa:`astryx9f619`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmuXW:`astryx2lah0s`,kMzoRj:`astryx1litavf`,ksu8eU:`astryx1y0btm7`,kaIpWk:`astryxjspbzw`,k1ekBW:`astryxts7igz`,kIyJzY:`astryxuedmi6 astryx12w9bfk`,kAMwcw:`astryxlr8y92`,$$css:!0},unchecked:{kVAM5u:`astryxvy26l8 astryxvr0s6v`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kWkggS:`astryx10xzikg astryx1orexks`,$$css:!0},checked:{kVAM5u:`astryxad5do astryx1nccqs`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kWkggS:`astryx1ewilqj astryxe50u90`,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,kVAM5u:`astryx14i3s5s astryxzl8x75`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,$$css:!0},disabledUnchecked:{kWkggS:`astryxwmxj5m astryxejnnay`,$$css:!0},dot:{kaIpWk:`astryxjspbzw`,kWkggS:`astryx1azo05 astryxwvh9j7`,$$css:!0}},k={sm:{kzqmXN:`astryxw4jnvo`,kZKoxP:`astryx1qx5ct2`,$$css:!0},md:{kzqmXN:`astryxvy4d1p`,kZKoxP:`astryxxk0z11`,$$css:!0}},A={sm:{kzqmXN:`astryx1xc55vz`,kZKoxP:`astryxdk7pt`,$$css:!0},md:{kzqmXN:`astryx1fsd2vl`,kZKoxP:`astryx170jfvy`,$$css:!0}},E.displayName=`RadioIndicator`,E.__docgenInfo={description:`The default radio visual: a circle with a filled inner dot when selected.

Decorative and non-interactive — it renders \`aria-hidden\` and owns no input,
role, or focus behavior. Themes replace it wholesale through
\`defineTheme({indicators: {radio: MyRadio}})\`, or restyle it through the
\`radio\` / \`radio-dot\` theme targets like any other component.

Unlike an icon, a radio draws in *both* states — an empty circle when
unchecked. That is what makes it usable as a selection indicator in
components whose default is "a checkmark when selected, nothing otherwise".

@example
\`\`\`
<RadioIndicator state="checked" size="md" />
\`\`\``,methods:[],displayName:`RadioIndicator`,props:{ref:{required:!1,tsType:{name:`Ref`,elements:[{name:`HTMLSpanElement`}],raw:`Ref<HTMLSpanElement>`},description:`Ref forwarded to the indicator's root element.`},state:{required:!0,tsType:{name:`IndicatorFamilyMap[F]`,raw:`IndicatorFamilyMap[F]`},description:`Which state to draw. The state space is fixed by the family.`},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`}]},description:`Control size.
@default 'md'`,defaultValue:{value:`'md'`,computed:!1}},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the owning control is disabled. Purely visual — the owner still
owns the actual disabled semantics.
@default false`,defaultValue:{value:`false`,computed:!1}},children:{required:!1,tsType:{name:`ReactNode`},description:`Content rendered inside the indicator chrome *instead of* the state mark.
CheckboxInput uses this to show a loading Spinner inside the box while a
change action is pending.`}},composes:[`Omit`]}}));function M(e){return e==null?null:typeof e==`string`?c(e):e}function N(e){return M(e)?.indicators??null}function P(e,t){return N(t)?.[e]??F[e]}var F,I=e((()=>{d(),b(),T(),j(),F={check:x,checkbox:m,radio:E}}));function L(e){return P(e,l())}var R=e((()=>{u(),I()})),z,B=e((()=>{z={astryx1odsvnm:`astryx1odsvnm`,$$css:!0}})),V=e((()=>{b(),T(),j(),I(),R(),B()}));export{L as a,x as c,b as d,R as i,T as l,z as n,E as o,B as r,j as s,V as t,m as u};