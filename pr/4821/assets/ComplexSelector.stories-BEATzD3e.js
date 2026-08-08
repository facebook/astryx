import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{s as i}from"./useTheme-BlfJR3l0.js";import{t as a}from"./Text-Wj0c0uo-.js";import{t as o}from"./Button-DG6DIOMV.js";import{t as s}from"./Button-CgPYqh3a.js";import{_ as c,t as l}from"./hooks-Cjg3ybz2.js";import{t as u,x as d}from"./theme-yL5VdpAK.js";import{i as f,o as p}from"./Stack-3jiL_lX6.js";import{t as m}from"./Layout-2s5RSewS.js";import{t as h}from"./Text-C0uNJT_-.js";import{n as g,t as _}from"./TextInput-cfmVdlNH.js";import{n as v,t as y}from"./Token-CeSfRScL.js";import{ni as b,nt as x,ri as S,tt as C}from"./iframe-DVyTlwWx.js";function w(e){return`${e.fruit} · ${e.ripeness}`}function T(e){return e.path}function E(e,t){return e.label.toLowerCase().includes(t)||e.path.toLowerCase().includes(t)}function D(e,t){let n=t.trim().toLowerCase(),r=[];for(let i of e){let e=i.children?D(i.children,t):void 0;!(n.length===0||E(i,n))&&(!e||e.length===0)||r.push({...i,isExpanded:n.length>0||i.children!=null,children:e})}return r}function O(e,t,n){return e.map(e=>{let r=e.children!=null&&e.children.length>0;return{id:e.id,label:e.label,description:e.path,isExpanded:r,isSelected:!r&&e.id===t,endContent:e.kind===`team`?(0,M.jsx)(v,{label:`Team`,size:`sm`,color:`blue`}):void 0,onClick:r?void 0:()=>n({id:e.id,label:e.label,path:e.path}),children:r?O(e.children??[],t,n):void 0}})}function k({value:e,onChange:t}){let{gridRef:n,handleKeyDown:r,handleFocus:i,focusCell:a}=c({columns:I.length,cellSelector:N,hasRovingTabIndex:!0});return(0,j.useEffect)(()=>{let t=F.findIndex(t=>t.id===e.fruit),n=I.findIndex(t=>t.id===e.ripeness);requestAnimationFrame(()=>{a(t>=0&&n>=0?t*I.length+n:0)})},[a,e]),(0,M.jsx)(`div`,{ref:n,role:`grid`,"aria-label":`Fruit ripeness choices`,onKeyDown:r,onFocus:i,className:`x78zum5 xdt5ytf xzye2dw`,children:F.map(n=>(0,M.jsxs)(`div`,{role:`row`,className:`xrvj5dj x48fp95 x6s0dn4 x1lfs0n9 x1wxaq2x xu0wf1k xf314gf x1hviunn xjbqb8w x1rlsyly x1pd5uwb`,children:[(0,M.jsxs)(`div`,{role:`rowheader`,className:`x78zum5 x6s0dn4 x1txdalj xeuugli`,children:[(0,M.jsx)(`span`,{"aria-hidden":`true`,className:`x3nfvp2 x6s0dn4 xl56j7k xgd8bvy x1fgtraw xjspbzw xwmxj5m x19d36u7 x2lah0s`,children:n.emoji}),(0,M.jsxs)(`span`,{className:`x78zum5 xdt5ytf xeuugli`,children:[(0,M.jsx)(`span`,{className:`x1tgivj0 xcr08ib x2mo6ok xb3r6kr xlyipyv xuxw1ft`,children:n.id}),(0,M.jsx)(`span`,{className:`xv1l7n4 x141an7d xb3r6kr xlyipyv xuxw1ft`,children:n.description})]})]}),I.map(r=>{let i={fruit:n.id,ripeness:r.id},a=e.fruit===n.id&&e.ripeness===r.id;return(0,M.jsx)(`button`,{type:`button`,role:`gridcell`,"aria-label":`${n.id}, ${r.id}: ${r.description}`,"aria-selected":a||void 0,tabIndex:a?0:-1,onClick:()=>t(i),...{0:{className:`x1litavf x1y0btm7 x14i3s5s xjspbzw x1de1mus xv1l7n4 x1rz828m xf314gf xjb2p0i x141an7d x1e4wzip x1ypdohk xal5it7 xwc86oh xuedmi6 xlr8y92 x1a2a7pz x17nn4n9 x1hl8ikr x1j9pxtw x1ww4t2b x140uwzg`},1:{className:`x1litavf x1y0btm7 xjspbzw x1rz828m xf314gf xjb2p0i x141an7d x1e4wzip x1ypdohk xwc86oh xuedmi6 xlr8y92 x1a2a7pz x17nn4n9 x1hl8ikr x1j9pxtw x1ww4t2b x140uwzg x1hc1fzr xad5do x1ewilqj x17wrial x1i5ehqx`}}[!!a<<0],children:r.shortLabel},`${n.id}-${r.id}`)})]},n.id))})}function A({label:e,value:t,tree:n,searchPlaceholder:r,onChange:i,close:o}){let[s,c]=(0,j.useState)(``),l=(0,j.useMemo)(()=>D(n,s),[s,n]),u=(0,j.useMemo)(()=>O(l,t.id,e=>{i(e),o()}),[o,l,i,t.id]);return(0,M.jsxs)(f,{gap:3,children:[(0,M.jsx)(`div`,{className:`xep27e5`,children:(0,M.jsx)(g,{label:`Search ${e}`,isLabelHidden:!0,value:s,onChange:c,hasClear:!0,placeholder:r})}),(0,M.jsx)(`div`,{className:`xq3t0pi xysyzu8 x1litavf x1y0btm7 x14i3s5s x1hviunn x9epnlk`,children:u.length>0?(0,M.jsx)(x,{items:u,density:`compact`}):(0,M.jsx)(`div`,{role:`status`,className:`x1b2ylru xv1l7n4 x2b8uid`,children:(0,M.jsx)(a,{type:`supporting`,color:`secondary`,children:`No matching destinations.`})})}),(0,M.jsx)(`div`,{className:`xj6sv8s x1vlblms x11xkdxz x13fuv20 x1pc3f07`,children:(0,M.jsxs)(p,{gap:2,wrap:`wrap`,children:[(0,M.jsx)(a,{type:`supporting`,color:`secondary`,children:`Current:`}),(0,M.jsx)(v,{label:t.path,size:`sm`,color:`blue`})]})})]})}var j,M,N,P,F,I,L,R,z,B,V,H,U,W,G;e((()=>{j=t(n()),b(),s(),h(),_(),m(),y(),C(),u(),l(),M=r(),N=`[role="gridcell"]`,P={title:`Core/ComplexSelector`,component:S,tags:[`autodocs`],parameters:{layout:`centered`,docs:{description:{component:`A high-level selector shell for rich custom content. The component owns the field, trigger, popover, focus restore, and async changeAction flow while consumers render the content. Custom content should use Astryx focus hooks where appropriate and be evaluated against WCAG 2.2.`}}}},F=[{id:`Apple`,emoji:`🍎`,description:`Bright and balanced`},{id:`Pear`,emoji:`🍐`,description:`Soft floral sweetness`},{id:`Peach`,emoji:`🍑`,description:`Round summer flavor`},{id:`Plum`,emoji:`🟣`,description:`Jammy and tart`}],I=[{id:`Crisp`,shortLabel:`C`,description:`Snappy bite`},{id:`Tender`,shortLabel:`T`,description:`Easy bite`},{id:`Juicy`,shortLabel:`J`,description:`Full juice`},{id:`Peak`,shortLabel:`P`,description:`Most intense`}],L=[{id:`workspace`,label:`Workspace`,path:`/Workspace`,kind:`space`,children:[{id:`workspace-research`,label:`Research`,path:`/Workspace/Research`,kind:`folder`,children:[{id:`workspace-research-field-notes`,label:`Field notes`,path:`/Workspace/Research/Field notes`,kind:`folder`},{id:`workspace-research-interviews`,label:`Interviews`,path:`/Workspace/Research/Interviews`,kind:`folder`}]},{id:`workspace-roadmap`,label:`Roadmap`,path:`/Workspace/Roadmap`,kind:`folder`}]},{id:`teams`,label:`Teams`,path:`/Teams`,kind:`space`,children:[{id:`teams-design-systems`,label:`Design systems`,path:`/Teams/Design systems`,kind:`team`,children:[{id:`teams-design-systems-components`,label:`Components`,path:`/Teams/Design systems/Components`,kind:`folder`},{id:`teams-design-systems-accessibility`,label:`Accessibility`,path:`/Teams/Design systems/Accessibility`,kind:`folder`}]},{id:`teams-growth`,label:`Growth`,path:`/Teams/Growth`,kind:`team`}]},{id:`archive`,label:`Archive`,path:`/Archive`,kind:`space`,children:[{id:`archive-2025`,label:`2025 projects`,path:`/Archive/2025 projects`,kind:`folder`}]}],R=[{id:`produce`,label:`Produce`,path:`Produce`,kind:`space`,children:[{id:`produce-fruit`,label:`Fruit`,path:`Produce / Fruit`,kind:`folder`,children:[{id:`produce-fruit-citrus`,label:`Citrus`,path:`Produce / Fruit / Citrus`,kind:`folder`},{id:`produce-fruit-stone`,label:`Stone fruit`,path:`Produce / Fruit / Stone fruit`,kind:`folder`}]},{id:`produce-vegetables`,label:`Vegetables`,path:`Produce / Vegetables`,kind:`folder`}]},{id:`pantry`,label:`Pantry`,path:`Pantry`,kind:`space`,children:[{id:`pantry-grains`,label:`Grains`,path:`Pantry / Grains`,kind:`folder`},{id:`pantry-snacks`,label:`Snacks`,path:`Pantry / Snacks`,kind:`folder`}]}],z={wrapper:{kzqmXN:`xj6ak53`,$$css:!0},fruitContent:{kzqmXN:`xvue9z`,kmVPX3:`xlsj2fj`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,$$css:!0},treeContent:{kzqmXN:`x3p9ev8`,kmVPX3:`x1b2ylru`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,$$css:!0}},B={name:`Fruit ripeness selector`,render:()=>{let[e,t]=(0,j.useState)({fruit:`Apple`,ripeness:`Juicy`});return(0,M.jsx)(f,{gap:4,xstyle:z.wrapper,children:(0,M.jsx)(S,{label:`Fruit blend`,description:`Choose a fruit and ripeness level in one selector. Arrow down preserves the ripeness column.`,value:e,onChange:t,triggerLabel:w(e),contentXstyle:z.fruitContent,children:(e,t,n)=>(0,M.jsxs)(`div`,{children:[(0,M.jsx)(`div`,{className:`xep27e5`,children:(0,M.jsx)(a,{type:`supporting`,color:`secondary`,children:`Pick a blend profile. The compact pills mirror a hover-rich selector while staying available to keyboard users.`})}),(0,M.jsx)(k,{value:e,onChange:e=>{t(e),n()}}),(0,M.jsx)(`div`,{className:`xj6sv8s x1vlblms x11xkdxz x13fuv20 x1pc3f07`,children:(0,M.jsxs)(p,{gap:2,wrap:`wrap`,children:[(0,M.jsx)(a,{type:`supporting`,color:`secondary`,children:`Try keyboard:`}),(0,M.jsx)(a,{type:`supporting`,children:`↓ from Apple J lands on Pear J.`})]})})]})})})},parameters:{docs:{description:{story:`A fruit-themed stand-in for a rich two-axis selector. ComplexSelector owns the trigger, popover, focus restore, and change flow; the custom content owns its grid semantics.`}}}},V={name:`Tree list with search`,render:()=>{let[e,t]=(0,j.useState)({id:`teams-design-systems-accessibility`,label:`Accessibility`,path:`/Teams/Design systems/Accessibility`});return(0,M.jsx)(f,{gap:4,xstyle:z.wrapper,children:(0,M.jsx)(S,{label:`Project destination`,description:`Search and browse nested folders from one selector.`,value:e,onChange:t,triggerLabel:T(e),contentXstyle:z.treeContent,children:(e,t,n)=>(0,M.jsx)(A,{label:`destinations`,value:e,tree:L,searchPlaceholder:`Search folders or teams`,onChange:t,close:n})})})},parameters:{docs:{description:{story:`A complex selector that combines TextInput search with TreeList hierarchy. TreeList owns tree keyboard navigation while ComplexSelector owns the trigger and popover shell. Evaluate the composed content against WCAG 2.2 keyboard, focus, name/role, label, and contrast criteria.`}}}},H={name:`Category tree selector`,render:()=>{let[e,t]=(0,j.useState)({id:`produce-fruit-citrus`,label:`Citrus`,path:`Produce / Fruit / Citrus`});return(0,M.jsxs)(f,{gap:4,xstyle:z.wrapper,children:[(0,M.jsx)(S,{label:`Product category`,description:`Search or browse a category tree.`,value:e,onChange:t,triggerLabel:e.path,contentXstyle:z.treeContent,children:(e,t,n)=>(0,M.jsx)(A,{label:`categories`,value:e,tree:R,searchPlaceholder:`Search categories`,onChange:t,close:n})}),(0,M.jsx)(o,{label:`Save category`,variant:`primary`})]})},parameters:{docs:{description:{story:`A second tree-search example showing the same ComplexSelector shell with different hierarchical data and a form action nearby. The custom content relies on TreeList focus behavior and should be checked against WCAG 2.2.`}}}},U=i({name:`complex-selector-popup-demo`,components:{"complex-selector-popup":{base:{backgroundColor:`var(--color-background-muted)`,borderWidth:`1px`,borderStyle:`solid`,borderColor:`var(--color-border)`,boxShadow:`none`}}}}),W={name:`Themed popup surface`,render:()=>{let[e,t]=(0,j.useState)({fruit:`Apple`,ripeness:`Juicy`});return(0,M.jsx)(d,{theme:U,mode:`light`,children:(0,M.jsx)(f,{gap:4,xstyle:z.wrapper,children:(0,M.jsx)(S,{label:`Fruit blend`,description:`The popup renders as a flat, bordered, muted panel through the astryx-complex-selector-popup target.`,value:e,onChange:t,triggerLabel:w(e),contentXstyle:z.fruitContent,children:(e,t,n)=>(0,M.jsx)(k,{value:e,onChange:e=>{t(e),n()}})})})})},parameters:{docs:{description:{story:`Apps whose menus are bordered flat panels can match the popup to them with defineTheme alone — no StyleX in the consuming app. The border, background, and shadow land on the element that paints the popup surface.`}}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Themed popup surface',
  render: () => {
    const [value, setValue] = useState<FruitValue>({
      fruit: 'Apple',
      ripeness: 'Juicy'
    });
    return <Theme theme={popupTheme} mode="light">
        <VStack gap={4} xstyle={styles.wrapper}>
          <ComplexSelector<FruitValue> label="Fruit blend" description="The popup renders as a flat, bordered, muted panel through the astryx-complex-selector-popup target." value={value} onChange={setValue} triggerLabel={formatFruitValue(value)} contentXstyle={styles.fruitContent}>
            {(selectedValue, onChange, close) => <FruitRipenessMatrix value={selectedValue} onChange={nextValue => {
            onChange(nextValue);
            close();
          }} />}
          </ComplexSelector>
        </VStack>
      </Theme>;
  },
  parameters: {
    docs: {
      description: {
        story: 'Apps whose menus are bordered flat panels can match the popup to them with defineTheme alone — no StyleX in the consuming app. The border, background, and shadow land on the element that paints the popup surface.'
      }
    }
  }
}`,...W.parameters?.docs?.source}}},G=[`FruitRipenessGrid`,`TreeListWithSearch`,`CategoryTreeSelector`,`ThemedPopupSurface`]}))();export{H as CategoryTreeSelector,B as FruitRipenessGrid,W as ThemedPopupSurface,V as TreeListWithSearch,G as __namedExportsOrder,P as default};