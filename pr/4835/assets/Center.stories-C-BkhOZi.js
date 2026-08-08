import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{n as t,t as n}from"./stylex-Dft6gtPK.js";import{n as r}from"./mergeProps-JRyAvMxc.js";import{n as i,t as a}from"./themeProps-CREkzZh6.js";import{n as o,t as s}from"./Text-BfjtEFtP.js";import{c,i as l,s as u}from"./padding.stylex-8xQ788av.js";import{t as d}from"./jsx-runtime-DeHZSEgm.js";import{n as f,t as p}from"./Icon-C24cO4CC.js";import{n as m,t as h}from"./Card-270yxekz.js";import{n as g,t as _}from"./Section-BQJsZyZZ.js";import{n as v,t as y}from"./CheckCircleIcon-C9B48rkv.js";function b({axis:e=`both`,width:n,height:a,maxWidth:o,minHeight:s,padding:l,paddingInline:d,paddingBlock:f,isInline:p=!1,children:m,xstyle:h,className:g,style:_,ref:v,...y}){let b=d??l,w=f??l,T=r(i(`center`,{axis:e}),t(p?S.inline:S.base,(e===`both`||e===`vertical`)&&S.alignItemsCenter,(e===`both`||e===`horizontal`)&&S.justifyContentCenter,C.sizing(n??null,a??null,o??null,s??null),b!=null&&c[b],w!=null&&u[w],h),g,_);return(0,x.jsx)(`div`,{ref:v,...T,...y,children:m})}var x,S,C;function w(){return(w=e((()=>{n(),l(),a(),x=d(),S={base:{k1xSpc:`astryx78zum5`,$$css:!0},inline:{k1xSpc:`astryx3nfvp2`,$$css:!0},alignItemsCenter:{kGNEyG:`astryx6s0dn4`,$$css:!0},justifyContentCenter:{kjj79g:`astryxl56j7k`,$$css:!0}},C={sizing:(e,t,n,r)=>[{kzqmXN:e==null?e:`astryx5lhr3w`,kZKoxP:t==null?t:`astryx16ye13r`,ks0D6T:n==null?n:`astryxf68679`,kAzted:r==null?r:`astryx82snj4`,$$css:!0},{"--x-width":(e=>typeof e==`number`?e+`px`:e??void 0)(e),"--x-height":(e=>typeof e==`number`?e+`px`:e??void 0)(t),"--x-maxWidth":(e=>typeof e==`number`?e+`px`:e??void 0)(n),"--x-minHeight":(e=>typeof e==`number`?e+`px`:e??void 0)(r)}]},b.displayName=`Center`,b.__docgenInfo={description:`Center component for centering children horizontally and/or vertically.

Uses flexbox for centering. By default, centers on both axes.
Use the \`axis\` prop to center on only one axis.

@example
\`\`\`
<Center width={300} height={200}>
  <Content />
</Center>
\`\`\``,methods:[],displayName:`Center`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},axis:{required:!1,tsType:{name:`union`,raw:`'both' | 'horizontal' | 'vertical'`,elements:[{name:`literal`,value:`'both'`},{name:`literal`,value:`'horizontal'`},{name:`literal`,value:`'vertical'`}]},description:"Center axis - which direction(s) to center.\n- `both`: Center both horizontally and vertically (default)\n- `horizontal`: Center horizontally only (justifyContent: center)\n- `vertical`: Center vertically only (alignItems: center)\n@default 'both'",defaultValue:{value:`'both'`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Width of the container.
Numbers are treated as pixels, strings are used as-is (e.g., '100%').`},height:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Height of the container.
Numbers are treated as pixels, strings are used as-is (e.g., '100%').`},maxWidth:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Maximum width of the container.
Numbers are treated as pixels, strings are used as-is (e.g., '100%').`},minHeight:{required:!1,tsType:{name:`union`,raw:`number | string`,elements:[{name:`number`},{name:`string`}]},description:`Minimum height of the container.
Numbers are treated as pixels, strings are used as-is (e.g., '100%').`},padding:{required:!1,tsType:{name:`union`,raw:`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`0.5`},{name:`literal`,value:`1`},{name:`literal`,value:`1.5`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`},{name:`literal`,value:`8`},{name:`literal`,value:`10`}]},description:"Inner padding on all sides, using the spacing scale.\nAccepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.\n\nMatches the `padding` prop on `Stack`, `Card`, `LayoutContent`, and `LayoutPanel`."},paddingInline:{required:!1,tsType:{name:`union`,raw:`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`0.5`},{name:`literal`,value:`1`},{name:`literal`,value:`1.5`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`},{name:`literal`,value:`8`},{name:`literal`,value:`10`}]},description:"Inline (horizontal) padding, using the spacing scale.\nOverrides `padding` on the inline axis when both are set."},paddingBlock:{required:!1,tsType:{name:`union`,raw:`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10`,elements:[{name:`literal`,value:`0`},{name:`literal`,value:`0.5`},{name:`literal`,value:`1`},{name:`literal`,value:`1.5`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`},{name:`literal`,value:`5`},{name:`literal`,value:`6`},{name:`literal`,value:`8`},{name:`literal`,value:`10`}]},description:"Block (vertical) padding, using the spacing scale.\nOverrides `padding` on the block axis when both are set."},isInline:{required:!1,tsType:{name:`boolean`},description:`Whether to make the container inline-flex (useful for text/icons).
@default false`,defaultValue:{value:`false`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:`Content to render inside the center container.`}},composes:[`Omit`]}})))()}var T,E,D,O,k,A,j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{w(),m(),g(),f(),o(),v(),T=d(),E={iconWrapper:{kWkggS:`x1o0wnni`,kMwMTN:`x1vvqiwl`,kmVPX3:`xlsj2fj`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kaIpWk:`xh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},paddingOutline:{kMzoRj:`xmkeg23`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`xbsl7fq`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kVAM5u:`x1w9ec3u`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kaIpWk:`xh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0}},D=({children:e})=>(0,T.jsx)(`div`,{className:`x1o0wnni x1vvqiwl xmkeg23 x1y0btm7 xlee4gx x1na6nto xm7rs69 xh6dtrn xk50ysn`,children:e}),O={title:`Core/Center`,component:b,tags:[`autodocs`],argTypes:{axis:{control:`select`,options:[`both`,`horizontal`,`vertical`],description:`Which direction(s) to center`},width:{control:`text`,description:`Width of the container (number for px, string for any unit)`},height:{control:`text`,description:`Height of the container (number for px, string for any unit)`},isInline:{control:`boolean`,description:`Whether to render as inline-flex`},padding:{control:`select`,options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:`Inner padding on all sides (spacing step)`},paddingInline:{control:`select`,options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:`Inline (horizontal) padding; overrides padding on that axis`},paddingBlock:{control:`select`,options:[0,.5,1,1.5,2,3,4,5,6,8,10],description:`Block (vertical) padding; overrides padding on that axis`}}},k={args:{axis:`both`,width:`100%`,height:200,children:null},render:e=>(0,T.jsx)(_,{variant:`muted`,width:`100%`,children:(0,T.jsx)(b,{...e,children:(0,T.jsx)(D,{children:`Centered Content`})})})},A={args:{axis:`horizontal`,width:`100%`,children:null},render:e=>(0,T.jsx)(_,{variant:`muted`,width:`100%`,children:(0,T.jsx)(b,{...e,children:(0,T.jsx)(D,{children:`Horizontal Center`})})})},j={args:{axis:`vertical`,height:150,width:`100%`,children:null},render:e=>(0,T.jsx)(_,{variant:`muted`,width:`100%`,children:(0,T.jsx)(b,{...e,children:(0,T.jsx)(D,{children:`Vertical Center`})})})},M={args:{axis:`both`,width:`100%`,height:300,children:null},render:e=>(0,T.jsx)(_,{variant:`muted`,children:(0,T.jsx)(b,{...e,children:(0,T.jsx)(D,{children:`Full Width, Fixed Height`})})})},N={args:{isInline:!0,children:null},render:e=>(0,T.jsx)(_,{variant:`muted`,children:(0,T.jsx)(h,{children:(0,T.jsxs)(s,{type:`body`,children:[`Text with inline centered icon:`,` `,(0,T.jsx)(b,{...e,xstyle:E.iconWrapper,children:(0,T.jsx)(p,{icon:y,size:`sm`})}),` `,`and more text after.`]})})})},P={args:{axis:`both`,width:300,height:200,children:null},render:e=>(0,T.jsx)(_,{variant:`muted`,children:(0,T.jsx)(b,{...e,children:(0,T.jsx)(`div`,{className:`x1o0wnni x1vvqiwl xlsj2fj xh6dtrn`,children:(0,T.jsx)(p,{icon:y,size:`lg`})})})})},F={args:{height:150,children:null},render:e=>(0,T.jsx)(_,{variant:`muted`,children:(0,T.jsx)(h,{children:(0,T.jsx)(b,{...e,children:(0,T.jsx)(D,{children:`Centered in Card`})})})})},I={args:{axis:`both`,width:`100%`,height:200,padding:4,children:null},render:e=>(0,T.jsx)(_,{variant:`muted`,width:`100%`,children:(0,T.jsx)(b,{...e,xstyle:E.paddingOutline,children:(0,T.jsx)(`div`,{className:`xh8yej3 x5yr21d`,children:(0,T.jsx)(D,{children:`Inset by padding on the spacing scale`})})})})},L={args:{children:null},render:()=>(0,T.jsx)(_,{variant:`muted`,children:(0,T.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,T.jsxs)(h,{children:[(0,T.jsx)(s,{type:`supporting`,display:`block`,children:`axis: both (default)`}),(0,T.jsx)(b,{axis:`both`,width:300,height:150,children:(0,T.jsx)(D,{children:`Both Axes`})})]}),(0,T.jsxs)(h,{children:[(0,T.jsx)(s,{type:`supporting`,display:`block`,children:`axis: horizontal`}),(0,T.jsx)(b,{axis:`horizontal`,width:300,children:(0,T.jsx)(D,{children:`Horizontal Only`})})]}),(0,T.jsxs)(h,{children:[(0,T.jsx)(s,{type:`supporting`,display:`block`,children:`axis: vertical`}),(0,T.jsx)(b,{axis:`vertical`,height:150,children:(0,T.jsx)(D,{children:`Vertical Only`})})]})]})})},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    axis: 'both',
    width: '100%',
    height: 200,
    children: null
  },
  render: args => <Section variant="muted" width="100%">
      <Center {...args}>
        <Box>Centered Content</Box>
      </Center>
    </Section>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    axis: 'horizontal',
    width: '100%',
    children: null
  },
  render: args => <Section variant="muted" width="100%">
      <Center {...args}>
        <Box>Horizontal Center</Box>
      </Center>
    </Section>
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    axis: 'vertical',
    height: 150,
    width: '100%',
    children: null
  },
  render: args => <Section variant="muted" width="100%">
      <Center {...args}>
        <Box>Vertical Center</Box>
      </Center>
    </Section>
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    axis: 'both',
    width: '100%',
    height: 300,
    children: null
  },
  render: args => <Section variant="muted">
      <Center {...args}>
        <Box>Full Width, Fixed Height</Box>
      </Center>
    </Section>
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    isInline: true,
    children: null
  },
  render: args => <Section variant="muted">
      <Card>
        <Text type="body">
          Text with inline centered icon:{' '}
          <Center {...args} xstyle={styles.iconWrapper}>
            <Icon icon={CheckCircleIcon} size="sm" />
          </Center>{' '}
          and more text after.
        </Text>
      </Card>
    </Section>
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    axis: 'both',
    width: 300,
    height: 200,
    children: null
  },
  render: args => <Section variant="muted">
      <Center {...args}>
        <div {...stylex.props(styles.iconWrapper)}>
          <Icon icon={CheckCircleIcon} size="lg" />
        </div>
      </Center>
    </Section>
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    height: 150,
    children: null
  },
  render: args => <Section variant="muted">
      <Card>
        <Center {...args}>
          <Box>Centered in Card</Box>
        </Center>
      </Card>
    </Section>
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    axis: 'both',
    width: '100%',
    height: 200,
    padding: 4,
    children: null
  },
  render: args => <Section variant="muted" width="100%">
      <Center {...args} xstyle={styles.paddingOutline}>
        <div {...stylex.props(styles.fillArea)}>
          <Box>Inset by padding on the spacing scale</Box>
        </div>
      </Center>
    </Section>
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  },
  render: () => <Section variant="muted">
      <div {...stylex.props(styles.storyWrapper)}>
        <Card>
          <Text type="supporting" display="block">
            axis: both (default)
          </Text>
          <Center axis="both" width={300} height={150}>
            <Box>Both Axes</Box>
          </Center>
        </Card>
        <Card>
          <Text type="supporting" display="block">
            axis: horizontal
          </Text>
          <Center axis="horizontal" width={300}>
            <Box>Horizontal Only</Box>
          </Center>
        </Card>
        <Card>
          <Text type="supporting" display="block">
            axis: vertical
          </Text>
          <Center axis="vertical" height={150}>
            <Box>Vertical Only</Box>
          </Center>
        </Card>
      </div>
    </Section>
}`,...L.parameters?.docs?.source}}},R=[`Default`,`HorizontalOnly`,`VerticalOnly`,`FullSize`,`Inline`,`WithIcon`,`InsideACard`,`Padding`,`AllAxisModes`]})))()}z();export{L as AllAxisModes,k as Default,M as FullSize,A as HorizontalOnly,N as Inline,F as InsideACard,I as Padding,j as VerticalOnly,P as WithIcon,R as __namedExportsOrder,O as default};