import React, { Component, createElement, cloneElement, PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import identity from 'lodash/identity';
import shallowEqual from '../utils/shallow-equal';
import _get from '../utils/get';
import merge from '../utils/merge';
import mapValues from '../utils/map-values';
import isPlainObject from 'lodash/isPlainObject';
import icepick from 'icepick';
import omit from 'lodash/omit';
import handleFocus from '../utils/handle-focus';

import getValue from '../utils/get-value';
import getValidity from '../utils/get-validity';
import invertValidity from '../utils/invert-validity';
import getFieldFromState from '../utils/get-field-from-state';
import getModel from '../utils/get-model';
import persistEventWithCallback from '../utils/persist-event-with-callback';
import actions from '../actions';
import controlPropsMap from '../constants/control-props-map';
import validityKeys from '../constants/validity-keys';
import { dispatchBatchIfNeeded } from '../actions/batch-actions';
import resolveModel from '../utils/resolve-model';
import isNative from '../utils/is-native';

const findDOMNode = !isNative
  ? require('react-dom').findDOMNode
  : null;

function containsEvent(events, event) {
  if (typeof events === 'string') {
    return events === event;
  }

  return !!~events.indexOf(event);
}

const propTypes = {
  model: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
  ]).isRequired,
  modelValue: PropTypes.any,
  viewValue: PropTypes.any,
  control: PropTypes.any,
  onLoad: PropTypes.func,
  onSubmit: PropTypes.func,
  fieldValue: PropTypes.object,
  mapProps: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  changeAction: PropTypes.func,
  updateOn: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  validateOn: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  validators: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  asyncValidateOn: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
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
  parser: PropTypes.func,
  getter: PropTypes.func,
  ignore: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  dynamic: PropTypes.bool,
};

function mapStateToProps(state, props) {
  const {
    model,
    getter = _get,
    controlProps = omit(props, Object.keys(propTypes)),
  } = props;

  const modelString = getModel(model, state);
  const fieldValue = getFieldFromState(state, modelString);

  return {
    model: modelString,
    modelValue: getter(state, modelString),
    fieldValue,
    controlProps,
  };
}

function isReadOnlyValue(controlProps) {
  return ~['radio', 'checkbox'].indexOf(controlProps.type);
}

const emptyControlProps = {};

class Control extends Component {
  constructor(props) {
    super(props);

    this.getChangeAction = this.getChangeAction.bind(this);
    this.getValidateAction = this.getValidateAction.bind(this);

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.createEventHandler = this.createEventHandler.bind(this);
    this.handleFocus = this.createEventHandler('focus').bind(this);
    this.handleBlur = this.createEventHandler('blur').bind(this);
    this.handleUpdate = this.createEventHandler('change').bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
    this.getMappedProps = this.getMappedProps.bind(this);
    this.attachNode = this.attachNode.bind(this);

    this.state = {
      viewValue: props.modelValue,
    };
  }

  componentDidMount() {
    this.attachNode();
    this.handleLoad();
  }

