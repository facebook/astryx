import{ah as R,a1 as e,B as t,T as X}from"./iframe-FpdBIrKz.js";import{T as o}from"./Toolbar-CRG42dnw.js";import{C as r}from"./Card-NJOPrOtR.js";import{S as c}from"./Section-DsEzGJKR.js";import{F as M,a as Q,T as q}from"./FunnelIcon-CkhdECHQ.js";import{L as i,b as d}from"./LayoutContent-_T1iNPoh.js";import{L as l}from"./LayoutHeader-Bo_kIx7K.js";import{V as b}from"./VStack-Dl9EBhUE.js";import{F as V}from"./MagnifyingGlassIcon-BEfhkb_G.js";import{F as m}from"./Cog6ToothIcon-aWw6l_cf.js";import{F as g}from"./ArrowLeftIcon-Pd-6K0Sw.js";import{H as s}from"./Heading-BWSbAVGy.js";import{F as p}from"./PlusIcon-B2VkV_cy.js";import{F as J}from"./ShareIcon-BNyI4xzy.js";import{F as U}from"./BellIcon-CyxT11Q0.js";import{F as Y}from"./Squares2X2Icon-CeXxR_DR.js";import{F as N}from"./EllipsisHorizontalIcon-COVzfHuZ.js";import{F as Z}from"./ChevronRightIcon-BLZZ9qko.js";import"./preload-helper-Ct5FWWRu.js";import"./useListFocus-DY855-du.js";import"./container.stylex-uilBL6DE.js";import"./padding.stylex-ENVgbwco.js";import"./stack.stylex-BlarxY2N.js";import"./stackItem.stylex-CgqrJM4N.js";import"./Stack-DEYywiUi.js";function ee({title:n,titleId:x,...u},K){return R.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:K,"aria-labelledby":x},u),n?R.createElement("title",{id:x},n):null,R.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15.75 19.5 8.25 12l7.5-7.5"}))}const _=R.forwardRef(ee),Te={title:"Core/ToolbarEdgeCompensation",component:o,parameters:{layout:"padded"}};function h({children:n,label:x}){return e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:8,fontSize:12,color:"#666"},children:x}),n]})}function a({lines:n=3}){return e.jsx(b,{gap:2,children:Array.from({length:n},(x,u)=>e.jsx(X,{type:"body",children:u===0?"Body content should align with the toolbar text or button labels above.":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore."},u))})}const y={name:"Ghost buttons: start + end",render:()=>e.jsx(b,{gap:4,children:["sm","md","lg"].map(n=>e.jsx(h,{label:`size="${n}"`,children:e.jsxs(r,{width:600,children:[e.jsx(o,{label:`Ghost buttons ${n}`,size:n,dividers:["bottom"],startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(g,{}),isIconOnly:!0}),e.jsx(t,{label:"Edit",variant:"ghost"}),e.jsx(t,{label:"Share",variant:"ghost"})]}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Filter",variant:"ghost",icon:e.jsx(M,{}),isIconOnly:!0}),e.jsx(t,{label:"Settings",variant:"ghost",icon:e.jsx(m,{}),isIconOnly:!0})]})}),e.jsx(c,{children:e.jsx(a,{})})]})},n))})},j={name:"Solid buttons: start + end",render:()=>e.jsx(b,{gap:4,children:["sm","md","lg"].map(n=>e.jsx(h,{label:`size="${n}"`,children:e.jsxs(r,{width:600,children:[e.jsx(o,{label:`Solid buttons ${n}`,size:n,dividers:["bottom"],startContent:e.jsx(t,{label:"New item",icon:e.jsx(p,{})}),endContent:e.jsx(t,{label:"Save"})}),e.jsx(c,{children:e.jsx(a,{})})]})},n))})},v={name:"Mixed: ghost start, solid end",render:()=>e.jsx(b,{gap:4,children:["sm","md","lg"].map(n=>e.jsx(h,{label:`size="${n}"`,children:e.jsxs(r,{width:600,children:[e.jsx(o,{label:`Mixed ${n}`,size:n,dividers:["bottom"],startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(g,{}),isIconOnly:!0}),e.jsx(t,{label:"Edit",variant:"ghost"})]}),endContent:e.jsx(t,{label:"Save"})}),e.jsx(c,{children:e.jsx(a,{})})]})},n))})},C={name:"Mixed: solid start, ghost end",render:()=>e.jsx(b,{gap:4,children:["sm","md","lg"].map(n=>e.jsx(h,{label:`size="${n}"`,children:e.jsxs(r,{width:600,children:[e.jsx(o,{label:`Mixed ${n}`,size:n,dividers:["bottom"],startContent:e.jsx(t,{label:"New item",icon:e.jsx(p,{})}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Filter",variant:"ghost",icon:e.jsx(M,{}),isIconOnly:!0}),e.jsx(t,{label:"More",variant:"ghost",icon:e.jsx(N,{}),isIconOnly:!0})]})}),e.jsx(c,{children:e.jsx(a,{})})]})},n))})},S={name:"Heading start + ghost end",render:()=>e.jsx(b,{gap:4,children:["sm","md","lg"].map(n=>e.jsx(h,{label:`size="${n}"`,children:e.jsxs(r,{width:600,children:[e.jsx(o,{label:`Heading ${n}`,size:n,dividers:["bottom"],startContent:e.jsx(s,{level:4,children:"Section Title"}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Filter",variant:"ghost",icon:e.jsx(M,{}),isIconOnly:!0}),e.jsx(t,{label:"Add",variant:"ghost",icon:e.jsx(p,{}),isIconOnly:!0})]})}),e.jsx(c,{children:e.jsx(a,{})})]})},n))})},L={name:"Text start + ghost end",render:()=>e.jsxs(r,{width:600,children:[e.jsx(o,{label:"Text start",dividers:["bottom"],startContent:e.jsx(X,{type:"body",weight:"bold",children:"3 items selected"}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Delete",variant:"ghost"}),e.jsx(t,{label:"Archive",variant:"ghost"})]})}),e.jsx(c,{children:e.jsx(a,{})})]})},B={name:"Heading start + solid end",render:()=>e.jsxs(r,{width:600,children:[e.jsx(o,{label:"Heading solid",dividers:["bottom"],startContent:e.jsx(s,{level:4,children:"Project Settings"}),endContent:e.jsx(t,{label:"Save changes"})}),e.jsx(c,{children:e.jsx(a,{})})]})},I={name:"Layout: no contentWidth, ghost buttons",render:()=>e.jsx("div",{style:{height:400,border:"1px solid #e0e0e0",borderRadius:8},children:e.jsx(i,{header:e.jsx(l,{hasDivider:!0,padding:0,children:e.jsx(o,{label:"App header",startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Menu",variant:"ghost",icon:e.jsx(Y,{}),isIconOnly:!0}),e.jsx(s,{level:4,children:"Dashboard"})]}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Search",variant:"ghost",icon:e.jsx(V,{}),isIconOnly:!0}),e.jsx(t,{label:"Notifications",variant:"ghost",icon:e.jsx(U,{}),isIconOnly:!0}),e.jsx(t,{label:"Settings",variant:"ghost",icon:e.jsx(m,{}),isIconOnly:!0})]})})}),content:e.jsx(d,{children:e.jsx(a,{lines:6})})})})},T={name:"Layout: no contentWidth, solid buttons",render:()=>e.jsx("div",{style:{height:400,border:"1px solid #e0e0e0",borderRadius:8},children:e.jsx(i,{header:e.jsx(l,{hasDivider:!0,padding:0,children:e.jsx(o,{label:"App header",startContent:e.jsx(s,{level:4,children:"Dashboard"}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Cancel",variant:"secondary"}),e.jsx(t,{label:"Save"})]})})}),content:e.jsx(d,{children:e.jsx(a,{lines:6})})})})},w={name:"Layout: contentWidth=640, ghost buttons",render:()=>e.jsx("div",{style:{height:400,border:"1px solid #e0e0e0",borderRadius:8},children:e.jsx(i,{contentWidth:640,header:e.jsx(l,{hasDivider:!0,padding:0,children:e.jsx(o,{label:"Page header",startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(g,{}),isIconOnly:!0}),e.jsx(s,{level:4,children:"Settings"})]}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Search",variant:"ghost",icon:e.jsx(V,{}),isIconOnly:!0}),e.jsx(t,{label:"More",variant:"ghost",icon:e.jsx(N,{}),isIconOnly:!0})]})})}),content:e.jsx(d,{children:e.jsx(a,{lines:6})})})})},O={name:"Layout: contentWidth=640, solid buttons",render:()=>e.jsx("div",{style:{height:400,border:"1px solid #e0e0e0",borderRadius:8},children:e.jsx(i,{contentWidth:640,header:e.jsx(l,{hasDivider:!0,padding:0,children:e.jsx(o,{label:"Page header",startContent:e.jsx(s,{level:4,children:"Settings"}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Cancel",variant:"secondary"}),e.jsx(t,{label:"Save"})]})})}),content:e.jsx(d,{children:e.jsx(a,{lines:6})})})})},H={name:"Layout: contentWidth=640, mixed",render:()=>e.jsx("div",{style:{height:400,border:"1px solid #e0e0e0",borderRadius:8},children:e.jsx(i,{contentWidth:640,header:e.jsx(l,{hasDivider:!0,padding:0,children:e.jsx(o,{label:"Page header",startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(g,{}),isIconOnly:!0}),e.jsx(s,{level:4,children:"Edit Project"})]}),endContent:e.jsx(t,{label:"Save changes"})})}),content:e.jsx(d,{children:e.jsx(a,{lines:6})})})})},f={name:"Layout: contentWidth=960, ghost buttons",render:()=>e.jsx("div",{style:{height:400,border:"1px solid #e0e0e0",borderRadius:8},children:e.jsx(i,{contentWidth:960,header:e.jsx(l,{hasDivider:!0,padding:0,children:e.jsx(o,{label:"Dashboard header",startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(_,{}),isIconOnly:!0}),e.jsx(s,{level:4,children:"Analytics Dashboard"})]}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Share",variant:"ghost",icon:e.jsx(J,{}),isIconOnly:!0}),e.jsx(t,{label:"Settings",variant:"ghost",icon:e.jsx(m,{}),isIconOnly:!0})]})})}),content:e.jsx(d,{children:e.jsx(a,{lines:6})})})})},W={name:"Layout: padding=4, ghost buttons",render:()=>e.jsx("div",{style:{height:400,border:"1px solid #e0e0e0",borderRadius:8},children:e.jsx(i,{padding:4,header:e.jsx(l,{hasDivider:!0,padding:0,children:e.jsx(o,{label:"Padded layout header",startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(g,{}),isIconOnly:!0}),e.jsx(s,{level:4,children:"Padded Layout"})]}),endContent:e.jsx(t,{label:"Settings",variant:"ghost",icon:e.jsx(m,{}),isIconOnly:!0})})}),content:e.jsx(d,{children:e.jsx(a,{lines:6})})})})},k={name:"Layout: padding=4 + contentWidth=640",render:()=>e.jsx("div",{style:{height:400,border:"1px solid #e0e0e0",borderRadius:8},children:e.jsx(i,{padding:4,contentWidth:640,header:e.jsx(l,{hasDivider:!0,padding:0,children:e.jsx(o,{label:"Padded constrained header",startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(g,{}),isIconOnly:!0}),e.jsx(s,{level:4,children:"Constrained + Padded"})]}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Share",variant:"ghost",icon:e.jsx(J,{}),isIconOnly:!0}),e.jsx(t,{label:"Settings",variant:"ghost",icon:e.jsx(m,{}),isIconOnly:!0})]})})}),content:e.jsx(d,{children:e.jsx(a,{lines:6})})})})},F={name:"Layout: header default padding + toolbar",render:()=>e.jsx("div",{style:{height:400,border:"1px solid #e0e0e0",borderRadius:8},children:e.jsx(i,{header:e.jsx(l,{hasDivider:!0,children:e.jsx(o,{label:"Double padded?",startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(g,{}),isIconOnly:!0}),e.jsx(s,{level:4,children:"Double Padding Check"})]}),endContent:e.jsx(t,{label:"Settings",variant:"ghost",icon:e.jsx(m,{}),isIconOnly:!0})})}),content:e.jsx(d,{children:e.jsx(a,{lines:4})})})})},z={name:"Comparison: ghost vs solid alignment",render:()=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24},children:[e.jsx(h,{label:"Ghost buttons (should align flush)",children:e.jsxs(r,{children:[e.jsx(o,{label:"Ghost",dividers:["bottom"],startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(g,{}),isIconOnly:!0}),e.jsx(t,{label:"Edit",variant:"ghost"})]}),endContent:e.jsx(t,{label:"More",variant:"ghost",icon:e.jsx(N,{}),isIconOnly:!0})}),e.jsx(c,{children:e.jsx(a,{})})]})}),e.jsx(h,{label:"Solid buttons (natural padding)",children:e.jsxs(r,{children:[e.jsx(o,{label:"Solid",dividers:["bottom"],startContent:e.jsx(t,{label:"New",icon:e.jsx(p,{})}),endContent:e.jsx(t,{label:"Save"})}),e.jsx(c,{children:e.jsx(a,{})})]})})]})},G={name:"Three-slot: ghost edges + center heading",render:()=>e.jsx(b,{gap:4,children:["sm","md","lg"].map(n=>e.jsx(h,{label:`size="${n}"`,children:e.jsxs(r,{width:700,children:[e.jsx(o,{label:`Three slot ${n}`,size:n,dividers:["bottom"],startContent:e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(_,{}),isIconOnly:!0}),centerContent:e.jsx(s,{level:4,children:"Document Title"}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Share",variant:"ghost",icon:e.jsx(J,{}),isIconOnly:!0}),e.jsx(t,{label:"More",variant:"ghost",icon:e.jsx(N,{}),isIconOnly:!0})]})}),e.jsx(c,{children:e.jsx(a,{})})]})},n))})},A={name:"Three-slot: ghost start, solid end",render:()=>e.jsxs(r,{width:700,children:[e.jsx(o,{label:"Mixed three slot",dividers:["bottom"],startContent:e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(_,{}),isIconOnly:!0}),centerContent:e.jsx(s,{level:4,children:"Page Title"}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Cancel",variant:"secondary"}),e.jsx(t,{label:"Publish"})]})}),e.jsx(c,{children:e.jsx(a,{})})]})},D={name:"Stress: stacked toolbar variants",render:()=>e.jsxs(r,{width:700,children:[e.jsx(o,{label:"Ghost both",size:"sm",dividers:["bottom"],startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(g,{}),isIconOnly:!0}),e.jsx(s,{level:4,children:"Ghost + Heading"})]}),endContent:e.jsx(t,{label:"Settings",variant:"ghost",icon:e.jsx(m,{}),isIconOnly:!0})}),e.jsx(o,{label:"Solid both",size:"sm",dividers:["bottom"],startContent:e.jsx(t,{label:"Add",size:"sm",icon:e.jsx(p,{})}),endContent:e.jsx(t,{label:"Save",size:"sm"})}),e.jsx(o,{label:"Ghost start solid end",size:"sm",dividers:["bottom"],startContent:e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(_,{}),isIconOnly:!0}),endContent:e.jsx(t,{label:"Next",size:"sm",icon:e.jsx(Z,{})})}),e.jsx(o,{label:"Text start ghost end",size:"sm",dividers:["bottom"],startContent:e.jsx(X,{type:"body",weight:"bold",children:"Selection mode"}),endContent:e.jsx(t,{label:"Done",variant:"ghost"})}),e.jsx(c,{children:e.jsx(a,{lines:2})})]})},P={name:"Card > Layout(contentWidth) > Toolbar header",render:()=>e.jsxs(b,{gap:4,children:[e.jsx(h,{label:"contentWidth=640, ghost buttons",children:e.jsx(r,{width:900,children:e.jsx(i,{contentWidth:640,header:e.jsx(l,{hasDivider:!0,padding:0,children:e.jsx(o,{label:"Card layout header",startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(g,{}),isIconOnly:!0}),e.jsx(s,{level:4,children:"Project Settings"})]}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Search",variant:"ghost",icon:e.jsx(V,{}),isIconOnly:!0}),e.jsx(t,{label:"Settings",variant:"ghost",icon:e.jsx(m,{}),isIconOnly:!0})]})})}),content:e.jsx(d,{children:e.jsx(a,{lines:4})})})})}),e.jsx(h,{label:"contentWidth=640, mixed (ghost start, solid end)",children:e.jsx(r,{width:900,children:e.jsx(i,{contentWidth:640,header:e.jsx(l,{hasDivider:!0,padding:0,children:e.jsx(o,{label:"Card layout header",startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(g,{}),isIconOnly:!0}),e.jsx(s,{level:4,children:"Edit Document"})]}),endContent:e.jsx(t,{label:"Save changes"})})}),content:e.jsx(d,{children:e.jsx(a,{lines:4})})})})}),e.jsx(h,{label:"contentWidth=640, heading start, no end",children:e.jsx(r,{width:900,children:e.jsx(i,{contentWidth:640,header:e.jsx(l,{hasDivider:!0,padding:0,children:e.jsx(o,{label:"Card layout header",startContent:e.jsx(s,{level:4,children:"Notifications"})})}),content:e.jsx(d,{children:e.jsx(a,{lines:4})})})})})]})},$={name:"Card(12px) > Layout > Toolbar + body",render:()=>e.jsx(r,{width:700,padding:3,children:e.jsx(i,{header:e.jsx(l,{hasDivider:!0,padding:0,children:e.jsx(o,{label:"Card header",startContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Back",variant:"ghost",icon:e.jsx(g,{}),isIconOnly:!0}),e.jsx(s,{level:4,children:"Project Settings"})]}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Search",variant:"ghost",icon:e.jsx(V,{}),isIconOnly:!0}),e.jsx(t,{label:"Settings",variant:"ghost",icon:e.jsx(m,{}),isIconOnly:!0})]})})}),content:e.jsx(d,{children:e.jsx(a,{lines:4})})})})},E={name:"Tabs in toolbar (all sizes)",render:()=>{const[n,x]=R.useState("overview");return e.jsx(b,{gap:4,children:["sm","md","lg"].map(u=>e.jsx(h,{label:`size="${u}"`,children:e.jsxs(r,{width:700,children:[e.jsx(o,{label:`Tab toolbar ${u}`,size:u,dividers:["bottom"],startContent:e.jsxs(Q,{value:n,onChange:x,children:[e.jsx(q,{value:"overview",label:"Overview"}),e.jsx(q,{value:"analytics",label:"Analytics"}),e.jsx(q,{value:"settings",label:"Settings"})]}),endContent:e.jsxs(e.Fragment,{children:[e.jsx(t,{label:"Filter",variant:"ghost",icon:e.jsx(M,{}),isIconOnly:!0}),e.jsx(t,{label:"Add",variant:"ghost",icon:e.jsx(p,{}),isIconOnly:!0})]})}),e.jsx(c,{children:e.jsx(a,{})})]})},u))})}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Ghost buttons: start + end',
  render: () => <VStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
          <Card width={600}>
            <Toolbar label={\`Ghost buttons \${size}\`} size={size} dividers={['bottom']} startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Button label="Edit" variant="ghost" />
                  <Button label="Share" variant="ghost" />
                </>} endContent={<>
                  <Button label="Filter" variant="ghost" icon={<FunnelIcon />} isIconOnly />
                  <Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />
                </>} />
            <Section>
              <BodyContent />
            </Section>
          </Card>
        </AlignmentGuide>)}
    </VStack>
}`,...y.parameters?.docs?.source},description:{story:"Ghost buttons in start and end slots across all three sizes. The button text/icon should align flush with the container edge.",...y.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'Solid buttons: start + end',
  render: () => <VStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
          <Card width={600}>
            <Toolbar label={\`Solid buttons \${size}\`} size={size} dividers={['bottom']} startContent={<Button label="New item" icon={<PlusIcon />} />} endContent={<Button label="Save" />} />
            <Section>
              <BodyContent />
            </Section>
          </Card>
        </AlignmentGuide>)}
    </VStack>
}`,...j.parameters?.docs?.source},description:{story:"Solid (default) buttons at edges. These should NOT compensate — their padding is visually filled.",...j.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Mixed: ghost start, solid end',
  render: () => <VStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
          <Card width={600}>
            <Toolbar label={\`Mixed \${size}\`} size={size} dividers={['bottom']} startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Button label="Edit" variant="ghost" />
                </>} endContent={<Button label="Save" />} />
            <Section>
              <BodyContent />
            </Section>
          </Card>
        </AlignmentGuide>)}
    </VStack>
}`,...v.parameters?.docs?.source},description:{story:"Ghost on start edge, solid on end. Only the start should compensate.",...v.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Mixed: solid start, ghost end',
  render: () => <VStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
          <Card width={600}>
            <Toolbar label={\`Mixed \${size}\`} size={size} dividers={['bottom']} startContent={<Button label="New item" icon={<PlusIcon />} />} endContent={<>
                  <Button label="Filter" variant="ghost" icon={<FunnelIcon />} isIconOnly />
                  <Button label="More" variant="ghost" icon={<EllipsisHorizontalIcon />} isIconOnly />
                </>} />
            <Section>
              <BodyContent />
            </Section>
          </Card>
        </AlignmentGuide>)}
    </VStack>
}`,...C.parameters?.docs?.source},description:{story:"Solid on start edge, ghost on end. Only the end should compensate.",...C.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Heading start + ghost end',
  render: () => <VStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
          <Card width={600}>
            <Toolbar label={\`Heading \${size}\`} size={size} dividers={['bottom']} startContent={<Heading level={4}>Section Title</Heading>} endContent={<>
                  <Button label="Filter" variant="ghost" icon={<FunnelIcon />} isIconOnly />
                  <Button label="Add" variant="ghost" icon={<PlusIcon />} isIconOnly />
                </>} />
            <Section>
              <BodyContent />
            </Section>
          </Card>
        </AlignmentGuide>)}
    </VStack>
}`,...S.parameters?.docs?.source},description:{story:"Heading in start slot with ghost buttons at end. Check heading alignment with body text below.",...S.parameters?.docs?.description}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'Text start + ghost end',
  render: () => <Card width={600}>
      <Toolbar label="Text start" dividers={['bottom']} startContent={<Text type="body" weight="bold">
            3 items selected
          </Text>} endContent={<>
            <Button label="Delete" variant="ghost" />
            <Button label="Archive" variant="ghost" />
          </>} />
      <Section>
        <BodyContent />
      </Section>
    </Card>
}`,...L.parameters?.docs?.source},description:{story:"Text (not heading) in start slot with ghost buttons.",...L.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: 'Heading start + solid end',
  render: () => <Card width={600}>
      <Toolbar label="Heading solid" dividers={['bottom']} startContent={<Heading level={4}>Project Settings</Heading>} endContent={<Button label="Save changes" />} />
      <Section>
        <BodyContent />
      </Section>
    </Card>
}`,...B.parameters?.docs?.source},description:{story:"Heading on start, solid on end. No edge compensation on buttons — check heading vs body alignment.",...B.parameters?.docs?.description}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'Layout: no contentWidth, ghost buttons',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="App header" startContent={<>
                  <Button label="Menu" variant="ghost" icon={<Squares2X2Icon />} isIconOnly />
                  <Heading level={4}>Dashboard</Heading>
                </>} endContent={<>
                  <Button label="Search" variant="ghost" icon={<MagnifyingGlassIcon />} isIconOnly />
                  <Button label="Notifications" variant="ghost" icon={<BellIcon />} isIconOnly />
                  <Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...I.parameters?.docs?.source},description:{story:"Toolbar in Layout header, no contentWidth. Full-width toolbar, edge compensation normal.",...I.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Layout: no contentWidth, solid buttons',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="App header" startContent={<Heading level={4}>Dashboard</Heading>} endContent={<>
                  <Button label="Cancel" variant="secondary" />
                  <Button label="Save" />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...T.parameters?.docs?.source},description:{story:"Same without contentWidth but solid buttons for baseline comparison.",...T.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Layout: contentWidth=640, ghost buttons',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Page header" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Heading level={4}>Settings</Heading>
                </>} endContent={<>
                  <Button label="Search" variant="ghost" icon={<MagnifyingGlassIcon />} isIconOnly />
                  <Button label="More" variant="ghost" icon={<EllipsisHorizontalIcon />} isIconOnly />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...w.parameters?.docs?.source},description:{story:"Toolbar in Layout with contentWidth=640. Header is full bleed, body is constrained. Ghost buttons should still align flush.",...w.parameters?.docs?.description}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'Layout: contentWidth=640, solid buttons',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Page header" startContent={<Heading level={4}>Settings</Heading>} endContent={<>
                  <Button label="Cancel" variant="secondary" />
                  <Button label="Save" />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...O.parameters?.docs?.source},description:{story:"Same with contentWidth but solid buttons for comparison.",...O.parameters?.docs?.description}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'Layout: contentWidth=640, mixed',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Page header" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Heading level={4}>Edit Project</Heading>
                </>} endContent={<Button label="Save changes" />} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...H.parameters?.docs?.source},description:{story:"Mixed ghost/solid with contentWidth — ghost start, solid end.",...H.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Layout: contentWidth=960, ghost buttons',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout contentWidth={960} header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Dashboard header" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ChevronLeftIcon />} isIconOnly />
                  <Heading level={4}>Analytics Dashboard</Heading>
                </>} endContent={<>
                  <Button label="Share" variant="ghost" icon={<ShareIcon />} isIconOnly />
                  <Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...f.parameters?.docs?.source},description:{story:"contentWidth=960, ghost buttons. Common for dashboards.",...f.parameters?.docs?.description}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Layout: padding=4, ghost buttons',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout padding={4} header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Padded layout header" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Heading level={4}>Padded Layout</Heading>
                </>} endContent={<Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...W.parameters?.docs?.source},description:{story:"Layout with padding=4 and ghost toolbar. Layout outer padding interacts with toolbar edge compensation.",...W.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: 'Layout: padding=4 + contentWidth=640',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout padding={4} contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Padded constrained header" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Heading level={4}>Constrained + Padded</Heading>
                </>} endContent={<>
                  <Button label="Share" variant="ghost" icon={<ShareIcon />} isIconOnly />
                  <Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={6} />
          </LayoutContent>} />
    </div>
}`,...k.parameters?.docs?.source},description:{story:"Layout with padding + contentWidth together. Both constraints active.",...k.parameters?.docs?.description}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'Layout: header default padding + toolbar',
  render: () => <div style={{
    height: 400,
    border: '1px solid #e0e0e0',
    borderRadius: 8
  }}>
      <Layout header={<LayoutHeader hasDivider>
            <Toolbar label="Double padded?" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Heading level={4}>Double Padding Check</Heading>
                </>} endContent={<Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={4} />
          </LayoutContent>} />
    </div>
}`,...F.parameters?.docs?.source},description:{story:"Toolbar inside LayoutHeader using the header's default padding (not padding={0}). Potential double-padding issue.",...F.parameters?.docs?.description}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  name: 'Comparison: ghost vs solid alignment',
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24
  }}>
      <AlignmentGuide label="Ghost buttons (should align flush)">
        <Card>
          <Toolbar label="Ghost" dividers={['bottom']} startContent={<>
                <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                <Button label="Edit" variant="ghost" />
              </>} endContent={<Button label="More" variant="ghost" icon={<EllipsisHorizontalIcon />} isIconOnly />} />
          <Section>
            <BodyContent />
          </Section>
        </Card>
      </AlignmentGuide>
      <AlignmentGuide label="Solid buttons (natural padding)">
        <Card>
          <Toolbar label="Solid" dividers={['bottom']} startContent={<Button label="New" icon={<PlusIcon />} />} endContent={<Button label="Save" />} />
          <Section>
            <BodyContent />
          </Section>
        </Card>
      </AlignmentGuide>
    </div>
}`,...z.parameters?.docs?.source},description:{story:"Direct visual comparison: ghost vs solid, with body content for alignment reference.",...z.parameters?.docs?.description}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Three-slot: ghost edges + center heading',
  render: () => <VStack gap={4}>
      {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
          <Card width={700}>
            <Toolbar label={\`Three slot \${size}\`} size={size} dividers={['bottom']} startContent={<Button label="Back" variant="ghost" icon={<ChevronLeftIcon />} isIconOnly />} centerContent={<Heading level={4}>Document Title</Heading>} endContent={<>
                  <Button label="Share" variant="ghost" icon={<ShareIcon />} isIconOnly />
                  <Button label="More" variant="ghost" icon={<EllipsisHorizontalIcon />} isIconOnly />
                </>} />
            <Section>
              <BodyContent />
            </Section>
          </Card>
        </AlignmentGuide>)}
    </VStack>
}`,...G.parameters?.docs?.source},description:{story:"Three-slot (center content) with ghost buttons at both edges. Center stays centered.",...G.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'Three-slot: ghost start, solid end',
  render: () => <Card width={700}>
      <Toolbar label="Mixed three slot" dividers={['bottom']} startContent={<Button label="Back" variant="ghost" icon={<ChevronLeftIcon />} isIconOnly />} centerContent={<Heading level={4}>Page Title</Heading>} endContent={<>
            <Button label="Cancel" variant="secondary" />
            <Button label="Publish" />
          </>} />
      <Section>
        <BodyContent />
      </Section>
    </Card>
}`,...A.parameters?.docs?.source},description:{story:"Three-slot: ghost start, center heading, solid end.",...A.parameters?.docs?.description}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'Stress: stacked toolbar variants',
  render: () => <Card width={700}>
      <Toolbar label="Ghost both" size="sm" dividers={['bottom']} startContent={<>
            <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
            <Heading level={4}>Ghost + Heading</Heading>
          </>} endContent={<Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />} />
      <Toolbar label="Solid both" size="sm" dividers={['bottom']} startContent={<Button label="Add" size="sm" icon={<PlusIcon />} />} endContent={<Button label="Save" size="sm" />} />
      <Toolbar label="Ghost start solid end" size="sm" dividers={['bottom']} startContent={<Button label="Back" variant="ghost" icon={<ChevronLeftIcon />} isIconOnly />} endContent={<Button label="Next" size="sm" icon={<ChevronRightIcon />} />} />
      <Toolbar label="Text start ghost end" size="sm" dividers={['bottom']} startContent={<Text type="body" weight="bold">
            Selection mode
          </Text>} endContent={<Button label="Done" variant="ghost" />} />
      <Section>
        <BodyContent lines={2} />
      </Section>
    </Card>
}`,...D.parameters?.docs?.source},description:{story:"Multiple toolbars stacked — checks edge compensation consistency across adjacent toolbars with different content types.",...D.parameters?.docs?.description}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'Card > Layout(contentWidth) > Toolbar header',
  render: () => <VStack gap={4}>
      <AlignmentGuide label="contentWidth=640, ghost buttons">
        <Card width={900}>
          <Layout contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
                <Toolbar label="Card layout header" startContent={<>
                      <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                      <Heading level={4}>Project Settings</Heading>
                    </>} endContent={<>
                      <Button label="Search" variant="ghost" icon={<MagnifyingGlassIcon />} isIconOnly />
                      <Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />
                    </>} />
              </LayoutHeader>} content={<LayoutContent>
                <BodyContent lines={4} />
              </LayoutContent>} />
        </Card>
      </AlignmentGuide>
      <AlignmentGuide label="contentWidth=640, mixed (ghost start, solid end)">
        <Card width={900}>
          <Layout contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
                <Toolbar label="Card layout header" startContent={<>
                      <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                      <Heading level={4}>Edit Document</Heading>
                    </>} endContent={<Button label="Save changes" />} />
              </LayoutHeader>} content={<LayoutContent>
                <BodyContent lines={4} />
              </LayoutContent>} />
        </Card>
      </AlignmentGuide>
      <AlignmentGuide label="contentWidth=640, heading start, no end">
        <Card width={900}>
          <Layout contentWidth={640} header={<LayoutHeader hasDivider padding={0}>
                <Toolbar label="Card layout header" startContent={<Heading level={4}>Notifications</Heading>} />
              </LayoutHeader>} content={<LayoutContent>
                <BodyContent lines={4} />
              </LayoutContent>} />
        </Card>
      </AlignmentGuide>
    </VStack>
}`,...P.parameters?.docs?.source},description:{story:"Card wrapping a Layout with contentWidth. Toolbar lives in the LayoutHeader. Tests the full nesting chain: Card padding → Layout bleed → contentWidth constraint → toolbar edge compensation.",...P.parameters?.docs?.description}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  name: 'Card(12px) > Layout > Toolbar + body',
  render: () => <Card width={700} padding={3}>
      <Layout header={<LayoutHeader hasDivider padding={0}>
            <Toolbar label="Card header" startContent={<>
                  <Button label="Back" variant="ghost" icon={<ArrowLeftIcon />} isIconOnly />
                  <Heading level={4}>Project Settings</Heading>
                </>} endContent={<>
                  <Button label="Search" variant="ghost" icon={<MagnifyingGlassIcon />} isIconOnly />
                  <Button label="Settings" variant="ghost" icon={<Cog6ToothIcon />} isIconOnly />
                </>} />
          </LayoutHeader>} content={<LayoutContent>
            <BodyContent lines={4} />
          </LayoutContent>} />
    </Card>
}`,...$.parameters?.docs?.source},description:{story:"Card with 12px padding wrapping a Layout. Toolbar in header, body text in content. Tests that toolbar edge compensation aligns with body text when the card has non-default (smaller) padding.",...$.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'Tabs in toolbar (all sizes)',
  render: () => {
    const [tab, setTab] = useState('overview');
    return <VStack gap={4}>
        {(['sm', 'md', 'lg'] as const).map(size => <AlignmentGuide key={size} label={\`size="\${size}"\`}>
            <Card width={700}>
              <Toolbar label={\`Tab toolbar \${size}\`} size={size} dividers={['bottom']} startContent={<TabList value={tab} onChange={setTab}>
                    <Tab value="overview" label="Overview" />
                    <Tab value="analytics" label="Analytics" />
                    <Tab value="settings" label="Settings" />
                  </TabList>} endContent={<>
                    <Button label="Filter" variant="ghost" icon={<FunnelIcon />} isIconOnly />
                    <Button label="Add" variant="ghost" icon={<PlusIcon />} isIconOnly />
                  </>} />
              <Section>
                <BodyContent />
              </Section>
            </Card>
          </AlignmentGuide>)}
      </VStack>;
  }
}`,...E.parameters?.docs?.source},description:{story:"Toolbar with tab navigation. Size prop on toolbar cascades to tabs and buttons via SizeContext.",...E.parameters?.docs?.description}}};const we=["GhostButtonsBothEdges","SolidButtonsBothEdges","GhostStartSolidEnd","SolidStartGhostEnd","HeadingStartGhostEnd","TextStartGhostEnd","HeadingStartSolidEnd","LayoutNoContentWidth","LayoutNoContentWidthSolid","LayoutWithContentWidth","LayoutWithContentWidthSolid","LayoutWithContentWidthMixed","LayoutContentWidth960","LayoutWithPadding","LayoutWithPaddingAndContentWidth","LayoutHeaderDefaultPadding","SideBySideComparison","ThreeSlotGhostEdges","ThreeSlotMixed","StackedVariants","CardLayoutContentWidthToolbar","CardSmallPaddingLayoutToolbar","WithTabs"];export{P as CardLayoutContentWidthToolbar,$ as CardSmallPaddingLayoutToolbar,y as GhostButtonsBothEdges,v as GhostStartSolidEnd,S as HeadingStartGhostEnd,B as HeadingStartSolidEnd,f as LayoutContentWidth960,F as LayoutHeaderDefaultPadding,I as LayoutNoContentWidth,T as LayoutNoContentWidthSolid,w as LayoutWithContentWidth,H as LayoutWithContentWidthMixed,O as LayoutWithContentWidthSolid,W as LayoutWithPadding,k as LayoutWithPaddingAndContentWidth,z as SideBySideComparison,j as SolidButtonsBothEdges,C as SolidStartGhostEnd,D as StackedVariants,L as TextStartGhostEnd,G as ThreeSlotGhostEdges,A as ThreeSlotMixed,E as WithTabs,we as __namedExportsOrder,Te as default};
