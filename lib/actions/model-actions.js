'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.merge = exports.remove = exports.push = exports.map = exports.filter = exports.toggle = exports.xor = exports.reset = exports.change = undefined;

var _endsWith = require('lodash/endsWith');

var _endsWith2 = _interopRequireDefault(_endsWith);

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _icepick = require('icepick');

var _icepick2 = _interopRequireDefault(_icepick);

var _actionTypes = require('../action-types');

var actionTypes = _interopRequireWildcard(_actionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function isEvent(event) {
  return !!(event && event.stopPropagation && event.preventDefault);
}

function getValue(event) {
  return isEvent(event) ? event.target.value : event;
}

function isMulti(model) {
  return (0, _endsWith2.default)(model, '[]');
}

var change = function change(model, value) {
  return {
    type: actionTypes.CHANGE,
    model: model,
    value: getValue(value),
    multi: isMulti(model)
  };
};

var xor = function xor(model, item) {
  return function (dispatch, getState) {
    var state = (0, _get2.default)(getState(), model, []);

    var stateWithoutItem = state.filter(function (stateItem) {
      return !(0, _isEqual2.default)(stateItem, item);
    });

    var value = state.length === stateWithoutItem.length ? [].concat(_toConsumableArray(state), [item]) : stateWithoutItem;

    dispatch({
      type: actionTypes.CHANGE,
      model: model,
      value: value
    });
  };
};

var push = function push(model) {
  var item = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
  return function (dispatch, getState) {
    var collection = (0, _get2.default)(getState(), model);
    var value = [].concat(_toConsumableArray(collection || []), [item]);

    dispatch({
      type: actionTypes.CHANGE,
      model: model,
      value: value
    });
  };
};

var toggle = function toggle(model) {
  return function (dispatch, getState) {
    var value = !(0, _get2.default)(getState(), model);

    dispatch({
      type: actionTypes.CHANGE,
      model: model,
      value: value
    });
  };
};

var filter = function filter(model) {
  var iteratee = arguments.length <= 1 || arguments[1] === undefined ? function (a) {
    return a;
  } : arguments[1];
  return function (dispatch, getState) {
    var collection = (0, _get2.default)(getState(), model);
    var value = collection.filter(iteratee);

    dispatch({
      type: actionTypes.CHANGE,
      model: model,
      value: value
    });
  };
};

var reset = function reset(model) {
  return {
    type: actionTypes.RESET,
    model: model
  };
};

var map = function map(model) {
  var iteratee = arguments.length <= 1 || arguments[1] === undefined ? function (a) {
    return a;
  } : arguments[1];
  return function (dispatch, getState) {
    var collection = (0, _get2.default)(getState(), model, []);
    var value = collection.map(iteratee);

    dispatch({
      type: actionTypes.CHANGE,
      model: model,
      value: value
    });
  };
};

var remove = function remove(model, index) {
  return function (dispatch, getState) {
    var collection = (0, _get2.default)(getState(), model, []);

    dispatch({
      type: actionTypes.CHANGE,
      model: model,
      value: _icepick2.default.splice(collection, index, 1)
    });
  };
};

var merge = function merge(model, values) {
  return function (dispatch, getState) {
    var value = (0, _get2.default)(getState(), model, {});

    dispatch({
      type: actionTypes.CHANGE,
      model: model,
      value: _icepick2.default.merge(value, values)
    });
  };
};

exports.change = change;
exports.reset = reset;
exports.xor = xor;
exports.toggle = toggle;
exports.filter = filter;
exports.reset = reset;
exports.map = map;
exports.push = push;
exports.remove = remove;
exports.merge = merge;