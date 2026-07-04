import {useState, useRef, useEffect} from 'react';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Button} from '@astryxdesign/core/Button';
import {TextArea} from '@astryxdesign/core/TextArea';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

const TERMS_TEXT = `Terms and Conditions

1. Acceptance of Terms
By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.

2. Use License
Permission is granted to temporarily use this service for personal, non-commercial transitory viewing only.

3. Disclaimer
The materials on this service are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. Limitations
In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use this service.

5. Accuracy of Materials
The materials appearing on this service could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete or current.

6. Links
We have not reviewed all of the sites linked to our service and are not responsible for the contents of any such linked site.

7. Modifications
We may revise these terms of service at any time without notice. By using this service you are agreeing to be bound by the then current version of these terms of service.

8. Governing Law
These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.`;

export default function TermsAcceptanceForm() {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 20;
      if (atBottom) setHasScrolledToBottom(true);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  if (isSubmitted) {
    return (
      <VStack gap={4} padding={4}>
        <Heading level={2}>Terms Accepted</Heading>
        <Text>Thank you for accepting the terms and conditions.</Text>
      </VStack>
    );
  }

  return (
    <VStack gap={4} padding={4}>
      <Heading level={2}>Terms and Conditions</Heading>
      <Text color="secondary">Please read and scroll through the entire document before accepting.</Text>
      <div
        ref={scrollRef}
        style={{maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 8, padding: 16}}>
        <Text as="div" style={{whiteSpace: 'pre-wrap'}}>
          {TERMS_TEXT}
        </Text>
      </div>
      {!hasScrolledToBottom && (
        <Text color="secondary" type="supporting">
          Scroll to the bottom to enable acceptance
        </Text>
      )}
      <CheckboxInput
        label="I have read and agree to the Terms and Conditions"
        value={isAccepted}
        onChange={checked => setIsAccepted(checked)}
        isDisabled={!hasScrolledToBottom}
      />
      <Button
        label="Accept and Continue"
        variant="primary"
        isDisabled={!isAccepted}
        onClick={() => setIsSubmitted(true)}
      />
    </VStack>
  );
}
