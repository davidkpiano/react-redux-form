import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react/lib/shallowCompare';
import connect from 'react-redux/lib/components/connect';

import _get from '../utils/get';
import identity from 'lodash/identity';
import omit from 'lodash/omit';

import actions from '../actions';
import Control from './control-component';
import { isMulti } from '../utils';
import getModel from '../utils/get-model';

const {
  change,
} = actions;

function mapStateToProps(state, { model }) {
  const modelString = getModel(model, state);

  return {
    model: modelString,
    modelValue: _get(state, modelString),
  };
}

function isChecked(props) {
  if (isMulti(props.model)) {
    return (props.modelValue || [])
      .filter((item) =>
        item === props.value)
      .length;
  }

  return !!props.modelValue;
}

const textPropsMap = {
  value: (props) => (props.updateOn === 'change'
    && !props.defaultValue
    && !props.hasOwnProperty('value')
    ? props.modelValue || ''
    : props.value),
  name: (props) => props.name || props.model,
};

const controlPropsMap = {
  default: textPropsMap,
  checkbox: {
    name: (props) => props.name || props.model,
    checked: (props) => (props.defaultChecked
      ? props.checked
      : isChecked(props)),
  },
  radio: {
    name: (props) => props.name || props.model,
    checked: (props) => (props.defaultChecked
      ? props.checked
      : props.modelValue === props.value),
    value: (props) => props.value,
  },
  select: {
    name: (props) => (props.name || props.model),
    value: (props) => (props.modelValue),
  },
  text: textPropsMap,
  textarea: textPropsMap,
};

function getControlType(control, props, options) {
  const { componentMap } = props;
  const { controlPropsMap: _controlPropsMap } = options;

  const controlDisplayNames = Object.keys(componentMap).filter(
    (controlName) => control.type === componentMap[controlName]);

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
      modelValue={props.modelValue}
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

  if (props.className || (props.children && props.children.length > 1)) {
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
    shouldComponentUpdate(nextProps, nextState) {
      return shallowCompare(this, nextProps, nextState);
    }

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
    modelValue: PropTypes.any,
    mapProps: PropTypes.func,
    componentMap: PropTypes.object,
  };

  Field.defaultProps = {
    updateOn: 'change',
    validateOn: 'change',
    asyncValidateOn: 'blur',
    parser: identity,
    changeAction: change,
    componentMap: {},
    ...defaultProps,
  };

  return connect(mapStateToProps)(Field);
}

export {
  controlPropsMap,
  createFieldClass,
};
export default createFieldClass(controlPropsMap);
