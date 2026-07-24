import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{l as r,n as i,t as a,u as o}from"./themeProps-_oSbOSxB.js";import{S as s,t as c}from"./utils-CD2ovDaz.js";import{t as l}from"./jsx-runtime-DqZldVDK.js";import{n as u,t as d}from"./Item-BQtn0DhD.js";var f,p,m=e((()=>{f=t(n(),1),p=(0,f.createContext)(null),p.displayName=`ListContext`}));function h({children:e,density:t=`balanced`,hasDividers:n=!1,header:r,listStyle:a=`none`,start:c,xstyle:l,className:u,style:d,"data-testid":f,ref:m}){let h=(0,g.useId)(),y=a===`decimal`,x=y?`ol`:`ul`,S=(0,g.useMemo)(()=>({density:t,hasDividers:n,listStyle:a}),[t,n,a]),C=(0,_.jsx)(x,{ref:m,"data-testid":f,"aria-labelledby":r==null?void 0:h,...y&&c!=null&&c!==1?{start:c}:{},...a===`none`&&!y?{role:`list`}:{},...s(i(`list`,{density:t,listStyle:a}),o(v.list,n&&v.withDividers,a!==`none`&&(c!=null&&c!==1?b.counterStart(c-1):v.withCounter),l),u,d),children:e});return r==null?(0,_.jsx)(p,{value:S,children:C}):(0,_.jsx)(p,{value:S,children:(0,_.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf`,children:[(0,_.jsx)(`div`,{id:h,className:`astryx1p37lm5`,children:r}),C]})})}var g,_,v,y,b,x=e((()=>{g=t(n(),1),r(),m(),c(),a(),_=l(),v={list:{kogj98:`astryx1ghz6dp`,kZCmMZ:`astryx1c1uobl`,kH6xsr:`astryx3ct3a4`,k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kOIVth:`astryx1lsbc85`,$$css:!0},withDividers:{kOIVth:`astryxxhr3t`,$$css:!0},withCounter:{kt6KFK:`astryxif0320`,$$css:!0}},y={kt6KFK:`astryx1khind5`,$$css:!0},b={counterStart:e=>[y,{"--x-counterReset":`astryx-list ${e}`==null?void 0:`astryx-list ${e}`}]},h.displayName=`List`,h.__docgenInfo={description:`A vertical list component for rendering collections of items.

Renders semantic \`<ul>\` or \`<ol>\` elements with configurable density,
dividers, marker styles, and an optional header.

@example
\`\`\`
<List>
  <ListItem label="Notifications" description="Manage your alerts" />
  <ListItem label="Privacy" description="Control your data" />
</List>
<List listStyle="decimal" density="compact">
  <ListItem label="First step" />
  <ListItem label="Second step" />
</List>
\`\`\``,methods:[],displayName:`List`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLUListElement | HTMLOListElement>`,elements:[{name:`union`,raw:`HTMLUListElement | HTMLOListElement`,elements:[{name:`HTMLUListElement`},{name:`HTMLOListElement`}]}]},description:`Ref forwarded to the root element`},children:{required:!0,tsType:{name:`ReactNode`},description:`List items. Should be ListItem components.`},density:{required:!1,tsType:{name:`union`,raw:`'compact' | 'balanced' | 'spacious'`,elements:[{name:`literal`,value:`'compact'`},{name:`literal`,value:`'balanced'`},{name:`literal`,value:`'spacious'`}]},description:`Spacing density for list items.
- 'compact': Tighter spacing for dense UIs
- 'balanced': Standard spacing
- 'spacious': Extra spacing for readability
@default 'balanced'`,defaultValue:{value:`'balanced'`,computed:!1}},hasDividers:{required:!1,tsType:{name:`boolean`},description:`Whether to show dividers between list items.
@default false`,defaultValue:{value:`false`,computed:!1}},header:{required:!1,tsType:{name:`ReactNode`},description:`Header content rendered above the list.
Semantically associated via aria-labelledby.`},listStyle:{required:!1,tsType:{name:`union`,raw:`'none' | 'disc' | 'decimal' | 'circle'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'disc'`},{name:`literal`,value:`'decimal'`},{name:`literal`,value:`'circle'`}]},description:"List marker style.\nWhen 'decimal', renders an `<ol>`. Otherwise renders a `<ul>`.\n@default 'none'",defaultValue:{value:`'none'`,computed:!1}},start:{required:!1,tsType:{name:`number`},description:`Starting number for ordered lists (listStyle='decimal').
Sets the CSS counter to begin at this value.
@default 1`},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for testing frameworks.`}},composes:[`Omit`]}}));function S({label:e,description:t,startContent:n,endContent:r,onClick:a,href:o,target:c,rel:l,isDisabled:d=!1,isSelected:f=!1,xstyle:m,className:h,style:g,ref:_,...v}){let y=(0,C.use)(p),b=y?.density??`balanced`,x=y?.hasDividers??!1,S=y?.listStyle??`none`;return(0,w.jsx)(u,{as:`li`,ref:_,marker:S===`disc`?(0,w.jsx)(`span`,{className:`astryxoi2r2e astryx9f619 astryx78zum5 astryx6s0dn4 astryxl56j7k astryx2lah0s astryx12xnipv astryx1233pnv`,children:(0,w.jsx)(`span`,{className:`astryx1v4s8kt astryxols6we astryx16rqkct astryx19aspcf`})}):S===`circle`?(0,w.jsx)(`span`,{className:`astryxoi2r2e astryx9f619 astryx78zum5 astryx6s0dn4 astryxl56j7k astryx2lah0s astryx12xnipv astryx1233pnv`,children:(0,w.jsx)(`span`,{className:`astryx1v4s8kt astryxols6we astryx16rqkct astryxmkeg23 astryx1y0btm7 astryxqcx1ss astryxjbqb8w`})}):S===`decimal`?(0,w.jsx)(`span`,{className:`astryxoi2r2e astryx2lah0s astryx1tgivj0 astryxjm74w1 astryxw6l6zx astryx12xnipv astryxc2ndz5`}):null,startContent:n,label:e,description:t,endContent:r,onClick:a,href:o,target:c,rel:l,isDisabled:d,isSelected:f,density:b,xstyle:[S!==`none`&&T.withCounter,x&&T.withDivider,x&&E.noRadius,m],...s(i(`list-item`),{className:h,style:g}),...v})}var C,w,T,E,D=e((()=>{C=t(n(),1),m(),c(),d(),a(),w=l(),T={withCounter:{kAmcRD:`astryxfrknyr`,$$css:!0},withDivider:{kt9PQ7:`astryx92x3c3`,kfdmCh:`astryx1q0q8m5`,kL6WhQ:`astryxw8gpjh`,kIy1pl:`astryx1rix2v9`,kx8K5S:null,kTFOXF:null,kdIrg8:null,$$css:!0}},E={noRadius:{kaIpWk:`astryx2u8bby`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0}},S.displayName=`ListItem`,S.__docgenInfo={description:`A list item component for use within List.

Renders structured content with label, description, start/end content areas.
When \`onClick\` is provided, uses the invisible button pattern for accessibility.
When \`href\` is provided, uses an invisible anchor pattern.

@example
\`\`\`
<ListItem label="Settings" description="Manage your preferences" />
<ListItem label="Profile" onClick={() => navigate('/profile')} />
<ListItem label="Docs" href="/docs" target="_blank" rel="noreferrer" />
\`\`\``,methods:[],displayName:`ListItem`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLLIElement>`,elements:[{name:`HTMLLIElement`}]},description:`Ref forwarded to the root element`},label:{required:!0,tsType:{name:`ReactNode`},description:`Primary text label for the item.

Accepts a plain string (single-line truncation applied automatically)
or a ReactNode for rich content (no truncation constraints —
child components control their own text behavior).`},description:{required:!1,tsType:{name:`ReactNode`},description:`Secondary description below the label.

Accepts a plain string (single-line truncation applied automatically)
or a ReactNode for rich/multi-line content (no wrapping constraints
applied — child components control their own text behavior).`},startContent:{required:!1,tsType:{name:`ReactNode`},description:`Content rendered before the item (icon, avatar, checkbox).
Uses start/end naming for RTL support.`},endContent:{required:!1,tsType:{name:`ReactNode`},description:`Content rendered after the item (badge, action button, chevron).`},onClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(e: React.MouseEvent) => void`,signature:{arguments:[{type:{name:`ReactMouseEvent`,raw:`React.MouseEvent`},name:`e`}],return:{name:`void`}}},description:`Click handler for interactive items.
Automatically enables hover/press styles when provided.`},href:{required:!1,tsType:{name:`string`},description:`URL for link items. Renders an invisible anchor element.
Automatically enables hover/press styles when provided.`},target:{required:!1,tsType:{name:`string`},description:`Link target (e.g., '_blank'). Only used with href.`},rel:{required:!1,tsType:{name:`string`},description:`Link relationship. Automatically includes noopener noreferrer when
target is "_blank".`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the item is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},isSelected:{required:!1,tsType:{name:`boolean`},description:`Whether the item is currently selected.
@default false`,defaultValue:{value:`false`,computed:!1}}},composes:[`Omit`]}}));export{p as a,x as i,D as n,m as o,h as r,S as t};