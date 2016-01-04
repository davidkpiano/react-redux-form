import React from 'react';
import marked from 'marked';

const Markdown = ({ content }) => <div
  dangerouslySetInnerHTML={{
    __html: marked(content)
  }} />;

export default Markdown;
