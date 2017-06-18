/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
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
} from './index';
import omit from './utils/omit';

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
    updateOn="blur"
    mapProps={{
      onResponderGrant: ({ onFocus }) => onFocus,
      onRegionChange: ({ onChange }) => onChange,
      onRegionChangeComplete: ({ onBlur }) => onBlur,
      region: ({ modelValue }) => modelValue,
      ...props.mapProps,
    }}
    {...omit(props, 'mapProps')}
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
      ...props.mapProps,
    }}
    {...omit(props, 'mapProps')}
  />
);

Control.Switch = (props) => (
  <Control
    component={Switch}
    mapProps={{
      onResponderGrant: ({ onFocus }) => onFocus,
      onResponderRelease: ({ onBlur }) => onBlur,
      value: ({ modelValue }) => ! ! modelValue,
      onValueChange: ({ onChange }) => onChange,
      onChange: noop,
      ...props.mapProps,
    }}
    {...omit(props, 'mapProps')}
  />
);

Control.TextInput = (props) => (
  <Control
    component={TextInput}
    mapProps={{
      onResponderGrant: ({ onFocus }) => onFocus,
      value: (_props) => ((! _props.defaultValue && ! _props.hasOwnProperty('value'))
        ? getTextValue(_props.viewValue)
        : _props.value),
      onChangeText: ({ onChange }) => onChange,
      onChange: noop,
      onBlur: ({ onBlur, viewValue }) => () => onBlur(viewValue),
      onFocus: ({ onFocus }) => onFocus,
      ...props.mapProps,
    }}
    {...omit(props, 'mapProps')}
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
      ...props.mapProps,
    }}
    {...omit(props, 'mapProps')}
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
      ...props.mapProps,
    }}
    {...omit(props, 'mapProps')}
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
      ...props.mapProps,
    }}
    {...omit(props, 'mapProps')}
  />
);

Control.Custom = (props) => {
  const delegates = [
    'MapView',
    'Picker',
    'Switch',
    'TextInput',
    'DatePickerIOS',
    'SegmentedControlIOS',
    'Slider',
  ];

  if (! props.delegate || ! delegates.includes(props.delegate)) {
    throw new Error(`Delegate not found. Must be one of: [${delegates.map(d => `'${d}'`)}]`);
  }
  const CustomComponent = Control[props.delegate];

  return (
    <CustomComponent
      component={props.component}
      {...omit(props, 'mapProps')}
    />
  );
};

Control.Custom.propTypes = {
  delegate: PropTypes.string.isRequired,
};

const NativeForm = (props) => <Form component={View} {...omit(props, 'mapProps')} />;
const NativeFieldset = (props) => <Fieldset component={View} {...omit(props, 'mapProps')} />;
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
