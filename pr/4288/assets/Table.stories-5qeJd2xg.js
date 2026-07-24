import{i as e}from"./preload-helper-CT_b8DTk.js";import{r as ee,t as te}from"./LayoutContent-CuPavk6w.js";import{t as ne}from"./LayoutHeader-By1G-oXd.js";import{t as re}from"./jsx-runtime-DqZldVDK.js";import{f as t,l as ie,m as ae,t as n}from"./tokens.stylex-yxVornwx.js";import{t as r}from"./Text-Iat6xWeA.js";import{t as i}from"./Button-BBk5Kqd0.js";import{t as oe}from"./Button-CRpvXAU4.js";import{n as a,t as se}from"./Card-B6hq5pd9.js";import{t as o}from"./theme-BwMR6G18.js";import{t as s}from"./Heading-D-Ri_Mjs.js";import{i as c,o as ce}from"./Stack-C7dTtCDZ.js";import{t as le}from"./Section-uPZCRnkC.js";import{t as ue}from"./Section-C4pDrmx1.js";import{t as de}from"./LayoutFooter-B6HT_w7L.js";import{t as fe}from"./Layout-BvMyrLFX.js";import{t as pe}from"./Text-BUJwo4gL.js";import{_ as l,a as u,g as d,l as f,p,r as me,s as m,t as h}from"./Table-DPpibL4M.js";import{ft as he}from"./iframe-iQ3nuRH_.js";var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$;e((()=>{he(),se(),ue(),fe(),pe(),oe(),o(),g=re(),_=[{id:`1`,name:`Alice Johnson`,email:`alice@example.com`,role:`Engineer`,age:30},{id:`2`,name:`Bob Smith`,email:`bob@example.com`,role:`Designer`,age:25},{id:`3`,name:`Charlie Brown`,email:`charlie@example.com`,role:`PM`,age:35},{id:`4`,name:`Diana Prince`,email:`diana@example.com`,role:`Engineer`,age:28},{id:`5`,name:`Eve Davis`,email:`eve@example.com`,role:`Designer`,age:32}],v=[{key:`name`,header:`Name`,width:l(1)},{key:`email`,header:`Email`,width:l(2)},{key:`role`,header:`Role`,width:l(1)},{key:`age`,header:`Age`,width:d(80)}],y={title:`Core/Table`,component:h,tags:[`autodocs`],argTypes:{density:{control:`select`,options:[`compact`,`balanced`,`spacious`],description:`Row density controlling padding and font size`},dividers:{control:`select`,options:[`rows`,`columns`,`grid`,`none`],description:`Divider style between cells`},isStriped:{control:`boolean`,description:`Alternate row background color`},hasHover:{control:`boolean`,description:`Highlight rows on hover`},verticalAlign:{control:`select`,options:[`middle`,`top`,`bottom`],description:`Vertical alignment for body row cells`}}},b={args:{data:_,columns:v,idKey:`id`}},x={args:{data:_,columns:v,idKey:`id`,density:`compact`}},S={args:{data:_,columns:v,idKey:`id`,density:`spacious`}},C={args:{data:_,columns:v,idKey:`id`,isStriped:!0,hasHover:!0}},w={args:{data:_,columns:v,idKey:`id`,dividers:`grid`}},T={args:{data:_,columns:v,idKey:`id`,dividers:`columns`}},E={args:{data:_,columns:v,idKey:`id`,dividers:`none`}},D={render:()=>(0,g.jsx)(h,{data:[{name:`Alice`,role:`Engineer`,status:`Active`},{name:`Bob`,role:`Designer`,status:`Away`}],hasHover:!0})},O={render:()=>{let e=[{key:`name`,header:`Name`},{key:`email`,header:`Email`,width:l(2),renderCell:e=>(0,g.jsx)(`a`,{href:`mailto:${e.email}`,style:{color:`inherit`},children:e.email})},{key:`role`,header:`Role`,renderCell:e=>(0,g.jsx)(`span`,{style:{padding:`${t[`--spacing-0-5`]} ${t[`--spacing-2`]}`,borderRadius:ie[`--radius-inner`],fontSize:ae[`--font-size-xs`],backgroundColor:e.role===`Engineer`?n[`--color-background-blue`]:n[`--color-background-purple`],color:e.role===`Engineer`?n[`--color-text-blue`]:n[`--color-text-purple`]},children:e.role})},{key:`age`,header:`Age`,width:d(80)}];return(0,g.jsx)(h,{data:_,columns:e,idKey:`id`,hasHover:!0})}},k={render:()=>(0,g.jsxs)(h,{density:`balanced`,dividers:`rows`,isStriped:!0,hasHover:!0,children:[(0,g.jsx)(u,{children:(0,g.jsxs)(p,{children:[(0,g.jsx)(m,{children:`Name`}),(0,g.jsx)(m,{children:`Email`}),(0,g.jsx)(m,{children:`Role`})]})}),(0,g.jsxs)(me,{children:[(0,g.jsxs)(p,{children:[(0,g.jsx)(f,{children:`Alice`}),(0,g.jsx)(f,{children:`alice@example.com`}),(0,g.jsx)(f,{children:`Engineer`})]}),(0,g.jsxs)(p,{children:[(0,g.jsx)(f,{children:`Bob`}),(0,g.jsx)(f,{children:`bob@example.com`}),(0,g.jsx)(f,{children:`Designer`})]}),(0,g.jsxs)(p,{children:[(0,g.jsx)(f,{children:`Charlie`}),(0,g.jsx)(f,{children:`charlie@example.com`}),(0,g.jsx)(f,{children:`PM`})]}),(0,g.jsxs)(p,{children:[(0,g.jsx)(f,{children:`Diana`}),(0,g.jsx)(f,{children:`diana@example.com`}),(0,g.jsx)(f,{children:`Engineer`})]})]})]})},A={render:()=>(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`Compact`}),(0,g.jsx)(h,{data:_.slice(0,3),columns:v,idKey:`id`,density:`compact`})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`Balanced (default)`}),(0,g.jsx)(h,{data:_.slice(0,3),columns:v,idKey:`id`,density:`balanced`})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`Spacious`}),(0,g.jsx)(h,{data:_.slice(0,3),columns:v,idKey:`id`,density:`spacious`})]})]})},j={args:{data:_,columns:v,idKey:`id`,density:`compact`,dividers:`grid`,isStriped:!0,hasHover:!0}},M=[{scenario:`Long unbroken string`,content:`a_very_long_string_like_this_that_overflows_the_column_without_any_spaces_or_hyphens`},{scenario:`Normal prose`,content:`This is a longer sentence that might wrap or truncate depending on the textOverflow setting of the table.`},{scenario:`Short text`,content:`Fits fine.`}],N={render:()=>{let e=[{key:`scenario`,header:`Scenario`,width:d(160)},{key:`content`,header:`Content`,width:l(1)}];return(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`,width:`480px`},children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`Wrap (default)`}),(0,g.jsx)(h,{data:M,columns:e,dividers:`grid`,density:`balanced`})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`Truncate (with tooltip on hover)`}),(0,g.jsx)(h,{data:M,columns:e,dividers:`grid`,density:`balanced`,textOverflow:`truncate`})]})]})}},P=[{key:`name`,header:`Name`,width:l(1)},{key:`role`,header:`Role`,width:l(1)},{key:`email`,header:`Email`,width:l(2)}],F={decorators:[e=>(0,g.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,g.jsx)(e,{})})],render:()=>(0,g.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak x7a106z`,children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Table in Card (auto bleed)`}),(0,g.jsx)(a,{width:480,children:(0,g.jsx)(h,{data:_.slice(0,4),columns:P})})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsxs)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:[`Before: Card padding=`,0,` (old pattern)`]}),(0,g.jsx)(a,{width:480,padding:0,children:(0,g.jsx)(h,{data:_.slice(0,4),columns:P})})]})]})},I={decorators:[e=>(0,g.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,g.jsx)(e,{})})],render:()=>(0,g.jsx)(a,{width:520,children:(0,g.jsxs)(c,{gap:3,children:[(0,g.jsx)(s,{level:3,children:`Team Members`}),(0,g.jsx)(h,{data:_.slice(0,4),columns:P,hasHover:!0})]})})},L={decorators:[e=>(0,g.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,g.jsx)(e,{})})],render:()=>(0,g.jsx)(a,{width:560,children:(0,g.jsx)(ee,{header:(0,g.jsx)(ne,{hasDivider:!0,children:(0,g.jsx)(s,{level:3,children:`User Directory`})}),content:(0,g.jsx)(te,{children:(0,g.jsx)(h,{data:_,columns:P,hasHover:!0,isStriped:!0})}),footer:(0,g.jsx)(de,{hasDivider:!0,children:(0,g.jsxs)(ce,{gap:2,hAlign:`end`,children:[(0,g.jsx)(i,{label:`Export`,variant:`secondary`,children:`Export`}),(0,g.jsx)(i,{label:`Add User`,variant:`primary`,children:`Add User`})]})})})})},R={decorators:[e=>(0,g.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,g.jsx)(e,{})})],render:()=>(0,g.jsxs)(a,{width:520,children:[(0,g.jsxs)(c,{gap:3,children:[(0,g.jsx)(s,{level:3,children:`Dashboard`}),(0,g.jsx)(`p`,{className:`x9ynric xv1l7n4 xif65rj x1ghz6dp`,children:`The table below is in a wash section for visual separation.`})]}),(0,g.jsx)(le,{variant:`muted`,children:(0,g.jsx)(h,{data:_.slice(0,3),columns:P,density:`compact`})})]})},z={decorators:[e=>(0,g.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,g.jsx)(e,{})})],render:()=>(0,g.jsx)(`div`,{className:`x78zum5 x1qh66ti x1a02dak x7a106z`,children:[`compact`,`balanced`,`spacious`].map(e=>(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:e}),(0,g.jsx)(a,{width:400,children:(0,g.jsxs)(c,{gap:2,children:[(0,g.jsx)(s,{level:4,children:`Team`}),(0,g.jsx)(h,{data:_.slice(0,3),columns:P,density:e})]})})]},e))})},B={decorators:[e=>(0,g.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,g.jsx)(e,{})})],render:()=>(0,g.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak x7a106z`,children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Standalone (no container)`}),(0,g.jsx)(`div`,{style:{width:400},children:(0,g.jsx)(h,{data:_.slice(0,3),columns:P})})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Inside Card`}),(0,g.jsx)(a,{width:400,children:(0,g.jsx)(h,{data:_.slice(0,3),columns:P})})]})]})},V=[{id:`1`,description:`Cloud hosting (monthly)`,category:`Infrastructure`,quantity:1,amount:`$2,400.00`},{id:`2`,description:`Design software licenses`,category:`Tools`,quantity:12,amount:`$1,188.00`},{id:`3`,description:`Team offsite catering`,category:`Events`,quantity:45,amount:`$3,150.00`},{id:`4`,description:`Ergonomic keyboards`,category:`Hardware`,quantity:8,amount:`$1,592.00`},{id:`5`,description:`Annual conference tickets`,category:`Travel`,quantity:3,amount:`$4,500.00`}],H=[{key:`description`,header:`Description`,width:l(2)},{key:`category`,header:`Category`},{key:`quantity`,header:`Qty`,align:`center`,width:d(80)},{key:`amount`,header:`Amount`,align:`end`,width:d(120)}],U={render:()=>(0,g.jsx)(h,{data:V,columns:H,idKey:`id`,hasHover:!0,dividers:`rows`})},W=[{id:`1`,name:`Alice Johnson`,bio:`Full-stack engineer with 8 years of experience. Specializes in distributed systems and performance optimization. Previously at Stripe and Google.`,role:`Staff Engineer`},{id:`2`,name:`Bob Smith`,bio:`Product designer focused on design systems and accessibility.`,role:`Senior Designer`},{id:`3`,name:`Charlie Brown`,bio:`Engineering manager leading the platform team. Passionate about developer experience, tooling, and building inclusive teams that ship with confidence.`,role:`EM`}],G=[{key:`name`,header:`Name`,width:d(140)},{key:`bio`,header:`Bio`,width:l(3),renderCell:e=>(0,g.jsx)(`span`,{style:{whiteSpace:`normal`,overflow:`visible`,display:`block`},children:e.bio})},{key:`role`,header:`Role`,align:`end`,width:d(140)}],K={render:()=>(0,g.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[`middle`,`top`,`bottom`].map(e=>(0,g.jsxs)(`div`,{children:[(0,g.jsxs)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:[`verticalAlign="`,e,`"`]}),(0,g.jsx)(h,{data:W,columns:G,idKey:`id`,verticalAlign:e,dividers:`rows`})]},e))})},q=[{id:`1`,name:`Alice Johnson`,department:`Engineering`,title:`Senior Software Engineer`,location:`San Francisco`,email:`alice.johnson@example.com`,status:`Active`},{id:`2`,name:`Bob Martinez`,department:`Product Design`,title:`Lead Product Designer`,location:`New York`,email:`bob.martinez@example.com`,status:`Active`},{id:`3`,name:`Carol Williams`,department:`Data Science`,title:`Staff Data Scientist`,location:`Seattle`,email:`carol.williams@example.com`,status:`On Leave`}],J=[{key:`name`,header:`Name`},{key:`department`,header:`Department`},{key:`title`,header:`Title`},{key:`location`,header:`Location`},{key:`email`,header:`Email`},{key:`status`,header:`Status`}],Y={render:()=>(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`320px container — 6 columns, horizontal scroll`}),(0,g.jsx)(`div`,{style:{width:`320px`,border:`1px dashed #ccc`,borderRadius:`8px`},children:(0,g.jsx)(h,{data:q,columns:J,idKey:`id`,dividers:`rows`,density:`compact`,textOverflow:`truncate`})})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`480px container — same table, more visible before scroll`}),(0,g.jsx)(`div`,{style:{width:`480px`,border:`1px dashed #ccc`,borderRadius:`8px`},children:(0,g.jsx)(h,{data:q,columns:J,idKey:`id`,dividers:`rows`,density:`compact`,textOverflow:`truncate`})})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`Full width — no scroll needed`}),(0,g.jsx)(h,{data:q,columns:J,idKey:`id`,dividers:`rows`,density:`compact`,textOverflow:`truncate`})]})]})},X={render:()=>(0,g.jsx)(`div`,{style:{width:`360px`,border:`1px dashed #ccc`,borderRadius:`8px`},children:(0,g.jsx)(a,{children:(0,g.jsx)(h,{data:q,columns:J,idKey:`id`,dividers:`rows`,density:`compact`,textOverflow:`truncate`})})})},Z=[{name:`label`,type:`string`,description:`The visible text label for the button.`},{name:`variant`,type:`'primary' | 'secondary' | 'ghost' | 'danger'`,description:`Visual style variant. Primary for main actions, secondary for supporting actions, ghost for minimal emphasis, danger for destructive operations.`},{name:`size`,type:`'sm' | 'md' | 'lg'`,description:`Controls button height, padding, and font size.`},{name:`isDisabled`,type:`boolean`,description:`Disables the button, preventing interactions and applying disabled styling.`},{name:`onClick`,type:`(event: MouseEvent) => void`,description:`Callback fired when the button is clicked.`},{name:`startIcon`,type:`ReactNode`,description:`Icon rendered before the label text.`}],Q={render:()=>{let e=[{key:`name`,header:`Prop`,width:d(140),renderCell:e=>(0,g.jsx)(r,{type:`code`,weight:`bold`,children:e.name})},{key:`type`,header:`Type`,width:d(240),renderCell:e=>(0,g.jsx)(r,{type:`code`,color:`secondary`,children:e.type})},{key:`description`,header:`Description`}];return(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`360px — docsite props table on mobile`}),(0,g.jsx)(`div`,{style:{width:`360px`,border:`1px dashed #ccc`,borderRadius:`8px`},children:(0,g.jsx)(h,{data:Z,columns:e,density:`spacious`,dividers:`rows`})})]}),(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`Full width — normal desktop experience`}),(0,g.jsx)(h,{data:Z,columns:e,density:`spacious`,dividers:`rows`})]})]})}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    density: 'compact'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    density: 'spacious'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    isStriped: true,
    hasHover: true
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    dividers: 'grid'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    dividers: 'columns'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    dividers: 'none'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <Table data={[{
    name: 'Alice',
    role: 'Engineer',
    status: 'Active'
  }, {
    name: 'Bob',
    role: 'Designer',
    status: 'Away'
  }]} hasHover />
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => {
    const cols: TableColumn<User>[] = [{
      key: 'name',
      header: 'Name'
    }, {
      key: 'email',
      header: 'Email',
      width: proportional(2),
      renderCell: item => <a href={\`mailto:\${item.email}\`} style={{
        color: 'inherit'
      }}>
            {item.email}
          </a>
    }, {
      key: 'role',
      header: 'Role',
      renderCell: item => <span style={{
        padding: \`\${spacingDefaults['--spacing-0-5']} \${spacingDefaults['--spacing-2']}\`,
        borderRadius: radiusDefaults['--radius-inner'],
        fontSize: textSizeDefaults['--font-size-xs'],
        backgroundColor: item.role === 'Engineer' ? colorDefaults['--color-background-blue'] : colorDefaults['--color-background-purple'],
        color: item.role === 'Engineer' ? colorDefaults['--color-text-blue'] : colorDefaults['--color-text-purple']
      }}>
            {item.role}
          </span>
    }, {
      key: 'age',
      header: 'Age',
      width: pixel(80)
    }];
    return <Table data={users} columns={cols} idKey="id" hasHover />;
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <Table density="balanced" dividers="rows" isStriped hasHover>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Alice</TableCell>
          <TableCell>alice@example.com</TableCell>
          <TableCell>Engineer</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob</TableCell>
          <TableCell>bob@example.com</TableCell>
          <TableCell>Designer</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Charlie</TableCell>
          <TableCell>charlie@example.com</TableCell>
          <TableCell>PM</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Diana</TableCell>
          <TableCell>diana@example.com</TableCell>
          <TableCell>Engineer</TableCell>
        </TableRow>
      </TableBody>
    </Table>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  }}>
      <div>
        <p style={{
        margin: '0 0 8px',
        fontWeight: 600
      }}>Compact</p>
        <Table data={users.slice(0, 3)} columns={columns} idKey="id" density="compact" />
      </div>
      <div>
        <p style={{
        margin: '0 0 8px',
        fontWeight: 600
      }}>Balanced (default)</p>
        <Table data={users.slice(0, 3)} columns={columns} idKey="id" density="balanced" />
      </div>
      <div>
        <p style={{
        margin: '0 0 8px',
        fontWeight: 600
      }}>Spacious</p>
        <Table data={users.slice(0, 3)} columns={columns} idKey="id" density="spacious" />
      </div>
    </div>
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    density: 'compact',
    dividers: 'grid',
    isStriped: true,
    hasHover: true
  }
}`,...j.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => {
    const cols: TableColumn<OverflowRow>[] = [{
      key: 'scenario',
      header: 'Scenario',
      width: pixel(160)
    }, {
      key: 'content',
      header: 'Content',
      width: proportional(1)
    }];
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      width: '480px'
    }}>
        <div>
          <h4 style={{
          margin: '0 0 8px'
        }}>Wrap (default)</h4>
          <Table data={overflowData} columns={cols} dividers="grid" density="balanced" />
        </div>
        <div>
          <h4 style={{
          margin: '0 0 8px'
        }}>Truncate (with tooltip on hover)</h4>
          <Table data={overflowData} columns={cols} dividers="grid" density="balanced" textOverflow="truncate" />
        </div>
      </div>;
  }
}`,...N.parameters?.docs?.source},description:{story:`Text wraps by default — rows grow taller and no content is hidden.
Set \`textOverflow="truncate"\` for dense data tables where fixed row
height matters. In truncate mode, default-rendered cells show a
tooltip on hover when text is actually overflowing.`,...N.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>],
  render: () => <div {...stylex.props(containerStoryStyles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(containerStoryStyles.heading)}>
          Table in Card (auto bleed)
        </h4>
        <Card width={480}>
          <Table data={users.slice(0, 4)} columns={simpleColumns} />
        </Card>
      </div>
      <div>
        <h4 {...stylex.props(containerStoryStyles.heading)}>
          Before: Card padding={0} (old pattern)
        </h4>
        <Card width={480} padding={0}>
          <Table data={users.slice(0, 4)} columns={simpleColumns} />
        </Card>
      </div>
    </div>
}`,...F.parameters?.docs?.source},description:{story:`Table inside a Card automatically bleeds to the card edges.
The first column's start padding and last column's end padding
align with the card's content padding, so text lines up with
other content in the card.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>],
  render: () => <Card width={520}>
      <VStack gap={3}>
        <Heading level={3}>Team Members</Heading>
        <Table data={users.slice(0, 4)} columns={simpleColumns} hasHover />
      </VStack>
    </Card>
}`,...I.parameters?.docs?.source},description:{story:`Card with a heading above the table. The table bleeds edge-to-edge
while the heading respects the card's content padding — text in the
first column aligns with the heading.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>],
  render: () => <Card width={560}>
      <Layout header={<LayoutHeader hasDivider>
            <Heading level={3}>User Directory</Heading>
          </LayoutHeader>} content={<LayoutContent>
            <Table data={users} columns={simpleColumns} hasHover isStriped />
          </LayoutContent>} footer={<LayoutFooter hasDivider>
            <HStack gap={2} hAlign="end">
              <Button label="Export" variant="secondary">
                Export
              </Button>
              <Button label="Add User" variant="primary">
                Add User
              </Button>
            </HStack>
          </LayoutFooter>} />
    </Card>
}`,...L.parameters?.docs?.source},description:{story:`Table inside a Card with Layout — header, content with table, footer.
The table bleeds within the layout content area while header/footer
retain their own padding.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>],
  render: () => <Card width={520}>
      <VStack gap={3}>
        <Heading level={3}>Dashboard</Heading>
        <p {...stylex.props(containerStoryStyles.text)}>
          The table below is in a wash section for visual separation.
        </p>
      </VStack>
      <Section variant="muted">
        <Table data={users.slice(0, 3)} columns={simpleColumns} density="compact" />
      </Section>
    </Card>
}`,...R.parameters?.docs?.source},description:{story:`Table inside a Section with wash background. The section escapes
the card padding, and the table bleeds within the section.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>],
  render: () => <div {...stylex.props(containerStoryStyles.storyWrapper)}>
      {(['compact', 'balanced', 'spacious'] as const).map(density => <div key={density}>
          <h4 {...stylex.props(containerStoryStyles.heading)}>{density}</h4>
          <Card width={400}>
            <VStack gap={2}>
              <Heading level={4}>Team</Heading>
              <Table data={users.slice(0, 3)} columns={simpleColumns} density={density} />
            </VStack>
          </Card>
        </div>)}
    </div>
}`,...z.parameters?.docs?.source},description:{story:`Compares all three density levels inside cards to show how
the edge padding adapts — it always matches the container padding,
with a minimum of 8px even for compact tables.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>],
  render: () => <div {...stylex.props(containerStoryStyles.storyWrapper)}>
      <div>
        <h4 {...stylex.props(containerStoryStyles.heading)}>
          Standalone (no container)
        </h4>
        <div style={{
        width: 400
      }}>
          <Table data={users.slice(0, 3)} columns={simpleColumns} />
        </div>
      </div>
      <div>
        <h4 {...stylex.props(containerStoryStyles.heading)}>Inside Card</h4>
        <Card width={400}>
          <Table data={users.slice(0, 3)} columns={simpleColumns} />
        </Card>
      </div>
    </div>
}`,...B.parameters?.docs?.source},description:{story:`Standalone table (no container) — behaves normally with
density-based cell padding. No bleed, no edge compensation.`,...B.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: () => <Table data={transactions} columns={alignedColumns} idKey="id" hasHover dividers="rows" />
}`,...U.parameters?.docs?.source},description:{story:"Per-column horizontal alignment via the `align` prop.\n\n- `'start'` (default) — left in LTR, right in RTL\n- `'center'` — centered text\n- `'end'` — right in LTR, left in RTL\n\nAlignment applies to both the header `<th>` and body `<td>` cells.\nNumeric columns typically use `align: 'end'`, while status or icon\ncolumns work well with `align: 'center'`.",...U.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  }}>
      {(['middle', 'top', 'bottom'] as const).map(vAlign => <div key={vAlign}>
          <p style={{
        margin: '0 0 8px',
        fontWeight: 600
      }}>
            verticalAlign=&quot;{vAlign}&quot;
          </p>
          <Table data={teamMembers} columns={verticalAlignColumns} idKey="id" verticalAlign={vAlign} dividers="rows" />
        </div>)}
    </div>
}`,...K.parameters?.docs?.source},description:{story:`Compares all three \`verticalAlign\` options side by side.

- \`'middle'\` (default) — vertically centers cell content
- \`'top'\` — aligns to the top, useful for multi-line cells
- \`'bottom'\` — aligns to the bottom

Uses a multi-line "Bio" column with wrapping text to make
the vertical alignment difference visible.`,...K.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  }}>
      <div>
        <p style={{
        margin: '0 0 8px',
        fontWeight: 600
      }}>
          320px container — 6 columns, horizontal scroll
        </p>
        <div style={{
        width: '320px',
        border: '1px dashed #ccc',
        borderRadius: '8px'
      }}>
          <Table data={mobileData} columns={mobileColumns} idKey="id" dividers="rows" density="compact" textOverflow="truncate" />
        </div>
      </div>
      <div>
        <p style={{
        margin: '0 0 8px',
        fontWeight: 600
      }}>
          480px container — same table, more visible before scroll
        </p>
        <div style={{
        width: '480px',
        border: '1px dashed #ccc',
        borderRadius: '8px'
      }}>
          <Table data={mobileData} columns={mobileColumns} idKey="id" dividers="rows" density="compact" textOverflow="truncate" />
        </div>
      </div>
      <div>
        <p style={{
        margin: '0 0 8px',
        fontWeight: 600
      }}>
          Full width — no scroll needed
        </p>
        <Table data={mobileData} columns={mobileColumns} idKey="id" dividers="rows" density="compact" textOverflow="truncate" />
      </div>
    </div>
}`,...Y.parameters?.docs?.source},description:{story:`Demonstrates table behavior in narrow containers (mobile viewports).

