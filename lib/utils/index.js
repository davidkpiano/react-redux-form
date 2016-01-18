'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEventValue = exports.getValue = exports.isTouched = exports.isPristine = exports.isFocused = exports.isMulti = undefined;

var _formReducer = require('../reducers/form-reducer');

var _endsWith = require('lodash/string/endsWith');

var _endsWith2 = _interopRequireDefault(_endsWith);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function isMulti(model) {
  return (0, _endsWith2.default)(model, '[]');
}

function isFocused(field) {
  return field && field.focus;
}

function isPristine(field) {
  return field ? field.pristine : _formReducer.initialFieldState.pristine;
}

function isTouched(field) {
  return field ? field.touched : _formReducer.initialFieldState.touched;
}

function isEvent(event) {
  return !!(event && event.stopPropagation && event.preventDefault);
}

function getValue(value) {
  return isEvent(value) ? getEventValue(value) : value;
}

function getEventValue(event) {
  return event.target.multiple ? [].concat(_toConsumableArray(event.target.selectedOptions)).map(function (option) {
    return option.value;
  }) : event.target.value;
}

exports.isMulti = isMulti;
exports.isFocused = isFocused;
exports.isPristine = isPristine;
exports.isTouched = isTouched;
exports.getValue = getValue;
exports.getEventValue = getEventValue;