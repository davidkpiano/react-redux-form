import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import shallowEqual from '../utils/shallow-equal';
import _get from '../utils/get';
import mapValues from '../utils/map-values';
import merge from '../utils/merge';
import omit from '../utils/omit';

import actions from '../actions';
import getValidity from '../utils/get-validity';
import invertValidators from '../utils/invert-validators';
import isValidityInvalid from '../utils/is-validity-invalid';
import getForm from '../utils/get-form';
import getModel from '../utils/get-model';
import getField from '../utils/get-field';
import { fieldsValid } from '../form/is-valid';
import deepCompareChildren from '../utils/deep-compare-children';
import containsEvent from '../utils/contains-event';

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

      const errorValidators = validators
        ? merge(invertValidators(validators), errors)
        : errors;

      let validityChanged = false;
      const fieldsErrors = {};

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

          const currentErrors = getField(formValue, field).errors;

          // If the validators didn't change, the validity didn't change.
          if ((!initial && !validatorsChanged) && (nextValue === currentValue)) {
            fieldsErrors[field] = getField(formValue, field).errors;
          } else {
            const fieldErrors = getValidity(errorValidator, nextValue);

            if (!validityChanged && !shallowEqual(fieldErrors, currentErrors)) {
              validityChanged = true;
            }

            fieldsErrors[field] = fieldErrors;
          }
        }
      };

      mapValues(errorValidators, validateField);

      // Compute form-level validity
      if (!fieldsErrors.hasOwnProperty('')) {
        fieldsErrors[''] = false;
        validityChanged = validityChanged
          || isValidityInvalid(formValue.$form.errors);
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
      this.props.dispatch(s.actions.setSubmitFailed(this.props.model));
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

      formValue.$form.intents.forEach((intent) => {
        switch (intent.type) {
          case 'submit': {
            dispatch(s.actions.clearIntents(model, intent));

            if (formValue.$form.valid) {
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
        ? formValue.$form.valid
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
        s.actions.addIntent(model, { type: 'submit' }),
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
