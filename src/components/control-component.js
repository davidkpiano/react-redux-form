import { Component, cloneElement, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';

import _get from 'lodash/get';
import isEqual from 'lodash/isEqual';

import { sequenceEventActions } from '../utils/sequence';
import { isMulti } from '../utils';

function isChecked(props) {
  if (isMulti(props.model)) {
    return (props.modelValue || [])
      .filter((item) =>
        isEqual(item, props.value))
      .length;
  }

  return !!props.modelValue;
}

const controlPropsMap = {
  default: (props) => controlPropsMap.text(props),
  checkbox: (props) => ({
    ...props,
    name: props.model,
    checked: isChecked(props),
  }),
  radio: (props) => ({
    ...props,
    name: props.model,
    checked: isEqual(props.modelValue, props.value),
    value: props.value,
  }),
  select: (props) => ({
    ...props,
    name: props.model,
    value: props.modelValue,
  }),
  text: (props) => ({
    ...props,
    defaultValue: props.modelValue,
    name: props.model,
  }),
  textarea: (props) => controlPropsMap.text(props),
};

function getControlType({ control, mapProps, model }, options = { controlPropsMap }) {
  const { controlPropsMap: _controlPropsMap } = options;

  try {
    let controlDisplayName = control.constructor.displayName
      || control.type.displayName
      || control.type.name
      || control.type;

    if (controlDisplayName === 'input') {
      controlDisplayName = (mapProps || _controlPropsMap[control.props.type])
        ? control.props.type
        : 'text';
    }

    return (mapProps || _controlPropsMap[controlDisplayName])
      ? controlDisplayName
      : null;
  } catch (error) {
    return undefined;
  }
}

function createControlProps(props) {
  const { model, modelValue, control, mapProps } = props;
  const controlType = getControlType(props);

  const _mapProps = mapProps || controlPropsMap[controlType];

  if (!controlType && !_mapProps) {
    return false;
  }

  return _mapProps({
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
