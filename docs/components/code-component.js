import React from 'react';
import '../vendor/prism.js';

export default function Code({ content, className }) {
  return <pre className="language-jsx">
    <code className="language-jsx"
      dangerouslySetInnerHTML={{
        __html: hljs.highlight('javascript', content).value + '\n'
      }} />
  </pre>;
}
