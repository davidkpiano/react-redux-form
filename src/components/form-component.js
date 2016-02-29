/* eslint-disable */
// TODO: Fix all eslint issues
import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import _get from 'lodash/get';
import identity from 'lodash/identity';

import actions from '../actions';

class Form extends Component {
  handleSubmit(e) {
    const {
      model,
      validators,
      onSubmit = identity,
      dispatch
    } = this.props;
    const modelValue = _get(this.props, model);

    e.preventDefault();

    let valid = true;

    Object.keys(validators).forEach((field) => {
      const validator = validators[field];
      const fieldModel = [model, field].join('.');
      const value = _get(this.props, fieldModel);

      valid = valid && validator(value);

      dispatch(actions.setValidity(fieldModel, validator(value)));
    });

    if (!valid) {
      onSubmit(modelValue);
    }
  }

  render() {
    return (
      <form {...this.props} onSubmit={(e) => this.handleSubmit(e)}>
        { this.props.children }
      </form>
    );
  }
}

Form.PropTypes = {
  validators: PropTypes.object,
  model: PropTypes.string.isRequired
};

export default connect(s => s)(Form);
