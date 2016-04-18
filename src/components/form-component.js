import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import _get from 'lodash/get';
import mapValues from 'lodash/mapValues';

import actions from '../actions';
import { getValidity, getForm } from '../utils';

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
    } = this.props;

    /* eslint-disable consistent-return */
    mapValues(validators, (validator, field) => {
      const fieldModel = [model, field].join('.');
      const value = _get(nextProps, fieldModel);

      if (!initial && (value === _get(this.props, fieldModel))) return;

      const fieldValidity = getValidity(validator, value);

      dispatch(actions.setValidity(fieldModel, fieldValidity));

      return fieldValidity;
    });

    mapValues(errors, (errorValidator, field) => {
      const fieldModel = [model, field].join('.');
      const value = _get(nextProps, fieldModel);

      if (!initial && (value === _get(this.props, fieldModel))) return;

      const fieldErrors = getValidity(errorValidator, value);

      dispatch(actions.setValidity(fieldModel, fieldErrors, {
        errors: true,
      }));

      return fieldErrors;
    });
    /* eslint-enable consistent-return */
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

    dispatch(actions.validateFields(
      model,
      validators,
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
  component: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
  ]),
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
