import React, { Component, createElement, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import identity from '../utils/identity';
import shallowEqual from '../utils/shallow-equal';
import _get from '../utils/get';
import merge from '../utils/merge';
import mapValues from '../utils/map-values';
import isPlainObject, { isObjectLike } from '../utils/is-plain-object';
import i from 'icepick';
import omit from '../utils/omit';
import actionTypes from '../action-types';
import debounce from '../utils/debounce';

import _getValue, { getCheckboxValue } from '../utils/get-value';
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
import initialFieldState from '../constants/initial-field-state';
import containsEvent from '../utils/contains-event';

const findDOMNode = !isNative
  ? require('react-dom').findDOMNode
  : null;

const disallowedProps = ['changeAction', 'getFieldFromState', 'store'];

function mergeOrSetErrors(model, errors, options) {
  return actions.setErrors(model, errors, {
    merge: isObjectLike(errors),
    ...options,
  });
}

const propTypes = {
  model: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
  ]).isRequired,
  modelValue: PropTypes.any,
  viewValue: PropTypes.any,
  defaultValue: PropTypes.any,
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
  withField: PropTypes.bool,
  debounce: PropTypes.number,
  persist: PropTypes.bool,
  getValue: PropTypes.func,
  isToggle: PropTypes.bool,

  // HTML5 attributes
  formNoValidate: PropTypes.bool,
};

const htmlAttributes = ['formNoValidate'];
const disallowedPropTypeKeys = Object.keys(propTypes)
  .filter(key => htmlAttributes.indexOf(key) === -1);

const defaultStrategy = {
  get: _get,
  getFieldFromState,
  actions,
};

