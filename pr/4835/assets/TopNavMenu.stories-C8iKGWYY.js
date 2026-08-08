import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./stylex-Dft6gtPK.js";import{n as a}from"./mergeProps-JRyAvMxc.js";import{n as o}from"./mergeRefs-CPqjs56a.js";import{n as s,t as c}from"./themeProps-CREkzZh6.js";import{t as l}from"./jsx-runtime-DeHZSEgm.js";import{n as u,t as d}from"./Button-BVMvoKVE.js";import{n as f,t as p}from"./useLinkComponent-DvgS1IvL.js";import{n as m,t as h}from"./useIcon-Dlr4L4I4.js";import{n as g,r as ee}from"./AppShellMobileContext-BSIiXD93.js";import{a as _,o as v}from"./TopNavMobileContentContext-QrWiuemV.js";import{n as y,t as b}from"./useListFocus-C3PMl9Zf.js";import{n as te,t as x}from"./usePopover-DPO-mU50.js";import{n as ne,t as S}from"./useTypeahead-kmZe0nBq.js";import{n as re,t as ie}from"./useMenuHover-ehpIja8z.js";import{n as ae,t as oe}from"./NavIcon-oDQitls3.js";import{n as se,t as C}from"./ChartBarIcon-mq7jPdFj.js";import{n as w,t as ce}from"./Grid-DS-HeJ6q.js";import{a as T,c as le,i as E,l as D,n as ue,o as de,r as O,s as k,t as fe,u as pe}from"./UserCircleIcon-B6-hX0Eb.js";import{n as A,t as j}from"./navItemStyles.stylex-B-vWs4Jb.js";import{n as me,t as he}from"./CubeIcon-CNZB-VPW.js";import{n as ge,t as M}from"./ShieldCheckIcon-CbhrdRm2.js";function _e(e){return e.title}function N({ref:e,label:t,items:n,delay:i=150,hideDelay:c=200}){let l=v(),u=m(`chevronDown`),{closeMobileNav:d}=ee(),p=f(),[h,g]=(0,P.useState)(!1),_=(0,P.useId)(),b=pe(),x=(0,P.useRef)(null),S=te({role:`none`,xstyle:I.menuOffset}),{triggerProps:ie,contentProps:ae,menuRef:oe,setTriggerEl:se}=re({show:S.show,hide:S.hide,isOpen:S.isOpen,isEnabled:!0,showDelay:i,hideDelay:c}),C=o(x,S.triggerRef,se,e),{listRef:w,handleKeyDown:ce,handleFocus:T,focusItem:le}=y({itemSelector:`[role="menuitem"]`,hasRovingTabIndex:!0,onEscape:S.hide}),E=(0,P.useCallback)(()=>w.current?Array.from(w.current.querySelectorAll(`[role="menuitem"]`)):[],[w]),D=ne({getItemLabels:()=>E().map(e=>e.textContent),onMatch:le,getCurrentIndex:()=>E().findIndex(e=>e===document.activeElement||e.contains(document.activeElement))}),ue=(0,P.useCallback)(e=>{if(e.key===`Enter`||e.key===` `){let t=document.activeElement;if(t?.getAttribute(`role`)===`menuitem`){e.preventDefault(),t.click();return}}if(D.onKeyDown(e)){e.preventDefault();return}ce(e)},[ce,D]),de=o(oe,w);return l===`mobile-bar`?null:l===`drawer`?(0,F.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf`,children:[(0,F.jsxs)(`button`,{type:`button`,onClick:()=>g(e=>!e),"aria-expanded":h,"aria-controls":`${_}-items`,...r(A.item,L.header),children:[t,(0,F.jsx)(`span`,{...{0:{className:`astryx3nfvp2 astryx11xpdln astryxuedmi6 astryxlr8y92`},1:{className:`astryx3nfvp2 astryx11xpdln astryxuedmi6 astryxlr8y92 astryx19jd1h0`}}[!!h<<0],children:u})]}),(0,F.jsx)(`div`,{id:`${_}-items`,...{0:{className:`astryxrvj5dj astryxihq33y astryx1qn9uv2 astryx80gvsz astryxlr8y92`},1:{className:`astryxrvj5dj astryx1qn9uv2 astryx80gvsz astryxlr8y92 astryx1tu4anv`}}[!!h<<0],children:(0,F.jsx)(`div`,{className:`astryxb3r6kr astryx2lwn1j`,children:n.map(e=>(0,F.jsxs)(p,{href:e.href,onClick:t=>{e.onClick?.(),d()},...r(A.item,L.item),children:[e.icon&&(0,F.jsx)(`span`,{className:`astryx2lah0s astryxw4jnvo astryx1qx5ct2`,children:e.icon}),(0,F.jsxs)(`span`,{className:`astryx78zum5 astryxdt5ytf astryx1lsbc85`,children:[e.title,e.description&&(0,F.jsx)(`span`,{className:`astryx141an7d astryxv1l7n4 astryx1sodnla`,children:e.description})]})]},_e(e)))})})]}):(0,F.jsxs)(F.Fragment,{children:[(0,F.jsxs)(`button`,{ref:C,type:`button`,...S.triggerProps,...ie,...a(s(`top-nav-menu`),{0:{className:`astryx3nfvp2 astryx6s0dn4 astryx1txdalj astryx1vofgu7 astryxrrkdod astryxh6dtrn astryxcr08ib astryx1kq96og astryx1e4wzip astryxv1l7n4 astryx1hl2dhg astryx1ypdohk astryxs2xxs2 astryxuedmi6 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx1gs6z28 astryxjb2p0i`},1:{className:`astryx3nfvp2 astryx6s0dn4 astryx1txdalj astryx1vofgu7 astryxrrkdod astryxh6dtrn astryxcr08ib astryx1kq96og astryx1e4wzip astryx1hl2dhg astryx1ypdohk astryxs2xxs2 astryxuedmi6 astryxlr8y92 astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx1gs6z28 astryxjb2p0i astryx1tgivj0 astryx1lmrjuc`}}[!!S.isOpen<<0]),children:[t,(0,F.jsx)(`span`,{...{0:{className:`astryx3nfvp2 astryx6s0dn4 astryx11xpdln astryxuedmi6 astryxlr8y92`},1:{className:`astryx3nfvp2 astryx6s0dn4 astryx11xpdln astryxuedmi6 astryxlr8y92 astryx19jd1h0`}}[!!S.isOpen<<0],children:u})]}),S.render((0,F.jsx)(`div`,{ref:de,role:`menu`,"aria-label":t,...ae,onKeyDown:ue,onFocus:T,className:`astryx78zum5 astryxdt5ytf astryxzye2dw astryx1u2d2a2 astryx9epnlk`,children:n.map(e=>{let t=e.href?`a`:`div`;return(0,F.jsxs)(t,{role:`menuitem`,tabIndex:-1,href:e.href,onClick:e.onClick,className:`astryx78zum5 astryx6s0dn4 astryxjcht0a astryx8o8v82 astryxrrkdod astryxh6dtrn astryx1hl2dhg astryx1ypdohk astryx15406qy astryxuedmi6 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryx1gs6z28 astryx17nn4n9 astryx1wfwxd8 astryx7s97pk`,children:[(0,F.jsx)(`div`,{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx100vrsf astryx1vqgdyp astryxh6dtrn astryx17x4s8c astryx2lah0s`,children:e.icon}),(0,F.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryxzye2dw astryxeuugli`,children:[(0,F.jsx)(`span`,{className:`astryxcr08ib astryx1kq96og astryx2mo6ok astryx1tgivj0`,children:e.title}),e.description&&(0,F.jsx)(`span`,{className:`astryx141an7d astryx1ltkj2j astryx1sodnla astryxv1l7n4`,children:e.description})]})]},_e(e))})}),{placement:`below`,alignment:b,xstyle:I.menuOffset})]})}var P,F,I,L;function ve(){return(ve=t((()=>{P=e(n(),1),i(),x(),ie(),b(),S(),h(),j(),D(),_(),g(),p(),c(),F=l(),I={menuOffset:{keoZOQ:`astryxcsaf9d`,$$css:!0}},L={header:{kjj79g:`astryx1qughib`,kQgIW9:`astryx1gs6z28`,kMzoRj:null,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:null,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kVAM5u:null,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kC7eKd:`astryx11g6tue`,ku1ltF:null,kHypHr:null,kWkggS:null,kKwaWg:null,kl9DO0:null,k1YJky:null,kDwdnV:null,kAiEkY:null,kz484i:null,kgSjnq:null,$$css:!0},item:{kZCmMZ:`astryx31w388`,kE3dHu:null,kpe85a:null,kybGjl:`astryx1hl2dhg`,k1TLXF:null,kMnn75:null,kmVMDM:null,kNySMw:null,$$css:!0}},N.displayName=`TopNavMenu`,N.__docgenInfo={description:`A navigation item that displays a hover-triggered overflow menu.

