import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./LayoutHeader-CLGqQypM.js";import{t as i}from"./jsx-runtime-DqZldVDK.js";import{t as a}from"./Button-CpBrZi1Q.js";import{t as o}from"./Button-BdM_Mlh9.js";import{t as s}from"./Heading-MtotQutU.js";import{i as c,n as l,o as u}from"./Stack-Dntpv-r2.js";import{t as d}from"./Layout-DNDXKYig.js";import{t as f}from"./Text-B194cPHg.js";import{in as p,nn as m,on as h,tn as g}from"./iframe-ChU693T7.js";import{I as _,o as v,t as y,vt as b}from"./esm-BNuSW8ar.js";function x(e){return{boxSizing:`border-box`,width:480,paddingInline:e,"--container-padding-inline-start":`${e}px`,"--container-padding-inline-end":`${e}px`}}function S(e,t,n){if(Math.abs(t-n)>.5)throw Error(`${e}: expected ${n.toFixed(2)}px, received ${t.toFixed(2)}px`)}var C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q;e((()=>{C=t(n()),g(),o(),d(),f(),y(),w=i(),T={title:`Core/TabList`,component:h,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Size of the tab hover targets`}}},E={args:{size:`md`},render:e=>{let[t,n]=(0,C.useState)(`home`);return(0,w.jsxs)(h,{value:t,onChange:n,size:e.size,children:[(0,w.jsx)(p,{value:`home`,label:`Home`}),(0,w.jsx)(p,{value:`projects`,label:`Projects`}),(0,w.jsx)(p,{value:`settings`,label:`Settings`})]})}},D=16,O=8,k=4,A=6,j=640,M=e=>Number.parseFloat(e),N={render:()=>{let[e,t]=(0,C.useState)(`home`);return(0,w.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24},children:[(0,w.jsx)(`div`,{"data-full-bleed-fixture":`hug`,style:x(D),children:(0,w.jsxs)(h,{value:e,onChange:t,"aria-label":`Hug full-bleed geometry`,isFullBleed:!0,children:[(0,w.jsx)(p,{value:`home`,label:`Home`}),(0,w.jsx)(p,{value:`projects`,label:`Projects`})]})}),(0,w.jsx)(`div`,{"data-full-bleed-fixture":`fill`,style:x(D),children:(0,w.jsxs)(h,{value:e,onChange:t,"aria-label":`Fill full-bleed geometry`,layout:`fill`,isFullBleed:!0,children:[(0,w.jsx)(p,{value:`home`,label:`Home`}),(0,w.jsx)(p,{value:`projects`,label:`Projects`}),(0,w.jsx)(m,{label:`More`,options:[{value:`settings`,label:`Settings`},{value:`billing`,label:`Billing`}]})]})}),(0,w.jsx)(`div`,{"data-full-bleed-fixture":`clamp`,style:x(O),children:(0,w.jsxs)(h,{value:e,onChange:t,"aria-label":`Clamp full-bleed geometry`,isFullBleed:!0,children:[(0,w.jsx)(p,{value:`home`,label:`Home`}),(0,w.jsx)(p,{value:`projects`,label:`Projects`})]})}),(0,w.jsx)(`div`,{"data-full-bleed-fixture":`noop`,style:{boxSizing:`border-box`,width:480},children:(0,w.jsxs)(h,{value:e,onChange:t,"aria-label":`No-op full-bleed geometry`,isFullBleed:!0,children:[(0,w.jsx)(p,{value:`home`,label:`Home`}),(0,w.jsx)(p,{value:`projects`,label:`Projects`})]})}),(0,w.jsx)(`div`,{"data-full-bleed-fixture":`noop-control`,style:{boxSizing:`border-box`,width:480},children:(0,w.jsxs)(h,{value:e,onChange:t,"aria-label":`No-op control geometry`,children:[(0,w.jsx)(p,{value:`home`,label:`Home`}),(0,w.jsx)(p,{value:`projects`,label:`Projects`})]})}),(0,w.jsx)(`div`,{"data-full-bleed-fixture":`header-dock`,style:{boxSizing:`border-box`,width:j},children:(0,w.jsx)(r,{hasDivider:!0,padding:k,paddingBlockEnd:0,children:(0,w.jsxs)(c,{gap:3,children:[(0,w.jsx)(s,{level:2,maxLines:1,children:`Order #1001`}),(0,w.jsxs)(u,{vAlign:`center`,children:[(0,w.jsx)(l,{size:`fill`,children:(0,w.jsxs)(h,{value:e,onChange:t,size:`lg`,"aria-label":`Header dock full-bleed geometry`,isFullBleed:!0,children:[(0,w.jsx)(p,{value:`home`,label:`Details`}),(0,w.jsx)(p,{value:`projects`,label:`Invoices`}),(0,w.jsx)(p,{value:`timeline`,label:`Timeline`}),(0,w.jsx)(m,{label:`More`,options:[{value:`customer`,label:`Customer`},{value:`analysis`,label:`Analysis`}]})]})}),(0,w.jsx)(a,{label:`Show panel`,variant:`ghost`,size:`md`,icon:(0,w.jsx)(v,{}),isIconOnly:!0})]})]})})}),(0,w.jsx)(`div`,{"data-full-bleed-fixture":`header-fill`,style:{boxSizing:`border-box`,width:j},children:(0,w.jsx)(r,{hasDivider:!0,padding:A,paddingBlockEnd:0,children:(0,w.jsxs)(h,{value:e,onChange:t,size:`lg`,layout:`fill`,"aria-label":`Header fill full-bleed geometry`,isFullBleed:!0,children:[(0,w.jsx)(p,{value:`home`,label:`Details`}),(0,w.jsx)(p,{value:`projects`,label:`Invoices`}),(0,w.jsx)(m,{label:`More`,options:[{value:`customer`,label:`Customer`},{value:`analysis`,label:`Analysis`}]})]})})})]})},play:async({canvasElement:e})=>{await document.fonts.ready,await new Promise(e=>requestAnimationFrame(()=>requestAnimationFrame(()=>e())));let t=e.querySelector(`[data-full-bleed-fixture="hug"]`),n=t?.querySelector(`.astryx-tab-strip`),r=n?.querySelector(`[data-tab-value="home"]`),i=r?.querySelector(`span span`),a=e.querySelector(`[data-full-bleed-fixture="fill"]`),o=a?.querySelector(`.astryx-tab-strip`),s=o?.querySelector(`[data-tab-menu]`),c=e.querySelector(`[data-full-bleed-fixture="clamp"]`),l=c?.querySelector(`.astryx-tab-strip`),u=l?.querySelector(`[data-tab-value="home"]`),d=u?.querySelector(`span span`),f=e.querySelector(`[data-full-bleed-fixture="noop"] .astryx-tab-strip`),p=e.querySelector(`[data-full-bleed-fixture="noop-control"] .astryx-tab-strip`);if(!t||!n||!r||!i||!a||!o||!s||!c||!l||!u||!d||!f||!p)throw Error(`Full-bleed geometry fixture did not render as expected`);let m=t.getBoundingClientRect(),h=n.getBoundingClientRect(),g=r.getBoundingClientRect(),_=s.getBoundingClientRect(),v=a.getBoundingClientRect(),y=i.getBoundingClientRect(),b=Number.parseFloat(getComputedStyle(r).paddingInlineStart),x=Number.parseFloat(getComputedStyle(s).paddingInlineEnd),C=Number.parseFloat(getComputedStyle(n).paddingInlineStart),w=Number.parseFloat(getComputedStyle(o).paddingInlineEnd),T=m.left+D,E=v.right-D;S(`strip box start`,h.left,m.left),S(`first label start`,y.left,T),S(`stop padding coupling`,C,D-b),S(`first stop content start`,g.left+b,T),S(`TabMenu padding coupling`,w,D-x),S(`last stop content end`,_.right-x,E);let k=c.getBoundingClientRect(),A=l.getBoundingClientRect(),j=d.getBoundingClientRect(),N=Number.parseFloat(getComputedStyle(u).paddingInlineStart),P=Number.parseFloat(getComputedStyle(l).paddingInlineStart);if(S(`clamp strip box start`,A.left,k.left),S(`clamp strip pad-back`,P,0),S(`clamp preserves stop inset`,j.left,k.left+N),N<=O)throw Error(`clamp fixture is not on the far side: stop padding ${N}px must exceed the ${O}px container padding`);let F=f.getBoundingClientRect(),I=p.getBoundingClientRect();S(`no-op strip start`,F.left,I.left),S(`no-op strip end`,F.right,I.right),S(`no-op strip padding`,Number.parseFloat(getComputedStyle(f).paddingInlineStart),Number.parseFloat(getComputedStyle(p).paddingInlineStart));let L=t=>{let n=e.querySelector(`[data-full-bleed-fixture="${t}"]`),r=n?.querySelector(`.astryx-layout-header`),i=r?.firstElementChild,a=n?.querySelector(`.astryx-tab-list`),o=n?.querySelector(`.astryx-tab-strip`),s=n?.querySelector(`[data-tab-value="home"]`),c=s?.querySelector(`.astryx-tab-indicator`);if(!n||!r||!i||!a||!o||!s)throw Error(`${t} header fixture did not render as expected`);if(!c)throw Error(`${t}: selected tab has no indicator to dock`);let l=getComputedStyle(r),u=getComputedStyle(i);return{header:r,headerRect:r.getBoundingClientRect(),dividerWidth:M(l.borderBlockEndWidth),inner:i,innerRect:i.getBoundingClientRect(),padStart:M(u.paddingInlineStart),padEnd:M(u.paddingInlineEnd),padBlockEnd:M(u.paddingBlockEnd),varStart:M(u.getPropertyValue(`--container-padding-inline-start`)),varEnd:M(u.getPropertyValue(`--container-padding-inline-end`)),varBlockEnd:M(u.getPropertyValue(`--container-padding-block-end`)),nav:a,navRect:a.getBoundingClientRect(),strip:o,stripRect:o.getBoundingClientRect(),stripPadStart:M(getComputedStyle(o).paddingInlineStart),stripPadEnd:M(getComputedStyle(o).paddingInlineEnd),firstStop:s,firstStopRect:s.getBoundingClientRect(),firstStopPad:M(getComputedStyle(s).paddingInlineStart),indicatorRect:c.getBoundingClientRect()}},R=(e,t)=>{S(`${e}: published inline-start inset`,t.varStart,t.padStart),S(`${e}: published inline-end inset`,t.varEnd,t.padEnd),S(`${e}: block-end padding docked`,t.padBlockEnd,0),S(`${e}: published block-end inset`,t.varBlockEnd,t.padBlockEnd),S(`${e}: tab row on the header content edge`,t.navRect.bottom,t.innerRect.bottom);let n=t.headerRect.bottom-t.dividerWidth,r=t.indicatorRect.height-t.dividerWidth;S(`${e}: underline docks on the divider`,t.indicatorRect.bottom,t.headerRect.bottom),S(`${e}: underline top relative to the divider rail`,t.indicatorRect.top-n,-r),S(`${e}: strip box start on the header edge`,t.stripRect.left,t.headerRect.left),S(`${e}: strip pad-back start`,t.stripPadStart,Math.max(t.padStart-t.firstStopPad,0)),S(`${e}: first stop content on the start inset`,t.firstStopRect.left+t.firstStopPad,t.headerRect.left+t.padStart)},z=L(`header-dock`);R(`header-dock`,z);let B=z.firstStop.querySelector(`span span`),V=z.nav.parentElement;if(!B||!V)throw Error(`header-dock: tab label or stack slot did not render`);S(`header-dock: first label on the start inset`,B.getBoundingClientRect().left,z.headerRect.left+z.padStart),S(`header-dock: strip end bleeds past its stack slot`,z.navRect.right,V.getBoundingClientRect().right+z.padEnd);let H=L(`header-fill`);R(`header-fill`,H);let U=H.strip.querySelector(`[data-tab-menu]`);if(!U)throw Error(`header-fill: TabMenu did not render`);if(Math.abs(H.padStart-z.padStart)<.5)throw Error(`header-fill must use a different padding step than header-dock, so a stale fallback cannot satisfy both; both measured ${H.padStart.toFixed(2)}px`);S(`header-fill: strip box end on the header edge`,H.stripRect.right,H.headerRect.right);let W=M(getComputedStyle(U).paddingInlineEnd);S(`header-fill: strip pad-back end`,H.stripPadEnd,Math.max(H.padEnd-W,0)),S(`header-fill: last stop content on the end inset`,U.getBoundingClientRect().right-W,H.headerRect.right-H.padEnd)}},P={args:{size:`md`},render:e=>{let[t,n]=(0,C.useState)(`home`);return(0,w.jsxs)(h,{value:t,onChange:n,size:e.size,children:[(0,w.jsx)(p,{value:`home`,label:`Home`}),(0,w.jsx)(p,{value:`projects`,label:`Projects`}),(0,w.jsx)(m,{label:`More`,options:[{value:`analytics`,label:`Analytics`},{value:`reports`,label:`Reports`},{value:`billing`,label:`Billing`}]})]})}},F={args:{size:`md`},render:e=>{let[t,n]=(0,C.useState)(`analytics`);return(0,w.jsxs)(h,{value:t,onChange:n,size:e.size,children:[(0,w.jsx)(p,{value:`home`,label:`Home`}),(0,w.jsx)(p,{value:`projects`,label:`Projects`}),(0,w.jsx)(m,{label:`More`,options:[{value:`analytics`,label:`Analytics`},{value:`reports`,label:`Reports`}]})]})}},I={render:()=>{let[e,t]=(0,C.useState)(`home`);return(0,w.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`},children:[`sm`,`md`,`lg`].map(n=>(0,w.jsxs)(`div`,{children:[(0,w.jsxs)(`div`,{style:{marginBottom:`8px`,fontSize:`12px`,color:`var(--color-text-secondary)`,fontFamily:`monospace`},children:[`size=\\"`,n,`\\"`]}),(0,w.jsx)(`div`,{style:{border:`1px dashed #ccc`,display:`inline-flex`},children:(0,w.jsxs)(h,{value:e,onChange:t,size:n,"aria-label":`Tabs (${n})`,children:[(0,w.jsx)(p,{value:`home`,label:`Home`}),(0,w.jsx)(p,{value:`projects`,label:`Projects`}),(0,w.jsx)(p,{value:`settings`,label:`Settings`})]})})]},n))})}},L={args:{size:`md`},render:e=>{let[t,n]=(0,C.useState)(`home`),r=(0,w.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,w.jsx)(`path`,{d:`M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z`})}),i=(0,w.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,w.jsx)(`path`,{fillRule:`evenodd`,d:`M6.955 1.45A.5.5 0 0 1 7.452 1h1.096a.5.5 0 0 1 .497.45l.17 1.699c.484.12.94.312 1.356.562l1.321-.816a.5.5 0 0 1 .67.087l.774.774a.5.5 0 0 1 .087.67l-.816 1.321c.25.416.442.872.562 1.356l1.699.17a.5.5 0 0 1 .45.497v1.096a.5.5 0 0 1-.45.497l-1.699.17c-.12.484-.312.94-.562 1.356l.816 1.321a.5.5 0 0 1-.087.67l-.774.774a.5.5 0 0 1-.67.087l-1.321-.816c-.416.25-.872.442-1.356.562l-.17 1.699a.5.5 0 0 1-.497.45H7.452a.5.5 0 0 1-.497-.45l-.17-1.699a4.973 4.973 0 0 1-1.356-.562l-1.321.816a.5.5 0 0 1-.67-.087l-.774-.774a.5.5 0 0 1-.087-.67l.816-1.321a4.972 4.972 0 0 1-.562-1.356l-1.699-.17A.5.5 0 0 1 1 8.548V7.452a.5.5 0 0 1 .45-.497l1.699-.17c.12-.484.312-.94.562-1.356l-.816-1.321a.5.5 0 0 1 .087-.67l.774-.774a.5.5 0 0 1 .67-.087l1.321.816c.416-.25.872-.442 1.356-.562l.17-1.699ZM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z`,clipRule:`evenodd`})});return(0,w.jsxs)(h,{value:t,onChange:n,size:e.size,children:[(0,w.jsx)(p,{value:`home`,label:`Home`,icon:r}),(0,w.jsx)(p,{value:`settings`,label:`Settings`,icon:i})]})}},R={args:{size:`md`},render:e=>{let[t,n]=(0,C.useState)(`desktop`),r=(0,w.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,w.jsx)(`path`,{d:`M2.5 3A1.5 1.5 0 0 0 1 4.5v5A1.5 1.5 0 0 0 2.5 11h4.75v1.5H5a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H8.75V11h4.75A1.5 1.5 0 0 0 15 9.5v-5A1.5 1.5 0 0 0 13.5 3h-11Zm0 1.5h11v5h-11v-5Z`})}),i=(0,w.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,w.jsx)(`path`,{d:`M5 1.5A1.5 1.5 0 0 0 3.5 3v10A1.5 1.5 0 0 0 5 14.5h6a1.5 1.5 0 0 0 1.5-1.5V3A1.5 1.5 0 0 0 11 1.5H5Zm0 1.5h6v10H5V3Zm2.25 8.5a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75Z`})}),a=(0,w.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,w.jsx)(`path`,{d:`M8 1.5a6.5 6.5 0 0 0 0 13h.25a1.75 1.75 0 0 0 1.2-3.02.35.35 0 0 1 .23-.6h.97A3.85 3.85 0 0 0 14.5 7.03 5.53 5.53 0 0 0 8.97 1.5H8Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2-1.75a1 1 0 1 1 2 0 1 1 0 0 1-2 0ZM4.5 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm6-1.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z`})});return(0,w.jsxs)(h,{value:t,onChange:n,size:e.size,children:[(0,w.jsx)(p,{value:`desktop`,label:`Desktop preview`,icon:r,isLabelHidden:!0}),(0,w.jsx)(p,{value:`phone`,label:`Phone preview`,icon:i,isLabelHidden:!0}),(0,w.jsx)(p,{value:`theme`,label:`Theme`,icon:a,isLabelHidden:!0})]})}},z={render:()=>{let[e,t]=(0,C.useState)(`all`);return(0,w.jsxs)(h,{value:e,onChange:t,size:`lg`,hasDivider:!0,children:[(0,w.jsx)(p,{value:`all`,label:`All items`}),(0,w.jsx)(p,{value:`active`,label:`Active`}),(0,w.jsx)(p,{value:`archived`,label:`Archived`}),(0,w.jsxs)(`div`,{style:{marginInlineStart:`auto`,display:`flex`,alignItems:`center`,gap:`4px`},children:[(0,w.jsx)(a,{label:`Filter`,variant:`ghost`,size:`lg`,icon:(0,w.jsx)(b,{}),isIconOnly:!0}),(0,w.jsx)(a,{label:`New item`,variant:`primary`,size:`lg`,icon:(0,w.jsx)(_,{})})]})]})}},B={name:`Divider Gap (sm / md / lg)`,render:()=>{let[e,t]=(0,C.useState)(`overview`);return(0,w.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[`sm`,`md`,`lg`].map(n=>(0,w.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,w.jsxs)(`span`,{style:{font:`600 12px system-ui`,color:`var(--color-text-secondary)`},children:[`size="`,n,`" · hasDivider · matched Button size`]}),(0,w.jsxs)(h,{value:e,onChange:t,size:n,hasDivider:!0,"aria-label":`Tabs (${n})`,children:[(0,w.jsx)(p,{value:`overview`,label:`Overview`}),(0,w.jsx)(p,{value:`activity`,label:`Activity`}),(0,w.jsx)(p,{value:`settings`,label:`Settings`}),(0,w.jsxs)(`div`,{style:{marginInlineStart:`auto`,display:`flex`,alignItems:`center`,gap:`4px`},children:[(0,w.jsx)(a,{label:`Filter`,variant:`ghost`,size:n,icon:(0,w.jsx)(b,{}),isIconOnly:!0}),(0,w.jsx)(a,{label:`New item`,variant:`primary`,size:n,icon:(0,w.jsx)(_,{})})]})]})]},n))})}},V={render:()=>{let[e,t]=(0,C.useState)(`home`);return(0,w.jsx)(`div`,{style:{width:`500px`},children:(0,w.jsxs)(h,{value:e,onChange:t,layout:`fill`,hasDivider:!0,children:[(0,w.jsx)(p,{value:`home`,label:`Home`}),(0,w.jsx)(p,{value:`projects`,label:`Projects`}),(0,w.jsx)(p,{value:`settings`,label:`Settings`})]})})}},H={render:()=>{let[e,t]=(0,C.useState)(`overview`);return(0,w.jsx)(`div`,{style:{maxWidth:`400px`,border:`1px dashed #ccc`},children:(0,w.jsxs)(h,{value:e,onChange:t,children:[(0,w.jsx)(p,{value:`overview`,label:`Overview`}),(0,w.jsx)(p,{value:`activity`,label:`Activity`}),(0,w.jsx)(p,{value:`members`,label:`Members`}),(0,w.jsx)(p,{value:`settings`,label:`Settings`}),(0,w.jsx)(p,{value:`integrations`,label:`Integrations`}),(0,w.jsx)(p,{value:`billing`,label:`Billing & Plans`}),(0,w.jsx)(p,{value:`security`,label:`Security`}),(0,w.jsx)(p,{value:`notifications`,label:`Notifications`}),(0,w.jsx)(p,{value:`api`,label:`API Keys`})]})})}},U={render:()=>{let[e,t]=(0,C.useState)(`dashboard`);return(0,w.jsx)(`div`,{style:{maxWidth:`350px`},children:(0,w.jsxs)(h,{value:e,onChange:t,hasDivider:!0,size:`lg`,children:[(0,w.jsx)(p,{value:`dashboard`,label:`Dashboard`}),(0,w.jsx)(p,{value:`analytics`,label:`Analytics`}),(0,w.jsx)(p,{value:`reports`,label:`Reports`}),(0,w.jsx)(p,{value:`customers`,label:`Customers`}),(0,w.jsx)(p,{value:`products`,label:`Products`}),(0,w.jsx)(p,{value:`orders`,label:`Orders`})]})})}},W={render:()=>{let[e,t]=(0,C.useState)(`api`);return(0,w.jsxs)(`div`,{style:{display:`grid`,gap:`8px`,maxWidth:`400px`,minWidth:0},children:[(0,w.jsx)(`div`,{style:{border:`1px dashed #ccc`,minWidth:0},children:(0,w.jsxs)(h,{value:e,onChange:t,children:[(0,w.jsx)(p,{value:`overview`,label:`Overview`}),(0,w.jsx)(p,{value:`activity`,label:`Activity`}),(0,w.jsx)(p,{value:`members`,label:`Members`}),(0,w.jsx)(p,{value:`settings`,label:`Settings`}),(0,w.jsx)(p,{value:`integrations`,label:`Integrations`}),(0,w.jsx)(p,{value:`billing`,label:`Billing & Plans`}),(0,w.jsx)(p,{value:`security`,label:`Security`}),(0,w.jsx)(p,{value:`notifications`,label:`Notifications`}),(0,w.jsx)(p,{value:`api`,label:`API Keys`})]})}),(0,w.jsxs)(`div`,{style:{display:`flex`,gap:`4px`},children:[(0,w.jsx)(a,{label:`Select first`,variant:`secondary`,size:`sm`,onClick:()=>t(`overview`)}),(0,w.jsx)(a,{label:`Select last`,variant:`secondary`,size:`sm`,onClick:()=>t(`api`)})]})]})}},G={render:()=>{let[e,t]=(0,C.useState)(`overview`);return(0,w.jsx)(`div`,{style:{maxWidth:`400px`,border:`1px dashed #ccc`},children:(0,w.jsxs)(h,{value:e,onChange:t,overflow:`visible`,children:[(0,w.jsx)(p,{value:`overview`,label:`Overview`}),(0,w.jsx)(p,{value:`activity`,label:`Activity`}),(0,w.jsx)(p,{value:`members`,label:`Members`}),(0,w.jsx)(p,{value:`settings`,label:`Settings`}),(0,w.jsx)(p,{value:`integrations`,label:`Integrations`}),(0,w.jsx)(p,{value:`billing`,label:`Billing & Plans`}),(0,w.jsx)(p,{value:`security`,label:`Security`}),(0,w.jsx)(p,{value:`notifications`,label:`Notifications`}),(0,w.jsx)(p,{value:`api`,label:`API Keys`})]})})}},K={render:()=>{let[e,t]=(0,C.useState)(`overview`);return(0,w.jsxs)(`div`,{style:{display:`grid`,gap:`12px`,maxWidth:`400px`},children:[(0,w.jsxs)(h,{value:e,onChange:t,role:`tablist`,"aria-label":`Project views`,hasDivider:!0,children:[(0,w.jsx)(p,{value:`overview`,label:`Overview`,id:`tab-overview`,panelId:`panel-overview`}),(0,w.jsx)(p,{value:`activity`,label:`Activity`,id:`tab-activity`,panelId:`panel-activity`}),(0,w.jsx)(p,{value:`members`,label:`Members`,id:`tab-members`,panelId:`panel-members`})]}),Object.entries({overview:`Everything at a glance.`,activity:`What happened recently.`,members:`Who has access.`}).map(([t,n])=>(0,w.jsx)(`div`,{id:`panel-${t}`,role:`tabpanel`,"aria-labelledby":`tab-${t}`,tabIndex:0,hidden:t!==e,children:n},t))]})}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  },
  render: args => {
    const [value, setValue] = useState('home');
    return <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="home" label="Home" />
        <Tab value="projects" label="Projects" />
        <Tab value="settings" label="Settings" />
      </TabList>;
  }
}`,...E.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('home');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }}>
        <div data-full-bleed-fixture="hug" style={fullBleedFixtureStyle(FULL_BLEED_FIXTURE_PADDING)}>
          <TabList value={value} onChange={setValue} aria-label="Hug full-bleed geometry" isFullBleed>
            <Tab value="home" label="Home" />
            <Tab value="projects" label="Projects" />
          </TabList>
        </div>
        <div data-full-bleed-fixture="fill" style={fullBleedFixtureStyle(FULL_BLEED_FIXTURE_PADDING)}>
          <TabList value={value} onChange={setValue} aria-label="Fill full-bleed geometry" layout="fill" isFullBleed>
            <Tab value="home" label="Home" />
            <Tab value="projects" label="Projects" />
            <TabMenu label="More" options={[{
            value: 'settings',
            label: 'Settings'
          }, {
            value: 'billing',
            label: 'Billing'
          }]} />
          </TabList>
        </div>
        <div data-full-bleed-fixture="clamp" style={fullBleedFixtureStyle(CLAMP_FIXTURE_PADDING)}>
          <TabList value={value} onChange={setValue} aria-label="Clamp full-bleed geometry" isFullBleed>
            <Tab value="home" label="Home" />
            <Tab value="projects" label="Projects" />
          </TabList>
        </div>
        <div data-full-bleed-fixture="noop" style={{
        boxSizing: 'border-box',
        width: 480
      }}>
          <TabList value={value} onChange={setValue} aria-label="No-op full-bleed geometry" isFullBleed>
            <Tab value="home" label="Home" />
            <Tab value="projects" label="Projects" />
          </TabList>
        </div>
        <div data-full-bleed-fixture="noop-control" style={{
        boxSizing: 'border-box',
        width: 480
      }}>
          <TabList value={value} onChange={setValue} aria-label="No-op control geometry">
            <Tab value="home" label="Home" />
            <Tab value="projects" label="Projects" />
          </TabList>
        </div>
        {/* The shipped seam, composed exactly as \`detail-page\` composes it:
            a padded LayoutHeader with its divider, its block-end padding
            docked to 0, and the tab row as the last thing in the header. */}
        <div data-full-bleed-fixture="header-dock" style={{
        boxSizing: 'border-box',
        width: HEADER_FIXTURE_WIDTH
      }}>
          <LayoutHeader hasDivider padding={HEADER_DOCK_PADDING_STEP} paddingBlockEnd={0}>
            <VStack gap={3}>
              <Heading level={2} maxLines={1}>
                Order #1001
              </Heading>
              <HStack vAlign="center">
                <StackItem size="fill">
                  <TabList value={value} onChange={setValue} size="lg" aria-label="Header dock full-bleed geometry" isFullBleed>
                    <Tab value="home" label="Details" />
                    <Tab value="projects" label="Invoices" />
                    <Tab value="timeline" label="Timeline" />
                    <TabMenu label="More" options={[{
                    value: 'customer',
                    label: 'Customer'
                  }, {
                    value: 'analysis',
                    label: 'Analysis'
                  }]} />
                  </TabList>
                </StackItem>
                <Button label="Show panel" variant="ghost" size="md" icon={<ViewColumnsIcon />} isIconOnly />
              </HStack>
            </VStack>
          </LayoutHeader>
        </div>
        {/* Same header wiring with the strip as the header's only child, so
            both inline edges are free to reach the header's box and the last
            stop's far label can be measured against the end inset. */}
        <div data-full-bleed-fixture="header-fill" style={{
        boxSizing: 'border-box',
        width: HEADER_FIXTURE_WIDTH
      }}>
          <LayoutHeader hasDivider padding={HEADER_FILL_PADDING_STEP} paddingBlockEnd={0}>
            <TabList value={value} onChange={setValue} size="lg" layout="fill" aria-label="Header fill full-bleed geometry" isFullBleed>
              <Tab value="home" label="Details" />
              <Tab value="projects" label="Invoices" />
              <TabMenu label="More" options={[{
              value: 'customer',
              label: 'Customer'
            }, {
              value: 'analysis',
              label: 'Analysis'
            }]} />
            </TabList>
          </LayoutHeader>
        </div>
      </div>;
  },
  play: async ({
    canvasElement
  }) => {
    await document.fonts.ready;
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const wrapper = canvasElement.querySelector<HTMLElement>('[data-full-bleed-fixture="hug"]');
    const strip = wrapper?.querySelector<HTMLElement>('.astryx-tab-strip');
    const firstStop = strip?.querySelector<HTMLElement>('[data-tab-value="home"]');
    const firstLabel = firstStop?.querySelector<HTMLElement>('span span');
    const fillWrapper = canvasElement.querySelector<HTMLElement>('[data-full-bleed-fixture="fill"]');
    const fillStrip = fillWrapper?.querySelector<HTMLElement>('.astryx-tab-strip');
    const lastStop = fillStrip?.querySelector<HTMLElement>('[data-tab-menu]');
    const clampWrapper = canvasElement.querySelector<HTMLElement>('[data-full-bleed-fixture="clamp"]');
    const clampStrip = clampWrapper?.querySelector<HTMLElement>('.astryx-tab-strip');
    const clampFirstStop = clampStrip?.querySelector<HTMLElement>('[data-tab-value="home"]');
    const clampFirstLabel = clampFirstStop?.querySelector<HTMLElement>('span span');
    const noopStrip = canvasElement.querySelector<HTMLElement>('[data-full-bleed-fixture="noop"] .astryx-tab-strip');
    const noopControlStrip = canvasElement.querySelector<HTMLElement>('[data-full-bleed-fixture="noop-control"] .astryx-tab-strip');
    if (!wrapper || !strip || !firstStop || !firstLabel || !fillWrapper || !fillStrip || !lastStop || !clampWrapper || !clampStrip || !clampFirstStop || !clampFirstLabel || !noopStrip || !noopControlStrip) {
      throw new Error('Full-bleed geometry fixture did not render as expected');
    }
    const wrapperRect = wrapper.getBoundingClientRect();
    const stripRect = strip.getBoundingClientRect();
    const firstStopRect = firstStop.getBoundingClientRect();
    const lastStopRect = lastStop.getBoundingClientRect();
    const fillWrapperRect = fillWrapper.getBoundingClientRect();
    const firstLabelRect = firstLabel.getBoundingClientRect();
    const stopPadding = Number.parseFloat(getComputedStyle(firstStop).paddingInlineStart);
    const lastStopPadding = Number.parseFloat(getComputedStyle(lastStop).paddingInlineEnd);
    const stripPadding = Number.parseFloat(getComputedStyle(strip).paddingInlineStart);
    const stripPaddingEnd = Number.parseFloat(getComputedStyle(fillStrip).paddingInlineEnd);
    const contentInset = wrapperRect.left + FULL_BLEED_FIXTURE_PADDING;
    const contentEnd = fillWrapperRect.right - FULL_BLEED_FIXTURE_PADDING;
    assertGeometry('strip box start', stripRect.left, wrapperRect.left);
    assertGeometry('first label start', firstLabelRect.left, contentInset);
    assertGeometry('stop padding coupling', stripPadding, FULL_BLEED_FIXTURE_PADDING - stopPadding);
    assertGeometry('first stop content start', firstStopRect.left + stopPadding, contentInset);
    assertGeometry('TabMenu padding coupling', stripPaddingEnd, FULL_BLEED_FIXTURE_PADDING - lastStopPadding);
    assertGeometry('last stop content end', lastStopRect.right - lastStopPadding, contentEnd);

    // Far side of the clamp: at 8px container padding the strip still bleeds
    // to the wrapper edge, but the pad-back clamps to zero — the stop's own
    // 12px inset is preserved, never shrunk, so the label sits 4px inside the
    // content inset (matching main's behaviour with hand-written margins).
    const clampWrapperRect = clampWrapper.getBoundingClientRect();
    const clampStripRect = clampStrip.getBoundingClientRect();
    const clampLabelRect = clampFirstLabel.getBoundingClientRect();
    const clampStopPadding = Number.parseFloat(getComputedStyle(clampFirstStop).paddingInlineStart);
    const clampStripPadding = Number.parseFloat(getComputedStyle(clampStrip).paddingInlineStart);
    assertGeometry('clamp strip box start', clampStripRect.left, clampWrapperRect.left);
    assertGeometry('clamp strip pad-back', clampStripPadding, 0);
    assertGeometry('clamp preserves stop inset', clampLabelRect.left, clampWrapperRect.left + clampStopPadding);
    if (clampStopPadding <= CLAMP_FIXTURE_PADDING) {
      throw new Error(\`clamp fixture is not on the far side: stop padding \${clampStopPadding}px must exceed the \${CLAMP_FIXTURE_PADDING}px container padding\`);
    }

    // Outside a padded container the custom properties are unset and the prop
    // is a no-op: the strip's box and padding match a plain TabList exactly.
    const noopStripRect = noopStrip.getBoundingClientRect();
    const noopControlRect = noopControlStrip.getBoundingClientRect();
    assertGeometry('no-op strip start', noopStripRect.left, noopControlRect.left);
    assertGeometry('no-op strip end', noopStripRect.right, noopControlRect.right);
    assertGeometry('no-op strip padding', Number.parseFloat(getComputedStyle(noopStrip).paddingInlineStart), Number.parseFloat(getComputedStyle(noopControlStrip).paddingInlineStart));

    // ── The real seam ──────────────────────────────────────────────────────
    // Everything above runs against hand-written custom properties. What
    // ships is a LayoutHeader publishing them, so measure that instead.

    /** Resolves one \`header-*\` fixture's parts, or throws naming the gap. */
    const headerParts = (name: string) => {
      const fixture = canvasElement.querySelector<HTMLElement>(\`[data-full-bleed-fixture="\${name}"]\`);
      const header = fixture?.querySelector<HTMLElement>('.astryx-layout-header');
      // LayoutHeader's padded inner wrapper: the element that both applies the
      // padding and publishes the container-padding variables.
      const inner = header?.firstElementChild as HTMLElement | null;
      const nav = fixture?.querySelector<HTMLElement>('.astryx-tab-list');
      const strip = fixture?.querySelector<HTMLElement>('.astryx-tab-strip');
      const firstStop = fixture?.querySelector<HTMLElement>('[data-tab-value="home"]');
      const indicator = firstStop?.querySelector<HTMLElement>('.astryx-tab-indicator');
      if (!fixture || !header || !inner || !nav || !strip || !firstStop) {
        throw new Error(\`\${name} header fixture did not render as expected\`);
      }
      if (!indicator) {
        throw new Error(\`\${name}: selected tab has no indicator to dock\`);
      }
      const headerStyle = getComputedStyle(header);
      const innerStyle = getComputedStyle(inner);
      return {
        header,
        headerRect: header.getBoundingClientRect(),
        dividerWidth: px(headerStyle.borderBlockEndWidth),
        inner,
        innerRect: inner.getBoundingClientRect(),
        padStart: px(innerStyle.paddingInlineStart),
        padEnd: px(innerStyle.paddingInlineEnd),
        padBlockEnd: px(innerStyle.paddingBlockEnd),
        varStart: px(innerStyle.getPropertyValue('--container-padding-inline-start')),
        varEnd: px(innerStyle.getPropertyValue('--container-padding-inline-end')),
        varBlockEnd: px(innerStyle.getPropertyValue('--container-padding-block-end')),
        nav,
        navRect: nav.getBoundingClientRect(),
        strip,
        stripRect: strip.getBoundingClientRect(),
        stripPadStart: px(getComputedStyle(strip).paddingInlineStart),
        stripPadEnd: px(getComputedStyle(strip).paddingInlineEnd),
        firstStop,
        firstStopRect: firstStop.getBoundingClientRect(),
        firstStopPad: px(getComputedStyle(firstStop).paddingInlineStart),
        indicatorRect: indicator.getBoundingClientRect()
      };
    };

    /**
     * What both header fixtures owe regardless of their contents: the header
     * publishes the padding it actually applies (the coupling the whole bleed
     * rests on), the tab row is docked on the header's content bottom edge,
     * and the selected underline lands on the divider rather than floating
     * above it. Round 3 measured that underline 7.00px above the divider with
     * the template's hand-written margins; docked it reads -1.00px — the 2px
     * indicator's top edge one pixel above the 1px divider's top edge, its
     * bottom flush with the divider's outer edge.
     */
    const assertHeaderSeam = (name: string, p: ReturnType<typeof headerParts>) => {
      assertGeometry(\`\${name}: published inline-start inset\`, p.varStart, p.padStart);
      assertGeometry(\`\${name}: published inline-end inset\`, p.varEnd, p.padEnd);
      assertGeometry(\`\${name}: block-end padding docked\`, p.padBlockEnd, 0);
      assertGeometry(\`\${name}: published block-end inset\`, p.varBlockEnd, p.padBlockEnd);

      // paddingBlockEnd={0} is the whole reason the tab row can reach the
      // rail: its bottom edge is the header's content bottom edge.
      assertGeometry(\`\${name}: tab row on the header content edge\`, p.navRect.bottom, p.innerRect.bottom);
      const dividerTop = p.headerRect.bottom - p.dividerWidth;
      const overhang = p.indicatorRect.height - p.dividerWidth;
      assertGeometry(\`\${name}: underline docks on the divider\`, p.indicatorRect.bottom, p.headerRect.bottom);
      assertGeometry(\`\${name}: underline top relative to the divider rail\`, p.indicatorRect.top - dividerTop, -overhang);

      // The inline bleed itself, through the published variables: the strip's
      // box clears the header's inline-start padding, and it pads back by the
      // part of that inset a stop's own padding does not already supply.
      assertGeometry(\`\${name}: strip box start on the header edge\`, p.stripRect.left, p.headerRect.left);
      assertGeometry(\`\${name}: strip pad-back start\`, p.stripPadStart, Math.max(p.padStart - p.firstStopPad, 0));
      assertGeometry(\`\${name}: first stop content on the start inset\`, p.firstStopRect.left + p.firstStopPad, p.headerRect.left + p.padStart);
    };

    // Template mirror: tabs share the row with a trailing ghost toggle, so the
    // strip's end edge stops at that toggle. Its bleed is still measurable —
    // the box hangs the published end inset past its own StackItem.
    const dock = headerParts('header-dock');
    assertHeaderSeam('header-dock', dock);
    const dockLabel = dock.firstStop.querySelector<HTMLElement>('span span');
    const dockSlot = dock.nav.parentElement;
    if (!dockLabel || !dockSlot) {
      throw new Error('header-dock: tab label or stack slot did not render');
    }
    assertGeometry('header-dock: first label on the start inset', dockLabel.getBoundingClientRect().left, dock.headerRect.left + dock.padStart);
    assertGeometry('header-dock: strip end bleeds past its stack slot', dock.navRect.right, dockSlot.getBoundingClientRect().right + dock.padEnd);

    // Strip alone in the header, and at a different padding step: both inline
    // edges are free to reach the header's box, and the last stop's content
    // returns to the end inset.
    const fill = headerParts('header-fill');
    assertHeaderSeam('header-fill', fill);
    const fillMenu = fill.strip.querySelector<HTMLElement>('[data-tab-menu]');
    if (!fillMenu) {
      throw new Error('header-fill: TabMenu did not render');
    }
    if (Math.abs(fill.padStart - dock.padStart) < 0.5) {
      throw new Error(\`header-fill must use a different padding step than header-dock, so a stale fallback cannot satisfy both; both measured \${fill.padStart.toFixed(2)}px\`);
    }
    assertGeometry('header-fill: strip box end on the header edge', fill.stripRect.right, fill.headerRect.right);
    const fillMenuPadEnd = px(getComputedStyle(fillMenu).paddingInlineEnd);
    assertGeometry('header-fill: strip pad-back end', fill.stripPadEnd, Math.max(fill.padEnd - fillMenuPadEnd, 0));
    assertGeometry('header-fill: last stop content on the end inset', fillMenu.getBoundingClientRect().right - fillMenuPadEnd, fill.headerRect.right - fill.padEnd);
  }
}`,...N.parameters?.docs?.source},description:{story:`Browser geometry guard for \`isFullBleed\`. The strip must escape the
wrapper's padding while the first label returns to the content inset. The
strip-pad assertion also pins TabList's restated stop-padding token to the
padding the real Tab paints; changing either side breaks this story. The
clamp and no-op fixtures cover the accepted far side: container padding
below a stop's own inset preserves that inset, and outside a padded
container the prop changes nothing.

The first four fixtures hand-write the \`--container-padding-inline-*\`
values on a plain wrapper, which pins TabList's half of the contract but
proves nothing about who publishes those values. The two \`header-*\`
fixtures close that: they compose a real
\`LayoutHeader hasDivider padding paddingBlockEnd={0}\` around a real
\`TabList isFullBleed\` — the shape the \`detail-page\` template ships — so the
whole seam is measured, publisher included.

Enforced by \`.github/scripts/story-play-guard.js\` in the \`pr-a11y\` job —
the play assertions below fail required CI, not just a local canvas.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  },
  render: args => {
    const [value, setValue] = useState('home');
    return <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="home" label="Home" />
        <Tab value="projects" label="Projects" />
        <TabMenu label="More" options={[{
        value: 'analytics',
        label: 'Analytics'
      }, {
        value: 'reports',
        label: 'Reports'
      }, {
        value: 'billing',
        label: 'Billing'
      }]} />
      </TabList>;
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  },
  render: args => {
    const [value, setValue] = useState('analytics');
    return <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="home" label="Home" />
        <Tab value="projects" label="Projects" />
        <TabMenu label="More" options={[{
        value: 'analytics',
        label: 'Analytics'
      }, {
        value: 'reports',
        label: 'Reports'
      }]} />
      </TabList>;
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('home');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
        {(['sm', 'md', 'lg'] as const).map(size => <div key={size}>
            <div style={{
          marginBottom: '8px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          fontFamily: 'monospace'
        }}>
              size=\\"{size}\\"
            </div>
            <div style={{
          border: '1px dashed #ccc',
          display: 'inline-flex'
        }}>
              <TabList value={value} onChange={setValue} size={size} aria-label={\`Tabs (\${size})\`}>
                <Tab value="home" label="Home" />
                <Tab value="projects" label="Projects" />
                <Tab value="settings" label="Settings" />
              </TabList>
            </div>
          </div>)}
      </div>;
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  },
  render: args => {
    const [value, setValue] = useState('home');
    const HomeIcon = <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path d="M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z" />
      </svg>;
    const CogIcon = <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path fillRule="evenodd" d="M6.955 1.45A.5.5 0 0 1 7.452 1h1.096a.5.5 0 0 1 .497.45l.17 1.699c.484.12.94.312 1.356.562l1.321-.816a.5.5 0 0 1 .67.087l.774.774a.5.5 0 0 1 .087.67l-.816 1.321c.25.416.442.872.562 1.356l1.699.17a.5.5 0 0 1 .45.497v1.096a.5.5 0 0 1-.45.497l-1.699.17c-.12.484-.312.94-.562 1.356l.816 1.321a.5.5 0 0 1-.087.67l-.774.774a.5.5 0 0 1-.67.087l-1.321-.816c-.416.25-.872.442-1.356.562l-.17 1.699a.5.5 0 0 1-.497.45H7.452a.5.5 0 0 1-.497-.45l-.17-1.699a4.973 4.973 0 0 1-1.356-.562l-1.321.816a.5.5 0 0 1-.67-.087l-.774-.774a.5.5 0 0 1-.087-.67l.816-1.321a4.972 4.972 0 0 1-.562-1.356l-1.699-.17A.5.5 0 0 1 1 8.548V7.452a.5.5 0 0 1 .45-.497l1.699-.17c.12-.484.312-.94.562-1.356l-.816-1.321a.5.5 0 0 1 .087-.67l.774-.774a.5.5 0 0 1 .67-.087l1.321.816c.416-.25.872-.442 1.356-.562l.17-1.699ZM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" clipRule="evenodd" />
      </svg>;
    return <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="home" label="Home" icon={HomeIcon} />
        <Tab value="settings" label="Settings" icon={CogIcon} />
      </TabList>;
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  },
  render: args => {
    const [value, setValue] = useState('desktop');
    const DesktopIcon = <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v5A1.5 1.5 0 0 0 2.5 11h4.75v1.5H5a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H8.75V11h4.75A1.5 1.5 0 0 0 15 9.5v-5A1.5 1.5 0 0 0 13.5 3h-11Zm0 1.5h11v5h-11v-5Z" />
      </svg>;
    const PhoneIcon = <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path d="M5 1.5A1.5 1.5 0 0 0 3.5 3v10A1.5 1.5 0 0 0 5 14.5h6a1.5 1.5 0 0 0 1.5-1.5V3A1.5 1.5 0 0 0 11 1.5H5Zm0 1.5h6v10H5V3Zm2.25 8.5a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75Z" />
      </svg>;
    const ThemeIcon = <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path d="M8 1.5a6.5 6.5 0 0 0 0 13h.25a1.75 1.75 0 0 0 1.2-3.02.35.35 0 0 1 .23-.6h.97A3.85 3.85 0 0 0 14.5 7.03 5.53 5.53 0 0 0 8.97 1.5H8Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2-1.75a1 1 0 1 1 2 0 1 1 0 0 1-2 0ZM4.5 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm6-1.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
      </svg>;
    return <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="desktop" label="Desktop preview" icon={DesktopIcon} isLabelHidden />
        <Tab value="phone" label="Phone preview" icon={PhoneIcon} isLabelHidden />
        <Tab value="theme" label="Theme" icon={ThemeIcon} isLabelHidden />
      </TabList>;
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('all');
    return <TabList value={value} onChange={setValue} size="lg" hasDivider>
        <Tab value="all" label="All items" />
        <Tab value="active" label="Active" />
        <Tab value="archived" label="Archived" />
        <div style={{
        marginInlineStart: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
          <Button label="Filter" variant="ghost" size="lg" icon={<FunnelIcon />} isIconOnly />
          <Button label="New item" variant="primary" size="lg" icon={<PlusIcon />} />
        </div>
      </TabList>;
  }
}`,...z.parameters?.docs?.source},description:{story:`Demonstrates a common page header pattern: large tab list items on the left
with action buttons on the right, separated by a full-width divider underneath.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: 'Divider Gap (sm / md / lg)',
  render: () => {
    const [value, setValue] = useState('overview');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
        {(['sm', 'md', 'lg'] as const).map(size => <div key={size} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
            <span style={{
          font: '600 12px system-ui',
          color: 'var(--color-text-secondary)'
        }}>
              size=&quot;{size}&quot; · hasDivider · matched Button size
            </span>
            <TabList value={value} onChange={setValue} size={size} hasDivider aria-label={\`Tabs (\${size})\`}>
              <Tab value="overview" label="Overview" />
              <Tab value="activity" label="Activity" />
              <Tab value="settings" label="Settings" />
              <div style={{
            marginInlineStart: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
                <Button label="Filter" variant="ghost" size={size} icon={<FunnelIcon />} isIconOnly />
                <Button label="New item" variant="primary" size={size} icon={<PlusIcon />} />
              </div>
            </TabList>
          </div>)}
      </div>;
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('home');
    return <div style={{
      width: '500px'
    }}>
        <TabList value={value} onChange={setValue} layout="fill" hasDivider>
          <Tab value="home" label="Home" />
          <Tab value="projects" label="Projects" />
          <Tab value="settings" label="Settings" />
        </TabList>
      </div>;
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('overview');
    return <div style={{
      maxWidth: '400px',
      border: '1px dashed #ccc'
    }}>
        <TabList value={value} onChange={setValue}>
          <Tab value="overview" label="Overview" />
          <Tab value="activity" label="Activity" />
          <Tab value="members" label="Members" />
          <Tab value="settings" label="Settings" />
          <Tab value="integrations" label="Integrations" />
          <Tab value="billing" label="Billing & Plans" />
          <Tab value="security" label="Security" />
          <Tab value="notifications" label="Notifications" />
          <Tab value="api" label="API Keys" />
        </TabList>
      </div>;
  }
}`,...H.parameters?.docs?.source},description:{story:`A strip narrower than its tabs scrolls. Every tab stays a tab — nothing is
hidden behind a menu — and the edges fade to show there is more. Pointers
that can hover also get arrow affordances; keyboard users reach every tab
with the arrow keys, which scrolls the focused tab into view.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('dashboard');
    return <div style={{
      maxWidth: '350px'
    }}>
        <TabList value={value} onChange={setValue} hasDivider size="lg">
          <Tab value="dashboard" label="Dashboard" />
          <Tab value="analytics" label="Analytics" />
          <Tab value="reports" label="Reports" />
          <Tab value="customers" label="Customers" />
          <Tab value="products" label="Products" />
          <Tab value="orders" label="Orders" />
        </TabList>
      </div>;
  }
}`,...U.parameters?.docs?.source},description:{story:`Overflow with divider — typical page header in a narrow viewport. The
selected indicator still sits on the rail while the strip scrolls.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('api');
    return <div style={{
      display: 'grid',
      gap: '8px',
      maxWidth: '400px',
      minWidth: 0
    }}>
        <div style={{
        border: '1px dashed #ccc',
        minWidth: 0
      }}>
          <TabList value={value} onChange={setValue}>
            <Tab value="overview" label="Overview" />
            <Tab value="activity" label="Activity" />
            <Tab value="members" label="Members" />
            <Tab value="settings" label="Settings" />
            <Tab value="integrations" label="Integrations" />
            <Tab value="billing" label="Billing & Plans" />
            <Tab value="security" label="Security" />
            <Tab value="notifications" label="Notifications" />
            <Tab value="api" label="API Keys" />
          </TabList>
        </div>
        <div style={{
        display: 'flex',
        gap: '4px'
      }}>
          <Button label="Select first" variant="secondary" size="sm" onClick={() => setValue('overview')} />
          <Button label="Select last" variant="secondary" size="sm" onClick={() => setValue('api')} />
        </div>
      </div>;
  }
}`,...W.parameters?.docs?.source},description:{story:"A tab selected while it is out of view is scrolled back in — on mount and\nwhenever the host changes `value` itself.",...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('overview');
    return <div style={{
      maxWidth: '400px',
      border: '1px dashed #ccc'
    }}>
        <TabList value={value} onChange={setValue} overflow="visible">
          <Tab value="overview" label="Overview" />
          <Tab value="activity" label="Activity" />
          <Tab value="members" label="Members" />
          <Tab value="settings" label="Settings" />
          <Tab value="integrations" label="Integrations" />
          <Tab value="billing" label="Billing & Plans" />
          <Tab value="security" label="Security" />
          <Tab value="notifications" label="Notifications" />
          <Tab value="api" label="API Keys" />
        </TabList>
      </div>;
  }
}`,...G.parameters?.docs?.source},description:{story:'`overflow="visible"` opts out: the tabs keep their intrinsic widths and spill\nout of the strip, for a host that handles overflow itself.',...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('overview');
    const panels = {
      overview: 'Everything at a glance.',
      activity: 'What happened recently.',
      members: 'Who has access.'
    };
    return <div style={{
      display: 'grid',
      gap: '12px',
      maxWidth: '400px'
    }}>
        <TabList value={value} onChange={setValue} role="tablist" aria-label="Project views" hasDivider>
          <Tab value="overview" label="Overview" id="tab-overview" panelId="panel-overview" />
          <Tab value="activity" label="Activity" id="tab-activity" panelId="panel-activity" />
          <Tab value="members" label="Members" id="tab-members" panelId="panel-members" />
        </TabList>
        {Object.entries(panels).map(([key, text]) => <div key={key} id={\`panel-\${key}\`} role="tabpanel" aria-labelledby={\`tab-\${key}\`} tabIndex={0} hidden={key !== value}>
            {text}
          </div>)}
      </div>;
  }
}`,...K.parameters?.docs?.source},description:{story:'`role="tablist"` asks for the WAI-ARIA tabs pattern: `role="tablist"` /\n`role="tab"`, `aria-selected`, and each tab pointing at the panel it\ncontrols. A screen reader announces "tab 2 of 3, selected" and can move to\nthe panel it opens. Without it the strip stays a `<nav>` landmark marking\nthe current tab with `aria-current`.',...K.parameters?.docs?.description}}},q=[`Default`,`FullBleedGeometry`,`WithMenu`,`MenuWithSelectedChild`,`SizeVariants`,`WithIcons`,`IconOnly`,`WithActions`,`DividerGap`,`FillLayout`,`Overflow`,`OverflowWithDivider`,`OverflowSelectedOffscreen`,`OverflowVisible`,`TabsPattern`]}))();export{E as Default,B as DividerGap,V as FillLayout,N as FullBleedGeometry,R as IconOnly,F as MenuWithSelectedChild,H as Overflow,W as OverflowSelectedOffscreen,G as OverflowVisible,U as OverflowWithDivider,I as SizeVariants,K as TabsPattern,z as WithActions,L as WithIcons,P as WithMenu,q as __namedExportsOrder,T as default};