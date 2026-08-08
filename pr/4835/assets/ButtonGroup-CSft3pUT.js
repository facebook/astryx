import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a}from"./mergeRefs-CPqjs56a.js";import{t as o}from"./composeEventHandlers-DY4wem0S.js";import{n as s,t as c}from"./themeProps-CREkzZh6.js";import{t as l}from"./jsx-runtime-DeHZSEgm.js";import{i as u,r as d}from"./Button-BVMvoKVE.js";import{n as f,r as p,t as m}from"./SizeContext-Dp2usO2O.js";import{n as h,t as g}from"./useListFocus-C3PMl9Zf.js";function _({children:e,label:t,orientation:r=`horizontal`,size:c,isDisabled:l=!1,elevation:u=`none`,xstyle:f,className:g,style:_,ref:S,"data-testid":C,onKeyDown:w,...T}){let E=p(c,`md`),{listRef:D,handleKeyDown:O}=h({itemSelector:`button, [tabindex="0"]`,orientation:r}),k=(0,v.useMemo)(()=>({orientation:r,isDisabled:l}),[r,l]);return(0,y.jsx)(d,{value:k,children:(0,y.jsx)(m,{value:E,children:(0,y.jsx)(`div`,{ref:a(S,D),...T,...i(s(`button-group`,{size:E,orientation:r}),n(b.group,r===`vertical`&&b.vertical,x[u],f),g,_),role:`group`,"aria-label":t,onKeyDown:o(w,O),"aria-disabled":l||void 0,"data-testid":C,children:e})})})}var v,y,b,x;function S(){return(S=e((()=>{v=t(),r(),f(),g(),u(),c(),y=l(),b={group:{k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx1qjc9v5`,$$css:!0},vertical:{kXwgrk:`astryxdt5ytf`,$$css:!0}},x={none:{kGVxlE:`astryx1gnnqk1`,$$css:!0},low:{kGVxlE:`astryx1i5ehqx`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},med:{kGVxlE:`astryx14hfi27`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},high:{kGVxlE:`astryx1kcpxr7`,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0}},_.displayName=`ButtonGroup`,_.__docgenInfo={description:`Groups buttons with connected styling — shared borders, proper border-radius
handling (only on outer edges), and horizontal or vertical orientation.

Children automatically detect the group via context and apply position-aware
styles in pure CSS.

Members that render their own layer — a Button with a \`tooltip\`, or a
DropdownMenu — compose correctly, including as the trailing member.

@example
\`\`\`
<ButtonGroup label="Actions">
  <Button label="Copy" />
  <Button label="Cut" />
  <Button label="Paste" />
</ButtonGroup>
\`\`\`

@example
\`\`\`
<ButtonGroup label="Approve action">
  <Button label="Allow once" variant="primary" />
  <DropdownMenu
    button={{label: 'Allow options', variant: 'primary', isIconOnly: true, icon: <Icon icon="chevronDown" />}}
    items={[{label: 'Allow for 30 minutes'}, {label: 'Always allow'}]}
  />
</ButtonGroup>
\`\`\``,methods:[],displayName:`ButtonGroup`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element.`},children:{required:!0,tsType:{name:`ReactNode`},description:`Button or IconButton children.`},label:{required:!0,tsType:{name:`string`},description:`Accessible label for the group (used as aria-label).`},orientation:{required:!1,tsType:{name:`union`,raw:`'horizontal' | 'vertical'`,elements:[{name:`literal`,value:`'horizontal'`},{name:`literal`,value:`'vertical'`}]},description:`Orientation of the button group.
@default 'horizontal'`,defaultValue:{value:`'horizontal'`,computed:!1}},size:{required:!1,tsType:{name:`unknown`},description:`Default size for buttons in the group.
Individual buttons can override this with their own \`size\` prop.
@default 'md'`},elevation:{required:!1,tsType:{name:`union`,raw:`'none' | 'low' | 'med' | 'high'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'low'`},{name:`literal`,value:`'med'`},{name:`literal`,value:`'high'`}]},description:`Resting elevation for the group. The connected buttons share one surface,
so the shadow sits on the group and lifts them together. Use for a floating
group of actions above content.
@default 'none'`,defaultValue:{value:`'none'`,computed:!1}},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether all buttons in the group are disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for testing frameworks.`}},composes:[`Omit`]}})))()}export{S as n,_ as t};