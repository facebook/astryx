import{ah as i,a1 as t,af as c,a6 as R,ay as A}from"./iframe-BzSUXdLu.js";import{s as q}from"./stack.stylex-BlarxY2N.js";import{s as H}from"./stackItem.stylex-CgqrJM4N.js";import{l as M,d as O,c as I,a as Z,b as F,f as W}from"./padding.stylex-Dl2_Pyt1.js";const P=i.createContext(null);P.displayName="LayoutAreaContext";const X={hasHeader:!1,hasFooter:!1,hasStart:!1,hasEnd:!1},L=i.createContext(X);L.displayName="LayoutSlotsContext";const N=i.createContext(null);N.displayName="LayoutDividerContext";const o={layoutOuter:{keTefX:"astryxojxgvx",k71WvV:"astryx1fcf3bl",keoZOQ:"astryx1sa9bsh",k1K539:"astryx6h7pi7",$$css:!0},layoutInner:{"--container-padding-inline-start":"astryxrhngw9","--container-padding-inline-end":"astryxjsfl84","--container-padding-block-start":"astryx1047aw6","--container-padding-block-end":"astryxax9j7h",$$css:!0},fill:{kZKoxP:"astryx12qplqi",kskxy:"astryxenllk4",$$css:!0},auto:{kAzted:"astryx1us19tq",$$css:!0},middle:{kUk6DE:"astryx98rzlu",kzQI83:null,kmuXW:null,kCS8Yb:null,kAzted:"astryx2lwn1j",$$css:!0},fullBleed:{"--layout-padding-outer-x":"astryx1wbjvqu","--layout-padding-outer-y":"astryxzxxx64",$$css:!0}},B={"--layout-content-width":"astryx4906uf",$$css:!0},U={kzqmXN:"astryxh8yej3",kUOVxO:"astryxvueqy4",keTefX:"",koQZXg:"",k71WvV:"",km5ZXQ:"",$$css:!0},j={contentWidthVar:n=>[B,{"--x---layout-content-width":`${n}px`!=null?`${n}px`:void 0}],contentWidth:n=>[U,{ks0D6T:n!=null?"astryxf68679":n,$$css:!0},{"--x-maxWidth":(a=>typeof a=="number"?a+"px":a??void 0)(n)}]};function u({area:n,children:a}){return a==null?null:t.jsx(P,{value:n,children:a})}function E({children:n,content:a,contentWidth:e,defaultHasDividers:d,end:y,footer:p,header:m,height:h="fill",padding:l,ref:x,start:f,xstyle:v,className:g,style:k}){const r=h==="fill",z=a??n,b=i.useMemo(()=>d!=null?{defaultHasDividers:d}:null,[d]),w=m!=null,C=p!=null,S=f!=null,$=y!=null,D=i.useMemo(()=>({hasHeader:w,hasFooter:C,hasStart:S,hasEnd:$}),[w,C,S,$]),T=t.jsx(L,{value:D,children:t.jsx("div",{ref:x,...R(A("layout",{height:h}),c(o.layoutOuter,r?o.fill:o.auto,v),g,k),children:t.jsxs("div",{...c({"astryx-default-marker":"astryx-default-marker",$$css:!0},o.layoutInner,...q({direction:"vertical"}),r?o.fill:o.auto,l===0&&o.fullBleed,l!=null&&M[l],l!=null&&O[l],e!=null&&j.contentWidthVar(e)),children:[t.jsx(u,{area:"header",children:m}),t.jsxs("div",{...c(...q({direction:"horizontal"}),o.middle,e!=null&&j.contentWidth(e)),children:[t.jsx(u,{area:"start",children:f}),t.jsx("div",{...c(...H({size:"fill"})),children:t.jsx(u,{area:"content",children:z})}),t.jsx(u,{area:"end",children:y})]}),t.jsx(u,{area:"footer",children:p})]})})});return b!=null?t.jsx(N,{value:b,children:T}):T}E.displayName="Layout";E.__docgenInfo={description:`Page shell with header, sidebar(s), content, and footer slots.
Use this for full-page layouts, app shells, dashboard layouts, or any UI
that needs a header bar, side navigation, scrollable content area, or action footer.
Can be used standalone for page-level layouts, or inside a container
(Card, Section) for content-level layouts.

Handles padding collapse between adjacent slots, scroll containment in the
content area, and automatic RTL support via CSS logical properties.

Structure:
\`\`\`
┌─────────────────────────────────────────┐
│                 header                  │
├──────┬─────────────────────────┬────────┤
│      │                         │        │
│start │        content          │  end   │
│      │                         │        │
├──────┴─────────────────────────┴────────┤
│                 footer                  │
└─────────────────────────────────────────┘
\`\`\`

When to use Layout vs raw flexbox:
- Page with a sidebar → Layout with \`start\` slot
- Dashboard with header + scrollable body → Layout with \`header\` + \`content\`
- Settings page with nav panel → Layout with \`start\` + \`content\`
- Simple vertical stack of items → use VStack instead

@example
\`\`\`
<Layout
  header={<LayoutHeader hasDivider>App Name</LayoutHeader>}
  start={
    <LayoutPanel hasDivider width={240} role="navigation">
      <Navigation />
    </LayoutPanel>
  }
  content={
    <LayoutContent role="main">
      <MainContent />
    </LayoutContent>
  }
/>
\`\`\``,methods:[],displayName:"Layout",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the root DOM element."},content:{required:!1,tsType:{name:"ReactNode"},description:"Main content area (center)."},contentWidth:{required:!1,tsType:{name:"number"},description:"Maximum width of the content within each slot (header, content, footer,\npanels). Dividers remain full-bleed. Content is centered with\n`margin-inline: auto` when narrower than the available space.\n\nAccepts any pixel value. Common page widths from internal patterns:\n- `640` — forms, settings, text-focused pages\n- `960` — content pages, component demos, wider layouts"},end:{required:!1,tsType:{name:"ReactNode"},description:"End panel slot (right in LTR, left in RTL)."},footer:{required:!1,tsType:{name:"ReactNode"},description:"Footer slot."},header:{required:!1,tsType:{name:"ReactNode"},description:"Header slot."},height:{required:!1,tsType:{name:"union",raw:"'fill' | 'auto'",elements:[{name:"literal",value:"'fill'"},{name:"literal",value:"'auto'"}]},description:"Controls the height behavior:\n- `fill`: Layout fills container height, content scrolls internally (default)\n- `auto`: Layout grows with content, container/page scrolls\n@default 'fill'",defaultValue:{value:"'fill'",computed:!1}},padding:{required:!1,tsType:{name:"union",raw:"0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10",elements:[{name:"literal",value:"0"},{name:"literal",value:"0.5"},{name:"literal",value:"1"},{name:"literal",value:"1.5"},{name:"literal",value:"2"},{name:"literal",value:"3"},{name:"literal",value:"4"},{name:"literal",value:"5"},{name:"literal",value:"6"},{name:"literal",value:"8"},{name:"literal",value:"10"}]},description:"Padding at the layout's outer edges using the spacing scale.\nControls both `--layout-padding-outer-x` and `--layout-padding-outer-y`.\nAccepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10."},start:{required:!1,tsType:{name:"ReactNode"},description:"Start panel slot (left in LTR, right in RTL)."},defaultHasDividers:{required:!1,tsType:{name:"boolean"},description:"Default divider visibility for LayoutHeader and LayoutFooter children.\nWhen set, headers/footers that don't explicitly pass `hasDivider` will use this value.\nWhen not set, nested layouts inherit from their parent context."},className:{required:!1,tsType:{name:"string"},description:"CSS class name(s) appended to the root element."},style:{required:!1,tsType:{name:"ReactCSSProperties",raw:"React.CSSProperties"},description:"Inline styles to apply to the root element."},children:{required:!1,tsType:{name:"ReactNode"},description:"Children are a shorthand for the `content` slot:\n`<Layout>{main}</Layout>` is equivalent to `<Layout content={main} />`.\nThe surrounding zones (`header`/`start`/`end`/`footer`) stay explicit\nprops. If both `content` and `children` are provided, `content` wins.\nAccepting children keeps the natural `<Layout>…</Layout>` form from\nrendering a blank shell."}},composes:["Omit"]};const s={content:{kB7OPa:"astryx9f619",kZKoxP:"astryx5yr21d",kUk6DE:"astryx98rzlu",kAzted:"astryx2lwn1j",kVQacm:"astryx7giv3",kZCmMZ:"astryxwjyata",kwRFfy:"astryx1peupej",kLKAdn:"astryxqty4a astryx1u0vwcr",kGO01o:"astryxg476vw astryx307h6p","--container-padding-inline-start":"astryx408pgh","--container-padding-inline-end":"astryxikqloz","--container-padding-block-start":"astryxjmgx01","--container-padding-block-end":"astryxi9ns85",$$css:!0},noStart:{kZCmMZ:"astryx139j0dd","--container-padding-inline-start":"astryxdvaxxn","--container-padding-inline-end":"astryxqpvj4r",$$css:!0},noEnd:{kwRFfy:"astryxpc6k2p",$$css:!0},noHeader:{kLKAdn:"astryx81pis9","--container-padding-block-start":"astryxzz8v79",$$css:!0},noFooter:{kGO01o:"astryxon7vh3","--container-padding-block-end":"astryx1xjq73n",$$css:!0},scrollable:{kVQacm:"astryxysyzu8",$$css:!0},fullBleed:{kZCmMZ:"astryx1c1uobl",kwRFfy:"astryxyri2b",kLKAdn:"astryxexx8yu",kGO01o:"astryx18d9i69","--container-padding-inline-start":"astryxrhngw9","--container-padding-inline-end":"astryxjsfl84","--container-padding-block-start":"astryx1047aw6","--container-padding-block-end":"astryxax9j7h",$$css:!0}};function V({children:n,isScrollable:a=!0,padding:e,label:d,role:y,xstyle:p,className:m,style:h,ref:l,...x}){const{hasHeader:f,hasFooter:v,hasStart:g,hasEnd:k}=i.use(L),r=e===0;return t.jsx("div",{ref:l,role:y,"aria-label":d,...R(A("layout-content"),c(s.content,!g&&!r&&e==null&&s.noStart,!k&&!r&&e==null&&s.noEnd,!f&&!r&&e==null&&s.noHeader,!v&&!r&&e==null&&s.noFooter,a&&s.scrollable,r&&s.fullBleed,e!=null&&W[e],e!=null&&F[e],e!=null&&Z[e],e!=null&&I[e],p),m,h),...x,children:n})}V.displayName="LayoutContent";V.__docgenInfo={description:`Scrollable main content area for Layout. Wraps the primary body content
with automatic scroll containment and context-aware padding.

Already provides its own padding and scroll — don't add padding or
overflow to children. Use \`padding={0}\` if you need edge-to-edge content.

@example
\`\`\`
<LayoutContainer variant="card">
  <Layout
    header={<LayoutHeader>Title</LayoutHeader>}
    content={<LayoutContent>Main body content</LayoutContent>}
  />
</LayoutContainer>
<LayoutContainer variant="card">
  <Layout
    content={
      <LayoutContent padding={0}>
        <Table />
      </LayoutContent>
    }
  />
</LayoutContainer>
<LayoutContainer variant="card">
  <Layout
    content={
      <LayoutContent isScrollable={false}>
        <StickyElement />
      </LayoutContent>
    }
  />
</LayoutContainer>
\`\`\``,methods:[],displayName:"LayoutContent",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:""},children:{required:!1,tsType:{name:"ReactNode"},description:"Content to render inside the content area."},padding:{required:!1,tsType:{name:"union",raw:"0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10",elements:[{name:"literal",value:"0"},{name:"literal",value:"0.5"},{name:"literal",value:"1"},{name:"literal",value:"1.5"},{name:"literal",value:"2"},{name:"literal",value:"3"},{name:"literal",value:"4"},{name:"literal",value:"5"},{name:"literal",value:"6"},{name:"literal",value:"8"},{name:"literal",value:"10"}]},description:`Internal padding of the content area using the spacing scale.
Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
Overrides the default padding from the layout container.`},isScrollable:{required:!1,tsType:{name:"boolean"},description:`Enables scrollable overflow for the content area.
Set to false for auto-height layouts where sticky positioning
needs to work with parent containers.
@default true`,defaultValue:{value:"true",computed:!1}},label:{required:!1,tsType:{name:"string"},description:`Accessible label for the landmark.
Required when role is set and multiple landmarks of the same type exist.`},role:{required:!1,tsType:{name:"AriaRole"},description:`ARIA landmark role for accessibility.
Use 'main' only for the primary content area of the page (not in nested layouts).`}},composes:["Omit"]};export{E as L,P as a,V as b,N as c,L as d};
