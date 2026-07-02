import{ah as m,a1 as t,T as d}from"./iframe-BzSUXdLu.js";import{S as G}from"./Stack-Tj4_Mi0e.js";import{u as y}from"./useDataset-DsOiDR-W.js";import{C as p,a as l}from"./ChartAxis-BP1uRaCs.js";import{u as h}from"./useChartColors-3H2gATqi.js";import{C as j}from"./ChartGrid-DGGih24M.js";import{C as K}from"./ChartBar-B0gt8r9t.js";import{C as M}from"./ChartTooltip-CxqGiGQd.js";import{C as S}from"./ChartArea-CjBrWd_E.js";import{C as L}from"./ChartLine-DIdfZAf8.js";import{C as A}from"./ChartHeatmapGL-DyRzknJF.js";import{C as w}from"./ChartLegend-C93K5Rqv.js";import{C as O}from"./ChartDot-QL2oYcbl.js";import{C as T}from"./ChartDotGL-x7c29IBt.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";import"./ChartContext-DRGdD7Jn.js";import"./linear-gs3faI6G.js";import"./index-Bpoftj0g.js";import"./index-B-NS6A_P.js";import"./area-C5zWI711.js";import"./array-2GBN5xbU.js";import"./monotone-BKrwi6Sb.js";import"./webgl-B2CDFegl.js";const at={title:"Lab/Chart",component:p,tags:["autodocs"],parameters:{docs:{description:{component:`\`Chart\` — composable chart system built on d3. All marks share a single
coordinate space via React context.

Datasets from [vega-datasets](https://github.com/vega/vega-datasets) (CDN).`}}}},g={render:()=>{const n=h(),[a,c]=y("barley.json"),i=m.useMemo(()=>{if(!a.length)return[];const e=new Map;for(const r of a){const s=e.get(r.variety)??{sum:0,count:0};s.sum+=r.yield,s.count+=1,e.set(r.variety,s)}return[...e.entries()].map(([r,{sum:s,count:o}])=>({variety:r,avgYield:Math.round(s/o*10)/10})).sort((r,s)=>s.avgYield-r.avgYield).slice(0,10)},[a]);return c?t.jsx(d,{type:"supporting",children:"Loading…"}):t.jsxs(p,{data:i,xKey:"variety",yKeys:["avgYield"],height:300,children:[t.jsx(j,{horizontal:!0}),t.jsx(l,{position:"bottom"}),t.jsx(l,{position:"left"}),t.jsx(K,{dataKey:"avgYield",color:n.categorical(1)[0]}),t.jsx(M,{})]})}},x={render:()=>{const n=h(),[a,c]=y("stocks.csv"),i=m.useMemo(()=>{if(!a.length)return[];const r=a.filter(o=>o.symbol==="AAPL"||o.symbol==="GOOG"),s=new Map;for(const o of r){const u=s.get(o.date)??{date:o.date};u[o.symbol]=o.price,s.set(o.date,u)}return[...s.values()].filter(o=>o.AAPL!=null&&o.GOOG!=null).slice(-12)},[a]);if(c)return t.jsx(d,{type:"supporting",children:"Loading…"});const e=n.categorical(2);return t.jsxs(p,{data:i,xKey:"date",yKeys:["AAPL","GOOG"],yBaseline:"data",height:300,children:[t.jsx(j,{horizontal:!0}),t.jsx(l,{position:"bottom"}),t.jsx(l,{position:"left"}),t.jsx(L,{dataKey:"AAPL",color:e[0],dots:!0}),t.jsx(L,{dataKey:"GOOG",color:e[1],dots:!0}),t.jsx(w,{items:[{label:"AAPL",color:e[0]},{label:"GOOG",color:e[1]}]}),t.jsx(M,{})]})}},f={render:()=>{const n=h(),[a,c]=y("cars.json"),i=m.useMemo(()=>a.filter(e=>e.Horsepower!=null&&e.Miles_per_Gallon!=null).map(e=>({hp:e.Horsepower,mpg:e.Miles_per_Gallon})),[a]);return c?t.jsx(d,{type:"supporting",children:"Loading…"}):t.jsxs(p,{data:i,xKey:"hp",yKeys:["mpg"],yBaseline:"data",height:350,children:[t.jsx(j,{horizontal:!0,vertical:!0}),t.jsx(l,{position:"bottom"}),t.jsx(l,{position:"left"}),t.jsx(O,{dataKey:"mpg",color:n.categorical(1)[0],radius:3}),t.jsx(M,{crosshair:"xy"})]})}},C={render:()=>{const n=h(),[a,c]=y("flights-10k.json"),i=m.useMemo(()=>a.filter(e=>e.delay!=null&&e.distance!=null).map(e=>({distance:e.distance,delay:e.delay})),[a]);return c?t.jsx(d,{type:"supporting",children:"Loading 10k flights…"}):t.jsxs(G,{direction:"vertical",gap:2,children:[t.jsxs(d,{type:"supporting",color:"secondary",children:[i.length.toLocaleString()," flights"]}),t.jsxs(p,{data:i,xKey:"distance",yKeys:["delay"],yBaseline:"zero",height:400,children:[t.jsx(j,{horizontal:!0}),t.jsx(l,{position:"bottom"}),t.jsx(l,{position:"left"}),t.jsx(T,{dataKey:"delay",color:n.categorical(1)[0],size:3,opacity:.3})]})]})}},b={render:()=>{const n=h(),[a,c]=y("seattle-weather.csv"),i=m.useMemo(()=>{if(!a.length)return[];const e=new Map;for(const r of a){const s=String(r.date).slice(0,7),o=e.get(s)??{maxSum:0,minSum:0,count:0};o.maxSum+=r.temp_max,o.minSum+=r.temp_min,o.count+=1,e.set(s,o)}return[...e.entries()].map(([r,{maxSum:s,minSum:o,count:u}])=>({month:r,avgMax:Math.round(s/u*10)/10,avgMin:Math.round(o/u*10)/10,avgMid:Math.round((s+o)/(u*2)*10)/10})).sort((r,s)=>r.month.localeCompare(s.month)).slice(-24)},[a]);return c?t.jsx(d,{type:"supporting",children:"Loading…"}):t.jsxs(p,{data:i,xKey:"month",yKeys:["avgMax","avgMin"],yBaseline:"data",height:300,children:[t.jsx(j,{horizontal:!0}),t.jsx(l,{position:"bottom"}),t.jsx(l,{position:"left"}),t.jsx(S,{yUpper:"avgMax",yLower:"avgMin",color:n.categorical(1)[0],opacity:.15}),t.jsx(L,{dataKey:"avgMid",color:n.categorical(1)[0],dots:!0}),t.jsx(M,{})]})}},v={render:()=>{const n=h(),[a,c]=y("gapminder.json"),i=m.useMemo(()=>{if(!a.length)return[];const e=["United States","China","India","Brazil","Japan","Germany","Nigeria","Russia"];return a.filter(r=>e.includes(r.country)&&r.year>=1960&&r.year%10===0).map(r=>({country:r.country,year:String(r.year),lifeExp:Math.round(r.life_expect)}))},[a]);return c?t.jsx(d,{type:"supporting",children:"Loading…"}):t.jsxs(p,{data:i,xKey:"year",yKeys:["lifeExp"],height:300,children:[t.jsx(l,{position:"bottom"}),t.jsx(A,{xKey:"year",yKey:"country",valueKey:"lifeExp",colorRange:n.sequential.blue(5)}),t.jsx(w,{gradient:n.sequential.blue(5),domain:[30,85],label:"Life Expectancy"})]})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:"Iowa barley yields — average by variety (barley.json)",...g.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:"AAPL vs GOOG monthly prices (stocks.csv)",...x.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:"Horsepower vs MPG — 406 cars (cars.json)",...f.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:"Flight delay vs distance — 10k points via WebGL (flights-10k.json)",...C.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:"Seattle temperature range — monthly avg min/max band (seattle-weather.csv)",...b.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:"Life expectancy by country × decade (gapminder.json)",...v.parameters?.docs?.description}}};const ot=["BarChart","LineChart","ScatterPlot","WebGLScatter","ConfidenceBand","Heatmap"];export{g as BarChart,b as ConfidenceBand,v as Heatmap,x as LineChart,f as ScatterPlot,C as WebGLScatter,ot as __namedExportsOrder,at as default};
