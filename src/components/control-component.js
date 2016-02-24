import { Component, cloneElement } from 'react';

class Control extends Component {
  render() {
    let { control } = this.props;

    return cloneElement(
      control,
      {
        ...this.props,
        ...control.props
      });
  }
}

export default Control;
