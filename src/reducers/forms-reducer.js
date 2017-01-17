import modeled from '../enhancers/modeled-enhancer';
import modelReducer from './model-reducer';
import formReducer from './form-reducer';
import { combineReducers } from 'redux';
import identity from '../utils/identity';

import NULL_ACTION from '../constants/null-action';

const defaults = {
  key: 'forms',
  plugins: [],
};

function getSubModelString(model, subModel) {
  if (!model) return subModel;

  return `${model}.${subModel}`;
}

const defaultStrategy = {
  modelReducer,
  formReducer,
  modeled,
  fromJS: identity,
  keys: Object.keys,
};

function createFormCombiner(s = defaultStrategy) {
  function createForms(forms, model = '', options = {}) {
    const formKeys = s.keys(forms);
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

        modelReducers[formKey] = s.modeled(formValue, subModel);
        initialFormState[formKey] = initialState;
      } else {
        modelReducers[formKey] = s.modelReducer(subModel, formValue);
        initialFormState[formKey] = formValue;
      }
    });

    return {
      ...modelReducers,
      [key]: s.formReducer(model, s.fromJS(initialFormState), { plugins }),
    };
  }

  function combineForms(forms, model = '', options = {}) {
    const mappedReducers = createForms(forms, model, options);

    return combineReducers(mappedReducers);
  }

  return {
    createForms,
    combineForms,
  };
}

const {
  combineForms: defaultCombineForms,
  createForms: defaultCreateForms,
} = createFormCombiner();

export default defaultCombineForms;
export {
  createFormCombiner,
  defaultCreateForms as createForms,
};
