import{ah as r,a1 as e,T as D}from"./iframe-BAsU9Dt9.js";import{S as j}from"./Stack-CKRWU4oS.js";import{u as S}from"./useChartColors-DoG_0f10.js";import{H as v}from"./Heading-aDohXlb0.js";import{C as w,a as h}from"./ChartAxis-CJvYh9eT.js";import{C as b}from"./ChartGrid-DTqdCyol.js";import{C as K}from"./ChartStreamGL-CaYTTa0G.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";import"./ChartContext-CpEhNUe0.js";import"./linear-gs3faI6G.js";import"./webgl-B2CDFegl.js";function q({xWindow:s,yDomain:n,yPadding:t=.1,yCenter:o=!1}){const[c,a]=r.useState([0,0]),[u,i]=r.useState(n??[0,1]),d=r.useRef({yMin:n?n[0]:1/0,yMax:n?n[1]:-1/0}),R=r.useCallback((m,p,A)=>{A?.current?.push(m,p);const G=m>=s?m-s:0,I=m>=s?m:Math.max(m,1);if(a([G,I]),!n){const l=d.current;let C=!1;if(p<l.yMin&&(l.yMin=p,C=!0),p>l.yMax&&(l.yMax=p,C=!0),C){const z=(l.yMax-l.yMin||1)*t;let k=l.yMin-z,M=l.yMax+z;if(o){const F=Math.max(Math.abs(k),Math.abs(M));k=-F,M=F}i([k,M])}}},[s,n,t,o]),g=r.useCallback(()=>{d.current={yMin:n?n[0]:1/0,yMax:n?n[1]:-1/0},a([0,0]),i(n??[0,1])},[n]);return{xDomain:c,yDomain:n??u,push:R,reset:g}}const Q={title:"Lab/useChartRange"},f={render:()=>{const s=S(),n=r.useRef(null),t=r.useRef(0),{xDomain:o,yDomain:c,push:a}=q({xWindow:300,yDomain:[0,100]});return r.useEffect(()=>{const u=setInterval(()=>{t.current+=1;const i=Math.sin(t.current*.04)*30+50+(Math.random()-.5)*10;a(t.current,i,n)},33);return()=>clearInterval(u)},[a]),e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(v,{level:3,children:"Known Range (0-100%)"}),e.jsx(D,{type:"supporting",color:"secondary",children:"yDomain fixed at [0, 100]. useChartRange manages xDomain sliding window."}),e.jsxs(w,{data:[],xKey:"t",yKeys:[],xDomain:o,yDomain:c,height:200,children:[e.jsx(b,{horizontal:!0}),e.jsx(h,{position:"bottom"}),e.jsx(h,{position:"left"}),e.jsx(K,{handleRef:n,color:s.categorical(1)[0],bufferSize:300,lineWidth:1.5})]})]})}},y={render:()=>{const s=S(),n=r.useRef(null),t=r.useRef(0),{xDomain:o,yDomain:c,push:a}=q({xWindow:300,yPadding:.1});return r.useEffect(()=>{const u=setInterval(()=>{t.current+=1;const i=10+t.current*.05,d=Math.sin(t.current*.03)*i+50;a(t.current,d,n)},33);return()=>clearInterval(u)},[a]),e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(v,{level:3,children:"Unknown Range (auto-tracks)"}),e.jsxs(D,{type:"supporting",color:"secondary",children:["No fixed yDomain. Range auto-expands as data reveals amplitude. Currently: [",c[0].toFixed(1),", ",c[1].toFixed(1),"]"]}),e.jsxs(w,{data:[],xKey:"t",yKeys:[],xDomain:o,yDomain:c,height:200,children:[e.jsx(b,{horizontal:!0}),e.jsx(h,{position:"bottom"}),e.jsx(h,{position:"left"}),e.jsx(K,{handleRef:n,color:s.categorical(2)[1],bufferSize:300,lineWidth:1.5})]})]})}},x={render:()=>{const s=S(),n=r.useRef(null),t=r.useRef(0),o=r.useRef(0),{xDomain:c,yDomain:a,push:u}=q({xWindow:600,yCenter:!0,yPadding:.05});return r.useEffect(()=>{let i;const d=()=>{t.current+=1,Math.random()<.003&&(o.current=30+Math.random()*50),o.current*=.97;const R=(Math.random()-.5)*2,g=o.current>.5?Math.sin(t.current*.5)*o.current*(.5+Math.random()*.5):0;u(t.current,R+g,n),i=requestAnimationFrame(d)};return i=requestAnimationFrame(d),()=>cancelAnimationFrame(i)},[u]),e.jsxs(j,{direction:"vertical",gap:4,children:[e.jsx(v,{level:3,children:"Zero-Centered (seismograph)"}),e.jsxs(D,{type:"supporting",color:"secondary",children:["yCenter=true keeps 0 at center. Range auto-expands on quake bursts. Currently: [",a[0].toFixed(1),", ",a[1].toFixed(1),"]"]}),e.jsxs(w,{data:[],xKey:"t",yKeys:[],xDomain:c,yDomain:a,yBaseline:"zero",height:220,children:[e.jsx(b,{horizontal:!0}),e.jsx(h,{position:"bottom"}),e.jsx(h,{position:"left"}),e.jsx(K,{handleRef:n,color:s.categorical(5)[3],bufferSize:600,lineWidth:1,opacity:.9})]})]})}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:"Known y-range — useChartRange just manages the sliding x window",...f.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:"Unknown y-range — auto-tracks from data with 10% padding",...y.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:"Zero-centered — seismograph pattern with yCenter",...x.parameters?.docs?.description}}};const V=["KnownRange","UnknownRange","ZeroCentered"];export{f as KnownRange,y as UnknownRange,x as ZeroCentered,V as __namedExportsOrder,Q as default};
