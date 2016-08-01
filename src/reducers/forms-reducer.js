import formReducer from './form-reducer';
import { combineReducers } from 'redux';
import mapValues from '../utils/map-values';

export default function combineForms(reducers, plugins) {
  const finalReducer = combineReducers({
    ...reducers,
    forms: formReducer('', mapValues(reducers, (reducer) => reducer(undefined, { type: null })), {
      plugins,
    }),
  });

  return finalReducer;
}
