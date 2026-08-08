import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./react-BZJXY1be.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{a as r,i,r as a}from"./columnUtils-BDDG7zo5.js";import{n as o,t as s}from"./Table-ClbWztQk.js";import{n as c,t as l}from"./PowerSearch-Bfz5zVm1.js";import{n as u,t as d}from"./usePowerSearchConfig-Bn6AxN9E.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{f=t(),c(),d(),o(),a(),p=n(),m=[{value:`fiction`,label:`Fiction`},{value:`non-fiction`,label:`Non-Fiction`},{value:`sci-fi`,label:`Science Fiction`},{value:`fantasy`,label:`Fantasy`},{value:`mystery`,label:`Mystery`},{value:`romance`,label:`Romance`},{value:`biography`,label:`Biography`},{value:`history`,label:`History`}],h=[{key:`title`,type:`string`,label:`Title`},{key:`author`,type:`string`,label:`Author`},{key:`year`,type:`number`,label:`Publication Year`},{key:`genre`,type:`enum`,label:`Genre`,enumValues:m},{key:`published`,type:`date`,label:`Published Date`},{key:`inStock`,type:`boolean`,label:`In Stock`},{key:`discontinued`,type:`boolean`,label:`Discontinued`},{key:`tags`,type:`string_list`,label:`Tags`},{key:`themes`,type:`enum_list`,label:`Themes`,enumValues:[{value:`coming-of-age`,label:`Coming of Age`},{value:`dystopia`,label:`Dystopia`},{value:`love`,label:`Love`},{value:`war`,label:`War`},{value:`identity`,label:`Identity`},{value:`adventure`,label:`Adventure`}]}],g=[{id:`author-herbert`,label:`Frank Herbert`},{id:`author-austen`,label:`Jane Austen`},{id:`author-fitzgerald`,label:`F. Scott Fitzgerald`},{id:`author-orwell`,label:`George Orwell`},{id:`author-lee`,label:`Harper Lee`},{id:`author-tolkien`,label:`J.R.R. Tolkien`},{id:`author-harari`,label:`Yuval Noah Harari`},{id:`author-rothfuss`,label:`Patrick Rothfuss`}],_={search:e=>g.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>g},v={key:`authorEntity`,label:`Author (entity)`,defaultOperator:`is_any_of`,operators:[{key:`is_any_of`,i18nKey:`@astryx.powersearch.operator.isAnyOf`,value:{type:`entity_list`,searchSource:_}},{key:`is_none_of`,i18nKey:`@astryx.powersearch.operator.isNoneOf`,value:{type:`entity_list`,searchSource:_}}]},y=(e,t=1,n=1)=>new Date(e,t-1,n),b=[{id:`1`,title:`Dune`,author:`Frank Herbert`,year:1965,genre:`sci-fi`,published:y(1965,8,1),inStock:!0,discontinued:!1,tags:[`classic`,`award-winner`,`series`],themes:[`adventure`,`identity`]},{id:`2`,title:`Pride and Prejudice`,author:`Jane Austen`,year:1813,genre:`romance`,published:y(1813,1,28),inStock:!0,discontinued:!0,tags:[`classic`,`bestseller`],themes:[`love`,`identity`]},{id:`3`,title:`The Great Gatsby`,author:`F. Scott Fitzgerald`,year:1925,genre:`fiction`,published:y(1925,4,10),inStock:!0,discontinued:!1,tags:[`classic`,`staff-pick`],themes:[`love`,`identity`]},{id:`4`,title:`1984`,author:`George Orwell`,year:1949,genre:`sci-fi`,published:y(1949,6,8),inStock:!1,discontinued:!0,tags:[`classic`,`bestseller`],themes:[`dystopia`,`identity`]},{id:`5`,title:`To Kill a Mockingbird`,author:`Harper Lee`,year:1960,genre:`fiction`,published:y(1960,7,11),inStock:!0,discontinued:!1,tags:[`classic`,`award-winner`],themes:[`coming-of-age`,`identity`]},{id:`6`,title:`The Hobbit`,author:`J.R.R. Tolkien`,year:1937,genre:`fantasy`,published:y(1937,9,21),inStock:!0,discontinued:!1,tags:[`classic`,`series`],themes:[`adventure`]},{id:`7`,title:`Sapiens`,author:`Yuval Noah Harari`,year:2011,genre:`non-fiction`,published:y(2011,1,1),inStock:!0,discontinued:!1,tags:[`bestseller`,`staff-pick`],themes:[`identity`]},{id:`8`,title:`The Name of the Wind`,author:`Patrick Rothfuss`,year:2007,genre:`fantasy`,published:y(2007,3,27),inStock:!1,discontinued:!0,tags:[`series`,`staff-pick`],themes:[`adventure`,`coming-of-age`]},{id:`9`,title:`Gone Girl`,author:`Gillian Flynn`,year:2012,genre:`mystery`,published:y(2012,6,5),inStock:!0,discontinued:!1,tags:[`bestseller`],themes:[`love`,`identity`]},{id:`10`,title:`Steve Jobs`,author:`Walter Isaacson`,year:2011,genre:`biography`,published:y(2011,10,24),inStock:!0,discontinued:!0,tags:[`bestseller`],themes:[`identity`]},{id:`11`,title:`A Brief History of Time`,author:`Stephen Hawking`,year:1988,genre:`non-fiction`,published:y(1988,4,1),inStock:!1,discontinued:!1,tags:[`classic`,`staff-pick`],themes:[`identity`]},{id:`12`,title:`The Shining`,author:`Stephen King`,year:1977,genre:`mystery`,published:y(1977,1,28),inStock:!0,discontinued:!1,tags:[`classic`],themes:[`identity`]},{id:`13`,title:`The Handmaid's Tale`,author:`Margaret Atwood`,year:1985,genre:`sci-fi`,published:y(1985,8,17),inStock:!0,discontinued:!1,tags:[`award-winner`,`series`],themes:[`dystopia`,`identity`]},{id:`14`,title:`Outlander`,author:`Diana Gabaldon`,year:1991,genre:`romance`,published:y(1991,6,1),inStock:!0,discontinued:!0,tags:[`series`,`bestseller`],themes:[`love`,`adventure`,`war`]},{id:`15`,title:`The Guns of August`,author:`Barbara Tuchman`,year:1962,genre:`history`,published:y(1962,1,1),inStock:!1,discontinued:!1,tags:[`classic`,`award-winner`],themes:[`war`]}],x=[{key:`title`,header:`Title`,width:r(2)},{key:`author`,header:`Author`,width:r(2)},{key:`year`,header:`Year`,width:i(80)},{key:`genre`,header:`Genre`,width:i(120),renderCell:e=>m.find(t=>t.value===e.genre)?.label??e.genre},{key:`published`,header:`Published`,width:i(120),renderCell:e=>e.published.toLocaleDateString()},{key:`inStock`,header:`In Stock`,width:i(90),renderCell:e=>e.inStock?`Yes`:`No`}],S={title:`Core/PowerSearchWithTable`,tags:[`autodocs`],decorators:[e=>(0,p.jsx)(`div`,{style:{width:1e3},children:(0,p.jsx)(e,{})})]},C={render:()=>{let[e,t]=(0,f.useState)([]),{config:n,applyFilters:r}=u(h,`Books`),i=r(e,b);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,p.jsx)(l,{config:n,filters:e,onChange:e=>t([...e]),placeholder:`Filter books by title, author, year, genre...`,resultCount:i.length}),(0,p.jsx)(s,{data:i,columns:x,idKey:`id`,hasHover:!0})]})}},w={render:()=>{let[e,t]=(0,f.useState)([{field:`genre`,operator:`is`,value:{type:`enum`,value:`sci-fi`}}]),{config:n,applyFilters:r}=u(h,`Books`),i=r(e,b);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,p.jsx)(l,{config:n,filters:e,onChange:e=>t([...e]),placeholder:`Filter books...`,resultCount:i.length}),(0,p.jsx)(s,{data:i,columns:x,idKey:`id`,hasHover:!0,isStriped:!0})]})}},T={render:()=>{let{config:e,applyFilters:t}=u(h,`Books`),n={...e,fields:[...e.fields,v]},[r,i]=(0,f.useState)([{field:`published`,operator:`after`,value:{type:`date_absolute`,unixSeconds:Math.floor(new Date(`1970-01-01`).getTime()/1e3)}},{field:`inStock`,operator:`is_true`,value:{type:`empty`}},{field:`discontinued`,operator:`is_false`,value:{type:`empty`}},{field:`tags`,operator:`is_any_of`,value:{type:`string_list`,value:[`classic`]}},{field:`themes`,operator:`is_any_of`,value:{type:`enum_list`,value:[`identity`]}},{field:`authorEntity`,operator:`is_any_of`,value:{type:`entity_list`,value:[{id:`author-tolkien`,label:`J.R.R. Tolkien`}]}}]),a=t(r,b);return(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,p.jsx)(l,{config:n,filters:r,onChange:e=>i([...e]),placeholder:`Mixed filters...`,resultCount:a.length}),(0,p.jsx)(s,{data:a,columns:x,idKey:`id`,hasHover:!0,isStriped:!0})]})}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs, 'Books');
    const filteredBooks = applyFilters(filters, books);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <PowerSearch config={config} filters={filters} onChange={newFilters => setFilters([...newFilters])} placeholder="Filter books by title, author, year, genre..." resultCount={filteredBooks.length} />
        <Table data={filteredBooks} columns={columns} idKey="id" hasHover />
      </div>;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'genre',
      operator: 'is',
      value: {
        type: 'enum',
        value: 'sci-fi'
      }
    }]);
    const {
      config,
      applyFilters
    } = usePowerSearchConfig(fieldDefs, 'Books');
    const filteredBooks = applyFilters(filters, books);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <PowerSearch config={config} filters={filters} onChange={newFilters => setFilters([...newFilters])} placeholder="Filter books..." resultCount={filteredBooks.length} />
        <Table data={filteredBooks} columns={columns} idKey="id" hasHover isStriped />
      </div>;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => {
    const {
      config: baseConfig,
      applyFilters
    } = usePowerSearchConfig(fieldDefs, 'Books');
    const config: PowerSearchConfig = {
      ...baseConfig,
      fields: [...baseConfig.fields, authorEntityField]
    };
    const [filters, setFilters] = useState<PowerSearchFilter[]>([{
      field: 'published',
      operator: 'after',
      value: {
        type: 'date_absolute',
        unixSeconds: Math.floor(new Date('1970-01-01').getTime() / 1000)
      }
    }, {
      field: 'inStock',
      operator: 'is_true',
      value: {
        type: 'empty'
      }
    }, {
      field: 'discontinued',
      operator: 'is_false',
      value: {
        type: 'empty'
      }
    }, {
      field: 'tags',
      operator: 'is_any_of',
      value: {
        type: 'string_list',
        value: ['classic']
      }
    }, {
      field: 'themes',
      operator: 'is_any_of',
      value: {
        type: 'enum_list',
        value: ['identity']
      }
    }, {
      field: 'authorEntity',
      operator: 'is_any_of',
      value: {
        type: 'entity_list',
        value: [{
          id: 'author-tolkien',
          label: 'J.R.R. Tolkien'
        }]
      }
    }]);
    const filteredBooks = applyFilters(filters, books);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>
        <PowerSearch config={config} filters={filters} onChange={newFilters => setFilters([...newFilters])} placeholder="Mixed filters..." resultCount={filteredBooks.length} />
        <Table data={filteredBooks} columns={columns} idKey="id" hasHover isStriped />
      </div>;
  }
}`,...T.parameters?.docs?.source}}},E=[`Default`,`WithPresetFilters`,`WithMixedFilters`]})))()}D();export{C as Default,T as WithMixedFilters,w as WithPresetFilters,E as __namedExportsOrder,S as default};