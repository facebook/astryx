import{aM as g,a1 as y,aq as t,V as b}from"./iframe-Z8EfSKmM.js";import{D}from"./DropdownMenu-BZ0LncjC.js";function o({items:a,label:e="More options",variant:r="ghost",size:s,icon:i,isDisabled:u=!1,isMenuOpen:d,onOpenChange:l,hasAutoFocus:m,xstyle:p,className:n,style:c,"data-testid":f,ref:h}){const M=g(s,"md"),w=b("moreHorizontal");return y.jsx(D,{className:n?`${t("more-menu")} ${n}`:t("more-menu"),xstyle:p,style:c,isMenuOpen:d,onOpenChange:l,button:{label:e,icon:i??w,variant:r,size:M,isDisabled:u,tooltip:e,isIconOnly:!0,ref:h},items:a,hasChevron:!1,hasAutoFocus:m,"data-testid":f})}o.displayName="MoreMenu";o.__docgenInfo={description:`Overflow menu with a three-dot icon trigger.

A convenience wrapper around DropdownMenu with icon-only button defaults.

@example
\`\`\`
<MoreMenu
  items={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete },
  ]}
/>
\`\`\``,methods:[],displayName:"MoreMenu",props:{ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLButtonElement>",elements:[{name:"HTMLButtonElement"}]},description:"Ref forwarded to the trigger button"},items:{required:!0,tsType:{name:"Array",elements:[{name:"union",raw:`| DropdownMenuItemData
| DropdownMenuDivider
| DropdownMenuSection`,elements:[{name:"DropdownMenuItemData"},{name:"DropdownMenuDivider"},{name:"DropdownMenuSection"}]}],raw:"DropdownMenuOption[]"},description:"Menu items \\u2014 data array of actions, dividers, and sections.\nSame type as DropdownMenu's `items` prop."},label:{required:!1,tsType:{name:"string"},description:`Accessible label for the trigger button.
Always used as aria-label (the button is always icon-only).
@default 'More options'`,defaultValue:{value:"'More options'",computed:!1}},variant:{required:!1,tsType:{name:"ButtonVariantMap"},description:`Visual style variant of the trigger button.
@default 'ghost'`,defaultValue:{value:"'ghost'",computed:!1}},size:{required:!1,tsType:{name:"unknown"},description:`Size of the trigger button.
@default 'md'`},icon:{required:!1,tsType:{name:"ReactNode"},description:`Override the default three-dot icon.
@default Three horizontal dots from the icon registry ('moreHorizontal')`},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Whether the menu trigger is disabled.
@default false`,defaultValue:{value:"false",computed:!1}},isMenuOpen:{required:!1,tsType:{name:"boolean"},description:"Controlled open state for the menu."},onOpenChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(isOpen: boolean) => void",signature:{arguments:[{type:{name:"boolean"},name:"isOpen"}],return:{name:"void"}}},description:"Callback fired when the menu visibility changes."},hasAutoFocus:{required:!1,tsType:{name:"boolean"},description:"Whether to auto-focus the first menu item when the menu opens.\nSet to `false` for inline showcases or documentation previews.\n@default true"},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for testing frameworks."}},composes:["Pick"]};export{o as M};
