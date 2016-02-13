import React from 'react';

class Control extends React.Component {
  render() {
    let { control } = this.props;

    return React.cloneElement(
      control,
      {
        ...this.props,
        ...control.props
      });
  }
}

export default Control;
