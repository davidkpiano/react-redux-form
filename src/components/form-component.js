import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import _get from '../utils/get';
import mapValues from '../utils/map-values';
import merge from '../utils/merge';

import actions from '../actions';
import {
  getValidity,
  getForm,
  invertValidators,
  invertValidity,
} from '../utils';
import { getField } from '../reducers/form-reducer';

function dispatchValidCallback(modelValue, callback) {
  return callback
    ? () => callback(modelValue)
    : undefined;
}

function dispatchInvalidCallback(model, dispatch) {
  return () => dispatch(actions.setSubmitFailed(model));
}

class Form extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.validate(this.props, true);
  }

  componentWillReceiveProps(nextProps) {
    const { validateOn } = this.props;

    if (validateOn !== 'change') return;

    this.validate(nextProps);
  }

  validate(nextProps, initial = false) {
    const {
      validators,
      errors,
      model,
      dispatch,
      formValue,
      modelValue,
    } = this.props;

    if (!validators && !errors && (modelValue !== nextProps.modelValue)) {
      dispatch(actions.setValidity(model, true));
      return;
    }

    let validityChanged = false;

    const fieldsValidity = mapValues(validators, (validator, field) => {
      const fieldModel = [model, field].join('.');
      const value = _get(nextProps, fieldModel);

      if (!initial && (value === _get(this.props, fieldModel))) {
        return getField(formValue, field).validity;
      }

      validityChanged = true;

      const fieldValidity = getValidity(validator, value);

      return fieldValidity;
    });

    const fieldsErrorsValidity = mapValues(errors, (errorValidator, field) => {
      const fieldModel = [model, field].join('.');
      const value = _get(nextProps, fieldModel);

      if (!initial && (value === _get(this.props, fieldModel))) {
        return getField(formValue, field).errors;
      }

      validityChanged = true;

      const fieldErrors = getValidity(errorValidator, value);

      return fieldErrors;
    });

    if (validityChanged) {
      dispatch(actions.setFieldsErrors(model, merge(
        invertValidity(fieldsValidity),
        fieldsErrorsValidity
      )));
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const {
      model,
      modelValue,
      formValue,
      onSubmit,
      dispatch,
      validators,
      errors: errorValidators,
    } = this.props;

    const formValid = formValue
      ? formValue.valid
      : true;

    if (!validators && onSubmit && formValid) {
      onSubmit(modelValue);

      return modelValue;
    }

    const validationOptions = {
      onValid: dispatchValidCallback(modelValue, onSubmit),
      onInvalid: dispatchInvalidCallback(model, dispatch),
    };

    const finalErrorValidators = validators
      ? merge(invertValidators(validators), errorValidators)
      : errorValidators;

    dispatch(actions.validateFieldsErrors(
      model,
      finalErrorValidators,
      validationOptions));

    return modelValue;
  }

  render() {
    const { component, children, ...other } = this.props;
    return React.createElement(component,
      {
        ...other,
        onSubmit: this.handleSubmit,
      }, children);
  }
}

Form.propTypes = {
  component: PropTypes.any,
  validators: PropTypes.object,
  errors: PropTypes.object,
  validateOn: PropTypes.oneOf([
    'change',
    'submit',
  ]),
  model: PropTypes.string.isRequired,
  modelValue: PropTypes.any,
  formValue: PropTypes.object,
  onSubmit: PropTypes.func,
  dispatch: PropTypes.func,
  children: PropTypes.node,
};

Form.defaultProps = {
  validateOn: 'change',
  component: 'form',
};

function selector(state, { model }) {
  const modelString = typeof model === 'function'
    ? model(state)
    : model;

  return {
    ...state,
    modelValue: _get(state, modelString),
    formValue: getForm(state, modelString),
  };
}

export default connect(selector)(Form);
