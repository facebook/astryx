import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{D as r,F as i,P as a}from"./ime-Dy4QRKoo.js";import{F as o,t as s}from"./utils-BiEIGw-d.js";import{t as c}from"./jsx-runtime-DqZldVDK.js";import{r as l}from"./Icon-aeuwryOS.js";import{t as u}from"./Icon-DeqRYbQn.js";import{n as d,t as f}from"./Item-Cf2TsDdr.js";import{f as p,h as m,l as h,m as g,p as _,u as v}from"./renderDropdownItems-DvJk1tEW.js";import{a as y,t as b}from"./Indicator-kHSjhAby.js";function x({label:e,description:t,icon:n,value:i,onChange:a,isDisabled:s=!1,hasCloseOnSelect:c=!1,endContent:u,xstyle:f,className:p,style:m,..._}){let v=g(),b=v?.menuSize??`md`,x=b===`sm`?`sm`:`md`,T=y(`checkbox`),E=(0,S.useCallback)(()=>{s||(a?.(!i),c&&v?.closeMenu())},[s,a,i,c,v]),D=(0,S.useCallback)(e=>h(e,s),[s]);return(0,C.jsx)(d,{..._,role:`menuitemcheckbox`,"aria-checked":i,tabIndex:s?void 0:-1,onPointerMove:D,marker:(0,C.jsx)(T,{state:i?`checked`:`unchecked`,size:x,isDisabled:s,xstyle:w.marker}),startContent:n?l(n,{size:`sm`,color:`secondary`}):void 0,label:e,description:t,endContent:u,onClick:E,isDisabled:s,xstyle:[w.root,s&&w.disabled,f],...o(r(`dropdown-menu-item`,{size:b}),{className:p,style:m})})}var S,C,w,T=e((()=>{S=t(n(),1),u(),b(),f(),_(),v(),s(),C=c(),w={root:{kzqmXN:`astryxh8yej3`,kaIpWk:`astryx1ws5lxm`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kMwMTN:`astryx1tgivj0`,kWkggS:`astryxjbqb8w astryx1c52tdz`,kkrTdU:`astryx1ypdohk astryx16khyan`,kI3sdo:`astryx1a2a7pz`,kjBf7l:null,kInvED:null,k3XXqK:null,kMeerF:null,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,kkrTdU:`astryxt0e3qv`,$$css:!0},marker:{kfzvcC:`astryx47corl`,kayTVb:`astryx1g77sc7 astryxozvky`,keTefX:`astryx1lziwak astryx1jymrmb`,koQZXg:null,km5ZXQ:null,$$css:!0}},x.displayName=`DropdownMenuCheckboxItem`,x.__docgenInfo={description:`A checkable dropdown menu item (role="menuitemcheckbox").

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
shortcut hint or badge.`}},composes:[`Omit`]}}));function E({value:e,onChange:t,label:n,hasCloseOnSelect:r=!0,children:a,xstyle:s,className:c,style:l,...u}){let d=(0,D.useMemo)(()=>({value:e,onChange:t,hasCloseOnSelect:r}),[e,t,r]);return(0,O.jsx)(`div`,{...u,role:`group`,"aria-label":n,...o(i(k.group,s),{className:c,style:l}),children:(0,O.jsx)(p,{value:d,children:a})})}var D,O,k,A=e((()=>{D=t(n(),1),a(),s(),_(),O=c(),k={group:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kOIVth:`astryx1lsbc85`,$$css:!0}},E.displayName=`DropdownMenuRadioGroup`,E.__docgenInfo={description:`A single-select group of radio menu items (role="group" of menuitemradio).

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
@default true`,defaultValue:{value:`true`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:"The `DropdownMenuRadioItem`s that make up the group."}},composes:[`Omit`]}}));function j({value:e,label:t,description:n,icon:i,isDisabled:a=!1,endContent:s,xstyle:c,className:u,style:f,...p}){let _=g(),v=m();if(!v)throw Error(`DropdownMenuRadioItem must be used within a DropdownMenuRadioGroup`);let b=_?.menuSize??`md`,x=b===`sm`?`sm`:`md`,S=v.value===e,C=y(`radio`),w=(0,M.useCallback)(()=>{a||(v.onChange(e),v.hasCloseOnSelect&&_?.closeMenu())},[a,v,e,_]),T=(0,M.useCallback)(e=>h(e,a),[a]);return(0,N.jsx)(d,{...p,role:`menuitemradio`,"aria-checked":S,tabIndex:a?void 0:-1,onPointerMove:T,marker:(0,N.jsx)(C,{state:S?`checked`:`unchecked`,size:x,isDisabled:a,xstyle:P.marker,...r(`dropdown-menu-radio`,{size:x,checked:S?`checked`:null,disabled:a?`disabled`:null})}),startContent:i?l(i,{size:`sm`,color:`secondary`}):void 0,label:t,description:n,endContent:s,onClick:w,isDisabled:a,xstyle:[P.root,a&&P.disabled,c],...o(r(`dropdown-menu-item`,{size:b}),{className:u,style:f})})}var M,N,P,F=e((()=>{M=t(n(),1),u(),b(),f(),_(),v(),s(),N=c(),P={root:{kzqmXN:`astryxh8yej3`,kaIpWk:`astryx1ws5lxm`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kMwMTN:`astryx1tgivj0`,kWkggS:`astryxjbqb8w astryx1c52tdz`,kkrTdU:`astryx1ypdohk astryx16khyan`,kI3sdo:`astryx1a2a7pz`,kjBf7l:null,kInvED:null,k3XXqK:null,kMeerF:null,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,kkrTdU:`astryxt0e3qv`,$$css:!0},marker:{kfzvcC:`astryx47corl`,kayTVb:`astryx1g77sc7 astryxozvky`,keTefX:`astryx1lziwak astryx1jymrmb`,koQZXg:null,km5ZXQ:null,$$css:!0}},j.displayName=`DropdownMenuRadioItem`,j.__docgenInfo={description:`A single option in a DropdownMenuRadioGroup (role="menuitemradio").

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
metadata.`}},composes:[`Omit`]}}));export{x as a,A as i,F as n,T as o,E as r,j as t};