import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Button-DlxrQzaK.js";import{t as r}from"./Button-PY4-RRjU.js";import{n as i,t as a}from"./Icon-Csbga5uN.js";import{Ei as o,Ti as s}from"./iframe-DRSfIdhd.js";import{t as c,u as l}from"./esm-S3-01pr3.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;e((()=>{s(),r(),a(),c(),u=t(),d={title:`Core/Banner`,component:o,tags:[`autodocs`],argTypes:{status:{control:`select`,options:[`info`,`warning`,`error`,`success`],description:`Status type controlling icon and color`},container:{control:`select`,options:[`card`,`section`],description:`Container type`},isDismissable:{control:`boolean`,description:`Whether the banner can be dismissed (manages its own hidden state)`},defaultIsExpanded:{control:`boolean`,description:`Whether the content area starts expanded (only relevant when children are provided)`}}},f={args:{status:`info`,title:`A new software update is available.`}},p={args:{status:`warning`,title:`Your trial expires in 3 days.`}},m={args:{status:`error`,title:`There was an error processing your request.`}},h={args:{status:`success`,title:`Your changes have been saved successfully.`}},g={args:{status:`info`,title:`New update available`,description:`A new version of the application is available. Update now to get the latest features and improvements.`}},_={args:{status:`info`,title:`New update available`,description:`Version 2.0 is ready to install.`,endContent:(0,u.jsx)(n,{label:`Update now`,variant:`primary`,size:`sm`})}},v={args:{status:`warning`,title:`Your session will expire soon.`,description:`Please save your work to avoid losing changes.`,isDismissable:!0}},y={args:{status:`info`,title:`This banner dismisses itself and calls onDismiss.`,isDismissable:!0,onDismiss:()=>console.log(`Dismissed!`)}},b={args:{status:`info`,title:`System maintenance scheduled`,description:`The system will be undergoing maintenance on Saturday from 2:00 AM to 6:00 AM UTC.`,container:`section`}},x={name:`Collapsible Content (Collapsed)`,args:{status:`info`,title:`Emphasized Text`,description:`Description text`,endContent:(0,u.jsx)(n,{label:`Button`,variant:`secondary`,size:`sm`}),isDismissable:!0,children:(0,u.jsx)(`div`,{style:{fontSize:`13px`,padding:`40px`,textAlign:`center`,color:`#999`},children:`Flex Slot`})}},S={name:`Collapsible Content (Expanded)`,args:{status:`info`,title:`Emphasized Text`,description:`Description text`,defaultIsExpanded:!0,endContent:(0,u.jsx)(n,{label:`Button`,variant:`secondary`,size:`sm`}),isDismissable:!0,children:(0,u.jsx)(`div`,{style:{fontSize:`13px`,padding:`40px`,textAlign:`center`,color:`#999`},children:`Flex Slot`})}},C={name:`With Content Area (Card Background)`,args:{status:`error`,title:`Multiple errors found`,description:`The following issues need to be resolved:`,defaultIsExpanded:!0,children:(0,u.jsxs)(`ul`,{style:{margin:0,paddingInlineStart:`20px`,fontSize:`13px`},children:[(0,u.jsx)(`li`,{children:`Email address is invalid`}),(0,u.jsx)(`li`,{children:`Password must be at least 8 characters`}),(0,u.jsx)(`li`,{children:`Username is already taken`})]})}},w={name:`Content Area + Action Button`,args:{status:`warning`,title:`Configuration changes detected`,description:`Review the changes before they take effect.`,endContent:(0,u.jsx)(n,{label:`Review`,variant:`secondary`,size:`sm`}),isDismissable:!0,defaultIsExpanded:!0,children:(0,u.jsxs)(`div`,{style:{fontSize:`13px`},children:[(0,u.jsx)(`p`,{style:{margin:`0 0 8px`},children:`Changed settings:`}),(0,u.jsxs)(`ul`,{style:{margin:0,paddingInlineStart:`20px`},children:[(0,u.jsx)(`li`,{children:`Authentication method updated`}),(0,u.jsx)(`li`,{children:`Rate limits modified`})]})]})}},T={name:`All Status Variants`,render:()=>(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,u.jsx)(o,{status:`info`,title:`Info banner`}),(0,u.jsx)(o,{status:`warning`,title:`Warning banner`}),(0,u.jsx)(o,{status:`error`,title:`Error banner`}),(0,u.jsx)(o,{status:`success`,title:`Success banner`})]})},E={name:`All Features Combined`,render:()=>(0,u.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,u.jsx)(o,{status:`info`,title:`Simple banner`,description:`Just the colored header area.`}),(0,u.jsx)(o,{status:`info`,title:`With custom icon`,icon:(0,u.jsx)(i,{icon:l,size:`md`,color:`accent`})}),(0,u.jsx)(o,{status:`warning`,title:`Dismissable`,description:`Click the X to dismiss. Works without onDismiss.`,isDismissable:!0}),(0,u.jsx)(o,{status:`info`,title:`With action button`,endContent:(0,u.jsx)(n,{label:`Learn more`,variant:`secondary`,size:`sm`})}),(0,u.jsx)(o,{status:`error`,title:`With collapsible content`,description:`Click the chevron to expand.`,isDismissable:!0,children:(0,u.jsx)(`div`,{style:{fontSize:`13px`},children:`This content sits on a card-colored background, visually distinct from the status header above.`})}),(0,u.jsx)(o,{status:`success`,title:`Expanded by default`,description:`This content area starts open.`,defaultIsExpanded:!0,isDismissable:!0,children:(0,u.jsx)(`div`,{style:{fontSize:`13px`},children:`Content is visible immediately because defaultIsExpanded is true.`})}),(0,u.jsx)(o,{status:`error`,title:`Section container`,description:`Full-width with no border-radius.`,container:`section`})]})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
    title: 'New update available',
    description: 'A new version of the application is available. Update now to get the latest features and improvements.'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'New update available',
    description: 'Version 2.0 is ready to install.',
    endContent: <Button label="Update now" variant="primary" size="sm" />
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'warning',
    title: 'Your session will expire soon.',
    description: 'Please save your work to avoid losing changes.',
    isDismissable: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'This banner dismisses itself and calls onDismiss.',
    isDismissable: true,
    onDismiss: () => console.log('Dismissed!')
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'System maintenance scheduled',
    description: 'The system will be undergoing maintenance on Saturday from 2:00 AM to 6:00 AM UTC.',
    container: 'section'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Collapsible Content (Collapsed)',
  args: {
    status: 'info',
    title: 'Emphasized Text',
    description: 'Description text',
    endContent: <Button label="Button" variant="secondary" size="sm" />,
    isDismissable: true,
    children: <div style={{
      fontSize: '13px',
      padding: '40px',
      textAlign: 'center',
      color: '#999'
    }}>
        Flex Slot
      </div>
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Collapsible Content (Expanded)',
  args: {
    status: 'info',
    title: 'Emphasized Text',
    description: 'Description text',
    defaultIsExpanded: true,
    endContent: <Button label="Button" variant="secondary" size="sm" />,
    isDismissable: true,
    children: <div style={{
      fontSize: '13px',
      padding: '40px',
      textAlign: 'center',
      color: '#999'
    }}>
        Flex Slot
      </div>
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'With Content Area (Card Background)',
  args: {
    status: 'error',
    title: 'Multiple errors found',
    description: 'The following issues need to be resolved:',
    defaultIsExpanded: true,
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Content Area + Action Button',
  args: {
    status: 'warning',
    title: 'Configuration changes detected',
    description: 'Review the changes before they take effect.',
    endContent: <Button label="Review" variant="secondary" size="sm" />,
    isDismissable: true,
    defaultIsExpanded: true,
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
      <Banner status="error" title="With collapsible content" description="Click the chevron to expand." isDismissable>
        <div style={{
        fontSize: '13px'
      }}>
          This content sits on a card-colored background, visually distinct from
          the status header above.
        </div>
      </Banner>
      <Banner status="success" title="Expanded by default" description="This content area starts open." defaultIsExpanded isDismissable>
        <div style={{
        fontSize: '13px'
      }}>
          Content is visible immediately because defaultIsExpanded is true.
        </div>
      </Banner>
      <Banner status="error" title="Section container" description="Full-width with no border-radius." container="section" />
    </div>
}`,...E.parameters?.docs?.source}}},D=[`Info`,`Warning`,`Error`,`Success`,`WithDescription`,`WithEndButton`,`Dismissable`,`DismissableWithCallback`,`SectionVariant`,`CollapsibleContent`,`CollapsibleContentExpanded`,`WithContentArea`,`ContentAreaWithAction`,`AllStatuses`,`AllFeatures`]}))();export{E as AllFeatures,T as AllStatuses,x as CollapsibleContent,S as CollapsibleContentExpanded,w as ContentAreaWithAction,v as Dismissable,y as DismissableWithCallback,m as Error,f as Info,b as SectionVariant,h as Success,p as Warning,C as WithContentArea,g as WithDescription,_ as WithEndButton,D as __namedExportsOrder,d as default};