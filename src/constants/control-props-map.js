import isMulti from '../utils/is-multi';
import { iterateeValue } from '../utils/iteratee';
import actions from '../actions';

function getTextValue(value) {
  if (typeof value === 'string') {
    return `${value}`;
  }

  return value;
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

const getModelValue = ({ modelValue }) => modelValue;

const controlPropsMap = {
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
    value: getModelValue,
  },
  text: textPropsMap,
  textarea: textPropsMap,
  file: standardPropsMap,
  button: {
    ...standardPropsMap,
    value: getModelValue,
  },
  reset: {
    ...standardPropsMap,
    onClick: (props) => (event) => {
      event.preventDefault();
      props.dispatch(actions.reset(props.model));
    },
  },
};

export default controlPropsMap;
