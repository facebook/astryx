import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as ee,n as te,r as ne,t as re}from"./LayoutContent-Bp6k5ngv.js";import{n as ie,t}from"./Text-BfjtEFtP.js";import{t as ae}from"./jsx-runtime-DeHZSEgm.js";import{n as oe,t as se}from"./LayoutHeader-DrI9WNU1.js";import{c as ce,g as le,l as ue,m as n,t as r}from"./tokens.stylex-C15xwlpu.js";import{n as de,t as i}from"./Button-BVMvoKVE.js";import{n as fe,t as a}from"./Card-270yxekz.js";import{n as pe,t as o}from"./Heading-CaMVckJS.js";import{n as me,t as he}from"./HStack-DtZv8gmp.js";import{n as ge,t as s}from"./VStack-C2SBQ4Fm.js";import{n as _e,t as ve}from"./Section-BQJsZyZZ.js";import{n as ye,t as c}from"./LayoutFooter-BqlHgkBi.js";import{a as l,i as u,r as be}from"./columnUtils-BDDG7zo5.js";import{a as xe,c as Se,i as Ce,l as d,m as we,n as Te,o as Ee,p as f,r as De,s as p,t as m,u as Oe}from"./Table-ClbWztQk.js";var h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{Te(),we(),Oe(),Se(),Ee(),Ce(),be(),fe(),_e(),ee(),oe(),te(),ye(),ge(),me(),pe(),ie(),de(),ce(),h=ae(),g=[{id:`1`,name:`Alice Johnson`,email:`alice@example.com`,role:`Engineer`,age:30},{id:`2`,name:`Bob Smith`,email:`bob@example.com`,role:`Designer`,age:25},{id:`3`,name:`Charlie Brown`,email:`charlie@example.com`,role:`PM`,age:35},{id:`4`,name:`Diana Prince`,email:`diana@example.com`,role:`Engineer`,age:28},{id:`5`,name:`Eve Davis`,email:`eve@example.com`,role:`Designer`,age:32}],_=[{key:`name`,header:`Name`,width:l(1)},{key:`email`,header:`Email`,width:l(2)},{key:`role`,header:`Role`,width:l(1)},{key:`age`,header:`Age`,width:u(80)}],v={title:`Core/Table`,component:m,tags:[`autodocs`],argTypes:{density:{control:`select`,options:[`compact`,`balanced`,`spacious`],description:`Row density controlling padding and font size`},dividers:{control:`select`,options:[`rows`,`columns`,`grid`,`none`],description:`Divider style between cells`},isStriped:{control:`boolean`,description:`Alternate row background color`},hasHover:{control:`boolean`,description:`Highlight rows on hover`},verticalAlign:{control:`select`,options:[`middle`,`top`,`bottom`],description:`Vertical alignment for body row cells`}}},y={args:{data:g,columns:_,idKey:`id`}},b={args:{data:g,columns:_,idKey:`id`,density:`compact`}},x={args:{data:g,columns:_,idKey:`id`,density:`spacious`}},S={args:{data:g,columns:_,idKey:`id`,isStriped:!0,hasHover:!0}},C={args:{data:g,columns:_,idKey:`id`,dividers:`grid`}},w={args:{data:g,columns:_,idKey:`id`,dividers:`columns`}},T={args:{data:g,columns:_,idKey:`id`,dividers:`none`}},E={render:()=>(0,h.jsx)(m,{data:[{name:`Alice`,role:`Engineer`,status:`Active`},{name:`Bob`,role:`Designer`,status:`Away`}],hasHover:!0})},D={render:()=>{let e=[{key:`name`,header:`Name`},{key:`email`,header:`Email`,width:l(2),renderCell:e=>(0,h.jsx)(`a`,{href:`mailto:${e.email}`,style:{color:`inherit`},children:e.email})},{key:`role`,header:`Role`,renderCell:e=>(0,h.jsx)(`span`,{style:{padding:`${n[`--spacing-0-5`]} ${n[`--spacing-2`]}`,borderRadius:ue[`--radius-inner`],fontSize:le[`--font-size-xs`],backgroundColor:e.role===`Engineer`?r[`--color-background-blue`]:r[`--color-background-purple`],color:e.role===`Engineer`?r[`--color-text-blue`]:r[`--color-text-purple`]},children:e.role})},{key:`age`,header:`Age`,width:u(80)}];return(0,h.jsx)(m,{data:g,columns:e,idKey:`id`,hasHover:!0})}},O={render:()=>(0,h.jsxs)(m,{density:`balanced`,dividers:`rows`,isStriped:!0,hasHover:!0,children:[(0,h.jsx)(xe,{children:(0,h.jsxs)(f,{children:[(0,h.jsx)(p,{children:`Name`}),(0,h.jsx)(p,{children:`Email`}),(0,h.jsx)(p,{children:`Role`})]})}),(0,h.jsxs)(De,{children:[(0,h.jsxs)(f,{children:[(0,h.jsx)(d,{children:`Alice`}),(0,h.jsx)(d,{children:`alice@example.com`}),(0,h.jsx)(d,{children:`Engineer`})]}),(0,h.jsxs)(f,{children:[(0,h.jsx)(d,{children:`Bob`}),(0,h.jsx)(d,{children:`bob@example.com`}),(0,h.jsx)(d,{children:`Designer`})]}),(0,h.jsxs)(f,{children:[(0,h.jsx)(d,{children:`Charlie`}),(0,h.jsx)(d,{children:`charlie@example.com`}),(0,h.jsx)(d,{children:`PM`})]}),(0,h.jsxs)(f,{children:[(0,h.jsx)(d,{children:`Diana`}),(0,h.jsx)(d,{children:`diana@example.com`}),(0,h.jsx)(d,{children:`Engineer`})]})]})]})},k={render:()=>(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`Compact`}),(0,h.jsx)(m,{data:g.slice(0,3),columns:_,idKey:`id`,density:`compact`})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`Balanced (default)`}),(0,h.jsx)(m,{data:g.slice(0,3),columns:_,idKey:`id`,density:`balanced`})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`Spacious`}),(0,h.jsx)(m,{data:g.slice(0,3),columns:_,idKey:`id`,density:`spacious`})]})]})},A={args:{data:g,columns:_,idKey:`id`,density:`compact`,dividers:`grid`,isStriped:!0,hasHover:!0}},j=[{scenario:`Long unbroken string`,content:`a_very_long_string_like_this_that_overflows_the_column_without_any_spaces_or_hyphens`},{scenario:`Normal prose`,content:`This is a longer sentence that might wrap or truncate depending on the textOverflow setting of the table.`},{scenario:`Short text`,content:`Fits fine.`}],M={render:()=>{let e=[{key:`scenario`,header:`Scenario`,width:u(160)},{key:`content`,header:`Content`,width:l(1)}];return(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`,width:`480px`},children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`Wrap (default)`}),(0,h.jsx)(m,{data:j,columns:e,dividers:`grid`,density:`balanced`})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`h4`,{style:{margin:`0 0 8px`},children:`Truncate (with tooltip on hover)`}),(0,h.jsx)(m,{data:j,columns:e,dividers:`grid`,density:`balanced`,textOverflow:`truncate`})]})]})}},N=[{key:`name`,header:`Name`,width:l(1)},{key:`role`,header:`Role`,width:l(1)},{key:`email`,header:`Email`,width:l(2)}],P={decorators:[e=>(0,h.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,h.jsx)(e,{})})],render:()=>(0,h.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak x7a106z`,children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Table in Card (auto bleed)`}),(0,h.jsx)(a,{width:480,children:(0,h.jsx)(m,{data:g.slice(0,4),columns:N})})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:[`Before: Card padding=`,0,` (old pattern)`]}),(0,h.jsx)(a,{width:480,padding:0,children:(0,h.jsx)(m,{data:g.slice(0,4),columns:N})})]})]})},F={decorators:[e=>(0,h.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,h.jsx)(e,{})})],render:()=>(0,h.jsx)(a,{width:520,children:(0,h.jsxs)(s,{gap:3,children:[(0,h.jsx)(o,{level:3,children:`Team Members`}),(0,h.jsx)(m,{data:g.slice(0,4),columns:N,hasHover:!0})]})})},I={decorators:[e=>(0,h.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,h.jsx)(e,{})})],render:()=>(0,h.jsx)(a,{width:560,children:(0,h.jsx)(ne,{header:(0,h.jsx)(se,{hasDivider:!0,children:(0,h.jsx)(o,{level:3,children:`User Directory`})}),content:(0,h.jsx)(re,{children:(0,h.jsx)(m,{data:g,columns:N,hasHover:!0,isStriped:!0})}),footer:(0,h.jsx)(c,{hasDivider:!0,children:(0,h.jsxs)(he,{gap:2,hAlign:`end`,children:[(0,h.jsx)(i,{label:`Export`,variant:`secondary`,children:`Export`}),(0,h.jsx)(i,{label:`Add User`,variant:`primary`,children:`Add User`})]})})})})},L={decorators:[e=>(0,h.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,h.jsx)(e,{})})],render:()=>(0,h.jsxs)(a,{width:520,children:[(0,h.jsxs)(s,{gap:3,children:[(0,h.jsx)(o,{level:3,children:`Dashboard`}),(0,h.jsx)(`p`,{className:`x9ynric xv1l7n4 xif65rj x1ghz6dp`,children:`The table below is in a wash section for visual separation.`})]}),(0,h.jsx)(ve,{variant:`muted`,children:(0,h.jsx)(m,{data:g.slice(0,3),columns:N,density:`compact`})})]})},R={decorators:[e=>(0,h.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,h.jsx)(e,{})})],render:()=>(0,h.jsx)(`div`,{className:`x78zum5 x1qh66ti x1a02dak x7a106z`,children:[`compact`,`balanced`,`spacious`].map(e=>(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:e}),(0,h.jsx)(a,{width:400,children:(0,h.jsxs)(s,{gap:2,children:[(0,h.jsx)(o,{level:4,children:`Team`}),(0,h.jsx)(m,{data:g.slice(0,3),columns:N,density:e})]})})]},e))})},z={decorators:[e=>(0,h.jsx)(`div`,{className:`x1eiddq6 x1gt495`,children:(0,h.jsx)(e,{})})],render:()=>(0,h.jsxs)(`div`,{className:`x78zum5 x1qh66ti x1a02dak x7a106z`,children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Standalone (no container)`}),(0,h.jsx)(`div`,{style:{width:400},children:(0,h.jsx)(m,{data:g.slice(0,3),columns:N})})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`h4`,{className:`xrcdmg7 x9ynric xif65rj xv1l7n4`,children:`Inside Card`}),(0,h.jsx)(a,{width:400,children:(0,h.jsx)(m,{data:g.slice(0,3),columns:N})})]})]})},B=[{id:`1`,description:`Cloud hosting (monthly)`,category:`Infrastructure`,quantity:1,amount:`$2,400.00`},{id:`2`,description:`Design software licenses`,category:`Tools`,quantity:12,amount:`$1,188.00`},{id:`3`,description:`Team offsite catering`,category:`Events`,quantity:45,amount:`$3,150.00`},{id:`4`,description:`Ergonomic keyboards`,category:`Hardware`,quantity:8,amount:`$1,592.00`},{id:`5`,description:`Annual conference tickets`,category:`Travel`,quantity:3,amount:`$4,500.00`}],V=[{key:`description`,header:`Description`,width:l(2)},{key:`category`,header:`Category`},{key:`quantity`,header:`Qty`,align:`center`,width:u(80)},{key:`amount`,header:`Amount`,align:`end`,width:u(120)}],H={render:()=>(0,h.jsx)(m,{data:B,columns:V,idKey:`id`,hasHover:!0,dividers:`rows`})},U=[{id:`1`,name:`Alice Johnson`,bio:`Full-stack engineer with 8 years of experience. Specializes in distributed systems and performance optimization. Previously at Stripe and Google.`,role:`Staff Engineer`},{id:`2`,name:`Bob Smith`,bio:`Product designer focused on design systems and accessibility.`,role:`Senior Designer`},{id:`3`,name:`Charlie Brown`,bio:`Engineering manager leading the platform team. Passionate about developer experience, tooling, and building inclusive teams that ship with confidence.`,role:`EM`}],W=[{key:`name`,header:`Name`,width:u(140)},{key:`bio`,header:`Bio`,width:l(3),renderCell:e=>(0,h.jsx)(`span`,{style:{whiteSpace:`normal`,overflow:`visible`,display:`block`},children:e.bio})},{key:`role`,header:`Role`,align:`end`,width:u(140)}],G={render:()=>(0,h.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[`middle`,`top`,`bottom`].map(e=>(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:[`verticalAlign="`,e,`"`]}),(0,h.jsx)(m,{data:U,columns:W,idKey:`id`,verticalAlign:e,dividers:`rows`})]},e))})},K=[{id:`1`,name:`Alice Johnson`,department:`Engineering`,title:`Senior Software Engineer`,location:`San Francisco`,email:`alice.johnson@example.com`,status:`Active`},{id:`2`,name:`Bob Martinez`,department:`Product Design`,title:`Lead Product Designer`,location:`New York`,email:`bob.martinez@example.com`,status:`Active`},{id:`3`,name:`Carol Williams`,department:`Data Science`,title:`Staff Data Scientist`,location:`Seattle`,email:`carol.williams@example.com`,status:`On Leave`}],q=[{key:`name`,header:`Name`},{key:`department`,header:`Department`},{key:`title`,header:`Title`},{key:`location`,header:`Location`},{key:`email`,header:`Email`},{key:`status`,header:`Status`}],J={render:()=>(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`320px container — 6 columns, horizontal scroll`}),(0,h.jsx)(`div`,{style:{width:`320px`,border:`1px dashed #ccc`,borderRadius:`8px`},children:(0,h.jsx)(m,{data:K,columns:q,idKey:`id`,dividers:`rows`,density:`compact`,textOverflow:`truncate`})})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`480px container — same table, more visible before scroll`}),(0,h.jsx)(`div`,{style:{width:`480px`,border:`1px dashed #ccc`,borderRadius:`8px`},children:(0,h.jsx)(m,{data:K,columns:q,idKey:`id`,dividers:`rows`,density:`compact`,textOverflow:`truncate`})})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`Full width — no scroll needed`}),(0,h.jsx)(m,{data:K,columns:q,idKey:`id`,dividers:`rows`,density:`compact`,textOverflow:`truncate`})]})]})},Y={render:()=>(0,h.jsx)(`div`,{style:{width:`360px`,border:`1px dashed #ccc`,borderRadius:`8px`},children:(0,h.jsx)(a,{children:(0,h.jsx)(m,{data:K,columns:q,idKey:`id`,dividers:`rows`,density:`compact`,textOverflow:`truncate`})})})},X=[{name:`label`,type:`string`,description:`The visible text label for the button.`},{name:`variant`,type:`'primary' | 'secondary' | 'ghost' | 'danger'`,description:`Visual style variant. Primary for main actions, secondary for supporting actions, ghost for minimal emphasis, danger for destructive operations.`},{name:`size`,type:`'sm' | 'md' | 'lg'`,description:`Controls button height, padding, and font size.`},{name:`isDisabled`,type:`boolean`,description:`Disables the button, preventing interactions and applying disabled styling.`},{name:`onClick`,type:`(event: MouseEvent) => void`,description:`Callback fired when the button is clicked.`},{name:`startIcon`,type:`ReactNode`,description:`Icon rendered before the label text.`}],Z={render:()=>{let e=[{key:`name`,header:`Prop`,width:u(140),renderCell:e=>(0,h.jsx)(t,{type:`code`,weight:`bold`,children:e.name})},{key:`type`,header:`Type`,width:u(240),renderCell:e=>(0,h.jsx)(t,{type:`code`,color:`secondary`,children:e.type})},{key:`description`,header:`Description`}];return(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`32px`},children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`360px — docsite props table on mobile`}),(0,h.jsx)(`div`,{style:{width:`360px`,border:`1px dashed #ccc`,borderRadius:`8px`},children:(0,h.jsx)(m,{data:X,columns:e,density:`spacious`,dividers:`rows`})})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`p`,{style:{margin:`0 0 8px`,fontWeight:600},children:`Full width — normal desktop experience`}),(0,h.jsx)(m,{data:X,columns:e,density:`spacious`,dividers:`rows`})]})]})}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    density: 'compact'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    density: 'spacious'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    isStriped: true,
    hasHover: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    dividers: 'grid'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    dividers: 'columns'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    dividers: 'none'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <Table data={[{
    name: 'Alice',
    role: 'Engineer',
    status: 'Active'
  }, {
    name: 'Bob',
    role: 'Designer',
    status: 'Away'
  }]} hasHover />
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    data: users,
    columns,
    idKey: 'id',
    density: 'compact',
    dividers: 'grid',
    isStriped: true,
    hasHover: true
  }
}`,...A.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source},description:{story:`Text wraps by default — rows grow taller and no content is hidden.
Set \`textOverflow="truncate"\` for dense data tables where fixed row
height matters. In truncate mode, default-rendered cells show a
tooltip on hover when text is actually overflowing.`,...M.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source},description:{story:`Table inside a Card automatically bleeds to the card edges.
The first column's start padding and last column's end padding
align with the card's content padding, so text lines up with
other content in the card.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <div {...stylex.props(containerStoryStyles.pageWrapper)}>
        <Story />
      </div>],
  render: () => <Card width={520}>
      <VStack gap={3}>
        <Heading level={3}>Team Members</Heading>
        <Table data={users.slice(0, 4)} columns={simpleColumns} hasHover />
      </VStack>
    </Card>
}`,...F.parameters?.docs?.source},description:{story:`Card with a heading above the table. The table bleeds edge-to-edge
while the heading respects the card's content padding — text in the
first column aligns with the heading.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source},description:{story:`Table inside a Card with Layout — header, content with table, footer.
The table bleeds within the layout content area while header/footer
retain their own padding.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source},description:{story:`Table inside a Section with wash background. The section escapes
the card padding, and the table bleeds within the section.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source},description:{story:`Compares all three density levels inside cards to show how
the edge padding adapts — it always matches the container padding,
with a minimum of 8px even for compact tables.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:`Standalone table (no container) — behaves normally with
density-based cell padding. No bleed, no edge compensation.`,...z.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <Table data={transactions} columns={alignedColumns} idKey="id" hasHover dividers="rows" />
}`,...H.parameters?.docs?.source},description:{story:"Per-column horizontal alignment via the `align` prop.\n\n- `'start'` (default) — left in LTR, right in RTL\n- `'center'` — centered text\n- `'end'` — right in LTR, left in RTL\n\nAlignment applies to both the header `<th>` and body `<td>` cells.\nNumeric columns typically use `align: 'end'`, while status or icon\ncolumns work well with `align: 'center'`.",...H.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
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
}`,...G.parameters?.docs?.source},description:{story:`Compares all three \`verticalAlign\` options side by side.

- \`'middle'\` (default) — vertically centers cell content
- \`'top'\` — aligns to the top, useful for multi-line cells
- \`'bottom'\` — aligns to the bottom

Uses a multi-line "Bio" column with wrapping text to make
the vertical alignment difference visible.`,...G.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
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
}`,...J.parameters?.docs?.source},description:{story:`Demonstrates table behavior in narrow containers (mobile viewports).

