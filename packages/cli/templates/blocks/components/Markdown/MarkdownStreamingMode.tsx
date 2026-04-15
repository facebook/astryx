'use client';

import {useState, useEffect} from 'react';
import {XDSMarkdown} from '@xds/core/Markdown';

const fullText =
  '# Streaming\n\nThis text appears **chunk by chunk** with a smooth fade-in animation.\n\n- First item\n- Second item';

export default function MarkdownStreamingMode() {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setText(fullText.slice(0, i + 1));
        i++;
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return <XDSMarkdown isStreaming={isStreaming}>{text}</XDSMarkdown>;
}
