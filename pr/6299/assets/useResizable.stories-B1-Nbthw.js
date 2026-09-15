import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{r,t as i}from"./LayoutContent-DUPaTuAj.js";import{t as a,w as o}from"./utils-CuDRdYlB.js";import{t as s}from"./jsx-runtime-DqZldVDK.js";import{t as c}from"./LayoutPanel-7t1Ql3K6.js";import{t as l}from"./Layout-B2hEnZFK.js";import{i as u}from"./columnUtils-cuTFfh7_.js";import{i as d,t as f}from"./ResizeHandle-19cd4cvd.js";import{ir as p,nr as m,rr as h}from"./iframe-BLVFxLbU.js";function g({children:e}){return(0,b.jsx)(`div`,{children:e})}function _({kind:e,width:t}){let n=(0,y.useRef)(null),a=(0,y.useRef)(null),[s,l]=(0,y.useState)(!1),m=e.startsWith(`default`),h=e===`minimum`,g=`storybook-structured-percent-${e}`,_=d({...m?{defaultSize:p(40,{min:u(333)})}:h?{defaultSize:0,minSize:p(40,{min:u(333)})}:{defaultSize:500,maxSize:p(10,{max:u(400)})},containerRef:n,direction:`horizontal`,autoSaveId:g}),v=m?null:h?_.props._minSizePx:_.props._maxSizePx,x=m?`defaultSize: percent(40, {min: pixel(333)})`:h?`minSize: percent(40, {min: pixel(333)})`:`maxSize: percent(10, {max: pixel(400)})`,S=(0,y.useCallback)(()=>{let e=a.current;if(e==null)return;let t=getComputedStyle(e).overflowY,n=[`auto`,`scroll`,`overlay`].includes(t)&&e.scrollHeight>e.clientHeight+1;l(e=>e===n?e:n)},[]);return(0,y.useLayoutEffect)(()=>{let e=a.current;if(e!=null)return o(e,S)},[S]),(0,b.jsxs)(`div`,{ref:n,"data-testid":`structured-percent-${e}-frame`,"data-width":t,"data-size":_.size,"data-resolved-bound":v??void 0,"data-storage-key":`astryx-resizable:${g}`,className:`xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr x1b51vyi`,style:{width:t},children:[(0,b.jsxs)(`div`,{className:`x1de1mus xmkeg23 x1y0btm7 x14i3s5s x1hviunn xuoh4cs`,children:[(0,b.jsxs)(`strong`,{children:[t,`px outer / `,t-2,`px content`]}),(0,b.jsx)(`div`,{children:(0,b.jsx)(`code`,{children:x})}),(0,b.jsxs)(`div`,{children:[Math.round(_.size),`px selected`,v==null?` initially`:` · ${Math.round(v)}px resolved bound`]})]}),(0,b.jsx)(`div`,{className:`xwzfr38`,children:(0,b.jsx)(r,{height:`fill`,start:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)(c,{width:_.size,hasDivider:!1,isScrollable:!1,"data-testid":`structured-percent-${e}-panel`,children:[Math.round(_.size),`px`]}),(0,b.jsx)(f,{direction:`horizontal`,hasDivider:!0,label:`Resize structured percent ${e} example`,resizable:_.props})]}),content:(0,b.jsx)(i,{ref:a,"data-testid":`structured-percent-${e}-content`,role:s?`region`:void 0,label:s?`Structured percent ${e.replaceAll(`-`,` `)} details`:void 0,tabIndex:s?0:-1,children:m?`Later basis changes do not rescale this selected pixel size.`:`The percentage bound follows later basis changes.`})})})]})}function v(){let[e,t]=(0,y.useState)(!1),[n,r]=(0,y.useState)(!1);return(0,y.useEffect)(()=>{for(let e of[`default-wide`,`default-narrow`,`minimum`,`maximum`])localStorage.removeItem(`astryx-resizable:storybook-structured-percent-${e}`);t(!0)},[]),e?(0,b.jsxs)(`div`,{"data-testid":`structured-percent-sizing`,className:`xrvj5dj x18g69wz`,children:[(0,b.jsx)(`button`,{type:`button`,"data-testid":`structured-percent-toggle-bases`,onClick:()=>r(e=>!e),children:n?`Restore initial bases`:`Change bases`}),(0,b.jsx)(_,{kind:`default-wide`,width:n?500:1e3}),(0,b.jsx)(_,{kind:`default-narrow`,width:n?1e3:500}),(0,b.jsx)(_,{kind:`minimum`,width:n?1e3:500}),(0,b.jsx)(_,{kind:`maximum`,width:n?500:1e3})]}):null}var y,b,x,S,C,w,T,E,D,O,k,A,j,M;e((()=>{y=t(n()),m(),h(),l(),a(),b=s(),x={muted:{kWkggS:`xwmxj5m`,$$css:!0}},S={title:`Core/Hooks/useResizable`,component:g,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`Hook that manages resize state for panel regions. Pair with ResizeHandle for interactive resizing.`}}}},C={render:()=>{let e=d({defaultSize:200,minSize:100,maxSize:500});return(0,b.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,b.jsx)(r,{height:`fill`,start:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(c,{width:e.size,hasDivider:!1,children:`Sidebar`}),(0,b.jsx)(f,{direction:`horizontal`,hasDivider:!0,resizable:e.props})]}),content:(0,b.jsx)(i,{children:`Content`})})})}},w={render:()=>{let e=d({defaultSize:150,minSize:60,maxSize:250,direction:`vertical`});return(0,b.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,b.jsx)(r,{height:`fill`,header:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(c,{width:`100%`,padding:4,children:(0,b.jsx)(`div`,{style:{height:e.size},children:`Header`})}),(0,b.jsx)(f,{direction:`vertical`,hasDivider:!0,resizable:e.props})]}),content:(0,b.jsx)(i,{children:`Content`})})})}},T={render:()=>{let e=d({defaultSize:180,minSize:120,maxSize:300}),t=d({defaultSize:220,minSize:150,maxSize:400});return(0,b.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,b.jsx)(r,{height:`fill`,start:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(c,{width:e.size,hasDivider:!1,children:`Folders`}),(0,b.jsx)(f,{direction:`horizontal`,hasDivider:!0,resizable:e.props})]}),content:(0,b.jsx)(i,{children:`Inbox`}),end:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(f,{direction:`horizontal`,hasDivider:!0,isReversed:!0,resizable:t.props}),(0,b.jsx)(c,{width:t.size,hasDivider:!1,children:`Preview`})]})})})}},E={render:()=>{let e=d({defaultSize:200,minSize:120,maxSize:350}),t=d({defaultSize:200,minSize:80,maxSize:250,direction:`vertical`});return(0,b.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,b.jsx)(r,{height:`fill`,start:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(c,{width:e.size,hasDivider:!1,children:`Explorer`}),(0,b.jsx)(f,{direction:`horizontal`,hasDivider:!0,resizable:e.props})]}),content:(0,b.jsx)(i,{padding:0,children:(0,b.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,height:`100%`},children:[(0,b.jsx)(`div`,{style:{height:t.size,flexShrink:0,display:`flex`,alignItems:`center`,justifyContent:`center`},children:`Editor`}),(0,b.jsx)(f,{direction:`vertical`,hasDivider:!0,resizable:t.props}),(0,b.jsx)(`div`,{style:{flex:1,display:`flex`,alignItems:`center`,justifyContent:`center`},children:`Terminal`})]})})})})}},D={render:()=>{let e=d({defaultSize:250,minSize:100,maxSize:500});return(0,b.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,b.jsx)(r,{height:`fill`,start:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(c,{width:e.size,hasDivider:!1,children:`Sidebar`}),(0,b.jsx)(f,{direction:`horizontal`,hasDivider:!0,resizable:e.props})]}),content:(0,b.jsx)(i,{children:`Content`})})})}},O={render:()=>{let e=d({defaultSize:200,minSize:120,maxSize:350}),t=d({defaultSize:200,minSize:80,maxSize:250,direction:`vertical`});return(0,b.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,b.jsx)(r,{height:`fill`,start:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(c,{width:e.size,hasDivider:!1,xstyle:x.muted,children:`Explorer`}),(0,b.jsx)(f,{direction:`horizontal`,resizable:e.props})]}),content:(0,b.jsx)(i,{padding:0,children:(0,b.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,height:`100%`},children:[(0,b.jsx)(`div`,{style:{flex:1,display:`flex`,alignItems:`center`,justifyContent:`center`},children:`Editor`}),(0,b.jsx)(f,{direction:`vertical`,resizable:t.props}),(0,b.jsx)(`div`,{className:`x1de1mus xmkeg23 x1y0btm7 x14i3s5s x1hviunn xuoh4cs`,style:{flex:1,display:`flex`,alignItems:`center`,justifyContent:`center`},children:`Terminal`})]})})})})}},k={render:()=>{let e=(0,y.useRef)(null),t=d({defaultSize:`40%`,minSize:`15%`,maxSize:`60%`,containerRef:e});return(0,b.jsx)(`div`,{ref:e,className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,b.jsx)(r,{height:`fill`,start:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(c,{width:t.size,hasDivider:!1,children:(0,b.jsxs)(`div`,{className:`x1de1mus xmkeg23 x1y0btm7 x14i3s5s x1hviunn xuoh4cs`,children:[Math.round(t.size),`px`]})}),(0,b.jsx)(f,{direction:`horizontal`,hasDivider:!0,resizable:t.props})]}),content:(0,b.jsx)(i,{children:`Content`})})})}},A={render:()=>(0,b.jsx)(v,{})},j={render:()=>{let e=d({defaultSize:`25%`,minSize:80});return(0,b.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,"data-testid":`viewport-pct`,children:(0,b.jsx)(r,{height:`fill`,start:(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(c,{width:e.size,hasDivider:!1,children:(0,b.jsxs)(`div`,{className:`x1de1mus xmkeg23 x1y0btm7 x14i3s5s x1hviunn xuoh4cs`,children:[Math.round(e.size),`px`]})}),(0,b.jsx)(f,{direction:`horizontal`,hasDivider:!0,resizable:e.props})]}),content:(0,b.jsx)(i,{children:`Content`})})})}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 200,
      minSize: 100,
      maxSize: 500
    });
    return <div {...stylex.props(s.shell)}>
        <Layout height="fill" start={<>
              <LayoutPanel width={sidebar.size} hasDivider={false}>
                Sidebar
              </LayoutPanel>
              <ResizeHandle direction="horizontal" hasDivider resizable={sidebar.props} />
            </>} content={<LayoutContent>Content</LayoutContent>} />
      </div>;
  }
}`,...C.parameters?.docs?.source},description:{story:`Two side-by-side panels with a divider handle.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const top = useResizable({
      defaultSize: 150,
      minSize: 60,
      maxSize: 250,
      direction: 'vertical'
    });
    return <div {...stylex.props(s.shell)}>
        <Layout height="fill" header={<>
              <LayoutPanel width="100%" padding={4}>
                <div style={{
            height: top.size
          }}>Header</div>
              </LayoutPanel>
              <ResizeHandle direction="vertical" hasDivider resizable={top.props} />
            </>} content={<LayoutContent>Content</LayoutContent>} />
      </div>;
  }
}`,...w.parameters?.docs?.source},description:{story:`Vertical layout — top and bottom panels.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const left = useResizable({
      defaultSize: 180,
      minSize: 120,
      maxSize: 300
    });
    const right = useResizable({
      defaultSize: 220,
      minSize: 150,
      maxSize: 400
    });
    return <div {...stylex.props(s.shell)}>
        <Layout height="fill" start={<>
              <LayoutPanel width={left.size} hasDivider={false}>
                Folders
              </LayoutPanel>
              <ResizeHandle direction="horizontal" hasDivider resizable={left.props} />
            </>} content={<LayoutContent>Inbox</LayoutContent>} end={<>
              <ResizeHandle direction="horizontal" hasDivider isReversed resizable={right.props} />
              <LayoutPanel width={right.size} hasDivider={false}>
                Preview
              </LayoutPanel>
            </>} />
      </div>;
  }
}`,...T.parameters?.docs?.source},description:{story:`Three panels with two handles — mail client layout.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 200,
      minSize: 120,
      maxSize: 350
    });
    const editor = useResizable({
      defaultSize: 200,
      minSize: 80,
      maxSize: 250,
      direction: 'vertical'
    });
    return <div {...stylex.props(s.shell)}>
        <Layout height="fill" start={<>
              <LayoutPanel width={sidebar.size} hasDivider={false}>
                Explorer
              </LayoutPanel>
              <ResizeHandle direction="horizontal" hasDivider resizable={sidebar.props} />
            </>} content={<LayoutContent padding={0}>
              <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
                <div style={{
            height: editor.size,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
                  Editor
                </div>
                <ResizeHandle direction="vertical" hasDivider resizable={editor.props} />
                <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
                  Terminal
                </div>
              </div>
            </LayoutContent>} />
      </div>;
  }
}`,...E.parameters?.docs?.source},description:{story:`Nested — horizontal split with a vertical split inside.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 250,
      minSize: 100,
      maxSize: 500
    });
    return <div {...stylex.props(s.shell)}>
        <Layout height="fill" start={<>
              <LayoutPanel width={sidebar.size} hasDivider={false}>
                Sidebar
              </LayoutPanel>
              <ResizeHandle direction="horizontal" hasDivider resizable={sidebar.props} />
            </>} content={<LayoutContent>Content</LayoutContent>} />
      </div>;
  }
}`,...D.parameters?.docs?.source},description:{story:`Always-visible pill grip with divider line.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 200,
      minSize: 120,
      maxSize: 350
    });
    const editor = useResizable({
      defaultSize: 200,
      minSize: 80,
      maxSize: 250,
      direction: 'vertical'
    });
    return <div {...stylex.props(s.shell)}>
        <Layout height="fill" start={<>
              <LayoutPanel width={sidebar.size} hasDivider={false} xstyle={s.muted}>
                Explorer
              </LayoutPanel>
              <ResizeHandle direction="horizontal" resizable={sidebar.props} />
            </>} content={<LayoutContent padding={0}>
              <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
                <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
                  Editor
                </div>
                <ResizeHandle direction="vertical" resizable={editor.props} />
                <div {...stylex.props(s.card)} style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
                  Terminal
                </div>
              </div>
            </LayoutContent>} />
      </div>;
  }
}`,...O.parameters?.docs?.source},description:{story:`Mixed container styles — no divider lines, relying on background contrast.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const frameRef = useRef<HTMLDivElement>(null);
    const region = useResizable({
      defaultSize: '40%',
      minSize: '15%',
      maxSize: '60%',
      containerRef: frameRef
    });
    return <div ref={frameRef} {...stylex.props(s.shell)}>
        <Layout height="fill" start={<>
              <LayoutPanel width={region.size} hasDivider={false}>
                <div {...stylex.props(s.card)}>{Math.round(region.size)}px</div>
              </LayoutPanel>
              <ResizeHandle direction="horizontal" hasDivider resizable={region.props} />
            </>} content={<LayoutContent>Content</LayoutContent>} />
      </div>;
  }
}`,...k.parameters?.docs?.source},description:{story:`Percentage configuration, resolved against a container.

