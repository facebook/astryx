import{a1 as x,a6 as b,af as h,ay as v}from"./iframe-BAsU9Dt9.js";import{c as S}from"./container.stylex-uilBL6DE.js";import{f as $,b as w,a as C,c as T,g as W}from"./padding.stylex-Dl2_Pyt1.js";const o={card:{"--_card-radius":"astryx2kkz0m",kaIpWk:"astryx153u1i6",kVQacm:"astryx7giv3",kMzoRj:"astryx1litavf",ksu8eU:"astryx1y0btm7",kVAM5u:"astryx9r1u3d",$$css:!0},withBorder:{kVAM5u:"astryxvy26l8",kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,$$css:!0},scrollable:{kVQacm:"astryxysyzu8",kXHlph:null,kORKVm:null,$$css:!0}},q={default:{kWkggS:"astryx1de1mus",$$css:!0},transparent:{kWkggS:"astryxjbqb8w",$$css:!0},muted:{kWkggS:"astryxwmxj5m",$$css:!0},blue:{kWkggS:"astryx1o0wnni",$$css:!0},cyan:{kWkggS:"astryx1rgj867",$$css:!0},gray:{kWkggS:"astryxspzpui",$$css:!0},green:{kWkggS:"astryx1sqjeoo",$$css:!0},orange:{kWkggS:"astryx1e9xt6e",$$css:!0},pink:{kWkggS:"astryxnpoty2",$$css:!0},purple:{kWkggS:"astryx16i6n6f",$$css:!0},red:{kWkggS:"astryx1cibrc5",$$css:!0},teal:{kWkggS:"astryx1jtji5o",$$css:!0},yellow:{kWkggS:"astryx1bo7t0x",$$css:!0}},L={sizing:(t,n,r,s)=>[{kzqmXN:t!=null?"astryx5lhr3w":t,kZKoxP:n!=null?"astryx16ye13r":n,ks0D6T:r!=null?"astryxf68679":r,kAzted:s!=null?"astryx82snj4":s,$$css:!0},{"--x-width":(e=>typeof e=="number"?e+"px":e??void 0)(t),"--x-height":(e=>typeof e=="number"?e+"px":e??void 0)(n),"--x-maxWidth":(e=>typeof e=="number"?e+"px":e??void 0)(r),"--x-minHeight":(e=>typeof e=="number"?e+"px":e??void 0)(s)}]};function m({width:t,height:n,maxWidth:r,minHeight:s,children:e,padding:d,variant:u="default",xstyle:c,className:p,style:y,ref:g,...k}){const f=n!=null&&n!=="auto",l=d==null,a=d??4,i=W[a];return x.jsx("div",{ref:g,...b(v("card",{variant:u}),h(o.card,q[u],u==="default"&&o.withBorder,f&&o.scrollable,L.sizing(t??null,n??null,r??null,s??null),...S(l?{useThemeDefault:"card"}:{paddingInnerX:i,paddingInnerY:i,paddingOuterX:i,paddingOuterY:i}),!l&&a!==4&&$[a],!l&&a!==4&&w[a],!l&&a!==4&&C[a],!l&&a!==4&&T[a],c),p,y),...k,children:e})}m.displayName="Card";m.__docgenInfo={description:`A card container with border and themed styling.

Applies card-specific appearance (background, border, border-radius)
and sets CSS variables for child layout components.

@compositionHint Use as a top-level container for elevated content.
Pair with Layout for structured header/content/footer layouts.

@example
\`\`\`
<Card width={400} height={300}>
  <Layout
    header={<LayoutHeader hasDivider>Title</LayoutHeader>}
    content={<LayoutContent>Content</LayoutContent>}
    footer={<LayoutFooter hasDivider>Actions</LayoutFooter>}
  />
</Card>
\`\`\`

@example
\`\`\`
<Card variant="blue" width={300}>
  <p>Blue tinted card</p>
</Card>
\`\`\`

@example
\`\`\`
<Card variant="muted" width={300}>
  <p>Subtle de-emphasised card</p>
</Card>
\`\`\``,methods:[],displayName:"Card",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:""},className:{required:!1,tsType:{name:"string"},description:"CSS class name(s) appended to the root element."},style:{required:!1,tsType:{name:"ReactCSSProperties",raw:"React.CSSProperties"},description:"Inline styles to apply to the root element."},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:`Width of the card.
Numbers are treated as pixels, strings are used as-is.`},height:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:`Height of the card.
Numbers are treated as pixels, strings are used as-is.`},maxWidth:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:`Maximum width of the card.
Numbers are treated as pixels, strings are used as-is.`},minHeight:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:`Minimum height of the card.
Numbers are treated as pixels, strings are used as-is.`},children:{required:!1,tsType:{name:"ReactNode"},description:`Content to render inside the card.
Should typically be Layout child components.`},padding:{required:!1,tsType:{name:"union",raw:"0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10",elements:[{name:"literal",value:"0"},{name:"literal",value:"0.5"},{name:"literal",value:"1"},{name:"literal",value:"1.5"},{name:"literal",value:"2"},{name:"literal",value:"3"},{name:"literal",value:"4"},{name:"literal",value:"5"},{name:"literal",value:"6"},{name:"literal",value:"8"},{name:"literal",value:"10"}]},description:`Internal padding of the card using the spacing scale.
Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
@default 4 (16px)`},variant:{required:!1,tsType:{name:"union",raw:`| 'default'
| 'transparent'
| 'muted'
| 'blue'
| 'cyan'
| 'gray'
| 'green'
| 'orange'
| 'pink'
| 'purple'
| 'red'
| 'teal'
| 'yellow'`,elements:[{name:"literal",value:"'default'"},{name:"literal",value:"'transparent'"},{name:"literal",value:"'muted'"},{name:"literal",value:"'blue'"},{name:"literal",value:"'cyan'"},{name:"literal",value:"'gray'"},{name:"literal",value:"'green'"},{name:"literal",value:"'orange'"},{name:"literal",value:"'pink'"},{name:"literal",value:"'purple'"},{name:"literal",value:"'red'"},{name:"literal",value:"'teal'"},{name:"literal",value:"'yellow'"}]},description:"Background color variant.\n- `default`: standard card background with visible border\n- `transparent`: no background, no visible border — for grouping without visual weight\n- `muted`: subtle muted background for de-emphasised cards\n- Non-semantic: `blue`, `cyan`, `gray`, `green`, `orange`, `pink`, `purple`, `red`, `teal`, `yellow`\n@default 'default'",defaultValue:{value:"'default'",computed:!1}}},composes:["Omit"]};export{m as C};
