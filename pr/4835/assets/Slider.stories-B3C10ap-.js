import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a}from"./mergeRefs-CPqjs56a.js";import{n as o,t as s}from"./themeProps-CREkzZh6.js";import{n as c,t as l}from"./rtlStyles-Dba7YIbF.js";import{t as u}from"./jsx-runtime-DeHZSEgm.js";import{n as ee,t as d}from"./useTooltip-Cm0gpSWG.js";import{n as f,t as te}from"./VisuallyHidden-Z2NjNH-_.js";import{n as p}from"./isRtlElement-CBSvRqR1.js";import{r as m,t as ne}from"./Tooltip-Ypc-fkfG.js";import{n as h,t as re}from"./Field-DZ-q02Vq.js";function g(e,t,n){return Math.min(Math.max(e,t),n)}function _(e){if(Math.abs(e)<1){let t=e.toExponential().split(`e-`);if(t.length===2)return(t[0].split(`.`)[1]?.length??0)+parseInt(t[1],10)}let t=String(e).split(`.`)[1];return t?t.length:0}function v(e,t,n){if(n<=0)return e;let r=t+Math.round((e-t)/n)*n,i=Math.min(Math.max(_(t),_(n)),20);return Number(r.toFixed(i))}function y(e,t,n){return n===t?0:(e-t)/(n-t)*100}function b({ref:e,...t}){let{label:r,isLabelHidden:s=!1,description:l,isDisabled:u=!1,disabledMessage:d,isOptional:f=!1,isRequired:m=!1,status:h,labelTooltip:_,min:b=0,max:w=100,step:T=1,orientation:E=`horizontal`,formatValue:D,htmlName:O,valueDisplay:k=`tooltip`,marks:A,width:j,xstyle:M,className:N,style:P,"data-testid":F,value:I,onChange:L,onChangeEnd:R}=t,z=Array.isArray(I),B=z&&`minStepsBetweenThumbs`in t?t.minStepsBetweenThumbs??0:0,V=E===`horizontal`,H=(0,x.useId)(),U=(0,x.useId)(),ie=(0,x.useId)(),ae=(0,x.useId)(),oe=(0,x.useId)(),W=(0,x.useRef)(null),G=(0,x.useRef)(null),[se,ce]=(0,x.useState)(null),K=u&&!!d,q=ee({placement:`above`,focusTrigger:`always`,isEnabled:K}),le=m&&!f,J=[];l&&J.push(ie),h?.message&&J.push(ae),le&&J.push(oe),K&&J.push(q.describedBy);let ue=J.length>0?J.join(` `):void 0,Y=(0,x.useMemo)(()=>(Array.isArray(I)?I:[I??b]).map(e=>g(e,b,w)),[I,b,w]),de=(0,x.useRef)(Y);de.current=Y;let X=(0,x.useCallback)((e,t)=>{let n=W.current;if(!n)return b;let r=n.getBoundingClientRect(),i;return i=V?p(n)?(r.right-e)/r.width:(e-r.left)/r.width:1-(t-r.top)/r.height,i=g(i,0,1),g(v(b+i*(w-b),b,T),b,w)},[b,w,T,V]),fe=(0,x.useCallback)(e=>{if(!z)return 0;let[t,n]=Y;return Math.abs(e-t)<=Math.abs(e-n)?0:1},[z,Y]),Z=(0,x.useCallback)((e,t)=>{if(u)return;let n=g(v(t,b,T),b,w);if(z){let t=[...Y];t[e]=n;let r=B*T;e===0?t[0]=Math.min(t[0],t[1]-r):t[1]=Math.max(t[1],t[0]+r),t[0]=g(t[0],b,w),t[1]=g(t[1],b,w),L?.(t)}else L?.(n)},[u,z,Y,b,w,T,B,L]),pe=(0,x.useRef)(R);pe.current=R;let Q=(0,x.useCallback)(e=>{let t=e??de.current,n=pe.current;z?n?.(t):n?.(t[0])},[z]),me=(0,x.useCallback)(e=>{if(u)return;e.preventDefault();let t=e.target.closest(`[data-mark-value]`),n=t?Number(t.dataset.markValue):X(e.clientX,e.clientY),r=fe(n);G.current=r,ce(r),Z(r,n);let i=W.current;i&&i.querySelectorAll(`[role="slider"]`)[r]?.focus(),typeof e.currentTarget.setPointerCapture==`function`&&e.currentTarget.setPointerCapture(e.pointerId)},[u,X,fe,Z]),he=(0,x.useCallback)(e=>{if(G.current===null||u)return;let t=X(e.clientX,e.clientY);Z(G.current,t)},[u,X,Z]),ge=(0,x.useCallback)(e=>{G.current!==null&&(G.current=null,ce(null),Q())},[Q]),_e=(0,x.useCallback)((e,t)=>{if(u)return;let n=Y[e],r;switch(t.key){case`ArrowRight`:case`ArrowUp`:r=n+T;break;case`ArrowLeft`:case`ArrowDown`:r=n-T;break;case`PageUp`:r=n+T*10;break;case`PageDown`:r=n-T*10;break;case`Home`:r=b;break;case`End`:r=w;break;default:return}t.preventDefault();let i=g(v(r,b,T),b,w);if(Z(e,r),z){let t=[...Y];t[e]=i;let n=B*T;e===0?t[0]=Math.min(t[0],t[1]-n):t[1]=Math.max(t[1],t[0]+n),t[0]=g(t[0],b,w),t[1]=g(t[1],b,w),Q(t)}else Q([i])},[u,z,Y,T,b,w,B,Z,Q]),$=e=>D?D(e):String(e),ve=e=>{let t=Y[e],r=y(t,b,w),a=V?{insetInlineStart:`${r}%`}:{bottom:`${r}%`,left:`50%`},s=z?e===0?`Minimum value`:`Maximum value`:void 0,l=B*T,ee=z&&e===1?g(Y[0]+l,b,w):b,d=z&&e===0?g(Y[1]-l,b,w):w,f=k===`tooltip`&&!K,te=V?`above`:`start`,p=(0,S.jsx)(`div`,{id:z?void 0:H,role:`slider`,tabIndex:u&&!K?-1:0,"aria-valuemin":ee,"aria-valuemax":d,"aria-valuenow":t,"aria-valuetext":D?D(t):void 0,"aria-orientation":E,"aria-disabled":u||void 0,"aria-invalid":h?.type===`error`||void 0,"aria-label":s,"aria-labelledby":z?void 0:U,"aria-describedby":ue,onKeyDown:t=>_e(e,t),...i(o(`slider-thumb`,{orientation:E,disabled:u?`disabled`:null}),n(C.thumb,V?C.thumbHorizontal:c.centerInline(`50%`),!u&&C.thumbHover,!u&&C.thumbFocusVisible,u&&C.thumbDisabled),void 0,a)},e);return f?(0,S.jsx)(ne,{content:$(t),placement:te,delay:0,focusTrigger:`always`,isOpen:se===e||void 0,children:p},e):p},ye=(()=>{if(z){let[e,t]=Y,n=y(e,b,w),r=y(t,b,w);return V?{insetInlineStart:`${n}%`,width:`${r-n}%`}:{bottom:`${n}%`,height:`${r-n}%`}}let e=y(Y[0],b,w);return V?{insetInlineStart:`0%`,width:`${e}%`}:{bottom:`0%`,height:`${e}%`}})(),be=k===`text`?(0,S.jsx)(`span`,{className:`astryx9ynric astryxcr08ib astryx1tgivj0 astryxuxw1ft astryx2lah0s`,children:z?`${$(Y[0])} – ${$(Y[1])}`:$(Y[0])}):null;return(0,S.jsxs)(re,{"data-testid":F,label:r,isLabelHidden:s,description:l,inputID:H,labelID:U,isGroupLabel:!0,descriptionID:l?ie:void 0,isOptional:f,isRequired:m,isDisabled:u,status:h?{type:h.type,message:h.message,messageID:h.message?ae:void 0}:void 0,labelTooltip:_,statusVariant:`detached`,width:j,xstyle:M,className:N,style:P,children:[(0,S.jsxs)(`div`,{...i(o(`slider`,{orientation:E,disabled:u?`disabled`:null}),{className:`astryx78zum5 astryx6s0dn4 astryx1txdalj`}),children:[O!=null&&Y.map((e,t)=>(0,S.jsx)(`input`,{type:`hidden`,name:O,value:String(e),disabled:u},t===0?`start`:`end`)),(0,S.jsxs)(`div`,{ref:a(e,W,q.ref),...z?{role:`group`,"aria-labelledby":U}:void 0,onPointerDown:me,onPointerMove:he,onPointerUp:ge,onPointerCancel:ge,...{0:{className:`astryx1n2onr6 astryx78zum5 astryx6s0dn4 astryx1iyjqo2 astryx5ve5x3 astryx87ps6o astryxc8icb0 astryxw4jnvo astryx1ymw6g astryxdt5ytf astryxl56j7k astryx1ypdohk`},2:{className:`astryx1n2onr6 astryx78zum5 astryx6s0dn4 astryx1iyjqo2 astryx5ve5x3 astryx87ps6o astryxc8icb0 astryx1qx5ct2 astryxh8yej3 astryx1ypdohk`},1:{className:`astryx1n2onr6 astryx78zum5 astryx6s0dn4 astryx1iyjqo2 astryx5ve5x3 astryx87ps6o astryxc8icb0 astryxw4jnvo astryx1ymw6g astryxdt5ytf astryxl56j7k astryxbyyjgo astryx1h6gzvc`},3:{className:`astryx1n2onr6 astryx78zum5 astryx6s0dn4 astryx1iyjqo2 astryx5ve5x3 astryx87ps6o astryxc8icb0 astryx1qx5ct2 astryxh8yej3 astryxbyyjgo astryx1h6gzvc`}}[!!V<<1|!!u<<0],children:[(0,S.jsx)(`div`,{"aria-hidden":`true`,...i(o(`slider-track`,{orientation:E}),n(C.track,V?C.trackHorizontal:[C.trackVertical,c.centerInline(`0px`)]))}),(0,S.jsx)(`div`,{"aria-hidden":`true`,...i(n(C.filledTrack,V?C.filledTrackHorizontal:[C.filledTrackVertical,c.centerInline(`0px`)]),{style:ye})}),A&&(0,S.jsx)(`div`,{"aria-hidden":`true`,...{0:{className:`astryx10l6tqk astryx13vifvy astryx1ey2m1c astryxbudbmw`},1:{className:`astryx10l6tqk astryx1o0tod astryxtijo5x astryxwa60dl`}}[!!V<<0],children:A.map(e=>{let t=y(e.value,b,w),n=V?{insetInlineStart:`${t}%`}:{bottom:`${t}%`};return(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`div`,{"data-testid":`slider-mark`,"data-mark-value":e.value,...i({0:{className:`astryx10l6tqk astryx7njt3n astryxjspbzw astryx36qwtl astryx1xc55vz astryx1m9mm8y`},1:{className:`astryx10l6tqk astryx7njt3n astryxjspbzw astryxfo62xy astryxdk7pt astryx11lhmoz astryxoffwj3`}}[!!V<<0],{style:n})}),e.label&&(0,S.jsx)(`span`,{"data-testid":`slider-mark-label`,"data-mark-value":e.value,...i({0:{className:`astryx10l6tqk astryx9ynric astryx141an7d astryxv1l7n4 astryxuxw1ft astryx131p8rn astryx9p6ekw`},1:{className:`astryx10l6tqk astryx9ynric astryx141an7d astryxv1l7n4 astryxuxw1ft astryxuuh30 astryx1nyx83j astryxuivejd`}}[!!V<<0],{style:n}),children:e.label})]},e.value)})}),Y.map((e,t)=>ve(t))]}),be]}),le&&(0,S.jsx)(te,{id:oe,children:`Required`}),K&&q.renderTooltip(d)]})}var x,S,C;function w(){return(w=e((()=>{x=t(),r(),h(),m(),d(),f(),l(),s(),S=u(),C={track:{kVAEAm:`astryx10l6tqk`,kWkggS:`astryxdsb6cv`,kaIpWk:`astryxjspbzw`,$$css:!0},trackHorizontal:{kLqNvP:`astryx1o0tod`,kt4wiu:`astryxtijo5x`,kZKoxP:`astryxqu0tyb`,k87sOh:`astryxwa60dl`,k3aq6I:`astryx1cb1t30`,$$css:!0},trackVertical:{k87sOh:`astryx13vifvy`,krVfgx:`astryx1ey2m1c`,kzqmXN:`astryx51ohtg`,$$css:!0},filledTrack:{kVAEAm:`astryx10l6tqk`,kWkggS:`astryx1ewilqj`,kaIpWk:`astryxjspbzw`,$$css:!0},filledTrackHorizontal:{kZKoxP:`astryxqu0tyb`,k87sOh:`astryxwa60dl`,k3aq6I:`astryx1cb1t30`,$$css:!0},filledTrackVertical:{kzqmXN:`astryx51ohtg`,$$css:!0},thumb:{kVAEAm:`astryx10l6tqk`,kzqmXN:`astryxw4jnvo`,kZKoxP:`astryx1qx5ct2`,kaIpWk:`astryxjspbzw`,kWkggS:`astryx1ewilqj`,k3aq6I:`astryx11lhmoz`,k1ekBW:`astryx106061f`,kIyJzY:`astryxuedmi6 astryx12w9bfk`,kAMwcw:`astryxlr8y92`,kI3sdo:`astryx1a2a7pz`,kkrTdU:`astryx1jm3nie`,kY2c9j:`astryx1vjfegm`,$$css:!0},thumbHorizontal:{k87sOh:`astryxwa60dl`,k3aq6I:`astryx11lhmoz astryxoffwj3`,$$css:!0},thumbHover:{kWkggS:`astryx1ewilqj astryxyxu9wt`,$$css:!0},thumbFocusVisible:{kI3sdo:`astryx1a2a7pz astryx17nn4n9`,kjBf7l:null,k3XXqK:null,kMeerF:null,kInvED:`astryx1wfwxd8 astryx7s97pk`,$$css:!0},thumbDisabled:{kWkggS:`astryxwmxj5m`,kkrTdU:`astryx1h6gzvc`,$$css:!0}},b.displayName=`Slider`,b.__docgenInfo={description:`A slider component for selecting numeric values or ranges.

@example
\`\`\`
<Slider label="Volume" value={50} onChange={setValue} />
<Slider label="Price range" value={[20, 80]} onChange={setRange} />
\`\`\``,methods:[],displayName:`Slider`}})))()}var T,E,D,O,k,A,j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{T=t(),w(),E=u(),D={title:`Core/Slider`,component:b,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},isDisabled:{control:`boolean`,description:`Whether the slider is disabled`},disabledMessage:{control:`text`,description:`Explains why the slider is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the thumb focusable via aria-disabled (value changes stay blocked). Use this instead of wrapping a disabled Slider in Tooltip.`},min:{control:`number`,description:`Minimum value`},max:{control:`number`,description:`Maximum value`},step:{control:`number`,description:`Step increment`},orientation:{control:`select`,options:[`horizontal`,`vertical`],description:`Slider orientation`},valueDisplay:{control:`select`,options:[`tooltip`,`text`,`none`],description:`How the value is displayed`}}},O={render:e=>{let[t,n]=(0,T.useState)(50);return(0,E.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Volume`}},k={render:e=>{let[t,n]=(0,T.useState)([20,80]);return(0,E.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Price range`}},A={render:e=>{let[t,n]=(0,T.useState)(50);return(0,E.jsx)(b,{...e,value:t,onChange:n})},args:{label:`Volume`,marks:[{value:0,label:`0`},{value:25,label:`25`},{value:50,label:`50`},{value:75,label:`75`},{value:100,label:`100`}]}},j={render:e=>{let[t,n]=(0,T.useState)(50);return(0,E.jsx)(b,{...e,value:t,onChange:n,valueDisplay:`text`})},args:{label:`Quantity`,min:0,max:100,step:10}},M={render:e=>{let[t,n]=(0,T.useState)(72);return(0,E.jsx)(b,{...e,value:t,onChange:n,valueDisplay:`text`})},args:{label:`Temperature`,min:60,max:90,step:1,formatValue:e=>`${e}°F`}},N={render:e=>(0,E.jsx)(b,{...e}),args:{label:`Volume`,value:50,isDisabled:!0}},P={render:e=>{let[t,n]=(0,T.useState)(50);return(0,E.jsx)(`div`,{style:{height:200},children:(0,E.jsx)(b,{...e,value:t,onChange:n})})},args:{label:`Volume`,orientation:`vertical`}},F={render:()=>{let[e,t]=(0,T.useState)(95),[n,r]=(0,T.useState)(50),[i,a]=(0,T.useState)(75);return(0,E.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,E.jsx)(b,{label:`CPU Usage`,value:e,onChange:t,status:{type:`error`,message:`CPU usage is critically high`}}),(0,E.jsx)(b,{label:`Memory`,value:n,onChange:r,status:{type:`warning`,message:`Memory usage is moderate`}}),(0,E.jsx)(b,{label:`Disk`,value:i,onChange:a,status:{type:`success`,message:`Disk usage is healthy`}})]})}},I={render:()=>{let[e,t]=(0,T.useState)(50),[n,r]=(0,T.useState)([20,80]),[i,a]=(0,T.useState)(30),[o,s]=(0,T.useState)(72);return(0,E.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`,maxWidth:`400px`},children:[(0,E.jsx)(b,{label:`Default slider`,value:e,onChange:t}),(0,E.jsx)(b,{label:`Range slider`,value:n,onChange:r}),(0,E.jsx)(b,{label:`With marks`,value:i,onChange:a,marks:[{value:0,label:`0%`},{value:50,label:`50%`},{value:100,label:`100%`}]}),(0,E.jsx)(b,{label:`With text display`,value:o,onChange:s,formatValue:e=>`${e}°F`,valueDisplay:`text`,min:60,max:90}),(0,E.jsx)(b,{label:`Disabled`,value:50,isDisabled:!0}),(0,E.jsx)(b,{label:`No value display`,value:e,onChange:t,valueDisplay:`none`})]})}},L={render:e=>(0,E.jsx)(b,{...e}),args:{label:`Volume`,value:50,isDisabled:!0,disabledMessage:`Volume is locked while sharing your screen`}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState(50);
    return <Slider {...args as any} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Volume'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<[number, number]>([20, 80]);
    return <Slider {...args as any} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Price range'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: args => {
    return <Slider {...args as any} />;
  },
  args: {
    label: 'Volume',
    value: 50,
    isDisabled: true
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: args => {
    return <Slider {...args as any} />;
  },
  args: {
    label: 'Volume',
    value: 50,
    isDisabled: true,
    disabledMessage: 'Volume is locked while sharing your screen'
  }
}`,...L.parameters?.docs?.source}}},R=[`Default`,`Range`,`WithMarks`,`CustomStep`,`WithFormatValue`,`Disabled`,`VerticalOrientation`,`WithStatus`,`AllVariations`,`DisabledWithMessage`]})))()}z();export{I as AllVariations,j as CustomStep,O as Default,N as Disabled,L as DisabledWithMessage,k as Range,P as VerticalOrientation,M as WithFormatValue,A as WithMarks,F as WithStatus,R as __namedExportsOrder,D as default};