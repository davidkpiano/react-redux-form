import React from 'react';
import marked from 'marked';

const Markdown = ({ content }) => <div
  className="rsf-layout-content"
  dangerouslySetInnerHTML={{
    __html: marked(content)
  }} />;

export default Markdown;
