import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./Button-BVMvoKVE.js";import{n as a,t as o}from"./useTranslator-BMnme3me.js";import{n as s,t as c}from"./Icon-C24cO4CC.js";import{n as l,r as u}from"./AppShellMobileContext-BSIiXD93.js";function d({ref:e,children:t,label:n,"data-testid":r,xstyle:o,className:s,style:l}){let d=a(),p=n??d(`@astryx.mobileNav.toggle.open`),{isMobile:m,isMobileNavEnabled:h,isMobileNavOpen:g,mobileNavId:_,toggleMobileNav:v}=u();return!m||!h?null:(0,f.jsx)(i,{ref:e,variant:`ghost`,label:p,icon:t??(0,f.jsx)(c,{icon:`menu`,color:`inherit`}),onClick:v,"aria-expanded":g,"aria-controls":_||void 0,"data-testid":r??`mobile-nav-toggle`,xstyle:o,className:s,style:l,isIconOnly:!0})}var f;function p(){return(p=e((()=>{t(),r(),s(),l(),o(),f=n(),d.displayName=`MobileNavToggle`,d.__docgenInfo={description:`Mobile nav toggle button. Reads from AppShell context to open/close
the mobile navigation drawer.

Renders nothing when above the mobile breakpoint — safe to include
unconditionally in your layout.

@example
\`\`\`
<div className="my-toolbar">
  <MobileNavToggle />
  <h1>Page Title</h1>
</div>
<MobileNavToggle label="Menu">
  <MyCustomMenuIcon />
</MobileNavToggle>
\`\`\``,methods:[],displayName:`MobileNavToggle`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLButtonElement>`,elements:[{name:`HTMLButtonElement`}]},description:``},children:{required:!1,tsType:{name:`ReactNode`},description:`Custom content to render instead of the default hamburger icon.`},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the toggle button.
@default 'Open navigation'`},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the button element.`}},composes:[`Pick`]}})))()}function m(){return(0,h.use)(g)}var h,g;function _(){return(_=e((()=>{h=t(),g=(0,h.createContext)(`default`),g.displayName=`TopNavRenderContext`})))()}function v(){return(0,y.use)(b)}var y,b;function x(){return(x=e((()=>{y=t(),b=(0,y.createContext)(null),b.displayName=`TopNavMobileContentContext`})))()}export{_ as a,p as c,g as i,x as n,m as o,v as r,d as s,b as t};