With many columns, the table's minimum width (driven by per-column
minimums) exceeds the container width. Instead of squishing columns
to illegible widths, the table scrolls horizontally.

Each column — even those without an explicit \`width\` — gets a default
minimum of 120px, so six columns require at least 720px. In a 320px
container, the table becomes horizontally scrollable.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: '360px',
    border: '1px dashed #ccc',
    borderRadius: '8px'
  }}>
      <Card>
        <Table data={mobileData} columns={mobileColumns} idKey="id" dividers="rows" density="compact" textOverflow="truncate" />
      </Card>
    </div>
}`,...X.parameters?.docs?.source},description:{story:`Shows horizontal scroll behavior when a table with many columns
is placed inside a Card in a narrow container, verifying that
container bleed and scroll compose correctly.`,...X.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: () => {
    const cols: TableColumn<PropEntry>[] = [{
      key: 'name',
      header: 'Prop',
      width: pixel(140),
      renderCell: (item: PropEntry) => <Text type="code" weight="bold">
            {item.name}
          </Text>
    }, {
      key: 'type',
      header: 'Type',
      width: pixel(240),
      renderCell: (item: PropEntry) => <Text type="code" color="secondary">
            {item.type}
          </Text>
    }, {
      key: 'description',
      header: 'Description'
    }];
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
        <div>
          <p style={{
          margin: '0 0 8px',
          fontWeight: 600
        }}>
            360px — docsite props table on mobile
          </p>
          <div style={{
          width: '360px',
          border: '1px dashed #ccc',
          borderRadius: '8px'
        }}>
            <Table data={propData} columns={cols} density="spacious" dividers="rows" />
          </div>
        </div>
        <div>
          <p style={{
          margin: '0 0 8px',
          fontWeight: 600
        }}>
            Full width — normal desktop experience
          </p>
          <Table data={propData} columns={cols} density="spacious" dividers="rows" />
        </div>
      </div>;
  }
}`,...Q.parameters?.docs?.source},description:{story:`Mirrors the docsite props-table pattern: two fixed pixel columns
(Prop name + Type) and a flexible Description column.

