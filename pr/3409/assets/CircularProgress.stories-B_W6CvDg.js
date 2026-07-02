import{ah as E,a1 as e,a6 as d,af as u,ay as m,T as C}from"./iframe-Z8EfSKmM.js";import"./preload-helper-Ct5FWWRu.js";const U={sm:{diameter:32,strokeWidth:3},md:{diameter:48,strokeWidth:4},lg:{diameter:64,strokeWidth:5}},i={root:{k1xSpc:"astryx3nfvp2",kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",kVAEAm:"astryx1n2onr6",kmuXW:"astryx2lah0s",$$css:!0},rootWithLabel:{kXwgrk:"astryxdt5ytf",kOIVth:"astryxzye2dw",$$css:!0},track:{kDwRjp:"astryxbh8q5q",kjVXCG:"astryxpi25hw",$$css:!0},fill:{kDwRjp:"astryxbh8q5q",kU5bRw:"astryx1owpc8m",k1ekBW:"astryxxnu56j",kIyJzY:"astryx80gvsz",kAMwcw:"astryxlr8y92",$$css:!0},fillIndeterminate:{kDwRjp:"astryxbh8q5q",kU5bRw:"astryx1owpc8m",kKVMdj:"astryxx48r2r",k44tkh:"astryxmg6eyc astryxnh0sag",kyAemX:"astryx4hg4is",ko0y90:"astryxa4qsjk",$$css:!0}},q={accent:{kjVXCG:"astryxjsr54c",$$css:!0},success:{kjVXCG:"astryx8y33gb",$$css:!0},warning:{kjVXCG:"astryx9ezeq1",$$css:!0},error:{kjVXCG:"astryx1vco6zm",$$css:!0},neutral:{kjVXCG:"astryxuxf9kk",$$css:!0}},_={accent:{kjVXCG:"astryximx5ud",$$css:!0},success:{kjVXCG:"astryx1uro670",$$css:!0},warning:{kjVXCG:"astryx1wjzxuj",$$css:!0},error:{kjVXCG:"astryxjswp7v",$$css:!0},neutral:{kjVXCG:"astryxpi25hw",$$css:!0}};function r({value:z,max:n=100,label:L,isLabelHidden:T=!0,children:P,size:w="md",variant:a="accent",xstyle:N,className:W,style:X,"data-testid":M,ref:G,...R}){const S=E.useId(),s=z==null,{diameter:t,strokeWidth:o}=U[w],c=(t-o)/2,$=2*Math.PI*c,I=Math.min(Math.max(0,z??0),n),A=n>0?I/n:0,D=$*(1-A),l=t/2,V=!T;return e.jsxs("div",{ref:G,...d(m("circular-progress",{variant:a,size:w}),u(i.root,V&&i.rootWithLabel,N),W,X),"data-testid":M,...R,children:[e.jsx("span",{id:S,...{0:{className:"astryx10l6tqk astryx1i1rx1s astryxjm9jq1 astryx1717udv astryxkdpibf astryxb3r6kr astryxzpqnlu astryxuxw1ft astryxc342km"},1:{className:"astryx141an7d astryx1ltkj2j astryx1e4wzip astryxv1l7n4"}}[!!V<<0],children:L}),e.jsxs("div",{className:"astryx1n2onr6 astryx3nfvp2",children:[e.jsxs("svg",{role:s?"progressbar":"meter","aria-labelledby":S,"aria-valuenow":s?void 0:I,"aria-valuemin":s?void 0:0,"aria-valuemax":s?void 0:n,width:t,height:t,viewBox:`0 0 ${t} ${t}`,...{0:{className:"astryx1lliihq astryx9tu13d"},1:{className:"astryx1lliihq astryx48ohth astryx1c74tu6 astryxy02sl2 astryx1esw782 astryxa4qsjk"}}[!!s<<0],children:[e.jsx("circle",{...d(m("circular-progress-track"),u(i.track,_[a])),cx:l,cy:l,r:c,strokeWidth:o}),s?e.jsx("circle",{...d(m("circular-progress-fill",{variant:a}),u(i.fillIndeterminate,q[a])),cx:l,cy:l,r:c,strokeWidth:o}):e.jsx("circle",{...d(m("circular-progress-fill",{variant:a}),u(i.fill,q[a])),cx:l,cy:l,r:c,strokeWidth:o,strokeDasharray:$,strokeDashoffset:D})]}),P!=null&&e.jsx("div",{className:"astryx10l6tqk astryx10a8y8t astryx78zum5 astryx6s0dn4 astryxl56j7k astryx47corl",children:P})]})]})}r.displayName="CircularProgress";r.__docgenInfo={description:`A circular/radial progress indicator that shows completion as a ring.

In determinate mode, displays a known value as an arc fill.
In indeterminate mode, shows an animated spinning indicator.
Supports center content via children for labels, percentages, or icons.

@example
\`\`\`
<CircularProgress value={75} label="Upload progress" />
<CircularProgress value={75} label="Progress" max={100}>75%</CircularProgress>
<CircularProgress label="Loading..." />
\`\`\``,methods:[],displayName:"CircularProgress",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the root element"},value:{required:!1,tsType:{name:"number"},description:`Current value of the circular progress.
When omitted, the component renders an indeterminate spinning animation.`},max:{required:!1,tsType:{name:"number"},description:`Maximum value.
@default 100`,defaultValue:{value:"100",computed:!1}},label:{required:!0,tsType:{name:"string"},description:"Accessible label for the progress indicator. Required for a11y."},isLabelHidden:{required:!1,tsType:{name:"boolean"},description:`When true, the label is visually hidden but remains accessible to screen readers.
@default true`,defaultValue:{value:"true",computed:!1}},children:{required:!1,tsType:{name:"ReactNode"},description:`Content displayed in the center of the ring.
Typically a percentage string, icon, or custom content.`},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:`Diameter of the circular progress.
- 'sm': 32px
- 'md': 48px
- 'lg': 64px
@default 'md'`,defaultValue:{value:"'md'",computed:!1}},variant:{required:!1,tsType:{name:"CircularProgressVariantMap"},description:`Visual style variant mapped to semantic color tokens.
@default 'accent'`,defaultValue:{value:"'accent'",computed:!1}},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for testing utilities."}},composes:["Omit"]};const F={title:"Lab/CircularProgress",component:r,tags:["autodocs"],argTypes:{value:{control:{type:"range",min:0,max:100,step:1},description:"Current value"},max:{control:"number",description:"Maximum value"},label:{control:"text",description:"Accessible label"},size:{control:"select",options:["sm","md","lg"],description:"Ring diameter"},variant:{control:"select",options:["accent","success","warning","error","neutral"],description:"Semantic color variant"},isLabelHidden:{control:"boolean",description:"Visually hide the label"}}},p={args:{value:60,label:"Progress"}},g={args:{value:75,label:"Upload progress",size:"lg",children:"75%"}},x={render:()=>e.jsxs("div",{style:{display:"flex",gap:"24px",alignItems:"center"},children:[e.jsx(r,{value:60,size:"sm",label:"Small"}),e.jsx(r,{value:60,size:"md",label:"Medium"}),e.jsx(r,{value:60,size:"lg",label:"Large"})]})},y={render:()=>e.jsxs("div",{style:{display:"flex",gap:"24px",alignItems:"center"},children:[e.jsx(r,{value:60,size:"sm",label:"Small",children:e.jsx(C,{type:"supporting",style:{fontSize:8},children:"60%"})}),e.jsx(r,{value:60,size:"md",label:"Medium",children:e.jsx(C,{type:"supporting",style:{fontSize:11},children:"60%"})}),e.jsx(r,{value:60,size:"lg",label:"Large",children:e.jsx(C,{type:"body",children:"60%"})})]})},v={render:()=>e.jsxs("div",{style:{display:"flex",gap:"24px",alignItems:"center"},children:[e.jsx(r,{value:60,label:"Accent",variant:"accent"}),e.jsx(r,{value:80,label:"Positive",variant:"success"}),e.jsx(r,{value:50,label:"Warning",variant:"warning"}),e.jsx(r,{value:92,label:"Negative",variant:"error"}),e.jsx(r,{value:35,label:"Neutral",variant:"neutral"})]})},b={args:{value:0,label:"Not started"}},h={args:{value:100,label:"Complete",variant:"success",size:"lg",children:"100%"}},f={args:{label:"Loading..."}},j={render:()=>e.jsxs("div",{style:{display:"flex",gap:"24px",alignItems:"center"},children:[e.jsx(r,{size:"sm",label:"Loading small"}),e.jsx(r,{size:"md",label:"Loading medium"}),e.jsx(r,{size:"lg",label:"Loading large"})]})},k={render:()=>e.jsxs("div",{style:{display:"flex",gap:"24px",alignItems:"center"},children:[e.jsx(r,{label:"Accent",variant:"accent"}),e.jsx(r,{label:"Positive",variant:"success"}),e.jsx(r,{label:"Warning",variant:"warning"}),e.jsx(r,{label:"Negative",variant:"error"})]})};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: 60,
    label: 'Progress'
  }
}`,...p.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    value: 75,
    label: 'Upload progress',
    size: 'lg',
    children: '75%'
  }
}`,...g.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress value={60} size="sm" label="Small" />
      <CircularProgress value={60} size="md" label="Medium" />
      <CircularProgress value={60} size="lg" label="Large" />
    </div>
}`,...x.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0,
    label: 'Not started'
  }
}`,...b.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    value: 100,
    label: 'Complete',
    variant: 'success',
    size: 'lg',
    children: '100%'
  }
}`,...h.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Loading...'
  }
}`,...f.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress size="sm" label="Loading small" />
      <CircularProgress size="md" label="Loading medium" />
      <CircularProgress size="lg" label="Loading large" />
    </div>
}`,...j.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  }}>
      <CircularProgress label="Accent" variant="accent" />
      <CircularProgress label="Positive" variant="success" />
      <CircularProgress label="Warning" variant="warning" />
      <CircularProgress label="Negative" variant="error" />
    </div>
}`,...k.parameters?.docs?.source}}};const J=["Default","WithCenterLabel","Sizes","SizesWithLabels","Variants","Empty","Full","Indeterminate","IndeterminateSizes","IndeterminateVariants"];export{p as Default,b as Empty,h as Full,f as Indeterminate,j as IndeterminateSizes,k as IndeterminateVariants,x as Sizes,y as SizesWithLabels,v as Variants,g as WithCenterLabel,J as __namedExportsOrder,F as default};
