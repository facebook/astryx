import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{c as a,t as o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Text-BUJwo4gL.js";import{r as c,t as l}from"./Link-Dbbw0J_w.js";import{n as u,t as d}from"./TextInput-5_HcNm-n.js";function f({text:e,hasBuiltins:t,hasTaskPattern:n,hasDiffPattern:r}){let o=[];n&&o.push({pattern:/\bT(\d+)\b/g,href:e=>`https://tasks.example.com/${e[1]}`,isExternal:!0}),r&&o.push({pattern:/\bD(\d+)\b/g,href:e=>`https://phabricator.example.com/${e[0]}`,isExternal:!0});let s=c(e,{patterns:o.length>0?o:void 0,hasBuiltins:t});return(0,m.jsxs)(a,{gap:4,children:[(0,m.jsx)(`div`,{style:{padding:16,borderRadius:8,background:`var(--color-background-muted, #f5f5f5)`,minHeight:40},children:(0,m.jsx)(i,{type:`body`,children:s})}),(0,m.jsxs)(i,{type:`supporting`,color:`secondary`,children:[s.length,` node`,s.length===1?``:`s`,` rendered`]})]})}var p,m,h,g,_,v,y,b,x,S,C;e((()=>{p=t(n()),l(),s(),o(),d(),m=r(),h={title:`Core/useLinkify`,component:f,tags:[`autodocs`],argTypes:{text:{control:`text`},hasBuiltins:{control:`boolean`},hasTaskPattern:{control:`boolean`},hasDiffPattern:{control:`boolean`}}},g={args:{text:`Check out https://react.dev and also https://github.com/facebook/react for the source.`,hasBuiltins:!0,hasTaskPattern:!1,hasDiffPattern:!1}},_={args:{text:`Contact us at support@example.com or sales@example.com for help.`,hasBuiltins:!0,hasTaskPattern:!1,hasDiffPattern:!1}},v={name:`Custom patterns (T/D numbers)`,args:{text:`Fixed in T123456 and D789012. Also see T999.`,hasBuiltins:!0,hasTaskPattern:!0,hasDiffPattern:!0}},y={args:{text:`See T123456 for the task. The fix is in D789012. Docs at https://example.com/docs. Questions? Email team@example.com.`,hasBuiltins:!0,hasTaskPattern:!0,hasDiffPattern:!0}},b={name:`Plain text (no links)`,args:{text:`This is just regular text with no links, emails, or patterns to match.`,hasBuiltins:!0,hasTaskPattern:!1,hasDiffPattern:!1}},x={name:`Builtins disabled (custom only)`,args:{text:`T123 is a task. https://example.com is a URL that should NOT become a link.`,hasBuiltins:!1,hasTaskPattern:!0,hasDiffPattern:!1}},S={render:()=>{let[e,t]=(0,p.useState)(`Check T12345, visit https://react.dev, or email hi@example.com`),n=c(e,{patterns:[{pattern:/\bT(\d+)\b/g,href:e=>`https://tasks.example.com/${e[1]}`,isExternal:!0},{pattern:/\bD(\d+)\b/g,href:e=>`https://phabricator.example.com/${e[0]}`,isExternal:!0}]});return(0,m.jsxs)(a,{gap:4,children:[(0,m.jsx)(u,{label:`Enter text to linkify`,value:e,onChange:e=>t(e)}),(0,m.jsx)(`div`,{style:{padding:16,borderRadius:8,background:`var(--color-background-muted, #f5f5f5)`,minHeight:40},children:(0,m.jsx)(i,{type:`body`,children:n})})]})}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Check out https://react.dev and also https://github.com/facebook/react for the source.',
    hasBuiltins: true,
    hasTaskPattern: false,
    hasDiffPattern: false
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Contact us at support@example.com or sales@example.com for help.',
    hasBuiltins: true,
    hasTaskPattern: false,
    hasDiffPattern: false
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Custom patterns (T/D numbers)',
  args: {
    text: 'Fixed in T123456 and D789012. Also see T999.',
    hasBuiltins: true,
    hasTaskPattern: true,
    hasDiffPattern: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'See T123456 for the task. The fix is in D789012. Docs at https://example.com/docs. Questions? Email team@example.com.',
    hasBuiltins: true,
    hasTaskPattern: true,
    hasDiffPattern: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Plain text (no links)',
  args: {
    text: 'This is just regular text with no links, emails, or patterns to match.',
    hasBuiltins: true,
    hasTaskPattern: false,
    hasDiffPattern: false
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Builtins disabled (custom only)',
  args: {
    text: 'T123 is a task. https://example.com is a URL that should NOT become a link.',
    hasBuiltins: false,
    hasTaskPattern: true,
    hasDiffPattern: false
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [text, setText] = useState('Check T12345, visit https://react.dev, or email hi@example.com');
    const nodes = useLinkify(text, {
      patterns: [{
        pattern: /\\bT(\\d+)\\b/g,
        href: (m: RegExpMatchArray) => \`https://tasks.example.com/\${m[1]}\`,
        isExternal: true
      }, {
        pattern: /\\bD(\\d+)\\b/g,
        href: (m: RegExpMatchArray) => \`https://phabricator.example.com/\${m[0]}\`,
        isExternal: true
      }]
    });
    return <Stack gap={4}>
        <TextInput label="Enter text to linkify" value={text} onChange={newValue => setText(newValue)} />
        <div style={{
        padding: 16,
        borderRadius: 8,
        background: 'var(--color-background-muted, #f5f5f5)',
        minHeight: 40
      }}>
          <Text type="body">{nodes}</Text>
        </div>
      </Stack>;
  }
}`,...S.parameters?.docs?.source},description:{story:`Interactive playground: type text and see it linkified in real time`,...S.parameters?.docs?.description}}},C=[`URLs`,`Emails`,`CustomPatterns`,`MixedContent`,`PlainText`,`BuiltinsDisabled`,`Interactive`]}))();export{x as BuiltinsDisabled,v as CustomPatterns,_ as Emails,S as Interactive,y as MixedContent,b as PlainText,g as URLs,C as __namedExportsOrder,h as default};