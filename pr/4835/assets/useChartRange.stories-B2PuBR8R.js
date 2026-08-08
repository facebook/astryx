import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./Heading-CaMVckJS.js";import{n as s,t as c}from"./Stack-D-ryFIvw.js";import{i as l,n as u,r as d,t as f}from"./ChartAxis-BYz-LLki.js";import{n as p,t as m}from"./ChartGrid-DYJI9wDe.js";import{n as h,t as g}from"./ChartStreamGL-DJ9P_ZPT.js";import{n as _,t as v}from"./useChartColors-tODQlwNr.js";function y({xWindow:e,yDomain:t,yPadding:n=.1,yCenter:r=!1}){let[i,a]=(0,b.useState)([0,0]),[o,s]=(0,b.useState)(t??[0,1]),c=(0,b.useRef)({yMin:t?t[0]:1/0,yMax:t?t[1]:-1/0}),l=(0,b.useCallback)((i,o,l)=>{l?.current?.push(i,o);let u=i>=e?i-e:0;if(a([u,i>=e?i:Math.max(i,1)]),!t){let e=c.current,t=!1;if(o<e.yMin&&(e.yMin=o,t=!0),o>e.yMax&&(e.yMax=o,t=!0),t){let t=(e.yMax-e.yMin||1)*n,i=e.yMin-t,a=e.yMax+t;if(r){let e=Math.max(Math.abs(i),Math.abs(a));i=-e,a=e}s([i,a])}}},[e,t,n,r]),u=(0,b.useCallback)(()=>{c.current={yMin:t?t[0]:1/0,yMax:t?t[1]:-1/0},a([0,0]),s(t??[0,1])},[t]);return{xDomain:i,yDomain:t??o,push:l,reset:u}}var b;function x(){return(x=e((()=>{b=t()})))()}var S,C,w,T,E,D,O;function k(){return(k=e((()=>{S=t(),l(),u(),p(),h(),v(),x(),s(),n(),a(),C=i(),w={title:`Lab/useChartRange`},T={render:()=>{let e=_(),t=(0,S.useRef)(null),n=(0,S.useRef)(0),{xDomain:i,yDomain:a,push:s}=y({xWindow:300,yDomain:[0,100]});return(0,S.useEffect)(()=>{let e=setInterval(()=>{n.current+=1;let e=Math.sin(n.current*.04)*30+50+(Math.random()-.5)*10;s(n.current,e,t)},33);return()=>clearInterval(e)},[s]),(0,C.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,C.jsx)(o,{level:3,children:`Known Range (0-100%)`}),(0,C.jsx)(r,{type:`supporting`,color:`secondary`,children:`yDomain fixed at [0, 100]. useChartRange manages xDomain sliding window.`}),(0,C.jsxs)(d,{data:[],xKey:`t`,yKeys:[],xDomain:i,yDomain:a,height:200,children:[(0,C.jsx)(m,{horizontal:!0}),(0,C.jsx)(f,{position:`bottom`}),(0,C.jsx)(f,{position:`left`}),(0,C.jsx)(g,{handleRef:t,color:e.categorical(1)[0],bufferSize:300,lineWidth:1.5})]})]})}},E={render:()=>{let e=_(),t=(0,S.useRef)(null),n=(0,S.useRef)(0),{xDomain:i,yDomain:a,push:s}=y({xWindow:300,yPadding:.1});return(0,S.useEffect)(()=>{let e=setInterval(()=>{n.current+=1;let e=10+n.current*.05,r=Math.sin(n.current*.03)*e+50;s(n.current,r,t)},33);return()=>clearInterval(e)},[s]),(0,C.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,C.jsx)(o,{level:3,children:`Unknown Range (auto-tracks)`}),(0,C.jsxs)(r,{type:`supporting`,color:`secondary`,children:[`No fixed yDomain. Range auto-expands as data reveals amplitude. Currently: [`,a[0].toFixed(1),`, `,a[1].toFixed(1),`]`]}),(0,C.jsxs)(d,{data:[],xKey:`t`,yKeys:[],xDomain:i,yDomain:a,height:200,children:[(0,C.jsx)(m,{horizontal:!0}),(0,C.jsx)(f,{position:`bottom`}),(0,C.jsx)(f,{position:`left`}),(0,C.jsx)(g,{handleRef:t,color:e.categorical(2)[1],bufferSize:300,lineWidth:1.5})]})]})}},D={render:()=>{let e=_(),t=(0,S.useRef)(null),n=(0,S.useRef)(0),i=(0,S.useRef)(0),{xDomain:a,yDomain:s,push:l}=y({xWindow:600,yCenter:!0,yPadding:.05});return(0,S.useEffect)(()=>{let e,r=()=>{n.current+=1,Math.random()<.003&&(i.current=30+Math.random()*50),i.current*=.97;let a=(Math.random()-.5)*2,o=i.current>.5?Math.sin(n.current*.5)*i.current*(.5+Math.random()*.5):0;l(n.current,a+o,t),e=requestAnimationFrame(r)};return e=requestAnimationFrame(r),()=>cancelAnimationFrame(e)},[l]),(0,C.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,C.jsx)(o,{level:3,children:`Zero-Centered (seismograph)`}),(0,C.jsxs)(r,{type:`supporting`,color:`secondary`,children:[`yCenter=true keeps 0 at center. Range auto-expands on quake bursts. Currently: [`,s[0].toFixed(1),`, `,s[1].toFixed(1),`]`]}),(0,C.jsxs)(d,{data:[],xKey:`t`,yKeys:[],xDomain:a,yDomain:s,yBaseline:`zero`,height:220,children:[(0,C.jsx)(m,{horizontal:!0}),(0,C.jsx)(f,{position:`bottom`}),(0,C.jsx)(f,{position:`left`}),(0,C.jsx)(g,{handleRef:t,color:e.categorical(5)[3],bufferSize:600,lineWidth:1,opacity:.9})]})]})}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source},description:{story:`Known y-range — useChartRange just manages the sliding x window`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source},description:{story:`Unknown y-range — auto-tracks from data with 10% padding`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:`Zero-centered — seismograph pattern with yCenter`,...D.parameters?.docs?.description}}},O=[`KnownRange`,`UnknownRange`,`ZeroCentered`]})))()}k();export{T as KnownRange,E as UnknownRange,D as ZeroCentered,O as __namedExportsOrder,w as default};