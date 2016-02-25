/* eslint-disable */
// TODO: Fix all eslint issues
import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import mapValues from 'lodash/mapValues';
import _get from 'lodash/get';

import actions from '../actions';

class Form extends Component {
  setValidity(validators, model) {
    const { dispatch } = this.props;
    const value = _get(this.props, model);
    const validity = mapValues(validators, validator => validator(value));

    dispatch(actions.setValidity(model, validity));

    return validity;
  }

  handleSubmit(e) {
    e.preventDefault();

    const { validators } = this.props;

    const validity = mapValues(validators, this.setValidity, this);
  }

  render() {
    const { children } = this.props;

    return (
      // https://github.com/airbnb/javascript/issues/659
      <form onSubmit={e => this.handleSubmit(e)}>
        { children }
      </form>
    );
  }
}

// Form.PropTypes = {
//   dispatch: PropTypes,
//   children: PropTypes,
// };

export default connect(s => s)(Form);
