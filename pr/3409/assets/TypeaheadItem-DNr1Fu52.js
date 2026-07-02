import{a1 as e,a6 as l,ay as o}from"./iframe-Z8EfSKmM.js";function s({ref:r,item:a,icon:n,description:t,isDisabled:i=!1}){return a.element?e.jsx(e.Fragment,{children:a.element}):e.jsxs("div",{ref:r,...l(o("typeahead-item"),{0:{className:"astryx78zum5 astryx6s0dn4 astryx1txdalj astryx2lwn1j"},1:{className:"astryx78zum5 astryx6s0dn4 astryx1txdalj astryx2lwn1j astryxbyyjgo"}}[!!i<<0]),children:[n,e.jsxs("div",{className:"astryx78zum5 astryxdt5ytf astryx98rzlu astryxeuugli",children:[e.jsx("span",{className:"astryxcr08ib astryx1kq96og astryx1sodnla astryx1tgivj0 astryxb3r6kr astryxlyipyv astryxuxw1ft",children:a.label}),t&&e.jsx("span",{className:"astryx141an7d astryx1ltkj2j astryxv1l7n4 astryxb3r6kr astryxlyipyv astryxuxw1ft",children:t})]})]})}s.displayName="TypeaheadItem";s.__docgenInfo={description:`Default item component for typeahead dropdown results.

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
\`\`\``,methods:[],displayName:"TypeaheadItem",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:""},item:{required:!0,tsType:{name:"T"},description:"The search result item."},icon:{required:!1,tsType:{name:"ReactNode"},description:"Icon or avatar to display before the label."},description:{required:!1,tsType:{name:"string"},description:"Description text displayed below the label."},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether this item is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},group:{required:!1,tsType:{name:"string"},description:"Group label for grouping items visually."}},composes:["Omit"]};export{s as T};
