import React from 'react';

class Control extends React.Component {
  componentWillMount() {
    this.handleChange = (e) => {
      e.persist && e.persist();
      return this.props.onChange(e);
    }
  }

  render() {
    let { children, control } = this.props;

    return React.cloneElement(
      control,
      {
        ...this.props,
        onChange: this.handleChange,
        ...control.props
      });
  }

  shouldComponentUpdate(nextProps) {
    return this.props.modelValue !== nextProps.modelValue;
  }
}

export default Control;
