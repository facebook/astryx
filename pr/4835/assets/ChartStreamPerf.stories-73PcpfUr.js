import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./Heading-CaMVckJS.js";import{n as s,t as c}from"./Stack-D-ryFIvw.js";import{i as l,n as u,r as d,t as f}from"./ChartAxis-BYz-LLki.js";import{n as p,t as m}from"./ChartGrid-DYJI9wDe.js";import{n as h,t as g}from"./ChartStreamGL-DJ9P_ZPT.js";import{n as _,t as v}from"./useChartColors-tODQlwNr.js";var y,b,x,S,C,w,T;function E(){return(E=e((()=>{y=t(),l(),u(),p(),h(),v(),s(),n(),a(),b=i(),x={title:`Lab/ChartStreamPerf`},S={render:()=>{let e=_(),t=(0,y.useRef)(null),n=(0,y.useRef)(0),[i,a]=(0,y.useState)([0,300]),[s,l]=(0,y.useState)(0),[u,p]=(0,y.useState)(0),h=(0,y.useRef)([]),v=(0,y.useRef)(performance.now());return(0,y.useEffect)(()=>{let e,r=()=>{let i=performance.now(),o=i-v.current;if(v.current=i,h.current.push(o),h.current.length>60&&h.current.shift(),n.current%30==0&&h.current.length>0){let e=h.current.reduce((e,t)=>e+t,0)/h.current.length;l(Math.round(1e3/e)),p(Math.round(e*100)/100)}n.current+=1;let s=Math.sin(n.current*.05)*40+50+(Math.random()-.5)*10;t.current?.push(n.current,s),a([Math.max(0,n.current-300),n.current]),e=requestAnimationFrame(r)};return e=requestAnimationFrame(r),()=>cancelAnimationFrame(e)},[]),(0,b.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,b.jsx)(o,{level:3,children:`Performance: xDomain on every frame`}),(0,b.jsxs)(c,{direction:`horizontal`,gap:6,children:[(0,b.jsxs)(r,{type:`label`,children:[`FPS: `,s]}),(0,b.jsxs)(r,{type:`label`,children:[`Frame: `,u,`ms`]}),(0,b.jsx)(r,{type:`supporting`,color:`secondary`,children:`xDomain updates via setState on every requestAnimationFrame`})]}),(0,b.jsxs)(d,{data:[{t:0,v:0},{t:1,v:100}],xKey:`t`,yKeys:[`v`],yDomain:[0,100],xDomain:i,height:250,children:[(0,b.jsx)(m,{horizontal:!0}),(0,b.jsx)(f,{position:`bottom`}),(0,b.jsx)(f,{position:`left`}),(0,b.jsx)(g,{handleRef:t,color:e.categorical(1)[0],bufferSize:300,lineWidth:1.5})]})]})}},C={render:()=>{let e=_(),t=(0,y.useRef)(null),n=(0,y.useRef)(0),[i,a]=(0,y.useState)([0,300]),[s,l]=(0,y.useState)(0),[u,p]=(0,y.useState)(0),h=(0,y.useRef)([]),v=(0,y.useRef)(performance.now()),x=(0,y.useRef)(0);return(0,y.useEffect)(()=>{let e,r=()=>{let i=performance.now(),o=i-v.current;if(v.current=i,h.current.push(o),h.current.length>60&&h.current.shift(),n.current%30==0&&h.current.length>0){let e=h.current.reduce((e,t)=>e+t,0)/h.current.length;l(Math.round(1e3/e)),p(Math.round(e*100)/100)}n.current+=1;let s=Math.sin(n.current*.05)*40+50+(Math.random()-.5)*10;t.current?.push(n.current,s),i-x.current>500&&(a([Math.max(0,n.current-300),n.current]),x.current=i),e=requestAnimationFrame(r)};return e=requestAnimationFrame(r),()=>cancelAnimationFrame(e)},[]),(0,b.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,b.jsx)(o,{level:3,children:`Performance: throttled xDomain (500ms)`}),(0,b.jsxs)(c,{direction:`horizontal`,gap:6,children:[(0,b.jsxs)(r,{type:`label`,children:[`FPS: `,s]}),(0,b.jsxs)(r,{type:`label`,children:[`Frame: `,u,`ms`]}),(0,b.jsx)(r,{type:`supporting`,color:`secondary`,children:`xDomain updates every 500ms; WebGL draws every frame`})]}),(0,b.jsxs)(d,{data:[{t:0,v:0},{t:1,v:100}],xKey:`t`,yKeys:[`v`],yDomain:[0,100],xDomain:i,height:250,children:[(0,b.jsx)(m,{horizontal:!0}),(0,b.jsx)(f,{position:`bottom`}),(0,b.jsx)(f,{position:`left`}),(0,b.jsx)(g,{handleRef:t,color:e.categorical(1)[0],bufferSize:300,lineWidth:1.5})]})]})}},w={render:()=>{let e=_(),t=(0,y.useRef)(null),n=(0,y.useRef)(null),i=(0,y.useRef)(null),a=(0,y.useRef)(0),[s,l]=(0,y.useState)([0,400]),[u,p]=(0,y.useState)(0),h=(0,y.useRef)([]),v=(0,y.useRef)(performance.now());(0,y.useEffect)(()=>{let e,r=()=>{let o=performance.now(),s=o-v.current;if(v.current=o,h.current.push(s),h.current.length>60&&h.current.shift(),a.current%30==0&&h.current.length>0){let e=h.current.reduce((e,t)=>e+t,0)/h.current.length;p(Math.round(1e3/e))}a.current+=1;let c=a.current,u=Math.sin(c*.02)*20;t.current?.push(c,50+u+Math.sin(c*.07)*10+(Math.random()-.5)*4),n.current?.push(c,50+u*.6+Math.cos(c*.05)*15+(Math.random()-.5)*6),i.current?.push(c,50+u*.3+Math.sin(c*.11)*8+(Math.random()-.5)*3),l([Math.max(0,c-400),c]),e=requestAnimationFrame(r)};return e=requestAnimationFrame(r),()=>cancelAnimationFrame(e)},[]);let x=e.categorical(3);return(0,b.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,b.jsx)(o,{level:3,children:`Stress: 3 streams + axes + grid @ 60fps`}),(0,b.jsxs)(r,{type:`label`,children:[`FPS: `,u]}),(0,b.jsxs)(d,{data:[{t:0,v:0},{t:1,v:100}],xKey:`t`,yKeys:[`v`],yDomain:[0,100],xDomain:s,height:300,children:[(0,b.jsx)(m,{horizontal:!0}),(0,b.jsx)(f,{position:`bottom`}),(0,b.jsx)(f,{position:`left`}),(0,b.jsx)(g,{handleRef:t,color:x[0],bufferSize:400,lineWidth:1.5,opacity:.8}),(0,b.jsx)(g,{handleRef:n,color:x[1],bufferSize:400,lineWidth:1.5,opacity:.8}),(0,b.jsx)(g,{handleRef:i,color:x[2],bufferSize:400,lineWidth:1.5,opacity:.8})]})]})}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const [xDomain, setXDomain] = useState<[number, number]>([0, 300]);
    const [fps, setFps] = useState(0);
    const [renderMs, setRenderMs] = useState(0);
    const frameTimesRef = useRef<number[]>([]);
    const lastFrameRef = useRef(performance.now());
    useEffect(() => {
      let raf: number;
      const tick = () => {
        const now = performance.now();
        const dt = now - lastFrameRef.current;
        lastFrameRef.current = now;
        frameTimesRef.current.push(dt);
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift();
        }

        // Update stats every 30 frames
        if (tRef.current % 30 === 0 && frameTimesRef.current.length > 0) {
          const avg = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
          setFps(Math.round(1000 / avg));
          setRenderMs(Math.round(avg * 100) / 100);
        }
        tRef.current += 1;
        const y = Math.sin(tRef.current * 0.05) * 40 + 50 + (Math.random() - 0.5) * 10;
        streamRef.current?.push(tRef.current, y);
        {
          setXDomain([Math.max(0, tRef.current - 300), tRef.current]);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Performance: xDomain on every frame</Heading>
        <Stack direction="horizontal" gap={6}>
          <Text type="label">FPS: {fps}</Text>
          <Text type="label">Frame: {renderMs}ms</Text>
          <Text type="supporting" color="secondary">
            xDomain updates via setState on every requestAnimationFrame
          </Text>
        </Stack>
        <Chart data={[{
        t: 0,
        v: 0
      }, {
        t: 1,
        v: 100
      }]} xKey="t" yKeys={['v']} yDomain={[0, 100]} xDomain={xDomain} height={250}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL handleRef={streamRef} color={colors.categorical(1)[0]} bufferSize={300} lineWidth={1.5} />
        </Chart>
      </Stack>;
  }
}`,...S.parameters?.docs?.source},description:{story:`Measures frame timing when xDomain updates on every push.
Shows: fps, render time per frame, and dropped frames.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const [xDomain, setXDomain] = useState<[number, number]>([0, 300]);
    const [fps, setFps] = useState(0);
    const [renderMs, setRenderMs] = useState(0);
    const frameTimesRef = useRef<number[]>([]);
    const lastFrameRef = useRef(performance.now());
    const lastDomainUpdateRef = useRef(0);
    useEffect(() => {
      let raf: number;
      const tick = () => {
        const now = performance.now();
        const dt = now - lastFrameRef.current;
        lastFrameRef.current = now;
        frameTimesRef.current.push(dt);
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift();
        }
        if (tRef.current % 30 === 0 && frameTimesRef.current.length > 0) {
          const avg = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
          setFps(Math.round(1000 / avg));
          setRenderMs(Math.round(avg * 100) / 100);
        }
        tRef.current += 1;
        const y = Math.sin(tRef.current * 0.05) * 40 + 50 + (Math.random() - 0.5) * 10;
        streamRef.current?.push(tRef.current, y);

        // Throttle xDomain updates to every 500ms
        if (now - lastDomainUpdateRef.current > 500) {
          setXDomain([Math.max(0, tRef.current - 300), tRef.current]);
          lastDomainUpdateRef.current = now;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>
          Performance: throttled xDomain (500ms)
        </Heading>
        <Stack direction="horizontal" gap={6}>
          <Text type="label">FPS: {fps}</Text>
          <Text type="label">Frame: {renderMs}ms</Text>
          <Text type="supporting" color="secondary">
            xDomain updates every 500ms; WebGL draws every frame
          </Text>
        </Stack>
        <Chart data={[{
        t: 0,
        v: 0
      }, {
        t: 1,
        v: 100
      }]} xKey="t" yKeys={['v']} yDomain={[0, 100]} xDomain={xDomain} height={250}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL handleRef={streamRef} color={colors.categorical(1)[0]} bufferSize={300} lineWidth={1.5} />
        </Chart>
      </Stack>;
  }
}`,...C.parameters?.docs?.source},description:{story:`Throttled xDomain — updates every 500ms instead of every frame.
Axis slides in steps; stream still renders every frame via WebGL.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const s1 = useRef<ChartStreamGLHandle>(null);
    const s2 = useRef<ChartStreamGLHandle>(null);
    const s3 = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const [xDomain, setXDomain] = useState<[number, number]>([0, 400]);
    const [fps, setFps] = useState(0);
    const frameTimesRef = useRef<number[]>([]);
    const lastFrameRef = useRef(performance.now());
    useEffect(() => {
      let raf: number;
      const tick = () => {
        const now = performance.now();
        const dt = now - lastFrameRef.current;
        lastFrameRef.current = now;
        frameTimesRef.current.push(dt);
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift();
        }
        if (tRef.current % 30 === 0 && frameTimesRef.current.length > 0) {
          const avg = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
          setFps(Math.round(1000 / avg));
        }
        tRef.current += 1;
        const t = tRef.current;
        const shared = Math.sin(t * 0.02) * 20;
        s1.current?.push(t, 50 + shared + Math.sin(t * 0.07) * 10 + (Math.random() - 0.5) * 4);
        s2.current?.push(t, 50 + shared * 0.6 + Math.cos(t * 0.05) * 15 + (Math.random() - 0.5) * 6);
        s3.current?.push(t, 50 + shared * 0.3 + Math.sin(t * 0.11) * 8 + (Math.random() - 0.5) * 3);
        setXDomain([Math.max(0, t - 400), t]);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);
    const c = colors.categorical(3);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>
          Stress: 3 streams + axes + grid @ 60fps
        </Heading>
        <Text type="label">FPS: {fps}</Text>
        <Chart data={[{
        t: 0,
        v: 0
      }, {
        t: 1,
        v: 100
      }]} xKey="t" yKeys={['v']} yDomain={[0, 100]} xDomain={xDomain} height={300}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL handleRef={s1} color={c[0]} bufferSize={400} lineWidth={1.5} opacity={0.8} />
          <ChartStreamGL handleRef={s2} color={c[1]} bufferSize={400} lineWidth={1.5} opacity={0.8} />
          <ChartStreamGL handleRef={s3} color={c[2]} bufferSize={400} lineWidth={1.5} opacity={0.8} />
        </Chart>
      </Stack>;
  }
}`,...w.parameters?.docs?.source},description:{story:`Stress test: 3 streams + both axes + grid, xDomain every frame.`,...w.parameters?.docs?.description}}},T=[`XDomainUpdateCost`,`ThrottledXDomain`,`StressTest`]})))()}E();export{w as StressTest,C as ThrottledXDomain,S as XDomainUpdateCost,T as __namedExportsOrder,x as default};