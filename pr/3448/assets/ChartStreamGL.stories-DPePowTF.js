import{ah as t,a1 as e,T as x}from"./iframe-Cm6U1NA5.js";import{S as d}from"./Stack-B9vKkIeB.js";import{u as M}from"./useChartColors-vcVnixlO.js";import{H as k}from"./Heading-g_dVDBTz.js";import{C as R,a as c}from"./ChartAxis-PSASVsNc.js";import{C as y}from"./ChartGrid-CXk-Yb-3.js";import{C as f}from"./ChartStreamGL-CocOgZzN.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";import"./ChartContext-DPQDI6hz.js";import"./linear-gs3faI6G.js";import"./webgl-B2CDFegl.js";const I={title:"Lab/ChartStreamGL"},g={render:()=>{const s=M(),n=t.useRef(null),a=t.useRef(150),r=t.useRef(0),[l,u]=t.useState(150),[i,m]=t.useState([0,400]);return t.useEffect(()=>{const p=setInterval(()=>{r.current+=1;const j=(Math.random()+Math.random()+Math.random()-1.5)*2,S=1e-4-.008*.008/2+.008*j;a.current*=Math.exp(S),u(a.current),n.current?.push(r.current,a.current),m([Math.max(0,r.current-400),r.current])},50);return()=>clearInterval(p)},[]),e.jsxs(d,{direction:"vertical",gap:4,children:[e.jsx(k,{level:3,children:"Simulated Stock Ticker"}),e.jsxs(d,{direction:"horizontal",gap:3,vAlign:"center",children:[e.jsx(x,{type:"label",children:"ACME Corp"}),e.jsxs(x,{type:"body",children:["$",l.toFixed(2)]})]}),e.jsxs(R,{data:[{t:0,v:130},{t:1,v:170}],xKey:"t",yKeys:["v"],yDomain:[130,170],xDomain:i,yBaseline:"data",height:220,children:[e.jsx(y,{horizontal:!0}),e.jsx(c,{position:"bottom"}),e.jsx(c,{position:"left"}),e.jsx(f,{handleRef:n,color:s.categorical(1)[0],bufferSize:400,lineWidth:1.5})]})]})}};function z(s,n,a){const r=t.useRef(0);t.useEffect(()=>{const{base:l,amplitude:u,frequency:i,noise:m,spikeProbability:o,spikeSize:h,windowSize:p}=a,j=setInterval(()=>{r.current+=1;let S=l+Math.sin(r.current*i)*u+Math.sin(r.current*i*2.7)*u*.3+(Math.random()-.5)*m;Math.random()<o&&(S+=h*(.5+Math.random()*.5)),S=Math.max(0,Math.min(100,S)),s.current?.push(r.current,S),n([Math.max(0,r.current-p),r.current])},33);return()=>clearInterval(j)},[s,n,a])}const b={render:()=>{const s=M(),n=t.useRef(null),a=t.useRef(null),r=t.useRef(null),[l,u]=t.useState([0,300]),[i,m]=t.useState([0,300]),[o,h]=t.useState([0,300]);z(n,u,{base:35,amplitude:15,frequency:.04,noise:8,spikeProbability:.01,spikeSize:40,windowSize:300}),z(a,m,{base:62,amplitude:5,frequency:.008,noise:2,spikeProbability:.005,spikeSize:15,windowSize:300}),z(r,h,{base:20,amplitude:12,frequency:.06,noise:10,spikeProbability:.02,spikeSize:30,windowSize:300});const p={data:[{t:0,v:0},{t:1,v:100}],xKey:"t",yKeys:["v"],yDomain:[0,100],height:150};return e.jsxs(d,{direction:"vertical",gap:4,children:[e.jsx(k,{level:3,children:"Server Metrics Dashboard"}),e.jsxs(d,{direction:"vertical",gap:1,children:[e.jsx(x,{type:"label",children:"CPU Usage (%)"}),e.jsxs(R,{...p,xDomain:l,children:[e.jsx(y,{horizontal:!0}),e.jsx(c,{position:"bottom"}),e.jsx(c,{position:"left"}),e.jsx(f,{handleRef:n,color:s.categorical(3)[0],bufferSize:300,lineWidth:1.5})]})]}),e.jsxs(d,{direction:"vertical",gap:1,children:[e.jsx(x,{type:"label",children:"Memory Usage (%)"}),e.jsxs(R,{...p,xDomain:i,children:[e.jsx(y,{horizontal:!0}),e.jsx(c,{position:"bottom"}),e.jsx(c,{position:"left"}),e.jsx(f,{handleRef:a,color:s.categorical(3)[1],bufferSize:300,lineWidth:1.5})]})]}),e.jsxs(d,{direction:"vertical",gap:1,children:[e.jsx(x,{type:"label",children:"Network I/O (Mbps)"}),e.jsxs(R,{...p,xDomain:o,children:[e.jsx(y,{horizontal:!0}),e.jsx(c,{position:"bottom"}),e.jsx(c,{position:"left"}),e.jsx(f,{handleRef:r,color:s.categorical(3)[2],bufferSize:300,lineWidth:1.5})]})]})]})}},C={render:()=>{const s=M(),n=t.useRef(null),a=t.useRef(0),r=t.useRef(0),[l,u]=t.useState([0,600]);return t.useEffect(()=>{let i;const m=()=>{a.current+=1,Math.random()<.003&&(r.current=30+Math.random()*50),r.current*=.97;const o=(Math.random()-.5)*2,h=r.current>.5?Math.sin(a.current*.5)*r.current*(.5+Math.random()*.5):0;n.current?.push(a.current,o+h),u([Math.max(0,a.current-600),a.current]),i=requestAnimationFrame(m)};return i=requestAnimationFrame(m),()=>cancelAnimationFrame(i)},[]),e.jsxs(d,{direction:"vertical",gap:4,children:[e.jsx(k,{level:3,children:"Seismograph"}),e.jsx(x,{type:"supporting",color:"secondary",children:'yBaseline="zero" anchors 0 to center. Both axes from chart context.'}),e.jsxs(R,{data:[{t:0,v:-80},{t:1,v:80}],xKey:"t",yKeys:["v"],yDomain:[-80,80],xDomain:l,yBaseline:"zero",height:220,children:[e.jsx(y,{horizontal:!0}),e.jsx(c,{position:"bottom"}),e.jsx(c,{position:"left"}),e.jsx(f,{handleRef:n,color:s.categorical(5)[3],bufferSize:600,lineWidth:1,opacity:.9})]})]})}},v={render:()=>{const s=M(),n=t.useRef(null),a=t.useRef(null),r=t.useRef(null),l=t.useRef(0),[u,i]=t.useState([0,400]);return t.useEffect(()=>{const m=setInterval(()=>{l.current+=1;const o=l.current,h=Math.sin(o*.02)*20;n.current?.push(o,50+h+Math.sin(o*.07)*10+(Math.random()-.5)*4),a.current?.push(o,50+h*.6+Math.cos(o*.05)*15+(Math.random()-.5)*6),r.current?.push(o,50+h*.3+Math.sin(o*.11)*8+(Math.random()-.5)*3),o>400&&i([Math.max(0,o-400),o])},33);return()=>clearInterval(m)},[]),e.jsxs(d,{direction:"vertical",gap:4,children:[e.jsx(k,{level:3,children:"Multi-Sensor Overlay"}),e.jsx(x,{type:"supporting",color:"secondary",children:"Three streams sharing one chart, same xDomain, same yDomain=[0, 100]."}),e.jsxs(R,{data:[{t:0,v:0},{t:1,v:100}],xKey:"t",yKeys:["v"],yDomain:[0,100],xDomain:u,height:280,children:[e.jsx(y,{horizontal:!0}),e.jsx(c,{position:"bottom"}),e.jsx(c,{position:"left"}),e.jsx(f,{handleRef:n,color:s.categorical(3)[0],bufferSize:400,lineWidth:1.5,opacity:.8}),e.jsx(f,{handleRef:a,color:s.categorical(3)[1],bufferSize:400,lineWidth:1.5,opacity:.8}),e.jsx(f,{handleRef:r,color:s.categorical(3)[2],bufferSize:400,lineWidth:1.5,opacity:.8})]})]})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const priceRef = useRef(150);
    const tRef = useRef(0);
    const [price, setPrice] = useState(150);
    const [xDomain, setXDomain] = useState<[number, number]>([0, 400]);
    useEffect(() => {
      const mu = 0.0001;
      const sigma = 0.008;
      const id = setInterval(() => {
        tRef.current += 1;
        const z = (Math.random() + Math.random() + Math.random() - 1.5) * 2;
        const logReturn = mu - sigma * sigma / 2 + sigma * z;
        priceRef.current *= Math.exp(logReturn);
        setPrice(priceRef.current);
        streamRef.current?.push(tRef.current, priceRef.current);
        // Slide the x window
        {
          setXDomain([Math.max(0, tRef.current - 400), tRef.current]);
        }
      }, 50);
      return () => clearInterval(id);
    }, []);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Simulated Stock Ticker</Heading>
        <Stack direction="horizontal" gap={3} vAlign="center">
          <Text type="label">ACME Corp</Text>
          <Text type="body">\${price.toFixed(2)}</Text>
        </Stack>
        <Chart data={[{
        t: 0,
        v: 130
      }, {
        t: 1,
        v: 170
      }]} xKey="t" yKeys={['v']} yDomain={[130, 170]} xDomain={xDomain} yBaseline="data" height={220}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL handleRef={streamRef} color={colors.categorical(1)[0]} bufferSize={400} lineWidth={1.5} />
        </Chart>
      </Stack>;
  }
}`,...g.parameters?.docs?.source},description:{story:"Simulated stock price — GBM with drift and volatility",...g.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const cpuRef = useRef<ChartStreamGLHandle>(null);
    const memRef = useRef<ChartStreamGLHandle>(null);
    const netRef = useRef<ChartStreamGLHandle>(null);
    const [cpuX, setCpuX] = useState<[number, number]>([0, 300]);
    const [memX, setMemX] = useState<[number, number]>([0, 300]);
    const [netX, setNetX] = useState<[number, number]>([0, 300]);
    useMetricStream(cpuRef, setCpuX, {
      base: 35,
      amplitude: 15,
      frequency: 0.04,
      noise: 8,
      spikeProbability: 0.01,
      spikeSize: 40,
      windowSize: 300
    });
    useMetricStream(memRef, setMemX, {
      base: 62,
      amplitude: 5,
      frequency: 0.008,
      noise: 2,
      spikeProbability: 0.005,
      spikeSize: 15,
      windowSize: 300
    });
    useMetricStream(netRef, setNetX, {
      base: 20,
      amplitude: 12,
      frequency: 0.06,
      noise: 10,
      spikeProbability: 0.02,
      spikeSize: 30,
      windowSize: 300
    });
    const chartProps = {
      data: [{
        t: 0,
        v: 0
      }, {
        t: 1,
        v: 100
      }] as Record<string, unknown>[],
      xKey: 't',
      yKeys: ['v'] as string[],
      yDomain: [0, 100] as [number, number],
      height: 150
    };
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Server Metrics Dashboard</Heading>
        <Stack direction="vertical" gap={1}>
          <Text type="label">CPU Usage (%)</Text>
          <Chart {...chartProps} xDomain={cpuX}>
            <ChartGrid horizontal />
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
            <ChartStreamGL handleRef={cpuRef} color={colors.categorical(3)[0]} bufferSize={300} lineWidth={1.5} />
          </Chart>
        </Stack>
        <Stack direction="vertical" gap={1}>
          <Text type="label">Memory Usage (%)</Text>
          <Chart {...chartProps} xDomain={memX}>
            <ChartGrid horizontal />
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
            <ChartStreamGL handleRef={memRef} color={colors.categorical(3)[1]} bufferSize={300} lineWidth={1.5} />
          </Chart>
        </Stack>
        <Stack direction="vertical" gap={1}>
          <Text type="label">Network I/O (Mbps)</Text>
          <Chart {...chartProps} xDomain={netX}>
            <ChartGrid horizontal />
            <ChartAxis position="bottom" />
            <ChartAxis position="left" />
            <ChartStreamGL handleRef={netRef} color={colors.categorical(3)[2]} bufferSize={300} lineWidth={1.5} />
          </Chart>
        </Stack>
      </Stack>;
  }
}`,...b.parameters?.docs?.source},description:{story:"Server dashboard — CPU, Memory, and Network at 30fps",...b.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const streamRef = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const quakeRef = useRef(0);
    const [xDomain, setXDomain] = useState<[number, number]>([0, 600]);
    useEffect(() => {
      let raf: number;
      const tick = () => {
        tRef.current += 1;
        if (Math.random() < 0.003) {
          quakeRef.current = 30 + Math.random() * 50;
        }
        quakeRef.current *= 0.97;
        const microTremor = (Math.random() - 0.5) * 2;
        const quakeSignal = quakeRef.current > 0.5 ? Math.sin(tRef.current * 0.5) * quakeRef.current * (0.5 + Math.random() * 0.5) : 0;
        streamRef.current?.push(tRef.current, microTremor + quakeSignal);
        {
          setXDomain([Math.max(0, tRef.current - 600), tRef.current]);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Seismograph</Heading>
        <Text type="supporting" color="secondary">
          yBaseline=&quot;zero&quot; anchors 0 to center. Both axes from chart
          context.
        </Text>
        <Chart data={[{
        t: 0,
        v: -80
      }, {
        t: 1,
        v: 80
      }]} xKey="t" yKeys={['v']} yDomain={[-80, 80]} xDomain={xDomain} yBaseline="zero" height={220}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL handleRef={streamRef} color={colors.categorical(5)[3]} bufferSize={600} lineWidth={1} opacity={0.9} />
        </Chart>
      </Stack>;
  }
}`,...C.parameters?.docs?.source},description:{story:"Seismograph — zero-centered with x-axis",...C.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const s1Ref = useRef<ChartStreamGLHandle>(null);
    const s2Ref = useRef<ChartStreamGLHandle>(null);
    const s3Ref = useRef<ChartStreamGLHandle>(null);
    const tRef = useRef(0);
    const [xDomain, setXDomain] = useState<[number, number]>([0, 400]);
    useEffect(() => {
      const id = setInterval(() => {
        tRef.current += 1;
        const t = tRef.current;
        const shared = Math.sin(t * 0.02) * 20;
        s1Ref.current?.push(t, 50 + shared + Math.sin(t * 0.07) * 10 + (Math.random() - 0.5) * 4);
        s2Ref.current?.push(t, 50 + shared * 0.6 + Math.cos(t * 0.05) * 15 + (Math.random() - 0.5) * 6);
        s3Ref.current?.push(t, 50 + shared * 0.3 + Math.sin(t * 0.11) * 8 + (Math.random() - 0.5) * 3);
        if (t > 400) {
          setXDomain([Math.max(0, t - 400), t]);
        }
      }, 33);
      return () => clearInterval(id);
    }, []);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Multi-Sensor Overlay</Heading>
        <Text type="supporting" color="secondary">
          
          Three streams sharing one chart, same xDomain, same yDomain=[0, 100].
        </Text>
        <Chart data={[{
        t: 0,
        v: 0
      }, {
        t: 1,
        v: 100
      }]} xKey="t" yKeys={['v']} yDomain={[0, 100]} xDomain={xDomain} height={280}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartStreamGL handleRef={s1Ref} color={colors.categorical(3)[0]} bufferSize={400} lineWidth={1.5} opacity={0.8} />
          <ChartStreamGL handleRef={s2Ref} color={colors.categorical(3)[1]} bufferSize={400} lineWidth={1.5} opacity={0.8} />
          <ChartStreamGL handleRef={s3Ref} color={colors.categorical(3)[2]} bufferSize={400} lineWidth={1.5} opacity={0.8} />
        </Chart>
      </Stack>;
  }
}`,...v.parameters?.docs?.source},description:{story:"Three streams on one chart sharing xDomain and yDomain",...v.parameters?.docs?.description}}};const B=["StockPrice","ServerDashboard","SeismographDemo","MultiSensorOverlay"];export{v as MultiSensorOverlay,C as SeismographDemo,b as ServerDashboard,g as StockPrice,B as __namedExportsOrder,I as default};
