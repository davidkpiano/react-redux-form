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


function createField(input, props) {
  let { dispatch } = props;
  let model = props.model;
  let modelValue = props.modelValue;
  let value = input.props.value || props.value || '';
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


  switch (input.type) {
    case 'input':
      switch (input.props.type) {
        case 'checkbox':
          defaultProps = {
            name: model,
            checked: contains(modelValue, value),
            onFocus: () => focus(model),
            onBlur: () => blur(model)
          };

          changeMethod = toggle;

          break;

        case 'radio':
          defaultProps = {
            name: model,
            checked: modelValue === value,
            onFocus: () => focus(model),
            onBlur: () => blur(model)
          };

          break;

        case 'text':
        case 'password':
          defaultProps = {
            name: model,
            defaultValue: modelValue,
            onFocus: () => focus(model),
            onBlur: () => blur(model)
          };

          break;
      }
  }

  let dispatchChange = input.props.hasOwnProperty('value')
    ? () => dispatch(changeMethod(model, value))
    : (e) => dispatch(changeMethod(model, e));

  return React.cloneElement(
    input,
    Object.assign({},
    defaultProps,
    {
      [updateOn]: compose(
        defaultProps[updateOn] || identity,
        dispatchChange)
    })
  );
}

function selector(state, { model }) {
  return {
    model,
    modelValue: get(state, model)
  };
}

const Field = connect(selector)((props) => {
  if (props.children.length > 1) {
    return <div {...props}>
      { React.Children.map(props.children, (child) => createField(child, props)) }
    </div>
  }

  return createField(React.Children.only(props.children), props);
});

export default Field;
