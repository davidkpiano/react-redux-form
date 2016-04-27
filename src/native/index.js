import React from 'react';

import Form from '../components/form-component';
import { createFieldClass } from '../components/field-component';

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
  NativeField as Field,
  NativeForm as Form,
};
