import{a1 as t,B as b,I as v,ah as e}from"./iframe-Cm6U1NA5.js";import{u as f}from"./AppShellMobileContext-BxBvxnS8.js";function n({ref:i,children:l,label:s="Open navigation","data-testid":r,xstyle:u,className:d,style:c}){const{isMobile:p,isMobileNavEnabled:m,toggleMobileNav:g}=f();return!p||!m?null:t.jsx(b,{ref:i,variant:"ghost",label:s,icon:l??t.jsx(v,{icon:"menu",color:"inherit"}),onClick:g,"data-testid":r??"mobile-nav-toggle",xstyle:u,className:d,style:c,isIconOnly:!0})}n.displayName="MobileNavToggle";n.__docgenInfo={description:`Mobile nav toggle button. Reads from AppShell context to open/close
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
\`\`\``,methods:[],displayName:"MobileNavToggle",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLButtonElement>",elements:[{name:"HTMLButtonElement"}]},description:""},children:{required:!1,tsType:{name:"ReactNode"},description:"Custom content to render instead of the default hamburger icon."},label:{required:!1,tsType:{name:"string"},description:`Accessible label for the toggle button.
@default 'Open navigation'`,defaultValue:{value:"'Open navigation'",computed:!1}},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for the button element."}},composes:["Pick"]};const o=e.createContext("default");o.displayName="TopNavRenderContext";function N(){return e.use(o)}const a=e.createContext(null);a.displayName="TopNavMobileContentContext";function h(){return e.use(a)}export{n as M,a as T,o as a,N as b,h as u};
