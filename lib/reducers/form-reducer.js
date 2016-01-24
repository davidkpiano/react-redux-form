'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialFormState = exports.initialFieldState = exports.createFormReducer = undefined;

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

// Impure function! Use only inside formReducer for temporary state.
// The form reducer is still pure; this impure side-effectful
// function is to improve performance while doing deep updates to the
// form state.
function impureSetField(state, model, props) {
  if (state.model === model) {
    return (0, _merge2.default)(state, props);
  };

  return (0, _merge2.default)(state, {
    fields: _defineProperty({}, model, _extends({}, initialFieldState, props))
  });

  return result;
}

function getField(state, field, model) {
  return (0, _get2.default)(state, ['fields', model + '.' + field], (0, _get2.default)(state, ['fields', field], initialFieldState));
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
  fields: {},
  field: function field() {
    return initialFieldState;
  }
});

function createFormReducer(model) {
  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialFormState : arguments[0];
    var action = arguments[1];

    var path = (0, _toPath2.default)(action.model);

    if (path[0] !== model) {
      return state;
    }

    var form = (0, _merge2.default)((0, _cloneDeep2.default)(state), {
      model: model,
      field: function field(_field) {
        return getField(form, _field, model);
      }
    });

    switch (action.type) {
      case actionTypes.FOCUS:
        return impureSetField(form, action.model, {
          focus: true,
          blur: false
        });

      case actionTypes.CHANGE:
      case actionTypes.SET_DIRTY:
        (0, _merge2.default)(form, {
          dirty: true,
          pristine: false
        });

        return impureSetField(form, action.model, {
          dirty: true,
          pristine: false
        });

      case actionTypes.BLUR:
      case actionTypes.SET_TOUCHED:
        return impureSetField(form, action.model, {
          touched: true,
          untouched: false,
          focus: false,
          blur: true
        });

      case actionTypes.SET_PENDING:
        return impureSetField(form, action.model, {
          pending: action.pending,
          submitted: false
        });

      case actionTypes.SET_VALIDITY:
        var errors = (0, _isPlainObject2.default)(action.validity) ? _extends({}, getField(form, action.model).errors, (0, _mapValues2.default)(action.validity, function (valid) {
          return !valid;
        })) : !action.validity;

        form = impureSetField(form, action.model, {
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
        form = impureSetField(form, action.model, {
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
        return impureSetField(form, action.model, {
          touched: false,
          untouched: true
        });

      case actionTypes.SET_SUBMITTED:
        return impureSetField(form, action.model, {
          pending: false,
          submitted: !!action.submitted
        });

      case actionTypes.SET_INITIAL:
      case actionTypes.RESET:
        return impureSetField(form, action.model, initialFieldState);

      case actionTypes.SET_VIEW_VALUE:
        return impureSetField(form, action.model, {
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