import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{A as i,M as a,O as o,a as s,c,o as l,t as u,u as d}from"./src-BIUMvWXW.js";import{c as f,n as p,r as m}from"./_data-DTSixHX1.js";var h,g,_,v,y,b,x,S,C;e((()=>{h=t(n()),u(),m(),g=r(),_={title:`Charts/WebGL`,component:a},v=(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(i,{position:`bottom`}),(0,g.jsx)(i,{position:`left`})]}),y={name:`Scatter — static (high-performance)`,render:()=>(0,g.jsx)(a,{data:f,xKey:`x`,title:`WebGL scatter — static (dotGL)`,series:[d(`y`,{color:`#3b82f6`,size:5})],grid:(0,g.jsx)(o,{horizontal:!0,vertical:!0}),axes:v,height:400})},b={name:`Interactive scatter — hover + tooltip`,render:()=>(0,g.jsx)(a,{data:f,xKey:`x`,title:`WebGL scatter — interactive hover (dotGLInteractive)`,series:[c(`y`,{color:`#6b1efd`,size:6,renderTooltip:e=>(0,g.jsxs)(`span`,{children:[`x: `,Math.round(e.x),`, y: `,Math.round(e.y)]})})],grid:(0,g.jsx)(o,{horizontal:!0,vertical:!0}),axes:v,height:400})},x={render:()=>(0,g.jsx)(a,{data:p,xKey:`hour`,title:`Traffic heatmap`,series:[l({xKey:`hour`,yKey:`day`,valueKey:`traffic`,colorRange:[`#eff6ff`,`#1e40af`]})],axes:(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(i,{position:`bottom`}),(0,g.jsx)(i,{position:`left`,showAxisLine:!0})]}),height:280})},S={render:()=>{let e=(0,h.useRef)(null),[t,n]=(0,h.useState)(60);return(0,h.useEffect)(()=>{let t=0,r=setInterval(()=>{e.current?.push(t,50+Math.sin(t/10)*30+Math.random()*10),t++,n(Math.max(60,t))},200);return()=>clearInterval(r)},[]),(0,g.jsx)(a,{data:[],xKey:`x`,title:`Live stream (streamGL)`,xDomain:[Math.max(0,t-60),t],yDomain:[0,100],series:[s({handleRef:e,color:`#3b82f6`})],grid:(0,g.jsx)(o,{}),axes:v,height:300})}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Scatter — static (high-performance)',
  render: () => <Chart data={scatterData} xKey="x" title="WebGL scatter — static (dotGL)" series={[dotGL('y', {
    color: '#3b82f6',
    size: 5
  })]} grid={<ChartGrid horizontal vertical />} axes={axes} height={400} />
}`,...y.parameters?.docs?.source},description:{story:`Static, high-performance GPU scatter (\`dotGL\`) — one draw call, scales to
tens of thousands of points. Intentionally has NO hover/tooltip; for
interactivity see "Interactive scatter" below.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Interactive scatter — hover + tooltip',
  render: () => <Chart data={scatterData} xKey="x" title="WebGL scatter — interactive hover (dotGLInteractive)" series={[dotGLInteractive('y', {
    color: '#6b1efd',
    size: 6,
    renderTooltip: (d: Record<string, unknown>) => <span>
              x: {Math.round(d.x as number)}, y: {Math.round(d.y as number)}
            </span>
  })]} grid={<ChartGrid horizontal vertical />} axes={axes} height={400} />
}`,...b.parameters?.docs?.source},description:{story:"GPU scatter with color-picking hover (`dotGLInteractive`) — hover any point\nfor a highlight + tooltip. O(1) hit detection regardless of point count.",...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Chart data={heatmapData} xKey="hour" title="Traffic heatmap" series={[heatmapGL({
    xKey: 'hour',
    yKey: 'day',
    valueKey: 'traffic',
    colorRange: ['#eff6ff', '#1e40af']
  })]} axes={<>
          <ChartAxis position="bottom" />
          <ChartAxis position="left" showAxisLine />
        </>} height={280} />
}`,...x.parameters?.docs?.source},description:{story:`GPU heatmap — a 2D grid of colored cells (traffic by hour x day).`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const handleRef = useRef<StreamGLHandle | null>(null) as MutableRefObject<StreamGLHandle | null>;
    const WINDOW = 60;
    const [windowEnd, setWindowEnd] = useState(WINDOW);
    useEffect(() => {
      let t = 0;
      const interval = setInterval(() => {
        handleRef.current?.push(t, 50 + Math.sin(t / 10) * 30 + Math.random() * 10);
        t++;
        setWindowEnd(Math.max(WINDOW, t));
      }, 200);
      return () => clearInterval(interval);
    }, []);
    return <Chart data={[]} xKey="x" title="Live stream (streamGL)" xDomain={[Math.max(0, windowEnd - WINDOW), windowEnd]} yDomain={[0, 100]} series={[streamGL({
      handleRef,
      color: '#3b82f6'
    })]} grid={<ChartGrid />} axes={axes} height={300} />;
  }
}`,...S.parameters?.docs?.source},description:{story:`Streaming line via an imperative push handle + a sliding domain window.`,...S.parameters?.docs?.description}}},C=[`Scatter`,`InteractiveScatter`,`Heatmap`,`Streaming`]}))();export{x as Heatmap,b as InteractiveScatter,y as Scatter,S as Streaming,C as __namedExportsOrder,_ as default};