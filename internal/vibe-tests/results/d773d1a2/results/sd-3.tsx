import {Card, Button, TextInput, VStack, Heading} from '@astryxdesign/core';
import {useState} from 'react';

export default function ValidatedForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValid = name.trim() !== '' && email.includes('@') && password.length >= 8;

  const handleSubmit = () => {
    if (isValid) alert('Form submitted!');
  };

  return (
    <Card padding={4} width={400}>
      <VStack gap={3}>
        <Heading level={3}>Sign Up</Heading>
        <TextInput label="Name" value={name} onChange={setName} isRequired status={name === '' ? undefined : {type: 'success'}} />
        <TextInput label="Email" value={email} onChange={setEmail} isRequired status={email && !email.includes('@') ? {type: 'error', message: 'Invalid email'} : undefined} />
        <TextInput label="Password" value={password} onChange={setPassword} isRequired status={password && password.length < 8 ? {type: 'error', message: 'Min 8 characters'} : undefined} />
        <Button label="Submit" variant="primary" isDisabled={!isValid} onPress={handleSubmit} />
      </VStack>
    </Card>
  );
}