  componentWillReceiveProps(nextProps) {
    const { modelValue } = nextProps;

    if (modelValue !== this.props.modelValue) {
      this.setViewValue(modelValue, nextProps);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const result =
      !shallowEqual(this.props, nextProps, ['controlProps'])
      || !shallowEqual(this.props.controlProps, nextProps.controlProps)
      || !shallowEqual(this.state.viewValue, nextState.viewValue);

    return result;
  }

  componentDidUpdate() {
    const {
      fieldValue,
      updateOn,
      validateOn = updateOn,
      validators,
      errors,
    } = this.props;

    if ((validators || errors)
      && fieldValue
      && !fieldValue.validated
      && validateOn === 'change'
    ) {
      this.validate();
    }

    // Manually focus/blur node
    handleFocus(fieldValue, this.node);
  }

  componentWillUnmount() {
    const {
      model,
      fieldValue,
      dispatch,
      validators = {},
      errors = {},
    } = this.props;

    if (!fieldValue) return;

    if (!fieldValue.valid) {
      const keys = Object.keys(validators)
        .concat(Object.keys(errors));

      dispatch(actions.setValidity(model, omit(fieldValue.validity, keys)));
    }
  }

  getMappedProps() {
    const props = this.props;
    const { mapProps } = props;
    const { viewValue } = this.state;
    const originalProps = {
      ...props,
      ...props.controlProps,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
      onChange: this.handleChange,
      onKeyPress: this.handleKeyPress,
      viewValue,
    };

    if (isPlainObject(mapProps)) {
      return icepick.merge(originalProps,
        mapValues(mapProps, (value, key) => {
          if (typeof value === 'function' && key !== 'component') {
            return value(originalProps);
          }

          return value;
        }));
    }

    return mapProps(originalProps);
  }

  getChangeAction(event) {
    const { model, controlProps } = this.props;
    const { changeAction = actions.change } = this.getMappedProps();
    const value = isReadOnlyValue(controlProps)
      ? controlProps.value
      : event;

    return changeAction(model, getValue(value));
  }

  getValidateAction(value) {
    const {
      validators,
      errors,
      model,
      fieldValue,
    } = this.props;

    const nodeErrors = this.getNodeErrors();

    if (validators || errors) {
      const fieldValidity = getValidity(validators, value);
      const fieldErrors = merge(
        getValidity(errors, value),
        nodeErrors);

      const mergedErrors = validators
        ? merge(invertValidity(fieldValidity), fieldErrors)
        : fieldErrors;

      if (!fieldValue || !shallowEqual(mergedErrors, fieldValue.errors)) {
        return actions.setErrors(model, mergedErrors);
      }
    } else if (nodeErrors && Object.keys(nodeErrors).length) {
      return actions.setErrors(model, nodeErrors);
    }

    return false;
  }

  getAsyncValidateAction(value) {
    const {
      asyncValidators,
      fieldValue,
      model,
    } = this.props;

    if (!asyncValidators) return false;

    return (dispatch) => {
      mapValues(asyncValidators,
        (validator, key) => dispatch(actions.asyncSetValidity(model,
          (_, done) => {
            const outerDone = (valid) => {
              const validity = icepick.merge(fieldValue.validity, { [key]: valid });

              done(validity);
            };

            validator(getValue(value), outerDone);
          })
        )
      );

      return value;
    };
  }

  getNodeErrors() {
    const {
      node,
      props: { fieldValue },
    } = this;

    if (!node || !node.willValidate) {
      return null;
    }

    const nodeErrors = {};

    validityKeys.forEach((key) => {
      const errorValidity = node.validity[key];

      // If the key is invalid or they key was
      // previously invalid and is now valid,
      // set its validity
      if (errorValidity
        || (fieldValue && fieldValue.errors[key])) {
        nodeErrors[key] = errorValidity;
      }
    });

    return nodeErrors;
  }

  setViewValue(viewValue, props = this.props) {
    if (!isReadOnlyValue(props.controlProps)) {
      this.setState({ viewValue });
    }
  }

  handleChange(event) {
    this.setViewValue(getValue(event));
    this.handleUpdate(event);
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.handleSubmit(event);
    }
  }

  handleLoad() {
    const {
      model,
      modelValue,
      fieldValue,
      controlProps = emptyControlProps,
      onLoad,
      dispatch,
      changeAction,
      parser,
    } = this.props;
    const loadActions = [];
    let defaultValue = undefined;

    if (controlProps.hasOwnProperty('defaultValue')) {
      defaultValue = controlProps.defaultValue;
    } else if (controlProps.hasOwnProperty('defaultChecked')) {
      defaultValue = controlProps.defaultChecked;
    }

    if (typeof defaultValue !== 'undefined') {
      loadActions.push(this.getValidateAction(defaultValue));
      loadActions.push(changeAction(model, defaultValue));
    } else {
      loadActions.push(this.getValidateAction(modelValue));

      if (parser) {
        const parsedValue = parser(modelValue);

        if (parsedValue !== modelValue) {
          loadActions.push(changeAction(model, parsedValue));
        }
      }
    }

    dispatchBatchIfNeeded(model, loadActions, dispatch);

    if (onLoad) onLoad(modelValue, fieldValue, this.node);
  }

