import{a1 as e,T as s,I as n,ah as A}from"./iframe-DVtWfngO.js";import{I as t}from"./Item-BA5_J2a5.js";import{A as u}from"./Avatar-B5BV8J0m.js";import{B as x}from"./Badge-CTYoJcGN.js";import{S as o}from"./Stack-BrtSPKVR.js";import{F as B,a as I}from"./PencilSquareIcon-TUezZ60z.js";import{F as T}from"./Cog6ToothIcon-1YhB9L8k.js";import{F as S}from"./UserIcon-D5BK4GA8.js";import{F as j}from"./DocumentIcon-BQ9CNfW2.js";import{F as k}from"./BellIcon-C2COqI1S.js";import{F as f}from"./MagnifyingGlassIcon-B3uBKrys.js";import"./preload-helper-Ct5FWWRu.js";import"./computeTargetAndRel-BlG0ENK0.js";import"./stack.stylex-BlarxY2N.js";import"./padding.stylex-Dl2_Pyt1.js";const _={title:"Core/Item",component:t,tags:["autodocs"],argTypes:{align:{control:"select",options:["center","start"]},density:{control:"select",options:["compact","balanced","spacious"]}}},r={render:()=>e.jsx(t,{startContent:e.jsx(n,{icon:S,size:"sm"}),label:"Alice Johnson",description:"Software Engineer",endContent:e.jsx(x,{label:"Admin"})})},i={render:()=>e.jsxs(o,{gap:0,children:[e.jsx(t,{startContent:e.jsx(u,{name:"Alice Johnson",size:40}),label:"Alice Johnson",description:"Engineering Lead",endContent:e.jsx(x,{label:"Admin"}),onClick:()=>{}}),e.jsx(t,{startContent:e.jsx(u,{name:"Bob Smith",size:40}),label:"Bob Smith",description:"Product Designer",onClick:()=>{}}),e.jsx(t,{startContent:e.jsx(u,{name:"Carol Williams",size:40}),label:"Carol Williams",description:"Data Scientist",endContent:e.jsx(s,{color:"secondary",children:"Away"}),onClick:()=>{}})]})},a={render:()=>e.jsxs(o,{gap:0,children:[e.jsx(t,{startContent:e.jsx(u,{name:"Alice",size:40}),label:e.jsxs(e.Fragment,{children:[e.jsx("b",{children:"Alice"})," commented on your PR"]}),description:"Looks good, one nit on the error handling...",endContent:e.jsx(s,{color:"secondary",children:"2h ago"}),descriptionLines:1,onClick:()=>{}}),e.jsx(t,{startContent:e.jsx("div",{className:"x78zum5 x6s0dn4 xl56j7k x100vrsf x1vqgdyp x16rqkct x17x4s8c",children:e.jsx(n,{icon:k,size:"sm"})}),label:"Build completed successfully",description:"Pipeline #4521 — all 42 tests passed",endContent:e.jsx(s,{color:"secondary",children:"5h ago"}),descriptionLines:1,onClick:()=>{}})]})},c={render:()=>e.jsxs(o,{gap:0,children:[e.jsx(t,{startContent:e.jsx(n,{icon:B,size:"sm"}),label:"Edit",density:"compact",onClick:()=>{}}),e.jsx(t,{startContent:e.jsx(n,{icon:T,size:"sm"}),label:"Settings",description:"Manage your preferences",density:"compact",onClick:()=>{}}),e.jsx(t,{startContent:e.jsx(n,{icon:I,size:"sm"}),label:"Messages",density:"compact",endContent:e.jsx(x,{label:"12"}),onClick:()=>{}})]})},d={render:()=>e.jsxs(o,{gap:0,children:[e.jsx(t,{startContent:e.jsx(n,{icon:k,size:"sm"}),label:"Product updates",description:"Major announcements and release notes",density:"spacious"}),e.jsx(t,{startContent:e.jsx(n,{icon:I,size:"sm"}),label:"Team messages",description:"Direct messages, mentions, and thread replies",endContent:e.jsx(x,{label:"4"}),density:"spacious"})]})},l={render:function(){const[C,z]=A.useState(new Set(["doc1"])),b=y=>z(w=>{const h=new Set(w);return h.has(y)?h.delete(y):h.add(y),h});return e.jsxs(o,{gap:0,children:[e.jsx(t,{startContent:e.jsx(n,{icon:j,size:"sm"}),label:"design-spec.pdf",description:"Modified 2 hours ago",endContent:e.jsx(s,{color:"secondary",children:"2.4 MB"}),isSelected:C.has("doc1"),onClick:()=>b("doc1")}),e.jsx(t,{startContent:e.jsx(n,{icon:j,size:"sm"}),label:"architecture-diagram.png",description:"Modified yesterday",endContent:e.jsx(s,{color:"secondary",children:"1.2 MB"}),isSelected:C.has("doc2"),onClick:()=>b("doc2")}),e.jsx(t,{startContent:e.jsx(n,{icon:j,size:"sm"}),label:"meeting-notes.md",description:"Modified 3 days ago",endContent:e.jsx(s,{color:"secondary",children:"48 KB"}),isSelected:C.has("doc3"),onClick:()=>b("doc3")})]})}},m={render:()=>e.jsxs(o,{gap:0,children:[e.jsx(t,{startContent:e.jsx(n,{icon:f,size:"sm"}),label:e.jsxs(e.Fragment,{children:["Astryx ",e.jsx("b",{children:"Button"})," Component"]}),description:"Primary interactive element for triggering actions...",descriptionLines:1,href:"/docs/button"}),e.jsx(t,{startContent:e.jsx(n,{icon:f,size:"sm"}),label:e.jsxs(e.Fragment,{children:["Astryx ",e.jsx("b",{children:"Button"}),"Group"]}),description:"Groups related buttons into a single connected control...",descriptionLines:1,href:"/docs/button-group"})]})},p={render:()=>e.jsxs(o,{gap:0,children:[e.jsx(t,{startContent:e.jsx(n,{icon:S,size:"sm"}),label:"Active item",description:"This item is interactive",onClick:()=>{}}),e.jsx(t,{startContent:e.jsx(n,{icon:S,size:"sm"}),label:"Disabled item",description:"This item cannot be interacted with",onClick:()=>{},isDisabled:!0})]})},g={render:()=>e.jsx(t,{align:"start",startContent:e.jsx(u,{name:"Alice",size:40}),label:"Alice Johnson",description:"This is a longer description that wraps across multiple lines to demonstrate the align=start behavior, which positions the start and end content at the top rather than vertically centering them.",endContent:e.jsx(s,{color:"secondary",children:"Just now"})})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Item startContent={<Icon icon={UserIcon} size="sm" />} label="Alice Johnson" description="Software Engineer" endContent={<Badge label="Admin" />} />
}`,...r.parameters?.docs?.source},description:{story:"Basic item with all slots populated.",...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Stack gap={0}>
      <Item startContent={<Avatar name="Alice Johnson" size={40} />} label="Alice Johnson" description="Engineering Lead" endContent={<Badge label="Admin" />} onClick={() => {}} />
      <Item startContent={<Avatar name="Bob Smith" size={40} />} label="Bob Smith" description="Product Designer" onClick={() => {}} />
      <Item startContent={<Avatar name="Carol Williams" size={40} />} label="Carol Williams" description="Data Scientist" endContent={<Text color="secondary">Away</Text>} onClick={() => {}} />
    </Stack>
}`,...i.parameters?.docs?.source},description:{story:"Contact list with avatars and roles.",...i.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Stack gap={0}>
      <Item startContent={<Avatar name="Alice" size={40} />} label={<>
            <b>Alice</b> commented on your PR
          </>} description="Looks good, one nit on the error handling..." endContent={<Text color="secondary">2h ago</Text>} descriptionLines={1} onClick={() => {}} />
      <Item startContent={<div {...stylex.props(storyStyles.iconCircle)}>
            <Icon icon={BellIcon} size="sm" />
          </div>} label="Build completed successfully" description="Pipeline #4521 — all 42 tests passed" endContent={<Text color="secondary">5h ago</Text>} descriptionLines={1} onClick={() => {}} />
    </Stack>
}`,...a.parameters?.docs?.source},description:{story:"Notification inbox with timestamps and truncation.",...a.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <Stack gap={0}>
      <Item startContent={<Icon icon={PencilSquareIcon} size="sm" />} label="Edit" density="compact" onClick={() => {}} />
      <Item startContent={<Icon icon={Cog6ToothIcon} size="sm" />} label="Settings" description="Manage your preferences" density="compact" onClick={() => {}} />
      <Item startContent={<Icon icon={ChatBubbleLeftIcon} size="sm" />} label="Messages" density="compact" endContent={<Badge label="12" />} onClick={() => {}} />
    </Stack>
}`,...c.parameters?.docs?.source},description:{story:"Compact menu items with icons.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Stack gap={0}>
      <Item startContent={<Icon icon={BellIcon} size="sm" />} label="Product updates" description="Major announcements and release notes" density="spacious" />
      <Item startContent={<Icon icon={ChatBubbleLeftIcon} size="sm" />} label="Team messages" description="Direct messages, mentions, and thread replies" endContent={<Badge label="4" />} density="spacious" />
    </Stack>
}`,...d.parameters?.docs?.source},description:{story:"Spacious item rows for roomy layouts.",...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: function FileBrowserStory() {
    const [selected, setSelected] = useState<Set<string>>(new Set(['doc1']));
    const toggle = (id: string) => setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    return <Stack gap={0}>
        <Item startContent={<Icon icon={DocumentIcon} size="sm" />} label="design-spec.pdf" description="Modified 2 hours ago" endContent={<Text color="secondary">2.4 MB</Text>} isSelected={selected.has('doc1')} onClick={() => toggle('doc1')} />
        <Item startContent={<Icon icon={DocumentIcon} size="sm" />} label="architecture-diagram.png" description="Modified yesterday" endContent={<Text color="secondary">1.2 MB</Text>} isSelected={selected.has('doc2')} onClick={() => toggle('doc2')} />
        <Item startContent={<Icon icon={DocumentIcon} size="sm" />} label="meeting-notes.md" description="Modified 3 days ago" endContent={<Text color="secondary">48 KB</Text>} isSelected={selected.has('doc3')} onClick={() => toggle('doc3')} />
      </Stack>;
  }
}`,...l.parameters?.docs?.source},description:{story:"File browser with selection state.",...l.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Stack gap={0}>
      <Item startContent={<Icon icon={MagnifyingGlassIcon} size="sm" />} label={<>
            Astryx <b>Button</b> Component
          </>} description="Primary interactive element for triggering actions..." descriptionLines={1} href="/docs/button" />
      <Item startContent={<Icon icon={MagnifyingGlassIcon} size="sm" />} label={<>
            Astryx <b>Button</b>Group
          </>} description="Groups related buttons into a single connected control..." descriptionLines={1} href="/docs/button-group" />
    </Stack>
}`,...m.parameters?.docs?.source},description:{story:"Search results with highlighted terms and links.",...m.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Stack gap={0}>
      <Item startContent={<Icon icon={UserIcon} size="sm" />} label="Active item" description="This item is interactive" onClick={() => {}} />
      <Item startContent={<Icon icon={UserIcon} size="sm" />} label="Disabled item" description="This item cannot be interacted with" onClick={() => {}} isDisabled />
    </Stack>
}`,...p.parameters?.docs?.source},description:{story:"Disabled items.",...p.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Item align="start" startContent={<Avatar name="Alice" size={40} />} label="Alice Johnson" description="This is a longer description that wraps across multiple lines to demonstrate the align=start behavior, which positions the start and end content at the top rather than vertically centering them." endContent={<Text color="secondary">Just now</Text>} />
}`,...g.parameters?.docs?.source},description:{story:"Top-aligned layout for multi-line content.",...g.parameters?.docs?.description}}};const O=["Default","ContactList","Notifications","CompactMenu","SpaciousRows","FileBrowser","SearchResults","Disabled","AlignStart"];export{g as AlignStart,c as CompactMenu,i as ContactList,r as Default,p as Disabled,l as FileBrowser,a as Notifications,m as SearchResults,d as SpaciousRows,O as __namedExportsOrder,_ as default};
