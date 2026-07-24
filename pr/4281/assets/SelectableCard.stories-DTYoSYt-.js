import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-Iat6xWeA.js";import{i as a,o}from"./Stack-C7dTtCDZ.js";import{t as s}from"./Layout-BvMyrLFX.js";import{t as c}from"./Text-BUJwo4gL.js";import{gn as l,hn as u}from"./iframe-CPRczjHQ.js";var d,f,p,m,h,g,_,v;e((()=>{d=t(n()),u(),c(),s(),f=r(),p={title:`Core/SelectableCard`,component:l,tags:[`autodocs`],argTypes:{variant:{control:`select`,options:[`default`,`transparent`,`muted`,`blue`,`cyan`,`gray`,`green`,`orange`,`pink`,`purple`,`red`,`teal`,`yellow`]}},parameters:{docs:{description:{component:`A card that toggles between selected and unselected states. Shows an accent border when selected. Manage selection state externally: single value for radio behavior, Set for multi-select.`}}}},m={name:`Single Select (Radio)`,render:()=>{let[e,t]=(0,d.useState)(`basic`);return(0,f.jsx)(o,{gap:3,children:[{id:`basic`,name:`Basic`,price:`$9/mo`},{id:`pro`,name:`Pro`,price:`$29/mo`},{id:`enterprise`,name:`Enterprise`,price:`$99/mo`}].map(n=>(0,f.jsx)(l,{label:n.name,isSelected:e===n.id,onChange:()=>t(n.id),width:200,children:(0,f.jsxs)(a,{gap:1,children:[(0,f.jsx)(i,{type:`body`,weight:`bold`,children:n.name}),(0,f.jsx)(i,{type:`supporting`,color:`secondary`,children:n.price})]})},n.id))})},parameters:{docs:{description:{story:`Radio-style selection: track a single selected ID in state. Clicking a card sets it as selected, deselecting the previous.`}}}},h={name:`Multi-Select (Checkbox)`,render:()=>{let[e,t]=(0,d.useState)(new Set([`react`]));return(0,f.jsx)(o,{gap:3,children:[{id:`react`,name:`React`},{id:`vue`,name:`Vue`},{id:`angular`,name:`Angular`},{id:`svelte`,name:`Svelte`}].map(n=>(0,f.jsx)(l,{label:n.name,isSelected:e.has(n.id),onChange:e=>{t(t=>{let r=new Set(t);return e?r.add(n.id):r.delete(n.id),r})},width:150,children:(0,f.jsx)(i,{type:`body`,weight:`bold`,children:n.name})},n.id))})},parameters:{docs:{description:{story:`Checkbox-style selection: track selected IDs in a Set. Multiple cards can be selected simultaneously.`}}}},g={name:`Color Variants`,render:()=>{let[e,t]=(0,d.useState)(new Set([`blue`,`purple`]));return(0,f.jsx)(o,{gap:3,wrap:`wrap`,children:[`default`,`muted`,`blue`,`cyan`,`gray`,`green`,`orange`,`pink`,`purple`,`red`,`teal`,`yellow`].map(n=>(0,f.jsx)(l,{label:n,isSelected:e.has(n),onChange:e=>{t(t=>{let r=new Set(t);return e?r.add(n):r.delete(n),r})},variant:n,width:140,children:(0,f.jsx)(i,{type:`body`,weight:`bold`,children:n})},n))})},parameters:{docs:{description:{story:`All color variants with selection. The accent border overlays the variant background.`}}}},_={render:()=>(0,f.jsxs)(o,{gap:3,children:[(0,f.jsx)(l,{label:`Enabled`,isSelected:!0,onChange:()=>{},width:200,children:(0,f.jsx)(i,{type:`body`,weight:`bold`,children:`Selected & Enabled`})}),(0,f.jsx)(l,{label:`Disabled`,isSelected:!0,onChange:()=>{},isDisabled:!0,width:200,children:(0,f.jsx)(i,{type:`body`,weight:`bold`,children:`Selected & Disabled`})}),(0,f.jsx)(l,{label:`Disabled unselected`,isSelected:!1,onChange:()=>{},isDisabled:!0,width:200,children:(0,f.jsx)(i,{type:`body`,weight:`bold`,children:`Unselected & Disabled`})})]}),parameters:{docs:{description:{story:"`isDisabled` suppresses toggle, hover, focus. Accent border remains visible on disabled+selected cards."}}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Single Select (Radio)',
  render: () => {
    const [selected, setSelected] = useState<string | null>('basic');
    const plans = [{
      id: 'basic',
      name: 'Basic',
      price: '$9/mo'
    }, {
      id: 'pro',
      name: 'Pro',
      price: '$29/mo'
    }, {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99/mo'
    }];
    return <HStack gap={3}>
        {plans.map(plan => <SelectableCard key={plan.id} label={plan.name} isSelected={selected === plan.id} onChange={() => setSelected(plan.id)} width={200}>
            <VStack gap={1}>
              <Text type="body" weight="bold">
                {plan.name}
              </Text>
              <Text type="supporting" color="secondary">
                {plan.price}
              </Text>
            </VStack>
          </SelectableCard>)}
      </HStack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Radio-style selection: track a single selected ID in state. Clicking a card sets it as selected, deselecting the previous.'
      }
    }
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Multi-Select (Checkbox)',
  render: () => {
    const [selected, setSelected] = useState(new Set(['react']));
    const filters = [{
      id: 'react',
      name: 'React'
    }, {
      id: 'vue',
      name: 'Vue'
    }, {
      id: 'angular',
      name: 'Angular'
    }, {
      id: 'svelte',
      name: 'Svelte'
    }];
    return <HStack gap={3}>
        {filters.map(f => <SelectableCard key={f.id} label={f.name} isSelected={selected.has(f.id)} onChange={isNow => {
        setSelected(prev => {
          const next = new Set(prev);
          if (isNow) {
            next.add(f.id);
          } else {
            next.delete(f.id);
          }
          return next;
        });
      }} width={150}>
            <Text type="body" weight="bold">
              {f.name}
            </Text>
          </SelectableCard>)}
      </HStack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox-style selection: track selected IDs in a Set. Multiple cards can be selected simultaneously.'
      }
    }
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Color Variants',
  render: () => {
    const [selected, setSelected] = useState(new Set(['blue', 'purple']));
    const variants = ['default', 'muted', 'blue', 'cyan', 'gray', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow'] as const;
    return <HStack gap={3} wrap="wrap">
        {variants.map(v => <SelectableCard key={v} label={v} isSelected={selected.has(v)} onChange={isNow => {
        setSelected(prev => {
          const next = new Set(prev);
          if (isNow) {
            next.add(v);
          } else {
            next.delete(v);
          }
          return next;
        });
      }} variant={v} width={140}>
            <Text type="body" weight="bold">
              {v}
            </Text>
          </SelectableCard>)}
      </HStack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'All color variants with selection. The accent border overlays the variant background.'
      }
    }
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <HStack gap={3}>
      <SelectableCard label="Enabled" isSelected={true} onChange={() => {}} width={200}>
        <Text type="body" weight="bold">
          Selected & Enabled
        </Text>
      </SelectableCard>
      <SelectableCard label="Disabled" isSelected={true} onChange={() => {}} isDisabled width={200}>
        <Text type="body" weight="bold">
          Selected & Disabled
        </Text>
      </SelectableCard>
      <SelectableCard label="Disabled unselected" isSelected={false} onChange={() => {}} isDisabled width={200}>
        <Text type="body" weight="bold">
          Unselected & Disabled
        </Text>
      </SelectableCard>
    </HStack>,
  parameters: {
    docs: {
      description: {
        story: '\`isDisabled\` suppresses toggle, hover, focus. Accent border remains visible on disabled+selected cards.'
      }
    }
  }
}`,..._.parameters?.docs?.source}}},v=[`SingleSelect`,`MultiSelect`,`ColorVariants`,`Disabled`]}))();export{g as ColorVariants,_ as Disabled,h as MultiSelect,m as SingleSelect,v as __namedExportsOrder,p as default};