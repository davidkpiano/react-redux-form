import React, { Component } from 'react';
import PropTypes from 'prop-types';

// Prevents the defaultValue/defaultChecked fields from rendering with value/checked
class ComponentWrapper extends Component {
  render() {
    /* eslint-disable no-unused-vars */
    const {
      defaultValue,
      defaultChecked,
      component,
      getRef,
      ...otherProps,
    } = this.props;
    /* eslint-enable */

    if (getRef) {
      otherProps.ref = getRef;
    }
    const WrappedComponent = component;
    return <WrappedComponent {...otherProps} />;
  }
}
ComponentWrapper.propTypes = {
  component: PropTypes.any,
  defaultValue: PropTypes.any,
  defaultChecked: PropTypes.any,
  getRef: PropTypes.func,
};
export default ComponentWrapper;
