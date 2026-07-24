import{n as e}from"./rolldown-runtime-DaJ6WEGw.js";import{l as t,n,t as r,u as i}from"./themeProps-DlHa58hS.js";import{t as a,y as o}from"./utils-SBEvDdeo.js";import{t as s}from"./jsx-runtime-cM__dR4X.js";import{n as c}from"./Grid-HvcGW8oZ.js";function l({columns:e,rows:t,xstyle:r,className:a,style:s,children:c,ref:l,...f}){let p={...e!=null&&{gridColumn:e===`full`?`1 / -1`:`span ${e}`},...t!=null&&{gridRow:`span ${t}`}};return(0,u.jsx)(`div`,{ref:l,...o(n(`grid-span`),i(d.span,r),a,{...s,...p}),...f,children:c})}var u,d,f=e((()=>{t(),a(),r(),u=s(),d={span:{k7Eaqz:`astryxeuugli`,k1xSpc:`astryxrvj5dj`,kZKoxP:`astryx5yr21d`,$$css:!0}},l.displayName=`GridSpan`,l.__docgenInfo={description:`Grid span component for controlling how many columns/rows a grid item spans.

Use as a direct child of Grid to make an item span multiple columns
or rows.

@example
\`\`\`
<Grid columns={3} gap={4}>
  <GridSpan columns={2}>Wide item</GridSpan>
  <div>Normal</div>
</Grid>
\`\`\``,methods:[],displayName:`GridSpan`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},columns:{required:!1,tsType:{name:`union`,raw:`number | 'full'`,elements:[{name:`number`},{name:`literal`,value:`'full'`}]},description:"Number of columns to span, or 'full' to span all columns.\n- Number: `grid-column: span N`\n- 'full': `grid-column: 1 / -1` (spans entire row)"},rows:{required:!1,tsType:{name:`number`},description:"Number of rows to span.\nSets `grid-row: span N`."},children:{required:!1,tsType:{name:`ReactNode`},description:`Content to render inside the grid span.`}},composes:[`Omit`]}})),p=e((()=>{c(),f()}));export{l as n,f as r,p as t};