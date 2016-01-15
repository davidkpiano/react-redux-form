'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialFieldState = exports.actionTypes = exports.getField = exports.Form = exports.Field = exports.actions = exports.createFormReducer = exports.createModelReducer = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _modelReducer = require('./reducers/model-reducer');

var _formReducer = require('./reducers/form-reducer');

var _utils = require('./utils');

var _modelActions = require('./actions/model-actions');

var modelActions = _interopRequireWildcard(_modelActions);

var _fieldActions = require('./actions/field-actions');

var fieldActions = _interopRequireWildcard(_fieldActions);

var _fieldComponent = require('./components/field-component');

var _fieldComponent2 = _interopRequireDefault(_fieldComponent);

var _formComponent = require('./components/form-component');

var _formComponent2 = _interopRequireDefault(_formComponent);

var _actionTypes = require('./action-types');

var _actionTypes2 = _interopRequireDefault(_actionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var actions = _extends({}, modelActions, fieldActions);

exports.createModelReducer = _modelReducer.createModelReducer;
exports.createFormReducer = _formReducer.createFormReducer;
exports.actions = actions;
exports.Field = _fieldComponent2.default;
exports.Form = _formComponent2.default;
exports.getField = _formReducer.getField;
exports.actionTypes = _actionTypes2.default;
exports.initialFieldState = _formReducer.initialFieldState;