import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a,t as o}from"./themeProps-CREkzZh6.js";import{t as s}from"./jsx-runtime-DeHZSEgm.js";import{i as c,r as l}from"./ListItem-BfUeYEoi.js";function u({children:e,density:t=`balanced`,hasDividers:r=!1,header:o,listStyle:s=`none`,start:c,xstyle:u,className:m,style:g,"data-testid":_,ref:v}){let y=(0,d.useId)(),b=s===`decimal`,x=b?`ol`:`ul`,S=(0,d.useMemo)(()=>({density:t,hasDividers:r,listStyle:s}),[t,r,s]),C=(0,f.jsx)(x,{ref:v,"data-testid":_,"aria-labelledby":o==null?void 0:y,...b&&c!=null&&c!==1?{start:c}:{},role:`list`,...i(a(`list`,{density:t,listStyle:s}),n(p.list,r&&p.withDividers,s!==`none`&&(c!=null&&c!==1?h.counterStart(c-1):p.withCounter),u),m,g),children:e});return o==null?(0,f.jsx)(l,{value:S,children:C}):(0,f.jsx)(l,{value:S,children:(0,f.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf`,children:[(0,f.jsx)(`div`,{id:y,className:`astryx1p37lm5`,children:o}),C]})})}var d,f,p,m,h;function g(){return(g=e((()=>{d=t(),r(),c(),o(),f=s(),p={list:{kogj98:`astryx1ghz6dp`,kZCmMZ:`astryx1c1uobl`,kH6xsr:`astryx3ct3a4`,k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kOIVth:`astryx1lsbc85`,$$css:!0},withDividers:{kOIVth:`astryxxhr3t`,$$css:!0},withCounter:{kt6KFK:`astryxif0320`,$$css:!0}},m={kt6KFK:`astryx1khind5`,$$css:!0},h={counterStart:e=>[m,{"--x-counterReset":`astryx-list ${e}`==null?void 0:`astryx-list ${e}`}]},u.displayName=`List`,u.__docgenInfo={description:`A vertical list component for rendering collections of items.

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
@default 1`},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for testing frameworks.`}},composes:[`Omit`]}})))()}export{g as n,u as t};