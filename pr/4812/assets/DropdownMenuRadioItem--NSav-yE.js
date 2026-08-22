import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{n as r}from"./themeProps-BLML-F6E.js";import{O as i,t as a}from"./utils-BesPgzBU.js";import{t as o}from"./jsx-runtime-DqZldVDK.js";import{r as s}from"./Icon-CkjDmmF2.js";import{t as c}from"./Icon-DzF2ts4S.js";import{n as l,t as u}from"./Item-Cd_dbV6s.js";import{c as d,d as f,f as p,p as m,s as h,u as g}from"./renderDropdownItems-CZmpWUkr.js";import{a as _,t as v}from"./Indicator-BT5vGEPi.js";function y({label:e,description:t,icon:n,value:a,onChange:o,isDisabled:c=!1,hasCloseOnSelect:u=!1,endContent:d,xstyle:f,className:m,style:g,...v}){let y=p(),C=y?.menuSize??`md`,w=C===`sm`?`sm`:`md`,T=_(`checkbox`),E=(0,b.useCallback)(()=>{c||(o?.(!a),u&&y?.closeMenu())},[c,o,a,u,y]),D=(0,b.useCallback)(e=>h(e,c),[c]);return(0,x.jsx)(l,{...v,role:`menuitemcheckbox`,"aria-checked":a,tabIndex:c?void 0:-1,onPointerMove:D,marker:(0,x.jsx)(T,{state:a?`checked`:`unchecked`,size:w,isDisabled:c,xstyle:S.marker}),startContent:n?s(n,{size:`sm`,color:`secondary`}):void 0,label:e,description:t,endContent:d,onClick:E,isDisabled:c,xstyle:[S.root,c&&S.disabled,f],...i(r(`dropdown-menu-item`,{size:C}),{className:m,style:g})})}var b,x,S,C=e((()=>{b=t(n(),1),c(),v(),u(),f(),d(),a(),x=o(),S={root:{kzqmXN:`astryxh8yej3`,kaIpWk:`astryx1ws5lxm`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kMwMTN:`astryx1tgivj0`,kWkggS:`astryxjbqb8w astryx1c52tdz`,kkrTdU:`astryx1ypdohk`,kI3sdo:`astryx1a2a7pz`,kjBf7l:null,kInvED:null,k3XXqK:null,kMeerF:null,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,kkrTdU:`astryx1h6gzvc`,$$css:!0},marker:{kfzvcC:`astryx47corl`,kayTVb:`astryx1g77sc7 astryxozvky`,keTefX:`astryx1lziwak astryx1jymrmb`,koQZXg:null,km5ZXQ:null,$$css:!0}},y.displayName=`DropdownMenuCheckboxItem`,y.__docgenInfo={description:`A checkable dropdown menu item (role="menuitemcheckbox").

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
shortcut hint or badge.`}},composes:[`Omit`]}}));function w({value:e,onChange:t,label:n,hasCloseOnSelect:r=!0,children:a,className:o,style:s,...c}){let l=(0,T.useMemo)(()=>({value:e,onChange:t,hasCloseOnSelect:r}),[e,t,r]);return(0,E.jsx)(`div`,{...c,role:`group`,"aria-label":n,...i({className:`astryx78zum5 astryxdt5ytf astryx1lsbc85`},{className:o,style:s}),children:(0,E.jsx)(g,{value:l,children:a})})}var T,E,D=e((()=>{T=t(n(),1),a(),f(),E=o(),w.displayName=`DropdownMenuRadioGroup`,w.__docgenInfo={description:`A single-select group of radio menu items (role="group" of menuitemradio).

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
@default true`,defaultValue:{value:`true`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:"The `DropdownMenuRadioItem`s that make up the group."}},composes:[`Omit`]}}));function O({value:e,label:t,description:n,icon:a,isDisabled:o=!1,endContent:c,xstyle:u,className:d,style:f,...g}){let v=p(),y=m();if(!y)throw Error(`DropdownMenuRadioItem must be used within a DropdownMenuRadioGroup`);let b=v?.menuSize??`md`,x=b===`sm`?`sm`:`md`,S=y.value===e,C=_(`radio`),w=(0,k.useCallback)(()=>{o||(y.onChange(e),y.hasCloseOnSelect&&v?.closeMenu())},[o,y,e,v]),T=(0,k.useCallback)(e=>h(e,o),[o]);return(0,A.jsx)(l,{...g,role:`menuitemradio`,"aria-checked":S,tabIndex:o?void 0:-1,onPointerMove:T,marker:(0,A.jsx)(C,{state:S?`checked`:`unchecked`,size:x,isDisabled:o,xstyle:j.marker,...r(`dropdown-menu-radio`,{size:x,checked:S?`checked`:null,disabled:o?`disabled`:null})}),startContent:a?s(a,{size:`sm`,color:`secondary`}):void 0,label:t,description:n,endContent:c,onClick:w,isDisabled:o,xstyle:[j.root,o&&j.disabled,u],...i(r(`dropdown-menu-item`,{size:b}),{className:d,style:f})})}var k,A,j,M=e((()=>{k=t(n(),1),c(),v(),u(),f(),d(),a(),A=o(),j={root:{kzqmXN:`astryxh8yej3`,kaIpWk:`astryx1ws5lxm`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,kMwMTN:`astryx1tgivj0`,kWkggS:`astryxjbqb8w astryx1c52tdz`,kkrTdU:`astryx1ypdohk`,kI3sdo:`astryx1a2a7pz`,kjBf7l:null,kInvED:null,k3XXqK:null,kMeerF:null,$$css:!0},disabled:{kSiTet:`astryxbyyjgo`,kkrTdU:`astryx1h6gzvc`,$$css:!0},marker:{kfzvcC:`astryx47corl`,kayTVb:`astryx1g77sc7 astryxozvky`,keTefX:`astryx1lziwak astryx1jymrmb`,koQZXg:null,km5ZXQ:null,$$css:!0}},O.displayName=`DropdownMenuRadioItem`,O.__docgenInfo={description:`A single option in a DropdownMenuRadioGroup (role="menuitemradio").

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
metadata.`}},composes:[`Omit`]}}));export{y as a,D as i,M as n,C as o,w as r,O as t};