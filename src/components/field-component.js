import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import contains from 'lodash/collection/contains';
import get from 'lodash/object/get';
import defaults from 'lodash/object/defaults';
import compose from 'lodash/function/compose';
import capitalize from 'lodash/string/capitalize';
import identity from 'lodash/utility/identity';
import mapValues from 'lodash/object/mapValues';
import isEqual from 'lodash/lang/isEqual';
import partial from 'lodash/function/partial';

import {
  change,
  toggle,
  xor
} from '../actions/model-actions';
import {
  focus,
  blur,
  setValidity,
  asyncSetValidity
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
  'password': (props) => controlPropsMap['text'](props),
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

const changeMethod = (model, value, action = change, parser = (a) => a) => {
  return compose(partial(action, model), parser, getValue);
};

const controlActionMap = {
  'checkbox': (props) => isMulti(props.model)
    ? xor
    : toggle,
  'default': () => change
};

class Field extends React.Component {
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
      parse
    } = props;
    let value = control.props.value;
    let updateOn = (typeof props.updateOn === 'function')
      ? 'onChange'
      : `on${capitalize(props.updateOn || 'change')}`;
    let validateOn = `on${capitalize(props.validateOn || 'change')}`;
    let asyncValidateOn = `on${capitalize(props.asyncValidateOn || 'blur')}`;

    let defaultProps = {};

    let eventActions = {
      onFocus: [() => dispatch(focus(model))],
      onBlur: [() => dispatch(blur(model))],
      onChange: []
    };

    let controlType = control.type === 'input'
      ? control.props.type
      : control.type;


    let createControlProps = controlPropsMap[controlType];

    let controlProps = createControlProps
      ? createControlProps(props)
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

    let controlChangeMethod = changeMethod(props.model, props.value, controlAction, parse);

    let dispatchChange = control.props.hasOwnProperty('value')
      && controlType !== 'text'
      ? () => dispatch(controlChangeMethod(value))
      : (e) => dispatch(controlChangeMethod(e));

    if (typeof props.updateOn === 'function') {
      dispatchChange = props.updateOn(dispatchChange);
    }

    eventActions[updateOn].push(dispatchChange);

    if (validators) {
      let dispatchValidate = (e) => {
        let validatingValue = control.props.hasOwnProperty('value')
          ? value
          : e.target.value;
        let validity = mapValues(validators,
          (validator) => validator(validatingValue));

        dispatch(setValidity(model, validity));
      }

      eventActions[validateOn].push(dispatchValidate);
    }

    if (asyncValidators) {
      let dispatchAsyncValidate = (e) => {
        let validatingValue = control.props.hasOwnProperty('value')
          ? value
          : e.target.value;

        mapValues(asyncValidators,
          (validator, key) => dispatch(asyncSetValidity(model, (value, done) => {
            const outerDone = (valid) => done({ [key]: valid });

            validator(value, outerDone);
          })));
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
      return <div {...props}>
        { React.Children.map(props.children, (child) => this.createField(child, props)) }
      </div>
    }

    return this.createField(React.Children.only(props.children), props);
  }
}

export default connect(selector)(Field);
