import { Component, cloneElement, PropTypes } from 'react';

class Control extends Component {
  constructor(props) {
    super(props);

    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentWillMount() {
    const { onLoad, modelValue } = this.props;

    if (onLoad) {
      onLoad(modelValue);
    }
  }

  handleKeyPress(event) {
    const { onSubmit } = this.props;

    if (onSubmit && event.key === 'Enter') {
      onSubmit(event);
    }
  }

  render() {
    const { control } = this.props;

    return cloneElement(
      control,
      {
        ...control.props,
        ...this.props,
        onKeyPress: this.handleKeyPress,
      });
  }
}

Control.propTypes = {
  control: PropTypes.object,
  onLoad: PropTypes.func,
  onSubmit: PropTypes.func,
  modelValue: PropTypes.any,
};

export default Control;
