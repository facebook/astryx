import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Card-D5cVf6xt.js";import{t as a}from"./Card-BJMAQDhX.js";import{i as o,t as s}from"./List-D2Nav2Dv.js";import{r as c,t as l}from"./CheckboxListItem-BjjYfcUj.js";import{i as u,t as d}from"./Link-Bn-dake_.js";import{_r as f}from"./iframe-DNCS4DHo.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;e((()=>{p=t(n()),f(),s(),a(),d(),m=r(),h={title:`Core/CheckboxList`,component:c,tags:[`autodocs`],argTypes:{label:{control:`text`,description:`Label text (required)`},isLabelHidden:{control:`boolean`,description:`Visually hide the label (still accessible to screen readers)`},description:{control:`text`,description:`Description text displayed below the label`},density:{control:`select`,options:[`compact`,`balanced`,`spacious`],description:`Spacing density for list items`},hasDividers:{control:`boolean`,description:`Whether to show dividers between items`},isDisabled:{control:`boolean`,description:`Whether all checkbox items are disabled`},disabledMessage:{control:`text`,description:`Explains why the group is disabled (whole-group state, not per item). With isDisabled, shows a tooltip on hover/keyboard focus and keeps the checkboxes focusable via aria-disabled (toggling stays blocked). Use this instead of wrapping a disabled CheckboxList in Tooltip.`}}},g={render:e=>{let[t,n]=(0,p.useState)(e.value??[]),{value:r,onChange:i,...a}=e;return(0,m.jsxs)(c,{...a,value:t,onChange:n,children:[(0,m.jsx)(l,{label:`Email`,value:`email`}),(0,m.jsx)(l,{label:`SMS`,value:`sms`}),(0,m.jsx)(l,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preferences`}},_={render:e=>{let[t,n]=(0,p.useState)(e.value??[]),{value:r,onChange:i,...a}=e;return(0,m.jsxs)(c,{...a,value:t,onChange:n,children:[(0,m.jsx)(l,{label:`Email`,value:`email`,description:`Receive notifications via email`}),(0,m.jsx)(l,{label:`SMS`,value:`sms`,description:`Standard messaging rates apply`}),(0,m.jsx)(l,{label:`Push notification`,value:`push`,description:`Instant alerts on your device`})]})},args:{label:`Notification preferences`,description:`Choose how you would like to be notified`,hasDividers:!0}},v={render:e=>{let[t,n]=(0,p.useState)(e.value??[`analytics`]),{value:r,onChange:i,...a}=e;return(0,m.jsxs)(c,{...a,value:t,onChange:n,children:[(0,m.jsx)(l,{label:(0,m.jsxs)(m.Fragment,{children:[`Analytics `,(0,m.jsx)(u,{href:`#analytics-details`,children:`details`})]}),"aria-label":`Analytics`,value:`analytics`,description:(0,m.jsxs)(m.Fragment,{children:[`Usage data only. `,(0,m.jsx)(u,{href:`#privacy`,children:`Read the policy`})]}),endContent:(0,m.jsx)(`span`,{"data-testid":`checkbox-end-content`,children:`$0/mo`})}),(0,m.jsx)(l,{label:`Personalization`,value:`personalization`,description:(0,m.jsxs)(m.Fragment,{children:[`Tailors what you see. `,(0,m.jsx)(u,{href:`#privacy`,children:`Learn more`})]})})]})},args:{label:`Data sharing`,description:`Labels and descriptions can carry links and other rich content without toggling the item.`}},y={render:e=>{let t=[{id:`react`,label:`React`},{id:`vue`,label:`Vue`},{id:`angular`,label:`Angular`},{id:`svelte`,label:`Svelte`}],[n,r]=(0,p.useState)([`react`]),{value:i,onChange:a,...o}=e;return(0,m.jsx)(c,{...o,value:n,onChange:r,children:t.map(e=>(0,m.jsx)(l,{label:e.label,value:e.id},e.id))})},args:{label:`Frameworks`}},b={render:()=>{let[e,t]=(0,p.useState)(!1),[n,r]=(0,p.useState)(!0),[i,a]=(0,p.useState)(!1);return(0,m.jsxs)(o,{children:[(0,m.jsx)(l,{label:`Accept terms and conditions`,isChecked:e,onCheck:t}),(0,m.jsx)(l,{label:`Subscribe to newsletter`,description:`Weekly updates about new features`,isChecked:n,onCheck:r}),(0,m.jsx)(l,{label:`Receive marketing emails`,isChecked:i,onCheck:a})]})}},x={render:()=>(0,m.jsxs)(o,{children:[(0,m.jsx)(l,{label:`Completed task`,isChecked:!0}),(0,m.jsx)(l,{label:`Pending task`,isChecked:!1}),(0,m.jsx)(l,{label:`In progress`,isChecked:`indeterminate`})]})},S={render:()=>{let e=[`email`,`sms`,`push`],[t,n]=(0,p.useState)([`email`]),r=e.every(e=>t.includes(e)),i=t.length===0,a=r?!0:i?!1:`indeterminate`;return(0,m.jsxs)(c,{label:`Notifications`,hasDividers:!0,children:[(0,m.jsx)(l,{label:`Select all`,isChecked:a,onCheck:t=>{n(t?[...e]:[])}}),e.map(e=>(0,m.jsx)(l,{label:e.charAt(0).toUpperCase()+e.slice(1),isChecked:t.includes(e),onCheck:t=>{n(n=>t?[...n,e]:n.filter(t=>t!==e))}},e))]})}},C={render:e=>{let[t,n]=(0,p.useState)([`email`]),{value:r,onChange:i,...a}=e;return(0,m.jsxs)(c,{...a,value:t,onChange:n,children:[(0,m.jsx)(l,{label:`Email`,value:`email`}),(0,m.jsx)(l,{label:`SMS`,value:`sms`}),(0,m.jsx)(l,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preferences`,isDisabled:!0}},w={render:()=>{let[e,t]=(0,p.useState)([`email`]);return(0,m.jsxs)(c,{label:`Notification preferences`,value:e,onChange:t,children:[(0,m.jsx)(l,{label:`Email`,value:`email`}),(0,m.jsx)(l,{label:`SMS`,value:`sms`,isLoading:!0}),(0,m.jsx)(l,{label:`Push notification`,value:`push`})]})}},T={render:()=>{let[e,t]=(0,p.useState)([`email`]);return(0,m.jsxs)(c,{label:`Notification preferences`,description:`Toggle an option — it spins while saving`,value:e,changeAction:e=>new Promise(n=>{setTimeout(()=>{t(e),n()},1500)}),hasDividers:!0,children:[(0,m.jsx)(l,{label:`Email`,value:`email`}),(0,m.jsx)(l,{label:`SMS`,value:`sms`}),(0,m.jsx)(l,{label:`Push notification`,value:`push`})]})}},E={render:e=>{let[t,n]=(0,p.useState)([]),{value:r,onChange:i,...a}=e;return(0,m.jsxs)(c,{...a,value:t,onChange:n,children:[(0,m.jsx)(l,{label:`Email`,value:`email`}),(0,m.jsx)(l,{label:`SMS`,value:`sms`,isDisabled:!0}),(0,m.jsx)(l,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preferences`}},D={render:e=>{let[t,n]=(0,p.useState)([]),{value:r,onChange:i,...a}=e;return(0,m.jsxs)(c,{...a,value:t,onChange:n,children:[(0,m.jsx)(l,{label:`Email`,value:`email`}),(0,m.jsx)(l,{label:`SMS`,value:`sms`}),(0,m.jsx)(l,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preferences`,status:{type:`error`,message:`Please select at least one notification method`}}},O={render:e=>{let[t,n]=(0,p.useState)([`free`]),{value:r,onChange:i,...a}=e;return(0,m.jsxs)(c,{...a,value:t,onChange:n,children:[(0,m.jsx)(l,{label:`Free tier`,value:`free`,description:`Basic features included`,endContent:(0,m.jsx)(`span`,{style:{color:`#0D8626`},children:`$0/mo`})}),(0,m.jsx)(l,{label:`Pro tier`,value:`pro`,description:`Advanced features`,endContent:(0,m.jsx)(`span`,{style:{color:`#0064E0`},children:`$9/mo`})}),(0,m.jsx)(l,{label:`Enterprise`,value:`enterprise`,description:`Custom solutions`,endContent:(0,m.jsx)(`span`,{style:{color:`#5B08D8`},children:`Custom`})})]})},args:{label:`Add-on packages`,hasDividers:!0}},k={render:()=>{let[e,t]=(0,p.useState)([]),[n,r]=(0,p.useState)([`email`]),[i,a]=(0,p.useState)(!1),[s,u]=(0,p.useState)(!0);return(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`400px`},children:[(0,m.jsxs)(c,{label:`Unselected`,value:e,onChange:t,children:[(0,m.jsx)(l,{label:`Option A`,value:`a`}),(0,m.jsx)(l,{label:`Option B`,value:`b`})]}),(0,m.jsxs)(c,{label:`Pre-selected`,value:n,onChange:r,children:[(0,m.jsx)(l,{label:`Email`,value:`email`}),(0,m.jsx)(l,{label:`SMS`,value:`sms`})]}),(0,m.jsxs)(c,{label:`Disabled group`,value:[`a`],onChange:()=>{},isDisabled:!0,children:[(0,m.jsx)(l,{label:`Option A`,value:`a`}),(0,m.jsx)(l,{label:`Option B`,value:`b`})]}),(0,m.jsxs)(c,{label:`With descriptions`,value:e,onChange:t,hasDividers:!0,children:[(0,m.jsx)(l,{label:`Email`,value:`email`,description:`Delivered to your inbox`}),(0,m.jsx)(l,{label:`SMS`,value:`sms`,description:`Standard rates apply`})]}),(0,m.jsxs)(c,{label:`With error`,value:[],onChange:()=>{},status:{type:`error`,message:`Please select at least one option`},children:[(0,m.jsx)(l,{label:`Option A`,value:`a`}),(0,m.jsx)(l,{label:`Option B`,value:`b`})]}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`Standalone mode`}),(0,m.jsxs)(o,{children:[(0,m.jsx)(l,{label:`Accept terms`,isChecked:i,onCheck:a}),(0,m.jsx)(l,{label:`Subscribe`,isChecked:s,onCheck:u})]})]})]})}},A={render(){let[e,t]=(0,p.useState)([`email`]);return(0,m.jsx)(`div`,{style:{maxWidth:400},children:(0,m.jsx)(i,{children:(0,m.jsxs)(c,{label:`Notifications`,description:`Choose how to be notified`,value:e,onChange:t,children:[(0,m.jsx)(l,{value:`email`,label:`Email`,description:`Weekly digest`}),(0,m.jsx)(l,{value:`push`,label:`Push notifications`}),(0,m.jsx)(l,{value:`sms`,label:`SMS`,isDisabled:!0})]})})})}},j={render(){let[e,t]=(0,p.useState)([`admin`]);return(0,m.jsx)(`div`,{style:{maxWidth:400},children:(0,m.jsx)(i,{children:(0,m.jsxs)(c,{label:`Assign Roles`,value:e,onChange:t,hasDividers:!0,children:[(0,m.jsx)(l,{value:`admin`,label:`Admin`}),(0,m.jsx)(l,{value:`editor`,label:`Editor`}),(0,m.jsx)(l,{value:`viewer`,label:`Viewer`}),(0,m.jsx)(l,{value:`guest`,label:`Guest`})]})})})}},M={render:e=>{let[t,n]=(0,p.useState)([`email`]),{value:r,onChange:i,...a}=e;return(0,m.jsxs)(c,{...a,value:t,onChange:n,children:[(0,m.jsx)(l,{label:`Email`,value:`email`}),(0,m.jsx)(l,{label:`SMS`,value:`sms`}),(0,m.jsx)(l,{label:`Push notification`,value:`push`})]})},args:{label:`Notification preferences`,isDisabled:!0,disabledMessage:`Notifications are managed by your administrator`}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [value, setValue] = useState<string[]>(args.value ?? ['analytics']);
    const {
      value: _value,
      onChange: _onChange,
      ...restArgs
    } = args;
    return <CheckboxList {...restArgs} value={value} onChange={setValue}>
        <CheckboxListItem label={<>
              Analytics <Link href="#analytics-details">details</Link>
            </>} aria-label="Analytics" value="analytics" description={<>
              Usage data only. <Link href="#privacy">Read the policy</Link>
            </>} endContent={<span data-testid="checkbox-end-content">$0/mo</span>} />
        <CheckboxListItem label="Personalization" value="personalization" description={<>
              Tailors what you see. <Link href="#privacy">Learn more</Link>
            </>} />
      </CheckboxList>;
  },
  args: {
    label: 'Data sharing',
    description: 'Labels and descriptions can carry links and other rich content without toggling the item.'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <List>
      <CheckboxListItem label="Completed task" isChecked={true} />
      <CheckboxListItem label="Pending task" isChecked={false} />
      <CheckboxListItem label="In progress" isChecked="indeterminate" />
    </List>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>(['email']);
    return <CheckboxList label="Notification preferences" value={value} onChange={setValue}>
        <CheckboxListItem label="Email" value="email" />
        <CheckboxListItem label="SMS" value="sms" isLoading />
        <CheckboxListItem label="Push notification" value="push" />
      </CheckboxList>;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N=[`Default`,`WithDescriptions`,`RichDescriptions`,`DynamicItems`,`StandaloneMode`,`ReadOnly`,`SelectAllWithIndeterminate`,`Disabled`,`Loading`,`ChangeAction`,`DisabledItem`,`WithErrorStatus`,`WithEndContent`,`AllVariations`,`InsideCard`,`InsideCardWithDividers`,`DisabledWithMessage`]}))();export{k as AllVariations,T as ChangeAction,g as Default,C as Disabled,E as DisabledItem,M as DisabledWithMessage,y as DynamicItems,A as InsideCard,j as InsideCardWithDividers,w as Loading,x as ReadOnly,v as RichDescriptions,S as SelectAllWithIndeterminate,b as StandaloneMode,_ as WithDescriptions,O as WithEndContent,D as WithErrorStatus,N as __namedExportsOrder,h as default};