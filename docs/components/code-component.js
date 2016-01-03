import React from 'react';

export default function Code({ content }) {
  return <pre>
    <code className="javascript hljs" dangerouslySetInnerHTML={{
      __html: hljs.highlight('javascript', content).value
    }}>
    </code>
  </pre>;
}