  handleSubmit(event) {
    const { dispatch } = this.props;

    dispatch(this.getChangeAction(event));
  }

  createEventHandler(eventName) {
    const {
      dispatch,
      model,
      updateOn,
      validateOn = updateOn,
      asyncValidateOn,
      controlProps = emptyControlProps,
      parser,
      ignore,
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

      if (containsEvent(validateOn, eventName)) {
        eventActions.push(
          this.getValidateAction(persistedEvent));
      }

      if (containsEvent(asyncValidateOn, eventName)) {
        eventActions.push(this.getAsyncValidateAction(persistedEvent));
      }

      if (containsEvent(updateOn, eventName)) {
        eventActions.push(this.getChangeAction(persistedEvent));
      }

      dispatchBatchIfNeeded(model, eventActions, dispatch);

      return persistedEvent;
    };

    return (event) => {
      if (containsEvent(ignore, eventName)) {
        return controlEventHandler
          ? controlEventHandler(event)
          : event;
      }


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

  attachNode() {
    if (!findDOMNode) return;

    const node = findDOMNode(this);

    if (node) this.node = node;
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
      controlProps = emptyControlProps,
      component,
      control,
    } = this.props;

    const mappedProps = this.getMappedProps();

    const allowedProps = omit(mappedProps, Object.keys(propTypes));

    // If there is an existing control, clone it
    if (control) {
      return cloneElement(
        control,
        {
          ...allowedProps,
          onKeyPress: this.handleKeyPress,
        },
        controlProps.children);
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

if (process.env.NODE_ENV !== 'production') {
  Control.propTypes = propTypes;
}

Control.defaultProps = {
  changeAction: actions.change,
  updateOn: 'change',
  asyncValidateOn: 'blur',
  parser: identity,
  controlProps: emptyControlProps,
  getter: _get,
  ignore: [],
  dynamic: false,
  mapProps: controlPropsMap.default,
  component: 'input',
};

const ConnectedControl = resolveModel(connect(mapStateToProps)(Control));

/* eslint-disable react/prop-types */
ConnectedControl.input = (props) => (
  <ConnectedControl
    component="input"
    mapProps={{
      ...controlPropsMap.default,
      ...props.mapProps,
    }}
    {...props}
  />
);

ConnectedControl.text = (props) => (
  <ConnectedControl
    component="input"
    mapProps={{
      ...controlPropsMap.text,
      ...props.mapProps,
    }}
    {...props}
  />
);

ConnectedControl.textarea = (props) => (
  <ConnectedControl
    component="textarea"
    mapProps={{
      ...controlPropsMap.textarea,
      ...props.mapProps,
    }}
    {...props}
  />
);

ConnectedControl.radio = (props) => (
  <ConnectedControl
    component="input"
    type="radio"
    mapProps={{
      ...controlPropsMap.radio,
      ...props.mapProps,
    }}
    {...props}
  />
);

ConnectedControl.checkbox = (props) => (
  <ConnectedControl
    component="input"
    type="checkbox"
    mapProps={{
      ...controlPropsMap.checkbox,
      ...props.mapProps,
    }}
    {...props}
  />
);

ConnectedControl.file = (props) => (
  <ConnectedControl
    component="input"
    type="file"
    mapProps={{
      ...controlPropsMap.file,
      ...props.mapProps,
    }}
    {...props}
  />
);

ConnectedControl.select = (props) => (
  <ConnectedControl
    component="select"
    mapProps={{
      ...controlPropsMap.select,
      ...props.mapProps,
    }}
    {...props}
  />
);

ConnectedControl.reset = (props) => (
  <ConnectedControl
    component="button"
    type="reset"
    mapProps={{
      ...controlPropsMap.reset,
      ...props.mapProps,
    }}
    {...props}
  />
);

export default ConnectedControl;
