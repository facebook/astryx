'use client';


const markdownContent = '# Hello\n\nSome **markdown** content.';

export default function TextFontWrapperForNativeHTML() {
  return (
    <div className="xds-typography">
      <article dangerouslySetInnerHTML={{__html: markdownContent}} />
    </div>
  );
}
