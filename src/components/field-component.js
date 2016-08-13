import React, { Component, PropTypes } from 'react';

import _get from '../utils/get';
import identity from 'lodash/identity';
import omit from 'lodash/omit';
import isPlainObject from 'lodash/isPlainObject';
import pick from 'lodash/pick';

import actions from '../actions';
import Control from './control-component';
import controlPropsMap from '../constants/control-props-map';
import deepCompareChildren from '../utils/deep-compare-children';
import shallowCompareWithoutChildren from '../utils/shallow-compare-without-children';

if (process.env.NODE_ENV === 'develdopment') {
  const { whyDidYouUpdate } = require('why-did-you-update');
  whyDidYouUpdate(React);
}

const {
  change,
} = actions;


const fieldPropTypes = {
  model: PropTypes.string.isRequired,
  component: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
  ]),
  parser: PropTypes.func,
  updateOn: PropTypes.oneOf([
    'change',
    'blur',
    'focus',
  ]),
  changeAction: PropTypes.func,
  validators: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  asyncValidators: PropTypes.object,
  validateOn: PropTypes.string,
  asyncValidateOn: PropTypes.string,
  errors: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
  ]),
  mapProps: PropTypes.func,
  componentMap: PropTypes.object,
  dynamic: PropTypes.bool,
  dispatch: PropTypes.func,
  getter: PropTypes.func,
};

function getControlType(control, props, options) {
  const { controlPropsMap: _controlPropsMap } = options;

  const controlDisplayNames = Object.keys(_controlPropsMap)
    .filter((controlKey) => {
      const propsMap = _controlPropsMap[controlKey];

      if (isPlainObject(propsMap) && propsMap.component) {
        return control.type === propsMap.component;
      }

      return false;
    });

  if (controlDisplayNames.length) return controlDisplayNames[0];

  try {
    let controlDisplayName = control.constructor.displayName
      || control.type.displayName
      || control.type.name
      || control.type;

    if (controlDisplayName === 'input') {
      controlDisplayName = _controlPropsMap[control.props.type] ? control.props.type : 'text';
    }

    return _controlPropsMap[controlDisplayName] ? controlDisplayName : null;
  } catch (error) {
    return undefined;
  }
}

function createFieldClass(customControlPropsMap = {}, defaultProps = {}) {
  const options = {
    controlPropsMap: {
      ...controlPropsMap,
      ...customControlPropsMap,
    },
  };

  class Field extends Component {
    constructor(props, context) {
      super(props, context);

      if (context.model) {
        this.parentModel = context.model;
      }
    }
    shouldComponentUpdate(nextProps) {
      const { dynamic } = this.props;

      if (dynamic) {
        return deepCompareChildren(this, nextProps);
      }

      return shallowCompareWithoutChildren(this, nextProps);
    }

    createControlComponent(control) {
      const { props } = this;

      if (!control
        || !control.props
        || control instanceof Control) {
        return control;
      }

      const controlType = getControlType(control, props, options);
      const {
        mapProps = options.controlPropsMap[controlType],
      } = props;

      const controlProps = pick(props, Object.keys(fieldPropTypes));

      if (this.parentModel && props.model[0] === '.') {
        controlProps.model = `${this.parentModel}${props.model}`;
      }

      if (!mapProps) {
        return React.cloneElement(
          control,
          null,
          this.mapChildrenToControl(control.props.children)
        );
      }

      return (
        <Control
          {...controlProps}
          control={control}
          controlProps={control.props}
          component={control.type}
          mapProps={mapProps}
        />
      );
    }

    mapChildrenToControl(children) {
      if (React.Children.count(children) > 1) {
        return React.Children.map(
          children,
          (child) => this.createControlComponent(child));
      }

      return this.createControlComponent(children);
    }

    render() {
      const { props } = this;
      const {
        component,
        children, // eslint-disable-line react/prop-types
      } = props;

      const allowedProps = omit(props, Object.keys(fieldPropTypes));

      return React.createElement(
        component,
        allowedProps,
        React.Children.map(
          children,
          (child) => this.createControlComponent(child)));
    }
  }

  Field.propTypes = fieldPropTypes;

  Field.defaultProps = {
    updateOn: 'change',
    validateOn: 'change',
    asyncValidateOn: 'blur',
    parser: identity,
    changeAction: change,
    dynamic: false,
    component: 'div',
    ...defaultProps,
  };

  Field.contextTypes = {
    model: PropTypes.string,
  };

  return Field;
}

export {
  controlPropsMap,
  createFieldClass,
};
export default createFieldClass(controlPropsMap);
