'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.modeled = exports.initialFieldState = exports.actionTypes = exports.getField = exports.Form = exports.Field = exports.actions = exports.createFieldClass = exports.createFormReducer = exports.createModelReducer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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

var actionTypes = _interopRequireWildcard(_actionTypes);

var _modeledEnhancer = require('./enhancers/modeled-enhancer');

var _modeledEnhancer2 = _interopRequireDefault(_modeledEnhancer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var actions = _extends({}, modelActions, fieldActions);

exports.createModelReducer = _modelReducer.createModelReducer;
exports.createFormReducer = _formReducer.createFormReducer;
exports.createFieldClass = _fieldComponent.createFieldClass;
exports.actions = actions;
exports.Field = _fieldComponent2.default;
exports.Form = _formComponent2.default;
exports.getField = _formReducer.getField;
exports.actionTypes = actionTypes;
exports.initialFieldState = _formReducer.initialFieldState;
exports.modeled = _modeledEnhancer2.default;