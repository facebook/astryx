import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./react-B7Te67-h.js";import{t as n}from"./jsx-runtime-DqZldVDK.js";import{t as r}from"./Button-BBk5Kqd0.js";import{t as i}from"./Button-CRpvXAU4.js";import{n as a,t as o}from"./Icon-Csbga5uN.js";import{c as s,l as c}from"./navItemStyles.stylex-DrQCEL_b.js";import{r as l,t as u}from"./i18n-CdSqim6v.js";function d({ref:e,children:t,label:n,"data-testid":i,xstyle:o,className:s,style:u}){let d=l(),p=n??d(`@astryx.mobileNav.toggle.open`),{isMobile:m,isMobileNavEnabled:h,isMobileNavOpen:g,mobileNavId:_,toggleMobileNav:v}=c();return!m||!h?null:(0,f.jsx)(r,{ref:e,variant:`ghost`,label:p,icon:t??(0,f.jsx)(a,{icon:`menu`,color:`inherit`}),onClick:v,"aria-expanded":g,"aria-controls":_||void 0,"data-testid":i??`mobile-nav-toggle`,xstyle:o,className:s,style:u,isIconOnly:!0})}var f,p=e((()=>{t(),i(),o(),s(),u(),f=n(),d.displayName=`MobileNavToggle`,d.__docgenInfo={description:`Mobile nav toggle button. Reads from AppShell context to open/close
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