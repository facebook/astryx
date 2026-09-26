import{q as e}from"./padding.stylex-C-GcuG1E.js";import{t}from"./Text-CysUeOqZ.js";import{t as n}from"./Heading-C7Qlapyi.js";import{t as r}from"./Card-BT-dRL-n.js";import{N as i,a,c as o,d as s,f as c,i as l,k as u,l as d,o as f,p,s as m,u as h,zt as g}from"./index-eq4wFE2S.js";import{t as _}from"./Banner-K5nId3zg.js";import{t as v}from"./Badge-C0AePQeD.js";import{t as y}from"./EmptyState-Bq1sLOUo.js";import{a as b,i as x,n as S,r as C,s as w,t as T}from"./Table-C0kdp_JA.js";import{t as E}from"./PageFrame-BgEF-jRj.js";import{a as D,i as O}from"./spring-DdZwaVal.js";import{n as k,s as A}from"./motionAudit-91y47KWu.js";var j=e(),M=new Map(d),N=28;function P(e){return{code:e.map(e=>e.text).join(`
`),highlightLines:e.map((e,t)=>e.added===!0?t+1:0).filter(e=>e>0)}}function F(e){let t=h.map(t=>{let n=l(e(t.name)),r=t.primitive==null?void 0:M.get(t.primitive);if(r!=null&&r===n)return{text:`  '${t.name}': 'var(${t.primitive})',`,added:!0};let i=r==null?` // no primitive: the reduced-motion escape`:` // tuned off ${t.primitive} (${r}ms) — move the primitive or accept the fork`;return{text:`  '${t.name}': '${n}ms',${i}`,added:!0}});return[{text:`// @astryxdesign/core/src/theme/tokens.stylex.ts`},{text:`// Additions only. The nine primitives and --ease-standard do not move.`},{text:``},{text:`export const easeDefaults = {`},{text:`  '${m.name}': '${m.value}', // kept; deprecated in docs, not in code`},...s.map(t=>({text:`  '${t.name}': '${e(t.name)}',`,added:!0})),{text:`} as const;`},{text:``},{text:`export const easeVars = stylex.defineVars(easeDefaults);`},{text:``},{text:`export const durationDefaults = {`},...d.map(([e,t])=>({text:`  '${e}': '${t}ms',`})),{text:``},{text:`  // Semantic layer. Aliased, so the motion scale a theme sets still owns`},{text:`  // these — the same shape typeScaleDefaults uses for type.`},...t,{text:`} as const;`},{text:``},{text:`export const durationVars = stylex.defineVars(durationDefaults);`},{text:``},{text:`// Stagger is a delay between siblings, not a duration, so it gets its own`},{text:`// group rather than widening DurationVarName.`},{text:`export const staggerDefaults = {`,added:!0},...p.map(([t])=>({text:`  '${t}': '${l(e(t))}ms',`,added:!0})),{text:`} as const;`,added:!0},{text:``,added:!0},{text:`export const staggerVars = stylex.defineVars(staggerDefaults);`,added:!0}]}function I(e,t){let n=e=>e.replace(/^--(duration|ease|stagger)-/,``),r=t=>Number((l(e(t))/1e3).toFixed(3)),i=t=>{let n=e(t);return O(n)?JSON.stringify(n):`[${D(n).join(`, `)}]`};return`// @generated from the Astryx theme by scripts/generate-motion-mirror.mjs.
// Values are resolved through resolveThemeTokens, so a theme that retunes the
// motion scale retunes this file too.

export const duration = {
${h.map(e=>`  ${n(e.name)}: ${r(e.name)},`).join(`
`)}
} as const;

export const ease = {
${s.map(e=>`  ${n(e.name)}: ${i(e.name)},`).join(`
`)}
} as const;

export const stagger = {
${p.map(([e])=>`  ${n(e)}: ${r(e)},`).join(`
`)}
} as const;

/** No CSS form, so authored here rather than mirrored. */
export const spring = {
${c.map(e=>`  ${e.name}: {duration: ${t[e.name].duration}, bounce: ${t[e.name].bounce}},`).join(`
`)}
} as const;`}var L=`// internal/eslint-plugin-xds/index.js — rule: xds/no-hardcoded-styles
//
// STYLE_PROPERTIES already covers type, spacing, radius and colour. It has no
// motion entry, which is why ${k.hardcodedTotal} hardcoded duration and easing values
// pass lint today. Six additions, in the shape the map already uses:

const STYLE_PROPERTIES = {
  // ...fontSize, padding, borderRadius, color — unchanged

  transitionDuration: {
    pattern: /^['"]?[\\d.]+m?s['"]?$/,
    tokenVar: 'durationVars',
    message: 'Use a duration token: var(--duration-*)',
    examples: ["durationVars['--duration-enter']"],
  },
  animationDuration: {
    pattern: /^['"]?[\\d.]+m?s['"]?$/,
    tokenVar: 'durationVars',
    message: 'Use a duration token: var(--duration-*)',
    examples: ["durationVars['--duration-continuous']"],
  },
  transitionDelay: {
    pattern: /^['"]?[\\d.]+m?s['"]?$/,
    tokenVar: 'staggerVars',
    message: 'Use var(--stagger-*) for a group offset, var(--duration-*) otherwise',
    examples: ["staggerVars['--stagger-base']"],
  },
  animationDelay: {
    pattern: /^['"]?[\\d.]+m?s['"]?$/,
    tokenVar: 'staggerVars',
    message: 'Use var(--stagger-*) for a group offset, var(--duration-*) otherwise',
    examples: ["staggerVars['--stagger-tight']"],
  },
  transitionTimingFunction: {
    pattern: /^['"]?(cubic-bezier\\([^)]*\\)|linear|ease(-in|-out|-in-out)?|steps\\([^)]*\\))['"]?$/,
    tokenVar: 'easeVars',
    message: 'Use an easing token: var(--ease-*)',
    examples: ["easeVars['--ease-entry']", "easeVars['--ease-exit']"],
  },
  animationTimingFunction: {
    pattern: /^['"]?(cubic-bezier\\([^)]*\\)|linear|ease(-in|-out|-in-out)?|steps\\([^)]*\\))['"]?$/,
    tokenVar: 'easeVars',
    message: 'Use an easing token: var(--ease-*)',
    examples: ["easeVars['--ease-linear']"],
  },
};

// One carve-out is needed. SKIP_VALUES lets '0', 'none' and 'auto' through for
// every property, which is right for padding and wrong for motion: it is what
// hides transitionProperty: 'none'. The structural rules below need to see it.`,R=`// A second visitor, because these are properties of the style object rather
// than of one value — the existing rule only ever looks at a single literal.

'motion/require-duration-with-property': {
  // transitionProperty with no duration in the same object inherits 0s and
  // animates nothing. Catches: ${k.noopTransitions} today.
},
'motion/require-curve-with-duration': {
  // A duration with no timing function silently gets the CSS default (ease),
  // which is a decision nobody made. Catches: ${k.durationWithoutCurve} today.
},
'motion/no-transition-all': {
  // transitionProperty: 'all' animates layout and paint properties nobody
  // intended. Catches: ${k.transitionAll} today — a ratchet, not a cleanup.
},`,z=[{rule:`transitionDuration / animationDuration`,allows:`var(--duration-*)`,catches:`${k.hardcodedDuration} hardcoded durations`,kind:`value`},{rule:`transitionDelay / animationDelay`,allows:`var(--stagger-*), var(--duration-*)`,catches:`included in the count above`,kind:`value`},{rule:`transitionTimingFunction / animationTimingFunction`,allows:`var(--ease-*)`,catches:`${k.hardcodedEasing} hardcoded curves`,kind:`value`},{rule:`motion/require-duration-with-property`,allows:`a duration beside every transitionProperty`,catches:`${k.noopTransitions} no-op transition`,kind:`structural`},{rule:`motion/require-curve-with-duration`,allows:`a curve beside every duration`,catches:`${k.durationWithoutCurve} durations with no declared curve`,kind:`structural`},{rule:`motion/no-transition-all`,allows:`named properties only`,catches:`${k.transitionAll} today — prevents regressions`,kind:`structural`}];function B(){let{rawToken:e,springs:s,dirtyTokens:l}=a(),{code:d,highlightLines:p}=P(F(e)),m=f.filter(t=>e(t)!==o[t]).map(t=>({name:t,proposed:o[t],tuned:e(t)})),h=c.flatMap(e=>{let t=s[e.name],n=[];return t.duration!==e.duration&&n.push({name:`spring.${e.name}.duration`,proposed:`${e.duration}s`,tuned:`${t.duration}s`}),t.bounce!==e.bounce&&n.push({name:`spring.${e.name}.bounce`,proposed:String(e.bounce),tuned:String(t.bounce)}),n}),D=[...m,...h],O=A.find(([e])=>e===`0.01s`)?.[1]??0;return(0,j.jsxs)(E,{title:`Export tuning`,intro:`Everything tuned in this session, as the two artefacts the foundation milestone ships: the token block and the JS mirror. Plus the lint entries that stop the next one from arriving.`,decides:`Nothing — it emits whatever the rest of the lab has been tuned to.`,badges:(0,j.jsx)(v,{variant:D.length>0?`warning`:`neutral`,label:D.length>0?`${D.length} changed`:`proposal defaults`}),children:[(0,j.jsxs)(u,{gap:3,children:[(0,j.jsx)(n,{level:2,children:`What moved`}),D.length===0?(0,j.jsx)(r,{padding:4,children:(0,j.jsx)(y,{title:`Nothing has been tuned this session`,description:`Every value below is the proposal exactly as authored. Change a curve on the tokens page or a spring on the springs page and the differences appear here.`})}):(0,j.jsx)(r,{padding:0,children:(0,j.jsxs)(T,{density:`compact`,children:[(0,j.jsx)(C,{children:(0,j.jsxs)(w,{children:[(0,j.jsx)(x,{children:`Token`}),(0,j.jsx)(x,{children:`Proposal`}),(0,j.jsx)(x,{children:`Tuned`})]})}),(0,j.jsx)(S,{children:D.map(e=>(0,j.jsxs)(w,{children:[(0,j.jsx)(b,{children:(0,j.jsx)(t,{className:`p9m5x89`,children:e.name})}),(0,j.jsx)(b,{children:(0,j.jsx)(t,{className:`p9m5x89`,color:`secondary`,children:e.proposed})}),(0,j.jsx)(b,{children:(0,j.jsx)(t,{className:`p9m5x89`,weight:`semibold`,children:e.tuned})})]},e.name))})]})}),l.length>0&&(0,j.jsxs)(t,{type:`supporting`,color:`secondary`,children:[`The rail counts `,l.length,` tuned token(s); springs are counted separately because they are not custom properties.`]})]}),(0,j.jsxs)(u,{gap:3,children:[(0,j.jsx)(n,{level:2,children:`The token block`}),(0,j.jsxs)(t,{color:`secondary`,className:`p1ewvobj`,children:[`Highlighted lines are the addition. Core defines tokens through`,` `,(0,j.jsx)(`code`,{children:`stylex.defineVars`}),`, so this is a diff against two existing objects rather than a `,(0,j.jsx)(`code`,{children:`:root`}),` block — `,(0,j.jsx)(`code`,{children:`:root`}),` `,`would bypass the theme system entirely and could not be retuned by a theme. Semantic durations emit as `,(0,j.jsx)(`code`,{children:`var(--primitive)`}),`, which is the shape `,(0,j.jsx)(`code`,{children:`typeScaleDefaults`}),` already uses for type, so a theme that moves the motion scale moves these with it.`]}),(0,j.jsx)(i,{language:`ts`,title:`@astryxdesign/core/src/theme/tokens.stylex.ts`,hasCopyButton:!0,hasLineNumbers:!0,highlightLines:p,code:d})]}),(0,j.jsxs)(u,{gap:3,children:[(0,j.jsx)(n,{level:2,children:`The JS mirror`}),(0,j.jsxs)(t,{color:`secondary`,className:`p1ewvobj`,children:[`Same values, in the shape a JS animation takes. Generated from the theme in the same build step that emits the CSS — see`,` `,(0,j.jsx)(g,{href:`/pages/motion-lab/js-mirror/`,children:`JS token mirror`}),` for why it cannot be a handwritten constants file.`]}),(0,j.jsx)(i,{language:`ts`,title:`@astryxdesign/core/motion — generated`,hasCopyButton:!0,code:I(e,s)})]}),(0,j.jsxs)(u,{gap:3,children:[(0,j.jsx)(n,{level:2,children:`The lint rule`}),(0,j.jsxs)(t,{color:`secondary`,className:`p1ewvobj`,children:[`The token linter already polices type, spacing, radius and colour, and simply has no entry for duration or easing. That is the whole reason`,` `,k.hardcodedTotal,` values are hardcoded: nothing ever told anyone not to. Six property entries drop straight into the existing pattern map — three rules once the duration, delay and timing-function pairs are grouped. The other three are structural: they are properties of the whole style object, and the current rule only ever looks at one literal at a time.`]}),(0,j.jsx)(r,{padding:0,children:(0,j.jsxs)(T,{density:`compact`,children:[(0,j.jsx)(C,{children:(0,j.jsxs)(w,{children:[(0,j.jsx)(x,{children:`Rule`}),(0,j.jsx)(x,{children:`Allows`}),(0,j.jsx)(x,{children:`Measured catch`}),(0,j.jsx)(x,{children:`Kind`})]})}),(0,j.jsx)(S,{children:z.map(e=>(0,j.jsxs)(w,{children:[(0,j.jsx)(b,{children:(0,j.jsx)(t,{className:`p9m5x89`,children:e.rule})}),(0,j.jsx)(b,{children:(0,j.jsx)(t,{className:`p9m5x89`,color:`secondary`,children:e.allows})}),(0,j.jsx)(b,{children:(0,j.jsx)(t,{children:e.catches})}),(0,j.jsx)(b,{children:(0,j.jsx)(v,{variant:e.kind===`structural`?`info`:`neutral`,label:e.kind})})]},e.rule))})]})}),(0,j.jsx)(i,{language:`js`,title:`internal/eslint-plugin-xds/index.js — value entries`,hasCopyButton:!0,isWrapped:!0,code:L}),(0,j.jsx)(i,{language:`js`,title:`The structural companions`,hasCopyButton:!0,code:R})]}),(0,j.jsx)(_,{status:`warning`,title:`The sweep is ${k.hardcodedTotal} sites, not ${N}`,description:(0,j.jsxs)(t,{children:[`The brief budgets `,N,` hardcoded values; the audit measures `,k.hardcodedTotal,` (`,k.hardcodedDuration,` durations,`,` `,k.hardcodedEasing,` curves). Roughly a quarter of them —`,` `,O,` of `,k.hardcodedTotal,`,`,` `,Math.round(O/k.hardcodedTotal*100),`% — are the `,(0,j.jsx)(`code`,{children:`0.01s`}),` reduced-motion idiom in BottomSheet, DateInput and MobileNav, and those cannot be swept until`,` `,(0,j.jsx)(`code`,{children:`--duration-instant`}),` is settled at 0 or 0.01ms: a zero duration fires no `,(0,j.jsx)(`code`,{children:`transitionend`}),`, and code sequences off that event. Turning the rule on before that decision lands means`,` `,O,` suppressions in the first diff. See`,` `,(0,j.jsx)(g,{href:`/pages/motion-lab/reduced-motion/`,children:`Reduced motion`}),` `,`and`,` `,(0,j.jsx)(g,{href:`/pages/motion-lab/violations/`,children:`Hardcoded values`}),`.`]})})]})}export{B as default};