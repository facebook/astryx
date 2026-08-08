import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a,t as o}from"./themeProps-CREkzZh6.js";import{t as s}from"./jsx-runtime-DeHZSEgm.js";function c({ref:e,item:t,icon:r,description:o,isDisabled:s=!1,xstyle:c}){return t.element?(0,l.jsx)(l.Fragment,{children:t.element}):(0,l.jsxs)(`div`,{ref:e,...i(a(`typeahead-item`),n(u.container,s&&u.disabled,c)),children:[r,(0,l.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryx98rzlu astryxeuugli`,children:[(0,l.jsx)(`span`,{className:`astryxcr08ib astryx1kq96og astryx1sodnla astryx1tgivj0 astryxb3r6kr astryxlyipyv astryxuxw1ft`,children:t.label}),o&&(0,l.jsx)(`span`,{className:`astryx141an7d astryx1ltkj2j astryxv1l7n4 astryxb3r6kr astryxlyipyv astryxuxw1ft`,children:o})]})]})}var l,u;function d(){return(d=e((()=>{t(),r(),o(),l=s(),u={container:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,kAzted:`astryx2lwn1j`,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,$$css:!0}},c.displayName=`TypeaheadItem`,c.__docgenInfo={description:`Default item component for typeahead dropdown results.

Renders a label with optional icon and description.
Exported for use in custom \`renderItem\` implementations.

@example
\`\`\`
<Typeahead searchSource={source} value={v} onChange={setV} label="Search" />
<Typeahead
  searchSource={source}
  value={v}
  onChange={setV}
  label="Search"
  renderItem={(item) => (
    <TypeaheadItem
      item={item}
      icon={<Avatar src={item.auxiliaryData.avatar} size="sm" />}
      description={item.auxiliaryData.role}
    />
  )}
/>
\`\`\``,methods:[],displayName:`TypeaheadItem`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:``},item:{required:!0,tsType:{name:`T`},description:`The search result item.`},icon:{required:!1,tsType:{name:`ReactNode`},description:`Icon or avatar to display before the label.`},description:{required:!1,tsType:{name:`string`},description:`Description text displayed below the label.`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether this item is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},group:{required:!1,tsType:{name:`string`},description:`Group label for grouping items visually.`}},composes:[`Omit`]}})))()}export{d as n,c as t};