import { Component, createElement, cloneElement, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';
import compose from 'redux/lib/compose';
import identity from 'lodash/identity';
import _get from '../utils/get';
import merge from '../utils/merge';
import shallowEqual from 'react-redux/lib/utils/shallowEqual';
import mapValues from '../utils/map-values';
import icepick from 'icepick';

import { isMulti, invertValidity, getFieldFromState, getValidity, getValue } from '../utils';
import getModel from '../utils/get-model';
import persistEventWithCallback from '../utils/persist-event-with-callback';
import actions from '../actions';

function mapStateToProps(state, props) {
  const { model, mapProps } = props;

  if (!mapProps) return props;

  const modelString = getModel(model, state);
  const fieldValue = getFieldFromState(state, modelString);

  return {
    model,
    modelValue: _get(state, modelString),
    fieldValue,
  };
}

function isReadOnlyValue(controlProps) {
  return ~['radio', 'checkbox'].indexOf(controlProps.type);
}

const modelValueUpdaterMap = {
  checkbox: (props, eventValue) => {
    const { model, modelValue } = props;

    if (isMulti(model)) {
      const valueWithItem = modelValue || [];
      const valueWithoutItem = (valueWithItem || [])
        .filter(item => item !== eventValue);
      const value = (valueWithoutItem.length === valueWithItem.length)
        ? icepick.push(valueWithItem, eventValue)
        : valueWithoutItem;

      return value;
    }

    return !modelValue;
  },
  default: (props, eventValue) => eventValue,
};

class Control extends Component {
  constructor(props) {
    super(props);

    this.getChangeAction = this.getChangeAction.bind(this);
    this.getValidateAction = this.getValidateAction.bind(this);

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.createEventHandler = this.createEventHandler.bind(this);
    this.handleFocus = this.createEventHandler('focus').bind(this);
    this.handleBlur = this.createEventHandler('blur').bind(this);
    this.handleChange = this.createEventHandler('change').bind(this);
    this.handleLoad = this.handleLoad.bind(this);
    this.getMappedProps = this.getMappedProps.bind(this);

    this.state = {
      viewValue: props.modelValue,
      mappedProps: {},
    };
  }

  componentWillMount() {
    const { props, props: { mapProps } } = this;

    this.setState({ mappedProps: this.getMappedProps(props, mapProps) });
    this.handleLoad();
  }

  componentWillReceiveProps(nextProps) {
    const { mapProps, modelValue } = nextProps;

    this.setState({
      viewValue: modelValue,
      mappedProps: this.getMappedProps(nextProps, mapProps),
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
    const { model, dispatch } = this.props;

    dispatch(actions.resetValidity(model));
  }

  getMappedProps(props, mapProps) {
    const { viewValue } = this.state;

    return mapProps({
      ...props,
      ...props.controlProps,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
      onChange: this.handleChange,
      onKeyPress: this.handleKeyPress,
      viewValue,
    });
  }

  getChangeAction(event) {
    const { changeAction, model, controlProps } = this.props;
    const modelValueUpdater = modelValueUpdaterMap[controlProps.type]
        || modelValueUpdaterMap.default;
    const value = isReadOnlyValue(controlProps)
      ? modelValueUpdater(this.props, controlProps.value)
      : event;

    return changeAction(model, value);
  }

  getValidateAction(value) {
    const {
      validators,
      errors,
      model,
      fieldValue,
    } = this.props;

    if (validators || errors) {
      const fieldValidity = getValidity(validators, value);
      const fieldErrors = getValidity(errors, value);

      const mergedErrors = validators
        ? merge(invertValidity(fieldValidity), fieldErrors)
        : fieldErrors;

      if (fieldValue && !shallowEqual(mergedErrors, fieldValue.errors)) {
        return actions.setErrors(model, mergedErrors);
      }
    }

    return false;
  }

  getAsyncValidateAction(value) {
    const {
      asyncValidators,
      model,
    } = this.props;

    if (!asyncValidators) return false;

    return (dispatch) => {
      mapValues(asyncValidators,
        (validator, key) => dispatch(actions.asyncSetValidity(model,
          (_, done) => {
            const outerDone = (valid) => done({ [key]: valid });

            validator(getValue(value), outerDone);
          })
        )
      );

      return value;
    };
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.handleSubmit(event);
    }
  }

  handleLoad() {
    const { model, modelValue, controlProps = {}, dispatch } = this.props;
    const loadActions = [];
    let defaultValue = undefined;

    if (controlProps.hasOwnProperty('defaultValue')) {
      defaultValue = controlProps.defaultValue;
    } else if (controlProps.hasOwnProperty('defaultChecked')) {
      defaultValue = controlProps.defaultChecked;
    }

    if (typeof defaultValue !== 'undefined') {
      loadActions.push(this.getValidateAction(defaultValue));
      loadActions.push(actions.change(model, defaultValue));
    } else {
      loadActions.push(this.getValidateAction(modelValue));
    }

    dispatch(actions.batch(model, loadActions));
  }

  handleSubmit(event) {
    const { dispatch } = this.props;

    dispatch(this.getChangeAction(event));
  }

  createEventHandler(eventName) {
    return (event) => {
      const {
        dispatch,
        model,
        updateOn,
        validateOn,
        asyncValidateOn,
        controlProps = {},
        parser,
      } = this.props;

      const eventAction = {
        focus: actions.focus,
        blur: actions.blur,
      }[eventName];

      const controlEventHandler = {
        focus: controlProps.onFocus,
        blur: controlProps.onBlur,
        change: controlProps.onChange,
      }[eventName];

      const dispatchBatchActions = (persistedEvent) => {
        const eventActions = eventAction
          ? [eventAction(model)]
          : [];

        if (validateOn === eventName) {
          eventActions.push(this.getValidateAction(persistedEvent));
        }

        if (asyncValidateOn === eventName) {
          eventActions.push(this.getAsyncValidateAction(persistedEvent));
        }

        if (updateOn === eventName) {
          eventActions.push(this.getChangeAction(persistedEvent));
        }

        dispatch(actions.batch(model, eventActions));
      };

      if (isReadOnlyValue(controlProps)) {
        return compose(
          dispatchBatchActions,
          persistEventWithCallback(controlEventHandler || identity)
        )(event);
      }

      return compose(
        dispatchBatchActions,
        parser,
        getValue,
        persistEventWithCallback(controlEventHandler || identity)
      )(event);
    };
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
        });
    }

    return createElement(
      component,
      {
        ...controlProps,
        ...this.state.mappedProps,
      },
      controlProps.children);
  }
}

Control.propTypes = {
  model: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
  ]),
  modelValue: PropTypes.any,
  control: PropTypes.any,
  onLoad: PropTypes.func,
  onSubmit: PropTypes.func,
  fieldValue: PropTypes.object,
  mapProps: PropTypes.func,
  changeAction: PropTypes.func,
  updateOn: PropTypes.string,
  validateOn: PropTypes.string,
  asyncValidateOn: PropTypes.string,
  parser: PropTypes.func,
  validators: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
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
};

Control.defaultProps = {
  changeAction: actions.change,
  updateOn: 'change',
};

export default connect(mapStateToProps)(Control);
