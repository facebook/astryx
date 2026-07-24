import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{t as a}from"./Heading-D-Ri_Mjs.js";import{c as o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Text-BUJwo4gL.js";import{u as c}from"./iframe-B2M4pHB5.js";import{At as l,Et as u,Ot as d,ot as f,t as p,tt as m}from"./src-doLYD-I7.js";function h(e,t,n){let r=(0,g.useRef)(0);(0,g.useEffect)(()=>{let{base:i,amplitude:a,frequency:o,noise:s,spikeProbability:c,spikeSize:l,windowSize:u}=n,d=setInterval(()=>{r.current+=1;let n=i+Math.sin(r.current*o)*a+Math.sin(r.current*o*2.7)*a*.3+(Math.random()-.5)*s;Math.random()<c&&(n+=l*(.5+Math.random()*.5)),n=Math.max(0,Math.min(100,n)),e.current?.push(r.current,n),t([Math.max(0,r.current-u),r.current])},33);return()=>clearInterval(d)},[e,t,n])}var g,_,v,y,b,x,S,C;e((()=>{g=t(n()),p(),c(),s(),_=r(),v={title:`Lab/ChartStreamGL`},y={render:()=>{let e=m(),t=(0,g.useRef)(null),n=(0,g.useRef)(150),r=(0,g.useRef)(0),[s,c]=(0,g.useState)(150),[p,h]=(0,g.useState)([0,400]);return(0,g.useEffect)(()=>{let e=.008,i=setInterval(()=>{r.current+=1;let i=(Math.random()+Math.random()+Math.random()-1.5)*2,a=1e-4-e*e/2+e*i;n.current*=Math.exp(a),c(n.current),t.current?.push(r.current,n.current),h([Math.max(0,r.current-400),r.current])},50);return()=>clearInterval(i)},[]),(0,_.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,_.jsx)(a,{level:3,children:`Simulated Stock Ticker`}),(0,_.jsxs)(o,{direction:`horizontal`,gap:3,vAlign:`center`,children:[(0,_.jsx)(i,{type:`label`,children:`ACME Corp`}),(0,_.jsxs)(i,{type:`body`,children:[`$`,s.toFixed(2)]})]}),(0,_.jsxs)(l,{data:[{t:0,v:130},{t:1,v:170}],xKey:`t`,yKeys:[`v`],yDomain:[130,170],xDomain:p,yBaseline:`data`,height:220,children:[(0,_.jsx)(u,{horizontal:!0}),(0,_.jsx)(d,{position:`bottom`}),(0,_.jsx)(d,{position:`left`}),(0,_.jsx)(f,{handleRef:t,color:e.categorical(1)[0],bufferSize:400,lineWidth:1.5})]})]})}},b={render:()=>{let e=m(),t=(0,g.useRef)(null),n=(0,g.useRef)(null),r=(0,g.useRef)(null),[s,c]=(0,g.useState)([0,300]),[p,v]=(0,g.useState)([0,300]),[y,b]=(0,g.useState)([0,300]);h(t,c,{base:35,amplitude:15,frequency:.04,noise:8,spikeProbability:.01,spikeSize:40,windowSize:300}),h(n,v,{base:62,amplitude:5,frequency:.008,noise:2,spikeProbability:.005,spikeSize:15,windowSize:300}),h(r,b,{base:20,amplitude:12,frequency:.06,noise:10,spikeProbability:.02,spikeSize:30,windowSize:300});let x={data:[{t:0,v:0},{t:1,v:100}],xKey:`t`,yKeys:[`v`],yDomain:[0,100],height:150};return(0,_.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,_.jsx)(a,{level:3,children:`Server Metrics Dashboard`}),(0,_.jsxs)(o,{direction:`vertical`,gap:1,children:[(0,_.jsx)(i,{type:`label`,children:`CPU Usage (%)`}),(0,_.jsxs)(l,{...x,xDomain:s,children:[(0,_.jsx)(u,{horizontal:!0}),(0,_.jsx)(d,{position:`bottom`}),(0,_.jsx)(d,{position:`left`}),(0,_.jsx)(f,{handleRef:t,color:e.categorical(3)[0],bufferSize:300,lineWidth:1.5})]})]}),(0,_.jsxs)(o,{direction:`vertical`,gap:1,children:[(0,_.jsx)(i,{type:`label`,children:`Memory Usage (%)`}),(0,_.jsxs)(l,{...x,xDomain:p,children:[(0,_.jsx)(u,{horizontal:!0}),(0,_.jsx)(d,{position:`bottom`}),(0,_.jsx)(d,{position:`left`}),(0,_.jsx)(f,{handleRef:n,color:e.categorical(3)[1],bufferSize:300,lineWidth:1.5})]})]}),(0,_.jsxs)(o,{direction:`vertical`,gap:1,children:[(0,_.jsx)(i,{type:`label`,children:`Network I/O (Mbps)`}),(0,_.jsxs)(l,{...x,xDomain:y,children:[(0,_.jsx)(u,{horizontal:!0}),(0,_.jsx)(d,{position:`bottom`}),(0,_.jsx)(d,{position:`left`}),(0,_.jsx)(f,{handleRef:r,color:e.categorical(3)[2],bufferSize:300,lineWidth:1.5})]})]})]})}},x={render:()=>{let e=m(),t=(0,g.useRef)(null),n=(0,g.useRef)(0),r=(0,g.useRef)(0),[s,c]=(0,g.useState)([0,600]);return(0,g.useEffect)(()=>{let e,i=()=>{n.current+=1,Math.random()<.003&&(r.current=30+Math.random()*50),r.current*=.97;let a=(Math.random()-.5)*2,o=r.current>.5?Math.sin(n.current*.5)*r.current*(.5+Math.random()*.5):0;t.current?.push(n.current,a+o),c([Math.max(0,n.current-600),n.current]),e=requestAnimationFrame(i)};return e=requestAnimationFrame(i),()=>cancelAnimationFrame(e)},[]),(0,_.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,_.jsx)(a,{level:3,children:`Seismograph`}),(0,_.jsx)(i,{type:`supporting`,color:`secondary`,children:`yBaseline="zero" anchors 0 to center. Both axes from chart context.`}),(0,_.jsxs)(l,{data:[{t:0,v:-80},{t:1,v:80}],xKey:`t`,yKeys:[`v`],yDomain:[-80,80],xDomain:s,yBaseline:`zero`,height:220,children:[(0,_.jsx)(u,{horizontal:!0}),(0,_.jsx)(d,{position:`bottom`}),(0,_.jsx)(d,{position:`left`}),(0,_.jsx)(f,{handleRef:t,color:e.categorical(5)[3],bufferSize:600,lineWidth:1,opacity:.9})]})]})}},S={render:()=>{let e=m(),t=(0,g.useRef)(null),n=(0,g.useRef)(null),r=(0,g.useRef)(null),s=(0,g.useRef)(0),[c,p]=(0,g.useState)([0,400]);return(0,g.useEffect)(()=>{let e=setInterval(()=>{s.current+=1;let e=s.current,i=Math.sin(e*.02)*20;t.current?.push(e,50+i+Math.sin(e*.07)*10+(Math.random()-.5)*4),n.current?.push(e,50+i*.6+Math.cos(e*.05)*15+(Math.random()-.5)*6),r.current?.push(e,50+i*.3+Math.sin(e*.11)*8+(Math.random()-.5)*3),e>400&&p([Math.max(0,e-400),e])},33);return()=>clearInterval(e)},[]),(0,_.jsxs)(o,{direction:`vertical`,gap:4,children:[(0,_.jsx)(a,{level:3,children:`Multi-Sensor Overlay`}),(0,_.jsx)(i,{type:`supporting`,color:`secondary`,children:`Three streams sharing one chart, same xDomain, same yDomain=[0, 100].`}),(0,_.jsxs)(l,{data:[{t:0,v:0},{t:1,v:100}],xKey:`t`,yKeys:[`v`],yDomain:[0,100],xDomain:c,height:280,children:[(0,_.jsx)(u,{horizontal:!0}),(0,_.jsx)(d,{position:`bottom`}),(0,_.jsx)(d,{position:`left`}),(0,_.jsx)(f,{handleRef:t,color:e.categorical(3)[0],bufferSize:400,lineWidth:1.5,opacity:.8}),(0,_.jsx)(f,{handleRef:n,color:e.categorical(3)[1],bufferSize:400,lineWidth:1.5,opacity:.8}),(0,_.jsx)(f,{handleRef:r,color:e.categorical(3)[2],bufferSize:400,lineWidth:1.5,opacity:.8})]})]})}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:`Simulated stock price — GBM with drift and volatility`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:`Server dashboard — CPU, Memory, and Network at 30fps`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:`Seismograph — zero-centered with x-axis`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source},description:{story:`Three streams on one chart sharing xDomain and yDomain`,...S.parameters?.docs?.description}}},C=[`StockPrice`,`ServerDashboard`,`SeismographDemo`,`MultiSensorOverlay`]}))();export{S as MultiSensorOverlay,x as SeismographDemo,b as ServerDashboard,y as StockPrice,C as __namedExportsOrder,v as default};