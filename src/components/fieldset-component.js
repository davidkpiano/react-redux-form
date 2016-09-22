import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import getModel from '../utils/get-model';
import omit from 'lodash/omit';

class Fieldset extends Component {
  getChildContext() {
    return { model: this.props.model };
  }

  render() {
    const { component } = this.props;

    const allowedProps = omit(this.props, Object.keys(Fieldset.propTypes));

    return React.createElement(
      component,
      allowedProps);
  }
}

Fieldset.childContextTypes = {
  model: PropTypes.any,
};

Fieldset.propTypes = {
  model: PropTypes.string.isRequired,
  component: PropTypes.any,
};

Fieldset.defaultProps = {
  component: 'div',
};

function mapStateToProps(state, { model }) {
  const modelString = getModel(model, state);

  return {
    model: modelString,
  };
}

export default connect(mapStateToProps)(Fieldset);
