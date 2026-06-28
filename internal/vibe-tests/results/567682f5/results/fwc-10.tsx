// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

const initialMembers: TeamMember[] = [
  {id: '1', name: 'Alice Chen', email: 'alice@example.com', role: 'Editor'},
  {id: '2', name: 'Bob Martinez', email: 'bob@example.com', role: 'Viewer'},
  {id: '3', name: 'Carol Johnson', email: 'carol@example.com', role: 'Admin'},
  {id: '4', name: 'Dan Williams', email: 'dan@example.com', role: 'Viewer'},
];

export default function UserRoleAssignment() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);

  function handleRoleChange(memberId: string, newRole: string) {
    setMembers(prev =>
      prev.map(m => (m.id === memberId ? {...m, role: newRole} : m)),
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Team Role Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map(member => (
          <div key={member.id} className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </div>
            <Select value={member.role} onValueChange={(v) => handleRoleChange(member.id, v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Viewer">Viewer</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
