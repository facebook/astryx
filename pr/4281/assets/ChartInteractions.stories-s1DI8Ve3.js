import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{t as a}from"./Heading-D-Ri_Mjs.js";import{c as o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Text-BUJwo4gL.js";import{u as c}from"./iframe-CPRczjHQ.js";import{At as l,Et as u,J as d,K as f,Ot as p,St as m,W as h,X as g,it as _,mt as v,t as y,tt as b,wt as x}from"./src-CJG3qgeI.js";import{n as S,t as C}from"./useDataset-D0R9TzHE.js";var w,T,E,D,O,k,A,j,M,N,P,F;e((()=>{w=t(n()),y(),c(),s(),C(),T=r(),E={title:`Lab/Chart Interactions`,tags:[`autodocs`]},D=[{month:`Jan`,revenue:4200,expenses:2800},{month:`Feb`,revenue:3800,expenses:2600},{month:`Mar`,revenue:5100,expenses:3200},{month:`Apr`,revenue:4600,expenses:2900},{month:`May`,revenue:5400,expenses:3100},{month:`Jun`,revenue:6200,expenses:3400},{month:`Jul`,revenue:5800,expenses:3300},{month:`Aug`,revenue:5500,expenses:3e3},{month:`Sep`,revenue:4900,expenses:2700},{month:`Oct`,revenue:5200,expenses:3100},{month:`Nov`,revenue:5700,expenses:3200},{month:`Dec`,revenue:6800,expenses:3600}],O={render:()=>{let e=b(),[t,n]=(0,w.useState)(null);return(0,T.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,T.jsx)(a,{level:3,children:`1D Brush — Bar Chart`}),(0,T.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`Drag to select a range. `,t??`Click to clear.`]}),(0,T.jsxs)(l,{data:D,xKey:`month`,yKeys:[`revenue`],height:300,children:[(0,T.jsx)(u,{horizontal:!0}),(0,T.jsx)(p,{position:`bottom`}),(0,T.jsx)(p,{position:`left`}),(0,T.jsx)(x,{dataKey:`revenue`,color:e.categorical(1)[0]}),(0,T.jsx)(g,{onBrush:(e,t)=>n(`${t.length} months selected`),onClear:()=>n(null)})]})]})}},k={render:()=>{let e=b(),[t,n]=(0,w.useState)(null);return(0,T.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,T.jsx)(a,{level:3,children:`1D Brush — Line Chart`}),(0,T.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`Drag to select a range. `,t??`Click to clear.`]}),(0,T.jsxs)(l,{data:D,xKey:`month`,yKeys:[`revenue`,`expenses`],height:300,children:[(0,T.jsx)(u,{horizontal:!0}),(0,T.jsx)(p,{position:`bottom`}),(0,T.jsx)(p,{position:`left`}),(0,T.jsx)(m,{dataKey:`revenue`,color:e.categorical(2)[0],dots:!0}),(0,T.jsx)(m,{dataKey:`expenses`,color:e.categorical(2)[1],dots:!0}),(0,T.jsx)(g,{onBrush:(e,t)=>n(`${t.length} months selected`),onClear:()=>n(null)})]})]})}},A={render:()=>{let e=b(),[t]=S(`cars.json`),[n,r]=(0,w.useState)(null),s=(0,w.useMemo)(()=>t.filter(e=>e.Horsepower!=null&&e.Miles_per_Gallon!=null).map(e=>({hp:e.Horsepower,mpg:e.Miles_per_Gallon})),[t]);return s.length?(0,T.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,T.jsx)(a,{level:3,children:`2D Brush — Scatter Plot`}),(0,T.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`Drag a rectangle to select.`,` `,n==null?`Click to clear.`:`${n} points selected.`]}),(0,T.jsxs)(l,{data:s,xKey:`hp`,yKeys:[`mpg`],yBaseline:`data`,height:350,children:[(0,T.jsx)(u,{horizontal:!0,vertical:!0}),(0,T.jsx)(p,{position:`bottom`}),(0,T.jsx)(p,{position:`left`}),(0,T.jsx)(v,{dataKey:`mpg`,color:e.categorical(1)[0],radius:3}),(0,T.jsx)(g,{mode:`xy`,onBrush:(e,t)=>r(t.length),onClear:()=>r(null)})]})]}):(0,T.jsx)(i,{type:`supporting`,children:`Loading…`})}},j={render:()=>{let e=b(),[t]=S(`cars.json`),n=(0,w.useMemo)(()=>t.filter(e=>e.Horsepower!=null&&e.Miles_per_Gallon!=null).map(e=>({hp:e.Horsepower,mpg:e.Miles_per_Gallon})),[t]);return n.length?(0,T.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,T.jsx)(a,{level:3,children:`Crosshair`}),(0,T.jsxs)(l,{data:n,xKey:`hp`,yKeys:[`mpg`],yBaseline:`data`,height:350,children:[(0,T.jsx)(u,{horizontal:!0,vertical:!0}),(0,T.jsx)(p,{position:`bottom`}),(0,T.jsx)(p,{position:`left`}),(0,T.jsx)(v,{dataKey:`mpg`,color:e.categorical(1)[0],radius:3}),(0,T.jsx)(_,{crosshair:`xy`,crosshairLabels:!0,xFormat:e=>`${Math.round(Number(e))} hp`,yFormat:e=>`${Math.round(e)} mpg`})]})]}):(0,T.jsx)(i,{type:`supporting`,children:`Loading…`})}},M={render:()=>{let e=b(),[t]=S(`cars.json`),n=(0,w.useMemo)(()=>t.filter(e=>e.Horsepower!=null&&e.Miles_per_Gallon!=null).map(e=>({hp:e.Horsepower,mpg:e.Miles_per_Gallon})),[t]),[r,s]=(0,w.useState)([40,230]),[c,f]=(0,w.useState)([8,47]);return n.length?(0,T.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,T.jsx)(a,{level:3,children:`Zoom & Pan`}),(0,T.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`Scroll to zoom, drag to pan. x: [`,Math.round(r[0]),`,`,` `,Math.round(r[1]),`]`]}),(0,T.jsxs)(l,{data:n,xKey:`hp`,yKeys:[`mpg`],xDomain:r,yDomain:c,height:350,children:[(0,T.jsx)(u,{horizontal:!0,vertical:!0}),(0,T.jsx)(p,{position:`bottom`}),(0,T.jsx)(p,{position:`left`}),(0,T.jsx)(v,{dataKey:`mpg`,color:e.categorical(1)[0],radius:3}),(0,T.jsx)(d,{onXDomainChange:s,onYDomainChange:f})]})]}):(0,T.jsx)(i,{type:`supporting`,children:`Loading…`})}},N={render:()=>{let e=b(),[t]=S(`cars.json`),n=(0,w.useMemo)(()=>t.filter(e=>e.Horsepower!=null&&e.Miles_per_Gallon!=null).map(e=>({hp:e.Horsepower,mpg:e.Miles_per_Gallon})),[t]),[r,s]=(0,w.useState)([]);return n.length?(0,T.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,T.jsx)(a,{level:3,children:`Click to Select`}),(0,T.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`Click a point. Shift-click for multi. `,r.length,` selected.`]}),(0,T.jsxs)(l,{data:n,xKey:`hp`,yKeys:[`mpg`],yBaseline:`data`,height:350,children:[(0,T.jsx)(u,{horizontal:!0,vertical:!0}),(0,T.jsx)(p,{position:`bottom`}),(0,T.jsx)(p,{position:`left`}),(0,T.jsx)(v,{dataKey:`mpg`,color:e.categorical(1)[0],radius:3}),(0,T.jsx)(f,{selected:r,onSelectionChange:s})]})]}):(0,T.jsx)(i,{type:`supporting`,children:`Loading…`})}},P={render:()=>{let e=b();return(0,T.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,T.jsx)(a,{level:3,children:`Reference Lines`}),(0,T.jsxs)(l,{data:D,xKey:`month`,yKeys:[`revenue`],height:300,children:[(0,T.jsx)(u,{horizontal:!0}),(0,T.jsx)(p,{position:`bottom`}),(0,T.jsx)(p,{position:`left`}),(0,T.jsx)(x,{dataKey:`revenue`,color:e.categorical(1)[0]}),(0,T.jsx)(h,{y:5e3,label:`Target`,color:e.semantic.positive}),(0,T.jsx)(h,{y:4700,label:`Average`,color:e.semantic.neutral})]})]})}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [selected, setSelected] = useState<string | null>(null);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>1D Brush — Bar Chart</Heading>
        <Text type="supporting" color="secondary">
          Drag to select a range. {selected ?? 'Click to clear.'}
        </Text>
        <Chart data={monthlyData} xKey="month" yKeys={['revenue']} height={300}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartBar dataKey="revenue" color={colors.categorical(1)[0]} />
          <ChartBrush onBrush={(_, sel) => setSelected(\`\${sel.length} months selected\`)} onClear={() => setSelected(null)} />
        </Chart>
      </Stack>;
  }
}`,...O.parameters?.docs?.source},description:{story:`1D brush on a bar chart — select a range of months`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [selected, setSelected] = useState<string | null>(null);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>1D Brush — Line Chart</Heading>
        <Text type="supporting" color="secondary">
          Drag to select a range. {selected ?? 'Click to clear.'}
        </Text>
        <Chart data={monthlyData} xKey="month" yKeys={['revenue', 'expenses']} height={300}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartLine dataKey="revenue" color={colors.categorical(2)[0]} dots />
          <ChartLine dataKey="expenses" color={colors.categorical(2)[1]} dots />
          <ChartBrush onBrush={(_, sel) => setSelected(\`\${sel.length} months selected\`)} onClear={() => setSelected(null)} />
        </Chart>
      </Stack>;
  }
}`,...k.parameters?.docs?.source},description:{story:`1D brush on a line chart — select a time range`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const [count, setCount] = useState<number | null>(null);
    const data = useMemo(() => raw.filter(d => d.Horsepower != null && d.Miles_per_Gallon != null).map(d => ({
      hp: d.Horsepower,
      mpg: d.Miles_per_Gallon
    })), [raw]);
    if (!data.length) {
      return <Text type="supporting">Loading…</Text>;
    }
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>2D Brush — Scatter Plot</Heading>
        <Text type="supporting" color="secondary">
          Drag a rectangle to select.{' '}
          {count != null ? \`\${count} points selected.\` : 'Click to clear.'}
        </Text>
        <Chart data={data} xKey="hp" yKeys={['mpg']} yBaseline="data" height={350}>
          <ChartGrid horizontal vertical />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDot dataKey="mpg" color={colors.categorical(1)[0]} radius={3} />
          <ChartBrush mode="xy" onBrush={(_, sel) => setCount(sel.length)} onClear={() => setCount(null)} />
        </Chart>
      </Stack>;
  }
}`,...A.parameters?.docs?.source},description:{story:`2D rectangular brush on a scatter plot`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const data = useMemo(() => raw.filter(d => d.Horsepower != null && d.Miles_per_Gallon != null).map(d => ({
      hp: d.Horsepower,
      mpg: d.Miles_per_Gallon
    })), [raw]);
    if (!data.length) {
      return <Text type="supporting">Loading…</Text>;
    }
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Crosshair</Heading>
        <Chart data={data} xKey="hp" yKeys={['mpg']} yBaseline="data" height={350}>
          <ChartGrid horizontal vertical />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDot dataKey="mpg" color={colors.categorical(1)[0]} radius={3} />
          <ChartTooltip crosshair="xy" crosshairLabels xFormat={v => \`\${Math.round(Number(v))} hp\`} yFormat={v => \`\${Math.round(v)} mpg\`} />
        </Chart>
      </Stack>;
  }
}`,...j.parameters?.docs?.source},description:{story:`Crosshair with value readouts`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const data = useMemo(() => raw.filter(d => d.Horsepower != null && d.Miles_per_Gallon != null).map(d => ({
      hp: d.Horsepower,
      mpg: d.Miles_per_Gallon
    })), [raw]);
    const [xDomain, setXDomain] = useState<[number, number]>([40, 230]);
    const [yDomain, setYDomain] = useState<[number, number]>([8, 47]);
    if (!data.length) {
      return <Text type="supporting">Loading…</Text>;
    }
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Zoom & Pan</Heading>
        <Text type="supporting" color="secondary">
          Scroll to zoom, drag to pan. x: [{Math.round(xDomain[0])},{' '}
          {Math.round(xDomain[1])}]
        </Text>
        <Chart data={data} xKey="hp" yKeys={['mpg']} xDomain={xDomain} yDomain={yDomain} height={350}>
          <ChartGrid horizontal vertical />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDot dataKey="mpg" color={colors.categorical(1)[0]} radius={3} />
          <ChartZoom onXDomainChange={setXDomain} onYDomainChange={setYDomain} />
        </Chart>
      </Stack>;
  }
}`,...M.parameters?.docs?.source},description:{story:`Scroll to zoom, drag to pan`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const data = useMemo(() => raw.filter(d => d.Horsepower != null && d.Miles_per_Gallon != null).map(d => ({
      hp: d.Horsepower,
      mpg: d.Miles_per_Gallon
    })), [raw]);
    const [selected, setSelected] = useState<number[]>([]);
    if (!data.length) {
      return <Text type="supporting">Loading…</Text>;
    }
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Click to Select</Heading>
        <Text type="supporting" color="secondary">
          Click a point. Shift-click for multi. {selected.length} selected.
        </Text>
        <Chart data={data} xKey="hp" yKeys={['mpg']} yBaseline="data" height={350}>
          <ChartGrid horizontal vertical />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDot dataKey="mpg" color={colors.categorical(1)[0]} radius={3} />
          <ChartSelect selected={selected} onSelectionChange={setSelected} />
        </Chart>
      </Stack>;
  }
}`,...N.parameters?.docs?.source},description:{story:`Click to select points`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Reference Lines</Heading>
        <Chart data={monthlyData} xKey="month" yKeys={['revenue']} height={300}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartBar dataKey="revenue" color={colors.categorical(1)[0]} />
          <ChartReferenceLine y={5000} label="Target" color={colors.semantic.positive} />
          <ChartReferenceLine y={4700} label="Average" color={colors.semantic.neutral} />
        </Chart>
      </Stack>;
  }
}`,...P.parameters?.docs?.source},description:{story:`Reference lines for target and average`,...P.parameters?.docs?.description}}},F=[`BrushBars`,`BrushLine`,`Brush2D`,`Crosshair`,`ZoomPan`,`ClickSelect`,`ReferenceLines`]}))();export{A as Brush2D,O as BrushBars,k as BrushLine,N as ClickSelect,j as Crosshair,P as ReferenceLines,M as ZoomPan,F as __namedExportsOrder,E as default};