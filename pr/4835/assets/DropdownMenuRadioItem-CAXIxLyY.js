import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a,t as o}from"./themeProps-CREkzZh6.js";import{t as s}from"./jsx-runtime-DeHZSEgm.js";import{n as c,r as l}from"./Icon-C24cO4CC.js";import{n as u,t as d}from"./Item-iMHCR9kf.js";import{d as f,f as p,p as m,s as h,u as g}from"./renderDropdownItems-BttNFrw6.js";import{n as _,t as v}from"./CheckboxInput-DJd8Fdr_.js";function y({label:e,description:t,icon:n,value:r,onChange:o,isDisabled:s=!1,hasCloseOnSelect:c=!1,endContent:u,xstyle:f,className:m,style:g,..._}){let y=p(),C=y?.menuSize??`md`,w=C===`sm`?`sm`:`md`,T=typeof e==`string`?e:``,E=(0,b.useCallback)(()=>{s||(o?.(!r),c&&y?.closeMenu())},[s,o,r,c,y]),D=(0,b.useCallback)(e=>h(e,s),[s]);return(0,x.jsx)(d,{..._,role:`menuitemcheckbox`,"aria-checked":r,tabIndex:s?void 0:-1,onPointerMove:D,marker:(0,x.jsx)(`div`,{"aria-hidden":`true`,inert:!0,className:`astryx78zum5 astryx2lah0s astryx47corl astryx1g77sc7 astryxozvky astryx1lziwak astryx1jymrmb`,children:(0,x.jsx)(v,{label:T,isLabelHidden:!0,value:r,isDisabled:s,size:w})}),startContent:n?l(n,{size:`sm`,color:`secondary`}):void 0,label:e,description:t,endContent:u,onClick:E,isDisabled:s,xstyle:[S.root,s&&S.disabled,f],...i(a(`dropdown-menu-item`,{size:C}),{className:m,style:g})})}var b,x,S;function C(){return(C=e((()=>{b=t(),c(),_(),u(),f(),o(),x=s(),S={root:{kzqmXN:`astryxh8yej3`,kaIpWk:`astryx1ws5lxm`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kMwMTN:`astryx1tgivj0`,kWkggS:`astryxjbqb8w astryx1c52tdz`,kkrTdU:`astryx1ypdohk`,kI3sdo:`astryx1a2a7pz`,kjBf7l:null,kInvED:null,k3XXqK:null,kMeerF:null,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,kkrTdU:`astryx1h6gzvc`,$$css:!0}},y.displayName=`DropdownMenuCheckboxItem`,y.__docgenInfo={description:`A checkable dropdown menu item (role="menuitemcheckbox").

Must be used inside a DropdownMenu. Toggles an independent boolean; for a
one-of-N choice use DropdownMenuRadioGroup + DropdownMenuRadioItem instead.

@example
\`\`\`
import {DropdownMenuCheckboxItem} from '@astryxdesign/core/DropdownMenu';
<DropdownMenu button={{label: 'View'}}>
  <DropdownMenuCheckboxItem
    label="Show archived"
    value={showArchived}
    onChange={setShowArchived}
  />
</DropdownMenu>
\`\`\``,methods:[],displayName:`DropdownMenuCheckboxItem`,props:{label:{required:!0,tsType:{name:`ReactNode`},description:`Primary label text identifying the item.`},description:{required:!1,tsType:{name:`ReactNode`},description:`Secondary description text displayed below the label.`},icon:{required:!1,tsType:{name:`union`,raw:`ReactNode | IconType`,elements:[{name:`ReactNode`},{name:`ComponentType`,elements:[{name:`SVGProps`,elements:[{name:`SVGSVGElement`}],raw:`SVGProps<SVGSVGElement>`}],raw:`ComponentType<SVGProps<SVGSVGElement>>`}]},description:"Icon to display before the label. Accepts a semantic icon name (see\n`npx astryx docs icons`) or a rendered node."},value:{required:!0,tsType:{name:`boolean`},description:"Whether the item is checked. Controlled — pair with `onChange`."},onChange:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(checked: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`checked`}],return:{name:`void`}}},description:`Callback fired with the next checked state when the item is toggled.`},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether the item is disabled. Disabled items stay focusable (via
\`aria-disabled\`) so they remain discoverable by keyboard and assistive
technology, but activation is blocked.
@default false`,defaultValue:{value:`false`,computed:!1}},hasCloseOnSelect:{required:!1,tsType:{name:`boolean`},description:`Whether toggling the item closes the menu. Checkbox items default to
staying open so several can be toggled in a single session, unlike radio
items which default to closing on selection.
@default false`,defaultValue:{value:`false`,computed:!1}},endContent:{required:!1,tsType:{name:`ReactNode`},description:`Content to render after the label and description, such as a keyboard
shortcut hint or badge.`}},composes:[`Omit`]}})))()}function w({value:e,onChange:t,label:n,hasCloseOnSelect:r=!0,children:a,className:o,style:s,...c}){let l=(0,T.useMemo)(()=>({value:e,onChange:t,hasCloseOnSelect:r}),[e,t,r]);return(0,E.jsx)(`div`,{...c,role:`group`,"aria-label":n,...i({className:`astryx78zum5 astryxdt5ytf astryx1lsbc85`},{className:o,style:s}),children:(0,E.jsx)(g,{value:l,children:a})})}var T,E;function D(){return(D=e((()=>{T=t(),f(),E=s(),w.displayName=`DropdownMenuRadioGroup`,w.__docgenInfo={description:`A single-select group of radio menu items (role="group" of menuitemradio).

@example
\`\`\`
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@astryxdesign/core/DropdownMenu';
<DropdownMenu button={{label: 'Sort'}}>
  <DropdownMenuRadioGroup value={sort} onChange={setSort} label="Sort by">
    <DropdownMenuRadioItem value="newest" label="Newest" />
    <DropdownMenuRadioItem value="oldest" label="Oldest" />
  </DropdownMenuRadioGroup>
</DropdownMenu>
\`\`\``,methods:[],displayName:`DropdownMenuRadioGroup`,props:{value:{required:!0,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"The currently selected value in the group. Pass `undefined` when nothing\nis selected yet."},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(value: string) => void`,signature:{arguments:[{type:{name:`string`},name:`value`}],return:{name:`void`}}},description:`Callback fired when the selected value changes.`},label:{required:!0,tsType:{name:`string`},description:`Accessible name for the group, announced by screen readers so the radios
read as a named set (e.g. "Sort by"). Applied as the group's \`aria-label\`.
Required -- an unnamed radio group is an accessibility defect. Pass
\`aria-labelledby\` (via base props) instead if the name already exists as a
visible element on the page.`},hasCloseOnSelect:{required:!1,tsType:{name:`boolean`},description:`Whether selecting a value closes the menu. Radio items default to closing
on selection (a single-choice commit), unlike checkbox items which stay
open.
@default true`,defaultValue:{value:`true`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:"The `DropdownMenuRadioItem`s that make up the group."}},composes:[`Omit`]}})))()}function O({value:e,label:t,description:r,icon:o,isDisabled:s=!1,endContent:c,xstyle:u,className:f,style:g,..._}){let v=p(),y=m();if(!y)throw Error(`DropdownMenuRadioItem must be used within a DropdownMenuRadioGroup`);let b=v?.menuSize??`md`,x=b===`sm`?`sm`:`md`,S=y.value===e,C=(0,k.useCallback)(()=>{s||(y.onChange(e),y.hasCloseOnSelect&&v?.closeMenu())},[s,y,e,v]),w=(0,k.useCallback)(e=>h(e,s),[s]);return(0,A.jsx)(d,{..._,role:`menuitemradio`,"aria-checked":S,tabIndex:s?void 0:-1,onPointerMove:w,marker:(0,A.jsx)(`span`,{"aria-hidden":`true`,...i(a(`dropdown-menu-radio`,{size:x,checked:S?`checked`:null,disabled:s?`disabled`:null}),n(j.circle,M[x],S?j.checked:j.unchecked)),children:S&&(0,A.jsx)(`span`,{...i(a(`dropdown-menu-radio-dot`,{size:x,checked:`checked`,disabled:s?`disabled`:null}),n(j.dot,N[x]))})}),startContent:o?l(o,{size:`sm`,color:`secondary`}):void 0,label:t,description:r,endContent:c,onClick:C,isDisabled:s,xstyle:[j.root,s&&j.disabled,u],...i(a(`dropdown-menu-item`,{size:b}),{className:f,style:g})})}var k,A,j,M,N;function P(){return(P=e((()=>{k=t(),r(),c(),u(),f(),o(),A=s(),j={root:{kzqmXN:`astryxh8yej3`,kaIpWk:`astryx1ws5lxm`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kMwMTN:`astryx1tgivj0`,kWkggS:`astryxjbqb8w astryx1c52tdz`,kkrTdU:`astryx1ypdohk`,kI3sdo:`astryx1a2a7pz`,kjBf7l:null,kInvED:null,k3XXqK:null,kMeerF:null,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,kkrTdU:`astryx1h6gzvc`,$$css:!0},circle:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmuXW:`astryx2lah0s`,kB7OPa:`astryx9f619`,kMzoRj:`astryx1litavf`,ksu8eU:`astryx1y0btm7`,kaIpWk:`astryx16rqkct`,k1ekBW:`astryxts7igz`,kIyJzY:`astryxuedmi6 astryx12w9bfk`,kAMwcw:`astryxlr8y92`,kayTVb:`astryx1g77sc7 astryxozvky`,keTefX:`astryx1lziwak astryx1jymrmb`,$$css:!0},unchecked:{kVAM5u:`astryxvy26l8`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kWkggS:`astryx10xzikg`,$$css:!0},checked:{kVAM5u:`astryxad5do`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kWkggS:`astryx1ewilqj`,$$css:!0},dot:{kaIpWk:`astryx16rqkct`,kWkggS:`astryx1azo05`,$$css:!0}},M={sm:{kzqmXN:`astryx1xp8n7a`,kZKoxP:`astryxmix8c7`,$$css:!0},md:{kzqmXN:`astryx17z2i9w`,kZKoxP:`astryx17rw0jw`,$$css:!0}},N={sm:{kzqmXN:`astryx1v4s8kt`,kZKoxP:`astryxols6we`,$$css:!0},md:{kzqmXN:`astryx1xc55vz`,kZKoxP:`astryxdk7pt`,$$css:!0}},O.displayName=`DropdownMenuRadioItem`,O.__docgenInfo={description:`A single option in a DropdownMenuRadioGroup (role="menuitemradio").

@example
\`\`\`
<DropdownMenuRadioGroup value={sort} onChange={setSort} label="Sort by">
  <DropdownMenuRadioItem value="newest" label="Newest" />
  <DropdownMenuRadioItem value="oldest" label="Oldest" icon="clock" />
</DropdownMenuRadioGroup>
\`\`\``,methods:[],displayName:`DropdownMenuRadioItem`,props:{value:{required:!0,tsType:{name:`string`},description:"The value this item represents within its group. The group's `value`\nmatches against this to determine the checked state."},label:{required:!0,tsType:{name:`ReactNode`},description:`Primary label text identifying the option.`},description:{required:!1,tsType:{name:`ReactNode`},description:`Secondary description text displayed below the label.`},icon:{required:!1,tsType:{name:`union`,raw:`ReactNode | IconType`,elements:[{name:`ReactNode`},{name:`ComponentType`,elements:[{name:`SVGProps`,elements:[{name:`SVGSVGElement`}],raw:`SVGProps<SVGSVGElement>`}],raw:`ComponentType<SVGProps<SVGSVGElement>>`}]},description:"Icon to display before the label. Accepts a semantic icon name (see\n`npx astryx docs icons`) or a rendered node."},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Whether this individual radio item is disabled. Disabled items stay
focusable (via \`aria-disabled\`) so they remain discoverable by keyboard
and assistive technology, but selection is blocked.
@default false`,defaultValue:{value:`false`,computed:!1}},endContent:{required:!1,tsType:{name:`ReactNode`},description:`Content to render after the label and description, such as a badge or
metadata.`}},composes:[`Omit`]}})))()}export{y as a,D as i,P as n,C as o,w as r,O as t};