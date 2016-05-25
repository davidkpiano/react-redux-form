import identity from 'lodash/identity';
import capitalize from '../utils/capitalize';
import mapValues from '../utils/map-values';
import compose from 'redux/lib/compose';
import isEqual from 'lodash/isEqual';
import merge from '../utils/merge';
import icepick from 'icepick';

import { isMulti, getValue, getValidity, invertValidity } from './index';
import actions from '../actions';

const {
  asyncSetValidity,
  blur,
  focus,
  setErrors,
} = actions;

function persistEventWithCallback(callback) {
  return (event) => {
    if (event && event.persist) {
      event.persist();
    }

    callback(event);
    return event;
  };
}

const modelValueUpdaterMap = {
  checkbox: (props, eventValue) => {
    const { model, modelValue } = props;

    if (isMulti(model)) {
      const valueWithItem = modelValue || [];
      const valueWithoutItem = (valueWithItem || []).filter(item => !isEqual(item, eventValue));
      const value = (valueWithoutItem.length === valueWithItem.length)
        ? icepick.push(valueWithItem, eventValue)
        : valueWithoutItem;

      return value;
    }

    return !modelValue;
  },
  default: (props, eventValue) => eventValue,
};


function isReadOnlyValue(controlProps) {
  return ~['radio', 'checkbox'].indexOf(controlProps.type);
}

function deprecateUpdateOn(updateOn) {
  console.warn('Using the updateOn prop as a function will be deprecated in v1.0. '
    + 'Please use the changeAction prop instead.');

  return updateOn;
}

function sequenceEventActions(props) {
  const {
    dispatch,
    model,
    updateOn = 'change',
    parser = identity,
    changeAction = identity,
    controlProps = {},
  } = props;

  const {
    onChange = identity,
    onBlur = identity,
    onFocus = identity,
  } = controlProps;

  const controlOnChange = persistEventWithCallback(onChange);
  const controlOnBlur = persistEventWithCallback(onBlur);
  const controlOnFocus = persistEventWithCallback(onFocus);

  const updateOnEventHandler = (typeof updateOn === 'function')
    ? 'onChange'
    : `on${capitalize(updateOn)}`;
  const validateOn = `on${capitalize(props.validateOn)}`;
  const asyncValidateOn = `on${capitalize(props.asyncValidateOn)}`;

  const updaterFn = (typeof updateOn === 'function')
    ? deprecateUpdateOn(updateOn)
    : identity;

  const eventActions = {
    onFocus: [],
    onBlur: [],
    onChange: [],
    onLoad: [], // pseudo-event
    onSubmit: [], // pseudo-event
  };

  const controlChangeMethod = (...args) => changeAction(model, ...args);
  const modelValueUpdater = modelValueUpdaterMap[controlProps.type]
    || modelValueUpdaterMap.default;

  if (controlProps.defaultValue) {
    eventActions.onLoad.push(() => dispatch(
      actions.change(model, controlProps.defaultValue)));
  }

  let changeActionCreator;

  switch (updateOnEventHandler) {
    case 'onBlur':
      changeActionCreator = (modelValue) => actions.batch(model, [
        blur(model),
        controlChangeMethod(modelValue),
      ]);
      eventActions.onFocus.push(() => dispatch(focus(model)));
      break;
    case 'onFocus':
      changeActionCreator = (modelValue) => actions.batch(model, [
        focus(model),
        controlChangeMethod(modelValue),
      ]);
      eventActions.onBlur.push(() => dispatch(blur(model)));
      break;
    default:
      changeActionCreator = (modelValue) => controlChangeMethod(modelValue);
      eventActions.onBlur.push(() => dispatch(blur(model)));
      eventActions.onFocus.push(() => dispatch(focus(model)));
      break;
  }

  if (props.validators || props.errors) {
    const dispatchValidate = value => {
      const fieldValidity = getValidity(props.validators, value);
      const fieldErrors = getValidity(props.errors, value);

      const errors = props.validators
        ? merge(invertValidity(fieldValidity), fieldErrors)
        : fieldErrors;

      dispatch(setErrors(model, errors));

      return value;
    };

    eventActions[validateOn].push(dispatchValidate);
    eventActions.onLoad.push(dispatchValidate);
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

  const dispatchChange = (event) => {
    const modelValue = isReadOnlyValue(controlProps)
      ? modelValueUpdater(props, controlProps.value)
      : event;

    dispatch(changeActionCreator(modelValue));

    return modelValue;
  };

  eventActions.onSubmit.push(updaterFn(dispatchChange));

  if (!isReadOnlyValue(controlProps)) {
    eventActions[updateOnEventHandler].push(
      compose(
        updaterFn(dispatchChange),
        (...args) => modelValueUpdater(props, ...args),
        parser,
        getValue,
        controlOnChange));
  } else {
    eventActions[updateOnEventHandler].push(updaterFn(dispatchChange));
  }
  eventActions.onBlur.push(controlOnBlur);
  eventActions.onFocus.push(controlOnFocus);

  return mapValues(eventActions, _actions => compose(..._actions));
}

export {
  sequenceEventActions,
};
