require('babel-register')({});

var jsdom = require('jsdom');
var chai = require('chai');
var chaiSubset = require('chai-subset');

chai.use(chaiSubset);

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = { userAgent: 'node.js' };
