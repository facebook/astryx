import {useState, useRef} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Stack';

export default function FileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setFileName(file.name);
    setUploading(true);
    setProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      await fetch('/api/upload', {method: 'POST', body: formData});
    } catch {
      // Handle error
    }
    setUploading(false);
  };

  return (
    <Stack gap={3}>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <Button
        variant="primary"
        clickAction={() => inputRef.current?.click()}
        isDisabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </Button>
      {uploading && (
        <Stack gap={1}>
          <Text color="secondary" type="supporting">{fileName}</Text>
          <ProgressBar value={progress} max={100} />
          <Text type="supporting" color="secondary">{progress}%</Text>
        </Stack>
      )}
    </Stack>
  );
}
