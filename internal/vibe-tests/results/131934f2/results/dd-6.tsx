// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {HoverCard, HoverCardContent, HoverCardTrigger} from '@/components/ui/hover-card';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';

const members = [
  {name: 'Alice Johnson', role: 'Engineering Lead', email: 'alice@company.com', initials: 'AJ'},
  {name: 'Bob Smith', role: 'Designer', email: 'bob@company.com', initials: 'BS'},
  {name: 'Carol Williams', role: 'Product Manager', email: 'carol@company.com', initials: 'CW'},
  {name: 'Dan Brown', role: 'Developer', email: 'dan@company.com', initials: 'DB'},
];

export default function TeamMembersList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Separator />
        {members.map(member => (
          <HoverCard key={member.name}>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer">
                <Avatar>
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <Badge variant="secondary">{member.role}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <Button size="sm" variant="outline">Send Message</Button>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </CardContent>
    </Card>
  );
}
