import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{t as a}from"./Heading-D-Ri_Mjs.js";import{c as o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Text-BUJwo4gL.js";import{u as c}from"./iframe-B2M4pHB5.js";import{$ as l,At as u,Et as d,Ot as f,ot as p,t as m,tt as h}from"./src-doLYD-I7.js";var g,_,v,y,b,x,S;e((()=>{g=t(n()),m(),c(),s(),_=r(),v={title:`Lab/useChartRange`},y={render:()=>{let e=h(),t=(0,g.useRef)(null),n=(0,g.useRef)(0),{xDomain:r,yDomain:s,push:c}=l({xWindow:300,yDomain:[0,100]});return(0,g.useEffect)(()=>{let e=setInterval(()=>{n.current+=1;let e=Math.sin(n.current*.04)*30+50+(Math.random()-.5)*10;c(n.current,e,t)},33);return()=>clearInterval(e)},[c]),(0,_.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,_.jsx)(a,{level:3,children:`Known Range (0-100%)`}),(0,_.jsx)(i,{type:`supporting`,color:`secondary`,children:`yDomain fixed at [0, 100]. useChartRange manages xDomain sliding window.`}),(0,_.jsxs)(u,{data:[],xKey:`t`,yKeys:[],xDomain:r,yDomain:s,height:200,children:[(0,_.jsx)(d,{horizontal:!0}),(0,_.jsx)(f,{position:`bottom`}),(0,_.jsx)(f,{position:`left`}),(0,_.jsx)(p,{handleRef:t,color:e.categorical(1)[0],bufferSize:300,lineWidth:1.5})]})]})}},b={render:()=>{let e=h(),t=(0,g.useRef)(null),n=(0,g.useRef)(0),{xDomain:r,yDomain:s,push:c}=l({xWindow:300,yPadding:.1});return(0,g.useEffect)(()=>{let e=setInterval(()=>{n.current+=1;let e=10+n.current*.05,r=Math.sin(n.current*.03)*e+50;c(n.current,r,t)},33);return()=>clearInterval(e)},[c]),(0,_.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,_.jsx)(a,{level:3,children:`Unknown Range (auto-tracks)`}),(0,_.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`No fixed yDomain. Range auto-expands as data reveals amplitude. Currently: [`,s[0].toFixed(1),`, `,s[1].toFixed(1),`]`]}),(0,_.jsxs)(u,{data:[],xKey:`t`,yKeys:[],xDomain:r,yDomain:s,height:200,children:[(0,_.jsx)(d,{horizontal:!0}),(0,_.jsx)(f,{position:`bottom`}),(0,_.jsx)(f,{position:`left`}),(0,_.jsx)(p,{handleRef:t,color:e.categorical(2)[1],bufferSize:300,lineWidth:1.5})]})]})}},x={render:()=>{let e=h(),t=(0,g.useRef)(null),n=(0,g.useRef)(0),r=(0,g.useRef)(0),{xDomain:s,yDomain:c,push:m}=l({xWindow:600,yCenter:!0,yPadding:.05});return(0,g.useEffect)(()=>{let e,i=()=>{n.current+=1,Math.random()<.003&&(r.current=30+Math.random()*50),r.current*=.97;let a=(Math.random()-.5)*2,o=r.current>.5?Math.sin(n.current*.5)*r.current*(.5+Math.random()*.5):0;m(n.current,a+o,t),e=requestAnimationFrame(i)};return e=requestAnimationFrame(i),()=>cancelAnimationFrame(e)},[m]),(0,_.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,_.jsx)(a,{level:3,children:`Zero-Centered (seismograph)`}),(0,_.jsxs)(i,{type:`supporting`,color:`secondary`,children:[`yCenter=true keeps 0 at center. Range auto-expands on quake bursts. Currently: [`,c[0].toFixed(1),`, `,c[1].toFixed(1),`]`]}),(0,_.jsxs)(u,{data:[],xKey:`t`,yKeys:[],xDomain:s,yDomain:c,yBaseline:`zero`,height:220,children:[(0,_.jsx)(d,{horizontal:!0}),(0,_.jsx)(f,{position:`bottom`}),(0,_.jsx)(f,{position:`left`}),(0,_.jsx)(p,{handleRef:t,color:e.categorical(5)[3],bufferSize:600,lineWidth:1,opacity:.9})]})]})}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const {
      xDomain,
      yDomain,
      push
    } = useChartRange({
      xWindow: 300,
      yDomain: [0, 100]
    });
    useEffect(() => {
      const id = setInterval(() => {
        tRef.current += 1;
        const y = Math.sin(tRef.current * 0.04) * 30 + 50 + (Math.random() - 0.5) * 10;
        push(tRef.current, y, streamRef);
      }, 33);
      return () => clearInterval(id);
    }, [push]);
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
          <ChartStreamGL handleRef={streamRef} color={colors.categorical(1)[0]} bufferSize={300} lineWidth={1.5} />
        </Chart>
      </Stack>;
  }
}`,...y.parameters?.docs?.source},description:{story:`Known y-range — useChartRange just manages the sliding x window`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const {
      xDomain,
      yDomain,
      push
    } = useChartRange({
      xWindow: 300,
      yPadding: 0.1
    });
    useEffect(() => {
      const id = setInterval(() => {
        tRef.current += 1;
        // Gradually increasing range to show auto-expansion
        const amplitude = 10 + tRef.current * 0.05;
        const y = Math.sin(tRef.current * 0.03) * amplitude + 50;
        push(tRef.current, y, streamRef);
      }, 33);
      return () => clearInterval(id);
    }, [push]);
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
          <ChartStreamGL handleRef={streamRef} color={colors.categorical(2)[1]} bufferSize={300} lineWidth={1.5} />
        </Chart>
      </Stack>;
  }
}`,...b.parameters?.docs?.source},description:{story:`Unknown y-range — auto-tracks from data with 10% padding`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const quakeRef = useRef(0);
    const {
      xDomain,
      yDomain,
      push
    } = useChartRange({
      xWindow: 600,
      yCenter: true,
      yPadding: 0.05
    });
    useEffect(() => {
      let raf: number;
      const tick = () => {
        tRef.current += 1;
        if (Math.random() < 0.003) {
          quakeRef.current = 30 + Math.random() * 50;
        }
        quakeRef.current *= 0.97;
        const tremor = (Math.random() - 0.5) * 2;
        const quake = quakeRef.current > 0.5 ? Math.sin(tRef.current * 0.5) * quakeRef.current * (0.5 + Math.random() * 0.5) : 0;
        push(tRef.current, tremor + quake, streamRef);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [push]);
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
          <ChartStreamGL handleRef={streamRef} color={colors.categorical(5)[3]} bufferSize={600} lineWidth={1} opacity={0.9} />
        </Chart>
      </Stack>;
  }
}`,...x.parameters?.docs?.source},description:{story:`Zero-centered — seismograph pattern with yCenter`,...x.parameters?.docs?.description}}},S=[`KnownRange`,`UnknownRange`,`ZeroCentered`]}))();export{y as KnownRange,b as UnknownRange,x as ZeroCentered,S as __namedExportsOrder,v as default};