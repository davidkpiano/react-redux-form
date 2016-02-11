import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import get from 'lodash/get';
import { compose } from 'redux';
import capitalize from 'lodash/capitalize';
import identity from 'lodash/identity';
import mapValues from 'lodash/mapValues';
import isEqual from 'lodash/isEqual';
import partial from 'lodash/partial';
import isString from 'lodash/isString';
import findKey from 'lodash/findKey';

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
  setViewValue
} from '../actions/field-actions';

import Control from './control-component';

import {
  isMulti,
  getValue
} from '../utils';

function selector(state, { model }) {
  return {
    model,
    modelValue: get(state, model)
  };
}

export const controlPropsMap = {
  'text': (props) => ({
    ...props,
    name: props.model,
    defaultValue: props.modelValue
  }),
  'textarea': (props) => controlPropsMap.text(props),
  'checkbox': (props) => ({
    ...props,
    name: props.model,
    checked: isMulti(props.model)
      ? (props.modelValue || [])
        .filter((item, eventProps) => isEqual(item, props.value))
        .length
      : !!props.modelValue
  }),
  'radio': (props) => ({
    ...props,
    name: props.model,
    checked: isEqual(props.modelValue, props.value),
    value: props.value
  }),
  'select': (props) => ({
    ...props,
    name: props.model,
    value: props.modelValue
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
  let { controlTypesMap, controlPropsMap } = options;
  let controlType = control.type.name || control.type;
  let mappedControlType = controlTypesMap[controlType] || controlType;

  let finalControlType = mappedControlType === 'input'
    ? control.props.type
    : mappedControlType;

  if (!controlPropsMap[finalControlType]) {
    finalControlType = mappedControlType === 'input'
      ? 'text'
      : null;
  }

  return finalControlType;
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
      value,
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

  if (!controlProps) {
    return React.cloneElement(
      control,
      {
        children: React.Children.map(
          control.props.children,
          (child) => createFieldControlComponent(
            child,
            { ...props, ...child.props },
            options)
        )
      });
  }

  return (
    <Control
      {...controlProps}
      modelValue={props.modelValue}
      control={control} />
  );
}

export function createFieldClass(
  customControlPropsMap = {},
  customControlTypesMap = {}
) {
  class Field extends React.Component {
    static propTypes = {
      model: React.PropTypes.string.isRequired,
      updateOn: React.PropTypes.oneOfType([
        React.PropTypes.func,
        React.PropTypes.oneOf([
          'change',
          'blur',
          'focus'
        ])
      ]),
      validators: React.PropTypes.object,
      asyncValidators: React.PropTypes.object,
      parser: React.PropTypes.func,
      control: React.PropTypes.oneOfType([
        React.PropTypes.func,
        React.PropTypes.string
      ])
    };

    render() {
      const { props } = this;

      const options = {
        controlPropsMap: {
          ...controlPropsMap,
          ...customControlPropsMap
        },
        controlTypesMap: customControlTypesMap
      };

      if (props.children.length > 1) {
        return (
          <div {...props}>
            { React.Children.map(
              props.children,
              (child) => createFieldControlComponent(child, props, options))
            }
          </div>
        );
      }

      return createFieldControlComponent(React.Children.only(props.children), props, options);
    }
  }

  return connect(selector)(Field);
}

export default createFieldClass(controlPropsMap);
