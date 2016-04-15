import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import _get from 'lodash/get';
import map from 'lodash/map';
import compact from 'lodash/compact';
import iteratee from 'lodash/iteratee';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';

import { getFieldFromState } from '../utils';

function showErrors(field, show = true) {
  if (typeof show === 'function') {
    return show(field);
  }

  if (!isArray(show)
    && typeof show !== 'object'
    && typeof show !== 'string') {
    return !!show;
  }

  return iteratee(show)(field);
}

class Errors extends Component {
  shouldComponentUpdate({ fieldValue }) {
    return fieldValue !== this.props.fieldValue;
  }

  mapErrorMessages(errors) {
    const { messages } = this.props;

    return compact(map(errors, (error, key) => {
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
  }

  renderError(message, key) {
    const {
      component,
      model,
      modelValue,
      fieldValue,
    } = this.props;

    const errorProps = {
      key,
      model,
      modelValue,
      fieldValue,
    };

    const messageString = typeof message === 'function'
      ? message(modelValue)
      : message;

    if (!messageString) return null;

    return React.createElement(
      component,
      errorProps,
      messageString);
  }

  render() {
    const {
      fieldValue,
      fieldValue: {
        valid,
        errors,
      },
      show,
      wrapper,
    } = this.props;

    if (!showErrors(fieldValue, show)) {
      return null;
    }

    const errorMessages = valid
      ? null
      : this.mapErrorMessages(errors);

    return React.createElement(
      wrapper,
      this.props,
      errorMessages);
  }
}

Errors.propTypes = {
  // Computed props
  modelValue: PropTypes.any,
  fieldValue: PropTypes.object,

  // Provided props
  model: PropTypes.string.isRequired,
  messages: PropTypes.objectOf(PropTypes.oneOf([
    PropTypes.string,
    PropTypes.func,
    PropTypes.bool,
  ])),
  show: PropTypes.any,
  wrapper: PropTypes.string,
  component: PropTypes.oneOf([
    PropTypes.string,
    PropTypes.func,
    PropTypes.element,
  ]),
};

Errors.defaultProps = {
  wrapper: 'div',
  component: 'span',
  messages: {},
  show: true,
};

function selector(state, { model }) {
  const fieldValue = getFieldFromState(state, model);

  return {
    ...state,
    modelValue: _get(state, model),
    fieldValue,
  };
}

export default connect(selector)(Errors);
