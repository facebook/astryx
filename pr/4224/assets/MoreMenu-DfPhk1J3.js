import{n as e}from"./rolldown-runtime-DaJ6WEGw.js";import{c as t,s as n}from"./themeProps-DlHa58hS.js";import{t as r}from"./jsx-runtime-cM__dR4X.js";import{n as i,r as a}from"./SizeContext-DYIY50ln.js";import{n as o,t as s}from"./globalIconRegistry-DdNEt-Zf.js";import{r as c,t as l}from"./i18n-BRp86Ovh.js";import{n as u,t as d}from"./DropdownMenu-CArHLQR4.js";function f({items:e,label:n,variant:r=`ghost`,size:i,icon:o,isDisabled:l=!1,isMenuOpen:u,onOpenChange:f,xstyle:m,className:h,style:g,"data-testid":_,ref:v}){let y=c(),b=n??y(`@astryx.moreMenu.label`),x=a(i,`md`),S=s(`moreHorizontal`);return(0,p.jsx)(d,{className:h?`${t(`more-menu`)} ${h}`:t(`more-menu`),xstyle:m,style:g,isMenuOpen:u,onOpenChange:f,button:{label:b,icon:o??S,variant:r,size:x,isDisabled:l,tooltip:b,isIconOnly:!0,ref:v},items:e,hasChevron:!1,"data-testid":_})}var p,m=e((()=>{o(),u(),i(),n(),l(),p=r(),f.displayName=`MoreMenu`,f.__docgenInfo={description:`Overflow menu with a three-dot icon trigger.

A convenience wrapper around DropdownMenu with icon-only button defaults.

@example
\`\`\`
<MoreMenu
  items={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete },
  ]}
/>
\`\`\``,methods:[],displayName:`MoreMenu`,props:{ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLButtonElement>`,elements:[{name:`HTMLButtonElement`}]},description:`Ref forwarded to the trigger button`},items:{required:!0,tsType:{name:`Array`,elements:[{name:`union`,raw:`DropdownMenuItemData | DropdownMenuDivider | DropdownMenuSection`,elements:[{name:`DropdownMenuItemData`},{name:`DropdownMenuDivider`},{name:`DropdownMenuSection`}]}],raw:`DropdownMenuOption[]`},description:"Menu items \\u2014 data array of actions, dividers, and sections.\nSame type as DropdownMenu's `items` prop."},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the trigger button.
Always used as aria-label (the button is always icon-only).
@default 'More options'`},variant:{required:!1,tsType:{name:`ButtonVariantMap`},description:`Visual style variant of the trigger button.
@default 'ghost'`,defaultValue:{value:`'ghost'`,computed:!1}},size:{required:!1,tsType:{name:`unknown`},description:`Size of the trigger button.
@default 'md'`},icon:{required:!1,tsType:{name:`ReactNode`},description:`Override the default three-dot icon.
@default Three horizontal dots from the icon registry ('moreHorizontal')`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the menu trigger is disabled.
@default false`,defaultValue:{value:`false`,computed:!1}},isMenuOpen:{required:!1,tsType:{name:`boolean`},description:`Controlled open state for the menu.`},onOpenChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(isOpen: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`isOpen`}],return:{name:`void`}}},description:`Callback fired when the menu visibility changes.`},"data-testid":{required:!1,tsType:{name:`string`},description:`Test ID for testing frameworks.`}},composes:[`Pick`]}})),h=e((()=>{m()}));export{f as n,m as r,h as t};