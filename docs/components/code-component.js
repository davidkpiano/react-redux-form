import React from 'react';
import '../vendor/prism.js';

export default function Code({ content, className }) {
  return <pre className={`language-jsx ${className || ''}`}>
    <code className="language-jsx"
      dangerouslySetInnerHTML={{
        __html: Prism.highlight(content.trim(), Prism.languages.jsx) + '\n'
      }} />
  </pre>;
}
