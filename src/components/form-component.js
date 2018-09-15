import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shallowEqual from '../utils/shallow-equal';
import _get from '../utils/get';
import omit from '../utils/omit';

import actions from '../actions';
import getValidity from '../utils/get-validity';
import invertValidators from '../utils/invert-validators';
import isValidityInvalid from '../utils/is-validity-invalid';
import isValid from '../form/is-valid';
import getForm, { clearGetFormCacheForModel } from '../utils/get-form';
import getModel from '../utils/get-model';
import getField from '../utils/get-field';
import deepCompareChildren from '../utils/deep-compare-children';
import containsEvent from '../utils/contains-event';
import mergeValidity from '../utils/merge-validity';
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
  storeSubscription: PropTypes.any,
  onUpdate: PropTypes.func,
  onChange: PropTypes.func,
  getRef: PropTypes.func,
  getDispatch: PropTypes.func,
  onBeforeSubmit: PropTypes.func,
  hideNativeErrors: PropTypes.bool,

  // standard HTML attributes
  action: PropTypes.string,
  noValidate: PropTypes.bool,
};

const htmlAttributes = ['action', 'noValidate'];
const disallowedPropTypeKeys = Object.keys(propTypes)
  .filter(key => htmlAttributes.indexOf(key) === -1);

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

      this.state = {
        lastSubmitEvent: null,
      };
    }

    getChildContext() {
      return {
        model: this.props.model,
        localStore: this.props.store,
      };
    }

    componentDidMount() {
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

    shouldComponentUpdate(nextProps, nextState) {
      return deepCompareChildren(this, nextProps, nextState);
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

    validate(nextProps, initial = false, submit = false) {
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
        return;
      }

      const validatorsChanged = validators !== this.props.validators
        || errors !== this.props.errors;
      const fieldKeys = (validators ? Object.keys(validators) : [])
        .concat(errors ? Object.keys(errors) : []);

      const fieldsErrors = {};
      let validityChanged = false;

      const keysToValidate = [];

      fieldKeys.forEach(key => {
        if (!!~keysToValidate.indexOf(key)) return;

        const valuesChanged = key === ''
          ? modelValue !== nextProps.modelValue
          : (s.get(modelValue, key) !== s.get(nextProps.modelValue, key));

        if (submit || initial
          || valuesChanged
          || (validators && (this.props.validators[key] !== validators[key]))
          || (errors && (this.props.errors[key] !== errors[key]))
          || !!~key.indexOf('[]')) {
          keysToValidate.push(key);
        }
      });

      const validateField = (field, errorValidator) => {
        if (!!~field.indexOf('[]')) {
          const [parentModel, childModel] = field.split('[]');

          const nextValue = parentModel
            ? s.get(nextProps.modelValue, parentModel)
            : nextProps.modelValue;

          nextValue.forEach((subValue, index) => {
            validateField(`${parentModel}[${index}]${childModel}`, errorValidator);
          });
        } else {
          const nextValue = field
            ? s.get(nextProps.modelValue, field)
            : nextProps.modelValue;

          const currentErrors = getField(formValue, field).errors;
          const fieldErrors = getValidity(errorValidator, nextValue);

          if (!validityChanged && !shallowEqual(fieldErrors, currentErrors)) {
            validityChanged = true;
          }

          fieldsErrors[field] = mergeValidity(fieldsErrors[field], fieldErrors);
        }
      };

      keysToValidate.forEach(field => {
        if (validators && validators[field]) {
          validateField(field, invertValidators(validators[field]));
        }
        if (errors && errors[field]) {
          validateField(field, errors[field]);
        }
      });

      if (typeof validators === 'function') {
        const nextValue = nextProps.modelValue;
        const currentValue = modelValue;

        if (!submit && (!initial && !validatorsChanged) && (nextValue === currentValue)) {
          // If neither the validators nor the values have changed,
          // the validity didn't change.
          return;
        }

        const multiFieldErrors = getValidity(validators, nextValue);

        if (multiFieldErrors) {
          Object.keys(multiFieldErrors).forEach((key) => {
            // key will be the model value to apply errors to.
            const fieldErrors = multiFieldErrors[key];
            const currentErrors = getField(formValue, key).errors;

            // Invert validators
            Object.keys(fieldErrors).forEach((validationName) => {
              fieldErrors[validationName] = !fieldErrors[validationName];
            });

            if (!validityChanged && !shallowEqual(fieldErrors, currentErrors)) {
              validityChanged = true;
            }

            fieldsErrors[key] = mergeValidity(fieldsErrors[key], fieldErrors);
          });
        }
      }

      // Compute form-level validity
      if (!fieldsErrors.hasOwnProperty('') && !~fieldKeys.indexOf('')) {
        fieldsErrors[''] = false;
        validityChanged = validityChanged
          || isValidityInvalid(formValue.$form.errors);
      }

      if (validityChanged) {
        dispatch(s.actions.setFieldsErrors(
          model,
          fieldsErrors,
          { merge: true }
        ));
      }

      if (submit) {
        dispatch(s.actions.addIntent(model, { type: 'submit' }));
      }
    }

    handleValidSubmit(options) {
      const {
        dispatch,
        model,
        modelValue,
        onSubmit,
      } = this.props;

      dispatch(s.actions.setPending(model, true, options));

      if (onSubmit) onSubmit(modelValue, this.state.lastSubmitEvent);
    }

    handleInvalidSubmit(options) {
      const { onSubmitFailed, formValue, dispatch } = this.props;

      if (onSubmitFailed) {
        onSubmitFailed(formValue);
      }

      dispatch(s.actions.setSubmitFailed(this.props.model, true, options));
    }

    handleReset(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      this.props.dispatch(s.actions.reset(this.props.model));
    }

    handleIntents() {
      const {
        formValue,
        noValidate,
      } = this.props;

      formValue.$form.intents.forEach((intent) => {
        switch (intent.type) {
          case 'submit': {
            if (noValidate || isValid(formValue, { async: false })) {
              this.handleValidSubmit({ clearIntents: intent });
            } else {
              this.handleInvalidSubmit({ clearIntents: intent });
            }

            return;
          }

          default:
            return;
        }
      });
    }

    handleSubmit(e) {
      if (e) {
        if (!this.props.action) e.preventDefault();
        e.stopPropagation();
      }
      if (e && e.persist) e.persist();

      const {
        modelValue,
        formValue,
        onSubmit,
        validators,
        onBeforeSubmit,
      } = this.props;

      if (onBeforeSubmit) onBeforeSubmit(e);

      const formValid = formValue
        ? formValue.$form.valid
        : true;

      if (!validators && onSubmit && formValid) {
        onSubmit(modelValue, e);

        return modelValue;
      }

      this.setState({ lastSubmitEvent: e });

      this.validate(this.props, false, true);

      return modelValue;
    }

    render() {
      const {
        component,
        children,
        formValue,
        hideNativeErrors,
        noValidate,
      } = this.props;

      const allowedProps = omit(this.props, disallowedPropTypeKeys);
      const renderableChildren = typeof children === 'function'
        ? children(formValue)
        : children;

      return React.createElement(component,
        {
          ...allowedProps,
          onSubmit: this.handleSubmit,
          onReset: this.handleReset,
          ref: this.attachNode,
          noValidate: hideNativeErrors || noValidate,
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
    clearGetFormCacheForModel(modelString);
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
