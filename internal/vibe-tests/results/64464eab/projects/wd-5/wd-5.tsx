import {useState} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';

export default function FeedbackDialog() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sentiment, setSentiment] = useState('neutral');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Give Feedback</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief summary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Details</Label>
            <Textarea id="body" value={body} onChange={e => setBody(e.target.value)} placeholder="Tell us more..." />
          </div>
          <div className="space-y-2">
            <Label>Sentiment</Label>
            <div className="flex gap-2">
              {(['positive', 'neutral', 'negative'] as const).map(s => (
                <Button
                  key={s}
                  variant={sentiment === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSentiment(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button onClick={() => console.log({title, body, sentiment})}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
