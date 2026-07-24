import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{o as i,r as a}from"./useTheme-CKat3NNu.js";import{n as o,t as s}from"./Badge-x089lqwb.js";import{n as c,t as l}from"./Card-B6hq5pd9.js";import{t as u,x as d}from"./theme-BwMR6G18.js";import{t as f}from"./Heading-D-Ri_Mjs.js";import{c as p,t as m}from"./Stack-C7dTtCDZ.js";import{t as h}from"./Text-BUJwo4gL.js";import{l as g,s as _}from"./iframe-iQ3nuRH_.js";function v({data:e,width:t=400,height:n=200}){let{token:r}=a(),i=Math.max(...e.map(e=>e.value)),o=(t-60)/e.length-8,s=n-40;return(0,S.jsxs)(`svg`,{width:t,height:n,role:`img`,"aria-label":`Bar chart`,children:[[.25,.5,.75,1].map(e=>{let n=s-s*e+20;return(0,S.jsxs)(`g`,{children:[(0,S.jsx)(`line`,{x1:50,y1:n,x2:t-10,y2:n,stroke:r(`--color-border`),strokeDasharray:`4 4`}),(0,S.jsx)(`text`,{x:45,y:n+4,textAnchor:`end`,fontSize:10,fill:r(`--color-text-secondary`),children:Math.round(i*e)})]},e)}),e.map((e,t)=>{let a=e.value/i*s,c=55+t*(o+8);return(0,S.jsxs)(`g`,{children:[(0,S.jsx)(`rect`,{x:c,y:s-a+20,width:o,height:a,rx:3,fill:r(`--color-accent`)}),(0,S.jsx)(`text`,{x:c+o/2,y:n-5,textAnchor:`middle`,fontSize:11,fill:r(`--color-text-secondary`),children:e.label})]},e.label)})]})}function y({data:e,width:t=480,height:n=220}){let{token:r}=a(),i=[r(`--color-accent`),r(`--color-success`),r(`--color-warning`)],o=[`Revenue`,`Users`,`Sessions`],s=Math.max(...e.flatMap(e=>e.series)),c=(t-80)/e.length,l=(c-16)/3,u=n-50;return(0,S.jsxs)(`div`,{children:[(0,S.jsxs)(`svg`,{width:t,height:n,role:`img`,"aria-label":`Grouped bar chart`,children:[[.25,.5,.75,1].map(e=>{let n=u-u*e+20;return(0,S.jsx)(`line`,{x1:55,y1:n,x2:t-10,y2:n,stroke:r(`--color-border`),strokeDasharray:`4 4`},e)}),e.map((e,t)=>{let a=60+t*c;return(0,S.jsxs)(`g`,{children:[e.series.map((e,t)=>{let n=e/s*u;return(0,S.jsx)(`rect`,{x:a+t*(l+2),y:u-n+20,width:l,height:n,rx:2,fill:i[t],opacity:.85},t)}),(0,S.jsx)(`text`,{x:a+(c-16)/2,y:n-26,textAnchor:`middle`,fontSize:11,fill:r(`--color-text-secondary`),children:e.label})]},e.label)})]}),(0,S.jsx)(`div`,{style:{display:`flex`,gap:16,paddingLeft:55},children:o.map((e,t)=>(0,S.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:6},children:[(0,S.jsx)(`div`,{style:{width:10,height:10,borderRadius:2,backgroundColor:i[t],opacity:.85}}),(0,S.jsx)(`span`,{style:{fontSize:11,color:r(`--color-text-secondary`)},children:e})]},e))})]})}function b(){let{token:e,mode:t,name:n}=a();return(0,S.jsx)(c,{children:(0,S.jsxs)(p,{direction:`vertical`,gap:2,children:[(0,S.jsxs)(p,{direction:`horizontal`,gap:2,vAlign:`center`,children:[(0,S.jsx)(f,{level:4,children:`Token Inspector`}),(0,S.jsx)(o,{label:n}),(0,S.jsx)(o,{variant:t===`dark`?`neutral`:`info`,label:t})]}),(0,S.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr auto`,gap:`4px 16px`,fontFamily:`monospace`,fontSize:12},children:[`--color-accent`,`--color-success`,`--color-warning`,`--color-error`,`--color-text-primary`,`--color-text-secondary`,`--color-background-surface`,`--color-border`,`--spacing-4`,`--radius-element`].map(t=>(0,S.jsxs)(x.Fragment,{children:[(0,S.jsx)(`span`,{style:{color:e(`--color-text-secondary`)},children:t}),(0,S.jsxs)(`span`,{style:{display:`flex`,alignItems:`center`,gap:6},children:[t.startsWith(`--color-`)&&(0,S.jsx)(`span`,{style:{display:`inline-block`,width:14,height:14,borderRadius:3,backgroundColor:e(t),border:`1px solid ${e(`--color-border-emphasized`)}`}}),(0,S.jsx)(`code`,{children:e(t)})]})]},t))})]})})}var x,S,C,w,T,E,D,O,k,A,j,M;e((()=>{x=t(n()),u(),l(),m(),h(),s(),_(),S=r(),C=[{label:`Mon`,value:42},{label:`Tue`,value:78},{label:`Wed`,value:56},{label:`Thu`,value:91},{label:`Fri`,value:64},{label:`Sat`,value:35},{label:`Sun`,value:48}],w=[{label:`Q1`,series:[120,90,70]},{label:`Q2`,series:[140,110,85]},{label:`Q3`,series:[100,130,95]},{label:`Q4`,series:[160,105,120]}],T=i({name:`ocean`,tokens:{"--color-accent":[`#0077B6`,`#48CAE4`],"--color-success":[`#2D6A4F`,`#52B788`],"--color-warning":[`#E76F51`,`#F4A261`],"--color-background-surface":[`#F0F8FF`,`#0A1628`],"--color-text-primary":[`#023E8A`,`#CAF0F8`],"--color-text-secondary":[`#4A7FB5`,`#89C2D9`],"--color-border":[`#ADE8F433`,`#02394A66`]},typography:{scale:{base:14,ratio:1.2}}}),E={title:`Core/Theme`,parameters:{docs:{description:{component:"`Theme` applies a theme to its children via CSS custom properties and provides programmatic token access through `useTheme()`.\n\n`useTheme()` returns resolved token values for the current color mode, designed for non-CSS consumers like data visualization libraries, canvas rendering, and SVG charts that need concrete values (hex colors, px values) rather than CSS custom property references.\n\n**No double render.** Values are available on first paint; no `getComputedStyle` or `useEffect` needed."}}}},D={render:()=>(0,S.jsx)(d,{theme:g,mode:`light`,children:(0,S.jsxs)(p,{direction:`vertical`,gap:4,children:[(0,S.jsx)(f,{level:3,children:`Weekly Activity`}),(0,S.jsx)(c,{children:(0,S.jsx)(v,{data:C})})]})})},O={render:()=>(0,S.jsx)(d,{theme:g,mode:`dark`,children:(0,S.jsxs)(p,{direction:`vertical`,gap:4,children:[(0,S.jsx)(f,{level:3,children:`Weekly Activity`}),(0,S.jsx)(c,{children:(0,S.jsx)(v,{data:C})})]})})},k={render:()=>(0,S.jsx)(d,{theme:g,mode:`light`,children:(0,S.jsxs)(p,{direction:`vertical`,gap:4,children:[(0,S.jsx)(f,{level:3,children:`Quarterly Metrics`}),(0,S.jsx)(c,{children:(0,S.jsx)(y,{data:w})})]})})},A={render:()=>(0,S.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:16},children:[(0,S.jsx)(d,{theme:g,mode:`light`,children:(0,S.jsxs)(p,{direction:`vertical`,gap:2,children:[(0,S.jsx)(f,{level:4,children:`Default Theme`}),(0,S.jsx)(c,{children:(0,S.jsx)(y,{data:w,width:360})})]})}),(0,S.jsx)(d,{theme:T,mode:`light`,children:(0,S.jsxs)(p,{direction:`vertical`,gap:2,children:[(0,S.jsx)(f,{level:4,children:`Ocean Theme`}),(0,S.jsx)(c,{children:(0,S.jsx)(y,{data:w,width:360})})]})})]})},j={name:`Token Inspector`,render:()=>(0,S.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:16},children:[(0,S.jsx)(d,{theme:g,mode:`light`,children:(0,S.jsx)(b,{})}),(0,S.jsx)(d,{theme:T,mode:`dark`,children:(0,S.jsx)(b,{})})]})},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={neutralTheme} mode="light">
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Weekly Activity</Heading>
        <Card>
          <ThemeAwareBarChart data={CHART_DATA} />
        </Card>
      </Stack>
    </Theme>
}`,...D.parameters?.docs?.source},description:{story:"A simple bar chart using `useTheme` to read token values.\nThe chart colors, text, and grid lines all come from the theme.",...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={neutralTheme} mode="dark">
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Weekly Activity</Heading>
        <Card>
          <ThemeAwareBarChart data={CHART_DATA} />
        </Card>
      </Stack>
    </Theme>
}`,...O.parameters?.docs?.source},description:{story:`The same chart in dark mode \\u2014 token values automatically resolve
to their dark variants.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <Theme theme={neutralTheme} mode="light">
      <Stack direction="vertical" gap={4}>
        <Heading level={3}>Quarterly Metrics</Heading>
        <Card>
          <ThemeAwareGroupedChart data={MULTI_SERIES} />
        </Card>
      </Stack>
    </Theme>
}`,...k.parameters?.docs?.source},description:{story:`A grouped bar chart using multiple color tokens (accent, success, warning)
to differentiate data series.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`Side-by-side comparison: same chart rendered with two different themes.
The ocean theme overrides accent, success, and warning colors.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source},description:{story:`Shows the raw resolved token values for both themes side by side.
Useful for debugging and understanding what values your charts receive.`,...j.parameters?.docs?.description}}},M=[`BarChart`,`BarChartDark`,`GroupedChart`,`ThemeComparison`,`TokenInspectorStory`]}))();export{D as BarChart,O as BarChartDark,k as GroupedChart,A as ThemeComparison,j as TokenInspectorStory,M as __namedExportsOrder,E as default};