import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-l1LeiZ5k.js";import{t as a}from"./Button-Cwa8qlfd.js";import{t as o}from"./Button-BnShsgqP.js";import{_ as s,t as c}from"./hooks-CgzVdeyr.js";import{i as l,o as u}from"./Stack-3jiL_lX6.js";import{t as d}from"./Layout-CDla0hsK.js";import{t as f}from"./Text-CMu3ZGCx.js";import{n as p,t as m}from"./TextInput-D8BPqr1u.js";import{n as h,t as g}from"./Token-CfWLGdE_.js";import{ni as _,nt as v,ri as y,tt as b}from"./iframe-DbZAhPhA.js";function x(e){return`${e.fruit} · ${e.ripeness}`}function S(e){return e.path}function C(e,t){return e.label.toLowerCase().includes(t)||e.path.toLowerCase().includes(t)}function w(e,t){let n=t.trim().toLowerCase(),r=[];for(let i of e){let e=i.children?w(i.children,t):void 0;!(n.length===0||C(i,n))&&(!e||e.length===0)||r.push({...i,isExpanded:n.length>0||i.children!=null,children:e})}return r}function T(e,t,n){return e.map(e=>{let r=e.children!=null&&e.children.length>0;return{id:e.id,label:e.label,description:e.path,isExpanded:r,isSelected:!r&&e.id===t,endContent:e.kind===`team`?(0,j.jsx)(h,{label:`Team`,size:`sm`,color:`blue`}):void 0,onClick:r?void 0:()=>n({id:e.id,label:e.label,path:e.path}),children:r?T(e.children??[],t,n):void 0}})}function E({value:e,onChange:t}){let{gridRef:n,handleKeyDown:r,handleFocus:i,focusCell:a}=s({columns:F.length,cellSelector:M,hasRovingTabIndex:!0});return(0,A.useEffect)(()=>{let t=P.findIndex(t=>t.id===e.fruit),n=F.findIndex(t=>t.id===e.ripeness);requestAnimationFrame(()=>{a(t>=0&&n>=0?t*F.length+n:0)})},[a,e]),(0,j.jsx)(`div`,{ref:n,role:`grid`,"aria-label":`Fruit ripeness choices`,onKeyDown:r,onFocus:i,className:`x78zum5 xdt5ytf xzye2dw`,children:P.map(n=>(0,j.jsxs)(`div`,{role:`row`,className:`xrvj5dj x48fp95 x6s0dn4 x1lfs0n9 x1wxaq2x xu0wf1k xf314gf x1hviunn xjbqb8w x1rlsyly x1pd5uwb`,children:[(0,j.jsxs)(`div`,{role:`rowheader`,className:`x78zum5 x6s0dn4 x1txdalj xeuugli`,children:[(0,j.jsx)(`span`,{"aria-hidden":`true`,className:`x3nfvp2 x6s0dn4 xl56j7k xgd8bvy x1fgtraw xjspbzw xwmxj5m x19d36u7 x2lah0s`,children:n.emoji}),(0,j.jsxs)(`span`,{className:`x78zum5 xdt5ytf xeuugli`,children:[(0,j.jsx)(`span`,{className:`x1tgivj0 xcr08ib x2mo6ok xb3r6kr xlyipyv xuxw1ft`,children:n.id}),(0,j.jsx)(`span`,{className:`xv1l7n4 x141an7d xb3r6kr xlyipyv xuxw1ft`,children:n.description})]})]}),F.map(r=>{let i={fruit:n.id,ripeness:r.id},a=e.fruit===n.id&&e.ripeness===r.id;return(0,j.jsx)(`button`,{type:`button`,role:`gridcell`,"aria-label":`${n.id}, ${r.id}: ${r.description}`,"aria-selected":a||void 0,tabIndex:a?0:-1,onClick:()=>t(i),...{0:{className:`x1litavf x1y0btm7 x14i3s5s xjspbzw x1de1mus xv1l7n4 x1rz828m xf314gf xjb2p0i x141an7d x1e4wzip x1ypdohk xal5it7 xwc86oh xuedmi6 xlr8y92 x1a2a7pz x17nn4n9 x1hl8ikr x1j9pxtw x1ww4t2b x140uwzg`},1:{className:`x1litavf x1y0btm7 xjspbzw x1rz828m xf314gf xjb2p0i x141an7d x1e4wzip x1ypdohk xwc86oh xuedmi6 xlr8y92 x1a2a7pz x17nn4n9 x1hl8ikr x1j9pxtw x1ww4t2b x140uwzg x1hc1fzr xad5do x1ewilqj x17wrial x1i5ehqx`}}[!!a<<0],children:r.shortLabel},`${n.id}-${r.id}`)})]},n.id))})}function D({label:e,value:t,tree:n,searchPlaceholder:r,onChange:a,close:o}){let[s,c]=(0,A.useState)(``),d=(0,A.useMemo)(()=>w(n,s),[s,n]),f=(0,A.useMemo)(()=>T(d,t.id,e=>{a(e),o()}),[o,d,a,t.id]);return(0,j.jsxs)(l,{gap:3,children:[(0,j.jsx)(`div`,{className:`xep27e5`,children:(0,j.jsx)(p,{label:`Search ${e}`,isLabelHidden:!0,value:s,onChange:c,hasClear:!0,placeholder:r})}),(0,j.jsx)(`div`,{className:`xq3t0pi xysyzu8 x1litavf x1y0btm7 x14i3s5s x1hviunn x9epnlk`,children:f.length>0?(0,j.jsx)(v,{items:f,density:`compact`}):(0,j.jsx)(`div`,{role:`status`,className:`x1b2ylru xv1l7n4 x2b8uid`,children:(0,j.jsx)(i,{type:`supporting`,color:`secondary`,children:`No matching destinations.`})})}),(0,j.jsx)(`div`,{className:`xj6sv8s x1vlblms x11xkdxz x13fuv20 x1pc3f07`,children:(0,j.jsxs)(u,{gap:2,wrap:`wrap`,children:[(0,j.jsx)(i,{type:`supporting`,color:`secondary`,children:`Current:`}),(0,j.jsx)(h,{label:t.path,size:`sm`,color:`blue`})]})})]})}function O({value:e,onChange:t}){return(0,j.jsx)(l,{gap:1,children:H.map(n=>(0,j.jsx)(a,{variant:e===n?`primary`:`ghost`,label:n,onClick:()=>t(n)},n))})}function k({value:e=`Focused`,...t}){let[n,r]=(0,A.useState)(e);return(0,j.jsx)(y,{label:`Mood`,value:n,onChange:r,triggerLabel:n??void 0,...t,children:(e,t,n)=>(0,j.jsx)(O,{value:e,onChange:e=>{t(e),n()}})})}var A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z;e((()=>{A=t(n()),_(),o(),f(),m(),d(),g(),b(),c(),j=r(),M=`[role="gridcell"]`,N={title:`Core/ComplexSelector`,component:y,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`A high-level selector shell for rich custom content. The component owns the field, trigger, popover, focus restore, and async changeAction flow while consumers render the content. Custom content should use Astryx focus hooks where appropriate and be evaluated against WCAG 2.2.`}}}},P=[{id:`Apple`,emoji:`🍎`,description:`Bright and balanced`},{id:`Pear`,emoji:`🍐`,description:`Soft floral sweetness`},{id:`Peach`,emoji:`🍑`,description:`Round summer flavor`},{id:`Plum`,emoji:`🟣`,description:`Jammy and tart`}],F=[{id:`Crisp`,shortLabel:`C`,description:`Snappy bite`},{id:`Tender`,shortLabel:`T`,description:`Easy bite`},{id:`Juicy`,shortLabel:`J`,description:`Full juice`},{id:`Peak`,shortLabel:`P`,description:`Most intense`}],I=[{id:`workspace`,label:`Workspace`,path:`/Workspace`,kind:`space`,children:[{id:`workspace-research`,label:`Research`,path:`/Workspace/Research`,kind:`folder`,children:[{id:`workspace-research-field-notes`,label:`Field notes`,path:`/Workspace/Research/Field notes`,kind:`folder`},{id:`workspace-research-interviews`,label:`Interviews`,path:`/Workspace/Research/Interviews`,kind:`folder`}]},{id:`workspace-roadmap`,label:`Roadmap`,path:`/Workspace/Roadmap`,kind:`folder`}]},{id:`teams`,label:`Teams`,path:`/Teams`,kind:`space`,children:[{id:`teams-design-systems`,label:`Design systems`,path:`/Teams/Design systems`,kind:`team`,children:[{id:`teams-design-systems-components`,label:`Components`,path:`/Teams/Design systems/Components`,kind:`folder`},{id:`teams-design-systems-accessibility`,label:`Accessibility`,path:`/Teams/Design systems/Accessibility`,kind:`folder`}]},{id:`teams-growth`,label:`Growth`,path:`/Teams/Growth`,kind:`team`}]},{id:`archive`,label:`Archive`,path:`/Archive`,kind:`space`,children:[{id:`archive-2025`,label:`2025 projects`,path:`/Archive/2025 projects`,kind:`folder`}]}],L=[{id:`produce`,label:`Produce`,path:`Produce`,kind:`space`,children:[{id:`produce-fruit`,label:`Fruit`,path:`Produce / Fruit`,kind:`folder`,children:[{id:`produce-fruit-citrus`,label:`Citrus`,path:`Produce / Fruit / Citrus`,kind:`folder`},{id:`produce-fruit-stone`,label:`Stone fruit`,path:`Produce / Fruit / Stone fruit`,kind:`folder`}]},{id:`produce-vegetables`,label:`Vegetables`,path:`Produce / Vegetables`,kind:`folder`}]},{id:`pantry`,label:`Pantry`,path:`Pantry`,kind:`space`,children:[{id:`pantry-grains`,label:`Grains`,path:`Pantry / Grains`,kind:`folder`},{id:`pantry-snacks`,label:`Snacks`,path:`Pantry / Snacks`,kind:`folder`}]}],R={wrapper:{kzqmXN:`xj6ak53`,$$css:!0},fruitContent:{kzqmXN:`xvue9z`,kmVPX3:`xlsj2fj`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,$$css:!0},treeContent:{kzqmXN:`x3p9ev8`,kmVPX3:`x1b2ylru`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,$$css:!0}},z={name:`Fruit ripeness selector`,render:()=>{let[e,t]=(0,A.useState)({fruit:`Apple`,ripeness:`Juicy`});return(0,j.jsx)(l,{gap:4,xstyle:R.wrapper,children:(0,j.jsx)(y,{label:`Fruit blend`,description:`Choose a fruit and ripeness level in one selector. Arrow down preserves the ripeness column.`,value:e,onChange:t,triggerLabel:x(e),contentXstyle:R.fruitContent,children:(e,t,n)=>(0,j.jsxs)(`div`,{children:[(0,j.jsx)(`div`,{className:`xep27e5`,children:(0,j.jsx)(i,{type:`supporting`,color:`secondary`,children:`Pick a blend profile. The compact pills mirror a hover-rich selector while staying available to keyboard users.`})}),(0,j.jsx)(E,{value:e,onChange:e=>{t(e),n()}}),(0,j.jsx)(`div`,{className:`xj6sv8s x1vlblms x11xkdxz x13fuv20 x1pc3f07`,children:(0,j.jsxs)(u,{gap:2,wrap:`wrap`,children:[(0,j.jsx)(i,{type:`supporting`,color:`secondary`,children:`Try keyboard:`}),(0,j.jsx)(i,{type:`supporting`,children:`↓ from Apple J lands on Pear J.`})]})})]})})})},parameters:{docs:{description:{story:`A fruit-themed stand-in for a rich two-axis selector. ComplexSelector owns the trigger, popover, focus restore, and change flow; the custom content owns its grid semantics.`}}}},B={name:`Tree list with search`,render:()=>{let[e,t]=(0,A.useState)({id:`teams-design-systems-accessibility`,label:`Accessibility`,path:`/Teams/Design systems/Accessibility`});return(0,j.jsx)(l,{gap:4,xstyle:R.wrapper,children:(0,j.jsx)(y,{label:`Project destination`,description:`Search and browse nested folders from one selector.`,value:e,onChange:t,triggerLabel:S(e),contentXstyle:R.treeContent,children:(e,t,n)=>(0,j.jsx)(D,{label:`destinations`,value:e,tree:I,searchPlaceholder:`Search folders or teams`,onChange:t,close:n})})})},parameters:{docs:{description:{story:`A complex selector that combines TextInput search with TreeList hierarchy. TreeList owns tree keyboard navigation while ComplexSelector owns the trigger and popover shell. Evaluate the composed content against WCAG 2.2 keyboard, focus, name/role, label, and contrast criteria.`}}}},V={name:`Category tree selector`,render:()=>{let[e,t]=(0,A.useState)({id:`produce-fruit-citrus`,label:`Citrus`,path:`Produce / Fruit / Citrus`});return(0,j.jsxs)(l,{gap:4,xstyle:R.wrapper,children:[(0,j.jsx)(y,{label:`Product category`,description:`Search or browse a category tree.`,value:e,onChange:t,triggerLabel:e.path,contentXstyle:R.treeContent,children:(e,t,n)=>(0,j.jsx)(D,{label:`categories`,value:e,tree:L,searchPlaceholder:`Search categories`,onChange:t,close:n})}),(0,j.jsx)(a,{label:`Save category`,variant:`primary`})]})},parameters:{docs:{description:{story:`A second tree-search example showing the same ComplexSelector shell with different hierarchical data and a form action nearby. The custom content relies on TreeList focus behavior and should be checked against WCAG 2.2.`}}}},H=[`Focused`,`Playful`,`Calm`],U={name:`Size variants`,render:()=>(0,j.jsxs)(l,{gap:4,xstyle:R.wrapper,children:[(0,j.jsx)(k,{size:`sm`,label:`Small`}),(0,j.jsx)(k,{size:`md`,label:`Medium`}),(0,j.jsx)(k,{size:`lg`,label:`Large`})]}),parameters:{docs:{description:{story:`The trigger honors the shared input size scale. Inside a SizeContext container the size cascades like every other input.`}}}},W={name:`With status`,render:()=>(0,j.jsxs)(l,{gap:4,xstyle:R.wrapper,children:[(0,j.jsx)(k,{label:`Error`,status:{type:`error`,message:`A mood is required.`}}),(0,j.jsx)(k,{label:`Warning`,status:{type:`warning`,message:`This mood may clash with the room.`}}),(0,j.jsx)(k,{label:`Success`,status:{type:`success`,message:`Great pick.`}})]}),parameters:{docs:{description:{story:`Status colors the trigger border with the shared input status treatment and swaps the chevron for a status icon, matching Selector and MultiSelector.`}}}},G={name:`Status variant comparison`,render:()=>(0,j.jsxs)(l,{gap:4,xstyle:R.wrapper,children:[(0,j.jsx)(k,{label:`Attached`,status:{type:`error`,message:`Attached below the input.`},statusVariant:`attached`}),(0,j.jsx)(k,{label:`Detached`,status:{type:`error`,message:`Detached with a gap.`},statusVariant:`detached`}),(0,j.jsx)(k,{label:`Tooltip`,status:{type:`error`,message:`Shown in a tooltip.`},statusVariant:`tooltip`})]}),parameters:{docs:{description:{story:`The three status message placements. The tooltip variant renders the status icon as a focusable button that reveals the message.`}}}},K={name:`Disabled`,render:()=>(0,j.jsxs)(l,{gap:4,xstyle:R.wrapper,children:[(0,j.jsx)(k,{label:`Disabled`,isDisabled:!0}),(0,j.jsx)(k,{label:`Disabled with status`,isDisabled:!0,status:{type:`error`,message:`Still shown while disabled.`}})]}),parameters:{docs:{description:{story:`Disabled mutes the trigger and blocks opening. A status border still shows so validation context is not lost.`}}}},q={name:`Loading`,render:()=>(0,j.jsx)(l,{gap:4,xstyle:R.wrapper,children:(0,j.jsx)(k,{label:`Loading`,isLoading:!0})}),parameters:{docs:{description:{story:`isLoading shows a spinner beside the trigger text and sets aria-busy. Opening stays available, matching sibling selectors.`}}}},J={name:`Placeholder (empty)`,render:()=>(0,j.jsx)(l,{gap:4,xstyle:R.wrapper,children:(0,j.jsx)(k,{label:`No value yet`,value:null})}),parameters:{docs:{description:{story:`With no triggerLabel the localized placeholder renders in secondary text, and screen readers announce it as the current value.`}}}},Y={name:`Long trigger text`,render:()=>{let[e,t]=(0,A.useState)(`A very long selection label that cannot possibly fit in the closed trigger and must truncate`);return(0,j.jsx)(l,{gap:4,xstyle:R.wrapper,children:(0,j.jsx)(y,{label:`Overflow`,value:e,onChange:t,triggerLabel:e,children:(e,t,n)=>(0,j.jsx)(a,{label:`Pick the long option again`,onClick:()=>{t(`A very long selection label that cannot possibly fit in the closed trigger and must truncate`),n()}})})})},parameters:{docs:{description:{story:`Long trigger content truncates with an ellipsis instead of breaking the field layout.`}}}},X={name:`Form composition`,render:()=>{let[e,t]=(0,A.useState)(``);return(0,j.jsxs)(l,{gap:4,xstyle:R.wrapper,children:[(0,j.jsx)(p,{label:`Room name`,placeholder:`e.g. Library`,value:e,onChange:t}),(0,j.jsx)(k,{label:`Room mood`,description:`Sets the default lighting scene.`,isRequired:!0}),(0,j.jsxs)(u,{gap:2,children:[(0,j.jsx)(a,{label:`Save`,variant:`primary`}),(0,j.jsx)(a,{label:`Cancel`,variant:`secondary`})]})]})},parameters:{docs:{description:{story:`ComplexSelector aligned with sibling inputs in a form: shared label, description, required marker, and width behavior.`}}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: 'Fruit ripeness selector',
  render: () => {
    const [value, setValue] = useState<FruitValue>({
      fruit: 'Apple',
      ripeness: 'Juicy'
    });
    return <VStack gap={4} xstyle={styles.wrapper}>
        <ComplexSelector<FruitValue> label="Fruit blend" description="Choose a fruit and ripeness level in one selector. Arrow down preserves the ripeness column." value={value} onChange={setValue} triggerLabel={formatFruitValue(value)} contentXstyle={styles.fruitContent}>
          {(selectedValue, onChange, close) => <div>
              <div {...stylex.props(styles.intro)}>
                <Text type="supporting" color="secondary">
                  Pick a blend profile. The compact pills mirror a hover-rich
                  selector while staying available to keyboard users.
                </Text>
              </div>

              <FruitRipenessMatrix value={selectedValue} onChange={nextValue => {
            onChange(nextValue);
            close();
          }} />

              <div {...stylex.props(styles.keyboardHint)}>
                <HStack gap={2} wrap="wrap">
                  <Text type="supporting" color="secondary">
                    Try keyboard:
                  </Text>
                  <Text type="supporting">↓ from Apple J lands on Pear J.</Text>
                </HStack>
              </div>
            </div>}
        </ComplexSelector>
      </VStack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'A fruit-themed stand-in for a rich two-axis selector. ComplexSelector owns the trigger, popover, focus restore, and change flow; the custom content owns its grid semantics.'
      }
    }
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: 'Tree list with search',
  render: () => {
    const [value, setValue] = useState<DestinationValue>({
      id: 'teams-design-systems-accessibility',
      label: 'Accessibility',
      path: '/Teams/Design systems/Accessibility'
    });
    return <VStack gap={4} xstyle={styles.wrapper}>
        <ComplexSelector<DestinationValue> label="Project destination" description="Search and browse nested folders from one selector." value={value} onChange={setValue} triggerLabel={formatDestinationValue(value)} contentXstyle={styles.treeContent}>
          {(selectedValue, onChange, close) => <TreeSearchContent label="destinations" value={selectedValue} tree={destinationTree} searchPlaceholder="Search folders or teams" onChange={onChange} close={close} />}
        </ComplexSelector>
      </VStack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'A complex selector that combines TextInput search with TreeList hierarchy. TreeList owns tree keyboard navigation while ComplexSelector owns the trigger and popover shell. Evaluate the composed content against WCAG 2.2 keyboard, focus, name/role, label, and contrast criteria.'
      }
    }
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: 'Category tree selector',
  render: () => {
    const [value, setValue] = useState<DestinationValue>({
      id: 'produce-fruit-citrus',
      label: 'Citrus',
      path: 'Produce / Fruit / Citrus'
    });
    return <VStack gap={4} xstyle={styles.wrapper}>
        <ComplexSelector<DestinationValue> label="Product category" description="Search or browse a category tree." value={value} onChange={setValue} triggerLabel={value.path} contentXstyle={styles.treeContent}>
          {(selectedValue, onChange, close) => <TreeSearchContent label="categories" value={selectedValue} tree={categoryTree} searchPlaceholder="Search categories" onChange={onChange} close={close} />}
        </ComplexSelector>
        <Button label="Save category" variant="primary" />
      </VStack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'A second tree-search example showing the same ComplexSelector shell with different hierarchical data and a form action nearby. The custom content relies on TreeList focus behavior and should be checked against WCAG 2.2.'
      }
    }
  }
}`,...V.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  name: 'Size variants',
  render: () => <VStack gap={4} xstyle={styles.wrapper}>
      <MoodSelector size="sm" label="Small" />
      <MoodSelector size="md" label="Medium" />
      <MoodSelector size="lg" label="Large" />
    </VStack>,
  parameters: {
    docs: {
      description: {
        story: 'The trigger honors the shared input size scale. Inside a SizeContext container the size cascades like every other input.'
      }
    }
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'With status',
  render: () => <VStack gap={4} xstyle={styles.wrapper}>
      <MoodSelector label="Error" status={{
      type: 'error',
      message: 'A mood is required.'
    }} />
      <MoodSelector label="Warning" status={{
      type: 'warning',
      message: 'This mood may clash with the room.'
    }} />
      <MoodSelector label="Success" status={{
      type: 'success',
      message: 'Great pick.'
    }} />
    </VStack>,
  parameters: {
    docs: {
      description: {
        story: 'Status colors the trigger border with the shared input status treatment and swaps the chevron for a status icon, matching Selector and MultiSelector.'
      }
    }
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Status variant comparison',
  render: () => <VStack gap={4} xstyle={styles.wrapper}>
      <MoodSelector label="Attached" status={{
      type: 'error',
      message: 'Attached below the input.'
    }} statusVariant="attached" />
      <MoodSelector label="Detached" status={{
      type: 'error',
      message: 'Detached with a gap.'
    }} statusVariant="detached" />
      <MoodSelector label="Tooltip" status={{
      type: 'error',
      message: 'Shown in a tooltip.'
    }} statusVariant="tooltip" />
    </VStack>,
  parameters: {
    docs: {
      description: {
        story: 'The three status message placements. The tooltip variant renders the status icon as a focusable button that reveals the message.'
      }
    }
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'Disabled',
  render: () => <VStack gap={4} xstyle={styles.wrapper}>
      <MoodSelector label="Disabled" isDisabled />
      <MoodSelector label="Disabled with status" isDisabled status={{
      type: 'error',
      message: 'Still shown while disabled.'
    }} />
    </VStack>,
  parameters: {
    docs: {
      description: {
        story: 'Disabled mutes the trigger and blocks opening. A status border still shows so validation context is not lost.'
      }
    }
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'Loading',
  render: () => <VStack gap={4} xstyle={styles.wrapper}>
      <MoodSelector label="Loading" isLoading />
    </VStack>,
  parameters: {
    docs: {
      description: {
        story: 'isLoading shows a spinner beside the trigger text and sets aria-busy. Opening stays available, matching sibling selectors.'
      }
    }
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'Placeholder (empty)',
  render: () => <VStack gap={4} xstyle={styles.wrapper}>
      <MoodSelector label="No value yet" value={null} />
    </VStack>,
  parameters: {
    docs: {
      description: {
        story: 'With no triggerLabel the localized placeholder renders in secondary text, and screen readers announce it as the current value.'
      }
    }
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'Long trigger text',
  render: () => {
    const [value, setValue] = useState('A very long selection label that cannot possibly fit in the closed trigger and must truncate');
    return <VStack gap={4} xstyle={styles.wrapper}>
        <ComplexSelector<string> label="Overflow" value={value} onChange={setValue} triggerLabel={value}>
          {(_selectedValue, onChange, close) => <Button label="Pick the long option again" onClick={() => {
          onChange('A very long selection label that cannot possibly fit in the closed trigger and must truncate');
          close();
        }} />}
        </ComplexSelector>
      </VStack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Long trigger content truncates with an ellipsis instead of breaking the field layout.'
      }
    }
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'Form composition',
  render: () => {
    const [roomName, setRoomName] = useState('');
    return <VStack gap={4} xstyle={styles.wrapper}>
        <TextInput label="Room name" placeholder="e.g. Library" value={roomName} onChange={setRoomName} />
        <MoodSelector label="Room mood" description="Sets the default lighting scene." isRequired />
        <HStack gap={2}>
          <Button label="Save" variant="primary" />
          <Button label="Cancel" variant="secondary" />
        </HStack>
      </VStack>;
  },
  parameters: {
    docs: {
      description: {
        story: 'ComplexSelector aligned with sibling inputs in a form: shared label, description, required marker, and width behavior.'
      }
    }
  }
}`,...X.parameters?.docs?.source}}},Z=[`FruitRipenessGrid`,`TreeListWithSearch`,`CategoryTreeSelector`,`SizeVariants`,`WithStatus`,`StatusVariantComparison`,`Disabled`,`Loading`,`Placeholder`,`LongTriggerText`,`FormComposition`]}))();export{V as CategoryTreeSelector,K as Disabled,X as FormComposition,z as FruitRipenessGrid,q as Loading,Y as LongTriggerText,J as Placeholder,U as SizeVariants,G as StatusVariantComparison,B as TreeListWithSearch,W as WithStatus,Z as __namedExportsOrder,N as default};