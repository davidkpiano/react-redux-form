import { createFieldClass, controls } from '../components/field-component';

const NativeField = createFieldClass({
  'TextInput': (props) => ({
    onChangeText: props.onChange,
    onFocus: props.onFocus,
    onBlur: props.onBlur,
    defaultValue: props.modelValue
  }),
  'Switch': (props) => ({
    onValueChange: props.onChange
  }),
  'Picker': (props) => ({
    selectedValue: props.modelValue,
    onValueChange: props.onChange
  }),
  'PickerIOS': (props) => ({
    selectedValue: props.modelValue,
    onValueChange: props.onChange
  }),
  'SegmentedControlIOS': (props) => ({
    onValueChange: props.onChange,
    selectedIndex: props.values.indexOf(props.modelValue)
  }),
  'DatePickerIOS': (props) => ({
    onDateChange: props.onChange,
    date: props.modelValue
  }),
  'MapView': (props) => ({
    onRegionChange: props.onChange,
    onRegionChangeComplete: props.onBlur,
    region: props.modelValue
  }),
  'SliderIOS': (props) => ({
    onValueChange: props.onChange,
    onSlidingComplete: props.onBlur,
    value: props.modelValue
  })
});

export {
  NativeField as Field
}
