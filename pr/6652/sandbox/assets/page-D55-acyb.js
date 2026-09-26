import{q as e}from"./padding.stylex-C-GcuG1E.js";import{t}from"./Text-Btuic3aH.js";import{t as n}from"./Heading-gx2e3dFM.js";import{n as r,t as i}from"./LayoutContent-Bxqq0ePR.js";import{k as a}from"./index-CtrKZKD4.js";import{t as o}from"./AspectRatio-dvo0n1XV.js";var s=e(),c={containerType:`inline-size`,containerName:`gallery`},l={width:`100%`,height:`100%`,objectFit:`cover`},u={borderRadius:`var(--radius-element)`},d=`
.mixed-gallery-grid {
  display: grid;
  gap: var(--spacing-3);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.mixed-gallery-hero {
  grid-column: span 2;
}
@container gallery (max-width: 720px) {
  .mixed-gallery-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .mixed-gallery-hero {
    grid-column: 1 / -1;
    aspect-ratio: 3 / 2;
  }
}
`,f=[{src:`/astryx/sandbox/template-assets/illustrative-horizontal-1.png`,title:`Going places`},{src:`/astryx/sandbox/template-assets/light-home-horizontal-1.png`,title:`Making memories`},{src:`/astryx/sandbox/template-assets/light-lifestyle-horizontal-1.png`,title:`Being free`},{src:`/astryx/sandbox/template-assets/light-working-horizontal-2.png`,title:`Getting it done`},{src:`/astryx/sandbox/template-assets/light-scene-horizontal-1.png`,title:`Finding calm`}];function p({image:e,ratio:t,className:n}){return(0,s.jsx)(o,{ratio:t,className:n,style:u,children:(0,s.jsx)(`img`,{src:e.src,alt:e.title,style:l})})}function m(){return(0,s.jsx)(r,{height:`fill`,contentWidth:1400,content:(0,s.jsxs)(i,{padding:6,children:[(0,s.jsx)(`style`,{children:d}),(0,s.jsxs)(a,{gap:6,style:c,children:[(0,s.jsxs)(a,{gap:2,hAlign:`center`,children:[(0,s.jsx)(n,{level:1,justify:`center`,children:`Make every day a little more delightful, one detail at a time.`}),(0,s.jsx)(t,{type:`body`,justify:`center`,children:`We believe the smallest details are the ones that matter most. That's what turns an ordinary day into something worth remembering.`})]}),(0,s.jsxs)(`div`,{className:`mixed-gallery-grid`,children:[(0,s.jsx)(p,{image:f[0],ratio:3/1,className:`mixed-gallery-hero`}),(0,s.jsx)(p,{image:f[2],ratio:3/2}),(0,s.jsx)(p,{image:f[3],ratio:3/2}),(0,s.jsx)(p,{image:f[4],ratio:3/2}),(0,s.jsx)(p,{image:f[1],ratio:3/2})]})]})]})})}export{m as default};