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
  toJS: identity,
};

const modelCache = {};

function cacheModelState(state) {
  const cacheId = Date.now();

  modelCache[cacheId] = state;

  return cacheId;
}

function cacheReducer(reducer, model, cacheId) {
  return (state, action) => {
    const newState = reducer(state, action);

    modelCache[cacheId][model] = newState;

    return newState;
  };
}

function createFormCombiner(strategy = defaultStrategy) {
  function createForms(forms, model = '', options = {}) {
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
      ...formOptions,
    } = optionsWithDefaults;

    const cacheId = cacheModelState({});

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

        modelReducers[formKey] = cacheReducer(
          strategy.modeled(formValue, subModel), subModel, cacheId);
        initialFormState[formKey] = initialState;
      } else {
        modelReducers[formKey] = cacheReducer(
          strategy.modelReducer(subModel, formValue), subModel, cacheId);
        initialFormState[formKey] = strategy.toJS(formValue);
      }
    });

    return {
      ...modelReducers,
      [key]: (state, action) => strategy.formReducer(model, initialFormState, {
        plugins,
        ...formOptions,
      })(state, { ...action, state: modelCache[cacheId] }),
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
