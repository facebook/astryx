import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Button-D8tXiYgG.js";import{t as a}from"./Button-2Dtq4nxO.js";import{c as o}from"./useTheme-DROMTfED.js";import{o as s,t as c}from"./Indicator-jv3x504q.js";import{t as l,x as u}from"./theme-DJXf58PA.js";import{i as d,n as f,t as p}from"./Selector-BDepz_cL.js";import{i as m,t as ee}from"./InputGroup-CkBMolLl.js";import{Ht as te,J as ne,bn as re,c as h,gt as ie,t as ae}from"./esm-BNuSW8ar.js";function g(e){let t=e.presentation===`popover`?`selector-popup`:`bottom-sheet`,n=o({name:`selector-ast004-${e.name}`,components:{[t]:{base:{width:e.width,maxWidth:e.width}}},...e.usesRadioIndicator?{indicators:{check:s}}:{}});return{globals:{direction:e.direction},parameters:{docs:{description:{story:`AST-004 evidence: the open selection surface keeps visible marks at the configured logical edge and gives empty marks no layout width.`}}},render:(t,r)=>(0,v.jsx)(u,{theme:n,mode:r.globals.colorMode===`dark`?`dark`:`light`,children:(0,v.jsx)(`div`,{"data-ast004-indicator-space":e.name,style:{width:e.width},children:(0,v.jsx)(f,{label:`Project with long option labels`,options:ue,value:`selected`,onChange:()=>{},indicatorPosition:e.indicatorPosition,presentation:e.presentation,placement:`below`,width:`100%`,isDefaultOpen:!0})})}),play:async({canvasElement:t})=>{await oe(()=>{y(document.querySelector(`[role="listbox"]`)).not.toBeNull()}),await document.fonts.ready,await new Promise(e=>requestAnimationFrame(()=>requestAnimationFrame(()=>e())));let n=t.querySelector(`[data-ast004-indicator-space="${e.name}"]`),r=document.querySelector(`[role="listbox"]`),i=r?.querySelector(`[role="option"][aria-selected="true"]`),a=r?.querySelector(`[role="option"][aria-selected="false"]`);if(n==null||r==null||i==null||a==null)throw Error(`AST-004 evidence did not render ${e.name}`);y(getComputedStyle(i).direction).toBe(e.direction);let o=t=>e.indicatorPosition===`start`?t.firstElementChild:t.lastElementChild,s=t=>e.indicatorPosition===`start`?t.lastElementChild:t.firstElementChild,c=o(i),l=o(a),u=s(i),d=s(a);y(c.getBoundingClientRect().width).toBeGreaterThan(0),e.usesRadioIndicator?(y(l.getBoundingClientRect().width).toBeGreaterThan(0),y(Math.abs(u.getBoundingClientRect().width-d.getBoundingClientRect().width)).toBeLessThanOrEqual(1)):(y(getComputedStyle(l).display).toBe(`none`),y(l.getBoundingClientRect().width).toBe(0),y(d.getBoundingClientRect().width).toBeGreaterThan(u.getBoundingClientRect().width)),y(u.textContent).toContain(`Selected option with a deliberately long readable label`),y(d.textContent).toContain(`Unselected option with a deliberately long readable label`),y(u.getBoundingClientRect().width).toBeGreaterThan(0),y(d.getBoundingClientRect().width).toBeGreaterThan(0);let f=c.getBoundingClientRect(),p=u.getBoundingClientRect(),m=e.direction===`rtl`?f.left>=p.right:f.right<=p.left;if(y(m).toBe(e.indicatorPosition===`start`),e.presentation===`popover`){let t=document.querySelector(`.astryx-selector-popup`);if(t==null)throw Error(`AST-004 Popover evidence did not render ${e.name}`);let n=t.closest(`[popover]`);if(n==null)throw Error(`AST-004 Popover host did not render ${e.name}`);y(n.matches(`:popover-open`)).toBe(!0)}else{let t=document.querySelector(`dialog`);if(t==null)throw Error(`AST-004 BottomSheet evidence did not render ${e.name}`);y(t.matches(`:modal`)).toBe(!0)}}}}var _,v,y,oe,se,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,ce,K,le,q,J,Y,ue,X,Z,Q,$,de;e((()=>{_=t(n()),a(),ee(),p(),l(),c(),ae(),v=r(),{expect:y,waitFor:oe}=__STORYBOOK_MODULE_TEST__,se={title:`Core/Selector`,component:f,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,v.jsx)(`div`,{style:{width:250},children:(0,v.jsx)(e,{})})],argTypes:{label:{control:`text`,description:`Label text for the selector`},isLabelHidden:{control:`boolean`,description:`Whether to visually hide the label`},description:{control:`text`,description:`Description text displayed between label and selector`},options:{control:`object`,description:`Array of options to display. Can be strings, objects, dividers, or sections.`},value:{control:`text`,description:`The currently selected value`},placeholder:{control:`text`,description:`Placeholder text when no value is selected`},size:{control:`radio`,options:[`sm`,`md`,`lg`],description:`Size variant of the selector`},variant:{control:`radio`,options:[`input`,`ghost`],description:`Visual trigger style`},placement:{control:`select`,options:[`above`,`below`,`start`,`end`],description:`Explicit menu placement. Leave unset for selected-item overlay behavior.`},presentation:{control:`radio`,options:[`popover`,`bottom-sheet`,`adaptive`],description:`Popover, bottom sheet, or responsive presentation.`},isDisabled:{control:`boolean`,description:`Whether the selector is disabled`},isReadOnly:{control:`boolean`,description:`Whether the selected value is visible and submittable without selection controls`},disabledMessage:{control:`text`,description:`Explains why the selector is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the trigger focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled Selector in Tooltip.`},isOptional:{control:`boolean`,description:`Whether the field is optional`},isRequired:{control:`boolean`,description:`Whether the field is required`},renderOption:{description:`Optional render function for custom option rendering`,table:{type:{summary:`(option: SelectorOptionData) => ReactNode`}}},"data-testid":{control:`text`,description:`Test ID for testing frameworks`}}},b={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(t??void 0);return(0,v.jsx)(f,{...a,label:e.label??`Fruit`,options:e.options??[`Apple`,`Banana`,`Orange`,`Mango`,`Pineapple`],value:o,onChange:e=>s(e)})},args:{placeholder:`Select a fruit...`}},x={args:{label:`Assigned owner`,options:[`Alice`,`Bob`,`Charlie`],value:`Alice`,onChange:()=>{},hasClear:!0,hasSearch:!0,htmlName:`owner`,isReadOnly:!0}},S={render:()=>{let[e,t]=(0,_.useState)();return(0,v.jsx)(f,{label:`Team`,options:[`Design`,`Engineering`,`Marketing`,`Operations`],value:e,onChange:t,presentation:`bottom-sheet`})}},C={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(t??void 0);return(0,v.jsx)(f,{...a,label:`Fruit`,isLabelHidden:!0,options:[`Apple`,`Banana`,`Orange`,`Mango`,`Pineapple`],value:o,onChange:e=>s(e),placeholder:`Select a fruit...`})}},w={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(t??void 0);return(0,v.jsx)(f,{...a,label:`Fruit`,description:`Choose your favorite fruit from the list`,options:[`Apple`,`Banana`,`Orange`,`Mango`,`Pineapple`],value:o,onChange:e=>s(e),placeholder:`Select a fruit...`})}},T={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(t??void 0);return(0,v.jsx)(f,{...a,label:`Fruit`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`},{value:`orange`,label:`Orange`,disabled:!0},{value:`mango`,label:`Mango`}],value:o,onChange:e=>s(e)})},args:{placeholder:`Select a fruit...`}},E={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(t??void 0);return(0,v.jsx)(f,{...a,label:`Settings`,options:[{value:`profile`,label:`Profile`,icon:h},{value:`settings`,label:`Settings`,icon:te},{value:`notifications`,label:`Notifications`,icon:re}],value:o,onChange:e=>s(e)})},args:{placeholder:`Select an option...`}},D={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(t??void 0);return(0,v.jsx)(f,{...a,label:`Fruit`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`},{type:`section`,title:`Citrus`,options:[{value:`orange`,label:`Orange`},{value:`lemon`,label:`Lemon`},{value:`lime`,label:`Lime`}]},{type:`section`,title:`Tropical`,options:[{value:`mango`,label:`Mango`},{value:`pineapple`,label:`Pineapple`}]}],value:o,onChange:e=>s(e)})},args:{placeholder:`Select a fruit...`}},O={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(t??void 0);return(0,v.jsx)(f,{...a,label:`Fruit`,hasSearch:!0,options:[{type:`section`,title:`Citrus`,options:[{value:`orange`,label:`Orange`},{value:`lemon`,label:`Lemon`},{value:`lime`,label:`Lime`},{value:`grapefruit`,label:`Grapefruit`}]},{type:`section`,title:`Tropical`,options:[{value:`mango`,label:`Mango`},{value:`pineapple`,label:`Pineapple`},{value:`papaya`,label:`Papaya`},{value:`guava`,label:`Guava`}]}],value:o,onChange:e=>s(e)})},args:{placeholder:`Select a fruit...`}},k={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(t??void 0);return(0,v.jsx)(f,{...a,label:`Fruit`,hasSearch:!0,options:[`Apple`,`Apricot`,`Banana`,`Blueberry`,`Cherry`,`Grapefruit`,`Mango`,`Orange`],value:o,onChange:e=>s(e)})},args:{placeholder:`Select a fruit...`}},A={render:()=>{let[e,t]=(0,_.useState)(void 0),[n,r]=(0,_.useState)(void 0),[i,a]=(0,_.useState)(void 0),[o,s]=(0,_.useState)(void 0);return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:300},children:[(0,v.jsx)(f,{label:`No options (default)`,options:[],value:e,onChange:e=>t(e)}),(0,v.jsx)(f,{label:`No options (custom)`,options:[],value:n,onChange:e=>r(e),emptyText:`No fruit in season yet`}),(0,v.jsx)(f,{label:`Search for xyz (custom)`,options:[`Apple`,`Banana`,`Cherry`],value:i,onChange:e=>a(e),hasSearch:!0,emptySearchText:`Nothing matches that fruit`}),(0,v.jsx)(f,{label:`Loading (no message)`,options:[],value:o,onChange:e=>s(e),isLoading:!0})]})},decorators:[e=>(0,v.jsx)(e,{})]},j={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(t??void 0),c=[{value:`user1`,label:`Alice Johnson`,email:`alice@example.com`},{value:`user2`,label:`Bob Smith`,email:`bob@example.com`},{value:`user3`,label:`Carol White`,email:`carol@example.com`}];return(0,v.jsx)(f,{...a,label:`User`,options:c,value:o,onChange:e=>s(e),placeholder:`Select a user...`,renderOption:e=>(0,v.jsx)(d,{icon:h,label:e.label,description:e.email})})}},M={render:()=>{let e=[{value:`private`,label:`Private`,icon:ne,description:`Only members can access this space and its content.`},{value:`public`,label:`Public`,icon:ie,description:`Anyone at the company can find and join this space.`}],[t,n]=(0,_.useState)(`private`),[r,a]=(0,_.useState)(`private`),[o,s]=(0,_.useState)(`private`),[c,l]=(0,_.useState)(`private`);return(0,v.jsxs)(`div`,{style:{display:`grid`,gap:24},children:[(0,v.jsx)(f,{label:`Visibility (default trigger)`,options:e,value:t,onChange:n,"data-testid":`condensed`}),(0,v.jsx)(f,{label:`Visibility (renderValue, one line)`,options:e,value:r,onChange:a,"data-testid":`one-line`,renderValue:e=>(0,v.jsx)(d,{icon:e.icon,label:e.label??e.value})}),(0,v.jsx)(f,{label:`Visibility (renderValue)`,options:e,value:o,onChange:s,"data-testid":`full`,renderValue:e=>(0,v.jsx)(d,{icon:e.icon,label:e.label??e.value,description:e.description})}),(0,v.jsxs)(m,{label:`Visibility`,children:[(0,v.jsx)(f,{label:`Visibility (in a group)`,isLabelHidden:!0,options:e,value:c,onChange:l,renderValue:e=>(0,v.jsx)(d,{icon:e.icon,label:e.label??e.value,description:e.description})}),(0,v.jsx)(i,{label:`Save`})]})]})}},N={render:()=>{let[e,t]=(0,_.useState)(),[n,r]=(0,_.useState)(),[i,a]=(0,_.useState)();return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:250},children:[(0,v.jsx)(f,{label:`Small`,size:`sm`,options:[`Apple`,`Banana`,`Orange`],value:e,onChange:t,placeholder:`Small size (28px)`}),(0,v.jsx)(f,{label:`Medium`,size:`md`,options:[`Apple`,`Banana`,`Orange`],value:n,onChange:r,placeholder:`Medium size (32px)`}),(0,v.jsx)(f,{label:`Large`,size:`lg`,options:[`Apple`,`Banana`,`Orange`],value:i,onChange:a,placeholder:`Large size (36px)`})]})},decorators:[e=>(0,v.jsx)(e,{})]},P={render:()=>{let[e,t]=(0,_.useState)(`week`),[n,r]=(0,_.useState)(`comfortable`);return(0,v.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:8,width:`max-content`},children:[(0,v.jsx)(i,{label:`Today`,variant:`ghost`}),(0,v.jsx)(f,{label:`View`,isLabelHidden:!0,variant:`ghost`,size:`md`,options:[{value:`day`,label:`Day`},{value:`week`,label:`Week`},{value:`month`,label:`Month`}],value:e,onChange:t}),(0,v.jsx)(f,{label:`Density`,isLabelHidden:!0,variant:`ghost`,size:`md`,options:[{value:`compact`,label:`Compact`},{value:`comfortable`,label:`Comfortable`},{value:`spacious`,label:`Spacious`}],value:n,onChange:r,status:{type:`warning`,message:`This setting affects all users`},statusVariant:`tooltip`}),(0,v.jsx)(i,{label:`Export`,variant:`ghost`})]})},decorators:[e=>(0,v.jsx)(e,{})]},F={render:()=>{let[e,t]=(0,_.useState)(),[n,r]=(0,_.useState)(`banana`),[i,a]=(0,_.useState)(`apple`);return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:250},children:[(0,v.jsx)(f,{label:`Error status`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}],value:e,onChange:t,placeholder:`Select a fruit...`,status:{type:`error`,message:`Please select a fruit`}}),(0,v.jsx)(f,{label:`Warning status`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}],value:n,onChange:r,status:{type:`warning`,message:`Banana is out of season`}}),(0,v.jsx)(f,{label:`Success status`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}],value:i,onChange:a,status:{type:`success`}})]})},decorators:[e=>(0,v.jsx)(e,{})]},I={render:()=>{let[e,t]=(0,_.useState)(),[n,r]=(0,_.useState)();return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16,width:250},children:[(0,v.jsx)(f,{label:`Optional field`,isOptional:!0,options:[`Apple`,`Banana`,`Orange`],value:e,onChange:t,placeholder:`Select a fruit...`}),(0,v.jsx)(f,{label:`Required field`,isRequired:!0,options:[`Apple`,`Banana`,`Orange`],value:n,onChange:r,placeholder:`Select a fruit...`})]})},decorators:[e=>(0,v.jsx)(e,{})]},L={args:{label:`Fruit`,options:[`Apple`,`Banana`,`Orange`],value:`Apple`,isDisabled:!0,placeholder:`Select a fruit...`}},R={args:{label:`Owner`,options:[`Alice`,`Bob`,`Carol`],isDisabled:!0,disabledMessage:`You need the Editor role to change this`,placeholder:`Select an owner...`}},z={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(`Banana`);return(0,v.jsx)(f,{...a,label:`Fruit`,options:[`Apple`,`Banana`,`Orange`,`Mango`],value:o,onChange:e=>s(e)})}},B={render:()=>{let[e,t]=(0,_.useState)(),[n,r]=(0,_.useState)(`banana`),[i,a]=(0,_.useState)(),[o,s]=(0,_.useState)();return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,width:`250px`},children:[(0,v.jsx)(f,{label:`Default`,options:[`Apple`,`Banana`,`Orange`],value:e,onChange:t,placeholder:`Select...`}),(0,v.jsx)(f,{label:`Pre-selected`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}],value:n,onChange:r}),(0,v.jsx)(f,{label:`With disabled option`,options:[{value:`apple`,label:`Apple`,disabled:!0},{value:`banana`,label:`Banana`}],value:i,onChange:a,placeholder:`Select...`}),(0,v.jsx)(f,{label:`Disabled selector`,options:[`Apple`,`Banana`],value:o,onChange:s,isDisabled:!0,placeholder:`Select...`})]})},decorators:[e=>(0,v.jsx)(e,{})]},V={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(`Banana`);return(0,v.jsx)(f,{...a,options:[`Apple`,`Banana`,`Cherry`,`Date`],value:o,onChange:e=>s(e),hasClear:!0})},args:{label:`Fruit`,placeholder:`Select a fruit...`}},H={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(`Banana`);return(0,v.jsx)(f,{...a,options:[`Apple`,`Banana`,`Cherry`],value:o,onChange:e=>s(e),hasClear:!0})},args:{label:`Required fruit`,status:{type:`warning`,message:`Selection is recommended`}}},U={render:e=>{let{value:t,onChange:n,changeAction:r,hasClear:i,...a}=e,[o,s]=(0,_.useState)(t??`Banana`);return(0,v.jsx)(f,{...a,label:`Bottom toolbar selector`,options:[`Apple`,`Banana`,`Cherry`,`Date`],value:o,onChange:e=>s(e),placement:`above`})}},W={render:()=>{let[e,t]=(0,_.useState)(`Banana`),[n,r]=(0,_.useState)(`Banana`),[i,a]=(0,_.useState)(`Banana`),o=[`Apple`,`Banana`,`Cherry`,`Date`];return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:32},children:[(0,v.jsx)(f,{label:`placement=below`,options:o,value:e,onChange:e=>t(e),placement:`below`}),(0,v.jsx)(f,{label:`placement=start`,options:o,value:n,onChange:e=>r(e),placement:`start`}),(0,v.jsx)(f,{label:`placement=end`,options:o,value:i,onChange:e=>a(e),placement:`end`})]})}},G={render:()=>{let[e,t]=(0,_.useState)(),[n,r]=(0,_.useState)();return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:24,width:280},children:[(0,v.jsx)(f,{label:`Attached (default)`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}],value:e,onChange:t,placeholder:`Select a fruit...`,status:{type:`error`,message:`Please select a fruit`}}),(0,v.jsx)(f,{label:`Detached`,options:[{value:`apple`,label:`Apple`},{value:`banana`,label:`Banana`}],value:n,onChange:r,placeholder:`Select a fruit...`,status:{type:`error`,message:`Please select a fruit`},statusVariant:`detached`})]})},decorators:[e=>(0,v.jsx)(e,{})]},ce=o({name:`selector-icon-demo`,components:{"input-clear-icon":{base:{width:`12px`,height:`12px`,fontSize:`12px`,color:`var(--color-icon-secondary)`,":hover":{color:`var(--color-accent)`}}},"selector-indicator-icon":{base:{width:`14px`,height:`14px`,fontSize:`14px`,color:`var(--color-icon-secondary)`},"state:expanded":{color:`var(--color-accent)`}}}}),K={render:()=>{let[e,t]=(0,_.useState)(`Banana`);return(0,v.jsx)(u,{theme:ce,mode:`light`,children:(0,v.jsx)(f,{label:`Icons themed (accent on hover/open)`,options:[`Apple`,`Banana`,`Cherry`],value:e,onChange:t,hasClear:!0})})}},le=o({name:`radio-selection-demo`,indicators:{check:s}}),q={render:()=>{let[e,t]=(0,_.useState)(`Banana`);return(0,v.jsx)(u,{theme:le,mode:`light`,children:(0,v.jsx)(f,{label:`Single selection drawn as a radio`,options:[`Apple`,`Banana`,`Cherry`],value:e,onChange:t,isDefaultOpen:!0})})}},J={render:()=>{let[e,t]=(0,_.useState)(`Banana`);return(0,v.jsx)(f,{label:`Single selection drawn as a check (default)`,options:[`Apple`,`Banana`,`Cherry`],value:e,onChange:t,isDefaultOpen:!0})}},Y={render:()=>{let[e,t]=(0,_.useState)(`Banana`);return(0,v.jsx)(f,{label:`Mark at the start`,options:[`Apple`,`Banana`,`Cherry`],value:e,onChange:t,indicatorPosition:`start`,isDefaultOpen:!0})}},ue=[{value:`selected`,label:`Selected option with a deliberately long readable label`},{value:`unselected`,label:`Unselected option with a deliberately long readable label`}],X={...g({name:`popover-narrow-start-default-ltr`,presentation:`popover`,width:`12rem`,indicatorPosition:`start`,direction:`ltr`,usesRadioIndicator:!1}),tags:[`visual-baseline`]},Z={...g({name:`popover-wide-end-radio-rtl`,presentation:`popover`,width:`24rem`,indicatorPosition:`end`,direction:`rtl`,usesRadioIndicator:!0}),tags:[`visual-baseline`]},Q={...g({name:`bottom-sheet-narrow-end-default-rtl`,presentation:`bottom-sheet`,width:`12rem`,indicatorPosition:`end`,direction:`rtl`,usesRadioIndicator:!1}),tags:[`visual-baseline`]},$={...g({name:`bottom-sheet-wide-start-radio-ltr`,presentation:`bottom-sheet`,width:`24rem`,indicatorPosition:`start`,direction:`ltr`,usesRadioIndicator:!0}),tags:[`visual-baseline`]},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label={args.label ?? 'Fruit'} options={args.options ?? ['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']} value={value} onChange={v => setValue(v)} />;
  },
  args: {
    placeholder: 'Select a fruit...'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Assigned owner',
    options: ['Alice', 'Bob', 'Charlie'],
    value: 'Alice',
    onChange: () => {},
    hasClear: true,
    hasSearch: true,
    htmlName: 'owner',
    isReadOnly: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string | undefined>();
    return <Selector label="Team" options={['Design', 'Engineering', 'Marketing', 'Operations']} value={value} onChange={setValue} presentation="bottom-sheet" />;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Fruit" isLabelHidden options={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']} value={value} onChange={v => setValue(v)} placeholder="Select a fruit..." />;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Fruit" description="Choose your favorite fruit from the list" options={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']} value={value} onChange={v => setValue(v)} placeholder="Select a fruit..." />;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Fruit" options={[{
      value: 'apple',
      label: 'Apple'
    }, {
      value: 'banana',
      label: 'Banana'
    }, {
      value: 'orange',
      label: 'Orange',
      disabled: true
    }, {
      value: 'mango',
      label: 'Mango'
    }]} value={value} onChange={v => setValue(v)} />;
  },
  args: {
    placeholder: 'Select a fruit...'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Settings" options={[{
      value: 'profile',
      label: 'Profile',
      icon: UserIcon
    }, {
      value: 'settings',
      label: 'Settings',
      icon: CogIcon
    }, {
      value: 'notifications',
      label: 'Notifications',
      icon: BellIcon
    }]} value={value} onChange={v => setValue(v)} />;
  },
  args: {
    placeholder: 'Select an option...'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Fruit" options={[{
      value: 'apple',
      label: 'Apple'
    }, {
      value: 'banana',
      label: 'Banana'
    }, {
      type: 'section',
      title: 'Citrus',
      options: [{
        value: 'orange',
        label: 'Orange'
      }, {
        value: 'lemon',
        label: 'Lemon'
      }, {
        value: 'lime',
        label: 'Lime'
      }]
    }, {
      type: 'section',
      title: 'Tropical',
      options: [{
        value: 'mango',
        label: 'Mango'
      }, {
        value: 'pineapple',
        label: 'Pineapple'
      }]
    }]} value={value} onChange={v => setValue(v)} />;
  },
  args: {
    placeholder: 'Select a fruit...'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Fruit" hasSearch options={[{
      type: 'section',
      title: 'Citrus',
      options: [{
        value: 'orange',
        label: 'Orange'
      }, {
        value: 'lemon',
        label: 'Lemon'
      }, {
        value: 'lime',
        label: 'Lime'
      }, {
        value: 'grapefruit',
        label: 'Grapefruit'
      }]
    }, {
      type: 'section',
      title: 'Tropical',
      options: [{
        value: 'mango',
        label: 'Mango'
      }, {
        value: 'pineapple',
        label: 'Pineapple'
      }, {
        value: 'papaya',
        label: 'Papaya'
      }, {
        value: 'guava',
        label: 'Guava'
      }]
    }]} value={value} onChange={v => setValue(v)} />;
  },
  args: {
    placeholder: 'Select a fruit...'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    return <Selector {...rest} label="Fruit" hasSearch options={['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grapefruit', 'Mango', 'Orange']} value={value} onChange={v => setValue(v)} />;
  },
  args: {
    placeholder: 'Select a fruit...'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<string | undefined>(undefined);
    const [b, setB] = useState<string | undefined>(undefined);
    const [c, setC] = useState<string | undefined>(undefined);
    const [d, setD] = useState<string | undefined>(undefined);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 300
    }}>
        <Selector label="No options (default)" options={[]} value={a} onChange={v => setA(v)} />
        <Selector label="No options (custom)" options={[]} value={b} onChange={v => setB(v)} emptyText="No fruit in season yet" />
        <Selector label="Search for xyz (custom)" options={['Apple', 'Banana', 'Cherry']} value={c} onChange={v => setC(v)} hasSearch emptySearchText="Nothing matches that fruit" />
        <Selector label="Loading (no message)" options={[]} value={d} onChange={v => setD(v)} isLoading />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? undefined);
    const users = [{
      value: 'user1',
      label: 'Alice Johnson',
      email: 'alice@example.com'
    }, {
      value: 'user2',
      label: 'Bob Smith',
      email: 'bob@example.com'
    }, {
      value: 'user3',
      label: 'Carol White',
      email: 'carol@example.com'
    }];
    return <Selector {...rest} label="User" options={users} value={value} onChange={v => setValue(v)} placeholder="Select a user..." renderOption={user => <SelectorOption icon={UserIcon} label={user.label} description={(user as (typeof users)[number]).email} />} />;
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => {
    const visibility = [{
      value: 'private',
      label: 'Private',
      icon: LockClosedIcon,
      description: 'Only members can access this space and its content.'
    }, {
      value: 'public',
      label: 'Public',
      icon: GlobeAltIcon,
      description: 'Anyone at the company can find and join this space.'
    }];
    const [condensed, setCondensed] = useState<string | undefined>('private');
    const [oneLine, setOneLine] = useState<string | undefined>('private');
    const [full, setFull] = useState<string | undefined>('private');
    const [grouped, setGrouped] = useState<string | undefined>('private');
    return <div style={{
      display: 'grid',
      gap: 24
    }}>
        <Selector label="Visibility (default trigger)" options={visibility} value={condensed} onChange={setCondensed} data-testid="condensed" />
        <Selector label="Visibility (renderValue, one line)" options={visibility} value={oneLine} onChange={setOneLine} data-testid="one-line" renderValue={option => <SelectorOption icon={option.icon} label={option.label ?? option.value} />} />
        <Selector label="Visibility (renderValue)" options={visibility} value={full} onChange={setFull} data-testid="full" renderValue={option => <SelectorOption icon={option.icon} label={option.label ?? option.value} description={option.description} />} />
        <InputGroup label="Visibility">
          <Selector label="Visibility (in a group)" isLabelHidden options={visibility} value={grouped} onChange={setGrouped} renderValue={option => <SelectorOption icon={option.icon} label={option.label ?? option.value} description={option.description} />} />
          <Button label="Save" />
        </InputGroup>
      </div>;
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>();
    const [value3, setValue3] = useState<string | undefined>();
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 250
    }}>
        <Selector label="Small" size="sm" options={['Apple', 'Banana', 'Orange']} value={value1} onChange={setValue1} placeholder="Small size (28px)" />
        <Selector label="Medium" size="md" options={['Apple', 'Banana', 'Orange']} value={value2} onChange={setValue2} placeholder="Medium size (32px)" />
        <Selector label="Large" size="lg" options={['Apple', 'Banana', 'Orange']} value={value3} onChange={setValue3} placeholder="Large size (36px)" />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [view, setView] = useState<string | undefined>('week');
    const [density, setDensity] = useState<string | undefined>('comfortable');
    return <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: 'max-content'
    }}>
        <Button label="Today" variant="ghost" />
        <Selector label="View" isLabelHidden variant="ghost" size="md" options={[{
        value: 'day',
        label: 'Day'
      }, {
        value: 'week',
        label: 'Week'
      }, {
        value: 'month',
        label: 'Month'
      }]} value={view} onChange={setView} />
        <Selector label="Density" isLabelHidden variant="ghost" size="md" options={[{
        value: 'compact',
        label: 'Compact'
      }, {
        value: 'comfortable',
        label: 'Comfortable'
      }, {
        value: 'spacious',
        label: 'Spacious'
      }]} value={density} onChange={setDensity} status={{
        type: 'warning',
        message: 'This setting affects all users'
      }} statusVariant="tooltip" />
        <Button label="Export" variant="ghost" />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>('banana');
    const [value3, setValue3] = useState<string | undefined>('apple');
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 250
    }}>
        <Selector label="Error status" options={[{
        value: 'apple',
        label: 'Apple'
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={value1} onChange={setValue1} placeholder="Select a fruit..." status={{
        type: 'error',
        message: 'Please select a fruit'
      }} />
        <Selector label="Warning status" options={[{
        value: 'apple',
        label: 'Apple'
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={value2} onChange={setValue2} status={{
        type: 'warning',
        message: 'Banana is out of season'
      }} />
        <Selector label="Success status" options={[{
        value: 'apple',
        label: 'Apple'
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={value3} onChange={setValue3} status={{
        type: 'success'
      }} />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>();
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      width: 250
    }}>
        <Selector label="Optional field" isOptional options={['Apple', 'Banana', 'Orange']} value={value1} onChange={setValue1} placeholder="Select a fruit..." />
        <Selector label="Required field" isRequired options={['Apple', 'Banana', 'Orange']} value={value2} onChange={setValue2} placeholder="Select a fruit..." />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Fruit',
    options: ['Apple', 'Banana', 'Orange'],
    value: 'Apple',
    isDisabled: true,
    placeholder: 'Select a fruit...'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Owner',
    options: ['Alice', 'Bob', 'Carol'],
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this',
    placeholder: 'Select an owner...'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: _value,
      onChange: _onChange,
      changeAction: _ca,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState('Banana');
    return <Selector {...rest} label="Fruit" options={['Apple', 'Banana', 'Orange', 'Mango']} value={value} onChange={v => setValue(v)} />;
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value1, setValue1] = useState<string | undefined>();
    const [value2, setValue2] = useState<string | undefined>('banana');
    const [value3, setValue3] = useState<string | undefined>();
    const [value4, setValue4] = useState<string | undefined>();
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '250px'
    }}>
        <Selector label="Default" options={['Apple', 'Banana', 'Orange']} value={value1} onChange={setValue1} placeholder="Select..." />
        <Selector label="Pre-selected" options={[{
        value: 'apple',
        label: 'Apple'
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={value2} onChange={setValue2} />
        <Selector label="With disabled option" options={[{
        value: 'apple',
        label: 'Apple',
        disabled: true
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={value3} onChange={setValue3} placeholder="Select..." />
        <Selector label="Disabled selector" options={['Apple', 'Banana']} value={value4} onChange={setValue4} isDisabled placeholder="Select..." />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: _value,
      onChange: _onChange,
      changeAction: _changeAction,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState<string | null>('Banana');
    return <Selector {...rest} options={['Apple', 'Banana', 'Cherry', 'Date']} value={value} onChange={v => setValue(v)} hasClear />;
  },
  args: {
    label: 'Fruit',
    placeholder: 'Select a fruit...'
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: _value,
      onChange: _onChange,
      changeAction: _changeAction,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState<string | null>('Banana');
    return <Selector {...rest} options={['Apple', 'Banana', 'Cherry']} value={value} onChange={v => setValue(v)} hasClear />;
  },
  args: {
    label: 'Required fruit',
    status: {
      type: 'warning',
      message: 'Selection is recommended'
    }
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      value: argsValue,
      onChange: _onChange,
      changeAction: _changeAction,
      hasClear: _hc,
      ...rest
    } = args;
    const [value, setValue] = useState(argsValue ?? 'Banana');
    return <Selector {...rest} label="Bottom toolbar selector" options={['Apple', 'Banana', 'Cherry', 'Date']} value={value} onChange={v => setValue(v)} placement="above" />;
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [below, setBelow] = useState('Banana');
    const [start, setStart] = useState('Banana');
    const [end, setEnd] = useState('Banana');
    const options = ['Apple', 'Banana', 'Cherry', 'Date'];
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 32
    }}>
        <Selector label="placement=below" options={options} value={below} onChange={v => setBelow(v)} placement="below" />
        <Selector label="placement=start" options={options} value={start} onChange={v => setStart(v)} placement="start" />
        <Selector label="placement=end" options={options} value={end} onChange={v => setEnd(v)} placement="end" />
      </div>;
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [a, setA] = useState<string | undefined>();
    const [b, setB] = useState<string | undefined>();
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      width: 280
    }}>
        <Selector label="Attached (default)" options={[{
        value: 'apple',
        label: 'Apple'
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={a} onChange={setA} placeholder="Select a fruit..." status={{
        type: 'error',
        message: 'Please select a fruit'
      }} />
        <Selector label="Detached" options={[{
        value: 'apple',
        label: 'Apple'
      }, {
        value: 'banana',
        label: 'Banana'
      }]} value={b} onChange={setB} placeholder="Select a fruit..." status={{
        type: 'error',
        message: 'Please select a fruit'
      }} statusVariant="detached" />
      </div>;
  },
  decorators: [Story => <Story />]
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string | null>('Banana');
    return <Theme theme={iconTheme} mode="light">
        <Selector label="Icons themed (accent on hover/open)" options={['Apple', 'Banana', 'Cherry']} value={value} onChange={setValue} hasClear />
      </Theme>;
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string | undefined>('Banana');
    return <Theme theme={radioSelectionTheme} mode="light">
        <Selector label="Single selection drawn as a radio" options={['Apple', 'Banana', 'Cherry']} value={value} onChange={setValue} isDefaultOpen />
      </Theme>;
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string | undefined>('Banana');
    return <Selector label="Single selection drawn as a check (default)" options={['Apple', 'Banana', 'Cherry']} value={value} onChange={setValue} isDefaultOpen />;
  }
}`,...J.parameters?.docs?.source},description:{story:`The same Selector with no theme, for comparison: a checkmark on the selected
row, and nothing at all on the others.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string | undefined>('Banana');
    return <Selector label="Mark at the start" options={['Apple', 'Banana', 'Cherry']} value={value} onChange={setValue} indicatorPosition="start" isDefaultOpen />;
  }
}`,...Y.parameters?.docs?.source},description:{story:`\`indicatorPosition="start"\` moves a rendered mark to the leading edge, the
way a native menu marks its chosen row.

The default check draws nothing when unchecked, so its empty mark wrapper
collapses. Unselected labels gain that space; the selected label may shift or
have less available width while its visible mark remains at the logical start.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  ...createIndicatorSpaceEvidenceStory({
    name: 'popover-narrow-start-default-ltr',
    presentation: 'popover',
    width: '12rem',
    indicatorPosition: 'start',
    direction: 'ltr',
    usesRadioIndicator: false
  }),
  tags: ['visual-baseline']
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  ...createIndicatorSpaceEvidenceStory({
    name: 'popover-wide-end-radio-rtl',
    presentation: 'popover',
    width: '24rem',
    indicatorPosition: 'end',
    direction: 'rtl',
    usesRadioIndicator: true
  }),
  tags: ['visual-baseline']
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  ...createIndicatorSpaceEvidenceStory({
    name: 'bottom-sheet-narrow-end-default-rtl',
    presentation: 'bottom-sheet',
    width: '12rem',
    indicatorPosition: 'end',
    direction: 'rtl',
    usesRadioIndicator: false
  }),
  tags: ['visual-baseline']
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  ...createIndicatorSpaceEvidenceStory({
    name: 'bottom-sheet-wide-start-radio-ltr',
    presentation: 'bottom-sheet',
    width: '24rem',
    indicatorPosition: 'start',
    direction: 'ltr',
    usesRadioIndicator: true
  }),
  tags: ['visual-baseline']
}`,...$.parameters?.docs?.source}}},de=`Default.ReadOnly.BottomSheetPresentation.HiddenLabel.WithDescription.WithObjects.WithIcons.WithSections.SearchableWithSections.Searchable.EmptyStates.CustomRender.OptionDescriptions.SizeVariants.GhostVariant.WithStatus.OptionalRequired.Disabled.DisabledWithMessage.PreSelected.AllVariations.Clearable.ClearableWithStatus.PlacementAbove.Placements.StatusVariantComparison.ThemedIcons.RadioSelectionIndicator.DefaultSelectionIndicator.StartIndicatorPosition.IndicatorSpacePopoverNarrowStart.IndicatorSpacePopoverWideEndRTL.IndicatorSpaceBottomSheetNarrowEndRTL.IndicatorSpaceBottomSheetWideStart`.split(`.`)}))();export{B as AllVariations,S as BottomSheetPresentation,V as Clearable,H as ClearableWithStatus,j as CustomRender,b as Default,J as DefaultSelectionIndicator,L as Disabled,R as DisabledWithMessage,A as EmptyStates,P as GhostVariant,C as HiddenLabel,Q as IndicatorSpaceBottomSheetNarrowEndRTL,$ as IndicatorSpaceBottomSheetWideStart,X as IndicatorSpacePopoverNarrowStart,Z as IndicatorSpacePopoverWideEndRTL,M as OptionDescriptions,I as OptionalRequired,U as PlacementAbove,W as Placements,z as PreSelected,q as RadioSelectionIndicator,x as ReadOnly,k as Searchable,O as SearchableWithSections,N as SizeVariants,Y as StartIndicatorPosition,G as StatusVariantComparison,K as ThemedIcons,w as WithDescription,E as WithIcons,T as WithObjects,D as WithSections,F as WithStatus,de as __namedExportsOrder,se as default};