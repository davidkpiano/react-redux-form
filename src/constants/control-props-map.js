import isMulti from '../utils/is-multi';
import { iterateeValue } from '../utils/iteratee';
import actions from '../actions';

function createControlPropsMap() {
  function getTextValue(value) {
    if (typeof value === 'string') {
      return `${value}`;
    } else if (typeof value === 'number') {
      return value;
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
    onChange: ({ onChange }) => onChange,
    onBlur: ({ onBlur }) => onBlur,
    onFocus: ({ onFocus }) => onFocus,
    onKeyPress: ({ onKeyPress }) => onKeyPress,
  };

  return {
    default: textPropsMap,
    checkbox: {
      name: (props) => props.name || props.model,
      checked: (props) => (props.defaultChecked
        ? props.checked
        : isChecked(props)),
      onChange: ({ onChange }) => onChange,
      onBlur: ({ onBlur }) => onBlur,
      onFocus: ({ onFocus }) => onFocus,
      onKeyPress: ({ onKeyPress }) => onKeyPress,
    },
    radio: {
      name: (props) => props.name || props.model,
      checked: (props) => (props.defaultChecked
        ? props.checked
        : props.modelValue === props.value),
      value: (props) => props.value,
      onChange: ({ onChange }) => onChange,
      onBlur: ({ onBlur }) => onBlur,
      onFocus: ({ onFocus }) => onFocus,
      onKeyPress: ({ onKeyPress }) => onKeyPress,
    },
    select: {
      name: (props) => (props.name || props.model),
      value: (props) => (props.modelValue),
      onChange: ({ onChange }) => onChange,
      onBlur: ({ onBlur }) => onBlur,
      onFocus: ({ onFocus }) => onFocus,
      onKeyPress: ({ onKeyPress }) => onKeyPress,
    },
    text: {
      ...textPropsMap,
      type: 'text',
    },
    textarea: textPropsMap,
    file: {
      name: (props) => props.name || props.model,
      onChange: ({ onChange }) => onChange,
      onBlur: ({ onBlur }) => onBlur,
      onFocus: ({ onFocus }) => onFocus,
      onKeyPress: ({ onKeyPress }) => onKeyPress,
    },
    button: {
      disabled: ({ fieldValue, disabled }) => iterateeValue(fieldValue, disabled),
    },
    reset: {
      onClick: (props) => (event) => {
        event.preventDefault();
        props.dispatch(actions.reset(props.model));
      },
      onFocus: ({ onFocus }) => onFocus,
      onBlur: ({ onBlur }) => onBlur,
    },
  };
}

const controlPropsMap = createControlPropsMap();

export default controlPropsMap;
export {
  createControlPropsMap,
};
