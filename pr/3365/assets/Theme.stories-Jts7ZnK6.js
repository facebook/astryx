import{a1 as e,f as h,a9 as k,aN as A,H as _,ah as z}from"./iframe-CF49Wwf0.js";import{C as u}from"./Card-DOraMNb0.js";import{S as m}from"./Stack-D8miSQVH.js";import{B as I}from"./Badge-B7t8Dbk0.js";import{H as x}from"./Heading-bcQlIHnJ.js";import"./preload-helper-Ct5FWWRu.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";import"./stack.stylex-BlarxY2N.js";const F=[{label:"Mon",value:42},{label:"Tue",value:78},{label:"Wed",value:56},{label:"Thu",value:91},{label:"Fri",value:64},{label:"Sat",value:35},{label:"Sun",value:48}],C=[{label:"Q1",series:[120,90,70]},{label:"Q2",series:[140,110,85]},{label:"Q3",series:[100,130,95]},{label:"Q4",series:[160,105,120]}];function B({data:s,width:n=400,height:i=200}){const{token:a}=A(),o=Math.max(...s.map(t=>t.value)),g=(n-60)/s.length-8,p=i-40;return e.jsxs("svg",{width:n,height:i,role:"img","aria-label":"Bar chart",children:[[.25,.5,.75,1].map(t=>{const c=p-p*t+20;return e.jsxs("g",{children:[e.jsx("line",{x1:50,y1:c,x2:n-10,y2:c,stroke:a("--color-border"),strokeDasharray:"4 4"}),e.jsx("text",{x:45,y:c+4,textAnchor:"end",fontSize:10,fill:a("--color-text-secondary"),children:Math.round(o*t)})]},t)}),s.map((t,c)=>{const d=t.value/o*p,r=55+c*(g+8),l=p-d+20;return e.jsxs("g",{children:[e.jsx("rect",{x:r,y:l,width:g,height:d,rx:3,fill:a("--color-accent")}),e.jsx("text",{x:r+g/2,y:i-5,textAnchor:"middle",fontSize:11,fill:a("--color-text-secondary"),children:t.label})]},t.label)})]})}function S({data:s,width:n=480,height:i=220}){const{token:a}=A(),o=[a("--color-accent"),a("--color-success"),a("--color-warning")],g=["Revenue","Users","Sessions"],p=Math.max(...s.flatMap(r=>r.series)),t=(n-80)/s.length,c=(t-16)/3,d=i-50;return e.jsxs("div",{children:[e.jsxs("svg",{width:n,height:i,role:"img","aria-label":"Grouped bar chart",children:[[.25,.5,.75,1].map(r=>{const l=d-d*r+20;return e.jsx("line",{x1:55,y1:l,x2:n-10,y2:l,stroke:a("--color-border"),strokeDasharray:"4 4"},r)}),s.map((r,l)=>{const w=60+l*t;return e.jsxs("g",{children:[r.series.map((M,b)=>{const H=M/p*d,R=w+b*(c+2),W=d-H+20;return e.jsx("rect",{x:R,y:W,width:c,height:H,rx:2,fill:o[b],opacity:.85},b)}),e.jsx("text",{x:w+(t-16)/2,y:i-26,textAnchor:"middle",fontSize:11,fill:a("--color-text-secondary"),children:r.label})]},r.label)})]}),e.jsx("div",{style:{display:"flex",gap:16,paddingLeft:55},children:g.map((r,l)=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[e.jsx("div",{style:{width:10,height:10,borderRadius:2,backgroundColor:o[l],opacity:.85}}),e.jsx("span",{style:{fontSize:11,color:a("--color-text-secondary")},children:r})]},r))})]})}function E(){const{token:s,mode:n,name:i}=A(),a=["--color-accent","--color-success","--color-warning","--color-error","--color-text-primary","--color-text-secondary","--color-background-surface","--color-border","--spacing-4","--radius-element"];return e.jsx(u,{children:e.jsxs(m,{direction:"vertical",gap:2,children:[e.jsxs(m,{direction:"horizontal",gap:2,vAlign:"center",children:[e.jsx(x,{level:4,children:"Token Inspector"}),e.jsx(I,{label:i}),e.jsx(I,{variant:n==="dark"?"neutral":"info",label:n})]}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr auto",gap:"4px 16px",fontFamily:"monospace",fontSize:12},children:a.map(o=>e.jsxs(z.Fragment,{children:[e.jsx("span",{style:{color:s("--color-text-secondary")},children:o}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:6},children:[o.startsWith("--color-")&&e.jsx("span",{style:{display:"inline-block",width:14,height:14,borderRadius:3,backgroundColor:s(o),border:`1px solid ${s("--color-border-emphasized")}`}}),e.jsx("code",{children:s(o)})]})]},o))})]})})}const D=_({name:"ocean",tokens:{"--color-accent":["#0077B6","#48CAE4"],"--color-success":["#2D6A4F","#52B788"],"--color-warning":["#E76F51","#F4A261"],"--color-background-surface":["#F0F8FF","#0A1628"],"--color-text-primary":["#023E8A","#CAF0F8"],"--color-text-secondary":["#4A7FB5","#89C2D9"],"--color-border":["#ADE8F433","#02394A66"]},typography:{scale:{base:14,ratio:1.2}}}),J={title:"Core/Theme",parameters:{docs:{description:{component:"`Theme` applies a theme to its children via CSS custom properties and provides programmatic token access through `useTheme()`.\n\n`useTheme()` returns resolved token values for the current color mode, designed for non-CSS consumers like data visualization libraries, canvas rendering, and SVG charts that need concrete values (hex colors, px values) rather than CSS custom property references.\n\n**No double render.** Values are available on first paint; no `getComputedStyle` or `useEffect` needed."}}}},T={render:()=>e.jsx(h,{theme:k,mode:"light",children:e.jsxs(m,{direction:"vertical",gap:4,children:[e.jsx(x,{level:3,children:"Weekly Activity"}),e.jsx(u,{children:e.jsx(B,{data:F})})]})})},y={render:()=>e.jsx(h,{theme:k,mode:"dark",children:e.jsxs(m,{direction:"vertical",gap:4,children:[e.jsx(x,{level:3,children:"Weekly Activity"}),e.jsx(u,{children:e.jsx(B,{data:F})})]})})},v={render:()=>e.jsx(h,{theme:k,mode:"light",children:e.jsxs(m,{direction:"vertical",gap:4,children:[e.jsx(x,{level:3,children:"Quarterly Metrics"}),e.jsx(u,{children:e.jsx(S,{data:C})})]})})},j={render:()=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},children:[e.jsx(h,{theme:k,mode:"light",children:e.jsxs(m,{direction:"vertical",gap:2,children:[e.jsx(x,{level:4,children:"Default Theme"}),e.jsx(u,{children:e.jsx(S,{data:C,width:360})})]})}),e.jsx(h,{theme:D,mode:"light",children:e.jsxs(m,{direction:"vertical",gap:2,children:[e.jsx(x,{level:4,children:"Ocean Theme"}),e.jsx(u,{children:e.jsx(S,{data:C,width:360})})]})})]})},f={name:"Token Inspector",render:()=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},children:[e.jsx(h,{theme:k,mode:"light",children:e.jsx(E,{})}),e.jsx(h,{theme:D,mode:"dark",children:e.jsx(E,{})})]})};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={neutralTheme} mode="light">
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Weekly Activity</Heading>
        <Card>
          <ThemeAwareBarChart data={CHART_DATA} />
        </Card>
      </Stack>
    </Theme>
}`,...T.parameters?.docs?.source},description:{story:"A simple bar chart using `useTheme` to read token values.\nThe chart colors, text, and grid lines all come from the theme.",...T.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={neutralTheme} mode="dark">
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Weekly Activity</Heading>
        <Card>
          <ThemeAwareBarChart data={CHART_DATA} />
        </Card>
      </Stack>
    </Theme>
}`,...y.parameters?.docs?.source},description:{story:`The same chart in dark mode \\u2014 token values automatically resolve
to their dark variants.`,...y.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={neutralTheme} mode="light">
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Quarterly Metrics</Heading>
        <Card>
          <ThemeAwareGroupedChart data={MULTI_SERIES} />
        </Card>
      </Stack>
    </Theme>
}`,...v.parameters?.docs?.source},description:{story:`A grouped bar chart using multiple color tokens (accent, success, warning)
to differentiate data series.`,...v.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16
  }}>
      <Theme theme={neutralTheme} mode="light">
        <Stack direction="vertical" gap={2}>
          <Heading level={4}>Default Theme</Heading>
          <Card>
            <ThemeAwareGroupedChart data={MULTI_SERIES} width={360} />
          </Card>
        </Stack>
      </Theme>
      <Theme theme={oceanTheme} mode="light">
        <Stack direction="vertical" gap={2}>
          <Heading level={4}>Ocean Theme</Heading>
          <Card>
            <ThemeAwareGroupedChart data={MULTI_SERIES} width={360} />
          </Card>
        </Stack>
      </Theme>
    </div>
}`,...j.parameters?.docs?.source},description:{story:`Side-by-side comparison: same chart rendered with two different themes.
The ocean theme overrides accent, success, and warning colors.`,...j.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Token Inspector',
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16
  }}>
      <Theme theme={neutralTheme} mode="light">
        <TokenInspector />
      </Theme>
      <Theme theme={oceanTheme} mode="dark">
        <TokenInspector />
      </Theme>
    </div>
}`,...f.parameters?.docs?.source},description:{story:`Shows the raw resolved token values for both themes side by side.
Useful for debugging and understanding what values your charts receive.`,...f.parameters?.docs?.description}}};const K=["BarChart","BarChartDark","GroupedChart","ThemeComparison","TokenInspectorStory"];export{T as BarChart,y as BarChartDark,v as GroupedChart,j as ThemeComparison,f as TokenInspectorStory,K as __namedExportsOrder,J as default};
