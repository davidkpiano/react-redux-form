import identity from 'lodash/identity';
import capitalize from '../utils/capitalize';
import mapValues from '../utils/map-values';
import compose from 'redux/lib/compose';
import merge from '../utils/merge';
import icepick from 'icepick';
import shallowEqual from 'react-redux/lib/utils/shallowEqual';

import { isMulti, getValue, getValidity, invertValidity } from './index';
import actions from '../actions';

const {
  asyncSetValidity,
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
      const valueWithoutItem = (valueWithItem || [])
        .filter(item => item !== eventValue);
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
    fieldValue,
  } = props;

  const eventActions = {
    onSubmit: [], // pseudo-event
  };

  const modelValueUpdater = modelValueUpdaterMap[controlProps.type]
    || modelValueUpdaterMap.default;

  const changeActionCreator = (modelValue) => changeAction(model, modelValue);

  const dispatchChange = (event) => {
    const modelValue = isReadOnlyValue(controlProps)
      ? modelValueUpdater(props, controlProps.value)
      : event;

    dispatch(changeActionCreator(modelValue));

    return modelValue;
  };

  eventActions.onSubmit.push(dispatchChange);

  return mapValues(eventActions, _actions => compose(..._actions));
}

export {
  sequenceEventActions,
};
