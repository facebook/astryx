import{ah as u,a1 as s,a6 as g,af as T,ay as w}from"./iframe-Cm6U1NA5.js";import{L as p}from"./ListItem-Da5jKckx.js";const o={list:{kogj98:"astryx1ghz6dp",kZCmMZ:"astryx1c1uobl",kH6xsr:"astryx3ct3a4",k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",kOIVth:"astryx1lsbc85",$$css:!0},withDividers:{kOIVth:"astryxxhr3t",$$css:!0},withCounter:{kt6KFK:"astryxif0320",$$css:!0}},k={kt6KFK:"astryx1khind5",$$css:!0},S={counterStart:a=>[k,{"--x-counterReset":`astryx-list ${a}`!=null?`astryx-list ${a}`:void 0}]};function y({children:a,density:n="balanced",hasDividers:i=!1,header:l,listStyle:e="none",start:t,xstyle:f,className:x,style:h,"data-testid":L,ref:b}){const d=u.useId(),r=e==="decimal",v=r?"ol":"ul",c=u.useMemo(()=>({density:n,hasDividers:i,listStyle:e}),[n,i,e]),m=s.jsx(v,{ref:b,"data-testid":L,"aria-labelledby":l!=null?d:void 0,...r&&t!=null&&t!==1?{start:t}:{},...e==="none"&&!r?{role:"list"}:{},...g(w("list",{density:n,listStyle:e}),T(o.list,i&&o.withDividers,e!=="none"&&(t!=null&&t!==1?S.counterStart(t-1):o.withCounter),f),x,h),children:a});return l==null?s.jsx(p,{value:c,children:m}):s.jsx(p,{value:c,children:s.jsxs("div",{className:"astryx78zum5 astryxdt5ytf",children:[s.jsx("div",{id:d,className:"astryx1p37lm5",children:l}),m]})})}y.displayName="List";y.__docgenInfo={description:`A vertical list component for rendering collections of items.

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
\`\`\``,methods:[],displayName:"List",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLUListElement | HTMLOListElement>",elements:[{name:"union",raw:"HTMLUListElement | HTMLOListElement",elements:[{name:"HTMLUListElement"},{name:"HTMLOListElement"}]}]},description:"Ref forwarded to the root element"},children:{required:!0,tsType:{name:"ReactNode"},description:"List items. Should be ListItem components."},density:{required:!1,tsType:{name:"union",raw:"'compact' | 'balanced' | 'spacious'",elements:[{name:"literal",value:"'compact'"},{name:"literal",value:"'balanced'"},{name:"literal",value:"'spacious'"}]},description:`Spacing density for list items.
- 'compact': Tighter spacing for dense UIs
- 'balanced': Standard spacing
- 'spacious': Extra spacing for readability
@default 'balanced'`,defaultValue:{value:"'balanced'",computed:!1}},hasDividers:{required:!1,tsType:{name:"boolean"},description:`Whether to show dividers between list items.
@default false`,defaultValue:{value:"false",computed:!1}},header:{required:!1,tsType:{name:"ReactNode"},description:`Header content rendered above the list.
Semantically associated via aria-labelledby.`},listStyle:{required:!1,tsType:{name:"union",raw:"'none' | 'disc' | 'decimal' | 'circle'",elements:[{name:"literal",value:"'none'"},{name:"literal",value:"'disc'"},{name:"literal",value:"'decimal'"},{name:"literal",value:"'circle'"}]},description:"List marker style.\nWhen 'decimal', renders an `<ol>`. Otherwise renders a `<ul>`.\n@default 'none'",defaultValue:{value:"'none'",computed:!1}},start:{required:!1,tsType:{name:"number"},description:`Starting number for ordered lists (listStyle='decimal').
Sets the CSS counter to begin at this value.
@default 1`},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for testing frameworks."}},composes:["Omit"]};export{y as L};
