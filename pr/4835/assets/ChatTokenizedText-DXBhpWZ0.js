import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a,t as o}from"./themeProps-CREkzZh6.js";import{t as s}from"./jsx-runtime-DeHZSEgm.js";import{n as c,t as l}from"./Badge-QS1Y3zur.js";function u(e){return`render`in e&&typeof e.render==`function`}function d(e){return e.replace(/[.*+?^${}()|[\\]\\]/g,`\\$&`)}function f({ref:e,children:t,tokens:r,xstyle:o,className:s,style:c,...l}){if(!t||!r||r.length===0)return(0,m.jsx)(`span`,{ref:e,...i(a(`chat-tokenized-text`),n(h.root,o),s,c),...l,children:t??``});let u=p(t,r);return(0,m.jsx)(`span`,{ref:e,...i(a(`chat-tokenized-text`),n(h.root,o),s,c),...l,children:u})}function p(e,t){let n=t.map(e=>d(e.value)).join(`|`),r=RegExp(`(${n})`,`g`),i=new Map;for(let e of t)i.set(e.value,e);let a=[],o=0,s;for(;(s=r.exec(e))!==null;){s.index>o&&a.push(e.slice(o,s.index));let t=s[0],n=i.get(t);n&&a.push(u(n)?(0,m.jsx)(`span`,{children:n.render()},`${t}-${s.index}`):(0,m.jsx)(l,{label:n.label,variant:n.variant,icon:n.icon},`${t}-${s.index}`)),o=s.index+t.length}return o<e.length&&a.push(e.slice(o)),a}var m,h;function g(){return(g=e((()=>{t(),r(),c(),o(),m=s(),h={root:{k1xSpc:`astryxt0psk2`,$$css:!0}},f.displayName=`ChatTokenizedText`,f.__docgenInfo={description:`Renders text with token values replaced by inline badges.

Accepts the same \`ChatComposerToken\` type used by input triggers,
so you can share a single token definition between input and display.`,methods:[],displayName:`ChatTokenizedText`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLSpanElement>`,elements:[{name:`HTMLSpanElement`}]},description:``},children:{required:!0,tsType:{name:`string`},description:`The message text containing serialized token values`},tokens:{required:!1,tsType:{name:`Array`,elements:[{name:`union`,raw:`ChatComposerTokenBadge | ChatComposerTokenCustom`,elements:[{name:`intersection`,raw:`{
  /** Serialized value \\u2014 what this token becomes in the onSubmit string */
  value: string;
} & Omit<BadgeProps, 'ref' | 'xstyle' | 'className' | 'style'>`,elements:[{name:`signature`,type:`object`,raw:`{
  /** Serialized value \\u2014 what this token becomes in the onSubmit string */
  value: string;
}`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0},description:`Serialized value \\u2014 what this token becomes in the onSubmit string`}]}},{name:`Omit`,elements:[{name:`BadgeProps`},{name:`union`,raw:`'ref' | 'xstyle' | 'className' | 'style'`,elements:[{name:`literal`,value:`'ref'`},{name:`literal`,value:`'xstyle'`},{name:`literal`,value:`'className'`},{name:`literal`,value:`'style'`}]}],raw:`Omit<BadgeProps, 'ref' | 'xstyle' | 'className' | 'style'>`}]},{name:`signature`,type:`object`,raw:`{
  /** Serialized value \\u2014 what this token becomes in the onSubmit string */
  value: string;
  /** Full control over the token\\u2019s rendered content */
  render: () => ReactNode;
}`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0},description:`Serialized value \\u2014 what this token becomes in the onSubmit string`},{key:`render`,value:{name:`signature`,type:`function`,raw:`() => ReactNode`,signature:{arguments:[],return:{name:`ReactNode`}},required:!0},description:`Full control over the token\\u2019s rendered content`}]}}]}],raw:`ChatComposerToken[]`},description:`Token definitions — same type returned by trigger onSelect.
Each token's \`value\` is matched against the text and replaced
with its badge representation (label, variant, icon).

@example
\`\`\`
const mentionTokens = contacts.map(c => ({
  value: \`@\${c.id}\`,
  label: \`@\${c.label}\`,
  variant: 'blue' as const,
}));
<ChatTokenizedText tokens={mentionTokens}>
  {message.text}
</ChatTokenizedText>
\`\`\``}},composes:[`Omit`]}})))()}export{g as n,f as t};