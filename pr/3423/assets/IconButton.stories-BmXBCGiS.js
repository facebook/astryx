import{ah as d,a1 as r}from"./iframe-FpdBIrKz.js";import{I as h}from"./IconButton-unTqGC8t.js";import{F as u}from"./Cog6ToothIcon-aWw6l_cf.js";import{F as S}from"./TrashIcon-BY1z9jcx.js";import{F as b}from"./PencilIcon-DwjccwJd.js";import{F as x}from"./HeartIcon-DCS7-LDM.js";import{F as w}from"./PlusIcon-B2VkV_cy.js";import{F as j}from"./BellIcon-CyxT11Q0.js";import"./preload-helper-Ct5FWWRu.js";function I({title:p,titleId:g,...f},v){return d.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:v,"aria-labelledby":g},f),p?d.createElement("title",{id:g},p):null,d.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M6 18 18 6M6 6l12 12"}))}const F=d.forwardRef(I),$={title:"Core/IconButton",component:h,tags:["autodocs"],argTypes:{label:{control:"text",description:"Accessible label (aria-label)"},variant:{control:"select",options:["primary","secondary","ghost","destructive"],description:"Visual style variant"},size:{control:"select",options:["sm","md","lg"],description:"Size variant"},isLoading:{control:"boolean",description:"Loading state"},isDisabled:{control:"boolean",description:"Disabled state"}}},a={args:{label:"Settings",icon:r.jsx(u,{})}},e={args:{label:"Settings",icon:r.jsx(u,{}),variant:"ghost"}},o={args:{label:"Add item",icon:r.jsx(w,{}),variant:"primary"}},s={args:{label:"Delete",icon:r.jsx(S,{}),variant:"destructive"}},t={args:{label:"Close",icon:r.jsx(F,{}),variant:"ghost",size:"sm"}},n={args:{label:"Edit",icon:r.jsx(b,{}),size:"lg"}},i={args:{label:"Notifications",icon:r.jsx(j,{}),variant:"ghost",tooltip:"View notifications"}},c={args:{label:"Saving",icon:r.jsx(x,{}),variant:"primary",isLoading:!0}},l={args:{label:"Edit",icon:r.jsx(b,{}),isDisabled:!0}},m={args:{label:"React with rocket",icon:r.jsx("span",{children:"🚀"}),variant:"ghost",size:"sm"}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Settings',
    icon: <Cog6ToothIcon />
  }
}`,...a.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Settings',
    icon: <Cog6ToothIcon />,
    variant: 'ghost'
  }
}`,...e.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Add item',
    icon: <PlusIcon />,
    variant: 'primary'
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Delete',
    icon: <TrashIcon />,
    variant: 'destructive'
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Close',
    icon: <XMarkIcon />,
    variant: 'ghost',
    size: 'sm'
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Edit',
    icon: <PencilIcon />,
    size: 'lg'
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Notifications',
    icon: <BellIcon />,
    variant: 'ghost',
    tooltip: 'View notifications'
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Saving',
    icon: <HeartIcon />,
    variant: 'primary',
    isLoading: true
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Edit',
    icon: <PencilIcon />,
    isDisabled: true
  }
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'React with rocket',
    icon: <span>🚀</span>,
    variant: 'ghost',
    size: 'sm'
  }
}`,...m.parameters?.docs?.source}}};const P=["Default","Ghost","Primary","Destructive","Small","Large","WithTooltip","Loading","Disabled","EmojiIcon"];export{a as Default,s as Destructive,l as Disabled,m as EmojiIcon,e as Ghost,n as Large,c as Loading,o as Primary,t as Small,i as WithTooltip,P as __namedExportsOrder,$ as default};
