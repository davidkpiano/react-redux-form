import { Component, cloneElement, PropTypes } from 'react';

class Control extends Component {
  render() {
    const { control } = this.props;

    return cloneElement(
      control, {
        ...this.props,
        ...control.props,
      });
  }
}

Control.propTypes = {
  control: PropTypes.object,
};

export default Control;
