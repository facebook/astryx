import{ah as t,a1 as e,T as h}from"./iframe-Cw8JXX6x.js";import{S as C}from"./Stack-Cz_yxa3U.js";import{u as w}from"./useChartColors-DqzNnLnR.js";import{H as A}from"./Heading-H2Jt0VgN.js";import{C as k,a as p}from"./ChartAxis-D28SRUMr.js";import{C as z}from"./ChartGrid-DpBpYolo.js";import{C as T}from"./ChartStreamGL-CBGfTUtX.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";import"./ChartContext-DBJKcVpD.js";import"./linear-gs3faI6G.js";import"./webgl-B2CDFegl.js";const J={title:"Lab/ChartStreamPerf"},M={render:()=>{const R=w(),i=t.useRef(null),n=t.useRef(0),[d,l]=t.useState([0,300]),[x,y]=t.useState(0),[g,S]=t.useState(0),r=t.useRef([]),m=t.useRef(performance.now());return t.useEffect(()=>{let a;const o=()=>{const u=performance.now(),c=u-m.current;if(m.current=u,r.current.push(c),r.current.length>60&&r.current.shift(),n.current%30===0&&r.current.length>0){const s=r.current.reduce((f,F)=>f+F,0)/r.current.length;y(Math.round(1e3/s)),S(Math.round(s*100)/100)}n.current+=1;const v=Math.sin(n.current*.05)*40+50+(Math.random()-.5)*10;i.current?.push(n.current,v),l([Math.max(0,n.current-300),n.current]),a=requestAnimationFrame(o)};return a=requestAnimationFrame(o),()=>cancelAnimationFrame(a)},[]),e.jsxs(C,{direction:"vertical",gap:4,children:[e.jsx(A,{level:3,children:"Performance: xDomain on every frame"}),e.jsxs(C,{direction:"horizontal",gap:6,children:[e.jsxs(h,{type:"label",children:["FPS: ",x]}),e.jsxs(h,{type:"label",children:["Frame: ",g,"ms"]}),e.jsx(h,{type:"supporting",color:"secondary",children:"xDomain updates via setState on every requestAnimationFrame"})]}),e.jsxs(k,{data:[{t:0,v:0},{t:1,v:100}],xKey:"t",yKeys:["v"],yDomain:[0,100],xDomain:d,height:250,children:[e.jsx(z,{horizontal:!0}),e.jsx(p,{position:"bottom"}),e.jsx(p,{position:"left"}),e.jsx(T,{handleRef:i,color:R.categorical(1)[0],bufferSize:300,lineWidth:1.5})]})]})}},b={render:()=>{const R=w(),i=t.useRef(null),n=t.useRef(0),[d,l]=t.useState([0,300]),[x,y]=t.useState(0),[g,S]=t.useState(0),r=t.useRef([]),m=t.useRef(performance.now()),a=t.useRef(0);return t.useEffect(()=>{let o;const u=()=>{const c=performance.now(),v=c-m.current;if(m.current=c,r.current.push(v),r.current.length>60&&r.current.shift(),n.current%30===0&&r.current.length>0){const f=r.current.reduce((F,j)=>F+j,0)/r.current.length;y(Math.round(1e3/f)),S(Math.round(f*100)/100)}n.current+=1;const s=Math.sin(n.current*.05)*40+50+(Math.random()-.5)*10;i.current?.push(n.current,s),c-a.current>500&&(l([Math.max(0,n.current-300),n.current]),a.current=c),o=requestAnimationFrame(u)};return o=requestAnimationFrame(u),()=>cancelAnimationFrame(o)},[]),e.jsxs(C,{direction:"vertical",gap:4,children:[e.jsx(A,{level:3,children:"Performance: throttled xDomain (500ms)"}),e.jsxs(C,{direction:"horizontal",gap:6,children:[e.jsxs(h,{type:"label",children:["FPS: ",x]}),e.jsxs(h,{type:"label",children:["Frame: ",g,"ms"]}),e.jsx(h,{type:"supporting",color:"secondary",children:"xDomain updates every 500ms; WebGL draws every frame"})]}),e.jsxs(k,{data:[{t:0,v:0},{t:1,v:100}],xKey:"t",yKeys:["v"],yDomain:[0,100],xDomain:d,height:250,children:[e.jsx(z,{horizontal:!0}),e.jsx(p,{position:"bottom"}),e.jsx(p,{position:"left"}),e.jsx(T,{handleRef:i,color:R.categorical(1)[0],bufferSize:300,lineWidth:1.5})]})]})}},D={render:()=>{const R=w(),i=t.useRef(null),n=t.useRef(null),d=t.useRef(null),l=t.useRef(0),[x,y]=t.useState([0,400]),[g,S]=t.useState(0),r=t.useRef([]),m=t.useRef(performance.now());t.useEffect(()=>{let o;const u=()=>{const c=performance.now(),v=c-m.current;if(m.current=c,r.current.push(v),r.current.length>60&&r.current.shift(),l.current%30===0&&r.current.length>0){const F=r.current.reduce((j,G)=>j+G,0)/r.current.length;S(Math.round(1e3/F))}l.current+=1;const s=l.current,f=Math.sin(s*.02)*20;i.current?.push(s,50+f+Math.sin(s*.07)*10+(Math.random()-.5)*4),n.current?.push(s,50+f*.6+Math.cos(s*.05)*15+(Math.random()-.5)*6),d.current?.push(s,50+f*.3+Math.sin(s*.11)*8+(Math.random()-.5)*3),y([Math.max(0,s-400),s]),o=requestAnimationFrame(u)};return o=requestAnimationFrame(u),()=>cancelAnimationFrame(o)},[]);const a=R.categorical(3);return e.jsxs(C,{direction:"vertical",gap:4,children:[e.jsx(A,{level:3,children:"Stress: 3 streams + axes + grid @ 60fps"}),e.jsxs(h,{type:"label",children:["FPS: ",g]}),e.jsxs(k,{data:[{t:0,v:0},{t:1,v:100}],xKey:"t",yKeys:["v"],yDomain:[0,100],xDomain:x,height:300,children:[e.jsx(z,{horizontal:!0}),e.jsx(p,{position:"bottom"}),e.jsx(p,{position:"left"}),e.jsx(T,{handleRef:i,color:a[0],bufferSize:400,lineWidth:1.5,opacity:.8}),e.jsx(T,{handleRef:n,color:a[1],bufferSize:400,lineWidth:1.5,opacity:.8}),e.jsx(T,{handleRef:d,color:a[2],bufferSize:400,lineWidth:1.5,opacity:.8})]})]})}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source},description:{story:`Measures frame timing when xDomain updates on every push.
Shows: fps, render time per frame, and dropped frames.`,...M.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:`Throttled xDomain — updates every 500ms instead of every frame.
Axis slides in steps; stream still renders every frame via WebGL.`,...b.parameters?.docs?.description}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:"Stress test: 3 streams + both axes + grid, xDomain every frame.",...D.parameters?.docs?.description}}};const N=["XDomainUpdateCost","ThrottledXDomain","StressTest"];export{D as StressTest,b as ThrottledXDomain,M as XDomainUpdateCost,N as __namedExportsOrder,J as default};
