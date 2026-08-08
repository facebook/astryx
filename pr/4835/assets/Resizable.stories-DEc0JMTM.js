import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,n,r,t as i}from"./LayoutContent-Bp6k5ngv.js";import{n as a,t as o}from"./Text-BfjtEFtP.js";import{t as s}from"./jsx-runtime-DeHZSEgm.js";import{n as c,t as l}from"./LayoutPanel-CI37B9wA.js";import{n as u,t as d}from"./Divider-D4km6nVj.js";import{n as f,t as p}from"./Heading-CaMVckJS.js";import{n as m,t as h}from"./Stack-D-ryFIvw.js";import{i as g,n as _,r as v,t as y}from"./ResizeHandle-zs0Hr-oh.js";import{i as b,n as x,r as S,t as C}from"./SideNavItem-8yGqs6FV.js";var w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{_(),v(),a(),f(),t(),n(),c(),m(),b(),x(),u(),w=s(),T={title:`Lab/Resizable`,component:y,tags:[`autodocs`],parameters:{layout:`padded`,docs:{description:{component:`Hook-based resizable panel system. useResizable() manages size state; ResizeHandle provides the interactive pill-grip separator with optional divider line.`}}}},E={render:()=>{let e=g({defaultSize:250,minSizePx:150,maxSizePx:500});return(0,w.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,w.jsx)(r,{height:`fill`,start:(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(l,{width:e.size,hasDivider:!1,children:(0,w.jsxs)(h,{gap:2,children:[(0,w.jsx)(p,{level:4,children:`Sidebar`}),(0,w.jsx)(o,{children:(0,w.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})}),(0,w.jsx)(o,{children:`Drag the handle to resize. Arrow keys when focused.`})]})}),(0,w.jsx)(y,{direction:`horizontal`,hasDivider:!0,resizable:e.props,label:`Resize sidebar`})]}),content:(0,w.jsx)(i,{children:(0,w.jsxs)(h,{gap:2,children:[(0,w.jsx)(p,{level:4,children:`Content`}),(0,w.jsx)(o,{children:`Main content area fills remaining space.`})]})})})})}},D={render:()=>{let e=g({defaultSize:250,minSizePx:100,maxSizePx:350});return(0,w.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,w.jsx)(r,{height:`fill`,header:(0,w.jsxs)(`div`,{style:{height:e.size},children:[(0,w.jsx)(l,{padding:4,width:`100%`,children:(0,w.jsxs)(h,{gap:2,children:[(0,w.jsx)(p,{level:4,children:`Editor`}),(0,w.jsx)(o,{children:(0,w.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})})]})}),(0,w.jsx)(y,{direction:`vertical`,hasDivider:!0,resizable:e.props,label:`Resize editor`})]}),content:(0,w.jsx)(i,{children:(0,w.jsxs)(h,{gap:2,children:[(0,w.jsx)(p,{level:4,children:`Terminal`}),(0,w.jsx)(o,{children:`Bottom panel fills remaining space.`})]})})})})}},O={render:()=>{let e=g({defaultSize:260,minSizePx:180,collapsible:!0,collapsedSize:60});return(0,w.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,w.jsx)(r,{height:`fill`,start:(0,w.jsxs)(w.Fragment,{children:[!e.isCollapsed&&(0,w.jsx)(l,{width:e.size,hasDivider:!1,children:(0,w.jsxs)(h,{gap:2,children:[(0,w.jsx)(p,{level:4,children:`Sidebar`}),(0,w.jsx)(o,{children:(0,w.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})}),(0,w.jsx)(o,{children:`Double-click handle or press Enter to collapse.`})]})}),(0,w.jsx)(y,{direction:`horizontal`,hasDivider:!0,resizable:e.props,label:`Resize sidebar`})]}),content:(0,w.jsx)(i,{children:(0,w.jsxs)(h,{gap:2,children:[(0,w.jsx)(p,{level:4,children:`Content`}),(0,w.jsxs)(o,{children:[`Sidebar is `,e.isCollapsed?`collapsed`:`expanded`,`.`,e.isCollapsed&&(0,w.jsx)(`button`,{onClick:()=>e.expand(),style:{marginLeft:8},children:`Expand`})]})]})})})})}},k={render:()=>{let e=g({defaultSize:220,minSizePx:150,maxSizePx:400}),t=g({defaultSize:280,minSizePx:100,maxSizePx:350});return(0,w.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,w.jsx)(r,{height:`fill`,start:(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(l,{width:e.size,hasDivider:!1,children:(0,w.jsxs)(h,{gap:2,children:[(0,w.jsx)(p,{level:4,children:`Explorer`}),(0,w.jsx)(o,{children:(0,w.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})})]})}),(0,w.jsx)(y,{direction:`horizontal`,hasDivider:!0,resizable:e.props,label:`Resize explorer`})]}),content:(0,w.jsx)(i,{padding:0,children:(0,w.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,height:`100%`},children:[(0,w.jsx)(`div`,{style:{flex:`none`,height:t.size,padding:16},children:(0,w.jsxs)(h,{gap:2,children:[(0,w.jsx)(p,{level:4,children:`Editor`}),(0,w.jsx)(o,{children:(0,w.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[t.size,`px`]})})]})}),(0,w.jsx)(y,{direction:`vertical`,hasDivider:!0,resizable:t.props,label:`Resize editor`}),(0,w.jsx)(`div`,{style:{flex:1,padding:16},children:(0,w.jsx)(p,{level:4,children:`Terminal`})})]})})})})}},A={render:()=>{let e=g({defaultSize:260,minSizePx:56,maxSizePx:600,snaps:[56,160,260,400]}),t=e.size<=60;return(0,w.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,w.jsx)(r,{height:`fill`,start:(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(l,{width:e.size,hasDivider:!1,children:t?(0,w.jsx)(o,{children:`☰`}):(0,w.jsxs)(h,{gap:2,children:[(0,w.jsx)(p,{level:4,children:`Sidebar`}),(0,w.jsx)(o,{children:(0,w.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})}),(0,w.jsx)(o,{children:`Snaps to 56 \\u00b7 160 \\u00b7 260 \\u00b7 400px.`})]})}),(0,w.jsx)(y,{direction:`horizontal`,hasDivider:!0,resizable:e.props,label:`Resize sidebar`})]}),content:(0,w.jsx)(i,{children:(0,w.jsx)(p,{level:4,children:`Content`})})})})}},j={render:()=>{let e=g({defaultSize:250,minSizePx:150,maxSizePx:500});return(0,w.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,w.jsx)(r,{height:`fill`,start:(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(l,{width:e.size,hasDivider:!1,children:(0,w.jsxs)(h,{gap:2,children:[(0,w.jsx)(p,{level:4,children:`Sidebar`}),(0,w.jsx)(o,{children:(0,w.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})}),(0,w.jsx)(o,{children:`Pill only appears on hover.`})]})}),(0,w.jsx)(y,{direction:`horizontal`,hasDivider:!0,isAlwaysVisible:!1,resizable:e.props,label:`Resize sidebar`})]}),content:(0,w.jsx)(i,{children:(0,w.jsx)(p,{level:4,children:`Content`})})})})}},M={render:()=>{let e=g({defaultSize:250,minSizePx:150});return(0,w.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,children:(0,w.jsx)(r,{height:`fill`,start:(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(l,{width:e.size,hasDivider:!1,children:(0,w.jsx)(p,{level:4,children:`Sidebar (locked)`})}),(0,w.jsx)(y,{direction:`horizontal`,hasDivider:!0,resizable:e.props,isDisabled:!0,label:`Locked`})]}),content:(0,w.jsx)(i,{children:(0,w.jsx)(p,{level:4,children:`Content`})})})})}},N={render:()=>{let e=g({defaultSize:260,minSizePx:180,maxSizePx:450,collapsible:!0,collapsedSize:50});return(0,w.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,style:{height:500},children:(0,w.jsx)(r,{height:`fill`,start:(0,w.jsxs)(w.Fragment,{children:[!e.isCollapsed&&(0,w.jsx)(l,{resizable:e.props,hasDivider:!1,role:`navigation`,label:`Sidebar`,children:(0,w.jsxs)(h,{gap:2,children:[(0,w.jsx)(p,{level:4,children:`Navigation`}),(0,w.jsx)(o,{children:(0,w.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]})}),(0,w.jsx)(d,{}),(0,w.jsx)(o,{children:`Drag the handle to resize.`}),(0,w.jsx)(o,{children:`Double-click or press Enter to collapse.`})]})}),(0,w.jsx)(y,{direction:`horizontal`,hasDivider:!0,resizable:e.props,label:`Resize navigation`})]}),content:(0,w.jsx)(i,{children:(0,w.jsxs)(h,{gap:3,children:[(0,w.jsx)(p,{level:3,children:`Main Content`}),(0,w.jsx)(o,{children:`LayoutPanel with resizable prop + ResizeHandle with hasDivider.`}),(0,w.jsxs)(o,{children:[`Sidebar is`,` `,(0,w.jsx)(`strong`,{children:e.isCollapsed?`collapsed`:`expanded`}),e.isCollapsed&&(0,w.jsx)(`button`,{onClick:()=>e.expand(),style:{marginLeft:8},children:`Expand`})]})]})})})})}},P={render:()=>{let e=g({defaultSize:260,minSizePx:200,maxSizePx:400,collapsible:!0,collapsedSize:50,snaps:[56,260]});return(0,w.jsx)(`div`,{className:`x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr`,style:{height:500},children:(0,w.jsx)(r,{height:`fill`,start:(0,w.jsxs)(w.Fragment,{children:[!e.isCollapsed&&(0,w.jsx)(l,{width:e.size,hasDivider:!1,padding:0,children:(0,w.jsxs)(S,{children:[(0,w.jsx)(C,{label:`Home`,isSelected:!0}),(0,w.jsx)(C,{label:`Dashboard`}),(0,w.jsx)(C,{label:`Settings`})]})}),(0,w.jsx)(y,{direction:`horizontal`,hasDivider:!0,resizable:e.props,label:`Resize navigation`})]}),content:(0,w.jsx)(i,{children:(0,w.jsxs)(h,{gap:3,children:[(0,w.jsx)(p,{level:3,children:`Dashboard`}),(0,w.jsxs)(o,{children:[(0,w.jsxs)(`span`,{className:`x197sbye xfifm61 x1ey7xld`,children:[e.size,`px`]}),` — `,e.isCollapsed?`Collapsed`:`Expanded`]}),(0,w.jsx)(o,{children:`SideNav width driven by useResizable. Double-click handle to collapse.`})]})})})})}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source},description:{story:`Basic horizontal split with divider line.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:`Vertical split with divider line.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source},description:{story:`Collapsible sidebar — drag past threshold or double-click to collapse.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source},description:{story:`Three-panel IDE layout with nested horizontal + vertical splits.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source},description:{story:`Snap points — sidebar snaps to predefined widths.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source},description:{story:`Pill hidden at rest — only appears on hover/focus.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source},description:{story:`Disabled handle — divider visible but non-interactive.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source},description:{story:`Integration with Layout — resizable sidebar with collapsible.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source},description:{story:`AppShell with resizable SideNav.`,...P.parameters?.docs?.description}}},F=[`HorizontalSplit`,`VerticalSplit`,`Collapsible`,`ThreePanelIDE`,`SnapPoints`,`HiddenPill`,`Disabled`,`WithLayout`,`WithAppShell`]})))()}I();export{O as Collapsible,M as Disabled,j as HiddenPill,E as HorizontalSplit,A as SnapPoints,k as ThreePanelIDE,D as VerticalSplit,P as WithAppShell,N as WithLayout,F as __namedExportsOrder,T as default};