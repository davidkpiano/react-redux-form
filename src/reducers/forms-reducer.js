import modeled from '../enhancers/modeled-enhancer';
import modelReducer from './model-reducer';
import formReducer from './form-reducer';
import { combineReducers } from 'redux';

import NULL_ACTION from '../constants/null-action';

const defaults = {
  key: 'forms',
  plugins: [],
};

function getSubModelString(model, subModel) {
  if (!model) return subModel;

  return `${model}.${subModel}`;
}

export default function combineForms(forms, model = '', options = {}) {
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
    const subModel = getSubModelString(model, formKey);

    if (typeof formValue === 'function') {
      let initialState;
      try {
        initialState = formValue(undefined, NULL_ACTION);
      } catch (error) {
        initialState = null;
      }

      modelReducers[formKey] = modeled(formValue, subModel);
      initialFormState[formKey] = initialState;
    } else {
      modelReducers[formKey] = modelReducer(subModel, formValue);
      initialFormState[formKey] = formValue;
    }
  });

  return combineReducers({
    ...modelReducers,
    [key]: formReducer(model, initialFormState, { plugins }),
  });
}
