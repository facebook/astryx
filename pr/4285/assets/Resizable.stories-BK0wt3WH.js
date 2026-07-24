import{i as e}from"./preload-helper-CT_b8DTk.js";import{r as t,t as n}from"./LayoutContent-CuPavk6w.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./LayoutPanel-zAyWvAO7.js";import{t as a}from"./Text-Iat6xWeA.js";import{c as o,i as s,t as c}from"./SideNav-ByhnGcWs.js";import{t as l}from"./Heading-D-Ri_Mjs.js";import{c as u}from"./Stack-C7dTtCDZ.js";import{t as d}from"./Layout-BvMyrLFX.js";import{t as f}from"./Text-BUJwo4gL.js";import{t as p}from"./Divider-CyxlzlSx.js";import{t as m}from"./Divider-keWi-KmE.js";import{i as h,t as g}from"./ResizeHandle-D5L0B8IM.js";import{lr as _}from"./iframe-BPhJd9TG.js";var v,y,b,x,S,C,w,T,E,D,O,k;e((()=>{_(),f(),d(),c(),m(),v=r(),y={title:`Lab/Resizable`,component:g,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`Hook-based resizable panel system. useResizable() manages size state; ResizeHandle provides the interactive pill-grip separator with optional divider line.`}}}},b={render:()=>{let e=h({defaultSize:250,minSizePx:150,maxSizePx:500});return(0,v.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(t,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(i,{width:e.size,hasDivider:!1,children:(0,v.jsxs)(u,{gap:2,children:[(0,v.jsx)(l,{level:4,children:`Sidebar`}),(0,v.jsx)(a,{children:(0,v.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})}),(0,v.jsx)(a,{children:`Drag the handle to resize. Arrow keys when focused.`})]})}),(0,v.jsx)(g,{direction:`horizontal`,hasDivider:!0,resizable:e.props,label:`Resize sidebar`})]}),content:(0,v.jsx)(n,{children:(0,v.jsxs)(u,{gap:2,children:[(0,v.jsx)(l,{level:4,children:`Content`}),(0,v.jsx)(a,{children:`Main content area fills remaining space.`})]})})})})}},x={render:()=>{let e=h({defaultSize:250,minSizePx:100,maxSizePx:350});return(0,v.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(t,{height:`fill`,header:(0,v.jsxs)(`div`,{style:{height:e.size},children:[(0,v.jsx)(i,{padding:4,width:`100%`,children:(0,v.jsxs)(u,{gap:2,children:[(0,v.jsx)(l,{level:4,children:`Editor`}),(0,v.jsx)(a,{children:(0,v.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})})]})}),(0,v.jsx)(g,{direction:`vertical`,hasDivider:!0,resizable:e.props,label:`Resize editor`})]}),content:(0,v.jsx)(n,{children:(0,v.jsxs)(u,{gap:2,children:[(0,v.jsx)(l,{level:4,children:`Terminal`}),(0,v.jsx)(a,{children:`Bottom panel fills remaining space.`})]})})})})}},S={render:()=>{let e=h({defaultSize:260,minSizePx:180,collapsible:!0,collapsedSize:60});return(0,v.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(t,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[!e.isCollapsed&&(0,v.jsx)(i,{width:e.size,hasDivider:!1,children:(0,v.jsxs)(u,{gap:2,children:[(0,v.jsx)(l,{level:4,children:`Sidebar`}),(0,v.jsx)(a,{children:(0,v.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})}),(0,v.jsx)(a,{children:`Double-click handle or press Enter to collapse.`})]})}),(0,v.jsx)(g,{direction:`horizontal`,hasDivider:!0,resizable:e.props,label:`Resize sidebar`})]}),content:(0,v.jsx)(n,{children:(0,v.jsxs)(u,{gap:2,children:[(0,v.jsx)(l,{level:4,children:`Content`}),(0,v.jsxs)(a,{children:[`Sidebar is `,e.isCollapsed?`collapsed`:`expanded`,`.`,e.isCollapsed&&(0,v.jsx)(`button`,{onClick:()=>e.expand(),style:{marginLeft:8},children:`Expand`})]})]})})})})}},C={render:()=>{let e=h({defaultSize:220,minSizePx:150,maxSizePx:400}),r=h({defaultSize:280,minSizePx:100,maxSizePx:350});return(0,v.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(t,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(i,{width:e.size,hasDivider:!1,children:(0,v.jsxs)(u,{gap:2,children:[(0,v.jsx)(l,{level:4,children:`Explorer`}),(0,v.jsx)(a,{children:(0,v.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})})]})}),(0,v.jsx)(g,{direction:`horizontal`,hasDivider:!0,resizable:e.props,label:`Resize explorer`})]}),content:(0,v.jsx)(n,{padding:0,children:(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,height:`100%`},children:[(0,v.jsx)(`div`,{style:{flex:`none`,height:r.size,padding:16},children:(0,v.jsxs)(u,{gap:2,children:[(0,v.jsx)(l,{level:4,children:`Editor`}),(0,v.jsx)(a,{children:(0,v.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[r.size,`px`]})})]})}),(0,v.jsx)(g,{direction:`vertical`,hasDivider:!0,resizable:r.props,label:`Resize editor`}),(0,v.jsx)(`div`,{style:{flex:1,padding:16},children:(0,v.jsx)(l,{level:4,children:`Terminal`})})]})})})})}},w={render:()=>{let e=h({defaultSize:260,minSizePx:56,maxSizePx:600,snaps:[56,160,260,400]}),r=e.size<=60;return(0,v.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(t,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(i,{width:e.size,hasDivider:!1,children:r?(0,v.jsx)(a,{children:`☰`}):(0,v.jsxs)(u,{gap:2,children:[(0,v.jsx)(l,{level:4,children:`Sidebar`}),(0,v.jsx)(a,{children:(0,v.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})}),(0,v.jsx)(a,{children:`Snaps to 56 \\u00b7 160 \\u00b7 260 \\u00b7 400px.`})]})}),(0,v.jsx)(g,{direction:`horizontal`,hasDivider:!0,resizable:e.props,label:`Resize sidebar`})]}),content:(0,v.jsx)(n,{children:(0,v.jsx)(l,{level:4,children:`Content`})})})})}},T={render:()=>{let e=h({defaultSize:250,minSizePx:150,maxSizePx:500});return(0,v.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(t,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(i,{width:e.size,hasDivider:!1,children:(0,v.jsxs)(u,{gap:2,children:[(0,v.jsx)(l,{level:4,children:`Sidebar`}),(0,v.jsx)(a,{children:(0,v.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})}),(0,v.jsx)(a,{children:`Pill only appears on hover.`})]})}),(0,v.jsx)(g,{direction:`horizontal`,hasDivider:!0,isAlwaysVisible:!1,resizable:e.props,label:`Resize sidebar`})]}),content:(0,v.jsx)(n,{children:(0,v.jsx)(l,{level:4,children:`Content`})})})})}},E={render:()=>{let e=h({defaultSize:250,minSizePx:150});return(0,v.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,v.jsx)(t,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(i,{width:e.size,hasDivider:!1,children:(0,v.jsx)(l,{level:4,children:`Sidebar (locked)`})}),(0,v.jsx)(g,{direction:`horizontal`,hasDivider:!0,resizable:e.props,isDisabled:!0,label:`Locked`})]}),content:(0,v.jsx)(n,{children:(0,v.jsx)(l,{level:4,children:`Content`})})})})}},D={render:()=>{let e=h({defaultSize:260,minSizePx:180,maxSizePx:450,collapsible:!0,collapsedSize:50});return(0,v.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,style:{height:500},children:(0,v.jsx)(t,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[!e.isCollapsed&&(0,v.jsx)(i,{resizable:e.props,hasDivider:!1,role:`navigation`,label:`Sidebar`,children:(0,v.jsxs)(u,{gap:2,children:[(0,v.jsx)(l,{level:4,children:`Navigation`}),(0,v.jsx)(a,{children:(0,v.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})}),(0,v.jsx)(p,{}),(0,v.jsx)(a,{children:`Drag the handle to resize.`}),(0,v.jsx)(a,{children:`Double-click or press Enter to collapse.`})]})}),(0,v.jsx)(g,{direction:`horizontal`,hasDivider:!0,resizable:e.props,label:`Resize navigation`})]}),content:(0,v.jsx)(n,{children:(0,v.jsxs)(u,{gap:3,children:[(0,v.jsx)(l,{level:3,children:`Main Content`}),(0,v.jsx)(a,{children:`LayoutPanel with resizable prop + ResizeHandle with hasDivider.`}),(0,v.jsxs)(a,{children:[`Sidebar is`,` `,(0,v.jsx)(`strong`,{children:e.isCollapsed?`collapsed`:`expanded`}),e.isCollapsed&&(0,v.jsx)(`button`,{onClick:()=>e.expand(),style:{marginLeft:8},children:`Expand`})]})]})})})})}},O={render:()=>{let e=h({defaultSize:260,minSizePx:200,maxSizePx:400,collapsible:!0,collapsedSize:50,snaps:[56,260]});return(0,v.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,style:{height:500},children:(0,v.jsx)(t,{height:`fill`,start:(0,v.jsxs)(v.Fragment,{children:[!e.isCollapsed&&(0,v.jsx)(i,{width:e.size,hasDivider:!1,padding:0,children:(0,v.jsxs)(o,{children:[(0,v.jsx)(s,{label:`Home`,isSelected:!0}),(0,v.jsx)(s,{label:`Dashboard`}),(0,v.jsx)(s,{label:`Settings`})]})}),(0,v.jsx)(g,{direction:`horizontal`,hasDivider:!0,resizable:e.props,label:`Resize navigation`})]}),content:(0,v.jsx)(n,{children:(0,v.jsxs)(u,{gap:3,children:[(0,v.jsx)(l,{level:3,children:`Dashboard`}),(0,v.jsxs)(a,{children:[(0,v.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]}),` — `,e.isCollapsed?`Collapsed`:`Expanded`]}),(0,v.jsx)(a,{children:`SideNav width driven by useResizable. Double-click handle to collapse.`})]})})})})}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 250,
      minSizePx: 150,
      maxSizePx: 500
    });
    return <div {...stylex.props(ps.shell)}>
        <Layout height="fill" start={<>
              <LayoutPanel width={sidebar.size} hasDivider={false}>
                <Stack gap={2}>
                  <Heading level={4}>Sidebar</Heading>
                  <Text>
                    <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
                  </Text>
                  <Text>
                    Drag the handle to resize. Arrow keys when focused.
                  </Text>
                </Stack>
              </LayoutPanel>
              <ResizeHandle direction="horizontal" hasDivider resizable={sidebar.props} label="Resize sidebar" />
            </>} content={<LayoutContent>
              <Stack gap={2}>
                <Heading level={4}>Content</Heading>
                <Text>Main content area fills remaining space.</Text>
              </Stack>
            </LayoutContent>} />
      </div>;
  }
}`,...b.parameters?.docs?.source},description:{story:`Basic horizontal split with divider line.`,...b.parameters?.docs?.description}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const top = useResizable({
      defaultSize: 250,
      minSizePx: 100,
      maxSizePx: 350
    });
    return <div {...stylex.props(ps.shell)}>
        <Layout height="fill" header={<div style={{
        height: top.size
      }}>
              <LayoutPanel padding={4} width="100%">
                <Stack gap={2}>
                  <Heading level={4}>Editor</Heading>
                  <Text>
                    <span {...stylex.props(ps.sz)}>{top.size}px</span>
                  </Text>
                </Stack>
              </LayoutPanel>
              <ResizeHandle direction="vertical" hasDivider resizable={top.props} label="Resize editor" />
            </div>} content={<LayoutContent>
              <Stack gap={2}>
                <Heading level={4}>Terminal</Heading>
                <Text>Bottom panel fills remaining space.</Text>
              </Stack>
            </LayoutContent>} />
      </div>;
  }
}`,...x.parameters?.docs?.source},description:{story:`Vertical split with divider line.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 260,
      minSizePx: 180,
      collapsible: true,
      collapsedSize: 60
    });
    return <div {...stylex.props(ps.shell)}>
        <Layout height="fill" start={<>
              {!sidebar.isCollapsed && <LayoutPanel width={sidebar.size} hasDivider={false}>
                  <Stack gap={2}>
                    <Heading level={4}>Sidebar</Heading>
                    <Text>
                      <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
                    </Text>
                    <Text>
                      Double-click handle or press Enter to collapse.
                    </Text>
                  </Stack>
                </LayoutPanel>}
              <ResizeHandle direction="horizontal" hasDivider resizable={sidebar.props} label="Resize sidebar" />
            </>} content={<LayoutContent>
              <Stack gap={2}>
                <Heading level={4}>Content</Heading>
                <Text>
                  Sidebar is {sidebar.isCollapsed ? 'collapsed' : 'expanded'}.
                  {sidebar.isCollapsed && <button onClick={() => sidebar.expand()} style={{
              marginLeft: 8
            }}>
                      Expand
                    </button>}
                </Text>
              </Stack>
            </LayoutContent>} />
      </div>;
  }
}`,...S.parameters?.docs?.source},description:{story:`Collapsible sidebar — drag past threshold or double-click to collapse.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const explorer = useResizable({
      defaultSize: 220,
      minSizePx: 150,
      maxSizePx: 400
    });
    const editor = useResizable({
      defaultSize: 280,
      minSizePx: 100,
      maxSizePx: 350
    });
    return <div {...stylex.props(ps.shell)}>
        <Layout height="fill" start={<>
              <LayoutPanel width={explorer.size} hasDivider={false}>
                <Stack gap={2}>
                  <Heading level={4}>Explorer</Heading>
                  <Text>
                    <span {...stylex.props(ps.sz)}>{explorer.size}px</span>
                  </Text>
                </Stack>
              </LayoutPanel>
              <ResizeHandle direction="horizontal" hasDivider resizable={explorer.props} label="Resize explorer" />
            </>} content={<LayoutContent padding={0}>
              <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
                <div style={{
            flex: 'none',
            height: editor.size,
            padding: 16
          }}>
                  <Stack gap={2}>
                    <Heading level={4}>Editor</Heading>
                    <Text>
                      <span {...stylex.props(ps.sz)}>{editor.size}px</span>
                    </Text>
                  </Stack>
                </div>
                <ResizeHandle direction="vertical" hasDivider resizable={editor.props} label="Resize editor" />
                <div style={{
            flex: 1,
            padding: 16
          }}>
                  <Heading level={4}>Terminal</Heading>
                </div>
              </div>
            </LayoutContent>} />
      </div>;
  }
}`,...C.parameters?.docs?.source},description:{story:`Three-panel IDE layout with nested horizontal + vertical splits.`,...C.parameters?.docs?.description}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 260,
      minSizePx: 56,
      maxSizePx: 600,
      snaps: [56, 160, 260, 400]
    });
    const isRail = sidebar.size <= 60;
    return <div {...stylex.props(ps.shell)}>
        <Layout height="fill" start={<>
              <LayoutPanel width={sidebar.size} hasDivider={false}>
                {isRail ? <Text>{'\\u2630'}</Text> : <Stack gap={2}>
                    <Heading level={4}>Sidebar</Heading>
                    <Text>
                      <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
                    </Text>
                    <Text>
                      Snaps to 56 \\u00b7 160 \\u00b7 260 \\u00b7 400px.
                    </Text>
                  </Stack>}
              </LayoutPanel>
              <ResizeHandle direction="horizontal" hasDivider resizable={sidebar.props} label="Resize sidebar" />
            </>} content={<LayoutContent>
              <Heading level={4}>Content</Heading>
            </LayoutContent>} />
      </div>;
  }
}`,...w.parameters?.docs?.source},description:{story:`Snap points — sidebar snaps to predefined widths.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 250,
      minSizePx: 150,
      maxSizePx: 500
    });
    return <div {...stylex.props(ps.shell)}>
        <Layout height="fill" start={<>
              <LayoutPanel width={sidebar.size} hasDivider={false}>
                <Stack gap={2}>
                  <Heading level={4}>Sidebar</Heading>
                  <Text>
                    <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
                  </Text>
                  <Text>Pill only appears on hover.</Text>
                </Stack>
              </LayoutPanel>
              <ResizeHandle direction="horizontal" hasDivider isAlwaysVisible={false} resizable={sidebar.props} label="Resize sidebar" />
            </>} content={<LayoutContent>
              <Heading level={4}>Content</Heading>
            </LayoutContent>} />
      </div>;
  }
}`,...T.parameters?.docs?.source},description:{story:`Pill hidden at rest — only appears on hover/focus.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 250,
      minSizePx: 150
    });
    return <div {...stylex.props(ps.shell)}>
        <Layout height="fill" start={<>
              <LayoutPanel width={sidebar.size} hasDivider={false}>
                <Heading level={4}>Sidebar (locked)</Heading>
              </LayoutPanel>
              <ResizeHandle direction="horizontal" hasDivider resizable={sidebar.props} isDisabled label="Locked" />
            </>} content={<LayoutContent>
              <Heading level={4}>Content</Heading>
            </LayoutContent>} />
      </div>;
  }
}`,...E.parameters?.docs?.source},description:{story:`Disabled handle — divider visible but non-interactive.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const sidebar = useResizable({
      defaultSize: 260,
      minSizePx: 180,
      maxSizePx: 450,
      collapsible: true,
      collapsedSize: 50
    });
    return <div {...stylex.props(ps.shell)} style={{
      height: 500
    }}>
        <Layout height="fill" start={<>
              {!sidebar.isCollapsed && <LayoutPanel resizable={sidebar.props} hasDivider={false} role="navigation" label="Sidebar">
                  <Stack gap={2}>
                    <Heading level={4}>Navigation</Heading>
                    <Text>
                      <span {...stylex.props(ps.sz)}>{sidebar.size}px</span>
                    </Text>
                    <Divider />
                    <Text>Drag the handle to resize.</Text>
                    <Text>Double-click or press Enter to collapse.</Text>
                  </Stack>
                </LayoutPanel>}
              <ResizeHandle direction="horizontal" hasDivider resizable={sidebar.props} label="Resize navigation" />
            </>} content={<LayoutContent>
              <Stack gap={3}>
                <Heading level={3}>Main Content</Heading>
                <Text>
                  LayoutPanel with resizable prop + ResizeHandle with
                  hasDivider.
                </Text>
                <Text>
                  Sidebar is{' '}
                  <strong>
                    {sidebar.isCollapsed ? 'collapsed' : 'expanded'}
                  </strong>
                  {sidebar.isCollapsed && <button onClick={() => sidebar.expand()} style={{
              marginLeft: 8
            }}>
                      Expand
                    </button>}
                </Text>
              </Stack>
            </LayoutContent>} />
      </div>;
  }
}`,...D.parameters?.docs?.source},description:{story:`Integration with Layout — resizable sidebar with collapsible.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const nav = useResizable({
      defaultSize: 260,
      minSizePx: 200,
      maxSizePx: 400,
      collapsible: true,
      collapsedSize: 50,
      snaps: [56, 260]
    });
    return <div {...stylex.props(ps.shell)} style={{
      height: 500
    }}>
        <Layout height="fill" start={<>
              {!nav.isCollapsed && <LayoutPanel width={nav.size} hasDivider={false} padding={0}>
                  <SideNav>
                    <SideNavItem label="Home" isSelected />
                    <SideNavItem label="Dashboard" />
                    <SideNavItem label="Settings" />
                  </SideNav>
                </LayoutPanel>}
              <ResizeHandle direction="horizontal" hasDivider resizable={nav.props} label="Resize navigation" />
            </>} content={<LayoutContent>
              <Stack gap={3}>
                <Heading level={3}>Dashboard</Heading>
                <Text>
                  <span {...stylex.props(ps.sz)}>{nav.size}px</span>
                  {' \\u2014 '}
                  {nav.isCollapsed ? 'Collapsed' : 'Expanded'}
                </Text>
                <Text>
                  SideNav width driven by useResizable. Double-click handle
                  to collapse.
                </Text>
              </Stack>
            </LayoutContent>} />
      </div>;
  }
}`,...O.parameters?.docs?.source},description:{story:`AppShell with resizable SideNav.`,...O.parameters?.docs?.description}}},k=[`HorizontalSplit`,`VerticalSplit`,`Collapsible`,`ThreePanelIDE`,`SnapPoints`,`HiddenPill`,`Disabled`,`WithLayout`,`WithAppShell`]}))();export{S as Collapsible,E as Disabled,T as HiddenPill,b as HorizontalSplit,w as SnapPoints,C as ThreePanelIDE,x as VerticalSplit,O as WithAppShell,D as WithLayout,k as __namedExportsOrder,y as default};