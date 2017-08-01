import jsdom from 'jsdom';
import chai from 'chai';
import chaiSubset from 'chai-subset';

chai.use(chaiSubset);

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = { userAgent: 'node.js' };
global.requestAnimationFrame = () => {
  throw new Error('requestAnimationFrame is not supported in Node');
};
