'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _modelReducer = require('../reducers/model-reducer');

var NULL_ACTION = { type: null };

function modeled(reducer, model) {
  var initialState = undefined;
  try {
    initialState = reducer(undefined, NULL_ACTION);
  } catch (e) {
    initialState = null;
  }

  var modelReducer = (0, _modelReducer.createModelReducer)(model, initialState);

  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
    var action = arguments[1];

    var updatedState = modelReducer(state, action);

    return reducer(updatedState, action);
  };
}

exports.default = modeled;