Renders as a nav item in TopNav's startContent slot. On hover,
shows a popover with rich menu items containing an icon, title,
and optional description.

@example
\`\`\`
<TopNav
  startContent={
    <>
      <TopNavItem label="Home" href="/" isSelected />
      <TopNavMenu
        label="Products"
        items={[
          {
            title: 'Analytics',
            description: 'Track and analyze user behavior',
            icon: <ChartBarIcon />,
            href: '/products/analytics',
          },
          {
            title: 'Messaging',
            description: 'Real-time communication tools',
            icon: <ChatBubbleIcon />,
            href: '/products/messaging',
          },
        ]}
      />
    </>
  }
/>
\`\`\``,methods:[],displayName:`TopNavMenu`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLButtonElement>`,elements:[{name:`HTMLButtonElement`}]},description:``},label:{required:!0,tsType:{name:`string`},description:`The visible label for the nav item trigger.`},items:{required:!0,tsType:{name:`Array`,elements:[{name:`TopNavMenuItemData`}],raw:`TopNavMenuItemData[]`},description:`Menu items to display in the hover popover.`},delay:{required:!1,tsType:{name:`number`},description:`Delay before showing the menu on hover (ms).
@default 150`,defaultValue:{value:`150`,computed:!1}},hideDelay:{required:!1,tsType:{name:`number`},description:`Delay before hiding the menu after mouse leaves (ms).
@default 200`,defaultValue:{value:`200`,computed:!1}}},composes:[`Omit`]}})))()}function R({ref:e,label:t,items:n,featured:r,delay:i=150,hideDelay:a=250,onOpenChange:o}){let s=v();return s===`mobile-bar`?null:s===`drawer`?(0,B.jsx)(be,{label:t,items:n,featured:r}):(0,B.jsx)(ye,{ref:e,label:t,items:n,featured:r,delay:i,hideDelay:a,onOpenChange:o})}function ye({ref:e,label:t,items:n,featured:r,delay:i=150,hideDelay:c=250,onOpenChange:l}){let u=pe(),d=m(`chevronDown`),f=(0,z.useRef)(null),p=(0,z.useRef)(null),h=(0,z.useRef)(null),g=(0,z.useRef)(!1),ee=(0,z.useCallback)(()=>{l?.(!0)},[l]),_=(0,z.useCallback)(()=>{l?.(!1)},[l]),v=te({role:`none`,hasSurface:!1,onShow:ee,onHide:_});(0,z.useEffect)(()=>{let e=h.current?.closest(`nav`);return e&&v.triggerRef(e),()=>{v.triggerRef(null)}},[v]);let y=(0,z.useCallback)(()=>{f.current&&=(clearTimeout(f.current),null),p.current&&=(clearTimeout(p.current),null)},[]),b=(0,z.useCallback)(()=>{y(),f.current=setTimeout(()=>{v.show({skipAutoFocus:!0})},i)},[y,v,i]),x=(0,z.useCallback)(()=>{y(),p.current=setTimeout(()=>{v.hide()},c)},[y,v,c]),ne=(0,z.useCallback)(()=>{g.current||b()},[b]),S=(0,z.useCallback)(()=>{g.current||x()},[x]),re=(0,z.useCallback)(()=>{y(),v.isOpen?(g.current=!1,v.hide(),h.current?.focus()):(g.current=!0,v.show())},[v,y]);return(0,z.useEffect)(()=>()=>{y()},[y]),(0,B.jsxs)(B.Fragment,{children:[(0,B.jsxs)(`button`,{ref:o(h,e),type:`button`,...v.triggerProps,onClick:re,onMouseEnter:ne,onMouseLeave:S,...a(s(`top-nav-mega-menu`),{0:{className:`astryx3nfvp2 astryx6s0dn4 astryx1txdalj astryx1vofgu7 astryxrrkdod astryxh6dtrn astryxcr08ib astryx1kq96og astryx1e4wzip astryxv1l7n4 astryx1hl2dhg astryx1ypdohk astryxs2xxs2 astryxuedmi6 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx1gs6z28 astryxjb2p0i`},1:{className:`astryx3nfvp2 astryx6s0dn4 astryx1txdalj astryx1vofgu7 astryxrrkdod astryxh6dtrn astryxcr08ib astryx1kq96og astryx1e4wzip astryx1hl2dhg astryx1ypdohk astryxs2xxs2 astryxuedmi6 astryxlr8y92 astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx1gs6z28 astryxjb2p0i astryx1tgivj0 astryx1lmrjuc`}}[!!v.isOpen<<0]),children:[t,(0,B.jsx)(`span`,{...{0:{className:`astryx3nfvp2 astryx6s0dn4 astryx11xpdln astryxuedmi6 astryxlr8y92`},1:{className:`astryx3nfvp2 astryx6s0dn4 astryx11xpdln astryxuedmi6 astryxlr8y92 astryx19jd1h0`}}[!!v.isOpen<<0],children:d})]}),v.render((0,B.jsx)(`div`,{role:`group`,"aria-label":t,onMouseEnter:ne,onMouseLeave:S,className:`astryx1prclbq astryx11xkdxz astryx13fuv20 astryx1pc3f07 astryx1hviunn astryx1i5ehqx astryxb3r6kr astryx78zum5 astryxdt5ytf astryx2lwn1j`,children:(0,B.jsxs)(`div`,{className:`astryx78zum5 astryx1a02dak astryx1qh66ti astryx8o8v82 astryxrrkdod astryx1m1aaou astryx9f619 astryx1odjw0f astryxish69e`,children:[n!=null&&(0,B.jsx)(ce,{columns:2,gap:2,xstyle:V.menuWrapper,children:n}),r!=null&&(0,B.jsx)(`div`,{className:`astryx1iyjqo2 astryxs83m0k astryxjpgo6f astryx1hviunn astryxwmxj5m astryxb3r6kr astryx78zum5 astryxdt5ytf`,children:r})]})}),{placement:`below`,alignment:u,xstyle:[V.panelAnimation,V.panelViewportFit]})]})}function be({label:e,items:t,featured:n}){let[i,o]=(0,z.useState)(!1),c=m(`chevronDown`),l=`mega-menu-${e.toLowerCase().replace(/\s+/g,`-`)}`;return(0,B.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf`,children:[(0,B.jsxs)(`button`,{type:`button`,onClick:()=>o(e=>!e),"aria-expanded":i,"aria-controls":`${l}-items`,...a(s(`top-nav-mega-menu`,{mode:`drawer`}),r(A.item,V.drawerHeader)),children:[e,(0,B.jsx)(`span`,{...{0:{className:`astryx3nfvp2 astryx11xpdln astryxuedmi6 astryxlr8y92`},1:{className:`astryx3nfvp2 astryx11xpdln astryxuedmi6 astryxlr8y92 astryx19jd1h0`}}[!!i<<0],children:c})]}),(0,B.jsx)(`div`,{id:`${l}-items`,...{0:{className:`astryxrvj5dj astryxihq33y astryx1qn9uv2 astryx80gvsz astryxlr8y92`},1:{className:`astryxrvj5dj astryx1qn9uv2 astryx80gvsz astryxlr8y92 astryx1tu4anv`}}[!!i<<0],children:(0,B.jsxs)(`div`,{className:`astryxb3r6kr astryx2lwn1j`,children:[t,n!=null&&(0,B.jsx)(`div`,{className:`astryxtbrsbv astryx1l10yog astryx1hviunn astryxwmxj5m astryxb3r6kr`,children:n})]})})]})}var z,B,V;function xe(){return(xe=t((()=>{z=e(n(),1),i(),x(),w(),h(),j(),D(),_(),c(),B=l(),V={panelAnimation:{kSiTet:`astryxg01cxk astryxofkqq2`,k3aq6I:`astryx1bvilyr astryx9cjr8z`,k1ekBW:`astryx4bbghf`,kIyJzY:`astryxgneliz`,kAMwcw:`astryxlr8y92`,kzIqYQ:`astryxd00j3c`,kamtoy:`astryx4itv7f`,k1tdAh:`astryx12p7p72`,$$css:!0},panelViewportFit:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kskxy:`astryxbhvqqn`,$$css:!0},menuWrapper:{kzQI83:`astryxgyuaek`,kmuXW:`astryxs83m0k`,kCS8Yb:`astryxchdapg`,k7Eaqz:`astryxeuugli`,$$css:!0},drawerHeader:{kjj79g:`astryx1qughib`,kQgIW9:`astryx1gs6z28`,kMzoRj:null,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:null,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kVAM5u:null,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kC7eKd:`astryx11g6tue`,ku1ltF:null,kHypHr:null,kWkggS:null,kKwaWg:null,kl9DO0:null,k1YJky:null,kDwdnV:null,kAiEkY:null,kz484i:null,kgSjnq:null,$$css:!0}},R.displayName=`TopNavMegaMenu`,R.__docgenInfo={description:`A navigation item that displays a full-width mega menu on hover.

Uses a composed children API with sub-components:
- \`items\` — ReactNode slot, typically TopNavMegaMenuItem components
- \`featured\` — ReactNode slot for the right-panel / drawer featured card

Supports three render modes via TopNavRenderContext:
- \`'default'\`: desktop popover with hover/click trigger
- \`'mobile-bar'\`: hidden (returns null)
- \`'drawer'\`: inline collapsible matching TopNavMenu pattern

@example
\`\`\`
<TopNav
  startContent={
    <TopNavMegaMenu
      label="Products"
      items={
        <>
          <TopNavMegaMenuItem
            title="Analytics"
            description="Track behavior"
            icon={<ChartIcon />}
            href="/analytics"
          />
          <TopNavMegaMenuItem
            title="Messaging"
            description="Real-time comms"
            icon={<ChatIcon />}
            href="/messaging"
          />
        </>
      }
      featured={
        <>
          <strong>New: AI Features</strong>
          <p>Explore our latest AI-powered tools.</p>
        </>
      }
    />
  }
/>
\`\`\``,methods:[],displayName:`TopNavMegaMenu`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLButtonElement>`,elements:[{name:`HTMLButtonElement`}]},description:``},label:{required:!0,tsType:{name:`string`},description:`The visible label for the nav item trigger.`},items:{required:!1,tsType:{name:`ReactNode`},description:`Menu items slot — typically one or more TopNavMegaMenuItem components,
but accepts any ReactNode for custom layouts.`},featured:{required:!1,tsType:{name:`ReactNode`},description:`Featured content slot — rendered in the right panel on desktop,
and below the items in the mobile drawer.`},delay:{required:!1,tsType:{name:`number`},description:`Delay before showing the menu on hover (ms). @default 150`,defaultValue:{value:`150`,computed:!1}},hideDelay:{required:!1,tsType:{name:`number`},description:`Delay before hiding the menu after mouse leaves (ms). @default 250`,defaultValue:{value:`250`,computed:!1}},onOpenChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(isOpen: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`isOpen`}],return:{name:`void`}}},description:`Callback fired when the mega menu opens or closes.
Useful for coordinating wrapper styles (e.g. hiding other shadows).`}},composes:[`Omit`]}})))()}function H({ref:e,title:t,description:n,icon:i,href:o,onClick:c,as:l,tabIndex:u}){let d=v(),p=f(l),{closeMobileNav:m}=ee();if(d===`drawer`){let l=o?p:`button`,u=l===`button`?{type:`button`}:{};return(0,U.jsxs)(l,{ref:e,href:o,onClick:()=>{c?.(),m()},...u,...a(s(`top-nav-mega-menu-item`,{mode:`drawer`}),r(A.item,Se.drawerItem)),children:[i&&(0,U.jsx)(`div`,{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx1td3qas astryx10w6t97 astryxh6dtrn astryx17x4s8c astryx2lah0s astryxv9yike astryxjc2qm6`,children:i}),(0,U.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryx1lsbc85 astryxeuugli`,children:[t,n&&(0,U.jsx)(`span`,{className:`astryx141an7d astryx1ltkj2j astryxv1l7n4 astryx1sodnla`,children:n})]})]})}return(0,U.jsxs)(o?p:`div`,{ref:e,href:o,onClick:c,tabIndex:u,...a(s(`top-nav-mega-menu-item`),{className:`astryx78zum5 astryx1cy8zhl astryxjcht0a astryx8o8v82 astryxrrkdod astryxh6dtrn astryx1hl2dhg astryx1ypdohk astryx15406qy astryxuedmi6 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1gs6z28 astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx1heor9g astryxjb2p0i astryx1yc453h astryx9f619 astryxh8yej3`}),children:[i&&(0,U.jsx)(`div`,{className:`astryx78zum5 astryx6s0dn4 astryxl56j7k astryx100vrsf astryx1vqgdyp astryxh6dtrn astryx17x4s8c astryx2lah0s astryxv9yike`,children:i}),(0,U.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryxzye2dw astryxeuugli`,children:[(0,U.jsx)(`span`,{className:`astryxcr08ib astryx1kq96og astryx2mo6ok astryx1tgivj0`,children:t}),n&&(0,U.jsx)(`span`,{className:`astryx141an7d astryx1ltkj2j astryx1sodnla astryxv1l7n4`,children:n})]})]})}var U,Se;function Ce(){return(Ce=t((()=>{n(),i(),j(),p(),_(),g(),c(),U=l(),Se={drawerItem:{kZCmMZ:`astryx31w388`,kE3dHu:null,kpe85a:null,kGNEyG:`astryx1cy8zhl`,kybGjl:`astryx1hl2dhg`,k1TLXF:null,kMnn75:null,kmVMDM:null,kNySMw:null,$$css:!0}},H.displayName=`TopNavMegaMenuItem`,H.__docgenInfo={description:`An individual item inside an TopNavMegaMenu.

Renders itself in both desktop (popover grid) and mobile drawer modes
using TopNavRenderContext to switch appearance.

@example
\`\`\`
<TopNavMegaMenu
  label="Products"
  items={
    <>
      <TopNavMegaMenuItem
        title="Analytics"
        description="Track and analyze user behavior"
        icon={<ChartIcon />}
        href="/analytics"
      />
      <TopNavMegaMenuItem title="Reports" href="/reports" />
    </>
  }
/>
\`\`\``,methods:[],displayName:`TopNavMegaMenuItem`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLElement>`,elements:[{name:`HTMLElement`}]},description:``},title:{required:!0,tsType:{name:`string`},description:`Display title for the menu item.`},description:{required:!1,tsType:{name:`string`},description:`Optional description text displayed below the title.`},icon:{required:!1,tsType:{name:`ReactNode`},description:`Optional icon element displayed to the left.`},href:{required:!1,tsType:{name:`string`},description:`URL to navigate to when clicked.`},onClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Callback when item is clicked.`},as:{required:!1,tsType:{name:`ElementType`},description:"Custom component to render instead of `<a>` for link items.\nOverrides the provider-level default set by LinkProvider."}},composes:[`Omit`]}})))()}function we({ref:e,title:t,description:n,image:i,imageAlt:o,linkLabel:c,linkHref:l,children:u,xstyle:d,className:p,style:m,...h}){let g=f();return(0,W.jsxs)(`div`,{ref:e,...a(s(`top-nav-mega-menu-featured-card`),r(Te.root,d),p,m),...h,children:[i&&(0,W.jsx)(`img`,{src:i,alt:o??``,role:o?void 0:`presentation`,"aria-hidden":!o||void 0,className:`astryxh8yej3 astryxhjk10j astryxl1xv1r astryx1lliihq`}),(0,W.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryx1txdalj astryx1shk3sm`,children:[(0,W.jsx)(`span`,{className:`astryxcr08ib astryx2mo6ok astryx1kq96og astryx1tgivj0`,children:t}),n&&(0,W.jsx)(`span`,{className:`astryx141an7d astryx1ltkj2j astryxv1l7n4`,children:n}),c&&l&&(0,W.jsxs)(g,{href:l,className:`astryx141an7d astryx2mo6ok astryx1ltkj2j astryxjse4m1 astryx1hl2dhg`,children:[c,` →`]}),u]})]})}var W,Te;function Ee(){return(Ee=t((()=>{n(),i(),p(),c(),W=l(),Te={root:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,$$css:!0}},we.displayName=`TopNavMegaMenuFeaturedCard`,we.__docgenInfo={description:`Standard featured card for the TopNavMegaMenu \`featured\` slot.

Provides a consistent card with optional image, title, description,
and CTA link. For fully custom content, pass any ReactNode directly
to the \`featured\` slot instead.

@example
\`\`\`
<TopNavMegaMenu
  label="Products"
  items={...}
  featured={
    <TopNavMegaMenuFeaturedCard
      title="What's new in v4.0"
      description="AI-powered analytics and real-time collaboration."
      image="https://example.com/promo.jpg"
      imageAlt="Team collaboration"
      linkLabel="Read the announcement"
      linkHref="/blog/v4"
    />
  }
/>
\`\`\``,methods:[],displayName:`TopNavMegaMenuFeaturedCard`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:``},title:{required:!0,tsType:{name:`string`},description:`Card title.`},description:{required:!1,tsType:{name:`string`},description:`Description text below the title.`},image:{required:!1,tsType:{name:`string`},description:`Optional image URL displayed above the body.`},imageAlt:{required:!1,tsType:{name:`string`},description:'Alt text for the image.\n\nWhen omitted, the image is explicitly decorative (`alt=""` +\n`role="presentation"` + `aria-hidden`, matching Avatar) and hidden from\nassistive technology. Since the card already has a visible `title`, a\ndecorative image is usually correct; pass `imageAlt` only when the image\nconveys information beyond the title and description.'},linkLabel:{required:!1,tsType:{name:`string`},description:`CTA link text.`},linkHref:{required:!1,tsType:{name:`string`},description:`CTA link URL.`},children:{required:!1,tsType:{name:`ReactNode`},description:`Custom content rendered below the standard body.`}},composes:[`Omit`]}})))()}function De({title:e,titleId:t,...n},r){return G.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?G.createElement(`title`,{id:t},e):null,G.createElement(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z`}))}var G,Oe;function ke(){return(ke=t((()=>{G=e(n()),Oe=G.forwardRef(De)})))()}function Ae({title:e,titleId:t,...n},r){return K.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?K.createElement(`title`,{id:t},e):null,K.createElement(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5`}))}var K,q;function je(){return(je=t((()=>{K=e(n()),q=K.forwardRef(Ae)})))()}function Me({title:e,titleId:t,...n},r){return J.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:1.5,stroke:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?J.createElement(`title`,{id:t},e):null,J.createElement(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,d:`M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418`}))}var J,Ne;function Pe(){return(Pe=t((()=>{J=e(n()),Ne=J.forwardRef(Me)})))()}var Fe,Y,Ie,X,Z,Q,$,Le;function Re(){return(Re=t((()=>{Fe=n(),le(),de(),E(),ve(),xe(),Ce(),Ee(),ae(),u(),me(),se(),ge(),ke(),je(),Pe(),ue(),Y=l(),Ie={title:`Core/TopNavMenu`,component:N,tags:[`autodocs`],parameters:{layout:`fullscreen`}},X={render:()=>(0,Y.jsx)(k,{label:`Main navigation`,heading:(0,Y.jsx)(T,{heading:`My App`,logo:(0,Y.jsx)(oe,{icon:(0,Y.jsx)(he,{style:{width:16,height:16}})}),headingHref:`#`}),startContent:(0,Y.jsxs)(Y.Fragment,{children:[(0,Y.jsx)(O,{label:`Home`,href:`#`,isSelected:!0}),(0,Y.jsx)(N,{label:`Products`,items:[{title:`Analytics`,description:`Track and analyze user behavior`,icon:(0,Y.jsx)(C,{style:{width:20,height:20}}),href:`#analytics`},{title:`Security`,description:`Enterprise-grade protection`,icon:(0,Y.jsx)(M,{style:{width:20,height:20}}),href:`#security`},{title:`Automation`,description:`Streamline your workflows`,icon:(0,Y.jsx)(Oe,{style:{width:20,height:20}}),href:`#automation`},{title:`Developer Tools`,description:`APIs, SDKs, and CLI tools`,icon:(0,Y.jsx)(q,{style:{width:20,height:20}}),href:`#dev-tools`}]}),(0,Y.jsx)(O,{label:`Pricing`,href:`#`})]}),endContent:(0,Y.jsx)(d,{label:`Profile`,variant:`ghost`,icon:(0,Y.jsx)(fe,{style:{width:16,height:16}}),isIconOnly:!0})})},Z={name:`Multiple Menus`,render:()=>(0,Y.jsx)(k,{label:`Main navigation`,heading:(0,Y.jsx)(T,{heading:`Platform`,headingHref:`#`}),startContent:(0,Y.jsxs)(Y.Fragment,{children:[(0,Y.jsx)(N,{label:`Products`,items:[{title:`Analytics`,description:`Track behavior`,icon:(0,Y.jsx)(C,{style:{width:20,height:20}}),href:`#`},{title:`Security`,description:`Enterprise protection`,icon:(0,Y.jsx)(M,{style:{width:20,height:20}}),href:`#`}]}),(0,Y.jsx)(N,{label:`Resources`,items:[{title:`Documentation`,href:`#`},{title:`API Reference`,href:`#`},{title:`Community Forum`,href:`#`}]}),(0,Y.jsx)(O,{label:`Pricing`,href:`#`})]})})},Q={name:`Mega Menu`,render:function(){let[,e]=(0,Fe.useState)(!1);return(0,Y.jsx)(`div`,{style:{position:`relative`},children:(0,Y.jsx)(k,{label:`Marketing navigation`,heading:(0,Y.jsx)(T,{heading:`Acme`,logo:(0,Y.jsx)(oe,{icon:(0,Y.jsx)(he,{style:{width:16,height:16}})}),headingHref:`#`}),startContent:(0,Y.jsxs)(Y.Fragment,{children:[(0,Y.jsx)(R,{label:`Products`,onOpenChange:e,items:(0,Y.jsxs)(Y.Fragment,{children:[(0,Y.jsx)(H,{title:`Analytics`,description:`Track and analyze user behavior across your apps`,icon:(0,Y.jsx)(C,{style:{width:20,height:20}}),href:`#analytics`}),(0,Y.jsx)(H,{title:`Security`,description:`Enterprise-grade protection for your data`,icon:(0,Y.jsx)(M,{style:{width:20,height:20}}),href:`#security`}),(0,Y.jsx)(H,{title:`Automation`,description:`Streamline workflows with intelligent tools`,icon:(0,Y.jsx)(Oe,{style:{width:20,height:20}}),href:`#automation`}),(0,Y.jsx)(H,{title:`Developer Tools`,description:`APIs, SDKs, and CLI for integration`,icon:(0,Y.jsx)(q,{style:{width:20,height:20}}),href:`#dev-tools`}),(0,Y.jsx)(H,{title:`Global Network`,description:`Low-latency edge infra in 40+ regions`,icon:(0,Y.jsx)(Ne,{style:{width:20,height:20}}),href:`#network`})]}),featured:(0,Y.jsx)(we,{title:`What's new in v4.0`,description:`AI-powered analytics and real-time collaboration.`,image:`https://images.unsplash.com/photo-1551434678-e076c223a692?w=560&h=280&fit=crop`,imageAlt:`Team collaboration`,linkLabel:`Read the announcement`,linkHref:`#announcement`})}),(0,Y.jsx)(O,{label:`Pricing`,href:`#`}),(0,Y.jsx)(O,{label:`Docs`,href:`#`})]}),endContent:(0,Y.jsxs)(Y.Fragment,{children:[(0,Y.jsx)(d,{label:`Sign in`,variant:`ghost`}),(0,Y.jsx)(d,{label:`Get started`,variant:`primary`})]})})})}},$={name:`Mega Menu (Simple)`,render:()=>(0,Y.jsx)(`div`,{style:{position:`relative`},children:(0,Y.jsx)(k,{label:`Simple navigation`,heading:(0,Y.jsx)(T,{heading:`App`,headingHref:`#`}),startContent:(0,Y.jsxs)(Y.Fragment,{children:[(0,Y.jsx)(O,{label:`Home`,href:`#`,isSelected:!0}),(0,Y.jsx)(R,{label:`Features`,items:(0,Y.jsxs)(Y.Fragment,{children:[(0,Y.jsx)(H,{title:`Dashboard`,description:`Overview of your key metrics`,icon:(0,Y.jsx)(C,{style:{width:20,height:20}}),href:`#`}),(0,Y.jsx)(H,{title:`Integrations`,description:`Connect with your favorite tools`,icon:(0,Y.jsx)(q,{style:{width:20,height:20}}),href:`#`}),(0,Y.jsx)(H,{title:`API Access`,description:`Programmatic access to all features`,icon:(0,Y.jsx)(Ne,{style:{width:20,height:20}}),href:`#`})]})})]}),endContent:(0,Y.jsx)(d,{label:`Sign in`,variant:`primary`})})})},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => <TopNav label="Main navigation" heading={<TopNavHeading heading="My App" logo={<NavIcon icon={<CubeIcon style={{
    width: 16,
    height: 16
  }} />} />} headingHref="#" />} startContent={<>
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
}`,...X.parameters?.docs?.source},description:{story:`Basic hover-triggered nav menu with 4 items, each with icon, title,
and description.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Menus',
  render: () => <TopNav label="Main navigation" heading={<TopNavHeading heading="Platform" headingHref="#" />} startContent={<>
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
}`,...Z.parameters?.docs?.source},description:{story:`Multiple nav menus side by side. Hovering one closes the other
(standard hover-menu behavior).`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'Mega Menu',
  render: function MegaMenuStory() {
    const [, setMenuOpen] = useState(false);
    return <div style={{
      position: 'relative'
    }}>
        <TopNav label="Marketing navigation" heading={<TopNavHeading heading="Acme" logo={<NavIcon icon={<CubeIcon style={{
        width: 16,
        height: 16
      }} />} />} headingHref="#" />} startContent={<>
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
}`,...Q.parameters?.docs?.source},description:{story:`Full-width mega menu with composed children API.`,...Q.parameters?.docs?.description}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  name: 'Mega Menu (Simple)',
  render: () => <div style={{
    position: 'relative'
  }}>
      <TopNav label="Simple navigation" heading={<TopNavHeading heading="App" headingHref="#" />} startContent={<>
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
}`,...$.parameters?.docs?.source},description:{story:`Mega menu without the featured content area — just the items grid.`,...$.parameters?.docs?.description}}},Le=[`Default`,`MultipleMenus`,`MegaMenu`,`MegaMenuSimple`]})))()}Re();export{X as Default,Q as MegaMenu,$ as MegaMenuSimple,Z as MultipleMenus,Le as __namedExportsOrder,Ie as default};