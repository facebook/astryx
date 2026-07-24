import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{l as r,n as i,t as a,u as o}from"./themeProps-_oSbOSxB.js";import{S as s,t as c}from"./utils-CD2ovDaz.js";import{t as l}from"./jsx-runtime-DqZldVDK.js";function u({title:e,description:t,icon:n,actions:r,headingLevel:a=3,isCompact:c=!1,xstyle:l,className:u,style:m,ref:h,...g}){let _=`h${a}`;return(0,f.jsxs)(`div`,{ref:h,role:`status`,...s(i(`empty-state`,{variant:c?`compact`:null}),o(p.container,c&&p.containerCompact,l),u,m),...g,children:[n!=null&&(0,f.jsx)(`div`,{"aria-hidden":`true`,children:n}),(0,f.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryx6s0dn4 astryxxc7z9f`,children:[(0,d.createElement)(_,{0:{className:`astryx1ghz6dp astryxjb2p0i astryx18juvz8 astryx2mo6ok astryxf74fhv astryx1tgivj0`},1:{className:`astryx1ghz6dp astryxjb2p0i astryx2mo6ok astryxf74fhv astryx1tgivj0 astryxcr08ib`}}[!!c<<0],e),t!=null&&(0,f.jsx)(`div`,{...{0:{className:`astryx1ghz6dp astryxjb2p0i astryxjm74w1 astryx1sodnla astryxw6l6zx astryxv1l7n4`},1:{className:`astryx1ghz6dp astryxjb2p0i astryx1sodnla astryxw6l6zx astryxv1l7n4 astryx141an7d`}}[!!c<<0],children:t})]}),r!=null&&(0,f.jsx)(`div`,{...{0:{className:`astryx78zum5 astryx1q0g3np astryx6s0dn4 astryx1txdalj astryxcsaf9d`},1:{className:`astryx78zum5 astryx6s0dn4 astryx1txdalj astryxcsaf9d astryxdt5ytf`}}[!!c<<0],children:r})]})}var d,f,p,m=e((()=>{d=t(n(),1),r(),c(),a(),f=l(),p={container:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,k9WMMc:`astryx2b8uid`,kOIVth:`astryx18g69wz`,k8WAf4:`astryxmfvnks`,kg3NbH:`astryxm7rs69`,$$css:!0},containerCompact:{kOIVth:`astryx1txdalj`,k8WAf4:`astryx1na6nto`,kg3NbH:`astryx1pzlopt`,$$css:!0}},u.displayName=`EmptyState`,u.__docgenInfo={description:`An empty state placeholder for content areas with no data.
Displays an icon or illustration, title, optional description, and action buttons.

Uses \`role="status"\` to announce content to screen readers.
Styles use Astryx theme tokens via StyleX. Wrap your app in <Theme> to apply a theme.

@example
\`\`\`
<EmptyState
  title="No results found"
  description="Try adjusting your search or filters."
/>
<EmptyState
  icon={<Icon icon={InboxIcon} size="lg" />}
  title="No messages"
  description="You're all caught up!"
  actions={<Button label="Compose" variant="primary" />}
/>
\`\`\``,methods:[],displayName:`EmptyState`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},title:{required:!0,tsType:{name:`string`},description:`The primary message displayed in the empty state.`},description:{required:!1,tsType:{name:`string`},description:`Optional secondary text providing additional context.`},icon:{required:!1,tsType:{name:`ReactNode`},description:`Optional icon or illustration displayed above the title.
Rendered as decorative (aria-hidden="true").`},actions:{required:!1,tsType:{name:`ReactNode`},description:"Optional action buttons displayed below the description.\nLaid out horizontally by default, stacked vertically when `isCompact`."},headingLevel:{required:!1,tsType:{name:`union`,raw:`1 | 2 | 3 | 4 | 5 | 6`,elements:[{name:`literal`,value:`1`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`}]},description:`Semantic heading level for the title element.
Controls only the rendered HTML tag (h1–h6) so the title fits the
document outline. This is a semantic change for accessibility and does
not change the visual size of the title, which stays fixed regardless
of level.
@default 3`,defaultValue:{value:`3`,computed:!1}},isCompact:{required:!1,tsType:{name:`boolean`},description:`Use compact variant for constrained spaces with reduced spacing.
@default false`,defaultValue:{value:`false`,computed:!1}}},composes:[`Omit`]}})),h=e((()=>{m()}));export{u as n,m as r,h as t};