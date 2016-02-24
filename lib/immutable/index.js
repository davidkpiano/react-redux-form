'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.modeled = exports.createModelReducer = undefined;

var _modelReducer = require('../reducers/model-reducer');

var _modeledEnhancer = require('../enhancers/modeled-enhancer');

function immutableGet(state, path, defaultValue) {
  try {
    return state.getIn(path, defaultValue);
  } catch (e) {
    throw new Error('Unable to retrieve path \'' + path.join('.') + '\' in state. Please make sure that state is an Immutable instance.');
  }
}

function immutableSet(state, path, value) {
  try {
    return state.setIn(path, value);
  } catch (e) {
    throw new Error('Unable to set path \'' + path.join('.') + '\' in state. Please make sure that state is an Immutable instance.');
  }
}

var createModelReducer = (0, _modelReducer.createModeler)(immutableGet, immutableSet);

var modelReducerEnhancer = (0, _modeledEnhancer.createModelReducerEnhancer)(createModelReducer);

exports.createModelReducer = createModelReducer;
exports.modeled = modelReducerEnhancer;