On mobile (320px), the fixed columns consume most of the space,
leaving description unreadable. With horizontal scroll, all three
columns maintain usable widths.`,...Q.parameters?.docs?.description}}},$=[`Default`,`Compact`,`Spacious`,`StripedWithHover`,`GridDividers`,`ColumnDividers`,`NoDividers`,`AutoColumns`,`CustomCellRenderer`,`ChildrenMode`,`AllDensities`,`KitchenSink`,`OverflowBehavior`,`InCard`,`InCardWithHeading`,`InCardWithLayout`,`InCardWithSection`,`InCardDensities`,`StandaloneVsContainer`,`ColumnAlignment`,`VerticalAlignment`,`ResponsiveScroll`,`ResponsiveScrollInCard`,`PropsTablePattern`]}))();export{A as AllDensities,D as AutoColumns,k as ChildrenMode,U as ColumnAlignment,T as ColumnDividers,x as Compact,O as CustomCellRenderer,b as Default,w as GridDividers,F as InCard,z as InCardDensities,I as InCardWithHeading,L as InCardWithLayout,R as InCardWithSection,j as KitchenSink,E as NoDividers,N as OverflowBehavior,Q as PropsTablePattern,Y as ResponsiveScroll,X as ResponsiveScrollInCard,S as Spacious,B as StandaloneVsContainer,C as StripedWithHover,K as VerticalAlignment,$ as __namedExportsOrder,y as default};