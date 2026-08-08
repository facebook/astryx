import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-D67_5egO.js";import{t as a}from"./CheckboxInput-CpyOBP_D.js";import{c as o}from"./Stack-3jiL_lX6.js";import{t as s}from"./CheckboxInput-DlVwGAgB.js";import{Rn as c,dr as l,pr as u,u as d,ur as f,zn as p}from"./iframe-CYb7qYPM.js";function m({size:e}){let[t,n]=(0,h.useState)(!0),[r,i]=(0,h.useState)(`a`),[s,c]=(0,h.useState)(!0);return(0,g.jsxs)(o,{direction:`horizontal`,gap:8,align:`center`,children:[(0,g.jsx)(a,{label:`Checkbox`,size:e,value:t,onChange:n}),(0,g.jsx)(u,{label:`Radio`,isLabelHidden:!0,size:e,value:r,onChange:i,children:(0,g.jsx)(l,{label:`Radio`,value:`a`})}),(0,g.jsx)(p,{label:`Switch`,size:e,value:s,onChange:c})]})}var h,g,_,v,y,b,x;e((()=>{h=t(n()),s(),f(),c(),d(),g=r(),_={title:`Core/Control Size Comparison`,parameters:{layout:`padded`,docs:{description:{component:`Side-by-side comparison of the selection controls — \`CheckboxInput\`,
\`RadioList\`, and \`Switch\` — at matching sizes, so their proportions can be
observed together.

Use this view to spot-check size consistency: the control glyphs and their
hit-target wrappers should feel visually aligned across all three at a given
size.`}}}},v={render:()=>(0,g.jsx)(o,{direction:`vertical`,gap:8,children:[`sm`,`md`].map(e=>(0,g.jsxs)(o,{direction:`vertical`,gap:3,children:[(0,g.jsxs)(i,{type:`label`,weight:`bold`,children:[`size="`,e,`"`]}),(0,g.jsx)(m,{size:e})]},e))})},y={render:()=>(0,g.jsx)(m,{size:`sm`})},b={render:()=>(0,g.jsx)(m,{size:`md`})},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="vertical" gap={8}>
      {(['sm', 'md'] as const).map(size => <Stack key={size} direction="vertical" gap={3}>
          <Text type="label" weight="bold">
            size="{size}"
          </Text>
          <ControlRow size={size} />
        </Stack>)}
    </Stack>
}`,...v.parameters?.docs?.source},description:{story:`All three controls rendered at each size, grouped by size so the controls can
be compared directly against each other.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <ControlRow size="sm" />
}`,...y.parameters?.docs?.source},description:{story:"Small (`sm`) controls only.",...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <ControlRow size="md" />
}`,...b.parameters?.docs?.source},description:{story:"Medium (`md`, default) controls only.",...b.parameters?.docs?.description}}},x=[`AllSizes`,`Small`,`Medium`]}))();export{v as AllSizes,b as Medium,y as Small,x as __namedExportsOrder,_ as default};