/* eslint-disable react/prop-types */
import React from 'react';
import {
  MapView,
  Picker,
  DatePickerIOS,
  Switch,
  TextInput,
  SegmentedControlIOS,
  Slider,
  Text,
  View,
} from 'react-native';

import {
  modelReducer,
  formReducer,
  modeled,
  actions,
  combineForms,
  initialFieldState,
  actionTypes,
  Control,
  Form,
  Fieldset,
  Errors,
  batched,
  form,
  getField,
  track,
} from '../src/index';

function getTextValue(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return `${value}`;
  }

  return '';
}

const noop = () => undefined;

Control.MapView = (props) => (
  <Control
    component={MapView}
    mapProps={{
      onResponderGrant: ({ onFocus }) => onFocus,
      onRegionChange: ({ onChange }) => onChange,
      onRegionChangeComplete: ({ onBlur }) => onBlur,
      region: ({ modelValue }) => modelValue,
    }}
    updateOn="blur"
    {...props}
  />
);

Control.Picker = (props) => (
  <Control
    component={Picker}
    mapProps={{
      onResponderGrant: ({ onFocus }) => onFocus,
      onResponderRelease: ({ onBlur }) => onBlur,
      selectedValue: ({ modelValue }) => modelValue,
      onValueChange: ({ onChange }) => onChange,
      onChange: noop,
    }}
    {...props}
  />
);

Control.Switch = (props) => (
  <Control
    component={Switch}
    mapProps={{
      onResponderGrant: ({ onFocus }) => onFocus,
      onResponderRelease: ({ onBlur }) => onBlur,
      value: ({ modelValue }) => !!modelValue,
      onValueChange: ({ onChange }) => onChange,
      onChange: noop,
    }}
    {...props}
  />
);

Control.TextInput = (props) => (
  <Control
    component={TextInput}
    mapProps={{
      onResponderGrant: ({ onFocus }) => onFocus,
      value: (_props) => ((!_props.defaultValue && !_props.hasOwnProperty('value'))
        ? getTextValue(_props.viewValue)
        : _props.value),
      onChangeText: ({ onChange }) => onChange,
      onChange: noop,
      onBlur: ({ onBlur, viewValue }) => () => onBlur(viewValue),
      onFocus: ({ onFocus }) => onFocus,
    }}
    {...props}
  />
);

Control.DatePickerIOS = (props) => (
  <Control
    component={DatePickerIOS}
    mapProps={{
      onResponderGrant: ({ onFocus }) => onFocus,
      onResponderRelease: ({ onBlur }) => onBlur,
      date: ({ modelValue }) => modelValue,
      onDateChange: ({ onChange }) => onChange,
      onChange: noop,
    }}
    {...props}
  />
);

Control.SegmentedControlIOS = (props) => (
  <Control
    component={SegmentedControlIOS}
    mapProps={{
      onResponderGrant: ({ onFocus }) => onFocus,
      selectedIndex: ({ values, modelValue }) => values.indexOf(modelValue),
      onValueChange: ({ onChange }) => onChange,
      onChange: noop,
    }}
    {...props}
  />
);

Control.Slider = (props) => (
  <Control
    component={Slider}
    mapProps={{
      value: ({ modelValue }) => modelValue,
      onResponderGrant: ({ onFocus }) => onFocus,
      onSlidingComplete: ({ onBlur }) => onBlur,
      onValueChange: ({ onChange }) => onChange,
      onChange: noop,
    }}
    {...props}
  />
);

const NativeForm = (props) => <Form component={View} {...props} />;
const NativeFieldset = (props) => <Fieldset component={View} {...props} />;
const NativeErrors = (props) => (
  <Errors
    wrapper={View}
    component={Text}
    {...props}
  />
);

export {
  // Reducers
  formReducer,
  modelReducer,
  combineForms,

  // Constants
  initialFieldState,
  actions,
  actionTypes,

  // Components
  Control,
  NativeForm as Form,
  NativeErrors as Errors,
  NativeFieldset as Fieldset,

  // Enhancers
  modeled,
  batched,

  // Selectors
  form,

  // Utilities
  getField,
  track,
};
