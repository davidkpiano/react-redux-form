import { Component, createElement, cloneElement, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import connect from 'react-redux/lib/components/connect';
import compose from 'redux/lib/compose';
import identity from 'lodash/identity';
import shallowEqual from '../utils/shallow-equal';
import _get from '../utils/get';
import merge from '../utils/merge';
import mapValues from '../utils/map-values';
import isPlainObject from 'lodash/isPlainObject';
import icepick from 'icepick';
import omit from 'lodash/omit';

import {
  invertValidity,
  getValidity,
  getValue,
} from '../utils';
import getFieldFromState from '../utils/get-field-from-state';
import getModel from '../utils/get-model';
import persistEventWithCallback from '../utils/persist-event-with-callback';
import actions from '../actions';
import isValid from '../form/is-valid';
import controlPropsMap from '../constants/control-props-map';

function mapStateToProps(state, props) {
  const {
    model,
    mapProps,
    getter = _get,
    controlProps = omit(props, Object.keys(Control.propTypes)),
  } = props;

  if (!mapProps) return props;

  const modelString = getModel(model, state);
  const fieldValue = getFieldFromState(state, modelString);

  return {
    model,
    modelValue: getter(state, modelString),
    fieldValue,
    controlProps,
  };
}

function isReadOnlyValue(controlProps) {
  return ~['radio', 'checkbox'].indexOf(controlProps.type);
}

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
      mappedProps: {},
    };
  }

  componentWillMount() {
    const { props, props: { mapProps } } = this;

    this.setState({ mappedProps: this.getMappedProps(props, mapProps) });
  }

  componentDidMount() {
    this.attachNode();
    this.handleLoad();
  }

  componentWillReceiveProps(nextProps) {
    const { mapProps, modelValue } = nextProps;

    this.setState({
      viewValue: modelValue,
      mappedProps: this.getMappedProps(nextProps, mapProps),
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      modelValue,
      fieldValue,
      validateOn,
    } = this.props;

    const { viewValue } = this.state;

    if (fieldValue
      && !fieldValue.validated
      && modelValue !== prevProps.modelValue
      && validateOn === 'change'
    ) {
      this.validate();
    }

    // Detect view value changes
    if (prevState.viewValue !== viewValue) {
      this.updateMappedProps();
    }
  }

  componentWillUnmount() {
    const { model, fieldValue, dispatch } = this.props;

    if (!fieldValue) return;

    if (!isValid(fieldValue)) {
      dispatch(actions.resetValidity(model));
    }
  }

  getMappedProps(props, mapProps) {
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
    const { changeAction = actions.change } = this.state.mappedProps;
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

    if (validators || errors) {
      const fieldValidity = getValidity(validators, value);
      const fieldErrors = getValidity(errors, value);

      const mergedErrors = validators
        ? merge(invertValidity(fieldValidity), fieldErrors)
        : fieldErrors;

      if (!fieldValue || !shallowEqual(mergedErrors, fieldValue.errors)) {
        return actions.setErrors(model, mergedErrors);
      }
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

  updateMappedProps() {
    const { mapProps } = this.props;

    this.setState({
      mappedProps: this.getMappedProps(this.props, mapProps),
    });
  }

  handleChange(event) {
    this.setState({ viewValue: getValue(event) });
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
      controlProps = {},
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

    dispatch(actions.batch(model, loadActions));

    if (onLoad) onLoad(modelValue, fieldValue, this._node);
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

        const dispatchableEventActions = eventActions.filter((action) => !!action);

        if (dispatchableEventActions.length) {
          dispatch(actions.batch(model, dispatchableEventActions));
        }

        return persistedEvent;
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

  attachNode() {
    const node = findDOMNode(this);

    if (node) this._node = node;
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
  getter: PropTypes.func,
};

Control.defaultProps = {
  changeAction: actions.change,
  updateOn: 'change',
  parser: identity,
  formatter: identity,
  controlProps: {},
  getter: _get,
};

const BaseControl = connect(mapStateToProps)(Control);

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
