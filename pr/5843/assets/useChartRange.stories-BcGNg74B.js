import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-CUw_qAJO.js";import{t as a}from"./Heading-MtotQutU.js";import{c as o}from"./Stack-Dntpv-r2.js";import{t as s}from"./Text-B194cPHg.js";import{u as c}from"./iframe-CdCuTf7P.js";import{$ as l,Et as u,Ot as d,Z as f,it as p,t as m,wt as h}from"./src-CcDERv45.js";function g(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function _({streamRef:e,push:t,reset:n,createSamples:r,captureSampleCount:i,redrawKey:a,useAnimationFrame:o=!1}){(0,v.useEffect)(()=>{n(),e.current?.clear();let a=r(),s=()=>{let n=a();return t(n[0],n[1],e),n};if(window.matchMedia(`(prefers-reduced-motion: reduce)`).matches){let t=[0,0];for(let e=0;e<i;e+=1)t=s();let n=window.setTimeout(()=>{e.current?.push(t[0],t[1])},0);return()=>window.clearTimeout(n)}if(o){let e,t=()=>{s(),e=window.requestAnimationFrame(t)};return e=window.requestAnimationFrame(t),()=>window.cancelAnimationFrame(e)}let c=window.setInterval(s,x);return()=>window.clearInterval(c)},[i,r,t,a,n,e,o])}var v,y,b,x,S,C,w,T,E,D,O,k;e((()=>{v=t(n()),m(),c(),s(),y=r(),b={title:`Lab/Hooks/useChartRange`},x=33,S=[0,100],C=()=>{let e=g(19229),t=0;return()=>(t+=1,[t,Math.sin(t*.04)*30+50+(e()-.5)*10])},w=()=>{let e=0;return()=>{e+=1;let t=10+e*.05;return[e,Math.sin(e*.03)*t+50]}},T=()=>{let e=g(32272),t=0,n=0;return()=>{t+=1,e()<.003&&(n=30+e()*50),n*=.97;let r=(e()-.5)*2,i=n>.5?Math.sin(t*.5)*n*(.5+e()*.5):0;return[t,r+i]}},E={render:()=>{let e=l().categorical(1)[0],t=(0,v.useRef)(null),{xDomain:n,yDomain:r,push:s,reset:c}=f({xWindow:300,yDomain:S});return _({streamRef:t,push:s,reset:c,createSamples:C,captureSampleCount:360,redrawKey:e}),(0,y.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,y.jsx)(a,{level:3,children:`Known Range (0-100%)`}),(0,y.jsx)(i,{type:`supporting`,color:`secondary`,children:`yDomain fixed at [0, 100]. useChartRange manages xDomain sliding window.`}),(0,y.jsxs)(d,{data:[],xKey:`t`,yKeys:[],xDomain:n,yDomain:r,height:200,children:[(0,y.jsx)(h,{horizontal:!0}),(0,y.jsx)(u,{position:`bottom`}),(0,y.jsx)(u,{position:`left`}),(0,y.jsx)(p,{handleRef:t,color:e,bufferSize:300,lineWidth:1.5})]})]})}},D={render:()=>{let e=l().categorical(2)[1],t=(0,v.useRef)(null),{xDomain:n,yDomain:r,push:s,reset:c}=f({xWindow:300,yPadding:.1});return _({streamRef:t,push:s,reset:c,createSamples:w,captureSampleCount:360,redrawKey:e}),(0,y.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,y.jsx)(a,{level:3,children:`Unknown Range (auto-tracks)`}),(0,y.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`No fixed yDomain. Range auto-expands as data reveals amplitude. Currently: [`,r[0].toFixed(1),`, `,r[1].toFixed(1),`]`]}),(0,y.jsxs)(d,{data:[],xKey:`t`,yKeys:[],xDomain:n,yDomain:r,height:200,children:[(0,y.jsx)(h,{horizontal:!0}),(0,y.jsx)(u,{position:`bottom`}),(0,y.jsx)(u,{position:`left`}),(0,y.jsx)(p,{handleRef:t,color:e,bufferSize:300,lineWidth:1.5})]})]})}},O={render:()=>{let e=l().categorical(5)[3],t=(0,v.useRef)(null),{xDomain:n,yDomain:r,push:s,reset:c}=f({xWindow:600,yCenter:!0,yPadding:.05});return _({streamRef:t,push:s,reset:c,createSamples:T,captureSampleCount:660,redrawKey:e,useAnimationFrame:!0}),(0,y.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,y.jsx)(a,{level:3,children:`Zero-Centered (seismograph)`}),(0,y.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`yCenter=true keeps 0 at center. Range auto-expands on quake bursts. Currently: [`,r[0].toFixed(1),`, `,r[1].toFixed(1),`]`]}),(0,y.jsxs)(d,{data:[],xKey:`t`,yKeys:[],xDomain:n,yDomain:r,yBaseline:`zero`,height:220,children:[(0,y.jsx)(h,{horizontal:!0}),(0,y.jsx)(u,{position:`bottom`}),(0,y.jsx)(u,{position:`left`}),(0,y.jsx)(p,{handleRef:t,color:e,bufferSize:600,lineWidth:1,opacity:.9})]})]})}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const color = colors.categorical(1)[0];
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const {
      xDomain,
      yDomain,
      push,
      reset
    } = useChartRange({
      xWindow: 300,
      yDomain: KNOWN_Y_DOMAIN
    });
    useStoryStream({
      streamRef,
      push,
      reset,
      createSamples: createKnownRangeSamples,
      captureSampleCount: 300 + CAPTURE_OVERRUN,
      redrawKey: color
    });
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Known Range (0-100%)</Heading>
        <Text type="supporting" color="secondary">
          yDomain fixed at [0, 100]. useChartRange manages xDomain sliding
          window.
        </Text>
        <Chart data={[]} xKey="t" yKeys={[]} xDomain={xDomain} yDomain={yDomain} height={200}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL handleRef={streamRef} color={color} bufferSize={300} lineWidth={1.5} />
        </Chart>
      </Stack>;
  }
}`,...E.parameters?.docs?.source},description:{story:`Known y-range — useChartRange just manages the sliding x window`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const color = colors.categorical(2)[1];
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const {
      xDomain,
      yDomain,
      push,
      reset
    } = useChartRange({
      xWindow: 300,
      yPadding: 0.1
    });
    useStoryStream({
      streamRef,
      push,
      reset,
      createSamples: createUnknownRangeSamples,
      captureSampleCount: 300 + CAPTURE_OVERRUN,
      redrawKey: color
    });
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Unknown Range (auto-tracks)</Heading>
        <Text type="supporting" color="secondary">
          No fixed yDomain. Range auto-expands as data reveals amplitude.
          Currently: [{yDomain[0].toFixed(1)}, {yDomain[1].toFixed(1)}]
        </Text>
        <Chart data={[]} xKey="t" yKeys={[]} xDomain={xDomain} yDomain={yDomain} height={200}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL handleRef={streamRef} color={color} bufferSize={300} lineWidth={1.5} />
        </Chart>
      </Stack>;
  }
}`,...D.parameters?.docs?.source},description:{story:`Unknown y-range — auto-tracks from data with 10% padding`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const color = colors.categorical(5)[3];
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const {
      xDomain,
      yDomain,
      push,
      reset
    } = useChartRange({
      xWindow: 600,
      yCenter: true,
      yPadding: 0.05
    });
    useStoryStream({
      streamRef,
      push,
      reset,
      createSamples: createZeroCenteredSamples,
      captureSampleCount: 600 + CAPTURE_OVERRUN,
      redrawKey: color,
      useAnimationFrame: true
    });
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Zero-Centered (seismograph)</Heading>
        <Text type="supporting" color="secondary">
          yCenter=true keeps 0 at center. Range auto-expands on quake bursts.
          Currently: [{yDomain[0].toFixed(1)}, {yDomain[1].toFixed(1)}]
        </Text>
        <Chart data={[]} xKey="t" yKeys={[]} xDomain={xDomain} yDomain={yDomain} yBaseline="zero" height={220}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL handleRef={streamRef} color={color} bufferSize={600} lineWidth={1} opacity={0.9} />
        </Chart>
      </Stack>;
  }
}`,...O.parameters?.docs?.source},description:{story:`Zero-centered — seismograph pattern with yCenter`,...O.parameters?.docs?.description}}},k=[`KnownRange`,`UnknownRange`,`ZeroCentered`]}))();export{E as KnownRange,D as UnknownRange,O as ZeroCentered,k as __namedExportsOrder,b as default};