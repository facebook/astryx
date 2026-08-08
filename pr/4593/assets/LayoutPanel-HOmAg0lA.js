import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{l as r,n as i,t as a,u as o}from"./themeProps-_oSbOSxB.js";import{a as s,c,o as l,s as u}from"./LayoutContent-_ZUZXEAr.js";import{O as d,t as f}from"./utils-BJaJxLWb.js";import{i as p,l as m,n as h,r as g,t as _}from"./padding.stylex-DjsS098v.js";import{t as v}from"./jsx-runtime-DqZldVDK.js";function y({children:e,hasDivider:t=!1,isScrollable:n=!0,label:r,padding:a,role:c,width:l,resizable:f,hideBelow:p,xstyle:v,className:y,style:T,ref:E,...D}){let O=(0,b.use)(u),{hasHeader:k,hasFooter:A}=(0,b.use)(s),j=f?f._size:l,M=O===`start`,N=O===`end`,P=a===0,F=!t&&!P&&a==null,I=M?C.dividerEnd:N?C.dividerStart:null,L=M?C.collapseEnd:N?C.collapseStart:null;return(0,x.jsx)(`div`,{ref:E,role:c,"aria-label":r,...d(i(`layout-panel`),o(C.panel,w.sizing(j??null),M&&!P&&a==null&&C.startPanel,N&&!P&&a==null&&C.endPanel,!k&&!P&&a==null&&C.noHeader,!A&&!P&&a==null&&C.noFooter,n&&C.scrollable,P&&C.fullBleed,a!=null&&m[a],a!=null&&g[a],a!=null&&h[a],a!=null&&_[a],t&&I,F&&L,p!=null&&S[p],v),y,T),...D,children:e})}var b,x,S,C,w,T=e((()=>{b=t(n(),1),r(),c(),l(),f(),a(),p(),x=v(),S={sm:{k1xSpc:`astryxkaaz9w`,$$css:!0},md:{k1xSpc:`astryxcq4dyp`,$$css:!0},lg:{k1xSpc:`astryxp8meh`,$$css:!0},xl:{k1xSpc:`astryx4d49lr`,$$css:!0}},C={panel:{kB7OPa:`astryx9f619`,kmuXW:`astryx2lah0s`,kVQacm:`astryx7giv3`,kZCmMZ:`astryxwjyata`,kwRFfy:`astryx1peupej`,kLKAdn:`astryxqty4a`,kGO01o:`astryxg476vw`,"--container-padding-inline-start":`astryx408pgh`,"--container-padding-inline-end":`astryxikqloz`,"--container-padding-block-start":`astryxjmgx01`,"--container-padding-block-end":`astryxi9ns85`,$$css:!0},startPanel:{kZCmMZ:`astryx139j0dd`,kE3dHu:null,kpe85a:null,$$css:!0},endPanel:{kwRFfy:`astryxpc6k2p`,kE3dHu:null,kpe85a:null,$$css:!0},noHeader:{kLKAdn:`astryx81pis9`,$$css:!0},noFooter:{kGO01o:`astryxon7vh3`,$$css:!0},fullBleed:{kZCmMZ:`astryx1c1uobl`,kwRFfy:`astryxyri2b`,kE3dHu:null,kpe85a:null,kLKAdn:`astryxexx8yu`,kGO01o:`astryx18d9i69`,"--container-padding-inline-start":`astryxrhngw9`,"--container-padding-inline-end":`astryxjsfl84`,"--container-padding-block-start":`astryx1047aw6`,"--container-padding-block-end":`astryxax9j7h`,$$css:!0},scrollable:{kVQacm:`astryxysyzu8`,kXHlph:null,kORKVm:null,$$css:!0},dividerEnd:{ke9TFa:`astryx1lun4ml`,kZ1KPB:null,kWqL5O:null,k8ry5P:`astryx18b5jzi`,k4WBpm:null,kSWEuD:null,kBCPoo:`astryx1gejf6u`,kaZRDh:null,k26BEO:null,$$css:!0},dividerStart:{k2ei4v:`astryxpilrb4`,kZ1KPB:null,kWqL5O:null,kVhnKS:`astryx1t7ytsu`,k4WBpm:null,kSWEuD:null,kGJrpR:`astryx1j92z86`,kaZRDh:null,k26BEO:null,$$css:!0},collapseStart:{keTefX:`astryx1wim8z0`,koQZXg:null,km5ZXQ:null,$$css:!0},collapseEnd:{k71WvV:`astryx1kpg4um`,koQZXg:null,km5ZXQ:null,$$css:!0}},w={sizing:e=>[{kzqmXN:e==null?e:`astryx5lhr3w`,$$css:!0},{"--x-width":(e=>typeof e==`number`?e+`px`:e??void 0)(e)}]},y.displayName=`LayoutPanel`,y.__docgenInfo={description:`Sidebar or side panel for Layout. Use in the \`start\` slot for left navigation
or in the \`end\` slot for detail/inspector panels.
Renders with optional divider and context-aware padding.
Divider position is auto-detected based on which slot the panel is in.

Already provides its own padding and scroll — don't add padding or
overflow to children. Use \`padding={0}\` if you need edge-to-edge content.

@example
\`\`\`
<LayoutContainer variant="card">
  <Layout
    start={
      <LayoutPanel hasDivider role="navigation">
        <Navigation />
      </LayoutPanel>
    }
    content={<LayoutContent>Main content</LayoutContent>}
    end={
      <LayoutPanel hasDivider role="complementary">
        <Sidebar />
      </LayoutPanel>
    }
  />
</LayoutContainer>
\`\`\``,methods:[],displayName:`LayoutPanel`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:``},children:{required:!1,tsType:{name:`ReactNode`},description:`Content to render inside the panel.`},hasDivider:{required:!1,tsType:{name:`boolean`},description:`Adds a themed border on the appropriate edge.
- Start panel: border on end edge (right in LTR)
- End panel: border on start edge (left in LTR)
When false, spacing collapse is applied automatically for seamless visual flow.

Note: When using \`resizable\` with an adjacent \`ResizeHandle hasDivider\`,
set this to \`false\` to avoid a double-line artifact.
@default false`,defaultValue:{value:`false`,computed:!1}},padding:{required:!1,tsType:{name:`union`,raw:`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`0.5`},{name:`literal`,value:`1`},{name:`literal`,value:`1.5`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`},{name:`literal`,value:`8`},{name:`literal`,value:`10`}]},description:`Internal padding of the panel using the spacing scale.
Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
Overrides the default padding from the layout container.`},isScrollable:{required:!1,tsType:{name:`boolean`},description:`Enables scrollable overflow for the panel.
Set to false for auto-height layouts where sticky positioning
needs to work with parent containers.
@default true`,defaultValue:{value:`true`,computed:!1}},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the landmark.
Required when role is set and multiple landmarks of the same type exist.`},role:{required:!1,tsType:{name:`AriaRole`},description:`ARIA landmark role for accessibility.
Use 'navigation' or 'complementary' only for top-level layouts (not nested).`},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Width of the panel.
Numbers are treated as pixels, strings are used as-is.
When \`resizable\` is provided, this is ignored — the hook controls width.`},resizable:{required:!1,tsType:{name:`ResizableProps`},description:`Resize props from \`useResizable()\`. When provided, the panel width
is driven by the hook and a resize handle should be placed adjacent
to this panel.

@example
\`\`\`
const sidebar = useResizable({ defaultSize: 250, minSizePx: 200 });
<LayoutPanel resizable={sidebar.props}>
  <Navigation />
</LayoutPanel>
<ResizeHandle resizable={sidebar.props} />
\`\`\``},hideBelow:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md' | 'lg' | 'xl'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`},{name:`literal`,value:`'lg'`},{name:`literal`,value:`'xl'`}]},description:`Hides the panel below the given viewport-width breakpoint via a CSS
media query (no runtime measurement). The panel stays mounted, so
server-rendered HTML and client hydration always agree; use this
instead of a hand-rolled useMediaQuery + conditional render.

Breakpoints: \`sm\` = 640px, \`md\` = 768px, \`lg\` = 1024px, \`xl\` = 1280px.

When combined with \`resizable\`, hiding wins below the breakpoint.

@example
\`\`\`
<Layout
  content={<LayoutContent>Main content</LayoutContent>}
  end={
    <LayoutPanel width={340} hideBelow="lg">
      <Inspector />
    </LayoutPanel>
  }
/>
\`\`\``}},composes:[`Omit`]}}));export{T as n,y as t};