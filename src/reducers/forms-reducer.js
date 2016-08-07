import modeled from '../enhancers/modeled-enhancer';
import modelReducer from './model-reducer';
import formReducer from './form-reducer';
import { combineReducers } from 'redux';

const NULL_ACTION = { type: null };

const defaults = {
  key: 'forms',
  plugins: [],
};

export default function combineForms(forms, options = {}) {
  const formKeys = Object.keys(forms);
  const modelReducers = {};
  const initialFormState = {};
  const optionsWithDefaults = {
    ...defaults,
    ...options,
  };
  const {
    key,
    plugins,
  } = optionsWithDefaults;

  formKeys.forEach((formKey) => {
    const formValue = forms[formKey];

    if (typeof formValue === 'function') {
      let initialState;
      try {
        initialState = formValue(undefined, NULL_ACTION);
      } catch (error) {
        initialState = null;
      }

      modelReducers[formKey] = modeled(formValue, formKey);
      initialFormState[formKey] = initialState;
    } else {
      modelReducers[formKey] = modelReducer(formKey, formValue);
      initialFormState[formKey] = formValue;
    }
  });

  return combineReducers({
    ...modelReducers,
    [key]: formReducer('', initialFormState, { plugins }),
  });
}
