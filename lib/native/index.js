'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Field = undefined;

var _fieldComponent = require('../components/field-component');

var NativeField = (0, _fieldComponent.createFieldClass)({
  'TextInput': function TextInput(props) {
    return {
      onChangeText: props.onChange,
      onFocus: props.onFocus,
      onBlur: props.onBlur,
      defaultValue: props.modelValue
    };
  },
  'Switch': function Switch(props) {
    return {
      onValueChange: props.onChange
    };
  },
  'Picker': function Picker(props) {
    return {
      selectedValue: props.modelValue,
      onValueChange: props.onChange
    };
  },
  'PickerIOS': function PickerIOS(props) {
    return {
      selectedValue: props.modelValue,
      onValueChange: props.onChange
    };
  },
  'SegmentedControlIOS': function SegmentedControlIOS(props) {
    return {
      onValueChange: props.onChange,
      selectedIndex: props.values.indexOf(props.modelValue)
    };
  },
  'DatePickerIOS': function DatePickerIOS(props) {
    return {
      onDateChange: props.onChange,
      date: props.modelValue
    };
  },
  'MapView': function MapView(props) {
    return {
      onRegionChange: props.onChange,
      onRegionChangeComplete: props.onBlur,
      region: props.modelValue
    };
  },
  'SliderIOS': function SliderIOS(props) {
    return {
      onValueChange: props.onChange,
      onSlidingComplete: props.onBlur,
      value: props.modelValue
    };
  }
});

exports.Field = NativeField;