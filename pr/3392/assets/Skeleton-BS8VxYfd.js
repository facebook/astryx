import{a1 as p,a6 as x,af as f,ay as y}from"./iframe-BAsU9Dt9.js";const c=1e3,$=100,t={root:{kWkggS:"astryxprdx6m astryx1r1p5j5",kSiTet:"astryxvpkmg4",$$css:!0},animate:{kILWW9:"astryxpz12be",k44tkh:"astryxqgcaz",ko0y90:"astryxa4qsjk",kKVMdj:"astryx7a6zss astryx1aquc0h",kyAemX:"astryx193epu2",$$css:!0}},g={0:{kaIpWk:"astryxwksslw",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},1:{kaIpWk:"astryxx3sua9",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},2:{kaIpWk:"astryxh6dtrn",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},3:{kaIpWk:"astryx1hviunn",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},4:{kaIpWk:"astryx1hviunn",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},none:{kaIpWk:"astryx2u8bby",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0},rounded:{kaIpWk:"astryxjspbzw",krdFHd:null,kfmiAY:null,kVL7Gh:null,kT0f0o:null,kIxVMA:null,ksF3WI:null,kqGeR4:null,kYm2EN:null,$$css:!0}},h={kKxzle:"astryxvo38ju",$$css:!0},s={animationDelay:n=>[h,{"--x-animationDelay":(e=>typeof e=="number"?e+"ms":e??void 0)(`${c+$*n}ms`)}],dimensions:(n,e)=>[{kzqmXN:(typeof n=="number"?`${n}px`:n)!=null?"astryx5lhr3w":typeof n=="number"?`${n}px`:n,kZKoxP:(typeof e=="number"?`${e}px`:e)!=null?"astryx16ye13r":typeof e=="number"?`${e}px`:e,$$css:!0},{"--x-width":(l=>typeof l=="number"?l+"px":l??void 0)(typeof n=="number"?`${n}px`:n),"--x-height":(l=>typeof l=="number"?l+"px":l??void 0)(typeof e=="number"?`${e}px`:e)}]};function r({width:n="100%",height:e="100%",radius:l=3,index:a=0,"data-testid":u,xstyle:o,className:i,style:d,ref:k,...m}){return p.jsx("div",{ref:k,"aria-hidden":"true","data-testid":u,...x(y("skeleton"),f(t.root,t.animate,g[l],s.dimensions(n,e),s.animationDelay(a),o),i,d),...m})}r.displayName="Skeleton";r.__docgenInfo={description:`A placeholder shape that indicates content is loading.
Renders a pulsing block with configurable width, height, and border radius.
Use the \`index\` prop to stagger animation timing across multiple skeletons.

@example
\`\`\`
<Skeleton width={200} height={20} />
<Skeleton width={40} height={40} radius="rounded" />
<Skeleton width={300} height={16} index={0} />
<Skeleton width={280} height={16} index={1} />
\`\`\``,methods:[],displayName:"Skeleton",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the root element"},width:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:`Width of the skeleton.
Accepts a number (pixels) or string (any CSS value).
@default '100%'`,defaultValue:{value:"'100%'",computed:!1}},height:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:`Height of the skeleton.
Accepts a number (pixels) or string (any CSS value).
@default '100%'`,defaultValue:{value:"'100%'",computed:!1}},radius:{required:!1,tsType:{name:"unknown"},description:`Border radius of the skeleton, using design token scale.
- 'none': No border radius (sharp corners)
- 0: radius-0 token (0px)
- 1: radius-1 token (4px)
- 2: radius-2 token (8px)
- 3: radius-3 token (12px, default)
- 4: radius-4 token (16px)
- 'rounded': Fully rounded (for avatars, pills)
@default 3`,defaultValue:{value:"3",computed:!1}},index:{required:!1,tsType:{name:"number"},description:`Index for staggered animation timing.
Use sequential indices (0, 1, 2, ...) for multiple skeletons
to create a wave effect.
@default 0`,defaultValue:{value:"0",computed:!1}},"data-testid":{required:!1,tsType:{name:"string"},description:"Test ID for testing purposes."}},composes:["Omit"]};export{r as S};
