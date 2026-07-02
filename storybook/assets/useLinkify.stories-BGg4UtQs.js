import{ah as T,a1 as i,T as k}from"./iframe-DVtWfngO.js";import{L as E}from"./Link-BaFmqwcj.js";import{S as b}from"./Stack-BrtSPKVR.js";import{T as D}from"./TextInput-5_RZFPii.js";import"./preload-helper-Ct5FWWRu.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./useInteractiveRole-BDfHwmik.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";import"./Field-ClHo92iR.js";import"./FieldStatus-D14qdZVC.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./groupStyles-DfllKD80.js";import"./useInputContainer-398x-tRg.js";const y={pattern:/https?:\/\/[^\s<>'")\]},]+/g,href:e=>e[0],isExternal:!0},v={pattern:/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,href:e=>`mailto:${e[0]}`},B=[y,v];function S(e,l){const n=[];for(const t of l){const r=new RegExp(t.pattern.source,t.pattern.flags);let a;for(;(a=r.exec(e))!==null;)n.push({start:a.index,end:a.index+a[0].length,href:t.href(a),label:t.label?t.label(a):a[0],isExternal:t.isExternal??!1})}n.sort((t,r)=>t.start-r.start);const s=[];let o=0;for(const t of n)t.start>=o&&(s.push(t),o=t.end);return s}function P(e,l){const{patterns:n,hasBuiltins:s=!0}=l??{},o=T.useMemo(()=>{const t=[];return n&&t.push(...n),s&&t.push(...B),t},[n,s]);return T.useMemo(()=>{if(o.length===0||e.length===0)return[e];const t=S(e,o);if(t.length===0)return[e];const r=[];let a=0;for(let p=0;p<t.length;p++){const c=t[p];c.start>a&&r.push(e.slice(a,c.start)),r.push(i.jsx(E,{href:c.href,isExternalLink:c.isExternal,children:c.label},`linkify-${p}`)),a=c.end}return a<e.length&&r.push(e.slice(a)),r},[e,o])}function C({text:e,hasBuiltins:l,hasTaskPattern:n,hasDiffPattern:s}){const o=[];n&&o.push({pattern:/\bT(\d+)\b/g,href:r=>`https://tasks.example.com/${r[1]}`,isExternal:!0}),s&&o.push({pattern:/\bD(\d+)\b/g,href:r=>`https://phabricator.example.com/${r[0]}`,isExternal:!0});const t=P(e,{patterns:o.length>0?o:void 0,hasBuiltins:l});return i.jsxs(b,{gap:4,children:[i.jsx("div",{style:{padding:16,borderRadius:8,background:"var(--color-background-muted, #f5f5f5)",minHeight:40},children:i.jsx(k,{type:"body",children:t})}),i.jsxs(k,{type:"supporting",color:"secondary",children:[t.length," node",t.length!==1?"s":""," rendered"]})]})}const Z={title:"Core/useLinkify",component:C,tags:["autodocs"],argTypes:{text:{control:"text"},hasBuiltins:{control:"boolean"},hasTaskPattern:{control:"boolean"},hasDiffPattern:{control:"boolean"}}},h={args:{text:"Check out https://react.dev and also https://github.com/facebook/react for the source.",hasBuiltins:!0,hasTaskPattern:!1,hasDiffPattern:!1}},m={args:{text:"Contact us at support@example.com or sales@example.com for help.",hasBuiltins:!0,hasTaskPattern:!1,hasDiffPattern:!1}},d={name:"Custom patterns (T/D numbers)",args:{text:"Fixed in T123456 and D789012. Also see T999.",hasBuiltins:!0,hasTaskPattern:!0,hasDiffPattern:!0}},f={args:{text:"See T123456 for the task. The fix is in D789012. Docs at https://example.com/docs. Questions? Email team@example.com.",hasBuiltins:!0,hasTaskPattern:!0,hasDiffPattern:!0}},x={name:"Plain text (no links)",args:{text:"This is just regular text with no links, emails, or patterns to match.",hasBuiltins:!0,hasTaskPattern:!1,hasDiffPattern:!1}},g={name:"Builtins disabled (custom only)",args:{text:"T123 is a task. https://example.com is a URL that should NOT become a link.",hasBuiltins:!1,hasTaskPattern:!0,hasDiffPattern:!1}},u={render:()=>{const[e,l]=T.useState("Check T12345, visit https://react.dev, or email hi@example.com"),n=P(e,{patterns:[{pattern:/\bT(\d+)\b/g,href:s=>`https://tasks.example.com/${s[1]}`,isExternal:!0},{pattern:/\bD(\d+)\b/g,href:s=>`https://phabricator.example.com/${s[0]}`,isExternal:!0}]});return i.jsxs(b,{gap:4,children:[i.jsx(D,{label:"Enter text to linkify",value:e,onChange:s=>l(s)}),i.jsx("div",{style:{padding:16,borderRadius:8,background:"var(--color-background-muted, #f5f5f5)",minHeight:40},children:i.jsx(k,{type:"body",children:n})})]})}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Check out https://react.dev and also https://github.com/facebook/react for the source.',
    hasBuiltins: true,
    hasTaskPattern: false,
    hasDiffPattern: false
  }
}`,...h.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Contact us at support@example.com or sales@example.com for help.',
    hasBuiltins: true,
    hasTaskPattern: false,
    hasDiffPattern: false
  }
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Custom patterns (T/D numbers)',
  args: {
    text: 'Fixed in T123456 and D789012. Also see T999.',
    hasBuiltins: true,
    hasTaskPattern: true,
    hasDiffPattern: true
  }
}`,...d.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'See T123456 for the task. The fix is in D789012. Docs at https://example.com/docs. Questions? Email team@example.com.',
    hasBuiltins: true,
    hasTaskPattern: true,
    hasDiffPattern: true
  }
}`,...f.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Plain text (no links)',
  args: {
    text: 'This is just regular text with no links, emails, or patterns to match.',
    hasBuiltins: true,
    hasTaskPattern: false,
    hasDiffPattern: false
  }
}`,...x.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Builtins disabled (custom only)',
  args: {
    text: 'T123 is a task. https://example.com is a URL that should NOT become a link.',
    hasBuiltins: false,
    hasTaskPattern: true,
    hasDiffPattern: false
  }
}`,...g.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source},description:{story:"Interactive playground: type text and see it linkified in real time",...u.parameters?.docs?.description}}};const F=["URLs","Emails","CustomPatterns","MixedContent","PlainText","BuiltinsDisabled","Interactive"];export{g as BuiltinsDisabled,d as CustomPatterns,m as Emails,u as Interactive,f as MixedContent,x as PlainText,h as URLs,F as __namedExportsOrder,Z as default};
