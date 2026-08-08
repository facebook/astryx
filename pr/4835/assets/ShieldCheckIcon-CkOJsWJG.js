import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./stylex-Dft6gtPK.js";import{n as a}from"./mergeProps-JRyAvMxc.js";import{n as o,t as s}from"./themeProps-CREkzZh6.js";import{t as c}from"./jsx-runtime-DeHZSEgm.js";import{c as l,h as u}from"./tokens.stylex-C15xwlpu.js";import{n as d,o as f,s as p,t as m}from"./Button-BVMvoKVE.js";import{n as h,t as g}from"./useTranslator-BMnme3me.js";import{n as _,t as v}from"./Icon-C24cO4CC.js";function y({status:e,title:t,description:n,icon:i,isDismissable:s=!1,onDismiss:c,endContent:l,container:d=`card`,elevation:p=`none`,defaultIsExpanded:g=!1,children:_,xstyle:y,className:O,style:k,ref:A,...j}){let M=h(),[N,P]=(0,b.useState)(!1),[F,I]=(0,b.useState)(g),L=(0,b.useId)(),R=S[e],z=C[e],B=w[e],V=_!=null;if(N)return null;let H=()=>{P(!0),c?.()},U=()=>{I(e=>!e)},W=l!=null||s||V,G=n==null&&(l!=null||s),K=V&&F,q=d===`card`;return(0,x.jsxs)(`div`,{ref:A,role:z,...a(r(T.root,D[p],q&&p!==`none`&&T.rootElevatedCard,y),O,k),...j,children:[(0,x.jsxs)(`div`,{...a(o(`banner`,{container:d,status:e}),r(T.header,G&&T.headerCentered,E[e],q&&(K?T.headerCardWithContent:T.headerCardStandalone))),children:[(0,x.jsx)(`div`,{...a(o(`banner-icon`,{status:e}),{className:`astryx78zum5 astryx6s0dn4 astryx2lah0s`}),"aria-hidden":`true`,children:i??(0,x.jsx)(v,{icon:R,size:`md`,color:B})}),(0,x.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryxxhr3t astryx98rzlu astryxeuugli`,children:[(0,x.jsx)(`div`,{className:`astryx1ghz6dp astryxjb2p0i astryxcr08ib astryx2mo6ok astryx1kq96og astryx1tgivj0`,children:t}),n!=null&&(0,x.jsx)(`div`,{className:`astryx1ghz6dp astryxjb2p0i astryx141an7d astryx1sodnla astryx1ltkj2j astryxv1l7n4`,children:n})]}),W&&(0,x.jsxs)(`div`,{...r(T.endArea,f.inset(u[`--spacing-2`])),children:[l,V&&(0,x.jsx)(m,{variant:`ghost`,size:`sm`,label:M(F?`@astryx.banner.collapse`:`@astryx.banner.expand`),tooltip:M(F?`@astryx.banner.collapse`:`@astryx.banner.expand`),icon:(0,x.jsx)(`span`,{...{0:{className:`astryx3nfvp2 astryx11xpdln astryxuedmi6 astryx12w9bfk astryxlr8y92`},1:{className:`astryx3nfvp2 astryx11xpdln astryxuedmi6 astryx12w9bfk astryxlr8y92 astryx19jd1h0`}}[!!F<<0],children:(0,x.jsx)(v,{icon:`chevronDown`,size:`sm`,color:`inherit`})}),onClick:U,"aria-expanded":F,"aria-controls":K?L:void 0,isIconOnly:!0}),s&&(0,x.jsx)(m,{variant:`ghost`,size:`sm`,label:M(`@astryx.banner.dismiss`),tooltip:M(`@astryx.banner.dismiss`),icon:(0,x.jsx)(v,{icon:`close`,size:`sm`,color:`inherit`}),onClick:H,isIconOnly:!0})]})]}),K&&(0,x.jsx)(`div`,{id:L,...a(o(`banner-content`,{container:d,status:e}),{0:{className:`astryx1de1mus astryx8o8v82 astryx1pzlopt astryxgbv0en astryxw8tdv1 astryx92x3c3 astryx1t7ytsu astryx18b5jzi astryx1q0q8m5 astryx1j92z86 astryx1gejf6u astryxw8gpjh`},1:{className:`astryx1de1mus astryx8o8v82 astryx1pzlopt astryxgbv0en astryxw8tdv1 astryx92x3c3 astryx1t7ytsu astryx18b5jzi astryx1q0q8m5 astryx1j92z86 astryx1gejf6u astryxw8gpjh astryx14k8p9y astryxiaxfje`}}[!!q<<0]),children:_})]})}var b,x,S,C,w,T,E,D;function O(){return(O=t((()=>{b=n(),i(),d(),_(),l(),p(),s(),g(),x=c(),S={info:`info`,warning:`warning`,error:`error`,success:`success`},C={info:`status`,warning:`alert`,error:`alert`,success:`status`},w={info:`accent`,warning:`warning`,error:`error`,success:`success`},T={root:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kMv6JI:`astryxjb2p0i`,$$css:!0},rootElevatedCard:{kaIpWk:`astryx1hviunn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},header:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx1cy8zhl`,kOIVth:`astryx1txdalj`,k8WAf4:`astryx8o8v82`,kg3NbH:`astryx1pzlopt`,$$css:!0},headerCardStandalone:{kaIpWk:`astryx1hviunn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},headerCardWithContent:{krdFHd:`astryx81l70g`,kfmiAY:`astryx7hs6f1`,kIxVMA:null,ksF3WI:null,kVL7Gh:`astryxbiv7yw`,kT0f0o:`astryx16uus16`,kqGeR4:null,kYm2EN:null,$$css:!0},headerCentered:{kGNEyG:`astryx6s0dn4`,$$css:!0},endArea:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,kmuXW:`astryx2lah0s`,keTefX:`astryxvc5jky`,kqGvvJ:`astryx81ka23`,$$css:!0}},E={info:{kWkggS:`astryxgcxg3y`,$$css:!0},warning:{kWkggS:`astryx24i8r5`,$$css:!0},error:{kWkggS:`astryx1pritpl`,$$css:!0},success:{kWkggS:`astryxu13z74`,$$css:!0}},D={none:{kGVxlE:`astryx1gnnqk1`,$$css:!0},low:{kGVxlE:`astryx1i5ehqx`,$$css:!0},med:{kGVxlE:`astryx14hfi27`,$$css:!0},high:{kGVxlE:`astryx1kcpxr7`,$$css:!0}},y.displayName=`Banner`,y.__docgenInfo={description:`A persistent status notification banner for info, warning, error, or success messages.

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
\`\`\``,methods:[],displayName:`Banner`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},status:{required:!0,tsType:{name:`BannerStatusMap`},description:`Status type controlling the icon and color scheme.`},title:{required:!0,tsType:{name:`ReactNode`},description:`Title text or ReactNode displayed prominently in the header area.`},description:{required:!1,tsType:{name:`ReactNode`},description:`Optional description text below the title in the header area.`},icon:{required:!1,tsType:{name:`ReactNode`},description:`Override the default status icon.`},isDismissable:{required:!1,tsType:{name:`boolean`},description:`Whether the banner can be dismissed.
When true, shows a close button and manages internal dismissed state
so the banner disappears even if \`onDismiss\` is not provided.
@default false`,defaultValue:{value:`false`,computed:!1}},onDismiss:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:`Called when the dismiss button is clicked.
The banner will hide itself regardless of whether this callback is provided.`},endContent:{required:!1,tsType:{name:`ReactNode`},description:`Action button rendered in the header area (end-aligned).
Typically an Button with a secondary or ghost variant.

@example
\`\`\`
endContent={<Button label="Retry" variant="ghost" onClick={handleRetry} />}
\`\`\``},container:{required:!1,tsType:{name:`BannerContainerMap`},description:"Container type of the banner.\n- `card`: standalone card with border-radius\n- `section`: full-width section banner (no border-radius)\n@default 'card'",defaultValue:{value:`'card'`,computed:!1}},elevation:{required:!1,tsType:{name:`union`,raw:`'none' | 'low' | 'med' | 'high'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'low'`},{name:`literal`,value:`'med'`},{name:`literal`,value:`'high'`}]},description:`Resting elevation — the shadow depth the banner sits at. Use for a
floating banner that hovers above content. \`none\` is the default inline
banner.
@default 'none'`,defaultValue:{value:`'none'`,computed:!1}},defaultIsExpanded:{required:!1,tsType:{name:`boolean`},description:`Whether the content area (children) starts expanded.
Only relevant when children are provided.
@default false`,defaultValue:{value:`false`,computed:!1}},children:{required:!1,tsType:{name:`ReactNode`},description:`Extra content rendered below the header in a collapsible card-background area.
Use for rich content like lists, links, or detailed information.
When provided, a collapse/expand toggle button appears in the header.`}},composes:[`Omit`]}})))()}function k({title:e,titleId:t,...n},r){return A.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 24 24`,fill:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?A.createElement(`title`,{id:t},e):null,A.createElement(`path`,{fillRule:`evenodd`,d:`M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z`,clipRule:`evenodd`}))}var A,j;function M(){return(M=t((()=>{A=e(n()),j=A.forwardRef(k)})))()}export{O as i,M as n,y as r,j as t};