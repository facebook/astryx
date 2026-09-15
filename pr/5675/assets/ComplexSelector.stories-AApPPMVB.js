import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-IeUp72Rc.js";import{t as a}from"./Button-BDniLuhD.js";import{t as o}from"./Button-Co2OC00k.js";import{_ as s,t as c}from"./hooks-C3TzANEH.js";import{i as l,o as u}from"./Stack-B9pi7ZUb.js";import{t as d}from"./Layout-Dt4bRu5Z.js";import{t as f}from"./Text-CYeQwSrp.js";import{n as p,t as m}from"./TextInput-DQHxBmDU.js";import{n as h,t as g}from"./Token-BGkR4J3O.js";import{Xr as _,Yr as v,et as y,tt as b}from"./iframe-Badk2wXr.js";function x(e){return`${e.fruit} · ${e.ripeness}`}function S(e){return e.path}function C(e,t){return e.label.toLowerCase().includes(t)||e.path.toLowerCase().includes(t)}function w(e,t){let n=t.trim().toLowerCase(),r=[];for(let i of e){let e=i.children?w(i.children,t):void 0;!(n.length===0||C(i,n))&&(!e||e.length===0)||r.push({...i,isExpanded:n.length>0||i.children!=null,children:e})}return r}function T(e,t,n){return e.map(e=>{let r=e.children!=null&&e.children.length>0;return{id:e.id,label:e.label,description:e.path,isExpanded:r,isSelected:!r&&e.id===t,endContent:e.kind===`team`?(0,k.jsx)(h,{label:`Team`,size:`sm`,color:`blue`}):void 0,onClick:r?void 0:()=>n({id:e.id,label:e.label,path:e.path}),children:r?T(e.children??[],t,n):void 0}})}function E({value:e,onChange:t}){let{gridRef:n,handleKeyDown:r,handleFocus:i,focusCell:a}=s({columns:N.length,cellSelector:A,hasRovingTabIndex:!0});return(0,O.useEffect)(()=>{let t=M.findIndex(t=>t.id===e.fruit),n=N.findIndex(t=>t.id===e.ripeness);requestAnimationFrame(()=>{a(t>=0&&n>=0?t*N.length+n:0)})},[a,e]),(0,k.jsx)(`div`,{ref:n,role:`grid`,"aria-label":`Fruit ripeness choices`,onKeyDown:r,onFocus:i,className:`x78zum5 xdt5ytf xzye2dw`,children:M.map(n=>(0,k.jsxs)(`div`,{role:`row`,className:`xrvj5dj x48fp95 x6s0dn4 x1lfs0n9 x1wxaq2x xu0wf1k xf314gf x1hviunn xjbqb8w x1rlsyly x1pd5uwb`,children:[(0,k.jsxs)(`div`,{role:`rowheader`,className:`x78zum5 x6s0dn4 x1txdalj xeuugli`,children:[(0,k.jsx)(`span`,{"aria-hidden":`true`,className:`x3nfvp2 x6s0dn4 xl56j7k xgd8bvy x1fgtraw xjspbzw xwmxj5m x19d36u7 x2lah0s`,children:n.emoji}),(0,k.jsxs)(`span`,{className:`x78zum5 xdt5ytf xeuugli`,children:[(0,k.jsx)(`span`,{className:`x1tgivj0 xcr08ib x2mo6ok xb3r6kr xlyipyv xuxw1ft`,children:n.id}),(0,k.jsx)(`span`,{className:`xv1l7n4 x141an7d xb3r6kr xlyipyv xuxw1ft`,children:n.description})]})]}),N.map(r=>{let i={fruit:n.id,ripeness:r.id},a=e.fruit===n.id&&e.ripeness===r.id;return(0,k.jsx)(`button`,{type:`button`,role:`gridcell`,"aria-label":`${n.id}, ${r.id}: ${r.description}`,"aria-selected":a||void 0,tabIndex:a?0:-1,onClick:()=>t(i),...{0:{className:`x1litavf x1y0btm7 x14i3s5s xjspbzw x1de1mus xv1l7n4 x1rz828m xf314gf xjb2p0i x141an7d x1e4wzip x1ypdohk xal5it7 xwc86oh xuedmi6 xlr8y92 x1a2a7pz x17nn4n9 x1hl8ikr x1j9pxtw x1ww4t2b x140uwzg`},1:{className:`x1litavf x1y0btm7 xjspbzw x1rz828m xf314gf xjb2p0i x141an7d x1e4wzip x1ypdohk xwc86oh xuedmi6 xlr8y92 x1a2a7pz x17nn4n9 x1hl8ikr x1j9pxtw x1ww4t2b x140uwzg x1hc1fzr xad5do x1ewilqj x17wrial x1i5ehqx`}}[!!a<<0],children:r.shortLabel},`${n.id}-${r.id}`)})]},n.id))})}function D({label:e,value:t,tree:n,searchPlaceholder:r,onChange:a,close:o}){let[s,c]=(0,O.useState)(``),d=(0,O.useMemo)(()=>w(n,s),[s,n]),f=(0,O.useMemo)(()=>T(d,t.id,e=>{a(e),o()}),[o,d,a,t.id]);return(0,k.jsxs)(l,{gap:3,children:[(0,k.jsx)(`div`,{className:`xep27e5`,children:(0,k.jsx)(p,{label:`Search ${e}`,isLabelHidden:!0,value:s,onChange:c,hasClear:!0,placeholder:r})}),(0,k.jsx)(`div`,{className:`xq3t0pi xysyzu8 x1litavf x1y0btm7 x14i3s5s x1hviunn x9epnlk`,children:f.length>0?(0,k.jsx)(b,{items:f,density:`compact`}):(0,k.jsx)(`div`,{role:`status`,className:`x1b2ylru xv1l7n4 x2b8uid`,children:(0,k.jsx)(i,{type:`supporting`,color:`secondary`,children:`No matching destinations.`})})}),(0,k.jsx)(`div`,{className:`xj6sv8s x1vlblms x11xkdxz x13fuv20 x1pc3f07`,children:(0,k.jsxs)(u,{gap:2,wrap:`wrap`,children:[(0,k.jsx)(i,{type:`supporting`,color:`secondary`,children:`Current:`}),(0,k.jsx)(h,{label:t.path,size:`sm`,color:`blue`})]})})]})}var O,k,A,j,M,N,P,F,I,L,R,z,B,V;e((()=>{O=t(n()),v(),o(),f(),m(),d(),g(),y(),c(),k=r(),A=`[role="gridcell"]`,j={title:`Core/ComplexSelector`,component:_,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`A high-level selector shell for rich custom content. The component owns the field, trigger, popover, focus restore, and async changeAction flow while consumers render the content. Its sm, md, and lg triggers use the 28px, 32px, and 36px element-height tokens. Custom content should use Astryx focus hooks where appropriate and be evaluated against WCAG 2.2.`}}}},M=[{id:`Apple`,emoji:`🍎`,description:`Bright and balanced`},{id:`Pear`,emoji:`🍐`,description:`Soft floral sweetness`},{id:`Peach`,emoji:`🍑`,description:`Round summer flavor`},{id:`Plum`,emoji:`🟣`,description:`Jammy and tart`}],N=[{id:`Crisp`,shortLabel:`C`,description:`Snappy bite`},{id:`Tender`,shortLabel:`T`,description:`Easy bite`},{id:`Juicy`,shortLabel:`J`,description:`Full juice`},{id:`Peak`,shortLabel:`P`,description:`Most intense`}],P=[{id:`workspace`,label:`Workspace`,path:`/Workspace`,kind:`space`,children:[{id:`workspace-research`,label:`Research`,path:`/Workspace/Research`,kind:`folder`,children:[{id:`workspace-research-field-notes`,label:`Field notes`,path:`/Workspace/Research/Field notes`,kind:`folder`},{id:`workspace-research-interviews`,label:`Interviews`,path:`/Workspace/Research/Interviews`,kind:`folder`}]},{id:`workspace-roadmap`,label:`Roadmap`,path:`/Workspace/Roadmap`,kind:`folder`}]},{id:`teams`,label:`Teams`,path:`/Teams`,kind:`space`,children:[{id:`teams-design-systems`,label:`Design systems`,path:`/Teams/Design systems`,kind:`team`,children:[{id:`teams-design-systems-components`,label:`Components`,path:`/Teams/Design systems/Components`,kind:`folder`},{id:`teams-design-systems-accessibility`,label:`Accessibility`,path:`/Teams/Design systems/Accessibility`,kind:`folder`}]},{id:`teams-growth`,label:`Growth`,path:`/Teams/Growth`,kind:`team`}]},{id:`archive`,label:`Archive`,path:`/Archive`,kind:`space`,children:[{id:`archive-2025`,label:`2025 projects`,path:`/Archive/2025 projects`,kind:`folder`}]}],F=[{id:`produce`,label:`Produce`,path:`Produce`,kind:`space`,children:[{id:`produce-fruit`,label:`Fruit`,path:`Produce / Fruit`,kind:`folder`,children:[{id:`produce-fruit-citrus`,label:`Citrus`,path:`Produce / Fruit / Citrus`,kind:`folder`},{id:`produce-fruit-stone`,label:`Stone fruit`,path:`Produce / Fruit / Stone fruit`,kind:`folder`}]},{id:`produce-vegetables`,label:`Vegetables`,path:`Produce / Vegetables`,kind:`folder`}]},{id:`pantry`,label:`Pantry`,path:`Pantry`,kind:`space`,children:[{id:`pantry-grains`,label:`Grains`,path:`Pantry / Grains`,kind:`folder`},{id:`pantry-snacks`,label:`Snacks`,path:`Pantry / Snacks`,kind:`folder`}]}],I={wrapper:{kzqmXN:`xj6ak53`,$$css:!0},fruitContent:{kzqmXN:`xvue9z`,kmVPX3:`xlsj2fj`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,$$css:!0},treeContent:{kzqmXN:`x3p9ev8`,kmVPX3:`x1b2ylru`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,$$css:!0},toolbarContent:{kzqmXN:`x1dz1jew`,kmVPX3:`x1b2ylru`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,$$css:!0}},L={name:`Fruit ripeness selector`,render:()=>{let[e,t]=(0,O.useState)({fruit:`Apple`,ripeness:`Juicy`});return(0,k.jsx)(l,{gap:4,xstyle:I.wrapper,children:(0,k.jsx)(_,{label:`Fruit blend`,description:`Choose a fruit and ripeness level in one selector. Arrow down preserves the ripeness column.`,value:e,onChange:t,triggerLabel:x(e),contentXstyle:I.fruitContent,children:(e,t,n)=>(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`div`,{className:`xep27e5`,children:(0,k.jsx)(i,{type:`supporting`,color:`secondary`,children:`Pick a blend profile. The compact pills mirror a hover-rich selector while staying available to keyboard users.`})}),(0,k.jsx)(E,{value:e,onChange:e=>{t(e),n()}}),(0,k.jsx)(`div`,{className:`xj6sv8s x1vlblms x11xkdxz x13fuv20 x1pc3f07`,children:(0,k.jsxs)(u,{gap:2,wrap:`wrap`,children:[(0,k.jsx)(i,{type:`supporting`,color:`secondary`,children:`Try keyboard:`}),(0,k.jsx)(i,{type:`supporting`,children:`↓ from Apple J lands on Pear J.`})]})})]})})})},parameters:{docs:{description:{story:`A fruit-themed stand-in for a rich two-axis selector. ComplexSelector owns the trigger, popover, focus restore, and change flow; the custom content owns its grid semantics.`}}}},R={name:`Tree list with search`,render:()=>{let[e,t]=(0,O.useState)({id:`teams-design-systems-accessibility`,label:`Accessibility`,path:`/Teams/Design systems/Accessibility`});return(0,k.jsx)(l,{gap:4,xstyle:I.wrapper,children:(0,k.jsx)(_,{label:`Project destination`,description:`Search and browse nested folders from one selector.`,value:e,onChange:t,triggerLabel:S(e),contentXstyle:I.treeContent,children:(e,t,n)=>(0,k.jsx)(D,{label:`destinations`,value:e,tree:P,searchPlaceholder:`Search folders or teams`,onChange:t,close:n})})})},parameters:{docs:{description:{story:`A complex selector that combines TextInput search with TreeList hierarchy. TreeList owns tree keyboard navigation while ComplexSelector owns the trigger and popover shell. Evaluate the composed content against WCAG 2.2 keyboard, focus, name/role, label, and contrast criteria.`}}}},z={name:`Category tree selector`,render:()=>{let[e,t]=(0,O.useState)({id:`produce-fruit-citrus`,label:`Citrus`,path:`Produce / Fruit / Citrus`});return(0,k.jsxs)(l,{gap:4,xstyle:I.wrapper,children:[(0,k.jsx)(_,{label:`Product category`,description:`Search or browse a category tree.`,value:e,onChange:t,triggerLabel:e.path,contentXstyle:I.treeContent,children:(e,t,n)=>(0,k.jsx)(D,{label:`categories`,value:e,tree:F,searchPlaceholder:`Search categories`,onChange:t,close:n})}),(0,k.jsx)(a,{label:`Save category`,variant:`primary`})]})},parameters:{docs:{description:{story:`A second tree-search example showing the same ComplexSelector shell with different hierarchical data and a form action nearby. The custom content relies on TreeList focus behavior and should be checked against WCAG 2.2.`}}}},B={name:`Controlled toolbar trigger`,render:()=>{let[e,t]=(0,O.useState)(`Comfortable`),[n,r]=(0,O.useState)(!1),o=(0,O.useRef)(null);return(0,k.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x13a6bvl xzye2dw x1cvmir6 x9epnlk x1hviunn xwmxj5m`,children:[(0,k.jsx)(a,{label:`Open options externally`,variant:`ghost`,size:`sm`,onClick:()=>o.current?.toggle()}),(0,k.jsx)(_,{label:`View options`,isLabelHidden:!0,value:e,onChange:t,onOpenChange:r,triggerLabel:`Density: ${e}`,variant:`ghost`,startIcon:`viewColumns`,alignment:`end`,handleRef:o,contentXstyle:I.toolbarContent,children:(e,t,n)=>(0,k.jsxs)(l,{gap:3,children:[(0,k.jsx)(i,{type:`supporting`,color:`secondary`,children:`The selector owns visibility. An external control drives it imperatively via handleRef; choosing a density commits the value and closes the surface. onOpenChange reports every open and close, including the ones the selector performs itself.`}),(0,k.jsx)(u,{gap:2,children:[`Comfortable`,`Compact`].map(r=>(0,k.jsx)(a,{label:r,size:`sm`,variant:e===r?`primary`:`secondary`,onClick:()=>{t(r),n()}},r))})]})}),(0,k.jsx)(i,{type:`supporting`,color:`secondary`,"data-testid":`open-state`,children:n?`open`:`closed`})]})},parameters:{docs:{description:{story:`A compact toolbar composition using the ghost trigger, a leading icon, end-aligned content, and an external control that opens the selector imperatively through its handleRef. The selector still owns its own visibility, focus restoration, and light dismiss.`}}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: 'Controlled toolbar trigger',
  render: () => {
    const [density, setDensity] = useState<ViewDensity>('Comfortable');
    const [isOpen, setIsOpen] = useState(false);
    const selectorRef = useRef<ComplexSelectorHandle>(null);
    return <div {...stylex.props(styles.toolbarDemo)}>
        <Button label="Open options externally" variant="ghost" size="sm" onClick={() => selectorRef.current?.toggle()} />
        <ComplexSelector<ViewDensity> label="View options" isLabelHidden value={density} onChange={setDensity} onOpenChange={setIsOpen} triggerLabel={\`Density: \${density}\`} variant="ghost" startIcon="viewColumns" alignment="end" handleRef={selectorRef} contentXstyle={styles.toolbarContent}>
          {(selectedDensity, onChange, close) => <VStack gap={3}>
              <Text type="supporting" color="secondary">
                The selector owns visibility. An external control drives it
                imperatively via handleRef; choosing a density commits the value
                and closes the surface. onOpenChange reports every open and
                close, including the ones the selector performs itself.
              </Text>
              <HStack gap={2}>
                {(['Comfortable', 'Compact'] as const).map(option => <Button key={option} label={option} size="sm" variant={selectedDensity === option ? 'primary' : 'secondary'} onClick={() => {
              onChange(option);
              close();
            }} />)}
              </HStack>
            </VStack>}
        </ComplexSelector>
        <Text type="supporting" color="secondary" data-testid="open-state">
          {isOpen ? 'open' : 'closed'}
        </Text>
      </div>;
  },
  parameters: {
    docs: {
      description: {
        story: 'A compact toolbar composition using the ghost trigger, a leading icon, end-aligned content, and an external control that opens the selector imperatively through its handleRef. The selector still owns its own visibility, focus restoration, and light dismiss.'
      }
    }
  }
}`,...B.parameters?.docs?.source}}},V=[`FruitRipenessGrid`,`TreeListWithSearch`,`CategoryTreeSelector`,`ControlledToolbarTrigger`]}))();export{z as CategoryTreeSelector,B as ControlledToolbarTrigger,L as FruitRipenessGrid,R as TreeListWithSearch,V as __namedExportsOrder,j as default};