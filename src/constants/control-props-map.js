import isMulti from '../utils/is-multi';
import i from 'icepick';
import actions from '../actions';

const defaultStrategies = {
  array: [],
  object: {},
  length: (val) => val.length,
  push: i.push,
};

function createControlPropsMap(s = defaultStrategies) {
  function getTextValue(value) {
    if (typeof value === 'string' || typeof value === 'number') {
      return `${value}`;
    }

    return '';
  }

  function isChecked(props) {
    if (isMulti(props.model)) {
      if (!props.modelValue) return false;

      return props.modelValue.some((item) =>
        item === props.value);
    }

    return !!props.modelValue;
  }

  const textPropsMap = {
    value: (props) => ((!props.defaultValue && !props.hasOwnProperty('value'))
      ? getTextValue(props.viewValue)
      : props.value),
    name: (props) => props.name || props.model,
    onChange: ({onChange}) => onChange,
    onBlur: ({onBlur}) => onBlur,
    onFocus: ({onFocus}) => onFocus,
    onKeyPress: ({onKeyPress}) => onKeyPress,
  };

  return {
    default: textPropsMap,
    checkbox: {
      name: (props) => props.name || props.model,
      checked: (props) => (props.defaultChecked
        ? props.checked
        : isChecked(props)),
      changeAction: (props) => (model) => {
        const { modelValue, value } = props;

        if (isMulti(model)) {
          const valueWithItem = modelValue || s.array;
          const valueWithoutItem = (valueWithItem || s.array)
            .filter(item => item !== value);
          const multiValue = (s.length(valueWithoutItem) === s.length(valueWithItem))
            ? s.push(valueWithItem, value)
            : valueWithoutItem;

          return actions.change(model, multiValue);
        }

        return actions.change(model, !modelValue);
      },
      onChange: ({onChange}) => onChange,
      onBlur: ({onBlur}) => onBlur,
      onFocus: ({onFocus}) => onFocus,
      onKeyPress: ({onKeyPress}) => onKeyPress,
    },
    radio: {
      name: (props) => props.name || props.model,
      checked: (props) => (props.defaultChecked
        ? props.checked
        : props.modelValue === props.value),
      value: (props) => props.value,
      onChange: ({onChange}) => onChange,
      onBlur: ({onBlur}) => onBlur,
      onFocus: ({onFocus}) => onFocus,
      onKeyPress: ({onKeyPress}) => onKeyPress,
    },
    select: {
      name: (props) => (props.name || props.model),
      value: (props) => (props.modelValue),
      onChange: ({onChange}) => onChange,
      onBlur: ({onBlur}) => onBlur,
      onFocus: ({onFocus}) => onFocus,
      onKeyPress: ({onKeyPress}) => onKeyPress,
    },
    text: textPropsMap,
    textarea: textPropsMap,
    file: {
      name: (props) => props.name || props.model,
      onChange: ({onChange}) => onChange,
      onBlur: ({onBlur}) => onBlur,
      onFocus: ({onFocus}) => onFocus,
      onKeyPress: ({onKeyPress}) => onKeyPress,
    },
    reset: {
      onClick: (props) => (event) => {
        event.preventDefault();
        props.dispatch(actions.reset(props.model));
      },
      onFocus: ({onFocus}) => onFocus,
      onBlur: ({onBlur}) => onBlur,
    },
  };
}

const controlPropsMap = createControlPropsMap();

export default controlPropsMap;
export {
  createControlPropsMap,
};