function createControlClass(s = defaultStrategy) {
  const emptyControlProps = {};
  const emptyMapProps = {};

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
      this.forceHandleUpdate = this.createEventHandler('change', true).bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleLoad = this.handleLoad.bind(this);
      this.getMappedProps = this.getMappedProps.bind(this);
      this.attachNode = this.attachNode.bind(this);

      if (props.debounce) {
        this.handleUpdate = debounce(this.handleUpdate, props.debounce);
      }

      this.willValidate = false;

      this.state = {
        viewValue: props.modelValue,
      };
    }

    componentDidMount() {
      this.attachNode();
      this.handleLoad();
    }

    componentWillReceiveProps({ modelValue }) {
      if (modelValue !== this.props.modelValue) {
        this.setViewValue(modelValue);
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
        persist,
      } = this.props;

      if (!persist && fieldValue && !fieldValue.valid) {
        const keys = Object.keys(validators)
          .concat(Object.keys(errors), this.willValidate ? validityKeys : []);

        dispatch(actions.resetValidity(model, keys));
      }

      // flush debounced model changes
      if (this.handleUpdate.flush) {
        this.handleUpdate.flush();
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
      } else if (typeof mapProps === 'function') {
        return mapProps(originalProps);
      }

      return emptyMapProps;
    }

    getChangeAction(event) {
      return this.props.changeAction(
        this.props.model,
        this.getValue(event), {
          currentValue: this.props.modelValue,
          external: false,
        });
    }

    getValidateAction(value, eventName, forceUpdate = false) {
      const {
        validators,
        errors,
        model,
        modelValue,
        updateOn,
        fieldValue,
      } = this.props;

      if (!validators && !errors && !this.willValidate) return false;

      const nodeErrors = this.getNodeErrors();

      // If it is not a change event, use the model value.
      const valueToValidate = forceUpdate || containsEvent(updateOn, eventName)
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
        validateOn,
        asyncValidateOn,
        dispatch,
        getValue,
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
      // unless sync and async validation occur simultaneously
      if (validateOn !== asyncValidateOn) {
        const asyncValidatorKeys = Object.keys(asyncValidators);
        const syncValid = Object.keys(fieldValue.validity).every((key) => {
          // If validity is based on async validator, skip
          if (!!~asyncValidatorKeys.indexOf(key)) return true;

          return fieldValue.validity[key];
        });

        if (!syncValid) return false;
      }

      dispatch(actions.setValidating(model, true));

      mapValues(asyncValidators, (validator, key) => {
        const outerDone = (valid) => {
          const validity = i.merge(fieldValue.validity, { [key]: valid });

          dispatch(actions.setValidity(model, validity));
        };

        validator(getValue(valueToValidate, this.props), outerDone);
      });

      return valueToValidate;
    }

    getNodeErrors() {
      const {
        node,
        props: { fieldValue, formNoValidate },
      } = this;

      if (formNoValidate || !node || (node && !node.willValidate)) {
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
      if (!this.props.isToggle) {
        this.setState({ viewValue: this.parse(viewValue) });
      }
    }

    getValue(event) {
      return this.props.getValue(event, this.props);
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
                !this.props.isToggle
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
              this.validate({ clearIntents: intent });
            }
            return;

          case 'load':
            if (!shallowEqual(modelValue, fieldValue.value)) {
              dispatch(actions.load(model, fieldValue.value, { clearIntents: intent }));
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
      if (event && event.persist) event.persist();

      this.setViewValue(this.getValue(event));
      this.handleUpdate(event);
    }

    handleKeyPress(event) {
      const {
        controlProps: { onKeyPress },
      } = this.props;

      if (onKeyPress) onKeyPress(event);

      if (event.key === 'Enter') {
        this.forceHandleUpdate(event);
      }
    }

    handleLoad() {
      const {
        model,
        modelValue,
        fieldValue,
        controlProps,
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
      } else if (this.props.hasOwnProperty('defaultValue')) {
        defaultValue = this.props.defaultValue;
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

    createEventHandler(eventName, forceUpdate = false) {
      const eventAction = {
        focus: actions.silentFocus,
        blur: actions.blur,
      }[eventName];

      const dispatchBatchActions = (persistedEvent) => {
        const {
          dispatch,
          model,
          updateOn,
          validateOn = updateOn,
          asyncValidateOn,
        } = this.props;

        const eventActions = [
          eventAction && eventAction(model),
          (forceUpdate || containsEvent(validateOn, eventName))
            && this.getValidateAction(persistedEvent, eventName, forceUpdate),
          (forceUpdate || containsEvent(asyncValidateOn, eventName))
            && this.getAsyncValidateAction(persistedEvent, eventName),
          (forceUpdate || containsEvent(updateOn, eventName))
            && this.getChangeAction(persistedEvent),
        ];

        dispatchBatchIfNeeded(model, eventActions, dispatch);

        return persistedEvent;
      };

      return (event) => {
        const {
          controlProps,
          parser,
          ignore,
          withField,
          fieldValue,
        } = this.props;

        const controlEventHandler = {
          focus: controlProps.onFocus,
          blur: controlProps.onBlur,
          change: controlProps.onChange,
        }[eventName];

        if (containsEvent(ignore, eventName)) {
          return controlEventHandler
            ? controlEventHandler(event)
            : event;
        }

        if (this.props.isToggle) {
          return compose(
            dispatchBatchActions,
            persistEventWithCallback(controlEventHandler || identity)
          )(event);
        }

        return compose(
          dispatchBatchActions,
          parser,
          (e) => this.getValue(e),
          persistEventWithCallback(controlEventHandler || identity)
        )(event, withField ? fieldValue : undefined);
      };
    }

    attachNode() {
      const node = findDOMNode && findDOMNode(this);

      if (node) {
        this.node = node;
        this.willValidate = node.willValidate;
      }
    }

    validate(options) {
      const {
        model,
        modelValue,
        fieldValue,
        validators,
        errors: errorValidators,
        dispatch,
      } = this.props;

      if ((!validators && !errorValidators && !this.willValidate) || !fieldValue) {
        return;
      }

      const fieldValidity = getValidity(validators, modelValue);
      const fieldErrors = getValidity(errorValidators, modelValue);
      const nodeErrors = this.getNodeErrors();

      let errors = validators
        ? merge(invertValidity(fieldValidity), fieldErrors)
        : fieldErrors;

      if (this.willValidate) {
        errors = merge(errors, nodeErrors);
      }

      if (!shallowEqual(errors, fieldValue.errors)) {
        dispatch(mergeOrSetErrors(model, errors, options));
      } else if (options.clearIntents) {
        dispatch(actions.clearIntents(model, options.clearIntents));
      }
    }

    render() {
      const {
        controlProps,
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
    component: 'input',
    withField: true,
    persist: false,
    getValue: _getValue,
    isToggle: false,
  };

  function mapStateToProps(state, props) {
    const {
      model,
      controlProps,
    } = props;

    const finalControlProps = {
      ...controlProps,
      ...omit(props, disallowedPropTypeKeys),
    };

    const modelString = getModel(model, state);
    const fieldValue = s.getFieldFromState(state, modelString)
      || initialFieldState;

    return {
      model: modelString,
      modelValue: s.get(state, modelString),
      fieldValue,
      controlProps: finalControlProps,
    };
  }

  const ConnectedControl = resolveModel(connect(mapStateToProps, null, null, {
    areOwnPropsEqual(ownProps, nextOwnProps) {
      return shallowEqual(ownProps, nextOwnProps, {
        omitKeys: ['mapProps'],
      });
    },
    areStatePropsEqual(stateProps, nextStateProps) {
      return shallowEqual(stateProps, nextStateProps, {
        deepKeys: ['controlProps'],
      });
    },
  })(Control), ['controlProps'], ['mapProps']);

  /* eslint-disable react/prop-types */
  /* eslint-disable react/no-multi-comp */
  class DefaultConnectedControl extends React.Component {
    shouldComponentUpdate(nextProps, nextState, nextContext) {
      return !shallowEqual(this.context, nextContext) || !shallowEqual(this.props, nextProps, {
        deepKeys: ['controlProps'],
        omitKeys: ['mapProps'],
      });
    }

    render() {
      return (
        <ConnectedControl
          {...this.props}
          mapProps={{
            ...controlPropsMap.default,
            ...this.props.mapProps,
          }}
        />
      );
    }
  }

  // Copy the context types so that we can properly implement shouldComponentUpdate
  DefaultConnectedControl.contextTypes = ConnectedControl.contextTypes;

  DefaultConnectedControl.custom = ConnectedControl;

  class DefaultConnectedControlInput extends DefaultConnectedControl {
    render() {
      return (
        <ConnectedControl
          component="input"
          {...this.props}
          mapProps={{
            ...controlPropsMap.default,
            ...this.props.mapProps,
          }}
        />
      );
    }
  }

  DefaultConnectedControl.input = DefaultConnectedControlInput;

  class DefaultConnectedControlText extends DefaultConnectedControl {
    render() {
      return (
        <ConnectedControl
          component="input"
          {...this.props}
          mapProps={{
            ...controlPropsMap.text,
            type: this.props.type || 'text',
            ...this.props.mapProps,
          }}
        />
      );
    }
  }

  DefaultConnectedControl.text = DefaultConnectedControlText;

  class DefaultConnectedControlTextArea extends DefaultConnectedControl {
    render() {
      return (
        <ConnectedControl
          component="textarea"
          {...this.props}
          mapProps={{
            ...controlPropsMap.textarea,
            ...this.props.mapProps,
          }}
        />
      );
    }
  }

  DefaultConnectedControl.textarea = DefaultConnectedControlTextArea;

  class DefaultConnectedControlRadio extends DefaultConnectedControl {
    render() {
      return (
        <ConnectedControl
          component="input"
          type="radio"
          isToggle
          {...this.props}
          mapProps={{
            ...controlPropsMap.radio,
            ...this.props.mapProps,
          }}
        />
      );
    }
  }

  DefaultConnectedControl.radio = DefaultConnectedControlRadio;

  class DefaultConnectedControlCheckbox extends DefaultConnectedControl {
    render() {
      return (
        <ConnectedControl
          component="input"
          type="checkbox"
          isToggle
          {...this.props}
          mapProps={{
            ...controlPropsMap.checkbox,
            ...this.props.mapProps,
          }}
          getValue={getCheckboxValue}
          changeAction={this.props.changeAction || s.actions.checkWithValue}
        />
      );
    }
  }

  DefaultConnectedControl.checkbox = DefaultConnectedControlCheckbox;

  class DefaultConnectedControlFile extends DefaultConnectedControl {
    render() {
      return (
        <ConnectedControl
          component="input"
          type="file"
          {...this.props}
          mapProps={{
            ...controlPropsMap.file,
            ...this.props.mapProps,
          }}
        />
      );
    }
  }

  DefaultConnectedControl.file = DefaultConnectedControlFile;

  class DefaultConnectedControlSelect extends DefaultConnectedControl {
    render() {
      return (
        <ConnectedControl
          component="select"
          {...this.props}
          mapProps={{
            ...controlPropsMap.select,
            ...this.props.mapProps,
          }}
        />
      );
    }
  }

  DefaultConnectedControl.select = DefaultConnectedControlSelect;

  class DefaultConnectedControlButton extends DefaultConnectedControl {
    render() {
      return (
        <ConnectedControl
          component="button"
          {...this.props}
          mapProps={{
            ...controlPropsMap.button,
            ...this.props.mapProps,
          }}
        />
      );
    }
  }

  DefaultConnectedControl.button = DefaultConnectedControlButton;

  class DefaultConnectedControlReset extends DefaultConnectedControl {
    render() {
      return (
        <ConnectedControl
          component="button"
          type="reset"
          {...this.props}
          mapProps={{
            ...controlPropsMap.reset,
            ...this.props.mapProps,
          }}
        />
      );
    }
  }

  DefaultConnectedControl.reset = DefaultConnectedControlReset;

  return DefaultConnectedControl;
}

export {
  createControlClass,
};
export default createControlClass();
