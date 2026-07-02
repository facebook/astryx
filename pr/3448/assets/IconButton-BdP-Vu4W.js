import{a1 as e,B as i}from"./iframe-Cm6U1NA5.js";function n({icon:t,...o}){return e.jsx(i,{...o,icon:t,isIconOnly:!0})}n.displayName="IconButton";n.__docgenInfo={description:`An icon-only button — a thin wrapper around Button with \`isIconOnly\`
always set to true.

Use this instead of \`<Button isIconOnly>\` for explicit, greppable,
and codemod-safe icon-only button usage.

@example
\`\`\`
<IconButton label="Settings" icon={<GearIcon />} variant="ghost" />
<IconButton label="Delete" icon={<TrashIcon />} variant="destructive" />
<IconButton label="Emoji" icon={<span>🚀</span>} variant="ghost" size="sm" />
\`\`\``,methods:[],displayName:"IconButton",props:{icon:{required:!0,tsType:{name:"ReactNode"},description:"Icon element rendered inside the button (required)."}},composes:["Omit"]};export{n as I};
