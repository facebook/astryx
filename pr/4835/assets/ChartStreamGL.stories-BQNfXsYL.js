import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./Heading-CaMVckJS.js";import{n as s,t as c}from"./Stack-D-ryFIvw.js";import{i as l,n as u,r as d,t as f}from"./ChartAxis-BYz-LLki.js";import{n as p,t as m}from"./ChartGrid-DYJI9wDe.js";import{n as h,t as g}from"./ChartStreamGL-DJ9P_ZPT.js";import{n as _,t as v}from"./useChartColors-tODQlwNr.js";function y(e,t,n){let r=(0,b.useRef)(0);(0,b.useEffect)(()=>{let{base:i,amplitude:a,frequency:o,noise:s,spikeProbability:c,spikeSize:l,windowSize:u}=n,d=setInterval(()=>{r.current+=1;let n=i+Math.sin(r.current*o)*a+Math.sin(r.current*o*2.7)*a*.3+(Math.random()-.5)*s;Math.random()<c&&(n+=l*(.5+Math.random()*.5)),n=Math.max(0,Math.min(100,n)),e.current?.push(r.current,n),t([Math.max(0,r.current-u),r.current])},33);return()=>clearInterval(d)},[e,t,n])}var b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{b=t(),l(),u(),p(),h(),v(),s(),n(),a(),x=i(),S={title:`Lab/ChartStreamGL`},C={render:()=>{let e=_(),t=(0,b.useRef)(null),n=(0,b.useRef)(150),i=(0,b.useRef)(0),[a,s]=(0,b.useState)(150),[l,u]=(0,b.useState)([0,400]);return(0,b.useEffect)(()=>{let e=.008,r=setInterval(()=>{i.current+=1;let r=(Math.random()+Math.random()+Math.random()-1.5)*2,a=1e-4-e*e/2+e*r;n.current*=Math.exp(a),s(n.current),t.current?.push(i.current,n.current),u([Math.max(0,i.current-400),i.current])},50);return()=>clearInterval(r)},[]),(0,x.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,x.jsx)(o,{level:3,children:`Simulated Stock Ticker`}),(0,x.jsxs)(c,{direction:`horizontal`,gap:3,vAlign:`center`,children:[(0,x.jsx)(r,{type:`label`,children:`ACME Corp`}),(0,x.jsxs)(r,{type:`body`,children:[`$`,a.toFixed(2)]})]}),(0,x.jsxs)(d,{data:[{t:0,v:130},{t:1,v:170}],xKey:`t`,yKeys:[`v`],yDomain:[130,170],xDomain:l,yBaseline:`data`,height:220,children:[(0,x.jsx)(m,{horizontal:!0}),(0,x.jsx)(f,{position:`bottom`}),(0,x.jsx)(f,{position:`left`}),(0,x.jsx)(g,{handleRef:t,color:e.categorical(1)[0],bufferSize:400,lineWidth:1.5})]})]})}},w={render:()=>{let e=_(),t=(0,b.useRef)(null),n=(0,b.useRef)(null),i=(0,b.useRef)(null),[a,s]=(0,b.useState)([0,300]),[l,u]=(0,b.useState)([0,300]),[p,h]=(0,b.useState)([0,300]);y(t,s,{base:35,amplitude:15,frequency:.04,noise:8,spikeProbability:.01,spikeSize:40,windowSize:300}),y(n,u,{base:62,amplitude:5,frequency:.008,noise:2,spikeProbability:.005,spikeSize:15,windowSize:300}),y(i,h,{base:20,amplitude:12,frequency:.06,noise:10,spikeProbability:.02,spikeSize:30,windowSize:300});let v={data:[{t:0,v:0},{t:1,v:100}],xKey:`t`,yKeys:[`v`],yDomain:[0,100],height:150};return(0,x.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,x.jsx)(o,{level:3,children:`Server Metrics Dashboard`}),(0,x.jsxs)(c,{direction:`vertical`,gap:1,children:[(0,x.jsx)(r,{type:`label`,children:`CPU Usage (%)`}),(0,x.jsxs)(d,{...v,xDomain:a,children:[(0,x.jsx)(m,{horizontal:!0}),(0,x.jsx)(f,{position:`bottom`}),(0,x.jsx)(f,{position:`left`}),(0,x.jsx)(g,{handleRef:t,color:e.categorical(3)[0],bufferSize:300,lineWidth:1.5})]})]}),(0,x.jsxs)(c,{direction:`vertical`,gap:1,children:[(0,x.jsx)(r,{type:`label`,children:`Memory Usage (%)`}),(0,x.jsxs)(d,{...v,xDomain:l,children:[(0,x.jsx)(m,{horizontal:!0}),(0,x.jsx)(f,{position:`bottom`}),(0,x.jsx)(f,{position:`left`}),(0,x.jsx)(g,{handleRef:n,color:e.categorical(3)[1],bufferSize:300,lineWidth:1.5})]})]}),(0,x.jsxs)(c,{direction:`vertical`,gap:1,children:[(0,x.jsx)(r,{type:`label`,children:`Network I/O (Mbps)`}),(0,x.jsxs)(d,{...v,xDomain:p,children:[(0,x.jsx)(m,{horizontal:!0}),(0,x.jsx)(f,{position:`bottom`}),(0,x.jsx)(f,{position:`left`}),(0,x.jsx)(g,{handleRef:i,color:e.categorical(3)[2],bufferSize:300,lineWidth:1.5})]})]})]})}},T={render:()=>{let e=_(),t=(0,b.useRef)(null),n=(0,b.useRef)(0),i=(0,b.useRef)(0),[a,s]=(0,b.useState)([0,600]);return(0,b.useEffect)(()=>{let e,r=()=>{n.current+=1,Math.random()<.003&&(i.current=30+Math.random()*50),i.current*=.97;let a=(Math.random()-.5)*2,o=i.current>.5?Math.sin(n.current*.5)*i.current*(.5+Math.random()*.5):0;t.current?.push(n.current,a+o),s([Math.max(0,n.current-600),n.current]),e=requestAnimationFrame(r)};return e=requestAnimationFrame(r),()=>cancelAnimationFrame(e)},[]),(0,x.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,x.jsx)(o,{level:3,children:`Seismograph`}),(0,x.jsx)(r,{type:`supporting`,color:`secondary`,children:`yBaseline="zero" anchors 0 to center. Both axes from chart context.`}),(0,x.jsxs)(d,{data:[{t:0,v:-80},{t:1,v:80}],xKey:`t`,yKeys:[`v`],yDomain:[-80,80],xDomain:a,yBaseline:`zero`,height:220,children:[(0,x.jsx)(m,{horizontal:!0}),(0,x.jsx)(f,{position:`bottom`}),(0,x.jsx)(f,{position:`left`}),(0,x.jsx)(g,{handleRef:t,color:e.categorical(5)[3],bufferSize:600,lineWidth:1,opacity:.9})]})]})}},E={render:()=>{let e=_(),t=(0,b.useRef)(null),n=(0,b.useRef)(null),i=(0,b.useRef)(null),a=(0,b.useRef)(0),[s,l]=(0,b.useState)([0,400]);return(0,b.useEffect)(()=>{let e=setInterval(()=>{a.current+=1;let e=a.current,r=Math.sin(e*.02)*20;t.current?.push(e,50+r+Math.sin(e*.07)*10+(Math.random()-.5)*4),n.current?.push(e,50+r*.6+Math.cos(e*.05)*15+(Math.random()-.5)*6),i.current?.push(e,50+r*.3+Math.sin(e*.11)*8+(Math.random()-.5)*3),e>400&&l([Math.max(0,e-400),e])},33);return()=>clearInterval(e)},[]),(0,x.jsxs)(c,{direction:`vertical`,gap:4,children:[(0,x.jsx)(o,{level:3,children:`Multi-Sensor Overlay`}),(0,x.jsx)(r,{type:`supporting`,color:`secondary`,children:`Three streams sharing one chart, same xDomain, same yDomain=[0, 100].`}),(0,x.jsxs)(d,{data:[{t:0,v:0},{t:1,v:100}],xKey:`t`,yKeys:[`v`],yDomain:[0,100],xDomain:s,height:280,children:[(0,x.jsx)(m,{horizontal:!0}),(0,x.jsx)(f,{position:`bottom`}),(0,x.jsx)(f,{position:`left`}),(0,x.jsx)(g,{handleRef:t,color:e.categorical(3)[0],bufferSize:400,lineWidth:1.5,opacity:.8}),(0,x.jsx)(g,{handleRef:n,color:e.categorical(3)[1],bufferSize:400,lineWidth:1.5,opacity:.8}),(0,x.jsx)(g,{handleRef:i,color:e.categorical(3)[2],bufferSize:400,lineWidth:1.5,opacity:.8})]})]})}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source},description:{story:`Simulated stock price — GBM with drift and volatility`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source},description:{story:`Server dashboard — CPU, Memory, and Network at 30fps`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source},description:{story:`Seismograph — zero-centered with x-axis`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source},description:{story:`Three streams on one chart sharing xDomain and yDomain`,...E.parameters?.docs?.description}}},D=[`StockPrice`,`ServerDashboard`,`SeismographDemo`,`MultiSensorOverlay`]})))()}O();export{E as MultiSensorOverlay,T as SeismographDemo,w as ServerDashboard,C as StockPrice,D as __namedExportsOrder,S as default};