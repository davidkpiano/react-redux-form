'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getField = exports.initialFormState = exports.initialFieldState = exports.createFormReducer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _every = require('lodash/every');

var _every2 = _interopRequireDefault(_every);

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _icepick = require('icepick');

var _icepick2 = _interopRequireDefault(_icepick);

var _isBoolean = require('lodash/isBoolean');

var _isBoolean2 = _interopRequireDefault(_isBoolean);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _mapValues = require('lodash/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

var _toPath = require('lodash/toPath');

var _toPath2 = _interopRequireDefault(_toPath);

var _actionTypes = require('../action-types');

var actionTypes = _interopRequireWildcard(_actionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function setField(state, localPath, props) {
  if (!localPath.length) {
    return _icepick2.default.merge(state, props);
  }

  return _icepick2.default.merge(state, {
    fields: _defineProperty({}, localPath.join('.'), _extends({}, getField(state, localPath), props))
  });
}

function resetField(state, localPath) {
  if (!localPath.length) {
    return initialFormState;
  }

  return _icepick2.default.setIn(state, ['fields', localPath.join('.')], initialFieldState);
}

function getField(state, path) {
  if (!(0, _isPlainObject2.default)(state) || !state.fields) {
    throw new Error('Error when trying to retrieve field \'' + path + '\' from an invalid/empty form state. Must pass in a valid form state as the first argument.');
  }

  var localPath = (0, _toPath2.default)(path);

  if (!localPath.length) {
    return state;
  }

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
  var modelPath = (0, _toPath2.default)(model);

  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? createInitialFormState(model) : arguments[0];
    var action = arguments[1];

    if (!action.model) return state;

    var path = (0, _toPath2.default)(action.model);

    if (!(0, _isEqual2.default)(path.slice(0, modelPath.length), modelPath)) {
      return state;
    }

    var localPath = path.slice(modelPath.length);

    switch (action.type) {
      case actionTypes.FOCUS:
        return setField(state, localPath, {
          focus: true,
          blur: false
        });

      case actionTypes.CHANGE:
      case actionTypes.SET_DIRTY:
        state = _icepick2.default.merge(state, {
          dirty: true,
          pristine: false
        });

        return setField(state, localPath, {
          dirty: true,
          pristine: false
        });

      case actionTypes.BLUR:
      case actionTypes.SET_TOUCHED:
        return setField(state, localPath, {
          touched: true,
          untouched: false,
          focus: false,
          blur: true
        });

      case actionTypes.SET_PENDING:
        return setField(state, localPath, {
          pending: action.pending,
          submitted: false
        });

      case actionTypes.SET_VALIDITY:
        var errors = (0, _isPlainObject2.default)(action.validity) ? _extends({}, getField(state, localPath).errors, (0, _mapValues2.default)(action.validity, function (valid) {
          return !valid;
        })) : !action.validity;

        state = setField(state, localPath, {
          errors: errors,
          valid: (0, _isBoolean2.default)(errors) ? errors : (0, _every2.default)(errors, function (error) {
            return !error;
          })
        });

        return _icepick2.default.merge(state, {
          valid: (0, _every2.default)((0, _mapValues2.default)(state.fields, function (field) {
            return field.valid;
          })) && (0, _every2.default)(state.errors, function (error) {
            return !error;
          })
        });

      case actionTypes.SET_PRISTINE:
        state = setField(state, localPath, {
          dirty: false,
          pristine: true
        });

        var formIsPristine = (0, _every2.default)((0, _mapValues2.default)(state.fields, function (field) {
          return field.pristine;
        }));

        return _icepick2.default.merge(state, {
          pristine: formIsPristine,
          dirty: !formIsPristine
        });

      case actionTypes.SET_UNTOUCHED:
        return setField(state, localPath, {
          touched: false,
          untouched: true
        });

      case actionTypes.SET_SUBMITTED:
        return setField(state, localPath, {
          pending: false,
          submitted: !!action.submitted
        });

      case actionTypes.SET_INITIAL:
      case actionTypes.RESET:
        return resetField(state, localPath);

      case actionTypes.SET_VIEW_VALUE:
        return setField(state, localPath, {
          viewValue: action.value
        });

      default:
        return state;
    }
  };
}

exports.createFormReducer = createFormReducer;
exports.initialFieldState = initialFieldState;
exports.initialFormState = initialFormState;
exports.getField = getField;