import{a1 as i,a6 as c,af as l,ay as d}from"./iframe-j1EZkcGb.js";const p={base:{k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",kaIpWk:"astryx16rqkct",kWkggS:"astryx1ewilqj",kMwMTN:"astryx17wrial",kmuXW:"astryx2lah0s",kzqmXN:"astryx805d0l",kZKoxP:"astryx1ueg155",$$css:!0}};function e({icon:n,xstyle:a,className:o,style:t,ref:r,...s}){return i.jsx("span",{ref:r,...c(d("navicon"),l(p.base,a),o,t),...s,children:n})}e.displayName="NavIcon";e.__docgenInfo={description:`Circular icon container for navigation headers.

Wraps an icon with a circular accent-colored background, suitable for
use as a logo in top navigation or side navigation title areas.

@example
\`\`\`
import {HomeIcon} from '@heroicons/react/24/solid';
<TopNavHeading
  heading="Dashboard"
  logo={<NavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
/>
<PageNavHeader
  icon={<NavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
  heading="My App"
/>
\`\`\``,methods:[],displayName:"NavIcon",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLSpanElement>",elements:[{name:"HTMLSpanElement"}]},description:"Ref forwarded to the root element"},icon:{required:!0,tsType:{name:"ReactNode"},description:`The icon element to render inside the circular background.
Should be an Icon or similar icon component.`}},composes:["Omit"]};export{e as N};
