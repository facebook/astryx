import {useState, useRef, useEffect} from 'react';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Button} from '@astryxdesign/core/Button';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

const TERMS_TEXT = `Terms and Conditions\n\n1. Acceptance of Terms\nBy accessing and using this service, you accept and agree to be bound by the terms.\n\n2. Use License\nPermission is granted to temporarily use this service for personal use.\n\n3. Disclaimer\nThe materials are provided on an 'as is' basis with no warranties.\n\n4. Limitations\nIn no event shall we be liable for any damages.\n\n5. Accuracy\nThe materials could include technical errors.\n\n6. Links\nWe have not reviewed all linked sites.\n\n7. Modifications\nWe may revise these terms at any time.\n\n8. Governing Law\nThese terms are governed by applicable law.`;

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
    return (
      <div className="p-6 space-y-4">
        <Heading level={2}>Terms Accepted</Heading>
        <Text>Thank you for accepting the terms and conditions.</Text>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <Heading level={2}>Terms and Conditions</Heading>
      <Text color="secondary">Please read and scroll through the entire document.</Text>
      <div ref={scrollRef} className="max-h-72 overflow-auto border rounded-lg p-4">
        <Text as="div">{TERMS_TEXT}</Text>
      </div>
      {!hasScrolledToBottom && <Text type="supporting" color="secondary">Scroll to the bottom to enable acceptance</Text>}
      <CheckboxInput
        label="I have read and agree to the Terms and Conditions"
        value={isAccepted}
        onChange={checked => setIsAccepted(checked)}
        isDisabled={!hasScrolledToBottom}
      />
      <Button label="Accept and Continue" variant="primary" isDisabled={!isAccepted} onClick={() => setIsSubmitted(true)} />
    </div>
  );
}
