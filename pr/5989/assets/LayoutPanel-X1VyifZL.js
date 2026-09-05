import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{D as r,E as i,F as a,P as o}from"./ime-Dy4QRKoo.js";import{a as s,c,o as l,s as u}from"./LayoutContent-CjhAeQWs.js";import{P as d,t as f}from"./utils-eYNPhPe_.js";import{t as p}from"./jsx-runtime-DqZldVDK.js";import{a as m,g as h,n as g,o as _,t as v}from"./padding.stylex-Hr1weLfK.js";function y({children:e,hasDivider:t=!1,height:n=`fill`,isScrollable:i=!0,label:o,padding:c,role:l,width:f,resizable:p,xstyle:_,className:y,style:w,ref:T,...E}){let D=(0,b.use)(u),{hasHeader:O,hasFooter:k}=(0,b.use)(s),A=p?p._size:f,j=D===`start`,M=D===`end`,N=c===0,P=!t&&!N&&c==null,F=j?S.dividerEnd:M?S.dividerStart:null,I=j?S.collapseEnd:M?S.collapseStart:null;return(0,x.jsx)(`div`,{ref:T,role:l,"aria-label":o,...d(r(`layout-panel`,{height:n}),a(n===`fill`?S.heightFill:S.heightAuto,S.panel,i?S.overflowScrollable:S.overflowStatic,C.sizing(A??null),j&&!N&&c==null&&S.startPanel,M&&!N&&c==null&&S.endPanel,!O&&!N&&c==null&&S.noHeader,!k&&!N&&c==null&&S.noFooter,N&&S.fullBleed,c!=null&&h[c],c!=null&&m[c],c!=null&&g[c],c!=null&&v[c],t&&F,P&&I,_),y,w),...E,"data-layout-region":`panel`,"data-layout-height":n,children:e})}var b,x,S,C,w=e((()=>{b=t(n(),1),o(),c(),l(),f(),i(),_(),x=p(),S={panel:{kB7OPa:`astryx9f619`,kmuXW:`astryx2lah0s`,kZCmMZ:`astryxwjyata`,kwRFfy:`astryx1peupej`,kLKAdn:`astryxqty4a`,kGO01o:`astryxg476vw`,"--container-padding-inline-start":`astryx408pgh`,"--container-padding-inline-end":`astryxikqloz`,"--container-padding-block-start":`astryxjmgx01`,"--container-padding-block-end":`astryxi9ns85`,$$css:!0},startPanel:{kZCmMZ:`astryx139j0dd`,kE3dHu:null,kpe85a:null,$$css:!0},endPanel:{kwRFfy:`astryxpc6k2p`,kE3dHu:null,kpe85a:null,$$css:!0},noHeader:{kLKAdn:`astryx81pis9`,$$css:!0},noFooter:{kGO01o:`astryxon7vh3`,$$css:!0},fullBleed:{kZCmMZ:`astryx1c1uobl`,kwRFfy:`astryxyri2b`,kE3dHu:null,kpe85a:null,kLKAdn:`astryxexx8yu`,kGO01o:`astryx18d9i69`,"--container-padding-inline-start":`astryxrhngw9`,"--container-padding-inline-end":`astryxjsfl84`,"--container-padding-block-start":`astryx1047aw6`,"--container-padding-block-end":`astryxax9j7h`,$$css:!0},heightFill:{kZKoxP:`astryx5yr21d`,kAzted:`astryx2lwn1j`,$$css:!0},heightAuto:{kZKoxP:`astryxt7dq6l`,kAzted:`astryx2lwn1j`,$$css:!0},overflowStatic:{kVQacm:`astryx7giv3`,$$css:!0},overflowScrollable:{kVQacm:`astryxysyzu8`,$$css:!0},dividerEnd:{ke9TFa:`astryx1lun4ml`,kZ1KPB:null,kWqL5O:null,k8ry5P:`astryx18b5jzi`,k4WBpm:null,kSWEuD:null,kBCPoo:`astryx1gejf6u`,kaZRDh:null,k26BEO:null,$$css:!0},dividerStart:{k2ei4v:`astryxpilrb4`,kZ1KPB:null,kWqL5O:null,kVhnKS:`astryx1t7ytsu`,k4WBpm:null,kSWEuD:null,kGJrpR:`astryx1j92z86`,kaZRDh:null,k26BEO:null,$$css:!0},collapseStart:{keTefX:`astryx1wim8z0`,koQZXg:null,km5ZXQ:null,$$css:!0},collapseEnd:{k71WvV:`astryx1kpg4um`,koQZXg:null,km5ZXQ:null,$$css:!0}},C={sizing:e=>[{kzqmXN:e==null?e:`astryx5lhr3w`,$$css:!0},{"--x-width":(e=>typeof e==`number`?e+`px`:e??void 0)(e)}]},y.displayName=`LayoutPanel`,y.__docgenInfo={description:`Sidebar or side panel for Layout. Use in the \`start\` slot for left navigation
or in the \`end\` slot for detail/inspector panels.
Renders with optional divider and context-aware padding.
Divider position is auto-detected based on which slot the panel is in.

Provides context-aware padding and controls height and overflow independently.
\`height="auto"\` moves the panel with a fill-height Layout's middle scrollport.
Don't add padding or overflow to children. Use \`padding={0}\` if you need
edge-to-edge content.

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
Auto-height panels stretch to the shared row's cross-size, so their divider
continues through the full middle region without creating a local scrollport.

Note: When using \`resizable\` with an adjacent \`ResizeHandle hasDivider\`,
set this to \`false\` to avoid a double-line artifact.
@default false`,defaultValue:{value:`false`,computed:!1}},padding:{required:!1,tsType:{name:`union`,raw:`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`0.5`},{name:`literal`,value:`1`},{name:`literal`,value:`1.5`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`},{name:`literal`,value:`8`},{name:`literal`,value:`10`}]},description:`Internal padding of the panel using the spacing scale.
Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
Overrides the default padding from the layout container.`},height:{required:!1,tsType:{name:`union`,raw:`'fill' | 'auto'`,elements:[{name:`literal`,value:`'fill'`},{name:`literal`,value:`'auto'`}]},description:`Controls this panel's block-axis sizing.
- \`fill\`: fills the Layout middle region (default).
- \`auto\`: content contributes its natural height to the shared row; the panel
  box stretches to that row so backgrounds and dividers remain continuous.
  In a fill-height Layout, the row moves with the middle scrollport.
@default 'fill'`,defaultValue:{value:`'fill'`,computed:!1}},isScrollable:{required:!1,tsType:{name:`boolean`},description:`Enables scrollable overflow for the panel.
Set to false for non-scrolling overflow behavior, including sticky
descendants that need the parent scroll container.
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
\`\`\``}},composes:[`Omit`]}}));export{w as n,y as t};