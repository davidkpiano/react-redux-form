import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import shallowEqual from '../utils/shallow-equal';
import _get from '../utils/get';
import mapValues from '../utils/map-values';
import merge from '../utils/merge';
import identity from 'lodash/identity';
import omit from 'lodash/omit';

import actions from '../actions';
import getValidity from '../utils/get-validity';
import invertValidity from '../utils/invert-validity';
import invertValidators from '../utils/invert-validators';
import getForm from '../utils/get-form';
import getModel from '../utils/get-model';
import getField from '../utils/get-field';
import { fieldsValid } from '../form/is-valid';
import deepCompareChildren from '../utils/deep-compare-children';

const propTypes = {
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

const defaultStrategy = {
  get: _get,
  getForm,
  actions,
};

function createFormClass(s = defaultStrategy) {
  class Form extends Component {
    constructor(props) {
      super(props);

      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleReset = this.handleReset.bind(this);
      this.handleValidSubmit = this.handleValidSubmit.bind(this);
      this.handleInvalidSubmit = this.handleInvalidSubmit.bind(this);
      this.attachNode = this.attachNode.bind(this);
    }

    getChildContext() {
      return { model: this.props.model };
    }

    componentDidMount() {
      if (this.props.validateOn !== 'change') return;

      this.validate(this.props, true);
    }

    componentWillReceiveProps(nextProps) {
      const { validateOn } = this.props;

      if (validateOn !== 'change') return;

      this.validate(nextProps);
    }

    shouldComponentUpdate(nextProps) {
      return deepCompareChildren(this, nextProps);
    }

    attachNode(node) {
      if (!node) return;

      this._node = node;

      this._node.submit = this.handleSubmit;
    }

    validate(nextProps, initial = false) {
      const {
        model,
        dispatch,
        formValue,
        modelValue,
      } = this.props;

      const {
        validators,
        errors,
      } = nextProps;

      if (!formValue) return;

      if (!validators && !errors && (modelValue !== nextProps.modelValue)) {
        // If the form is invalid (due to async validity)
        // but its fields are valid and the value has changed,
        // the form should be "valid" again.
        if (!formValue.$form.valid && fieldsValid(formValue)) {
          dispatch(s.actions.setValidity(model, true));
        }

        return;
      }

      const validatorsChanged = validators !== this.props.validators
        || errors !== this.props.errors;

      let validityChanged = false;

      const fieldsValidity = mapValues(validators, (validator, field) => {
        const nextValue = field
          ? s.get(nextProps.modelValue, field)
          : nextProps.modelValue;

        const currentValue = field
          ? s.get(modelValue, field)
          : modelValue;

        const currentValidity = getField(formValue, field).validity;

        if ((!initial && !validatorsChanged) && (nextValue === currentValue)) {
          return currentValidity;
        }

        const fieldValidity = getValidity(validator, nextValue);

        if (!shallowEqual(fieldValidity, currentValidity)) {
          validityChanged = true;
        }

        return fieldValidity;
      });

      const fieldsErrorsValidity = mapValues(errors, (errorValidator, field) => {
        const nextValue = field
          ? s.get(nextProps.modelValue, field)
          : nextProps.modelValue;

        const currentValue = field
          ? s.get(modelValue, field)
          : modelValue;

        const currentErrors = getField(formValue, field).errors;

        if ((!initial && !validatorsChanged) && (nextValue === currentValue)) {
          return getField(formValue, field).errors;
        }

        const fieldErrors = getValidity(errorValidator, nextValue);

        if (!shallowEqual(fieldErrors, currentErrors)) {
          validityChanged = true;
        }

        return fieldErrors;
      });

      const fieldsErrors = merge(
        invertValidity(fieldsValidity),
        fieldsErrorsValidity
      );

      // Compute form-level validity
      if (!fieldsValidity.hasOwnProperty('') && !fieldsErrorsValidity.hasOwnProperty('')) {
        fieldsErrors[''] = false;
      }

      if (validityChanged) {
        dispatch(s.actions.setFieldsErrors(model, fieldsErrors));
      }
    }

    handleValidSubmit() {
      const {
        dispatch,
        model,
        modelValue,
        onSubmit = identity,
      } = this.props;

      dispatch(s.actions.setPending(model));

      return onSubmit(modelValue);
    }

    handleInvalidSubmit() {
      const {
        dispatch,
        model,
      } = this.props;

      dispatch(s.actions.setSubmitFailed(model));
    }

    handleReset(e) {
      if (e) e.preventDefault();

      const {
        model,
        dispatch,
      } = this.props;

      dispatch(s.actions.reset(model));
    }

    handleSubmit(e) {
      if (e) e.preventDefault();

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
        ? formValue.valid  // TODO: should this be formValue.$form.valid?  Write a test to catch this?
        : true;

      if (!validators && onSubmit && formValid) {
        onSubmit(modelValue);

        return modelValue;
      }

      const validationOptions = {
        onValid: this.handleValidSubmit,
        onInvalid: this.handleInvalidSubmit,
      };

      const finalErrorValidators = validators
        ? merge(invertValidators(validators), errorValidators)
        : errorValidators;

      dispatch(s.actions.validateFieldsErrors(
        model,
        finalErrorValidators,
        validationOptions));

      return modelValue;
    }

    render() {
      const {
        component,
        children,
        formValue,
      } = this.props;

      const allowedProps = omit(this.props, Object.keys(propTypes));
      const renderableChildren = typeof children === 'function'
        ? children(formValue)
        : children;

      return React.createElement(component,
        {
          ...allowedProps,
          onSubmit: this.handleSubmit,
          onReset: this.handleReset,
          ref: this.attachNode,
        }, renderableChildren);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    Form.propTypes = propTypes;
  }

  Form.defaultProps = {
    validateOn: 'change',
    component: 'form',
  };

  Form.childContextTypes = {
    model: PropTypes.any,
  };

  function mapStateToProps(state, { model }) {
    const modelString = getModel(model, state);

    return {
      model: modelString,
      modelValue: s.get(state, modelString),
      formValue: s.getForm(state, modelString),
    };
  }

  return connect(mapStateToProps)(Form);
}

export {
  createFormClass,
};
export default createFormClass();
