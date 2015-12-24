import React from 'react';
import { contains } from 'lodash/collection';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { defaults, get } from 'lodash/object';
import { compose } from 'lodash/function';
import { capitalize } from 'lodash/string';
import { identity } from 'lodash/utility';

import * as modelActions from '../actions/model-actions';
import * as fieldActions from '../actions/field-actions';

import {
  isMulti
} from '../utils';


function createField(input, props) {
  let { dispatch } = props;
  let model = props.model;
  let value = input.props.value || props.value || '';
  let updateOn = `on${capitalize(props.updateOn || 'change')}`;

  let {
    change
  } = modelActions;

  let {
    focus,
    blur
  } = bindActionCreators(fieldActions, dispatch);

  let defaultProps = {};


  let dispatchChange = input.props.hasOwnProperty('value')
    ? () => dispatch(change(model, value))
    : (e) => dispatch(change(model, e));

  switch (input.type) {
    case 'input':
      switch (input.props.type) {
        case 'checkbox':
        case 'radio':
          defaultProps = {
            name: model,
            checked: contains(get(props, model), value),
            onFocus: () => focus(model),
            onBlur: () => blur(model)
          };
          break;
        case 'text':
        case 'password':
          defaultProps = {
            name: model,
            onFocus: () => focus(model),
            onBlur: () => blur(model)
          };
          break;
      }
  }

  // console.log(input);

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

const Field = connect(s => s)((props) => {
  if (props.children.length > 1) {
    return <div {...props}>
      { React.Children.map(props.children, (child) => createField(child, props)) }
    </div>
  }

  return createField(React.Children.only(props.children), props);
});

export default Field;
