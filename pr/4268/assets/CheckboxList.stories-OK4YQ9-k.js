import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./Card-BbIrXk4e.js";import{r as o}from"./ListItem-B04E78Mx.js";import{r as s,t as c}from"./CheckboxListItem-2isWltV6.js";import{br as l,rr as u}from"./iframe-1XPcLcD3.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;e((()=>{d=t(n()),l(),u(),a(),f=r(),p={title:`Core/CheckboxList`,component:s,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},description:{control:`text`,description:`Description text displayed below the label`},density:{control:`select`,options:[`compact`,`balanced`,`spacious`],description:`Spacing density for list items`},hasDividers:{control:`boolean`,description:`Whether to show dividers between items`},isDisabled:{control:`boolean`,description:`Whether all checkbox items are disabled`},disabledMessage:{control:`text`,description:`Explains why the group is disabled (whole-group state, not per item). With isDisabled, shows a tooltip on hover/keyboard focus and keeps the checkboxes focusable via aria-disabled (toggling stays blocked). Use this instead of wrapping a disabled CheckboxList in Tooltip.`}}},m={render:e=>{let[t,n]=(0,d.useState)(e.value??[]),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(s,{...a,value:t,onChange:n,children:[(0,f.jsx)(c,{label:`Email`,value:`email`}),(0,f.jsx)(c,{label:`SMS`,value:`sms`}),(0,f.jsx)(c,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preferences`}},h={render:e=>{let[t,n]=(0,d.useState)(e.value??[]),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(s,{...a,value:t,onChange:n,children:[(0,f.jsx)(c,{label:`Email`,value:`email`,description:`Receive notifications via email`}),(0,f.jsx)(c,{label:`SMS`,value:`sms`,description:`Standard messaging rates apply`}),(0,f.jsx)(c,{label:`Push notification`,value:`push`,description:`Instant alerts on your device`})]})},args:{label:`Notification preferences`,description:`Choose how you would like to be notified`,hasDividers:!0}},g={render:e=>{let t=[{id:`react`,label:`React`},{id:`vue`,label:`Vue`},{id:`angular`,label:`Angular`},{id:`svelte`,label:`Svelte`}],[n,r]=(0,d.useState)([`react`]),{value:i,onChange:a,...o}=e;return(0,f.jsx)(s,{...o,value:n,onChange:r,children:t.map(e=>(0,f.jsx)(c,{label:e.label,value:e.id},e.id))})},args:{label:`Frameworks`}},_={render:()=>{let[e,t]=(0,d.useState)(!1),[n,r]=(0,d.useState)(!0),[i,a]=(0,d.useState)(!1);return(0,f.jsxs)(o,{children:[(0,f.jsx)(c,{label:`Accept terms and conditions`,isChecked:e,onCheck:t}),(0,f.jsx)(c,{label:`Subscribe to newsletter`,description:`Weekly updates about new features`,isChecked:n,onCheck:r}),(0,f.jsx)(c,{label:`Receive marketing emails`,isChecked:i,onCheck:a})]})}},v={render:()=>(0,f.jsxs)(o,{children:[(0,f.jsx)(c,{label:`Completed task`,isChecked:!0}),(0,f.jsx)(c,{label:`Pending task`,isChecked:!1}),(0,f.jsx)(c,{label:`In progress`,isChecked:`indeterminate`})]})},y={render:()=>{let e=[`email`,`sms`,`push`],[t,n]=(0,d.useState)([`email`]),r=e.every(e=>t.includes(e)),i=t.length===0,a=r?!0:i?!1:`indeterminate`;return(0,f.jsxs)(s,{label:`Notifications`,hasDividers:!0,children:[(0,f.jsx)(c,{label:`Select all`,isChecked:a,onCheck:t=>{n(t?[...e]:[])}}),e.map(e=>(0,f.jsx)(c,{label:e.charAt(0).toUpperCase()+e.slice(1),isChecked:t.includes(e),onCheck:t=>{n(n=>t?[...n,e]:n.filter(t=>t!==e))}},e))]})}},b={render:e=>{let[t,n]=(0,d.useState)([`email`]),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(s,{...a,value:t,onChange:n,children:[(0,f.jsx)(c,{label:`Email`,value:`email`}),(0,f.jsx)(c,{label:`SMS`,value:`sms`}),(0,f.jsx)(c,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preferences`,isDisabled:!0}},x={render:()=>{let[e,t]=(0,d.useState)([`email`]);return(0,f.jsxs)(s,{label:`Notification preferences`,value:e,onChange:t,children:[(0,f.jsx)(c,{label:`Email`,value:`email`}),(0,f.jsx)(c,{label:`SMS`,value:`sms`,isLoading:!0}),(0,f.jsx)(c,{label:`Push notification`,value:`push`})]})}},S={render:()=>{let[e,t]=(0,d.useState)([`email`]);return(0,f.jsxs)(s,{label:`Notification preferences`,description:`Toggle an option — it spins while saving`,value:e,changeAction:e=>new Promise(n=>{setTimeout(()=>{t(e),n()},1500)}),hasDividers:!0,children:[(0,f.jsx)(c,{label:`Email`,value:`email`}),(0,f.jsx)(c,{label:`SMS`,value:`sms`}),(0,f.jsx)(c,{label:`Push notification`,value:`push`})]})}},C={render:e=>{let[t,n]=(0,d.useState)([]),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(s,{...a,value:t,onChange:n,children:[(0,f.jsx)(c,{label:`Email`,value:`email`}),(0,f.jsx)(c,{label:`SMS`,value:`sms`,isDisabled:!0}),(0,f.jsx)(c,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preferences`}},w={render:e=>{let[t,n]=(0,d.useState)([]),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(s,{...a,value:t,onChange:n,children:[(0,f.jsx)(c,{label:`Email`,value:`email`}),(0,f.jsx)(c,{label:`SMS`,value:`sms`}),(0,f.jsx)(c,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preferences`,status:{type:`error`,message:`Please select at least one notification method`}}},T={render:e=>{let[t,n]=(0,d.useState)([`free`]),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(s,{...a,value:t,onChange:n,children:[(0,f.jsx)(c,{label:`Free tier`,value:`free`,description:`Basic features included`,endContent:(0,f.jsx)(`span`,{style:{color:`#0D8626`},children:`$0/mo`})}),(0,f.jsx)(c,{label:`Pro tier`,value:`pro`,description:`Advanced features`,endContent:(0,f.jsx)(`span`,{style:{color:`#0064E0`},children:`$9/mo`})}),(0,f.jsx)(c,{label:`Enterprise`,value:`enterprise`,description:`Custom solutions`,endContent:(0,f.jsx)(`span`,{style:{color:`#5B08D8`},children:`Custom`})})]})},args:{label:`Add-on packages`,hasDividers:!0}},E={render:()=>{let[e,t]=(0,d.useState)([]),[n,r]=(0,d.useState)([`email`]),[i,a]=(0,d.useState)(!1),[l,u]=(0,d.useState)(!0);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,f.jsxs)(s,{label:`Unselected`,value:e,onChange:t,children:[(0,f.jsx)(c,{label:`Option A`,value:`a`}),(0,f.jsx)(c,{label:`Option B`,value:`b`})]}),(0,f.jsxs)(s,{label:`Pre-selected`,value:n,onChange:r,children:[(0,f.jsx)(c,{label:`Email`,value:`email`}),(0,f.jsx)(c,{label:`SMS`,value:`sms`})]}),(0,f.jsxs)(s,{label:`Disabled group`,value:[`a`],onChange:()=>{},isDisabled:!0,children:[(0,f.jsx)(c,{label:`Option A`,value:`a`}),(0,f.jsx)(c,{label:`Option B`,value:`b`})]}),(0,f.jsxs)(s,{label:`With descriptions`,value:e,onChange:t,hasDividers:!0,children:[(0,f.jsx)(c,{label:`Email`,value:`email`,description:`Delivered to your inbox`}),(0,f.jsx)(c,{label:`SMS`,value:`sms`,description:`Standard rates apply`})]}),(0,f.jsxs)(s,{label:`With error`,value:[],onChange:()=>{},status:{type:`error`,message:`Please select at least one option`},children:[(0,f.jsx)(c,{label:`Option A`,value:`a`}),(0,f.jsx)(c,{label:`Option B`,value:`b`})]}),(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`Standalone mode`}),(0,f.jsxs)(o,{children:[(0,f.jsx)(c,{label:`Accept terms`,isChecked:i,onCheck:a}),(0,f.jsx)(c,{label:`Subscribe`,isChecked:l,onCheck:u})]})]})]})}},D={render(){let[e,t]=(0,d.useState)([`email`]);return(0,f.jsx)(`div`,{style:{maxWidth:400},children:(0,f.jsx)(i,{children:(0,f.jsxs)(s,{label:`Notifications`,description:`Choose how to be notified`,value:e,onChange:t,children:[(0,f.jsx)(c,{value:`email`,label:`Email`,description:`Weekly digest`}),(0,f.jsx)(c,{value:`push`,label:`Push notifications`}),(0,f.jsx)(c,{value:`sms`,label:`SMS`,isDisabled:!0})]})})})}},O={render(){let[e,t]=(0,d.useState)([`admin`]);return(0,f.jsx)(`div`,{style:{maxWidth:400},children:(0,f.jsx)(i,{children:(0,f.jsxs)(s,{label:`Assign Roles`,value:e,onChange:t,hasDividers:!0,children:[(0,f.jsx)(c,{value:`admin`,label:`Admin`}),(0,f.jsx)(c,{value:`editor`,label:`Editor`}),(0,f.jsx)(c,{value:`viewer`,label:`Viewer`}),(0,f.jsx)(c,{value:`guest`,label:`Guest`})]})})})}},k={render:e=>{let[t,n]=(0,d.useState)([`email`]),{value:r,onChange:i,...a}=e;return(0,f.jsxs)(s,{...a,value:t,onChange:n,children:[(0,f.jsx)(c,{label:`Email`,value:`email`}),(0,f.jsx)(c,{label:`SMS`,value:`sms`}),(0,f.jsx)(c,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preferences`,isDisabled:!0,disabledMessage:`Notifications are managed by your administrator`}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>(args.value ?? []);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <CheckboxList {...restArgs} value={value} onChange={setValue}>
        <CheckboxListItem label="Email" value="email" />
        <CheckboxListItem label="SMS" value="sms" />
        <CheckboxListItem label="Push notification" value="push" />
      </CheckboxList>;
  },
  args: {
    label: 'Notification preferences'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>(args.value ?? []);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <CheckboxList {...restArgs} value={value} onChange={setValue}>
        <CheckboxListItem label="Email" value="email" description="Receive notifications via email" />
        <CheckboxListItem label="SMS" value="sms" description="Standard messaging rates apply" />
        <CheckboxListItem label="Push notification" value="push" description="Instant alerts on your device" />
      </CheckboxList>;
  },
  args: {
    label: 'Notification preferences',
    description: 'Choose how you would like to be notified',
    hasDividers: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => {
    const items = [{
      id: 'react',
      label: 'React'
    }, {
      id: 'vue',
      label: 'Vue'
    }, {
      id: 'angular',
      label: 'Angular'
    }, {
      id: 'svelte',
      label: 'Svelte'
    }];
    const [value, setValue] = useState<string[]>(['react']);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <CheckboxList {...restArgs} value={value} onChange={setValue}>
        {items.map(item => <CheckboxListItem key={item.id} label={item.label} value={item.id} />)}
      </CheckboxList>;
  },
  args: {
    label: 'Frameworks'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [accepted, setAccepted] = useState(false);
    const [subscribed, setSubscribed] = useState(true);
    const [marketing, setMarketing] = useState(false);
    return <List>
        <CheckboxListItem label="Accept terms and conditions" isChecked={accepted} onCheck={setAccepted} />
        <CheckboxListItem label="Subscribe to newsletter" description="Weekly updates about new features" isChecked={subscribed} onCheck={setSubscribed} />
        <CheckboxListItem label="Receive marketing emails" isChecked={marketing} onCheck={setMarketing} />
      </List>;
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <List>
      <CheckboxListItem label="Completed task" isChecked={true} />
      <CheckboxListItem label="Pending task" isChecked={false} />
      <CheckboxListItem label="In progress" isChecked="indeterminate" />
    </List>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const allItems = ['email', 'sms', 'push'];
    const [selected, setSelected] = useState<string[]>(['email']);
    const allChecked = allItems.every(item => selected.includes(item));
    const noneChecked = selected.length === 0;
    const selectAllState = allChecked ? true : noneChecked ? false : 'indeterminate' as const;
    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        setSelected([...allItems]);
      } else {
        setSelected([]);
      }
    };
    return <CheckboxList label="Notifications" hasDividers>
        <CheckboxListItem label="Select all" isChecked={selectAllState} onCheck={handleSelectAll} />
        {allItems.map(item => <CheckboxListItem key={item} label={item.charAt(0).toUpperCase() + item.slice(1)} isChecked={selected.includes(item)} onCheck={checked => {
        setSelected(prev => checked ? [...prev, item] : prev.filter(v => v !== item));
      }} />)}
      </CheckboxList>;
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>(['email']);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <CheckboxList {...restArgs} value={value} onChange={setValue}>
        <CheckboxListItem label="Email" value="email" />
        <CheckboxListItem label="SMS" value="sms" />
        <CheckboxListItem label="Push notification" value="push" />
      </CheckboxList>;
  },
  args: {
    label: 'Notification preferences',
    isDisabled: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>(['email']);
    return <CheckboxList label="Notification preferences" value={value} onChange={setValue}>
        <CheckboxListItem label="Email" value="email" />
        <CheckboxListItem label="SMS" value="sms" isLoading />
        <CheckboxListItem label="Push notification" value="push" />
      </CheckboxList>;
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>(['email']);
    // Simulates persisting the new selection to a server. While the promise
    // is pending, the toggled item shows a spinner inside its checkbox and
    // blocks re-toggling; the other items stay interactive.
    const persist = (next: string[]) => new Promise<void>(resolve => {
      setTimeout(() => {
        setValue(next);
        resolve();
      }, 1500);
    });
    return <CheckboxList label="Notification preferences" description="Toggle an option — it spins while saving" value={value} changeAction={persist} hasDividers>
        <CheckboxListItem label="Email" value="email" />
        <CheckboxListItem label="SMS" value="sms" />
        <CheckboxListItem label="Push notification" value="push" />
      </CheckboxList>;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>([]);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <CheckboxList {...restArgs} value={value} onChange={setValue}>
        <CheckboxListItem label="Email" value="email" />
        <CheckboxListItem label="SMS" value="sms" isDisabled />
        <CheckboxListItem label="Push notification" value="push" />
      </CheckboxList>;
  },
  args: {
    label: 'Notification preferences'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>([]);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <CheckboxList {...restArgs} value={value} onChange={setValue}>
        <CheckboxListItem label="Email" value="email" />
        <CheckboxListItem label="SMS" value="sms" />
        <CheckboxListItem label="Push notification" value="push" />
      </CheckboxList>;
  },
  args: {
    label: 'Notification preferences',
    status: {
      type: 'error',
      message: 'Please select at least one notification method'
    }
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>(['free']);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <CheckboxList {...restArgs} value={value} onChange={setValue}>
        <CheckboxListItem label="Free tier" value="free" description="Basic features included" endContent={<span style={{
        color: '#0D8626'
      }}>$0/mo</span>} />
        <CheckboxListItem label="Pro tier" value="pro" description="Advanced features" endContent={<span style={{
        color: '#0064E0'
      }}>$9/mo</span>} />
        <CheckboxListItem label="Enterprise" value="enterprise" description="Custom solutions" endContent={<span style={{
        color: '#5B08D8'
      }}>Custom</span>} />
      </CheckboxList>;
  },
  args: {
    label: 'Add-on packages',
    hasDividers: true
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string[]>([]);
    const [value2, setValue2] = useState<string[]>(['email']);
    const [standalone1, setStandalone1] = useState(false);
    const [standalone2, setStandalone2] = useState(true);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '400px'
    }}>
        <CheckboxList label="Unselected" value={value1} onChange={setValue1}>
          <CheckboxListItem label="Option A" value="a" />
          <CheckboxListItem label="Option B" value="b" />
        </CheckboxList>
        <CheckboxList label="Pre-selected" value={value2} onChange={setValue2}>
          <CheckboxListItem label="Email" value="email" />
          <CheckboxListItem label="SMS" value="sms" />
        </CheckboxList>
        <CheckboxList label="Disabled group" value={['a']} onChange={() => {}} isDisabled>
          <CheckboxListItem label="Option A" value="a" />
          <CheckboxListItem label="Option B" value="b" />
        </CheckboxList>
        <CheckboxList label="With descriptions" value={value1} onChange={setValue1} hasDividers>
          <CheckboxListItem label="Email" value="email" description="Delivered to your inbox" />
          <CheckboxListItem label="SMS" value="sms" description="Standard rates apply" />
        </CheckboxList>
        <CheckboxList label="With error" value={[]} onChange={() => {}} status={{
        type: 'error',
        message: 'Please select at least one option'
      }}>
          <CheckboxListItem label="Option A" value="a" />
          <CheckboxListItem label="Option B" value="b" />
        </CheckboxList>
        <div>
          <h4 style={{
          margin: '0 0 8px'
        }}>Standalone mode</h4>
          <List>
            <CheckboxListItem label="Accept terms" isChecked={standalone1} onCheck={setStandalone1} />
            <CheckboxListItem label="Subscribe" isChecked={standalone2} onCheck={setStandalone2} />
          </List>
        </div>
      </div>;
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render() {
    const [selected, setSelected] = useState<string[]>(['email']);
    return <div style={{
      maxWidth: 400
    }}>
        <Card>
          <CheckboxList label="Notifications" description="Choose how to be notified" value={selected} onChange={setSelected}>
            <CheckboxListItem value="email" label="Email" description="Weekly digest" />
            <CheckboxListItem value="push" label="Push notifications" />
            <CheckboxListItem value="sms" label="SMS" isDisabled />
          </CheckboxList>
        </Card>
      </div>;
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render() {
    const [selected, setSelected] = useState<string[]>(['admin']);
    return <div style={{
      maxWidth: 400
    }}>
        <Card>
          <CheckboxList label="Assign Roles" value={selected} onChange={setSelected} hasDividers>
            <CheckboxListItem value="admin" label="Admin" />
            <CheckboxListItem value="editor" label="Editor" />
            <CheckboxListItem value="viewer" label="Viewer" />
            <CheckboxListItem value="guest" label="Guest" />
          </CheckboxList>
        </Card>
      </div>;
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>(['email']);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <CheckboxList {...restArgs} value={value} onChange={setValue}>
        <CheckboxListItem label="Email" value="email" />
        <CheckboxListItem label="SMS" value="sms" />
        <CheckboxListItem label="Push notification" value="push" />
      </CheckboxList>;
  },
  args: {
    label: 'Notification preferences',
    isDisabled: true,
    disabledMessage: 'Notifications are managed by your administrator'
  }
}`,...k.parameters?.docs?.source}}},A=[`Default`,`WithDescriptions`,`DynamicItems`,`StandaloneMode`,`ReadOnly`,`SelectAllWithIndeterminate`,`Disabled`,`Loading`,`ChangeAction`,`DisabledItem`,`WithErrorStatus`,`WithEndContent`,`AllVariations`,`InsideCard`,`InsideCardWithDividers`,`DisabledWithMessage`]}))();export{E as AllVariations,S as ChangeAction,m as Default,b as Disabled,C as DisabledItem,k as DisabledWithMessage,g as DynamicItems,D as InsideCard,O as InsideCardWithDividers,x as Loading,v as ReadOnly,y as SelectAllWithIndeterminate,_ as StandaloneMode,h as WithDescriptions,T as WithEndContent,w as WithErrorStatus,A as __namedExportsOrder,p as default};