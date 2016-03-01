
// TODO: Fix all eslint issues
import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import _get from 'lodash/get';
import identity from 'lodash/identity';
import mapValues from 'lodash/mapValues';

import actions from '../actions';
import { getValidity, isValid } from '../utils';

class Form extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidUpdate(prevProps) {
    /* eslint-disable react/prop-types */
    const {
      validators,
      model,
      dispatch,
      validateOn,
    } = this.props;
    /* eslint-enable react/prop-types */

    if (validateOn !== 'change') return;

    mapValues(validators, (validator, field) => {
      const fieldModel = [model, field].join('.');
      const value = _get(this.props, fieldModel);

      if (value === _get(prevProps, fieldModel)) return;

      const validity = getValidity(validator, value);

      dispatch(actions.setValidity(fieldModel, validity));
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    /* eslint-disable react/prop-types */
    const {
      model,
      validators,
      onSubmit,
      dispatch,
    } = this.props;
    /* eslint-enable react/prop-types */

    const modelValue = _get(this.props, model);

    const valid = isValid(mapValues(validators, (validator, field) => {
      const fieldModel = [model, field].join('.');
      const value = _get(this.props, fieldModel);
      const validity = getValidity(validator, value);

      dispatch(actions.setValidity(fieldModel, getValidity(validator, value)));

      return isValid(validity);
    }));

    if (onSubmit && !!valid) {
      onSubmit(modelValue);
    }
  }

  render() {
    /* eslint-disable react/prop-types */
    return (
      <form
        {...this.props}
        onSubmit={this.handleSubmit}
      >
        { this.props.children }
      </form>
    );
    /* eslint-enable react/prop-types */
  }
}

Form.propTypes = {
  validators: PropTypes.object,
  validateOn: PropTypes.oneOf([
    'change',
  ]),
  model: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
};

export default connect(identity)(Form);
