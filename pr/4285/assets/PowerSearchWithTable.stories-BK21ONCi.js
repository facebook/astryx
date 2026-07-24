import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{_ as i,g as a,t as o}from"./Table-DPpibL4M.js";import{$ as s,Q as c,X as l,ft as u}from"./iframe-BPhJd9TG.js";var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T;e((()=>{d=t(n()),l(),u(),f=r(),p=[{value:`fiction`,label:`Fiction`},{value:`non-fiction`,label:`Non-Fiction`},{value:`sci-fi`,label:`Science Fiction`},{value:`fantasy`,label:`Fantasy`},{value:`mystery`,label:`Mystery`},{value:`romance`,label:`Romance`},{value:`biography`,label:`Biography`},{value:`history`,label:`History`}],m=[{key:`title`,type:`string`,label:`Title`},{key:`author`,type:`string`,label:`Author`},{key:`year`,type:`number`,label:`Publication Year`},{key:`genre`,type:`enum`,label:`Genre`,enumValues:p},{key:`published`,type:`date`,label:`Published Date`},{key:`inStock`,type:`boolean`,label:`In Stock`},{key:`discontinued`,type:`boolean`,label:`Discontinued`},{key:`tags`,type:`string_list`,label:`Tags`},{key:`themes`,type:`enum_list`,label:`Themes`,enumValues:[{value:`coming-of-age`,label:`Coming of Age`},{value:`dystopia`,label:`Dystopia`},{value:`love`,label:`Love`},{value:`war`,label:`War`},{value:`identity`,label:`Identity`},{value:`adventure`,label:`Adventure`}]}],h=[{id:`author-herbert`,label:`Frank Herbert`},{id:`author-austen`,label:`Jane Austen`},{id:`author-fitzgerald`,label:`F. Scott Fitzgerald`},{id:`author-orwell`,label:`George Orwell`},{id:`author-lee`,label:`Harper Lee`},{id:`author-tolkien`,label:`J.R.R. Tolkien`},{id:`author-harari`,label:`Yuval Noah Harari`},{id:`author-rothfuss`,label:`Patrick Rothfuss`}],g={search:e=>h.filter(t=>t.label.toLowerCase().includes(e.toLowerCase())),bootstrap:()=>h},_={key:`authorEntity`,label:`Author (entity)`,defaultOperator:`is_any_of`,operators:[{key:`is_any_of`,i18nKey:`@astryx.powersearch.operator.isAnyOf`,value:{type:`entity_list`,searchSource:g}},{key:`is_none_of`,i18nKey:`@astryx.powersearch.operator.isNoneOf`,value:{type:`entity_list`,searchSource:g}}]},v=(e,t=1,n=1)=>new Date(e,t-1,n),y=[{id:`1`,title:`Dune`,author:`Frank Herbert`,year:1965,genre:`sci-fi`,published:v(1965,8,1),inStock:!0,discontinued:!1,tags:[`classic`,`award-winner`,`series`],themes:[`adventure`,`identity`]},{id:`2`,title:`Pride and Prejudice`,author:`Jane Austen`,year:1813,genre:`romance`,published:v(1813,1,28),inStock:!0,discontinued:!0,tags:[`classic`,`bestseller`],themes:[`love`,`identity`]},{id:`3`,title:`The Great Gatsby`,author:`F. Scott Fitzgerald`,year:1925,genre:`fiction`,published:v(1925,4,10),inStock:!0,discontinued:!1,tags:[`classic`,`staff-pick`],themes:[`love`,`identity`]},{id:`4`,title:`1984`,author:`George Orwell`,year:1949,genre:`sci-fi`,published:v(1949,6,8),inStock:!1,discontinued:!0,tags:[`classic`,`bestseller`],themes:[`dystopia`,`identity`]},{id:`5`,title:`To Kill a Mockingbird`,author:`Harper Lee`,year:1960,genre:`fiction`,published:v(1960,7,11),inStock:!0,discontinued:!1,tags:[`classic`,`award-winner`],themes:[`coming-of-age`,`identity`]},{id:`6`,title:`The Hobbit`,author:`J.R.R. Tolkien`,year:1937,genre:`fantasy`,published:v(1937,9,21),inStock:!0,discontinued:!1,tags:[`classic`,`series`],themes:[`adventure`]},{id:`7`,title:`Sapiens`,author:`Yuval Noah Harari`,year:2011,genre:`non-fiction`,published:v(2011,1,1),inStock:!0,discontinued:!1,tags:[`bestseller`,`staff-pick`],themes:[`identity`]},{id:`8`,title:`The Name of the Wind`,author:`Patrick Rothfuss`,year:2007,genre:`fantasy`,published:v(2007,3,27),inStock:!1,discontinued:!0,tags:[`series`,`staff-pick`],themes:[`adventure`,`coming-of-age`]},{id:`9`,title:`Gone Girl`,author:`Gillian Flynn`,year:2012,genre:`mystery`,published:v(2012,6,5),inStock:!0,discontinued:!1,tags:[`bestseller`],themes:[`love`,`identity`]},{id:`10`,title:`Steve Jobs`,author:`Walter Isaacson`,year:2011,genre:`biography`,published:v(2011,10,24),inStock:!0,discontinued:!0,tags:[`bestseller`],themes:[`identity`]},{id:`11`,title:`A Brief History of Time`,author:`Stephen Hawking`,year:1988,genre:`non-fiction`,published:v(1988,4,1),inStock:!1,discontinued:!1,tags:[`classic`,`staff-pick`],themes:[`identity`]},{id:`12`,title:`The Shining`,author:`Stephen King`,year:1977,genre:`mystery`,published:v(1977,1,28),inStock:!0,discontinued:!1,tags:[`classic`],themes:[`identity`]},{id:`13`,title:`The Handmaid's Tale`,author:`Margaret Atwood`,year:1985,genre:`sci-fi`,published:v(1985,8,17),inStock:!0,discontinued:!1,tags:[`award-winner`,`series`],themes:[`dystopia`,`identity`]},{id:`14`,title:`Outlander`,author:`Diana Gabaldon`,year:1991,genre:`romance`,published:v(1991,6,1),inStock:!0,discontinued:!0,tags:[`series`,`bestseller`],themes:[`love`,`adventure`,`war`]},{id:`15`,title:`The Guns of August`,author:`Barbara Tuchman`,year:1962,genre:`history`,published:v(1962,1,1),inStock:!1,discontinued:!1,tags:[`classic`,`award-winner`],themes:[`war`]}],b=[{key:`title`,header:`Title`,width:i(2)},{key:`author`,header:`Author`,width:i(2)},{key:`year`,header:`Year`,width:a(80)},{key:`genre`,header:`Genre`,width:a(120),renderCell:e=>p.find(t=>t.value===e.genre)?.label??e.genre},{key:`published`,header:`Published`,width:a(120),renderCell:e=>e.published.toLocaleDateString()},{key:`inStock`,header:`In Stock`,width:a(90),renderCell:e=>e.inStock?`Yes`:`No`}],x={title:`Core/PowerSearchWithTable`,tags:[`autodocs`],decorators:[e=>(0,f.jsx)(`div`,{style:{width:1e3},children:(0,f.jsx)(e,{})})]},S={render:()=>{let[e,t]=(0,d.useState)([]),{config:n,applyFilters:r}=c(m,`Books`),i=r(e,y);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,f.jsx)(s,{config:n,filters:e,onChange:e=>t([...e]),placeholder:`Filter books by title, author, year, genre...`,resultCount:i.length}),(0,f.jsx)(o,{data:i,columns:b,idKey:`id`,hasHover:!0})]})}},C={render:()=>{let[e,t]=(0,d.useState)([{field:`genre`,operator:`is`,value:{type:`enum`,value:`sci-fi`}}]),{config:n,applyFilters:r}=c(m,`Books`),i=r(e,y);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,f.jsx)(s,{config:n,filters:e,onChange:e=>t([...e]),placeholder:`Filter books...`,resultCount:i.length}),(0,f.jsx)(o,{data:i,columns:b,idKey:`id`,hasHover:!0,isStriped:!0})]})}},w={render:()=>{let{config:e,applyFilters:t}=c(m,`Books`),n={...e,fields:[...e.fields,_]},[r,i]=(0,d.useState)([{field:`published`,operator:`after`,value:{type:`date_absolute`,unixSeconds:Math.floor(new Date(`1970-01-01`).getTime()/1e3)}},{field:`inStock`,operator:`is_true`,value:{type:`empty`}},{field:`discontinued`,operator:`is_false`,value:{type:`empty`}},{field:`tags`,operator:`is_any_of`,value:{type:`string_list`,value:[`classic`]}},{field:`themes`,operator:`is_any_of`,value:{type:`enum_list`,value:[`identity`]}},{field:`authorEntity`,operator:`is_any_of`,value:{type:`entity_list`,value:[{id:`author-tolkien`,label:`J.R.R. Tolkien`}]}}]),a=t(r,y);return(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:16},children:[(0,f.jsx)(s,{config:n,filters:r,onChange:e=>i([...e]),placeholder:`Mixed filters...`,resultCount:a.length}),(0,f.jsx)(o,{data:a,columns:b,idKey:`id`,hasHover:!0,isStriped:!0})]})}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T=[`Default`,`WithPresetFilters`,`WithMixedFilters`]}))();export{S as Default,w as WithMixedFilters,C as WithPresetFilters,T as __namedExportsOrder,x as default};