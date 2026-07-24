import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{c as a}from"./Stack-C7dTtCDZ.js";import{u as o}from"./iframe-iQ3nuRH_.js";import{At as s,Et as c,Ot as l,St as u,bt as d,ct as f,ft as p,it as m,mt as h,nt as g,t as _,tt as v,wt as y}from"./src-DKsOurnU.js";import{n as b,t as x}from"./useDataset-D0R9TzHE.js";var S,C,w,T,E,D,O,k,A,j;e((()=>{S=t(n()),_(),o(),x(),C=r(),w={title:`Lab/Chart`,component:s,tags:[`autodocs`],parameters:{docs:{description:{component:`\`Chart\` — composable chart system built on d3. All marks share a single
coordinate space via React context.

Datasets from [vega-datasets](https://github.com/vega/vega-datasets) (CDN).`}}}},T={render:()=>{let e=v(),[t,n]=b(`barley.json`),r=(0,S.useMemo)(()=>{if(!t.length)return[];let e=new Map;for(let n of t){let t=e.get(n.variety)??{sum:0,count:0};t.sum+=n.yield,t.count+=1,e.set(n.variety,t)}return[...e.entries()].map(([e,{sum:t,count:n}])=>({variety:e,avgYield:Math.round(t/n*10)/10})).sort((e,t)=>t.avgYield-e.avgYield).slice(0,10)},[t]);return n?(0,C.jsx)(i,{type:`supporting`,children:`Loading…`}):(0,C.jsxs)(s,{data:r,xKey:`variety`,yKeys:[`avgYield`],height:300,children:[(0,C.jsx)(c,{horizontal:!0}),(0,C.jsx)(l,{position:`bottom`}),(0,C.jsx)(l,{position:`left`}),(0,C.jsx)(y,{dataKey:`avgYield`,color:e.categorical(1)[0]}),(0,C.jsx)(m,{})]})}},E={render:()=>{let e=v(),[t,n]=b(`stocks.csv`),r=(0,S.useMemo)(()=>{if(!t.length)return[];let e=t.filter(e=>e.symbol===`AAPL`||e.symbol===`GOOG`),n=new Map;for(let t of e){let e=n.get(t.date)??{date:t.date};e[t.symbol]=t.price,n.set(t.date,e)}return[...n.values()].filter(e=>e.AAPL!=null&&e.GOOG!=null).slice(-12)},[t]);if(n)return(0,C.jsx)(i,{type:`supporting`,children:`Loading…`});let a=e.categorical(2);return(0,C.jsxs)(s,{data:r,xKey:`date`,yKeys:[`AAPL`,`GOOG`],yBaseline:`data`,height:300,children:[(0,C.jsx)(c,{horizontal:!0}),(0,C.jsx)(l,{position:`bottom`}),(0,C.jsx)(l,{position:`left`}),(0,C.jsx)(u,{dataKey:`AAPL`,color:a[0],dots:!0}),(0,C.jsx)(u,{dataKey:`GOOG`,color:a[1],dots:!0}),(0,C.jsx)(g,{items:[{label:`AAPL`,color:a[0]},{label:`GOOG`,color:a[1]}]}),(0,C.jsx)(m,{})]})}},D={render:()=>{let e=v(),[t,n]=b(`cars.json`),r=(0,S.useMemo)(()=>t.filter(e=>e.Horsepower!=null&&e.Miles_per_Gallon!=null).map(e=>({hp:e.Horsepower,mpg:e.Miles_per_Gallon})),[t]);return n?(0,C.jsx)(i,{type:`supporting`,children:`Loading…`}):(0,C.jsxs)(s,{data:r,xKey:`hp`,yKeys:[`mpg`],yBaseline:`data`,height:350,children:[(0,C.jsx)(c,{horizontal:!0,vertical:!0}),(0,C.jsx)(l,{position:`bottom`}),(0,C.jsx)(l,{position:`left`}),(0,C.jsx)(h,{dataKey:`mpg`,color:e.categorical(1)[0],radius:3}),(0,C.jsx)(m,{crosshair:`xy`})]})}},O={render:()=>{let e=v(),[t,n]=b(`flights-10k.json`),r=(0,S.useMemo)(()=>t.filter(e=>e.delay!=null&&e.distance!=null).map(e=>({distance:e.distance,delay:e.delay})),[t]);return n?(0,C.jsx)(i,{type:`supporting`,children:`Loading 10k flights…`}):(0,C.jsxs)(a,{direction:`vertical`,gap:2,children:[(0,C.jsxs)(i,{type:`supporting`,color:`secondary`,children:[r.length.toLocaleString(),` flights`]}),(0,C.jsxs)(s,{data:r,xKey:`distance`,yKeys:[`delay`],yBaseline:`zero`,height:400,children:[(0,C.jsx)(c,{horizontal:!0}),(0,C.jsx)(l,{position:`bottom`}),(0,C.jsx)(l,{position:`left`}),(0,C.jsx)(p,{dataKey:`delay`,color:e.categorical(1)[0],size:3,opacity:.3})]})]})}},k={render:()=>{let e=v(),[t,n]=b(`seattle-weather.csv`),r=(0,S.useMemo)(()=>{if(!t.length)return[];let e=new Map;for(let n of t){let t=String(n.date).slice(0,7),r=e.get(t)??{maxSum:0,minSum:0,count:0};r.maxSum+=n.temp_max,r.minSum+=n.temp_min,r.count+=1,e.set(t,r)}return[...e.entries()].map(([e,{maxSum:t,minSum:n,count:r}])=>({month:e,avgMax:Math.round(t/r*10)/10,avgMin:Math.round(n/r*10)/10,avgMid:Math.round((t+n)/(r*2)*10)/10})).sort((e,t)=>e.month.localeCompare(t.month)).slice(-24)},[t]);return n?(0,C.jsx)(i,{type:`supporting`,children:`Loading…`}):(0,C.jsxs)(s,{data:r,xKey:`month`,yKeys:[`avgMax`,`avgMin`],yBaseline:`data`,height:300,children:[(0,C.jsx)(c,{horizontal:!0}),(0,C.jsx)(l,{position:`bottom`}),(0,C.jsx)(l,{position:`left`}),(0,C.jsx)(d,{yUpper:`avgMax`,yLower:`avgMin`,color:e.categorical(1)[0],opacity:.15}),(0,C.jsx)(u,{dataKey:`avgMid`,color:e.categorical(1)[0],dots:!0}),(0,C.jsx)(m,{})]})}},A={render:()=>{let e=v(),[t,n]=b(`gapminder.json`),r=(0,S.useMemo)(()=>{if(!t.length)return[];let e=[`United States`,`China`,`India`,`Brazil`,`Japan`,`Germany`,`Nigeria`,`Russia`];return t.filter(t=>e.includes(t.country)&&t.year>=1960&&t.year%10==0).map(e=>({country:e.country,year:String(e.year),lifeExp:Math.round(e.life_expect)}))},[t]);return n?(0,C.jsx)(i,{type:`supporting`,children:`Loading…`}):(0,C.jsxs)(s,{data:r,xKey:`year`,yKeys:[`lifeExp`],height:300,children:[(0,C.jsx)(l,{position:`bottom`}),(0,C.jsx)(f,{xKey:`year`,yKey:`country`,valueKey:`lifeExp`,colorRange:e.sequential.blue(5)}),(0,C.jsx)(g,{gradient:e.sequential.blue(5),domain:[30,85],label:`Life Expectancy`})]})}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw, loading] = useDataset<Barley>('barley.json');
    const data = useMemo(() => {
      if (!raw.length) {
        return [];
      }
      const byVariety = new Map<string, {
        sum: number;
        count: number;
      }>();
      for (const d of raw) {
        const e = byVariety.get(d.variety) ?? {
          sum: 0,
          count: 0
        };
        e.sum += d.yield;
        e.count += 1;
        byVariety.set(d.variety, e);
      }
      return [...byVariety.entries()].map(([variety, {
        sum,
        count
      }]) => ({
        variety,
        avgYield: Math.round(sum / count * 10) / 10
      })).sort((a, b) => b.avgYield - a.avgYield).slice(0, 10);
    }, [raw]);
    if (loading) {
      return <Text type="supporting">Loading…</Text>;
    }
    return <Chart data={data} xKey="variety" yKeys={['avgYield']} height={300}>
        <ChartGrid horizontal />
        <ChartAxis position="bottom" />
        <ChartAxis position="left" />
        <ChartBar dataKey="avgYield" color={colors.categorical(1)[0]} />
        <ChartTooltip />
      </Chart>;
  }
}`,...T.parameters?.docs?.source},description:{story:`Iowa barley yields — average by variety (barley.json)`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw, loading] = useDataset<Stock>('stocks.csv');
    const data = useMemo(() => {
      if (!raw.length) {
        return [];
      }
      const filtered = raw.filter(d => d.symbol === 'AAPL' || d.symbol === 'GOOG');
      const byDate = new Map<string, Record<string, unknown>>();
      for (const d of filtered) {
        const e = byDate.get(d.date) ?? {
          date: d.date
        };
        e[d.symbol] = d.price;
        byDate.set(d.date, e);
      }
      return [...byDate.values()].filter(d => d.AAPL != null && d.GOOG != null).slice(-12);
    }, [raw]);
    if (loading) {
      return <Text type="supporting">Loading…</Text>;
    }
    const c = colors.categorical(2);
    return <Chart data={data} xKey="date" yKeys={['AAPL', 'GOOG']} yBaseline="data" height={300}>
        <ChartGrid horizontal />
        <ChartAxis position="bottom" />
        <ChartAxis position="left" />
        <ChartLine dataKey="AAPL" color={c[0]} dots />
        <ChartLine dataKey="GOOG" color={c[1]} dots />
        <ChartLegend items={[{
        label: 'AAPL',
        color: c[0]
      }, {
        label: 'GOOG',
        color: c[1]
      }]} />
        <ChartTooltip />
      </Chart>;
  }
}`,...E.parameters?.docs?.source},description:{story:`AAPL vs GOOG monthly prices (stocks.csv)`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw, loading] = useDataset<Car>('cars.json');
    const data = useMemo(() => {
      return raw.filter(d => d.Horsepower != null && d.Miles_per_Gallon != null).map(d => ({
        hp: d.Horsepower,
        mpg: d.Miles_per_Gallon
      }));
    }, [raw]);
    if (loading) {
      return <Text type="supporting">Loading…</Text>;
    }
    return <Chart data={data} xKey="hp" yKeys={['mpg']} yBaseline="data" height={350}>
        <ChartGrid horizontal vertical />
        <ChartAxis position="bottom" />
        <ChartAxis position="left" />
        <ChartDot dataKey="mpg" color={colors.categorical(1)[0]} radius={3} />
        <ChartTooltip crosshair="xy" />
      </Chart>;
  }
}`,...D.parameters?.docs?.source},description:{story:`Horsepower vs MPG — 406 cars (cars.json)`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw, loading] = useDataset<Flight>('flights-10k.json');
    const data = useMemo(() => {
      return raw.filter(d => d.delay != null && d.distance != null).map(d => ({
        distance: d.distance,
        delay: d.delay
      }));
    }, [raw]);
    if (loading) {
      return <Text type="supporting">Loading 10k flights…</Text>;
    }
    return <Stack direction="vertical" gap={2}>
        <Text type="supporting" color="secondary">
          {data.length.toLocaleString()} flights
        </Text>
        <Chart data={data} xKey="distance" yKeys={['delay']} yBaseline="zero" height={400}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDotGL dataKey="delay" color={colors.categorical(1)[0]} size={3} opacity={0.3} />
        </Chart>
      </Stack>;
  }
}`,...O.parameters?.docs?.source},description:{story:`Flight delay vs distance — 10k points via WebGL (flights-10k.json)`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw, loading] = useDataset<Weather>('seattle-weather.csv');
    const data = useMemo(() => {
      if (!raw.length) {
        return [];
      }
      const byMonth = new Map<string, {
        maxSum: number;
        minSum: number;
        count: number;
      }>();
      for (const d of raw) {
        const month = String(d.date).slice(0, 7);
        const e = byMonth.get(month) ?? {
          maxSum: 0,
          minSum: 0,
          count: 0
        };
        e.maxSum += d.temp_max;
        e.minSum += d.temp_min;
        e.count += 1;
        byMonth.set(month, e);
      }
      return [...byMonth.entries()].map(([month, {
        maxSum,
        minSum,
        count
      }]) => ({
        month,
        avgMax: Math.round(maxSum / count * 10) / 10,
        avgMin: Math.round(minSum / count * 10) / 10,
        avgMid: Math.round((maxSum + minSum) / (count * 2) * 10) / 10
      })).sort((a, b) => a.month.localeCompare(b.month)).slice(-24);
    }, [raw]);
    if (loading) {
      return <Text type="supporting">Loading…</Text>;
    }
    return <Chart data={data} xKey="month" yKeys={['avgMax', 'avgMin']} yBaseline="data" height={300}>
        <ChartGrid horizontal />
        <ChartAxis position="bottom" />
        <ChartAxis position="left" />
        <ChartArea yUpper="avgMax" yLower="avgMin" color={colors.categorical(1)[0]} opacity={0.15} />
        <ChartLine dataKey="avgMid" color={colors.categorical(1)[0]} dots />
        <ChartTooltip />
      </Chart>;
  }
}`,...k.parameters?.docs?.source},description:{story:`Seattle temperature range — monthly avg min/max band (seattle-weather.csv)`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw, loading] = useDataset<Gapminder>('gapminder.json');
    const data = useMemo(() => {
      if (!raw.length) {
        return [];
      }
      const countries = ['United States', 'China', 'India', 'Brazil', 'Japan', 'Germany', 'Nigeria', 'Russia'];
      return raw.filter(d => countries.includes(d.country) && d.year >= 1960 && d.year % 10 === 0).map(d => ({
        country: d.country,
        year: String(d.year),
        lifeExp: Math.round(d.life_expect)
      }));
    }, [raw]);
    if (loading) {
      return <Text type="supporting">Loading…</Text>;
    }
    return <Chart data={data} xKey="year" yKeys={['lifeExp']} height={300}>
        <ChartAxis position="bottom" />
        <ChartHeatmapGL xKey="year" yKey="country" valueKey="lifeExp" colorRange={colors.sequential.blue(5)} />
        <ChartLegend gradient={colors.sequential.blue(5)} domain={[30, 85]} label="Life Expectancy" />
      </Chart>;
  }
}`,...A.parameters?.docs?.source},description:{story:`Life expectancy by country × decade (gapminder.json)`,...A.parameters?.docs?.description}}},j=[`BarChart`,`LineChart`,`ScatterPlot`,`WebGLScatter`,`ConfidenceBand`,`Heatmap`]}))();export{T as BarChart,k as ConfidenceBand,A as Heatmap,E as LineChart,D as ScatterPlot,O as WebGLScatter,j as __namedExportsOrder,w as default};