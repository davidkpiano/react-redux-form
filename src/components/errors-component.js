import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import _get from 'lodash/get';
import map from 'lodash/map';
import compact from 'lodash/compact';

import { getFieldFromState } from '../utils';

function createErrorComponent(component, message, key) {
  return React.createElement(
    component,
    { key },
    message);
}

function mapErrorMessages(errors, messages, component) {
  return compact(map(errors, (error, key) => {
    const message = messages[key];

    if (error) {
      if (message) {
        return createErrorComponent(component, message, key);
      } else if (typeof error === 'string') {
        return createErrorComponent(component, error, key);
      }
    }

    return false;
  }));
}

class Errors extends Component {
  shouldComponentUpdate({ fieldValue }) {
    return fieldValue !== this.props.fieldValue;
  }

  render() {
    const {
      // model,
      // modelValue,
      fieldValue: {
        valid,
        errors,
      },
      messages,
      // show,
      wrapper,
      component,
    } = this.props;

    const errorMessages = valid
      ? null
      : mapErrorMessages(errors, messages, component);

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
  show: PropTypes.array,
  wrapper: PropTypes.string,
  component: PropTypes.string,
};

Errors.defaultProps = {
  wrapper: 'div',
  component: 'span',
  messages: {},
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
