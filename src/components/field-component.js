import React, { Component, PropTypes } from 'react';
import connect from 'react-redux/lib/components/connect';

import _get from 'lodash/get';
import capitalize from 'lodash/capitalize';
import compose from 'lodash/fp/compose';
import identity from 'lodash/identity';
import isEqual from 'lodash/isEqual';
import mapValues from 'lodash/mapValues';
import partial from 'lodash/partial';

import actions from '../actions';
import Control from './control-component';
import { isMulti, getValue, getValidity } from '../utils';

const {
  asyncSetValidity,
  blur,
  change,
  focus,
  setValidity,
  setErrors,
  toggle,
  xor,
} = actions;

function selector(state, { model }) {
  return {
    model,
    modelValue: _get(state, model),
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
    onKeyPress: (e) => {
      if (e.key === 'Enter') {
        props.onChange(e);
      }
    },
  }),
  textarea: (props) => controlPropsMap.text(props),
};

function changeMethod(model, action = change) {
  return partial(action, model);
}

function isReadOnlyValue(control) {
  return control.type === 'input' // verify === is okay
    && ~['radio', 'checkbox'].indexOf(control.props.type);
}

const changeActionMap = {
  checkbox: (props) => (isMulti(props.model) ? xor : toggle),
  default: () => change,
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

function sequenceEventActions(control, props) {
  const {
    dispatch,
    model,
    updateOn,
    parser,
    changeAction = (changeActionMap[control.props.type] || changeActionMap.default)(props),
  } = props;

  const updateOnEventHandler = (typeof updateOn === 'function')
    ? 'onChange'
    : `on${capitalize(props.updateOn)}`;
  const validateOn = `on${capitalize(props.validateOn)}`;
  const asyncValidateOn = `on${capitalize(props.asyncValidateOn)}`;

  const updaterFn = (typeof updateOn === 'function')
    ? updateOn
    : identity;

  const eventActions = {
    onFocus: [() => dispatch(focus(model))],
    onBlur: [() => dispatch(blur(model))],
    onChange: [],
    _onLoad: [], // pseudo-event
  };

  const controlChangeMethod = changeMethod(model, changeAction);

  let dispatchChange;
  if (control.props.hasOwnProperty('value') && isReadOnlyValue(control)) {
    dispatchChange = () => dispatch(controlChangeMethod(control.props.value));
  } else {
    dispatchChange = event => dispatch(controlChangeMethod(event));
  }

  eventActions[updateOnEventHandler].push(updaterFn(dispatchChange));

  if (control.props.defaultValue) {
    eventActions._onLoad.push(() => dispatch(
      actions.change(model, control.props.defaultValue)));
  }

  if (props.validators || props.errors) {
    const dispatchValidate = value => {
      if (props.validators) {
        dispatch(setValidity(model, getValidity(props.validators, value)));
      }

      if (props.errors) {
        dispatch(setErrors(model, getValidity(props.errors, value)));
      }

      return value;
    };

    eventActions[validateOn].push(dispatchValidate);
    eventActions._onLoad.push(dispatchValidate);
  }

  if (props.asyncValidators) {
    const dispatchAsyncValidate = value => {
      mapValues(props.asyncValidators,
        (validator, key) => dispatch(asyncSetValidity(model,
          (_, done) => {
            const outerDone = valid => done({ [key]: valid });

            validator(getValue(value), outerDone);
          })
        )
      );

      return value;
    };

    eventActions[asyncValidateOn].push(dispatchAsyncValidate);
  }

  eventActions[updateOnEventHandler].push(parser);
  eventActions[updateOnEventHandler].push(getValue);

  return mapValues(eventActions, _actions => compose(..._actions));
}

function createFieldProps(control, props, options) {
  const { model, modelValue } = props;
  const controlType = getControlType(control, options);

  const { controlPropsMap: _controlPropsMap } = options;

  if (!controlType) {
    return false;
  }

  return {
    ..._controlPropsMap[controlType]({
      model,
      modelValue,
      ...control.props,
      ...sequenceEventActions(control, props, options),
    }),
  };
}

function createFieldControlComponent(control, props, options) {
  if (!control || !control.props || Object.hasOwnProperty(control.props, 'modelValue')) {
    return control;
  }

  const controlProps = createFieldProps(control, props, options);

  if (!controlProps) {
    return React.cloneElement(
      control, {
        children: React.Children.map(
          control.props.children,
          child => createFieldControlComponent(
            child,
            { ...props, ...child.props },
            options
          )
        ),
      }
    );
  }

  /* eslint-disable react/prop-types */
  // TODO: Track down where to set correct propType for modelValue
  return (
    <Control
      {...controlProps}
      modelValue={props.modelValue}
      control={control}
    />
  );
  /* eslint-enable react/prop-types */
}

function getFieldWrapper(props) {
  if (props.component) {
    return props.component;
  }

  if (props.className || props.children.length > 1) {
    return 'div';
  }

  return null;
}

function createFieldClass(customControlPropsMap = {}) {
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

      return createFieldControlComponent(React.Children.only(props.children), props, options);
    }
  }

  Field.propTypes = {
    model: PropTypes.string.isRequired,
    component: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
    ]),
    parser: PropTypes.func,
    updateOn: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.oneOf([
        'change',
        'blur',
        'focus',
      ]),
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
  };

  Field.defaultProps = {
    updateOn: 'change',
    validateOn: 'change',
    asyncValidateOn: 'blur',
    parser: identity,
  };

  return connect(selector)(Field);
}

export {
  controlPropsMap,
  createFieldClass,
};
export default createFieldClass(controlPropsMap);
