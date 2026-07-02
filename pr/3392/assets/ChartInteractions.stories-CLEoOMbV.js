import{ah as i,a1 as e,T as D}from"./iframe-BAsU9Dt9.js";import{S as T}from"./Stack-CKRWU4oS.js";import{u as W}from"./useDataset-BOUvuZfy.js";import{u as _}from"./useChartColors-DoG_0f10.js";import{H as B}from"./Heading-aDohXlb0.js";import{C as H,a as j}from"./ChartAxis-CJvYh9eT.js";import{C as z}from"./ChartGrid-DTqdCyol.js";import{C as X}from"./ChartDot-BL24zuE5.js";import{C as ee,a as re}from"./ChartReferenceLine-ppQznfN6.js";import{C as se}from"./ChartBar--HSHh7Xu.js";import{C as oe}from"./ChartLine-DQ4q6T5S.js";import{u as ae,i as L,x as ne}from"./ChartContext-CpEhNUe0.js";import{C as pe}from"./ChartTooltip-t7Wzpmr6.js";import{r as de}from"./index-C8hpxRip.js";import{I as O}from"./IconButton-BUhVxSkb.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";import"./linear-gs3faI6G.js";import"./monotone-BKrwi6Sb.js";import"./array-2GBN5xbU.js";import"./index-C3NGT-kS.js";function me(){return e.jsx("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinecap:"round",children:e.jsx("path",{d:"M8 3v10M3 8h10"})})}function he(){return e.jsx("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinecap:"round",children:e.jsx("path",{d:"M3 8h10"})})}function xe(){return e.jsx("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M2 8a6 6 0 1 1 1.5 4M2 12V8h4"})})}function ie({onXDomainChange:n,onYDomainChange:o,zoomSpeed:s=.1,xOnly:r=!1,yOnly:u=!1,toolbar:h="top-right"}){const{width:M,height:f,xScale:c,yScale:C,svgRef:G}=ae(),R=i.useRef(null);i.useEffect(()=>{if(R.current)return;const t=L(c)?null:c.domain(),a=C.domain();R.current={x:t,y:a}},[c,C]);const p=i.useRef(null),x=i.useRef(new Map),b=i.useRef(null),w=i.useCallback(()=>L(c)?[0,0]:c.domain(),[c]),g=i.useCallback((t,a,y)=>{const[d,m]=t,l=m-d,v=(y-d)/l,S=l*a;return[y-S*v,y+S*(1-v)]},[]),k=i.useCallback((t,a,y)=>{if(!u&&!L(c)){const d=c,[m,l]=d.domain(),v=a!=null?d.invert(a):(m+l)/2;n?.(g([m,l],t,v))}if(!r){const[d,m]=C.domain(),l=y!=null?C.invert(y):(d+m)/2;o?.(g([d,m],t,l))}},[c,C,n,o,r,u,g]),K=i.useCallback(t=>{t.preventDefault();const a=t.currentTarget.ownerSVGElement;if(!a)return;const y=a.createSVGPoint();y.x=t.clientX,y.y=t.clientY;const d=y.matrixTransform(t.currentTarget.getScreenCTM()?.inverse()),l=1+Math.sign(t.deltaY)*Math.min(Math.abs(t.deltaY),50)/50*s;if(!u&&!L(c)){const v=c,[S,Q]=v.domain(),ue=v.invert(d.x);n?.(g([S,Q],l,ue))}if(!r){const[v,S]=C.domain(),Q=C.invert(d.y);o?.(g([v,S],l,Q))}},[s,c,C,n,o,r,u,g]),N=i.useCallback(t=>{if(t.target.setPointerCapture(t.pointerId),t.preventDefault(),x.current.set(t.pointerId,{x:t.clientX,y:t.clientY}),x.current.size===2){const a=[...x.current.values()],y=Math.hypot(a[1].x-a[0].x,a[1].y-a[0].y);b.current={dist:y,xDomain:w(),yDomain:C.domain()},p.current=null}else x.current.size===1&&(p.current={startX:t.clientX,startY:t.clientY,xDomain:w(),yDomain:C.domain()})},[w,C]),J=i.useCallback(t=>{if(x.current.set(t.pointerId,{x:t.clientX,y:t.clientY}),x.current.size===2&&b.current){const a=[...x.current.values()],y=Math.hypot(a[1].x-a[0].x,a[1].y-a[0].y),d=b.current.dist/y;if(!u&&!L(c)){const[m,l]=b.current.xDomain,v=(m+l)/2,S=(l-m)/2*d;n?.([v-S,v+S])}if(!r){const[m,l]=b.current.yDomain,v=(m+l)/2,S=(l-m)/2*d;o?.([v-S,v+S])}}else if(p.current){const a=t.clientX-p.current.startX,y=t.clientY-p.current.startY;if(!u&&!L(c)){const[d,m]=p.current.xDomain,l=-(a/M)*(m-d);n?.([d+l,m+l])}if(!r){const[d,m]=p.current.yDomain,l=y/f*(m-d);o?.([d+l,m+l])}}},[c,M,f,n,o,r,u]),P=i.useCallback(t=>{x.current.delete(t.pointerId),x.current.size<2&&(b.current=null),x.current.size===0&&(p.current=null)},[]),U=i.useCallback(()=>{const t=R.current;t&&(t.x&&n?.(t.x),o?.(t.y))},[n,o]),A=G.current?.parentElement,Y=t=>{const a={position:"absolute",display:"flex",flexDirection:"column",gap:4,zIndex:1};switch(t){case"top-right":return{...a,top:8,right:8};case"top-left":return{...a,top:8,left:8};case"bottom-right":return{...a,bottom:8,right:8};case"bottom-left":return{...a,bottom:8,left:8}}},ce={cursor:"grab",touchAction:"none",userSelect:"none"};return e.jsxs(e.Fragment,{children:[e.jsx("g",{children:e.jsx("rect",{x:0,y:0,width:M,height:f,fill:"transparent",style:ce,onWheel:K,onPointerDown:N,onPointerMove:J,onPointerUp:P,onPointerCancel:P})}),h&&A&&de.createPortal(e.jsxs("div",{style:Y(h),children:[e.jsx(O,{label:"Zoom in",icon:e.jsx(me,{}),variant:"ghost",size:"sm",onClick:()=>k(1/(1+s))}),e.jsx(O,{label:"Zoom out",icon:e.jsx(he,{}),variant:"ghost",size:"sm",onClick:()=>k(1+s)}),e.jsx(O,{label:"Reset zoom",icon:e.jsx(xe,{}),variant:"ghost",size:"sm",onClick:U})]}),A)]})}ie.__docgenInfo={description:"",methods:[],displayName:"ChartZoom",props:{onXDomainChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(domain: [number, number]) => void",signature:{arguments:[{type:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},name:"domain"}],return:{name:"void"}}},description:""},onYDomainChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(domain: [number, number]) => void",signature:{arguments:[{type:{name:"tuple",raw:"[number, number]",elements:[{name:"number"},{name:"number"}]},name:"domain"}],return:{name:"void"}}},description:""},zoomSpeed:{required:!1,tsType:{name:"number"},description:`Zoom speed factor per scroll tick. Higher = faster zoom.
@default 0.1`,defaultValue:{value:"0.1",computed:!1}},xOnly:{required:!1,tsType:{name:"boolean"},description:"Only zoom/pan the x-axis",defaultValue:{value:"false",computed:!1}},yOnly:{required:!1,tsType:{name:"boolean"},description:"Only zoom/pan the y-axis",defaultValue:{value:"false",computed:!1}},toolbar:{required:!1,tsType:{name:"union",raw:"false | ZoomToolbarPosition",elements:[{name:"literal",value:"false"},{name:"union",raw:`| 'top-right'
| 'top-left'
| 'bottom-right'
| 'bottom-left'`,elements:[{name:"literal",value:"'top-right'"},{name:"literal",value:"'top-left'"},{name:"literal",value:"'bottom-right'"},{name:"literal",value:"'bottom-left'"}]}]},description:"Show the zoom/pan toolbar.\nPass `false` to hide, or a position string to show at that corner.\n@default 'top-right'",defaultValue:{value:"'top-right'",computed:!1}}}};function le({onSelect:n,onSelectionChange:o,selected:s=[],color:r="var(--color-accent)",radius:u=6}){const{width:h,height:M,data:f,xKey:c,xScale:C,yScale:G}=ae(),R=i.useCallback(p=>{const x=p.currentTarget.ownerSVGElement;if(!x)return;const b=x.createSVGPoint();b.x=p.clientX,b.y=p.clientY;const w=b.matrixTransform(p.currentTarget.getScreenCTM()?.inverse());let g=0,k=1/0;f.forEach((K,N)=>{const J=ne(K,c,C),P=Object.keys(K).filter(Y=>Y!==c&&typeof K[Y]=="number"),U=P.length>0?G(K[P[0]]):0,A=Math.hypot(J-w.x,U-w.y);A<k&&(k=A,g=N)}),!(k>30)&&(n?.(f[g],g),o&&(p.shiftKey||p.metaKey?o(s.includes(g)?s.filter(K=>K!==g):[...s,g]):o([g])))},[f,c,C,G,s,n,o]);return e.jsxs("g",{children:[e.jsx("rect",{x:0,y:0,width:h,height:M,fill:"transparent",style:{cursor:"pointer"},onPointerUp:R}),s.map(p=>{if(p<0||p>=f.length)return null;const x=f[p],b=ne(x,c,C),w=Object.keys(x).find(k=>k!==c&&typeof x[k]=="number"),g=w?G(x[w]):0;return e.jsx("circle",{cx:b,cy:g,r:u,fill:"none",stroke:r,strokeWidth:2,pointerEvents:"none"},p)})]})}le.__docgenInfo={description:"",methods:[],displayName:"ChartSelect",props:{onSelect:{required:!1,tsType:{name:"signature",type:"function",raw:"(datum: Record<string, unknown>, index: number) => void",signature:{arguments:[{type:{name:"Record",elements:[{name:"string"},{name:"unknown"}],raw:"Record<string, unknown>"},name:"datum"},{type:{name:"number"},name:"index"}],return:{name:"void"}}},description:""},onSelectionChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(indices: number[]) => void",signature:{arguments:[{type:{name:"Array",elements:[{name:"number"}],raw:"number[]"},name:"indices"}],return:{name:"void"}}},description:""},selected:{required:!1,tsType:{name:"Array",elements:[{name:"number"}],raw:"number[]"},description:"",defaultValue:{value:"[]",computed:!1}},color:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'var(--color-accent)'",computed:!1}},radius:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"6",computed:!1}}}};const Ae={title:"Lab/Chart Interactions",tags:["autodocs"]},te=[{month:"Jan",revenue:4200,expenses:2800},{month:"Feb",revenue:3800,expenses:2600},{month:"Mar",revenue:5100,expenses:3200},{month:"Apr",revenue:4600,expenses:2900},{month:"May",revenue:5400,expenses:3100},{month:"Jun",revenue:6200,expenses:3400},{month:"Jul",revenue:5800,expenses:3300},{month:"Aug",revenue:5500,expenses:3e3},{month:"Sep",revenue:4900,expenses:2700},{month:"Oct",revenue:5200,expenses:3100},{month:"Nov",revenue:5700,expenses:3200},{month:"Dec",revenue:6800,expenses:3600}],I={render:()=>{const n=_(),[o,s]=i.useState(null);return e.jsxs(T,{direction:"vertical",gap:4,children:[e.jsx(B,{level:3,children:"1D Brush — Bar Chart"}),e.jsxs(D,{type:"supporting",color:"secondary",children:["Drag to select a range. ",o??"Click to clear."]}),e.jsxs(H,{data:te,xKey:"month",yKeys:["revenue"],height:300,children:[e.jsx(z,{horizontal:!0}),e.jsx(j,{position:"bottom"}),e.jsx(j,{position:"left"}),e.jsx(se,{dataKey:"revenue",color:n.categorical(1)[0]}),e.jsx(ee,{onBrush:(r,u)=>s(`${u.length} months selected`),onClear:()=>s(null)})]})]})}},Z={render:()=>{const n=_(),[o,s]=i.useState(null);return e.jsxs(T,{direction:"vertical",gap:4,children:[e.jsx(B,{level:3,children:"1D Brush — Line Chart"}),e.jsxs(D,{type:"supporting",color:"secondary",children:["Drag to select a range. ",o??"Click to clear."]}),e.jsxs(H,{data:te,xKey:"month",yKeys:["revenue","expenses"],height:300,children:[e.jsx(z,{horizontal:!0}),e.jsx(j,{position:"bottom"}),e.jsx(j,{position:"left"}),e.jsx(oe,{dataKey:"revenue",color:n.categorical(2)[0],dots:!0}),e.jsx(oe,{dataKey:"expenses",color:n.categorical(2)[1],dots:!0}),e.jsx(ee,{onBrush:(r,u)=>s(`${u.length} months selected`),onClear:()=>s(null)})]})]})}},V={render:()=>{const n=_(),[o]=W("cars.json"),[s,r]=i.useState(null),u=i.useMemo(()=>o.filter(h=>h.Horsepower!=null&&h.Miles_per_Gallon!=null).map(h=>({hp:h.Horsepower,mpg:h.Miles_per_Gallon})),[o]);return u.length?e.jsxs(T,{direction:"vertical",gap:4,children:[e.jsx(B,{level:3,children:"2D Brush — Scatter Plot"}),e.jsxs(D,{type:"supporting",color:"secondary",children:["Drag a rectangle to select."," ",s!=null?`${s} points selected.`:"Click to clear."]}),e.jsxs(H,{data:u,xKey:"hp",yKeys:["mpg"],yBaseline:"data",height:350,children:[e.jsx(z,{horizontal:!0,vertical:!0}),e.jsx(j,{position:"bottom"}),e.jsx(j,{position:"left"}),e.jsx(X,{dataKey:"mpg",color:n.categorical(1)[0],radius:3}),e.jsx(ee,{mode:"xy",onBrush:(h,M)=>r(M.length),onClear:()=>r(null)})]})]}):e.jsx(D,{type:"supporting",children:"Loading…"})}},q={render:()=>{const n=_(),[o]=W("cars.json"),s=i.useMemo(()=>o.filter(r=>r.Horsepower!=null&&r.Miles_per_Gallon!=null).map(r=>({hp:r.Horsepower,mpg:r.Miles_per_Gallon})),[o]);return s.length?e.jsxs(T,{direction:"vertical",gap:4,children:[e.jsx(B,{level:3,children:"Crosshair"}),e.jsxs(H,{data:s,xKey:"hp",yKeys:["mpg"],yBaseline:"data",height:350,children:[e.jsx(z,{horizontal:!0,vertical:!0}),e.jsx(j,{position:"bottom"}),e.jsx(j,{position:"left"}),e.jsx(X,{dataKey:"mpg",color:n.categorical(1)[0],radius:3}),e.jsx(pe,{crosshair:"xy",crosshairLabels:!0,xFormat:r=>`${Math.round(Number(r))} hp`,yFormat:r=>`${Math.round(r)} mpg`})]})]}):e.jsx(D,{type:"supporting",children:"Loading…"})}},E={render:()=>{const n=_(),[o]=W("cars.json"),s=i.useMemo(()=>o.filter(f=>f.Horsepower!=null&&f.Miles_per_Gallon!=null).map(f=>({hp:f.Horsepower,mpg:f.Miles_per_Gallon})),[o]),[r,u]=i.useState([40,230]),[h,M]=i.useState([8,47]);return s.length?e.jsxs(T,{direction:"vertical",gap:4,children:[e.jsx(B,{level:3,children:"Zoom & Pan"}),e.jsxs(D,{type:"supporting",color:"secondary",children:["Scroll to zoom, drag to pan. x: [",Math.round(r[0]),","," ",Math.round(r[1]),"]"]}),e.jsxs(H,{data:s,xKey:"hp",yKeys:["mpg"],xDomain:r,yDomain:h,height:350,children:[e.jsx(z,{horizontal:!0,vertical:!0}),e.jsx(j,{position:"bottom"}),e.jsx(j,{position:"left"}),e.jsx(X,{dataKey:"mpg",color:n.categorical(1)[0],radius:3}),e.jsx(ie,{onXDomainChange:u,onYDomainChange:M})]})]}):e.jsx(D,{type:"supporting",children:"Loading…"})}},$={render:()=>{const n=_(),[o]=W("cars.json"),s=i.useMemo(()=>o.filter(h=>h.Horsepower!=null&&h.Miles_per_Gallon!=null).map(h=>({hp:h.Horsepower,mpg:h.Miles_per_Gallon})),[o]),[r,u]=i.useState([]);return s.length?e.jsxs(T,{direction:"vertical",gap:4,children:[e.jsx(B,{level:3,children:"Click to Select"}),e.jsxs(D,{type:"supporting",color:"secondary",children:["Click a point. Shift-click for multi. ",r.length," selected."]}),e.jsxs(H,{data:s,xKey:"hp",yKeys:["mpg"],yBaseline:"data",height:350,children:[e.jsx(z,{horizontal:!0,vertical:!0}),e.jsx(j,{position:"bottom"}),e.jsx(j,{position:"left"}),e.jsx(X,{dataKey:"mpg",color:n.categorical(1)[0],radius:3}),e.jsx(le,{selected:r,onSelectionChange:u})]})]}):e.jsx(D,{type:"supporting",children:"Loading…"})}},F={render:()=>{const n=_();return e.jsxs(T,{direction:"vertical",gap:4,children:[e.jsx(B,{level:3,children:"Reference Lines"}),e.jsxs(H,{data:te,xKey:"month",yKeys:["revenue"],height:300,children:[e.jsx(z,{horizontal:!0}),e.jsx(j,{position:"bottom"}),e.jsx(j,{position:"left"}),e.jsx(se,{dataKey:"revenue",color:n.categorical(1)[0]}),e.jsx(re,{y:5e3,label:"Target",color:n.semantic.positive}),e.jsx(re,{y:4700,label:"Average",color:n.semantic.neutral})]})]})}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [selected, setSelected] = useState<string | null>(null);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>1D Brush — Bar Chart</Heading>
        <Text type="supporting" color="secondary">
          Drag to select a range. {selected ?? 'Click to clear.'}
        </Text>
        <Chart data={monthlyData} xKey="month" yKeys={['revenue']} height={300}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartBar dataKey="revenue" color={colors.categorical(1)[0]} />
          <ChartBrush onBrush={(_, sel) => setSelected(\`\${sel.length} months selected\`)} onClear={() => setSelected(null)} />
        </Chart>
      </Stack>;
  }
}`,...I.parameters?.docs?.source},description:{story:"1D brush on a bar chart — select a range of months",...I.parameters?.docs?.description}}};Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [selected, setSelected] = useState<string | null>(null);
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>1D Brush — Line Chart</Heading>
        <Text type="supporting" color="secondary">
          Drag to select a range. {selected ?? 'Click to clear.'}
        </Text>
        <Chart data={monthlyData} xKey="month" yKeys={['revenue', 'expenses']} height={300}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartLine dataKey="revenue" color={colors.categorical(2)[0]} dots />
          <ChartLine dataKey="expenses" color={colors.categorical(2)[1]} dots />
          <ChartBrush onBrush={(_, sel) => setSelected(\`\${sel.length} months selected\`)} onClear={() => setSelected(null)} />
        </Chart>
      </Stack>;
  }
}`,...Z.parameters?.docs?.source},description:{story:"1D brush on a line chart — select a time range",...Z.parameters?.docs?.description}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const [count, setCount] = useState<number | null>(null);
    const data = useMemo(() => raw.filter(d => d.Horsepower != null && d.Miles_per_Gallon != null).map(d => ({
      hp: d.Horsepower,
      mpg: d.Miles_per_Gallon
    })), [raw]);
    if (!data.length) {
      return <Text type="supporting">Loading…</Text>;
    }
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>2D Brush — Scatter Plot</Heading>
        <Text type="supporting" color="secondary">
          Drag a rectangle to select.{' '}
          {count != null ? \`\${count} points selected.\` : 'Click to clear.'}
        </Text>
        <Chart data={data} xKey="hp" yKeys={['mpg']} yBaseline="data" height={350}>
          <ChartGrid horizontal vertical />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDot dataKey="mpg" color={colors.categorical(1)[0]} radius={3} />
          <ChartBrush mode="xy" onBrush={(_, sel) => setCount(sel.length)} onClear={() => setCount(null)} />
        </Chart>
      </Stack>;
  }
}`,...V.parameters?.docs?.source},description:{story:"2D rectangular brush on a scatter plot",...V.parameters?.docs?.description}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const data = useMemo(() => raw.filter(d => d.Horsepower != null && d.Miles_per_Gallon != null).map(d => ({
      hp: d.Horsepower,
      mpg: d.Miles_per_Gallon
    })), [raw]);
    if (!data.length) {
      return <Text type="supporting">Loading…</Text>;
    }
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Crosshair</Heading>
        <Chart data={data} xKey="hp" yKeys={['mpg']} yBaseline="data" height={350}>
          <ChartGrid horizontal vertical />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDot dataKey="mpg" color={colors.categorical(1)[0]} radius={3} />
          <ChartTooltip crosshair="xy" crosshairLabels xFormat={v => \`\${Math.round(Number(v))} hp\`} yFormat={v => \`\${Math.round(v)} mpg\`} />
        </Chart>
      </Stack>;
  }
}`,...q.parameters?.docs?.source},description:{story:"Crosshair with value readouts",...q.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const data = useMemo(() => raw.filter(d => d.Horsepower != null && d.Miles_per_Gallon != null).map(d => ({
      hp: d.Horsepower,
      mpg: d.Miles_per_Gallon
    })), [raw]);
    const [xDomain, setXDomain] = useState<[number, number]>([40, 230]);
    const [yDomain, setYDomain] = useState<[number, number]>([8, 47]);
    if (!data.length) {
      return <Text type="supporting">Loading…</Text>;
    }
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Zoom & Pan</Heading>
        <Text type="supporting" color="secondary">
          Scroll to zoom, drag to pan. x: [{Math.round(xDomain[0])},{' '}
          {Math.round(xDomain[1])}]
        </Text>
        <Chart data={data} xKey="hp" yKeys={['mpg']} xDomain={xDomain} yDomain={yDomain} height={350}>
          <ChartGrid horizontal vertical />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDot dataKey="mpg" color={colors.categorical(1)[0]} radius={3} />
          <ChartZoom onXDomainChange={setXDomain} onYDomainChange={setYDomain} />
        </Chart>
      </Stack>;
  }
}`,...E.parameters?.docs?.source},description:{story:"Scroll to zoom, drag to pan",...E.parameters?.docs?.description}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    const [raw] = useDataset<Car>('cars.json');
    const data = useMemo(() => raw.filter(d => d.Horsepower != null && d.Miles_per_Gallon != null).map(d => ({
      hp: d.Horsepower,
      mpg: d.Miles_per_Gallon
    })), [raw]);
    const [selected, setSelected] = useState<number[]>([]);
    if (!data.length) {
      return <Text type="supporting">Loading…</Text>;
    }
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Click to Select</Heading>
        <Text type="supporting" color="secondary">
          Click a point. Shift-click for multi. {selected.length} selected.
        </Text>
        <Chart data={data} xKey="hp" yKeys={['mpg']} yBaseline="data" height={350}>
          <ChartGrid horizontal vertical />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartDot dataKey="mpg" color={colors.categorical(1)[0]} radius={3} />
          <ChartSelect selected={selected} onSelectionChange={setSelected} />
        </Chart>
      </Stack>;
  }
}`,...$.parameters?.docs?.source},description:{story:"Click to select points",...$.parameters?.docs?.description}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => {
    const colors = useChartColors();
    return <Stack direction="vertical" gap={4}>
        <Heading level={3}>Reference Lines</Heading>
        <Chart data={monthlyData} xKey="month" yKeys={['revenue']} height={300}>
          <ChartGrid horizontal />
          <ChartAxis position="bottom" />
          <ChartAxis position="left" />
          <ChartBar dataKey="revenue" color={colors.categorical(1)[0]} />
          <ChartReferenceLine y={5000} label="Target" color={colors.semantic.positive} />
          <ChartReferenceLine y={4700} label="Average" color={colors.semantic.neutral} />
        </Chart>
      </Stack>;
  }
}`,...F.parameters?.docs?.source},description:{story:"Reference lines for target and average",...F.parameters?.docs?.description}}};const Ie=["BrushBars","BrushLine","Brush2D","Crosshair","ZoomPan","ClickSelect","ReferenceLines"];export{V as Brush2D,I as BrushBars,Z as BrushLine,$ as ClickSelect,q as Crosshair,F as ReferenceLines,E as ZoomPan,Ie as __namedExportsOrder,Ae as default};
