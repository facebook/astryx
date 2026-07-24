import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Bt7jq58k.js";import{t as r}from"./Text-BYms8e3u.js";import{t as i}from"./Grid-D30rfaCh.js";import{n as a,t as o}from"./Skeleton-BYIPTaVi.js";import{Cn as s,Ni as c,Pi as l}from"./iframe-DRSfIdhd.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;e((()=>{c(),s(),r(),o(),u=t(),d={sectionLabel:{k1K539:`x1p37lm5`,$$css:!0}},f={title:`Core/AspectRatio`,component:l,tags:[`autodocs`],argTypes:{ratio:{control:`number`,description:`The aspect ratio as width/height (e.g., 16/9 = 1.777...)`},shape:{control:`select`,options:[`rectangle`,`ellipse`],description:`Container shape. Both respect the ratio; "ellipse" clips to an oval (circle at 1:1).`},fit:{control:`select`,options:[void 0,`cover`,`contain`,`center`],description:`How the child is sized inside the ratio box; omitted leaves the child unstyled.`}}},p=`https://picsum.photos/800/600`,m=`https://picsum.photos/400/400`,h={args:{ratio:16/9,fit:`cover`},render:e=>(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`16:9 Aspect Ratio (Default)`}),(0,u.jsx)(l,{...e,children:(0,u.jsx)(`img`,{className:`xh6dtrn`,src:p,alt:`16:9 placeholder`})})]})},g={render:()=>(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`16:9 - Standard widescreen (YouTube, TV)`}),(0,u.jsx)(l,{ratio:16/9,fit:`cover`,children:(0,u.jsx)(`img`,{className:`xh6dtrn`,src:p,alt:`16:9 widescreen`})})]})},_={render:()=>(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`4:3 - Classic TV and photography`}),(0,u.jsx)(l,{ratio:4/3,fit:`cover`,children:(0,u.jsx)(`img`,{className:`xh6dtrn`,src:p,alt:`4:3 classic`})})]})},v={render:()=>(0,u.jsxs)(`div`,{className:`xw5ewwj x1shk3sm x10xzikg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`1:1 - Square (Instagram, avatars)`}),(0,u.jsx)(l,{ratio:1,fit:`cover`,children:(0,u.jsx)(`img`,{className:`xh6dtrn`,src:m,alt:`1:1 square`})})]})},y={render:()=>(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xted6l9`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`21:9 - Ultrawide cinematic`}),(0,u.jsx)(l,{ratio:21/9,children:(0,u.jsx)(`div`,{className:`xh8yej3 x5yr21d x1cxgd31 xh6dtrn x78zum5 x6s0dn4 xl56j7k x1awj2ng`,children:(0,u.jsx)(n,{type:`label`,children:`Ultrawide 21:9`})})})]})},b={args:{ratio:1,shape:`ellipse`,fit:`cover`},render:e=>(0,u.jsxs)(`div`,{className:`xw5ewwj x1shk3sm x10xzikg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`Ellipse at 1:1 — a circle (avatars, profile images)`}),(0,u.jsx)(l,{...e,children:(0,u.jsx)(`img`,{className:`xh6dtrn`,src:m,alt:`Circular media`})})]})},x={args:{ratio:16/9,shape:`ellipse`,fit:`cover`},render:e=>(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`Ellipse at 16:9 — an oval (respects the ratio)`}),(0,u.jsx)(l,{...e,children:(0,u.jsx)(`img`,{className:`xh6dtrn`,src:p,alt:`Oval media`})})]})},S={render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`fit="cover" — fills the box, media is cropped`}),(0,u.jsx)(l,{ratio:16/9,fit:`cover`,children:(0,u.jsx)(`img`,{className:`xh6dtrn`,src:m,alt:`Cropped to fill`})})]}),(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`fit="contain" — fills the box, media is letterboxed`}),(0,u.jsx)(l,{ratio:16/9,fit:`contain`,children:(0,u.jsx)(`img`,{className:`xh6dtrn`,src:m,alt:`Letterboxed to stay visible`})})]}),(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`fit="center" — natural size, centered`}),(0,u.jsx)(l,{ratio:16/9,fit:`center`,children:(0,u.jsx)(`img`,{className:`xh6dtrn`,src:`https://picsum.photos/200/120`,alt:`Natural size, centered`})})]})]})},C={render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`16:9 with loading skeleton`}),(0,u.jsx)(l,{ratio:16/9,children:(0,u.jsx)(a,{width:`100%`,height:`100%`})})]}),(0,u.jsxs)(`div`,{className:`xw5ewwj x1shk3sm x10xzikg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`1:1 with loading skeleton`}),(0,u.jsx)(l,{ratio:1,children:(0,u.jsx)(a,{width:`100%`,height:`100%`})})]})]})},w={render:()=>(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xted6l9`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`Responsive grid of aspect ratio boxes`}),(0,u.jsx)(i,{columns:{minWidth:200},gap:4,children:[{ratio:16/9,label:`16:9`},{ratio:4/3,label:`4:3`},{ratio:1,label:`1:1`},{ratio:3/2,label:`3:2`},{ratio:21/9,label:`21:9`},{ratio:2/3,label:`2:3 Portrait`}].map(({ratio:e,label:t})=>(0,u.jsx)(`div`,{className:`xb3r6kr`,children:(0,u.jsx)(l,{ratio:e,children:(0,u.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,u.jsx)(n,{type:`label`,children:t})})})},t))})]})},T={render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`16:9 (1.778) - Widescreen HD`}),(0,u.jsx)(l,{ratio:16/9,children:(0,u.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,u.jsx)(n,{type:`body`,children:`16:9`})})})]}),(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`4:3 (1.333) - Classic TV`}),(0,u.jsx)(l,{ratio:4/3,children:(0,u.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,u.jsx)(n,{type:`body`,children:`4:3`})})})]}),(0,u.jsxs)(`div`,{className:`xw5ewwj x1shk3sm x10xzikg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`1:1 (1.0) - Square`}),(0,u.jsx)(l,{ratio:1,children:(0,u.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,u.jsx)(n,{type:`body`,children:`1:1`})})})]}),(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xrlsmeg`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`3:2 (1.5) - Classic 35mm Film`}),(0,u.jsx)(l,{ratio:3/2,children:(0,u.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,u.jsx)(n,{type:`body`,children:`3:2`})})})]}),(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xted6l9`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`21:9 (2.333) - Ultrawide Cinematic`}),(0,u.jsx)(l,{ratio:21/9,children:(0,u.jsx)(`div`,{className:`xh8yej3 x5yr21d x1eiddq6 xh6dtrn x78zum5 x6s0dn4 xl56j7k`,children:(0,u.jsx)(n,{type:`body`,children:`21:9`})})})]})]})},E={render:()=>(0,u.jsxs)(`div`,{className:`x1shk3sm x10xzikg xted6l9`,children:[(0,u.jsx)(n,{type:`supporting`,xstyle:d.sectionLabel,children:`Image gallery with consistent aspect ratios`}),(0,u.jsx)(i,{columns:3,gap:4,children:Array.from({length:6},(e,t)=>(0,u.jsx)(l,{ratio:4/3,fit:`cover`,children:(0,u.jsx)(`img`,{className:`xh6dtrn`,src:`https://picsum.photos/seed/${t+1}/400/300`,alt:`Gallery image ${t+1}`})},t))})]})},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        16:9 - Standard widescreen (YouTube, TV)
      </Text>
      <AspectRatio ratio={16 / 9} fit="cover">
        <img {...stylex.props(styles.image)} src={PLACEHOLDER_IMAGE} alt="16:9 widescreen" />
      </AspectRatio>
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.container)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        4:3 - Classic TV and photography
      </Text>
      <AspectRatio ratio={4 / 3} fit="cover">
        <img {...stylex.props(styles.image)} src={PLACEHOLDER_IMAGE} alt="4:3 classic" />
      </AspectRatio>
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.smallContainer)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        1:1 - Square (Instagram, avatars)
      </Text>
      <AspectRatio ratio={1} fit="cover">
        <img {...stylex.props(styles.image)} src={PLACEHOLDER_SQUARE} alt="1:1 square" />
      </AspectRatio>
    </div>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.wideContainer)}>
      <Text type="supporting" xstyle={styles.sectionLabel}>
        21:9 - Ultrawide cinematic
      </Text>
      <AspectRatio ratio={21 / 9}>
        <div {...stylex.props(styles.gradientPlaceholder)}>
          <Text type="label">Ultrawide 21:9</Text>
        </div>
      </AspectRatio>
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D=[`Default`,`Widescreen16x9`,`Classic4x3`,`Square1x1`,`Ultrawide21x9`,`EllipseCircle`,`EllipseOval`,`FitModes`,`WithPlaceholderSkeleton`,`ResponsiveGrid`,`AllRatiosComparison`,`ImageGallery`]}))();export{T as AllRatiosComparison,_ as Classic4x3,h as Default,b as EllipseCircle,x as EllipseOval,S as FitModes,E as ImageGallery,w as ResponsiveGrid,v as Square1x1,y as Ultrawide21x9,g as Widescreen16x9,C as WithPlaceholderSkeleton,D as __namedExportsOrder,f as default};