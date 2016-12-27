import _get from '../utils/get';
import mapValues from '../utils/map-values';

import actionTypes from '../action-types';
import batch from './batch-actions';
import getValidity from '../utils/get-validity';
import isValidityValid from '../utils/is-validity-valid';
import isValidityInvalid from '../utils/is-validity-invalid';
import invertValidity from '../utils/invert-validity';
import { trackable } from '../utils/track';
import getForm from '../utils/get-form';
import getFieldFromState from '../utils/get-field-from-state';
import NULL_ACTION from '../constants/null-action';
import isNative from '../utils/is-native';
import invariant from 'invariant';

const defaultStrategies = {
  get: _get,
  getForm,
  getFieldFromState,
};

function createFieldActions(s = defaultStrategies) {
  const addIntent = (model, intent) => ({
    type: actionTypes.ADD_INTENT,
    model,
    intent,
  });

  const clearIntents = (model, intents, options = {}) => ({
    type: actionTypes.CLEAR_INTENTS,
    model,
    intents,
    options,
  });

  const focus = (model, value, options = {}) => ({
    type: actionTypes.FOCUS,
    model,
    value,
    ...options,
  });

  const silentFocus = (model, value) => focus(model, value, {
    silent: true,
  });

  const blur = (model) => ({
    type: actionTypes.BLUR,
    model,
  });

  const setPristine = (model) => ({
    type: actionTypes.SET_PRISTINE,
    model,
  });

  const setDirty = (model) => ({
    type: actionTypes.SET_DIRTY,
    model,
  });

  const setInitial = (model) => ({
    type: actionTypes.SET_INITIAL,
    model,
  });

  const setPending = (model, pending = true) => ({
    type: actionTypes.SET_PENDING,
    model,
    pending,
  });

  const setValidating = (model, validating = true) => ({
    type: actionTypes.SET_VALIDATING,
    model,
    validating,
  });

  const setValidity = (model, validity, options = {}) => ({
    type: options.errors
      ? actionTypes.SET_ERRORS
      : actionTypes.SET_VALIDITY,
    model,
    ...options,
    [options.errors ? 'errors' : 'validity']: validity,
  });

  const resetValidity = (model, omitKeys = false) => ({
    type: actionTypes.RESET_VALIDITY,
    model,
    omitKeys,
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

  const resetErrors = resetValidity;

  const setTouched = (model) => ({
    type: actionTypes.SET_TOUCHED,
    model,
  });

  const setUntouched = (model) => ({
    type: actionTypes.SET_UNTOUCHED,
    model,
  });

  const asyncSetValidity = (model, validator, options = {}) => (dispatch, getState) => {
    const value = s.get(getState(), model);

    dispatch(setValidating(model, true));

    const done = (validity) => {
      dispatch(setValidity(model, validity, {
        async: true,
        ...options,
      }));
    };

    const immediateResult = validator(value, done);

    if (typeof immediateResult !== 'undefined') {
      done(immediateResult);
    }
  };

  const asyncSetErrors = (model, validator, options = {}) =>
    asyncSetValidity(model, validator, {
      errors: true,
      ...options,
    });

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

  const submit = (model, promise, options = {}) => {
    if (typeof promise === 'undefined') {
      return addIntent(model, { type: 'submit' });
    }

    return (dispatch, getState) => {
      if (options.validate) {
        const form = s.getForm(getState(), model);

        invariant(form,
          'Unable to submit form with validation. ' +
          'Could not find form for "%s" in the store.',
          model);

        if (!form.$form.valid) {
          return dispatch(NULL_ACTION);
        }

        dispatch(setPending(model, true));
      } else if (options.validators || options.errors) {
        const validators = options.validators || options.errors;
        const isErrors = options.errors;
        const value = s.get(getState(), model);
        const validity = getValidity(validators, value);
        const valid = options.errors
          ? !isValidityInvalid(validity)
          : isValidityValid(validity);

        if (!valid) {
          return dispatch(isErrors
            ? setErrors(model, validity)
            : setValidity(model, validity));
        }

        dispatch(batch(model, [
          setValidity(model, isErrors
            ? invertValidity(validity)
            : validity),
          setPending(model, true),
        ]));
      } else {
        dispatch(setPending(model, true));
      }

      const errorsAction = options.fields
        ? setFieldsErrors
        : setErrors;

      promise.then(response => {
        dispatch(batch(model, [
          setSubmitted(model, true),
          setValidity(model, response),
        ]));
      }).catch(error => {
        if (!isNative) console.error(error);

        dispatch(batch(model, [
          setSubmitFailed(model),
          errorsAction(model, error),
        ]));
      });

      return promise;
    };
  };

  const submitFields = (model, promise, options = {}) =>
    submit(model, promise, {
      ...options,
      fields: true,
    });

  const validSubmit = (model, promise, options = {}) =>
    submit(model, promise, {
      ...options,
      validate: true,
    });

  const validate = (model, validators) => (dispatch, getState) => {
    const value = s.get(getState(), model);
    const validity = getValidity(validators, value);

    dispatch(setValidity(model, validity));
  };

  const validateErrors = (model, errorValidators) => (dispatch, getState) => {
    const value = s.get(getState(), model);
    const errors = getValidity(errorValidators, value);

    dispatch(setValidity(model, errors, { errors: true }));
  };

  const validateFields =
    (model, fieldValidators, options = {}) => (dispatch, getState) => {
      const modelValue = s.get(getState(), model);

      const fieldsValidity = mapValues(fieldValidators, (validator, field) => {
        const fieldValue = field
          ? s.get(modelValue, field)
          : modelValue;

        const fieldValidity = getValidity(validator, fieldValue);

        return fieldValidity;
      });

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

  return mapValues({
    blur,
    focus,
    silentFocus,
    submit,
    submitFields,
    validSubmit,
    setDirty,
    setErrors,
    setInitial,
    setPending,
    setValidating,
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
    validate,
    validateErrors,
    validateFields,
    validateFieldsErrors,
    asyncSetValidity,
    asyncSetErrors,
    addIntent,
    clearIntents,
  }, trackable);
}

export {
  createFieldActions,
};
export default createFieldActions();
