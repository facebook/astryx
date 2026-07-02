import{a1 as e}from"./iframe-BzSUXdLu.js";import{u as t,R as s}from"./ResizeHandle-BjMAvdtc.js";import{L as a,b as o}from"./LayoutContent-BP0Q4IuR.js";import{L as n}from"./LayoutPanel-DLzHvFDC.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./stackItem.stylex-CgqrJM4N.js";import"./padding.stylex-Dl2_Pyt1.js";const m={muted:{kWkggS:"xwmxj5m",$$css:!0}};function u({children:i}){return e.jsx("div",{children:i})}const P={title:"Core/useResizable",component:u,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"Hook that manages resize state for panel regions. Pair with ResizeHandle for interactive resizing."}}}},d={render:()=>{const i=t({defaultSize:200,minSizePx:100,maxSizePx:500});return e.jsx("div",{className:"x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(a,{height:"fill",start:e.jsxs(e.Fragment,{children:[e.jsx(n,{width:i.size,hasDivider:!1,children:"Sidebar"}),e.jsx(s,{direction:"horizontal",hasDivider:!0,resizable:i.props})]}),content:e.jsx(o,{children:"Content"})})})}},l={render:()=>{const i=t({defaultSize:150,minSizePx:60,maxSizePx:250});return e.jsx("div",{className:"x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(a,{height:"fill",header:e.jsxs(e.Fragment,{children:[e.jsx(n,{width:"100%",padding:4,children:e.jsx("div",{style:{height:i.size},children:"Header"})}),e.jsx(s,{direction:"vertical",hasDivider:!0,resizable:i.props})]}),content:e.jsx(o,{children:"Content"})})})}},c={render:()=>{const i=t({defaultSize:180,minSizePx:120,maxSizePx:300}),r=t({defaultSize:220,minSizePx:150,maxSizePx:400});return e.jsx("div",{className:"x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(a,{height:"fill",start:e.jsxs(e.Fragment,{children:[e.jsx(n,{width:i.size,hasDivider:!1,children:"Folders"}),e.jsx(s,{direction:"horizontal",hasDivider:!0,resizable:i.props})]}),content:e.jsx(o,{children:"Inbox"}),end:e.jsxs(e.Fragment,{children:[e.jsx(s,{direction:"horizontal",hasDivider:!0,isReversed:!0,resizable:r.props}),e.jsx(n,{width:r.size,hasDivider:!1,children:"Preview"})]})})})}},x={render:()=>{const i=t({defaultSize:200,minSizePx:120,maxSizePx:350}),r=t({defaultSize:200,minSizePx:80,maxSizePx:250});return e.jsx("div",{className:"x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(a,{height:"fill",start:e.jsxs(e.Fragment,{children:[e.jsx(n,{width:i.size,hasDivider:!1,children:"Explorer"}),e.jsx(s,{direction:"horizontal",hasDivider:!0,resizable:i.props})]}),content:e.jsx(o,{padding:0,children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:[e.jsx("div",{style:{height:r.size,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"},children:"Editor"}),e.jsx(s,{direction:"vertical",hasDivider:!0,resizable:r.props}),e.jsx("div",{style:{flex:1,display:"flex",alignItems:"center",justifyContent:"center"},children:"Terminal"})]})})})})}},h={render:()=>{const i=t({defaultSize:250,minSizePx:100,maxSizePx:500});return e.jsx("div",{className:"x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(a,{height:"fill",start:e.jsxs(e.Fragment,{children:[e.jsx(n,{width:i.size,hasDivider:!1,children:"Sidebar"}),e.jsx(s,{direction:"horizontal",hasDivider:!0,resizable:i.props})]}),content:e.jsx(o,{children:"Content"})})})}},p={render:()=>{const i=t({defaultSize:200,minSizePx:120,maxSizePx:350}),r=t({defaultSize:200,minSizePx:80,maxSizePx:250});return e.jsx("div",{className:"x1vd4hg5 xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(a,{height:"fill",start:e.jsxs(e.Fragment,{children:[e.jsx(n,{width:i.size,hasDivider:!1,xstyle:m.muted,children:"Explorer"}),e.jsx(s,{direction:"horizontal",resizable:i.props})]}),content:e.jsx(o,{padding:0,children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:[e.jsx("div",{style:{flex:1,display:"flex",alignItems:"center",justifyContent:"center"},children:"Editor"}),e.jsx(s,{direction:"vertical",resizable:r.props}),e.jsx("div",{className:"x1de1mus xmkeg23 x1y0btm7 x14i3s5s x1hviunn xuoh4cs",style:{flex:1,display:"flex",alignItems:"center",justifyContent:"center"},children:"Terminal"})]})})})})}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source},description:{story:"Two side-by-side panels with a divider handle.",...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const top = useResizable({
      defaultSize: 150,
      minSizePx: 60,
      maxSizePx: 250
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
}`,...l.parameters?.docs?.source},description:{story:"Vertical layout — top and bottom panels.",...l.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source},description:{story:"Three panels with two handles — mail client layout.",...c.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 200,
      minSizePx: 120,
      maxSizePx: 350
    });
    const editor = useResizable({
      defaultSize: 200,
      minSizePx: 80,
      maxSizePx: 250
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
}`,...x.parameters?.docs?.source},description:{story:"Nested — horizontal split with a vertical split inside.",...x.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:"Always-visible pill grip with divider line.",...h.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 200,
      minSizePx: 120,
      maxSizePx: 350
    });
    const editor = useResizable({
      defaultSize: 200,
      minSizePx: 80,
      maxSizePx: 250
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
}`,...p.parameters?.docs?.source},description:{story:"Mixed container styles — no divider lines, relying on background contrast.",...p.parameters?.docs?.description}}};const L=["Horizontal","Vertical","ThreePanel","Nested","AlwaysVisible","MixedContainers"];export{h as AlwaysVisible,d as Horizontal,p as MixedContainers,x as Nested,c as ThreePanel,l as Vertical,L as __namedExportsOrder,P as default};
