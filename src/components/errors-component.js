import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import _get from 'lodash/get';
import map from 'lodash/map';
import compact from 'lodash/compact';
import iteratee from 'lodash/iteratee';
import isArray from 'lodash/isArray';

import { getFieldFromState } from '../utils';

function createErrorComponent(component, message, modelValue, key) {
  const messageString = typeof message === 'function'
    ? message(modelValue)
    : message;

  return React.createElement(
    component,
    { key },
    messageString);
}

function mapErrorMessages(errors, messages, modelValue, component) {
  return compact(map(errors, (error, key) => {
    const message = messages[key];

    if (error) {
      if (message) {
        return createErrorComponent(component, message, modelValue, key);
      } else if (typeof error === 'string') {
        return createErrorComponent(component, error, modelValue, key);
      } else if (typeof error === 'object') {
        return mapErrorMessages(error, messages, modelValue, component);
      }
    }

    return false;
  })).reduce((a, b) => a.concat(b), []);
}

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

  render() {
    const {
      // model,
      modelValue,
      fieldValue,
      fieldValue: {
        valid,
        errors,
      },
      messages,
      show,
      wrapper,
      component,
    } = this.props;

    if (!showErrors(fieldValue, show)) {
      return null;
    }

    const errorMessages = valid
      ? null
      : mapErrorMessages(errors, messages, modelValue, component);

    return React.createElement(
      wrapper,
      this.props,
      errorMessages);
  }
}

Errors.propTypes = {
  model: PropTypes.string.isRequired,
  modelValue: PropTypes.any,
  fieldValue: PropTypes.object,
  messages: PropTypes.object,
  show: PropTypes.any,
  wrapper: PropTypes.string,
  component: PropTypes.string,
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
