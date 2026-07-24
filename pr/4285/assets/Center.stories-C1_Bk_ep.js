import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Iat6xWeA.js";import{n as r,t as i}from"./Icon-Csbga5uN.js";import{n as a,t as o}from"./Card-B6hq5pd9.js";import{t as s}from"./Section-uPZCRnkC.js";import{t as c}from"./Section-C4pDrmx1.js";import{t as l}from"./Text-BUJwo4gL.js";import{li as u,ui as d}from"./iframe-BPhJd9TG.js";import{nn as f,t as p}from"./esm-DA7gAIBC.js";var m,h,g,_,v,y,b,x,S,C,w,T,E;e((()=>{u(),o(),c(),i(),l(),p(),m=t(),h={iconWrapper:{kWkggS:`x1o0wnni`,kMwMTN:`x1vvqiwl`,kmVPX3:`xlsj2fj`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kaIpWk:`xh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0}},g=({children:e})=>(0,m.jsx)(`div`,{className:`x1o0wnni x1vvqiwl xmkeg23 x1y0btm7 xlee4gx x1na6nto xm7rs69 xh6dtrn xk50ysn`,children:e}),_={title:`Core/Center`,component:d,tags:[`autodocs`],argTypes:{axis:{control:`select`,options:[`both`,`horizontal`,`vertical`],description:`Which direction(s) to center`},width:{control:`text`,description:`Width of the container (number for px, string for any unit)`},height:{control:`text`,description:`Height of the container (number for px, string for any unit)`},isInline:{control:`boolean`,description:`Whether to render as inline-flex`}}},v={args:{axis:`both`,width:`100%`,height:200,children:null},render:e=>(0,m.jsx)(s,{variant:`muted`,width:`100%`,children:(0,m.jsx)(d,{...e,children:(0,m.jsx)(g,{children:`Centered Content`})})})},y={args:{axis:`horizontal`,width:`100%`,children:null},render:e=>(0,m.jsx)(s,{variant:`muted`,width:`100%`,children:(0,m.jsx)(d,{...e,children:(0,m.jsx)(g,{children:`Horizontal Center`})})})},b={args:{axis:`vertical`,height:150,width:`100%`,children:null},render:e=>(0,m.jsx)(s,{variant:`muted`,width:`100%`,children:(0,m.jsx)(d,{...e,children:(0,m.jsx)(g,{children:`Vertical Center`})})})},x={args:{axis:`both`,width:`100%`,height:300,children:null},render:e=>(0,m.jsx)(s,{variant:`muted`,children:(0,m.jsx)(d,{...e,children:(0,m.jsx)(g,{children:`Full Width, Fixed Height`})})})},S={args:{isInline:!0,children:null},render:e=>(0,m.jsx)(s,{variant:`muted`,children:(0,m.jsx)(a,{children:(0,m.jsxs)(n,{type:`body`,children:[`Text with inline centered icon:`,` `,(0,m.jsx)(d,{...e,xstyle:h.iconWrapper,children:(0,m.jsx)(r,{icon:f,size:`sm`})}),` `,`and more text after.`]})})})},C={args:{axis:`both`,width:300,height:200,children:null},render:e=>(0,m.jsx)(s,{variant:`muted`,children:(0,m.jsx)(d,{...e,children:(0,m.jsx)(`div`,{className:`x1o0wnni x1vvqiwl xlsj2fj xh6dtrn`,children:(0,m.jsx)(r,{icon:f,size:`lg`})})})})},w={args:{height:150,children:null},render:e=>(0,m.jsx)(s,{variant:`muted`,children:(0,m.jsx)(a,{children:(0,m.jsx)(d,{...e,children:(0,m.jsx)(g,{children:`Centered in Card`})})})})},T={args:{children:null},render:()=>(0,m.jsx)(s,{variant:`muted`,children:(0,m.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,m.jsxs)(a,{children:[(0,m.jsx)(n,{type:`supporting`,display:`block`,children:`axis: both (default)`}),(0,m.jsx)(d,{axis:`both`,width:300,height:150,children:(0,m.jsx)(g,{children:`Both Axes`})})]}),(0,m.jsxs)(a,{children:[(0,m.jsx)(n,{type:`supporting`,display:`block`,children:`axis: horizontal`}),(0,m.jsx)(d,{axis:`horizontal`,width:300,children:(0,m.jsx)(g,{children:`Horizontal Only`})})]}),(0,m.jsxs)(a,{children:[(0,m.jsx)(n,{type:`supporting`,display:`block`,children:`axis: vertical`}),(0,m.jsx)(d,{axis:`vertical`,height:150,children:(0,m.jsx)(g,{children:`Vertical Only`})})]})]})})},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E=[`Default`,`HorizontalOnly`,`VerticalOnly`,`FullSize`,`Inline`,`WithIcon`,`InsideACard`,`AllAxisModes`]}))();export{T as AllAxisModes,v as Default,x as FullSize,y as HorizontalOnly,S as Inline,w as InsideACard,b as VerticalOnly,C as WithIcon,E as __namedExportsOrder,_ as default};