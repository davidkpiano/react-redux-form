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

  const standardPropsMap = {
    name: (props) => props.name || props.model,
    disabled: ({ fieldValue, disabled }) => iterateeValue(fieldValue, disabled),
    onChange: ({ onChange }) => onChange,
    onBlur: ({ onBlur }) => onBlur,
    onFocus: ({ onFocus }) => onFocus,
    onKeyPress: ({ onKeyPress }) => onKeyPress,
  };

  const textPropsMap = {
    ...standardPropsMap,
    value: (props) => ((!props.defaultValue && !props.hasOwnProperty('value'))
      ? getTextValue(props.viewValue)
      : props.value),
  };

  return {
    default: textPropsMap,
    checkbox: {
      ...standardPropsMap,
      checked: (props) => (props.defaultChecked
        ? props.checked
        : isChecked(props)),
    },
    radio: {
      ...standardPropsMap,
      checked: (props) => (props.defaultChecked
        ? props.checked
        : props.modelValue === props.value),
      value: (props) => props.value,
    },
    select: {
      ...standardPropsMap,
      value: (props) => (props.modelValue),
    },
    text: {
      ...textPropsMap,
      type: 'text',
    },
    textarea: textPropsMap,
    file: standardPropsMap,
    button: standardPropsMap,
    reset: {
      ...standardPropsMap,
      onClick: (props) => (event) => {
        event.preventDefault();
        props.dispatch(actions.reset(props.model));
      },
    },
  };
}

const controlPropsMap = createControlPropsMap();

export default controlPropsMap;
export {
  createControlPropsMap,
};
