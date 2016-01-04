import React from 'react';
import marked from 'marked';

const Markdown = ({ content }) => <div
  dangerouslySetInnerHTML={{
    __html: marked(content)
  }} />;

export default Markdown;

export function js(string) {
  return `<pre><code class="hljs javascript">${hljs.highlight('javascript', string[0].trim()).value}</code></pre>`;
}
