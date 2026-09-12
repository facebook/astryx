import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{Et as n,Ot as r,t as i,vt as a,wt as o}from"./src-Cc9kmbg-.js";function s(e){let t=[e.yUpper??e.baseline,e.yLower??e.baseline].filter(e=>e!=null);return(0,c.jsxs)(r,{data:l,xKey:`month`,yKeys:t,label:`Monthly estimate with confidence interval`,children:[(0,c.jsx)(o,{horizontal:!0}),(0,c.jsx)(n,{position:`bottom`}),(0,c.jsx)(n,{position:`left`}),(0,c.jsx)(a,{...e})]})}var c,l,u,d,f,p,m;e((()=>{i(),c=t(),l=[{month:`Jan`,mean:42,upper95:52,lower95:32},{month:`Feb`,mean:38,upper95:50,lower95:26},{month:`Mar`,mean:51,upper95:62,lower95:40},{month:`Apr`,mean:46,upper95:58,lower95:34},{month:`May`,mean:54,upper95:66,lower95:42},{month:`Jun`,mean:62,upper95:74,lower95:50}],u={title:`Lab/ChartArea`,component:a,tags:[`autodocs`],render:e=>(0,c.jsx)(s,{...e}),args:{yUpper:`upper95`,yLower:`lower95`,color:`var(--color-data-categorical-blue)`,opacity:.2,stroke:!1,strokeWidth:1},argTypes:{color:{control:`color`},opacity:{control:{type:`range`,min:0,max:1,step:.05}},stroke:{control:`boolean`},strokeWidth:{control:{type:`range`,min:0,max:8,step:.5}}}},d={},f={args:{stroke:!0,strokeWidth:2}},p={args:{yLower:void 0,baseline:`mean`,stroke:!0}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    stroke: true,
    strokeWidth: 2
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    yLower: undefined,
    baseline: 'mean',
    stroke: true
  }
}`,...p.parameters?.docs?.source}}},m=[`Band`,`WithEdgeStroke`,`UpperBoundAgainstBaseline`]}))();export{d as Band,p as UpperBoundAgainstBaseline,f as WithEdgeStroke,m as __namedExportsOrder,u as default};