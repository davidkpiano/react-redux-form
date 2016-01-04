import React from 'react';

export default function Code({ content, className }) {
  return <pre className={className || undefined}>
    <code className="javascript hljs"
      dangerouslySetInnerHTML={{
        __html: hljs.highlight('javascript', content).value + '\n'
      }} />
  </pre>;
}
