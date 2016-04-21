import { Component, cloneElement, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';

import _get from 'lodash/get';

import { sequenceEventActions } from '../utils/sequence';

function createControlProps(props) {
  const { model, modelValue, control, mapProps } = props;

  if (!mapProps) {
    return false;
  }

  return mapProps({
    model,
    modelValue,
    ...control.props,
    ...sequenceEventActions(control, props),
  });
}

function selector(state, props) {
  const controlProps = createControlProps(props);

  const model = props.model;

  const modelString = typeof model === 'function'
    ? model(state)
    : model;

  return {
    model: modelString,
    modelValue: _get(state, modelString),
    ...controlProps,
  };
}

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
  control: PropTypes.any,
  onLoad: PropTypes.func,
  onSubmit: PropTypes.func,
  modelValue: PropTypes.any,
  mapProps: PropTypes.func,
};

export default connect(selector)(Control);
