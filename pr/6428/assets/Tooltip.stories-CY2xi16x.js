import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{s as i}from"./i18n-BJvtdDVL.js";import{c as a}from"./useTheme-DQ6FpwaW.js";import{x as o}from"./theme-yVhZyyf7.js";import{t as s}from"./MediaTheme-Dn78Qree.js";import{u as c}from"./iframe-DnVuU5c4.js";import{A as l,C as u,E as d,M as f,O as p,t as m,w as h}from"./src-BOkQEqeE.js";import{i as g,r as _}from"./_data-DTSixHX1.js";function v({showLineDots:e=!1}){let t=i();return(0,x.jsx)(l,{data:g,xKey:`month`,series:[h(`revenue`,{color:`#3b82f6`,label:`Revenue`,stack:`x`}),h(`costs`,{color:`#ef4444`,label:`Costs`,stack:`x`}),u(`trend`,{color:`#f59e0b`,label:`Trend`,dots:e})],tooltip:!0,grid:(0,x.jsx)(d,{}),axes:(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(p,{position:`bottom`}),(0,x.jsx)(p,{position:`left`,tickFormat:f(`$`,t)})]}),height:320})}function y(){let e=(0,b.useRef)(null);return(0,b.useEffect)(()=>{let t=e.current;return t&&!t.open&&t.showModal(),()=>{t?.open&&t.close()}},[]),(0,x.jsx)(o,{theme:w,mode:`light`,children:(0,x.jsx)(s,{mode:`dark`,children:(0,x.jsx)(`dialog`,{ref:e,"aria-label":`Chart tooltip layering test`,className:`x1iut0ri xw7nakj x1shk3sm xmkeg23 x1y0btm7 x14i3s5s x1hviunn x10xzikg`,children:(0,x.jsx)(v,{showLineDots:!0})})})})}var b,x,S,C,w,T,E,D,O;e((()=>{b=t(n()),m(),c(),_(),x=r(),{expect:S,waitFor:C}=__STORYBOOK_MODULE_TEST__,w=a({name:`chart-tooltip-modal-test`,tokens:{"--color-accent":`#7c3aed`}}),T={title:`Charts/Chrome/Tooltip`,component:l},E={render:()=>(0,x.jsx)(v,{})},D={render:()=>(0,x.jsx)(y,{}),play:async({canvasElement:e})=>{let t=e.querySelector(`dialog`);await C(()=>S(t?.matches(`:modal`)).toBe(!0));let n=()=>e.querySelector(`svg rect[fill="transparent"]`),r=()=>document.querySelector(`[role="tooltip"]`);await C(()=>{S(n()).not.toBeNull(),S(r()).not.toBeNull()});let i=n(),a=r();if(!i||!a)throw Error(`Chart event surface or tooltip did not render`);let o=a.parentElement;if(!o)throw Error(`Chart tooltip Layer host did not render`);let s=[],c=e=>{s.push(e.newState)};o.addEventListener(`beforetoggle`,c),await C(()=>{S(i.getBoundingClientRect().width).toBeGreaterThan(0),S(e.querySelectorAll(`svg g[clip-path] circle`).length).toBeGreaterThanOrEqual(2)});let l=e.querySelectorAll(`svg g[clip-path] circle`),u=i.getBoundingClientRect(),d=e=>{let t=e.getBoundingClientRect();i.dispatchEvent(new PointerEvent(`pointermove`,{bubbles:!0,clientX:t.left+t.width/2,clientY:u.top+u.height/2,pointerType:`mouse`}))};d(l[0]),await C(()=>{S(a.textContent).toContain(`Jan`),S(o.matches(`:popover-open`)).toBe(!0)}),S(s).toEqual([`open`]),d(l[1]),await C(()=>{S(a.textContent).toContain(`Feb`),S(o.matches(`:popover-open`)).toBe(!0)}),await new Promise(e=>requestAnimationFrame(()=>e())),S(s).toEqual([`open`]),S(t?.matches(`:modal`)).toBe(!0),S(o.closest(`[data-astryx-theme="chart-tooltip-modal-test"]`)).not.toBeNull(),S(o.closest(`[data-astryx-media="dark"]`)).not.toBeNull(),S(getComputedStyle(o).zIndex).toBe(`auto`);let f=o.getBoundingClientRect();S(f.width).toBeGreaterThan(0),S(f.height).toBeGreaterThan(0),o.removeEventListener(`beforetoggle`,c)}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <TooltipChart />
}`,...E.parameters?.docs?.source},description:{story:`Hover the chart: a grouped tooltip shows every series value at that x, with a
 column highlight for bars and hover dots on lines.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <ModalLayeringFixture />,
  play: async ({
    canvasElement
  }) => {
    const dialog = canvasElement.querySelector('dialog');
    await waitFor(() => expect(dialog?.matches(':modal')).toBe(true));
    const getEventSurface = () => canvasElement.querySelector<SVGRectElement>('svg rect[fill="transparent"]');
    const getTooltip = () => document.querySelector<HTMLElement>('[role="tooltip"]');
    await waitFor(() => {
      expect(getEventSurface()).not.toBeNull();
      expect(getTooltip()).not.toBeNull();
    });
    const eventSurface = getEventSurface();
    const tooltip = getTooltip();
    if (!eventSurface || !tooltip) {
      throw new Error('Chart event surface or tooltip did not render');
    }
    const layer = tooltip.parentElement;
    if (!layer) {
      throw new Error('Chart tooltip Layer host did not render');
    }
    const toggleStates: string[] = [];
    const recordToggle = (event: Event) => {
      toggleStates.push((event as ToggleEvent).newState);
    };
    layer.addEventListener('beforetoggle', recordToggle);
    await waitFor(() => {
      expect(eventSurface.getBoundingClientRect().width).toBeGreaterThan(0);
      expect(canvasElement.querySelectorAll<SVGCircleElement>('svg g[clip-path] circle').length).toBeGreaterThanOrEqual(2);
    });
    const points = canvasElement.querySelectorAll<SVGCircleElement>('svg g[clip-path] circle');
    const eventRect = eventSurface.getBoundingClientRect();
    const moveTo = (point: SVGCircleElement) => {
      const pointRect = point.getBoundingClientRect();
      eventSurface.dispatchEvent(new PointerEvent('pointermove', {
        bubbles: true,
        clientX: pointRect.left + pointRect.width / 2,
        clientY: eventRect.top + eventRect.height / 2,
        pointerType: 'mouse'
      }));
    };
    moveTo(points[0]);
    await waitFor(() => {
      expect(tooltip.textContent).toContain('Jan');
      expect(layer.matches(':popover-open')).toBe(true);
    });
    expect(toggleStates).toEqual(['open']);
    moveTo(points[1]);
    await waitFor(() => {
      expect(tooltip.textContent).toContain('Feb');
      expect(layer.matches(':popover-open')).toBe(true);
    });
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    expect(toggleStates).toEqual(['open']);
    expect(dialog?.matches(':modal')).toBe(true);
    expect(layer.closest('[data-astryx-theme="chart-tooltip-modal-test"]')).not.toBeNull();
    expect(layer.closest('[data-astryx-media="dark"]')).not.toBeNull();
    expect(getComputedStyle(layer).zIndex).toBe('auto');
    const layerRect = layer.getBoundingClientRect();
    expect(layerRect.width).toBeGreaterThan(0);
    expect(layerRect.height).toBeGreaterThan(0);
    layer.removeEventListener('beforetoggle', recordToggle);
  }
}`,...D.parameters?.docs?.source},description:{story:`Keeps the chart inside nested Theme/MediaTheme scopes and a native modal,
then opens its tooltip after the modal. The play assertions prove the host
stays in those scopes, remains continuously open across content-bearing
points, and becomes a later browser top-layer entry rather than a high-z-index
portal hidden behind the dialog.`,...D.parameters?.docs?.description}}},O=[`Default`,`ModalLayering`]}))();export{E as Default,D as ModalLayering,O as __namedExportsOrder,T as default};