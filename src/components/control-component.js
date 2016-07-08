import { Component, createElement, cloneElement, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import shallowEqual from '../utils/shallow-equal';
import _get from '../utils/get';
import merge from '../utils/merge';
import omit from 'lodash/omit';
import identity from 'lodash/identity';

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

class Control extends Component {
  constructor(props) {
    super(props);

    const { controlProps, mapProps } = props;

    this.handleKeyPress = this.handleKeyPress.bind(this);

    this.state = {
      value: props.modelValue,
      mappedProps: mapProps({
        ...props,
        ...controlProps,
        ...sequenceEventActions(props),
      }),
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
      mappedProps: mapProps({
        ...nextProps,
        ...nextProps.controlProps,
        ...sequenceEventActions(nextProps),
      }),
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

  componentWillUnmount() {
    const { model, fieldValue, dispatch } = this.props;

    if (!fieldValue) return;

    if (!fieldValue.valid) {
      dispatch(actions.resetValidity(model));
    }
  }

  handleKeyPress(event) {
    const { onSubmit } = this.state.mappedProps;

    if (onSubmit && event.key === 'Enter') {
      onSubmit(event);
    }
  }

  validate() {
    const {
      model,
      modelValue,
      fieldValue,
      validators,
      errors: errorValidators,
      dispatch,
    } = this.props;

    if (!validators && !errorValidators) return modelValue;

    const fieldValidity = getValidity(validators, modelValue);
    const fieldErrors = getValidity(errorValidators, modelValue);

    const errors = validators
      ? merge(invertValidity(fieldValidity), fieldErrors)
      : fieldErrors;

    if (!shallowEqual(errors, fieldValue.errors)) {
      dispatch(actions.setErrors(model, errors));
    }

    return modelValue;
  }

  render() {
    const {
      controlProps = {},
      component,
      control,
    } = this.props;

    const allowedProps = omit(this.state.mappedProps, Object.keys(Control.propTypes));

    // If there is an existing control, clone it
    if (control) {
      return cloneElement(
        control,
        {
          ...allowedProps,
          onKeyPress: this.handleKeyPress,
        });
    }

    return createElement(
      component,
      {
        ...controlProps,
        ...allowedProps,
        onKeyPress: this.handleKeyPress,
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
  asyncValidateOn: PropTypes.string,
  asyncValidators: PropTypes.oneOfType([
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
  parser: PropTypes.func,
  formatter: PropTypes.func,
  componentMap: PropTypes.object, // will be deprecated
};

Control.defaultProps = {
  changeAction: actions.change,
  updateOn: 'change',
  parser: identity,
  formatter: identity,
};

export default connect(mapStateToProps)(Control);
