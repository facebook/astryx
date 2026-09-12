import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{F as r,I as i}from"./ime-B2gVvZm0.js";import{t as a}from"./jsx-runtime-DqZldVDK.js";import{t as o}from"./Text-BXEuttRu.js";import{t as s}from"./Button-Cfm5_7B5.js";import{t as c}from"./Button-DbX60a9r.js";import{i as l,o as u}from"./Stack-CfnjGhmq.js";import{t as d}from"./Section-5EZtoXey.js";import{t as f}from"./Section-Dd6bjWM6.js";import{t as p}from"./Layout-B2hEnZFK.js";import{t as m}from"./Text-CRXEW_aT.js";import{nr as h,rr as g}from"./iframe-B3YSbK4A.js";function _({count:e}){return(0,T.jsx)(`div`,{className:`x78zum5 x1txdalj x192emsq xbwy6ji x1qjc9v5 xlsj2fj`,children:Array.from({length:e},(e,t)=>(0,T.jsxs)(`div`,{className:`xrostsh x1edz59j x9f619 x1b2ylru xh6dtrn xwmxj5m x2lah0s`,children:[(0,T.jsxs)(`p`,{className:`x1ghz6dp x9ynric x1tgivj0`,children:[`Project `,t+1]}),(0,T.jsx)(`p`,{className:`x1ghz6dp x9ynric xv1l7n4`,children:`Native scrolling content`})]},t))})}function v({count:e}){return(0,T.jsx)(`div`,{className:`xrvj5dj x1txdalj xlsj2fj`,children:Array.from({length:e},(e,t)=>(0,T.jsx)(`div`,{className:`xrostsh x1edz59j x9f619 x1b2ylru xh6dtrn xwmxj5m x2lah0s`,children:(0,T.jsxs)(`p`,{className:`x1ghz6dp x9ynric x1tgivj0`,children:[`Activity `,t+1]})},t))})}function y(){let[e,t]=(0,w.useState)(!1);return(0,T.jsxs)(l,{gap:3,xstyle:k.canvas,children:[(0,T.jsxs)(u,{gap:2,hAlign:`start`,children:[(0,T.jsx)(s,{label:e?`Make content fit`:`Make content overflow`,onClick:()=>t(e=>!e),children:e?`Make content fit`:`Make content overflow`}),(0,T.jsx)(o,{type:`supporting`,color:`secondary`,children:`Tab after toggling. The viewport is skipped when content fits and joins the tab order when content overflows.`})]}),(0,T.jsx)(g,{axis:`block`,label:`Conditional activity list`,role:`region`,"data-evidence":`conditional-tabindex`,xstyle:k.viewportCompact,children:(0,T.jsx)(v,{count:e?8:1})})]})}function b({policy:e}){return(0,T.jsxs)(l,{gap:2,children:[(0,T.jsx)(o,{weight:`semibold`,children:e}),(0,T.jsx)(g,{axis:`block`,label:`${e} outer activity`,overscroll:`allow`,xstyle:[k.viewport,k.nestedOuter],children:(0,T.jsxs)(l,{gap:3,xstyle:k.contentPadding,children:[(0,T.jsx)(o,{children:`Scroll the nested areas, then continue at each edge.`}),(0,T.jsx)(g,{axis:`block`,label:`${e} fitting nested area`,overscroll:e,"data-evidence":`${e}-fitting-nested`,xstyle:k.nestedViewport,children:(0,T.jsx)(v,{count:1})}),(0,T.jsx)(g,{axis:`block`,label:`${e} overflowing nested area`,overscroll:e,"data-evidence":`${e}-overflowing-nested`,xstyle:k.nestedViewport,children:(0,T.jsx)(v,{count:6})}),(0,T.jsx)(v,{count:4})]})})]})}function x({edge:e}){let t=e===`inline-start`?k.stickyStateInlineStart:e===`inline-end`?k.stickyStateInlineEnd:e===`block-start`?k.stickyStateBlockStart:k.stickyStateBlockEnd;return(0,T.jsx)(`span`,{...i(t),children:e})}function S(){let e=(0,w.useRef)(null);return(0,T.jsxs)(l,{gap:3,xstyle:k.canvas,children:[(0,T.jsx)(s,{label:`Scroll inline end`,"data-rtl-scroll-button":`true`,onClick:()=>{let t=e.current;t!=null&&(t.scrollLeft+=getComputedStyle(t).direction===`rtl`?-160:160)},children:`Scroll inline end`}),(0,T.jsx)(g,{ref:e,axis:`inline`,label:`Logical direction probe`,"data-rtl-scroll-probe":`true`,xstyle:k.viewport,children:(0,T.jsx)(_,{count:6})})]})}function C(){let[e,t]=(0,w.useState)(0);return(0,T.jsxs)(l,{gap:2,xstyle:k.canvas,children:[(0,T.jsx)(o,{type:`supporting`,color:`secondary`,children:`The native viewport remains clickable inside a perspective ancestor and a clipped rounded frame.`}),(0,T.jsx)(`div`,{className:`x1cvmir6 xkp28to`,children:(0,T.jsx)(`div`,{className:`x7giv3 x1hviunn xmkeg23 x1y0btm7 xvy26l8`,children:(0,T.jsx)(g,{axis:`block`,label:`Transformed clipped activity`,"data-evidence":`transformed-clipped`,xstyle:k.viewportCompact,children:(0,T.jsxs)(l,{gap:2,xstyle:k.contentPadding,children:[(0,T.jsx)(s,{label:`Activate clipped target`,"data-transform-hit-target":`true`,onClick:()=>t(e=>e+1),children:`Activate clipped target`}),(0,T.jsxs)(o,{"data-transform-hit-count":`true`,children:[`Activations: `,e]}),(0,T.jsx)(v,{count:5})]})})})})]})}var w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;e((()=>{w=t(n()),r(),c(),p(),h(),f(),m(),T=a(),{expect:E,userEvent:D,waitFor:O}=__STORYBOOK_MODULE_TEST__,k={canvas:{kmVPX3:`x1shk3sm`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kWkggS:`x1eiddq6`,$$css:!0},viewport:{kzqmXN:`xj6ak53`,kZKoxP:`x1b51vyi`,kMzoRj:`xmkeg23`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`x1y0btm7`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kVAM5u:`xvy26l8`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kaIpWk:`x1hviunn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kWkggS:`x10xzikg`,$$css:!0},viewportWide:{kzqmXN:`x1oy3ieq`,$$css:!0},viewportCompact:{kzqmXN:`x1hfn5x7`,kZKoxP:`xhjk10j`,$$css:!0},containerViewport:{kZKoxP:`x1b51vyi`,$$css:!0},contentPadding:{kmVPX3:`x1b2ylru`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,$$css:!0},stickyStateInlineStart:{kWkggS:`xjbqb8w x1ong9tx`,$$css:!0},stickyStateInlineEnd:{kWkggS:`xjbqb8w x13gt14`,$$css:!0},stickyStateBlockStart:{kWkggS:`xjbqb8w x17f5t6o`,$$css:!0},stickyStateBlockEnd:{kWkggS:`xjbqb8w x1n7cjb0`,$$css:!0},nestedViewport:{kzqmXN:`x1dz1jew`,kZKoxP:`xhjk10j`,kMzoRj:`xmkeg23`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`xbsl7fq`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kVAM5u:`xvy26l8`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kaIpWk:`xh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},nestedOuter:{kzqmXN:`x1m258z3`,kZKoxP:`x1vd4hg5`,$$css:!0},stickyPassThroughOuter:{kzqmXN:`x1cvmir6`,kZKoxP:`x1isuwpm`,$$css:!0},stickyPassThroughInner:{kZKoxP:`xhjk10j`,kMzoRj:`xmkeg23`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`xbsl7fq`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kVAM5u:`xvy26l8`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kaIpWk:`xh6dtrn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},verticalWriting:{kW8zPn:`x98t3bc`,kzqmXN:`x16grhtn`,kZKoxP:`xqitzto`,$$css:!0},rtl:{ksoyAI:`xzyj77d`,$$css:!0},scrollbarThin:{k5wCbM:`x1597r2g`,$$css:!0},scrollbarStable:{kZ7BSC:`xliy32w`,$$css:!0},scrollbarNeutral:{k6w4Gs:`x19jbwzc`,$$css:!0}},A={title:`Core/ScrollableArea`,component:g,tags:[`autodocs`],args:{axis:`block`,label:`Scrollable example`,role:`group`,overscroll:`allow`,stickyContainment:`whenScrollable`},argTypes:{axis:{control:`select`,options:[`inline`,`block`,`both`]},role:{control:`select`,options:[`group`,`region`]},overscroll:{control:`select`,options:[`allow`,`contain`]},stickyContainment:{control:`select`,options:[`whenScrollable`,`always`]}}},j={render:e=>(0,T.jsx)(`div`,{className:`x1shk3sm x1eiddq6`,children:(0,T.jsx)(g,{...e,xstyle:k.viewport,children:e.axis===`block`?(0,T.jsx)(v,{count:8}):(0,T.jsx)(_,{count:8})})})},M={render:()=>(0,T.jsx)(y,{}),play:async({canvasElement:e})=>{let t=e.querySelector(`button`),n=e.querySelector(`[data-evidence="conditional-tabindex"]`);E(t).not.toBeNull(),E(n).not.toBeNull(),!(t==null||n==null)&&(await O(()=>{E(getComputedStyle(n).overflowY).toBe(`clip`),E(n).not.toHaveAttribute(`tabindex`)}),await D.click(t),await O(()=>{E(getComputedStyle(n).overflowY).toBe(`auto`),E(n).toHaveAttribute(`tabindex`,`0`)}),await D.click(t),await O(()=>{E(getComputedStyle(n).overflowY).toBe(`clip`),E(n).not.toHaveAttribute(`tabindex`)}))},parameters:{controls:{disable:!0}}},N={render:()=>(0,T.jsxs)(u,{gap:4,xstyle:k.canvas,children:[(0,T.jsx)(b,{policy:`allow`}),(0,T.jsx)(b,{policy:`contain`})]}),parameters:{controls:{disable:!0}}},P={render:()=>(0,T.jsxs)(l,{gap:4,xstyle:k.canvas,children:[(0,T.jsx)(o,{weight:`semibold`,children:`Inline start and end`}),(0,T.jsx)(g,{axis:`inline`,label:`Inline sticky examples`,"data-evidence":`sticky-inline`,xstyle:[k.viewport,k.viewportWide],children:(0,T.jsxs)(`div`,{className:`x78zum5 x1txdalj x192emsq xbwy6ji x1qjc9v5 xlsj2fj`,children:[(0,T.jsx)(`div`,{className:`x7wzq59 x1vjfegm x1y8v6su xlsj2fj xh6dtrn x17x4s8c x9ynric x1tgivj0 xafyuhj x1o0tod`,children:(0,T.jsx)(x,{edge:`inline-start`})}),(0,T.jsx)(_,{count:4}),(0,T.jsx)(`div`,{className:`x7wzq59 x1vjfegm x1y8v6su xlsj2fj xh6dtrn x17x4s8c x9ynric x1tgivj0 xafyuhj xtijo5x`,children:(0,T.jsx)(x,{edge:`inline-end`})})]})}),(0,T.jsx)(o,{weight:`semibold`,children:`Block start and end`}),(0,T.jsx)(g,{axis:`block`,label:`Block sticky examples`,"data-evidence":`sticky-block`,xstyle:[k.viewport,k.viewportWide],children:(0,T.jsxs)(`div`,{className:`xrvj5dj x1txdalj xlsj2fj`,children:[(0,T.jsx)(`div`,{className:`x7wzq59 x1vjfegm x1y8v6su xlsj2fj xh6dtrn x17x4s8c x9ynric x1tgivj0 xafyuhj x13vifvy`,children:(0,T.jsx)(x,{edge:`block-start`})}),(0,T.jsx)(v,{count:5}),(0,T.jsx)(`div`,{className:`x7wzq59 x1vjfegm xlsj2fj xh6dtrn x17x4s8c x9ynric x1tgivj0 xafyuhj x1ey2m1c x7fd4wk`,children:(0,T.jsx)(x,{edge:`block-end`})})]})}),(0,T.jsx)(o,{weight:`semibold`,children:`Both axes`}),(0,T.jsx)(g,{axis:`both`,label:`Two-axis sticky examples`,"data-evidence":`sticky-both`,xstyle:[k.viewport,k.viewportWide],children:(0,T.jsxs)(`div`,{className:`x1n2onr6 xrvj5dj xjgn2wu xrc1yjb x1txdalj xpmw3k x17ol07n xlsj2fj`,children:[(0,T.jsxs)(`div`,{className:`x7wzq59 x1vjfegm x1y8v6su xlsj2fj xh6dtrn x17x4s8c x9ynric x1tgivj0 xafyuhj x1o0tod x13vifvy`,children:[(0,T.jsx)(x,{edge:`inline-start`}),` ·`,` `,(0,T.jsx)(x,{edge:`block-start`})]}),Array.from({length:14},(e,t)=>(0,T.jsxs)(`div`,{className:`xrostsh x1edz59j x9f619 x1b2ylru xh6dtrn xwmxj5m x2lah0s`,children:[`Cell `,t+1]},t)),(0,T.jsxs)(`div`,{className:`x7wzq59 x1vjfegm xlsj2fj xh6dtrn x17x4s8c x9ynric x1tgivj0 xafyuhj xtijo5x x1ey2m1c x7fd4wk`,children:[(0,T.jsx)(x,{edge:`inline-end`}),` · `,(0,T.jsx)(x,{edge:`block-end`})]})]})})]}),parameters:{controls:{disable:!0}}},F={render:()=>(0,T.jsx)(`div`,{className:`x1shk3sm x1eiddq6`,children:(0,T.jsx)(g,{axis:`block`,label:`Outer Sticky owner`,"data-sticky-outer":`true`,xstyle:[k.viewport,k.stickyPassThroughOuter],children:(0,T.jsxs)(`div`,{className:`x1sjpjwi x1b2ylru`,children:[(0,T.jsx)(`div`,{className:`x1b51vyi x78zum5 x6s0dn4`,children:(0,T.jsx)(o,{children:`Scroll until the fitting inner area reaches the outer viewport.`})}),(0,T.jsx)(g,{axis:`block`,label:`Fitting inner area`,"data-sticky-fitting-area":`true`,xstyle:k.stickyPassThroughInner,children:(0,T.jsxs)(`div`,{className:`x1wkxgih xlsj2fj`,children:[(0,T.jsx)(`div`,{"data-sticky-passthrough":`true`,className:`x7wzq59 x1vjfegm x1y8v6su xlsj2fj xh6dtrn x17x4s8c x9ynric x1tgivj0 xafyuhj x13vifvy`,children:`Sticky passes through the fitting area`}),(0,T.jsx)(o,{type:`supporting`,children:`This content fits, so the inner viewport uses clip and does not capture Sticky.`})]})}),(0,T.jsx)(o,{type:`supporting`,children:`Explicit containment keeps the fitting viewport as a Sticky boundary.`}),(0,T.jsx)(g,{axis:`block`,label:`Explicit fitting Sticky boundary`,stickyContainment:`always`,"data-sticky-contained-area":`true`,xstyle:k.stickyPassThroughInner,children:(0,T.jsx)(`div`,{className:`x1wkxgih xlsj2fj`,children:(0,T.jsx)(`div`,{className:`x7wzq59 x1vjfegm x1y8v6su xlsj2fj xh6dtrn x17x4s8c x9ynric x1tgivj0 xafyuhj x13vifvy`,children:`Sticky stays with this fitting area`})})}),(0,T.jsx)(`div`,{className:`x1bo65i3`})]})})}),play:async({canvasElement:e})=>{await document.fonts.ready,await new Promise(e=>requestAnimationFrame(()=>requestAnimationFrame(()=>e())));let t=e.querySelector(`[data-sticky-outer="true"]`),n=e.querySelector(`[data-sticky-fitting-area="true"]`),r=e.querySelector(`[data-sticky-contained-area="true"]`),i=e.querySelector(`[data-sticky-passthrough="true"]`);E(t).not.toBeNull(),E(n).not.toBeNull(),E(r).not.toBeNull(),E(i).not.toBeNull(),!(t==null||n==null||r==null||i==null)&&(E(getComputedStyle(n).overflowX).toBe(`clip`),E(getComputedStyle(n).overflowY).toBe(`clip`),E(n).not.toHaveAttribute(`tabindex`),E(getComputedStyle(r).overflowX).toBe(`hidden`),E(getComputedStyle(r).overflowY).toBe(`auto`),E(r).not.toHaveAttribute(`tabindex`),t.scrollTop=200,t.dispatchEvent(new Event(`scroll`)),await new Promise(e=>requestAnimationFrame(()=>requestAnimationFrame(()=>e()))),E(Math.abs(i.getBoundingClientRect().top-t.getBoundingClientRect().top)).toBeLessThanOrEqual(2),t.dataset.stickyPassthroughVerified=`true`)},parameters:{controls:{disable:!0}}},I={render:()=>(0,T.jsxs)(l,{gap:4,xstyle:k.canvas,children:[(0,T.jsx)(o,{weight:`semibold`,children:`LTR inline axis`}),(0,T.jsx)(g,{axis:`inline`,label:`LTR projects`,"data-evidence":`writing-ltr`,xstyle:k.viewport,children:(0,T.jsx)(_,{count:6})}),(0,T.jsx)(o,{weight:`semibold`,children:`RTL inline axis`}),(0,T.jsx)(g,{axis:`inline`,label:`RTL projects`,dir:`rtl`,"data-evidence":`writing-rtl`,xstyle:[k.viewport,k.rtl],children:(0,T.jsx)(_,{count:6})}),(0,T.jsx)(o,{weight:`semibold`,children:`vertical-rl inline axis`}),(0,T.jsx)(g,{axis:`inline`,label:`Vertical projects`,"data-evidence":`writing-vertical-rl`,xstyle:k.verticalWriting,children:(0,T.jsx)(_,{count:6})})]}),parameters:{controls:{disable:!0}}},L={render:()=>(0,T.jsx)(S,{}),parameters:{controls:{disable:!0}}},R={render:()=>(0,T.jsx)(C,{}),parameters:{controls:{disable:!0}}},z={render:()=>(0,T.jsx)(`div`,{className:`x1shk3sm x1eiddq6`,children:(0,T.jsx)(d,{padding:4,width:340,children:(0,T.jsx)(g,{axis:`block`,label:`Full-bleed activity`,isFullBleed:!0,padding:3,"data-evidence":`container-integration`,xstyle:k.containerViewport,children:(0,T.jsx)(v,{count:6})})})}),parameters:{controls:{disable:!0}}},B={render:()=>(0,T.jsxs)(l,{gap:4,xstyle:k.canvas,children:[(0,T.jsx)(o,{weight:`semibold`,children:`Platform default with neutral thumb`}),(0,T.jsx)(g,{axis:`inline`,label:`Default native scrollbar`,"data-evidence":`scrollbar-default`,xstyle:k.viewport,children:(0,T.jsx)(_,{count:6})}),(0,T.jsx)(o,{weight:`semibold`,children:`Thin width and stable gutter`}),(0,T.jsx)(g,{axis:`inline`,label:`Thin stable native scrollbar`,"data-evidence":`scrollbar-thin-stable`,xstyle:[k.viewport,k.scrollbarThin,k.scrollbarStable],children:(0,T.jsx)(_,{count:6})}),(0,T.jsx)(o,{weight:`semibold`,children:`Consumer neutral override, transparent track`}),(0,T.jsx)(g,{axis:`inline`,label:`Neutral native scrollbar`,"data-evidence":`scrollbar-neutral`,xstyle:[k.viewport,k.scrollbarNeutral],children:(0,T.jsx)(_,{count:6})})]}),parameters:{controls:{disable:!0}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => <div {...stylex.props(styles.canvas)}>
      <ScrollableArea {...args} xstyle={styles.viewport}>
        {args.axis === 'block' ? <Rows count={8} /> : <Cards count={8} />}
      </ScrollableArea>
    </div>
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <ConditionalKeyboardDemo />,
  play: async ({
    canvasElement
  }) => {
    const button = canvasElement.querySelector('button');
    const viewport = canvasElement.querySelector<HTMLElement>('[data-evidence="conditional-tabindex"]');
    expect(button).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (button == null || viewport == null) {
      return;
    }
    await waitFor(() => {
      expect(getComputedStyle(viewport).overflowY).toBe('clip');
      expect(viewport).not.toHaveAttribute('tabindex');
    });
    await userEvent.click(button);
    await waitFor(() => {
      expect(getComputedStyle(viewport).overflowY).toBe('auto');
      expect(viewport).toHaveAttribute('tabindex', '0');
    });
    await userEvent.click(button);
    await waitFor(() => {
      expect(getComputedStyle(viewport).overflowY).toBe('clip');
      expect(viewport).not.toHaveAttribute('tabindex');
    });
  },
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={4} xstyle={styles.canvas}>
      <NestedChainingExample policy="allow" />
      <NestedChainingExample policy="contain" />
    </HStack>,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={4} xstyle={styles.canvas}>
      <Text weight="semibold">Inline start and end</Text>
      <ScrollableArea axis="inline" label="Inline sticky examples" data-evidence="sticky-inline" xstyle={[styles.viewport, styles.viewportWide]}>
        <div {...stylex.props(styles.horizontalRail)}>
          <div {...stylex.props(styles.sticky, styles.stickyInlineStart)}>
            <StickyLabel edge="inline-start" />
          </div>
          <Cards count={4} />
          <div {...stylex.props(styles.sticky, styles.stickyInlineEnd)}>
            <StickyLabel edge="inline-end" />
          </div>
        </div>
      </ScrollableArea>

      <Text weight="semibold">Block start and end</Text>
      <ScrollableArea axis="block" label="Block sticky examples" data-evidence="sticky-block" xstyle={[styles.viewport, styles.viewportWide]}>
        <div {...stylex.props(styles.verticalRail)}>
          <div {...stylex.props(styles.sticky, styles.stickyBlockStart)}>
            <StickyLabel edge="block-start" />
          </div>
          <Rows count={5} />
          <div {...stylex.props(styles.sticky, styles.stickyBlockEnd)}>
            <StickyLabel edge="block-end" />
          </div>
        </div>
      </ScrollableArea>

      <Text weight="semibold">Both axes</Text>
      <ScrollableArea axis="both" label="Two-axis sticky examples" data-evidence="sticky-both" xstyle={[styles.viewport, styles.viewportWide]}>
        <div {...stylex.props(styles.twoAxisCanvas)}>
          <div {...stylex.props(styles.sticky, styles.stickyInlineStart, styles.stickyBlockStart)}>
            <StickyLabel edge="inline-start" /> ·{' '}
            <StickyLabel edge="block-start" />
          </div>
          {Array.from({
          length: 14
        }, (_, index) => <div key={index} {...stylex.props(styles.card)}>
              Cell {index + 1}
            </div>)}
          <div {...stylex.props(styles.sticky, styles.stickyInlineEnd, styles.stickyBlockEnd)}>
            <StickyLabel edge="inline-end" /> · <StickyLabel edge="block-end" />
          </div>
        </div>
      </ScrollableArea>
    </VStack>,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.canvas)}>
      <ScrollableArea axis="block" label="Outer Sticky owner" data-sticky-outer="true" xstyle={[styles.viewport, styles.stickyPassThroughOuter]}>
        <div {...stylex.props(styles.stickyPassThroughContent)}>
          <div {...stylex.props(styles.stickyPassThroughSpacer)}>
            <Text>
              Scroll until the fitting inner area reaches the outer viewport.
            </Text>
          </div>
          <ScrollableArea axis="block" label="Fitting inner area" data-sticky-fitting-area="true" xstyle={styles.stickyPassThroughInner}>
            <div {...stylex.props(styles.stickyPassThroughInnerContent)}>
              <div data-sticky-passthrough="true" {...stylex.props(styles.sticky, styles.stickyBlockStart)}>
                Sticky passes through the fitting area
              </div>
              <Text type="supporting">
                This content fits, so the inner viewport uses clip and does not
                capture Sticky.
              </Text>
            </div>
          </ScrollableArea>
          <Text type="supporting">
            Explicit containment keeps the fitting viewport as a Sticky
            boundary.
          </Text>
          <ScrollableArea axis="block" label="Explicit fitting Sticky boundary" stickyContainment="always" data-sticky-contained-area="true" xstyle={styles.stickyPassThroughInner}>
            <div {...stylex.props(styles.stickyPassThroughInnerContent)}>
              <div {...stylex.props(styles.sticky, styles.stickyBlockStart)}>
                Sticky stays with this fitting area
              </div>
            </div>
          </ScrollableArea>
          <div {...stylex.props(styles.stickyPassThroughTail)} />
        </div>
      </ScrollableArea>
    </div>,
  play: async ({
    canvasElement
  }) => {
    await document.fonts.ready;
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const outer = canvasElement.querySelector<HTMLElement>('[data-sticky-outer="true"]');
    const fittingArea = canvasElement.querySelector<HTMLElement>('[data-sticky-fitting-area="true"]');
    const containedArea = canvasElement.querySelector<HTMLElement>('[data-sticky-contained-area="true"]');
    const sticky = canvasElement.querySelector<HTMLElement>('[data-sticky-passthrough="true"]');
    expect(outer).not.toBeNull();
    expect(fittingArea).not.toBeNull();
    expect(containedArea).not.toBeNull();
    expect(sticky).not.toBeNull();
    if (outer == null || fittingArea == null || containedArea == null || sticky == null) {
      return;
    }
    expect(getComputedStyle(fittingArea).overflowX).toBe('clip');
    expect(getComputedStyle(fittingArea).overflowY).toBe('clip');
    expect(fittingArea).not.toHaveAttribute('tabindex');
    expect(getComputedStyle(containedArea).overflowX).toBe('hidden');
    expect(getComputedStyle(containedArea).overflowY).toBe('auto');
    expect(containedArea).not.toHaveAttribute('tabindex');
    outer.scrollTop = 200;
    outer.dispatchEvent(new Event('scroll'));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    expect(Math.abs(sticky.getBoundingClientRect().top - outer.getBoundingClientRect().top)).toBeLessThanOrEqual(2);
    outer.dataset.stickyPassthroughVerified = 'true';
  },
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={4} xstyle={styles.canvas}>
      <Text weight="semibold">LTR inline axis</Text>
      <ScrollableArea axis="inline" label="LTR projects" data-evidence="writing-ltr" xstyle={styles.viewport}>
        <Cards count={6} />
      </ScrollableArea>
      <Text weight="semibold">RTL inline axis</Text>
      <ScrollableArea axis="inline" label="RTL projects" dir="rtl" data-evidence="writing-rtl" xstyle={[styles.viewport, styles.rtl]}>
        <Cards count={6} />
      </ScrollableArea>
      <Text weight="semibold">vertical-rl inline axis</Text>
      <ScrollableArea axis="inline" label="Vertical projects" data-evidence="writing-vertical-rl" xstyle={styles.verticalWriting}>
        <Cards count={6} />
      </ScrollableArea>
    </VStack>,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <RTLBehaviorProbeStory />,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <TransformedClipDemo />,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.canvas)}>
      <Section padding={4} width={340}>
        <ScrollableArea axis="block" label="Full-bleed activity" isFullBleed padding={3} data-evidence="container-integration" xstyle={styles.containerViewport}>
          <Rows count={6} />
        </ScrollableArea>
      </Section>
    </div>,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={4} xstyle={styles.canvas}>
      <Text weight="semibold">Platform default with neutral thumb</Text>
      <ScrollableArea axis="inline" label="Default native scrollbar" data-evidence="scrollbar-default" xstyle={styles.viewport}>
        <Cards count={6} />
      </ScrollableArea>
      <Text weight="semibold">Thin width and stable gutter</Text>
      <ScrollableArea axis="inline" label="Thin stable native scrollbar" data-evidence="scrollbar-thin-stable" xstyle={[styles.viewport, styles.scrollbarThin, styles.scrollbarStable]}>
        <Cards count={6} />
      </ScrollableArea>
      <Text weight="semibold">
        Consumer neutral override, transparent track
      </Text>
      <ScrollableArea axis="inline" label="Neutral native scrollbar" data-evidence="scrollbar-neutral" xstyle={[styles.viewport, styles.scrollbarNeutral]}>
        <Cards count={6} />
      </ScrollableArea>
    </VStack>,
  parameters: {
    controls: {
      disable: true
    }
  }
}`,...B.parameters?.docs?.source}}},V=[`Playground`,`ConditionalKeyboardAccess`,`Overscroll`,`StickyLogicalEdges`,`FittingStickyPassthrough`,`LogicalDirections`,`RTLBehaviorProbe`,`TransformedClippedAncestor`,`ContainerIntegration`,`NativeScrollbarPresentation`]}))();export{M as ConditionalKeyboardAccess,z as ContainerIntegration,F as FittingStickyPassthrough,I as LogicalDirections,B as NativeScrollbarPresentation,N as Overscroll,j as Playground,L as RTLBehaviorProbe,P as StickyLogicalEdges,R as TransformedClippedAncestor,V as __namedExportsOrder,A as default};