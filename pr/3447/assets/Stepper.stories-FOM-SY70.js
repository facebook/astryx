import{ah as n,a1 as e,a6 as h,af as d,ay as O,T as x,I as p,B as S}from"./iframe-j1EZkcGb.js";import{T as w}from"./TextInput-DnnvBOrd.js";import"./preload-helper-Ct5FWWRu.js";import"./Field-MJLQjcWT.js";import"./FieldStatus-BgagH4tV.js";import"./inputStyles.stylex-Bpqcd25J.js";import"./groupStyles-CeI8FlII.js";import"./useInputContainer-NEfGrLOd.js";const Q=n.createContext(null);Q.displayName="StepperContext";function he(){const s=n.use(Q);if(s==null)throw new Error("useStepperContext must be used within Stepper. Wrap your Step in <Stepper>.");return s}const Y={root:{k1xSpc:"astryx78zum5",kzqmXN:"astryxh8yej3",kH6xsr:"astryx3ct3a4",kogj98:"astryx1ghz6dp",kmVPX3:"astryx1717udv",$$css:!0},horizontal:{kXwgrk:"astryx1q0g3np",kGNEyG:"astryx1cy8zhl",kOIVth:"astryx195vfkc",$$css:!0},vertical:{kXwgrk:"astryxdt5ytf",kOIVth:"astryx195vfkc",$$css:!0}};function i({activeStep:s,children:a,orientation:y="horizontal",onStepClick:u,label:V="Progress",density:o="balanced",xstyle:m,className:H,style:G,ref:b,...X}){const k=n.useMemo(()=>({activeStep:s,orientation:y,isNonLinear:u!=null,onStepClick:u??null,density:o}),[s,y,u,o]);return e.jsx(Q,{value:k,children:e.jsx("ol",{ref:b,"aria-label":V,...X,...h(O("stepper",{orientation:y}),d(Y.root,y==="horizontal"?Y.horizontal:Y.vertical,m),H,G),children:a})})}i.displayName="Stepper";i.__docgenInfo={description:`A stepper component for multi-step workflows. Displays numbered steps
with visual indicators for completed, active, and upcoming states.

Each Step child must provide a \`step\` prop (zero-based index) so it
can derive its state from the parent's activeStep. CSS :last-child
handles connector hiding — no child introspection needed.

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
\`\`\``,methods:[],displayName:"Stepper",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLOListElement>",elements:[{name:"HTMLOListElement"}]},description:"Ref forwarded to the root element"},activeStep:{required:!0,tsType:{name:"number"},description:"Zero-based index of the active step."},children:{required:!0,tsType:{name:"ReactNode"},description:"Step elements to render."},orientation:{required:!1,tsType:{name:"union",raw:"'horizontal' | 'vertical'",elements:[{name:"literal",value:"'horizontal'"},{name:"literal",value:"'vertical'"}]},description:`Layout direction of the stepper.
@default 'horizontal'`,defaultValue:{value:"'horizontal'",computed:!1}},onStepClick:{required:!1,tsType:{name:"signature",type:"function",raw:"(index: number) => void",signature:{arguments:[{type:{name:"number"},name:"index"}],return:{name:"void"}}},description:`Called when a step indicator is clicked. Enables non-linear navigation.
When provided, completed and current steps become clickable.`},label:{required:!1,tsType:{name:"string"},description:`Accessible label describing the set of steps.
@default 'Progress'`,defaultValue:{value:"'Progress'",computed:!1}},density:{required:!1,tsType:{name:"union",raw:"'compact' | 'balanced' | 'spacious'",elements:[{name:"literal",value:"'compact'"},{name:"literal",value:"'balanced'"},{name:"literal",value:"'spacious'"}]},description:`Controls density (padding) of all steps.
@default 'balanced'`,defaultValue:{value:"'balanced'",computed:!1}}},composes:["Omit"]};function ke(){return e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",children:[e.jsx("circle",{cx:"8",cy:"8",r:"8",fill:"currentColor"}),e.jsx("path",{d:"M5 8.5l2 2 4-4",stroke:"white",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})}function je(){return e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",children:[e.jsx("circle",{cx:"8",cy:"8",r:"7",stroke:"currentColor",strokeWidth:"2"}),e.jsx("circle",{cx:"8",cy:"8",r:"4",fill:"currentColor"})]})}const r={verticalRoot:{k1xSpc:"astryx78zum5",kXwgrk:"astryx1q0g3np",kGNEyG:"astryx1qjc9v5",kVAEAm:"astryx1n2onr6",kOIVth:"astryx1lsbc85",$$css:!0},verticalBar:{kzqmXN:"astryx51ohtg",kaIpWk:"astryxjspbzw",kmuXW:"astryx2lah0s",kSGwAc:"astryxkh2ocl",$$css:!0},barCompleted:{kWkggS:"astryx1ewilqj",$$css:!0},barIncomplete:{kWkggS:"astryx1m4xfpy",$$css:!0},barAccent:{kWkggS:"astryx1ewilqj",$$css:!0},barSuccess:{kWkggS:"astryxdsz4j9",$$css:!0},barWarning:{kWkggS:"astryx1q8g9m5",$$css:!0},barError:{kWkggS:"astryx1pjz0fi",$$css:!0},horizontalStep:{k1xSpc:"astryx78zum5",kXwgrk:"astryxdt5ytf",kGNEyG:"astryx1cy8zhl",kUk6DE:"astryx98rzlu",$$css:!0},horizontalBar:{kzqmXN:"astryxh8yej3",kZKoxP:"astryxqu0tyb",kaIpWk:"astryxjspbzw",kmuXW:"astryx2lah0s",k1K539:"astryxlstkdb",$$css:!0},icon:{k1xSpc:"astryx78zum5",kGNEyG:"astryx6s0dn4",kjj79g:"astryxl56j7k",kzqmXN:"astryx12xnipv",kZKoxP:"astryx6b6gus",kmuXW:"astryx2lah0s",$$css:!0},iconCompleted:{kMwMTN:"astryxqwr325",$$css:!0},iconInProgress:{kMwMTN:"astryxqwr325",$$css:!0},iconNotStarted:{kMwMTN:"astryxv9yike",$$css:!0},iconDisabled:{kMwMTN:"astryxqa6c3m",kSiTet:"astryxbyyjgo",$$css:!0},iconAccent:{kMwMTN:"astryxqwr325",$$css:!0},iconSuccess:{kMwMTN:"astryxtjic6",$$css:!0},iconWarning:{kMwMTN:"astryxs3pv69",$$css:!0},iconError:{kMwMTN:"astryxjt36v0",$$css:!0},numberBadge:{k1xSpc:"astryxrvj5dj",kgQiWS:"astryx1ku5rj1",kzqmXN:"astryxfyiiit",kZKoxP:"astryx1grt7ep",kaIpWk:"astryxjspbzw",kGuDYH:"astryx1k6wstc",kGO01o:"astryx1j85h84",k63SB2:"astryx2mo6ok",kLWn49:"astryxo5v014",kmuXW:"astryx2lah0s",k9WMMc:"astryx2b8uid",$$css:!0},numberCompleted:{kWkggS:"astryx1ewilqj",kMwMTN:"astryxrkvqaz",$$css:!0},numberInProgress:{kWkggS:"astryx1ewilqj",kMwMTN:"astryxrkvqaz",$$css:!0},numberNotStarted:{kWkggS:"astryxwmxj5m",kMwMTN:"astryxv1l7n4",$$css:!0},numberDisabled:{kWkggS:"astryxwmxj5m",kMwMTN:"astryxnbbluu",kSiTet:"astryxbyyjgo",$$css:!0},numberAccent:{kWkggS:"astryx1ewilqj",kMwMTN:"astryx17wrial",$$css:!0},numberSuccess:{kWkggS:"astryxdsz4j9",kMwMTN:"astryxri61p4",$$css:!0},numberWarning:{kWkggS:"astryx1q8g9m5",kMwMTN:"astryxrebv38",$$css:!0},numberError:{kWkggS:"astryx1pjz0fi",kMwMTN:"astryx1m024r3",$$css:!0},label:{kGuDYH:"astryxjm74w1",kLWn49:"astryxw6l6zx",k63SB2:"astryx1sodnla",kMwMTN:"astryx1tgivj0",$$css:!0},labelInProgress:{k63SB2:"astryx2mo6ok",$$css:!0},labelNotStarted:{kMwMTN:"astryxv1l7n4",$$css:!0},labelDisabled:{kMwMTN:"astryxnbbluu",$$css:!0},descriptionRow:{kZCmMZ:"astryx18gyask",$$css:!0},descriptionRowWithIndicator:{kZCmMZ:"astryx31w388",$$css:!0},descriptionRowWithNumber:{kZCmMZ:"astryxchaq28",$$css:!0},stepContent:{kLKAdn:"astryx1xye8es",$$css:!0},stepContentWithIndicator:{kZCmMZ:"astryx31w388",$$css:!0},stepContentWithNumber:{kZCmMZ:"astryxchaq28",$$css:!0}};function t({step:s,label:a,description:y,children:u,icon:V,status:o,isDisabled:m=!1,isOptional:H=!1,endContent:G,indicator:b,density:X,xstyle:k,className:ee,style:te,ref:se,"data-testid":ae,...re}){const ye=he(),{activeStep:ie,orientation:ue,onStepClick:Z,density:me}=ye,c=X??me,ne=b!=null&&typeof b!="string",v=ne?"auto":b??"auto",l=s===ie?"in-progress":s<ie?"completed":"not-started",be=ue==="vertical",U=l==="in-progress",_=!m&&Z!=null,oe=()=>{_&&Z&&Z(s)},ce=l==="completed"||l==="in-progress",le=o==="accent"?r.barAccent:o==="success"?r.barSuccess:o==="warning"?r.barWarning:o==="error"?r.barError:void 0;let F=null;const j=ne?b:V??null;if(v!=="none")if(j==null&&(v==="number"||v==="auto"&&l==="not-started")){const J=m?r.numberDisabled:o==="accent"?r.numberAccent:o==="success"?r.numberSuccess:o==="warning"?r.numberWarning:o==="error"?r.numberError:l==="completed"?r.numberCompleted:l==="in-progress"?r.numberInProgress:r.numberNotStarted;F=e.jsx("div",{"aria-hidden":"true",...d(r.numberBadge,J),children:s+1})}else{const J=j??(l==="completed"?e.jsx(ke,{}):e.jsx(je,{})),Se=m?r.iconDisabled:o==="accent"?r.iconAccent:o==="success"?r.iconSuccess:o==="warning"?r.iconWarning:o==="error"?r.iconError:l==="completed"?r.iconCompleted:l==="in-progress"?r.iconInProgress:r.iconNotStarted;F=e.jsx("div",{"aria-hidden":"true",...d(r.icon,Se),children:J})}const K=v!=="none",pe=K&&j==null&&(v==="number"||v==="auto"&&l==="not-started"),ve=m?r.labelDisabled:l==="not-started"?r.labelNotStarted:U?r.labelInProgress:void 0,f=e.jsxs("div",{className:"astryx78zum5 astryx1q0g3np astryx6s0dn4 astryx1txdalj",children:[F,e.jsx("span",{...d(r.label,ve),children:a}),H&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"astryxjm74w1 astryxv1l7n4",children:"•"}),e.jsx("span",{className:"astryxjm74w1 astryxv1l7n4",children:"Optional"})]}),G]}),g=y!=null?e.jsx("div",{...d(K?pe?r.descriptionRowWithNumber:r.descriptionRowWithIndicator:r.descriptionRow),children:e.jsx("span",{className:"astryx141an7d astryx1ltkj2j astryxv1l7n4",children:y})}):null,de=u!=null?e.jsx("div",{...d(r.stepContent,K&&(pe?r.stepContentWithNumber:r.stepContentWithIndicator)),children:u}):null,xe=O("step",{progress:l,status:o??void 0});return be?e.jsxs("li",{ref:se,...h(xe,d(r.verticalRoot,k),ee,te),"aria-current":U?"step":void 0,"data-testid":ae,...re,children:[e.jsx("div",{...h(O("step-bar"),d(r.verticalBar,le??(ce?r.barCompleted:r.barIncomplete))),"aria-hidden":"true"}),e.jsxs("div",{className:"astryx78zum5 astryxdt5ytf astryx98rzlu",children:[_?e.jsxs("button",{type:"button",onClick:oe,"aria-label":`Go to step ${s+1}: ${a}`,...{0:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk"},4:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxu0wf1k astryxf314gf"},2:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxce4md1 astryxf314gf"},6:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxce4md1 astryxf314gf"},1:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod"},5:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod"},3:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod"},7:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod"}}[(c==="compact")<<2|(c==="balanced")<<1|(c==="spacious")<<0],children:[f,g]}):e.jsxs("div",{...{0:{},4:{className:"astryxu0wf1k astryxf314gf"},2:{className:"astryxce4md1 astryxf314gf"},6:{className:"astryxce4md1 astryxf314gf"},1:{className:"astryx8o8v82 astryxrrkdod"},5:{className:"astryx8o8v82 astryxrrkdod"},3:{className:"astryx8o8v82 astryxrrkdod"},7:{className:"astryx8o8v82 astryxrrkdod"}}[(c==="compact")<<2|(c==="balanced")<<1|(c==="spacious")<<0],children:[f,g]}),de]})]}):e.jsxs("li",{ref:se,...h(xe,d(r.horizontalStep,k),ee,te),"aria-current":U?"step":void 0,"data-testid":ae,...re,children:[e.jsx("div",{...h(O("step-bar"),d(r.horizontalBar,le??(ce?r.barCompleted:r.barIncomplete))),"aria-hidden":"true"}),_?e.jsxs("button",{type:"button",onClick:oe,"aria-label":`Go to step ${s+1}: ${a}`,...{0:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk"},4:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxu0wf1k astryxf314gf"},2:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxce4md1 astryxf314gf"},6:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryxce4md1 astryxf314gf"},1:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod"},5:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod"},3:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod"},7:{className:"astryx1yc453h astryx1qjc9v5 astryx78zum5 astryxdt5ytf astryxh8yej3 astryx1ypdohk astryxh6dtrn astryx15406qy astryxkvfbh3 astryxlr8y92 astryxjbqb8w astryxe9uy6x astryxyxi2l3 astryx1a2a7pz astryx17nn4n9 astryx1wfwxd8 astryx7s97pk astryx8o8v82 astryxrrkdod"}}[(c==="compact")<<2|(c==="balanced")<<1|(c==="spacious")<<0],children:[f,g]}):e.jsxs("div",{...{0:{},4:{className:"astryxu0wf1k astryxf314gf"},2:{className:"astryxce4md1 astryxf314gf"},6:{className:"astryxce4md1 astryxf314gf"},1:{className:"astryx8o8v82 astryxrrkdod"},5:{className:"astryx8o8v82 astryxrrkdod"},3:{className:"astryx8o8v82 astryxrrkdod"},7:{className:"astryx8o8v82 astryxrrkdod"}}[(c==="compact")<<2|(c==="balanced")<<1|(c==="spacious")<<0],children:[f,g]}),de]})}t.displayName="Step";t.__docgenInfo={description:'An individual step within an Stepper. Renders a 4px progress-bar segment,\nan indicator (numbered badge, check, or any custom icon), a label with\noptional description, and an optional content slot.\n\nProgress (completed / active / not-started) is derived from the parent\'s\n`activeStep` and this step\'s `step` prop. The optional `status` prop layers a\nsemantic color (`accent` / `success` / `warning` / `error`) on top — color\nonly; it does not change layout or iconography.\n\n@example\n```\n<Step step={0} label="Account details" description="Enter your email" />\n```\n\n@example\n```\n// Generic icon + semantic color\n<Step step={1} label="Payment" status="error" icon={<Icon icon="warning" />} />\n```',methods:[],displayName:"Step",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLLIElement>",elements:[{name:"HTMLLIElement"}]},description:"Ref forwarded to the root element"},step:{required:!0,tsType:{name:"number"},description:"Zero-based index of this step. Used to derive progress (completed /\nactive / not-started) relative to the parent's `activeStep`."},label:{required:!0,tsType:{name:"string"},description:"Step label text."},description:{required:!1,tsType:{name:"string"},description:"Optional description shown below the label."},children:{required:!1,tsType:{name:"ReactNode"},description:`Content rendered below the label and description. Useful in vertical
steppers to show form fields or detailed content for each step.`},icon:{required:!1,tsType:{name:"ReactNode"},description:"Custom icon rendered inside the indicator. Accepts any ReactNode (for\nexample an `<Icon />`). Equivalent to passing the node directly to\n`indicator`; takes precedence over the built-in number/check."},status:{required:!1,tsType:{name:"union",raw:"'accent' | 'success' | 'warning' | 'error'",elements:[{name:"literal",value:"'accent'"},{name:"literal",value:"'success'"},{name:"literal",value:"'warning'"},{name:"literal",value:"'error'"}]},description:"Semantic color for the step. Controls **color only** and maps to the\nglobal Astryx semantic tokens (`accent`, `success`, `warning`, `error`).\nLeave unset to use the progress-derived default coloring."},isDisabled:{required:!1,tsType:{name:"boolean"},description:`Disable interaction for this step.
@default false`,defaultValue:{value:"false",computed:!1}},isOptional:{required:!1,tsType:{name:"boolean"},description:`Marks the step as optional, appending an "Optional" affordance after the
label.
@default false`,defaultValue:{value:"false",computed:!1}},endContent:{required:!1,tsType:{name:"ReactNode"},description:`Trailing content rendered at the end of the label row (e.g. a timestamp
or status chip).`},indicator:{required:!1,tsType:{name:"union",raw:"StepIndicatorPreset | ReactNode",elements:[{name:"union",raw:"'auto' | 'number' | 'none'",elements:[{name:"literal",value:"'auto'"},{name:"literal",value:"'number'"},{name:"literal",value:"'none'"}]},{name:"ReactNode"}]},description:`What to show as the step indicator. Accepts a preset string or any
ReactNode:
- 'auto': numbered badge until completed, then a check (default)
- 'number': always a numbered badge
- 'none': no indicator, just the bar + label
- ReactNode: any custom icon or element to render as the indicator
@default 'auto'`},density:{required:!1,tsType:{name:"union",raw:"'compact' | 'balanced' | 'spacious'",elements:[{name:"literal",value:"'compact'"},{name:"literal",value:"'balanced'"},{name:"literal",value:"'spacious'"}]},description:`Controls vertical padding of the step. Falls back to the stepper-level
density when unset.
- 'compact': minimal padding (4px block)
- 'balanced': default (8px block)
- 'spacious': generous (12px block, 12px inline)`}},composes:["Omit"]};const Te={title:"Lab/Stepper",component:i,tags:["autodocs"],argTypes:{activeStep:{control:{type:"number",min:0,max:5}},orientation:{control:"select",options:["horizontal","vertical"]},density:{control:"select",options:["compact","balanced","spacious"]}}},C={name:"Default",render:()=>{const[s,a]=n.useState(2);return e.jsx("div",{style:{maxWidth:400},children:e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Create workspace",description:"Name and configure your workspace"}),e.jsx(t,{step:1,label:"Invite team members",description:"Add collaborators by email"}),e.jsx(t,{step:2,label:"Set up integrations",description:"Connect Slack, GitHub, Jira"}),e.jsx(t,{step:3,label:"Import data",description:"Bring in existing projects"}),e.jsx(t,{step:4,label:"Launch",description:"Go live with your team"})]})})}},z={name:"Default — Horizontal",render:()=>{const[s,a]=n.useState(1);return e.jsx("div",{style:{maxWidth:700},children:e.jsxs(i,{activeStep:s,orientation:"horizontal",onStepClick:a,children:[e.jsx(t,{step:0,label:"Workspace"}),e.jsx(t,{step:1,label:"Team"}),e.jsx(t,{step:2,label:"Integrations"}),e.jsx(t,{step:3,label:"Import"}),e.jsx(t,{step:4,label:"Launch"})]})})}},A={name:"Numbered — Deploy Pipeline",render:()=>{const[s,a]=n.useState(2);return e.jsx("div",{style:{maxWidth:400},children:e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Push to main",description:"Merge your pull request",indicator:"number"}),e.jsx(t,{step:1,label:"Run CI checks",description:"Lint, type-check, test",indicator:"number"}),e.jsx(t,{step:2,label:"Build container",description:"Docker image to registry",indicator:"number"}),e.jsx(t,{step:3,label:"Deploy to staging",description:"Verify in staging environment",indicator:"number"}),e.jsx(t,{step:4,label:"Promote to production",description:"Canary → full rollout",indicator:"number"})]})})}},N={name:"Numbered — Horizontal Checkout",render:()=>{const[s,a]=n.useState(1);return e.jsx("div",{style:{maxWidth:600},children:e.jsxs(i,{activeStep:s,orientation:"horizontal",onStepClick:a,children:[e.jsx(t,{step:0,label:"Cart",indicator:"number"}),e.jsx(t,{step:1,label:"Shipping",indicator:"number"}),e.jsx(t,{step:2,label:"Payment",indicator:"number"}),e.jsx(t,{step:3,label:"Confirm",indicator:"number"})]})})}},q={name:"Status — Account Verification",render:()=>{const[s,a]=n.useState(3);return e.jsx("div",{style:{maxWidth:400},children:e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Email verified",description:"ernesttien@meta.com",status:"success",icon:e.jsx(p,{icon:"check",size:"sm"})}),e.jsx(t,{step:1,label:"Phone verified",description:"+1 (555) 012-3456",status:"success",icon:e.jsx(p,{icon:"check",size:"sm"})}),e.jsx(t,{step:2,label:"Identity document",description:"Passport upload failed",status:"error",icon:e.jsx(p,{icon:"warning",size:"sm"})}),e.jsx(t,{step:3,label:"Address verification",description:"Pending review",status:"accent"}),e.jsx(t,{step:4,label:"Background check",isOptional:!0,description:"Skipped"}),e.jsx(t,{step:5,label:"Account activated"})]})})}},W={name:"Status — Semantic Colors Reference",render:()=>{const[s,a]=n.useState(1);return e.jsx("div",{style:{maxWidth:400},children:e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Accent",description:"--color-accent",status:"accent"}),e.jsx(t,{step:1,label:"Success",description:"--color-success",status:"success",icon:e.jsx(p,{icon:"check",size:"sm"})}),e.jsx(t,{step:2,label:"Warning",description:"--color-warning",status:"warning",icon:e.jsx(p,{icon:"warning",size:"sm"})}),e.jsx(t,{step:3,label:"Error",description:"--color-error",status:"error",icon:e.jsx(p,{icon:"warning",size:"sm"})}),e.jsx(t,{step:4,label:"Default (no status)",description:"progress-derived color"})]})})}},T={name:"Minimal — Interview Process",render:()=>{const[s,a]=n.useState(2);return e.jsx("div",{style:{maxWidth:400},children:e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Phone screen",description:"30 min with recruiter",indicator:"none"}),e.jsx(t,{step:1,label:"Technical interview",description:"1 hour coding session",indicator:"none"}),e.jsx(t,{step:2,label:"System design",description:"45 min whiteboard",indicator:"none"}),e.jsx(t,{step:3,label:"Team match",description:"Meet potential teammates",indicator:"none"}),e.jsx(t,{step:4,label:"Offer",indicator:"none"})]})})}},$={name:"Minimal — Video Upload",render:()=>{const[s,a]=n.useState(1);return e.jsx("div",{style:{maxWidth:500},children:e.jsxs(i,{activeStep:s,orientation:"horizontal",onStepClick:a,children:[e.jsx(t,{step:0,label:"Upload",indicator:"none"}),e.jsx(t,{step:1,label:"Details",indicator:"none"}),e.jsx(t,{step:2,label:"Audience",indicator:"none"}),e.jsx(t,{step:3,label:"Publish",indicator:"none"})]})})}},M={name:"Indicator Modes — Side by Side",render:()=>{const[s,a]=n.useState(2);return e.jsxs("div",{style:{display:"flex",gap:48},children:[e.jsxs("div",{style:{maxWidth:280},children:[e.jsx(x,{type:"label",children:"Auto (default)"}),e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Account"}),e.jsx(t,{step:1,label:"Profile"}),e.jsx(t,{step:2,label:"Settings"}),e.jsx(t,{step:3,label:"Review"}),e.jsx(t,{step:4,label:"Done"})]})]}),e.jsxs("div",{style:{maxWidth:280},children:[e.jsx(x,{type:"label",children:"Number"}),e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Account",indicator:"number"}),e.jsx(t,{step:1,label:"Profile",indicator:"number"}),e.jsx(t,{step:2,label:"Settings",indicator:"number"}),e.jsx(t,{step:3,label:"Review",indicator:"number"}),e.jsx(t,{step:4,label:"Done",indicator:"number"})]})]}),e.jsxs("div",{style:{maxWidth:280},children:[e.jsx(x,{type:"label",children:"Custom icon"}),e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Account",icon:e.jsx(p,{icon:"info",size:"sm"})}),e.jsx(t,{step:1,label:"Profile",icon:e.jsx(p,{icon:"search",size:"sm"})}),e.jsx(t,{step:2,label:"Settings",icon:e.jsx(p,{icon:"wrench",size:"sm"})}),e.jsx(t,{step:3,label:"Review",icon:e.jsx(p,{icon:"clock",size:"sm"})}),e.jsx(t,{step:4,label:"Done",icon:e.jsx(p,{icon:"check",size:"sm"})})]})]}),e.jsxs("div",{style:{maxWidth:280},children:[e.jsx(x,{type:"label",children:"None"}),e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Account",indicator:"none"}),e.jsx(t,{step:1,label:"Profile",indicator:"none"}),e.jsx(t,{step:2,label:"Settings",indicator:"none"}),e.jsx(t,{step:3,label:"Review",indicator:"none"}),e.jsx(t,{step:4,label:"Done",indicator:"none"})]})]})]})}},I={name:"With Content — Multi-Step Form",render:()=>{const[s,a]=n.useState(0);return e.jsx("div",{style:{maxWidth:480},children:e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Project details",indicator:"number",children:s===0&&e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(w,{label:"Project name",placeholder:"My awesome project",value:""}),e.jsx(w,{label:"Repository URL",placeholder:"https://github.com/...",value:""}),e.jsx("div",{children:e.jsx(S,{label:"Continue",variant:"primary",onClick:()=>a(1)})})]})}),e.jsx(t,{step:1,label:"Environment",indicator:"number",children:s===1&&e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(w,{label:"Node version",placeholder:"20",value:""}),e.jsx(w,{label:"Build command",placeholder:"npm run build",value:""}),e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx(S,{label:"Back",variant:"secondary",onClick:()=>a(0)}),e.jsx(S,{label:"Continue",variant:"primary",onClick:()=>a(2)})]})]})}),e.jsx(t,{step:2,label:"Deploy",indicator:"number",children:s===2&&e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(x,{type:"body",children:"Ready to deploy. This will create a production build and push to your configured hosting."}),e.jsxs("div",{style:{display:"flex",gap:8},children:[e.jsx(S,{label:"Back",variant:"secondary",onClick:()=>a(1)}),e.jsx(S,{label:"Deploy now",variant:"primary",onClick:()=>a(3)})]})]})}),e.jsx(t,{step:3,label:"Done",indicator:"number"})]})})}},P={name:"Density — Compact / Balanced / Spacious",render:()=>{const[s,a]=n.useState(1);return e.jsxs("div",{style:{display:"flex",gap:48},children:[e.jsxs("div",{style:{maxWidth:250},children:[e.jsx(x,{type:"label",children:"Compact"}),e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,density:"compact",children:[e.jsx(t,{step:0,label:"Account",indicator:"number"}),e.jsx(t,{step:1,label:"Profile",indicator:"number"}),e.jsx(t,{step:2,label:"Payment",indicator:"number"}),e.jsx(t,{step:3,label:"Review",indicator:"number"})]})]}),e.jsxs("div",{style:{maxWidth:250},children:[e.jsx(x,{type:"label",children:"Balanced"}),e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,density:"balanced",children:[e.jsx(t,{step:0,label:"Account",indicator:"number"}),e.jsx(t,{step:1,label:"Profile",indicator:"number"}),e.jsx(t,{step:2,label:"Payment",indicator:"number"}),e.jsx(t,{step:3,label:"Review",indicator:"number"})]})]}),e.jsxs("div",{style:{maxWidth:250},children:[e.jsx(x,{type:"label",children:"Spacious"}),e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,density:"spacious",children:[e.jsx(t,{step:0,label:"Account",indicator:"number"}),e.jsx(t,{step:1,label:"Profile",indicator:"number"}),e.jsx(t,{step:2,label:"Payment",indicator:"number"}),e.jsx(t,{step:3,label:"Review",indicator:"number"})]})]})]})}},D={name:"Edge — Two Steps",render:()=>{const[s,a]=n.useState(0);return e.jsx("div",{style:{maxWidth:400},children:e.jsxs(i,{activeStep:s,orientation:"horizontal",onStepClick:a,children:[e.jsx(t,{step:0,label:"Before"}),e.jsx(t,{step:1,label:"After"})]})})}},R={name:"Edge — Seven Steps (Horizontal)",render:()=>{const[s,a]=n.useState(3);return e.jsxs(i,{activeStep:s,orientation:"horizontal",onStepClick:a,children:[e.jsx(t,{step:0,label:"Idea",indicator:"number"}),e.jsx(t,{step:1,label:"Design",indicator:"number"}),e.jsx(t,{step:2,label:"Build",indicator:"number"}),e.jsx(t,{step:3,label:"Test",indicator:"number"}),e.jsx(t,{step:4,label:"Review",indicator:"number"}),e.jsx(t,{step:5,label:"Deploy",indicator:"number"}),e.jsx(t,{step:6,label:"Monitor",indicator:"number"})]})}},B={name:"Edge — Disabled Steps",render:()=>{const[s,a]=n.useState(1);return e.jsx("div",{style:{maxWidth:400},children:e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Basic info"}),e.jsx(t,{step:1,label:"Permissions"}),e.jsx(t,{step:2,label:"Admin settings",description:"Requires admin role",isDisabled:!0}),e.jsx(t,{step:3,label:"Confirm"})]})})}},E={name:"Edge — Optional + Skipped",render:()=>{const[s,a]=n.useState(3);return e.jsx("div",{style:{maxWidth:400},children:e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Basic profile"}),e.jsx(t,{step:1,label:"Profile photo",isOptional:!0,description:"Skipped"}),e.jsx(t,{step:2,label:"Connect socials",isOptional:!0}),e.jsx(t,{step:3,label:"Preferences"}),e.jsx(t,{step:4,label:"All done"})]})})}},L={name:"Edge — Long Labels & Descriptions",render:()=>{const[s,a]=n.useState(1);return e.jsx("div",{style:{maxWidth:400},children:e.jsxs(i,{activeStep:s,orientation:"vertical",onStepClick:a,children:[e.jsx(t,{step:0,label:"Configure your development environment",description:"Install dependencies, set up local database, configure environment variables"}),e.jsx(t,{step:1,label:"Create initial data migration",description:"Define schema, seed data, and run migrations against staging"}),e.jsx(t,{step:2,label:"Submit for code review",description:"Open pull request and address reviewer feedback"})]})})}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'Status — Account Verification',
  render: () => {
    const [active, setActive] = useState(3);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
          <Step step={0} label="Email verified" description="ernesttien@meta.com" status="success" icon={<Icon icon="check" size="sm" />} />
          <Step step={1} label="Phone verified" description="+1 (555) 012-3456" status="success" icon={<Icon icon="check" size="sm" />} />
          <Step step={2} label="Identity document" description="Passport upload failed" status="error" icon={<Icon icon="warning" size="sm" />} />
          <Step step={3} label="Address verification" description="Pending review" status="accent" />
          <Step step={4} label="Background check" isOptional description="Skipped" />
          <Step step={5} label="Account activated" />
        </Stepper>
      </div>;
  }
}`,...q.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Status — Semantic Colors Reference',
  render: () => {
    const [active, setActive] = useState(1);
    return <div style={{
      maxWidth: 400
    }}>
        <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
          <Step step={0} label="Accent" description="--color-accent" status="accent" />
          <Step step={1} label="Success" description="--color-success" status="success" icon={<Icon icon="check" size="sm" />} />
          <Step step={2} label="Warning" description="--color-warning" status="warning" icon={<Icon icon="warning" size="sm" />} />
          <Step step={3} label="Error" description="--color-error" status="error" icon={<Icon icon="warning" size="sm" />} />
          <Step step={4} label="Default (no status)" description="progress-derived color" />
        </Stepper>
      </div>;
  }
}`,...W.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
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
}`,...$.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}};const $e=["Default","DefaultHorizontal","NumberedVertical","NumberedHorizontal","StatusVertical","StatusAllStates","MinimalVertical","MinimalHorizontal","IndicatorComparison","WithContentSlot","DensityComparison","TwoSteps","ManySteps","DisabledSteps","OptionalSteps","LongLabels"];export{C as Default,z as DefaultHorizontal,P as DensityComparison,B as DisabledSteps,M as IndicatorComparison,L as LongLabels,R as ManySteps,$ as MinimalHorizontal,T as MinimalVertical,N as NumberedHorizontal,A as NumberedVertical,E as OptionalSteps,W as StatusAllStates,q as StatusVertical,D as TwoSteps,I as WithContentSlot,$e as __namedExportsOrder,Te as default};
