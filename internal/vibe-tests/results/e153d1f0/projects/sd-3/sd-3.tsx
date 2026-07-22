import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useState} from 'react';

export default function ValidatedForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValid = name.trim() !== '' && email.includes('@') && password.length >= 8;

  return (
    <Card className="w-[400px]">
      <CardHeader><CardTitle>Sign Up</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div><Label>Name *</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
        <div><Label>Email *</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><Label>Password *</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} />{password && password.length < 8 && <p className="text-sm text-destructive mt-1">Min 8 characters</p>}</div>
        <Button disabled={!isValid}>Submit</Button>
      </CardContent>
    </Card>
  );
}
