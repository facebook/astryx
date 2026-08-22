import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-j5NZ3rHn.js";import{t as a}from"./Button-Bq6Ykq2L.js";import{t as o}from"./Button-DRkoqXc5.js";import{t as s}from"./Icon-BoIDnXjJ.js";import{t as c}from"./Icon-Duz24UlN.js";import{n as l,t as u}from"./Badge-CBfmtGYm.js";import{t as d}from"./Text-Czom_gzK.js";import{n as f,t as p}from"./TextInput-Y_K4k0oy.js";import{i as m,n as h,t as g}from"./Stepper-eV2qURTC.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J;e((()=>{_=t(n()),g(),p(),o(),d(),c(),u(),v=r(),y={title:`Lab/Stepper`,component:m,tags:[`autodocs`],argTypes:{activeStep:{control:{type:`number`,min:0,max:5}},orientation:{control:`select`,options:[`horizontal`,`vertical`]},density:{control:`select`,options:[`compact`,`balanced`,`spacious`]},indicatorPosition:{control:`select`,options:[`separated`,`on-track`]}}},b={name:`Default`,render:()=>{let[e,t]=(0,_.useState)(2);return(0,v.jsx)(`div`,{style:{maxWidth:400},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Create workspace`,description:`Name and configure your workspace`}),(0,v.jsx)(h,{step:1,label:`Invite team members`,description:`Add collaborators by email`}),(0,v.jsx)(h,{step:2,label:`Set up integrations`,description:`Connect Slack, GitHub, Jira`}),(0,v.jsx)(h,{step:3,label:`Import data`,description:`Bring in existing projects`}),(0,v.jsx)(h,{step:4,label:`Launch`,description:`Go live with your team`})]})})}},x={name:`Default — Horizontal`,render:()=>{let[e,t]=(0,_.useState)(1);return(0,v.jsx)(`div`,{style:{maxWidth:700},children:(0,v.jsxs)(m,{activeStep:e,orientation:`horizontal`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Workspace`}),(0,v.jsx)(h,{step:1,label:`Team`}),(0,v.jsx)(h,{step:2,label:`Integrations`}),(0,v.jsx)(h,{step:3,label:`Import`}),(0,v.jsx)(h,{step:4,label:`Launch`})]})})}},S={name:`Numbered — Deploy Pipeline`,render:()=>{let[e,t]=(0,_.useState)(2);return(0,v.jsx)(`div`,{style:{maxWidth:400},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Push to main`,description:`Merge your pull request`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Run CI checks`,description:`Lint, type-check, test`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Build container`,description:`Docker image to registry`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Deploy to staging`,description:`Verify in staging environment`,indicator:`number`}),(0,v.jsx)(h,{step:4,label:`Promote to production`,description:`Canary → full rollout`,indicator:`number`})]})})}},C={name:`Numbered — Horizontal Checkout`,render:()=>{let[e,t]=(0,_.useState)(1);return(0,v.jsx)(`div`,{style:{maxWidth:600},children:(0,v.jsxs)(m,{activeStep:e,orientation:`horizontal`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Cart`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Shipping`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Payment`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Confirm`,indicator:`number`})]})})}},w={name:`Status — Account Verification`,render:()=>{let[e,t]=(0,_.useState)(3);return(0,v.jsx)(`div`,{style:{maxWidth:400},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Email verified`,description:`ernesttien@meta.com`,status:`success`}),(0,v.jsx)(h,{step:1,label:`Phone verified`,description:`+1 (555) 012-3456`,status:`success`}),(0,v.jsx)(h,{step:2,label:`Identity document`,description:`Passport upload failed`,status:`error`}),(0,v.jsx)(h,{step:3,label:`Address verification`,description:`Pending review`,status:`accent`}),(0,v.jsx)(h,{step:4,label:`Background check`,isOptional:!0,description:`Skipped`}),(0,v.jsx)(h,{step:5,label:`Account activated`})]})})}},T={name:`Status — Semantic Colors Reference`,render:()=>{let[e,t]=(0,_.useState)(5);return(0,v.jsx)(`div`,{style:{maxWidth:400},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Accent`,description:`--color-accent`,status:`accent`}),(0,v.jsx)(h,{step:1,label:`Success`,description:`--color-success`,status:`success`}),(0,v.jsx)(h,{step:2,label:`Warning`,description:`--color-warning`,status:`warning`}),(0,v.jsx)(h,{step:3,label:`Error`,description:`--color-error`,status:`error`}),(0,v.jsx)(h,{step:4,label:`Default (no status)`,description:`progress-derived color`})]})})}},E={name:`Minimal — Interview Process`,render:()=>{let[e,t]=(0,_.useState)(2);return(0,v.jsx)(`div`,{style:{maxWidth:400},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Phone screen`,description:`30 min with recruiter`,indicator:`none`}),(0,v.jsx)(h,{step:1,label:`Technical interview`,description:`1 hour coding session`,indicator:`none`}),(0,v.jsx)(h,{step:2,label:`System design`,description:`45 min whiteboard`,indicator:`none`}),(0,v.jsx)(h,{step:3,label:`Team match`,description:`Meet potential teammates`,indicator:`none`}),(0,v.jsx)(h,{step:4,label:`Offer`,indicator:`none`})]})})}},D={name:`Minimal — Video Upload`,render:()=>{let[e,t]=(0,_.useState)(1);return(0,v.jsx)(`div`,{style:{maxWidth:500},children:(0,v.jsxs)(m,{activeStep:e,orientation:`horizontal`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Upload`,indicator:`none`}),(0,v.jsx)(h,{step:1,label:`Details`,indicator:`none`}),(0,v.jsx)(h,{step:2,label:`Audience`,indicator:`none`}),(0,v.jsx)(h,{step:3,label:`Publish`,indicator:`none`})]})})}},O={name:`Indicator Modes — Side by Side`,render:()=>{let[e,t]=(0,_.useState)(2);return(0,v.jsxs)(`div`,{style:{display:`flex`,gap:48},children:[(0,v.jsxs)(`div`,{style:{maxWidth:280},children:[(0,v.jsx)(i,{type:`label`,children:`Auto (default)`}),(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Account`}),(0,v.jsx)(h,{step:1,label:`Profile`}),(0,v.jsx)(h,{step:2,label:`Settings`}),(0,v.jsx)(h,{step:3,label:`Review`}),(0,v.jsx)(h,{step:4,label:`Done`})]})]}),(0,v.jsxs)(`div`,{style:{maxWidth:280},children:[(0,v.jsx)(i,{type:`label`,children:`Number`}),(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Account`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Profile`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Settings`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Review`,indicator:`number`}),(0,v.jsx)(h,{step:4,label:`Done`,indicator:`number`})]})]}),(0,v.jsxs)(`div`,{style:{maxWidth:280},children:[(0,v.jsx)(i,{type:`label`,children:`Custom icon`}),(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Account`,icon:(0,v.jsx)(s,{icon:`info`,size:`sm`})}),(0,v.jsx)(h,{step:1,label:`Profile`,icon:(0,v.jsx)(s,{icon:`search`,size:`sm`})}),(0,v.jsx)(h,{step:2,label:`Settings`,icon:(0,v.jsx)(s,{icon:`wrench`,size:`sm`})}),(0,v.jsx)(h,{step:3,label:`Review`,icon:(0,v.jsx)(s,{icon:`clock`,size:`sm`})}),(0,v.jsx)(h,{step:4,label:`Done`,icon:(0,v.jsx)(s,{icon:`check`,size:`sm`})})]})]}),(0,v.jsxs)(`div`,{style:{maxWidth:280},children:[(0,v.jsx)(i,{type:`label`,children:`None`}),(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Account`,indicator:`none`}),(0,v.jsx)(h,{step:1,label:`Profile`,indicator:`none`}),(0,v.jsx)(h,{step:2,label:`Settings`,indicator:`none`}),(0,v.jsx)(h,{step:3,label:`Review`,indicator:`none`}),(0,v.jsx)(h,{step:4,label:`Done`,indicator:`none`})]})]})]})}},k={name:`With Content — Multi-Step Form`,render:()=>{let[e,t]=(0,_.useState)(0);return(0,v.jsx)(`div`,{style:{maxWidth:480},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Project details`,indicator:`number`,children:e===0&&(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,v.jsx)(f,{label:`Project name`,placeholder:`My awesome project`,value:``}),(0,v.jsx)(f,{label:`Repository URL`,placeholder:`https://github.com/...`,value:``}),(0,v.jsx)(`div`,{children:(0,v.jsx)(a,{label:`Continue`,variant:`primary`,onClick:()=>t(1)})})]})}),(0,v.jsx)(h,{step:1,label:`Environment`,indicator:`number`,children:e===1&&(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,v.jsx)(f,{label:`Node version`,placeholder:`20`,value:``}),(0,v.jsx)(f,{label:`Build command`,placeholder:`npm run build`,value:``}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,v.jsx)(a,{label:`Back`,variant:`secondary`,onClick:()=>t(0)}),(0,v.jsx)(a,{label:`Continue`,variant:`primary`,onClick:()=>t(2)})]})]})}),(0,v.jsx)(h,{step:2,label:`Deploy`,indicator:`number`,children:e===2&&(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:12},children:[(0,v.jsx)(i,{type:`body`,children:`Ready to deploy. This will create a production build and push to your configured hosting.`}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,v.jsx)(a,{label:`Back`,variant:`secondary`,onClick:()=>t(1)}),(0,v.jsx)(a,{label:`Deploy now`,variant:`primary`,onClick:()=>t(3)})]})]})}),(0,v.jsx)(h,{step:3,label:`Done`,indicator:`number`})]})})}},A={name:`Density — Compact / Balanced / Spacious`,render:()=>{let[e,t]=(0,_.useState)(1);return(0,v.jsxs)(`div`,{style:{display:`flex`,gap:48},children:[(0,v.jsxs)(`div`,{style:{maxWidth:250},children:[(0,v.jsx)(i,{type:`label`,children:`Compact`}),(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,density:`compact`,children:[(0,v.jsx)(h,{step:0,label:`Account`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Profile`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Payment`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Review`,indicator:`number`})]})]}),(0,v.jsxs)(`div`,{style:{maxWidth:250},children:[(0,v.jsx)(i,{type:`label`,children:`Balanced`}),(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,density:`balanced`,children:[(0,v.jsx)(h,{step:0,label:`Account`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Profile`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Payment`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Review`,indicator:`number`})]})]}),(0,v.jsxs)(`div`,{style:{maxWidth:250},children:[(0,v.jsx)(i,{type:`label`,children:`Spacious`}),(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,density:`spacious`,children:[(0,v.jsx)(h,{step:0,label:`Account`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Profile`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Payment`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Review`,indicator:`number`})]})]})]})}},j={name:`Edge — Two Steps`,render:()=>{let[e,t]=(0,_.useState)(0);return(0,v.jsx)(`div`,{style:{maxWidth:400},children:(0,v.jsxs)(m,{activeStep:e,orientation:`horizontal`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Before`}),(0,v.jsx)(h,{step:1,label:`After`})]})})}},M={name:`Edge — Seven Steps (Horizontal)`,render:()=>{let[e,t]=(0,_.useState)(3);return(0,v.jsxs)(m,{activeStep:e,orientation:`horizontal`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Idea`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Design`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Build`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Test`,indicator:`number`}),(0,v.jsx)(h,{step:4,label:`Review`,indicator:`number`}),(0,v.jsx)(h,{step:5,label:`Deploy`,indicator:`number`}),(0,v.jsx)(h,{step:6,label:`Monitor`,indicator:`number`})]})}},N={name:`Edge — Disabled Steps`,render:()=>{let[e,t]=(0,_.useState)(1);return(0,v.jsx)(`div`,{style:{maxWidth:400},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Basic info`}),(0,v.jsx)(h,{step:1,label:`Permissions`}),(0,v.jsx)(h,{step:2,label:`Admin settings`,description:`Requires admin role`,isDisabled:!0}),(0,v.jsx)(h,{step:3,label:`Confirm`})]})})}},P={name:`Edge — Optional + Skipped`,render:()=>{let[e,t]=(0,_.useState)(3);return(0,v.jsx)(`div`,{style:{maxWidth:400},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Basic profile`}),(0,v.jsx)(h,{step:1,label:`Profile photo`,isOptional:!0,description:`Skipped`}),(0,v.jsx)(h,{step:2,label:`Connect socials`,isOptional:!0}),(0,v.jsx)(h,{step:3,label:`Preferences`}),(0,v.jsx)(h,{step:4,label:`All done`})]})})}},F={name:`Edge — Long Labels & Descriptions`,render:()=>{let[e,t]=(0,_.useState)(1);return(0,v.jsx)(`div`,{style:{maxWidth:400},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Configure your development environment`,description:`Install dependencies, set up local database, configure environment variables`}),(0,v.jsx)(h,{step:1,label:`Create initial data migration`,description:`Define schema, seed data, and run migrations against staging`}),(0,v.jsx)(h,{step:2,label:`Submit for code review`,description:`Open pull request and address reviewer feedback`})]})})}},I={name:`On-Track — Vertical`,render:()=>{let[e,t]=(0,_.useState)(2);return(0,v.jsx)(`div`,{style:{maxWidth:400},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Create workspace`}),(0,v.jsx)(h,{step:1,label:`Invite team members`}),(0,v.jsx)(h,{step:2,label:`Set up integrations`}),(0,v.jsx)(h,{step:3,label:`Import data`}),(0,v.jsx)(h,{step:4,label:`Launch`})]})})}},L={name:`On-Track — Horizontal`,render:()=>{let[e,t]=(0,_.useState)(2);return(0,v.jsx)(`div`,{style:{maxWidth:700},children:(0,v.jsxs)(m,{activeStep:e,orientation:`horizontal`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Cart`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Shipping`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Payment`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Review`,indicator:`number`}),(0,v.jsx)(h,{step:4,label:`Confirm`,indicator:`number`})]})})}},R={name:`On-Track — Vertical (with description)`,render:()=>{let[e,t]=(0,_.useState)(2);return(0,v.jsx)(`div`,{style:{maxWidth:400},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Create workspace`,description:`Name and configure your workspace`}),(0,v.jsx)(h,{step:1,label:`Invite team members`,description:`Add collaborators by email`}),(0,v.jsx)(h,{step:2,label:`Set up integrations`,description:`Connect Slack, GitHub, Jira`}),(0,v.jsx)(h,{step:3,label:`Import data`,description:`Bring in existing projects`}),(0,v.jsx)(h,{step:4,label:`Launch`,description:`Go live with your team`})]})})}},z={name:`On-Track — Horizontal (with description)`,render:()=>{let[e,t]=(0,_.useState)(2);return(0,v.jsx)(`div`,{style:{maxWidth:760},children:(0,v.jsxs)(m,{activeStep:e,orientation:`horizontal`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Cart`,indicator:`number`,description:`Review your items`}),(0,v.jsx)(h,{step:1,label:`Shipping`,indicator:`number`,description:`Where to deliver`}),(0,v.jsx)(h,{step:2,label:`Payment`,indicator:`number`,description:`Card or PayPal`}),(0,v.jsx)(h,{step:3,label:`Review`,indicator:`number`,description:`Confirm details`}),(0,v.jsx)(h,{step:4,label:`Confirm`,indicator:`number`,description:`Place your order`})]})})}},B={name:`On-Track — vs Separated`,render:()=>{let[e,t]=(0,_.useState)(2);return(0,v.jsxs)(`div`,{style:{display:`flex`,gap:64},children:[(0,v.jsxs)(`div`,{style:{maxWidth:280},children:[(0,v.jsx)(i,{type:`label`,children:`separated (current)`}),(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,indicatorPosition:`separated`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Account`,description:`Basic details`}),(0,v.jsx)(h,{step:1,label:`Profile`,description:`About you`}),(0,v.jsx)(h,{step:2,label:`Settings`,description:`Preferences`}),(0,v.jsx)(h,{step:3,label:`Review`,description:`Confirm details`})]})]}),(0,v.jsxs)(`div`,{style:{maxWidth:280},children:[(0,v.jsx)(i,{type:`label`,children:`on-track`}),(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Account`,description:`Basic details`}),(0,v.jsx)(h,{step:1,label:`Profile`,description:`About you`}),(0,v.jsx)(h,{step:2,label:`Settings`,description:`Preferences`}),(0,v.jsx)(h,{step:3,label:`Review`,description:`Confirm details`})]})]})]})}},V={name:`On-Track — Status Colors`,render:()=>{let[e,t]=(0,_.useState)(3);return(0,v.jsx)(`div`,{style:{maxWidth:400},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Email verified`,description:`ernesttien@meta.com`,status:`success`}),(0,v.jsx)(h,{step:1,label:`Phone verified`,description:`+1 (555) 012-3456`,status:`success`}),(0,v.jsx)(h,{step:2,label:`Identity document`,description:`Passport upload failed`,status:`error`}),(0,v.jsx)(h,{step:3,label:`Address verification`,description:`Pending review`,status:`accent`}),(0,v.jsx)(h,{step:4,label:`Background check`,isOptional:!0}),(0,v.jsx)(h,{step:5,label:`Account activated`})]})})}},H={name:`On-Track — Horizontal, Many Steps`,render:()=>{let[e,t]=(0,_.useState)(3);return(0,v.jsxs)(m,{activeStep:e,orientation:`horizontal`,indicatorPosition:`on-track`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Idea`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Design`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Build`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Test`,indicator:`number`}),(0,v.jsx)(h,{step:4,label:`Review`,indicator:`number`}),(0,v.jsx)(h,{step:5,label:`Deploy`,indicator:`number`}),(0,v.jsx)(h,{step:6,label:`Monitor`,indicator:`number`})]})}},U={name:`Slots — endContent (trailing badges)`,render:()=>{let[e,t]=(0,_.useState)(2);return(0,v.jsx)(`div`,{style:{maxWidth:440},children:(0,v.jsxs)(m,{activeStep:e,orientation:`vertical`,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Draft`,description:`Written 2 days ago`,endContent:(0,v.jsx)(l,{variant:`success`,label:`Done`})}),(0,v.jsx)(h,{step:1,label:`Review`,description:`2 approvals required`,endContent:(0,v.jsx)(l,{variant:`info`,label:`2 pending`})}),(0,v.jsx)(h,{step:2,label:`Publish`,description:`Scheduled for Monday`,endContent:(0,v.jsx)(l,{variant:`warning`,label:`Blocked`})}),(0,v.jsx)(h,{step:3,label:`Archive`})]})})}},W={padded:{kmVPX3:`xggk2y7`,kg3NbH:null,kuDDbn:null,kE3dHu:null,kP0aTx:null,kpe85a:null,k8WAf4:null,kLKAdn:null,kGO01o:null,kMzoRj:`xmkeg23`,kjGldf:null,k2ei4v:null,kZ1KPB:null,ke9TFa:null,kWqL5O:null,kLoX6v:null,kEafiO:null,kt9PQ7:null,ksu8eU:`x1y0btm7`,kJRH4f:null,kVhnKS:null,k4WBpm:null,k8ry5P:null,kSWEuD:null,kDUl1X:null,kPef9Z:null,kfdmCh:null,kVAM5u:`x14i3s5s`,kzOINU:null,kGJrpR:null,kaZRDh:null,kBCPoo:null,k26BEO:null,k5QoK5:null,kLZC3w:null,kL6WhQ:null,kaIpWk:`x1hviunn`,krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0}},G={name:`Customization — xstyle + accessible label`,render:()=>{let[e,t]=(0,_.useState)(1);return(0,v.jsx)(`div`,{style:{maxWidth:520},children:(0,v.jsxs)(m,{activeStep:e,orientation:`horizontal`,onStepClick:t,label:`Checkout progress`,xstyle:W.padded,children:[(0,v.jsx)(h,{step:0,label:`Cart`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Shipping`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Payment`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Confirm`,indicator:`number`})]})})}},K={name:`Responsive — Collapse Labels When Narrow`,render:()=>{let[e,t]=(0,_.useState)(2);return(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:32},children:[(0,v.jsxs)(`div`,{children:[(0,v.jsx)(i,{type:`label`,children:`Wide (labels shown)`}),(0,v.jsx)(`div`,{style:{width:640},children:(0,v.jsxs)(m,{activeStep:e,orientation:`horizontal`,hasCollapsibleLabels:!0,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Cart`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Shipping`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Payment`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Review`,indicator:`number`}),(0,v.jsx)(h,{step:4,label:`Confirm`,indicator:`number`})]})})]}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(i,{type:`label`,children:`Narrow (only the current step keeps its label)`}),(0,v.jsx)(`div`,{style:{width:360},children:(0,v.jsxs)(m,{activeStep:e,orientation:`horizontal`,hasCollapsibleLabels:!0,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Cart`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Shipping`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Payment`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Review`,indicator:`number`}),(0,v.jsx)(h,{step:4,label:`Confirm`,indicator:`number`})]})})]}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(i,{type:`label`,children:`Narrow, on-track`}),(0,v.jsx)(`div`,{style:{width:320},children:(0,v.jsxs)(m,{activeStep:e,orientation:`horizontal`,indicatorPosition:`on-track`,hasCollapsibleLabels:!0,onStepClick:t,children:[(0,v.jsx)(h,{step:0,label:`Cart`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Shipping`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Payment`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Review`,indicator:`number`}),(0,v.jsx)(h,{step:4,label:`Confirm`,indicator:`number`})]})})]})]})}},q={name:`Fragment-Grouped Steps`,render:()=>{let e=(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(h,{step:0,label:`Cart`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Shipping`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Payment`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Review`,indicator:`number`})]});return(0,v.jsxs)(`div`,{style:{display:`grid`,gap:40,maxWidth:700},children:[(0,v.jsxs)(`div`,{children:[(0,v.jsx)(i,{type:`label`,children:`Steps passed directly`}),(0,v.jsxs)(m,{activeStep:2,indicatorPosition:`on-track`,children:[(0,v.jsx)(h,{step:0,label:`Cart`,indicator:`number`}),(0,v.jsx)(h,{step:1,label:`Shipping`,indicator:`number`}),(0,v.jsx)(h,{step:2,label:`Payment`,indicator:`number`}),(0,v.jsx)(h,{step:3,label:`Review`,indicator:`number`})]})]}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(i,{type:`label`,children:`Same steps grouped in a fragment`}),(0,v.jsx)(m,{activeStep:2,indicatorPosition:`on-track`,children:e})]}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(i,{type:`label`,children:`Fragment-grouped, vertical`}),(0,v.jsx)(m,{activeStep:2,orientation:`vertical`,indicatorPosition:`on-track`,children:e})]})]})}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  name: 'Slots — endContent (trailing badges)',
  render: () => {
    const [active, setActive] = useState(2);
    return <div style={{
      maxWidth: 440
    }}>
        <Stepper activeStep={active} orientation="vertical" onStepClick={setActive}>
          <Step step={0} label="Draft" description="Written 2 days ago" endContent={<Badge variant="success" label="Done" />} />
          <Step step={1} label="Review" description="2 approvals required" endContent={<Badge variant="info" label="2 pending" />} />
          <Step step={2} label="Publish" description="Scheduled for Monday" endContent={<Badge variant="warning" label="Blocked" />} />
          <Step step={3} label="Archive" />
        </Stepper>
      </div>;
  }
}`,...U.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Customization — xstyle + accessible label',
  render: () => {
    const [active, setActive] = useState(1);
    return <div style={{
      maxWidth: 520
    }}>
        <Stepper activeStep={active} orientation="horizontal" onStepClick={setActive} label="Checkout progress" xstyle={xstyles.padded}>
          <Step step={0} label="Cart" indicator="number" />
          <Step step={1} label="Shipping" indicator="number" />
          <Step step={2} label="Payment" indicator="number" />
          <Step step={3} label="Confirm" indicator="number" />
        </Stepper>
      </div>;
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'Responsive — Collapse Labels When Narrow',
  render: () => {
    const [active, setActive] = useState(2);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 32
    }}>
        <div>
          <Text type="label">Wide (labels shown)</Text>
          <div style={{
          width: 640
        }}>
            <Stepper activeStep={active} orientation="horizontal" hasCollapsibleLabels onStepClick={setActive}>
              <Step step={0} label="Cart" indicator="number" />
              <Step step={1} label="Shipping" indicator="number" />
              <Step step={2} label="Payment" indicator="number" />
              <Step step={3} label="Review" indicator="number" />
              <Step step={4} label="Confirm" indicator="number" />
            </Stepper>
          </div>
        </div>
        <div>
          <Text type="label">
            Narrow (only the current step keeps its label)
          </Text>
          <div style={{
          width: 360
        }}>
            <Stepper activeStep={active} orientation="horizontal" hasCollapsibleLabels onStepClick={setActive}>
              <Step step={0} label="Cart" indicator="number" />
              <Step step={1} label="Shipping" indicator="number" />
              <Step step={2} label="Payment" indicator="number" />
              <Step step={3} label="Review" indicator="number" />
              <Step step={4} label="Confirm" indicator="number" />
            </Stepper>
          </div>
        </div>
        <div>
          <Text type="label">Narrow, on-track</Text>
          <div style={{
          width: 320
        }}>
            <Stepper activeStep={active} orientation="horizontal" indicatorPosition="on-track" hasCollapsibleLabels onStepClick={setActive}>
              <Step step={0} label="Cart" indicator="number" />
              <Step step={1} label="Shipping" indicator="number" />
              <Step step={2} label="Payment" indicator="number" />
              <Step step={3} label="Review" indicator="number" />
              <Step step={4} label="Confirm" indicator="number" />
            </Stepper>
          </div>
        </div>
      </div>;
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'Fragment-Grouped Steps',
  render: () => {
    const steps = <>
        <Step step={0} label="Cart" indicator="number" />
        <Step step={1} label="Shipping" indicator="number" />
        <Step step={2} label="Payment" indicator="number" />
        <Step step={3} label="Review" indicator="number" />
      </>;
    return <div style={{
      display: 'grid',
      gap: 40,
      maxWidth: 700
    }}>
        <div>
          <Text type="label">Steps passed directly</Text>
          <Stepper activeStep={2} indicatorPosition="on-track">
            <Step step={0} label="Cart" indicator="number" />
            <Step step={1} label="Shipping" indicator="number" />
            <Step step={2} label="Payment" indicator="number" />
            <Step step={3} label="Review" indicator="number" />
          </Stepper>
        </div>
        <div>
          <Text type="label">Same steps grouped in a fragment</Text>
          <Stepper activeStep={2} indicatorPosition="on-track">
            {steps}
          </Stepper>
        </div>
        <div>
          <Text type="label">Fragment-grouped, vertical</Text>
          <Stepper activeStep={2} orientation="vertical" indicatorPosition="on-track">
            {steps}
          </Stepper>
        </div>
      </div>;
  }
}`,...q.parameters?.docs?.source}}},J=`Default.DefaultHorizontal.NumberedVertical.NumberedHorizontal.StatusVertical.StatusAllStates.MinimalVertical.MinimalHorizontal.IndicatorComparison.WithContentSlot.DensityComparison.TwoSteps.ManySteps.DisabledSteps.OptionalSteps.LongLabels.OnTrackVertical.OnTrackHorizontal.OnTrackVerticalDescriptions.OnTrackHorizontalDescriptions.OnTrackComparison.OnTrackStatus.OnTrackHorizontalManySteps.EndContent.CustomXStyle.CollapseLabelsWhenNarrow.FragmentGroupedSteps`.split(`.`)}))();export{K as CollapseLabelsWhenNarrow,G as CustomXStyle,b as Default,x as DefaultHorizontal,A as DensityComparison,N as DisabledSteps,U as EndContent,q as FragmentGroupedSteps,O as IndicatorComparison,F as LongLabels,M as ManySteps,D as MinimalHorizontal,E as MinimalVertical,C as NumberedHorizontal,S as NumberedVertical,B as OnTrackComparison,L as OnTrackHorizontal,z as OnTrackHorizontalDescriptions,H as OnTrackHorizontalManySteps,V as OnTrackStatus,I as OnTrackVertical,R as OnTrackVerticalDescriptions,P as OptionalSteps,T as StatusAllStates,w as StatusVertical,j as TwoSteps,k as WithContentSlot,J as __namedExportsOrder,y as default};