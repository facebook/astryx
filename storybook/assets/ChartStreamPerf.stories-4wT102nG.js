import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{t as a}from"./Heading-D-Ri_Mjs.js";import{c as o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Text-BUJwo4gL.js";import{u as c}from"./iframe-rS7i1xed.js";import{At as l,Et as u,Ot as d,ot as f,t as p,tt as m}from"./src-Cfj0DB1w.js";var h,g,_,v,y,b,x;e((()=>{h=t(n()),p(),c(),s(),g=r(),_={title:`Lab/ChartStreamPerf`},v={render:()=>{let e=m(),t=(0,h.useRef)(null),n=(0,h.useRef)(0),[r,s]=(0,h.useState)([0,300]),[c,p]=(0,h.useState)(0),[_,v]=(0,h.useState)(0),y=(0,h.useRef)([]),b=(0,h.useRef)(performance.now());return(0,h.useEffect)(()=>{let e,r=()=>{let i=performance.now(),a=i-b.current;if(b.current=i,y.current.push(a),y.current.length>60&&y.current.shift(),n.current%30==0&&y.current.length>0){let e=y.current.reduce((e,t)=>e+t,0)/y.current.length;p(Math.round(1e3/e)),v(Math.round(e*100)/100)}n.current+=1;let o=Math.sin(n.current*.05)*40+50+(Math.random()-.5)*10;t.current?.push(n.current,o),s([Math.max(0,n.current-300),n.current]),e=requestAnimationFrame(r)};return e=requestAnimationFrame(r),()=>cancelAnimationFrame(e)},[]),(0,g.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,g.jsx)(a,{level:3,children:`Performance: xDomain on every frame`}),(0,g.jsxs)(o,{direction:`horizontal`,gap:6,children:[(0,g.jsxs)(i,{type:`label`,children:[`FPS: `,c]}),(0,g.jsxs)(i,{type:`label`,children:[`Frame: `,_,`ms`]}),(0,g.jsx)(i,{type:`supporting`,color:`secondary`,children:`xDomain updates via setState on every requestAnimationFrame`})]}),(0,g.jsxs)(l,{data:[{t:0,v:0},{t:1,v:100}],xKey:`t`,yKeys:[`v`],yDomain:[0,100],xDomain:r,height:250,children:[(0,g.jsx)(u,{horizontal:!0}),(0,g.jsx)(d,{position:`bottom`}),(0,g.jsx)(d,{position:`left`}),(0,g.jsx)(f,{handleRef:t,color:e.categorical(1)[0],bufferSize:300,lineWidth:1.5})]})]})}},y={render:()=>{let e=m(),t=(0,h.useRef)(null),n=(0,h.useRef)(0),[r,s]=(0,h.useState)([0,300]),[c,p]=(0,h.useState)(0),[_,v]=(0,h.useState)(0),y=(0,h.useRef)([]),b=(0,h.useRef)(performance.now()),x=(0,h.useRef)(0);return(0,h.useEffect)(()=>{let e,r=()=>{let i=performance.now(),a=i-b.current;if(b.current=i,y.current.push(a),y.current.length>60&&y.current.shift(),n.current%30==0&&y.current.length>0){let e=y.current.reduce((e,t)=>e+t,0)/y.current.length;p(Math.round(1e3/e)),v(Math.round(e*100)/100)}n.current+=1;let o=Math.sin(n.current*.05)*40+50+(Math.random()-.5)*10;t.current?.push(n.current,o),i-x.current>500&&(s([Math.max(0,n.current-300),n.current]),x.current=i),e=requestAnimationFrame(r)};return e=requestAnimationFrame(r),()=>cancelAnimationFrame(e)},[]),(0,g.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,g.jsx)(a,{level:3,children:`Performance: throttled xDomain (500ms)`}),(0,g.jsxs)(o,{direction:`horizontal`,gap:6,children:[(0,g.jsxs)(i,{type:`label`,children:[`FPS: `,c]}),(0,g.jsxs)(i,{type:`label`,children:[`Frame: `,_,`ms`]}),(0,g.jsx)(i,{type:`supporting`,color:`secondary`,children:`xDomain updates every 500ms; WebGL draws every frame`})]}),(0,g.jsxs)(l,{data:[{t:0,v:0},{t:1,v:100}],xKey:`t`,yKeys:[`v`],yDomain:[0,100],xDomain:r,height:250,children:[(0,g.jsx)(u,{horizontal:!0}),(0,g.jsx)(d,{position:`bottom`}),(0,g.jsx)(d,{position:`left`}),(0,g.jsx)(f,{handleRef:t,color:e.categorical(1)[0],bufferSize:300,lineWidth:1.5})]})]})}},b={render:()=>{let e=m(),t=(0,h.useRef)(null),n=(0,h.useRef)(null),r=(0,h.useRef)(null),s=(0,h.useRef)(0),[c,p]=(0,h.useState)([0,400]),[_,v]=(0,h.useState)(0),y=(0,h.useRef)([]),b=(0,h.useRef)(performance.now());(0,h.useEffect)(()=>{let e,i=()=>{let a=performance.now(),o=a-b.current;if(b.current=a,y.current.push(o),y.current.length>60&&y.current.shift(),s.current%30==0&&y.current.length>0){let e=y.current.reduce((e,t)=>e+t,0)/y.current.length;v(Math.round(1e3/e))}s.current+=1;let c=s.current,l=Math.sin(c*.02)*20;t.current?.push(c,50+l+Math.sin(c*.07)*10+(Math.random()-.5)*4),n.current?.push(c,50+l*.6+Math.cos(c*.05)*15+(Math.random()-.5)*6),r.current?.push(c,50+l*.3+Math.sin(c*.11)*8+(Math.random()-.5)*3),p([Math.max(0,c-400),c]),e=requestAnimationFrame(i)};return e=requestAnimationFrame(i),()=>cancelAnimationFrame(e)},[]);let x=e.categorical(3);return(0,g.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,g.jsx)(a,{level:3,children:`Stress: 3 streams + axes + grid @ 60fps`}),(0,g.jsxs)(i,{type:`label`,children:[`FPS: `,_]}),(0,g.jsxs)(l,{data:[{t:0,v:0},{t:1,v:100}],xKey:`t`,yKeys:[`v`],yDomain:[0,100],xDomain:c,height:300,children:[(0,g.jsx)(u,{horizontal:!0}),(0,g.jsx)(d,{position:`bottom`}),(0,g.jsx)(d,{position:`left`}),(0,g.jsx)(f,{handleRef:t,color:x[0],bufferSize:400,lineWidth:1.5,opacity:.8}),(0,g.jsx)(f,{handleRef:n,color:x[1],bufferSize:400,lineWidth:1.5,opacity:.8}),(0,g.jsx)(f,{handleRef:r,color:x[2],bufferSize:400,lineWidth:1.5,opacity:.8})]})]})}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:`Measures frame timing when xDomain updates on every push.
Shows: fps, render time per frame, and dropped frames.`,...v.parameters?.docs?.description}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`Throttled xDomain — updates every 500ms instead of every frame.
Axis slides in steps; stream still renders every frame via WebGL.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:`Stress test: 3 streams + both axes + grid, xDomain every frame.`,...b.parameters?.docs?.description}}},x=[`XDomainUpdateCost`,`ThrottledXDomain`,`StressTest`]}))();export{b as StressTest,y as ThrottledXDomain,v as XDomainUpdateCost,x as __namedExportsOrder,_ as default};