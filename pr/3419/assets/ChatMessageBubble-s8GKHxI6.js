import{a1 as a,af as r,a6 as M,ay as v}from"./iframe-JfpySt6L.js";import{f as w}from"./ChatContext-KiYxMqCp.js";const e={content:{k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",ks0D6T:"astryxl6temz",kaIpWk:"astryxashgol",kMv6JI:"astryx9ynric",kGuDYH:"astryxjm74w1",kLWn49:"astryxw6l6zx",kHjlTd:"astryx1mzt3pk",kTgw9:"astryx13faqbe",$$css:!0},radiusCompact:{kaIpWk:"astryx1hviunn",$$css:!0},paddingCompact:{k8WAf4:"astryx8o8v82",kLKAdn:null,kGO01o:null,kg3NbH:"astryx1pzlopt",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},paddingBalanced:{k8WAf4:"astryx8o8v82",kLKAdn:null,kGO01o:null,kg3NbH:"astryx1pzlopt",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},paddingSpacious:{k8WAf4:"astryx1na6nto",kLKAdn:null,kGO01o:null,kg3NbH:"astryxzz68wx",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},paddingBlockNone:{k8WAf4:"astryxt970qd",kLKAdn:null,kGO01o:null,$$css:!0},metadataPaddingCompact:{kg3NbH:"astryx1pzlopt",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},metadataPaddingBalanced:{kg3NbH:"astryx1pzlopt",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},metadataPaddingSpacious:{kg3NbH:"astryxzz68wx",kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,$$css:!0},metadataReducedGap:{keoZOQ:"astryx1c40v9y",$$css:!0},headerReducedGap:{k1K539:"astryxdrfirk",$$css:!0},nameRow:{kZKoxP:"astryx1grt7ep",k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",$$css:!0},alignEnd:{k9WMMc:"astryxp4054r",$$css:!0},assistant:{kWkggS:"astryx17x4s8c",kMwMTN:"astryx1tgivj0",$$css:!0},user:{kWkggS:"astryx17x4s8c",kMwMTN:"astryx1tgivj0",$$css:!0},ghost:{kWkggS:"astryxjbqb8w",kMwMTN:"astryx1tgivj0",$$css:!0},groupFirstAssistant:{kqGeR4:"astryxgc49yv",kVL7Gh:null,kT0f0o:null,$$css:!0},groupMiddleAssistant:{kIxVMA:"astryx1bcgpep",krdFHd:null,kfmiAY:null,kqGeR4:"astryxgc49yv",kVL7Gh:null,kT0f0o:null,$$css:!0},groupLastAssistant:{kIxVMA:"astryx1bcgpep",krdFHd:null,kfmiAY:null,$$css:!0},groupFirstUser:{kYm2EN:"astryx16vxp44",kVL7Gh:null,kT0f0o:null,$$css:!0},groupMiddleUser:{ksF3WI:"astryxxkfnbn",krdFHd:null,kfmiAY:null,kYm2EN:"astryx16vxp44",kVL7Gh:null,kT0f0o:null,$$css:!0},groupLastUser:{ksF3WI:"astryxxkfnbn",krdFHd:null,kfmiAY:null,$$css:!0}};function p({children:k,variant:n="filled",name:d,metadata:u,group:l,xstyle:g,className:m,style:b,"data-testid":x,ref:y}){const o=w(),i=o?.sender??"assistant",t=o?.density??"balanced",f=t==="compact"?e.paddingCompact:t==="spacious"?e.paddingSpacious:e.paddingBalanced,s=i==="user",h=n==="ghost"?e.ghost:s?e.user:e.assistant,$=l==="first"?s?e.groupFirstUser:e.groupFirstAssistant:l==="middle"?s?e.groupMiddleUser:e.groupMiddleAssistant:l==="last"?s?e.groupLastUser:e.groupLastAssistant:null,c=t==="compact"?e.metadataPaddingCompact:t==="spacious"?e.metadataPaddingSpacious:e.metadataPaddingBalanced;return a.jsxs(a.Fragment,{children:[d&&a.jsx("div",{"data-chat-name":!0,...r(c,e.nameRow,e.headerReducedGap,s&&e.alignEnd),children:d}),a.jsx("div",{ref:y,"data-testid":x,...M(v("chat-message-bubble",{sender:i,variant:n,density:t}),r(e.content,t==="compact"&&e.radiusCompact,h,f,n==="ghost"&&e.paddingBlockNone,$,g),m,b),children:k}),u&&a.jsx("div",{...r(c,e.metadataReducedGap,s&&e.alignEnd),children:u})]})}p.displayName="ChatMessageBubble";p.__docgenInfo={description:`Styled content container — the chat "bubble."

Reads sender from parent ChatMessage context to auto-style background.
Use \`group\` prop for multi-bubble corner grouping.

@example
\`\`\`
<ChatMessage sender="user">
  <ChatMessageBubble
    name="Cindy"
    metadata={<ChatMessageMetadata timestamp="2:30 PM" status="read" />}>
    Hey, how's it going?
  </ChatMessageBubble>
</ChatMessage>
\`\`\``,methods:[],displayName:"ChatMessageBubble",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the root element"},children:{required:!0,tsType:{name:"ReactNode"},description:"Bubble content — text, Markdown, or any ReactNode."},variant:{required:!1,tsType:{name:"union",raw:"'filled' | 'ghost'",elements:[{name:"literal",value:"'filled'"},{name:"literal",value:"'ghost'"}]},description:`Visual variant.
- 'filled': background color based on sender (default)
- 'ghost': no background, but keeps padding for consistent alignment
@default 'filled'`,defaultValue:{value:"'filled'",computed:!1}},name:{required:!1,tsType:{name:"ReactNode"},description:`Sender name rendered above the bubble, aligned with bubble text padding.
Use when the first content in a message is a bubble.
If the first content is raw (no bubble), use ChatMessage's \`name\`
prop instead.`},metadata:{required:!1,tsType:{name:"ReactNode"},description:`Metadata content rendered below the bubble, aligned with bubble text padding.
Use when the last content in a message is a bubble.
If the last content is raw (no bubble), use ChatMessage's \`metadata\`
prop instead.`},group:{required:!1,tsType:{name:"union",raw:"'first' | 'middle' | 'last'",elements:[{name:"literal",value:"'first'"},{name:"literal",value:"'middle'"},{name:"literal",value:"'last'"}]},description:`Position within a multi-bubble group.
Controls corner radius reduction on the sender side.
- 'first': bottom sender-side corner tightened
- 'middle': both sender-side corners tightened
- 'last': top sender-side corner tightened
Leave unset for standalone bubbles (full radius).`}},composes:["Omit"]};export{p as C};
