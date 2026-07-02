import{ah as r,a1 as e,a6 as T,ay as I}from"./iframe-FpdBIrKz.js";import{I as C}from"./Item-BJJK0iYd.js";const i=r.createContext(null);i.displayName="ListContext";const a={withCounter:{kAmcRD:"astryxfrknyr",$$css:!0},withDivider:{kt9PQ7:"astryx92x3c3",kfdmCh:"astryx1q0q8m5",kL6WhQ:"astryxw8gpjh",kIy1pl:"astryx1rix2v9",kx8K5S:null,kTFOXF:null,kdIrg8:null,$$css:!0}},N={noRadius:{kaIpWk:"astryx2u8bby",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0}};function l({label:o,description:c,startContent:d,endContent:p,onClick:y,href:m,target:u,rel:x,isDisabled:f=!1,isSelected:h=!1,xstyle:k,className:v,style:b,ref:g,...w}){const s=r.use(i),R=s?.density??"balanced",n=s?.hasDividers??!1,t=s?.listStyle??"none",L=t!=="none",q=t==="disc"?e.jsx("span",{className:"astryxoi2r2e astryx9f619 astryx78zum5 astryx6s0dn4 astryxl56j7k astryx2lah0s astryx12xnipv astryx1233pnv",children:e.jsx("span",{className:"astryx1v4s8kt astryxols6we astryx16rqkct astryx19aspcf"})}):t==="circle"?e.jsx("span",{className:"astryxoi2r2e astryx9f619 astryx78zum5 astryx6s0dn4 astryxl56j7k astryx2lah0s astryx12xnipv astryx1233pnv",children:e.jsx("span",{className:"astryx1v4s8kt astryxols6we astryx16rqkct astryxmkeg23 astryx1y0btm7 astryxqcx1ss astryxjbqb8w"})}):t==="decimal"?e.jsx("span",{className:"astryxoi2r2e astryx2lah0s astryx1tgivj0 astryxjm74w1 astryxw6l6zx astryx12xnipv astryxc2ndz5"}):null;return e.jsx(C,{as:"li",ref:g,marker:q,startContent:d,label:o,description:c,endContent:p,onClick:y,href:m,target:u,rel:x,isDisabled:f,isSelected:h,density:R,xstyle:[L&&a.withCounter,n&&a.withDivider,n&&N.noRadius,k],...T(I("list-item"),{className:v,style:b}),...w})}l.displayName="ListItem";l.__docgenInfo={description:`A list item component for use within List.

Renders structured content with label, description, start/end content areas.
When \`onClick\` is provided, uses the invisible button pattern for accessibility.
When \`href\` is provided, uses an invisible anchor pattern.

@example
\`\`\`
<ListItem label="Settings" description="Manage your preferences" />
<ListItem label="Profile" onClick={() => navigate('/profile')} />
<ListItem label="Docs" href="/docs" target="_blank" rel="noreferrer" />
\`\`\``,methods:[],displayName:"ListItem",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLLIElement>",elements:[{name:"HTMLLIElement"}]},description:"Ref forwarded to the root element"},label:{required:!0,tsType:{name:"ReactNode"},description:`Primary text label for the item.

Accepts a plain string (single-line truncation applied automatically)
or a ReactNode for rich content (no truncation constraints —
child components control their own text behavior).`},description:{required:!1,tsType:{name:"ReactNode"},description:`Secondary description below the label.

Accepts a plain string (single-line truncation applied automatically)
or a ReactNode for rich/multi-line content (no wrapping constraints
applied — child components control their own text behavior).`},startContent:{required:!1,tsType:{name:"ReactNode"},description:`Content rendered before the item (icon, avatar, checkbox).
Uses start/end naming for RTL support.`},endContent:{required:!1,tsType:{name:"ReactNode"},description:"Content rendered after the item (badge, action button, chevron)."},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(e: React.MouseEvent) => void",signature:{arguments:[{type:{name:"ReactMouseEvent",raw:"React.MouseEvent"},name:"e"}],return:{name:"void"}}},description:`Click handler for interactive items.
Automatically enables hover/press styles when provided.`},href:{required:!1,tsType:{name:"string"},description:`URL for link items. Renders an invisible anchor element.
Automatically enables hover/press styles when provided.`},target:{required:!1,tsType:{name:"string"},description:"Link target (e.g., '_blank'). Only used with href."},rel:{required:!1,tsType:{name:"string"},description:`Link relationship. Automatically includes noopener noreferrer when
target is "_blank".`},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether the item is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},isSelected:{required:!1,tsType:{name:"boolean"},description:`Whether the item is currently selected.
@default false`,defaultValue:{value:"false",computed:!1}}},composes:["Omit"]};export{i as L,l as a};
