import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-CcAIEC7l.js";import{t as a,u as o}from"./i18n-5vMTd4Uj.js";import{n as s,t as c}from"./Calendar-Bowp4YLV.js";import{t as l}from"./Heading-bPy7xj6d.js";import{t as u}from"./Text-i6di9Ep6.js";import{n as d,t as f}from"./DateInput-B5pKrxs_.js";import{C as p,w as m}from"./iframe-FjKZ-wQt.js";function h({locale:e}){let[t,n]=(0,g.useState)(y);return(0,_.jsx)(o,{locale:e,children:(0,_.jsxs)(`section`,{"aria-label":`${e} date examples`,className:`x78zum5 xdt5ytf x18g69wz xeuugli`,children:[(0,_.jsx)(l,{level:2,children:e}),(0,_.jsx)(d,{label:`Selected date`,value:t,onChange:n,format:`date_long`,nativePicker:`never`}),(0,_.jsxs)(i,{children:[`Timestamp:`,` `,(0,_.jsx)(m,{value:`2026-08-22T12:00:00Z`,format:`date_long`})]}),(0,_.jsx)(s,{mode:`single`,value:t,onChange:n,focusDate:`2026-08-01`})]})})}var g,_,v,y,b,x;e((()=>{g=t(n()),c(),f(),a(),u(),p(),_=r(),v={title:`Foundations/Internationalization/Date consistency`,parameters:{layout:`padded`}},y=`2026-08-22`,b={render:()=>(0,_.jsxs)(`div`,{className:`xrvj5dj xnby9oq x4t41sb`,children:[(0,_.jsx)(h,{locale:`fr-FR`}),(0,_.jsx)(h,{locale:`th-TH`})]}),parameters:{docs:{description:{story:`Calendar, DateInput, and Timestamp all follow the provider locale while preserving Gregorian year 2026. Thai must not render Buddhist year 2569.`}}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.comparison)}>
      <LocaleDateExamples locale="fr-FR" />
      <LocaleDateExamples locale="th-TH" />
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Calendar, DateInput, and Timestamp all follow the provider locale while preserving Gregorian year 2026. Thai must not render Buddhist year 2569.'
      }
    }
  }
}`,...b.parameters?.docs?.source}}},x=[`FrenchAndThaiGregorian`]}))();export{b as FrenchAndThaiGregorian,x as __namedExportsOrder,v as default};