import{ah as d,a1 as R,a6 as $,af as z,ay as E}from"./iframe-CF49Wwf0.js";import{a as q,d as T}from"./LayoutContent-TLpWZjCe.js";import{c as Z,a as W,b as j,f as B}from"./padding.stylex-Dl2_Pyt1.js";const n={panel:{kB7OPa:"astryx9f619",kmuXW:"astryx2lah0s",kVQacm:"astryx7giv3",kZCmMZ:"astryxwjyata",kwRFfy:"astryx1peupej",kLKAdn:"astryxqty4a",kGO01o:"astryxg476vw","--container-padding-inline-start":"astryx408pgh","--container-padding-inline-end":"astryxikqloz","--container-padding-block-start":"astryxjmgx01","--container-padding-block-end":"astryxi9ns85",$$css:!0},startPanel:{kZCmMZ:"astryx139j0dd",kE3dHu:null,kpe85a:null,$$css:!0},endPanel:{kwRFfy:"astryxpc6k2p",kE3dHu:null,kpe85a:null,$$css:!0},noHeader:{kLKAdn:"astryx81pis9",$$css:!0},noFooter:{kGO01o:"astryxon7vh3",$$css:!0},fullBleed:{kZCmMZ:"astryx1c1uobl",kwRFfy:"astryxyri2b",kE3dHu:null,kpe85a:null,kLKAdn:"astryxexx8yu",kGO01o:"astryx18d9i69","--container-padding-inline-start":"astryxrhngw9","--container-padding-inline-end":"astryxjsfl84","--container-padding-block-start":"astryx1047aw6","--container-padding-block-end":"astryxax9j7h",$$css:!0},scrollable:{kVQacm:"astryxysyzu8",kXHlph:null,kORKVm:null,$$css:!0},dividerEnd:{ke9TFa:"astryx1lun4ml",kZ1KPB:null,kWqL5O:null,k8ry5P:"astryx18b5jzi",k4WBpm:null,kSWEuD:null,kBCPoo:"astryx1gejf6u",kaZRDh:null,k26BEO:null,$$css:!0},dividerStart:{k2ei4v:"astryxpilrb4",kZ1KPB:null,kWqL5O:null,kVhnKS:"astryx1t7ytsu",k4WBpm:null,kSWEuD:null,kGJrpR:"astryx1j92z86",kaZRDh:null,k26BEO:null,$$css:!0},collapseStart:{keTefX:"astryx1wim8z0",koQZXg:null,km5ZXQ:null,$$css:!0},collapseEnd:{k71WvV:"astryx1kpg4um",koQZXg:null,km5ZXQ:null,$$css:!0}},C={sizing:l=>[{kzqmXN:l!=null?"astryx5lhr3w":l,$$css:!0},{"--x-width":(a=>typeof a=="number"?a+"px":a??void 0)(l)}]};function u({children:l,hasDivider:a=!1,isScrollable:p=!0,label:c,padding:e,role:y,width:m,resizable:i,xstyle:f,className:h,style:k,ref:x,...v}){const o=d.use(q),{hasHeader:g,hasFooter:b}=d.use(T),P=i?i._size:m,s=o==="start",r=o==="end",t=e===0,S=!a&&!t&&e==null,w=s?n.dividerEnd:r?n.dividerStart:null,L=s?n.collapseEnd:r?n.collapseStart:null;return R.jsx("div",{ref:x,role:y,"aria-label":c,...$(E("layout-panel"),z(n.panel,C.sizing(P??null),s&&!t&&e==null&&n.startPanel,r&&!t&&e==null&&n.endPanel,!g&&!t&&e==null&&n.noHeader,!b&&!t&&e==null&&n.noFooter,p&&n.scrollable,t&&n.fullBleed,e!=null&&B[e],e!=null&&j[e],e!=null&&W[e],e!=null&&Z[e],a&&w,S&&L,f),h,k),...v,children:l})}u.displayName="LayoutPanel";u.__docgenInfo={description:`Sidebar or side panel for Layout. Use in the \`start\` slot for left navigation
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
\`\`\``,methods:[],displayName:"LayoutPanel",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:""},children:{required:!1,tsType:{name:"ReactNode"},description:"Content to render inside the panel."},hasDivider:{required:!1,tsType:{name:"boolean"},description:`Adds a themed border on the appropriate edge.
- Start panel: border on end edge (right in LTR)
- End panel: border on start edge (left in LTR)
When false, spacing collapse is applied automatically for seamless visual flow.

Note: When using \`resizable\` with an adjacent \`ResizeHandle hasDivider\`,
set this to \`false\` to avoid a double-line artifact.
@default false`,defaultValue:{value:"false",computed:!1}},padding:{required:!1,tsType:{name:"union",raw:"0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10",elements:[{name:"literal",value:"0"},{name:"literal",value:"0.5"},{name:"literal",value:"1"},{name:"literal",value:"1.5"},{name:"literal",value:"2"},{name:"literal",value:"3"},{name:"literal",value:"4"},{name:"literal",value:"5"},{name:"literal",value:"6"},{name:"literal",value:"8"},{name:"literal",value:"10"}]},description:`Internal padding of the panel using the spacing scale.
Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
Overrides the default padding from the layout container.`},isScrollable:{required:!1,tsType:{name:"boolean"},description:`Enables scrollable overflow for the panel.
Set to false for auto-height layouts where sticky positioning
needs to work with parent containers.
@default true`,defaultValue:{value:"true",computed:!1}},label:{required:!1,tsType:{name:"string"},description:`Accessible label for the landmark.
Required when role is set and multiple landmarks of the same type exist.`},role:{required:!1,tsType:{name:"AriaRole"},description:`ARIA landmark role for accessibility.
Use 'navigation' or 'complementary' only for top-level layouts (not nested).`},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:"Width of the panel.\nNumbers are treated as pixels, strings are used as-is.\nWhen `resizable` is provided, this is ignored — the hook controls width."},resizable:{required:!1,tsType:{name:"ResizableProps"},description:`Resize props from \`useResizable()\`. When provided, the panel width
is driven by the hook and a resize handle should be placed adjacent
to this panel.

@example
\`\`\`
const sidebar = useResizable({ defaultSize: 250, minSizePx: 200 });
<LayoutPanel resizable={sidebar.props}>
  <Navigation />
</LayoutPanel>
<ResizeHandle resizable={sidebar.props} />
\`\`\``}},composes:["Omit"]};export{u as L};
