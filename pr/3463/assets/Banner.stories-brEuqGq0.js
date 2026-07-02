import{a1 as e,I as f,B as t}from"./iframe-DVtWfngO.js";import{B as s,F as v}from"./ShieldCheckIcon-BRd_9oGz.js";import"./preload-helper-Ct5FWWRu.js";const w={title:"Core/Banner",component:s,tags:["autodocs"],argTypes:{status:{control:"select",options:["info","warning","error","success"],description:"Status type controlling icon and color"},container:{control:"select",options:["card","section"],description:"Container type"},isDismissable:{control:"boolean",description:"Whether the banner can be dismissed (manages its own hidden state)"},defaultIsExpanded:{control:"boolean",description:"Whether the content area starts expanded (only relevant when children are provided)"}}},n={args:{status:"info",title:"A new software update is available."}},a={args:{status:"warning",title:"Your trial expires in 3 days."}},i={args:{status:"error",title:"There was an error processing your request."}},r={args:{status:"success",title:"Your changes have been saved successfully."}},o={args:{status:"info",title:"New update available",description:"A new version of the application is available. Update now to get the latest features and improvements."}},l={args:{status:"info",title:"New update available",description:"Version 2.0 is ready to install.",endContent:e.jsx(t,{label:"Update now",variant:"primary",size:"sm"})}},c={args:{status:"warning",title:"Your session will expire soon.",description:"Please save your work to avoid losing changes.",isDismissable:!0}},d={args:{status:"info",title:"This banner dismisses itself and calls onDismiss.",isDismissable:!0,onDismiss:()=>console.log("Dismissed!")}},u={args:{status:"info",title:"System maintenance scheduled",description:"The system will be undergoing maintenance on Saturday from 2:00 AM to 6:00 AM UTC.",container:"section"}},p={name:"Collapsible Content (Collapsed)",args:{status:"info",title:"Emphasized Text",description:"Description text",endContent:e.jsx(t,{label:"Button",variant:"secondary",size:"sm"}),isDismissable:!0,children:e.jsx("div",{style:{fontSize:"13px",padding:"40px",textAlign:"center",color:"#999"},children:"Flex Slot"})}},m={name:"Collapsible Content (Expanded)",args:{status:"info",title:"Emphasized Text",description:"Description text",defaultIsExpanded:!0,endContent:e.jsx(t,{label:"Button",variant:"secondary",size:"sm"}),isDismissable:!0,children:e.jsx("div",{style:{fontSize:"13px",padding:"40px",textAlign:"center",color:"#999"},children:"Flex Slot"})}},h={name:"With Content Area (Card Background)",args:{status:"error",title:"Multiple errors found",description:"The following issues need to be resolved:",defaultIsExpanded:!0,children:e.jsxs("ul",{style:{margin:0,paddingInlineStart:"20px",fontSize:"13px"},children:[e.jsx("li",{children:"Email address is invalid"}),e.jsx("li",{children:"Password must be at least 8 characters"}),e.jsx("li",{children:"Username is already taken"})]})}},g={name:"Content Area + Action Button",args:{status:"warning",title:"Configuration changes detected",description:"Review the changes before they take effect.",endContent:e.jsx(t,{label:"Review",variant:"secondary",size:"sm"}),isDismissable:!0,defaultIsExpanded:!0,children:e.jsxs("div",{style:{fontSize:"13px"},children:[e.jsx("p",{style:{margin:"0 0 8px"},children:"Changed settings:"}),e.jsxs("ul",{style:{margin:0,paddingInlineStart:"20px"},children:[e.jsx("li",{children:"Authentication method updated"}),e.jsx("li",{children:"Rate limits modified"})]})]})}},x={name:"All Status Variants",render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsx(s,{status:"info",title:"Info banner"}),e.jsx(s,{status:"warning",title:"Warning banner"}),e.jsx(s,{status:"error",title:"Error banner"}),e.jsx(s,{status:"success",title:"Success banner"})]})},b={name:"All Features Combined",render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsx(s,{status:"info",title:"Simple banner",description:"Just the colored header area."}),e.jsx(s,{status:"info",title:"With custom icon",icon:e.jsx(f,{icon:v,size:"md",color:"accent"})}),e.jsx(s,{status:"warning",title:"Dismissable",description:"Click the X to dismiss. Works without onDismiss.",isDismissable:!0}),e.jsx(s,{status:"info",title:"With action button",endContent:e.jsx(t,{label:"Learn more",variant:"secondary",size:"sm"})}),e.jsx(s,{status:"error",title:"With collapsible content",description:"Click the chevron to expand.",isDismissable:!0,children:e.jsx("div",{style:{fontSize:"13px"},children:"This content sits on a card-colored background, visually distinct from the status header above."})}),e.jsx(s,{status:"success",title:"Expanded by default",description:"This content area starts open.",defaultIsExpanded:!0,isDismissable:!0,children:e.jsx("div",{style:{fontSize:"13px"},children:"Content is visible immediately because defaultIsExpanded is true."})}),e.jsx(s,{status:"error",title:"Section container",description:"Full-width with no border-radius.",container:"section"})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'A new software update is available.'
  }
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'warning',
    title: 'Your trial expires in 3 days.'
  }
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'error',
    title: 'There was an error processing your request.'
  }
}`,...i.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success',
    title: 'Your changes have been saved successfully.'
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'New update available',
    description: 'A new version of the application is available. Update now to get the latest features and improvements.'
  }
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'New update available',
    description: 'Version 2.0 is ready to install.',
    endContent: <Button label="Update now" variant="primary" size="sm" />
  }
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'warning',
    title: 'Your session will expire soon.',
    description: 'Please save your work to avoid losing changes.',
    isDismissable: true
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'This banner dismisses itself and calls onDismiss.',
    isDismissable: true,
    onDismiss: () => console.log('Dismissed!')
  }
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'info',
    title: 'System maintenance scheduled',
    description: 'The system will be undergoing maintenance on Saturday from 2:00 AM to 6:00 AM UTC.',
    container: 'section'
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};const D=["Info","Warning","Error","Success","WithDescription","WithEndButton","Dismissable","DismissableWithCallback","SectionVariant","CollapsibleContent","CollapsibleContentExpanded","WithContentArea","ContentAreaWithAction","AllStatuses","AllFeatures"];export{b as AllFeatures,x as AllStatuses,p as CollapsibleContent,m as CollapsibleContentExpanded,g as ContentAreaWithAction,c as Dismissable,d as DismissableWithCallback,i as Error,n as Info,u as SectionVariant,r as Success,a as Warning,h as WithContentArea,o as WithDescription,l as WithEndButton,D as __namedExportsOrder,w as default};
