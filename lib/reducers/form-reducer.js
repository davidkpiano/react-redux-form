'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getField = exports.initialFormState = exports.initialFieldState = exports.createFormReducer = undefined;

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _set = require('lodash/set');

var _set2 = _interopRequireDefault(_set);

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _toPath = require('lodash/toPath');

var _toPath2 = _interopRequireDefault(_toPath);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _isBoolean = require('lodash/isBoolean');

var _isBoolean2 = _interopRequireDefault(_isBoolean);

var _mapValues = require('lodash/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

var _every = require('lodash/every');

var _every2 = _interopRequireDefault(_every);

var _cloneDeep = require('lodash/cloneDeep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _actionTypes = require('../action-types');

var actionTypes = _interopRequireWildcard(_actionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function setField(state, localPath, props) {
  if (!localPath.length) {
    return (0, _merge2.default)((0, _cloneDeep2.default)(state), props);
  };

  return (0, _merge2.default)((0, _cloneDeep2.default)(state), {
    fields: _defineProperty({}, localPath.join('.'), _extends({}, initialFieldState, getField(state, localPath), props))
  });
}

function getField(state, path) {
  var localPath = (0, _toPath2.default)(path);

  return (0, _get2.default)(state, ['fields', localPath.join('.')], initialFieldState);
}

var initialFieldState = {
  viewValue: null,
  focus: false,
  blur: true,
  pristine: true,
  dirty: false,
  touched: false,
  untouched: true,
  valid: true,
  validating: false,
  pending: false,
  submitted: false,
  errors: {}
};

var initialFormState = _extends({}, initialFieldState, {
  fields: {}
});

function createInitialFormState(model) {
  return _extends({}, initialFormState, {
    model: model
  });
}

function createFormReducer(model) {
  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? createInitialFormState(model) : arguments[0];
    var action = arguments[1];

    var path = (0, _toPath2.default)(action.model);

    if (path[0] !== model) {
      return state;
    }

    var localPath = path.slice(1);

    var form = (0, _cloneDeep2.default)(state);

    switch (action.type) {
      case actionTypes.FOCUS:
        return setField(form, localPath, {
          focus: true,
          blur: false
        });

      case actionTypes.CHANGE:
      case actionTypes.SET_DIRTY:
        (0, _merge2.default)(form, {
          dirty: true,
          pristine: false
        });

        return setField(form, localPath, {
          dirty: true,
          pristine: false
        });

      case actionTypes.BLUR:
      case actionTypes.SET_TOUCHED:
        return setField(form, localPath, {
          touched: true,
          untouched: false,
          focus: false,
          blur: true
        });

      case actionTypes.SET_PENDING:
        return setField(form, localPath, {
          pending: action.pending,
          submitted: false
        });

      case actionTypes.SET_VALIDITY:
        var errors = (0, _isPlainObject2.default)(action.validity) ? _extends({}, getField(form, localPath).errors, (0, _mapValues2.default)(action.validity, function (valid) {
          return !valid;
        })) : !action.validity;

        form = setField(form, localPath, {
          errors: errors,
          valid: (0, _isBoolean2.default)(errors) ? errors : (0, _every2.default)(errors, function (error) {
            return !error;
          })
        });

        return (0, _merge2.default)(form, {
          valid: (0, _every2.default)((0, _mapValues2.default)(form.fields, function (field) {
            return field.valid;
          })) && (0, _every2.default)(form.errors, function (error) {
            return !error;
          })
        });

        break;

      case actionTypes.SET_PRISTINE:
        form = setField(form, localPath, {
          dirty: false,
          pristine: true
        });

        var formIsPristine = (0, _every2.default)((0, _mapValues2.default)(form.fields, function (field) {
          return field.pristine;
        }));

        return (0, _merge2.default)(form, {
          pristine: formIsPristine,
          dirty: !formIsPristine
        });

      case actionTypes.SET_UNTOUCHED:
        return setField(form, localPath, {
          touched: false,
          untouched: true
        });

      case actionTypes.SET_SUBMITTED:
        return setField(form, localPath, {
          pending: false,
          submitted: !!action.submitted
        });

      case actionTypes.SET_INITIAL:
      case actionTypes.RESET:
        return setField(form, localPath, initialFieldState);

      case actionTypes.SET_VIEW_VALUE:
        return setField(form, localPath, {
          viewValue: action.value
        });

      default:
        return form;
    }
  };
}

exports.createFormReducer = createFormReducer;
exports.initialFieldState = initialFieldState;
exports.initialFormState = initialFormState;
exports.getField = getField;