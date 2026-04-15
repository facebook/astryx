'use client';


export default function TextFontWrapperForNativeHTML() {
  return (
    <div className="xds-typography">
      <article dangerouslySetInnerHTML={{__html: markdownContent}} />
    </div>
  );
}
