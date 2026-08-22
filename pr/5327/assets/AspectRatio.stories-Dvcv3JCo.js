import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-DtYqyGdI.js";import{o as r}from"./Stack-BNC3JVPO.js";import{t as i}from"./Layout-BzhOgwDr.js";import{t as a}from"./Text-ruMIfm9Y.js";import{t as o}from"./Grid-aSHo0ahb.js";import{n as s,t as c}from"./Skeleton-BCQ5v5zi.js";import{Ni as l,Pi as u,gn as d}from"./iframe-CdfjaUY5.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;e((()=>{l(),d(),i(),a(),c(),f=t(),p={sectionLabel:{k1K539:`x1p37lm5`,$$css:!0},heightDriven:{kZKoxP:`x1wkxgih`,kzqmXN:`x14atkfc`,$$css:!0}},m={title:`Core/AspectRatio`,component:u,tags:[`autodocs`],argTypes:{ratio:{control:`number`,description:`The aspect ratio as width/height (e.g., 16/9 = 1.777...)`},shape:{control:`select`,options:[`rectangle`,`ellipse`],description:`Container shape. Both respect the ratio; "ellipse" clips to an oval (circle at 1:1).`},fit:{control:`select`,options:[void 0,`cover`,`contain`,`center`],description:`How the child is sized inside the ratio box; omitted leaves the child unstyled.`}}},h=`https://picsum.photos/800/600`,g=`https://picsum.photos/400/400`,_={args:{ratio:16/9,fit:`cover`},render:e=>(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`16:9 Aspect Ratio (Default)`}),(0,f.jsx)(u,{...e,children:(0,f.jsx)(`img`,{className:`xh6dtrn`,src:h,alt:`16:9 placeholder`})})]})},v={render:()=>(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`16:9 - Standard widescreen (YouTube, TV)`}),(0,f.jsx)(u,{ratio:16/9,fit:`cover`,children:(0,f.jsx)(`img`,{className:`xh6dtrn`,src:h,alt:`16:9 widescreen`})})]})},y={render:()=>(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`4:3 - Classic TV and photography`}),(0,f.jsx)(u,{ratio:4/3,fit:`cover`,children:(0,f.jsx)(`img`,{className:`xh6dtrn`,src:h,alt:`4:3 classic`})})]})},b={render:()=>(0,f.jsxs)(`div`,{className:`xw5ewwj x1shk3sm x10xzikg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`1:1 - Square (Instagram, avatars)`}),(0,f.jsx)(u,{ratio:1,fit:`cover`,children:(0,f.jsx)(`img`,{className:`xh6dtrn`,src:g,alt:`1:1 square`})})]})},x={render:()=>(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xted6l9`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`21:9 - Ultrawide cinematic`}),(0,f.jsx)(u,{ratio:21/9,children:(0,f.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,f.jsx)(n,{type:`label`,children:`Ultrawide 21:9`})})})]})},S={args:{ratio:1,shape:`ellipse`,fit:`cover`},render:e=>(0,f.jsxs)(`div`,{className:`xw5ewwj x1shk3sm x10xzikg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`Ellipse at 1:1 — a circle (avatars, profile images)`}),(0,f.jsx)(u,{...e,children:(0,f.jsx)(`img`,{className:`xh6dtrn`,src:g,alt:`Circular media`})})]})},C={args:{ratio:16/9,shape:`ellipse`,fit:`cover`},render:e=>(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`Ellipse at 16:9 — an oval (respects the ratio)`}),(0,f.jsx)(u,{...e,children:(0,f.jsx)(`img`,{className:`xh6dtrn`,src:h,alt:`Oval media`})})]})},w={render:()=>(0,f.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`fit="cover" — fills the box, media is cropped`}),(0,f.jsx)(u,{ratio:16/9,fit:`cover`,children:(0,f.jsx)(`img`,{className:`xh6dtrn`,src:g,alt:`Cropped to fill`})})]}),(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`fit="contain" — fills the box, media is letterboxed`}),(0,f.jsx)(u,{ratio:16/9,fit:`contain`,children:(0,f.jsx)(`img`,{className:`xh6dtrn`,src:g,alt:`Letterboxed to stay visible`})})]}),(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`fit="center" — natural size, centered`}),(0,f.jsx)(u,{ratio:16/9,fit:`center`,children:(0,f.jsx)(`img`,{className:`xh6dtrn`,src:`https://picsum.photos/200/120`,alt:`Natural size, centered`})})]})]})},T={render:()=>(0,f.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`16:9 with loading skeleton`}),(0,f.jsx)(u,{ratio:16/9,children:(0,f.jsx)(s,{width:`100%`,height:`100%`})})]}),(0,f.jsxs)(`div`,{className:`xw5ewwj x1shk3sm x10xzikg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`1:1 with loading skeleton`}),(0,f.jsx)(u,{ratio:1,children:(0,f.jsx)(s,{width:`100%`,height:`100%`})})]})]})},E={render:()=>(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xted6l9`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`Responsive grid of aspect ratio boxes`}),(0,f.jsx)(o,{columns:{minWidth:200},gap:4,children:[{ratio:16/9,label:`16:9`},{ratio:4/3,label:`4:3`},{ratio:1,label:`1:1`},{ratio:3/2,label:`3:2`},{ratio:21/9,label:`21:9`},{ratio:2/3,label:`2:3 Portrait`}].map(({ratio:e,label:t})=>(0,f.jsx)(`div`,{className:`xb3r6kr`,children:(0,f.jsx)(u,{ratio:e,children:(0,f.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,f.jsx)(n,{type:`label`,children:t})})})},t))})]})},D={render:()=>(0,f.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`16:9 (1.778) - Widescreen HD`}),(0,f.jsx)(u,{ratio:16/9,children:(0,f.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,f.jsx)(n,{type:`body`,children:`16:9`})})})]}),(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`4:3 (1.333) - Classic TV`}),(0,f.jsx)(u,{ratio:4/3,children:(0,f.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,f.jsx)(n,{type:`body`,children:`4:3`})})})]}),(0,f.jsxs)(`div`,{className:`xw5ewwj x1shk3sm x10xzikg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`1:1 (1.0) - Square`}),(0,f.jsx)(u,{ratio:1,children:(0,f.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,f.jsx)(n,{type:`body`,children:`1:1`})})})]}),(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`3:2 (1.5) - Classic 35mm Film`}),(0,f.jsx)(u,{ratio:3/2,children:(0,f.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,f.jsx)(n,{type:`body`,children:`3:2`})})})]}),(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xted6l9`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`21:9 (2.333) - Ultrawide Cinematic`}),(0,f.jsx)(u,{ratio:21/9,children:(0,f.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,f.jsx)(n,{type:`body`,children:`21:9`})})})]})]})},O={render:()=>(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xted6l9`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`Image gallery with consistent aspect ratios`}),(0,f.jsx)(o,{columns:3,gap:4,children:Array.from({length:6},(e,t)=>(0,f.jsx)(u,{ratio:4/3,fit:`cover`,children:(0,f.jsx)(`img`,{className:`xh6dtrn`,src:`https://picsum.photos/seed/${t+1}/400/300`,alt:`Gallery image ${t+1}`})},t))})]})},k={render:()=>(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xted6l9`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:"Sized from a fixed height. The box takes its width from the container by default, so a height constraint needs `width: auto` beside it for the ratio to drive the width."}),(0,f.jsx)(r,{gap:4,vAlign:`start`,wrap:`wrap`,children:[{ratio:1,label:`1:1`},{ratio:4/3,label:`4:3`},{ratio:16/9,label:`16:9`}].map(({ratio:e,label:t})=>(0,f.jsx)(u,{ratio:e,fit:`cover`,xstyle:p.heightDriven,children:(0,f.jsx)(`img`,{className:`xh6dtrn`,src:h,alt:`${t} at a fixed height`})},t))})]})},A={render:()=>(0,f.jsxs)(`div`,{className:`x16em4ew x1shk3sm x10xzikg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`240px container`}),(0,f.jsx)(u,{ratio:16/9,fit:`cover`,children:(0,f.jsx)(`img`,{className:`xh6dtrn`,src:h,alt:`16:9 in a narrow container`})})]})},j={render:()=>(0,f.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`Empty: no media, the box still holds its ratio`}),(0,f.jsx)(u,{ratio:16/9,children:(0,f.jsx)(`div`,{className:`xh8yej3 x5yr21d xwmxj5m xh6dtrn`})})]}),(0,f.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,f.jsx)(n,{type:`supporting`,xstyle:p.sectionLabel,children:`Long content: the box clips rather than growing`}),(0,f.jsx)(u,{ratio:16/9,fit:`contain`,children:(0,f.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,f.jsx)(n,{type:`body`,children:`A caption long enough to run past the bottom edge of a 16:9 box, repeated so it cannot fit: the ratio is the contract and the container clips what does not fit inside it, rather than growing to accommodate the text and breaking the ratio it promised.`})})})]})]})},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ratio: 16 / 9,
    fit: 'cover'
  },
  render: args => <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        16:9 Aspect Ratio (Default)
      </Text>
      <AspectRatio {...args}>
        <img {...stylex.props(styles.image)} src={PLACEHOLDER_IMAGE} alt="16:9 placeholder" />
      </AspectRatio>
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        16:9 - Standard widescreen (YouTube, TV)
      </Text>
      <AspectRatio ratio={16 / 9} fit="cover">
        <img {...stylex.props(styles.image)} src={PLACEHOLDER_IMAGE} alt="16:9 widescreen" />
      </AspectRatio>
    </div>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        4:3 - Classic TV and photography
      </Text>
      <AspectRatio ratio={4 / 3} fit="cover">
        <img {...stylex.props(styles.image)} src={PLACEHOLDER_IMAGE} alt="4:3 classic" />
      </AspectRatio>
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.smallContainer)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        1:1 - Square (Instagram, avatars)
      </Text>
      <AspectRatio ratio={1} fit="cover">
        <img {...stylex.props(styles.image)} src={PLACEHOLDER_SQUARE} alt="1:1 square" />
      </AspectRatio>
    </div>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.wideContainer)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        21:9 - Ultrawide cinematic
      </Text>
      <AspectRatio ratio={21 / 9}>
        <div {...stylex.props(styles.placeholder)}>
          <Text type="label">Ultrawide 21:9</Text>
        </div>
      </AspectRatio>
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    ratio: 1,
    shape: 'ellipse',
    fit: 'cover'
  },
  render: args => <div {...stylex.props(styles.smallContainer)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Ellipse at 1:1 — a circle (avatars, profile images)
      </Text>
      <AspectRatio {...args}>
        <img {...stylex.props(styles.image)} src={PLACEHOLDER_SQUARE} alt="Circular media" />
      </AspectRatio>
    </div>
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    ratio: 16 / 9,
    shape: 'ellipse',
    fit: 'cover'
  },
  render: args => <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Ellipse at 16:9 — an oval (respects the ratio)
      </Text>
      <AspectRatio {...args}>
        <img {...stylex.props(styles.image)} src={PLACEHOLDER_IMAGE} alt="Oval media" />
      </AspectRatio>
    </div>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          fit="cover" — fills the box, media is cropped
        </Text>
        <AspectRatio ratio={16 / 9} fit="cover">
          <img {...stylex.props(styles.image)} src={PLACEHOLDER_SQUARE} alt="Cropped to fill" />
        </AspectRatio>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          fit="contain" — fills the box, media is letterboxed
        </Text>
        <AspectRatio ratio={16 / 9} fit="contain">
          <img {...stylex.props(styles.image)} src={PLACEHOLDER_SQUARE} alt="Letterboxed to stay visible" />
        </AspectRatio>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          fit="center" — natural size, centered
        </Text>
        <AspectRatio ratio={16 / 9} fit="center">
          <img {...stylex.props(styles.image)} src="https://picsum.photos/200/120" alt="Natural size, centered" />
        </AspectRatio>
      </div>
    </div>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          16:9 with loading skeleton
        </Text>
        <AspectRatio ratio={16 / 9}>
          <Skeleton width="100%" height="100%" />
        </AspectRatio>
      </div>
      <div {...stylex.props(styles.smallContainer)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          1:1 with loading skeleton
        </Text>
        <AspectRatio ratio={1}>
          <Skeleton width="100%" height="100%" />
        </AspectRatio>
      </div>
    </div>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.wideContainer)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Responsive grid of aspect ratio boxes
      </Text>
      <Grid columns={{
      minWidth: 200
    }} gap={4}>
        {[{
        ratio: 16 / 9,
        label: '16:9'
      }, {
        ratio: 4 / 3,
        label: '4:3'
      }, {
        ratio: 1,
        label: '1:1'
      }, {
        ratio: 3 / 2,
        label: '3:2'
      }, {
        ratio: 21 / 9,
        label: '21:9'
      }, {
        ratio: 2 / 3,
        label: '2:3 Portrait'
      }].map(({
        ratio,
        label
      }) => <div key={label} {...stylex.props(styles.gridItem)}>
            <AspectRatio ratio={ratio}>
              <div {...stylex.props(styles.placeholder)}>
                <Text type="label">{label}</Text>
              </div>
            </AspectRatio>
          </div>)}
      </Grid>
    </div>
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          16:9 (1.778) - Widescreen HD
        </Text>
        <AspectRatio ratio={16 / 9}>
          <div {...stylex.props(styles.placeholder)}>
            <Text type="body">16:9</Text>
          </div>
        </AspectRatio>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          4:3 (1.333) - Classic TV
        </Text>
        <AspectRatio ratio={4 / 3}>
          <div {...stylex.props(styles.placeholder)}>
            <Text type="body">4:3</Text>
          </div>
        </AspectRatio>
      </div>
      <div {...stylex.props(styles.smallContainer)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          1:1 (1.0) - Square
        </Text>
        <AspectRatio ratio={1}>
          <div {...stylex.props(styles.placeholder)}>
            <Text type="body">1:1</Text>
          </div>
        </AspectRatio>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          3:2 (1.5) - Classic 35mm Film
        </Text>
        <AspectRatio ratio={3 / 2}>
          <div {...stylex.props(styles.placeholder)}>
            <Text type="body">3:2</Text>
          </div>
        </AspectRatio>
      </div>
      <div {...stylex.props(styles.wideContainer)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          21:9 (2.333) - Ultrawide Cinematic
        </Text>
        <AspectRatio ratio={21 / 9}>
          <div {...stylex.props(styles.placeholder)}>
            <Text type="body">21:9</Text>
          </div>
        </AspectRatio>
      </div>
    </div>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.wideContainer)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Image gallery with consistent aspect ratios
      </Text>
      <Grid columns={3} gap={4}>
        {Array.from({
        length: 6
      }, (_, i) => <AspectRatio key={i} ratio={4 / 3} fit="cover">
            <img {...stylex.props(styles.image)} src={\`https://picsum.photos/seed/\${i + 1}/400/300\`} alt={\`Gallery image \${i + 1}\`} />
          </AspectRatio>)}
      </Grid>
    </div>
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.wideContainer)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        Sized from a fixed height. The box takes its width from the container by
        default, so a height constraint needs \`width: auto\` beside it for the
        ratio to drive the width.
      </Text>
      <HStack gap={4} vAlign="start" wrap="wrap">
        {[{
        ratio: 1,
        label: '1:1'
      }, {
        ratio: 4 / 3,
        label: '4:3'
      }, {
        ratio: 16 / 9,
        label: '16:9'
      }].map(({
        ratio,
        label
      }) => <AspectRatio key={label} ratio={ratio} fit="cover" xstyle={styles.heightDriven}>
            <img {...stylex.props(styles.image)} src={PLACEHOLDER_IMAGE} alt={\`\${label} at a fixed height\`} />
          </AspectRatio>)}
      </HStack>
    </div>
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.narrowContainer)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        240px container
      </Text>
      <AspectRatio ratio={16 / 9} fit="cover">
        <img {...stylex.props(styles.image)} src={PLACEHOLDER_IMAGE} alt="16:9 in a narrow container" />
      </AspectRatio>
    </div>
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          Empty: no media, the box still holds its ratio
        </Text>
        <AspectRatio ratio={16 / 9}>
          <div {...stylex.props(styles.emptyChild)} />
        </AspectRatio>
      </div>
      <div {...stylex.props(styles.container)}>
        <Text type="supporting" xstyle={styles.sectionLabel}>
          Long content: the box clips rather than growing
        </Text>
        <AspectRatio ratio={16 / 9} fit="contain">
          <div {...stylex.props(styles.placeholder)}>
            <Text type="body">
              A caption long enough to run past the bottom edge of a 16:9 box,
              repeated so it cannot fit: the ratio is the contract and the
              container clips what does not fit inside it, rather than growing
              to accommodate the text and breaking the ratio it promised.
            </Text>
          </div>
        </AspectRatio>
      </div>
    </div>
}`,...j.parameters?.docs?.source}}},M=[`Default`,`Widescreen16x9`,`Classic4x3`,`Square1x1`,`Ultrawide21x9`,`EllipseCircle`,`EllipseOval`,`FitModes`,`WithPlaceholderSkeleton`,`ResponsiveGrid`,`AllRatiosComparison`,`ImageGallery`,`HeightDriven`,`NarrowContainer`,`EmptyAndLongContent`]}))();export{D as AllRatiosComparison,y as Classic4x3,_ as Default,S as EllipseCircle,C as EllipseOval,j as EmptyAndLongContent,w as FitModes,k as HeightDriven,O as ImageGallery,A as NarrowContainer,E as ResponsiveGrid,b as Square1x1,x as Ultrawide21x9,v as Widescreen16x9,T as WithPlaceholderSkeleton,M as __namedExportsOrder,m as default};