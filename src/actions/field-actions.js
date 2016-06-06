import _get from '../utils/get';
import mapValues from '../utils/map-values';

import actionTypes from '../action-types';
import batchActions from './batch-actions';
import { getValidity, getForm, isValid, isInvalid } from '../utils';

const focus = model => ({
  type: actionTypes.FOCUS,
  model,
});

const blur = model => ({
  type: actionTypes.BLUR,
  model,
});

const setPristine = model => ({
  type: actionTypes.SET_PRISTINE,
  model,
});

const setDirty = model => ({
  type: actionTypes.SET_DIRTY,
  model,
});

const setInitial = model => ({
  type: actionTypes.SET_INITIAL,
  model,
});

const setPending = (model, pending = true) => ({
  type: actionTypes.SET_PENDING,
  model,
  pending,
});

const setValidity = (model, validity, options = {}) => ({
  type: options.errors
    ? actionTypes.SET_ERRORS
    : actionTypes.SET_VALIDITY,
  model,
  [options.errors ? 'errors' : 'validity']: validity,
});

const setFieldsValidity = (model, fieldsValidity, options = {}) => ({
  type: actionTypes.SET_FIELDS_VALIDITY,
  model,
  fieldsValidity,
  options,
});

const setErrors = (model, errors, options = {}) =>
  setValidity(model, errors, {
    ...options,
    errors: true,
  });

const setFieldsErrors = (model, fieldsErrors, options) =>
  setFieldsValidity(model, fieldsErrors, {
    ...options,
    errors: true,
  });

const resetValidity = (model) => ({
  type: actionTypes.RESET_VALIDITY,
  model,
});

const resetErrors = resetValidity;

const setTouched = model => ({
  type: actionTypes.SET_TOUCHED,
  model,
});

const setUntouched = model => ({
  type: actionTypes.SET_UNTOUCHED,
  model,
});

const asyncSetValidity = (model, validator) => (dispatch, getState) => {
  const value = _get(getState(), model);

  dispatch(setPending(model, true));

  const done = validity => {
    dispatch(setValidity(model, validity));
    dispatch(setPending(model, false));
  };

  const immediateResult = validator(value, done);

  if (typeof immediateResult !== 'undefined') {
    done(immediateResult);
  }
};

const setSubmitted = (model, submitted = true) => ({
  type: actionTypes.SET_SUBMITTED,
  model,
  submitted,
});

const setSubmitFailed = (model, submitFailed = true) => ({
  type: actionTypes.SET_SUBMIT_FAILED,
  model,
  submitFailed,
});


const setViewValue = (model, value) => ({
  type: actionTypes.SET_VIEW_VALUE,
  model,
  value,
});

const submit = (model, promise, options = {}) => dispatch => {
  dispatch(setPending(model, true));

  const errorsAction = options.fields
    ? setFieldsErrors
    : setErrors;

  promise.then(response => {
    dispatch(batchActions.batch(model, [
      setSubmitted(model, true),
      setValidity(model, response),
    ]));
  }).catch(error => {
    dispatch(batchActions.batch(model, [
      setSubmitFailed(model),
      errorsAction(model, error),
    ]));
  });

  return promise;
};

const submitFields = (model, promise, options = {}) =>
  submit(model, promise, {
    ...options,
    fields: true,
  });

const validate = (model, validators) => (dispatch, getState) => {
  const value = _get(getState(), model);
  const validity = getValidity(validators, value);

  dispatch(setValidity(model, validity));
};

const validateErrors = (model, errorValidators) => (dispatch, getState) => {
  const value = _get(getState(), model);
  const errors = getValidity(errorValidators, value);

  dispatch(setValidity(model, errors, { errors: true }));
};

const validateFields = (model, fieldValidators, options = {}) => (dispatch, getState) => {
  const value = _get(getState(), model);

  const fieldsValidity = mapValues(fieldValidators, (validator, field) => {
    const fieldValue = field
      ? _get(value, field)
      : value;

    const fieldValidity = getValidity(validator, fieldValue);

    return fieldValidity;
  });

  const validCB = options.onValid;
  const invalidCB = options.onInvalid;

  if (validCB || invalidCB) {
    const form = getForm(getState(), model);
    const formValid = (form && !fieldsValidity.hasOwnProperty(''))
      ? form.valid
      : true;
    const fieldsValid = options.errors
      ? !isInvalid(fieldsValidity)
      : isValid(fieldsValidity);

    if (validCB && formValid && fieldsValid) {
      validCB();
    } else if (invalidCB) {
      invalidCB();
    }
  }

  const fieldsValiditySetter = options.errors
    ? setFieldsErrors
    : setFieldsValidity;

  dispatch(fieldsValiditySetter(model, fieldsValidity));
};

const validateFieldsErrors = (model, fieldErrorsValidators, options = {}) =>
  validateFields(model, fieldErrorsValidators, {
    ...options,
    errors: true,
  });

export default {
  asyncSetValidity,
  blur,
  focus,
  submit,
  submitFields,
  setDirty,
  setErrors,
  setInitial,
  setPending,
  setPristine,
  setSubmitted,
  setSubmitFailed,
  setTouched,
  setUntouched,
  setValidity,
  setFieldsValidity,
  setFieldsErrors,
  resetValidity,
  resetErrors,
  setViewValue,
  validate,
  validateErrors,
  validateFields,
  validateFieldsErrors,
};
