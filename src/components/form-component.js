import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import shallowEqual from '../utils/shallow-equal';
import _get from '../utils/get';
import mapValues from '../utils/map-values';
import merge from '../utils/merge';
import omit from '../utils/omit';
import identity from 'lodash.identity';

import actions from '../actions';
import getValidity from '../utils/get-validity';
import invertValidators from '../utils/invert-validators';
import isValidityInvalid from '../utils/is-validity-invalid';
import getForm from '../utils/get-form';
import getModel from '../utils/get-model';
import getField from '../utils/get-field';
import _isValid from '../form/is-valid';
import deepCompareChildren from '../utils/deep-compare-children';
import containsEvent from '../utils/contains-event';
import invariant from 'invariant';

const propTypes = {
  component: PropTypes.any,
  validators: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]),
  errors: PropTypes.object,
  validateOn: PropTypes.oneOf([
    'change',
    'submit',
  ]),
  model: PropTypes.string.isRequired,
  modelValue: PropTypes.any,
  formValue: PropTypes.object,
  onSubmit: PropTypes.func,
  onSubmitFailed: PropTypes.func,
  dispatch: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.node,
  ]),
  store: PropTypes.shape({
    subscribe: PropTypes.func,
    dispatch: PropTypes.func,
    getState: PropTypes.func,
  }),
  onUpdate: PropTypes.func,
  onChange: PropTypes.func,
  getRef: PropTypes.func,
  getDispatch: PropTypes.func,
  action: PropTypes.string,
};

