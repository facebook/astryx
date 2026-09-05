import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-CUw_qAJO.js";import{t as a}from"./Card-D5cVf6xt.js";import{t as o}from"./Card-BJMAQDhX.js";import{i as s}from"./Stack-Dntpv-r2.js";import{t as c}from"./Layout-C0lADRwM.js";import{t as l}from"./Text-B194cPHg.js";import{_r as u,hr as d,mr as f}from"./iframe-DmzuaVX9.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;e((()=>{p=t(n()),f(),o(),l(),c(),m=r(),h={dividedContainer:{ks0D6T:`x17fpy1y`,$$css:!0}},g={title:`Core/Collapsible`,component:d,tags:[`autodocs`],argTypes:{hasDividers:{control:`boolean`,description:`Draw hairline dividers between the group's items`},density:{control:`select`,options:[`compact`,`balanced`,`spacious`],description:`Row density for trigger and content padding`}},decorators:[e=>(0,m.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,m.jsx)(e,{})})]},_={name:`Single Mode (default)`,render:()=>(0,m.jsx)(d,{type:`single`,defaultValue:`general`,children:(0,m.jsxs)(s,{gap:2,children:[(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`General Settings`,value:`general`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Configure your general preferences including language, timezone, and display options.`})})}),(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`Privacy Settings`,value:`privacy`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Manage who can see your profile, activity, and personal information.`})})}),(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`Notification Settings`,value:`notifications`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Choose which notifications you receive and how they are delivered.`})})})]})})},v={name:`Multiple Mode`,render:()=>(0,m.jsx)(d,{type:`multiple`,defaultValue:[`faq1`,`faq3`],children:(0,m.jsxs)(s,{gap:2,children:[(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`What is Astryx?`,value:`faq1`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Astryx is a design system for building internal tools and products.`})})}),(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`How do I install it?`,value:`faq2`,children:(0,m.jsxs)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:[`Run `,(0,m.jsx)(`code`,{children:`npm install @astryxdesign/core`}),` to get started.`]})})}),(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`Is it open source?`,value:`faq3`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Yes! Astryx is open source and available on GitHub.`})})})]})})},y={name:`Controlled`,render:function(){let[e,t]=(0,p.useState)(`section1`);return(0,m.jsxs)(`div`,{children:[(0,m.jsxs)(`p`,{className:`xv1l7n4 xif65rj x9ynric x1ghz6dp`,children:[`Currently open: `,(0,m.jsx)(`strong`,{children:String(e)||`(none)`})]}),(0,m.jsx)(d,{type:`single`,value:e,onChange:t,children:(0,m.jsxs)(s,{gap:2,children:[(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`Section 1`,value:`section1`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Content for section 1.`})})}),(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`Section 2`,value:`section2`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Content for section 2.`})})}),(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`Section 3`,value:`section3`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Content for section 3.`})})})]})})]})}},b={name:`Standalone Collapsible`,render:()=>(0,m.jsxs)(s,{gap:2,children:[(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`Starts open (default)`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`This collapsible manages its own state. Click the trigger to toggle.`})})}),(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`Starts collapsed`,defaultIsOpen:!1,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`This collapsible starts collapsed. Click to reveal.`})})})]})},x={name:`Disabled item`,render:()=>(0,m.jsxs)(s,{gap:2,children:[(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`Enabled — click to toggle`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`This section can be toggled.`})})}),(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`Disabled — can't be toggled`,isDisabled:!0,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`The trigger is non-interactive and dimmed.`})})}),(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`Disabled but open`,isDisabled:!0,defaultIsOpen:!0,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Disabling doesn't collapse an already-open item; the content stays visible.`})})})]})},S={name:`Without Card (standalone)`,render:()=>(0,m.jsxs)(s,{gap:2,children:[(0,m.jsx)(u,{trigger:`Show more details`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Collapsible works anywhere; it doesn't require a card wrapper.`})}),(0,m.jsx)(u,{trigger:`Another section`,defaultIsOpen:!1,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`This section starts collapsed.`})})]})},C={name:`Dividers`,parameters:{docs:{description:{story:`An FAQ: rows, not sections. The triggers set their own type — body at semibold — because the default 'large' (17px semibold) makes every question read as a heading when they are peers in a list. Question and answer then separate on weight and color instead of size.`}}},args:{type:`single`,hasDividers:!0,defaultValue:`q1`},render:e=>(0,m.jsx)(`div`,{className:`x17fpy1y`,children:(0,m.jsxs)(d,{...e,children:[(0,m.jsx)(u,{trigger:(0,m.jsx)(i,{type:`body`,weight:`semibold`,children:`How do I reset my password?`}),value:`q1`,children:(0,m.jsx)(i,{type:`body`,color:`secondary`,children:`Go to Settings → Security → Change Password. You'll receive a confirmation email.`})}),(0,m.jsx)(u,{trigger:(0,m.jsx)(i,{type:`body`,weight:`semibold`,children:`Can I change my username?`}),value:`q2`,children:(0,m.jsx)(i,{type:`body`,color:`secondary`,children:`Usernames can be changed once every 30 days from your profile settings.`})}),(0,m.jsx)(u,{trigger:(0,m.jsx)(i,{type:`body`,weight:`semibold`,children:`How do I delete my account?`}),value:`q3`,children:(0,m.jsx)(i,{type:`body`,color:`secondary`,children:`Account deletion is permanent. Your data will be removed within 30 days.`})})]})})},w={name:`Dividers — Multiple`,args:{type:`multiple`,hasDividers:!0,defaultValue:[`a`]},render:e=>(0,m.jsx)(`div`,{className:`x17fpy1y`,children:(0,m.jsxs)(d,{...e,children:[(0,m.jsx)(u,{trigger:`Deployment Details`,value:`a`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Deployed 2 hours ago from the main branch.`})}),(0,m.jsx)(u,{trigger:`Environment Variables`,value:`b`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`12 variables configured for this environment.`})}),(0,m.jsx)(u,{trigger:`Build Logs`,value:`c`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Build completed in 43 seconds.`})})]})})},T={name:`Dividers — Density`,render:()=>(0,m.jsx)(s,{gap:6,xstyle:h.dividedContainer,children:[`compact`,`balanced`,`spacious`].map(e=>(0,m.jsxs)(d,{type:`multiple`,hasDividers:!0,density:e,defaultValue:[`one`],children:[(0,m.jsx)(u,{trigger:`First section (${e})`,value:`one`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Row padding scales with density.`})}),(0,m.jsx)(u,{trigger:`Second section`,value:`two`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Collapsed by default.`})})]},e))})},E={name:`FAQ Page`,render:()=>(0,m.jsx)(d,{type:`single`,children:(0,m.jsxs)(s,{gap:2,children:[(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`How do I reset my password?`,value:`q1`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Go to Settings → Security → Change Password. You'll receive a confirmation email.`})})}),(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`Can I change my username?`,value:`q2`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Usernames can be changed once every 30 days from your profile settings.`})})}),(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`How do I delete my account?`,value:`q3`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`Account deletion is permanent. Go to Settings → Account → Delete Account. Your data will be removed within 30 days.`})})}),(0,m.jsx)(a,{children:(0,m.jsx)(u,{trigger:`What payment methods are accepted?`,value:`q4`,children:(0,m.jsx)(`p`,{className:`x9ynric x1tgivj0 x1ghz6dp`,children:`We accept Visa, Mastercard, American Express, and PayPal.`})})})]})})},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Dividers',
  parameters: {
    docs: {
      description: {
        story: "An FAQ: rows, not sections. The triggers set their own type — body at semibold — because the default 'large' (17px semibold) makes every question read as a heading when they are peers in a list. Question and answer then separate on weight and color instead of size."
      }
    }
  },
  args: {
    type: 'single',
    hasDividers: true,
    defaultValue: 'q1'
  },
  render: args => <div {...stylex.props(styles.dividedContainer)}>
      <CollapsibleGroup {...args}>
        <Collapsible trigger={<Text type="body" weight="semibold">
              How do I reset my password?
            </Text>} value="q1">
          <Text type="body" color="secondary">
            Go to Settings → Security → Change Password. You'll receive a
            confirmation email.
          </Text>
        </Collapsible>
        <Collapsible trigger={<Text type="body" weight="semibold">
              Can I change my username?
            </Text>} value="q2">
          <Text type="body" color="secondary">
            Usernames can be changed once every 30 days from your profile
            settings.
          </Text>
        </Collapsible>
        <Collapsible trigger={<Text type="body" weight="semibold">
              How do I delete my account?
            </Text>} value="q3">
          <Text type="body" color="secondary">
            Account deletion is permanent. Your data will be removed within 30
            days.
          </Text>
        </Collapsible>
      </CollapsibleGroup>
    </div>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D=[`SingleMode`,`MultipleMode`,`Controlled`,`StandaloneCollapsible`,`Disabled`,`WithoutCard`,`Dividers`,`DividersMultiple`,`DividersDensity`,`FAQ`]}))();export{y as Controlled,x as Disabled,C as Dividers,T as DividersDensity,w as DividersMultiple,E as FAQ,v as MultipleMode,_ as SingleMode,b as StandaloneCollapsible,S as WithoutCard,D as __namedExportsOrder,g as default};