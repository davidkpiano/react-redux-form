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

const controlPropsMap = {
  'text': (props) => ({
    name: props.model,
    defaultValue: props.modelValue
  }),
  'textarea': (props) => ({
    name: props.model,
    defaultValue: props.modelValue
  }),
  'checkbox': (props) => ({
    name: props.model,
    checked: isMulti(props.model)
      ? (props.modelValue || [])
        .filter((item) => isEqual(item, props.value))
        .length
      : !!props.modelValue
  }),
  'radio': (props) => ({
    name: props.model,
    checked: isEqual(props.modelValue, props.value),
    value: props.value
  }),
  'select': (props) => ({
    name: props.model,
    value: props.modelValue
  }),
  'default': (props) => ({})
};

const changeMethod = (model, value, action = change, parser = identity) => {
  return compose(partial(action, model), parser, getValue);
};

const isReadOnlyValue = (control) => {
  return control.type == 'input'
    && ~['radio', 'checkbox'].indexOf(control.props.type);
};

const controlActionMap = {
  'checkbox': (props) => isMulti(props.model)
    ? xor
    : toggle,
  'default': () => change
};

function getControlType(control, mapping) {
  let mappedControlType = mapping[control.type.name] || control.type;

  let controlType = mappedControlType === 'input'
    ? control.props.type
    : mappedControlType;

  if (!controlType || !isString(controlType)) {
    controlType = (control.type.propTypes
      && control.type.propTypes.onChange)
      ? 'text'
      : null;
  }

  if (!controlPropsMap[controlType]) {
    controlType = control.type === 'input'
      ? 'text'
      : null;
  }

  return controlType;
}

function createFieldProps(control, props, mapping) {
  let {
    model,
    modelValue
  } = props;
  let value = control.props.value;

  let defaultProps = {};

  let controlType = props.type || getControlType(control, mapping);

  if (!controlType) {
    return false;
  }

  let controlProps = {
    ...defaultProps,
    ...controlPropsMap[controlType]({
      model,
      modelValue,
      value
    }),
    ...sequenceEventActions(control, props, mapping)
  };

  return controlProps;
}

function sequenceEventActions(control, props, mapping) {
  let {
    dispatch,
    model
  } = props;
  let controlType = props.type || getControlType(control, mapping);
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

function createField(control, props, mapping) {
  if (!control
    || !control.props
    || Object.hasOwnProperty(control.props, 'modelValue')
  ) return control;

  const controlProps = createFieldProps(control, props, mapping);
  const eventActions = sequenceEventActions(control, props, mapping);

  if (!controlProps) {
    return React.cloneElement(
      control,
      {
        children: React.Children.map(
          control.props.children,
          (child) => createField(child, {...props, ...child.props}, mapping)
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
      React.PropTypes.oneOf(Object.keys(controlPropsMap))
    ])
  };

  static mapControls = (mapping) => {
    return connect(selector)(class CustomField extends Field {
      constructor() {
        super();

        this.controlMapping = mapping;
      }
    })
  };

  constructor() {
    super();

    this.controlMapping = {};
  }

  render() {
    const { props } = this;

    if (props.children.length > 1) {
      return (
        <div {...props}>
          { React.Children.map(
            props.children,
            (child) => createField(child, props, this.controlMapping))
          }
        </div>
      );
    }

    return createField(React.Children.only(props.children), props, this.controlMapping);
  }
}

export default connect(selector)(Field);
