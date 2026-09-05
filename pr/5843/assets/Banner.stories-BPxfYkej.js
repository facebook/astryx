import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Button-CpBrZi1Q.js";import{t as r}from"./Button-BdM_Mlh9.js";import{t as i}from"./Icon-nqzzJpQf.js";import{t as a}from"./Icon-Dn-zG4Ea.js";import{Mi as o,ji as s}from"./iframe-CdCuTf7P.js";import{f as c,t as l}from"./esm-B13qlNX_.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;e((()=>{s(),r(),a(),l(),u=t(),d={title:`Core/Banner`,component:o,tags:[`autodocs`],argTypes:{status:{control:`select`,options:[`info`,`warning`,`error`,`success`],description:`Status type controlling icon and color`},container:{control:`select`,options:[`card`,`section`],description:`Container type`},elevation:{control:`inline-radio`,options:[`none`,`low`,`med`,`high`],description:`Resting shadow depth (for a floating banner)`},isDismissable:{control:`boolean`,description:`Whether the banner can be dismissed (manages its own hidden state)`},collapsible:{control:`boolean`,description:`Whether the content area sits behind an expand/collapse toggle. On by default, starting collapsed. false keeps children always visible with no toggle; pass {defaultIsOpen: true} to start open, or {isOpen, onOpenChange} for controlled.`}}},f={args:{status:`info`,title:`A new software update is available.`}},p={args:{status:`warning`,title:`Your trial expires in 3 days.`}},m={args:{status:`error`,title:`There was an error processing your request.`}},h={args:{status:`success`,title:`Your changes have been saved successfully.`}},g={args:{status:`info`,title:`This banner floats above content.`,description:`A raised banner draws attention as an overlay.`,elevation:`med`}},_={args:{status:`info`,title:`New update available`,description:`A new version of the application is available. Update now to get the latest features and improvements.`}},v={args:{status:`info`,title:`New update available`,description:`Version 2.0 is ready to install.`,endContent:(0,u.jsx)(n,{label:`Update now`,variant:`primary`,size:`sm`})}},y={args:{status:`warning`,title:`Your session will expire soon.`,description:`Please save your work to avoid losing changes.`,isDismissable:!0}},b={args:{status:`info`,title:`This banner dismisses itself and calls onDismiss.`,isDismissable:!0,onDismiss:()=>console.log(`Dismissed!`)}},x={args:{status:`info`,title:`System maintenance scheduled`,description:`The system will be undergoing maintenance on Saturday from 2:00 AM to 6:00 AM UTC.`,container:`section`}},S={name:`Collapsible Content (Collapsed)`,args:{status:`info`,title:`Emphasized Text`,description:`Description text`,endContent:(0,u.jsx)(n,{label:`Button`,variant:`secondary`,size:`sm`}),isDismissable:!0,children:(0,u.jsx)(`div`,{style:{padding:`40px`,textAlign:`center`,color:`var(--color-text-secondary)`},children:`Flex Slot`})}},C={name:`Collapsible Content (Expanded)`,args:{status:`info`,title:`Emphasized Text`,description:`Description text`,collapsible:{defaultIsOpen:!0},endContent:(0,u.jsx)(n,{label:`Button`,variant:`secondary`,size:`sm`}),isDismissable:!0,children:(0,u.jsx)(`div`,{style:{padding:`40px`,textAlign:`center`,color:`var(--color-text-secondary)`},children:`Flex Slot`})}},w={name:`Content Always Visible (collapsible={false})`,args:{status:`error`,title:`Multiple errors found`,description:`The following issues need to be resolved:`,collapsible:!1,children:(0,u.jsxs)(`ul`,{style:{margin:0,paddingInlineStart:`20px`,fontSize:`13px`},children:[(0,u.jsx)(`li`,{children:`Email address is invalid`}),(0,u.jsx)(`li`,{children:`Password must be at least 8 characters`}),(0,u.jsx)(`li`,{children:`Username is already taken`})]})}},T={name:`Content Area + Action Button`,args:{status:`warning`,title:`Configuration changes detected`,description:`Review the changes before they take effect.`,endContent:(0,u.jsx)(n,{label:`Review`,variant:`secondary`,size:`sm`}),isDismissable:!0,collapsible:{defaultIsOpen:!0},children:(0,u.jsxs)(`div`,{style:{fontSize:`13px`},children:[(0,u.jsx)(`p`,{style:{margin:`0 0 8px`},children:`Changed settings:`}),(0,u.jsxs)(`ul`,{style:{margin:0,paddingInlineStart:`20px`},children:[(0,u.jsx)(`li`,{children:`Authentication method updated`}),(0,u.jsx)(`li`,{children:`Rate limits modified`})]})]})}},E={name:`All Status Variants`,render:()=>(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,u.jsx)(o,{status:`info`,title:`Info banner`}),(0,u.jsx)(o,{status:`warning`,title:`Warning banner`}),(0,u.jsx)(o,{status:`error`,title:`Error banner`}),(0,u.jsx)(o,{status:`success`,title:`Success banner`})]})},D={name:`All Features Combined`,render:()=>(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,u.jsx)(o,{status:`info`,title:`Simple banner`,description:`Just the colored header area.`}),(0,u.jsx)(o,{status:`info`,title:`With custom icon`,icon:(0,u.jsx)(i,{icon:c,size:`md`,color:`accent`})}),(0,u.jsx)(o,{status:`warning`,title:`Dismissable`,description:`Click the X to dismiss. Works without onDismiss.`,isDismissable:!0}),(0,u.jsx)(o,{status:`info`,title:`With action button`,endContent:(0,u.jsx)(n,{label:`Learn more`,variant:`secondary`,size:`sm`})}),(0,u.jsx)(o,{status:`error`,title:`With content, always visible`,description:`collapsible={false} drops the toggle.`,isDismissable:!0,collapsible:!1,children:(0,u.jsx)(`div`,{style:{fontSize:`13px`},children:`The content sits on a card-colored background, visually distinct from the status header above.`})}),(0,u.jsx)(o,{status:`error`,title:`With collapsible content`,description:`Click the chevron to expand. This is the default.`,isDismissable:!0,children:(0,u.jsx)(`div`,{style:{fontSize:`13px`},children:`This content sits on a card-colored background, visually distinct from the status header above.`})}),(0,u.jsx)(o,{status:`success`,title:`Expanded by default`,description:`This content area starts open.`,collapsible:{defaultIsOpen:!0},isDismissable:!0,children:(0,u.jsx)(`div`,{style:{fontSize:`13px`},children:`Content is visible immediately because of defaultIsOpen.`})}),(0,u.jsx)(o,{status:`error`,title:`Section container`,description:`Full-width with no border-radius.`,container:`section`})]})},O={name:`Overflow (long text and a long word)`,render:()=>(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,u.jsx)(o,{status:`error`,title:`Your subscription payment could not be processed because the card on file has expired`,description:`Update the payment method in billing settings to restore access to every workspace on this account before the grace period ends.`,isDismissable:!0}),(0,u.jsx)(o,{status:`warning`,title:`Pneumonoultramicroscopicsilicovolcanoconiosisdiagnosisunavailable`,description:`Verkehrsinfrastrukturfinanzierungsgesellschaftsvorstandsvorsitzender`,isDismissable:!0})]})},k={name:`Narrow container (240px)`,render:()=>(0,u.jsx)(`div`,{style:{width:`240px`},children:(0,u.jsx)(o,{status:`info`,title:`Storage almost full`,description:`Free up space or upgrade your plan to keep syncing.`,isDismissable:!0})})},A={name:`Empty slots (falsy children and description)`,render:()=>(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,u.jsx)(o,{status:`info`,title:`No expand affordance`,description:``,children:!1}),(0,u.jsx)(o,{status:`success`,title:`Title only`})]})},j={name:`Multiple actions (narrow viewport)`,render:()=>(0,u.jsx)(o,{status:`warning`,title:`A compute node is required`,description:`Attach one of the announcing compute nodes to continue this session.`,endContent:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(n,{label:`Attach od-1234`,variant:`secondary`,size:`sm`}),(0,u.jsx)(n,{label:`Attach od-9999`,variant:`secondary`,size:`sm`}),(0,u.jsx)(n,{label:`Provision new`,variant:`secondary`,size:`sm`})]}),isDismissable:!0})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'A new software update is available.'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'warning',
    title: 'Your trial expires in 3 days.'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'error',
    title: 'There was an error processing your request.'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success',
    title: 'Your changes have been saved successfully.'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'This banner floats above content.',
    description: 'A raised banner draws attention as an overlay.',
    elevation: 'med'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'New update available',
    description: 'A new version of the application is available. Update now to get the latest features and improvements.'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'New update available',
    description: 'Version 2.0 is ready to install.',
    endContent: <Button label="Update now" variant="primary" size="sm" />
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'warning',
    title: 'Your session will expire soon.',
    description: 'Please save your work to avoid losing changes.',
    isDismissable: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'This banner dismisses itself and calls onDismiss.',
    isDismissable: true,
    onDismiss: () => console.log('Dismissed!')
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'System maintenance scheduled',
    description: 'The system will be undergoing maintenance on Saturday from 2:00 AM to 6:00 AM UTC.',
    container: 'section'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Collapsible Content (Collapsed)',
  args: {
    status: 'info',
    title: 'Emphasized Text',
    description: 'Description text',
    endContent: <Button label="Button" variant="secondary" size="sm" />,
    isDismissable: true,
    children: <div style={{
      padding: '40px',
      textAlign: 'center',
      color: 'var(--color-text-secondary)'
    }}>
        Flex Slot
      </div>
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Collapsible Content (Expanded)',
  args: {
    status: 'info',
    title: 'Emphasized Text',
    description: 'Description text',
    collapsible: {
      defaultIsOpen: true
    },
    endContent: <Button label="Button" variant="secondary" size="sm" />,
    isDismissable: true,
    children: <div style={{
      padding: '40px',
      textAlign: 'center',
      color: 'var(--color-text-secondary)'
    }}>
        Flex Slot
      </div>
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Content Always Visible (collapsible={false})',
  args: {
    status: 'error',
    title: 'Multiple errors found',
    description: 'The following issues need to be resolved:',
    collapsible: false,
    children: <ul style={{
      margin: 0,
      paddingInlineStart: '20px',
      fontSize: '13px'
    }}>
        <li>Email address is invalid</li>
        <li>Password must be at least 8 characters</li>
        <li>Username is already taken</li>
      </ul>
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Content Area + Action Button',
  args: {
    status: 'warning',
    title: 'Configuration changes detected',
    description: 'Review the changes before they take effect.',
    endContent: <Button label="Review" variant="secondary" size="sm" />,
    isDismissable: true,
    collapsible: {
      defaultIsOpen: true
    },
    children: <div style={{
      fontSize: '13px'
    }}>
        <p style={{
        margin: '0 0 8px'
      }}>Changed settings:</p>
        <ul style={{
        margin: 0,
        paddingInlineStart: '20px'
      }}>
          <li>Authentication method updated</li>
          <li>Rate limits modified</li>
        </ul>
      </div>
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'All Status Variants',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
      <Banner status="info" title="Info banner" />
      <Banner status="warning" title="Warning banner" />
      <Banner status="error" title="Error banner" />
      <Banner status="success" title="Success banner" />
    </div>
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'All Features Combined',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
      <Banner status="info" title="Simple banner" description="Just the colored header area." />
      <Banner status="info" title="With custom icon" icon={<Icon icon={ShieldCheckIcon} size="md" color="accent" />} />
      <Banner status="warning" title="Dismissable" description="Click the X to dismiss. Works without onDismiss." isDismissable />
      <Banner status="info" title="With action button" endContent={<Button label="Learn more" variant="secondary" size="sm" />} />
      <Banner status="error" title="With content, always visible" description="collapsible={false} drops the toggle." isDismissable collapsible={false}>
        <div style={{
        fontSize: '13px'
      }}>
          The content sits on a card-colored background, visually distinct from
          the status header above.
        </div>
      </Banner>
      <Banner status="error" title="With collapsible content" description="Click the chevron to expand. This is the default." isDismissable>
        <div style={{
        fontSize: '13px'
      }}>
          This content sits on a card-colored background, visually distinct from
          the status header above.
        </div>
      </Banner>
      <Banner status="success" title="Expanded by default" description="This content area starts open." collapsible={{
      defaultIsOpen: true
    }} isDismissable>
        <div style={{
        fontSize: '13px'
      }}>
          Content is visible immediately because of defaultIsOpen.
        </div>
      </Banner>
      <Banner status="error" title="Section container" description="Full-width with no border-radius." container="section" />
    </div>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'Overflow (long text and a long word)',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
      <Banner status="error" title="Your subscription payment could not be processed because the card on file has expired" description="Update the payment method in billing settings to restore access to every workspace on this account before the grace period ends." isDismissable />
      <Banner status="warning" title="Pneumonoultramicroscopicsilicovolcanoconiosisdiagnosisunavailable" description="Verkehrsinfrastrukturfinanzierungsgesellschaftsvorstandsvorsitzender" isDismissable />
    </div>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Narrow container (240px)',
  render: () => <div style={{
    width: '240px'
  }}>
      <Banner status="info" title="Storage almost full" description="Free up space or upgrade your plan to keep syncing." isDismissable />
    </div>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'Empty slots (falsy children and description)',
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
      <Banner status="info" title="No expand affordance" description="">
        {false}
      </Banner>
      <Banner status="success" title="Title only" />
    </div>
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'Multiple actions (narrow viewport)',
  render: () => <Banner status="warning" title="A compute node is required" description="Attach one of the announcing compute nodes to continue this session." endContent={<>
          <Button label="Attach od-1234" variant="secondary" size="sm" />
          <Button label="Attach od-9999" variant="secondary" size="sm" />
          <Button label="Provision new" variant="secondary" size="sm" />
        </>} isDismissable />
}`,...j.parameters?.docs?.source}}},M=[`Info`,`Warning`,`Error`,`Success`,`Floating`,`WithDescription`,`WithEndButton`,`Dismissable`,`DismissableWithCallback`,`SectionVariant`,`CollapsibleContent`,`CollapsibleContentExpanded`,`AlwaysVisibleContent`,`ContentAreaWithAction`,`AllStatuses`,`AllFeatures`,`LongText`,`NarrowContainer`,`EmptySlots`,`MultipleActionsNarrow`]}))();export{D as AllFeatures,E as AllStatuses,w as AlwaysVisibleContent,S as CollapsibleContent,C as CollapsibleContentExpanded,T as ContentAreaWithAction,y as Dismissable,b as DismissableWithCallback,A as EmptySlots,m as Error,g as Floating,f as Info,O as LongText,j as MultipleActionsNarrow,k as NarrowContainer,x as SectionVariant,h as Success,p as Warning,_ as WithDescription,v as WithEndButton,M as __namedExportsOrder,d as default};