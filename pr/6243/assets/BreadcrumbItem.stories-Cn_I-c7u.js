import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Icon-D5LgKbqq.js";import{t as r}from"./Icon-Dur9nnrh.js";import{d as i}from"./renderDropdownItems-Ck0QOkgm.js";import{i as a}from"./Stack-CfnjGhmq.js";import{t as o}from"./Layout-B2hEnZFK.js";import{Si as s,bi as c,yi as l}from"./iframe-mM9zmF4O.js";var u,d,f,p;e((()=>{l(),r(),o(),u=t(),d={title:`Core/BreadcrumbItem`,component:c,tags:[`autodocs`],parameters:{controls:{disable:!0}}},f={name:`Public States`,render:()=>(0,u.jsxs)(a,{gap:4,children:[(0,u.jsxs)(s,{label:`Link, action, and current breadcrumb items`,children:[(0,u.jsx)(c,{href:`/calendar`,startIcon:(0,u.jsx)(n,{icon:`calendar`,size:`sm`}),children:`Calendar`}),(0,u.jsx)(c,{onClick:()=>{},children:`Refresh`}),(0,u.jsx)(c,{isCurrent:!0,children:`Overview`})]}),(0,u.jsxs)(s,{label:`Current breadcrumb item with a menu`,children:[(0,u.jsx)(c,{href:`/`,children:`Home`}),(0,u.jsx)(c,{isCurrent:!0,menu:(0,u.jsxs)(u.Fragment,{children:[(0,u.jsx)(i,{label:`Design`}),(0,u.jsx)(i,{label:`Engineering`})]}),children:(0,u.jsx)(`span`,{children:`Teams`})})]})]}),play:async({canvasElement:e})=>{let t=e.querySelector(`.astryx-breadcrumb-item-menu-trigger`);t instanceof HTMLButtonElement&&t.getAttribute(`aria-expanded`)===`false`&&t.click()}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Public States',
  render: () => <VStack gap={4}>
      <Breadcrumbs label="Link, action, and current breadcrumb items">
        <BreadcrumbItem href="/calendar" startIcon={<Icon icon="calendar" size="sm" />}>
          Calendar
        </BreadcrumbItem>
        <BreadcrumbItem onClick={() => {}}>Refresh</BreadcrumbItem>
        <BreadcrumbItem isCurrent>Overview</BreadcrumbItem>
      </Breadcrumbs>
      <Breadcrumbs label="Current breadcrumb item with a menu">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem isCurrent menu={<>
              <BreadcrumbMenuItem label="Design" />
              <BreadcrumbMenuItem label="Engineering" />
            </>}>
          <span>Teams</span>
        </BreadcrumbItem>
      </Breadcrumbs>
    </VStack>,
  play: async ({
    canvasElement
  }) => {
    const trigger = canvasElement.querySelector('.astryx-breadcrumb-item-menu-trigger');
    if (trigger instanceof HTMLButtonElement && trigger.getAttribute('aria-expanded') === 'false') {
      trigger.click();
    }
  }
}`,...f.parameters?.docs?.source},description:{story:`Keeps the public rendering branches on one reusable fixture: navigation link,
action button, explicit current item, icon content, and a current menu trigger.
The menu opens so component-scoped accessibility and RTL audits can reach its
popup semantics without creating a story per audit row.`,...f.parameters?.docs?.description}}},p=[`PublicStates`]}))();export{f as PublicStates,p as __namedExportsOrder,d as default};