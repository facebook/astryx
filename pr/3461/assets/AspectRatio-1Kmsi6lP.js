import{a1 as t,a6 as d,af as m,ay as h}from"./iframe-DVtWfngO.js";const a={container:{kVAEAm:"astryx1n2onr6",kzqmXN:"astryxh8yej3",kVQacm:"astryx7giv3",kAzted:"astryx2lwn1j",kmuXW:"astryx2lah0s",$$css:!0},ellipse:{kaIpWk:"astryx16rqkct",$$css:!0}};function i({ratio:s,shape:e="rectangle",children:n,xstyle:r,className:o,style:l,ref:c,...p}){return t.jsx("div",{ref:c,...d(h("aspect-ratio",{shape:e}),m(a.container,e==="ellipse"&&a.ellipse,r),o,{...l,aspectRatio:s}),...p,children:t.jsx("div",{className:"astryx10l6tqk astryx13vifvy astryx1o0tod astryxh8yej3 astryx5yr21d",children:n})})}i.displayName="AspectRatio";i.__docgenInfo={description:`AspectRatio component for maintaining a specific aspect ratio for its children.

Uses the CSS aspect-ratio property to maintain the ratio. The child element
is positioned absolutely to fill the container, which is useful for images,
videos, embeds, and placeholders.

Use \`shape="ellipse"\` to clip the container into an ellipse — a circle at
\`ratio={1}\` or an oval at other ratios. Both shapes respect the provided
\`ratio\`.

@example
\`\`\`
<AspectRatio ratio={16 / 9}>
  <img src="image.jpg" alt="Widescreen image" style={{objectFit: 'cover'}} />
</AspectRatio>
\`\`\`

@example
\`\`\`
<AspectRatio ratio={1} shape="ellipse">
  <img src="avatar.jpg" alt="" style={{objectFit: 'cover'}} />
</AspectRatio>
\`\`\``,methods:[],displayName:"AspectRatio",props:{xstyle:{required:!1,tsType:{name:"StyleXStyles"},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:"ReactRef",raw:"React.Ref<HTMLDivElement>",elements:[{name:"HTMLDivElement"}]},description:"Ref forwarded to the root element"},ratio:{required:!0,tsType:{name:"number"},description:"The aspect ratio as width/height (e.g., 16/9 = 1.777..., 4/3 = 1.333..., 1 for square)."},shape:{required:!1,tsType:{name:"union",raw:"'rectangle' | 'ellipse'",elements:[{name:"literal",value:"'rectangle'"},{name:"literal",value:"'ellipse'"}]},description:`The shape of the container. Both shapes respect the provided \`ratio\`.
- \`rectangle\` (default): a standard rectangular container.
- \`ellipse\`: clips the container to an ellipse — a circle when \`ratio={1}\`,
  or an oval at other ratios. Pair with a child that fills the container
  (e.g. an image with \`objectFit: 'cover'\`).

@default 'rectangle'

@example
\`\`\`
<AspectRatio ratio={1} shape="ellipse">
  <img src="avatar.jpg" alt="" style={{objectFit: 'cover'}} />
</AspectRatio>
\`\`\``,defaultValue:{value:"'rectangle'",computed:!1}},children:{required:!0,tsType:{name:"ReactNode"},description:`Content to render inside the aspect ratio container.
The child element will be positioned absolutely to fill the container.`}},composes:["Omit"]};export{i as A};
