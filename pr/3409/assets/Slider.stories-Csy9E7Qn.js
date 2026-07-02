import{ah as r,a1 as s,a6 as V,ay as Q,a7 as Va,i as Sa}from"./iframe-Z8EfSKmM.js";import{F as za}from"./Field-BUd1jCAy.js";import"./preload-helper-Ct5FWWRu.js";import"./FieldStatus-B_cgkwjT.js";function f(l,n,t){return Math.min(Math.max(l,n),t)}function X(l,n,t){if(t<=0)return l;const w=Math.round((l-n)/t);return n+w*t}function D(l,n,t){return t===n?0:(l-n)/(t-n)*100}function c({ref:l,...n}){const{label:t,isLabelHidden:w=!1,description:j,isDisabled:i=!1,isOptional:O=!1,isRequired:I=!1,status:h,labelTooltip:oa,min:o=0,max:m=100,step:b=1,orientation:S="horizontal",formatValue:N,valueDisplay:Y="tooltip",marks:J,width:ia,xstyle:ua,className:ca,style:ma,"data-testid":da,value:z,onChange:G,onChangeEnd:Z}=n,v=Array.isArray(z),P=v&&"minStepsBetweenThumbs"in n?n.minStepsBetweenThumbs??0:0,g=S==="horizontal",aa=r.useId(),ea=r.useId(),sa=r.useId(),K=r.useRef(null),q=r.useRef(null),[va,ta]=r.useState(null),M=[];j&&M.push(ea),h?.message&&M.push(sa);const pa=M.length>0?M.join(" "):void 0,p=r.useMemo(()=>v?z:[z??o],[v,z,o]),ra=r.useRef(p);ra.current=p;const R=r.useCallback((a,y)=>{const x=K.current;if(!x)return o;const e=x.getBoundingClientRect();let u;g?u=(a-e.left)/e.width:u=1-(y-e.top)/e.height,u=f(u,0,1);const d=o+u*(m-o);return f(X(d,o,b),o,m)},[o,m,b,g]),la=r.useCallback(a=>{if(!v)return 0;const[y,x]=p,e=Math.abs(a-y),u=Math.abs(a-x);return e<=u?0:1},[v,p]),k=r.useCallback((a,y)=>{if(i)return;const x=f(X(y,o,b),o,m);if(v){const e=[...p];e[a]=x;const u=P*b;a===0?e[0]=Math.min(e[0],e[1]-u):e[1]=Math.max(e[1],e[0]+u),e[0]=f(e[0],o,m),e[1]=f(e[1],o,m),G?.(e)}else G?.(x)},[i,v,p,o,m,b,P,G]),na=r.useRef(Z);na.current=Z;const C=r.useCallback(a=>{const y=a??ra.current,x=na.current;x?.(v?y:y[0])},[v]),ga=r.useCallback(a=>{if(i)return;a.preventDefault();const y=a.target.closest("[data-mark-value]"),x=y?Number(y.dataset.markValue):R(a.clientX,a.clientY),e=la(x);q.current=e,ta(e),k(e,x);const u=K.current;u&&u.querySelectorAll('[role="slider"]')[e]?.focus(),typeof a.currentTarget.setPointerCapture=="function"&&a.currentTarget.setPointerCapture(a.pointerId)},[i,R,la,k]),ba=r.useCallback(a=>{if(q.current===null||i)return;const y=R(a.clientX,a.clientY);k(q.current,y)},[i,R,k]),ya=r.useCallback(a=>{q.current!==null&&(q.current=null,ta(null),C())},[C]),ha=r.useCallback((a,y)=>{if(i)return;const x=p[a];let e;switch(y.key){case"ArrowRight":case"ArrowUp":e=x+b;break;case"ArrowLeft":case"ArrowDown":e=x-b;break;case"PageUp":e=x+b*10;break;case"PageDown":e=x-b*10;break;case"Home":e=o;break;case"End":e=m;break;default:return}y.preventDefault();const u=f(X(e,o,b),o,m);if(k(a,e),v){const d=[...p];d[a]=u;const $=P*b;a===0?d[0]=Math.min(d[0],d[1]-$):d[1]=Math.max(d[1],d[0]+$),d[0]=f(d[0],o,m),d[1]=f(d[1],o,m),C(d)}else C([u])},[i,v,p,b,o,m,P,k,C]),T=a=>N?N(a):String(a),fa=a=>{const y=p[a],x=D(y,o,m),e=g?{left:`${x}%`}:{bottom:`${x}%`,left:"50%"},u=v?a===0?`${t}, minimum value`:`${t}, maximum value`:t,d=Y==="tooltip",$=g?"above":"start",xa=s.jsx("div",{id:v?void 0:aa,role:"slider",tabIndex:i?-1:0,"aria-valuemin":o,"aria-valuemax":m,"aria-valuenow":y,"aria-valuetext":N?N(y):void 0,"aria-orientation":S,"aria-disabled":i||void 0,"aria-invalid":h?.type==="error"?!0:void 0,"aria-label":u,"aria-describedby":pa,onKeyDown:ka=>ha(a,ka),...V(Q("slider-thumb",{orientation:S,disabled:i?"disabled":null}),{0:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx1ewilqj astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1a2a7pz astryx1jm3nie astryx1vjfegm astryx1nrll8i astryx1m9mm8y"},8:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx1ewilqj astryx11lhmoz astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1a2a7pz astryx1jm3nie astryx1vjfegm astryxwa60dl"},4:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1a2a7pz astryx1jm3nie astryx1vjfegm astryx1nrll8i astryx1m9mm8y astryx1ewilqj astryxyxu9wt"},12:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx11lhmoz astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1a2a7pz astryx1jm3nie astryx1vjfegm astryxwa60dl astryx1ewilqj astryxyxu9wt"},2:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx1ewilqj astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1jm3nie astryx1vjfegm astryx1nrll8i astryx1m9mm8y astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk"},10:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx1ewilqj astryx11lhmoz astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1jm3nie astryx1vjfegm astryxwa60dl astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk"},6:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1jm3nie astryx1vjfegm astryx1nrll8i astryx1m9mm8y astryx1ewilqj astryxyxu9wt astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk"},14:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx11lhmoz astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1jm3nie astryx1vjfegm astryxwa60dl astryx1ewilqj astryxyxu9wt astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk"},1:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1a2a7pz astryx1vjfegm astryx1nrll8i astryx1m9mm8y astryxwmxj5m astryx1h6gzvc"},9:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx11lhmoz astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1a2a7pz astryx1vjfegm astryxwa60dl astryxwmxj5m astryx1h6gzvc"},5:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1a2a7pz astryx1vjfegm astryx1nrll8i astryx1m9mm8y astryxwmxj5m astryx1h6gzvc"},13:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx11lhmoz astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1a2a7pz astryx1vjfegm astryxwa60dl astryxwmxj5m astryx1h6gzvc"},3:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1vjfegm astryx1nrll8i astryx1m9mm8y astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxwmxj5m astryx1h6gzvc"},11:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx11lhmoz astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1vjfegm astryxwa60dl astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxwmxj5m astryx1h6gzvc"},7:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1vjfegm astryx1nrll8i astryx1m9mm8y astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxwmxj5m astryx1h6gzvc"},15:{className:"astryx10l6tqk astryxw4jnvo astryx1qx5ct2 astryxjspbzw astryx11lhmoz astryx106061f astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx1vjfegm astryxwa60dl astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxwmxj5m astryx1h6gzvc"}}[!!g<<3|!i<<2|!i<<1|!!i<<0],void 0,e)},a);return d?s.jsx(Sa,{content:T(y),placement:$,delay:0,focusTrigger:"always",isOpen:va===a?!0:void 0,children:xa},a):xa},wa=(()=>{if(v){const[y,x]=p,e=D(y,o,m),u=D(x,o,m);return g?{left:`${e}%`,width:`${u-e}%`}:{bottom:`${e}%`,height:`${u-e}%`}}const a=D(p[0],o,m);return g?{left:"0%",width:`${a}%`}:{bottom:"0%",height:`${a}%`}})(),ja=Y==="text"?s.jsx("span",{className:"astryx9ynric astryxcr08ib astryx1tgivj0 astryxuxw1ft astryx2lah0s",children:v?`${T(p[0])} – ${T(p[1])}`:T(p[0])}):null;return s.jsx(za,{"data-testid":da,label:t,isLabelHidden:w,description:j,inputID:aa,descriptionID:j?ea:void 0,isOptional:O,isRequired:I,isDisabled:i,status:h?{type:h.type,message:h.message,messageID:h.message?sa:void 0}:void 0,labelTooltip:oa,statusVariant:"detached",width:ia,xstyle:ua,className:ca,style:ma,children:s.jsxs("div",{...V(Q("slider",{orientation:S,disabled:i?"disabled":null}),{className:"astryx78zum5 astryx6s0dn4 astryx1txdalj"}),children:[s.jsxs("div",{ref:Va(l,K),...v?{role:"group","aria-label":t}:void 0,onPointerDown:ga,onPointerMove:ba,onPointerUp:ya,onPointerCancel:ya,...{0:{className:"astryx1n2onr6 astryx78zum5 astryx6s0dn4 astryx1iyjqo2 astryx5ve5x3 astryx87ps6o astryxc8icb0 astryxw4jnvo astryx1ymw6g astryxdt5ytf astryxl56j7k astryx1ypdohk"},2:{className:"astryx1n2onr6 astryx78zum5 astryx6s0dn4 astryx1iyjqo2 astryx5ve5x3 astryx87ps6o astryxc8icb0 astryx1qx5ct2 astryxh8yej3 astryx1ypdohk"},1:{className:"astryx1n2onr6 astryx78zum5 astryx6s0dn4 astryx1iyjqo2 astryx5ve5x3 astryx87ps6o astryxc8icb0 astryxw4jnvo astryx1ymw6g astryxdt5ytf astryxl56j7k astryxbyyjgo astryx1h6gzvc"},3:{className:"astryx1n2onr6 astryx78zum5 astryx6s0dn4 astryx1iyjqo2 astryx5ve5x3 astryx87ps6o astryxc8icb0 astryx1qx5ct2 astryxh8yej3 astryxbyyjgo astryx1h6gzvc"}}[!!g<<1|!!i<<0],children:[s.jsx("div",{"aria-hidden":"true",...V(Q("slider-track",{orientation:S}),{0:{className:"astryx10l6tqk astryxdsb6cv astryxjspbzw astryx13vifvy astryx1ey2m1c astryx51ohtg astryx1nrll8i astryxuuh30"},1:{className:"astryx10l6tqk astryxdsb6cv astryxjspbzw astryxu96u03 astryx3m8u43 astryxqu0tyb astryxwa60dl astryx1cb1t30"}}[!!g<<0])}),s.jsx("div",{"aria-hidden":"true",...V({0:{className:"astryx10l6tqk astryx1ewilqj astryxjspbzw astryx51ohtg astryx1nrll8i astryxuuh30"},1:{className:"astryx10l6tqk astryx1ewilqj astryxjspbzw astryxqu0tyb astryxwa60dl astryx1cb1t30"}}[!!g<<0],{style:wa})}),J&&s.jsx("div",{"aria-hidden":"true",...{0:{className:"astryx10l6tqk astryx13vifvy astryx1ey2m1c astryx1nrll8i"},1:{className:"astryx10l6tqk astryxu96u03 astryx3m8u43 astryxwa60dl"}}[!!g<<0],children:J.map(a=>{const y=D(a.value,o,m),x=g?{left:`${y}%`}:{bottom:`${y}%`};return s.jsxs("div",{children:[s.jsx("div",{"data-testid":"slider-mark","data-mark-value":a.value,...V({0:{className:"astryx10l6tqk astryx7njt3n astryxjspbzw astryx36qwtl astryx1xc55vz astryx1m9mm8y"},1:{className:"astryx10l6tqk astryx7njt3n astryxjspbzw astryxfo62xy astryxdk7pt astryx11lhmoz"}}[!!g<<0],{style:x})}),a.label&&s.jsx("span",{"data-testid":"slider-mark-label","data-mark-value":a.value,...V({0:{className:"astryx10l6tqk astryx9ynric astryx141an7d astryxv1l7n4 astryxuxw1ft astryx131p8rn astryx1trqr8e"},1:{className:"astryx10l6tqk astryx9ynric astryx141an7d astryxv1l7n4 astryxuxw1ft astryxuuh30 astryxuivejd"}}[!!g<<0],{style:x}),children:a.label})]},a.value)})}),p.map((a,y)=>fa(y))]}),ja]})})}c.displayName="Slider";c.__docgenInfo={description:'A slider component for selecting numeric values or ranges.\n\n@example\n```\n<Slider label="Volume" value={50} onChange={setValue} />\n<Slider label="Price range" value={[20, 80]} onChange={setRange} />\n```',methods:[],displayName:"Slider"};const Pa={title:"Core/Slider",component:c,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text (required)"},isLabelHidden:{control:"boolean",description:"Visually hide the label (still accessible to screen readers)"},isDisabled:{control:"boolean",description:"Whether the slider is disabled"},min:{control:"number",description:"Minimum value"},max:{control:"number",description:"Maximum value"},step:{control:"number",description:"Step increment"},orientation:{control:"select",options:["horizontal","vertical"],description:"Slider orientation"},valueDisplay:{control:"select",options:["tooltip","text","none"],description:"How the value is displayed"}}},W={render:l=>{const[n,t]=r.useState(50);return s.jsx(c,{...l,value:n,onChange:t})},args:{label:"Volume"}},A={render:l=>{const[n,t]=r.useState([20,80]);return s.jsx(c,{...l,value:n,onChange:t})},args:{label:"Price range"}},U={render:l=>{const[n,t]=r.useState(50);return s.jsx(c,{...l,value:n,onChange:t})},args:{label:"Volume",marks:[{value:0,label:"0"},{value:25,label:"25"},{value:50,label:"50"},{value:75,label:"75"},{value:100,label:"100"}]}},E={render:l=>{const[n,t]=r.useState(50);return s.jsx(c,{...l,value:n,onChange:t,valueDisplay:"text"})},args:{label:"Quantity",min:0,max:100,step:10}},F={render:l=>{const[n,t]=r.useState(72);return s.jsx(c,{...l,value:n,onChange:t,valueDisplay:"text"})},args:{label:"Temperature",min:60,max:90,step:1,formatValue:l=>`${l}°F`}},B={render:l=>s.jsx(c,{...l}),args:{label:"Volume",value:50,isDisabled:!0}},_={render:l=>{const[n,t]=r.useState(50);return s.jsx("div",{style:{height:200},children:s.jsx(c,{...l,value:n,onChange:t})})},args:{label:"Volume",orientation:"vertical"}},H={render:()=>{const[l,n]=r.useState(95),[t,w]=r.useState(50),[j,i]=r.useState(75);return s.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",maxWidth:"400px"},children:[s.jsx(c,{label:"CPU Usage",value:l,onChange:n,status:{type:"error",message:"CPU usage is critically high"}}),s.jsx(c,{label:"Memory",value:t,onChange:w,status:{type:"warning",message:"Memory usage is moderate"}}),s.jsx(c,{label:"Disk",value:j,onChange:i,status:{type:"success",message:"Disk usage is healthy"}})]})}},L={render:()=>{const[l,n]=r.useState(50),[t,w]=r.useState([20,80]),[j,i]=r.useState(30),[O,I]=r.useState(72);return s.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"32px",maxWidth:"400px"},children:[s.jsx(c,{label:"Default slider",value:l,onChange:n}),s.jsx(c,{label:"Range slider",value:t,onChange:w}),s.jsx(c,{label:"With marks",value:j,onChange:i,marks:[{value:0,label:"0%"},{value:50,label:"50%"},{value:100,label:"100%"}]}),s.jsx(c,{label:"With text display",value:O,onChange:I,formatValue:h=>`${h}°F`,valueDisplay:"text",min:60,max:90}),s.jsx(c,{label:"Disabled",value:50,isDisabled:!0}),s.jsx(c,{label:"No value display",value:l,onChange:n,valueDisplay:"none"})]})}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(50);
    return <Slider {...args as any} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Volume'
  }
}`,...W.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<[number, number]>([20, 80]);
    return <Slider {...args as any} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Price range'
  }
}`,...A.parameters?.docs?.source}}};U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(50);
    return <Slider {...args as any} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Volume',
    marks: [{
      value: 0,
      label: '0'
    }, {
      value: 25,
      label: '25'
    }, {
      value: 50,
      label: '50'
    }, {
      value: 75,
      label: '75'
    }, {
      value: 100,
      label: '100'
    }]
  }
}`,...U.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(50);
    return <Slider {...args as any} value={value} onChange={setValue} valueDisplay="text" />;
  },
  args: {
    label: 'Quantity',
    min: 0,
    max: 100,
    step: 10
  }
}`,...E.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(72);
    return <Slider {...args as any} value={value} onChange={setValue} valueDisplay="text" />;
  },
  args: {
    label: 'Temperature',
    min: 60,
    max: 90,
    step: 1,
    formatValue: (v: number) => \`\${v}°F\`
  }
}`,...F.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: args => {
    return <Slider {...args as any} />;
  },
  args: {
    label: 'Volume',
    value: 50,
    isDisabled: true
  }
}`,...B.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(50);
    return <div style={{
      height: 200
    }}>
        <Slider {...args as any} value={value} onChange={setValue} />
      </div>;
  },
  args: {
    label: 'Volume',
    orientation: 'vertical'
  }
}`,..._.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState(95);
    const [value2, setValue2] = useState(50);
    const [value3, setValue3] = useState(75);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '400px'
    }}>
        <Slider label="CPU Usage" value={value1} onChange={setValue1} status={{
        type: 'error',
        message: 'CPU usage is critically high'
      }} />
        <Slider label="Memory" value={value2} onChange={setValue2} status={{
        type: 'warning',
        message: 'Memory usage is moderate'
      }} />
        <Slider label="Disk" value={value3} onChange={setValue3} status={{
        type: 'success',
        message: 'Disk usage is healthy'
      }} />
      </div>;
  }
}`,...H.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [v1, setV1] = useState(50);
    const [v2, setV2] = useState<[number, number]>([20, 80]);
    const [v3, setV3] = useState(30);
    const [v4, setV4] = useState(72);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      maxWidth: '400px'
    }}>
        <Slider label="Default slider" value={v1} onChange={setV1} />
        <Slider label="Range slider" value={v2} onChange={setV2} />
        <Slider label="With marks" value={v3} onChange={setV3} marks={[{
        value: 0,
        label: '0%'
      }, {
        value: 50,
        label: '50%'
      }, {
        value: 100,
        label: '100%'
      }]} />
        <Slider label="With text display" value={v4} onChange={setV4} formatValue={v => \`\${v}°F\`} valueDisplay="text" min={60} max={90} />
        <Slider label="Disabled" value={50} isDisabled />
        <Slider label="No value display" value={v1} onChange={setV1} valueDisplay="none" />
      </div>;
  }
}`,...L.parameters?.docs?.source}}};const Ma=["Default","Range","WithMarks","CustomStep","WithFormatValue","Disabled","VerticalOrientation","WithStatus","AllVariations"];export{L as AllVariations,E as CustomStep,W as Default,B as Disabled,A as Range,_ as VerticalOrientation,F as WithFormatValue,U as WithMarks,H as WithStatus,Ma as __namedExportsOrder,Pa as default};
