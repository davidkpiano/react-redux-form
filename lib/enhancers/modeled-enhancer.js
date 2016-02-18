'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createModelReducerEnhancer = exports.default = undefined;

var _modelReducer = require('../reducers/model-reducer');

var NULL_ACTION = { type: null };

function createModelReducerEnhancer() {
  var modelReducerCreator = arguments.length <= 0 || arguments[0] === undefined ? _modelReducer.createModelReducer : arguments[0];

  return function modelReducerEnhancer(reducer, model) {
    var initialState = undefined;

    try {
      initialState = reducer(undefined, NULL_ACTION);
    } catch (e) {
      initialState = null;
    }

    var modelReducer = modelReducerCreator(model, initialState);

    return function () {
      var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
      var action = arguments[1];

      var updatedState = modelReducer(state, action);

      return reducer(updatedState, action);
    };
  };
}

var modelReducerEnhancer = createModelReducerEnhancer(_modelReducer.createModelReducer);

exports.default = modelReducerEnhancer;
exports.createModelReducerEnhancer = createModelReducerEnhancer;