import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a,t as o}from"./themeProps-CREkzZh6.js";import{t as s}from"./jsx-runtime-DeHZSEgm.js";import{i as c,r as l}from"./Field-DZ-q02Vq.js";function u({children:e,direction:t=`vertical`,xstyle:r,className:o,style:s,ref:c,...u}){let m=(0,d.useMemo)(()=>({direction:t}),[t]);return(0,f.jsx)(l,{value:m,children:(0,f.jsx)(`div`,{ref:c,...i(a(`form-layout`,{direction:t}),n(p.base,t===`horizontal`&&p.horizontal,t===`horizontal-labels`&&p.horizontalLabels,r),o,s),...u,children:e})})}var d,f,p;function m(){return(m=e((()=>{d=t(),r(),c(),o(),f=s(),p={base:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kOIVth:`astryx18g69wz`,$$css:!0},horizontal:{k1xSpc:`astryxrvj5dj`,kprqdN:`astryx1mt1orb`,klIVar:`astryxu6a5m6`,$$css:!0},horizontalLabels:{k1xSpc:`astryxrvj5dj`,kumcoG:`astryx1pmbctz`,kOIVth:`astryxlaq8a2`,kGNEyG:`astryx7a106z`,k41HbU:`astryxedohl4`,kUxVDj:`astryx1rpgqan`,k3RL8M:`astryx1a1jff`,$$css:!0}},u.displayName=`FormLayout`,u.__docgenInfo={description:`Spatial layout container for form fields.

Arranges form fields with consistent spacing and direction. Renders a \`<div>\`
(not a \`<form>\` — form submission is a separate concern). For label wrapping
of custom controls, use \`Field\` directly.

Provides direction context to children via \`FormLayoutContext\`.
Supports nesting — a horizontal layout inside a vertical layout works naturally.

@example
\`\`\`
<FormLayout>
  <TextInput label="Name" value={name} onChange={setName} />
  <TextInput label="Email" value={email} onChange={setEmail} />
</FormLayout>
\`\`\``,methods:[],displayName:`FormLayout`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},children:{required:!1,tsType:{name:`ReactNode`},description:`Form fields to arrange. Accepts Astryx inputs (TextInput, Selector, etc.)
and Field-wrapped custom controls.`},direction:{required:!1,tsType:{name:`union`,raw:`| 'vertical'
| 'horizontal'
| 'horizontal-labels'`,elements:[{name:`literal`,value:`'vertical'`},{name:`literal`,value:`'horizontal'`},{name:`literal`,value:`'horizontal-labels'`}]},description:`Direction of field arrangement.

- \`'vertical'\` — Fields stack top-to-bottom (default). Most common.
- \`'horizontal'\` — Fields arrange left-to-right in equal-width columns
  using CSS Grid. Each child occupies one equal column.
- \`'horizontal-labels'\` — CSS Grid with labels to the left of inputs.
  Collapses to vertical when the container is narrow (≤480px).

@default 'vertical'`,defaultValue:{value:`'vertical'`,computed:!1}}},composes:[`Omit`]}})))()}export{m as n,u as t};