import{q as e}from"./padding.stylex-C-GcuG1E.js";import{N as t}from"./index-DfITYF77.js";import{n}from"./BlockDocContext-BenmBPJO.js";var r=e(),i=`import {useState, useEffect} from 'react';

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(\`/api/users/\${id}\`)
      .then(res => res.json())
      .then(setUser);
  }, [id]);

  return user;
}`;function a(){return(0,r.jsx)(t,{code:i,language:`typescript`,title:`useUser.ts`,hasLineNumbers:!0,hasCopyButton:!0})}function o(){return(0,r.jsx)(n,{children:(0,r.jsx)(a,{})})}export{o as default};