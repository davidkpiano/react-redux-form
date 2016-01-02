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

import * as modelActions from '../actions/model-actions';
import * as fieldActions from '../actions/field-actions';

import {
  isMulti
} from '../utils';

function selector(state, { model }) {
  return {
    model,
    modelValue: get(state, model)
  };
}

class Field extends React.Component {
  createField(control, props) {
    if (!control || !control.props) return control;

    if (control.props.children && control.props.children.length) {
      return React.cloneElement(
        control,
        {
          children: React.Children.map(
            control.props.children,
            (child) => this.createField(child, props)
          )
        });
    }

    let {
      dispatch,
      model,
      modelValue,
      validators,
      asyncValidators } = props;
    let value = control.props.value;
    let updateOn = `on${capitalize(props.updateOn || 'change')}`;
    let validateOn = `on${capitalize(props.validateOn || 'change')}`;
    let asyncValidateOn = `on${capitalize(props.asyncValidateOn || 'blur')}`;

    let {
      change,
      toggle,
      xor
    } = modelActions;

    let {
      focus,
      blur,
      setValidity,
      asyncSetValidity
    } = bindActionCreators(fieldActions, dispatch);

    let defaultProps = {};

    let eventActions = {
      onFocus: [() => focus(model)],
      onBlur: [() => blur(model)],
      onChange: []
    };

    let changeMethod = change;

    let dispatchChange = control.props.hasOwnProperty('value')
      ? () => dispatch(changeMethod(model, value))
      : (e) => dispatch(changeMethod(model, e));

    switch (control.type) {
      case 'input':
      case 'textarea':
        switch (control.props.type) {
          case 'checkbox':
            defaultProps = {
              name: model,
              checked: isMulti(model)
                ? contains(modelValue, value)
                : !!modelValue
            };

            changeMethod = isMulti(model)
              ? xor
              : toggle;

            break;

          case 'radio':
            defaultProps = {
              name: model,
              checked: modelValue === value
            };

            break;

          default:
            defaultProps = {
              name: model,
              defaultValue: modelValue
            };

            dispatchChange = (e) => dispatch(changeMethod(model, e));

            break;
        }
        break;
      case 'select':
        defaultProps = {
          onFocus: () => focus(model),
          onBlur: () => blur(model)
        };

        dispatchChange = (e) => dispatch(changeMethod(model, e));

        break;
      default:
        return control;
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
          (validator, key) => asyncSetValidity(model, (value, done) => {
            const outerDone = (valid) => done({ [key]: valid });

            validator(value, outerDone);
          }));
      }

      eventActions[asyncValidateOn].push(dispatchAsyncValidate);
    }

    return React.cloneElement(
      control,
      Object.assign({},
      defaultProps,
      mapValues(eventActions, (actions) => compose(...actions)))
    );
  }

  shouldComponentUpdate(nextProps) {
    return this.props.modelValue !== nextProps.modelValue;
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
