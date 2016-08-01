import { isMulti } from '../utils';
import icepick from 'icepick';
import actions from '../actions';

function getTextValue(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return `${value}`;
  }

  return '';
}

function isChecked(props) {
  if (isMulti(props.model)) {
    return (props.modelValue || [])
      .filter((item) =>
        item === props.value)
      .length;
  }

  return !!props.modelValue;
}

const textPropsMap = {
  value: (props) => ((!props.defaultValue && !props.hasOwnProperty('value'))
    ? getTextValue(props.viewValue)
    : props.value),
  name: (props) => props.name || props.model,
};

const controlPropsMap = {
  default: textPropsMap,
  checkbox: {
    name: (props) => props.name || props.model,
    checked: (props) => (props.defaultChecked
      ? props.checked
      : isChecked(props)),
    changeAction: (props) => (model, eventValue) => {
      const { modelValue, value } = props;

      if (isMulti(model)) {
        const valueWithItem = modelValue || [];
        const valueWithoutItem = (valueWithItem || [])
          .filter(item => item !== value);
        const multiValue = (valueWithoutItem.length === valueWithItem.length)
          ? icepick.push(valueWithItem, value)
          : valueWithoutItem;

        return actions.change(model, multiValue);
      }

      return actions.change(model, !modelValue);
    },
  },
  radio: {
    name: (props) => props.name || props.model,
    checked: (props) => (props.defaultChecked
      ? props.checked
      : props.modelValue === props.value),
    value: (props) => props.value,
  },
  select: {
    name: (props) => (props.name || props.model),
    value: (props) => (props.modelValue),
  },
  text: textPropsMap,
  textarea: textPropsMap,
  file: {
    name: (props) => props.name || props.model,
  },
  reset: {
    onClick: (props) => (event) => {
      event.preventDefault();
      props.dispatch(actions.reset(props.model));
    },
  },
};

export default controlPropsMap;
