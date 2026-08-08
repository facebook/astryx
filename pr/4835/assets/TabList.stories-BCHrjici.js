import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./stylex-Dft6gtPK.js";import{n as a}from"./mergeProps-JRyAvMxc.js";import{n as ee}from"./mergeRefs-CPqjs56a.js";import{n as o,t as s}from"./themeProps-CREkzZh6.js";import{t as c}from"./jsx-runtime-DeHZSEgm.js";import{n as l,t as u}from"./Button-BVMvoKVE.js";import{n as d,r as te,t as f}from"./Icon-C24cO4CC.js";import{n as p,t as m}from"./useListFocus-C3PMl9Zf.js";import{n as ne,t as h}from"./usePopover-DPO-mU50.js";import{i as g,r as re}from"./menuItemRoles-CfMdmT_-.js";import{n as _,t as v}from"./Carousel-DKgEi1Rv.js";import{a as y,c as b,i as x,l as S,n as C,o as w,r as T,s as E,t as D,u as O}from"./FunnelIcon-DTXchJB9.js";import{n as k,t as A}from"./PlusIcon-Cc_L_WFi.js";function j({ref:e,label:t,options:n,xstyle:i,className:s,style:c}){let l=O(),u=(0,M.useId)(),d=(0,M.useRef)(null),m=ne({hasLightDismiss:!0,hasCloseButton:!1,hasAutoFocus:!1,role:`none`,onHide:(0,M.useCallback)(()=>{d.current?.focus()},[])}),{listRef:h,handleKeyDown:g,handleFocus:_,focusFirst:v}=p({hasRovingTabIndex:!0,itemSelector:re,onEscape:()=>m.hide()}),y=(0,M.useCallback)(()=>{m.isOpen?m.hide():(m.show(),requestAnimationFrame(()=>v()))},[m,v]),b=(0,M.useCallback)(e=>{if(e.key===`Tab`){m.hide();return}g(e)},[g,m]),x=n.find(e=>e.value===l.value),S=x?.label??t,C=x!=null,T=l.size,E=(0,M.useCallback)(e=>{l.onChange(e),m.hide()},[l,m]),D=ee(m.triggerRef,d,e);return(0,N.jsxs)(N.Fragment,{children:[(0,N.jsxs)(`button`,{ref:D,type:`button`,"aria-haspopup":`menu`,"aria-expanded":m.isOpen,"aria-controls":u,"data-tab-menu":``,tabIndex:C?0:-1,onClick:y,...a(o(`tab-menu`),r(P.trigger,F[T],C&&P.triggerSelected,w,i),s,c),children:[(0,N.jsx)(`span`,{"aria-hidden":`true`,...r(P.hoverBg,I[T])}),(0,N.jsxs)(`span`,{className:`astryx1n2onr6 astryxwz0xwf astryx6s0dn4 astryxkh2ocl`,children:[(0,N.jsx)(`span`,{className:`astryx1agbcgv astryxcrlgei`,children:S}),(0,N.jsx)(`span`,{"aria-hidden":`true`,className:`astryx1agbcgv astryxcrlgei astryxlshs6z astryx47corl astryx2mo6ok`,children:S})]}),(0,N.jsx)(`span`,{"aria-hidden":`true`,...{0:{className:`astryx12xnipv astryx6b6gus astryx2lah0s astryx11xpdln astryxuedmi6 astryxlr8y92`},1:{className:`astryx12xnipv astryx6b6gus astryx2lah0s astryx11xpdln astryxuedmi6 astryxlr8y92 astryx19jd1h0`}}[!!m.isOpen<<0],children:(0,N.jsx)(f,{icon:`chevronDown`,size:`sm`,color:`inherit`})}),C&&(0,N.jsx)(`span`,{...a(o(`tab-indicator`,{selected:`selected`}),{className:`astryx10l6tqk astryxyi47jn astryx1ybfrjj astryx1mcfs9z astryx36qwtl astryxjspbzw astryx47corl astryxnpjden astryxuedmi6 astryxlr8y92 astryxowkcby astryx1hc1fzr`})})]}),m.render((0,N.jsxs)(`div`,{ref:h,id:u,role:`menu`,"aria-label":t,onKeyDown:b,onFocus:_,...a(o(`tab-menu-dropdown`),{className:`astryx78zum5 astryxdt5ytf astryx1lsbc85 astryxu0wf1k astryx7a5moj`}),children:[(0,N.jsx)(`span`,{role:`presentation`,className:`astryx141an7d astryx1ltkj2j astryx2mo6ok astryxv1l7n4 astryxu0wf1k astryxrrkdod`,children:t}),n.map(e=>{let t=l.value===e.value;return(0,N.jsxs)(`div`,{role:`menuitemradio`,tabIndex:-1,"aria-checked":t,onClick:()=>E(e.value),onKeyDown:t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),E(e.value))},...a(o(`tab-menu-item`),{0:{className:`astryx78zum5 astryx6s0dn4 astryx1qughib astryx1txdalj astryxce4md1 astryxrrkdod astryxh6dtrn astryxjb2p0i astryxcr08ib astryx1kq96og astryx1sodnla astryx1tgivj0 astryx1ypdohk astryx15406qy astryxuedmi6 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryx17nn4n9`},1:{className:`astryx78zum5 astryx6s0dn4 astryx1qughib astryx1txdalj astryxce4md1 astryxrrkdod astryxh6dtrn astryxjb2p0i astryxcr08ib astryx1kq96og astryx1tgivj0 astryx1ypdohk astryx15406qy astryxuedmi6 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryx17nn4n9 astryx1e4wzip`}}[!!t<<0]),children:[(0,N.jsxs)(`span`,{className:`astryx78zum5 astryx6s0dn4 astryx1txdalj`,children:[e.icon&&te(e.icon,{size:`sm`,color:`secondary`}),e.label]}),t&&(0,N.jsx)(f,{icon:`check`,size:`sm`,color:`accent`})]},e.value)})]}),{placement:`below`,alignment:`start`})]})}var M,N,P,F,I;function L(){return(L=t((()=>{M=e(n(),1),i(),d(),h(),g(),m(),S(),y(),s(),N=c(),P={trigger:{kVAEAm:`astryx1n2onr6`,k1xSpc:`astryx3nfvp2`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kOIVth:`astryxzye2dw`,kg3NbH:`astryxrrkdod`,kWkggS:`astryxjbqb8w`,kMzoRj:`astryxc342km`,ksu8eU:`astryxng3xce`,kaIpWk:`astryxh6dtrn`,kMv6JI:`astryxjb2p0i`,kGuDYH:`astryxcr08ib`,kLWn49:`astryx1kq96og`,k63SB2:`astryx1sodnla`,kMwMTN:`astryxv1l7n4`,kkrTdU:`astryx1ypdohk`,kybGjl:`astryx1hl2dhg`,k1ekBW:`astryxt3l3uh`,kIyJzY:`astryxuedmi6`,kAMwcw:`astryxlr8y92`,kI3sdo:`astryx17nn4n9`,kInvED:`astryx1wfwxd8 astryx7s97pk`,$$css:!0},triggerSelected:{kMwMTN:`astryx1tgivj0`,k63SB2:`astryx2mo6ok`,$$css:!0},hoverBg:{kVAEAm:`astryx10l6tqk`,kpwlN0:`astryx10a8y8t`,kogj98:`astryx1bpp3o7`,kzqmXN:`astryxh8yej3`,kaIpWk:`astryxh6dtrn`,kfzvcC:`astryx47corl`,kWkggS:`astryxjbqb8w astryxh1nd0x`,k1ekBW:`astryx15406qy`,kIyJzY:`astryxuedmi6`,kAMwcw:`astryxlr8y92`,$$css:!0}},F={sm:{kZKoxP:`astryx6k0iem`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,$$css:!0}},I={sm:{kZKoxP:`astryx6k0iem`,$$css:!0},md:{kZKoxP:`astryx1ueg155`,$$css:!0},lg:{kZKoxP:`astryxssyfek`,$$css:!0}},j.displayName=`TabMenu`,j.__docgenInfo={description:`Tab menu trigger that opens a dropdown of additional tab options.
Shows the selected option's label as trigger text when an option is active.
Dropdown includes a heading showing the menu's label prop.

