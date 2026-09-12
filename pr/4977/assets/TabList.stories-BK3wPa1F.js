import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-BG1UUb-H.js";import{t as a}from"./Button-DhodVbGK.js";import{in as o,nn as s,on as c,tn as l}from"./iframe-DJpi1o2B.js";import{P as u,gt as d,t as f}from"./esm-CL1f8dHF.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;e((()=>{p=t(n()),l(),a(),f(),m=r(),h={title:`Core/TabList`,component:c,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Size of the tab hover targets`}}},g={args:{size:`md`},render:e=>{let[t,n]=(0,p.useState)(`home`);return(0,m.jsxs)(c,{value:t,onChange:n,size:e.size,children:[(0,m.jsx)(o,{value:`home`,label:`Home`}),(0,m.jsx)(o,{value:`projects`,label:`Projects`}),(0,m.jsx)(o,{value:`settings`,label:`Settings`})]})}},_={args:{size:`md`},render:e=>{let[t,n]=(0,p.useState)(`home`);return(0,m.jsxs)(c,{value:t,onChange:n,size:e.size,children:[(0,m.jsx)(o,{value:`home`,label:`Home`}),(0,m.jsx)(o,{value:`projects`,label:`Projects`}),(0,m.jsx)(s,{label:`More`,options:[{value:`analytics`,label:`Analytics`},{value:`reports`,label:`Reports`},{value:`billing`,label:`Billing`}]})]})}},v={args:{size:`md`},render:e=>{let[t,n]=(0,p.useState)(`analytics`);return(0,m.jsxs)(c,{value:t,onChange:n,size:e.size,children:[(0,m.jsx)(o,{value:`home`,label:`Home`}),(0,m.jsx)(o,{value:`projects`,label:`Projects`}),(0,m.jsx)(s,{label:`More`,options:[{value:`analytics`,label:`Analytics`},{value:`reports`,label:`Reports`}]})]})}},y={render:()=>{let[e,t]=(0,p.useState)(`home`);return(0,m.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`},children:[`sm`,`md`,`lg`].map(n=>(0,m.jsxs)(`div`,{children:[(0,m.jsxs)(`div`,{style:{marginBottom:`8px`,fontSize:`12px`,color:`var(--color-text-secondary)`,fontFamily:`monospace`},children:[`size=\\"`,n,`\\"`]}),(0,m.jsx)(`div`,{style:{border:`1px dashed #ccc`,display:`inline-flex`},children:(0,m.jsxs)(c,{value:e,onChange:t,size:n,"aria-label":`Tabs (${n})`,children:[(0,m.jsx)(o,{value:`home`,label:`Home`}),(0,m.jsx)(o,{value:`projects`,label:`Projects`}),(0,m.jsx)(o,{value:`settings`,label:`Settings`})]})})]},n))})}},b={args:{size:`md`},render:e=>{let[t,n]=(0,p.useState)(`home`),r=(0,m.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,m.jsx)(`path`,{d:`M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z`})}),i=(0,m.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,m.jsx)(`path`,{fillRule:`evenodd`,d:`M6.955 1.45A.5.5 0 0 1 7.452 1h1.096a.5.5 0 0 1 .497.45l.17 1.699c.484.12.94.312 1.356.562l1.321-.816a.5.5 0 0 1 .67.087l.774.774a.5.5 0 0 1 .087.67l-.816 1.321c.25.416.442.872.562 1.356l1.699.17a.5.5 0 0 1 .45.497v1.096a.5.5 0 0 1-.45.497l-1.699.17c-.12.484-.312.94-.562 1.356l.816 1.321a.5.5 0 0 1-.087.67l-.774.774a.5.5 0 0 1-.67.087l-1.321-.816c-.416.25-.872.442-1.356.562l-.17 1.699a.5.5 0 0 1-.497.45H7.452a.5.5 0 0 1-.497-.45l-.17-1.699a4.973 4.973 0 0 1-1.356-.562l-1.321.816a.5.5 0 0 1-.67-.087l-.774-.774a.5.5 0 0 1-.087-.67l.816-1.321a4.972 4.972 0 0 1-.562-1.356l-1.699-.17A.5.5 0 0 1 1 8.548V7.452a.5.5 0 0 1 .45-.497l1.699-.17c.12-.484.312-.94.562-1.356l-.816-1.321a.5.5 0 0 1 .087-.67l.774-.774a.5.5 0 0 1 .67-.087l1.321.816c.416-.25.872-.442 1.356-.562l.17-1.699ZM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z`,clipRule:`evenodd`})});return(0,m.jsxs)(c,{value:t,onChange:n,size:e.size,children:[(0,m.jsx)(o,{value:`home`,label:`Home`,icon:r}),(0,m.jsx)(o,{value:`settings`,label:`Settings`,icon:i})]})}},x={args:{size:`md`},render:e=>{let[t,n]=(0,p.useState)(`desktop`),r=(0,m.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,m.jsx)(`path`,{d:`M2.5 3A1.5 1.5 0 0 0 1 4.5v5A1.5 1.5 0 0 0 2.5 11h4.75v1.5H5a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H8.75V11h4.75A1.5 1.5 0 0 0 15 9.5v-5A1.5 1.5 0 0 0 13.5 3h-11Zm0 1.5h11v5h-11v-5Z`})}),i=(0,m.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,m.jsx)(`path`,{d:`M5 1.5A1.5 1.5 0 0 0 3.5 3v10A1.5 1.5 0 0 0 5 14.5h6a1.5 1.5 0 0 0 1.5-1.5V3A1.5 1.5 0 0 0 11 1.5H5Zm0 1.5h6v10H5V3Zm2.25 8.5a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75Z`})}),a=(0,m.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,m.jsx)(`path`,{d:`M8 1.5a6.5 6.5 0 0 0 0 13h.25a1.75 1.75 0 0 0 1.2-3.02.35.35 0 0 1 .23-.6h.97A3.85 3.85 0 0 0 14.5 7.03 5.53 5.53 0 0 0 8.97 1.5H8Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2-1.75a1 1 0 1 1 2 0 1 1 0 0 1-2 0ZM4.5 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm6-1.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z`})});return(0,m.jsxs)(c,{value:t,onChange:n,size:e.size,children:[(0,m.jsx)(o,{value:`desktop`,label:`Desktop preview`,icon:r,isLabelHidden:!0}),(0,m.jsx)(o,{value:`phone`,label:`Phone preview`,icon:i,isLabelHidden:!0}),(0,m.jsx)(o,{value:`theme`,label:`Theme`,icon:a,isLabelHidden:!0})]})}},S={render:()=>{let[e,t]=(0,p.useState)(`all`);return(0,m.jsxs)(c,{value:e,onChange:t,size:`lg`,hasDivider:!0,children:[(0,m.jsx)(o,{value:`all`,label:`All items`}),(0,m.jsx)(o,{value:`active`,label:`Active`}),(0,m.jsx)(o,{value:`archived`,label:`Archived`}),(0,m.jsxs)(`div`,{style:{marginInlineStart:`auto`,display:`flex`,alignItems:`center`,gap:`4px`},children:[(0,m.jsx)(i,{label:`Filter`,variant:`ghost`,size:`lg`,icon:(0,m.jsx)(d,{}),isIconOnly:!0}),(0,m.jsx)(i,{label:`New item`,variant:`primary`,size:`lg`,icon:(0,m.jsx)(u,{})})]})]})}},C={name:`Divider Gap (sm / md / lg)`,render:()=>{let[e,t]=(0,p.useState)(`overview`);return(0,m.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[`sm`,`md`,`lg`].map(n=>(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,m.jsxs)(`span`,{style:{font:`600 12px system-ui`,color:`var(--color-text-secondary)`},children:[`size="`,n,`" · hasDivider · matched Button size`]}),(0,m.jsxs)(c,{value:e,onChange:t,size:n,hasDivider:!0,"aria-label":`Tabs (${n})`,children:[(0,m.jsx)(o,{value:`overview`,label:`Overview`}),(0,m.jsx)(o,{value:`activity`,label:`Activity`}),(0,m.jsx)(o,{value:`settings`,label:`Settings`}),(0,m.jsxs)(`div`,{style:{marginInlineStart:`auto`,display:`flex`,alignItems:`center`,gap:`4px`},children:[(0,m.jsx)(i,{label:`Filter`,variant:`ghost`,size:n,icon:(0,m.jsx)(d,{}),isIconOnly:!0}),(0,m.jsx)(i,{label:`New item`,variant:`primary`,size:n,icon:(0,m.jsx)(u,{})})]})]})]},n))})}},w={render:()=>{let[e,t]=(0,p.useState)(`home`);return(0,m.jsx)(`div`,{style:{width:`500px`},children:(0,m.jsxs)(c,{value:e,onChange:t,layout:`fill`,hasDivider:!0,children:[(0,m.jsx)(o,{value:`home`,label:`Home`}),(0,m.jsx)(o,{value:`projects`,label:`Projects`}),(0,m.jsx)(o,{value:`settings`,label:`Settings`})]})})}},T={render:()=>{let[e,t]=(0,p.useState)(`overview`);return(0,m.jsx)(`div`,{style:{maxWidth:`400px`,border:`1px dashed #ccc`},children:(0,m.jsxs)(c,{value:e,onChange:t,children:[(0,m.jsx)(o,{value:`overview`,label:`Overview`}),(0,m.jsx)(o,{value:`activity`,label:`Activity`}),(0,m.jsx)(o,{value:`members`,label:`Members`}),(0,m.jsx)(o,{value:`settings`,label:`Settings`}),(0,m.jsx)(o,{value:`integrations`,label:`Integrations`}),(0,m.jsx)(o,{value:`billing`,label:`Billing & Plans`}),(0,m.jsx)(o,{value:`security`,label:`Security`}),(0,m.jsx)(o,{value:`notifications`,label:`Notifications`}),(0,m.jsx)(o,{value:`api`,label:`API Keys`})]})})}},E={render:()=>{let[e,t]=(0,p.useState)(`dashboard`);return(0,m.jsx)(`div`,{style:{maxWidth:`350px`},children:(0,m.jsxs)(c,{value:e,onChange:t,hasDivider:!0,size:`lg`,children:[(0,m.jsx)(o,{value:`dashboard`,label:`Dashboard`}),(0,m.jsx)(o,{value:`analytics`,label:`Analytics`}),(0,m.jsx)(o,{value:`reports`,label:`Reports`}),(0,m.jsx)(o,{value:`customers`,label:`Customers`}),(0,m.jsx)(o,{value:`products`,label:`Products`}),(0,m.jsx)(o,{value:`orders`,label:`Orders`})]})})}},D={render:()=>{let[e,t]=(0,p.useState)(`api`);return(0,m.jsxs)(`div`,{style:{display:`grid`,gap:`8px`,maxWidth:`400px`,minWidth:0},children:[(0,m.jsx)(`div`,{style:{border:`1px dashed #ccc`,minWidth:0},children:(0,m.jsxs)(c,{value:e,onChange:t,children:[(0,m.jsx)(o,{value:`overview`,label:`Overview`}),(0,m.jsx)(o,{value:`activity`,label:`Activity`}),(0,m.jsx)(o,{value:`members`,label:`Members`}),(0,m.jsx)(o,{value:`settings`,label:`Settings`}),(0,m.jsx)(o,{value:`integrations`,label:`Integrations`}),(0,m.jsx)(o,{value:`billing`,label:`Billing & Plans`}),(0,m.jsx)(o,{value:`security`,label:`Security`}),(0,m.jsx)(o,{value:`notifications`,label:`Notifications`}),(0,m.jsx)(o,{value:`api`,label:`API Keys`})]})}),(0,m.jsxs)(`div`,{style:{display:`flex`,gap:`4px`},children:[(0,m.jsx)(i,{label:`Select first`,variant:`secondary`,size:`sm`,onClick:()=>t(`overview`)}),(0,m.jsx)(i,{label:`Select last`,variant:`secondary`,size:`sm`,onClick:()=>t(`api`)})]})]})}},O={render:()=>{let[e,t]=(0,p.useState)(`overview`);return(0,m.jsx)(`div`,{style:{maxWidth:`400px`,border:`1px dashed #ccc`},children:(0,m.jsxs)(c,{value:e,onChange:t,overflow:`visible`,children:[(0,m.jsx)(o,{value:`overview`,label:`Overview`}),(0,m.jsx)(o,{value:`activity`,label:`Activity`}),(0,m.jsx)(o,{value:`members`,label:`Members`}),(0,m.jsx)(o,{value:`settings`,label:`Settings`}),(0,m.jsx)(o,{value:`integrations`,label:`Integrations`}),(0,m.jsx)(o,{value:`billing`,label:`Billing & Plans`}),(0,m.jsx)(o,{value:`security`,label:`Security`}),(0,m.jsx)(o,{value:`notifications`,label:`Notifications`}),(0,m.jsx)(o,{value:`api`,label:`API Keys`})]})})}},k={render:()=>{let[e,t]=(0,p.useState)(`overview`);return(0,m.jsxs)(`div`,{style:{display:`grid`,gap:`12px`,maxWidth:`400px`},children:[(0,m.jsxs)(c,{value:e,onChange:t,role:`tablist`,"aria-label":`Project views`,hasDivider:!0,children:[(0,m.jsx)(o,{value:`overview`,label:`Overview`,id:`tab-overview`,panelId:`panel-overview`}),(0,m.jsx)(o,{value:`activity`,label:`Activity`,id:`tab-activity`,panelId:`panel-activity`}),(0,m.jsx)(o,{value:`members`,label:`Members`,id:`tab-members`,panelId:`panel-members`})]}),Object.entries({overview:`Everything at a glance.`,activity:`What happened recently.`,members:`Who has access.`}).map(([t,n])=>(0,m.jsx)(`div`,{id:`panel-${t}`,role:`tabpanel`,"aria-labelledby":`tab-${t}`,tabIndex:0,hidden:t!==e,children:n},t))]})}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  },
  render: args => {
    const [value, setValue] = useState('home');
    return <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="home" label="Home" />
        <Tab value="projects" label="Projects" />
        <Tab value="settings" label="Settings" />
      </TabList>;
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  },
  render: args => {
    const [value, setValue] = useState('home');
    return <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="home" label="Home" />
        <Tab value="projects" label="Projects" />
        <TabMenu label="More" options={[{
        value: 'analytics',
        label: 'Analytics'
      }, {
        value: 'reports',
        label: 'Reports'
      }, {
        value: 'billing',
        label: 'Billing'
      }]} />
      </TabList>;
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  },
  render: args => {
    const [value, setValue] = useState('analytics');
    return <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="home" label="Home" />
        <Tab value="projects" label="Projects" />
        <TabMenu label="More" options={[{
        value: 'analytics',
        label: 'Analytics'
      }, {
        value: 'reports',
        label: 'Reports'
      }]} />
      </TabList>;
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('home');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
        {(['sm', 'md', 'lg'] as const).map(size => <div key={size}>
            <div style={{
          marginBottom: '8px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          fontFamily: 'monospace'
        }}>
              size=\\"{size}\\"
            </div>
            <div style={{
          border: '1px dashed #ccc',
          display: 'inline-flex'
        }}>
              <TabList value={value} onChange={setValue} size={size} aria-label={\`Tabs (\${size})\`}>
                <Tab value="home" label="Home" />
                <Tab value="projects" label="Projects" />
                <Tab value="settings" label="Settings" />
              </TabList>
            </div>
          </div>)}
      </div>;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  },
  render: args => {
    const [value, setValue] = useState('home');
    const HomeIcon = <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path d="M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z" />
      </svg>;
    const CogIcon = <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path fillRule="evenodd" d="M6.955 1.45A.5.5 0 0 1 7.452 1h1.096a.5.5 0 0 1 .497.45l.17 1.699c.484.12.94.312 1.356.562l1.321-.816a.5.5 0 0 1 .67.087l.774.774a.5.5 0 0 1 .087.67l-.816 1.321c.25.416.442.872.562 1.356l1.699.17a.5.5 0 0 1 .45.497v1.096a.5.5 0 0 1-.45.497l-1.699.17c-.12.484-.312.94-.562 1.356l.816 1.321a.5.5 0 0 1-.087.67l-.774.774a.5.5 0 0 1-.67.087l-1.321-.816c-.416.25-.872.442-1.356.562l-.17 1.699a.5.5 0 0 1-.497.45H7.452a.5.5 0 0 1-.497-.45l-.17-1.699a4.973 4.973 0 0 1-1.356-.562l-1.321.816a.5.5 0 0 1-.67-.087l-.774-.774a.5.5 0 0 1-.087-.67l.816-1.321a4.972 4.972 0 0 1-.562-1.356l-1.699-.17A.5.5 0 0 1 1 8.548V7.452a.5.5 0 0 1 .45-.497l1.699-.17c.12-.484.312-.94.562-1.356l-.816-1.321a.5.5 0 0 1 .087-.67l.774-.774a.5.5 0 0 1 .67-.087l1.321.816c.416-.25.872-.442 1.356-.562l.17-1.699ZM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" clipRule="evenodd" />
      </svg>;
    return <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="home" label="Home" icon={HomeIcon} />
        <Tab value="settings" label="Settings" icon={CogIcon} />
      </TabList>;
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  },
  render: args => {
    const [value, setValue] = useState('desktop');
    const DesktopIcon = <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v5A1.5 1.5 0 0 0 2.5 11h4.75v1.5H5a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H8.75V11h4.75A1.5 1.5 0 0 0 15 9.5v-5A1.5 1.5 0 0 0 13.5 3h-11Zm0 1.5h11v5h-11v-5Z" />
      </svg>;
    const PhoneIcon = <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path d="M5 1.5A1.5 1.5 0 0 0 3.5 3v10A1.5 1.5 0 0 0 5 14.5h6a1.5 1.5 0 0 0 1.5-1.5V3A1.5 1.5 0 0 0 11 1.5H5Zm0 1.5h6v10H5V3Zm2.25 8.5a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75Z" />
      </svg>;
    const ThemeIcon = <svg viewBox="0 0 16 16" fill="currentColor" width="100%" height="100%">
        <path d="M8 1.5a6.5 6.5 0 0 0 0 13h.25a1.75 1.75 0 0 0 1.2-3.02.35.35 0 0 1 .23-.6h.97A3.85 3.85 0 0 0 14.5 7.03 5.53 5.53 0 0 0 8.97 1.5H8Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2-1.75a1 1 0 1 1 2 0 1 1 0 0 1-2 0ZM4.5 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm6-1.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
      </svg>;
    return <TabList value={value} onChange={setValue} size={args.size}>
        <Tab value="desktop" label="Desktop preview" icon={DesktopIcon} isLabelHidden />
        <Tab value="phone" label="Phone preview" icon={PhoneIcon} isLabelHidden />
        <Tab value="theme" label="Theme" icon={ThemeIcon} isLabelHidden />
      </TabList>;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('all');
    return <TabList value={value} onChange={setValue} size="lg" hasDivider>
        <Tab value="all" label="All items" />
        <Tab value="active" label="Active" />
        <Tab value="archived" label="Archived" />
        <div style={{
        marginInlineStart: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
          <Button label="Filter" variant="ghost" size="lg" icon={<FunnelIcon />} isIconOnly />
          <Button label="New item" variant="primary" size="lg" icon={<PlusIcon />} />
        </div>
      </TabList>;
  }
}`,...S.parameters?.docs?.source},description:{story:`Demonstrates a common page header pattern: large tab list items on the left
with action buttons on the right, separated by a full-width divider underneath.`,...S.parameters?.docs?.description}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Divider Gap (sm / md / lg)',
  render: () => {
    const [value, setValue] = useState('overview');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
        {(['sm', 'md', 'lg'] as const).map(size => <div key={size} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
            <span style={{
          font: '600 12px system-ui',
          color: 'var(--color-text-secondary)'
        }}>
              size=&quot;{size}&quot; · hasDivider · matched Button size
            </span>
            <TabList value={value} onChange={setValue} size={size} hasDivider aria-label={\`Tabs (\${size})\`}>
              <Tab value="overview" label="Overview" />
              <Tab value="activity" label="Activity" />
              <Tab value="settings" label="Settings" />
              <div style={{
            marginInlineStart: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
                <Button label="Filter" variant="ghost" size={size} icon={<FunnelIcon />} isIconOnly />
                <Button label="New item" variant="primary" size={size} icon={<PlusIcon />} />
              </div>
            </TabList>
          </div>)}
      </div>;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('home');
    return <div style={{
      width: '500px'
    }}>
        <TabList value={value} onChange={setValue} layout="fill" hasDivider>
          <Tab value="home" label="Home" />
          <Tab value="projects" label="Projects" />
          <Tab value="settings" label="Settings" />
        </TabList>
      </div>;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('overview');
    return <div style={{
      maxWidth: '400px',
      border: '1px dashed #ccc'
    }}>
        <TabList value={value} onChange={setValue}>
          <Tab value="overview" label="Overview" />
          <Tab value="activity" label="Activity" />
          <Tab value="members" label="Members" />
          <Tab value="settings" label="Settings" />
          <Tab value="integrations" label="Integrations" />
          <Tab value="billing" label="Billing & Plans" />
          <Tab value="security" label="Security" />
          <Tab value="notifications" label="Notifications" />
          <Tab value="api" label="API Keys" />
        </TabList>
      </div>;
  }
}`,...T.parameters?.docs?.source},description:{story:`A strip narrower than its tabs scrolls. Every tab stays a tab — nothing is
hidden behind a menu — and the edges fade to show there is more. Pointers
that can hover also get arrow affordances; keyboard users reach every tab
with the arrow keys, which scrolls the focused tab into view.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('dashboard');
    return <div style={{
      maxWidth: '350px'
    }}>
        <TabList value={value} onChange={setValue} hasDivider size="lg">
          <Tab value="dashboard" label="Dashboard" />
          <Tab value="analytics" label="Analytics" />
          <Tab value="reports" label="Reports" />
          <Tab value="customers" label="Customers" />
          <Tab value="products" label="Products" />
          <Tab value="orders" label="Orders" />
        </TabList>
      </div>;
  }
}`,...E.parameters?.docs?.source},description:{story:`Overflow with divider — typical page header in a narrow viewport. The
selected indicator still sits on the rail while the strip scrolls.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('api');
    return <div style={{
      display: 'grid',
      gap: '8px',
      maxWidth: '400px',
      minWidth: 0
    }}>
        <div style={{
        border: '1px dashed #ccc',
        minWidth: 0
      }}>
          <TabList value={value} onChange={setValue}>
            <Tab value="overview" label="Overview" />
            <Tab value="activity" label="Activity" />
            <Tab value="members" label="Members" />
            <Tab value="settings" label="Settings" />
            <Tab value="integrations" label="Integrations" />
            <Tab value="billing" label="Billing & Plans" />
            <Tab value="security" label="Security" />
            <Tab value="notifications" label="Notifications" />
            <Tab value="api" label="API Keys" />
          </TabList>
        </div>
        <div style={{
        display: 'flex',
        gap: '4px'
      }}>
          <Button label="Select first" variant="secondary" size="sm" onClick={() => setValue('overview')} />
          <Button label="Select last" variant="secondary" size="sm" onClick={() => setValue('api')} />
        </div>
      </div>;
  }
}`,...D.parameters?.docs?.source},description:{story:"A tab selected while it is out of view is scrolled back in — on mount and\nwhenever the host changes `value` itself.",...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('overview');
    return <div style={{
      maxWidth: '400px',
      border: '1px dashed #ccc'
    }}>
        <TabList value={value} onChange={setValue} overflow="visible">
          <Tab value="overview" label="Overview" />
          <Tab value="activity" label="Activity" />
          <Tab value="members" label="Members" />
          <Tab value="settings" label="Settings" />
          <Tab value="integrations" label="Integrations" />
          <Tab value="billing" label="Billing & Plans" />
          <Tab value="security" label="Security" />
          <Tab value="notifications" label="Notifications" />
          <Tab value="api" label="API Keys" />
        </TabList>
      </div>;
  }
}`,...O.parameters?.docs?.source},description:{story:'`overflow="visible"` opts out: the tabs keep their intrinsic widths and spill\nout of the strip, for a host that handles overflow itself.',...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('overview');
    const panels = {
      overview: 'Everything at a glance.',
      activity: 'What happened recently.',
      members: 'Who has access.'
    };
    return <div style={{
      display: 'grid',
      gap: '12px',
      maxWidth: '400px'
    }}>
        <TabList value={value} onChange={setValue} role="tablist" aria-label="Project views" hasDivider>
          <Tab value="overview" label="Overview" id="tab-overview" panelId="panel-overview" />
          <Tab value="activity" label="Activity" id="tab-activity" panelId="panel-activity" />
          <Tab value="members" label="Members" id="tab-members" panelId="panel-members" />
        </TabList>
        {Object.entries(panels).map(([key, text]) => <div key={key} id={\`panel-\${key}\`} role="tabpanel" aria-labelledby={\`tab-\${key}\`} tabIndex={0} hidden={key !== value}>
            {text}
          </div>)}
      </div>;
  }
}`,...k.parameters?.docs?.source},description:{story:'`role="tablist"` asks for the WAI-ARIA tabs pattern: `role="tablist"` /\n`role="tab"`, `aria-selected`, and each tab pointing at the panel it\ncontrols. A screen reader announces "tab 2 of 3, selected" and can move to\nthe panel it opens. Without it the strip stays a `<nav>` landmark marking\nthe current tab with `aria-current`.',...k.parameters?.docs?.description}}},A=[`Default`,`WithMenu`,`MenuWithSelectedChild`,`SizeVariants`,`WithIcons`,`IconOnly`,`WithActions`,`DividerGap`,`FillLayout`,`Overflow`,`OverflowWithDivider`,`OverflowSelectedOffscreen`,`OverflowVisible`,`TabsPattern`]}))();export{g as Default,C as DividerGap,w as FillLayout,x as IconOnly,v as MenuWithSelectedChild,T as Overflow,D as OverflowSelectedOffscreen,O as OverflowVisible,E as OverflowWithDivider,y as SizeVariants,k as TabsPattern,S as WithActions,b as WithIcons,_ as WithMenu,A as __namedExportsOrder,h as default};