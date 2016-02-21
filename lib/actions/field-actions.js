'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setViewValue = exports.setUntouched = exports.setTouched = exports.setSubmitted = exports.setPending = exports.asyncSetValidity = exports.setErrors = exports.setValidity = exports.setInitial = exports.setDirty = exports.setPristine = exports.validate = exports.blur = exports.focus = undefined;

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _actionTypes = require('../action-types');

var actionTypes = _interopRequireWildcard(_actionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var focus = function focus(model) {
  return {
    type: actionTypes.FOCUS,
    model: model
  };
};

var blur = function blur(model) {
  return {
    type: actionTypes.BLUR,
    model: model
  };
};

var validate = function validate(model) {
  return {
    type: actionTypes.VALIDATE,
    model: model
  };
};

var setPristine = function setPristine(model) {
  return {
    type: actionTypes.SET_PRISTINE,
    model: model
  };
};

var setDirty = function setDirty(model) {
  return {
    type: actionTypes.SET_DIRTY,
    model: model
  };
};

var setInitial = function setInitial(model) {
  return {
    type: actionTypes.SET_INITIAL,
    model: model
  };
};

var setPending = function setPending(model) {
  var pending = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
  return {
    type: actionTypes.SET_PENDING,
    model: model,
    pending: pending
  };
};

var setValidity = function setValidity(model, validity) {
  return {
    type: actionTypes.SET_VALIDITY,
    model: model,
    validity: validity
  };
};

var setErrors = function setErrors(model, errors) {
  return {
    type: actionTypes.SET_ERRORS,
    model: model,
    errors: errors
  };
};

var setTouched = function setTouched(model) {
  return {
    type: actionTypes.SET_TOUCHED,
    model: model
  };
};

var setUntouched = function setUntouched(model) {
  return {
    type: actionTypes.SET_UNTOUCHED,
    model: model
  };
};

var asyncSetValidity = function asyncSetValidity(model, validator) {
  return function (dispatch, getState) {
    var value = (0, _get2.default)(getState(), model);

    dispatch(setPending(model, true));

    var done = function done(validity) {
      dispatch(setValidity(model, validity));
      dispatch(setPending(model, false));
    };

    var immediateResult = validator(value, done);

    if (typeof immediateResult !== 'undefined') {
      done(immediateResult);
    }
  };
};

var setSubmitted = function setSubmitted(model) {
  var submitted = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
  return {
    type: actionTypes.SET_SUBMITTED,
    model: model,
    submitted: submitted
  };
};

var setViewValue = function setViewValue(model, value) {
  return {
    type: actionTypes.SET_VIEW_VALUE,
    model: model,
    value: value
  };
};

exports.focus = focus;
exports.blur = blur;
exports.validate = validate;
exports.setPristine = setPristine;
exports.setDirty = setDirty;
exports.setInitial = setInitial;
exports.setValidity = setValidity;
exports.setErrors = setErrors;
exports.asyncSetValidity = asyncSetValidity;
exports.setPending = setPending;
exports.setSubmitted = setSubmitted;
exports.setTouched = setTouched;
exports.setUntouched = setUntouched;
exports.setViewValue = setViewValue;