import{a6 as I,af as B,ay as W,a1 as e,T as y,I as C}from"./iframe-Cm6U1NA5.js";import{C as o}from"./Card-BFc6W2rj.js";import{S as s}from"./Section-CuO5Mj_m.js";import{F as f}from"./CheckCircleIcon-SaV3ercR.js";import"./preload-helper-Ct5FWWRu.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";const l={base:{k1xSpc:"astryx78zum5",$$css:!0},inline:{k1xSpc:"astryx3nfvp2",$$css:!0},alignItemsCenter:{kGNEyG:"astryx6s0dn4",$$css:!0},justifyContentCenter:{kjj79g:"astryxl56j7k",$$css:!0}},H={sizing:(n,a)=>[{kzqmXN:n!=null?"astryx5lhr3w":n,kZKoxP:a!=null?"astryx16ye13r":a,$$css:!0},{"--x-width":(t=>typeof t=="number"?t+"px":t??void 0)(n),"--x-height":(t=>typeof t=="number"?t+"px":t??void 0)(a)}]};function r({axis:n="both",width:a,height:t,isInline:j=!1,children:v,xstyle:b,className:k,style:w,ref:S,...z}){const T=I(W("center",{axis:n}),B(j?l.inline:l.base,(n==="both"||n==="vertical")&&l.alignItemsCenter,(n==="both"||n==="horizontal")&&l.justifyContentCenter,H.sizing(a??null,t??null),b),k,w);return e.jsx("div",{ref:S,...T,...z,children:v})}r.displayName="Center";r.__docgenInfo={description:`Center component for centering children horizontally and/or vertically.

Uses flexbox for centering. By default, centers on both axes.
Use the \`axis\` prop to center on only one axis.

@example
\`\`\`
<Center width={300} height={200}>
  <Content />
</Center>
\`\`\``,methods:[],displayName:"Center",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the root element"},axis:{required:!1,tsType:{name:"union",raw:"'both' | 'horizontal' | 'vertical'",elements:[{name:"literal",value:"'both'"},{name:"literal",value:"'horizontal'"},{name:"literal",value:"'vertical'"}]},description:"Center axis - which direction(s) to center.\n- `both`: Center both horizontally and vertically (default)\n- `horizontal`: Center horizontally only (justifyContent: center)\n- `vertical`: Center vertically only (alignItems: center)\n@default 'both'",defaultValue:{value:"'both'",computed:!1}},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:`Width of the container.
Numbers are treated as pixels, strings are used as-is (e.g., '100%').`},height:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:`Height of the container.
Numbers are treated as pixels, strings are used as-is (e.g., '100%').`},isInline:{required:!1,tsType:{name:"boolean"},description:`Whether to make the container inline-flex (useful for text/icons).
@default false`,defaultValue:{value:"false",computed:!1}},children:{required:!0,tsType:{name:"ReactNode"},description:"Content to render inside the center container."}},composes:["Omit"]};const q={iconWrapper:{kWkggS:"x1o0wnni",kMwMTN:"x1vvqiwl",kmVPX3:"xlsj2fj",kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kaIpWk:"xh6dtrn",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0}},i=({children:n})=>e.jsx("div",{className:"x1o0wnni x1vvqiwl xmkeg23 x1y0btm7 xlee4gx x1na6nto xm7rs69 xh6dtrn xk50ysn",children:n}),M={title:"Core/Center",component:r,tags:["autodocs"],argTypes:{axis:{control:"select",options:["both","horizontal","vertical"],description:"Which direction(s) to center"},width:{control:"text",description:"Width of the container (number for px, string for any unit)"},height:{control:"text",description:"Height of the container (number for px, string for any unit)"},isInline:{control:"boolean",description:"Whether to render as inline-flex"}}},d={args:{axis:"both",width:"100%",height:200,children:null},render:n=>e.jsx(s,{variant:"muted",width:"100%",children:e.jsx(r,{...n,children:e.jsx(i,{children:"Centered Content"})})})},c={args:{axis:"horizontal",width:"100%",children:null},render:n=>e.jsx(s,{variant:"muted",width:"100%",children:e.jsx(r,{...n,children:e.jsx(i,{children:"Horizontal Center"})})})},h={args:{axis:"vertical",height:150,width:"100%",children:null},render:n=>e.jsx(s,{variant:"muted",width:"100%",children:e.jsx(r,{...n,children:e.jsx(i,{children:"Vertical Center"})})})},x={args:{axis:"both",width:"100%",height:300,children:null},render:n=>e.jsx(s,{variant:"muted",children:e.jsx(r,{...n,children:e.jsx(i,{children:"Full Width, Fixed Height"})})})},u={args:{isInline:!0,children:null},render:n=>e.jsx(s,{variant:"muted",children:e.jsx(o,{children:e.jsxs(y,{type:"body",children:["Text with inline centered icon:"," ",e.jsx(r,{...n,xstyle:q.iconWrapper,children:e.jsx(C,{icon:f,size:"sm"})})," ","and more text after."]})})})},p={args:{axis:"both",width:300,height:200,children:null},render:n=>e.jsx(s,{variant:"muted",children:e.jsx(r,{...n,children:e.jsx("div",{className:"x1o0wnni x1vvqiwl xlsj2fj xh6dtrn",children:e.jsx(C,{icon:f,size:"lg"})})})})},m={args:{height:150,children:null},render:n=>e.jsx(s,{variant:"muted",children:e.jsx(o,{children:e.jsx(r,{...n,children:e.jsx(i,{children:"Centered in Card"})})})})},g={args:{children:null},render:()=>e.jsx(s,{variant:"muted",children:e.jsxs("div",{className:"x78zum5 xdt5ytf x1qh66ti",children:[e.jsxs(o,{children:[e.jsx(y,{type:"supporting",display:"block",children:"axis: both (default)"}),e.jsx(r,{axis:"both",width:300,height:150,children:e.jsx(i,{children:"Both Axes"})})]}),e.jsxs(o,{children:[e.jsx(y,{type:"supporting",display:"block",children:"axis: horizontal"}),e.jsx(r,{axis:"horizontal",width:300,children:e.jsx(i,{children:"Horizontal Only"})})]}),e.jsxs(o,{children:[e.jsx(y,{type:"supporting",display:"block",children:"axis: vertical"}),e.jsx(r,{axis:"vertical",height:150,children:e.jsx(i,{children:"Vertical Only"})})]})]})})};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};const E=["Default","HorizontalOnly","VerticalOnly","FullSize","Inline","WithIcon","InsideACard","AllAxisModes"];export{g as AllAxisModes,d as Default,x as FullSize,c as HorizontalOnly,u as Inline,m as InsideACard,h as VerticalOnly,p as WithIcon,E as __namedExportsOrder,M as default};
