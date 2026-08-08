import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{n,t as r}from"./stylex-Dft6gtPK.js";import{n as i}from"./mergeProps-JRyAvMxc.js";import{n as a,t as o}from"./themeProps-CREkzZh6.js";import{n as ee,t as s}from"./Text-BfjtEFtP.js";import{t as c}from"./jsx-runtime-DeHZSEgm.js";import{c as te,h as l,n as ne}from"./tokens.stylex-C15xwlpu.js";import{n as u,t as re}from"./VisuallyHidden-Z2NjNH-_.js";import{n as d,t as f}from"./Button-BVMvoKVE.js";import{n as p,t as m}from"./useTranslator-BMnme3me.js";import{n as h,t as g}from"./Icon-C24cO4CC.js";import{n as ie,t as _}from"./TextInput-BwKW_f5i.js";function ae(){let e=(0,v.use)(y);if(e==null)throw Error(`useStepperContext must be used within Stepper. Wrap your Step in <Stepper>.`);return e}var v,y;function b(){return(b=e((()=>{v=t(),y=(0,v.createContext)(null),y.displayName=`StepperContext`})))()}function x({activeStep:e,children:t,orientation:r=`horizontal`,onStepClick:o,label:ee=`Progress`,density:s=`balanced`,indicatorPosition:c=`separated`,xstyle:te,className:l,style:ne,ref:u,...re}){let d=S.Children.count(t),f=(0,S.useMemo)(()=>({activeStep:e,orientation:r,isNonLinear:o!=null,onStepClick:o??null,density:s,indicatorPosition:c,stepCount:d}),[e,r,o,s,c,d]),p=c===`on-track`,m=r===`horizontal`?p?C.horizontalOnTrack:C.horizontal:p?C.verticalOnTrack:C.vertical;return(0,oe.jsx)(y,{value:f,children:(0,oe.jsx)(`ol`,{ref:u,"aria-label":ee,...re,...i(a(`stepper`,{orientation:r,indicatorPosition:c}),n(C.root,m,te),l,ne),children:t})})}var S,oe,C;function se(){return(se=e((()=>{S=t(),r(),o(),b(),oe=c(),C={root:{k1xSpc:`astryx78zum5`,kzqmXN:`astryxh8yej3`,kH6xsr:`astryx3ct3a4`,kogj98:`astryx1ghz6dp`,kmVPX3:`astryx1717udv`,$$css:!0},horizontal:{kXwgrk:`astryx1q0g3np`,kGNEyG:`astryx1cy8zhl`,kOIVth:`astryx1lsbc85`,khm7nJ:null,k1C7PZ:null,$$css:!0},vertical:{kXwgrk:`astryxdt5ytf`,kOIVth:`astryx1lsbc85`,khm7nJ:null,k1C7PZ:null,$$css:!0},horizontalOnTrack:{kXwgrk:`astryx1q0g3np`,kGNEyG:`astryx1cy8zhl`,kOIVth:`astryxxhr3t`,khm7nJ:null,k1C7PZ:null,$$css:!0},verticalOnTrack:{kXwgrk:`astryxdt5ytf`,kOIVth:`astryxxhr3t`,khm7nJ:null,k1C7PZ:null,$$css:!0}},x.displayName=`Stepper`,x.__docgenInfo={description:`A stepper component for multi-step workflows. Displays numbered steps
with visual indicators for completed, active, and upcoming states.

Each Step child must provide a \`step\` prop (zero-based index) so it
can derive its state from the parent's activeStep. The parent supplies
the total \`stepCount\` via context so the on-track layout can hide the
trailing connector on the final step.

Rendered as an ordered list (\`<ol>\`/\`<li>\`) rather than a \`nav\`
landmark: a stepper communicates *progress through a sequence*, not a
set of site navigation links. The active step is marked with
\`aria-current="step"\` (handled per-step) and the list carries an
accessible \`label\`. This follows the WAI-ARIA pattern for steppers /
progress sequences and avoids polluting the page's landmark map.

@example
\`\`\`
<Stepper activeStep={1}>
  <Step step={0} label="Account" />
  <Step step={1} label="Profile" />
  <Step step={2} label="Review" />
</Stepper>
\`\`\``,methods:[],displayName:`Stepper`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLOListElement>`,elements:[{name:`HTMLOListElement`}]},description:`Ref forwarded to the root element`},activeStep:{required:!0,tsType:{name:`number`},description:`Zero-based index of the active step.`},children:{required:!0,tsType:{name:`ReactNode`},description:`Step elements to render.`},orientation:{required:!1,tsType:{name:`union`,raw:`'horizontal' | 'vertical'`,elements:[{name:`literal`,value:`'horizontal'`},{name:`literal`,value:`'vertical'`}]},description:`Layout direction of the stepper.
@default 'horizontal'`,defaultValue:{value:`'horizontal'`,computed:!1}},onStepClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(index: number) => void`,signature:{arguments:[{type:{name:`number`},name:`index`}],return:{name:`void`}}},description:`Called when a step indicator is clicked. Enables non-linear navigation.
When provided, completed and current steps become clickable.`},label:{required:!1,tsType:{name:`string`},description:`Accessible label describing the set of steps.
@default 'Progress'`,defaultValue:{value:`'Progress'`,computed:!1}},density:{required:!1,tsType:{name:`union`,raw:`'compact' | 'balanced' | 'spacious'`,elements:[{name:`literal`,value:`'compact'`},{name:`literal`,value:`'balanced'`},{name:`literal`,value:`'spacious'`}]},description:`Controls density (padding) of all steps.
@default 'balanced'`,defaultValue:{value:`'balanced'`,computed:!1}},indicatorPosition:{required:!1,tsType:{name:`union`,raw:`'separated' | 'on-track'`,elements:[{name:`literal`,value:`'separated'`},{name:`literal`,value:`'on-track'`}]},description:`Controls where each step's indicator sits relative to the connector track.
- 'separated': indicator lives in the label row, distinct from the progress
  bar (the original Astryx layout).
- 'on-track': indicator is slotted into the connector line as a node on the
  track (the on-track indicator design).
@default 'separated'`,defaultValue:{value:`'separated'`,computed:!1}}},composes:[`Omit`]}})))()}function ce(){return(0,T.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`none`,children:[(0,T.jsx)(`circle`,{cx:`8`,cy:`8`,r:`8`,fill:`currentColor`}),(0,T.jsx)(`path`,{d:`M4.75 8.25 7 10.5l4.25-4.5`,stroke:ne[`--color-background-surface`],strokeWidth:`1.75`,strokeLinecap:`round`,strokeLinejoin:`round`})]})}function le(){return(0,T.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`none`,children:[(0,T.jsx)(`circle`,{cx:`8`,cy:`8`,r:`7`,stroke:`currentColor`,strokeWidth:`2`}),(0,T.jsx)(`circle`,{cx:`8`,cy:`8`,r:`4`,fill:`currentColor`})]})}function w({step:e,label:t,description:r,children:o,icon:ee,status:s,isDisabled:c=!1,isOptional:te=!1,endContent:ne,indicator:u,density:d,xstyle:f,className:m,style:h,ref:ie,"data-testid":_,...v}){let y=p(),{activeStep:b,orientation:x,onStepClick:S,density:oe,indicatorPosition:C,stepCount:se}=ae(),w=d??oe,ue=u!=null&&typeof u!=`string`,E=ue?`auto`:u??`auto`,D=e===b?`in-progress`:e<b?`completed`:`not-started`,O=x===`vertical`,A=D===`in-progress`,j=!c&&S!=null,M=()=>{j&&S&&S(e)},de=D===`completed`||D===`in-progress`,N=null,P=ue?u:ee??null,F=E===`auto`&&P==null&&!A&&(s===`success`||s===`warning`||s===`error`)?s:null;if(E!==`none`)if(P==null&&F==null&&(E===`number`||E===`auto`&&D===`not-started`)){let t=D===`completed`||D===`in-progress`,r=c?k.numberDisabled:t&&s===`accent`?k.numberAccent:t&&s===`success`?k.numberSuccess:t&&s===`warning`?k.numberWarning:t&&s===`error`?k.numberError:D===`completed`?k.numberCompleted:D===`in-progress`?k.numberInProgress:k.numberNotStarted;N=(0,T.jsx)(`div`,{"aria-hidden":`true`,...n(k.numberBadge,r),children:e+1})}else{let e=P??(F===`success`?(0,T.jsx)(g,{icon:`success`,size:`sm`,color:c?`disabled`:`success`}):F===`warning`?(0,T.jsx)(g,{icon:`warning`,size:`sm`,color:c?`disabled`:`warning`}):F===`error`?(0,T.jsx)(g,{icon:`error`,size:`sm`,color:c?`disabled`:`error`}):D===`completed`?(0,T.jsx)(ce,{}):(0,T.jsx)(le,{})),t=c?k.iconDisabled:P==null?F===`success`?k.iconSuccess:F===`warning`?k.iconWarning:F===`error`?k.iconError:D===`completed`?k.iconCompleted:D===`in-progress`?k.iconInProgress:k.iconNotStarted:s===`accent`?k.iconAccent:s===`success`?k.iconSuccess:s===`warning`?k.iconWarning:s===`error`?k.iconError:D===`completed`?k.iconCompleted:D===`in-progress`?k.iconInProgress:k.iconNotStarted;N=(0,T.jsx)(`div`,{"aria-hidden":`true`,...n(k.icon,t),children:e})}let I=s===`error`?y(`@astryx.step.status.error`):s===`warning`?y(`@astryx.step.status.warning`):s===`success`||D===`completed`?y(`@astryx.step.status.completed`):null,L=I==null?null:(0,T.jsx)(re,{children:I}),R=I==null?y(`@astryx.step.goToStep`,{stepNumber:e+1,label:t}):y(`@astryx.step.goToStepWithStatus`,{stepNumber:e+1,label:t,status:I}),z=E!==`none`,B=z&&P==null&&F==null&&(E===`number`||E===`auto`&&D===`not-started`),V=c?k.labelDisabled:D===`not-started`?k.labelNotStarted:A?k.labelInProgress:void 0,H=(0,T.jsxs)(`div`,{className:`astryx78zum5 astryx1q0g3np astryx6s0dn4 astryx1txdalj`,children:[N,(0,T.jsx)(`span`,{...n(k.label,V),children:t}),L,te&&(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(`span`,{className:`astryxjm74w1 astryxv1l7n4`,children:`•`}),(0,T.jsx)(`span`,{className:`astryxjm74w1 astryxv1l7n4`,children:`Optional`})]}),ne]}),U=r==null?null:(0,T.jsx)(`div`,{...n(z?B?k.descriptionRowWithNumber:k.descriptionRowWithIndicator:k.descriptionRow),children:(0,T.jsx)(`span`,{className:`astryx141an7d astryx1d3mw78 astryxv1l7n4`,children:r})}),W=o==null?null:(0,T.jsx)(`div`,{...n(k.stepContent,z&&(B?k.stepContentWithNumber:k.stepContentWithIndicator)),children:o}),G=a(`step`,{progress:D,status:s??void 0});if(C===`on-track`){let ee=e<=b,s=e<b,c=ee?k.lineFilled:k.lineUnfilled,u=s?k.lineFilled:k.lineUnfilled,re=e===0,d=e===se-1,p=w===`compact`?l[`--spacing-1`]:w===`spacious`?l[`--spacing-3`]:l[`--spacing-2`],g=(0,T.jsxs)(`div`,{...{0:{className:`astryx78zum5 astryx1q0g3np astryx6s0dn4 astryxl56j7k astryx1a02dak astryxzye2dw`},1:{className:`astryx78zum5 astryx1q0g3np astryx6s0dn4 astryx1txdalj`}}[!!O<<0],children:[(0,T.jsx)(`span`,{...n(k.label,V),children:t}),L,te&&(0,T.jsxs)(T.Fragment,{children:[(0,T.jsx)(`span`,{className:`astryxjm74w1 astryxv1l7n4`,children:`•`}),(0,T.jsx)(`span`,{className:`astryxjm74w1 astryxv1l7n4`,children:`Optional`})]}),ne]}),ae=r==null?null:(0,T.jsx)(`span`,{className:`astryx141an7d astryx1d3mw78 astryxv1l7n4`,children:r}),y=o==null?null:(0,T.jsx)(`div`,{...{0:{className:`astryx1xye8es`},1:{className:`astryxchaq28 astryx1xye8es`}}[!!O<<0],children:o});if(O){let e=(0,T.jsxs)(T.Fragment,{children:[(0,T.jsxs)(`div`,{...n(k.otIndicatorColV,k.otRailBridgeV(p)),children:[(0,T.jsx)(`div`,{"aria-hidden":`true`,...i(a(`step-connector`),n(k.otSegBaseV,k.otSegLeadV(p),c,re&&k.otSegHidden))}),N,(0,T.jsx)(`div`,{"aria-hidden":`true`,...i(a(`step-connector`),n(k.otSegBaseV,k.otSegFlexV,u,d&&k.otSegHidden))})]}),(0,T.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryx1nhvcw1 astryx98rzlu astryx1lsbc85 astryxeuugli`,children:[g,ae]})]});return(0,T.jsxs)(`li`,{ref:ie,...i(G,n(k.otVerticalRoot,f),m,h),"aria-current":A?`step`:void 0,"data-testid":_,...v,children:[j?(0,T.jsx)(`button`,{type:`button`,onClick:M,"aria-label":R,...n(k.otInteractive,k.otRowWrap,k.otRowPadV(p),k.focusRing),children:e}):(0,T.jsx)(`div`,{...n(k.otRowWrap,k.otRowPadV(p)),children:e}),y]})}let x=(0,T.jsxs)(T.Fragment,{children:[(0,T.jsxs)(`div`,{className:`astryx78zum5 astryx1q0g3np astryx6s0dn4 astryxh8yej3`,children:[(0,T.jsx)(`div`,{"aria-hidden":`true`,...i(a(`step-connector`),n(k.otSegH,c,re&&k.otSegHidden))}),N,(0,T.jsx)(`div`,{"aria-hidden":`true`,...i(a(`step-connector`),n(k.otSegH,u,d&&k.otSegHidden))})]}),(0,T.jsxs)(`div`,{...n(k.otLabelWrapH,k.otMarginTop(p)),children:[g,ae]})]});return(0,T.jsxs)(`li`,{ref:ie,...i(G,n(k.otHorizontalRoot,f),m,h),"aria-current":A?`step`:void 0,"data-testid":_,...v,children:[j?(0,T.jsx)(`button`,{type:`button`,onClick:M,"aria-label":R,...n(k.otInteractive,k.otColWrap,k.otPadBlock(p),k.focusRing),children:x}):(0,T.jsx)(`div`,{...n(k.otColWrap,k.otPadBlock(p)),children:x}),y]})}return O?(0,T.jsxs)(`li`,{ref:ie,...i(G,n(k.verticalRoot,f),m,h),"aria-current":A?`step`:void 0,"data-testid":_,...v,children:[(0,T.jsx)(`div`,{...i(a(`step-bar`),{0:{className:`astryx51ohtg astryxjspbzw astryx2lah0s astryxkh2ocl astryx1m4xfpy`},1:{className:`astryx51ohtg astryxjspbzw astryx2lah0s astryxkh2ocl astryx1ewilqj`}}[!!de<<0]),"aria-hidden":`true`}),(0,T.jsxs)(`div`,{className:`astryx78zum5 astryxdt5ytf astryx98rzlu`,children:[j?(0,T.jsxs)(`button`,{type:`button`,onClick:M,"aria-label":R,...{0:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk`},4:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxu0wf1k astryxf314gf`},2:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxce4md1 astryxf314gf`},6:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxce4md1 astryxf314gf`},1:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod`},5:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod`},3:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod`},7:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod`}}[(w===`compact`)<<2|(w===`balanced`)<<1|(w===`spacious`)<<0],children:[H,U]}):(0,T.jsxs)(`div`,{...{0:{},4:{className:`astryxu0wf1k astryxf314gf`},2:{className:`astryxce4md1 astryxf314gf`},6:{className:`astryxce4md1 astryxf314gf`},1:{className:`astryx8o8v82 astryxrrkdod`},5:{className:`astryx8o8v82 astryxrrkdod`},3:{className:`astryx8o8v82 astryxrrkdod`},7:{className:`astryx8o8v82 astryxrrkdod`}}[(w===`compact`)<<2|(w===`balanced`)<<1|(w===`spacious`)<<0],children:[H,U]}),W]})]}):(0,T.jsxs)(`li`,{ref:ie,...i(G,n(k.horizontalStep,f),m,h),"aria-current":A?`step`:void 0,"data-testid":_,...v,children:[(0,T.jsx)(`div`,{...i(a(`step-bar`),{0:{className:`astryxh8yej3 astryxqu0tyb astryxjspbzw astryx2lah0s astryxlstkdb astryx1m4xfpy`},1:{className:`astryxh8yej3 astryxqu0tyb astryxjspbzw astryx2lah0s astryxlstkdb astryx1ewilqj`}}[!!de<<0]),"aria-hidden":`true`}),j?(0,T.jsxs)(`button`,{type:`button`,onClick:M,"aria-label":R,...{0:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk`},4:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxu0wf1k astryxf314gf`},2:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxce4md1 astryxf314gf`},6:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxce4md1 astryxf314gf`},1:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod`},5:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod`},3:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod`},7:{className:`astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod`}}[(w===`compact`)<<2|(w===`balanced`)<<1|(w===`spacious`)<<0],children:[H,U]}):(0,T.jsxs)(`div`,{...{0:{},4:{className:`astryxu0wf1k astryxf314gf`},2:{className:`astryxce4md1 astryxf314gf`},6:{className:`astryxce4md1 astryxf314gf`},1:{className:`astryx8o8v82 astryxrrkdod`},5:{className:`astryx8o8v82 astryxrrkdod`},3:{className:`astryx8o8v82 astryxrrkdod`},7:{className:`astryx8o8v82 astryxrrkdod`}}[(w===`compact`)<<2|(w===`balanced`)<<1|(w===`spacious`)<<0],children:[H,U]}),W]})}var T,ue,E,D,O,k;function A(){return(A=e((()=>{r(),te(),h(),u(),m(),b(),o(),T=c(),l[`--spacing-4`],l[`--spacing-5`],ue={kLKAdn:``,kGO01o:``,kuDDbn:``,kE3dHu:``,kP0aTx:``,kpe85a:``,$$css:!0},E={kqGvvJ:`astryx1oqu0vw`,keoZOQ:``,k1K539:``,$$css:!0},D={kLKAdn:``,kGO01o:``,$$css:!0},O={keoZOQ:`astryx1vhfslr`,$$css:!0},k={verticalRoot:{k1xSpc:`astryx78zum5`,kXwgrk:`astryx1q0g3np`,kGNEyG:`astryx1qjc9v5`,kVAEAm:`astryx1n2onr6`,kOIVth:`astryx1lsbc85`,$$css:!0},horizontalStep:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kGNEyG:`astryx1cy8zhl`,kUk6DE:`astryx98rzlu`,$$css:!0},icon:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kzqmXN:`astryx12xnipv`,kZKoxP:`astryx6b6gus`,kmuXW:`astryx2lah0s`,$$css:!0},iconCompleted:{kMwMTN:`astryxqwr325`,$$css:!0},iconInProgress:{kMwMTN:`astryxqwr325`,$$css:!0},iconNotStarted:{kMwMTN:`astryxv9yike`,$$css:!0},iconDisabled:{kMwMTN:`astryxqa6c3m`,kSiTet:`astryxbyyjgo`,$$css:!0},iconAccent:{kMwMTN:`astryxqwr325`,$$css:!0},iconSuccess:{kMwMTN:`astryxtjic6`,$$css:!0},iconWarning:{kMwMTN:`astryxs3pv69`,$$css:!0},iconError:{kMwMTN:`astryxjt36v0`,$$css:!0},numberBadge:{k1xSpc:`astryxrvj5dj`,kgQiWS:`astryx1ku5rj1`,kzqmXN:`astryxfyiiit`,kZKoxP:`astryx1grt7ep`,kaIpWk:`astryxjspbzw`,kGuDYH:`astryx1k6wstc`,kGO01o:`astryx1j85h84`,k63SB2:`astryx2mo6ok`,kLWn49:`astryxo5v014`,kmuXW:`astryx2lah0s`,k9WMMc:`astryx2b8uid`,$$css:!0},numberCompleted:{kWkggS:`astryx1ewilqj`,kMwMTN:`astryxrkvqaz`,$$css:!0},numberInProgress:{kWkggS:`astryx1ewilqj`,kMwMTN:`astryxrkvqaz`,$$css:!0},numberNotStarted:{kWkggS:`astryxwmxj5m`,kMwMTN:`astryxv1l7n4`,$$css:!0},numberDisabled:{kWkggS:`astryxwmxj5m`,kMwMTN:`astryxnbbluu`,kSiTet:`astryxbyyjgo`,$$css:!0},numberAccent:{kWkggS:`astryx1ewilqj`,kMwMTN:`astryx17wrial`,$$css:!0},numberSuccess:{kWkggS:`astryxdsz4j9`,kMwMTN:`astryxri61p4`,$$css:!0},numberWarning:{kWkggS:`astryx1q8g9m5`,kMwMTN:`astryxrebv38`,$$css:!0},numberError:{kWkggS:`astryx1pjz0fi`,kMwMTN:`astryx1m024r3`,$$css:!0},label:{kGuDYH:`astryxjm74w1`,kLWn49:`astryxw6l6zx`,k63SB2:`astryx1sodnla`,kMwMTN:`astryx1tgivj0`,$$css:!0},labelInProgress:{k63SB2:`astryx2mo6ok`,$$css:!0},labelNotStarted:{kMwMTN:`astryxv1l7n4`,$$css:!0},labelDisabled:{kMwMTN:`astryxnbbluu`,$$css:!0},descriptionRow:{kZCmMZ:`astryx18gyask`,$$css:!0},descriptionRowWithIndicator:{kZCmMZ:`astryx31w388`,$$css:!0},descriptionRowWithNumber:{kZCmMZ:`astryxchaq28`,$$css:!0},stepContent:{kLKAdn:`astryx1xye8es`,$$css:!0},stepContentWithIndicator:{kZCmMZ:`astryx31w388`,$$css:!0},stepContentWithNumber:{kZCmMZ:`astryxchaq28`,$$css:!0},focusRing:{kI3sdo:`astryx1a2a7pz astryx17nn4n9`,kjBf7l:null,k3XXqK:null,kMeerF:null,kInvED:`astryx1wfwxd8 astryx7s97pk`,$$css:!0},otVerticalRoot:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kVAEAm:`astryx1n2onr6`,$$css:!0},otHorizontalRoot:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kUk6DE:`astryx98rzlu`,k7Eaqz:`astryxeuugli`,$$css:!0},otInteractive:{kB7OPa:`astryx9f619`,k9WMMc:`astryx1yc453h`,kkrTdU:`astryx1ypdohk`,kaIpWk:`astryxh6dtrn`,k1ekBW:`astryx15406qy`,kIyJzY:`astryxkvfbh3`,kAMwcw:`astryxlr8y92`,kWkggS:`astryxjbqb8w astryxe9uy6x astryxyxi2l3`,$$css:!0},otRowWrap:{k1xSpc:`astryx78zum5`,kXwgrk:`astryx1q0g3np`,kGNEyG:`astryx1qjc9v5`,kOIVth:`astryx1txdalj`,kzqmXN:`astryxh8yej3`,$$css:!0},otColWrap:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kGNEyG:`astryx1qjc9v5`,kzqmXN:`astryxh8yej3`,$$css:!0},otIndicatorColV:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kGNEyG:`astryx6s0dn4`,kzqmXN:`astryxfyiiit`,kmuXW:`astryx2lah0s`,kSGwAc:`astryxkh2ocl`,$$css:!0},otSegBaseV:{kzqmXN:`astryx51ohtg`,kmuXW:`astryx2lah0s`,kaIpWk:`astryx2u8bby`,$$css:!0},otSegFlexV:{kUk6DE:`astryx98rzlu`,kmuXW:null,kAzted:`astryx175cymr`,$$css:!0},otSegLeadV:e=>[{kZKoxP:e==null?e:`astryx16ye13r`,$$css:!0},{"--x-height":(e=>typeof e==`number`?e+`px`:e??void 0)(e)}],otSegH:{kZKoxP:`astryxqu0tyb`,kUk6DE:`astryx98rzlu`,k7Eaqz:`astryx18ki04u`,kaIpWk:`astryx2u8bby`,$$css:!0},otSegHidden:{k33iCy:`astryxlshs6z`,$$css:!0},lineFilled:{kWkggS:`astryx1ewilqj`,$$css:!0},lineUnfilled:{kWkggS:`astryx1m4xfpy`,$$css:!0},otLabelWrapH:{k1xSpc:`astryx78zum5`,kXwgrk:`astryxdt5ytf`,kGNEyG:`astryx6s0dn4`,kOIVth:`astryx1lsbc85`,k9WMMc:`astryx2b8uid`,$$css:!0},otRowPadV:e=>[ue,{k8WAf4:e==null?e:`astryx1giekp1`,kg3NbH:e==null?e:`astryx30g6up`,$$css:!0},{"--x-paddingBlock":(e=>typeof e==`number`?e+`px`:e??void 0)(e),"--x-paddingInline":(e=>typeof e==`number`?e+`px`:e??void 0)(e)}],otRailBridgeV:e=>[E,{"--x-marginBlock":(e=>typeof e==`number`?e+`px`:e??void 0)(`calc(-1 * ${e})`)}],otPadBlock:e=>[D,{k8WAf4:e==null?e:`astryx1giekp1`,$$css:!0},{"--x-paddingBlock":(e=>typeof e==`number`?e+`px`:e??void 0)(e)}],otMarginTop:e=>[O,{"--x-marginBlockStart":(e=>typeof e==`number`?e+`px`:e??void 0)(e)}]},w.displayName=`Step`,w.__docgenInfo={description:'An individual step within an Stepper. Renders a 4px progress-bar segment,\nan indicator (numbered badge, check, or any custom icon), a label with\noptional description, and an optional content slot.\n\nProgress (completed / active / not-started) is derived from the parent\'s\n`activeStep` and this step\'s `step` prop. The optional `status` prop layers a\nsemantic meaning on top: in the default `auto` indicator mode it recolors the\nindicator and swaps in a matching glyph (`success` → green check-circle,\n`warning`/`error` → the shared Input status icons). The current step always\nkeeps its current-step ring. `status` never recolors the connector/track.\n\n@example\n```\n<Step step={0} label="Account details" description="Enter your email" />\n```\n\n@example\n```\n<Step step={1} label="Payment" status="error" />\n```',methods:[],displayName:`Step`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLLIElement>`,elements:[{name:`HTMLLIElement`}]},description:`Ref forwarded to the root element`},step:{required:!0,tsType:{name:`number`},description:"Zero-based index of this step. Used to derive progress (completed /\nactive / not-started) relative to the parent's `activeStep`."},label:{required:!0,tsType:{name:`string`},description:`Step label text.`},description:{required:!1,tsType:{name:`string`},description:`Optional description shown below the label.`},children:{required:!1,tsType:{name:`ReactNode`},description:`Content rendered below the label and description. Useful in vertical
steppers to show form fields or detailed content for each step.`},icon:{required:!1,tsType:{name:`ReactNode`},description:"Custom icon rendered inside the indicator. Accepts any ReactNode (for\nexample an `<Icon />`). Equivalent to passing the node directly to\n`indicator`; takes precedence over the built-in number/check."},status:{required:!1,tsType:{name:`union`,raw:`'accent' | 'success' | 'warning' | 'error'`,elements:[{name:`literal`,value:`'accent'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'error'`}]},description:'Semantic status for the step, mapped to the global Astryx semantic tokens\n(`accent`, `success`, `warning`, `error`). In the default `auto` indicator\nmode it sets both the indicator color and a matching glyph: `success` shows\na green check-circle, `warning`/`error` show the shared Input status icons.\n`accent` is color-only. The current (in-progress) step always keeps its\ncurrent-step indicator regardless of `status`. Never recolors the\nconnector/track.\n\nBecause the indicator glyphs are decorative (aria-hidden), the status also\nreaches assistive technology as text: visually hidden "completed" /\n"warning" / "error" next to the label, and composed into the accessible\nname of clickable steps.'},isDisabled:{required:!1,tsType:{name:`boolean`},description:`Disable interaction for this step.
@default false`,defaultValue:{value:`false`,computed:!1}},isOptional:{required:!1,tsType:{name:`boolean`},description:`Marks the step as optional, appending an "Optional" affordance after the
label.
@default false`,defaultValue:{value:`false`,computed:!1}},endContent:{required:!1,tsType:{name:`ReactNode`},description:`Trailing content rendered at the end of the label row (e.g. a timestamp
or status chip).`},indicator:{required:!1,tsType:{name:`union`,raw:`StepIndicatorPreset | ReactNode`,elements:[{name:`union`,raw:`'auto' | 'number' | 'none'`,elements:[{name:`literal`,value:`'auto'`},{name:`literal`,value:`'number'`},{name:`literal`,value:`'none'`}]},{name:`ReactNode`}]},description:`What to show as the step indicator. Accepts a preset string or any
ReactNode:
- 'auto': numbered badge until completed, then a check (default)
- 'number': always a numbered badge
- 'none': no indicator, just the bar + label
- ReactNode: any custom icon or element to render as the indicator
@default 'auto'`},density:{required:!1,tsType:{name:`union`,raw:`'compact' | 'balanced' | 'spacious'`,elements:[{name:`literal`,value:`'compact'`},{name:`literal`,value:`'balanced'`},{name:`literal`,value:`'spacious'`}]},description:`Controls vertical padding of the step. Falls back to the stepper-level
density when unset.
- 'compact': minimal padding (4px block)
- 'balanced': default (8px block)
- 'spacious': generous (12px block, 12px inline)`}},composes:[`Omit`]}})))()}var j,M,de,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,fe,pe,me;function he(){return(he=e((()=>{j=t(),se(),A(),ie(),d(),ee(),h(),M=c(),de={title:`Lab/Stepper`,component:x,tags:[`autodocs`],argTypes:{activeStep:{control:{type:`number`,min:0,max:5}},orientation:{control:`select`,options:[`horizontal`,`vertical`]},density:{control:`select`,options:[`compact`,`balanced`,`spacious`]},indicatorPosition:{control:`select`,options:[`separated`,`on-track`]}}},N={name:`Default`,render:()=>{let[e,t]=(0,j.useState)(2);return(0,M.jsx)(`div`,{style:{maxWidth:400},children:(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Create workspace`,description:`Name and configure your workspace`}),(0,M.jsx)(w,{step:1,label:`Invite team members`,description:`Add collaborators by email`}),(0,M.jsx)(w,{step:2,label:`Set up integrations`,description:`Connect Slack, GitHub, Jira`}),(0,M.jsx)(w,{step:3,label:`Import data`,description:`Bring in existing projects`}),(0,M.jsx)(w,{step:4,label:`Launch`,description:`Go live with your team`})]})})}},P={name:`Default — Horizontal`,render:()=>{let[e,t]=(0,j.useState)(1);return(0,M.jsx)(`div`,{style:{maxWidth:700},children:(0,M.jsxs)(x,{activeStep:e,orientation:`horizontal`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Workspace`}),(0,M.jsx)(w,{step:1,label:`Team`}),(0,M.jsx)(w,{step:2,label:`Integrations`}),(0,M.jsx)(w,{step:3,label:`Import`}),(0,M.jsx)(w,{step:4,label:`Launch`})]})})}},F={name:`Numbered — Deploy Pipeline`,render:()=>{let[e,t]=(0,j.useState)(2);return(0,M.jsx)(`div`,{style:{maxWidth:400},children:(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Push to main`,description:`Merge your pull request`,indicator:`number`}),(0,M.jsx)(w,{step:1,label:`Run CI checks`,description:`Lint, type-check, test`,indicator:`number`}),(0,M.jsx)(w,{step:2,label:`Build container`,description:`Docker image to registry`,indicator:`number`}),(0,M.jsx)(w,{step:3,label:`Deploy to staging`,description:`Verify in staging environment`,indicator:`number`}),(0,M.jsx)(w,{step:4,label:`Promote to production`,description:`Canary → full rollout`,indicator:`number`})]})})}},I={name:`Numbered — Horizontal Checkout`,render:()=>{let[e,t]=(0,j.useState)(1);return(0,M.jsx)(`div`,{style:{maxWidth:600},children:(0,M.jsxs)(x,{activeStep:e,orientation:`horizontal`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Cart`,indicator:`number`}),(0,M.jsx)(w,{step:1,label:`Shipping`,indicator:`number`}),(0,M.jsx)(w,{step:2,label:`Payment`,indicator:`number`}),(0,M.jsx)(w,{step:3,label:`Confirm`,indicator:`number`})]})})}},L={name:`Status — Account Verification`,render:()=>{let[e,t]=(0,j.useState)(3);return(0,M.jsx)(`div`,{style:{maxWidth:400},children:(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Email verified`,description:`ernesttien@meta.com`,status:`success`}),(0,M.jsx)(w,{step:1,label:`Phone verified`,description:`+1 (555) 012-3456`,status:`success`}),(0,M.jsx)(w,{step:2,label:`Identity document`,description:`Passport upload failed`,status:`error`}),(0,M.jsx)(w,{step:3,label:`Address verification`,description:`Pending review`,status:`accent`}),(0,M.jsx)(w,{step:4,label:`Background check`,isOptional:!0,description:`Skipped`}),(0,M.jsx)(w,{step:5,label:`Account activated`})]})})}},R={name:`Status — Semantic Colors Reference`,render:()=>{let[e,t]=(0,j.useState)(5);return(0,M.jsx)(`div`,{style:{maxWidth:400},children:(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Accent`,description:`--color-accent`,status:`accent`}),(0,M.jsx)(w,{step:1,label:`Success`,description:`--color-success`,status:`success`}),(0,M.jsx)(w,{step:2,label:`Warning`,description:`--color-warning`,status:`warning`}),(0,M.jsx)(w,{step:3,label:`Error`,description:`--color-error`,status:`error`}),(0,M.jsx)(w,{step:4,label:`Default (no status)`,description:`progress-derived color`})]})})}},z={name:`Minimal — Interview Process`,render:()=>{let[e,t]=(0,j.useState)(2);return(0,M.jsx)(`div`,{style:{maxWidth:400},children:(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Phone screen`,description:`30 min with recruiter`,indicator:`none`}),(0,M.jsx)(w,{step:1,label:`Technical interview`,description:`1 hour coding session`,indicator:`none`}),(0,M.jsx)(w,{step:2,label:`System design`,description:`45 min whiteboard`,indicator:`none`}),(0,M.jsx)(w,{step:3,label:`Team match`,description:`Meet potential teammates`,indicator:`none`}),(0,M.jsx)(w,{step:4,label:`Offer`,indicator:`none`})]})})}},B={name:`Minimal — Video Upload`,render:()=>{let[e,t]=(0,j.useState)(1);return(0,M.jsx)(`div`,{style:{maxWidth:500},children:(0,M.jsxs)(x,{activeStep:e,orientation:`horizontal`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Upload`,indicator:`none`}),(0,M.jsx)(w,{step:1,label:`Details`,indicator:`none`}),(0,M.jsx)(w,{step:2,label:`Audience`,indicator:`none`}),(0,M.jsx)(w,{step:3,label:`Publish`,indicator:`none`})]})})}},V={name:`Indicator Modes — Side by Side`,render:()=>{let[e,t]=(0,j.useState)(2);return(0,M.jsxs)(`div`,{style:{display:`flex`,gap:48},children:[(0,M.jsxs)(`div`,{style:{maxWidth:280},children:[(0,M.jsx)(s,{type:`label`,children:`Auto (default)`}),(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Account`}),(0,M.jsx)(w,{step:1,label:`Profile`}),(0,M.jsx)(w,{step:2,label:`Settings`}),(0,M.jsx)(w,{step:3,label:`Review`}),(0,M.jsx)(w,{step:4,label:`Done`})]})]}),(0,M.jsxs)(`div`,{style:{maxWidth:280},children:[(0,M.jsx)(s,{type:`label`,children:`Number`}),(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Account`,indicator:`number`}),(0,M.jsx)(w,{step:1,label:`Profile`,indicator:`number`}),(0,M.jsx)(w,{step:2,label:`Settings`,indicator:`number`}),(0,M.jsx)(w,{step:3,label:`Review`,indicator:`number`}),(0,M.jsx)(w,{step:4,label:`Done`,indicator:`number`})]})]}),(0,M.jsxs)(`div`,{style:{maxWidth:280},children:[(0,M.jsx)(s,{type:`label`,children:`Custom icon`}),(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Account`,icon:(0,M.jsx)(g,{icon:`info`,size:`sm`})}),(0,M.jsx)(w,{step:1,label:`Profile`,icon:(0,M.jsx)(g,{icon:`search`,size:`sm`})}),(0,M.jsx)(w,{step:2,label:`Settings`,icon:(0,M.jsx)(g,{icon:`wrench`,size:`sm`})}),(0,M.jsx)(w,{step:3,label:`Review`,icon:(0,M.jsx)(g,{icon:`clock`,size:`sm`})}),(0,M.jsx)(w,{step:4,label:`Done`,icon:(0,M.jsx)(g,{icon:`check`,size:`sm`})})]})]}),(0,M.jsxs)(`div`,{style:{maxWidth:280},children:[(0,M.jsx)(s,{type:`label`,children:`None`}),(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Account`,indicator:`none`}),(0,M.jsx)(w,{step:1,label:`Profile`,indicator:`none`}),(0,M.jsx)(w,{step:2,label:`Settings`,indicator:`none`}),(0,M.jsx)(w,{step:3,label:`Review`,indicator:`none`}),(0,M.jsx)(w,{step:4,label:`Done`,indicator:`none`})]})]})]})}},H={name:`With Content — Multi-Step Form`,render:()=>{let[e,t]=(0,j.useState)(0);return(0,M.jsx)(`div`,{style:{maxWidth:480},children:(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Project details`,indicator:`number`,children:e===0&&(0,M.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,M.jsx)(_,{label:`Project name`,placeholder:`My awesome project`,value:``}),(0,M.jsx)(_,{label:`Repository URL`,placeholder:`https://github.com/...`,value:``}),(0,M.jsx)(`div`,{children:(0,M.jsx)(f,{label:`Continue`,variant:`primary`,onClick:()=>t(1)})})]})}),(0,M.jsx)(w,{step:1,label:`Environment`,indicator:`number`,children:e===1&&(0,M.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,M.jsx)(_,{label:`Node version`,placeholder:`20`,value:``}),(0,M.jsx)(_,{label:`Build command`,placeholder:`npm run build`,value:``}),(0,M.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,M.jsx)(f,{label:`Back`,variant:`secondary`,onClick:()=>t(0)}),(0,M.jsx)(f,{label:`Continue`,variant:`primary`,onClick:()=>t(2)})]})]})}),(0,M.jsx)(w,{step:2,label:`Deploy`,indicator:`number`,children:e===2&&(0,M.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,M.jsx)(s,{type:`body`,children:`Ready to deploy. This will create a production build and push to your configured hosting.`}),(0,M.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,M.jsx)(f,{label:`Back`,variant:`secondary`,onClick:()=>t(1)}),(0,M.jsx)(f,{label:`Deploy now`,variant:`primary`,onClick:()=>t(3)})]})]})}),(0,M.jsx)(w,{step:3,label:`Done`,indicator:`number`})]})})}},U={name:`Density — Compact / Balanced / Spacious`,render:()=>{let[e,t]=(0,j.useState)(1);return(0,M.jsxs)(`div`,{style:{display:`flex`,gap:48},children:[(0,M.jsxs)(`div`,{style:{maxWidth:250},children:[(0,M.jsx)(s,{type:`label`,children:`Compact`}),(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,density:`compact`,children:[(0,M.jsx)(w,{step:0,label:`Account`,indicator:`number`}),(0,M.jsx)(w,{step:1,label:`Profile`,indicator:`number`}),(0,M.jsx)(w,{step:2,label:`Payment`,indicator:`number`}),(0,M.jsx)(w,{step:3,label:`Review`,indicator:`number`})]})]}),(0,M.jsxs)(`div`,{style:{maxWidth:250},children:[(0,M.jsx)(s,{type:`label`,children:`Balanced`}),(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,density:`balanced`,children:[(0,M.jsx)(w,{step:0,label:`Account`,indicator:`number`}),(0,M.jsx)(w,{step:1,label:`Profile`,indicator:`number`}),(0,M.jsx)(w,{step:2,label:`Payment`,indicator:`number`}),(0,M.jsx)(w,{step:3,label:`Review`,indicator:`number`})]})]}),(0,M.jsxs)(`div`,{style:{maxWidth:250},children:[(0,M.jsx)(s,{type:`label`,children:`Spacious`}),(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,density:`spacious`,children:[(0,M.jsx)(w,{step:0,label:`Account`,indicator:`number`}),(0,M.jsx)(w,{step:1,label:`Profile`,indicator:`number`}),(0,M.jsx)(w,{step:2,label:`Payment`,indicator:`number`}),(0,M.jsx)(w,{step:3,label:`Review`,indicator:`number`})]})]})]})}},W={name:`Edge — Two Steps`,render:()=>{let[e,t]=(0,j.useState)(0);return(0,M.jsx)(`div`,{style:{maxWidth:400},children:(0,M.jsxs)(x,{activeStep:e,orientation:`horizontal`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Before`}),(0,M.jsx)(w,{step:1,label:`After`})]})})}},G={name:`Edge — Seven Steps (Horizontal)`,render:()=>{let[e,t]=(0,j.useState)(3);return(0,M.jsxs)(x,{activeStep:e,orientation:`horizontal`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Idea`,indicator:`number`}),(0,M.jsx)(w,{step:1,label:`Design`,indicator:`number`}),(0,M.jsx)(w,{step:2,label:`Build`,indicator:`number`}),(0,M.jsx)(w,{step:3,label:`Test`,indicator:`number`}),(0,M.jsx)(w,{step:4,label:`Review`,indicator:`number`}),(0,M.jsx)(w,{step:5,label:`Deploy`,indicator:`number`}),(0,M.jsx)(w,{step:6,label:`Monitor`,indicator:`number`})]})}},K={name:`Edge — Disabled Steps`,render:()=>{let[e,t]=(0,j.useState)(1);return(0,M.jsx)(`div`,{style:{maxWidth:400},children:(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Basic info`}),(0,M.jsx)(w,{step:1,label:`Permissions`}),(0,M.jsx)(w,{step:2,label:`Admin settings`,description:`Requires admin role`,isDisabled:!0}),(0,M.jsx)(w,{step:3,label:`Confirm`})]})})}},q={name:`Edge — Optional + Skipped`,render:()=>{let[e,t]=(0,j.useState)(3);return(0,M.jsx)(`div`,{style:{maxWidth:400},children:(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Basic profile`}),(0,M.jsx)(w,{step:1,label:`Profile photo`,isOptional:!0,description:`Skipped`}),(0,M.jsx)(w,{step:2,label:`Connect socials`,isOptional:!0}),(0,M.jsx)(w,{step:3,label:`Preferences`}),(0,M.jsx)(w,{step:4,label:`All done`})]})})}},J={name:`Edge — Long Labels & Descriptions`,render:()=>{let[e,t]=(0,j.useState)(1);return(0,M.jsx)(`div`,{style:{maxWidth:400},children:(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Configure your development environment`,description:`Install dependencies, set up local database, configure environment variables`}),(0,M.jsx)(w,{step:1,label:`Create initial data migration`,description:`Define schema, seed data, and run migrations against staging`}),(0,M.jsx)(w,{step:2,label:`Submit for code review`,description:`Open pull request and address reviewer feedback`})]})})}},Y={name:`On-Track — Vertical`,render:()=>{let[e,t]=(0,j.useState)(2);return(0,M.jsx)(`div`,{style:{maxWidth:400},children:(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Create workspace`}),(0,M.jsx)(w,{step:1,label:`Invite team members`}),(0,M.jsx)(w,{step:2,label:`Set up integrations`}),(0,M.jsx)(w,{step:3,label:`Import data`}),(0,M.jsx)(w,{step:4,label:`Launch`})]})})}},X={name:`On-Track — Horizontal`,render:()=>{let[e,t]=(0,j.useState)(2);return(0,M.jsx)(`div`,{style:{maxWidth:700},children:(0,M.jsxs)(x,{activeStep:e,orientation:`horizontal`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Cart`,indicator:`number`}),(0,M.jsx)(w,{step:1,label:`Shipping`,indicator:`number`}),(0,M.jsx)(w,{step:2,label:`Payment`,indicator:`number`}),(0,M.jsx)(w,{step:3,label:`Review`,indicator:`number`}),(0,M.jsx)(w,{step:4,label:`Confirm`,indicator:`number`})]})})}},Z={name:`On-Track — Vertical (with description)`,render:()=>{let[e,t]=(0,j.useState)(2);return(0,M.jsx)(`div`,{style:{maxWidth:400},children:(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Create workspace`,description:`Name and configure your workspace`}),(0,M.jsx)(w,{step:1,label:`Invite team members`,description:`Add collaborators by email`}),(0,M.jsx)(w,{step:2,label:`Set up integrations`,description:`Connect Slack, GitHub, Jira`}),(0,M.jsx)(w,{step:3,label:`Import data`,description:`Bring in existing projects`}),(0,M.jsx)(w,{step:4,label:`Launch`,description:`Go live with your team`})]})})}},Q={name:`On-Track — Horizontal (with description)`,render:()=>{let[e,t]=(0,j.useState)(2);return(0,M.jsx)(`div`,{style:{maxWidth:760},children:(0,M.jsxs)(x,{activeStep:e,orientation:`horizontal`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Cart`,indicator:`number`,description:`Review your items`}),(0,M.jsx)(w,{step:1,label:`Shipping`,indicator:`number`,description:`Where to deliver`}),(0,M.jsx)(w,{step:2,label:`Payment`,indicator:`number`,description:`Card or PayPal`}),(0,M.jsx)(w,{step:3,label:`Review`,indicator:`number`,description:`Confirm details`}),(0,M.jsx)(w,{step:4,label:`Confirm`,indicator:`number`,description:`Place your order`})]})})}},$={name:`On-Track — vs Separated`,render:()=>{let[e,t]=(0,j.useState)(2);return(0,M.jsxs)(`div`,{style:{display:`flex`,gap:64},children:[(0,M.jsxs)(`div`,{style:{maxWidth:280},children:[(0,M.jsx)(s,{type:`label`,children:`separated (current)`}),(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,indicatorPosition:`separated`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Account`,description:`Basic details`}),(0,M.jsx)(w,{step:1,label:`Profile`,description:`About you`}),(0,M.jsx)(w,{step:2,label:`Settings`,description:`Preferences`}),(0,M.jsx)(w,{step:3,label:`Review`,description:`Confirm details`})]})]}),(0,M.jsxs)(`div`,{style:{maxWidth:280},children:[(0,M.jsx)(s,{type:`label`,children:`on-track`}),(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Account`,description:`Basic details`}),(0,M.jsx)(w,{step:1,label:`Profile`,description:`About you`}),(0,M.jsx)(w,{step:2,label:`Settings`,description:`Preferences`}),(0,M.jsx)(w,{step:3,label:`Review`,description:`Confirm details`})]})]})]})}},fe={name:`On-Track — Status Colors`,render:()=>{let[e,t]=(0,j.useState)(3);return(0,M.jsx)(`div`,{style:{maxWidth:400},children:(0,M.jsxs)(x,{activeStep:e,orientation:`vertical`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Email verified`,description:`ernesttien@meta.com`,status:`success`}),(0,M.jsx)(w,{step:1,label:`Phone verified`,description:`+1 (555) 012-3456`,status:`success`}),(0,M.jsx)(w,{step:2,label:`Identity document`,description:`Passport upload failed`,status:`error`}),(0,M.jsx)(w,{step:3,label:`Address verification`,description:`Pending review`,status:`accent`}),(0,M.jsx)(w,{step:4,label:`Background check`,isOptional:!0}),(0,M.jsx)(w,{step:5,label:`Account activated`})]})})}},pe={name:`On-Track — Horizontal, Many Steps`,render:()=>{let[e,t]=(0,j.useState)(3);return(0,M.jsxs)(x,{activeStep:e,orientation:`horizontal`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,M.jsx)(w,{step:0,label:`Idea`,indicator:`number`}),(0,M.jsx)(w,{step:1,label:`Design`,indicator:`number`}),(0,M.jsx)(w,{step:2,label:`Build`,indicator:`number`}),(0,M.jsx)(w,{step:3,label:`Test`,indicator:`number`}),(0,M.jsx)(w,{step:4,label:`Review`,indicator:`number`}),(0,M.jsx)(w,{step:5,label:`Deploy`,indicator:`number`}),(0,M.jsx)(w,{step:6,label:`Monitor`,indicator:`number`})]})}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'Default',
  render: () => {
    const [active, setActive] = useState(2);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
          <Step step={0} label="Create workspace" description="Name and configure your workspace" />
          <Step step={1} label="Invite team members" description="Add collaborators by email" />
          <Step step={2} label="Set up integrations" description="Connect Slack, GitHub, Jira" />
          <Step step={3} label="Import data" description="Bring in existing projects" />
          <Step step={4} label="Launch" description="Go live with your team" />
        </Stepper>
      </div>;
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'Default — Horizontal',
  render: () => {
    const [active, setActive] = useState(1);
    return <div style={{
      maxWidth: 700
    }}>
        <Stepper activeStep={active} orientation="horizontal" onStepClick={setActive}>
          <Step step={0} label="Workspace" />
          <Step step={1} label="Team" />
          <Step step={2} label="Integrations" />
          <Step step={3} label="Import" />
          <Step step={4} label="Launch" />
        </Stepper>
      </div>;
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'Numbered — Deploy Pipeline',
  render: () => {
    const [active, setActive] = useState(2);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
          <Step step={0} label="Push to main" description="Merge your pull request" indicator="number" />
          <Step step={1} label="Run CI checks" description="Lint, type-check, test" indicator="number" />
          <Step step={2} label="Build container" description="Docker image to registry" indicator="number" />
          <Step step={3} label="Deploy to staging" description="Verify in staging environment" indicator="number" />
          <Step step={4} label="Promote to production" description="Canary → full rollout" indicator="number" />
        </Stepper>
      </div>;
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'Numbered — Horizontal Checkout',
  render: () => {
    const [active, setActive] = useState(1);
    return <div style={{
      maxWidth: 600
    }}>
        <Stepper activeStep={active} orientation="horizontal" onStepClick={setActive}>
          <Step step={0} label="Cart" indicator="number" />
          <Step step={1} label="Shipping" indicator="number" />
          <Step step={2} label="Payment" indicator="number" />
          <Step step={3} label="Confirm" indicator="number" />
        </Stepper>
      </div>;
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'Status — Account Verification',
  render: () => {
    const [active, setActive] = useState(3);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
          <Step step={0} label="Email verified" description="ernesttien@meta.com" status="success" />
          <Step step={1} label="Phone verified" description="+1 (555) 012-3456" status="success" />
          <Step step={2} label="Identity document" description="Passport upload failed" status="error" />
          <Step step={3} label="Address verification" description="Pending review" status="accent" />
          <Step step={4} label="Background check" isOptional description="Skipped" />
          <Step step={5} label="Account activated" />
        </Stepper>
      </div>;
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  name: 'Status — Semantic Colors Reference',
  render: () => {
    // Start past all steps so each status glyph is visible (the current step
    // always shows the ring, which would otherwise mask one status).
    const [active, setActive] = useState(5);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
          <Step step={0} label="Accent" description="--color-accent" status="accent" />
          <Step step={1} label="Success" description="--color-success" status="success" />
          <Step step={2} label="Warning" description="--color-warning" status="warning" />
          <Step step={3} label="Error" description="--color-error" status="error" />
          <Step step={4} label="Default (no status)" description="progress-derived color" />
        </Stepper>
      </div>;
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: 'Minimal — Interview Process',
  render: () => {
    const [active, setActive] = useState(2);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
          <Step step={0} label="Phone screen" description="30 min with recruiter" indicator="none" />
          <Step step={1} label="Technical interview" description="1 hour coding session" indicator="none" />
          <Step step={2} label="System design" description="45 min whiteboard" indicator="none" />
          <Step step={3} label="Team match" description="Meet potential teammates" indicator="none" />
          <Step step={4} label="Offer" indicator="none" />
        </Stepper>
      </div>;
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: 'Minimal — Video Upload',
  render: () => {
    const [active, setActive] = useState(1);
    return <div style={{
      maxWidth: 500
    }}>
        <Stepper activeStep={active} orientation="horizontal" onStepClick={setActive}>
          <Step step={0} label="Upload" indicator="none" />
          <Step step={1} label="Details" indicator="none" />
          <Step step={2} label="Audience" indicator="none" />
          <Step step={3} label="Publish" indicator="none" />
        </Stepper>
      </div>;
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: 'Indicator Modes — Side by Side',
  render: () => {
    const [active, setActive] = useState(2);
    return <div style={{
      display: 'flex',
      gap: 48
    }}>
        <div style={{
        maxWidth: 280
      }}>
          <Text type="label">Auto (default)</Text>
          <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
            <Step step={0} label="Account" />
            <Step step={1} label="Profile" />
            <Step step={2} label="Settings" />
            <Step step={3} label="Review" />
            <Step step={4} label="Done" />
          </Stepper>
        </div>
        <div style={{
        maxWidth: 280
      }}>
          <Text type="label">Number</Text>
          <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
            <Step step={0} label="Account" indicator="number" />
            <Step step={1} label="Profile" indicator="number" />
            <Step step={2} label="Settings" indicator="number" />
            <Step step={3} label="Review" indicator="number" />
            <Step step={4} label="Done" indicator="number" />
          </Stepper>
        </div>
        <div style={{
        maxWidth: 280
      }}>
          <Text type="label">Custom icon</Text>
          <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
            <Step step={0} label="Account" icon={<Icon icon="info" size="sm" />} />
            <Step step={1} label="Profile" icon={<Icon icon="search" size="sm" />} />
            <Step step={2} label="Settings" icon={<Icon icon="wrench" size="sm" />} />
            <Step step={3} label="Review" icon={<Icon icon="clock" size="sm" />} />
            <Step step={4} label="Done" icon={<Icon icon="check" size="sm" />} />
          </Stepper>
        </div>
        <div style={{
        maxWidth: 280
      }}>
          <Text type="label">None</Text>
          <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
            <Step step={0} label="Account" indicator="none" />
            <Step step={1} label="Profile" indicator="none" />
            <Step step={2} label="Settings" indicator="none" />
            <Step step={3} label="Review" indicator="none" />
            <Step step={4} label="Done" indicator="none" />
          </Stepper>
        </div>
      </div>;
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'With Content — Multi-Step Form',
  render: () => {
    const [active, setActive] = useState(0);
    return <div style={{
      maxWidth: 480
    }}>
        <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
          <Step step={0} label="Project details" indicator="number">
            {active === 0 && <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
                <TextInput label="Project name" placeholder="My awesome project" value="" />
                <TextInput label="Repository URL" placeholder="https://github.com/..." value="" />
                <div>
                  <Button label="Continue" variant="primary" onClick={() => setActive(1)} />
                </div>
              </div>}
          </Step>
          <Step step={1} label="Environment" indicator="number">
            {active === 1 && <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
                <TextInput label="Node version" placeholder="20" value="" />
                <TextInput label="Build command" placeholder="npm run build" value="" />
                <div style={{
              display: 'flex',
              gap: 8
            }}>
                  <Button label="Back" variant="secondary" onClick={() => setActive(0)} />
                  <Button label="Continue" variant="primary" onClick={() => setActive(2)} />
                </div>
              </div>}
          </Step>
          <Step step={2} label="Deploy" indicator="number">
            {active === 2 && <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
                <Text type="body">
                  Ready to deploy. This will create a production build and push
                  to your configured hosting.
                </Text>
                <div style={{
              display: 'flex',
              gap: 8
            }}>
                  <Button label="Back" variant="secondary" onClick={() => setActive(1)} />
                  <Button label="Deploy now" variant="primary" onClick={() => setActive(3)} />
                </div>
              </div>}
          </Step>
          <Step step={3} label="Done" indicator="number" />
        </Stepper>
      </div>;
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  name: 'Density — Compact / Balanced / Spacious',
  render: () => {
    const [active, setActive] = useState(1);
    return <div style={{
      display: 'flex',
      gap: 48
    }}>
        <div style={{
        maxWidth: 250
      }}>
          <Text type="label">Compact</Text>
          <Stepper activeStep={active} orientation="vertical" onStepClick={setActive} density="compact">
            <Step step={0} label="Account" indicator="number" />
            <Step step={1} label="Profile" indicator="number" />
            <Step step={2} label="Payment" indicator="number" />
            <Step step={3} label="Review" indicator="number" />
          </Stepper>
        </div>
        <div style={{
        maxWidth: 250
      }}>
          <Text type="label">Balanced</Text>
          <Stepper activeStep={active} orientation="vertical" onStepClick={setActive} density="balanced">
            <Step step={0} label="Account" indicator="number" />
            <Step step={1} label="Profile" indicator="number" />
            <Step step={2} label="Payment" indicator="number" />
            <Step step={3} label="Review" indicator="number" />
          </Stepper>
        </div>
        <div style={{
        maxWidth: 250
      }}>
          <Text type="label">Spacious</Text>
          <Stepper activeStep={active} orientation="vertical" onStepClick={setActive} density="spacious">
            <Step step={0} label="Account" indicator="number" />
            <Step step={1} label="Profile" indicator="number" />
            <Step step={2} label="Payment" indicator="number" />
            <Step step={3} label="Review" indicator="number" />
          </Stepper>
        </div>
      </div>;
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Edge — Two Steps',
  render: () => {
    const [active, setActive] = useState(0);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="horizontal" onStepClick={setActive}>
          <Step step={0} label="Before" />
          <Step step={1} label="After" />
        </Stepper>
      </div>;
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Edge — Seven Steps (Horizontal)',
  render: () => {
    const [active, setActive] = useState(3);
    return <Stepper activeStep={active} orientation="horizontal" onStepClick={setActive}>
        <Step step={0} label="Idea" indicator="number" />
        <Step step={1} label="Design" indicator="number" />
        <Step step={2} label="Build" indicator="number" />
        <Step step={3} label="Test" indicator="number" />
        <Step step={4} label="Review" indicator="number" />
        <Step step={5} label="Deploy" indicator="number" />
        <Step step={6} label="Monitor" indicator="number" />
      </Stepper>;
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'Edge — Disabled Steps',
  render: () => {
    const [active, setActive] = useState(1);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
          <Step step={0} label="Basic info" />
          <Step step={1} label="Permissions" />
          <Step step={2} label="Admin settings" description="Requires admin role" isDisabled />
          <Step step={3} label="Confirm" />
        </Stepper>
      </div>;
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'Edge — Optional + Skipped',
  render: () => {
    const [active, setActive] = useState(3);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
          <Step step={0} label="Basic profile" />
          <Step step={1} label="Profile photo" isOptional description="Skipped" />
          <Step step={2} label="Connect socials" isOptional />
          <Step step={3} label="Preferences" />
          <Step step={4} label="All done" />
        </Stepper>
      </div>;
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'Edge — Long Labels & Descriptions',
  render: () => {
    const [active, setActive] = useState(1);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
          <Step step={0} label="Configure your development environment" description="Install dependencies, set up local database, configure environment variables" />
          <Step step={1} label="Create initial data migration" description="Define schema, seed data, and run migrations against staging" />
          <Step step={2} label="Submit for code review" description="Open pull request and address reviewer feedback" />
        </Stepper>
      </div>;
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'On-Track — Vertical',
  render: () => {
    const [active, setActive] = useState(2);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" indicatorPosition="on-track" onStepClick={setActive}>
          <Step step={0} label="Create workspace" />
          <Step step={1} label="Invite team members" />
          <Step step={2} label="Set up integrations" />
          <Step step={3} label="Import data" />
          <Step step={4} label="Launch" />
        </Stepper>
      </div>;
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  name: 'On-Track — Horizontal',
  render: () => {
    const [active, setActive] = useState(2);
    return <div style={{
      maxWidth: 700
    }}>
        <Stepper activeStep={active} orientation="horizontal" indicatorPosition="on-track" onStepClick={setActive}>
          <Step step={0} label="Cart" indicator="number" />
          <Step step={1} label="Shipping" indicator="number" />
          <Step step={2} label="Payment" indicator="number" />
          <Step step={3} label="Review" indicator="number" />
          <Step step={4} label="Confirm" indicator="number" />
        </Stepper>
      </div>;
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'On-Track — Vertical (with description)',
  render: () => {
    const [active, setActive] = useState(2);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" indicatorPosition="on-track" onStepClick={setActive}>
          <Step step={0} label="Create workspace" description="Name and configure your workspace" />
          <Step step={1} label="Invite team members" description="Add collaborators by email" />
          <Step step={2} label="Set up integrations" description="Connect Slack, GitHub, Jira" />
          <Step step={3} label="Import data" description="Bring in existing projects" />
          <Step step={4} label="Launch" description="Go live with your team" />
        </Stepper>
      </div>;
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'On-Track — Horizontal (with description)',
  render: () => {
    const [active, setActive] = useState(2);
    return <div style={{
      maxWidth: 760
    }}>
        <Stepper activeStep={active} orientation="horizontal" indicatorPosition="on-track" onStepClick={setActive}>
          <Step step={0} label="Cart" indicator="number" description="Review your items" />
          <Step step={1} label="Shipping" indicator="number" description="Where to deliver" />
          <Step step={2} label="Payment" indicator="number" description="Card or PayPal" />
          <Step step={3} label="Review" indicator="number" description="Confirm details" />
          <Step step={4} label="Confirm" indicator="number" description="Place your order" />
        </Stepper>
      </div>;
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  name: 'On-Track — vs Separated',
  render: () => {
    const [active, setActive] = useState(2);
    return <div style={{
      display: 'flex',
      gap: 64
    }}>
        <div style={{
        maxWidth: 280
      }}>
          <Text type="label">separated (current)</Text>
          <Stepper activeStep={active} orientation="vertical" indicatorPosition="separated" onStepClick={setActive}>
            <Step step={0} label="Account" description="Basic details" />
            <Step step={1} label="Profile" description="About you" />
            <Step step={2} label="Settings" description="Preferences" />
            <Step step={3} label="Review" description="Confirm details" />
          </Stepper>
        </div>
        <div style={{
        maxWidth: 280
      }}>
          <Text type="label">on-track</Text>
          <Stepper activeStep={active} orientation="vertical" indicatorPosition="on-track" onStepClick={setActive}>
            <Step step={0} label="Account" description="Basic details" />
            <Step step={1} label="Profile" description="About you" />
            <Step step={2} label="Settings" description="Preferences" />
            <Step step={3} label="Review" description="Confirm details" />
          </Stepper>
        </div>
      </div>;
  }
}`,...$.parameters?.docs?.source}}},fe.parameters={...fe.parameters,docs:{...fe.parameters?.docs,source:{originalSource:`{
  name: 'On-Track — Status Colors',
  render: () => {
    const [active, setActive] = useState(3);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" indicatorPosition="on-track" onStepClick={setActive}>
          <Step step={0} label="Email verified" description="ernesttien@meta.com" status="success" />
          <Step step={1} label="Phone verified" description="+1 (555) 012-3456" status="success" />
          <Step step={2} label="Identity document" description="Passport upload failed" status="error" />
          <Step step={3} label="Address verification" description="Pending review" status="accent" />
          <Step step={4} label="Background check" isOptional />
          <Step step={5} label="Account activated" />
        </Stepper>
      </div>;
  }
}`,...fe.parameters?.docs?.source}}},pe.parameters={...pe.parameters,docs:{...pe.parameters?.docs,source:{originalSource:`{
  name: 'On-Track — Horizontal, Many Steps',
  render: () => {
    const [active, setActive] = useState(3);
    return <Stepper activeStep={active} orientation="horizontal" indicatorPosition="on-track" onStepClick={setActive}>
        <Step step={0} label="Idea" indicator="number" />
        <Step step={1} label="Design" indicator="number" />
        <Step step={2} label="Build" indicator="number" />
        <Step step={3} label="Test" indicator="number" />
        <Step step={4} label="Review" indicator="number" />
        <Step step={5} label="Deploy" indicator="number" />
        <Step step={6} label="Monitor" indicator="number" />
      </Stepper>;
  }
}`,...pe.parameters?.docs?.source}}},me=[`Default`,`DefaultHorizontal`,`NumberedVertical`,`NumberedHorizontal`,`StatusVertical`,`StatusAllStates`,`MinimalVertical`,`MinimalHorizontal`,`IndicatorComparison`,`WithContentSlot`,`DensityComparison`,`TwoSteps`,`ManySteps`,`DisabledSteps`,`OptionalSteps`,`LongLabels`,`OnTrackVertical`,`OnTrackHorizontal`,`OnTrackVerticalDescriptions`,`OnTrackHorizontalDescriptions`,`OnTrackComparison`,`OnTrackStatus`,`OnTrackHorizontalManySteps`]})))()}he();export{N as Default,P as DefaultHorizontal,U as DensityComparison,K as DisabledSteps,V as IndicatorComparison,J as LongLabels,G as ManySteps,B as MinimalHorizontal,z as MinimalVertical,I as NumberedHorizontal,F as NumberedVertical,$ as OnTrackComparison,X as OnTrackHorizontal,Q as OnTrackHorizontalDescriptions,pe as OnTrackHorizontalManySteps,fe as OnTrackStatus,Y as OnTrackVertical,Z as OnTrackVerticalDescriptions,q as OptionalSteps,R as StatusAllStates,L as StatusVertical,W as TwoSteps,H as WithContentSlot,me as __namedExportsOrder,de as default};