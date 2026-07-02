import{a1 as e,T as s}from"./iframe-Z8EfSKmM.js";import{R as n,u as t}from"./ResizeHandle-CazPi0km.js";import{S as r}from"./Stack-zPlvthC6.js";import{L as l,b as d}from"./LayoutContent-4Hd2RhdB.js";import{L as o}from"./LayoutPanel-rPkCyDSL.js";import{S,a as y}from"./SideNavItem-CFYUbk6t.js";import{D as j}from"./Divider-Bc68YBOk.js";import{H as a}from"./Heading-D0-Rn-po.js";import"./preload-helper-Ct5FWWRu.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";import"./stackItem.stylex-CgqrJM4N.js";import"./AppShellMobileContext-C0mzljc6.js";import"./SideNavRenderContext-Dyfg1i7m.js";import"./navItemStyles.stylex-BX6inZc_.js";import"./usePopover-ay_XHQXA.js";const M={title:"Lab/Resizable",component:n,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"Hook-based resizable panel system. useResizable() manages size state; ResizeHandle provides the interactive pill-grip separator with optional divider line."}}}},p={render:()=>{const i=t({defaultSize:250,minSizePx:150,maxSizePx:500});return e.jsx("div",{className:"x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(l,{height:"fill",start:e.jsxs(e.Fragment,{children:[e.jsx(o,{width:i.size,hasDivider:!1,children:e.jsxs(r,{gap:2,children:[e.jsx(a,{level:4,children:"Sidebar"}),e.jsx(s,{children:e.jsxs("span",{className:"x197sbye xfifm61 x1ey7xld",children:[i.size,"px"]})}),e.jsx(s,{children:"Drag the handle to resize. Arrow keys when focused."})]})}),e.jsx(n,{direction:"horizontal",hasDivider:!0,resizable:i.props,label:"Resize sidebar"})]}),content:e.jsx(d,{children:e.jsxs(r,{gap:2,children:[e.jsx(a,{level:4,children:"Content"}),e.jsx(s,{children:"Main content area fills remaining space."})]})})})})}},c={render:()=>{const i=t({defaultSize:250,minSizePx:100,maxSizePx:350});return e.jsx("div",{className:"x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(l,{height:"fill",header:e.jsxs("div",{style:{height:i.size},children:[e.jsx(o,{padding:4,width:"100%",children:e.jsxs(r,{gap:2,children:[e.jsx(a,{level:4,children:"Editor"}),e.jsx(s,{children:e.jsxs("span",{className:"x197sbye xfifm61 x1ey7xld",children:[i.size,"px"]})})]})}),e.jsx(n,{direction:"vertical",hasDivider:!0,resizable:i.props,label:"Resize editor"})]}),content:e.jsx(d,{children:e.jsxs(r,{gap:2,children:[e.jsx(a,{level:4,children:"Terminal"}),e.jsx(s,{children:"Bottom panel fills remaining space."})]})})})})}},h={render:()=>{const i=t({defaultSize:260,minSizePx:180,collapsible:!0,collapsedSize:60});return e.jsx("div",{className:"x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(l,{height:"fill",start:e.jsxs(e.Fragment,{children:[!i.isCollapsed&&e.jsx(o,{width:i.size,hasDivider:!1,children:e.jsxs(r,{gap:2,children:[e.jsx(a,{level:4,children:"Sidebar"}),e.jsx(s,{children:e.jsxs("span",{className:"x197sbye xfifm61 x1ey7xld",children:[i.size,"px"]})}),e.jsx(s,{children:"Double-click handle or press Enter to collapse."})]})}),e.jsx(n,{direction:"horizontal",hasDivider:!0,resizable:i.props,label:"Resize sidebar"})]}),content:e.jsx(d,{children:e.jsxs(r,{gap:2,children:[e.jsx(a,{level:4,children:"Content"}),e.jsxs(s,{children:["Sidebar is ",i.isCollapsed?"collapsed":"expanded",".",i.isCollapsed&&e.jsx("button",{onClick:()=>i.expand(),style:{marginLeft:8},children:"Expand"})]})]})})})})}},b={render:()=>{const i=t({defaultSize:220,minSizePx:150,maxSizePx:400}),x=t({defaultSize:280,minSizePx:100,maxSizePx:350});return e.jsx("div",{className:"x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(l,{height:"fill",start:e.jsxs(e.Fragment,{children:[e.jsx(o,{width:i.size,hasDivider:!1,children:e.jsxs(r,{gap:2,children:[e.jsx(a,{level:4,children:"Explorer"}),e.jsx(s,{children:e.jsxs("span",{className:"x197sbye xfifm61 x1ey7xld",children:[i.size,"px"]})})]})}),e.jsx(n,{direction:"horizontal",hasDivider:!0,resizable:i.props,label:"Resize explorer"})]}),content:e.jsx(d,{padding:0,children:e.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:[e.jsx("div",{style:{flex:"none",height:x.size,padding:16},children:e.jsxs(r,{gap:2,children:[e.jsx(a,{level:4,children:"Editor"}),e.jsx(s,{children:e.jsxs("span",{className:"x197sbye xfifm61 x1ey7xld",children:[x.size,"px"]})})]})}),e.jsx(n,{direction:"vertical",hasDivider:!0,resizable:x.props,label:"Resize editor"}),e.jsx("div",{style:{flex:1,padding:16},children:e.jsx(a,{level:4,children:"Terminal"})})]})})})})}},z={render:()=>{const i=t({defaultSize:260,minSizePx:56,maxSizePx:600,snaps:[56,160,260,400]}),x=i.size<=60;return e.jsx("div",{className:"x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(l,{height:"fill",start:e.jsxs(e.Fragment,{children:[e.jsx(o,{width:i.size,hasDivider:!1,children:x?e.jsx(s,{children:"☰"}):e.jsxs(r,{gap:2,children:[e.jsx(a,{level:4,children:"Sidebar"}),e.jsx(s,{children:e.jsxs("span",{className:"x197sbye xfifm61 x1ey7xld",children:[i.size,"px"]})}),e.jsx(s,{children:"Snaps to 56 \\u00b7 160 \\u00b7 260 \\u00b7 400px."})]})}),e.jsx(n,{direction:"horizontal",hasDivider:!0,resizable:i.props,label:"Resize sidebar"})]}),content:e.jsx(d,{children:e.jsx(a,{level:4,children:"Content"})})})})}},u={render:()=>{const i=t({defaultSize:250,minSizePx:150,maxSizePx:500});return e.jsx("div",{className:"x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(l,{height:"fill",start:e.jsxs(e.Fragment,{children:[e.jsx(o,{width:i.size,hasDivider:!1,children:e.jsxs(r,{gap:2,children:[e.jsx(a,{level:4,children:"Sidebar"}),e.jsx(s,{children:e.jsxs("span",{className:"x197sbye xfifm61 x1ey7xld",children:[i.size,"px"]})}),e.jsx(s,{children:"Pill only appears on hover."})]})}),e.jsx(n,{direction:"horizontal",hasDivider:!0,isAlwaysVisible:!1,resizable:i.props,label:"Resize sidebar"})]}),content:e.jsx(d,{children:e.jsx(a,{level:4,children:"Content"})})})})}},m={render:()=>{const i=t({defaultSize:250,minSizePx:150});return e.jsx("div",{className:"x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",children:e.jsx(l,{height:"fill",start:e.jsxs(e.Fragment,{children:[e.jsx(o,{width:i.size,hasDivider:!1,children:e.jsx(a,{level:4,children:"Sidebar (locked)"})}),e.jsx(n,{direction:"horizontal",hasDivider:!0,resizable:i.props,isDisabled:!0,label:"Locked"})]}),content:e.jsx(d,{children:e.jsx(a,{level:4,children:"Content"})})})})}},v={render:()=>{const i=t({defaultSize:260,minSizePx:180,maxSizePx:450,collapsible:!0,collapsedSize:50});return e.jsx("div",{className:"x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",style:{height:500},children:e.jsx(l,{height:"fill",start:e.jsxs(e.Fragment,{children:[!i.isCollapsed&&e.jsx(o,{resizable:i.props,hasDivider:!1,role:"navigation",label:"Sidebar",children:e.jsxs(r,{gap:2,children:[e.jsx(a,{level:4,children:"Navigation"}),e.jsx(s,{children:e.jsxs("span",{className:"x197sbye xfifm61 x1ey7xld",children:[i.size,"px"]})}),e.jsx(j,{}),e.jsx(s,{children:"Drag the handle to resize."}),e.jsx(s,{children:"Double-click or press Enter to collapse."})]})}),e.jsx(n,{direction:"horizontal",hasDivider:!0,resizable:i.props,label:"Resize navigation"})]}),content:e.jsx(d,{children:e.jsxs(r,{gap:3,children:[e.jsx(a,{level:3,children:"Main Content"}),e.jsx(s,{children:"LayoutPanel with resizable prop + ResizeHandle with hasDivider."}),e.jsxs(s,{children:["Sidebar is"," ",e.jsx("strong",{children:i.isCollapsed?"collapsed":"expanded"}),i.isCollapsed&&e.jsx("button",{onClick:()=>i.expand(),style:{marginLeft:8},children:"Expand"})]})]})})})})}},g={render:()=>{const i=t({defaultSize:260,minSizePx:200,maxSizePx:400,collapsible:!0,collapsedSize:50,snaps:[56,260]});return e.jsx("div",{className:"x16nrsnc xh8yej3 xmkeg23 x1y0btm7 x14i3s5s x1hviunn xb3r6kr",style:{height:500},children:e.jsx(l,{height:"fill",start:e.jsxs(e.Fragment,{children:[!i.isCollapsed&&e.jsx(o,{width:i.size,hasDivider:!1,padding:0,children:e.jsxs(S,{children:[e.jsx(y,{label:"Home",isSelected:!0}),e.jsx(y,{label:"Dashboard"}),e.jsx(y,{label:"Settings"})]})}),e.jsx(n,{direction:"horizontal",hasDivider:!0,resizable:i.props,label:"Resize navigation"})]}),content:e.jsx(d,{children:e.jsxs(r,{gap:3,children:[e.jsx(a,{level:3,children:"Dashboard"}),e.jsxs(s,{children:[e.jsxs("span",{className:"x197sbye xfifm61 x1ey7xld",children:[i.size,"px"]})," — ",i.isCollapsed?"Collapsed":"Expanded"]}),e.jsx(s,{children:"SideNav width driven by useResizable. Double-click handle to collapse."})]})})})})}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source},description:{story:"Basic horizontal split with divider line.",...p.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source},description:{story:"Vertical split with divider line.",...c.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source},description:{story:"Collapsible sidebar — drag past threshold or double-click to collapse.",...h.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:"Three-panel IDE layout with nested horizontal + vertical splits.",...b.parameters?.docs?.description}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:"Snap points — sidebar snaps to predefined widths.",...z.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source},description:{story:"Pill hidden at rest — only appears on hover/focus.",...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source},description:{story:"Disabled handle — divider visible but non-interactive.",...m.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source},description:{story:"Integration with Layout — resizable sidebar with collapsible.",...v.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source},description:{story:"AppShell with resizable SideNav.",...g.parameters?.docs?.description}}};const W=["HorizontalSplit","VerticalSplit","Collapsible","ThreePanelIDE","SnapPoints","HiddenPill","Disabled","WithLayout","WithAppShell"];export{h as Collapsible,m as Disabled,u as HiddenPill,p as HorizontalSplit,z as SnapPoints,b as ThreePanelIDE,c as VerticalSplit,g as WithAppShell,v as WithLayout,W as __namedExportsOrder,M as default};
