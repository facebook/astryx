import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./CheckboxInput-DJd8Fdr_.js";import{n as s,t as c}from"./Stack-D-ryFIvw.js";import{i as l,n as u,r as d,t as f}from"./RadioListItem-KLLQHwBu.js";import{n as p,t as m}from"./Switch-Bd0bzgyN.js";function h({size:e}){let[t,n]=(0,g.useState)(!0),[r,i]=(0,g.useState)(`a`),[a,s]=(0,g.useState)(!0);return(0,_.jsxs)(c,{direction:`horizontal`,gap:8,align:`center`,children:[(0,_.jsx)(o,{label:`Checkbox`,size:e,value:t,onChange:n}),(0,_.jsx)(d,{label:`Radio`,isLabelHidden:!0,size:e,value:r,onChange:i,children:(0,_.jsx)(f,{label:`Radio`,value:`a`})}),(0,_.jsx)(m,{label:`Switch`,size:e,value:a,onChange:s})]})}var g,_,v,y,b,x,S;function C(){return(C=e((()=>{g=t(),a(),l(),u(),p(),s(),n(),_=i(),v={title:`Core/Control Size Comparison`,parameters:{layout:`padded`,docs:{description:{component:`Side-by-side comparison of the selection controls — \`CheckboxInput\`,
\`RadioList\`, and \`Switch\` — at matching sizes, so their proportions can be
observed together.

Use this view to spot-check size consistency: the control glyphs and their
hit-target wrappers should feel visually aligned across all three at a given
size.`}}}},y={render:()=>(0,_.jsx)(c,{direction:`vertical`,gap:8,children:[`sm`,`md`].map(e=>(0,_.jsxs)(c,{direction:`vertical`,gap:3,children:[(0,_.jsxs)(r,{type:`label`,weight:`bold`,children:[`size="`,e,`"`]}),(0,_.jsx)(h,{size:e})]},e))})},b={render:()=>(0,_.jsx)(h,{size:`sm`})},x={render:()=>(0,_.jsx)(h,{size:`md`})},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={8}>
      {(['sm', 'md'] as const).map(size => <Stack key={size} direction="vertical" gap={3}>
          <Text type="label" weight="bold">
            size="{size}"
          </Text>
          <ControlRow size={size} />
        </Stack>)}
    </Stack>
}`,...y.parameters?.docs?.source},description:{story:`All three controls rendered at each size, grouped by size so the controls can
be compared directly against each other.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <ControlRow size="sm" />
}`,...b.parameters?.docs?.source},description:{story:"Small (`sm`) controls only.",...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <ControlRow size="md" />
}`,...x.parameters?.docs?.source},description:{story:"Medium (`md`, default) controls only.",...x.parameters?.docs?.description}}},S=[`AllSizes`,`Small`,`Medium`]})))()}C();export{y as AllSizes,x as Medium,b as Small,S as __namedExportsOrder,v as default};