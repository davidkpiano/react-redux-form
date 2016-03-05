import { Component, cloneElement, PropTypes } from 'react';

class Control extends Component {
  componentDidMount() {
    const { _onLoad, modelValue } = this.props;

    if (_onLoad) {
      _onLoad(modelValue);
    }
  }

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
  _onLoad: PropTypes.func,
  modelValue: PropTypes.string,
};

export default Control;
