import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';

import _get from 'lodash/get';
import compose from 'redux/lib/compose';
import capitalize from 'lodash/capitalize';
import identity from 'lodash/identity';
import mapValues from 'lodash/mapValues';
import isEqual from 'lodash/isEqual';
import partial from 'lodash/partial';

import {
  change,
  toggle,
  xor
} from '../actions/model-actions';

import {
  focus,
  blur,
  setValidity,
  asyncSetValidity,
} from '../actions/field-actions';

import Control from './control-component';

import {
  isMulti,
  getValue
} from '../utils';

function selector(state, { model }) {
  return {
    model,
    modelValue: _get(state, model)
  };
}

export const controlPropsMap = {
  'text': (props) => ({
    name: props.model,
    defaultValue: props.modelValue,
    ...props
  }),
  'textarea': (props) => controlPropsMap.text(props),
  'checkbox': (props) => ({
    name: props.model,
    checked: isMulti(props.model)
      ? (props.modelValue || [])
        .filter((item, eventProps) => isEqual(item, props.value))
        .length
      : !!props.modelValue,
    ...props
  }),
  'radio': (props) => ({
    name: props.model,
    checked: isEqual(props.modelValue, props.value),
    value: props.value,
    ...props
  }),
  'select': (props) => ({
    name: props.model,
    value: props.modelValue,
    ...props
  }),
  'default': (props) => controlPropsMap.text(props)
};

function changeMethod(model, value, action = change, parser = identity) {
  return compose(partial(action, model), parser, getValue);
}

function isReadOnlyValue(control) {
  return control.type == 'input'
    && ~['radio', 'checkbox'].indexOf(control.props.type);
}

const controlActionMap = {
  'checkbox': (props) => isMulti(props.model)
    ? xor
    : toggle,
  'default': () => change
};

function getControlType(control, options) {
  const { controlPropsMap } = options;

  try {
    let controlDisplayName = control.constructor.displayName
      || control.type.displayName
      || control.type.name
      || control.type + '';

    if (controlDisplayName === 'input') {
      controlDisplayName = controlPropsMap[control.props.type]
        ? control.props.type
        : 'text';
    }

    return controlPropsMap[controlDisplayName]
      ? controlDisplayName
      : null;
  } catch (e) {
    return undefined;
  }
}

function createFieldProps(control, props, options) {
  let {
    model,
    modelValue
  } = props;
  let value = control.props.value;

  let controlType = getControlType(control, options);

  let { controlPropsMap } = options;

  if (!controlType) {
    return false;
  }

  return {
    ...controlPropsMap[controlType]({
      model,
      modelValue,
      ...control.props,
      ...sequenceEventActions(control, props, options)
    })
  };
}

function sequenceEventActions(control, props, options) {
  let {
    dispatch,
    model
  } = props;
  let controlType = props.type || getControlType(control, options);
  let value = control.props.value;

  let updateOn = (typeof props.updateOn === 'function')
    ? 'onChange'
    : `on${capitalize(props.updateOn || 'change')}`;
  let validateOn = `on${capitalize(props.validateOn || 'change')}`;
  let asyncValidateOn = `on${capitalize(props.asyncValidateOn || 'blur')}`;

  let updaterFn = (typeof updater === 'function')
    ? updater
    : identity;

  let eventActions = {
    onFocus: [() => dispatch(focus(model))],
    onBlur: [() => dispatch(blur(model))],
    onChange: []
  };

  let controlAction = (controlActionMap[controlType] || controlActionMap.default)(props);

  let controlChangeMethod = changeMethod(
    model,
    props.value, controlAction, props.parser);

  let dispatchChange = control.props.hasOwnProperty('value')
    && isReadOnlyValue(control)
    ? () => dispatch(controlChangeMethod(value))
    : (e) => dispatch(controlChangeMethod(e));

  eventActions[updateOn].push(updaterFn(dispatchChange));

  if (props.validators) {
    let dispatchValidate = (value) => {
      let validity = mapValues(props.validators,
        (validator) => validator(getValue(value)));

      dispatch(setValidity(model, validity));

      return value;
    }

    eventActions[validateOn].push(dispatchValidate);
  }

  if (props.asyncValidators) {
    let dispatchAsyncValidate = (value) => {
      mapValues(props.asyncValidators,
        (validator, key) => dispatch(asyncSetValidity(model, (_, done) => {
          const outerDone = (valid) => done({ [key]: valid });

          validator(getValue(value), outerDone);
        })));

      return value;
    }

    eventActions[asyncValidateOn].push(dispatchAsyncValidate);
  }

  return mapValues(eventActions, (actions) => compose(...actions));
}

function createFieldControlComponent(control, props, options) {
  if (!control
    || !control.props
    || Object.hasOwnProperty(control.props, 'modelValue')
  ) return control;

  const controlProps = createFieldProps(control, props, options);

  return !controlProps
    ? React.cloneElement(
        control,
        {
          children: React.Children.map(
            control.props.children,
            (child) => createFieldControlComponent(
              child,
              { ...props, ...child.props },
              options)
          )
        })
    : <Control
        {...controlProps}
        modelValue={props.modelValue}
        control={control} />;
}

function getFieldWrapper(props) {
  if (!props.component) {
    if (props.className || props.children.length > 1) {
      return 'div';
    }

    return null;
  }

  return props.component;
}

export function createFieldClass(
  customControlPropsMap = {}
) {
  const options = {
    controlPropsMap: {
      ...controlPropsMap,
      ...customControlPropsMap
    }
  };

  class Field extends Component {
    render() {
      const { props } = this;
      let component = getFieldWrapper(props);

      if (component) {
        return React.createElement(
          component,
          props,
          React.Children.map(
            props.children,
            (child) => createFieldControlComponent(child, props, options))
        );
      }

      return createFieldControlComponent(React.Children.only(props.children), props, options);
    }
  }

  Field.propTypes = {
    model: PropTypes.string.isRequired,
    updateOn: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.oneOf([
        'change',
        'blur',
        'focus'
      ])
    ]),
    validators: PropTypes.object,
    asyncValidators: PropTypes.object,
    parser: PropTypes.func,
    component: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string
    ])
  };

  return connect(selector)(Field);
}

export default createFieldClass(controlPropsMap);
