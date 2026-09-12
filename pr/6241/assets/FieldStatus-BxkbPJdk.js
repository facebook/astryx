import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{E as r,F as i,I as a,O as o,b as s,p as c}from"./ime-B2gVvZm0.js";import{P as l,t as u}from"./utils-CuDRdYlB.js";import{t as d}from"./jsx-runtime-DqZldVDK.js";import{t as f}from"./Icon-D5LgKbqq.js";import{t as p}from"./Icon-Dur9nnrh.js";import{n as m,t as h}from"./useAnnounce-D0prHD0W.js";import{n as g,t as _}from"./useEntryAnimation-tVCBguwy.js";function v({ref:e,type:t,message:n,id:r,variant:i=`attached`,xstyle:s,className:c,style:u,...d}){let p=g(`slideDown`),h=m();return(0,y.useEffect)(()=>{n&&h(n,t===`error`?`assertive`:`polite`)},[h,n,t]),(0,b.jsx)(`div`,{ref:e,id:r,...d,...l(o(`field-status`,{type:t,variant:i}),a(S.base,p,i===`attached`?S.attached:S.detached,C[t],s),c,u),children:i===`detached`?(0,b.jsxs)(`span`,{className:`astryx78zum5 astryx1cy8zhl astryxzye2dw`,children:[(0,b.jsx)(`span`,{className:`astryx3nfvp2 astryx6s0dn4 astryx14o5nre astryx2lah0s`,children:(0,b.jsx)(f,{icon:x[t],size:`sm`,color:`inherit`,...o(`field-status-icon`,{type:t})})}),(0,b.jsx)(`span`,{children:n})]}):n})}var y,b,x,S,C,w=e((()=>{y=t(n(),1),i(),h(),u(),c(),_(),r(),p(),b=d(),x={warning:`warning`,error:`error`,success:`success`},`${s[`--spacing-1-5`]}`,S={base:{kMv6JI:`astryx9ynric`,kGuDYH:`astryx141an7d`,kLWn49:`astryx1ltkj2j`,$$css:!0},attached:{keoZOQ:`astryx3dbumh`,kLKAdn:`astryxdgtoc0`,kGO01o:`astryx1wesfrj`,kg3NbH:`astryxf314gf`,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,kVL7Gh:`astryxquck67`,kT0f0o:`astryx14i3lts`,kqGeR4:null,kYm2EN:null,kfzvcC:`astryx47corl`,$$css:!0},detached:{keoZOQ:`astryxcsaf9d`,k8WAf4:`astryxce4md1`,kLKAdn:null,kGO01o:null,kg3NbH:`astryxf314gf`,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,kaIpWk:`astryxh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0}},C={warning:{kWkggS:`astryx24i8r5`,kMwMTN:`astryxdhq94a`,$$css:!0},error:{kWkggS:`astryx1pritpl`,kMwMTN:`astryx1joocv1`,$$css:!0},success:{kWkggS:`astryxu13z74`,kMwMTN:`astryxltfdvo`,$$css:!0}},v.displayName=`FieldStatus`,v.__docgenInfo={description:`A status message component for form fields.

The \`detached\` variant renders a leading status icon before the message so
status is not conveyed by color or position alone (WCAG 1.4.1). The icon is
decorative for assistive tech (\`aria-hidden\`): the message text already names
the status in words and is announced through the live region. The \`attached\`
variant keeps its status affordance on the bordered input, so it renders no
icon here to avoid a duplicate. The \`tooltip\` variant renders no message box
at all — the input surfaces the status through a tooltip on its on-field
icon — so callers skip rendering FieldStatus for it.

Screen-reader announcements go through the persistent \`useAnnounce\` live
regions (assertive for errors, polite otherwise) rather than \`role\`/
\`aria-live\` on the rendered element. Live regions that mount together with
their content are not reliably announced by assistive technology, and
FieldStatus is almost always conditionally rendered by its callers. The
message is announced whenever it appears — including on first mount — and
whenever it changes.

@example
\`\`\`
<FieldStatus
  type="error"
  message="This field is required"
/>
<FieldStatus
  type="warning"
  message="This will be visible to others"
  variant="detached"
/>
\`\`\``,methods:[],displayName:`FieldStatus`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:``},type:{required:!0,tsType:{name:`union`,raw:`'warning' | 'error' | 'success'`,elements:[{name:`literal`,value:`'warning'`},{name:`literal`,value:`'error'`},{name:`literal`,value:`'success'`}]},description:`The type of status to display.`},message:{required:!0,tsType:{name:`string`},description:`The status message to display.`},variant:{required:!1,tsType:{name:`FieldStatusVariantMap`},description:`Visual variant of the status message.
- 'attached': Overlaps with input above (used in Field)
- 'detached': Floats below with spacing (used in Switch, CheckboxInput)
@default 'attached'`,defaultValue:{value:`'attached'`,computed:!1}}},composes:[`Omit`]}}));export{w as n,v as t};