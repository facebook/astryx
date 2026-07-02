import{ah as g,V as A,a1 as e,a6 as V,af as O,ay as I}from"./iframe-VDTgZ3S9.js";import{C as t}from"./Card-rxGhBGMB.js";import{V as y}from"./VStack-DObtVm3i.js";import"./preload-helper-Ct5FWWRu.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-Dl2_Pyt1.js";import"./Stack-YX98LP5s.js";import"./stack.stylex-BlarxY2N.js";const G=g.createContext(null);G.displayName="CollapsibleGroupContext";function T(a){const{isCollapsible:p,value:n}=a,r=g.use(G),c=r!=null&&n!=null,l=p===!0?{}:p||null,m=l!=null,[h,i]=g.useState(()=>c?!0:l?.isOpen!==void 0?l.isOpen:l?.defaultIsOpen??!0);let d;return c&&n!=null?d=r.isOpen(n):l?.isOpen!==void 0?d=l.isOpen:d=h,{isEnabled:m,isOpen:d,toggle:()=>{c&&n!=null?r.toggle(n):l?.onOpenChange?l.onOpenChange(!d):i(f=>!f)}}}const z={root:{kzqmXN:"astryxh8yej3",$$css:!0}};function s({trigger:a,children:p,defaultIsOpen:n,isOpen:r,onOpenChange:c,value:l,ref:m,xstyle:h,className:i,style:d,...C}){const f=r!==void 0?{isOpen:r,onOpenChange:c}:{defaultIsOpen:n??!0,onOpenChange:c},{isOpen:o,toggle:u}=T({isCollapsible:f,value:l}),k=A("chevronDown");return e.jsxs("div",{ref:m,...V(I("collapsible"),O(z.root,h),i,d),...C,children:[e.jsxs("button",{type:"button",onClick:u,"aria-expanded":o,className:"astryx9f619 astryx78zum5 astryx6s0dn4 astryx1qughib astryxh8yej3 astryx1ypdohk astryx9ynric astryx18juvz8 astryx2mo6ok astryx1tgivj0 astryx1yc453h astryxt970qd",children:[e.jsx("span",{className:"astryx1b2iylo astryxwgcxoh",children:a}),e.jsx("span",{...{0:{className:"astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx2lah0s astryx11xpdln astryxuedmi6 astryxlr8y92 astryxv9yike astryx7p49u4"},1:{className:"astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx2lah0s astryx11xpdln astryxuedmi6 astryxlr8y92 astryxv9yike astryx19jd1h0"}}[!!o<<0],children:k})]}),e.jsx("div",{...o?{className:"astryxfsso4q"}:{className:"astryxfsso4q astryx1s85apg"},children:p})]})}s.displayName="Collapsible";s.__docgenInfo={description:`A primitive that makes any content collapsible.

Renders a trigger area (always visible) with a chevron indicator,
and a content area that toggles visibility on click.
Handles its own state by default, or defers to CollapsibleGroup
when a \`value\` prop is provided and a group is present.

Use inside Card for elevated collapsible sections.
Wrap multiple instances in CollapsibleGroup for accordion behavior.

@example
\`\`\`
<Collapsible trigger="Details">
  <Text type="body">Collapsible content</Text>
</Collapsible>
<Card>
  <Collapsible trigger="Settings">
    <SettingsForm />
  </Collapsible>
</Card>
<CollapsibleGroup type="single" defaultValue="general">
  <VStack gap={2}>
    <Card>
      <Collapsible trigger="General" value="general">
        <GeneralSettings />
      </Collapsible>
    </Card>
    <Card>
      <Collapsible trigger="Advanced" value="advanced">
        <AdvancedSettings />
      </Collapsible>
    </Card>
  </VStack>
</CollapsibleGroup>
\`\`\``,methods:[],displayName:"Collapsible",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the root element"},trigger:{required:!0,tsType:{name:"ReactNode"},description:`Content shown in the trigger area (always visible).
Rendered inside a button with aria-expanded and a chevron indicator.`},children:{required:!1,tsType:{name:"ReactNode"},description:"Content that collapses/expands when the trigger is clicked."},defaultIsOpen:{required:!1,tsType:{name:"boolean"},description:`Default open state for uncontrolled usage.
@default true`},isOpen:{required:!1,tsType:{name:"boolean"},description:"Controlled open state. When provided, the component is fully controlled."},onOpenChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(isOpen: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"isOpen"}],return:{name:"void"}}},description:"Callback when the open state changes."},value:{required:!1,tsType:{name:"string"},description:`Unique identifier for this collapsible within an CollapsibleGroup.
Required when using inside a group for coordination.`},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for the collapsible element."}},composes:["Omit"]};function N(a){return a==null?[]:Array.isArray(a)?a:[a]}function x({type:a="single",defaultValue:p,value:n,onChange:r,children:c}){const l=n!==void 0,[m,h]=g.useState(()=>N(p)),i=l?N(n):m,d=g.useCallback(o=>i.includes(o),[i]),C=g.useCallback(o=>{let u;a==="single"?u=i.includes(o)?[]:[o]:u=i.includes(o)?i.filter(k=>k!==o):[...i,o],l||h(u),r&&r(a==="single"?u[0]??"":u)},[a,i,l,r]),f=g.useMemo(()=>({isOpen:d,toggle:C}),[d,C]);return e.jsx(G,{value:f,children:c})}x.displayName="CollapsibleGroup";x.__docgenInfo={description:`Groups collapsible components with coordinated open/close behavior.
Renders no wrapper DOM.

In "single" mode (default), opening one item closes the others.
In "multiple" mode, items toggle independently.

@compositionHint Wrap Collapsible instances to coordinate their open/close state.
Each Collapsible needs a \`value\` prop to participate.

@example
\`\`\`
<CollapsibleGroup type="single" defaultValue="faq1">
  <VStack gap={2}>
    <Card>
      <Collapsible trigger="What is Astryx?" value="faq1">
        Astryx is a design system for building internal tools.
      </Collapsible>
    </Card>
    <Card>
      <Collapsible trigger="How do I start?" value="faq2">
        Install the package and import components.
      </Collapsible>
    </Card>
  </VStack>
</CollapsibleGroup>
\`\`\``,methods:[],displayName:"CollapsibleGroup",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLElement>",elements:[{name:"HTMLElement"}]},description:""},type:{required:!1,tsType:{name:"union",raw:"'single' | 'multiple'",elements:[{name:"literal",value:"'single'"},{name:"literal",value:"'multiple'"}]},description:`Whether only one item can be open at a time, or multiple.
@default "single"`,defaultValue:{value:"'single'",computed:!1}},defaultValue:{required:!1,tsType:{name:"union",raw:"string | string[]",elements:[{name:"string"},{name:"Array",elements:[{name:"string"}],raw:"string[]"}]},description:`Default open item(s) — uncontrolled mode.
Use a string for single mode, string[] for multiple mode.`},value:{required:!1,tsType:{name:"union",raw:"string | string[]",elements:[{name:"string"},{name:"Array",elements:[{name:"string"}],raw:"string[]"}]},description:`Controlled open item(s).
When provided, the group is fully controlled externally.`},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string | string[]) => void",signature:{arguments:[{type:{name:"union",raw:"string | string[]",elements:[{name:"string"},{name:"Array",elements:[{name:"string"}],raw:"string[]"}]},name:"value"}],return:{name:"void"}}},description:"Callback when the open item(s) change."},children:{required:!0,tsType:{name:"ReactNode"},description:`Children — any components that support isCollapsible + value.

@compositionHint Wrap Collapsible instances (typically inside Card).
Each Collapsible needs a \`value\` prop to participate in the group.

@example
\`\`\`
<CollapsibleGroup type="single" defaultValue="general">
  <VStack gap={2}>
    <Card>
      <Collapsible trigger="General" value="general">
        <p>General settings content</p>
      </Collapsible>
    </Card>
    <Card>
      <Collapsible trigger="Advanced" value="advanced">
        <p>Advanced settings content</p>
      </Collapsible>
    </Card>
  </VStack>
</CollapsibleGroup>
\`\`\``}},composes:["Omit"]};const _={title:"Core/Collapsible",component:x,tags:["autodocs"],decorators:[a=>e.jsx("div",{className:"x1eiddq6 x1gt495",children:e.jsx(a,{})})]},b={name:"Single Mode (default)",render:()=>e.jsx(x,{type:"single",defaultValue:"general",children:e.jsxs(y,{gap:2,children:[e.jsx(t,{children:e.jsx(s,{trigger:"General Settings",value:"general",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Configure your general preferences including language, timezone, and display options."})})}),e.jsx(t,{children:e.jsx(s,{trigger:"Privacy Settings",value:"privacy",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Manage who can see your profile, activity, and personal information."})})}),e.jsx(t,{children:e.jsx(s,{trigger:"Notification Settings",value:"notifications",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Choose which notifications you receive and how they are delivered."})})})]})})},v={name:"Multiple Mode",render:()=>e.jsx(x,{type:"multiple",defaultValue:["faq1","faq3"],children:e.jsxs(y,{gap:2,children:[e.jsx(t,{children:e.jsx(s,{trigger:"What is Astryx?",value:"faq1",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Astryx is a design system for building internal tools and products."})})}),e.jsx(t,{children:e.jsx(s,{trigger:"How do I install it?",value:"faq2",children:e.jsxs("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:["Run ",e.jsx("code",{children:"npm install @astryxdesign/core"})," to get started."]})})}),e.jsx(t,{children:e.jsx(s,{trigger:"Is it open source?",value:"faq3",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Yes! Astryx is open source and available on GitHub."})})})]})})},j={name:"Controlled",render:function(){const[p,n]=g.useState("section1");return e.jsxs("div",{children:[e.jsxs("p",{className:"xv1l7n4 xif65rj x9ynric x1ghz6dp",children:["Currently open: ",e.jsx("strong",{children:String(p)||"(none)"})]}),e.jsx(x,{type:"single",value:p,onChange:n,children:e.jsxs(y,{gap:2,children:[e.jsx(t,{children:e.jsx(s,{trigger:"Section 1",value:"section1",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Content for section 1."})})}),e.jsx(t,{children:e.jsx(s,{trigger:"Section 2",value:"section2",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Content for section 2."})})}),e.jsx(t,{children:e.jsx(s,{trigger:"Section 3",value:"section3",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Content for section 3."})})})]})})]})}},S={name:"Standalone Collapsible",render:()=>e.jsxs(y,{gap:2,children:[e.jsx(t,{children:e.jsx(s,{trigger:"Starts open (default)",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"This collapsible manages its own state. Click the trigger to toggle."})})}),e.jsx(t,{children:e.jsx(s,{trigger:"Starts collapsed",defaultIsOpen:!1,children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"This collapsible starts collapsed. Click to reveal."})})})]})},w={name:"Without Card (standalone)",render:()=>e.jsxs(y,{gap:2,children:[e.jsx(s,{trigger:"Show more details",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Collapsible works anywhere; it doesn't require a card wrapper."})}),e.jsx(s,{trigger:"Another section",defaultIsOpen:!1,children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"This section starts collapsed."})})]})},q={name:"FAQ Page",render:()=>e.jsx(x,{type:"single",children:e.jsxs(y,{gap:2,children:[e.jsx(t,{children:e.jsx(s,{trigger:"How do I reset my password?",value:"q1",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Go to Settings → Security → Change Password. You'll receive a confirmation email."})})}),e.jsx(t,{children:e.jsx(s,{trigger:"Can I change my username?",value:"q2",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Usernames can be changed once every 30 days from your profile settings."})})}),e.jsx(t,{children:e.jsx(s,{trigger:"How do I delete my account?",value:"q3",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"Account deletion is permanent. Go to Settings → Account → Delete Account. Your data will be removed within 30 days."})})}),e.jsx(t,{children:e.jsx(s,{trigger:"What payment methods are accepted?",value:"q4",children:e.jsx("p",{className:"x9ynric x1tgivj0 x1ghz6dp",children:"We accept Visa, Mastercard, American Express, and PayPal."})})})]})})};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Single Mode (default)',
  render: () => <CollapsibleGroup type="single" defaultValue="general">
      <VStack gap={2}>
        <Card>
          <Collapsible trigger="General Settings" value="general">
            <p {...stylex.props(styles.text)}>
              Configure your general preferences including language, timezone,
              and display options.
            </p>
          </Collapsible>
        </Card>
        <Card>
          <Collapsible trigger="Privacy Settings" value="privacy">
            <p {...stylex.props(styles.text)}>
              Manage who can see your profile, activity, and personal
              information.
            </p>
          </Collapsible>
        </Card>
        <Card>
          <Collapsible trigger="Notification Settings" value="notifications">
            <p {...stylex.props(styles.text)}>
              Choose which notifications you receive and how they are delivered.
            </p>
          </Collapsible>
        </Card>
      </VStack>
    </CollapsibleGroup>
}`,...b.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Mode',
  render: () => <CollapsibleGroup type="multiple" defaultValue={['faq1', 'faq3']}>
      <VStack gap={2}>
        <Card>
          <Collapsible trigger="What is Astryx?" value="faq1">
            <p {...stylex.props(styles.text)}>
              Astryx is a design system for building internal tools and products.
            </p>
          </Collapsible>
        </Card>
        <Card>
          <Collapsible trigger="How do I install it?" value="faq2">
            <p {...stylex.props(styles.text)}>
              Run <code>npm install @astryxdesign/core</code> to get started.
            </p>
          </Collapsible>
        </Card>
        <Card>
          <Collapsible trigger="Is it open source?" value="faq3">
            <p {...stylex.props(styles.text)}>
              Yes! Astryx is open source and available on GitHub.
            </p>
          </Collapsible>
        </Card>
      </VStack>
    </CollapsibleGroup>
}`,...v.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'Controlled',
  render: function ControlledStory() {
    const [open, setOpen] = useState<string | string[]>('section1');
    return <div>
        <p {...stylex.props(styles.textSecondary)}>
          Currently open: <strong>{String(open) || '(none)'}</strong>
        </p>
        <CollapsibleGroup type="single" value={open} onChange={setOpen}>
          <VStack gap={2}>
            <Card>
              <Collapsible trigger="Section 1" value="section1">
                <p {...stylex.props(styles.text)}>Content for section 1.</p>
              </Collapsible>
            </Card>
            <Card>
              <Collapsible trigger="Section 2" value="section2">
                <p {...stylex.props(styles.text)}>Content for section 2.</p>
              </Collapsible>
            </Card>
            <Card>
              <Collapsible trigger="Section 3" value="section3">
                <p {...stylex.props(styles.text)}>Content for section 3.</p>
              </Collapsible>
            </Card>
          </VStack>
        </CollapsibleGroup>
      </div>;
  }
}`,...j.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Standalone Collapsible',
  render: () => <VStack gap={2}>
      <Card>
        <Collapsible trigger="Starts open (default)">
          <p {...stylex.props(styles.text)}>
            This collapsible manages its own state. Click the trigger to toggle.
          </p>
        </Collapsible>
      </Card>
      <Card>
        <Collapsible trigger="Starts collapsed" defaultIsOpen={false}>
          <p {...stylex.props(styles.text)}>
            This collapsible starts collapsed. Click to reveal.
          </p>
        </Collapsible>
      </Card>
    </VStack>
}`,...S.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Without Card (standalone)',
  render: () => <VStack gap={2}>
      <Collapsible trigger="Show more details">
        <p {...stylex.props(styles.text)}>
          
          Collapsible works anywhere; it doesn't require a card wrapper.
        </p>
      </Collapsible>
      <Collapsible trigger="Another section" defaultIsOpen={false}>
        <p {...stylex.props(styles.text)}>This section starts collapsed.</p>
      </Collapsible>
    </VStack>
}`,...w.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'FAQ Page',
  render: () => <CollapsibleGroup type="single">
      <VStack gap={2}>
        <Card>
          <Collapsible trigger="How do I reset my password?" value="q1">
            <p {...stylex.props(styles.text)}>
              Go to Settings → Security → Change Password. You'll receive a
              confirmation email.
            </p>
          </Collapsible>
        </Card>
        <Card>
          <Collapsible trigger="Can I change my username?" value="q2">
            <p {...stylex.props(styles.text)}>
              Usernames can be changed once every 30 days from your profile
              settings.
            </p>
          </Collapsible>
        </Card>
        <Card>
          <Collapsible trigger="How do I delete my account?" value="q3">
            <p {...stylex.props(styles.text)}>
              Account deletion is permanent. Go to Settings → Account → Delete
              Account. Your data will be removed within 30 days.
            </p>
          </Collapsible>
        </Card>
        <Card>
          <Collapsible trigger="What payment methods are accepted?" value="q4">
            <p {...stylex.props(styles.text)}>
              We accept Visa, Mastercard, American Express, and PayPal.
            </p>
          </Collapsible>
        </Card>
      </VStack>
    </CollapsibleGroup>
}`,...q.parameters?.docs?.source}}};const F=["SingleMode","MultipleMode","Controlled","StandaloneCollapsible","WithoutCard","FAQ"];export{j as Controlled,q as FAQ,v as MultipleMode,b as SingleMode,S as StandaloneCollapsible,w as WithoutCard,F as __namedExportsOrder,_ as default};
