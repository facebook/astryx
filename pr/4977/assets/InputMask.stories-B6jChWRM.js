import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-DHEOmJF8.js";import{i as a,t as o}from"./Stack-B31JpLpE.js";import{t as s}from"./Text-FamVCkV_.js";import{n as c,t as l}from"./src-B7TFiGsj.js";var u,d,f,p,m,h,g,_,v;e((()=>{u=t(n()),l(),o(),s(),d=r(),f={title:`Lab/InputMask`,component:c,tags:[`autodocs`]},p={pattern:`(###) ###-####`},m={render:()=>(0,d.jsxs)(a,{gap:4,children:[(0,d.jsx)(c,{mask:p,label:`Phone number`}),(0,d.jsx)(c,{mask:{pattern:`#####`},label:`ZIP code`}),(0,d.jsx)(c,{mask:{pattern:`###-##-####`},label:`SSN`}),(0,d.jsx)(c,{mask:{pattern:`#### #### #### ####`},label:`Card number`})]})},h={render:()=>(0,d.jsxs)(a,{gap:4,children:[(0,d.jsx)(c,{mask:{pattern:`###-###`,placeholder:`•`},label:`Sort code`,formatHint:`Six digits, e.g. 123-456`,defaultValue:`12`}),(0,d.jsx)(c,{mask:{pattern:`(+1) ### ### ####`},label:`Phone with country code`})]})},g={render:function(){let[e,t]=(0,u.useState)(`55512`),n=e.length>0&&e.length<10;return(0,d.jsxs)(a,{gap:4,children:[(0,d.jsx)(c,{mask:p,label:`Phone number`,value:e,onChange:t,hasClear:!0,status:n?{type:`error`,message:`Enter all 10 digits`}:void 0}),(0,d.jsxs)(i,{children:[`Raw value: `,e===``?`(empty)`:e]})]})}},_={render:()=>(0,d.jsxs)(a,{gap:4,children:[(0,d.jsx)(c,{mask:p,label:`Disabled`,value:`5551234567`,isDisabled:!0}),(0,d.jsx)(c,{mask:p,label:`Disabled with reason`,value:`5551234567`,isDisabled:!0,disabledMessage:`Verified numbers cannot be edited`}),(0,d.jsx)(c,{mask:{pattern:`###-##-####`},label:`Read-only`,value:`123456789`,isReadOnly:!0}),(0,d.jsx)(c,{mask:{pattern:`#### #### #### ####`},label:`Validating`,value:`4111111111111111`,isLoading:!0})]})},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={4}>
      <InputMask mask={PHONE} label="Phone number" />
      <InputMask mask={{
      pattern: '#####'
    }} label="ZIP code" />
      <InputMask mask={{
      pattern: '###-##-####'
    }} label="SSN" />
      <InputMask mask={{
      pattern: '#### #### #### ####'
    }} label="Card number" />
    </VStack>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={4}>
      <InputMask mask={{
      pattern: '###-###',
      placeholder: '•'
    }} label="Sort code" formatHint="Six digits, e.g. 123-456" defaultValue="12" />
      <InputMask mask={{
      pattern: '(+1) ### ### ####'
    }} label="Phone with country code" />
    </VStack>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: function ValidationStory() {
    const [value, setValue] = useState('55512');
    const incomplete = value.length > 0 && value.length < 10;
    return <VStack gap={4}>
        <InputMask mask={PHONE} label="Phone number" value={value} onChange={setValue} hasClear status={incomplete ? {
        type: 'error',
        message: 'Enter all 10 digits'
      } : undefined} />
        <Text>Raw value: {value === '' ? '(empty)' : value}</Text>
      </VStack>;
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <VStack gap={4}>
      <InputMask mask={PHONE} label="Disabled" value="5551234567" isDisabled />
      <InputMask mask={PHONE} label="Disabled with reason" value="5551234567" isDisabled disabledMessage="Verified numbers cannot be edited" />
      <InputMask mask={{
      pattern: '###-##-####'
    }} label="Read-only" value="123456789" isReadOnly />
      <InputMask mask={{
      pattern: '#### #### #### ####'
    }} label="Validating" value="4111111111111111" isLoading />
    </VStack>
}`,..._.parameters?.docs?.source}}},v=[`Masks`,`PlaceholderAndHint`,`ValidationAndClear`,`States`]}))();export{m as Masks,h as PlaceholderAndHint,_ as States,g as ValidationAndClear,v as __namedExportsOrder,f as default};