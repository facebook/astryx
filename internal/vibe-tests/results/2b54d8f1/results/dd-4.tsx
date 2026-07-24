// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

export function UserProfile() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold">User Profile</h1>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">Jane Doe</h2>
              <p className="text-muted-foreground">Software Engineer</p>
              <p className="text-muted-foreground">San Francisco, CA</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-4">
              <p className="font-semibold mb-1">Bio</p>
              <p>Full-stack engineer passionate about building great user experiences.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="mt-4 flex flex-col gap-3">
          {[
            {action: 'Merged PR #142', time: '2 hours ago'},
            {action: 'Commented on issue #89', time: '5 hours ago'},
            {action: 'Created branch feat/new-feature', time: '1 day ago'},
          ].map((activity, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex justify-between items-center">
                <p>{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="settings" className="mt-4 max-w-md flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Display Name</Label>
            <Input defaultValue="Jane Doe" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input defaultValue="jane@example.com" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Location</Label>
            <Input defaultValue="San Francisco, CA" />
          </div>
          <Button>Save Changes</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UserProfile;
