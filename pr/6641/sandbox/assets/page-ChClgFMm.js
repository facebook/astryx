import{q as e}from"./padding.stylex-Dhh1fYrP.js";import{N as t}from"./index-BRIajt5P.js";import{n}from"./BlockDocContext-DEnBEmxw.js";var r=e(),i=`import {useState, useEffect} from 'react';

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(\`/api/users/\${id}\`)
      .then(res => res.json())
      .then(setUser);
  }, [id]);

  return user;
}`;function a(){return(0,r.jsx)(t,{code:i,language:`typescript`,title:`useUser.ts`,hasLineNumbers:!0,hasCopyButton:!0})}function o(){return(0,r.jsx)(n,{children:(0,r.jsx)(a,{})})}export{o as default};