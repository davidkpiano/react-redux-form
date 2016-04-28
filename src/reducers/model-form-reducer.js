import modelReducer from './model-reducer';
import formReducer from './form-reducer';
import { combineReducers } from 'redux';

function modelFormReducer(model, initialState = {}) {
  const modelPath = `${model}.model`;

  return combineReducers({
    model: modelReducer(modelPath, initialState),
    form: formReducer(modelPath, initialState),
  });
}

function modelForm(model, initialState = {}) {
  return {
    [model]: modelFormReducer(model, initialState),
  };
}

export {
  modelForm,
};
export default modelFormReducer;
