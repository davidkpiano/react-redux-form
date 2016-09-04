import { Component, createElement, cloneElement, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import connect from 'react-redux/lib/components/connect';
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
  ]),
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
  formatter: PropTypes.func,
  getter: PropTypes.func,
  ignore: PropTypes.arrayOf(PropTypes.string),
  dynamic: PropTypes.bool,
};

function mapStateToProps(state, props) {
  const {
    model,
    mapProps,
    getter = _get,
    controlProps = omit(props, Object.keys(propTypes)),
  } = props;


  if (!mapProps) return props;

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

/**
 * @private
 */
const emptyControlProps = {};

/**
 * @public 
 * 
 * The <Control> component creates a React component that represents
 * a form control, including these standard form controls:
 *
 * - <Control> or <Control.input> for <input>
 * - <Control.text> for <input type="text">
 * - <Control.radio> for <input type="radio">
 * - <Control.checkbox> for <input type="checkbox">
 * - <Control.select> for <select>
 * - <Control.file> for <input type="file">
 */
class Control extends Component {
  /**
   * @private
   * 
   */
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

  /**
   * @private
   * 
   * Attaches DOM node and calls `this.handleLoad()`
   */
  componentDidMount() {
    this.attachNode();
    this.handleLoad();
  }

  /**
   * @private
   * 
   * Updates `this.state.viewValue` if model was externally updated.
   */
  componentWillReceiveProps(nextProps) {
    const { modelValue } = nextProps;

    if (modelValue !== this.props.modelValue) {
      this.setViewValue(modelValue, nextProps);
    }
  }

  /**
   * @private
   * 
   * Shallow compares `props`, `props.controlProps`, and `state.viewValue` to 
   * determine if component should be updated.
   */
  shouldComponentUpdate(nextProps, nextState) {
    const result =
      !shallowEqual(this.props, nextProps, ['controlProps'])
      || !shallowEqual(this.props.controlProps, nextProps.controlProps)
      || !shallowEqual(this.state.viewValue, nextState.viewValue);

    return result;
  }

  /**
   * @private
   * 
   * Toggles validation if the `modelValue` changed, and ensures that
   * the control is properly focused/blurred.
   */
  componentDidUpdate(prevProps) {
    const {
      modelValue,
      fieldValue,
      updateOn,
      validateOn = updateOn,
      validators,
      errors,
    } = this.props;

    if ((validators || errors)
      && fieldValue
      && !fieldValue.validated
      && modelValue !== prevProps.modelValue
      && validateOn === 'change'
    ) {
      this.validate();
    }

    // Manually focus/blur node
    handleFocus(fieldValue, this.node);
  }

  /**
   * @access private
   * 
   * Resets validity of validators on `<Control validators={{...}}>` when
   * unmounted.
   */
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

  /**
   * @private
   * 
   * Maps the standard control props to the custom props specified in
   * `<Control mapProps={{...}}>`.
   * @return {object} the mapped props
   */
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

  /**
   * @private
   * 
   * Returns the change action for the control.
   * @param  {Event|*} event the native event or value from an event.
   * @return {function(model: string, value: any)}       [description]
   */
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
      loadActions.push(actions.change(model, defaultValue));
    } else {
      loadActions.push(this.getValidateAction(modelValue));
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
  formatter: identity,
  controlProps: emptyControlProps,
  getter: _get,
  ignore: [],
  dynamic: false,
};

/**
 * @private
 */
const BaseControl = connect(mapStateToProps)(Control);

BaseControl.input = class extends BaseControl {};
BaseControl.input.defaultProps = {
  ...BaseControl.defaultProps,
  component: 'input',
  mapProps: controlPropsMap.default,
};

BaseControl.text = class extends BaseControl {};
BaseControl.text.defaultProps = {
  ...BaseControl.defaultProps,
  component: 'input',
  mapProps: controlPropsMap.text,
};

BaseControl.radio = class extends BaseControl {};
BaseControl.radio.defaultProps = {
  ...BaseControl.defaultProps,
  component: 'input',
  type: 'radio',
  mapProps: controlPropsMap.radio,
};

BaseControl.checkbox = class extends BaseControl {};
BaseControl.checkbox.defaultProps = {
  ...BaseControl.defaultProps,
  component: 'input',
  type: 'checkbox',
  mapProps: controlPropsMap.checkbox,
};

BaseControl.file = class extends BaseControl {};
BaseControl.file.defaultProps = {
  ...BaseControl.defaultProps,
  component: 'input',
  type: 'file',
  mapProps: controlPropsMap.file,
};

BaseControl.select = class extends BaseControl {};
BaseControl.select.defaultProps = {
  ...BaseControl.defaultProps,
  component: 'select',
  mapProps: controlPropsMap.select,
};

export default BaseControl;
