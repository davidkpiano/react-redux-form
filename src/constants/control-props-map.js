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
  if (typeof props.modelValue === 'undefined') {
    if (typeof props.defaultChecked !== 'undefined') {
      return props.defaultChecked;
    }
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
  // the value passed into the control is either the original control's
  // value prop (if the control is controlled) or the value controlled by
  // <Control>.
  value: (props) => {
    if (props.hasOwnProperty('value')) {
      return props.value;
    }

    const value = getTextValue(props.viewValue);

    return value === undefined ? '' : value;
  },
};

const getModelValue = ({ modelValue }) => modelValue;
const getViewValue = (props) =>
  (props.hasOwnProperty('value') ? props.value : props.viewValue);

const controlPropsMap = {
  default: {
    ...standardPropsMap,
    value: getViewValue,
  },
  checkbox: {
    ...standardPropsMap,
    checked: isChecked,
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
    value: getViewValue,
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
