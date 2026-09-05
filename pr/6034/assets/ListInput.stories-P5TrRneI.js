import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-CUw_qAJO.js";import{x as a}from"./theme-DnizdbAi.js";import{t as o}from"./Text-B194cPHg.js";import{n as s,t as c}from"./Selector-BOupLhce.js";import{a as l,i as u}from"./columnUtils-DaUh822W.js";import{n as d,t as f}from"./DateInput-mLSh9V3_.js";import{n as p,t as m}from"./TextInput-CRqL-Br2.js";import{n as ee,t as h}from"./NumberInput-CEtWhEqR.js";import{dt as g,l as _,s as te,u as ne}from"./iframe-C9K_Xcjh.js";import{i as v,t as y}from"./src-Ddbg_THp.js";function re(e){let t=e.label.trim().toLowerCase();return e.color===`green`&&t===`blocked`||e.color===`red`&&t===`success`}function b(){let[e,t]=(0,k.useState)(()=>new Set),n=(0,k.useCallback)((e,n)=>{let r=x(e,n);t(e=>{if(e.has(r))return e;let t=new Set(e);return t.add(r),t})},[]);return{isFieldTouched:(0,k.useCallback)((t,n)=>e.has(x(t,n)),[e]),markFieldTouched:n}}function x(e,t){return JSON.stringify([e,t])}function S(e){return[{key:`color`,header:`Color`,width:l(1,{minWidth:120}),renderInput:({item:t,label:n,isLabelHidden:r,status:i,statusVariant:a,isDisabled:o,updateItem:c})=>(0,A.jsx)(s,{label:n,isLabelHidden:r,options:M,value:t.color,onChange:e=>c({...t,color:e},`color`),status:i,statusVariant:a,isDisabled:o,onBlur:()=>e(t.id,`color`)})},{key:`label`,header:`Label`,width:l(2,{minWidth:200}),renderInput:({item:t,label:n,isLabelHidden:r,status:i,statusVariant:a,isDisabled:o,isLoading:s,updateItem:c})=>(0,A.jsx)(p,{label:n,isLabelHidden:r,value:t.label,onChange:e=>c({...t,label:e},`label`),status:i,statusVariant:a,isDisabled:o,isLoading:s,onBlur:()=>e(t.id,`label`)})}]}function C({isReorderable:e}){let[t,n]=(0,k.useState)(N),{isFieldTouched:r,markFieldTouched:i}=b(),a=(0,k.useMemo)(()=>S(i),[i]);return(0,A.jsx)(v,{label:`Tag options`,description:e?`Add at least five tags and drag rows to set their order. Field errors appear after the first blur.`:`Add at least five tags. Items remain in the order they were added; field errors appear after the first blur.`,value:t,onChange:n,getItemKey:e=>e.id,createItem:()=>({id:crypto.randomUUID(),color:`blue`,label:``}),columns:a,itemName:`tag`,status:t.length<5?{type:`error`,message:`Add at least five tag options.`}:void 0,getItemStatus:e=>re(e)?{type:`error`,message:`“${e.label}” cannot use ${e.color}.`}:void 0,getFieldStatus:(e,t)=>r(e.id,t)&&t===`label`&&e.label.trim()===``?{type:`error`,message:`Enter a label.`}:void 0,isReorderable:e||void 0})}function w(e){let t=e.trim(),n=t.indexOf(`@`),r=t.lastIndexOf(`.`);return n>0&&r>n+1&&r<t.length-1}function T(){let[e,t]=(0,k.useState)([]),[n,r]=(0,k.useState)(!1),{isFieldTouched:i,markFieldTouched:a}=b(),o=(0,k.useMemo)(()=>[{key:`email`,header:`Email address`,width:l(1,{minWidth:240}),renderInput:({item:e,label:t,isLabelHidden:n,status:r,statusVariant:i,isDisabled:o,isLoading:s,updateItem:c})=>(0,A.jsx)(p,{type:`email`,label:t,isLabelHidden:n,value:e.email,placeholder:`name@example.com`,onChange:t=>c({...e,email:t},`email`),onBlur:()=>a(e.id,`email`),status:r,statusVariant:i,isDisabled:o,isLoading:s})}],[a]);return(0,A.jsx)(v,{label:`Mailing list`,description:`Start empty, add up to six addresses, and remove the final row to exercise focus restoration and required-list validation.`,value:e,onChange:(0,k.useCallback)(e=>{t(e),r(!0)},[]),getItemKey:e=>e.id,createItem:()=>({id:crypto.randomUUID(),email:``}),columns:o,itemName:`subscriber`,status:n&&e.length===0?{type:`error`,message:`Add at least one subscriber.`}:void 0,getItemStatus:t=>{let n=t.email.trim().toLowerCase();return n!==``&&e.some(e=>e.id!==t.id&&e.email.trim().toLowerCase()===n)?{type:`error`,message:`This address is already in the list.`}:void 0},getFieldStatus:(e,t)=>{if(!(t!==`email`||!i(e.id,t)))return e.email.trim()===``?{type:`error`,message:`Enter an email address.`}:w(e.email)?void 0:{type:`error`,message:`Enter a valid email address.`}},isRequired:!0,maxItems:6})}function E(){let[e,t]=(0,k.useState)(R),{isFieldTouched:n,markFieldTouched:r}=b(),i=e.reduce((e,t)=>e+(t.percent??0),0);return(0,A.jsx)(v,{label:`Quarterly budget allocation`,description:`Assign each team once. The percentages across every row must total 100%.`,value:e,onChange:t,getItemKey:e=>e.id,createItem:()=>({id:crypto.randomUUID(),team:``,percent:null}),columns:(0,k.useMemo)(()=>[{key:`team`,header:`Team`,width:l(2,{minWidth:180}),renderInput:({item:e,label:t,isLabelHidden:n,status:i,statusVariant:a,isDisabled:o,isLoading:c,updateItem:l})=>(0,A.jsx)(s,{label:t,isLabelHidden:n,options:L,value:e.team,placeholder:`Choose a team`,onChange:t=>l({...e,team:t},`team`),onBlur:()=>r(e.id,`team`),status:i,statusVariant:a,isDisabled:o||c})},{key:`percent`,header:`Allocation`,width:u(132),renderInput:({item:e,label:t,isLabelHidden:n,status:i,statusVariant:a,isDisabled:o,isLoading:s,updateItem:c})=>(0,A.jsx)(ee,{label:t,isLabelHidden:n,value:e.percent,onChange:t=>c({...e,percent:t},`percent`),onBlur:()=>r(e.id,`percent`),status:i,statusVariant:a,isDisabled:o||s,min:0,max:100,units:`%`,isIntegerOnly:!0})}],[r]),itemName:`allocation`,status:i===100?void 0:{type:`error`,message:`Allocations must total 100%. Current total: ${i}%.`},getItemStatus:t=>t.team!==``&&e.some(e=>e.id!==t.id&&e.team===t.team)?{type:`error`,message:`Each team can only appear once.`}:void 0,getFieldStatus:(e,t)=>{if(n(e.id,t)){if(t===`team`&&e.team===``)return{type:`error`,message:`Choose a team.`};if(t===`percent`&&e.percent==null)return{type:`error`,message:`Enter an allocation.`};if(t===`percent`&&e.percent!=null&&(e.percent<0||e.percent>100))return{type:`error`,message:`Use a value from 0 to 100.`}}},isRequired:!0,maxItems:4})}function D(){let[e,t]=(0,k.useState)(H),{isFieldTouched:n,markFieldTouched:r}=b();return(0,A.jsx)(v,{label:`Family member declaration`,description:`Declare each immediate family member, their relationship to you, and their date of birth.`,value:e,onChange:t,getItemKey:e=>e.id,createItem:()=>({id:crypto.randomUUID(),fullName:``,relationship:``,dateOfBirth:void 0}),columns:(0,k.useMemo)(()=>[{key:`fullName`,header:`Full legal name`,width:l(2,{minWidth:200}),renderInput:({item:e,label:t,isLabelHidden:n,status:i,statusVariant:a,isDisabled:o,isLoading:s,updateItem:c})=>(0,A.jsx)(p,{label:t,isLabelHidden:n,value:e.fullName,onChange:t=>c({...e,fullName:t},`fullName`),onBlur:()=>r(e.id,`fullName`),status:i,statusVariant:a,isDisabled:o,isLoading:s})},{key:`relationship`,header:`Relationship`,width:l(1.25,{minWidth:160}),renderInput:({item:e,label:t,isLabelHidden:n,status:i,statusVariant:a,isDisabled:o,isLoading:c,updateItem:l})=>(0,A.jsx)(s,{label:t,isLabelHidden:n,options:B,value:e.relationship,placeholder:`Choose relationship`,onChange:t=>l({...e,relationship:t},`relationship`),onBlur:()=>r(e.id,`relationship`),status:i,statusVariant:a,isDisabled:o||c})},{key:`dateOfBirth`,header:`Date of birth`,width:u(176),renderInput:({item:e,label:t,isLabelHidden:n,status:i,statusVariant:a,isDisabled:o,isLoading:s,updateItem:c})=>(0,A.jsx)(d,{label:t,isLabelHidden:n,value:e.dateOfBirth,onChange:t=>c({...e,dateOfBirth:t},`dateOfBirth`),onBlur:()=>r(e.id,`dateOfBirth`),status:i,statusVariant:a,isDisabled:o,isLoading:s,max:V})}],[r]),itemName:`family member`,getItemStatus:(t,n)=>{if(t.fullName.trim()===``||t.dateOfBirth==null)return;let r=t.fullName.trim().toLowerCase();return e.findIndex(e=>e.fullName.trim().toLowerCase()===r&&e.dateOfBirth===t.dateOfBirth)===n?void 0:{type:`error`,message:`This family member appears more than once.`}},getFieldStatus:(e,t)=>{if(n(e.id,t)){if(t===`fullName`&&e.fullName.trim()===``)return{type:`error`,message:`Enter a full legal name.`};if(t===`relationship`&&e.relationship===``)return{type:`error`,message:`Choose a relationship.`};if(t===`dateOfBirth`&&e.dateOfBirth==null)return{type:`error`,message:`Choose a date of birth.`};if(t===`dateOfBirth`&&e.dateOfBirth!=null&&e.dateOfBirth>V)return{type:`error`,message:`Date of birth cannot be in the future.`}}},isRequired:!0})}function ie(){let[e,t]=(0,k.useState)(G),{isFieldTouched:n,markFieldTouched:r}=b();return(0,A.jsx)(`div`,{className:`x1cvmir6 x193iq5w`,children:(0,A.jsx)(v,{label:`Multi-city itinerary`,description:`At this width, each leg stacks its two fields while keeping reorder and remove controls available.`,value:e,onChange:t,getItemKey:e=>e.id,createItem:()=>({id:crypto.randomUUID(),destination:``,departureDate:void 0}),columns:(0,k.useMemo)(()=>[{key:`destination`,header:`Destination`,width:l(3,{minWidth:200}),renderInput:({item:e,label:t,isLabelHidden:n,status:i,statusVariant:a,isDisabled:o,isLoading:s,updateItem:c})=>(0,A.jsx)(p,{label:t,isLabelHidden:n,value:e.destination,onChange:t=>c({...e,destination:t},`destination`),onBlur:()=>r(e.id,`destination`),status:i,statusVariant:a,isDisabled:o,isLoading:s})},{key:`departureDate`,header:`Departure`,width:l(2,{minWidth:180}),renderInput:({item:e,label:t,isLabelHidden:n,status:i,statusVariant:a,isDisabled:o,isLoading:s,updateItem:c})=>(0,A.jsx)(d,{label:t,isLabelHidden:n,value:e.departureDate,onChange:t=>c({...e,departureDate:t},`departureDate`),onBlur:()=>r(e.id,`departureDate`),status:i,statusVariant:a,isDisabled:o,isLoading:s,min:`2026-09-01`,max:`2026-12-31`})}],[r]),itemName:`leg`,getItemStatus:(t,n)=>{let r=e[n-1]?.departureDate;return n>0&&r!=null&&t.departureDate!=null&&t.departureDate<r?{type:`error`,message:`Departure dates must follow the itinerary order.`}:void 0},getFieldStatus:(e,t)=>{if(n(e.id,t)){if(t===`destination`&&e.destination.trim()===``)return{type:`error`,message:`Enter a destination.`};if(t===`departureDate`&&e.departureDate==null)return{type:`error`,message:`Choose a departure date.`}}},isReorderable:!0,isRequired:!0})})}function O({isDisabled:e,isLoading:t,status:n}){let[r,i]=(0,k.useState)(N.slice(0,3));return(0,A.jsx)(v,{label:`Tag options`,description:`Each row keeps its colour and label.`,value:r,onChange:i,getItemKey:e=>e.id,createItem:()=>({id:crypto.randomUUID(),color:`blue`,label:``}),columns:(0,k.useMemo)(()=>S(()=>{}),[]),itemName:`tag`,isDisabled:e,isLoading:t,status:n,isReorderable:!0})}function ae(){let[e,t]=(0,k.useState)(X);return(0,A.jsx)(v,{label:`Tag options at volume`,description:`Twenty-five records, every fifth one carrying an over-long label.`,value:e,onChange:t,getItemKey:e=>e.id,createItem:()=>({id:crypto.randomUUID(),color:`blue`,label:``}),columns:(0,k.useMemo)(()=>S(()=>{}),[]),itemName:`tag`,isReorderable:!0})}var k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$;e((()=>{k=t(n()),f(),h(),c(),g(),o(),m(),ne(),te(),y(),A=r(),j={title:`Lab/ListInput`,component:v,tags:[`autodocs`],parameters:{layout:`centered`},decorators:[e=>(0,A.jsx)(`div`,{className:`x1xwk8fm x193iq5w`,children:(0,A.jsx)(e,{})})]},M=[{value:`blue`,label:`Blue`},{value:`green`,label:`Green`},{value:`amber`,label:`Amber`},{value:`red`,label:`Red`},{value:`purple`,label:`Purple`}],N=[{id:`tag-new`,color:`blue`,label:`New`},{id:`tag-blocked`,color:`green`,label:`Blocked`},{id:`tag-empty`,color:`amber`,label:``},{id:`tag-review`,color:`purple`,label:`In review`}],P={render:()=>(0,A.jsx)(C,{isReorderable:!0}),parameters:{docs:{description:{story:`Pointer-activate Add near the bottom of the viewport to keep the action under the pointer while available scroll containers absorb the inserted row from nearest to outermost. The new row receives focus and uses a live translate entrance. Remove one to see stable-size survivors close the gap; reduced-motion preferences use an instant change.`}}}},F={name:`Non-reorderable`,render:()=>(0,A.jsx)(C,{})},I={render:()=>(0,A.jsx)(T,{}),parameters:{docs:{description:{story:`Exercises the empty state, add autofocus, one-column layout, duplicate records, blur validation, removing the last item, and the six-item boundary.`}}}},L=[{value:`design`,label:`Design`},{value:`engineering`,label:`Engineering`},{value:`marketing`,label:`Marketing`},{value:`operations`,label:`Operations`}],R=[{id:`allocation-design`,team:`design`,percent:35},{id:`allocation-engineering`,team:`engineering`,percent:40},{id:`allocation-marketing`,team:`marketing`,percent:15}],z={render:()=>(0,A.jsx)(E,{}),parameters:{docs:{description:{story:`Exercises Selector and NumberInput alignment, fixed and proportional column widths, duplicate-item errors, field tooltips, and a collection-wide total.`}}}},B=[{value:`spouse-or-partner`,label:`Spouse or partner`},{value:`child`,label:`Child`},{value:`parent`,label:`Parent`},{value:`sibling`,label:`Sibling`},{value:`other-dependent`,label:`Other dependent`}],V=`2026-08-05`,H=[{id:`member-jordan`,fullName:`Jordan Lee`,relationship:`spouse-or-partner`,dateOfBirth:`1988-11-02`},{id:`member-alexandria`,fullName:`Alexandria María de la Cruz`,relationship:`child`,dateOfBirth:`2012-06-24`},{id:`member-noah`,fullName:`Noah Lee`,relationship:`child`,dateOfBirth:`2018-09-08`},{id:`member-grace`,fullName:`Grace Lee`,relationship:`parent`,dateOfBirth:`1958-04-17`}],U={render:()=>(0,A.jsx)(D,{}),parameters:{docs:{description:{story:`Exercises the intended three-field ceiling, TextInput, Selector, and DateInput alignment, a long international name, blur validation, duplicate-record validation, and non-reorderable semantics.`}}}},W={render:()=>(0,A.jsx)(`div`,{className:`x14rvwrp x193iq5w`,children:(0,A.jsx)(D,{})}),parameters:{docs:{description:{story:`Exercises the 640px stacking breakpoint at a 600px container with all three field types, repeated labels, and non-reorderable top-aligned remove actions.`}}}},G=[{id:`leg-montreal`,destination:`Montréal–Pierre Elliott Trudeau International Airport`,departureDate:`2026-09-12`},{id:`leg-reykjavik`,destination:`Reykjavík`,departureDate:`2026-09-16`},{id:`leg-copenhagen`,destination:`Copenhagen`,departureDate:`2026-09-20`}],K={render:()=>(0,A.jsx)(ie,{}),parameters:{docs:{description:{story:`Exercises the 640px container breakpoint, 32px separation between stacked record groups, repeated labels, a long value, DateInput popovers, item-order validation, and reorder/remove controls aligned beside each record’s first field.`}}}},q={render:()=>(0,A.jsx)(O,{isDisabled:!0}),parameters:{docs:{description:{story:"Sets `aria-disabled` on the group and disables each field, the reorder handle, the remove action, and Add. The values stay legible rather than being hidden, so a disabled list still communicates its contents."}}}},J={render:()=>(0,A.jsx)(O,{isLoading:!0}),parameters:{docs:{description:{story:"Sets `aria-busy` on the group and locks the same controls `isDisabled` does. Loading is distinct from disabled: it means the current values may still change, so an in-flight keyboard reorder is cancelled rather than committed."}}}},Y={render:()=>(0,A.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1rzw5jd`,children:[(0,A.jsx)(O,{status:{type:`error`,message:`Add at least five tag options.`}}),(0,A.jsx)(O,{status:{type:`warning`,message:`Two tags share a colour, which may be hard to tell apart.`}}),(0,A.jsx)(O,{status:{type:`success`,message:`All tag options are valid.`}})]}),parameters:{docs:{description:{story:"The other stories only exercise `error`. `warning` and `success` use the same list-level slot and are described by the group, so a screen reader reaches them from any field inside the list."}}}},X=Array.from({length:25},(e,t)=>({id:`stress-${t}`,color:M[t%M.length].value,label:t%5==0?`Extremely long tag label ${t} that has to wrap or truncate rather than widen the row past its container`:`Tag ${t}`})),Z={render:()=>(0,A.jsx)(ae,{}),parameters:{docs:{description:{story:`Checks that column tracks stay stable as row count grows, that an over-long label cannot widen the row past its container, and that reorder stays usable when the list is taller than the viewport.`}}}},Q={render:()=>(0,A.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1rzw5jd`,children:[(0,A.jsx)(a,{theme:_,mode:`light`,children:(0,A.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1v2ro7d x1qhigcl xur7f20 x1eiddq6`,children:[(0,A.jsx)(i,{weight:`bold`,children:`Light`}),(0,A.jsx)(O,{})]})}),(0,A.jsx)(a,{theme:_,mode:`dark`,children:(0,A.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1v2ro7d x1qhigcl xur7f20 x1eiddq6`,children:[(0,A.jsx)(i,{weight:`bold`,children:`Dark`}),(0,A.jsx)(O,{}),(0,A.jsx)(a,{theme:_,mode:`light`,children:(0,A.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1v2ro7d x1qhigcl xur7f20 x1eiddq6`,children:[(0,A.jsx)(i,{weight:`bold`,children:`Light nested inside dark`}),(0,A.jsx)(O,{status:{type:`error`,message:`Add at least five tags.`}})]})})]})})]}),parameters:{docs:{description:{story:`Pins both modes into one frame so a theme regression is visible without toggling the toolbar, and nests a light theme inside a dark one to confirm the component reads its colours from the nearest provider rather than the document root.`}}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <TagOptionsExample isReorderable />,
  parameters: {
    docs: {
      description: {
        story: 'Pointer-activate Add near the bottom of the viewport to keep the action under the pointer while available scroll containers absorb the inserted row from nearest to outermost. The new row receives focus and uses a live translate entrance. Remove one to see stable-size survivors close the gap; reduced-motion preferences use an instant change.'
      }
    }
  }
}`,...P.parameters?.docs?.source},description:{story:`Controlled tag options with validation at list, item, and field scope.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'Non-reorderable',
  render: () => <TagOptionsExample />
}`,...F.parameters?.docs?.source},description:{story:`Editable tag options using the default fixed insertion order.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <MailingListExample />,
  parameters: {
    docs: {
      description: {
        story: 'Exercises the empty state, add autofocus, one-column layout, duplicate records, blur validation, removing the last item, and the six-item boundary.'
      }
    }
  }
}`,...I.parameters?.docs?.source},description:{story:`A one-column collection that starts empty and validates fields after blur.`,...I.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <ExpenseAllocationsExample />,
  parameters: {
    docs: {
      description: {
        story: 'Exercises Selector and NumberInput alignment, fixed and proportional column widths, duplicate-item errors, field tooltips, and a collection-wide total.'
      }
    }
  }
}`,...z.parameters?.docs?.source},description:{story:`Mixed control types with item-level uniqueness and cross-list totals.`,...z.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <FamilyMemberDeclarationExample />,
  parameters: {
    docs: {
      description: {
        story: 'Exercises the intended three-field ceiling, TextInput, Selector, and DateInput alignment, a long international name, blur validation, duplicate-record validation, and non-reorderable semantics.'
      }
    }
  }
}`,...U.parameters?.docs?.source},description:{story:`Three simple fields per record in a declaration where order is immaterial.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(storyStyles.responsiveCanvas)}>
      <FamilyMemberDeclarationExample />
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Exercises the 640px stacking breakpoint at a 600px container with all three field types, repeated labels, and non-reorderable top-aligned remove actions.'
      }
    }
  }
}`,...W.parameters?.docs?.source},description:{story:`Three fields at an intermediate width that must stack without overflow.`,...W.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <ResponsiveItineraryExample />,
  parameters: {
    docs: {
      description: {
        story: 'Exercises the 640px container breakpoint, 32px separation between stacked record groups, repeated labels, a long value, DateInput popovers, item-order validation, and reorder/remove controls aligned beside each record’s first field.'
      }
    }
  }
}`,...K.parameters?.docs?.source},description:{story:`The two-column editor at the component's narrow stacking breakpoint.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <StaticTagsExample isDisabled />,
  parameters: {
    docs: {
      description: {
        story: 'Sets \`aria-disabled\` on the group and disables each field, the reorder handle, the remove action, and Add. The values stay legible rather than being hidden, so a disabled list still communicates its contents.'
      }
    }
  }
}`,...q.parameters?.docs?.source},description:{story:`Every field and mutation control locked while the list stays readable.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  render: () => <StaticTagsExample isLoading />,
  parameters: {
    docs: {
      description: {
        story: 'Sets \`aria-busy\` on the group and locks the same controls \`isDisabled\` does. Loading is distinct from disabled: it means the current values may still change, so an in-flight keyboard reorder is cancelled rather than committed.'
      }
    }
  }
}`,...J.parameters?.docs?.source},description:{story:`The list marked busy while an async operation settles.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(storyStyles.stack)}>
      <StaticTagsExample status={{
      type: 'error',
      message: 'Add at least five tag options.'
    }} />
      <StaticTagsExample status={{
      type: 'warning',
      message: 'Two tags share a colour, which may be hard to tell apart.'
    }} />
      <StaticTagsExample status={{
      type: 'success',
      message: 'All tag options are valid.'
    }} />
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'The other stories only exercise \`error\`. \`warning\` and \`success\` use the same list-level slot and are described by the group, so a screen reader reaches them from any field inside the list.'
      }
    }
  }
}`,...Y.parameters?.docs?.source},description:{story:`The three list-level status types side by side.`,...Y.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  render: () => <StressExample />,
  parameters: {
    docs: {
      description: {
        story: 'Checks that column tracks stay stable as row count grows, that an over-long label cannot widen the row past its container, and that reorder stays usable when the list is taller than the viewport.'
      }
    }
  }
}`,...Z.parameters?.docs?.source},description:{story:`Row volume and over-long values in one place.`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(storyStyles.stack)}>
      <Theme theme={neutralTheme} mode="light">
        <div {...stylex.props(storyStyles.themePane)}>
          <Text weight="bold">Light</Text>
          <StaticTagsExample />
        </div>
      </Theme>
      <Theme theme={neutralTheme} mode="dark">
        <div {...stylex.props(storyStyles.themePane)}>
          <Text weight="bold">Dark</Text>
          <StaticTagsExample />
          <Theme theme={neutralTheme} mode="light">
            <div {...stylex.props(storyStyles.themePane)}>
              <Text weight="bold">Light nested inside dark</Text>
              <StaticTagsExample status={{
              type: 'error',
              message: 'Add at least five tags.'
            }} />
            </div>
          </Theme>
        </div>
      </Theme>
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Pins both modes into one frame so a theme regression is visible without toggling the toolbar, and nests a light theme inside a dark one to confirm the component reads its colours from the nearest provider rather than the document root.'
      }
    }
  }
}`,...Q.parameters?.docs?.source},description:{story:`The same list pinned to light and dark, including a nested override.`,...Q.parameters?.docs?.description}}},$=[`TagOptions`,`NonReorderable`,`EmptyMailingList`,`ExpenseAllocations`,`FamilyMemberDeclaration`,`ResponsiveFamilyMemberDeclaration`,`ResponsiveItinerary`,`Disabled`,`Loading`,`ValidationStatuses`,`Stress`,`ThemeMatrix`]}))();export{q as Disabled,I as EmptyMailingList,z as ExpenseAllocations,U as FamilyMemberDeclaration,J as Loading,F as NonReorderable,W as ResponsiveFamilyMemberDeclaration,K as ResponsiveItinerary,Z as Stress,P as TagOptions,Q as ThemeMatrix,Y as ValidationStatuses,$ as __namedExportsOrder,j as default};