import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./stylex-Dft6gtPK.js";import{n as r}from"./mergeProps-JRyAvMxc.js";import{n as i,t as a}from"./themeProps-CREkzZh6.js";import{d as o,i as s,l as c,n as l,r as u,t as d}from"./padding.stylex-8xQ788av.js";import{t as f}from"./jsx-runtime-DeHZSEgm.js";import{n as p,t as m}from"./container.stylex-DnoPo82G.js";function h({width:e,height:n,maxWidth:a,minHeight:s,children:f,padding:p,variant:h=`default`,elevation:x=`none`,xstyle:S,className:C,style:w,ref:T,...E}){let D=n!=null&&n!==`auto`,O=p==null,k=p??4,A=o[k];return(0,g.jsx)(`div`,{ref:T,...r(i(`card`,{variant:h}),t(_.card,v[h],y[x],D&&_.scrollable,b.sizing(e??null,n??null,a??null,s??null),...m(O?{useThemeDefault:`card`}:{paddingInnerX:A,paddingInnerY:A,paddingOuterX:A,paddingOuterY:A}),!O&&k!==4&&c[k],!O&&k!==4&&u[k],!O&&k!==4&&l[k],!O&&k!==4&&d[k],h==="default"&&_.withBorder,S),C,w),...E,children:f})}var g,_,v,y,b;function x(){return(x=e((()=>{n(),p(),s(),a(),g=f(),_={card:{"--_card-radius":`astryx2kkz0m`,kaIpWk:`astryx153u1i6`,kVQacm:`astryx7giv3`,kGVxlE:`astryx1p8z4y0`,$$css:!0},withBorder:{kMzoRj:`astryx1litavf`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`astryx1y0btm7`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kVAM5u:`astryx14i3s5s`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kZCmMZ:`astryxs19ii7`,kwRFfy:`astryx12frdag`,kE3dHu:null,kpe85a:null,kLKAdn:`astryx1nex4ik`,kGO01o:`astryxbv1mwh`,$$css:!0},scrollable:{kVQacm:`astryxysyzu8`,kXHlph:null,kORKVm:null,$$css:!0}},v={default:{kWkggS:`astryx1de1mus`,$$css:!0},transparent:{kWkggS:`astryxjbqb8w`,$$css:!0},muted:{kWkggS:`astryxwmxj5m`,$$css:!0},blue:{kWkggS:`astryx1o0wnni`,$$css:!0},cyan:{kWkggS:`astryx1rgj867`,$$css:!0},gray:{kWkggS:`astryxspzpui`,$$css:!0},green:{kWkggS:`astryx1sqjeoo`,$$css:!0},orange:{kWkggS:`astryx1e9xt6e`,$$css:!0},pink:{kWkggS:`astryxnpoty2`,$$css:!0},purple:{kWkggS:`astryx16i6n6f`,$$css:!0},red:{kWkggS:`astryx1cibrc5`,$$css:!0},teal:{kWkggS:`astryx1jtji5o`,$$css:!0},yellow:{kWkggS:`astryx1bo7t0x`,$$css:!0}},y={none:{"--_card-elevation":`astryxw28qpl`,$$css:!0},low:{"--_card-elevation":`astryx1nn8khe`,$$css:!0},med:{"--_card-elevation":`astryx1ovzxg0`,$$css:!0},high:{"--_card-elevation":`astryxnpe7fx`,$$css:!0}},b={sizing:(e,t,n,r)=>[{kzqmXN:e==null?e:`astryx5lhr3w`,kZKoxP:t==null?t:`astryx16ye13r`,ks0D6T:n==null?n:`astryxf68679`,kAzted:r==null?r:`astryx82snj4`,$$css:!0},{"--x-width":(e=>typeof e==`number`?e+`px`:e??void 0)(e),"--x-height":(e=>typeof e==`number`?e+`px`:e??void 0)(t),"--x-maxWidth":(e=>typeof e==`number`?e+`px`:e??void 0)(n),"--x-minHeight":(e=>typeof e==`number`?e+`px`:e??void 0)(r)}]},h.displayName=`Card`,h.__docgenInfo={description:`A card container with border and themed styling.

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
\`\`\``,methods:[],displayName:`Card`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:``},className:{required:!1,tsType:{name:`string`},description:`CSS class name(s) appended to the root element.`},style:{required:!1,tsType:{name:`ReactCSSProperties`,raw:`React.CSSProperties`},description:`Inline styles to apply to the root element.`},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Width of the card.
Numbers are treated as pixels, strings are used as-is.`},height:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Height of the card.
Numbers are treated as pixels, strings are used as-is.`},maxWidth:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Maximum width of the card.
Numbers are treated as pixels, strings are used as-is.`},minHeight:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Minimum height of the card.
Numbers are treated as pixels, strings are used as-is.`},children:{required:!1,tsType:{name:`ReactNode`},description:`Content to render inside the card.
Should typically be Layout child components.`},padding:{required:!1,tsType:{name:`union`,raw:`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`0.5`},{name:`literal`,value:`1`},{name:`literal`,value:`1.5`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`},{name:`literal`,value:`8`},{name:`literal`,value:`10`}]},description:`Internal padding of the card using the spacing scale.
Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
@default 4 (16px)`},variant:{required:!1,tsType:{name:`union`,raw:`| 'default'
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
| 'yellow'`,elements:[{name:`literal`,value:`'default'`},{name:`literal`,value:`'transparent'`},{name:`literal`,value:`'muted'`},{name:`literal`,value:`'blue'`},{name:`literal`,value:`'cyan'`},{name:`literal`,value:`'gray'`},{name:`literal`,value:`'green'`},{name:`literal`,value:`'orange'`},{name:`literal`,value:`'pink'`},{name:`literal`,value:`'purple'`},{name:`literal`,value:`'red'`},{name:`literal`,value:`'teal'`},{name:`literal`,value:`'yellow'`}]},description:"Background color variant.\n- `default`: standard card background with visible border\n- `transparent`: no background, no visible border — for grouping without visual weight\n- `muted`: subtle muted background for de-emphasised cards\n- Non-semantic: `blue`, `cyan`, `gray`, `green`, `orange`, `pink`, `purple`, `red`, `teal`, `yellow`\n@default 'default'",defaultValue:{value:`'default'`,computed:!1}},elevation:{required:!1,tsType:{name:`union`,raw:`'none' | 'low' | 'med' | 'high'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'low'`},{name:`literal`,value:`'med'`},{name:`literal`,value:`'high'`}]},description:"Resting elevation — the shadow depth the card sits at.\n`none` is flat; `low`/`med`/`high` map to the shadow token scale.\n@default 'none'",defaultValue:{value:`'none'`,computed:!1}}},composes:[`Omit`]}})))()}export{x as n,h as t};