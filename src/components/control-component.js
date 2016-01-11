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
  isMulti,
  getValue
} from '../utils';

class Control extends React.Component {
  componentWillMount() {
    this.handleChange = (e) => {
      e.persist && e.persist();
      return this.props.onChange(e);
    }
  }

  render() {
    let { children, control } = this.props;

    return React.cloneElement(
      control,
      {
        ...this.props,
        onChange: this.handleChange,
        ...control.props
      });
  }

  shouldComponentUpdate(nextProps) {
    return this.props.modelValue !== nextProps.modelValue;
  }
}

export default Control;
