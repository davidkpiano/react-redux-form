import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';

import _get from 'lodash/get';
import identity from 'lodash/identity';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';

import actions from '../actions';
import Control from './control-component';
import { isMulti } from '../utils';

const {
  change,
} = actions;

function selector(state, { model }) {
  const modelString = typeof model === 'function'
    ? model(state)
    : model;

  return {
    model: modelString,
    modelValue: _get(state, modelString),
  };
}

function isChecked(props) {
  if (isMulti(props.model)) {
    return (props.modelValue || [])
      .filter((item) =>
        isEqual(item, props.value))
      .length;
  }

  return !!props.modelValue;
}

const controlPropsMap = {
  default: (props) => controlPropsMap.text(props),
  checkbox: (props) => ({
    ...props,
    name: props.model,
    checked: isChecked(props),
  }),
  radio: (props) => ({
    ...props,
    name: props.model,
    checked: isEqual(props.modelValue, props.value),
    value: props.value,
  }),
  select: (props) => ({
    ...props,
    name: props.model,
    value: props.modelValue,
  }),
  text: (props) => ({
    ...props,
    defaultValue: props.modelValue,
    name: props.model,
  }),
  textarea: (props) => controlPropsMap.text(props),
};

function getControlType(control, options) {
  const { controlPropsMap: _controlPropsMap } = options;

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
    mapProps = options.controlPropsMap[getControlType(control, options)],
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
      modelValue={props.modelValue}
      control={control}
      component={control.constructor}
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

  if (props.className || props.children.length > 1) {
    return 'div';
  }

  return null;
}

function createFieldClass(customControlPropsMap = {}, defaultProps = {}) {
  const options = {
    controlPropsMap: {
      ...controlPropsMap,
      ...customControlPropsMap,
    },
  };

  class Field extends Component {
    render() {
      const { props } = this;
      const component = getFieldWrapper(props);

      if (component) {
        return React.createElement(
          component,
          props,
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
    modelValue: PropTypes.any,
  };

  Field.defaultProps = {
    updateOn: 'change',
    validateOn: 'change',
    asyncValidateOn: 'blur',
    parser: identity,
    changeAction: change,
    ...defaultProps,
  };

  return connect(selector)(Field);
}

export {
  controlPropsMap,
  createFieldClass,
};
export default createFieldClass(controlPropsMap);