With many columns, the table's minimum width (driven by per-column
minimums) exceeds the container width. Instead of squishing columns
to illegible widths, the table scrolls horizontally.

Each column — even those without an explicit \`width\` — gets a default
minimum of 120px, so six columns require at least 720px. In a 320px
container, the table becomes horizontally scrollable.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: '360px',
    border: '1px dashed #ccc',
    borderRadius: '8px'
  }}>
      <Card>
        <Table data={mobileData} columns={mobileColumns} idKey="id" dividers="rows" density="compact" textOverflow="truncate" />
      </Card>
    </div>
}`,...Y.parameters?.docs?.source},description:{story:`Shows horizontal scroll behavior when a table with many columns
is placed inside a Card in a narrow container, verifying that
container bleed and scroll compose correctly.`,...Y.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
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
}`,...Z.parameters?.docs?.source},description:{story:`Mirrors the docsite props-table pattern: two fixed pixel columns
(Prop name + Type) and a flexible Description column.

On mobile (320px), the fixed columns consume most of the space,
leaving description unreadable. With horizontal scroll, all three
columns maintain usable widths.`,...Z.parameters?.docs?.description}}},Q=[`Default`,`Compact`,`Spacious`,`StripedWithHover`,`GridDividers`,`ColumnDividers`,`NoDividers`,`AutoColumns`,`CustomCellRenderer`,`ChildrenMode`,`AllDensities`,`KitchenSink`,`OverflowBehavior`,`InCard`,`InCardWithHeading`,`InCardWithLayout`,`InCardWithSection`,`InCardDensities`,`StandaloneVsContainer`,`ColumnAlignment`,`VerticalAlignment`,`ResponsiveScroll`,`ResponsiveScrollInCard`,`PropsTablePattern`]})))()}$();export{k as AllDensities,E as AutoColumns,O as ChildrenMode,H as ColumnAlignment,w as ColumnDividers,b as Compact,D as CustomCellRenderer,y as Default,C as GridDividers,P as InCard,R as InCardDensities,F as InCardWithHeading,I as InCardWithLayout,L as InCardWithSection,A as KitchenSink,T as NoDividers,M as OverflowBehavior,Z as PropsTablePattern,J as ResponsiveScroll,Y as ResponsiveScrollInCard,x as Spacious,z as StandaloneVsContainer,S as StripedWithHover,G as VerticalAlignment,Q as __namedExportsOrder,v as default};