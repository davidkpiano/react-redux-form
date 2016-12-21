import React, { Component, createElement, cloneElement, PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import identity from '../utils/identity';
import shallowEqual from '../utils/shallow-equal';
import _get from '../utils/get';
import merge from '../utils/merge';
import mapValues from '../utils/map-values';
import isPlainObject from '../utils/is-plain-object';
import i from 'icepick';
import omit from '../utils/omit';
import actionTypes from '../action-types';

import getValue from '../utils/get-value';
import getValidity from '../utils/get-validity';
import invertValidity from '../utils/invert-validity';
import getFieldFromState from '../utils/get-field-from-state';
import getModel from '../utils/get-model';
import persistEventWithCallback from '../utils/persist-event-with-callback';
import actions from '../actions';
import defaultControlPropsMap from '../constants/control-props-map';
import validityKeys from '../constants/validity-keys';
import { dispatchBatchIfNeeded } from '../actions/batch-actions';
import resolveModel from '../utils/resolve-model';
import isNative from '../utils/is-native';
import initialFieldState from '../constants/initial-field-state';
import containsEvent from '../utils/contains-event';

const findDOMNode = !isNative
  ? require('react-dom').findDOMNode
  : null;

const disallowedProps = ['changeAction', 'getFieldFromState', 'store'];

function getReadOnlyValue(props) {
  const { modelValue, controlProps } = props;

  switch (controlProps.type) {
    case 'checkbox':
      return typeof controlProps.value !== 'undefined'
        ? controlProps.value
        : !modelValue; // simple checkbox

    case 'radio':
    default:
      return controlProps.value;
  }
}

function mergeOrSetErrors(model, errors) {
  return actions.setErrors(model, errors, {
    merge: isPlainObject(errors),
  });
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
  ignore: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  dynamic: PropTypes.bool,
  store: PropTypes.shape({
    subscribe: PropTypes.func,
    dispatch: PropTypes.func,
    getState: PropTypes.func,
  }),
  getRef: PropTypes.func,
};

const defaultStrategy = {
  get: _get,
  getFieldFromState,
  actions,
};

function createControlClass(customControlPropsMap = {}, s = defaultStrategy) {
  const controlPropsMap = {
    ...defaultControlPropsMap,
    ...customControlPropsMap,
  };

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

      this.willValidate = false;

      this.state = {
        viewValue: props.modelValue,
      };
    }

    componentDidMount() {
      this.attachNode();
      this.handleLoad();
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.modelValue !== this.props.modelValue) {
        this.setViewValue(nextProps.modelValue);
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !shallowEqual(this.props, nextProps, {
        deepKeys: ['controlProps'],
        omitKeys: ['mapProps'],
      })
        || !shallowEqual(this.state.viewValue, nextState.viewValue);
    }

    componentDidUpdate() {
      this.handleIntents();
    }

    componentWillUnmount() {
      const {
        model,
        fieldValue,
        dispatch,
        validators = {},
        errors = {},
      } = this.props;

      if (fieldValue && !fieldValue.valid) {
        const keys = Object.keys(validators)
          .concat(Object.keys(errors), this.willValidate ? validityKeys : []);

        dispatch(actions.resetValidity(model, keys));
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
        return mapValues(mapProps, (value, key) => {
          if (typeof value === 'function' && key !== 'component') {
            return value(originalProps);
          }

          return value;
        });
      }

      return mapProps(originalProps);
    }

    getChangeAction(event) {
      const {
        model,
        modelValue,
        changeAction,
      } = this.props;
      const value = this.isReadOnlyValue()
        ? getReadOnlyValue(this.props)
        : event;

      return changeAction(model, getValue(value), {
        currentValue: modelValue,
      });
    }

    getValidateAction(value, eventName) {
      const {
        validators,
        errors,
        model,
        modelValue,
        updateOn,
        fieldValue,
      } = this.props;

      if (!validators && !errors && isNative) return false;

      const nodeErrors = this.getNodeErrors();

      // If it is not a change event, use the model value.
      const valueToValidate = containsEvent(updateOn, eventName)
        ? value
        : modelValue;

      if (validators || errors) {
        const fieldValidity = getValidity(validators, valueToValidate);
        const fieldErrors = merge(
          getValidity(errors, valueToValidate),
          nodeErrors);

        const mergedErrors = validators
          ? merge(invertValidity(fieldValidity), fieldErrors)
          : fieldErrors;

        if (!fieldValue || !shallowEqual(mergedErrors, fieldValue.errors)) {
          return mergeOrSetErrors(model, mergedErrors);
        }
      } else if (nodeErrors && Object.keys(nodeErrors).length) {
        return mergeOrSetErrors(model, nodeErrors);
      }

      return false;
    }

    getAsyncValidateAction(value, eventName) {
      const {
        asyncValidators,
        fieldValue,
        model,
        modelValue,
        updateOn,
        dispatch,
      } = this.props;

      // If there are no async validators,
      // do not run async validation
      if (!asyncValidators) return false;

      // If it is not a change event, use the model value.
      const valueToValidate = containsEvent(updateOn, eventName)
        ? value
        : modelValue;

      // If any sync validity is invalid,
      // do not run async validation
      const asyncValidatorKeys = Object.keys(asyncValidators);
      const syncValid = Object.keys(fieldValue.validity).every((key) => {
        // If validity is based on async validator, skip
        if (!!~asyncValidatorKeys.indexOf(key)) return true;

        return fieldValue.validity[key];
      });

      if (!syncValid) return false;

      dispatch(actions.setValidating(model, true));

      mapValues(asyncValidators, (validator, key) => {
        const outerDone = (valid) => {
          const validity = i.merge(fieldValue.validity, { [key]: valid });

          dispatch(actions.setValidity(model, validity));
        };

        validator(getValue(valueToValidate), outerDone);
      });

      return valueToValidate;
    }

    getNodeErrors() {
      const {
        node,
        props: { fieldValue },
      } = this;

      if (!node || !node.willValidate) {
        this.willValidate = false;
        return null;
      }

      this.willValidate = true;

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

    setViewValue(viewValue) {
      if (!this.isReadOnlyValue()) {
        this.setState({ viewValue: this.parse(viewValue) });
      }
    }

    isReadOnlyValue() {
      const { component, controlProps } = this.props;

      return component === 'input' && ~['radio', 'checkbox'].indexOf(controlProps.type);
    }

    handleIntents() {
      const {
        model,
        modelValue,
        fieldValue,
        fieldValue: { intents },
        controlProps,
        dispatch,
        updateOn,
        validateOn = updateOn,
      } = this.props;

      if (!intents.length) return;

      intents.forEach((intent) => {
        switch (intent.type) {
          case actionTypes.FOCUS: {
            if (isNative) return;

            const focused = fieldValue.focus;

            if ((focused && this.node.focus)
              && (
                !this.isReadOnlyValue()
                || typeof intent.value === 'undefined'
                || intent.value === controlProps.value
              )) {
              this.node.focus();

              dispatch(actions.clearIntents(model, intent));
            }

            return;
          }
          case 'validate':
            if (containsEvent(validateOn, 'change')) {
              dispatch(actions.clearIntents(model, intent));
              this.validate();
            }
            return;

          case 'load':
            if (!shallowEqual(modelValue, intent.value)) {
              dispatch(actions.clearIntents(model, intent));
              dispatch(actions.load(model, intent.value));
            }
            return;

          default:
            return;
        }
      });
    }

    parse(value) {
      return this.props.parser
        ? this.props.parser(value)
        : value;
    }

    handleChange(event) {
      this.setViewValue(getValue(event));
      this.handleUpdate(event);
    }

    handleKeyPress(event) {
      const {
        controlProps: { onKeyPress },
        dispatch,
      } = this.props;

      // Get the value from the event
      // in case updateOn="blur" (or something other than "change")
      const parsedValue = this.parse(getValue(event));

      if (event.key === 'Enter') {
        dispatch(this.getChangeAction(parsedValue));
      }

      if (onKeyPress) onKeyPress(event);
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
      let defaultValue = undefined;

      if (controlProps.hasOwnProperty('defaultValue')) {
        defaultValue = controlProps.defaultValue;
      } else if (controlProps.hasOwnProperty('defaultChecked')) {
        defaultValue = controlProps.defaultChecked;
      }

      const loadActions = [this.getValidateAction(defaultValue)];

      if (typeof defaultValue !== 'undefined') {
        loadActions.push(changeAction(model, defaultValue));
      } else {
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
        focus: actions.silentFocus,
        blur: actions.blur,
      }[eventName];

      const controlEventHandler = {
        focus: controlProps.onFocus,
        blur: controlProps.onBlur,
        change: controlProps.onChange,
      }[eventName];

      const dispatchBatchActions = (persistedEvent) => {
        const eventActions = [
          eventAction && eventAction(model),
          containsEvent(validateOn, eventName)
            && this.getValidateAction(persistedEvent, eventName),
          containsEvent(updateOn, eventName)
            && this.getChangeAction(persistedEvent),
        ];

        dispatchBatchIfNeeded(model, eventActions, dispatch);

        return persistedEvent;
      };

      return (event) => {
        if (containsEvent(ignore, eventName)) {
          return controlEventHandler
            ? controlEventHandler(event)
            : event;
        }

        if (this.isReadOnlyValue()) {
          return compose(
            dispatchBatchActions,
            persistEventWithCallback(controlEventHandler || identity)
          )(event);
        }


        return compose(
          (e) => {
            if (containsEvent(asyncValidateOn, eventName)) {
              this.getAsyncValidateAction(e, eventName);
            }

            return e;
          },
          dispatchBatchActions,
          parser,
          getValue,
          persistEventWithCallback(controlEventHandler || identity)
        )(event);
      };
    }

    attachNode() {
      const node = findDOMNode && findDOMNode(this);

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
      if (!fieldValue) return modelValue;

      const fieldValidity = getValidity(validators, modelValue);
      const fieldErrors = getValidity(errorValidators, modelValue);

      const errors = validators
        ? merge(invertValidity(fieldValidity), fieldErrors)
        : fieldErrors;

      if (!shallowEqual(errors, fieldValue.errors)) {
        dispatch(mergeOrSetErrors(model, errors));
      }

      return modelValue;
    }

    render() {
      const {
        controlProps = emptyControlProps,
        component,
        control,
        getRef,
      } = this.props;

      const mappedProps = omit(this.getMappedProps(), disallowedProps);

      if (getRef) {
        mappedProps.ref = getRef;
      }

      // If there is an existing control, clone it
      if (control) {
        return cloneElement(
          control,
          mappedProps,
          controlProps.children);
      }

      return createElement(
        component,
        {
          ...controlProps,
          ...mappedProps,
        });
    }
  }

  Control.displayName = 'Control';

  Control.propTypes = propTypes;

  Control.defaultProps = {
    changeAction: s.actions.change,
    updateOn: 'change',
    asyncValidateOn: 'blur',
    parser: identity,
    controlProps: emptyControlProps,
    ignore: [],
    dynamic: false,
    mapProps: controlPropsMap.default,
    component: 'input',
  };

  function mapStateToProps(state, props) {
    const {
      model,
      controlProps = omit(props, Object.keys(propTypes)),
    } = props;

    const modelString = getModel(model, state);
    const fieldValue = s.getFieldFromState(state, modelString)
      || initialFieldState;

    return {
      model: modelString,
      modelValue: s.get(state, modelString),
      fieldValue,
      controlProps,
    };
  }

  const ConnectedControl = resolveModel(connect(mapStateToProps)(Control));

  /* eslint-disable react/prop-types */
  ConnectedControl.input = (props) => (
    <ConnectedControl
      component="input"
      mapProps={{
        ...controlPropsMap.default,
        ...props.mapProps,
      }}
      {...omit(props, 'mapProps')}
    />
  );

  ConnectedControl.text = (props) => (
    <ConnectedControl
      component="input"
      mapProps={{
        ...controlPropsMap.text,
        type: 'text',
        ...props.mapProps,
      }}
      {...omit(props, 'mapProps')}
    />
  );

  ConnectedControl.textarea = (props) => (
    <ConnectedControl
      component="textarea"
      mapProps={{
        ...controlPropsMap.textarea,
        ...props.mapProps,
      }}
      {...omit(props, 'mapProps')}
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
      {...omit(props, 'mapProps')}
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
      changeAction={props.changeAction || s.actions.checkWithValue}
      {...omit(props, 'mapProps')}
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
      {...omit(props, 'mapProps')}
    />
  );

  ConnectedControl.select = (props) => (
    <ConnectedControl
      component="select"
      mapProps={{
        ...controlPropsMap.select,
        ...props.mapProps,
      }}
      {...omit(props, 'mapProps')}
    />
  );

  ConnectedControl.button = (props) => (
    <ConnectedControl
      component="button"
      mapProps={{
        ...controlPropsMap.button,
        ...props.mapProps,
      }}
      {...omit(props, 'mapProps')}
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
      {...omit(props, 'mapProps')}
    />
  );

  return ConnectedControl;
}

export {
  createControlClass,
};
export default createControlClass();
