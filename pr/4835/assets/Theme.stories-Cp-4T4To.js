import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./Theme-os0aoGDw.js";import{t as a}from"./jsx-runtime-DeHZSEgm.js";import{a as o,n as s,o as c,r as l}from"./useTheme-CAaDofyu.js";import{n as u,t as d}from"./Badge-QS1Y3zur.js";import{n as f,t as p}from"./Card-270yxekz.js";import{n as m,t as h}from"./Heading-CaMVckJS.js";import{n as g,t as _}from"./Stack-D-ryFIvw.js";import{n as v,t as y}from"./neutralTheme-DEcRasXP.js";function b({data:e,width:t=400,height:n=200}){let{token:r}=l(),i=Math.max(...e.map(e=>e.value)),a=(t-60)/e.length-8,o=n-40;return(0,w.jsxs)(`svg`,{width:t,height:n,role:`img`,"aria-label":`Bar chart`,children:[[.25,.5,.75,1].map(e=>{let n=o-o*e+20;return(0,w.jsxs)(`g`,{children:[(0,w.jsx)(`line`,{x1:50,y1:n,x2:t-10,y2:n,stroke:r(`--color-border`),strokeDasharray:`4 4`}),(0,w.jsx)(`text`,{x:45,y:n+4,textAnchor:`end`,fontSize:10,fill:r(`--color-text-secondary`),children:Math.round(i*e)})]},e)}),e.map((e,t)=>{let s=e.value/i*o,c=55+t*(a+8),l=o-s+20;return(0,w.jsxs)(`g`,{children:[(0,w.jsx)(`rect`,{x:c,y:l,width:a,height:s,rx:3,fill:r(`--color-accent`)}),(0,w.jsx)(`text`,{x:c+a/2,y:n-5,textAnchor:`middle`,fontSize:11,fill:r(`--color-text-secondary`),children:e.label})]},e.label)})]})}function x({data:e,width:t=480,height:n=220}){let{token:r}=l(),i=[r(`--color-accent`),r(`--color-success`),r(`--color-warning`)],a=[`Revenue`,`Users`,`Sessions`],o=Math.max(...e.flatMap(e=>e.series)),s=(t-80)/e.length,c=(s-16)/3,u=n-50;return(0,w.jsxs)(`div`,{children:[(0,w.jsxs)(`svg`,{width:t,height:n,role:`img`,"aria-label":`Grouped bar chart`,children:[[.25,.5,.75,1].map(e=>{let n=u-u*e+20;return(0,w.jsx)(`line`,{x1:55,y1:n,x2:t-10,y2:n,stroke:r(`--color-border`),strokeDasharray:`4 4`},e)}),e.map((e,t)=>{let a=60+t*s;return(0,w.jsxs)(`g`,{children:[e.series.map((e,t)=>{let n=e/o*u,r=a+t*(c+2),s=u-n+20;return(0,w.jsx)(`rect`,{x:r,y:s,width:c,height:n,rx:2,fill:i[t],opacity:.85},t)}),(0,w.jsx)(`text`,{x:a+(s-16)/2,y:n-26,textAnchor:`middle`,fontSize:11,fill:r(`--color-text-secondary`),children:e.label})]},e.label)})]}),(0,w.jsx)(`div`,{style:{display:`flex`,gap:16,paddingLeft:55},children:a.map((e,t)=>(0,w.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:6},children:[(0,w.jsx)(`div`,{style:{width:10,height:10,borderRadius:2,backgroundColor:i[t],opacity:.85}}),(0,w.jsx)(`span`,{style:{fontSize:11,color:r(`--color-text-secondary`)},children:e})]},e))})]})}function S(){let{token:e,mode:t,name:n}=l();return(0,w.jsx)(p,{children:(0,w.jsxs)(_,{direction:`vertical`,gap:2,children:[(0,w.jsxs)(_,{direction:`horizontal`,gap:2,vAlign:`center`,children:[(0,w.jsx)(h,{level:4,children:`Token Inspector`}),(0,w.jsx)(d,{label:n}),(0,w.jsx)(d,{variant:t===`dark`?`neutral`:`info`,label:t})]}),(0,w.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr auto`,gap:`4px 16px`,fontFamily:`monospace`,fontSize:12},children:[`--color-accent`,`--color-success`,`--color-warning`,`--color-error`,`--color-text-primary`,`--color-text-secondary`,`--color-background-surface`,`--color-border`,`--spacing-4`,`--radius-element`].map(t=>(0,w.jsxs)(C.Fragment,{children:[(0,w.jsx)(`span`,{style:{color:e(`--color-text-secondary`)},children:t}),(0,w.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:6},children:[t.startsWith(`--color-`)&&(0,w.jsx)(`span`,{style:{display:`inline-block`,width:14,height:14,borderRadius:3,backgroundColor:e(t),border:`1px solid ${e(`--color-border-emphasized`)}`}}),(0,w.jsx)(`code`,{children:e(t)})]})]},t))})]})})}var C,w,T,E,D,O,k,A,j,M,N,P;function F(){return(F=t((()=>{C=e(n()),r(),c(),s(),f(),g(),m(),u(),y(),w=a(),T=[{label:`Mon`,value:42},{label:`Tue`,value:78},{label:`Wed`,value:56},{label:`Thu`,value:91},{label:`Fri`,value:64},{label:`Sat`,value:35},{label:`Sun`,value:48}],E=[{label:`Q1`,series:[120,90,70]},{label:`Q2`,series:[140,110,85]},{label:`Q3`,series:[100,130,95]},{label:`Q4`,series:[160,105,120]}],D=o({name:`ocean`,tokens:{"--color-accent":[`#0077B6`,`#48CAE4`],"--color-success":[`#2D6A4F`,`#52B788`],"--color-warning":[`#E76F51`,`#F4A261`],"--color-background-surface":[`#F0F8FF`,`#0A1628`],"--color-text-primary":[`#023E8A`,`#CAF0F8`],"--color-text-secondary":[`#4A7FB5`,`#89C2D9`],"--color-border":[`#ADE8F433`,`#02394A66`]},typography:{scale:{base:14,ratio:1.2}}}),O={title:`Core/Theme`,parameters:{docs:{description:{component:"`Theme` applies a theme to its children via CSS custom properties and provides programmatic token access through `useTheme()`.\n\n`useTheme()` returns resolved token values for the current color mode, designed for non-CSS consumers like data visualization libraries, canvas rendering, and SVG charts that need concrete values (hex colors, px values) rather than CSS custom property references.\n\n**No double render.** Values are available on first paint; no `getComputedStyle` or `useEffect` needed."}}}},k={render:()=>(0,w.jsx)(i,{theme:v,mode:`light`,children:(0,w.jsxs)(_,{direction:`vertical`,gap:4,children:[(0,w.jsx)(h,{level:3,children:`Weekly Activity`}),(0,w.jsx)(p,{children:(0,w.jsx)(b,{data:T})})]})})},A={render:()=>(0,w.jsx)(i,{theme:v,mode:`dark`,children:(0,w.jsxs)(_,{direction:`vertical`,gap:4,children:[(0,w.jsx)(h,{level:3,children:`Weekly Activity`}),(0,w.jsx)(p,{children:(0,w.jsx)(b,{data:T})})]})})},j={render:()=>(0,w.jsx)(i,{theme:v,mode:`light`,children:(0,w.jsxs)(_,{direction:`vertical`,gap:4,children:[(0,w.jsx)(h,{level:3,children:`Quarterly Metrics`}),(0,w.jsx)(p,{children:(0,w.jsx)(x,{data:E})})]})})},M={render:()=>(0,w.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:16},children:[(0,w.jsx)(i,{theme:v,mode:`light`,children:(0,w.jsxs)(_,{direction:`vertical`,gap:2,children:[(0,w.jsx)(h,{level:4,children:`Default Theme`}),(0,w.jsx)(p,{children:(0,w.jsx)(x,{data:E,width:360})})]})}),(0,w.jsx)(i,{theme:D,mode:`light`,children:(0,w.jsxs)(_,{direction:`vertical`,gap:2,children:[(0,w.jsx)(h,{level:4,children:`Ocean Theme`}),(0,w.jsx)(p,{children:(0,w.jsx)(x,{data:E,width:360})})]})})]})},N={name:`Token Inspector`,render:()=>(0,w.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:16},children:[(0,w.jsx)(i,{theme:v,mode:`light`,children:(0,w.jsx)(S,{})}),(0,w.jsx)(i,{theme:D,mode:`dark`,children:(0,w.jsx)(S,{})})]})},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={neutralTheme} mode="light">
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Weekly Activity</Heading>
        <Card>
          <ThemeAwareBarChart data={CHART_DATA} />
        </Card>
      </Stack>
    </Theme>
}`,...k.parameters?.docs?.source},description:{story:"A simple bar chart using `useTheme` to read token values.\nThe chart colors, text, and grid lines all come from the theme.",...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={neutralTheme} mode="dark">
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Weekly Activity</Heading>
        <Card>
          <ThemeAwareBarChart data={CHART_DATA} />
        </Card>
      </Stack>
    </Theme>
}`,...A.parameters?.docs?.source},description:{story:`The same chart in dark mode \\u2014 token values automatically resolve
to their dark variants.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={neutralTheme} mode="light">
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Quarterly Metrics</Heading>
        <Card>
          <ThemeAwareGroupedChart data={MULTI_SERIES} />
        </Card>
      </Stack>
    </Theme>
}`,...j.parameters?.docs?.source},description:{story:`A grouped bar chart using multiple color tokens (accent, success, warning)
to differentiate data series.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source},description:{story:`Side-by-side comparison: same chart rendered with two different themes.
The ocean theme overrides accent, success, and warning colors.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source},description:{story:`Shows the raw resolved token values for both themes side by side.
Useful for debugging and understanding what values your charts receive.`,...N.parameters?.docs?.description}}},P=[`BarChart`,`BarChartDark`,`GroupedChart`,`ThemeComparison`,`TokenInspectorStory`]})))()}F();export{k as BarChart,A as BarChartDark,j as GroupedChart,M as ThemeComparison,N as TokenInspectorStory,P as __namedExportsOrder,O as default};