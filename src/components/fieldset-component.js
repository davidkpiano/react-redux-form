import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import getModel from '../utils/get-model';
import omit from '../utils/omit';
import resolveModel from '../utils/resolve-model';

const propTypes = {
  model: PropTypes.string.isRequired,
  component: PropTypes.any,
  dispatch: PropTypes.func,
  store: PropTypes.shape({
    subscribe: PropTypes.func,
    dispatch: PropTypes.func,
    getState: PropTypes.func,
  }),
};

class Fieldset extends Component {
  getChildContext() {
    return { model: this.props.model };
  }

  render() {
    const { component } = this.props;

    const allowedProps = omit(this.props, Object.keys(propTypes));

    return React.createElement(
      component,
      allowedProps);
  }
}

Fieldset.displayName = 'Fieldset';

Fieldset.childContextTypes = {
  model: PropTypes.any,
};

Fieldset.propTypes = propTypes;

Fieldset.defaultProps = {
  component: 'div',
};

function mapStateToProps(state, { model }) {
  const modelString = getModel(model, state);

  return {
    model: modelString,
  };
}

export default resolveModel(connect(mapStateToProps)(Fieldset));
