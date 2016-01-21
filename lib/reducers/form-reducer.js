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

var _startsWith = require('lodash/startsWith');

var _startsWith2 = _interopRequireDefault(_startsWith);

var _cloneDeep = require('lodash/cloneDeep');

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _isPlainObject = require('lodash/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _isBoolean = require('lodash/isBoolean');

var _isBoolean2 = _interopRequireDefault(_isBoolean);

var _mapValues = require('lodash/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

var _every = require('lodash/every');

var _every2 = _interopRequireDefault(_every);

var _actionTypes = require('../action-types');

var actionTypes = _interopRequireWildcard(_actionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setField(state, model, props) {
  if (state.model === model) {
    return Object.assign(state, props);
  };

  return (0, _set2.default)(state, ['fields', model], _extends({}, initialFieldState, (0, _get2.default)(state, ['fields', model]), props));
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

    if (!(0, _startsWith2.default)(action.model, model)) {
      return state;
    }

    console.log(action);

    var form = (0, _cloneDeep2.default)(_extends({}, state, {
      model: model
    }));

    switch (action.type) {
      case actionTypes.FOCUS:
        setField(form, action.model, {
          focus: true,
          blur: false
        });

        break;

      case actionTypes.CHANGE:
      case actionTypes.SET_DIRTY:
        setField(form, action.model, {
          dirty: true,
          pristine: false
        });

        Object.assign(form, {
          dirty: true,
          pristine: false
        });

        break;

      case actionTypes.BLUR:
      case actionTypes.SET_TOUCHED:
        setField(form, action.model, {
          touched: true,
          untouched: false,
          focus: false,
          blur: true
        });

        break;

      case actionTypes.SET_PENDING:
        setField(form, action.model, {
          pending: action.pending,
          submitted: false
        });

        break;

      case actionTypes.SET_VALIDITY:
        var errors = (0, _isPlainObject2.default)(action.validity) ? _extends({}, getField(form, action.model).errors, (0, _mapValues2.default)(action.validity, function (valid) {
          return !valid;
        })) : !action.validity;

        setField(form, action.model, {
          errors: errors,
          valid: (0, _isBoolean2.default)(errors) ? errors : (0, _every2.default)(errors, function (error) {
            return !error;
          })
        });

        Object.assign(form, {
          valid: (0, _every2.default)((0, _mapValues2.default)(form.fields, function (field) {
            return field.valid;
          })) && (0, _every2.default)(form.errors, function (error) {
            return !error;
          })
        });

        break;

      case actionTypes.SET_PRISTINE:
        setField(form, action.model, {
          dirty: false,
          pristine: true
        });

        var formIsPristine = (0, _every2.default)((0, _mapValues2.default)(form.fields, function (field) {
          return field.pristine;
        }));

        Object.assign(form, {
          pristine: formIsPristine,
          dirty: !formIsPristine
        });

        break;

      case actionTypes.SET_UNTOUCHED:
        setField(form, action.model, {
          touched: false,
          untouched: true
        });

        break;

      case actionTypes.SET_SUBMITTED:
        setField(form, action.model, {
          submitted: !!action.submitted
        });

        break;

      case actionTypes.SET_INITIAL:
      case actionTypes.RESET:
        setField(form, action.model, initialFieldState);

        break;

      case actionTypes.SET_VIEW_VALUE:
        setField(form, action.model, {
          viewValue: action.value
        });

      default:
        break;
    }

    return _extends({}, form, {
      field: function field(_field) {
        return getField(form, _field, model);
      }
    });
  };
}

exports.createFormReducer = createFormReducer;
exports.initialFieldState = initialFieldState;
exports.initialFormState = initialFormState;