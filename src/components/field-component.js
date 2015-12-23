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
  let value = input.props.value || props.value;
  let updateOn = `on${capitalize(props.updateOn || 'change')}`;

  let {
    change
  } = bindActionCreators(modelActions, dispatch);

  let {
    focus,
    blur
  } = bindActionCreators(fieldActions, dispatch);

  let defaultProps = {
    name: model,
    checked: contains(get(props, model), value),
    onFocus: () => focus(model),
    onBlur: () => blur(model)
  };

  return React.cloneElement(
    input,
    Object.assign({},
    defaultProps,
    {
      [updateOn]: compose(
        defaultProps[updateOn] || identity,
        () => change(model, value))
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
