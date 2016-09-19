import React from 'react';

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
  Errors,
  createFieldClass,
  batched,
  form,
  getField,
  track,
} from './index';

const View = process.env.NODE_ENV !== 'test'
  ? require('react-native').View
  : 'div';

const NativeField = createFieldClass({
  MapView: props => ({
    onRegionChange: props.onChange,
    onRegionChangeComplete: props.onBlur,
    region: props.modelValue,
  }),
  Picker: props => ({
    onValueChange: props.onChange,
    selectedValue: props.modelValue,
  }),
  Switch: props => ({
    onValueChange: props.onChange,
  }),
  TextInput: props => ({
    defaultValue: props.modelValue,
    onChangeText: props.onChange,
    onBlur: props.onBlur,
    onFocus: props.onFocus,
  }),
  DatePickerIOS: props => ({
    date: props.modelValue,
    onDateChange: props.onChange,
  }),
  PickerIOS: props => ({
    onValueChange: props.onChange,
    selectedValue: props.modelValue,
  }),
  SegmentedControlIOS: props => ({
    onValueChange: props.onChange,
    selectedIndex: props.values.indexOf(props.modelValue),
  }),
  SliderIOS: props => ({
    onSlidingComplete: props.onBlur,
    onValueChange: props.onChange,
    value: props.modelValue,
  }),
}, {
  component: View,
});

class NativeForm extends React.Component {
  render() {
    return (
      <Form
        component={View}
        {...this.props}
      />
    );
  }
}

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
  NativeField as Field,
  Control,
  NativeForm as Form,
  Errors,

  // Factories
  createFieldClass,

  // Enhancers
  modeled,
  batched,

  // Selectors
  form,

  // Utilities
  getField,
  track,
};
