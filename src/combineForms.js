import modeled from './enhancers/modeled-enhancer';
import modelReducer from './reducers/model-reducer';
import formReducer from './reducers/form-reducer';
import combineReducers from 'redux';

const NULL_ACTION = { type: null };

export default function combineForms(forms, formsKey = 'forms') {
  const formKeys = Object.keys(forms);
  const modelReducers = {};
  const initialFormState = {};

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

  return combineReducers(Object.assign(
    modelReducers,
    [formsKey]: formReducer('', initialFormState)));
}
