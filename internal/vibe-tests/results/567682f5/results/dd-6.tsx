// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {HoverCard, HoverCardContent, HoverCardTrigger} from '@/components/ui/hover-card';
import {Separator} from '@/components/ui/separator';

interface Member {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  joinedAt: string;
}

const members: Member[] = [
  {id: '1', name: 'Sarah Lee', role: 'Engineering Lead', department: 'Frontend', email: 'sarah@example.com', joinedAt: '2022-03-15'},
  {id: '2', name: 'Marcus Chen', role: 'Senior Designer', department: 'Design', email: 'marcus@example.com', joinedAt: '2021-08-01'},
  {id: '3', name: 'Priya Patel', role: 'Product Manager', department: 'Product', email: 'priya@example.com', joinedAt: '2023-01-10'},
  {id: '4', name: 'James Wilson', role: 'Backend Engineer', department: 'Infrastructure', email: 'james@example.com', joinedAt: '2022-11-20'},
];

export default function TeamMembersList() {
  return (
    <Card className="w-full max-w-lg">
      <CardContent className="pt-6 space-y-2">
        <h2 className="text-xl font-bold mb-4">Team Members</h2>
        {members.map(member => (
          <HoverCard key={member.id}>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">{member.name}</span>
                <Badge variant="secondary" className="ml-auto">{member.department}</Badge>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Email: {member.email}</p>
                  <p>Department: {member.department}</p>
                  <p>Joined: {new Date(member.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </CardContent>
    </Card>
  );
}
