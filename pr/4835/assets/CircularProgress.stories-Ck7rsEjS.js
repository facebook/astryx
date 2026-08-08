import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a,t as o}from"./themeProps-CREkzZh6.js";import{n as s,t as c}from"./Text-BfjtEFtP.js";import{t as l}from"./jsx-runtime-DeHZSEgm.js";function u(e,t){return`${t>0?Math.round(e/t*100):0}%`}function d({value:e=0,max:t=100,label:r,isLabelHidden:o=!0,hasValueLabel:s=!1,formatValueLabel:c=u,children:l,size:d=`md`,variant:v=`accent`,isIndeterminate:y=!1,isDisabled:b=!1,xstyle:x,className:S,style:C,"data-testid":w,ref:T,...E}){let D=(0,f.useId)(),{diameter:O,strokeWidth:k}=m[d],A=(O-k)/2,j=2*Math.PI*A,M=Number.isFinite(e)?e:0,N=Number.isFinite(t)?t:0,P=Math.min(Math.max(0,M),N),F=j*(1-(N>0?P/N:0)),I=c(P,N),L=O/2,R=!o,z=l??(s&&!y?I:null),B=b?`disabled`:v,V=b?`neutral`:v;return(0,p.jsxs)(`div`,{ref:T,...i(a(`circular-progress`,{variant:v,size:d}),n(h.root,R&&h.rootWithLabel,x),S,C),"data-testid":w,...E,children:[(0,p.jsx)(`span`,{id:D,...{0:{className:`astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km`},2:{className:`astryx141an7d astryx1ltkj2j astryx1e4wzip astryxv1l7n4`},1:{className:`astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km astryxnbbluu`},3:{className:`astryx141an7d astryx1ltkj2j astryx1e4wzip astryxnbbluu`}}[!!R<<1|!!(R&&b)<<0],children:r}),(0,p.jsxs)(`div`,{className:`astryx1n2onr6 astryx3nfvp2`,children:[(0,p.jsxs)(`svg`,{role:`progressbar`,"aria-labelledby":D,"aria-valuenow":y?void 0:P,"aria-valuemin":y?void 0:0,"aria-valuemax":y?void 0:N,"aria-valuetext":y?void 0:I,width:O,height:O,viewBox:`0 0 ${O} ${O}`,...{0:{className:`astryx1lliihq astryx9tu13d`},1:{className:`astryx1lliihq astryx48ohth astryx1c74tu6 astryxy02sl2 astryx1esw782 astryxa4qsjk`}}[!!y<<0],children:[(0,p.jsx)(`circle`,{...i(a(`circular-progress-track`),n(h.track,_[V])),cx:L,cy:L,r:A,strokeWidth:k}),y?(0,p.jsx)(`circle`,{...i(a(`circular-progress-fill`,{variant:B}),n(h.fillIndeterminate,g[B])),cx:L,cy:L,r:A,strokeWidth:k}):(0,p.jsx)(`circle`,{...i(a(`circular-progress-fill`,{variant:B}),n(h.fill,g[B])),cx:L,cy:L,r:A,strokeWidth:k,strokeDasharray:j,strokeDashoffset:F})]}),z!=null&&(0,p.jsx)(`div`,{className:`astryx10l6tqk astryx10a8y8t astryx78zum5 astryx6s0dn4 astryxl56j7k astryx47corl`,children:l??(0,p.jsx)(`span`,{...{0:{className:`astryx141an7d astryx1ltkj2j astryx1sodnla astryxv1l7n4`},1:{className:`astryx141an7d astryx1ltkj2j astryx1sodnla astryxnbbluu`}}[!!b<<0],children:I})})]})]})}var f,p,m,h,g,_;function v(){return(v=e((()=>{f=t(),r(),o(),p=l(),m={sm:{diameter:32,strokeWidth:3},md:{diameter:48,strokeWidth:4},lg:{diameter:64,strokeWidth:5}},h={root:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kVAEAm:`astryx1n2onr6`,kmuXW:`astryx2lah0s`,$$css:!0},rootWithLabel:{kXwgrk:`astryxdt5ytf`,kOIVth:`astryxzye2dw`,$$css:!0},track:{kDwRjp:`astryxbh8q5q`,kjVXCG:`astryxpi25hw`,$$css:!0},fill:{kDwRjp:`astryxbh8q5q`,kU5bRw:`astryx1owpc8m`,k1ekBW:`astryxxnu56j`,kIyJzY:`astryx80gvsz`,kAMwcw:`astryxlr8y92`,$$css:!0},fillIndeterminate:{kDwRjp:`astryxbh8q5q`,kU5bRw:`astryx1owpc8m`,kKVMdj:`astryxx48r2r`,k44tkh:`astryxmg6eyc astryxnh0sag`,kyAemX:`astryx4hg4is`,ko0y90:`astryxa4qsjk`,$$css:!0}},g={accent:{kjVXCG:`astryxjsr54c`,$$css:!0},success:{kjVXCG:`astryx8y33gb`,$$css:!0},warning:{kjVXCG:`astryx9ezeq1`,$$css:!0},error:{kjVXCG:`astryx1vco6zm`,$$css:!0},neutral:{kjVXCG:`astryxuxf9kk`,$$css:!0},disabled:{kjVXCG:`astryxuxf9kk`,$$css:!0}},_={accent:{kjVXCG:`astryximx5ud`,$$css:!0},success:{kjVXCG:`astryx1uro670`,$$css:!0},warning:{kjVXCG:`astryx1wjzxuj`,$$css:!0},error:{kjVXCG:`astryxjswp7v`,$$css:!0},neutral:{kjVXCG:`astryxpi25hw`,$$css:!0}},d.displayName=`CircularProgress`,d.__docgenInfo={description:`A circular/radial progress indicator that shows completion as a ring.

In determinate mode, displays a known value as an arc fill.
In indeterminate mode, shows an animated spinning indicator.
Supports center content via children for labels, percentages, or icons,
or an automatic formatted value label via \`hasValueLabel\`.

@example
\`\`\`
<CircularProgress value={75} label="Upload progress" hasValueLabel />
<CircularProgress isIndeterminate label="Loading..." />
<CircularProgress value={3.2} max={5} label="Disk usage" hasValueLabel
  formatValueLabel={(v, m) => \`\${v} GB / \${m} GB\`} />
<CircularProgress value={30} label="Canceled" isDisabled hasValueLabel />
\`\`\``,methods:[],displayName:`CircularProgress`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},value:{required:!1,tsType:{name:`number`},description:"Current value of the circular progress.\nIgnored when `isIndeterminate` is true.",defaultValue:{value:`0`,computed:!1}},max:{required:!1,tsType:{name:`number`},description:`Maximum value.
@default 100`,defaultValue:{value:`100`,computed:!1}},label:{required:!0,tsType:{name:`string`},description:`Accessible label for the progress indicator. Required for a11y.`},isLabelHidden:{required:!1,tsType:{name:`boolean`},description:`When true, the label is visually hidden but remains accessible to screen readers.
@default true`,defaultValue:{value:`true`,computed:!1}},hasValueLabel:{required:!1,tsType:{name:`boolean`},description:'When true, displays the formatted value (e.g. "75%") in the center of\nthe ring. Ignored when `isIndeterminate` is true or when `children`\nprovide custom center content.\n@default false',defaultValue:{value:`false`,computed:!1}},formatValueLabel:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: number, max: number) => string`,signature:{arguments:[{type:{name:`number`},name:`value`},{type:{name:`number`},name:`max`}],return:{name:`string`}}},description:"Custom formatter for the value label.\n@default (value, max) => `${Math.round((value / max) * 100)}%`",defaultValue:{value:`function defaultFormatValueLabel(value: number, max: number): string {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return \`\${pct}%\`;
}`,computed:!1}},children:{required:!1,tsType:{name:`ReactNode`},description:`Content displayed in the center of the ring.
Typically a percentage string, icon, or custom content.
Takes precedence over \`hasValueLabel\`.`},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`}]},description:`Diameter of the circular progress.
- 'sm': 32px
- 'md': 48px
- 'lg': 64px
@default 'md'`,defaultValue:{value:`'md'`,computed:!1}},variant:{required:!1,tsType:{name:`CircularProgressVariantMap`},description:`Visual style variant mapped to semantic color tokens.
@default 'accent'`,defaultValue:{value:`'accent'`,computed:!1}},isIndeterminate:{required:!1,tsType:{name:`boolean`},description:"When true, renders an animated indeterminate progress indicator.\nUse when the progress amount is unknown (e.g. loading, processing).\nThe `value` and `hasValueLabel` props are ignored in this mode.\nRespects `prefers-reduced-motion` by slowing the animation.\n@default false",defaultValue:{value:`false`,computed:!1}},isDisabled:{required:!1,tsType:{name:`boolean`},description:`When true, the circular progress is visually disabled — the ring and
text use disabled colors. Use for canceled or inactive operations.
@default false`,defaultValue:{value:`false`,computed:!1}},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for testing utilities.`}},composes:[`Omit`]}})))()}var y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=e((()=>{v(),s(),y=l(),b={title:`Lab/CircularProgress`,component:d,tags:[`autodocs`],argTypes:{value:{control:{type:`range`,min:0,max:100,step:1},description:`Current value`},max:{control:`number`,description:`Maximum value`},label:{control:`text`,description:`Accessible label`},size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Ring diameter`},variant:{control:`select`,options:[`accent`,`success`,`warning`,`error`,`neutral`],description:`Semantic color variant`},isLabelHidden:{control:`boolean`,description:`Visually hide the label`},hasValueLabel:{control:`boolean`,description:`Show the formatted value in the ring center`},isIndeterminate:{control:`boolean`,description:`Animated indicator for unknown progress`},isDisabled:{control:`boolean`,description:`Visually disabled ring and text`}}},x={args:{value:60,label:`Progress`}},S={args:{value:75,label:`Upload progress`,size:`lg`,children:`75%`}},C={render:()=>(0,y.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,y.jsx)(d,{value:60,size:`sm`,label:`Small`}),(0,y.jsx)(d,{value:60,size:`md`,label:`Medium`}),(0,y.jsx)(d,{value:60,size:`lg`,label:`Large`})]})},w={render:()=>(0,y.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,y.jsx)(d,{value:60,size:`sm`,label:`Small`,children:(0,y.jsx)(c,{type:`supporting`,style:{fontSize:8},children:`60%`})}),(0,y.jsx)(d,{value:60,size:`md`,label:`Medium`,children:(0,y.jsx)(c,{type:`supporting`,style:{fontSize:11},children:`60%`})}),(0,y.jsx)(d,{value:60,size:`lg`,label:`Large`,children:(0,y.jsx)(c,{type:`body`,children:`60%`})})]})},T={render:()=>(0,y.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,y.jsx)(d,{value:60,label:`Accent`,variant:`accent`}),(0,y.jsx)(d,{value:80,label:`Positive`,variant:`success`}),(0,y.jsx)(d,{value:50,label:`Warning`,variant:`warning`}),(0,y.jsx)(d,{value:92,label:`Negative`,variant:`error`}),(0,y.jsx)(d,{value:35,label:`Neutral`,variant:`neutral`})]})},E={args:{value:0,label:`Not started`}},D={args:{value:100,label:`Complete`,variant:`success`,size:`lg`,children:`100%`}},O={args:{value:75,label:`Upload progress`,size:`lg`,hasValueLabel:!0}},k={args:{value:3,max:5,label:`Steps completed`,size:`lg`,hasValueLabel:!0,formatValueLabel:(e,t)=>`${e}/${t}`}},A={render:()=>(0,y.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,y.jsx)(d,{value:30,label:`Canceled`,isDisabled:!0}),(0,y.jsx)(d,{value:30,label:`Canceled with value`,size:`lg`,isDisabled:!0,hasValueLabel:!0}),(0,y.jsx)(d,{isIndeterminate:!0,label:`Canceled loading`,isDisabled:!0})]})},j={args:{isIndeterminate:!0,label:`Loading...`}},M={render:()=>(0,y.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,y.jsx)(d,{isIndeterminate:!0,size:`sm`,label:`Loading small`}),(0,y.jsx)(d,{isIndeterminate:!0,size:`md`,label:`Loading medium`}),(0,y.jsx)(d,{isIndeterminate:!0,size:`lg`,label:`Loading large`})]})},N={render:()=>(0,y.jsxs)(`div`,{style:{display:`flex`,gap:`24px`,alignItems:`center`},children:[(0,y.jsx)(d,{isIndeterminate:!0,label:`Accent`,variant:`accent`}),(0,y.jsx)(d,{isIndeterminate:!0,label:`Positive`,variant:`success`}),(0,y.jsx)(d,{isIndeterminate:!0,label:`Warning`,variant:`warning`}),(0,y.jsx)(d,{isIndeterminate:!0,label:`Negative`,variant:`error`}),(0,y.jsx)(d,{isIndeterminate:!0,label:`Neutral`,variant:`neutral`})]})},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    value: 60,
    label: 'Progress'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: 'Upload progress',
    size: 'lg',
    children: '75%'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress value={60} size="sm" label="Small" />
      <CircularProgress value={60} size="md" label="Medium" />
      <CircularProgress value={60} size="lg" label="Large" />
    </div>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress value={60} size="sm" label="Small">
        <Text type="supporting" style={{
        fontSize: 8
      }}>
          60%
        </Text>
      </CircularProgress>
      <CircularProgress value={60} size="md" label="Medium">
        <Text type="supporting" style={{
        fontSize: 11
      }}>
          60%
        </Text>
      </CircularProgress>
      <CircularProgress value={60} size="lg" label="Large">
        <Text type="body">60%</Text>
      </CircularProgress>
    </div>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress value={60} label="Accent" variant="accent" />
      <CircularProgress value={80} label="Positive" variant="success" />
      <CircularProgress value={50} label="Warning" variant="warning" />
      <CircularProgress value={92} label="Negative" variant="error" />
      <CircularProgress value={35} label="Neutral" variant="neutral" />
    </div>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0,
    label: 'Not started'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100,
    label: 'Complete',
    variant: 'success',
    size: 'lg',
    children: '100%'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: 'Upload progress',
    size: 'lg',
    hasValueLabel: true
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    value: 3,
    max: 5,
    label: 'Steps completed',
    size: 'lg',
    hasValueLabel: true,
    formatValueLabel: (value, max) => \`\${value}/\${max}\`
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress value={30} label="Canceled" isDisabled />
      <CircularProgress value={30} label="Canceled with value" size="lg" isDisabled hasValueLabel />
      <CircularProgress isIndeterminate label="Canceled loading" isDisabled />
    </div>
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    isIndeterminate: true,
    label: 'Loading...'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress isIndeterminate size="sm" label="Loading small" />
      <CircularProgress isIndeterminate size="md" label="Loading medium" />
      <CircularProgress isIndeterminate size="lg" label="Loading large" />
    </div>
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress isIndeterminate label="Accent" variant="accent" />
      <CircularProgress isIndeterminate label="Positive" variant="success" />
      <CircularProgress isIndeterminate label="Warning" variant="warning" />
      <CircularProgress isIndeterminate label="Negative" variant="error" />
      <CircularProgress isIndeterminate label="Neutral" variant="neutral" />
    </div>
}`,...N.parameters?.docs?.source}}},P=[`Default`,`WithCenterLabel`,`Sizes`,`SizesWithLabels`,`Variants`,`Empty`,`Full`,`WithValueLabel`,`CustomValueFormat`,`Disabled`,`Indeterminate`,`IndeterminateSizes`,`IndeterminateVariants`]})))()}F();export{k as CustomValueFormat,x as Default,A as Disabled,E as Empty,D as Full,j as Indeterminate,M as IndeterminateSizes,N as IndeterminateVariants,C as Sizes,w as SizesWithLabels,T as Variants,S as WithCenterLabel,O as WithValueLabel,P as __namedExportsOrder,b as default};