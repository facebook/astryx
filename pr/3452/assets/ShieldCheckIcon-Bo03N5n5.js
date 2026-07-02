import{ah as t,a1 as e,I as x,a6 as l,ay as y,B as k,af as h,K as V,ap as O}from"./iframe-BzSUXdLu.js";const F={info:"info",warning:"warning",error:"error",success:"success"},H={info:"status",warning:"alert",error:"alert",success:"status"},L={info:"accent",warning:"warning",error:"error",success:"success"},a={root:{k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",kMv6JI:"astryxjb2p0i",$$css:!0},header:{k1xSpc:"astryx78zum5",kGNEyG:"astryx1cy8zhl",kOIVth:"astryx1txdalj",k8WAf4:"astryx8o8v82",kg3NbH:"astryx1pzlopt",$$css:!0},headerCardStandalone:{kaIpWk:"astryx1hviunn",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},headerCardWithContent:{kIxVMA:"astryx14k9mlb",ksF3WI:"astryxn9rnvb",krdFHd:null,kfmiAY:null,kqGeR4:"astryxfrllxf",kYm2EN:"astryxjppbhk",kVL7Gh:null,kT0f0o:null,$$css:!0},headerCentered:{kGNEyG:"astryx6s0dn4",$$css:!0},endArea:{k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kOIVth:"astryx1txdalj",kmuXW:"astryx2lah0s",keTefX:"astryxvc5jky",kqGvvJ:"astryx81ka23",$$css:!0}},X={info:{kWkggS:"astryxgcxg3y",$$css:!0},warning:{kWkggS:"astryx24i8r5",$$css:!0},error:{kWkggS:"astryx1pritpl",$$css:!0},success:{kWkggS:"astryxu13z74",$$css:!0}};function v({status:s,title:i,description:n,icon:o,isDismissable:d=!1,onDismiss:b,endContent:c,container:u="card",defaultIsExpanded:w=!1,children:m,xstyle:j,className:C,style:N,ref:q,...T}){const[E,R]=t.useState(!1),[r,S]=t.useState(w),z=F[s],I=H[s],$=L[s],p=m!=null;if(E)return null;const B=()=>{R(!0),b?.()},W=()=>{S(M=>!M)},D=c!=null||d||p,A=c!=null||d,G=n==null&&A,f=p&&r,g=u==="card";return e.jsxs("div",{ref:q,role:I,...l(h(a.root,j),C,N),...T,children:[e.jsxs("div",{...l(y("banner",{container:u,status:s}),h(a.header,G&&a.headerCentered,X[s],g&&(f?a.headerCardWithContent:a.headerCardStandalone))),children:[e.jsx("div",{...l(y("banner-icon",{status:s}),{className:"astryx78zum5 astryx6s0dn4 astryx2lah0s"}),"aria-hidden":"true",children:o??e.jsx(x,{icon:z,size:"md",color:$})}),e.jsxs("div",{className:"astryx78zum5 astryxdt5ytf astryxxhr3t astryx98rzlu astryxeuugli",children:[e.jsx("div",{className:"astryx1ghz6dp astryxjb2p0i astryxcr08ib astryx2mo6ok astryx1kq96og astryx1tgivj0",children:i}),n!=null&&e.jsx("div",{className:"astryx1ghz6dp astryxjb2p0i astryx141an7d astryx1sodnla astryx1ltkj2j astryxv1l7n4",children:n})]}),D&&e.jsxs("div",{...h(a.endArea,V.inset(O["--spacing-2"])),children:[c,p&&e.jsx(k,{variant:"ghost",size:"sm",label:r?"Collapse":"Expand",tooltip:r?"Collapse":"Expand",icon:e.jsx("span",{...{0:{className:"astryx3nfvp2 astryx11xpdln astryxuedmi6 astryxlr8y92"},1:{className:"astryx3nfvp2 astryx11xpdln astryxuedmi6 astryxlr8y92 astryx19jd1h0"}}[!!r<<0],children:e.jsx(x,{icon:"chevronDown",size:"sm",color:"inherit"})}),onClick:W,"aria-expanded":r,isIconOnly:!0}),d&&e.jsx(k,{variant:"ghost",size:"sm",label:"Dismiss",tooltip:"Dismiss",icon:e.jsx(x,{icon:"close",size:"sm",color:"inherit"}),onClick:B,isIconOnly:!0})]})]}),f&&e.jsx("div",{...l(y("banner-content",{container:u,status:s}),{0:{className:"astryx1de1mus astryx8o8v82 astryx1pzlopt astryx1i535u5 astryx1pcaw5z astryx92x3c3 astryx19ypqd9 astryx32b0ac astryx1q0q8m5 astryx1utcnwd astryxtgwc6q astryxw8gpjh"},1:{className:"astryx1de1mus astryx8o8v82 astryx1pzlopt astryx1i535u5 astryx1pcaw5z astryx92x3c3 astryx19ypqd9 astryx32b0ac astryx1q0q8m5 astryx1utcnwd astryxtgwc6q astryxw8gpjh astryxv76oww astryx1padx2d"}}[!!g<<0]),children:m})]})}v.displayName="Banner";v.__docgenInfo={description:`A persistent status notification banner for info, warning, error, or success messages.

Two-part visual structure:
- Header: colored status background with icon, title, description, and actions
- Content (optional): collapsible card background area for additional rich content

When children are provided, a collapse/expand chevron button appears in the
header end area (to the left of the dismiss button if present). Clicking it
toggles the visibility of the content area.

Manages its own dismissed state internally — the banner hides on dismiss
even if \`onDismiss\` is not provided, so product teams don't need to wire
up state management for basic dismiss behavior.

Uses \`role="alert"\` for error/warning and \`role="status"\` for info/success.

@example
\`\`\`
<Banner status="info" title="New update available" />
<Banner
  status="error"
  title="Something went wrong"
  description="Please try again later."
  isDismissable
  onDismiss={() => logDismiss()}
/>
<Banner
  status="error"
  title="Multiple errors found"
  description="The following issues need to be resolved:"
  isDismissable>
  <ul>
    <li>Email address is invalid</li>
    <li>Password must be at least 8 characters</li>
  </ul>
</Banner>
<Banner
  status="warning"
  title="Configuration changes"
  defaultIsExpanded>
  <p>Details here...</p>
</Banner>
\`\`\``,methods:[],displayName:"Banner",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the root element"},status:{required:!0,tsType:{name:"BannerStatusMap"},description:"Status type controlling the icon and color scheme."},title:{required:!0,tsType:{name:"ReactNode"},description:"Title text or ReactNode displayed prominently in the header area."},description:{required:!1,tsType:{name:"ReactNode"},description:"Optional description text below the title in the header area."},icon:{required:!1,tsType:{name:"ReactNode"},description:"Override the default status icon."},isDismissable:{required:!1,tsType:{name:"boolean"},description:`Whether the banner can be dismissed.
When true, shows a close button and manages internal dismissed state
so the banner disappears even if \`onDismiss\` is not provided.
@default false`,defaultValue:{value:"false",computed:!1}},onDismiss:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:`Called when the dismiss button is clicked.
The banner will hide itself regardless of whether this callback is provided.`},endContent:{required:!1,tsType:{name:"ReactNode"},description:'Action button rendered in the header area (end-aligned).\nTypically an Button with a secondary or ghost variant.\n\n@example\n```\nendContent={<Button label="Retry" variant="ghost" onClick={handleRetry} />}\n```'},container:{required:!1,tsType:{name:"BannerContainerMap"},description:"Container type of the banner.\n- `card`: standalone card with border-radius\n- `section`: full-width section banner (no border-radius)\n@default 'card'",defaultValue:{value:"'card'",computed:!1}},defaultIsExpanded:{required:!1,tsType:{name:"boolean"},description:`Whether the content area (children) starts expanded.
Only relevant when children are provided.
@default false`,defaultValue:{value:"false",computed:!1}},children:{required:!1,tsType:{name:"ReactNode"},description:`Extra content rendered below the header in a collapsible card-background area.
Use for rich content like lists, links, or detailed information.
When provided, a collapse/expand toggle button appears in the header.`}},composes:["Omit"]};function P({title:s,titleId:i,...n},o){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:o,"aria-labelledby":i},n),s?t.createElement("title",{id:i},s):null,t.createElement("path",{fillRule:"evenodd",d:"M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z",clipRule:"evenodd"}))}const J=t.forwardRef(P);export{v as B,J as F};
