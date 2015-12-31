import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import contains from 'lodash/collection/contains';
import get from 'lodash/object/get';
import defaults from 'lodash/object/defaults';
import compose from 'lodash/function/compose';
import capitalize from 'lodash/string/capitalize';
import identity from 'lodash/utility/identity';

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
    if (!control.props) return control;

    let { dispatch, model, modelValue } = props;
    let value = control.props.value;
    let updateOn = `on${capitalize(props.updateOn || 'change')}`;

    let {
      change,
      toggle
    } = modelActions;

    let {
      focus,
      blur
    } = bindActionCreators(fieldActions, dispatch);

    let defaultProps = {};

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
                : !!modelValue,
              onFocus: () => focus(model),
              onBlur: () => blur(model)
            };

            changeMethod = isMulti(model)
              ? xor
              : toggle;

            break;

          case 'radio':
            defaultProps = {
              name: model,
              checked: modelValue === value,
              onFocus: () => focus(model),
              onBlur: () => blur(model)
            };

            break;

          default:
            defaultProps = {
              name: model,
              defaultValue: modelValue,
              onFocus: () => focus(model),
              onBlur: () => blur(model)
            };

            dispatchChange = (e) => dispatch(changeMethod(model, e));

            break;
        }
        break;
      default:
        defaultProps = {
          onFocus: () => focus(model),
          onBlur: () => blur(model)
        };

        dispatchChange = (e) => dispatch(changeMethod(model, e));

        break;
    }

    return React.cloneElement(
      control,
      Object.assign({},
      defaultProps,
      {
        [updateOn]: compose(
          defaultProps[updateOn] || identity,
          dispatchChange)
      })
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