const defaultStrategy = {
  get: _get,
  getForm,
  getField,
  actions,
  isValid: _isValid,
  toJS: identity,
  fromJS: identity,
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
      return {
        model: this.props.model,
        localStore: this.props.store,
      };
    }

    componentDidMount() {
      this.handleUpdate();
      this.handleChange();

      if (containsEvent(this.props.validateOn, 'change')) {
        this.validate(this.props, true);
      }

      if (this.props.getDispatch) {
        this.props.getDispatch(this.props.dispatch);
      }
    }

    componentWillReceiveProps(nextProps) {
      if (containsEvent(nextProps.validateOn, 'change')) {
        this.validate(nextProps);
      }
    }

    shouldComponentUpdate(nextProps) {
      return deepCompareChildren(this, nextProps);
    }

    componentDidUpdate(prevProps) {
      this.handleIntents();

      if (!shallowEqual(prevProps.formValue, this.props.formValue)) {
        this.handleUpdate();
      }

      if (!shallowEqual(prevProps.modelValue, this.props.modelValue)) {
        this.handleChange();
      }
    }

    handleUpdate() {
      if (this.props.onUpdate) {
        this.props.onUpdate(this.props.formValue);
      }
    }

    handleChange() {
      if (this.props.onChange) {
        this.props.onChange(this.props.modelValue);
      }
    }

    attachNode(node) {
      if (!node) return;

      this._node = node;

      this._node.submit = this.handleSubmit;
      if (this.props.getRef) this.props.getRef(node);
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
        if (s.isValid(formValue, { async: false })) {
          dispatch(s.actions.setValidity(model, true));
        }

        return;
      }

      const validatorsChanged = validators !== this.props.validators
        || errors !== this.props.errors;

      const fieldsErrors = {};
      let validityChanged = false;

      // this is (internally) mutative for performance reasons.
      const validateField = (errorValidator, field) => {
        if (!!~field.indexOf('[]')) {
          const [parentModel, childModel] = field.split('[]');

          const nextValue = parentModel
            ? s.get(nextProps.modelValue, parentModel)
            : nextProps.modelValue;

          nextValue.forEach((subValue, index) => {
            validateField(errorValidator, `${parentModel}[${index}]${childModel}`);
          });
        } else {
          const nextValue = field
            ? s.get(nextProps.modelValue, field)
            : nextProps.modelValue;

          const currentValue = field
            ? s.get(modelValue, field)
            : modelValue;

          const currentErrors = s.get(s.getField(formValue, field), 'errors');

          // If the validators didn't change, the validity didn't change.
          if ((!initial && !validatorsChanged) && (nextValue === currentValue)) {
            fieldsErrors[field] = s.get(s.getField(formValue, field), 'errors');
          } else {
            const fieldErrors = getValidity(errorValidator, nextValue);

            if (!validityChanged && !shallowEqual(fieldErrors, currentErrors)) {
              validityChanged = true;
            }

            // Changed the below for a test that errors and validations
            // get merged correctly, but it appears this wasn't actually
            // supported for the same field? Also could have the side
            // effect that errors wouldn't get cleared?
            // fieldsErrors[field] = merge(fieldsErrors[field] || {}, fieldErrors);

            fieldsErrors[field] = fieldErrors;
          }
        }
      };

      // Run errors first, validations should take precendence.
      // When run below will replace the contents of the fieldErrors[].
      mapValues(errors, validateField);

      if (typeof validators === 'function') {
        const field = '';

        const nextValue = field
          ? s.get(nextProps.modelValue, field)
          : nextProps.modelValue;

        const currentValue = field
          ? s.get(modelValue, field)
          : modelValue;

        // If the validators didn't change, the validity didn't change.
        if ((!initial && !validatorsChanged) && (nextValue === currentValue)) {
          // TODO this will only set the errors on form when using the function.
          // How handle? Safe to assume will be no dispatch?
          // fieldsErrors[field] = getField(formValue, field).errors;
        } else {
          const multiFieldErrors = getValidity(validators, nextValue);

          if (multiFieldErrors) {
            Object.keys(multiFieldErrors).forEach((key) => {
              // key will be the model value to apply errors to.
              const fieldErrors = multiFieldErrors[key];
              const currentErrors = s.get(getField(formValue, key), 'errors');

              // Invert validators
              Object.keys(fieldErrors).forEach((validationName) => {
                fieldErrors[validationName] = !fieldErrors[validationName];
              });

              if (!validityChanged && !shallowEqual(fieldErrors, currentErrors)) {
                validityChanged = true;
              }

              fieldsErrors[key] = fieldErrors;
            });
          }
        }
      } else if (validators) {
        const errorValidators = invertValidators(validators);

        mapValues(errorValidators, validateField);
      }

      // Compute form-level validity
      if (!fieldsErrors.hasOwnProperty('')) {
        fieldsErrors[''] = false;
        validityChanged = validityChanged
          || isValidityInvalid(s.toJS(formValue).$form.errors);
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
        onSubmit,
      } = this.props;

      dispatch(s.actions.setPending(model));

      if (onSubmit) onSubmit(modelValue);
    }

    handleInvalidSubmit() {
      const { onSubmitFailed, formValue, dispatch } = this.props;

      if (onSubmitFailed) {
        onSubmitFailed(formValue);
      }

      if (!s.get(formValue, ['$form', 'submitFailed'])) {
        dispatch(s.actions.setSubmitFailed(this.props.model));
      }
    }

    handleReset(e) {
      if (e) e.preventDefault();

      this.props.dispatch(s.actions.reset(this.props.model));
    }

    handleIntents() {
      const {
        model,
        formValue,
        dispatch,
      } = this.props;

      s.get(formValue, ['$form', 'intents']).forEach((intent) => {
        const intentType = s.get(intent, 'type');

        switch (intentType) {
          case 'submit': {
            dispatch(s.actions.clearIntents(model, intent));

            if (s.isValid(formValue, { async: false })) {
              this.handleValidSubmit();
            } else {
              this.handleInvalidSubmit();
            }

            return;
          }

          default:
            return;
        }
      });
    }

    handleSubmit(e) {
      if (e && !this.props.action) e.preventDefault();

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
        ? s.get(formValue, ['$form', 'valid'])
        : true;

      if (!validators && onSubmit && formValid) {
        onSubmit(modelValue);

        return modelValue;
      }

      const finalErrorValidators = validators
        ? merge(invertValidators(validators), errorValidators)
        : errorValidators;

      const fieldsValidity = {};

      // this is (internally) mutative for performance reasons.
      const validateField = (validator, field) => {
        if (!!~field.indexOf('[]')) {
          const [parentModel, childModel] = field.split('[]');

          const fieldValue = parentModel
            ? s.get(modelValue, parentModel)
            : modelValue;

          fieldValue.forEach((subValue, index) => {
            validateField(validator, `${parentModel}[${index}]${childModel}`);
          });
        } else {
          const fieldValue = field
            ? s.get(modelValue, field)
            : modelValue;

          const fieldValidity = getValidity(validator, fieldValue);

          fieldsValidity[field] = fieldValidity;
        }
      };

      mapValues(finalErrorValidators, validateField);

      dispatch(s.actions.batch(model, [
        s.actions.setFieldsErrors(
          model,
          fieldsValidity
        ),
        s.actions.addIntent(model, s.fromJS({ type: 'submit' })),
      ]));

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

  Form.propTypes = propTypes;

  Form.defaultProps = {
    validateOn: 'change',
    component: 'form',
  };

  Form.childContextTypes = {
    model: PropTypes.any,
    localStore: PropTypes.shape({
      subscribe: PropTypes.func,
      dispatch: PropTypes.func,
      getState: PropTypes.func,
    }),
  };

  function mapStateToProps(state, { model }) {
    const modelString = getModel(model, state);
    const form = s.getForm(state, modelString);

    invariant(form,
      'Unable to create Form component. ' +
      'Could not find form for "%s" in the store.',
      modelString);

    return {
      model: modelString,
      modelValue: s.get(state, modelString),
      formValue: form,
    };
  }

  return connect(mapStateToProps)(Form);
}

export {
  createFormClass,
};
export default createFormClass();
