import _get from 'lodash/get';
import map from 'lodash/map';

import batchActions from './batch-actions';
import actionTypes from '../action-types';
import { getValidity, getForm } from '../utils';

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

const setValidity = (model, validity) => ({
  type: actionTypes.SET_VALIDITY,
  model,
  validity,
});

const setErrors = (model, errors) => ({
  type: actionTypes.SET_ERRORS,
  model,
  errors,
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

const setSubmitFailed = (model) => ({
  type: actionTypes.SET_SUBMIT_FAILED,
  model,
});


const setViewValue = (model, value) => ({
  type: actionTypes.SET_VIEW_VALUE,
  model,
  value,
});

const submit = (model, promise) => dispatch => {
  dispatch(setPending(model, true));

  promise.then(response => {
    dispatch(setSubmitted(model, true));
    dispatch(setValidity(model, response));
  }).catch(error => {
    dispatch(setSubmitFailed(model));
    dispatch(setErrors(model, error));
  });
};

const validate = (model, validators) => (dispatch, getState) => {
  const value = _get(getState(), model);
  const validity = getValidity(validators, value);

  dispatch(setValidity(model, validity));
};

const validateErrors = (model, errorValidators) => (dispatch, getState) => {
  const value = _get(getState(), model);
  const errors = getValidity(errorValidators, value);

  dispatch(setErrors(model, errors));
};

const validateFields = (model, fieldValidators, callback) => (dispatch, getState) => {
  const value = _get(getState(), model);

  const validationActions = map(fieldValidators, (validator, field) => {
    const fieldModel = field
      ? [model, field].join('.')
      : model;
    const fieldValue = field
      ? _get(value, field)
      : value;

    const fieldValidity = getValidity(validator, fieldValue);

    return setValidity(fieldModel, fieldValidity);
  });

  if (callback) {
    validationActions.push((_, _getState) => {
      const form = getForm(_getState(), model);

      if (form && form.valid) {
        callback();
      }
    });
  }

  dispatch(batchActions.batch(model, validationActions));
};

export default {
  asyncSetValidity,
  blur,
  focus,
  submit,
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
  resetValidity,
  resetErrors,
  setViewValue,
  validate,
  validateErrors,
  validateFields,
};
