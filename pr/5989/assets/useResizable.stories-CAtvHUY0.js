import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{r,t as i}from"./LayoutContent-CjhAeQWs.js";import{t as a}from"./jsx-runtime-DqZldVDK.js";import{t as o}from"./LayoutPanel-X1VyifZL.js";import{t as s}from"./Layout-B-clvzmX.js";import{i as c}from"./columnUtils-DaUh822W.js";import{i as l,t as u}from"./ResizeHandle-E6_H47hb.js";import{cr as d,or as f,sr as p}from"./iframe-DgRPfpsc.js";function m({children:e}){return(0,v.jsx)(`div`,{children:e})}function h({kind:e,width:t}){let n=(0,_.useRef)(null),a=e.startsWith(`default`),s=e===`minimum`,f=`storybook-structured-percent-${e}`,p=l({...a?{defaultSize:d(40,{min:c(333)})}:s?{defaultSize:0,minSize:d(40,{min:c(333)})}:{defaultSize:500,maxSize:d(10,{max:c(400)})},containerRef:n,direction:`horizontal`,autoSaveId:f}),m=a?null:s?p.props._minSizePx:p.props._maxSizePx,h=a?`defaultSize: percent(40, {min: pixel(333)})`:s?`minSize: percent(40, {min: pixel(333)})`:`maxSize: percent(10, {max: pixel(400)})`;return(0,v.jsxs)(`div`,{ref:n,"data-testid":`structured-percent-${e}-frame`,"data-width":t,"data-size":p.size,"data-resolved-bound":m??void 0,"data-storage-key":`astryx-resizable:${f}`,className:`xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr x1b51vyi`,style:{width:t},children:[(0,v.jsxs)(`div`,{className:`x1de1mus xmkeg23 x1y0btm7 x14i3s5s x1hviunn xuoh4cs`,children:[(0,v.jsxs)(`strong`,{children:[t,`px outer / `,t-2,`px content`]}),(0,v.jsx)(`div`,{children:(0,v.jsx)(`code`,{children:h})}),(0,v.jsxs)(`div`,{children:[Math.round(p.size),`px selected`,m==null?` initially`:` · ${Math.round(m)}px resolved bound`]})]}),(0,v.jsx)(`div`,{className:`xwzfr38`,children:(0,v.jsx)(r,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsxs)(o,{width:p.size,hasDivider:!1,"data-testid":`structured-percent-${e}-panel`,children:[Math.round(p.size),`px`]}),(0,v.jsx)(u,{direction:`horizontal`,hasDivider:!0,label:`Resize structured percent ${e} example`,resizable:p.props})]}),content:(0,v.jsx)(i,{children:a?`Later basis changes do not rescale this selected pixel size.`:`The percentage bound follows later basis changes.`})})})]})}function g(){let[e,t]=(0,_.useState)(!1),[n,r]=(0,_.useState)(!1);return(0,_.useEffect)(()=>{for(let e of[`default-wide`,`default-narrow`,`minimum`,`maximum`])localStorage.removeItem(`astryx-resizable:storybook-structured-percent-${e}`);t(!0)},[]),e?(0,v.jsxs)(`div`,{"data-testid":`structured-percent-sizing`,className:`xrvj5dj x18g69wz`,children:[(0,v.jsx)(`button`,{type:`button`,"data-testid":`structured-percent-toggle-bases`,onClick:()=>r(e=>!e),children:n?`Restore initial bases`:`Change bases`}),(0,v.jsx)(h,{kind:`default-wide`,width:n?500:1e3}),(0,v.jsx)(h,{kind:`default-narrow`,width:n?1e3:500}),(0,v.jsx)(h,{kind:`minimum`,width:n?1e3:500}),(0,v.jsx)(h,{kind:`maximum`,width:n?500:1e3})]}):null}var _,v,y,b,x,S,C,w,T,E,D,O,k,A;e((()=>{_=t(n()),f(),p(),s(),v=a(),y={muted:{kWkggS:`xwmxj5m`,$$css:!0}},b={title:`Core/Hooks/useResizable`,component:m,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`Hook that manages resize state for panel regions. Pair with ResizeHandle for interactive resizing.`}}}},x={render:()=>{let e=l({defaultSize:200,minSizePx:100,maxSizePx:500});return(0,v.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(r,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(o,{width:e.size,hasDivider:!1,children:`Sidebar`}),(0,v.jsx)(u,{direction:`horizontal`,hasDivider:!0,resizable:e.props})]}),content:(0,v.jsx)(i,{children:`Content`})})})}},S={render:()=>{let e=l({defaultSize:150,minSizePx:60,maxSizePx:250,direction:`vertical`});return(0,v.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(r,{height:`fill`,header:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(o,{width:`100%`,padding:4,children:(0,v.jsx)(`div`,{style:{height:e.size},children:`Header`})}),(0,v.jsx)(u,{direction:`vertical`,hasDivider:!0,resizable:e.props})]}),content:(0,v.jsx)(i,{children:`Content`})})})}},C={render:()=>{let e=l({defaultSize:180,minSizePx:120,maxSizePx:300}),t=l({defaultSize:220,minSizePx:150,maxSizePx:400});return(0,v.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(r,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(o,{width:e.size,hasDivider:!1,children:`Folders`}),(0,v.jsx)(u,{direction:`horizontal`,hasDivider:!0,resizable:e.props})]}),content:(0,v.jsx)(i,{children:`Inbox`}),end:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(u,{direction:`horizontal`,hasDivider:!0,isReversed:!0,resizable:t.props}),(0,v.jsx)(o,{width:t.size,hasDivider:!1,children:`Preview`})]})})})}},w={render:()=>{let e=l({defaultSize:200,minSizePx:120,maxSizePx:350}),t=l({defaultSize:200,minSizePx:80,maxSizePx:250,direction:`vertical`});return(0,v.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(r,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(o,{width:e.size,hasDivider:!1,children:`Explorer`}),(0,v.jsx)(u,{direction:`horizontal`,hasDivider:!0,resizable:e.props})]}),content:(0,v.jsx)(i,{padding:0,children:(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,height:`100%`},children:[(0,v.jsx)(`div`,{style:{height:t.size,flexShrink:0,display:`flex`,alignItems:`center`,justifyContent:`center`},children:`Editor`}),(0,v.jsx)(u,{direction:`vertical`,hasDivider:!0,resizable:t.props}),(0,v.jsx)(`div`,{style:{flex:1,display:`flex`,alignItems:`center`,justifyContent:`center`},children:`Terminal`})]})})})})}},T={render:()=>{let e=l({defaultSize:250,minSizePx:100,maxSizePx:500});return(0,v.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(r,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(o,{width:e.size,hasDivider:!1,children:`Sidebar`}),(0,v.jsx)(u,{direction:`horizontal`,hasDivider:!0,resizable:e.props})]}),content:(0,v.jsx)(i,{children:`Content`})})})}},E={render:()=>{let e=l({defaultSize:200,minSizePx:120,maxSizePx:350}),t=l({defaultSize:200,minSizePx:80,maxSizePx:250,direction:`vertical`});return(0,v.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(r,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(o,{width:e.size,hasDivider:!1,xstyle:y.muted,children:`Explorer`}),(0,v.jsx)(u,{direction:`horizontal`,resizable:e.props})]}),content:(0,v.jsx)(i,{padding:0,children:(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,height:`100%`},children:[(0,v.jsx)(`div`,{style:{flex:1,display:`flex`,alignItems:`center`,justifyContent:`center`},children:`Editor`}),(0,v.jsx)(u,{direction:`vertical`,resizable:t.props}),(0,v.jsx)(`div`,{className:`x1de1mus xmkeg23 x1y0btm7 x14i3s5s x1hviunn xuoh4cs`,style:{flex:1,display:`flex`,alignItems:`center`,justifyContent:`center`},children:`Terminal`})]})})})})}},D={render:()=>{let e=(0,_.useRef)(null),t=l({defaultSize:`40%`,minSize:`15%`,maxSize:`60%`,containerRef:e});return(0,v.jsx)(`div`,{ref:e,className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(r,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(o,{width:t.size,hasDivider:!1,children:(0,v.jsxs)(`div`,{className:`x1de1mus xmkeg23 x1y0btm7 x14i3s5s x1hviunn xuoh4cs`,children:[Math.round(t.size),`px`]})}),(0,v.jsx)(u,{direction:`horizontal`,hasDivider:!0,resizable:t.props})]}),content:(0,v.jsx)(i,{children:`Content`})})})}},O={render:()=>(0,v.jsx)(g,{})},k={render:()=>{let e=l({defaultSize:`25%`,minSize:80});return(0,v.jsx)(`div`,{className:`x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,"data-testid":`viewport-pct`,children:(0,v.jsx)(r,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(o,{width:e.size,hasDivider:!1,children:(0,v.jsxs)(`div`,{className:`x1de1mus xmkeg23 x1y0btm7 x14i3s5s x1hviunn xuoh4cs`,children:[Math.round(e.size),`px`]})}),(0,v.jsx)(u,{direction:`horizontal`,hasDivider:!0,resizable:e.props})]}),content:(0,v.jsx)(i,{children:`Content`})})})}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 200,
      minSizePx: 100,
      maxSizePx: 500
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
}`,...x.parameters?.docs?.source},description:{story:`Two side-by-side panels with a divider handle.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const top = useResizable({
      defaultSize: 150,
      minSizePx: 60,
      maxSizePx: 250,
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
}`,...S.parameters?.docs?.source},description:{story:`Vertical layout — top and bottom panels.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const left = useResizable({
      defaultSize: 180,
      minSizePx: 120,
      maxSizePx: 300
    });
    const right = useResizable({
      defaultSize: 220,
      minSizePx: 150,
      maxSizePx: 400
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
}`,...C.parameters?.docs?.source},description:{story:`Three panels with two handles — mail client layout.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 200,
      minSizePx: 120,
      maxSizePx: 350
    });
    const editor = useResizable({
      defaultSize: 200,
      minSizePx: 80,
      maxSizePx: 250,
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
}`,...w.parameters?.docs?.source},description:{story:`Nested — horizontal split with a vertical split inside.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 250,
      minSizePx: 100,
      maxSizePx: 500
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
}`,...T.parameters?.docs?.source},description:{story:`Always-visible pill grip with divider line.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 200,
      minSizePx: 120,
      maxSizePx: 350
    });
    const editor = useResizable({
      defaultSize: 200,
      minSizePx: 80,
      maxSizePx: 250,
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
}`,...E.parameters?.docs?.source},description:{story:`Mixed container styles — no divider lines, relying on background contrast.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:`Percentage configuration, resolved against a container.

\`containerRef\` marks what a percentage is a share of. The panel starts at 40%
of the frame's content box and cannot be dragged past 60% of it. Narrow the
frame and the BOUNDS follow — but the size you dragged to stays the pixel
size you chose, clamped rather than rescaled. That is the whole contract:
percentages configure pixels, they do not create a responsive mode.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <StructuredPercentSizingStory />
}`,...O.parameters?.docs?.source},description:{story:"Structured percentages support one explicit pixel floor or ceiling.\n\n`defaultSize: percent(40, {min: pixel(333)})` is an initial choice only. The same\nvalue on `minSize` remains a live floor, while `percent(10, {max: pixel(400)})` on\n`maxSize` remains a live ceiling. Numbers and exact `Npx` remain pixels; state,\nstorage, callbacks, panel geometry, and ARIA all use resolved pixel values.",...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:"The compatibility path: a percentage with no `containerRef`.\n\nThis is what shipped before percentages could name a container, and it is\nunchanged — `'25%'` resolves once against `window.innerWidth` (1200px on the\nserver), then behaves as pixels. Resize the window and the panel stays where\nit is; only a percentage BOUND would follow.",...k.parameters?.docs?.description}}},A=[`Horizontal`,`Vertical`,`ThreePanel`,`Nested`,`AlwaysVisible`,`MixedContainers`,`PercentageSizing`,`StructuredPercentSizing`,`ViewportPercentage`]}))();export{T as AlwaysVisible,x as Horizontal,E as MixedContainers,w as Nested,D as PercentageSizing,O as StructuredPercentSizing,C as ThreePanel,S as Vertical,k as ViewportPercentage,A as __namedExportsOrder,b as default};