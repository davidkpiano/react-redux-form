/* eslint-disable */
// TODO: Fix all eslint issues
import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import _get from 'lodash/get';
import identity from 'lodash/identity';
import mapValues from 'lodash/mapValues';

import actions from '../actions';
import { validate, isValid } from '../utils';

class Form extends Component {
  handleSubmit(e) {
    e.preventDefault();

    const {
      model,
      validators,
      onSubmit,
      dispatch
    } = this.props;
    const modelValue = _get(this.props, model);

    const valid = isValid(mapValues(validators, (validator, field) => {
      const fieldModel = [model, field].join('.');
      const value = _get(this.props, fieldModel);
      const validity = validate(validator, value);

      dispatch(actions.setValidity(fieldModel, validate(validator, value)));

      return isValid(validity);
    }));

    if (onSubmit && !!valid) {
      onSubmit(modelValue);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      validators,
      model,
      modelValue,
      dispatch,
      validateOn
    } = this.props;

    if (validateOn !== 'change') return;

    mapValues(validators, (validator, field) => {
      const fieldModel = [model, field].join('.');
      const value = _get(this.props, fieldModel);

      if (value === _get(prevProps, fieldModel)) return;

      const validity = validate(validator, value);

      dispatch(actions.setValidity(fieldModel, validate(validator, value)));
    });
  }

  render() {
    return (
      <form
        {...this.props}
        onSubmit={(e) => this.handleSubmit(e)}
      >
        { this.props.children }
      </form>
    );
  }
}

Form.PropTypes = {
  validators: PropTypes.object,
  validateOn: PropTypes.oneOf([
    'change',
  ]),
  model: PropTypes.string.isRequired
};

export default connect(identity)(Form);
