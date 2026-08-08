import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./react-B7Te67-h.js";import{t as n}from"./jsx-runtime-DqZldVDK.js";import{t as r}from"./Button-Dm2NGpWk.js";import{a as i,t as a}from"./i18n-DuZlvwzt.js";import{t as o}from"./Button-Cynp1wju.js";import{n as s,t as c}from"./Icon-DpfdoHIv.js";import{o as l,s as u}from"./navItemStyles.stylex-DWzP3n0y.js";function d({ref:e,children:t,label:n,"data-testid":a,xstyle:o,className:c,style:l}){let d=i(),p=n??d(`@astryx.mobileNav.toggle.open`),{isMobile:m,isMobileNavEnabled:h,isMobileNavOpen:g,mobileNavId:_,toggleMobileNav:v}=u();return!m||!h?null:(0,f.jsx)(r,{ref:e,variant:`ghost`,label:p,icon:t??(0,f.jsx)(s,{icon:`menu`,color:`inherit`}),onClick:v,"aria-expanded":g,"aria-controls":_||void 0,"data-testid":a??`mobile-nav-toggle`,xstyle:o,className:c,style:l,isIconOnly:!0})}var f,p=e((()=>{t(),o(),c(),l(),a(),f=n(),d.displayName=`MobileNavToggle`,d.__docgenInfo={description:`Mobile nav toggle button. Reads from AppShell context to open/close
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
@default 'Open navigation'`},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the button element.`}},composes:[`Pick`]}}));export{p as n,d as t};