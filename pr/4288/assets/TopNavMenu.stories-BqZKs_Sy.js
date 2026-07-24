import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-BBk5Kqd0.js";import{t as a}from"./Button-CRpvXAU4.js";import{c as o,f as s,i as c,m as l,n as u,o as d,t as f,u as p}from"./TopNav-D-mqP6wj.js";import{Xn as m,Yn as h}from"./iframe-iQ3nuRH_.js";import{E as g,Ht as _,It as v,fn as y,ft as b,on as x,t as S,u as C}from"./esm-DA7gAIBC.js";var w,T,E,D,O,k,A,j;e((()=>{w=t(n()),f(),h(),a(),S(),T=r(),E={title:`Core/TopNavMenu`,component:o,tags:[`autodocs`],parameters:{layout:`fullscreen`}},D={render:()=>(0,T.jsx)(l,{label:`Main navigation`,heading:(0,T.jsx)(s,{heading:`My App`,logo:(0,T.jsx)(m,{icon:(0,T.jsx)(v,{style:{width:16,height:16}})}),href:`#`}),startContent:(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(p,{label:`Home`,href:`#`,isSelected:!0}),(0,T.jsx)(o,{label:`Products`,items:[{title:`Analytics`,description:`Track and analyze user behavior`,icon:(0,T.jsx)(x,{style:{width:20,height:20}}),href:`#analytics`},{title:`Security`,description:`Enterprise-grade protection`,icon:(0,T.jsx)(g,{style:{width:20,height:20}}),href:`#security`},{title:`Automation`,description:`Streamline your workflows`,icon:(0,T.jsx)(y,{style:{width:20,height:20}}),href:`#automation`},{title:`Developer Tools`,description:`APIs, SDKs, and CLI tools`,icon:(0,T.jsx)(_,{style:{width:20,height:20}}),href:`#dev-tools`}]}),(0,T.jsx)(p,{label:`Pricing`,href:`#`})]}),endContent:(0,T.jsx)(i,{label:`Profile`,variant:`ghost`,icon:(0,T.jsx)(C,{style:{width:16,height:16}}),isIconOnly:!0})})},O={name:`Multiple Menus`,render:()=>(0,T.jsx)(l,{label:`Main navigation`,heading:(0,T.jsx)(s,{heading:`Platform`,href:`#`}),startContent:(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(o,{label:`Products`,items:[{title:`Analytics`,description:`Track behavior`,icon:(0,T.jsx)(x,{style:{width:20,height:20}}),href:`#`},{title:`Security`,description:`Enterprise protection`,icon:(0,T.jsx)(g,{style:{width:20,height:20}}),href:`#`}]}),(0,T.jsx)(o,{label:`Resources`,items:[{title:`Documentation`,href:`#`},{title:`API Reference`,href:`#`},{title:`Community Forum`,href:`#`}]}),(0,T.jsx)(p,{label:`Pricing`,href:`#`})]})})},k={name:`Mega Menu`,render:function(){let[,e]=(0,w.useState)(!1);return(0,T.jsx)(`div`,{style:{position:`relative`},children:(0,T.jsx)(l,{label:`Marketing navigation`,heading:(0,T.jsx)(s,{heading:`Acme`,logo:(0,T.jsx)(m,{icon:(0,T.jsx)(v,{style:{width:16,height:16}})}),href:`#`}),startContent:(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(d,{label:`Products`,onOpenChange:e,items:(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(c,{title:`Analytics`,description:`Track and analyze user behavior across your apps`,icon:(0,T.jsx)(x,{style:{width:20,height:20}}),href:`#analytics`}),(0,T.jsx)(c,{title:`Security`,description:`Enterprise-grade protection for your data`,icon:(0,T.jsx)(g,{style:{width:20,height:20}}),href:`#security`}),(0,T.jsx)(c,{title:`Automation`,description:`Streamline workflows with intelligent tools`,icon:(0,T.jsx)(y,{style:{width:20,height:20}}),href:`#automation`}),(0,T.jsx)(c,{title:`Developer Tools`,description:`APIs, SDKs, and CLI for integration`,icon:(0,T.jsx)(_,{style:{width:20,height:20}}),href:`#dev-tools`}),(0,T.jsx)(c,{title:`Global Network`,description:`Low-latency edge infra in 40+ regions`,icon:(0,T.jsx)(b,{style:{width:20,height:20}}),href:`#network`})]}),featured:(0,T.jsx)(u,{title:`What's new in v4.0`,description:`AI-powered analytics and real-time collaboration.`,image:`https://images.unsplash.com/photo-1551434678-e076c223a692?w=560&h=280&fit=crop`,imageAlt:`Team collaboration`,linkLabel:`Read the announcement`,linkHref:`#announcement`})}),(0,T.jsx)(p,{label:`Pricing`,href:`#`}),(0,T.jsx)(p,{label:`Docs`,href:`#`})]}),endContent:(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(i,{label:`Sign in`,variant:`ghost`}),(0,T.jsx)(i,{label:`Get started`,variant:`primary`})]})})})}},A={name:`Mega Menu (Simple)`,render:()=>(0,T.jsx)(`div`,{style:{position:`relative`},children:(0,T.jsx)(l,{label:`Simple navigation`,heading:(0,T.jsx)(s,{heading:`App`,href:`#`}),startContent:(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(p,{label:`Home`,href:`#`,isSelected:!0}),(0,T.jsx)(d,{label:`Features`,items:(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(c,{title:`Dashboard`,description:`Overview of your key metrics`,icon:(0,T.jsx)(x,{style:{width:20,height:20}}),href:`#`}),(0,T.jsx)(c,{title:`Integrations`,description:`Connect with your favorite tools`,icon:(0,T.jsx)(_,{style:{width:20,height:20}}),href:`#`}),(0,T.jsx)(c,{title:`API Access`,description:`Programmatic access to all features`,icon:(0,T.jsx)(b,{style:{width:20,height:20}}),href:`#`})]})})]}),endContent:(0,T.jsx)(i,{label:`Sign in`,variant:`primary`})})})},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <TopNav label="Main navigation" heading={<TopNavHeading heading="My App" logo={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} href="#" />} startContent={<>
          <TopNavItem label="Home" href="#" isSelected />
          <TopNavMenu label="Products" items={[{
      title: 'Analytics',
      description: 'Track and analyze user behavior',
      icon: <ChartBarIcon style={{
        width: 20,
        height: 20
      }} />,
      href: '#analytics'
    }, {
      title: 'Security',
      description: 'Enterprise-grade protection',
      icon: <ShieldCheckIcon style={{
        width: 20,
        height: 20
      }} />,
      href: '#security'
    }, {
      title: 'Automation',
      description: 'Streamline your workflows',
      icon: <BoltIcon style={{
        width: 20,
        height: 20
      }} />,
      href: '#automation'
    }, {
      title: 'Developer Tools',
      description: 'APIs, SDKs, and CLI tools',
      icon: <CodeBracketIcon style={{
        width: 20,
        height: 20
      }} />,
      href: '#dev-tools'
    }]} />
          <TopNavItem label="Pricing" href="#" />
        </>} endContent={<Button label="Profile" variant="ghost" icon={<UserCircleIcon style={{
    width: 16,
    height: 16
  }} />} isIconOnly />} />
}`,...D.parameters?.docs?.source},description:{story:`Basic hover-triggered nav menu with 4 items, each with icon, title,
and description.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Menus',
  render: () => <TopNav label="Main navigation" heading={<TopNavHeading heading="Platform" href="#" />} startContent={<>
          <TopNavMenu label="Products" items={[{
      title: 'Analytics',
      description: 'Track behavior',
      icon: <ChartBarIcon style={{
        width: 20,
        height: 20
      }} />,
      href: '#'
    }, {
      title: 'Security',
      description: 'Enterprise protection',
      icon: <ShieldCheckIcon style={{
        width: 20,
        height: 20
      }} />,
      href: '#'
    }]} />
          <TopNavMenu label="Resources" items={[{
      title: 'Documentation',
      href: '#'
    }, {
      title: 'API Reference',
      href: '#'
    }, {
      title: 'Community Forum',
      href: '#'
    }]} />
          <TopNavItem label="Pricing" href="#" />
        </>} />
}`,...O.parameters?.docs?.source},description:{story:`Multiple nav menus side by side. Hovering one closes the other
(standard hover-menu behavior).`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Mega Menu',
  render: function MegaMenuStory() {
    const [, setMenuOpen] = useState(false);
    return <div style={{
      position: 'relative'
    }}>
        <TopNav label="Marketing navigation" heading={<TopNavHeading heading="Acme" logo={<NavIcon icon={<CubeIcon style={{
        width: 16,
        height: 16
      }} />} />} href="#" />} startContent={<>
              <TopNavMegaMenu label="Products" onOpenChange={setMenuOpen} items={<>
                    <TopNavMegaMenuItem title="Analytics" description="Track and analyze user behavior across your apps" icon={<ChartBarIcon style={{
            width: 20,
            height: 20
          }} />} href="#analytics" />
                    <TopNavMegaMenuItem title="Security" description="Enterprise-grade protection for your data" icon={<ShieldCheckIcon style={{
            width: 20,
            height: 20
          }} />} href="#security" />
                    <TopNavMegaMenuItem title="Automation" description="Streamline workflows with intelligent tools" icon={<BoltIcon style={{
            width: 20,
            height: 20
          }} />} href="#automation" />
                    <TopNavMegaMenuItem title="Developer Tools" description="APIs, SDKs, and CLI for integration" icon={<CodeBracketIcon style={{
            width: 20,
            height: 20
          }} />} href="#dev-tools" />
                    <TopNavMegaMenuItem title="Global Network" description="Low-latency edge infra in 40+ regions" icon={<GlobeAltIcon style={{
            width: 20,
            height: 20
          }} />} href="#network" />
                  </>} featured={<TopNavMegaMenuFeaturedCard title="What's new in v4.0" description="AI-powered analytics and real-time collaboration." image="https://images.unsplash.com/photo-1551434678-e076c223a692?w=560&h=280&fit=crop" imageAlt="Team collaboration" linkLabel="Read the announcement" linkHref="#announcement" />} />
              <TopNavItem label="Pricing" href="#" />
              <TopNavItem label="Docs" href="#" />
            </>} endContent={<>
              <Button label="Sign in" variant="ghost" />
              <Button label="Get started" variant="primary" />
            </>} />
      </div>;
  }
}`,...k.parameters?.docs?.source},description:{story:`Full-width mega menu with composed children API.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'Mega Menu (Simple)',
  render: () => <div style={{
    position: 'relative'
  }}>
      <TopNav label="Simple navigation" heading={<TopNavHeading heading="App" href="#" />} startContent={<>
            <TopNavItem label="Home" href="#" isSelected />
            <TopNavMegaMenu label="Features" items={<>
                  <TopNavMegaMenuItem title="Dashboard" description="Overview of your key metrics" icon={<ChartBarIcon style={{
          width: 20,
          height: 20
        }} />} href="#" />
                  <TopNavMegaMenuItem title="Integrations" description="Connect with your favorite tools" icon={<CodeBracketIcon style={{
          width: 20,
          height: 20
        }} />} href="#" />
                  <TopNavMegaMenuItem title="API Access" description="Programmatic access to all features" icon={<GlobeAltIcon style={{
          width: 20,
          height: 20
        }} />} href="#" />
                </>} />
          </>} endContent={<Button label="Sign in" variant="primary" />} />
    </div>
}`,...A.parameters?.docs?.source},description:{story:`Mega menu without the featured content area — just the items grid.`,...A.parameters?.docs?.description}}},j=[`Default`,`MultipleMenus`,`MegaMenu`,`MegaMenuSimple`]}))();export{D as Default,k as MegaMenu,A as MegaMenuSimple,O as MultipleMenus,j as __namedExportsOrder,E as default};