import { Component, createElement, cloneElement, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import _get from '../utils/get';
import merge from '../utils/merge';

import { invertValidity, getFieldFromState, getValidity } from '../utils';
import { sequenceEventActions } from '../utils/sequence';
import actions from '../actions';

function mapStateToProps(state, props) {
  const { model, mapProps } = props;

  if (!mapProps) return props;

  const modelString = typeof model === 'function'
    ? model(state)
    : model;
  const fieldValue = getFieldFromState(state, modelString);

  return {
    model,
    modelValue: _get(state, modelString),
    fieldValue,
  };
}

function getMappedProps(props, mapProps) {
  return mapProps({
    ...props,
    ...props.controlProps,
    ...sequenceEventActions(props),
  });
}

class Control extends Component {
  constructor(props) {
    super(props);

    const { controlProps, mapProps } = props;

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleFocus = this.handleFocus.bind(this);

    this.state = {
      value: props.modelValue,
      mappedProps: getMappedProps(props, mapProps),
    };
  }

  componentWillMount() {
    const { modelValue } = this.props;
    const { onLoad } = this.state.mappedProps;

    if (onLoad) {
      onLoad(modelValue);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { mapProps } = nextProps;

    this.setState({
      mappedProps: getMappedProps(nextProps, mapProps),
    });
  }

  componentDidUpdate(prevProps) {
    const {
      modelValue,
      fieldValue,
      validateOn,
    } = this.props;

    if (fieldValue
      && !fieldValue.validated
      && modelValue !== prevProps.modelValue
      && validateOn === 'change'
    ) {
      this.validate();
    }
  }

  handleKeyPress(event) {
    const { onSubmit } = this.state.mappedProps;

    if (onSubmit && event.key === 'Enter') {
      onSubmit(event);
    }
  }

  handleFocus() {
    const { dispatch, model } = this.props;

    dispatch(actions.focus(model));
  }

  validate() {
    const {
      model,
      modelValue,
      validators,
      errors: errorValidators,
      dispatch,
    } = this.props;

    const fieldValidity = getValidity(validators, modelValue);
    const fieldErrors = getValidity(errorValidators, modelValue);

    const errors = validators
      ? merge(invertValidity(fieldValidity), fieldErrors)
      : fieldErrors;

    dispatch(actions.setErrors(model, errors));

    return modelValue;
  }

  render() {
    const {
      controlProps = {},
      component,
      control,
    } = this.props;

    // If there is an existing control, clone it
    if (control) {
      return cloneElement(
        control,
        {
          ...this.state.mappedProps,
          onKeyPress: this.handleKeyPress,
          // onFocus: this.handleFocus,
        });
    }

    return createElement(
      component,
      {
        ...controlProps,
        ...this.state.mappedProps,
        onKeyPress: this.handleKeyPress,
        // onFocus: this.handleFocus,
      },
      controlProps.children);
  }
}

Control.propTypes = {
  model: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
  ]),
  control: PropTypes.any,
  onLoad: PropTypes.func,
  onSubmit: PropTypes.func,
  modelValue: PropTypes.any,
  fieldValue: PropTypes.object,
  mapProps: PropTypes.func,
  changeAction: PropTypes.func,
  updateOn: PropTypes.string,
  validateOn: PropTypes.string,
  validators: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  errors: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  controlProps: PropTypes.object,
  component: PropTypes.any,
  dispatch: PropTypes.func,
};

Control.defaultProps = {
  changeAction: actions.change,
  updateOn: 'change',
};

export default connect(mapStateToProps)(Control);
