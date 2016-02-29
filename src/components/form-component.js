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
    const {
      model,
      validators,
      onSubmit,
      dispatch
    } = this.props;
    const modelValue = _get(this.props, model);

    e.preventDefault();

    let valid = true;

    mapValues(validators, (validator, field) => {
      const fieldModel = [model, field].join('.');
      const value = _get(this.props, fieldModel);
      const validity = validate(validator, value);

      valid = valid && isValid(validity);

      dispatch(actions.setValidity(fieldModel, validate(validator, value)));
    });

    if (onSubmit && !!valid) {
      onSubmit(modelValue);
    }
  }

  componentDidUpdate(prevProps) {
    const { validators, model, dispatch } = this.props;

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
