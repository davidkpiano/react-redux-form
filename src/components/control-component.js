import { Component, cloneElement, PropTypes } from 'react';

class Control extends Component {
  constructor(props) {
    super(props);

    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentWillMount() {
    const { _onLoad, modelValue } = this.props;

    if (_onLoad) {
      _onLoad(modelValue);
    }
  }

  handleKeyPress(event) {
    const { _onSubmit } = this.props;

    if (_onSubmit && event.key === 'Enter') {
      _onSubmit(event);
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
  _onLoad: PropTypes.func,
  _onSubmit: PropTypes.func,
  modelValue: PropTypes.any,
};

export default Control;
