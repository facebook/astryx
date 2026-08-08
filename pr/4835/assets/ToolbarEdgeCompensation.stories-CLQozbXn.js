import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{i as r,n as ee,r as i,t as a}from"./LayoutContent-Bp6k5ngv.js";import{n as te,t as o}from"./Text-BfjtEFtP.js";import{t as ne}from"./jsx-runtime-DeHZSEgm.js";import{n as re,t as s}from"./LayoutHeader-DrI9WNU1.js";import{n as ie,t as c}from"./Button-BVMvoKVE.js";import{n as ae,t as l}from"./Card-270yxekz.js";import{n as oe,t as u}from"./Heading-CaMVckJS.js";import{n as se,t as d}from"./VStack-C2SBQ4Fm.js";import{n as ce,t as f}from"./Section-BQJsZyZZ.js";import{c as le,i as ue,n as de,r as p,s as fe,t as m}from"./FunnelIcon-DTXchJB9.js";import{n as pe,t as h}from"./Toolbar-Cbo7TghG.js";import{n as me,t as g}from"./ArrowLeftIcon-C0R44Sox.js";import{n as he,t as ge}from"./BellIcon-Bd5nOtNP.js";import{n as _e,t as ve}from"./ChevronRightIcon-MviL20By.js";import{n as ye,t as _}from"./Cog6ToothIcon-LKkqufPn.js";import{n as be,t as v}from"./EllipsisHorizontalIcon-CQRvSLJa.js";import{n as xe,t as y}from"./MagnifyingGlassIcon-uXl564nY.js";import{n as Se,t as b}from"./PlusIcon-Cc_L_WFi.js";import{n as Ce,t as x}from"./ShareIcon-CsrH6mRD.js";import{n as we,t as Te}from"./Squares2X2Icon-KnRrXJa4.js";function Ee({title:e,titleId:t,...n},r){return S.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?S.createElement(`title`,{id:t},e):null,S.createElement(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M15.75 19.5 8.25 12l7.5-7.5`}))}var S,C;function w(){return(w=t((()=>{S=e(n()),C=S.forwardRef(Ee)})))()}function T({children:e,label:t}){return(0,O.jsxs)(`div`,{children:[(0,O.jsx)(`div`,{style:{marginBottom:8,fontSize:12,color:`#666`},children:t}),e]})}function E({lines:e=3}){return(0,O.jsx)(d,{gap:2,children:Array.from({length:e},(e,t)=>(0,O.jsx)(o,{type:`body`,children:t===0?`Body content should align with the toolbar text or button labels above.`:`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.`},t))})}var D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$;function De(){return(De=t((()=>{D=n(),pe(),ie(),ae(),ce(),te(),oe(),le(),ue(),r(),re(),ee(),se(),ye(),de(),Se(),me(),w(),_e(),Ce(),be(),xe(),he(),we(),O=ne(),k={title:`Core/ToolbarEdgeCompensation`,component:h,parameters:{layout:`padded`}},A={name:`Ghost buttons: start + end`,render:()=>(0,O.jsx)(d,{gap:4,children:[`sm`,`md`,`lg`].map(e=>(0,O.jsx)(T,{label:`size="${e}"`,children:(0,O.jsxs)(l,{width:600,children:[(0,O.jsx)(h,{label:`Ghost buttons ${e}`,size:e,dividers:[`bottom`],startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(g,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`Edit`,variant:`ghost`}),(0,O.jsx)(c,{label:`Share`,variant:`ghost`})]}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Filter`,variant:`ghost`,icon:(0,O.jsx)(m,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`Settings`,variant:`ghost`,icon:(0,O.jsx)(_,{}),isIconOnly:!0})]})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{})})]})},e))})},j={name:`Solid buttons: start + end`,render:()=>(0,O.jsx)(d,{gap:4,children:[`sm`,`md`,`lg`].map(e=>(0,O.jsx)(T,{label:`size="${e}"`,children:(0,O.jsxs)(l,{width:600,children:[(0,O.jsx)(h,{label:`Solid buttons ${e}`,size:e,dividers:[`bottom`],startContent:(0,O.jsx)(c,{label:`New item`,icon:(0,O.jsx)(b,{})}),endContent:(0,O.jsx)(c,{label:`Save`})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{})})]})},e))})},M={name:`Mixed: ghost start, solid end`,render:()=>(0,O.jsx)(d,{gap:4,children:[`sm`,`md`,`lg`].map(e=>(0,O.jsx)(T,{label:`size="${e}"`,children:(0,O.jsxs)(l,{width:600,children:[(0,O.jsx)(h,{label:`Mixed ${e}`,size:e,dividers:[`bottom`],startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(g,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`Edit`,variant:`ghost`})]}),endContent:(0,O.jsx)(c,{label:`Save`})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{})})]})},e))})},N={name:`Mixed: solid start, ghost end`,render:()=>(0,O.jsx)(d,{gap:4,children:[`sm`,`md`,`lg`].map(e=>(0,O.jsx)(T,{label:`size="${e}"`,children:(0,O.jsxs)(l,{width:600,children:[(0,O.jsx)(h,{label:`Mixed ${e}`,size:e,dividers:[`bottom`],startContent:(0,O.jsx)(c,{label:`New item`,icon:(0,O.jsx)(b,{})}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Filter`,variant:`ghost`,icon:(0,O.jsx)(m,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`More`,variant:`ghost`,icon:(0,O.jsx)(v,{}),isIconOnly:!0})]})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{})})]})},e))})},P={name:`Heading start + ghost end`,render:()=>(0,O.jsx)(d,{gap:4,children:[`sm`,`md`,`lg`].map(e=>(0,O.jsx)(T,{label:`size="${e}"`,children:(0,O.jsxs)(l,{width:600,children:[(0,O.jsx)(h,{label:`Heading ${e}`,size:e,dividers:[`bottom`],startContent:(0,O.jsx)(u,{level:4,children:`Section Title`}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Filter`,variant:`ghost`,icon:(0,O.jsx)(m,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`Add`,variant:`ghost`,icon:(0,O.jsx)(b,{}),isIconOnly:!0})]})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{})})]})},e))})},F={name:`Text start + ghost end`,render:()=>(0,O.jsxs)(l,{width:600,children:[(0,O.jsx)(h,{label:`Text start`,dividers:[`bottom`],startContent:(0,O.jsx)(o,{type:`body`,weight:`bold`,children:`3 items selected`}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Delete`,variant:`ghost`}),(0,O.jsx)(c,{label:`Archive`,variant:`ghost`})]})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{})})]})},I={name:`Heading start + solid end`,render:()=>(0,O.jsxs)(l,{width:600,children:[(0,O.jsx)(h,{label:`Heading solid`,dividers:[`bottom`],startContent:(0,O.jsx)(u,{level:4,children:`Project Settings`}),endContent:(0,O.jsx)(c,{label:`Save changes`})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{})})]})},L={name:`Layout: no contentWidth, ghost buttons`,render:()=>(0,O.jsx)(`div`,{style:{height:400,border:`1px solid #e0e0e0`,borderRadius:8},children:(0,O.jsx)(i,{header:(0,O.jsx)(s,{hasDivider:!0,padding:0,children:(0,O.jsx)(h,{label:`App header`,startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Menu`,variant:`ghost`,icon:(0,O.jsx)(Te,{}),isIconOnly:!0}),(0,O.jsx)(u,{level:4,children:`Dashboard`})]}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Search`,variant:`ghost`,icon:(0,O.jsx)(y,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`Notifications`,variant:`ghost`,icon:(0,O.jsx)(ge,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`Settings`,variant:`ghost`,icon:(0,O.jsx)(_,{}),isIconOnly:!0})]})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:6})})})})},R={name:`Layout: no contentWidth, solid buttons`,render:()=>(0,O.jsx)(`div`,{style:{height:400,border:`1px solid #e0e0e0`,borderRadius:8},children:(0,O.jsx)(i,{header:(0,O.jsx)(s,{hasDivider:!0,padding:0,children:(0,O.jsx)(h,{label:`App header`,startContent:(0,O.jsx)(u,{level:4,children:`Dashboard`}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Cancel`,variant:`secondary`}),(0,O.jsx)(c,{label:`Save`})]})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:6})})})})},z={name:`Layout: contentWidth=640, ghost buttons`,render:()=>(0,O.jsx)(`div`,{style:{height:400,border:`1px solid #e0e0e0`,borderRadius:8},children:(0,O.jsx)(i,{contentWidth:640,header:(0,O.jsx)(s,{hasDivider:!0,padding:0,children:(0,O.jsx)(h,{label:`Page header`,startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(g,{}),isIconOnly:!0}),(0,O.jsx)(u,{level:4,children:`Settings`})]}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Search`,variant:`ghost`,icon:(0,O.jsx)(y,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`More`,variant:`ghost`,icon:(0,O.jsx)(v,{}),isIconOnly:!0})]})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:6})})})})},B={name:`Layout: contentWidth=640, solid buttons`,render:()=>(0,O.jsx)(`div`,{style:{height:400,border:`1px solid #e0e0e0`,borderRadius:8},children:(0,O.jsx)(i,{contentWidth:640,header:(0,O.jsx)(s,{hasDivider:!0,padding:0,children:(0,O.jsx)(h,{label:`Page header`,startContent:(0,O.jsx)(u,{level:4,children:`Settings`}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Cancel`,variant:`secondary`}),(0,O.jsx)(c,{label:`Save`})]})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:6})})})})},V={name:`Layout: contentWidth=640, mixed`,render:()=>(0,O.jsx)(`div`,{style:{height:400,border:`1px solid #e0e0e0`,borderRadius:8},children:(0,O.jsx)(i,{contentWidth:640,header:(0,O.jsx)(s,{hasDivider:!0,padding:0,children:(0,O.jsx)(h,{label:`Page header`,startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(g,{}),isIconOnly:!0}),(0,O.jsx)(u,{level:4,children:`Edit Project`})]}),endContent:(0,O.jsx)(c,{label:`Save changes`})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:6})})})})},H={name:`Layout: contentWidth=960, ghost buttons`,render:()=>(0,O.jsx)(`div`,{style:{height:400,border:`1px solid #e0e0e0`,borderRadius:8},children:(0,O.jsx)(i,{contentWidth:960,header:(0,O.jsx)(s,{hasDivider:!0,padding:0,children:(0,O.jsx)(h,{label:`Dashboard header`,startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(C,{}),isIconOnly:!0}),(0,O.jsx)(u,{level:4,children:`Analytics Dashboard`})]}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Share`,variant:`ghost`,icon:(0,O.jsx)(x,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`Settings`,variant:`ghost`,icon:(0,O.jsx)(_,{}),isIconOnly:!0})]})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:6})})})})},U={name:`Layout: padding=4, ghost buttons`,render:()=>(0,O.jsx)(`div`,{style:{height:400,border:`1px solid #e0e0e0`,borderRadius:8},children:(0,O.jsx)(i,{padding:4,header:(0,O.jsx)(s,{hasDivider:!0,padding:0,children:(0,O.jsx)(h,{label:`Padded layout header`,startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(g,{}),isIconOnly:!0}),(0,O.jsx)(u,{level:4,children:`Padded Layout`})]}),endContent:(0,O.jsx)(c,{label:`Settings`,variant:`ghost`,icon:(0,O.jsx)(_,{}),isIconOnly:!0})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:6})})})})},W={name:`Layout: padding=4 + contentWidth=640`,render:()=>(0,O.jsx)(`div`,{style:{height:400,border:`1px solid #e0e0e0`,borderRadius:8},children:(0,O.jsx)(i,{padding:4,contentWidth:640,header:(0,O.jsx)(s,{hasDivider:!0,padding:0,children:(0,O.jsx)(h,{label:`Padded constrained header`,startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(g,{}),isIconOnly:!0}),(0,O.jsx)(u,{level:4,children:`Constrained + Padded`})]}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Share`,variant:`ghost`,icon:(0,O.jsx)(x,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`Settings`,variant:`ghost`,icon:(0,O.jsx)(_,{}),isIconOnly:!0})]})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:6})})})})},G={name:`Layout: header default padding + toolbar`,render:()=>(0,O.jsx)(`div`,{style:{height:400,border:`1px solid #e0e0e0`,borderRadius:8},children:(0,O.jsx)(i,{header:(0,O.jsx)(s,{hasDivider:!0,children:(0,O.jsx)(h,{label:`Double padded?`,startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(g,{}),isIconOnly:!0}),(0,O.jsx)(u,{level:4,children:`Double Padding Check`})]}),endContent:(0,O.jsx)(c,{label:`Settings`,variant:`ghost`,icon:(0,O.jsx)(_,{}),isIconOnly:!0})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:4})})})})},K={name:`Comparison: ghost vs solid alignment`,render:()=>(0,O.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:24},children:[(0,O.jsx)(T,{label:`Ghost buttons (should align flush)`,children:(0,O.jsxs)(l,{children:[(0,O.jsx)(h,{label:`Ghost`,dividers:[`bottom`],startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(g,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`Edit`,variant:`ghost`})]}),endContent:(0,O.jsx)(c,{label:`More`,variant:`ghost`,icon:(0,O.jsx)(v,{}),isIconOnly:!0})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{})})]})}),(0,O.jsx)(T,{label:`Solid buttons (natural padding)`,children:(0,O.jsxs)(l,{children:[(0,O.jsx)(h,{label:`Solid`,dividers:[`bottom`],startContent:(0,O.jsx)(c,{label:`New`,icon:(0,O.jsx)(b,{})}),endContent:(0,O.jsx)(c,{label:`Save`})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{})})]})})]})},q={name:`Three-slot: ghost edges + center heading`,render:()=>(0,O.jsx)(d,{gap:4,children:[`sm`,`md`,`lg`].map(e=>(0,O.jsx)(T,{label:`size="${e}"`,children:(0,O.jsxs)(l,{width:700,children:[(0,O.jsx)(h,{label:`Three slot ${e}`,size:e,dividers:[`bottom`],startContent:(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(C,{}),isIconOnly:!0}),centerContent:(0,O.jsx)(u,{level:4,children:`Document Title`}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Share`,variant:`ghost`,icon:(0,O.jsx)(x,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`More`,variant:`ghost`,icon:(0,O.jsx)(v,{}),isIconOnly:!0})]})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{})})]})},e))})},J={name:`Three-slot: ghost start, solid end`,render:()=>(0,O.jsxs)(l,{width:700,children:[(0,O.jsx)(h,{label:`Mixed three slot`,dividers:[`bottom`],startContent:(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(C,{}),isIconOnly:!0}),centerContent:(0,O.jsx)(u,{level:4,children:`Page Title`}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Cancel`,variant:`secondary`}),(0,O.jsx)(c,{label:`Publish`})]})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{})})]})},Y={name:`Stress: stacked toolbar variants`,render:()=>(0,O.jsxs)(l,{width:700,children:[(0,O.jsx)(h,{label:`Ghost both`,size:`sm`,dividers:[`bottom`],startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(g,{}),isIconOnly:!0}),(0,O.jsx)(u,{level:4,children:`Ghost + Heading`})]}),endContent:(0,O.jsx)(c,{label:`Settings`,variant:`ghost`,icon:(0,O.jsx)(_,{}),isIconOnly:!0})}),(0,O.jsx)(h,{label:`Solid both`,size:`sm`,dividers:[`bottom`],startContent:(0,O.jsx)(c,{label:`Add`,size:`sm`,icon:(0,O.jsx)(b,{})}),endContent:(0,O.jsx)(c,{label:`Save`,size:`sm`})}),(0,O.jsx)(h,{label:`Ghost start solid end`,size:`sm`,dividers:[`bottom`],startContent:(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(C,{}),isIconOnly:!0}),endContent:(0,O.jsx)(c,{label:`Next`,size:`sm`,icon:(0,O.jsx)(ve,{})})}),(0,O.jsx)(h,{label:`Text start ghost end`,size:`sm`,dividers:[`bottom`],startContent:(0,O.jsx)(o,{type:`body`,weight:`bold`,children:`Selection mode`}),endContent:(0,O.jsx)(c,{label:`Done`,variant:`ghost`})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{lines:2})})]})},X={name:`Card > Layout(contentWidth) > Toolbar header`,render:()=>(0,O.jsxs)(d,{gap:4,children:[(0,O.jsx)(T,{label:`contentWidth=640, ghost buttons`,children:(0,O.jsx)(l,{width:900,children:(0,O.jsx)(i,{contentWidth:640,header:(0,O.jsx)(s,{hasDivider:!0,padding:0,children:(0,O.jsx)(h,{label:`Card layout header`,startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(g,{}),isIconOnly:!0}),(0,O.jsx)(u,{level:4,children:`Project Settings`})]}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Search`,variant:`ghost`,icon:(0,O.jsx)(y,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`Settings`,variant:`ghost`,icon:(0,O.jsx)(_,{}),isIconOnly:!0})]})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:4})})})})}),(0,O.jsx)(T,{label:`contentWidth=640, mixed (ghost start, solid end)`,children:(0,O.jsx)(l,{width:900,children:(0,O.jsx)(i,{contentWidth:640,header:(0,O.jsx)(s,{hasDivider:!0,padding:0,children:(0,O.jsx)(h,{label:`Card layout header`,startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(g,{}),isIconOnly:!0}),(0,O.jsx)(u,{level:4,children:`Edit Document`})]}),endContent:(0,O.jsx)(c,{label:`Save changes`})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:4})})})})}),(0,O.jsx)(T,{label:`contentWidth=640, heading start, no end`,children:(0,O.jsx)(l,{width:900,children:(0,O.jsx)(i,{contentWidth:640,header:(0,O.jsx)(s,{hasDivider:!0,padding:0,children:(0,O.jsx)(h,{label:`Card layout header`,startContent:(0,O.jsx)(u,{level:4,children:`Notifications`})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:4})})})})})]})},Z={name:`Card(12px) > Layout > Toolbar + body`,render:()=>(0,O.jsx)(l,{width:700,padding:3,children:(0,O.jsx)(i,{header:(0,O.jsx)(s,{hasDivider:!0,padding:0,children:(0,O.jsx)(h,{label:`Card header`,startContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Back`,variant:`ghost`,icon:(0,O.jsx)(g,{}),isIconOnly:!0}),(0,O.jsx)(u,{level:4,children:`Project Settings`})]}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Search`,variant:`ghost`,icon:(0,O.jsx)(y,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`Settings`,variant:`ghost`,icon:(0,O.jsx)(_,{}),isIconOnly:!0})]})})}),content:(0,O.jsx)(a,{children:(0,O.jsx)(E,{lines:4})})})})},Q={name:`Tabs in toolbar (all sizes)`,render:()=>{let[e,t]=(0,D.useState)(`overview`);return(0,O.jsx)(d,{gap:4,children:[`sm`,`md`,`lg`].map(n=>(0,O.jsx)(T,{label:`size="${n}"`,children:(0,O.jsxs)(l,{width:700,children:[(0,O.jsx)(h,{label:`Tab toolbar ${n}`,size:n,dividers:[`bottom`],startContent:(0,O.jsxs)(fe,{value:e,onChange:t,children:[(0,O.jsx)(p,{value:`overview`,label:`Overview`}),(0,O.jsx)(p,{value:`analytics`,label:`Analytics`}),(0,O.jsx)(p,{value:`settings`,label:`Settings`})]}),endContent:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(c,{label:`Filter`,variant:`ghost`,icon:(0,O.jsx)(m,{}),isIconOnly:!0}),(0,O.jsx)(c,{label:`Add`,variant:`ghost`,icon:(0,O.jsx)(b,{}),isIconOnly:!0})]})}),(0,O.jsx)(f,{children:(0,O.jsx)(E,{})})]})},n))})}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'Ghost buttons: start + end',
  render: () => <VStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
          <Card width={600}>
            <Toolbar label={\`Ghost buttons \${size}\`} size={size} dividers={['bottom']} startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Button label="Edit" variant="ghost" />
                  <Button label="Share" variant="ghost" />
                </>} endContent={<>
                  <Button label="Filter" variant="ghost" icon={<FunnelIcon />} isIconOnly />
                  <Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />
                </>} />
            <Section>
              <BodyContent />
            </Section>
          </Card>
        </AlignmentGuide>)}
    </VStack>
}`,...A.parameters?.docs?.source},description:{story:`Ghost buttons in start and end slots across all three sizes. The button text/icon should align flush with the container edge.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'Solid buttons: start + end',
  render: () => <VStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
          <Card width={600}>
            <Toolbar label={\`Solid buttons \${size}\`} size={size} dividers={['bottom']} startContent={<Button label="New item" icon={<PlusIcon />} />} endContent={<Button label="Save" />} />
            <Section>
              <BodyContent />
            </Section>
          </Card>
        </AlignmentGuide>)}
    </VStack>
}`,...j.parameters?.docs?.source},description:{story:`Solid (default) buttons at edges. These should NOT compensate — their padding is visually filled.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'Mixed: ghost start, solid end',
  render: () => <VStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
          <Card width={600}>
            <Toolbar label={\`Mixed \${size}\`} size={size} dividers={['bottom']} startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Button label="Edit" variant="ghost" />
                </>} endContent={<Button label="Save" />} />
            <Section>
              <BodyContent />
            </Section>
          </Card>
        </AlignmentGuide>)}
    </VStack>
}`,...M.parameters?.docs?.source},description:{story:`Ghost on start edge, solid on end. Only the start should compensate.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'Mixed: solid start, ghost end',
  render: () => <VStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
          <Card width={600}>
            <Toolbar label={\`Mixed \${size}\`} size={size} dividers={['bottom']} startContent={<Button label="New item" icon={<PlusIcon />} />} endContent={<>
                  <Button label="Filter" variant="ghost" icon={<FunnelIcon />} isIconOnly />
                  <Button label="More" variant="ghost" icon={<EllipsisHorizontalIcon />} isIconOnly />
                </>} />
            <Section>
              <BodyContent />
            </Section>
          </Card>
        </AlignmentGuide>)}
    </VStack>
}`,...N.parameters?.docs?.source},description:{story:`Solid on start edge, ghost on end. Only the end should compensate.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'Heading start + ghost end',
  render: () => <VStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
          <Card width={600}>
            <Toolbar label={\`Heading \${size}\`} size={size} dividers={['bottom']} startContent={<Heading level={4}>Section Title</Heading>} endContent={<>
                  <Button label="Filter" variant="ghost" icon={<FunnelIcon />} isIconOnly />
                  <Button label="Add" variant="ghost" icon={<PlusIcon />} isIconOnly />
                </>} />
            <Section>
              <BodyContent />
            </Section>
          </Card>
        </AlignmentGuide>)}
    </VStack>
}`,...P.parameters?.docs?.source},description:{story:`Heading in start slot with ghost buttons at end. Check heading alignment with body text below.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'Text start + ghost end',
  render: () => <Card width={600}>
      <Toolbar label="Text start" dividers={['bottom']} startContent={<Text type="body" weight="bold">
            3 items selected
          </Text>} endContent={<>
            <Button label="Delete" variant="ghost" />
            <Button label="Archive" variant="ghost" />
          </>} />
      <Section>
        <BodyContent />
      </Section>
    </Card>
}`,...F.parameters?.docs?.source},description:{story:`Text (not heading) in start slot with ghost buttons.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'Heading start + solid end',
  render: () => <Card width={600}>
      <Toolbar label="Heading solid" dividers={['bottom']} startContent={<Heading level={4}>Project Settings</Heading>} endContent={<Button label="Save changes" />} />
      <Section>
        <BodyContent />
      </Section>
    </Card>
}`,...I.parameters?.docs?.source},description:{story:`Heading on start, solid on end. No edge compensation on buttons — check heading vs body alignment.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'Layout: no contentWidth, ghost buttons',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="App header" startContent={<>
                  <Button label="Menu" variant="ghost" icon={<Squares2X2Icon />} isIconOnly />
                  <Heading level={4}>Dashboard</Heading>
                </>} endContent={<>
                  <Button label="Search" variant="ghost" icon={<MagnifyingGlassIcon />} isIconOnly />
                  <Button label="Notifications" variant="ghost" icon={<BellIcon />} isIconOnly />
                  <Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...L.parameters?.docs?.source},description:{story:`Toolbar in Layout header, no contentWidth. Full-width toolbar, edge compensation normal.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  name: 'Layout: no contentWidth, solid buttons',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="App header" startContent={<Heading level={4}>Dashboard</Heading>} endContent={<>
                  <Button label="Cancel" variant="secondary" />
                  <Button label="Save" />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...R.parameters?.docs?.source},description:{story:`Same without contentWidth but solid buttons for baseline comparison.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: 'Layout: contentWidth=640, ghost buttons',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Page header" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Heading level={4}>Settings</Heading>
                </>} endContent={<>
                  <Button label="Search" variant="ghost" icon={<MagnifyingGlassIcon />} isIconOnly />
                  <Button label="More" variant="ghost" icon={<EllipsisHorizontalIcon />} isIconOnly />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...z.parameters?.docs?.source},description:{story:`Toolbar in Layout with contentWidth=640. Header is full bleed, body is constrained. Ghost buttons should still align flush.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: 'Layout: contentWidth=640, solid buttons',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Page header" startContent={<Heading level={4}>Settings</Heading>} endContent={<>
                  <Button label="Cancel" variant="secondary" />
                  <Button label="Save" />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...B.parameters?.docs?.source},description:{story:`Same with contentWidth but solid buttons for comparison.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: 'Layout: contentWidth=640, mixed',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Page header" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Heading level={4}>Edit Project</Heading>
                </>} endContent={<Button label="Save changes" />} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...V.parameters?.docs?.source},description:{story:`Mixed ghost/solid with contentWidth — ghost start, solid end.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'Layout: contentWidth=960, ghost buttons',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout contentWidth={960} header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Dashboard header" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ChevronLeftIcon />} isIconOnly />
                  <Heading level={4}>Analytics Dashboard</Heading>
                </>} endContent={<>
                  <Button label="Share" variant="ghost" icon={<ShareIcon />} isIconOnly />
                  <Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...H.parameters?.docs?.source},description:{story:`contentWidth=960, ghost buttons. Common for dashboards.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  name: 'Layout: padding=4, ghost buttons',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout padding={4} header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Padded layout header" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Heading level={4}>Padded Layout</Heading>
                </>} endContent={<Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...U.parameters?.docs?.source},description:{story:`Layout with padding=4 and ghost toolbar. Layout outer padding interacts with toolbar edge compensation.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Layout: padding=4 + contentWidth=640',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout padding={4} contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Padded constrained header" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Heading level={4}>Constrained + Padded</Heading>
                </>} endContent={<>
                  <Button label="Share" variant="ghost" icon={<ShareIcon />} isIconOnly />
                  <Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...W.parameters?.docs?.source},description:{story:`Layout with padding + contentWidth together. Both constraints active.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Layout: header default padding + toolbar',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout header={<LayoutHeader hasDivider>
            <Toolbar label="Double padded?" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Heading level={4}>Double Padding Check</Heading>
                </>} endContent={<Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={4} />
          </LayoutContent>} />
    </div>
}`,...G.parameters?.docs?.source},description:{story:`Toolbar inside LayoutHeader using the header's default padding (not padding={0}). Potential double-padding issue.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'Comparison: ghost vs solid alignment',
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24
  }}>
      <AlignmentGuide label="Ghost buttons (should align flush)">
        <Card>
          <Toolbar label="Ghost" dividers={['bottom']} startContent={<>
                <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                <Button label="Edit" variant="ghost" />
              </>} endContent={<Button label="More" variant="ghost" icon={<EllipsisHorizontalIcon />} isIconOnly />} />
          <Section>
            <BodyContent />
          </Section>
        </Card>
      </AlignmentGuide>
      <AlignmentGuide label="Solid buttons (natural padding)">
        <Card>
          <Toolbar label="Solid" dividers={['bottom']} startContent={<Button label="New" icon={<PlusIcon />} />} endContent={<Button label="Save" />} />
          <Section>
            <BodyContent />
          </Section>
        </Card>
      </AlignmentGuide>
    </div>
}`,...K.parameters?.docs?.source},description:{story:`Direct visual comparison: ghost vs solid, with body content for alignment reference.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'Three-slot: ghost edges + center heading',
  render: () => <VStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
          <Card width={700}>
            <Toolbar label={\`Three slot \${size}\`} size={size} dividers={['bottom']} startContent={<Button label="Back" variant="ghost" icon={<ChevronLeftIcon />} isIconOnly />} centerContent={<Heading level={4}>Document Title</Heading>} endContent={<>
                  <Button label="Share" variant="ghost" icon={<ShareIcon />} isIconOnly />
                  <Button label="More" variant="ghost" icon={<EllipsisHorizontalIcon />} isIconOnly />
                </>} />
            <Section>
              <BodyContent />
            </Section>
          </Card>
        </AlignmentGuide>)}
    </VStack>
}`,...q.parameters?.docs?.source},description:{story:`Three-slot (center content) with ghost buttons at both edges. Center stays centered.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'Three-slot: ghost start, solid end',
  render: () => <Card width={700}>
      <Toolbar label="Mixed three slot" dividers={['bottom']} startContent={<Button label="Back" variant="ghost" icon={<ChevronLeftIcon />} isIconOnly />} centerContent={<Heading level={4}>Page Title</Heading>} endContent={<>
            <Button label="Cancel" variant="secondary" />
            <Button label="Publish" />
          </>} />
      <Section>
        <BodyContent />
      </Section>
    </Card>
}`,...J.parameters?.docs?.source},description:{story:`Three-slot: ghost start, center heading, solid end.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'Stress: stacked toolbar variants',
  render: () => <Card width={700}>
      <Toolbar label="Ghost both" size="sm" dividers={['bottom']} startContent={<>
            <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
            <Heading level={4}>Ghost + Heading</Heading>
          </>} endContent={<Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />} />
      <Toolbar label="Solid both" size="sm" dividers={['bottom']} startContent={<Button label="Add" size="sm" icon={<PlusIcon />} />} endContent={<Button label="Save" size="sm" />} />
      <Toolbar label="Ghost start solid end" size="sm" dividers={['bottom']} startContent={<Button label="Back" variant="ghost" icon={<ChevronLeftIcon />} isIconOnly />} endContent={<Button label="Next" size="sm" icon={<ChevronRightIcon />} />} />
      <Toolbar label="Text start ghost end" size="sm" dividers={['bottom']} startContent={<Text type="body" weight="bold">
            Selection mode
          </Text>} endContent={<Button label="Done" variant="ghost" />} />
      <Section>
        <BodyContent lines={2} />
      </Section>
    </Card>
}`,...Y.parameters?.docs?.source},description:{story:`Multiple toolbars stacked — checks edge compensation consistency across adjacent toolbars with different content types.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'Card > Layout(contentWidth) > Toolbar header',
  render: () => <VStack gap={4}>
      <AlignmentGuide label="contentWidth=640, ghost buttons">
        <Card width={900}>
          <Layout contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
                <Toolbar label="Card layout header" startContent={<>
                      <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                      <Heading level={4}>Project Settings</Heading>
                    </>} endContent={<>
                      <Button label="Search" variant="ghost" icon={<MagnifyingGlassIcon />} isIconOnly />
                      <Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />
                    </>} />
              </LayoutHeader>} content={<LayoutContent>
                <BodyContent lines={4} />
              </LayoutContent>} />
        </Card>
      </AlignmentGuide>
      <AlignmentGuide label="contentWidth=640, mixed (ghost start, solid end)">
        <Card width={900}>
          <Layout contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
                <Toolbar label="Card layout header" startContent={<>
                      <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                      <Heading level={4}>Edit Document</Heading>
                    </>} endContent={<Button label="Save changes" />} />
              </LayoutHeader>} content={<LayoutContent>
                <BodyContent lines={4} />
              </LayoutContent>} />
        </Card>
      </AlignmentGuide>
      <AlignmentGuide label="contentWidth=640, heading start, no end">
        <Card width={900}>
          <Layout contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
                <Toolbar label="Card layout header" startContent={<Heading level={4}>Notifications</Heading>} />
              </LayoutHeader>} content={<LayoutContent>
                <BodyContent lines={4} />
              </LayoutContent>} />
        </Card>
      </AlignmentGuide>
    </VStack>
}`,...X.parameters?.docs?.source},description:{story:`Card wrapping a Layout with contentWidth. Toolbar lives in the LayoutHeader. Tests the full nesting chain: Card padding → Layout bleed → contentWidth constraint → toolbar edge compensation.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'Card(12px) > Layout > Toolbar + body',
  render: () => <Card width={700} padding={3}>
      <Layout header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Card header" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Heading level={4}>Project Settings</Heading>
                </>} endContent={<>
                  <Button label="Search" variant="ghost" icon={<MagnifyingGlassIcon />} isIconOnly />
                  <Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={4} />
          </LayoutContent>} />
    </Card>
}`,...Z.parameters?.docs?.source},description:{story:`Card with 12px padding wrapping a Layout. Toolbar in header, body text in content. Tests that toolbar edge compensation aligns with body text when the card has non-default (smaller) padding.`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'Tabs in toolbar (all sizes)',
  render: () => {
    const [tab, setTab] = useState('overview');
    return <VStack gap={4}>
        {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
            <Card width={700}>
              <Toolbar label={\`Tab toolbar \${size}\`} size={size} dividers={['bottom']} startContent={<TabList value={tab} onChange={setTab}>
                    <Tab value="overview" label="Overview" />
                    <Tab value="analytics" label="Analytics" />
                    <Tab value="settings" label="Settings" />
                  </TabList>} endContent={<>
                    <Button label="Filter" variant="ghost" icon={<FunnelIcon />} isIconOnly />
                    <Button label="Add" variant="ghost" icon={<PlusIcon />} isIconOnly />
                  </>} />
              <Section>
                <BodyContent />
              </Section>
            </Card>
          </AlignmentGuide>)}
      </VStack>;
  }
}`,...Q.parameters?.docs?.source},description:{story:`Toolbar with tab navigation. Size prop on toolbar cascades to tabs and buttons via SizeContext.`,...Q.parameters?.docs?.description}}},$=[`GhostButtonsBothEdges`,`SolidButtonsBothEdges`,`GhostStartSolidEnd`,`SolidStartGhostEnd`,`HeadingStartGhostEnd`,`TextStartGhostEnd`,`HeadingStartSolidEnd`,`LayoutNoContentWidth`,`LayoutNoContentWidthSolid`,`LayoutWithContentWidth`,`LayoutWithContentWidthSolid`,`LayoutWithContentWidthMixed`,`LayoutContentWidth960`,`LayoutWithPadding`,`LayoutWithPaddingAndContentWidth`,`LayoutHeaderDefaultPadding`,`SideBySideComparison`,`ThreeSlotGhostEdges`,`ThreeSlotMixed`,`StackedVariants`,`CardLayoutContentWidthToolbar`,`CardSmallPaddingLayoutToolbar`,`WithTabs`]})))()}De();export{X as CardLayoutContentWidthToolbar,Z as CardSmallPaddingLayoutToolbar,A as GhostButtonsBothEdges,M as GhostStartSolidEnd,P as HeadingStartGhostEnd,I as HeadingStartSolidEnd,H as LayoutContentWidth960,G as LayoutHeaderDefaultPadding,L as LayoutNoContentWidth,R as LayoutNoContentWidthSolid,z as LayoutWithContentWidth,V as LayoutWithContentWidthMixed,B as LayoutWithContentWidthSolid,U as LayoutWithPadding,W as LayoutWithPaddingAndContentWidth,K as SideBySideComparison,j as SolidButtonsBothEdges,N as SolidStartGhostEnd,Y as StackedVariants,F as TextStartGhostEnd,q as ThreeSlotGhostEdges,J as ThreeSlotMixed,Q as WithTabs,$ as __namedExportsOrder,k as default};