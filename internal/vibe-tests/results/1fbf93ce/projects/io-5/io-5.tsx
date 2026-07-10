// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useState} from 'react';

export default function SupportTicketForm() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');

  const isValid = subject.trim() !== '' && description.trim() !== '' && priority !== '';

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold">Submit a Support Ticket</h2>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue" rows={5} className="w-full rounded-md border p-2" />
      </div>
      <div className="space-y-2">
        <Label>Priority</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={!isValid}>Submit Ticket</Button>
    </form>
  );
}
