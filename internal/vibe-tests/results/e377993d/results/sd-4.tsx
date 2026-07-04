import {useState, useRef, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';

const TERMS_TEXT = `Terms and Conditions\n\n1. Acceptance of Terms...\n2. Use License...\n3. Disclaimer...\n4. Limitations...\n5. Accuracy...\n6. Links...\n7. Modifications...\n8. Governing Law...\n\nPlease read through these terms carefully before accepting.\nBy accepting, you agree to all terms described above.\nThis agreement is binding.\nThank you for your understanding.`;

export default function TermsAcceptanceForm() {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollHeight - el.scrollTop <= el.clientHeight + 20) setHasScrolledToBottom(true);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  if (isSubmitted) {
    return <div className="p-6"><h2 className="text-2xl font-bold">Terms Accepted</h2><p className="mt-2">Thank you.</p></div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Terms and Conditions</h2>
      <p className="text-gray-600">Scroll through the document before accepting.</p>
      <div ref={scrollRef} className="max-h-72 overflow-auto border rounded-lg p-4 whitespace-pre-wrap">{TERMS_TEXT}</div>
      {!hasScrolledToBottom && <p className="text-sm text-gray-500">Scroll to bottom to enable acceptance</p>}
      <div className="flex items-center gap-2">
        <Checkbox id="terms" checked={isAccepted} onCheckedChange={v => setIsAccepted(!!v)} disabled={!hasScrolledToBottom} />
        <Label htmlFor="terms">I have read and agree to the Terms and Conditions</Label>
      </div>
      <Button disabled={!isAccepted} onClick={() => setIsSubmitted(true)}>Accept and Continue</Button>
    </div>
  );
}
