import {useState} from 'react';
import {Dialog} from '@astryxdesign/core/Dialog';
import {DialogHeader} from '@astryxdesign/core/Dialog';
import {Layout} from '@astryxdesign/core/Layout';
import {LayoutContent} from '@astryxdesign/core/Layout';
import {LayoutFooter} from '@astryxdesign/core/Layout';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Button} from '@astryxdesign/core/Button';
import {Stack} from '@astryxdesign/core/Stack';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';

export default function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sentiment, setSentiment] = useState('neutral');

  const handleSubmit = () => {
    console.log({title, body, sentiment});
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="primary" clickAction={() => setIsOpen(true)}>
        Give Feedback
      </Button>
      <Dialog isOpen={isOpen} onOpenChange={setIsOpen} purpose="form">
        <Layout
          header={<DialogHeader title="Send Feedback" onOpenChange={setIsOpen} />}
          content={
            <LayoutContent>
              <Stack gap={3}>
                <TextInput
                  label="Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Brief summary"
                />
                <TextArea
                  label="Details"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Tell us more..."
                />
                <RadioList label="Sentiment" value={sentiment} onChange={setSentiment}>
                  <RadioListItem label="Positive" value="positive" />
                  <RadioListItem label="Neutral" value="neutral" />
                  <RadioListItem label="Negative" value="negative" />
                </RadioList>
              </Stack>
            </LayoutContent>
          }
          footer={
            <LayoutFooter hasDivider>
              <Button variant="secondary" clickAction={() => setIsOpen(false)}>Cancel</Button>
              <Button variant="primary" clickAction={handleSubmit}>Submit</Button>
            </LayoutFooter>
          }
        />
      </Dialog>
    </>
  );
}
