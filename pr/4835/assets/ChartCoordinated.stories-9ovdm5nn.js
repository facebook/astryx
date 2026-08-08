import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./Heading-CaMVckJS.js";import{n as s,t as c}from"./Stack-D-ryFIvw.js";import{i as l,n as u,r as d,t as f}from"./ChartAxis-BYz-LLki.js";import{n as p,t as m}from"./ChartGrid-DYJI9wDe.js";import{n as h,t as g}from"./ChartBar-_JDpTWij.js";import{n as _,t as v}from"./ChartDot-DWw4hw5I.js";import{n as y,t as b}from"./useChartColors-tODQlwNr.js";import{i as x,n as S,r as C,t as w}from"./ChartReferenceLine-Draztu5F.js";import{n as T,t as E}from"./useDataset-DRbDCrrm.js";var D,O,k,A,j;function M(){return(M=e((()=>{D=t(),l(),u(),p(),_(),h(),x(),S(),b(),s(),n(),a(),E(),O=i(),k={title:`Lab/Chart Interactions/Coordinated Views`},A={render:()=>{let e=y(),[t]=T(`cars.json`),[n,i]=(0,D.useState)(null),a=(0,D.useMemo)(()=>t.filter(e=>e.Horsepower!=null&&e.Miles_per_Gallon!=null&&e.Origin!=null),[t]),s=(0,D.useMemo)(()=>n?a.filter(e=>e.Horsepower>=n[0]&&e.Horsepower<=n[1]):a,[a,n]),l=(0,D.useMemo)(()=>a.map(e=>({hp:e.Horsepower,mpg:e.Miles_per_Gallon})),[a]),u=(0,D.useMemo)(()=>{let e=new Map;for(let t of s){let n=e.get(t.Origin)??{sum:0,count:0};n.sum+=t.Miles_per_Gallon,n.count+=1,e.set(t.Origin,n)}return[...e.entries()].map(([e,{sum:t,count:n}])=>({origin:e,avgMpg:Math.round(t/n*10)/10})).sort((e,t)=>t.avgMpg-e.avgMpg)},[s]),p=(0,D.useMemo)(()=>s.slice(0,10).map(e=>({name:e.Name,hp:e.Horsepower,mpg:e.Miles_per_Gallon,origin:e.Origin})),[s]);if(!a.length)return(0,O.jsx)(r,{type:`supporting`,children:`Loading\\u2026`});let h=e.categorical(3);return(0,O.jsxs)(c,{direction:`vertical`,gap:6,children:[(0,O.jsx)(o,{level:3,children:`Coordinated Views`}),(0,O.jsxs)(r,{type:`supporting`,color:`secondary`,children:[`Brush on the scatter to filter the bar chart and table below.`,n?` Showing ${s.length} cars with ${Math.round(n[0])}\u2013${Math.round(n[1])} HP.`:` Showing all ${a.length} cars.`]}),(0,O.jsxs)(c,{direction:`vertical`,gap:1,children:[(0,O.jsx)(r,{type:`label`,children:`Horsepower vs MPG`}),(0,O.jsxs)(d,{data:l,xKey:`hp`,yKeys:[`mpg`],yBaseline:`data`,height:280,children:[(0,O.jsx)(m,{horizontal:!0,vertical:!0}),(0,O.jsx)(f,{position:`bottom`}),(0,O.jsx)(f,{position:`left`}),(0,O.jsx)(v,{dataKey:`mpg`,color:h[0],radius:3}),(0,O.jsx)(C,{onBrush:e=>i(e.x),onClear:()=>i(null)}),n&&(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(w,{x:n[0],color:h[0],strokeDasharray:`none`}),(0,O.jsx)(w,{x:n[1],color:h[0],strokeDasharray:`none`})]})]})]}),(0,O.jsxs)(c,{direction:`vertical`,gap:1,children:[(0,O.jsx)(r,{type:`label`,children:`Average MPG by Origin (filtered)`}),(0,O.jsxs)(d,{data:u,xKey:`origin`,yKeys:[`avgMpg`],height:200,children:[(0,O.jsx)(m,{horizontal:!0}),(0,O.jsx)(f,{position:`bottom`}),(0,O.jsx)(f,{position:`left`}),(0,O.jsx)(g,{dataKey:`avgMpg`,color:h[1]})]})]}),(0,O.jsxs)(c,{direction:`vertical`,gap:1,children:[(0,O.jsx)(r,{type:`label`,children:`Top 10 cars (filtered)`}),(0,O.jsx)(`div`,{style:{fontSize:12,overflow:`auto`},children:(0,O.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`},children:[(0,O.jsx)(`thead`,{children:(0,O.jsxs)(`tr`,{style:{borderBottom:`1px solid var(--color-border)`,textAlign:`left`},children:[(0,O.jsx)(`th`,{style:{padding:`4px 8px`},children:`Name`}),(0,O.jsx)(`th`,{style:{padding:`4px 8px`},children:`HP`}),(0,O.jsx)(`th`,{style:{padding:`4px 8px`},children:`MPG`}),(0,O.jsx)(`th`,{style:{padding:`4px 8px`},children:`Origin`})]})}),(0,O.jsx)(`tbody`,{children:p.map((e,t)=>(0,O.jsxs)(`tr`,{style:{borderBottom:`1px solid var(--color-border)`},children:[(0,O.jsx)(`td`,{style:{padding:`4px 8px`},children:e.name}),(0,O.jsx)(`td`,{style:{padding:`4px 8px`},children:e.hp}),(0,O.jsx)(`td`,{style:{padding:`4px 8px`},children:e.mpg}),(0,O.jsx)(`td`,{style:{padding:`4px 8px`},children:e.origin})]},t))})]})})]})]})}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`Brush on scatter filters bar chart + table — coordinated views`,...A.parameters?.docs?.description}}},j=[`CoordinatedViews`]})))()}M();export{A as CoordinatedViews,j as __namedExportsOrder,k as default};