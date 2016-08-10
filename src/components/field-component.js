import React, { Component, PropTypes } from 'react';

import _get from '../utils/get';
import identity from 'lodash/identity';
import omit from 'lodash/omit';
import isPlainObject from 'lodash/isPlainObject';

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

/* eslint-disable no-use-before-define */
function mapFieldChildrenToControl(children, props, options) {
  if (React.Children.count(children) > 1) {
    return React.Children.map(
      children,
      (child) => createFieldControlComponent(
        child,
        {
          ...props,
          ...(child && child.props
            ? child.props
            : {}),
        },
        options
      )
    );
  }

  return createFieldControlComponent(children, props, options);
}

function createFieldControlComponent(control, props, options) {
  if (!control
    || !control.props
    || control instanceof Control) {
    return control;
  }

  /* eslint-disable react/prop-types */
  const {
    mapProps = options.controlPropsMap[getControlType(control, props, options)],
  } = props;

  const controlProps = omit(props, ['children', 'className']);

  if (!mapProps) {
    return React.cloneElement(
      control,
      null,
      mapFieldChildrenToControl(control.props.children, props, options)
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
  /* eslint-enable react/prop-types */
}
/* eslint-enable no-use-before-define */

function getFieldWrapper(props) {
  if (props.component) {
    return props.component;
  }

  return 'div';
}

function createFieldClass(customControlPropsMap = {}, defaultProps = {}) {
  const options = {
    controlPropsMap: {
      ...controlPropsMap,
      ...customControlPropsMap,
    },
  };

  class Field extends Component {
    shouldComponentUpdate(nextProps) {
      const { dynamic } = this.props;

      if (dynamic) {
        return deepCompareChildren(this, nextProps);
      }

      return shallowCompareWithoutChildren(this, nextProps);
    }

    render() {
      const { props } = this;
      const component = getFieldWrapper(props);

      const allowedProps = omit(props, Object.keys(Field.propTypes));

      if (component) {
        return React.createElement(
          component,
          allowedProps,
          React.Children.map(
            props.children,
            child => createFieldControlComponent(child, props, options))
        );
      }

      return createFieldControlComponent(
        React.Children.only(props.children),
        props,
        options);
    }
  }

  Field.propTypes = {
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
  };

  Field.defaultProps = {
    updateOn: 'change',
    validateOn: 'change',
    asyncValidateOn: 'blur',
    parser: identity,
    changeAction: change,
    dynamic: false,
    ...defaultProps,
  };

  return Field;
}

export {
  controlPropsMap,
  createFieldClass,
};
export default createFieldClass(controlPropsMap);
