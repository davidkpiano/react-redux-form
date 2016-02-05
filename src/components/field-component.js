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

  createField(control, props) {
    if (!control
      || !control.props
      || Object.hasOwnProperty(control.props, 'modelValue')
    ) return control;

    let {
      dispatch,
      model,
      modelValue,
      validators,
      asyncValidators,
      parser,
      updateOn: updater = identity
    } = props;
    let value = control.props.value;
    let updateOn = (typeof props.updateOn === 'function')
      ? 'onChange'
      : `on${capitalize(props.updateOn || 'change')}`;
    let updaterFn = (typeof updater === 'function')
      ? updater
      : identity;
    let validateOn = `on${capitalize(props.validateOn || 'change')}`;
    let asyncValidateOn = `on${capitalize(props.asyncValidateOn || 'blur')}`;

    let defaultProps = {
      ref: (controlDOMNode) => this._control = controlDOMNode
    };

    let eventActions = {
      onFocus: [() => dispatch(focus(model))],
      onBlur: [() => dispatch(blur(model))],
      onChange: []
    };

    let controlType = (this.props.type
      || control.type === 'input')
        ? control.props.type
        : control.type;

    if (!controlType || !isString(controlType)) {
      controlType = (control.type.propTypes
        && control.type.propTypes.onChange)
        ? (this.props.control || 'text')
        : null;
      console.log(controlType);
    }

    let createControlProps = controlPropsMap[controlType]
      || (control.type === 'input' && controlPropsMap['text'])
      || null;

    let controlProps = createControlProps
      ? {
          ...defaultProps,
          ...createControlProps({
            model,
            modelValue,
            value
          })
        }
      : null;

    if (!controlProps) {
      return React.cloneElement(
        control,
        {
          children: React.Children.map(
            control.props.children,
            (child) => this.createField(child, {...props, ...child.props})
          )
        });
    }

    let controlAction = (controlActionMap[controlType] || controlActionMap.default)(props);

    let controlChangeMethod = changeMethod(props.model, props.value, controlAction, parser);

    let dispatchChange = control.props.hasOwnProperty('value')
      && isReadOnlyValue(control)
      ? () => dispatch(controlChangeMethod(value))
      : (e) => dispatch(controlChangeMethod(e));

    eventActions[updateOn].push(updaterFn(dispatchChange));

    if (validators) {
      let dispatchValidate = (value) => {
        let validity = mapValues(validators,
          (validator) => validator(getValue(value)));

        dispatch(setValidity(model, validity));

        return value;
      }

      eventActions[validateOn].push(dispatchValidate);
    }

    if (asyncValidators) {
      let dispatchAsyncValidate = (value) => {
        mapValues(asyncValidators,
          (validator, key) => dispatch(asyncSetValidity(model, (_, done) => {
            const outerDone = (valid) => done({ [key]: valid });

            validator(getValue(value), outerDone);
          })));

        return value;
      }

      eventActions[asyncValidateOn].push(dispatchAsyncValidate);
    }

    return (
      <Control
        {...controlProps}
        {...mapValues(eventActions, (actions) => compose(...actions))}
        modelValue={modelValue}
        control={control} />
    );
  }

  render() {
    let { props } = this;

    if (props.children.length > 1) {
      return (
        <div {...props}>
          { React.Children.map(
            props.children,
            (child) => this.createField(child, props))
          }
        </div>
      );
    }

    return this.createField(React.Children.only(props.children), props);
  }
}

export default connect(selector)(Field);
