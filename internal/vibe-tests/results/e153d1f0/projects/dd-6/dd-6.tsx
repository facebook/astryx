import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {HoverCard, HoverCardContent, HoverCardTrigger} from '@/components/ui/hover-card';
import {Button} from '@/components/ui/button';

const MEMBERS = [
  {name: 'Alice Chen', role: 'Engineering Lead', email: 'alice@co.com', avatar: 'https://i.pravatar.cc/48?u=alice'},
  {name: 'Bob Smith', role: 'Designer', email: 'bob@co.com', avatar: 'https://i.pravatar.cc/48?u=bob'},
  {name: 'Carol Park', role: 'PM', email: 'carol@co.com', avatar: 'https://i.pravatar.cc/48?u=carol'},
];

export default function TeamMembers() {
  return (
    <div className="space-y-2 p-4">
      <h3 className="text-lg font-semibold">Team Members</h3>
      {MEMBERS.map(m => (
        <HoverCard key={m.name}>
          <HoverCardTrigger asChild><span className="font-medium cursor-pointer hover:underline">{m.name}</span></HoverCardTrigger>
          <HoverCardContent className="w-72">
            <div className="flex gap-3">
              <Avatar><AvatarImage src={m.avatar} /><AvatarFallback>{m.name[0]}</AvatarFallback></Avatar>
              <div className="space-y-1">
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-muted-foreground">{m.role}</p>
                <p className="text-sm">{m.email}</p>
                <Button size="sm" variant="outline">Message</Button>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
}
