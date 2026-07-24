import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-BBk5Kqd0.js";import{t as a}from"./Button-CRpvXAU4.js";import{Br as o,Hr as s,Rr as c,Tr as l}from"./iframe-DDpBXOWV.js";import{Cn as u,Dn as d,Tn as f,t as p,xn as m}from"./src-t7an_AE-.js";var h,g,_,v,y,b,x,S;e((()=>{h=t(n()),l(),a(),p(),g=r(),_={title:`Lab/ChatAdditions`,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,g.jsx)(`div`,{style:{width:640,maxWidth:`100%`},children:(0,g.jsx)(e,{})})]},v=[{emoji:`🎉`,count:4,isSelected:!0,label:`You, Dana, Lee, and Mia reacted with 🎉`},{emoji:`👀`,count:2,label:`Dana and Lee reacted with 👀`}],y={render:()=>{let[e,t]=(0,h.useState)(v);return(0,g.jsx)(s,{style:{maxWidth:600},children:(0,g.jsxs)(o,{sender:`assistant`,children:[(0,g.jsx)(c,{children:`The design review went great. Tokens are approved and we can start testing the new chat affordances next sprint.`}),(0,g.jsx)(f,{reactions:e,onToggle:e=>{t(t=>t.map(t=>t.emoji===e?{...t,isSelected:!t.isSelected,count:t.count+(t.isSelected?-1:1)}:t).filter(e=>e.count>0))},onAdd:e=>{t(t=>{let n=t.find(t=>t.emoji===e);return n==null?[...t,{emoji:e,count:1,isSelected:!0}]:n.isSelected?t:t.map(t=>t.emoji===e?{...t,isSelected:!0,count:t.count+1}:t)})}})]})})}},b={render:()=>(0,g.jsxs)(s,{style:{maxWidth:600},children:[(0,g.jsx)(o,{sender:`user`,children:(0,g.jsx)(c,{children:`Sounds good. I'll take the migration notes.`})}),(0,g.jsx)(u,{}),(0,g.jsx)(o,{sender:`assistant`,children:(0,g.jsx)(c,{children:`Perfect. I've drafted the rollout checklist and shared it with the team.`})}),(0,g.jsx)(m,{names:[`Ana`,`Ben`,`Casey`]})]})},x={render:()=>{let[e,t]=(0,h.useState)(`🎉`);return(0,g.jsx)(d,{onSelect:t,children:(0,g.jsx)(i,{label:`Pick emoji ${e}`,variant:`secondary`})})}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = useState('🎉');
    return <ChatEmojiPicker onSelect={setSelected}>
        <Button label={\`Pick emoji \${selected}\`} variant="secondary" />
      </ChatEmojiPicker>;
  }
}`,...x.parameters?.docs?.source}}},S=[`Reactions`,`TypingAndUnread`,`EmojiPicker`]}))();export{x as EmojiPicker,y as Reactions,b as TypingAndUnread,S as __namedExportsOrder,_ as default};