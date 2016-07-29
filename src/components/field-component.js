import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react/lib/shallowCompare';
import connect from 'react-redux/lib/components/connect';

import _get from '../utils/get';
import identity from 'lodash/identity';
import omit from 'lodash/omit';
import isPlainObject from 'redux/lib/utils/isPlainObject';

import actions from '../actions';
import Control from './control-component';
import { isMulti } from '../utils';
import getModel from '../utils/get-model';
import icepick from 'icepick';

const {
  change,
} = actions;

function mapStateToProps(state, { model }) {
  const modelString = getModel(model, state);

  return {
    model: modelString,
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

function getTextValue(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return `${value}`;
  }

  return '';
}

const textPropsMap = {
  value: (props) => ((!props.defaultValue && !props.hasOwnProperty('value'))
    ? getTextValue(props.viewValue)
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
    changeAction: (props) => (model, eventValue) => {
      const { modelValue } = props;

      if (isMulti(model)) {
        const valueWithItem = modelValue || [];
        const valueWithoutItem = (valueWithItem || [])
          .filter(item => item !== eventValue);
        const value = (valueWithoutItem.length === valueWithItem.length)
          ? icepick.push(valueWithItem, eventValue)
          : valueWithoutItem;

        return actions.change(model, value);
      }

      return actions.change(model, !modelValue);
    }
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
  file: {
    name: (props) => props.name || props.model,
  },
  reset: {
    onClick: (props) => (event) => {
      event.preventDefault();
      props.dispatch(actions.reset(props.model));
    },
  },
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
    dispatch: PropTypes.func,
  };

  Field.defaultProps = {
    updateOn: 'change',
    validateOn: 'change',
    asyncValidateOn: 'blur',
    parser: identity,
    changeAction: change,
    ...defaultProps,
  };

  return connect(mapStateToProps)(Field);
}

export {
  controlPropsMap,
  createFieldClass,
};
export default createFieldClass(controlPropsMap);