@example
\`\`\`
<TabList value={tab} onChange={setTab}>
  <Tab value="overview" label="Overview" />
  <TabMenu label="More" options={[
    { value: "settings", label: "Settings" },
    { value: "history", label: "History" },
  ]} />
</TabList>
\`\`\``,methods:[],displayName:`TabMenu`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLButtonElement>`,elements:[{name:`HTMLButtonElement`}]},description:``},label:{required:!0,tsType:{name:`string`},description:`Label for the trigger button and dropdown heading.
Displayed as trigger text when no option is selected.`},options:{required:!0,tsType:{name:`Array`,elements:[{name:`TabMenuOption`}],raw:`TabMenuOption[]`},description:`Menu options rendered in the dropdown.`}},composes:[`Pick`]}})))()}var R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=t((()=>{R=n(),b(),x(),L(),_(),l(),k(),C(),z=c(),B={title:`Core/TabList`,component:E,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`sm`,`md`,`lg`],description:`Size of the tab hover targets`}}},V={args:{size:`md`},render:e=>{let[t,n]=(0,R.useState)(`home`);return(0,z.jsxs)(E,{value:t,onChange:n,size:e.size,children:[(0,z.jsx)(T,{value:`home`,label:`Home`}),(0,z.jsx)(T,{value:`projects`,label:`Projects`}),(0,z.jsx)(T,{value:`settings`,label:`Settings`})]})}},H={args:{size:`md`},render:e=>{let[t,n]=(0,R.useState)(`home`);return(0,z.jsxs)(E,{value:t,onChange:n,size:e.size,children:[(0,z.jsx)(T,{value:`home`,label:`Home`}),(0,z.jsx)(T,{value:`projects`,label:`Projects`}),(0,z.jsx)(j,{label:`More`,options:[{value:`analytics`,label:`Analytics`},{value:`reports`,label:`Reports`},{value:`billing`,label:`Billing`}]})]})}},U={args:{size:`md`},render:e=>{let[t,n]=(0,R.useState)(`analytics`);return(0,z.jsxs)(E,{value:t,onChange:n,size:e.size,children:[(0,z.jsx)(T,{value:`home`,label:`Home`}),(0,z.jsx)(T,{value:`projects`,label:`Projects`}),(0,z.jsx)(j,{label:`More`,options:[{value:`analytics`,label:`Analytics`},{value:`reports`,label:`Reports`}]})]})}},W={render:()=>{let[e,t]=(0,R.useState)(`home`);return(0,z.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`},children:[`sm`,`md`,`lg`].map(n=>(0,z.jsxs)(`div`,{children:[(0,z.jsxs)(`div`,{style:{marginBottom:`8px`,fontSize:`12px`,color:`#666`,fontFamily:`monospace`},children:[`size=\\"`,n,`\\"`]}),(0,z.jsx)(`div`,{style:{border:`1px dashed #ccc`,display:`inline-flex`},children:(0,z.jsxs)(E,{value:e,onChange:t,size:n,children:[(0,z.jsx)(T,{value:`home`,label:`Home`}),(0,z.jsx)(T,{value:`projects`,label:`Projects`}),(0,z.jsx)(T,{value:`settings`,label:`Settings`})]})})]},n))})}},G={args:{size:`md`},render:e=>{let[t,n]=(0,R.useState)(`home`),r=(0,z.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,z.jsx)(`path`,{d:`M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2h1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z`})}),i=(0,z.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,z.jsx)(`path`,{fillRule:`evenodd`,d:`M6.955 1.45A.5.5 0 0 1 7.452 1h1.096a.5.5 0 0 1 .497.45l.17 1.699c.484.12.94.312 1.356.562l1.321-.816a.5.5 0 0 1 .67.087l.774.774a.5.5 0 0 1 .087.67l-.816 1.321c.25.416.442.872.562 1.356l1.699.17a.5.5 0 0 1 .45.497v1.096a.5.5 0 0 1-.45.497l-1.699.17c-.12.484-.312.94-.562 1.356l.816 1.321a.5.5 0 0 1-.087.67l-.774.774a.5.5 0 0 1-.67.087l-1.321-.816c-.416.25-.872.442-1.356.562l-.17 1.699a.5.5 0 0 1-.497.45H7.452a.5.5 0 0 1-.497-.45l-.17-1.699a4.973 4.973 0 0 1-1.356-.562l-1.321.816a.5.5 0 0 1-.67-.087l-.774-.774a.5.5 0 0 1-.087-.67l.816-1.321a4.972 4.972 0 0 1-.562-1.356l-1.699-.17A.5.5 0 0 1 1 8.548V7.452a.5.5 0 0 1 .45-.497l1.699-.17c.12-.484.312-.94.562-1.356l-.816-1.321a.5.5 0 0 1 .087-.67l.774-.774a.5.5 0 0 1 .67-.087l1.321.816c.416-.25.872-.442 1.356-.562l.17-1.699ZM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z`,clipRule:`evenodd`})});return(0,z.jsxs)(E,{value:t,onChange:n,size:e.size,children:[(0,z.jsx)(T,{value:`home`,label:`Home`,icon:r}),(0,z.jsx)(T,{value:`settings`,label:`Settings`,icon:i})]})}},K={args:{size:`md`},render:e=>{let[t,n]=(0,R.useState)(`desktop`),r=(0,z.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,z.jsx)(`path`,{d:`M2.5 3A1.5 1.5 0 0 0 1 4.5v5A1.5 1.5 0 0 0 2.5 11h4.75v1.5H5a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H8.75V11h4.75A1.5 1.5 0 0 0 15 9.5v-5A1.5 1.5 0 0 0 13.5 3h-11Zm0 1.5h11v5h-11v-5Z`})}),i=(0,z.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,z.jsx)(`path`,{d:`M5 1.5A1.5 1.5 0 0 0 3.5 3v10A1.5 1.5 0 0 0 5 14.5h6a1.5 1.5 0 0 0 1.5-1.5V3A1.5 1.5 0 0 0 11 1.5H5Zm0 1.5h6v10H5V3Zm2.25 8.5a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1-.75-.75Z`})}),a=(0,z.jsx)(`svg`,{viewBox:`0 0 16 16`,fill:`currentColor`,width:`100%`,height:`100%`,children:(0,z.jsx)(`path`,{d:`M8 1.5a6.5 6.5 0 0 0 0 13h.25a1.75 1.75 0 0 0 1.2-3.02.35.35 0 0 1 .23-.6h.97A3.85 3.85 0 0 0 14.5 7.03 5.53 5.53 0 0 0 8.97 1.5H8Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm2-1.75a1 1 0 1 1 2 0 1 1 0 0 1-2 0ZM4.5 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm6-1.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z`})});return(0,z.jsxs)(E,{value:t,onChange:n,size:e.size,children:[(0,z.jsx)(T,{value:`desktop`,label:`Desktop preview`,icon:r,isLabelHidden:!0}),(0,z.jsx)(T,{value:`phone`,label:`Phone preview`,icon:i,isLabelHidden:!0}),(0,z.jsx)(T,{value:`theme`,label:`Theme`,icon:a,isLabelHidden:!0})]})}},q={render:()=>{let[e,t]=(0,R.useState)(`all`);return(0,z.jsxs)(E,{value:e,onChange:t,size:`lg`,hasDivider:!0,children:[(0,z.jsx)(T,{value:`all`,label:`All items`}),(0,z.jsx)(T,{value:`active`,label:`Active`}),(0,z.jsx)(T,{value:`archived`,label:`Archived`}),(0,z.jsxs)(`div`,{style:{marginInlineStart:`auto`,display:`flex`,alignItems:`center`,gap:`4px`},children:[(0,z.jsx)(u,{label:`Filter`,variant:`ghost`,size:`lg`,icon:(0,z.jsx)(D,{}),isIconOnly:!0}),(0,z.jsx)(u,{label:`New item`,variant:`primary`,size:`lg`,icon:(0,z.jsx)(A,{})})]})]})}},J={name:`Divider Gap (sm / md / lg)`,render:()=>{let[e,t]=(0,R.useState)(`overview`);return(0,z.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[`sm`,`md`,`lg`].map(n=>(0,z.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,z.jsxs)(`span`,{style:{font:`600 12px system-ui`,color:`#4E606F`},children:[`size="`,n,`" · hasDivider · matched Button size`]}),(0,z.jsxs)(E,{value:e,onChange:t,size:n,hasDivider:!0,children:[(0,z.jsx)(T,{value:`overview`,label:`Overview`}),(0,z.jsx)(T,{value:`activity`,label:`Activity`}),(0,z.jsx)(T,{value:`settings`,label:`Settings`}),(0,z.jsxs)(`div`,{style:{marginInlineStart:`auto`,display:`flex`,alignItems:`center`,gap:`4px`},children:[(0,z.jsx)(u,{label:`Filter`,variant:`ghost`,size:n,icon:(0,z.jsx)(D,{}),isIconOnly:!0}),(0,z.jsx)(u,{label:`New item`,variant:`primary`,size:n,icon:(0,z.jsx)(A,{})})]})]})]},n))})}},Y={render:()=>{let[e,t]=(0,R.useState)(`home`);return(0,z.jsx)(`div`,{style:{width:`500px`},children:(0,z.jsxs)(E,{value:e,onChange:t,layout:`fill`,hasDivider:!0,children:[(0,z.jsx)(T,{value:`home`,label:`Home`}),(0,z.jsx)(T,{value:`projects`,label:`Projects`}),(0,z.jsx)(T,{value:`settings`,label:`Settings`})]})})}},X={render:()=>{let[e,t]=(0,R.useState)(`overview`);return(0,z.jsx)(`div`,{style:{maxWidth:`400px`,border:`1px dashed #ccc`},children:(0,z.jsx)(E,{value:e,onChange:t,children:(0,z.jsxs)(v,{gap:.5,hasSnap:!1,children:[(0,z.jsx)(T,{value:`overview`,label:`Overview`}),(0,z.jsx)(T,{value:`activity`,label:`Activity`}),(0,z.jsx)(T,{value:`members`,label:`Members`}),(0,z.jsx)(T,{value:`settings`,label:`Settings`}),(0,z.jsx)(T,{value:`integrations`,label:`Integrations`}),(0,z.jsx)(T,{value:`billing`,label:`Billing & Plans`}),(0,z.jsx)(T,{value:`security`,label:`Security`}),(0,z.jsx)(T,{value:`notifications`,label:`Notifications`}),(0,z.jsx)(T,{value:`api`,label:`API Keys`})]})})})}},Z={render:()=>{let[e,t]=(0,R.useState)(`dashboard`);return(0,z.jsx)(`div`,{style:{maxWidth:`350px`},children:(0,z.jsx)(E,{value:e,onChange:t,hasDivider:!0,size:`lg`,children:(0,z.jsxs)(v,{gap:.5,hasSnap:!1,children:[(0,z.jsx)(T,{value:`dashboard`,label:`Dashboard`}),(0,z.jsx)(T,{value:`analytics`,label:`Analytics`}),(0,z.jsx)(T,{value:`reports`,label:`Reports`}),(0,z.jsx)(T,{value:`customers`,label:`Customers`}),(0,z.jsx)(T,{value:`products`,label:`Products`}),(0,z.jsx)(T,{value:`orders`,label:`Orders`})]})})})}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
          color: '#666',
          fontFamily: 'monospace'
        }}>
              size=\\"{size}\\"
            </div>
            <div style={{
          border: '1px dashed #ccc',
          display: 'inline-flex'
        }}>
              <TabList value={value} onChange={setValue} size={size}>
                <Tab value="home" label="Home" />
                <Tab value="projects" label="Projects" />
                <Tab value="settings" label="Settings" />
              </TabList>
            </div>
          </div>)}
      </div>;
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
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
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
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
}`,...q.parameters?.docs?.source},description:{story:`Demonstrates a common page header pattern: large tab list items on the left
with action buttons on the right, separated by a full-width divider underneath.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
          color: '#4E606F'
        }}>
              size=&quot;{size}&quot; · hasDivider · matched Button size
            </span>
            <TabList value={value} onChange={setValue} size={size} hasDivider>
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
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('overview');
    return <div style={{
      maxWidth: '400px',
      border: '1px dashed #ccc'
    }}>
        <TabList value={value} onChange={setValue}>
          <Carousel gap={0.5} hasSnap={false}>
            <Tab value="overview" label="Overview" />
            <Tab value="activity" label="Activity" />
            <Tab value="members" label="Members" />
            <Tab value="settings" label="Settings" />
            <Tab value="integrations" label="Integrations" />
            <Tab value="billing" label="Billing & Plans" />
            <Tab value="security" label="Security" />
            <Tab value="notifications" label="Notifications" />
            <Tab value="api" label="API Keys" />
          </Carousel>
        </TabList>
      </div>;
  }
}`,...X.parameters?.docs?.source},description:{story:`When tabs overflow, wrap TabList's children in Carousel.
The Carousel handles scroll, fade masks, and arrow buttons.
Each tab keeps its intrinsic label width — no truncation.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('dashboard');
    return <div style={{
      maxWidth: '350px'
    }}>
        <TabList value={value} onChange={setValue} hasDivider size="lg">
          <Carousel gap={0.5} hasSnap={false}>
            <Tab value="dashboard" label="Dashboard" />
            <Tab value="analytics" label="Analytics" />
            <Tab value="reports" label="Reports" />
            <Tab value="customers" label="Customers" />
            <Tab value="products" label="Products" />
            <Tab value="orders" label="Orders" />
          </Carousel>
        </TabList>
      </div>;
  }
}`,...Z.parameters?.docs?.source},description:{story:`Overflow with divider — typical page header in a narrow viewport.`,...Z.parameters?.docs?.description}}},Q=[`Default`,`WithMenu`,`MenuWithSelectedChild`,`SizeVariants`,`WithIcons`,`IconOnly`,`WithActions`,`DividerGap`,`FillLayout`,`Overflow`,`OverflowWithDivider`]})))()}$();export{V as Default,J as DividerGap,Y as FillLayout,K as IconOnly,U as MenuWithSelectedChild,X as Overflow,Z as OverflowWithDivider,W as SizeVariants,q as WithActions,G as WithIcons,H as WithMenu,Q as __namedExportsOrder,B as default};