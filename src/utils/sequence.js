import identity from 'lodash/identity';
import capitalize from 'lodash/capitalize';
import partial from 'lodash/partial';
import mapValues from 'lodash/mapValues';
import compose from 'lodash/fp/compose';
import isEqual from 'lodash/isEqual';
import icepick from 'icepick';

import { isMulti, getValue, getValidity } from './index';
import actions from '../actions';

const {
  asyncSetValidity,
  blur,
  focus,
  setValidity,
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


function isReadOnlyValue(control) {
  return control.type === 'input' // verify === is okay
    && ~['radio', 'checkbox'].indexOf(control.props.type);
}

export function sequenceEventActions(control, props) {
  const {
    dispatch,
    model,
    updateOn,
    parser,
    changeAction,
  } = props;

  const {
    onChange = identity,
    onBlur = identity,
    onFocus = identity,
  } = control.props;

  const controlOnChange = persistEventWithCallback(onChange);
  const controlOnBlur = persistEventWithCallback(onBlur);
  const controlOnFocus = persistEventWithCallback(onFocus);

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
    onLoad: [], // pseudo-event
    onSubmit: [], // pseudo-event
  };

  const controlChangeMethod = partial(changeAction, model);
  const modelValueUpdater = modelValueUpdaterMap[control.props.type]
    || modelValueUpdaterMap.default;

  let dispatchChange;
  if (isReadOnlyValue(control)) {
    dispatchChange = () => {
      dispatch(controlChangeMethod(modelValueUpdater(props, control.props.value)));
    };
  } else {
    dispatchChange = event => dispatch(controlChangeMethod(event));
  }

  eventActions[updateOnEventHandler].push(updaterFn(dispatchChange));
  eventActions.onSubmit.push(updaterFn(dispatchChange));

  if (control.props.defaultValue) {
    eventActions.onLoad.push(() => dispatch(
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

  eventActions[updateOnEventHandler].push((value) => modelValueUpdater(props, value));
  eventActions[updateOnEventHandler].push(parser);
  eventActions[updateOnEventHandler].push(getValue);

  eventActions[updateOnEventHandler].push(controlOnChange);
  eventActions.onBlur.push(controlOnBlur);
  eventActions.onFocus.push(controlOnFocus);

  return mapValues(eventActions, _actions => compose(..._actions));
}
