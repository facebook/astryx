import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{t as a}from"./Heading-D-Ri_Mjs.js";import{c as o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Text-BUJwo4gL.js";import{u as c}from"./iframe-rS7i1xed.js";import{At as l,Et as u,Ot as d,W as f,X as p,mt as m,t as h,tt as g,wt as _}from"./src-Cfj0DB1w.js";import{n as v,t as y}from"./useDataset-D0R9TzHE.js";var b,x,S,C,w;e((()=>{b=t(n()),h(),c(),s(),y(),x=r(),S={title:`Lab/Chart Interactions/Coordinated Views`},C={render:()=>{let e=g(),[t]=v(`cars.json`),[n,r]=(0,b.useState)(null),s=(0,b.useMemo)(()=>t.filter(e=>e.Horsepower!=null&&e.Miles_per_Gallon!=null&&e.Origin!=null),[t]),c=(0,b.useMemo)(()=>n?s.filter(e=>e.Horsepower>=n[0]&&e.Horsepower<=n[1]):s,[s,n]),h=(0,b.useMemo)(()=>s.map(e=>({hp:e.Horsepower,mpg:e.Miles_per_Gallon})),[s]),y=(0,b.useMemo)(()=>{let e=new Map;for(let t of c){let n=e.get(t.Origin)??{sum:0,count:0};n.sum+=t.Miles_per_Gallon,n.count+=1,e.set(t.Origin,n)}return[...e.entries()].map(([e,{sum:t,count:n}])=>({origin:e,avgMpg:Math.round(t/n*10)/10})).sort((e,t)=>t.avgMpg-e.avgMpg)},[c]),S=(0,b.useMemo)(()=>c.slice(0,10).map(e=>({name:e.Name,hp:e.Horsepower,mpg:e.Miles_per_Gallon,origin:e.Origin})),[c]);if(!s.length)return(0,x.jsx)(i,{type:`supporting`,children:`Loading\\u2026`});let C=e.categorical(3);return(0,x.jsxs)(o,{direction:`vertical`,gap:6,children:[(0,x.jsx)(a,{level:3,children:`Coordinated Views`}),(0,x.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`Brush on the scatter to filter the bar chart and table below.`,n?` Showing ${c.length} cars with ${Math.round(n[0])}\u2013${Math.round(n[1])} HP.`:` Showing all ${s.length} cars.`]}),(0,x.jsxs)(o,{direction:`vertical`,gap:1,children:[(0,x.jsx)(i,{type:`label`,children:`Horsepower vs MPG`}),(0,x.jsxs)(l,{data:h,xKey:`hp`,yKeys:[`mpg`],yBaseline:`data`,height:280,children:[(0,x.jsx)(u,{horizontal:!0,vertical:!0}),(0,x.jsx)(d,{position:`bottom`}),(0,x.jsx)(d,{position:`left`}),(0,x.jsx)(m,{dataKey:`mpg`,color:C[0],radius:3}),(0,x.jsx)(p,{onBrush:e=>r(e.x),onClear:()=>r(null)}),n&&(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(f,{x:n[0],color:C[0],strokeDasharray:`none`}),(0,x.jsx)(f,{x:n[1],color:C[0],strokeDasharray:`none`})]})]})]}),(0,x.jsxs)(o,{direction:`vertical`,gap:1,children:[(0,x.jsx)(i,{type:`label`,children:`Average MPG by Origin (filtered)`}),(0,x.jsxs)(l,{data:y,xKey:`origin`,yKeys:[`avgMpg`],height:200,children:[(0,x.jsx)(u,{horizontal:!0}),(0,x.jsx)(d,{position:`bottom`}),(0,x.jsx)(d,{position:`left`}),(0,x.jsx)(_,{dataKey:`avgMpg`,color:C[1]})]})]}),(0,x.jsxs)(o,{direction:`vertical`,gap:1,children:[(0,x.jsx)(i,{type:`label`,children:`Top 10 cars (filtered)`}),(0,x.jsx)(`div`,{style:{fontSize:12,overflow:`auto`},children:(0,x.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`},children:[(0,x.jsx)(`thead`,{children:(0,x.jsxs)(`tr`,{style:{borderBottom:`1px solid var(--color-border)`,textAlign:`left`},children:[(0,x.jsx)(`th`,{style:{padding:`4px 8px`},children:`Name`}),(0,x.jsx)(`th`,{style:{padding:`4px 8px`},children:`HP`}),(0,x.jsx)(`th`,{style:{padding:`4px 8px`},children:`MPG`}),(0,x.jsx)(`th`,{style:{padding:`4px 8px`},children:`Origin`})]})}),(0,x.jsx)(`tbody`,{children:S.map((e,t)=>(0,x.jsxs)(`tr`,{style:{borderBottom:`1px solid var(--color-border)`},children:[(0,x.jsx)(`td`,{style:{padding:`4px 8px`},children:e.name}),(0,x.jsx)(`td`,{style:{padding:`4px 8px`},children:e.hp}),(0,x.jsx)(`td`,{style:{padding:`4px 8px`},children:e.mpg}),(0,x.jsx)(`td`,{style:{padding:`4px 8px`},children:e.origin})]},t))})]})})]})]})}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const [brushRange, setBrushRange] = useState<[number, number] | null>(null);
    const allData = useMemo(() => raw.filter(d => d.Horsepower != null && d.Miles_per_Gallon != null && d.Origin != null), [raw]);
    const filteredData = useMemo(() => {
      if (!brushRange) {
        return allData;
      }
      return allData.filter(d => d.Horsepower >= brushRange[0] && d.Horsepower <= brushRange[1]);
    }, [allData, brushRange]);

    // Scatter data
    const scatterData = useMemo(() => allData.map(d => ({
      hp: d.Horsepower,
      mpg: d.Miles_per_Gallon
    })), [allData]);

    // Bar data — average MPG by origin, from filtered set
    const barData = useMemo(() => {
      const byOrigin = new Map<string, {
        sum: number;
        count: number;
      }>();
      for (const d of filteredData) {
        const e = byOrigin.get(d.Origin) ?? {
          sum: 0,
          count: 0
        };
        e.sum += d.Miles_per_Gallon;
        e.count += 1;
        byOrigin.set(d.Origin, e);
      }
      return [...byOrigin.entries()].map(([origin, {
        sum,
        count
      }]) => ({
        origin,
        avgMpg: Math.round(sum / count * 10) / 10
      })).sort((a, b) => b.avgMpg - a.avgMpg);
    }, [filteredData]);

    // Table data — top 10 from filtered set
    const tableData = useMemo(() => filteredData.slice(0, 10).map(d => ({
      name: d.Name,
      hp: d.Horsepower,
      mpg: d.Miles_per_Gallon,
      origin: d.Origin
    })), [filteredData]);
    if (!allData.length) {
      return <Text type="supporting">Loading\\u2026</Text>;
    }
    const c = colors.categorical(3);
    return <Stack direction="vertical" gap={6}>
        <Heading level={3}>Coordinated Views</Heading>
        <Text type="supporting" color="secondary">
          Brush on the scatter to filter the bar chart and table below.
          {brushRange ? \` Showing \${filteredData.length} cars with \${Math.round(brushRange[0])}\\u2013\${Math.round(brushRange[1])} HP.\` : \` Showing all \${allData.length} cars.\`}
        </Text>

        {/* Scatter with brush */}
        <Stack direction="vertical" gap={1}>
          <Text type="label">Horsepower vs MPG</Text>
          <Chart data={scatterData} xKey="hp" yKeys={['mpg']} yBaseline="data" height={280}>
            <ChartGrid horizontal vertical />
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
            <ChartDot dataKey="mpg" color={c[0]} radius={3} />
            <ChartBrush onBrush={range => setBrushRange(range.x)} onClear={() => setBrushRange(null)} />
            {brushRange && <>
                <ChartReferenceLine x={brushRange[0]} color={c[0]} strokeDasharray="none" />
                <ChartReferenceLine x={brushRange[1]} color={c[0]} strokeDasharray="none" />
              </>}
          </Chart>
        </Stack>

        {/* Bar chart — reacts to brush */}
        <Stack direction="vertical" gap={1}>
          <Text type="label">Average MPG by Origin (filtered)</Text>
          <Chart data={barData} xKey="origin" yKeys={['avgMpg']} height={200}>
            <ChartGrid horizontal />
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
            <ChartBar dataKey="avgMpg" color={c[1]} />
          </Chart>
        </Stack>

        {/* Table — reacts to brush */}
        <Stack direction="vertical" gap={1}>
          <Text type="label">Top 10 cars (filtered)</Text>
          <div style={{
          fontSize: 12,
          overflow: 'auto'
        }}>
            <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
              <thead>
                <tr style={{
                borderBottom: '1px solid var(--color-border)',
                textAlign: 'left'
              }}>
                  <th style={{
                  padding: '4px 8px'
                }}>Name</th>
                  <th style={{
                  padding: '4px 8px'
                }}>HP</th>
                  <th style={{
                  padding: '4px 8px'
                }}>MPG</th>
                  <th style={{
                  padding: '4px 8px'
                }}>Origin</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((d, i) => <tr key={i} style={{
                borderBottom: '1px solid var(--color-border)'
              }}>
                    <td style={{
                  padding: '4px 8px'
                }}>{d.name}</td>
                    <td style={{
                  padding: '4px 8px'
                }}>{d.hp}</td>
                    <td style={{
                  padding: '4px 8px'
                }}>{d.mpg}</td>
                    <td style={{
                  padding: '4px 8px'
                }}>{d.origin}</td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </Stack>
      </Stack>;
  }
}`,...C.parameters?.docs?.source},description:{story:`Brush on scatter filters bar chart + table — coordinated views`,...C.parameters?.docs?.description}}},w=[`CoordinatedViews`]}))();export{C as CoordinatedViews,w as __namedExportsOrder,S as default};