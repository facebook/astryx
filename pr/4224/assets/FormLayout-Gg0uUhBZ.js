import{a as e,n as t}from"./rolldown-runtime-DaJ6WEGw.js";import{t as n}from"./react-DvlgmmzG.js";import{l as r,n as i,t as a,u as o}from"./themeProps-DlHa58hS.js";import{t as s,y as c}from"./utils-SBEvDdeo.js";import{t as l}from"./jsx-runtime-cM__dR4X.js";import{i as u,r as d}from"./Field-fAZzRPm6.js";function f({children:e,direction:t=`vertical`,xstyle:n,className:r,style:a,ref:s,...l}){return(0,m.jsx)(d,{value:(0,p.useMemo)(()=>({direction:t}),[t]),children:(0,m.jsx)(`div`,{ref:s,...c(i(`form-layout`,{direction:t}),o(h.base,t===`horizontal`&&h.horizontal,t===`horizontal-labels`&&h.horizontalLabels,n),r,a),...l,children:e})})}var p,m,h,g=t((()=>{p=e(n(),1),r(),u(),s(),a(),m=l(),h={base:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kOIVth:`astryx18g69wz`,$$css:!0},horizontal:{k1xSpc:`astryxrvj5dj`,kprqdN:`astryx1mt1orb`,klIVar:`astryxu6a5m6`,$$css:!0},horizontalLabels:{k1xSpc:`astryxrvj5dj`,kumcoG:`astryx1pmbctz`,kOIVth:`astryxlaq8a2`,kGNEyG:`astryx7a106z`,k41HbU:`astryxedohl4`,kUxVDj:`astryx1rpgqan`,k3RL8M:`astryx1a1jff`,$$css:!0}},f.displayName=`FormLayout`,f.__docgenInfo={description:`Spatial layout container for form fields.

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

@default 'vertical'`,defaultValue:{value:`'vertical'`,computed:!1}}},composes:[`Omit`]}})),_=t((()=>{g()}));export{f as n,g as r,_ as t};