\`containerRef\` marks what a percentage is a share of. The panel starts at 40%
of the frame's content box and cannot be dragged past 60% of it. Narrow the
frame and the BOUNDS follow — but the size you dragged to stays the pixel
size you chose, clamped rather than rescaled. That is the whole contract:
percentages configure pixels, they do not create a responsive mode.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <StructuredPercentSizingStory />
}`,...A.parameters?.docs?.source},description:{story:"Structured percentages support one explicit pixel floor or ceiling.\n\n`defaultSize: percent(40, {min: pixel(333)})` is an initial choice only. The same\nvalue on `minSize` remains a live floor, while `percent(10, {max: pixel(400)})` on\n`maxSize` remains a live ceiling. Numbers and exact `Npx` remain pixels; state,\nstorage, callbacks, panel geometry, and ARIA all use resolved pixel values.",...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => {
    const region = useResizable({
      defaultSize: '25%',
      minSize: 80
    });
    return <div {...stylex.props(s.shell)} data-testid="viewport-pct">
        <Layout height="fill" start={<>
              <LayoutPanel width={region.size} hasDivider={false}>
                <div {...stylex.props(s.card)}>{Math.round(region.size)}px</div>
              </LayoutPanel>
              <ResizeHandle direction="horizontal" hasDivider resizable={region.props} />
            </>} content={<LayoutContent>Content</LayoutContent>} />
      </div>;
  }
}`,...j.parameters?.docs?.source},description:{story:"The compatibility path: a percentage with no `containerRef`.\n\nThis is what shipped before percentages could name a container, and it is\nunchanged — `'25%'` resolves once against `window.innerWidth` (1200px on the\nserver), then behaves as pixels. Resize the window and the panel stays where\nit is; only a percentage BOUND would follow.",...j.parameters?.docs?.description}}},M=[`Horizontal`,`Vertical`,`ThreePanel`,`Nested`,`AlwaysVisible`,`MixedContainers`,`PercentageSizing`,`StructuredPercentSizing`,`ViewportPercentage`]}))();export{D as AlwaysVisible,C as Horizontal,O as MixedContainers,E as Nested,k as PercentageSizing,A as StructuredPercentSizing,T as ThreePanel,w as Vertical,j as ViewportPercentage,M as __namedExportsOrder,S as default};