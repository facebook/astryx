import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a,t as o}from"./themeProps-CREkzZh6.js";import{t as s}from"./jsx-runtime-DeHZSEgm.js";import{n as c,t as l}from"./Button-BVMvoKVE.js";import{r as u,t as d}from"./Tooltip-Ypc-fkfG.js";import{n as f,t as p}from"./useGridFocus-lJqQu7q1.js";import{n as m,t as h}from"./Popover-Dzrapr1u.js";import{n as g,t as _}from"./TextInput-BwKW_f5i.js";import{n as v,t as y}from"./ChatMessageList-DlT3EcUX.js";import{n as b,t as x}from"./ChatMessage-CIX1HzVk.js";import{n as S,t as C}from"./ChatMessageBubble-Crrsl6XG.js";function w({onSelect:e,emojis:t=D,label:r=`Pick an emoji`,searchLabel:o=`Search emoji`,children:s,xstyle:c,className:l,style:u,"data-testid":d,ref:p}){let[m,g]=(0,T.useState)(!1),[v,y]=(0,T.useState)(``),{gridRef:b,handleKeyDown:x}=f({columns:O}),S=v.trim().toLowerCase(),C=S===``?t:t.filter(e=>e.name.toLowerCase().includes(S)||e.emoji===S),w=e=>{g(e),e||y(``)},A=t=>{e(t),w(!1)};return(0,E.jsx)(h,{isOpen:m,onOpenChange:w,label:r,placement:`below`,alignment:`start`,"data-testid":d,content:(0,E.jsxs)(`div`,{ref:p,...i(a(`chat-emoji-picker`),n(k.panel,c),l,u),children:[(0,E.jsx)(_,{label:o,isLabelHidden:!0,size:`sm`,placeholder:o,value:v,onChange:y,hasClear:!0}),C.length===0?(0,E.jsxs)(`div`,{className:`astryxce4md1 astryx7a5moj astryx9ynric astryx141an7d astryxv1l7n4`,children:[`No emoji match “`,v.trim(),`”.`]}):(0,E.jsx)(`div`,{ref:b,role:`group`,"aria-label":`Emoji`,onKeyDown:x,className:`astryxrvj5dj astryx12m0uhf astryx1lsbc85`,children:C.map(e=>(0,E.jsx)(`button`,{type:`button`,"data-emoji":e.emoji,"aria-label":`React with ${e.name}`,onClick:()=>A(e.emoji),className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx1td3qas astryx10w6t97 astryxx3sua9 astryxng3xce astryx1717udv astryxjbqb8w astryx1n5bzlp astryxe9uy6x astryx1ypdohk astryxosj86m astryxw6l6zx astryx1a2a7pz astryx17nn4n9 astryx2ssjo2 astryx15406qy astryxuedmi6 astryx12w9bfk astryxlr8y92`,children:(0,E.jsx)(`span`,{"aria-hidden":`true`,children:e.emoji})},e.emoji))})]}),children:s})}var T,E,D,O,k;function A(){return(A=e((()=>{T=t(),r(),o(),m(),g(),p(),E=s(),D=[{emoji:`👍`,name:`thumbs up`},{emoji:`❤️`,name:`heart`},{emoji:`😂`,name:`joy`},{emoji:`🎉`,name:`tada`},{emoji:`😮`,name:`wow`},{emoji:`😢`,name:`cry`},{emoji:`🔥`,name:`fire`},{emoji:`👀`,name:`eyes`},{emoji:`✅`,name:`check`},{emoji:`🙏`,name:`pray`},{emoji:`💯`,name:`hundred`},{emoji:`🚀`,name:`rocket`},{emoji:`😍`,name:`heart eyes`},{emoji:`🤔`,name:`thinking`},{emoji:`👋`,name:`wave`},{emoji:`⭐`,name:`star`}],O=8,k={panel:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kOIVth:`astryx1txdalj`,kzqmXN:`astryx1dz1jew`,kB7OPa:`astryx9f619`,$$css:!0}},w.displayName=`ChatEmojiPicker`,w.__docgenInfo={description:`Popover emoji grid with shortname filtering and arrow-key navigation.

Wraps its trigger button in a Popover. Typing in the filter input narrows
the grid by shortname; arrow keys move focus between emoji; picking one
calls \`onSelect\` and closes the popover (focus returns to the trigger).

@example
\`\`\`
<ChatEmojiPicker onSelect={(emoji) => addReaction(emoji)}>
  <button type="button" aria-label="Add reaction">🙂</button>
</ChatEmojiPicker>
\`\`\``,methods:[],displayName:`ChatEmojiPicker`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the popover panel element`},onSelect:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(emoji: string) => void`,signature:{arguments:[{type:{name:`string`},name:`emoji`}],return:{name:`void`}}},description:`Called with the picked emoji character.
The popover closes itself after selection.`},emojis:{required:!1,tsType:{name:`ReadonlyArray`,elements:[{name:`ChatEmojiOption`}],raw:`ReadonlyArray<ChatEmojiOption>`},description:`Emoji options rendered in the grid (8 per row).
@default DEFAULT_CHAT_EMOJIS`,defaultValue:{value:`[
  {emoji: '👍', name: 'thumbs up'},
  {emoji: '❤️', name: 'heart'},
  {emoji: '😂', name: 'joy'},
  {emoji: '🎉', name: 'tada'},
  {emoji: '😮', name: 'wow'},
  {emoji: '😢', name: 'cry'},
  {emoji: '🔥', name: 'fire'},
  {emoji: '👀', name: 'eyes'},
  {emoji: '✅', name: 'check'},
  {emoji: '🙏', name: 'pray'},
  {emoji: '💯', name: 'hundred'},
  {emoji: '🚀', name: 'rocket'},
  {emoji: '😍', name: 'heart eyes'},
  {emoji: '🤔', name: 'thinking'},
  {emoji: '👋', name: 'wave'},
  {emoji: '⭐', name: 'star'},
]`,computed:!1}},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the popover dialog.
@default 'Pick an emoji'`,defaultValue:{value:`'Pick an emoji'`,computed:!1}},searchLabel:{required:!1,tsType:{name:`string`},description:`Placeholder and hidden label for the filter input.
@default 'Search emoji'`,defaultValue:{value:`'Search emoji'`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:"Trigger element — must contain a `<button>` (Popover wires it up)."},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the popover content.`}},composes:[`Omit`]}})))()}function j(e){if(e.label!=null)return e.label;let t=e.count===1?`reaction`:`reactions`;return`${e.count} ${t} with ${e.emoji}`}function M({reactions:e,onToggle:t,onAdd:r,emojis:o,addLabel:s=`Add reaction`,label:c=`Reactions`,xstyle:l,className:u,style:f,"data-testid":p,ref:m}){return(0,N.jsxs)(`div`,{ref:m,role:`group`,"aria-label":c,"data-testid":p,...i(a(`chat-reaction-bar`),n(P.root,l),u,f),children:[e.map(e=>{let n=e.isSelected===!0,r=(0,N.jsxs)(`button`,{type:`button`,"aria-pressed":n,"aria-label":j(e),onClick:()=>t?.(e.emoji),...{0:{className:`astryx3nfvp2 astryx6s0dn4 astryxzye2dw astryxxk0z11 astryxf314gf astryxjspbzw astryxmkeg23 astryx1y0btm7 astryx9r1u3d astryx1xfd4ba astryx1ww4t2b astryxwmxj5m astryx1ypdohk astryx9ynric astryx9f619 astryxq90yva astryxuedmi6 astryx12w9bfk astryxlr8y92`},1:{className:`astryx3nfvp2 astryx6s0dn4 astryxzye2dw astryxxk0z11 astryxf314gf astryxjspbzw astryxmkeg23 astryx1y0btm7 astryx1ypdohk astryx9ynric astryx9f619 astryxq90yva astryxuedmi6 astryx12w9bfk astryxlr8y92 astryxgcxg3y astryxad5do astryxn21ew4 astryxhggfp0`}}[!!n<<0],children:[(0,N.jsx)(`span`,{"aria-hidden":`true`,className:`astryxjm74w1 astryxw6l6zx`,children:e.emoji}),(0,N.jsx)(`span`,{...{0:{className:`astryx141an7d astryx1e4wzip astryxv1l7n4 astryxss6m8b astryx1ltkj2j`},1:{className:`astryx141an7d astryxss6m8b astryx1ltkj2j astryxjse4m1 astryx2mo6ok`}}[!!n<<0],children:e.count})]},e.emoji);return e.label==null?r:(0,N.jsx)(d,{content:e.label,children:r},e.emoji)}),r!=null&&(0,N.jsx)(w,{emojis:o,onSelect:r,label:s,children:(0,N.jsx)(d,{content:s,children:(0,N.jsx)(`button`,{type:`button`,"aria-label":s,className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx1td3qas astryxxk0z11 astryxjspbzw astryxmkeg23 astryx1y0btm7 astryx9r1u3d astryx1xfd4ba astryx1ww4t2b astryxwmxj5m astryxv9yike astryx1ypdohk astryx9f619 astryx1jvydc1 astryx1ltkj2j astryx1717udv`,children:`+`})})})]})}var N,P;function F(){return(F=e((()=>{r(),o(),u(),A(),N=s(),P={root:{k1xSpc:`astryx78zum5`,kwnvtZ:`astryx1a02dak`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryxzye2dw`,$$css:!0}},M.displayName=`ChatReactionBar`,M.__docgenInfo={description:`Row of emoji reaction pills under a chat message.

Each pill shows an emoji and count; the current user's own reactions get
an accent tint and \`aria-pressed\`. Provide \`onAdd\` to render a trailing
add-reaction button that opens a ChatEmojiPicker popover.

@example
\`\`\`
<ChatReactionBar
  reactions={[
    {emoji: '🎉', count: 4, isSelected: true, label: 'You and Dana reacted with 🎉'},
    {emoji: '👀', count: 2},
  ]}
  onToggle={(emoji) => toggleReaction(emoji)}
  onAdd={(emoji) => addReaction(emoji)}
/>
\`\`\``,methods:[],displayName:`ChatReactionBar`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},reactions:{required:!0,tsType:{name:`Array`,elements:[{name:`ChatReaction`}],raw:`ChatReaction[]`},description:`Reactions to render, in display order.`},onToggle:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(emoji: string) => void`,signature:{arguments:[{type:{name:`string`},name:`emoji`}],return:{name:`void`}}},description:`Called with the pill's emoji when the user toggles a reaction.`},onAdd:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(emoji: string) => void`,signature:{arguments:[{type:{name:`string`},name:`emoji`}],return:{name:`void`}}},description:`Called with the picked emoji when the user adds a reaction from the
emoji picker. The trailing add-reaction button renders only when
this is provided.`},emojis:{required:!1,tsType:{name:`ReadonlyArray`,elements:[{name:`ChatEmojiOption`}],raw:`ReadonlyArray<ChatEmojiOption>`},description:`Emoji options for the add-reaction picker.
@default DEFAULT_CHAT_EMOJIS`},addLabel:{required:!1,tsType:{name:`string`},description:`Accessible label for the add-reaction button.
@default 'Add reaction'`,defaultValue:{value:`'Add reaction'`,computed:!1}},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the reaction group.
@default 'Reactions'`,defaultValue:{value:`'Reactions'`,computed:!1}}},composes:[`Omit`]}})))()}function I({label:e=`New`,xstyle:t,className:r,style:o,"data-testid":s,ref:c}){return(0,L.jsxs)(`div`,{ref:c,role:`separator`,"aria-label":`${e} messages below`,"data-testid":s,...i(a(`chat-unread-divider`),n(R.root,t),r,o),children:[(0,L.jsx)(`span`,{className:`astryx1iyjqo2 astryxjm9jq1 astryx1pjz0fi`}),(0,L.jsx)(`span`,{className:`astryx2lah0s astryx9ynric astryx141an7d astryx1lvx875 astryxjt36v0 astryx1ltkj2j`,children:e})]})}var L,R;function z(){return(z=e((()=>{r(),o(),L=s(),R={root:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,kzqmXN:`astryxh8yej3`,k8WAf4:`astryxu0wf1k`,$$css:!0}},I.displayName=`ChatUnreadDivider`,I.__docgenInfo={description:`Error-colored rule marking the first unread message in a chat thread.

Renders as a separator with an accessible label describing where
unread messages begin.

@example
\`\`\`
<ChatUnreadDivider />
<ChatUnreadDivider label="Unread" />
\`\`\``,methods:[],displayName:`ChatUnreadDivider`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},label:{required:!1,tsType:{name:`string`},description:`Divider label.
@default 'New'`,defaultValue:{value:`'New'`,computed:!1}}},composes:[`Omit`]}})))()}function B(e){return e==null||e.length===0?null:e.length===1?`${e[0]} is typing…`:e.length===2?`${e[0]} and ${e[1]} are typing…`:`${e[0]} and ${e.length-1} others are typing…`}function V({names:e,xstyle:t,className:r,style:o,"data-testid":s,ref:c}){let l=B(e);return(0,H.jsxs)(`div`,{ref:c,role:`status`,"aria-live":`polite`,"data-testid":s,...i(a(`chat-typing-indicator`),n(U.root,t),r,o),children:[(0,H.jsxs)(`span`,{"aria-hidden":`true`,className:`astryx3nfvp2 astryx6s0dn4 astryx1lsbc85`,children:[(0,H.jsx)(`span`,{className:`astryx1ftt334 astryx1ycjhwn astryxjspbzw astryx1q5y3ey astryx701w4k astryxxprybm astryxa4qsjk astryx4hg4is astryx1aquc0h`}),(0,H.jsx)(`span`,{className:`astryx1ftt334 astryx1ycjhwn astryxjspbzw astryx1q5y3ey astryx701w4k astryxxprybm astryxa4qsjk astryx4hg4is astryx1aquc0h astryx1jksiw5`}),(0,H.jsx)(`span`,{className:`astryx1ftt334 astryx1ycjhwn astryxjspbzw astryx1q5y3ey astryx701w4k astryxxprybm astryxa4qsjk astryx4hg4is astryx1aquc0h astryxtmkasn`})]}),l!=null&&(0,H.jsx)(`span`,{className:`astryx9ynric astryx141an7d astryxv1l7n4`,children:l})]})}var H,U;function W(){return(W=e((()=>{r(),o(),H=s(),U={root:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1txdalj`,kAzted:`astryxisnujt`,$$css:!0}},V.displayName=`ChatTypingIndicator`,V.__docgenInfo={description:`Animated three-dot typing hint with a name-aware label.

The dots bounce with staggered delays (disabled under
prefers-reduced-motion) and the label is announced politely to
screen readers via role="status".

@example
\`\`\`
<ChatTypingIndicator names={['Ana']} />
<ChatTypingIndicator names={['Ana', 'Ben', 'Casey']} />
\`\`\``,methods:[],displayName:`ChatTypingIndicator`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},names:{required:!1,tsType:{name:`Array`,elements:[{name:`string`}],raw:`string[]`},description:`Names of people currently typing. Drives the label:
one name → "Ana is typing…", two → "Ana and Ben are typing…",
more → "Ana and 2 others are typing…". When omitted or empty,
only the animated dots render.`}},composes:[`Omit`]}})))()}var G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{G=t(),v(),b(),S(),c(),A(),F(),W(),z(),K=s(),q={title:`Lab/ChatAdditions`,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,K.jsx)(`div`,{style:{width:640,maxWidth:`100%`},children:(0,K.jsx)(e,{})})]},J=[{emoji:`🎉`,count:4,isSelected:!0,label:`You, Dana, Lee, and Mia reacted with 🎉`},{emoji:`👀`,count:2,label:`Dana and Lee reacted with 👀`}],Y={render:()=>{let[e,t]=(0,G.useState)(J);return(0,K.jsx)(y,{style:{maxWidth:600},children:(0,K.jsxs)(x,{sender:`assistant`,children:[(0,K.jsx)(C,{children:`The design review went great. Tokens are approved and we can start testing the new chat affordances next sprint.`}),(0,K.jsx)(M,{reactions:e,onToggle:e=>{t(t=>t.map(t=>t.emoji===e?{...t,isSelected:!t.isSelected,count:t.count+(t.isSelected?-1:1)}:t).filter(e=>e.count>0))},onAdd:e=>{t(t=>{let n=t.find(t=>t.emoji===e);return n==null?[...t,{emoji:e,count:1,isSelected:!0}]:n.isSelected?t:t.map(t=>t.emoji===e?{...t,isSelected:!0,count:t.count+1}:t)})}})]})})}},X={render:()=>(0,K.jsxs)(y,{style:{maxWidth:600},children:[(0,K.jsx)(x,{sender:`user`,children:(0,K.jsx)(C,{children:`Sounds good. I'll take the migration notes.`})}),(0,K.jsx)(I,{}),(0,K.jsx)(x,{sender:`assistant`,children:(0,K.jsx)(C,{children:`Perfect. I've drafted the rollout checklist and shared it with the team.`})}),(0,K.jsx)(V,{names:[`Ana`,`Ben`,`Casey`]})]})},Z={render:()=>{let[e,t]=(0,G.useState)(`🎉`);return(0,K.jsx)(w,{onSelect:t,children:(0,K.jsx)(l,{label:`Pick emoji ${e}`,variant:`secondary`})})}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [reactions, setReactions] = useState(INITIAL_REACTIONS);
    const handleToggle = (emoji: string) => {
      setReactions(prev => prev.map(reaction => reaction.emoji === emoji ? {
        ...reaction,
        isSelected: !reaction.isSelected,
        count: reaction.count + (reaction.isSelected ? -1 : 1)
      } : reaction).filter(reaction => reaction.count > 0));
    };
    const handleAdd = (emoji: string) => {
      setReactions(prev => {
        const existing = prev.find(reaction => reaction.emoji === emoji);
        if (existing != null) {
          return existing.isSelected ? prev : prev.map(reaction => reaction.emoji === emoji ? {
            ...reaction,
            isSelected: true,
            count: reaction.count + 1
          } : reaction);
        }
        return [...prev, {
          emoji,
          count: 1,
          isSelected: true
        }];
      });
    };
    return <ChatMessageList style={{
      maxWidth: 600
    }}>
        <ChatMessage sender="assistant">
          <ChatMessageBubble>
            The design review went great. Tokens are approved and we can start
            testing the new chat affordances next sprint.
          </ChatMessageBubble>
          <ChatReactionBar reactions={reactions} onToggle={handleToggle} onAdd={handleAdd} />
        </ChatMessage>
      </ChatMessageList>;
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => <ChatMessageList style={{
    maxWidth: 600
  }}>
      <ChatMessage sender="user">
        <ChatMessageBubble>
          Sounds good. I&apos;ll take the migration notes.
        </ChatMessageBubble>
      </ChatMessage>
      <ChatUnreadDivider />
      <ChatMessage sender="assistant">
        <ChatMessageBubble>
          Perfect. I&apos;ve drafted the rollout checklist and shared it with
          the team.
        </ChatMessageBubble>
      </ChatMessage>
      <ChatTypingIndicator names={['Ana', 'Ben', 'Casey']} />
    </ChatMessageList>
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = useState('🎉');
    return <ChatEmojiPicker onSelect={setSelected}>
        <Button label={\`Pick emoji \${selected}\`} variant="secondary" />
      </ChatEmojiPicker>;
  }
}`,...Z.parameters?.docs?.source}}},Q=[`Reactions`,`TypingAndUnread`,`EmojiPicker`]})))()}$();export{Z as EmojiPicker,Y as Reactions,X as TypingAndUnread,Q as __namedExportsOrder,q as default};