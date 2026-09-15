import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./BaseTypeahead-C06WnM3u.js";import{i as a,t as o}from"./Typeahead-BmGxhl3z.js";function s({label:e=`Framework`,source:t=m,isNarrow:n=!1,inputId:r,ariaLabelledBy:a,...o}){let[s,u]=(0,c.useState)(null),d=(0,c.useRef)(null),f=`base-typeahead-${(0,c.useId)().replaceAll(`:`,``)}`,p=r??f,h=`${p}-label`;return(0,l.jsxs)(`div`,{className:`x78zum5 xdt5ytf xzye2dw`,children:[(0,l.jsx)(`label`,{id:h,htmlFor:p,className:`x1tgivj0 x9ynric xcr08ib x1e4wzip`,children:e}),(0,l.jsx)(`div`,{ref:d,"data-base-typeahead-anchor":`true`,...{0:{className:`x6s0dn4 x10xzikg xvy26l8 xh6dtrn x1y0btm7 x1litavf x78zum5 x1uogy3y xf314gf x1uczgqu x6bitvs x1eqjuhu xaatb59 x1k57tk5 x1wtjzjv x1fjzz8u`},1:{className:`x6s0dn4 x10xzikg xvy26l8 xh6dtrn x1y0btm7 x1litavf x78zum5 x1uogy3y xf314gf x1uczgqu x6bitvs x1eqjuhu xaatb59 x1k57tk5 x1wtjzjv x193iq5w x1e67fm3`}}[!!n<<0],children:(0,l.jsx)(i,{...o,inputId:p,ariaLabelledBy:a??h,anchorRef:d,searchSource:t,value:s,onChange:u})})]})}var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;e((()=>{c=t(n()),o(),l=r(),{expect:u,userEvent:d,waitFor:f,within:p}=__STORYBOOK_MODULE_TEST__,m=a([{id:`react`,label:`React`,auxiliaryData:{group:`Libraries`}},{id:`vue`,label:`Vue`,auxiliaryData:{group:`Libraries`}},{id:`angular`,label:`Angular`,auxiliaryData:{group:`Frameworks`}},{id:`svelte`,label:`Svelte`,auxiliaryData:{group:`Frameworks`}},{id:`long`,label:`A deliberately long framework result that must stay inside the menu`,auxiliaryData:{group:`Frameworks`}}]),h=a([]),g={search:()=>new Promise(()=>{}),bootstrap:()=>new Promise(()=>{})},_={title:`Core/BaseTypeahead`,component:s,tags:[`autodocs`],parameters:{layout:`centered`}},v={render:()=>(0,l.jsx)(s,{placeholder:`Search frameworks…`})},y={render:()=>(0,l.jsx)(s,{hasEntriesOnFocus:!0,isNarrow:!0,menuWidth:320,placeholder:`Focus to open results…`}),play:async({canvasElement:e})=>{let t=p(e).getByRole(`combobox`);await d.click(t),await f(()=>u(t).toHaveAttribute(`aria-expanded`,`true`))}},b={render:()=>(0,l.jsx)(s,{source:g,debounceMs:0,placeholder:`Type to start a pending search…`}),play:async({canvasElement:e})=>{let t=p(e).getByRole(`combobox`);await d.type(t,`re`),await f(()=>u(t).toHaveAttribute(`aria-busy`,`true`))}},x={render:()=>(0,l.jsx)(s,{source:h,debounceMs:0,emptySearchResultsText:`No matching frameworks`}),play:async({canvasElement:e})=>{let t=p(e).getByRole(`combobox`);await d.type(t,`none`),await f(()=>u(t).toHaveAttribute(`aria-expanded`,`true`))}},S={render:()=>(0,l.jsx)(s,{hasEntriesOnFocus:!0,renderItem:e=>(0,l.jsxs)(`span`,{className:`x78zum5 xdt5ytf xeuugli`,children:[(0,l.jsx)(`span`,{className:`x1tgivj0 xk50ysn`,children:e.label}),(0,l.jsx)(`span`,{className:`xv1l7n4 x141an7d`,children:e.auxiliaryData?.group})]})}),play:async({canvasElement:e})=>{let t=p(e).getByRole(`combobox`);await d.click(t),await f(()=>u(t).toHaveAttribute(`aria-expanded`,`true`))}},C={render:()=>(0,l.jsxs)(`div`,{className:`x78zum5 xdt5ytf x9mgr7n x6ymgno`,children:[(0,l.jsx)(s,{label:`Native disabled`,isDisabled:!0}),(0,l.jsx)(s,{label:`Focusable disabled`,isDisabled:!0,isFocusableDisabled:!0})]})},w={render:()=>(0,l.jsxs)(`div`,{className:`x78zum5 xdt5ytf x9mgr7n x6ymgno`,children:[(0,l.jsx)(s,{label:`Small`,size:`sm`,hasEntriesOnFocus:!0}),(0,l.jsx)(s,{label:`Medium`,size:`md`,hasEntriesOnFocus:!0}),(0,l.jsx)(s,{label:`Large`,size:`lg`,hasEntriesOnFocus:!0})]})},T={render:()=>(0,l.jsx)(s,{isNarrow:!0,hasEntriesOnFocus:!0,label:`Framework in a narrow container`}),play:async({canvasElement:e})=>{let t=p(e).getByRole(`combobox`);await d.click(t),await f(()=>u(t).toHaveAttribute(`aria-expanded`,`true`)),await f(()=>{let e=document.querySelector(`[role="listbox"]`);if(e==null)throw Error(`Expected the BaseTypeahead listbox to be open`);let t=e.getBoundingClientRect();u(t.left>=16&&t.right<=window.innerWidth-16&&e.scrollWidth<=e.clientWidth).toBe(!0),u(Array.from(e.querySelectorAll(`[role="option"]`)).every(e=>e.scrollWidth<=e.clientWidth)).toBe(!0)})}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Demo placeholder="Search frameworks…" />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Demo hasEntriesOnFocus isNarrow menuWidth={320} placeholder="Focus to open results…" />,
  play: async ({
    canvasElement
  }) => {
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.click(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Demo source={pendingSource} debounceMs={0} placeholder="Type to start a pending search…" />,
  play: async ({
    canvasElement
  }) => {
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.type(input, 're');
    await waitFor(() => expect(input).toHaveAttribute('aria-busy', 'true'));
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Demo source={emptySource} debounceMs={0} emptySearchResultsText="No matching frameworks" />,
  play: async ({
    canvasElement
  }) => {
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.type(input, 'none');
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <Demo hasEntriesOnFocus renderItem={item => <span {...stylex.props(styles.customItem)}>
          <span {...stylex.props(styles.customItemLabel)}>{item.label}</span>
          <span {...stylex.props(styles.customItemGroup)}>
            {(item.auxiliaryData as {
        group?: string;
      } | undefined)?.group}
          </span>
        </span>} />,
  play: async ({
    canvasElement
  }) => {
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.click(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.stage)}>
      <Demo label="Native disabled" isDisabled />
      <Demo label="Focusable disabled" isDisabled isFocusableDisabled />
    </div>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.stage)}>
      <Demo label="Small" size="sm" hasEntriesOnFocus />
      <Demo label="Medium" size="md" hasEntriesOnFocus />
      <Demo label="Large" size="lg" hasEntriesOnFocus />
    </div>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <Demo isNarrow hasEntriesOnFocus label="Framework in a narrow container" />,
  play: async ({
    canvasElement
  }) => {
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.click(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    await waitFor(() => {
      const listbox = document.querySelector<HTMLElement>('[role="listbox"]');
      if (listbox == null) {
        throw new Error('Expected the BaseTypeahead listbox to be open');
      }
      const box = listbox.getBoundingClientRect();
      expect(box.left >= 16 && box.right <= window.innerWidth - 16 && listbox.scrollWidth <= listbox.clientWidth).toBe(true);
      expect(Array.from(listbox.querySelectorAll<HTMLElement>('[role="option"]')).every(option => option.scrollWidth <= option.clientWidth)).toBe(true);
    });
  }
}`,...T.parameters?.docs?.source}}},E=[`Default`,`LogicalDropdownPlacement`,`Loading`,`EmptyResults`,`CustomRenderer`,`DisabledStates`,`SizeVariants`,`NarrowLongResult`]}))();export{S as CustomRenderer,v as Default,C as DisabledStates,x as EmptyResults,b as Loading,y as LogicalDropdownPlacement,T as NarrowLongResult,w as SizeVariants,E as __namedExportsOrder,_ as default};