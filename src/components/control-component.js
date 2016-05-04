import { Component, createElement, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';

import _get from 'lodash/get';
import memoize from 'lodash/memoize';
import { sequenceEventActions } from '../utils/sequence';
import actions from '../actions';

const createControlProps = memoize((props) => {
  const { model, modelValue, controlProps, mapProps } = props;

  if (!mapProps) {
    return false;
  }

  return mapProps({
    model,
    modelValue,
    ...controlProps,
    ...sequenceEventActions(props),
  });
});

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

    this.state = {
      value: props.modelValue,
    };
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
    const { controlProps, component } = this.props;

    return createElement(
      component,
      {
        ...controlProps,
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
  changeAction: PropTypes.func,
  updateOn: PropTypes.string,
  controlProps: PropTypes.object,
  component: PropTypes.any,
};

Control.defaultProps = {
  changeAction: actions.change,
  updateOn: 'change',
};

export default connect(selector)(Control);
