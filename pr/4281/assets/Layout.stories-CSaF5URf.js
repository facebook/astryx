import{i as e}from"./preload-helper-CT_b8DTk.js";import{l as t,u as n}from"./themeProps-_oSbOSxB.js";import{r,t as i}from"./LayoutContent-CuPavk6w.js";import{t as a}from"./LayoutHeader-By1G-oXd.js";import{t as o}from"./jsx-runtime-DqZldVDK.js";import{t as s}from"./LayoutPanel-zAyWvAO7.js";import{t as c}from"./Button-C8AQEnU2.js";import{t as l}from"./Button-BOsa3Aea.js";import{t as u}from"./container.stylex-CLT-HZ82.js";import{n as d,t as f}from"./Card-BbIrXk4e.js";import{x as p}from"./theme-BwMR6G18.js";import{i as m,o as h}from"./Stack-C7dTtCDZ.js";import{t as g}from"./Section-uPZCRnkC.js";import{t as _}from"./Section-C4pDrmx1.js";import{t as v}from"./LayoutFooter-B6HT_w7L.js";import{t as y}from"./Layout-BvMyrLFX.js";import{Ii as b,Li as x,i as S,l as C,o as w,s as T,u as E}from"./iframe-CPRczjHQ.js";var D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y;e((()=>{t(),f(),_(),y(),l(),b(),E(),S(),T(),D=o(),O={storySection:{kmVPX3:`x1shk3sm`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kWkggS:`x1eiddq6`,$$css:!0},demoContainer:{kWkggS:`x1de1mus`,kaIpWk:`x1hviunn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kGVxlE:`x1i5ehqx`,$$css:!0},demoSize:{kzqmXN:`xdzyupr`,kZKoxP:`x1isuwpm`,$$css:!0}},k=({active:e,children:t})=>(0,D.jsx)(`div`,{...{0:{className:`x1s1e50u x1kogg8i x1ypdohk x1tgivj0 x9ynric xif65rj xjbqb8w x1uwx2nv`},1:{className:`x1s1e50u x1kogg8i x1ypdohk x9ynric xif65rj xgcxg3y xjse4m1`}}[!!e<<0],children:t}),A={title:`Core/Layout`,component:r,tags:[`autodocs`],parameters:{controls:{expanded:!1},docs:{description:{component:"\nThe Astryx Layout System provides a structured way to build page and component layouts.\n\n**Components:**\n- `Card` - Card container with shadow\n- `Section` - Section container with background variants\n- `Layout` - Arranges content into header, content, footer, and panel slots\n- `LayoutHeader` - Header slot with optional divider\n- `LayoutContent` - Scrollable main content area\n- `LayoutFooter` - Footer slot with optional divider\n- `LayoutPanel` - Side panel slots (start/end) with optional divider\n        "}}},argTypes:{content:{table:{disable:!0}},end:{table:{disable:!0}},footer:{table:{disable:!0}},header:{table:{disable:!0}},height:{table:{disable:!0}},padding:{table:{disable:!0}},start:{table:{disable:!0}}}},j={name:`Playground`,args:{cardWidth:700,cardHeight:400,layoutPadding:4,showHeader:!0,headerHasDivider:!0,headerPadding:4,contentPadding:4,contentIsScrollable:!0,showFooter:!0,footerHasDivider:!0,footerPadding:4,showStartPanel:!0,startPanelWidth:160,startPanelHasDivider:!0,startPanelIsScrollable:!0,showEndPanel:!1,endPanelWidth:200,endPanelHasDivider:!0,endPanelIsScrollable:!0},argTypes:{cardWidth:{control:{type:`range`,min:300,max:1e3,step:50},description:`Width of the card container`,table:{category:`Card`}},cardHeight:{control:{type:`range`,min:200,max:600,step:50},description:`Height of the card container`,table:{category:`Card`}},layoutPadding:{control:{type:`range`,min:0,max:8,step:1},description:`Padding at layout outer edges (0 for full bleed)`,table:{category:`Layout`}},showHeader:{control:`boolean`,description:`Show or hide the header`,table:{category:`Header`}},headerHasDivider:{control:`boolean`,description:`Add a border below the header`,table:{category:`Header`}},headerPadding:{control:{type:`range`,min:0,max:8,step:1},description:`Header padding (0 for full bleed)`,table:{category:`Header`}},contentPadding:{control:{type:`range`,min:0,max:8,step:1},description:`Content padding (0 for edge-to-edge content)`,table:{category:`Content`}},contentIsScrollable:{control:`boolean`,description:`Enable scrollable overflow`,table:{category:`Content`}},showFooter:{control:`boolean`,description:`Show or hide the footer`,table:{category:`Footer`}},footerHasDivider:{control:`boolean`,description:`Add a border above the footer`,table:{category:`Footer`}},footerPadding:{control:{type:`range`,min:0,max:8,step:1},description:`Footer padding (0 for full bleed)`,table:{category:`Footer`}},showStartPanel:{control:`boolean`,description:`Show or hide the start (left) panel`,table:{category:`Start Panel`}},startPanelWidth:{control:{type:`range`,min:100,max:300,step:20},description:`Width of the start panel`,table:{category:`Start Panel`}},startPanelHasDivider:{control:`boolean`,description:`Add a border to the start panel`,table:{category:`Start Panel`}},startPanelIsScrollable:{control:`boolean`,description:`Enable scrollable overflow for start panel`,table:{category:`Start Panel`}},showEndPanel:{control:`boolean`,description:`Show or hide the end (right) panel`,table:{category:`End Panel`}},endPanelWidth:{control:{type:`range`,min:100,max:300,step:20},description:`Width of the end panel`,table:{category:`End Panel`}},endPanelHasDivider:{control:`boolean`,description:`Add a border to the end panel`,table:{category:`End Panel`}},endPanelIsScrollable:{control:`boolean`,description:`Enable scrollable overflow for end panel`,table:{category:`End Panel`}}},render:e=>(0,D.jsx)(`div`,{className:`x1egiwwb x1eiddq6 x1shk3sm`,children:(0,D.jsx)(d,{width:e.cardWidth,height:e.cardHeight,children:(0,D.jsx)(r,{padding:e.layoutPadding,header:e.showHeader?(0,D.jsx)(a,{hasDivider:e.headerHasDivider,padding:e.headerPadding,children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Layout Header`})}):void 0,start:e.showStartPanel?(0,D.jsxs)(s,{width:e.startPanelWidth,hasDivider:e.startPanelHasDivider,isScrollable:e.startPanelIsScrollable,role:`navigation`,children:[(0,D.jsx)(k,{active:!0,children:`Dashboard`}),(0,D.jsx)(k,{children:`Settings`}),(0,D.jsx)(k,{children:`Profile`}),(0,D.jsx)(k,{children:`Help`})]}):void 0,content:(0,D.jsxs)(i,{padding:e.contentPadding,isScrollable:e.contentIsScrollable,children:[(0,D.jsx)(`h4`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`Main Content Area`}),(0,D.jsx)(`br`,{}),(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`This is the main content area. Use the controls panel to toggle headers, footers, side panels, and adjust their properties.`}),(0,D.jsx)(`br`,{}),(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Try setting padding to 0 to see how content can extend to the edges, or toggle "isScrollable" to change overflow behavior.`}),(0,D.jsx)(`br`,{}),(0,D.jsx)(`div`,{className:`xspzpui xur7f20 x1shk3sm xv1l7n4 x9ynric xif65rj`,children:`Placeholder content block`})]}),end:e.showEndPanel?(0,D.jsxs)(s,{width:e.endPanelWidth,hasDivider:e.endPanelHasDivider,isScrollable:e.endPanelIsScrollable,role:`complementary`,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`Details`}),(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Additional information or actions can go in the end panel.`})]}):void 0,footer:e.showFooter?(0,D.jsx)(v,{hasDivider:e.footerHasDivider,padding:e.footerPadding,children:(0,D.jsxs)(h,{gap:2,hAlign:`end`,children:[(0,D.jsx)(c,{label:`Cancel`,variant:`secondary`,children:`Cancel`}),(0,D.jsx)(c,{label:`Save`,variant:`primary`,children:`Save`})]})}):void 0})})})},M={name:`Basic Card Layout`,render:()=>(0,D.jsx)(`div`,{className:`x1egiwwb x1eiddq6 x1shk3sm`,children:(0,D.jsx)(d,{width:400,height:350,children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{hasDivider:!0,children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Card Title`})}),content:(0,D.jsxs)(i,{children:[(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`This is a basic card layout with a header, scrollable content area, and footer. The layout automatically handles padding and spacing between sections.`}),(0,D.jsx)(`br`,{}),(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Try scrolling this content area when it overflows.`})]}),footer:(0,D.jsx)(v,{hasDivider:!0,children:(0,D.jsxs)(h,{gap:2,hAlign:`end`,children:[(0,D.jsx)(c,{label:`Cancel`,variant:`secondary`,children:`Cancel`}),(0,D.jsx)(c,{label:`Save`,variant:`primary`,children:`Save`})]})})})})})},N={name:`Layout with Sidebar`,render:()=>(0,D.jsx)(`div`,{className:`x1egiwwb x1eiddq6 x1shk3sm`,children:(0,D.jsx)(d,{width:700,height:400,children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{hasDivider:!0,children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Settings`})}),start:(0,D.jsxs)(s,{hasDivider:!0,role:`navigation`,children:[(0,D.jsx)(k,{active:!0,children:`General`}),(0,D.jsx)(k,{children:`Account`}),(0,D.jsx)(k,{children:`Privacy`}),(0,D.jsx)(k,{children:`Notifications`}),(0,D.jsx)(k,{children:`Security`})]}),content:(0,D.jsxs)(i,{children:[(0,D.jsx)(`h4`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`General Settings`}),(0,D.jsx)(`br`,{}),(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Configure your general preferences here. The sidebar navigation allows you to switch between different settings sections.`})]}),footer:(0,D.jsx)(v,{hasDivider:!0,children:(0,D.jsxs)(h,{gap:2,hAlign:`end`,children:[(0,D.jsx)(c,{label:`Reset`,variant:`secondary`,children:`Reset`}),(0,D.jsx)(c,{label:`Save Changes`,variant:`primary`,children:`Save Changes`})]})})})})})},P={name:`Dual Panel Layout`,render:()=>(0,D.jsx)(`div`,{className:`x1eiddq6 x1shk3sm x1jn0hjm`,children:(0,D.jsx)(d,{width:`100%`,maxWidth:800,height:400,children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{hasDivider:!0,children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`File Browser`})}),start:(0,D.jsxs)(s,{hasDivider:!0,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`Folders`}),(0,D.jsx)(k,{children:`Documents`}),(0,D.jsx)(k,{active:!0,children:`Projects`}),(0,D.jsx)(k,{children:`Downloads`})]}),content:(0,D.jsxs)(i,{children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`Files`}),(0,D.jsx)(`div`,{className:`xspzpui xur7f20 x1shk3sm xv1l7n4 x9ynric xif65rj`,children:`Select a folder to view its contents`})]}),end:(0,D.jsxs)(s,{hasDivider:!0,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`Details`}),(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Select a file to view details`})]})})})})},F={name:`Without Dividers`,render:()=>(0,D.jsx)(`div`,{className:`x1egiwwb x1eiddq6 x1shk3sm`,children:(0,D.jsx)(d,{width:400,height:350,children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Seamless Layout`})}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`When dividers are not used, the layout automatically collapses spacing between sections for a smooth visual flow.`})}),footer:(0,D.jsx)(v,{children:(0,D.jsx)(h,{gap:2,hAlign:`end`,children:(0,D.jsx)(c,{label:`Continue`,variant:`primary`,children:`Continue`})})})})})})},I={name:`Full Bleed Content`,render:()=>(0,D.jsx)(`div`,{className:`x1egiwwb x1eiddq6 x1shk3sm`,children:(0,D.jsx)(d,{width:400,height:350,children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{hasDivider:!0,children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Full Bleed Example`})}),content:(0,D.jsx)(i,{padding:0,children:(0,D.jsx)(`div`,{className:`xspzpui x1shk3sm xv1l7n4 x9ynric xif65rj x11md1zd`,children:`This content uses padding=0 to remove padding, allowing it to touch the edges. Useful for tables, images, or other edge-to-edge content.`})}),footer:(0,D.jsx)(v,{hasDivider:!0,children:(0,D.jsx)(h,{gap:2,hAlign:`end`,children:(0,D.jsx)(c,{label:`Close`,variant:`secondary`,children:`Close`})})})})})})},L={name:`Section Variants`,render:()=>(0,D.jsxs)(m,{gap:6,xstyle:O.storySection,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`Section Variants`}),(0,D.jsxs)(h,{gap:4,wrap:`wrap`,children:[(0,D.jsx)(g,{variant:`section`,width:300,height:250,children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{hasDivider:!0,children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`Section`})}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Surface background color`})})})}),(0,D.jsx)(g,{variant:`muted`,width:300,height:250,children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{hasDivider:!0,children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`Wash`})}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Wash background color`})})})}),(0,D.jsx)(g,{variant:`transparent`,width:300,height:250,children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{hasDivider:!0,children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`Transparent`})}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`No background, shows parent`})})})})]})]})},R={name:`Content Only`,render:()=>(0,D.jsx)(`div`,{className:`x1egiwwb x1eiddq6 x1shk3sm`,children:(0,D.jsx)(d,{width:400,height:350,children:(0,D.jsx)(r,{content:(0,D.jsxs)(i,{children:[(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Simple Content`}),(0,D.jsx)(`br`,{}),(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`A layout can have just content without header or footer. This is useful for simple cards or content blocks.`})]})})})})},z={name:`Themed Layout (Neutral vs Stone)`,render:()=>(0,D.jsxs)(h,{gap:6,xstyle:O.storySection,children:[(0,D.jsxs)(m,{gap:3,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`Stone Theme`}),(0,D.jsx)(p,{theme:w,children:(0,D.jsx)(d,{width:400,children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{hasDivider:!0,children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Stone Theme`})}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`This card uses the stone theme around the layout areas.`})}),footer:(0,D.jsx)(v,{hasDivider:!0,children:(0,D.jsxs)(h,{gap:2,hAlign:`end`,children:[(0,D.jsx)(c,{label:`Cancel`,variant:`secondary`,children:`Cancel`}),(0,D.jsx)(c,{label:`Save`,variant:`primary`,children:`Save`})]})})})})})]}),(0,D.jsxs)(m,{gap:3,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`Neutral Theme`}),(0,D.jsx)(p,{theme:C,children:(0,D.jsx)(d,{width:400,children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{hasDivider:!0,children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Neutral Theme`})}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`This card uses the neutral theme around the layout areas.`})}),footer:(0,D.jsx)(v,{hasDivider:!0,children:(0,D.jsxs)(h,{gap:2,hAlign:`end`,children:[(0,D.jsx)(c,{label:`Cancel`,variant:`secondary`,children:`Cancel`}),(0,D.jsx)(c,{label:`Save`,variant:`primary`,children:`Save`})]})})})})})]})]})},B={name:`Outer Padding Demonstration`,render:()=>(0,D.jsxs)(m,{gap:6,xstyle:O.storySection,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`Outer Padding`}),(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Outer padding creates space between the container edge and the layout content. Notice how the dividers are inset from the container edges as outer padding increases.`}),(0,D.jsxs)(h,{gap:4,wrap:`wrap`,children:[(0,D.jsxs)(m,{gap:2,children:[(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`paddingOuterX/Y = spacing0`}),(0,D.jsx)(`div`,{...n(...u({paddingOuterX:`spacing0`,paddingOuterY:`spacing0`}),O.demoContainer,O.demoSize),children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{hasDivider:!0,children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`Header`})}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Dividers touch container edges.`})}),footer:(0,D.jsx)(v,{hasDivider:!0,children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Footer`})})})})]}),(0,D.jsxs)(m,{gap:2,children:[(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`paddingOuterX/Y = spacing4`}),(0,D.jsx)(`div`,{...n(...u({paddingOuterX:`spacing4`,paddingOuterY:`spacing4`}),O.demoContainer,O.demoSize),children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{hasDivider:!0,children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`Header`})}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`16px inset from edges.`})}),footer:(0,D.jsx)(v,{hasDivider:!0,children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Footer`})})})})]}),(0,D.jsxs)(m,{gap:2,children:[(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`paddingOuterX/Y = spacing7`}),(0,D.jsx)(`div`,{...n(...u({paddingOuterX:`spacing7`,paddingOuterY:`spacing7`}),O.demoContainer,O.demoSize),children:(0,D.jsx)(r,{header:(0,D.jsx)(a,{hasDivider:!0,children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`Header`})}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`48px inset from edges.`})}),footer:(0,D.jsx)(v,{hasDivider:!0,children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Footer`})})})})]})]})]})},V={name:`Content Width — Dividers, No Panels`,render:()=>(0,D.jsxs)(m,{gap:4,xstyle:O.storySection,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`contentWidth=640 in a 900px container; dividers remain full-bleed while content is constrained`}),(0,D.jsx)(`div`,{className:`x1dllhtq x14i3s5s x1hviunn xb3r6kr x1sii68`,children:(0,D.jsx)(r,{contentWidth:640,defaultHasDividers:!0,header:(0,D.jsxs)(a,{children:[(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Header`}),(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Header content is constrained to 640px`})]}),content:(0,D.jsxs)(i,{children:[(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Main content is constrained to 640px and centered. The dividers above and below span the full width of the container.`}),(0,D.jsx)(`br`,{}),(0,D.jsx)(`div`,{className:`xspzpui xur7f20 x1shk3sm xv1l7n4 x9ynric xif65rj`,children:`Placeholder content block`})]}),footer:(0,D.jsx)(v,{children:(0,D.jsxs)(h,{gap:2,hAlign:`end`,children:[(0,D.jsx)(c,{label:`Cancel`,variant:`secondary`,children:`Cancel`}),(0,D.jsx)(c,{label:`Save`,variant:`primary`,children:`Save`})]})})})})]})},H={name:`Content Width — Start Panel`,render:()=>(0,D.jsxs)(m,{gap:4,xstyle:O.storySection,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`contentWidth=640 with a 200px start panel: the middle row (panel + content) is constrained`}),(0,D.jsx)(`div`,{className:`x1dllhtq x14i3s5s x1hviunn xb3r6kr x1sii68`,children:(0,D.jsx)(r,{contentWidth:640,defaultHasDividers:!0,header:(0,D.jsx)(a,{children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Settings`})}),start:(0,D.jsxs)(s,{width:200,hasDivider:!0,role:`navigation`,children:[(0,D.jsx)(k,{active:!0,children:`General`}),(0,D.jsx)(k,{children:`Account`}),(0,D.jsx)(k,{children:`Privacy`}),(0,D.jsx)(k,{children:`Notifications`})]}),content:(0,D.jsxs)(i,{children:[(0,D.jsx)(`h4`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`General Settings`}),(0,D.jsx)(`br`,{}),(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`The start panel and content area together are constrained to 640px and centered within the container.`})]}),footer:(0,D.jsx)(v,{children:(0,D.jsx)(h,{gap:2,hAlign:`end`,children:(0,D.jsx)(c,{label:`Save Changes`,variant:`primary`,children:`Save Changes`})})})})})]})},U={name:`Content Width — Both Panels`,render:()=>(0,D.jsxs)(m,{gap:4,xstyle:O.storySection,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`contentWidth=800 with start=200 and end=200 panels in a 1200px container`}),(0,D.jsx)(`div`,{className:`x1dllhtq x14i3s5s x1hviunn xb3r6kr x1y43apy`,children:(0,D.jsx)(r,{contentWidth:800,defaultHasDividers:!0,header:(0,D.jsx)(a,{children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`File Browser`})}),start:(0,D.jsxs)(s,{width:200,hasDivider:!0,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`Folders`}),(0,D.jsx)(k,{children:`Documents`}),(0,D.jsx)(k,{active:!0,children:`Projects`}),(0,D.jsx)(k,{children:`Downloads`})]}),content:(0,D.jsxs)(i,{children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`Files`}),(0,D.jsx)(`div`,{className:`xspzpui xur7f20 x1shk3sm xv1l7n4 x9ynric xif65rj`,children:`Select a folder to view its contents`})]}),end:(0,D.jsxs)(s,{width:200,hasDivider:!0,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`Details`}),(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Select a file to view details`})]}),footer:(0,D.jsx)(v,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`3 items`})})})})]})},W={name:`Content Width — No Dividers`,render:()=>(0,D.jsxs)(m,{gap:4,xstyle:O.storySection,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`contentWidth=640 without dividers: constraint works the same`}),(0,D.jsx)(`div`,{className:`x1dllhtq x14i3s5s x1hviunn xb3r6kr x1sii68`,children:(0,D.jsx)(r,{contentWidth:640,header:(0,D.jsx)(a,{children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Seamless Layout`})}),content:(0,D.jsxs)(i,{children:[(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Even without dividers, the content is constrained to 640px and centered. The visual flow is continuous with no divider lines.`}),(0,D.jsx)(`br`,{}),(0,D.jsx)(`div`,{className:`xspzpui xur7f20 x1shk3sm xv1l7n4 x9ynric xif65rj`,children:`Placeholder content block`})]}),footer:(0,D.jsx)(v,{children:(0,D.jsx)(h,{gap:2,hAlign:`end`,children:(0,D.jsx)(c,{label:`Continue`,variant:`primary`,children:`Continue`})})})})})]})},G={name:`Content Width — Narrower Than Container`,render:()=>(0,D.jsxs)(m,{gap:4,xstyle:O.storySection,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`contentWidth=400 in a 900px container: content is visibly centered`}),(0,D.jsx)(`div`,{className:`x1dllhtq x14i3s5s x1hviunn xb3r6kr x1sii68`,children:(0,D.jsx)(r,{contentWidth:400,defaultHasDividers:!0,header:(0,D.jsx)(a,{children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Narrow Content`})}),content:(0,D.jsxs)(i,{children:[(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`This content is constrained to 400px inside a 900px container. Notice the visible centering, great for focused forms or settings pages.`}),(0,D.jsx)(`br`,{}),(0,D.jsx)(`div`,{className:`xspzpui xur7f20 x1shk3sm xv1l7n4 x9ynric xif65rj`,children:`Narrow placeholder block`})]}),footer:(0,D.jsx)(v,{children:(0,D.jsx)(h,{gap:2,hAlign:`end`,children:(0,D.jsx)(c,{label:`Submit`,variant:`primary`,children:`Submit`})})})})})]})},K={name:`Content Width — Wider Than Container`,render:()=>(0,D.jsxs)(m,{gap:4,xstyle:O.storySection,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`contentWidth=2000 in a 350px container, degrades gracefully to 100%`}),(0,D.jsx)(`div`,{className:`x1dllhtq x14i3s5s x1hviunn xb3r6kr xxsgkw5`,children:(0,D.jsx)(r,{contentWidth:2e3,defaultHasDividers:!0,header:(0,D.jsx)(a,{children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Overflow`})}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`The contentWidth is 2000px but the container is only 350px. The content fills 100% of the available space, with no overflow or scrollbar.`})}),footer:(0,D.jsx)(v,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Footer`})})})})]})},q={name:`Content Width — Responsive Panels`,render:()=>(0,D.jsxs)(m,{gap:6,xstyle:O.storySection,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`contentWidth=640 with a start panel at three container widths — 1000px, 640px, and 400px`}),(0,D.jsxs)(h,{gap:4,wrap:`wrap`,children:[(0,D.jsxs)(m,{gap:2,children:[(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`1000px container`}),(0,D.jsx)(`div`,{className:`x1dllhtq x14i3s5s x1hviunn xb3r6kr x1p2m28r`,children:(0,D.jsx)(r,{contentWidth:640,defaultHasDividers:!0,header:(0,D.jsx)(a,{children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Wide`})}),start:(0,D.jsxs)(s,{width:160,hasDivider:!0,role:`navigation`,children:[(0,D.jsx)(k,{active:!0,children:`Dashboard`}),(0,D.jsx)(k,{children:`Settings`})]}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Content is centered with room to spare.`})}),footer:(0,D.jsx)(v,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Footer`})})})})]}),(0,D.jsxs)(m,{gap:2,children:[(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`640px container`}),(0,D.jsx)(`div`,{className:`x1dllhtq x14i3s5s x1hviunn xb3r6kr x11i3ho8`,children:(0,D.jsx)(r,{contentWidth:640,defaultHasDividers:!0,header:(0,D.jsx)(a,{children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Medium`})}),start:(0,D.jsxs)(s,{width:160,hasDivider:!0,role:`navigation`,children:[(0,D.jsx)(k,{active:!0,children:`Dashboard`}),(0,D.jsx)(k,{children:`Settings`})]}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Content fills the available space.`})}),footer:(0,D.jsx)(v,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Footer`})})})})]}),(0,D.jsxs)(m,{gap:2,children:[(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj xk50ysn xv1l7n4`,children:`400px container`}),(0,D.jsx)(`div`,{className:`x1dllhtq x14i3s5s x1hviunn xb3r6kr x1l2rt3b`,children:(0,D.jsx)(r,{contentWidth:640,defaultHasDividers:!0,header:(0,D.jsx)(a,{children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`Narrow`})}),start:(0,D.jsxs)(s,{width:160,hasDivider:!0,role:`navigation`,children:[(0,D.jsx)(k,{active:!0,children:`Dashboard`}),(0,D.jsx)(k,{children:`Settings`})]}),content:(0,D.jsx)(i,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Degrades to 100%.`})}),footer:(0,D.jsx)(v,{children:(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`Footer`})})})})]})]})]})},J={name:`Content Width — Nested in AppShell`,render:()=>(0,D.jsxs)(m,{gap:4,xstyle:O.storySection,children:[(0,D.jsx)(`p`,{className:`xrcdmg7 x9ynric xfifm61 x1s688f xtvhhri x2ujxvm xv1l7n4`,children:`Layout with contentWidth=640 nested inside an AppShell`}),(0,D.jsx)(`div`,{className:`x1dllhtq x14i3s5s x1hviunn xb3r6kr x1sii68`,children:(0,D.jsx)(x,{height:`auto`,children:(0,D.jsx)(r,{contentWidth:640,defaultHasDividers:!0,header:(0,D.jsx)(a,{children:(0,D.jsx)(`h3`,{className:`x1ghz6dp x9ynric xosj86m x1s688f x1tgivj0`,children:`App Shell + Content Width`})}),content:(0,D.jsxs)(i,{children:[(0,D.jsx)(`p`,{className:`x1ghz6dp x9ynric xif65rj x1evy7pa xv1l7n4`,children:`This layout is nested inside an AppShell. The contentWidth constraint applies to the inner layout while the app shell provides the outer structure.`}),(0,D.jsx)(`br`,{}),(0,D.jsx)(`div`,{className:`xspzpui xur7f20 x1shk3sm xv1l7n4 x9ynric xif65rj`,children:`Placeholder content block`})]}),footer:(0,D.jsx)(v,{children:(0,D.jsxs)(h,{gap:2,hAlign:`end`,children:[(0,D.jsx)(c,{label:`Cancel`,variant:`secondary`,children:`Cancel`}),(0,D.jsx)(c,{label:`Save`,variant:`primary`,children:`Save`})]})})})})})]})},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'Playground',
  args: {
    // Card defaults
    cardWidth: 700,
    cardHeight: 400,
    // Layout defaults
    layoutPadding: 4,
    // Header defaults
    showHeader: true,
    headerHasDivider: true,
    headerPadding: 4,
    // Content defaults
    contentPadding: 4,
    contentIsScrollable: true,
    // Footer defaults
    showFooter: true,
    footerHasDivider: true,
    footerPadding: 4,
    // Start panel defaults
    showStartPanel: true,
    startPanelWidth: 160,
    startPanelHasDivider: true,
    startPanelIsScrollable: true,
    // End panel defaults
    showEndPanel: false,
    endPanelWidth: 200,
    endPanelHasDivider: true,
    endPanelIsScrollable: true
  },
  argTypes: {
    // Card controls
    cardWidth: {
      control: {
        type: 'range',
        min: 300,
        max: 1000,
        step: 50
      },
      description: 'Width of the card container',
      table: {
        category: 'Card'
      }
    },
    cardHeight: {
      control: {
        type: 'range',
        min: 200,
        max: 600,
        step: 50
      },
      description: 'Height of the card container',
      table: {
        category: 'Card'
      }
    },
    // Layout controls
    layoutPadding: {
      control: {
        type: 'range',
        min: 0,
        max: 8,
        step: 1
      },
      description: 'Padding at layout outer edges (0 for full bleed)',
      table: {
        category: 'Layout'
      }
    },
    // Header controls
    showHeader: {
      control: 'boolean',
      description: 'Show or hide the header',
      table: {
        category: 'Header'
      }
    },
    headerHasDivider: {
      control: 'boolean',
      description: 'Add a border below the header',
      table: {
        category: 'Header'
      }
    },
    headerPadding: {
      control: {
        type: 'range',
        min: 0,
        max: 8,
        step: 1
      },
      description: 'Header padding (0 for full bleed)',
      table: {
        category: 'Header'
      }
    },
    // Content controls
    contentPadding: {
      control: {
        type: 'range',
        min: 0,
        max: 8,
        step: 1
      },
      description: 'Content padding (0 for edge-to-edge content)',
      table: {
        category: 'Content'
      }
    },
    contentIsScrollable: {
      control: 'boolean',
      description: 'Enable scrollable overflow',
      table: {
        category: 'Content'
      }
    },
    // Footer controls
    showFooter: {
      control: 'boolean',
      description: 'Show or hide the footer',
      table: {
        category: 'Footer'
      }
    },
    footerHasDivider: {
      control: 'boolean',
      description: 'Add a border above the footer',
      table: {
        category: 'Footer'
      }
    },
    footerPadding: {
      control: {
        type: 'range',
        min: 0,
        max: 8,
        step: 1
      },
      description: 'Footer padding (0 for full bleed)',
      table: {
        category: 'Footer'
      }
    },
    // Start panel controls
    showStartPanel: {
      control: 'boolean',
      description: 'Show or hide the start (left) panel',
      table: {
        category: 'Start Panel'
      }
    },
    startPanelWidth: {
      control: {
        type: 'range',
        min: 100,
        max: 300,
        step: 20
      },
      description: 'Width of the start panel',
      table: {
        category: 'Start Panel'
      }
    },
    startPanelHasDivider: {
      control: 'boolean',
      description: 'Add a border to the start panel',
      table: {
        category: 'Start Panel'
      }
    },
    startPanelIsScrollable: {
      control: 'boolean',
      description: 'Enable scrollable overflow for start panel',
      table: {
        category: 'Start Panel'
      }
    },
    // End panel controls
    showEndPanel: {
      control: 'boolean',
      description: 'Show or hide the end (right) panel',
      table: {
        category: 'End Panel'
      }
    },
    endPanelWidth: {
      control: {
        type: 'range',
        min: 100,
        max: 300,
        step: 20
      },
      description: 'Width of the end panel',
      table: {
        category: 'End Panel'
      }
    },
    endPanelHasDivider: {
      control: 'boolean',
      description: 'Add a border to the end panel',
      table: {
        category: 'End Panel'
      }
    },
    endPanelIsScrollable: {
      control: 'boolean',
      description: 'Enable scrollable overflow for end panel',
      table: {
        category: 'End Panel'
      }
    }
  },
  render: (args: PlaygroundArgs) => <div {...stylex.props(styles.pageWrapper)}>
      <Card width={args.cardWidth} height={args.cardHeight}>
        <Layout padding={args.layoutPadding} header={args.showHeader ? <LayoutHeader hasDivider={args.headerHasDivider} padding={args.headerPadding}>
                <h3 {...stylex.props(styles.heading)}>Layout Header</h3>
              </LayoutHeader> : undefined} start={args.showStartPanel ? <LayoutPanel width={args.startPanelWidth} hasDivider={args.startPanelHasDivider} isScrollable={args.startPanelIsScrollable} role="navigation">
                <NavItem active>Dashboard</NavItem>
                <NavItem>Settings</NavItem>
                <NavItem>Profile</NavItem>
                <NavItem>Help</NavItem>
              </LayoutPanel> : undefined} content={<LayoutContent padding={args.contentPadding} isScrollable={args.contentIsScrollable}>
              <h4 {...stylex.props(styles.subheading)}>Main Content Area</h4>
              <br />
              <p {...stylex.props(styles.bodyText)}>
                This is the main content area. Use the controls panel to toggle
                headers, footers, side panels, and adjust their properties.
              </p>
              <br />
              <p {...stylex.props(styles.bodyText)}>
                Try setting padding to 0 to see how content can extend to the
                edges, or toggle &quot;isScrollable&quot; to change overflow
                behavior.
              </p>
              <br />
              <div {...stylex.props(styles.placeholder)}>
                Placeholder content block
              </div>
            </LayoutContent>} end={args.showEndPanel ? <LayoutPanel width={args.endPanelWidth} hasDivider={args.endPanelHasDivider} isScrollable={args.endPanelIsScrollable} role="complementary">
                <p {...stylex.props(styles.sectionLabel)}>Details</p>
                <p {...stylex.props(styles.bodyText)}>
                  Additional information or actions can go in the end panel.
                </p>
              </LayoutPanel> : undefined} footer={args.showFooter ? <LayoutFooter hasDivider={args.footerHasDivider} padding={args.footerPadding}>
                <HStack gap={2} hAlign="end">
                  <Button label="Cancel" variant="secondary">
                    Cancel
                  </Button>
                  <Button label="Save" variant="primary">
                    Save
                  </Button>
                </HStack>
              </LayoutFooter> : undefined} />
      </Card>
    </div>
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'Basic Card Layout',
  render: () => <div {...stylex.props(styles.pageWrapper)}>
      <Card width={400} height={350}>
        <Layout header={<LayoutHeader hasDivider>
              <h3 {...stylex.props(styles.heading)}>Card Title</h3>
            </LayoutHeader>} content={<LayoutContent>
              <p {...stylex.props(styles.bodyText)}>
                This is a basic card layout with a header, scrollable content
                area, and footer. The layout automatically handles padding and
                spacing between sections.
              </p>
              <br />
              <p {...stylex.props(styles.bodyText)}>
                Try scrolling this content area when it overflows.
              </p>
            </LayoutContent>} footer={<LayoutFooter hasDivider>
              <HStack gap={2} hAlign="end">
                <Button label="Cancel" variant="secondary">
                  Cancel
                </Button>
                <Button label="Save" variant="primary">
                  Save
                </Button>
              </HStack>
            </LayoutFooter>} />
      </Card>
    </div>
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'Layout with Sidebar',
  render: () => <div {...stylex.props(styles.pageWrapper)}>
      <Card width={700} height={400}>
        <Layout header={<LayoutHeader hasDivider>
              <h3 {...stylex.props(styles.heading)}>Settings</h3>
            </LayoutHeader>} start={<LayoutPanel hasDivider role="navigation">
              <NavItem active>General</NavItem>
              <NavItem>Account</NavItem>
              <NavItem>Privacy</NavItem>
              <NavItem>Notifications</NavItem>
              <NavItem>Security</NavItem>
            </LayoutPanel>} content={<LayoutContent>
              <h4 {...stylex.props(styles.subheading)}>General Settings</h4>
              <br />
              <p {...stylex.props(styles.bodyText)}>
                Configure your general preferences here. The sidebar navigation
                allows you to switch between different settings sections.
              </p>
            </LayoutContent>} footer={<LayoutFooter hasDivider>
              <HStack gap={2} hAlign="end">
                <Button label="Reset" variant="secondary">
                  Reset
                </Button>
                <Button label="Save Changes" variant="primary">
                  Save Changes
                </Button>
              </HStack>
            </LayoutFooter>} />
      </Card>
    </div>
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'Dual Panel Layout',
  render: () => <div {...stylex.props(styles.pageWrapper, styles.pageWrapperTall)}>
      <Card width="100%" maxWidth={800} height={400}>
        <Layout header={<LayoutHeader hasDivider>
              <h3 {...stylex.props(styles.heading)}>File Browser</h3>
            </LayoutHeader>} start={<LayoutPanel hasDivider>
              <p {...stylex.props(styles.sectionLabel)}>Folders</p>
              <NavItem>Documents</NavItem>
              <NavItem active>Projects</NavItem>
              <NavItem>Downloads</NavItem>
            </LayoutPanel>} content={<LayoutContent>
              <p {...stylex.props(styles.sectionLabel)}>Files</p>
              <div {...stylex.props(styles.placeholder)}>
                Select a folder to view its contents
              </div>
            </LayoutContent>} end={<LayoutPanel hasDivider>
              <p {...stylex.props(styles.sectionLabel)}>Details</p>
              <p {...stylex.props(styles.bodyText)}>
                Select a file to view details
              </p>
            </LayoutPanel>} />
      </Card>
    </div>
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'Without Dividers',
  render: () => <div {...stylex.props(styles.pageWrapper)}>
      <Card width={400} height={350}>
        <Layout header={<LayoutHeader>
              <h3 {...stylex.props(styles.heading)}>Seamless Layout</h3>
            </LayoutHeader>} content={<LayoutContent>
              <p {...stylex.props(styles.bodyText)}>
                When dividers are not used, the layout automatically collapses
                spacing between sections for a smooth visual flow.
              </p>
            </LayoutContent>} footer={<LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button label="Continue" variant="primary">
                  Continue
                </Button>
              </HStack>
            </LayoutFooter>} />
      </Card>
    </div>
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'Full Bleed Content',
  render: () => <div {...stylex.props(styles.pageWrapper)}>
      <Card width={400} height={350}>
        <Layout header={<LayoutHeader hasDivider>
              <h3 {...stylex.props(styles.heading)}>Full Bleed Example</h3>
            </LayoutHeader>} content={<LayoutContent padding={0}>
              <div {...stylex.props(styles.placeholderFullBleed)}>
                This content uses padding=0 to remove padding, allowing it to
                touch the edges. Useful for tables, images, or other
                edge-to-edge content.
              </div>
            </LayoutContent>} footer={<LayoutFooter hasDivider>
              <HStack gap={2} hAlign="end">
                <Button label="Close" variant="secondary">
                  Close
                </Button>
              </HStack>
            </LayoutFooter>} />
      </Card>
    </div>
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'Section Variants',
  render: () => <VStack gap={6} xstyle={styles.storySection}>
      <p {...stylex.props(styles.sectionLabel)}>Section Variants</p>
      <HStack gap={4} wrap="wrap">
        <Section variant="section" width={300} height={250}>
          <Layout header={<LayoutHeader hasDivider>
                <p {...stylex.props(styles.subheading)}>Section</p>
              </LayoutHeader>} content={<LayoutContent>
                <p {...stylex.props(styles.bodyText)}>
                  Surface background color
                </p>
              </LayoutContent>} />
        </Section>

        <Section variant="muted" width={300} height={250}>
          <Layout header={<LayoutHeader hasDivider>
                <p {...stylex.props(styles.subheading)}>Wash</p>
              </LayoutHeader>} content={<LayoutContent>
                <p {...stylex.props(styles.bodyText)}>Wash background color</p>
              </LayoutContent>} />
        </Section>

        <Section variant="transparent" width={300} height={250}>
          <Layout header={<LayoutHeader hasDivider>
                <p {...stylex.props(styles.subheading)}>Transparent</p>
              </LayoutHeader>} content={<LayoutContent>
                <p {...stylex.props(styles.bodyText)}>
                  No background, shows parent
                </p>
              </LayoutContent>} />
        </Section>
      </HStack>
    </VStack>
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  name: 'Content Only',
  render: () => <div {...stylex.props(styles.pageWrapper)}>
      <Card width={400} height={350}>
        <Layout content={<LayoutContent>
              <h3 {...stylex.props(styles.heading)}>Simple Content</h3>
              <br />
              <p {...stylex.props(styles.bodyText)}>
                A layout can have just content without header or footer. This is
                useful for simple cards or content blocks.
              </p>
            </LayoutContent>} />
      </Card>
    </div>
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: 'Themed Layout (Neutral vs Stone)',
  render: () => <HStack gap={6} xstyle={styles.storySection}>
      <VStack gap={3}>
        <p {...stylex.props(styles.sectionLabel)}>
          Stone Theme
        </p>
        <Theme theme={stoneTheme}>
          <Card width={400}>
            <Layout header={<LayoutHeader hasDivider>
                  <h3 {...stylex.props(styles.heading)}>Stone Theme</h3>
                </LayoutHeader>} content={<LayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    This card uses the stone theme around the layout areas.
                  </p>
                </LayoutContent>} footer={<LayoutFooter hasDivider>
                  <HStack gap={2} hAlign="end">
                    <Button label="Cancel" variant="secondary">
                      Cancel
                    </Button>
                    <Button label="Save" variant="primary">
                      Save
                    </Button>
                  </HStack>
                </LayoutFooter>} />
          </Card>
        </Theme>
      </VStack>

      <VStack gap={3}>
        <p {...stylex.props(styles.sectionLabel)}>
          Neutral Theme
        </p>
        <Theme theme={neutralTheme}>
          <Card width={400}>
            <Layout header={<LayoutHeader hasDivider>
                  <h3 {...stylex.props(styles.heading)}>Neutral Theme</h3>
                </LayoutHeader>} content={<LayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    This card uses the neutral theme around the layout areas.
                  </p>
                </LayoutContent>} footer={<LayoutFooter hasDivider>
                  <HStack gap={2} hAlign="end">
                    <Button label="Cancel" variant="secondary">
                      Cancel
                    </Button>
                    <Button label="Save" variant="primary">
                      Save
                    </Button>
                  </HStack>
                </LayoutFooter>} />
          </Card>
        </Theme>
      </VStack>
    </HStack>
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: 'Outer Padding Demonstration',
  render: () => <VStack gap={6} xstyle={styles.storySection}>
      <p {...stylex.props(styles.sectionLabel)}>Outer Padding</p>
      <p {...stylex.props(styles.bodyText)}>
        Outer padding creates space between the container edge and the layout
        content. Notice how the dividers are inset from the container edges as
        outer padding increases.
      </p>
      <HStack gap={4} wrap="wrap">
        <VStack gap={2}>
          <p {...stylex.props(styles.subheading)}>paddingOuterX/Y = spacing0</p>
          <div {...stylex.props(...container({
          paddingOuterX: 'spacing0',
          paddingOuterY: 'spacing0'
        }), styles.demoContainer, styles.demoSize)}>
            <Layout header={<LayoutHeader hasDivider>
                  <p {...stylex.props(styles.subheading)}>Header</p>
                </LayoutHeader>} content={<LayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    Dividers touch container edges.
                  </p>
                </LayoutContent>} footer={<LayoutFooter hasDivider>
                  <p {...stylex.props(styles.bodyText)}>Footer</p>
                </LayoutFooter>} />
          </div>
        </VStack>

        <VStack gap={2}>
          <p {...stylex.props(styles.subheading)}>paddingOuterX/Y = spacing4</p>
          <div {...stylex.props(...container({
          paddingOuterX: 'spacing4',
          paddingOuterY: 'spacing4'
        }), styles.demoContainer, styles.demoSize)}>
            <Layout header={<LayoutHeader hasDivider>
                  <p {...stylex.props(styles.subheading)}>Header</p>
                </LayoutHeader>} content={<LayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    16px inset from edges.
                  </p>
                </LayoutContent>} footer={<LayoutFooter hasDivider>
                  <p {...stylex.props(styles.bodyText)}>Footer</p>
                </LayoutFooter>} />
          </div>
        </VStack>

        <VStack gap={2}>
          <p {...stylex.props(styles.subheading)}>paddingOuterX/Y = spacing7</p>
          <div {...stylex.props(...container({
          paddingOuterX: 'spacing7',
          paddingOuterY: 'spacing7'
        }), styles.demoContainer, styles.demoSize)}>
            <Layout header={<LayoutHeader hasDivider>
                  <p {...stylex.props(styles.subheading)}>Header</p>
                </LayoutHeader>} content={<LayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    48px inset from edges.
                  </p>
                </LayoutContent>} footer={<LayoutFooter hasDivider>
                  <p {...stylex.props(styles.bodyText)}>Footer</p>
                </LayoutFooter>} />
          </div>
        </VStack>
      </HStack>
    </VStack>
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: 'Content Width — Dividers, No Panels',
  render: () => <VStack gap={4} xstyle={styles.storySection}>
      <p {...stylex.props(styles.sectionLabel)}>
        contentWidth=640 in a 900px container; dividers remain full-bleed while
        content is constrained
      </p>
      <div {...stylex.props(styles.cwContainer, styles.cwContainer900)}>
        <Layout contentWidth={640} defaultHasDividers header={<LayoutHeader>
              <h3 {...stylex.props(styles.heading)}>Header</h3>
              <p {...stylex.props(styles.bodyText)}>
                Header content is constrained to 640px
              </p>
            </LayoutHeader>} content={<LayoutContent>
              <p {...stylex.props(styles.bodyText)}>
                Main content is constrained to 640px and centered. The dividers
                above and below span the full width of the container.
              </p>
              <br />
              <div {...stylex.props(styles.placeholder)}>
                Placeholder content block
              </div>
            </LayoutContent>} footer={<LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button label="Cancel" variant="secondary">
                  Cancel
                </Button>
                <Button label="Save" variant="primary">
                  Save
                </Button>
              </HStack>
            </LayoutFooter>} />
      </div>
    </VStack>
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'Content Width — Start Panel',
  render: () => <VStack gap={4} xstyle={styles.storySection}>
      <p {...stylex.props(styles.sectionLabel)}>
        contentWidth=640 with a 200px start panel: the middle row (panel +
        content) is constrained
      </p>
      <div {...stylex.props(styles.cwContainer, styles.cwContainer900)}>
        <Layout contentWidth={640} defaultHasDividers header={<LayoutHeader>
              <h3 {...stylex.props(styles.heading)}>Settings</h3>
            </LayoutHeader>} start={<LayoutPanel width={200} hasDivider role="navigation">
              <NavItem active>General</NavItem>
              <NavItem>Account</NavItem>
              <NavItem>Privacy</NavItem>
              <NavItem>Notifications</NavItem>
            </LayoutPanel>} content={<LayoutContent>
              <h4 {...stylex.props(styles.subheading)}>General Settings</h4>
              <br />
              <p {...stylex.props(styles.bodyText)}>
                The start panel and content area together are constrained to
                640px and centered within the container.
              </p>
            </LayoutContent>} footer={<LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button label="Save Changes" variant="primary">
                  Save Changes
                </Button>
              </HStack>
            </LayoutFooter>} />
      </div>
    </VStack>
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  name: 'Content Width — Both Panels',
  render: () => <VStack gap={4} xstyle={styles.storySection}>
      <p {...stylex.props(styles.sectionLabel)}>
        contentWidth=800 with start=200 and end=200 panels in a 1200px container
      </p>
      <div {...stylex.props(styles.cwContainer, styles.cwContainer1200)}>
        <Layout contentWidth={800} defaultHasDividers header={<LayoutHeader>
              <h3 {...stylex.props(styles.heading)}>File Browser</h3>
            </LayoutHeader>} start={<LayoutPanel width={200} hasDivider>
              <p {...stylex.props(styles.sectionLabel)}>Folders</p>
              <NavItem>Documents</NavItem>
              <NavItem active>Projects</NavItem>
              <NavItem>Downloads</NavItem>
            </LayoutPanel>} content={<LayoutContent>
              <p {...stylex.props(styles.sectionLabel)}>Files</p>
              <div {...stylex.props(styles.placeholder)}>
                Select a folder to view its contents
              </div>
            </LayoutContent>} end={<LayoutPanel width={200} hasDivider>
              <p {...stylex.props(styles.sectionLabel)}>Details</p>
              <p {...stylex.props(styles.bodyText)}>
                Select a file to view details
              </p>
            </LayoutPanel>} footer={<LayoutFooter>
              <p {...stylex.props(styles.bodyText)}>3 items</p>
            </LayoutFooter>} />
      </div>
    </VStack>
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Content Width — No Dividers',
  render: () => <VStack gap={4} xstyle={styles.storySection}>
      <p {...stylex.props(styles.sectionLabel)}>
        contentWidth=640 without dividers: constraint works the same
      </p>
      <div {...stylex.props(styles.cwContainer, styles.cwContainer900)}>
        <Layout contentWidth={640} header={<LayoutHeader>
              <h3 {...stylex.props(styles.heading)}>Seamless Layout</h3>
            </LayoutHeader>} content={<LayoutContent>
              <p {...stylex.props(styles.bodyText)}>
                Even without dividers, the content is constrained to 640px and
                centered. The visual flow is continuous with no divider lines.
              </p>
              <br />
              <div {...stylex.props(styles.placeholder)}>
                Placeholder content block
              </div>
            </LayoutContent>} footer={<LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button label="Continue" variant="primary">
                  Continue
                </Button>
              </HStack>
            </LayoutFooter>} />
      </div>
    </VStack>
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Content Width — Narrower Than Container',
  render: () => <VStack gap={4} xstyle={styles.storySection}>
      <p {...stylex.props(styles.sectionLabel)}>
        contentWidth=400 in a 900px container: content is visibly centered
      </p>
      <div {...stylex.props(styles.cwContainer, styles.cwContainer900)}>
        <Layout contentWidth={400} defaultHasDividers header={<LayoutHeader>
              <h3 {...stylex.props(styles.heading)}>Narrow Content</h3>
            </LayoutHeader>} content={<LayoutContent>
              <p {...stylex.props(styles.bodyText)}>
                This content is constrained to 400px inside a 900px container.
                Notice the visible centering, great for focused forms or
                settings pages.
              </p>
              <br />
              <div {...stylex.props(styles.placeholder)}>
                Narrow placeholder block
              </div>
            </LayoutContent>} footer={<LayoutFooter>
              <HStack gap={2} hAlign="end">
                <Button label="Submit" variant="primary">
                  Submit
                </Button>
              </HStack>
            </LayoutFooter>} />
      </div>
    </VStack>
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'Content Width — Wider Than Container',
  render: () => <VStack gap={4} xstyle={styles.storySection}>
      <p {...stylex.props(styles.sectionLabel)}>
        contentWidth=2000 in a 350px container, degrades gracefully to 100%
      </p>
      <div {...stylex.props(styles.cwContainer, styles.cwContainer350)}>
        <Layout contentWidth={2000} defaultHasDividers header={<LayoutHeader>
              <h3 {...stylex.props(styles.heading)}>Overflow</h3>
            </LayoutHeader>} content={<LayoutContent>
              <p {...stylex.props(styles.bodyText)}>
                The contentWidth is 2000px but the container is only 350px. The
                content fills 100% of the available space, with no overflow or
                scrollbar.
              </p>
            </LayoutContent>} footer={<LayoutFooter>
              <p {...stylex.props(styles.bodyText)}>Footer</p>
            </LayoutFooter>} />
      </div>
    </VStack>
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'Content Width — Responsive Panels',
  render: () => <VStack gap={6} xstyle={styles.storySection}>
      <p {...stylex.props(styles.sectionLabel)}>
        contentWidth=640 with a start panel at three container widths — 1000px,
        640px, and 400px
      </p>
      <HStack gap={4} wrap="wrap">
        <VStack gap={2}>
          <p {...stylex.props(styles.subheading)}>1000px container</p>
          <div {...stylex.props(styles.cwContainer, styles.cwContainer1000)}>
            <Layout contentWidth={640} defaultHasDividers header={<LayoutHeader>
                  <h3 {...stylex.props(styles.heading)}>Wide</h3>
                </LayoutHeader>} start={<LayoutPanel width={160} hasDivider role="navigation">
                  <NavItem active>Dashboard</NavItem>
                  <NavItem>Settings</NavItem>
                </LayoutPanel>} content={<LayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    Content is centered with room to spare.
                  </p>
                </LayoutContent>} footer={<LayoutFooter>
                  <p {...stylex.props(styles.bodyText)}>Footer</p>
                </LayoutFooter>} />
          </div>
        </VStack>

        <VStack gap={2}>
          <p {...stylex.props(styles.subheading)}>640px container</p>
          <div {...stylex.props(styles.cwContainer, styles.cwContainer640)}>
            <Layout contentWidth={640} defaultHasDividers header={<LayoutHeader>
                  <h3 {...stylex.props(styles.heading)}>Medium</h3>
                </LayoutHeader>} start={<LayoutPanel width={160} hasDivider role="navigation">
                  <NavItem active>Dashboard</NavItem>
                  <NavItem>Settings</NavItem>
                </LayoutPanel>} content={<LayoutContent>
                  <p {...stylex.props(styles.bodyText)}>
                    Content fills the available space.
                  </p>
                </LayoutContent>} footer={<LayoutFooter>
                  <p {...stylex.props(styles.bodyText)}>Footer</p>
                </LayoutFooter>} />
          </div>
        </VStack>

        <VStack gap={2}>
          <p {...stylex.props(styles.subheading)}>400px container</p>
          <div {...stylex.props(styles.cwContainer, styles.cwContainer400)}>
            <Layout contentWidth={640} defaultHasDividers header={<LayoutHeader>
                  <h3 {...stylex.props(styles.heading)}>Narrow</h3>
                </LayoutHeader>} start={<LayoutPanel width={160} hasDivider role="navigation">
                  <NavItem active>Dashboard</NavItem>
                  <NavItem>Settings</NavItem>
                </LayoutPanel>} content={<LayoutContent>
                  <p {...stylex.props(styles.bodyText)}>Degrades to 100%.</p>
                </LayoutContent>} footer={<LayoutFooter>
                  <p {...stylex.props(styles.bodyText)}>Footer</p>
                </LayoutFooter>} />
          </div>
        </VStack>
      </HStack>
    </VStack>
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'Content Width — Nested in AppShell',
  render: () => <VStack gap={4} xstyle={styles.storySection}>
      <p {...stylex.props(styles.sectionLabel)}>
        Layout with contentWidth=640 nested inside an AppShell
      </p>
      <div {...stylex.props(styles.cwContainer, styles.cwContainer900)}>
        <AppShell height="auto">
          <Layout contentWidth={640} defaultHasDividers header={<LayoutHeader>
                <h3 {...stylex.props(styles.heading)}>
                  App Shell + Content Width
                </h3>
              </LayoutHeader>} content={<LayoutContent>
                <p {...stylex.props(styles.bodyText)}>
                  This layout is nested inside an AppShell. The contentWidth
                  constraint applies to the inner layout while the app shell
                  provides the outer structure.
                </p>
                <br />
                <div {...stylex.props(styles.placeholder)}>
                  Placeholder content block
                </div>
              </LayoutContent>} footer={<LayoutFooter>
                <HStack gap={2} hAlign="end">
                  <Button label="Cancel" variant="secondary">
                    Cancel
                  </Button>
                  <Button label="Save" variant="primary">
                    Save
                  </Button>
                </HStack>
              </LayoutFooter>} />
        </AppShell>
      </div>
    </VStack>
}`,...J.parameters?.docs?.source}}},Y=[`Playground`,`BasicCard`,`WithSidebar`,`DualPanels`,`NoDividers`,`FullBleedContent`,`SectionVariants`,`ContentOnly`,`ThemedLayout`,`OuterPaddingDemo`,`ContentWidthWithDividers`,`ContentWidthWithStartPanel`,`ContentWidthWithBothPanels`,`ContentWidthNoDividers`,`ContentWidthNarrower`,`ContentWidthWider`,`ContentWidthResponsive`,`ContentWidthInAppShell`]}))();export{M as BasicCard,R as ContentOnly,J as ContentWidthInAppShell,G as ContentWidthNarrower,W as ContentWidthNoDividers,q as ContentWidthResponsive,K as ContentWidthWider,U as ContentWidthWithBothPanels,V as ContentWidthWithDividers,H as ContentWidthWithStartPanel,P as DualPanels,I as FullBleedContent,F as NoDividers,B as OuterPaddingDemo,j as Playground,L as SectionVariants,z as ThemedLayout,N as WithSidebar,Y as __namedExportsOrder,A as default};