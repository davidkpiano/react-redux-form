import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import _get from '../utils/get';
import map from '../utils/map';
import compact from 'lodash/compact';
import iteratee from '../utils/iteratee';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import omit from 'lodash/omit';
import invariant from 'invariant';

import getForm from '../utils/get-form';
import getFieldFromState from '../utils/get-field-from-state';
import getModel from '../utils/get-model';
import isValid from '../form/is-valid';
import resolveModel from '../utils/resolve-model';
import initialFieldState from '../constants/initial-field-state';
import shallowEqual from '../utils/shallow-equal';

const defaultStrategy = {
  get: _get,
  getForm,
  getFieldFromState,
};

const propTypes = {
  // Computed props
  modelValue: PropTypes.any,
  formValue: PropTypes.object,
  fieldValue: PropTypes.object,

  // Provided props
  model: PropTypes.string.isRequired,
  messages: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.bool,
  ])),
  show: PropTypes.any,
  wrapper: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.element,
  ]),
  component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.element,
  ]),
  dispatch: PropTypes.func,
  dynamic: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

function showErrors(field, form, show = true) {
  if (typeof show === 'function') {
    return show(field, form);
  }

  if (!isArray(show)
    && typeof show !== 'object'
    && typeof show !== 'string') {
    return !!show;
  }

  return iteratee(show)(field);
}

function createErrorsClass(s = defaultStrategy) {
  class Errors extends Component {
    shouldComponentUpdate(nextProps) {
      const { fieldValue, formValue } = nextProps;
      const { dynamic } = this.props;

      if (dynamic) {
        return !shallowEqual(this.props, nextProps);
      }

      return fieldValue !== this.props.fieldValue
        || formValue !== this.props.formValue;
    }

    mapErrorMessages(errors) {
      const { messages } = this.props;

      if (typeof errors === 'string') {
        return this.renderError(errors, 'error');
      }

      if (!errors) return null;

      const mappedErrors = compact(map(errors, (error, key) => {
        const message = messages[key];

        if (error) {
          if (message) {
            return this.renderError(message, key);
          } else if (typeof error === 'string') {
            return this.renderError(error, key);
          } else if (isPlainObject(error)) {
            return this.mapErrorMessages(error);
          }
        }

        return false;
      })).reduce((a, b) => a.concat(b), []);

      if (!mappedErrors.length) return null;

      return mappedErrors;
    }

    renderError(message, key) {
      const {
        component,
        model,
        modelValue,
        fieldValue,
        fieldValue: { errors },
      } = this.props;

      const errorProps = {
        key,
        model,
        modelValue,
        fieldValue,
      };

      const messageString = typeof message === 'function'
        ? message(modelValue, errors[key])
        : message;

      if (!messageString) return null;

      const allowedProps = typeof component === 'function'
        ? errorProps
        : { key };

      return React.createElement(
        component,
        allowedProps,
        messageString);
    }

    render() {
      const {
        fieldValue,
        formValue,
        show,
        wrapper,
      } = this.props;

      const allowedProps = typeof wrapper === 'function'
        ? this.props
        : omit(this.props, Object.keys(propTypes));

      if (!showErrors(fieldValue, formValue, show)) {
        return null;
      }

      const errorMessages = isValid(fieldValue)
        ? null
        : this.mapErrorMessages(fieldValue.errors);

      if (!errorMessages) return null;

      return React.createElement(
        wrapper,
        allowedProps,
        errorMessages);
    }
  }

  Errors.propTypes = propTypes;

  Errors.defaultProps = {
    wrapper: 'div',
    component: 'span',
    messages: {},
    show: true,
    dynamic: true,
  };

  function mapStateToProps(state, { model }) {
    const modelString = getModel(model, state);

    const form = s.getForm(state, modelString);
    invariant(form, `Could not find form state for '${modelString}' model. `
      + 'Please make sure it exists in the store.');

    const formValue = form.$form;
    const fieldValue = s.getFieldFromState(state, modelString)
      || initialFieldState;

    return {
      model: modelString,
      modelValue: s.get(state, modelString),
      formValue,
      fieldValue,
    };
  }

  return resolveModel(connect(mapStateToProps)(Errors));
}

export {
  createErrorsClass,
};
export default createErrorsClass();
