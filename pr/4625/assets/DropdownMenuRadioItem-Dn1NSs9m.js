import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{l as r,n as i,u as a}from"./themeProps-_oSbOSxB.js";import{O as o,t as s}from"./utils-HhVKRT_p.js";import{t as c}from"./jsx-runtime-DqZldVDK.js";import{o as l,t as u}from"./Icon-C2DlvmtO.js";import{n as d,t as f}from"./Item-3CD4ijTL.js";import{_ as p,d as m,f as h,g,h as _,m as v}from"./renderDropdownItems-TQOB9w1N.js";import{n as y,t as b}from"./CheckboxInput-CpyOBP_D.js";function x({label:e,description:t,icon:n,value:r,onChange:a,isDisabled:s=!1,hasCloseOnSelect:c=!1,endContent:u,xstyle:f,className:p,style:h,..._}){let v=g(),y=v?.menuSize??`md`,x=y===`sm`?`sm`:`md`,T=typeof e==`string`?e:``,E=(0,S.useCallback)(()=>{s||(a?.(!r),c&&v?.closeMenu())},[s,a,r,c,v]),D=(0,S.useCallback)(e=>m(e,s),[s]);return(0,C.jsx)(d,{..._,role:`menuitemcheckbox`,"aria-checked":r,tabIndex:s?void 0:-1,onPointerMove:D,marker:(0,C.jsx)(`div`,{"aria-hidden":`true`,inert:!0,className:`astryx78zum5 astryx2lah0s astryx47corl astryx1g77sc7 astryxozvky astryx1lziwak astryx1jymrmb`,children:(0,C.jsx)(b,{label:T,isLabelHidden:!0,value:r,isDisabled:s,size:x})}),startContent:n?l(n,{size:`sm`,color:`secondary`}):void 0,label:e,description:t,endContent:u,onClick:E,isDisabled:s,xstyle:[w.root,s&&w.disabled,f],...o(i(`dropdown-menu-item`,{size:y}),{className:p,style:h})})}var S,C,w,T=e((()=>{S=t(n(),1),u(),y(),f(),_(),h(),s(),C=c(),w={root:{kzqmXN:`astryxh8yej3`,kaIpWk:`astryx1ws5lxm`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kMwMTN:`astryx1tgivj0`,kWkggS:`astryxjbqb8w astryx1c52tdz`,kkrTdU:`astryx1ypdohk`,kI3sdo:`astryx1a2a7pz`,kjBf7l:null,kInvED:null,k3XXqK:null,kMeerF:null,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,kkrTdU:`astryx1h6gzvc`,$$css:!0}},x.displayName=`DropdownMenuCheckboxItem`,x.__docgenInfo={description:`A checkable dropdown menu item (role="menuitemcheckbox").

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
shortcut hint or badge.`}},composes:[`Omit`]}}));function E({value:e,onChange:t,label:n,hasCloseOnSelect:r=!0,children:i,className:a,style:s,...c}){let l=(0,D.useMemo)(()=>({value:e,onChange:t,hasCloseOnSelect:r}),[e,t,r]);return(0,O.jsx)(`div`,{...c,role:`group`,"aria-label":n,...o({className:`astryx78zum5 astryxdt5ytf astryx1lsbc85`},{className:a,style:s}),children:(0,O.jsx)(v,{value:l,children:i})})}var D,O,k=e((()=>{D=t(n(),1),s(),_(),O=c(),E.displayName=`DropdownMenuRadioGroup`,E.__docgenInfo={description:`A single-select group of radio menu items (role="group" of menuitemradio).

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
@default true`,defaultValue:{value:`true`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:"The `DropdownMenuRadioItem`s that make up the group."}},composes:[`Omit`]}}));function A({value:e,label:t,description:n,icon:r,isDisabled:s=!1,endContent:c,xstyle:u,className:f,style:h,..._}){let v=g(),y=p();if(!y)throw Error(`DropdownMenuRadioItem must be used within a DropdownMenuRadioGroup`);let b=v?.menuSize??`md`,x=b===`sm`?`sm`:`md`,S=y.value===e,C=(0,j.useCallback)(()=>{s||(y.onChange(e),y.hasCloseOnSelect&&v?.closeMenu())},[s,y,e,v]),w=(0,j.useCallback)(e=>m(e,s),[s]);return(0,M.jsx)(d,{..._,role:`menuitemradio`,"aria-checked":S,tabIndex:s?void 0:-1,onPointerMove:w,marker:(0,M.jsx)(`span`,{"aria-hidden":`true`,...o(i(`dropdown-menu-radio`,{size:x,checked:S?`checked`:null,disabled:s?`disabled`:null}),a(N.circle,P[x],S?N.checked:N.unchecked)),children:S&&(0,M.jsx)(`span`,{...o(i(`dropdown-menu-radio-dot`,{size:x,checked:`checked`,disabled:s?`disabled`:null}),a(N.dot,F[x]))})}),startContent:r?l(r,{size:`sm`,color:`secondary`}):void 0,label:t,description:n,endContent:c,onClick:C,isDisabled:s,xstyle:[N.root,s&&N.disabled,u],...o(i(`dropdown-menu-item`,{size:b}),{className:f,style:h})})}var j,M,N,P,F,I=e((()=>{j=t(n(),1),r(),u(),f(),_(),h(),s(),M=c(),N={root:{kzqmXN:`astryxh8yej3`,kaIpWk:`astryx1ws5lxm`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kMwMTN:`astryx1tgivj0`,kWkggS:`astryxjbqb8w astryx1c52tdz`,kkrTdU:`astryx1ypdohk`,kI3sdo:`astryx1a2a7pz`,kjBf7l:null,kInvED:null,k3XXqK:null,kMeerF:null,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,kkrTdU:`astryx1h6gzvc`,$$css:!0},circle:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kmuXW:`astryx2lah0s`,kB7OPa:`astryx9f619`,kMzoRj:`astryx1litavf`,ksu8eU:`astryx1y0btm7`,kaIpWk:`astryx16rqkct`,k1ekBW:`astryxts7igz`,kIyJzY:`astryxuedmi6 astryx12w9bfk`,kAMwcw:`astryxlr8y92`,kayTVb:`astryx1g77sc7 astryxozvky`,keTefX:`astryx1lziwak astryx1jymrmb`,$$css:!0},unchecked:{kVAM5u:`astryxvy26l8`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kWkggS:`astryx10xzikg`,$$css:!0},checked:{kVAM5u:`astryxad5do`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kWkggS:`astryx1ewilqj`,$$css:!0},dot:{kaIpWk:`astryx16rqkct`,kWkggS:`astryx1azo05`,$$css:!0}},P={sm:{kzqmXN:`astryx1xp8n7a`,kZKoxP:`astryxmix8c7`,$$css:!0},md:{kzqmXN:`astryx17z2i9w`,kZKoxP:`astryx17rw0jw`,$$css:!0}},F={sm:{kzqmXN:`astryx1v4s8kt`,kZKoxP:`astryxols6we`,$$css:!0},md:{kzqmXN:`astryx1xc55vz`,kZKoxP:`astryxdk7pt`,$$css:!0}},A.displayName=`DropdownMenuRadioItem`,A.__docgenInfo={description:`A single option in a DropdownMenuRadioGroup (role="menuitemradio").

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
metadata.`}},composes:[`Omit`]}}));export{x as a,k as i,I as n,T as o,E as r,A as t};