import{q as e}from"./padding.stylex-C-GcuG1E.js";import{N as t}from"./index-CpT1PPxS.js";import{t as n}from"./BlockDocContext-CUugPPEq.js";var r=e(),i=`interface User {
  id: string;
  name: string;
}

export function useUser(id: string) {
  const [user, setUser] = useState<User>();
  useEffect(() => {
    fetchUser(id).then(setUser);
  }, [id]);
  return user;
}`;function a(){return(0,r.jsx)(t,{code:i,language:`typescript`,title:`useUser.ts`,hasLineNumbers:!0,highlightLines:[8,9,10]})}var o={type:`block`,exampleFor:`CodeBlock`,name:`Code — Highlighted`,displayName:`Code — Highlighted`,description:`TypeScript code with specific lines highlighted to draw attention to a key section. Use highlightLines to call out new or important code in tutorials and changelogs.`,isReady:!0,aspectRatio:4/3,componentsUsed:[`CodeBlock`]};function s(){return(0,r.jsx)(n,{meta:{aspectRatio:o.aspectRatio??4/3,scale:o.scale??1},children:(0,r.jsx)(a,{})})}export{s as default};