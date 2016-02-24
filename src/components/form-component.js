import React from 'react';
import connect from 'react-redux/lib/components/connect';
import mapValues from 'lodash/mapValues';
import _get from 'lodash/get';

import * as fieldActions from '../actions/field-actions';

class Form extends React.Component {
  setValidity(validators, model) {
    let { dispatch } = this.props;
    let value = _get(this.props, model);
    let validity = mapValues(validators, (validator) => validator(value));

    dispatch(fieldActions.setValidity(model, validity));

    return validity;
  }

  handleSubmit(e) {
    e.preventDefault();

    let { validators } = this.props;

    let validity = mapValues(validators, this.setValidity, this);
  }

  render() {
    let { validators, children } = this.props;

    return (
      <form onSubmit={(e) => this.handleSubmit(e)}>
        { children }
      </form>
    );
  }
}

export default connect(s => s)(Form);
