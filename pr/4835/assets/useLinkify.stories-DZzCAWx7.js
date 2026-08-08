import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./Text-BfjtEFtP.js";import{t as i}from"./jsx-runtime-DeHZSEgm.js";import{n as a,t as o}from"./Stack-D-ryFIvw.js";import{n as s,t as c}from"./TextInput-BwKW_f5i.js";import{n as l,t as u}from"./Link-BsCID4Uz.js";function d(e,t){let n=[];for(let r of t){let t=new RegExp(r.pattern.source,r.pattern.flags),i;for(;(i=t.exec(e))!==null;)n.push({start:i.index,end:i.index+i[0].length,href:r.href(i),label:r.label?r.label(i):i[0],isExternal:r.isExternal??!1})}n.sort((e,t)=>e.start-t.start);let r=[],i=0;for(let e of n)e.start>=i&&(r.push(e),i=e.end);return r}function f(e,t){let{patterns:n,hasBuiltins:r=!0}=t??{},i=(0,p.useMemo)(()=>{let e=[];return n&&e.push(...n),r&&e.push(...h),e},[n,r]);return(0,p.useMemo)(()=>{if(i.length===0||e.length===0)return[e];let t=d(e,i);if(t.length===0)return[e];let n=[],r=0;for(let i=0;i<t.length;i++){let a=t[i];a.start>r&&n.push(e.slice(r,a.start)),n.push((0,m.jsx)(u,{href:a.href,isExternalLink:a.isExternal,children:a.label},`linkify-${i}`)),r=a.end}return r<e.length&&n.push(e.slice(r)),n},[e,i])}var p,m,h;function g(){return(g=e((()=>{p=t(),l(),m=i(),h=[{pattern:/https?:\/\/[^\s<>'")\]},]+/g,href:e=>e[0],isExternal:!0},{pattern:/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,href:e=>`mailto:${e[0]}`}]})))()}function _({text:e,hasBuiltins:t,hasTaskPattern:n,hasDiffPattern:i}){let a=[];n&&a.push({pattern:/\bT(\d+)\b/g,href:e=>`https://tasks.example.com/${e[1]}`,isExternal:!0}),i&&a.push({pattern:/\bD(\d+)\b/g,href:e=>`https://phabricator.example.com/${e[0]}`,isExternal:!0});let s=f(e,{patterns:a.length>0?a:void 0,hasBuiltins:t});return(0,y.jsxs)(o,{gap:4,children:[(0,y.jsx)(`div`,{style:{padding:16,borderRadius:8,background:`var(--color-background-muted, #f5f5f5)`,minHeight:40},children:(0,y.jsx)(r,{type:`body`,children:s})}),(0,y.jsxs)(r,{type:`supporting`,color:`secondary`,children:[s.length,` node`,s.length===1?``:`s`,` rendered`]})]})}var v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{v=t(),g(),n(),a(),s(),y=i(),b={title:`Core/useLinkify`,component:_,tags:[`autodocs`],argTypes:{text:{control:`text`},hasBuiltins:{control:`boolean`},hasTaskPattern:{control:`boolean`},hasDiffPattern:{control:`boolean`}}},x={args:{text:`Check out https://react.dev and also https://github.com/facebook/react for the source.`,hasBuiltins:!0,hasTaskPattern:!1,hasDiffPattern:!1}},S={args:{text:`Contact us at support@example.com or sales@example.com for help.`,hasBuiltins:!0,hasTaskPattern:!1,hasDiffPattern:!1}},C={name:`Custom patterns (T/D numbers)`,args:{text:`Fixed in T123456 and D789012. Also see T999.`,hasBuiltins:!0,hasTaskPattern:!0,hasDiffPattern:!0}},w={args:{text:`See T123456 for the task. The fix is in D789012. Docs at https://example.com/docs. Questions? Email team@example.com.`,hasBuiltins:!0,hasTaskPattern:!0,hasDiffPattern:!0}},T={name:`Plain text (no links)`,args:{text:`This is just regular text with no links, emails, or patterns to match.`,hasBuiltins:!0,hasTaskPattern:!1,hasDiffPattern:!1}},E={name:`Builtins disabled (custom only)`,args:{text:`T123 is a task. https://example.com is a URL that should NOT become a link.`,hasBuiltins:!1,hasTaskPattern:!0,hasDiffPattern:!1}},D={render:()=>{let[e,t]=(0,v.useState)(`Check T12345, visit https://react.dev, or email hi@example.com`),n=f(e,{patterns:[{pattern:/\bT(\d+)\b/g,href:e=>`https://tasks.example.com/${e[1]}`,isExternal:!0},{pattern:/\bD(\d+)\b/g,href:e=>`https://phabricator.example.com/${e[0]}`,isExternal:!0}]});return(0,y.jsxs)(o,{gap:4,children:[(0,y.jsx)(c,{label:`Enter text to linkify`,value:e,onChange:e=>t(e)}),(0,y.jsx)(`div`,{style:{padding:16,borderRadius:8,background:`var(--color-background-muted, #f5f5f5)`,minHeight:40},children:(0,y.jsx)(r,{type:`body`,children:n})})]})}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Check out https://react.dev and also https://github.com/facebook/react for the source.',
    hasBuiltins: true,
    hasTaskPattern: false,
    hasDiffPattern: false
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Contact us at support@example.com or sales@example.com for help.',
    hasBuiltins: true,
    hasTaskPattern: false,
    hasDiffPattern: false
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Custom patterns (T/D numbers)',
  args: {
    text: 'Fixed in T123456 and D789012. Also see T999.',
    hasBuiltins: true,
    hasTaskPattern: true,
    hasDiffPattern: true
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'See T123456 for the task. The fix is in D789012. Docs at https://example.com/docs. Questions? Email team@example.com.',
    hasBuiltins: true,
    hasTaskPattern: true,
    hasDiffPattern: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Plain text (no links)',
  args: {
    text: 'This is just regular text with no links, emails, or patterns to match.',
    hasBuiltins: true,
    hasTaskPattern: false,
    hasDiffPattern: false
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'Builtins disabled (custom only)',
  args: {
    text: 'T123 is a task. https://example.com is a URL that should NOT become a link.',
    hasBuiltins: false,
    hasTaskPattern: true,
    hasDiffPattern: false
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source},description:{story:`Interactive playground: type text and see it linkified in real time`,...D.parameters?.docs?.description}}},O=[`URLs`,`Emails`,`CustomPatterns`,`MixedContent`,`PlainText`,`BuiltinsDisabled`,`Interactive`]})))()}k();export{E as BuiltinsDisabled,C as CustomPatterns,S as Emails,D as Interactive,w as MixedContent,T as PlainText,x as URLs,O as __namedExportsOrder,b as default};