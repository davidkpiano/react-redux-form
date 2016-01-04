import React from 'react';
import marked from 'marked';
import '../vendor/prism.js';


const Markdown = ({ content }) => <div
  dangerouslySetInnerHTML={{
    __html: marked(content)
  }} />;

export default Markdown;

export function js(string) {
  return `<pre class="language-jsx"><code class="language-jsx">${Prism.highlight(string[0].trim(), Prism.languages.jsx)}</code></pre>`;
}
