import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./stylex-Dft6gtPK.js";import{n as a}from"./mergeProps-JRyAvMxc.js";import{n as o,t as s}from"./themeProps-CREkzZh6.js";import{t as c}from"./jsx-runtime-DeHZSEgm.js";import{n as l,t as u}from"./useIcon-Dlr4L4I4.js";import{n as d,t as f}from"./Card-270yxekz.js";import{n as p,t as m}from"./VStack-C2SBQ4Fm.js";var h,g,_;function v(){return(v=t((()=>{h=n(),g=(0,h.createContext)(null),g.displayName=`CollapsibleGroupContext`,_=(0,h.createContext)(null),_.displayName=`CollapsibleGroupPresentationContext`})))()}function y(e){let{isCollapsible:t,value:n}=e,r=(0,b.use)(g),i=r!=null&&n!=null,a=t===!0?{}:t||null,o=a!=null,[s,c]=(0,b.useState)(()=>i?!0:a?.isOpen===void 0?a?.defaultIsOpen??!0:a.isOpen),l;return l=i&&n!=null?r.isOpen(n):a?.isOpen===void 0?s:a.isOpen,{isEnabled:o,isOpen:l,toggle:()=>{if(i&&n!=null){r.toggle(n);return}let e=!l;a?.isOpen===void 0&&c(e),a?.onOpenChange?.(e)}}}var b;function x(){return(x=t((()=>{b=n(),v()})))()}function S({trigger:e,children:t,defaultIsOpen:n,isOpen:i,isDisabled:s=!1,onOpenChange:c,value:u,ref:d,xstyle:f,className:p,style:m,...h}){let{isOpen:g,toggle:v}=y({isCollapsible:i===void 0?{defaultIsOpen:n??!0,onOpenChange:c}:{isOpen:i,onOpenChange:c},value:u}),b=()=>{s||v()},x=(0,C.use)(_),S=x?.hasDividers??!1,E=x?.density??null,k=l(`chevronDown`),A=(0,C.useId)();return(0,w.jsxs)(`div`,{ref:d,...a(o(`collapsible`,{density:E??void 0}),r(T.root,S&&T.divided,f),p,m),...h,children:[(0,w.jsxs)(`button`,{type:`button`,onClick:b,"aria-disabled":s||void 0,"aria-expanded":g,"aria-controls":A,tabIndex:s?-1:void 0,...a(o(`collapsible-trigger`,{density:E??void 0}),r(T.trigger,E!=null&&D[E],s&&T.triggerDisabled)),children:[(0,w.jsx)(`span`,{className:`astryx1b2iylo astryxwgcxoh`,children:e}),(0,w.jsx)(`span`,{...{0:{className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx2lah0s astryx11xpdln astryxuedmi6 astryxlr8y92 astryxv9yike astryx7p49u4`},1:{className:`astryx3nfvp2 astryx6s0dn4 astryxl56j7k astryx2lah0s astryx11xpdln astryxuedmi6 astryxlr8y92 astryxv9yike astryx19jd1h0`}}[!!g<<0],children:k})]}),(0,w.jsx)(`div`,{id:A,...a(o(`collapsible-content`,{density:E??void 0}),r(T.content,E!=null&&O[E],!g&&T.contentHidden)),children:x==null?t:(0,w.jsx)(_,{value:null,children:t})})]})}var C,w,T,E,D,O;function k(){return(k=t((()=>{C=n(),i(),x(),v(),u(),s(),w=c(),T={root:{kzqmXN:`astryxh8yej3`,$$css:!0},trigger:{kB7OPa:`astryx9f619`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryx1qughib`,kzqmXN:`astryxh8yej3`,kkrTdU:`astryx1ypdohk`,kMv6JI:`astryx9ynric`,kGuDYH:`astryx18juvz8`,k63SB2:`astryx2mo6ok`,kMwMTN:`astryx1tgivj0`,k9WMMc:`astryx1yc453h`,k8WAf4:`astryxt970qd`,kI3sdo:`astryx17nn4n9`,kInvED:`astryx1wfwxd8 astryx7s97pk`,$$css:!0},triggerDisabled:{kkrTdU:`astryx1h6gzvc`,kSiTet:`astryxbyyjgo`,$$css:!0},contentHidden:{k1xSpc:`astryx1s85apg`,$$css:!0},content:{kLKAdn:`astryxfsso4q`,kMv6JI:`astryx9ynric`,kGuDYH:`astryxjm74w1`,k63SB2:`astryxxovm9e`,kLWn49:`astryxw6l6zx`,kMwMTN:`astryx1tgivj0`,$$css:!0},divided:{kEafiO:`astryx11xkdxz astryx1g31smg`,kPef9Z:`astryx13fuv20`,kLZC3w:`astryx1pc3f07`,$$css:!0}},E={triggerCompact:{k8WAf4:`astryxu0wf1k`,kLKAdn:null,kGO01o:null,$$css:!0},triggerBalanced:{k8WAf4:`astryxce4md1`,kLKAdn:null,kGO01o:null,$$css:!0},triggerSpacious:{k8WAf4:`astryx8o8v82`,kLKAdn:null,kGO01o:null,$$css:!0},contentCompact:{kGO01o:`astryxy143xn`,$$css:!0},contentBalanced:{kGO01o:`astryx1wesfrj`,$$css:!0},contentSpacious:{kGO01o:`astryxvmdzux`,$$css:!0}},D={compact:E.triggerCompact,balanced:E.triggerBalanced,spacious:E.triggerSpacious},O={compact:E.contentCompact,balanced:E.contentBalanced,spacious:E.contentSpacious},S.displayName=`Collapsible`,S.__docgenInfo={description:`A primitive that makes any content collapsible.

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
\`\`\``,methods:[],displayName:`Collapsible`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:`Ref forwarded to the root element`},trigger:{required:!0,tsType:{name:`ReactNode`},description:`Content shown in the trigger area (always visible).
Rendered inside a button with aria-expanded and a chevron indicator.`},children:{required:!1,tsType:{name:`ReactNode`},description:`Content that collapses/expands when the trigger is clicked.`},defaultIsOpen:{required:!1,tsType:{name:`boolean`},description:`Default open state for uncontrolled usage.
@default true`},isOpen:{required:!1,tsType:{name:`boolean`},description:`Controlled open state. When provided, the component is fully controlled.`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the collapsible is disabled. A disabled item can't be toggled —
its trigger is non-interactive and dimmed. Following the system-wide
disabled convention, the trigger uses \`aria-disabled\` (not the native
\`disabled\` attribute) and drops out of the tab order, staying perceivable
to assistive tech. The content stays in whatever open state it was;
disabling doesn't collapse an already-open item.
@default false`,defaultValue:{value:`false`,computed:!1}},onOpenChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(isOpen: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`isOpen`}],return:{name:`void`}}},description:`Callback when the open state changes.`},value:{required:!1,tsType:{name:`string`},description:`Unique identifier for this collapsible within an CollapsibleGroup.
Required when using inside a group for coordination.`},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for the collapsible element.`}},composes:[`Omit`]}})))()}function A(e){return e==null?[]:Array.isArray(e)?e:[e]}function j({type:e=`single`,defaultValue:t,value:n,onChange:i,hasDividers:s=!1,density:c,children:l,ref:u,xstyle:d,className:f,style:p,...m}){let h=n!==void 0,[v,y]=(0,M.useState)(()=>A(t)),b=h?A(n):v,x=(0,M.useCallback)(e=>b.includes(e),[b]),S=(0,M.useCallback)(t=>{let n;n=e===`single`?b.includes(t)?[]:[t]:b.includes(t)?b.filter(e=>e!==t):[...b,t],h||y(n),i&&i(e===`single`?n[0]??``:n)},[e,b,h,i]),C=(0,M.useMemo)(()=>({isOpen:x,toggle:S}),[x,S]),w=c??(s?`balanced`:null),T=(0,M.useMemo)(()=>({hasDividers:s,density:w}),[s,w]),E=s?(0,N.jsx)(`div`,{ref:u,...a(o(`collapsible-group`,{density:w??void 0}),r(P.wrapper,d),f,p),...m,children:l}):l;return(0,N.jsx)(g,{value:C,children:(0,N.jsx)(_,{value:T,children:E})})}var M,N,P;function F(){return(F=t((()=>{M=e(n(),1),i(),v(),s(),N=c(),P={wrapper:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,$$css:!0}},j.displayName=`CollapsibleGroup`,j.__docgenInfo={description:`Groups collapsible components with coordinated open/close behavior.
Renders no wrapper DOM unless \`hasDividers\` is set.

In "single" mode (default), opening one item closes the others.
In "multiple" mode, items toggle independently.

@compositionHint Wrap Collapsible instances to coordinate their open/close state.
Each Collapsible needs a \`value\` prop to participate. For FAQ-style lists,
use \`hasDividers\` with bare Collapsible children instead of wrapping each
item in Card.

@example
\`\`\`
<CollapsibleGroup type="single" hasDividers defaultValue="faq1">
  <Collapsible trigger="What is Astryx?" value="faq1">
    Astryx is a design system for building internal tools.
  </Collapsible>
  <Collapsible trigger="How do I start?" value="faq2">
    Install the package and import components.
  </Collapsible>
</CollapsibleGroup>
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
\`\`\``,methods:[],displayName:`CollapsibleGroup`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLElement>`,elements:[{name:`HTMLElement`}]},description:``},type:{required:!1,tsType:{name:`union`,raw:`'single' | 'multiple'`,elements:[{name:`literal`,value:`'single'`},{name:`literal`,value:`'multiple'`}]},description:`Whether only one item can be open at a time, or multiple.
@default "single"`,defaultValue:{value:`'single'`,computed:!1}},defaultValue:{required:!1,tsType:{name:`union`,raw:`string | string[]`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`}]},description:`Default open item(s) — uncontrolled mode.
Use a string for single mode, string[] for multiple mode.`},value:{required:!1,tsType:{name:`union`,raw:`string | string[]`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`}]},description:`Controlled open item(s).
When provided, the group is fully controlled externally.`},onChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: string | string[]) => void`,signature:{arguments:[{type:{name:`union`,raw:`string | string[]`,elements:[{name:`string`},{name:`Array`,elements:[{name:`string`}],raw:`string[]`}]},name:`value`}],return:{name:`void`}}},description:`Callback when the open item(s) change.`},hasDividers:{required:!1,tsType:{name:`boolean`},description:`Whether to draw hairline dividers between the group's items — the
accordion row chrome. When set, the group renders a wrapper div (it
otherwise renders no DOM) and items get 'balanced' density unless
\`density\` says otherwise. Pair with bare Collapsible children; Card-wrapped
items provide their own separation.
@default false`,defaultValue:{value:`false`,computed:!1}},density:{required:!1,tsType:{name:`union`,raw:`'compact' | 'balanced' | 'spacious'`,elements:[{name:`literal`,value:`'compact'`},{name:`literal`,value:`'balanced'`},{name:`literal`,value:`'spacious'`}]},description:`Row density controlling trigger and content block padding on the group's
items. Defaults to 'balanced' when dividers are shown; otherwise items
keep their default unpadded look.`},children:{required:!0,tsType:{name:`ReactNode`},description:`Children — any components that support isCollapsible + value.

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
\`\`\``}},composes:[`Omit`]}})))()}var I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X;function Z(){return(Z=t((()=>{I=n(),k(),F(),d(),p(),L=c(),R={dividedContainer:{ks0D6T:`x17fpy1y`,$$css:!0}},z={title:`Core/Collapsible`,component:j,tags:[`autodocs`],argTypes:{hasDividers:{control:`boolean`,description:`Draw hairline dividers between the group's items`},density:{control:`select`,options:[`compact`,`balanced`,`spacious`],description:`Row density for trigger and content padding`}},decorators:[e=>(0,L.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,L.jsx)(e,{})})]},B={name:`Single Mode (default)`,render:()=>(0,L.jsx)(j,{type:`single`,defaultValue:`general`,children:(0,L.jsxs)(m,{gap:2,children:[(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`General Settings`,value:`general`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Configure your general preferences including language, timezone, and display options.`})})}),(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`Privacy Settings`,value:`privacy`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Manage who can see your profile, activity, and personal information.`})})}),(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`Notification Settings`,value:`notifications`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Choose which notifications you receive and how they are delivered.`})})})]})})},V={name:`Multiple Mode`,render:()=>(0,L.jsx)(j,{type:`multiple`,defaultValue:[`faq1`,`faq3`],children:(0,L.jsxs)(m,{gap:2,children:[(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`What is Astryx?`,value:`faq1`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Astryx is a design system for building internal tools and products.`})})}),(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`How do I install it?`,value:`faq2`,children:(0,L.jsxs)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:[`Run `,(0,L.jsx)(`code`,{children:`npm install @astryxdesign/core`}),` to get started.`]})})}),(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`Is it open source?`,value:`faq3`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Yes! Astryx is open source and available on GitHub.`})})})]})})},H={name:`Controlled`,render:function(){let[e,t]=(0,I.useState)(`section1`);return(0,L.jsxs)(`div`,{children:[(0,L.jsxs)(`p`,{className:`xv1l7n4 xif65rj x9ynric x1ghz6dp`,children:[`Currently open: `,(0,L.jsx)(`strong`,{children:String(e)||`(none)`})]}),(0,L.jsx)(j,{type:`single`,value:e,onChange:t,children:(0,L.jsxs)(m,{gap:2,children:[(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`Section 1`,value:`section1`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Content for section 1.`})})}),(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`Section 2`,value:`section2`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Content for section 2.`})})}),(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`Section 3`,value:`section3`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Content for section 3.`})})})]})})]})}},U={name:`Standalone Collapsible`,render:()=>(0,L.jsxs)(m,{gap:2,children:[(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`Starts open (default)`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`This collapsible manages its own state. Click the trigger to toggle.`})})}),(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`Starts collapsed`,defaultIsOpen:!1,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`This collapsible starts collapsed. Click to reveal.`})})})]})},W={name:`Disabled item`,render:()=>(0,L.jsxs)(m,{gap:2,children:[(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`Enabled — click to toggle`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`This section can be toggled.`})})}),(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`Disabled — can't be toggled`,isDisabled:!0,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`The trigger is non-interactive and dimmed.`})})}),(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`Disabled but open`,isDisabled:!0,defaultIsOpen:!0,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Disabling doesn't collapse an already-open item; the content stays visible.`})})})]})},G={name:`Without Card (standalone)`,render:()=>(0,L.jsxs)(m,{gap:2,children:[(0,L.jsx)(S,{trigger:`Show more details`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Collapsible works anywhere; it doesn't require a card wrapper.`})}),(0,L.jsx)(S,{trigger:`Another section`,defaultIsOpen:!1,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`This section starts collapsed.`})})]})},K={name:`Dividers`,args:{type:`single`,hasDividers:!0,defaultValue:`q1`},render:e=>(0,L.jsx)(`div`,{className:`x17fpy1y`,children:(0,L.jsxs)(j,{...e,children:[(0,L.jsx)(S,{trigger:`How do I reset my password?`,value:`q1`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Go to Settings → Security → Change Password. You'll receive a confirmation email.`})}),(0,L.jsx)(S,{trigger:`Can I change my username?`,value:`q2`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Usernames can be changed once every 30 days from your profile settings.`})}),(0,L.jsx)(S,{trigger:`How do I delete my account?`,value:`q3`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Account deletion is permanent. Your data will be removed within 30 days.`})})]})})},q={name:`Dividers — Multiple`,args:{type:`multiple`,hasDividers:!0,defaultValue:[`a`]},render:e=>(0,L.jsx)(`div`,{className:`x17fpy1y`,children:(0,L.jsxs)(j,{...e,children:[(0,L.jsx)(S,{trigger:`Deployment Details`,value:`a`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Deployed 2 hours ago from the main branch.`})}),(0,L.jsx)(S,{trigger:`Environment Variables`,value:`b`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`12 variables configured for this environment.`})}),(0,L.jsx)(S,{trigger:`Build Logs`,value:`c`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Build completed in 43 seconds.`})})]})})},J={name:`Dividers — Density`,render:()=>(0,L.jsx)(m,{gap:6,xstyle:R.dividedContainer,children:[`compact`,`balanced`,`spacious`].map(e=>(0,L.jsxs)(j,{type:`multiple`,hasDividers:!0,density:e,defaultValue:[`one`],children:[(0,L.jsx)(S,{trigger:`First section (${e})`,value:`one`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Row padding scales with density.`})}),(0,L.jsx)(S,{trigger:`Second section`,value:`two`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Collapsed by default.`})})]},e))})},Y={name:`FAQ Page`,render:()=>(0,L.jsx)(j,{type:`single`,children:(0,L.jsxs)(m,{gap:2,children:[(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`How do I reset my password?`,value:`q1`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Go to Settings → Security → Change Password. You'll receive a confirmation email.`})})}),(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`Can I change my username?`,value:`q2`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Usernames can be changed once every 30 days from your profile settings.`})})}),(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`How do I delete my account?`,value:`q3`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Account deletion is permanent. Go to Settings → Account → Delete Account. Your data will be removed within 30 days.`})})}),(0,L.jsx)(f,{children:(0,L.jsx)(S,{trigger:`What payment methods are accepted?`,value:`q4`,children:(0,L.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`We accept Visa, Mastercard, American Express, and PayPal.`})})})]})})},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: 'Multiple Mode',
  render: () => <CollapsibleGroup type="multiple" defaultValue={['faq1', 'faq3']}>
      <VStack gap={2}>
        <Card>
          <Collapsible trigger="What is Astryx?" value="faq1">
            <p {...stylex.props(styles.text)}>
              Astryx is a design system for building internal tools and
              products.
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Disabled item',
  render: () => <VStack gap={2}>
      <Card>
        <Collapsible trigger="Enabled — click to toggle">
          <p {...stylex.props(styles.text)}>This section can be toggled.</p>
        </Collapsible>
      </Card>
      <Card>
        <Collapsible trigger="Disabled — can't be toggled" isDisabled>
          <p {...stylex.props(styles.text)}>
            The trigger is non-interactive and dimmed.
          </p>
        </Collapsible>
      </Card>
      <Card>
        <Collapsible trigger="Disabled but open" isDisabled defaultIsOpen>
          <p {...stylex.props(styles.text)}>
            Disabling doesn't collapse an already-open item; the content stays
            visible.
          </p>
        </Collapsible>
      </Card>
    </VStack>
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'Dividers',
  args: {
    type: 'single',
    hasDividers: true,
    defaultValue: 'q1'
  },
  render: args => <div {...stylex.props(styles.dividedContainer)}>
      <CollapsibleGroup {...args}>
        <Collapsible trigger="How do I reset my password?" value="q1">
          <p {...stylex.props(styles.text)}>
            Go to Settings → Security → Change Password. You'll receive a
            confirmation email.
          </p>
        </Collapsible>
        <Collapsible trigger="Can I change my username?" value="q2">
          <p {...stylex.props(styles.text)}>
            Usernames can be changed once every 30 days from your profile
            settings.
          </p>
        </Collapsible>
        <Collapsible trigger="How do I delete my account?" value="q3">
          <p {...stylex.props(styles.text)}>
            Account deletion is permanent. Your data will be removed within 30
            days.
          </p>
        </Collapsible>
      </CollapsibleGroup>
    </div>
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'Dividers — Multiple',
  args: {
    type: 'multiple',
    hasDividers: true,
    defaultValue: ['a']
  },
  render: args => <div {...stylex.props(styles.dividedContainer)}>
      <CollapsibleGroup {...args}>
        <Collapsible trigger="Deployment Details" value="a">
          <p {...stylex.props(styles.text)}>
            Deployed 2 hours ago from the main branch.
          </p>
        </Collapsible>
        <Collapsible trigger="Environment Variables" value="b">
          <p {...stylex.props(styles.text)}>
            12 variables configured for this environment.
          </p>
        </Collapsible>
        <Collapsible trigger="Build Logs" value="c">
          <p {...stylex.props(styles.text)}>Build completed in 43 seconds.</p>
        </Collapsible>
      </CollapsibleGroup>
    </div>
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'Dividers — Density',
  render: () => <VStack gap={6} xstyle={styles.dividedContainer}>
      {(['compact', 'balanced', 'spacious'] as const).map(density => <CollapsibleGroup key={density} type="multiple" hasDividers density={density} defaultValue={['one']}>
          <Collapsible trigger={\`First section (\${density})\`} value="one">
            <p {...stylex.props(styles.text)}>
              Row padding scales with density.
            </p>
          </Collapsible>
          <Collapsible trigger="Second section" value="two">
            <p {...stylex.props(styles.text)}>Collapsed by default.</p>
          </Collapsible>
        </CollapsibleGroup>)}
    </VStack>
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}},X=[`SingleMode`,`MultipleMode`,`Controlled`,`StandaloneCollapsible`,`Disabled`,`WithoutCard`,`Dividers`,`DividersMultiple`,`DividersDensity`,`FAQ`]})))()}Z();export{H as Controlled,W as Disabled,K as Dividers,J as DividersDensity,q as DividersMultiple,Y as FAQ,V as MultipleMode,B as SingleMode,U as StandaloneCollapsible,G as WithoutCard,X as __namedExportsOrder,z as default};